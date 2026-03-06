from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from approvals.workflow import (
    ROLE_ACCOUNTANT,
    ROLE_CEO,
    ROLE_MANAGER,
    apply_decision,
    ensure_amount_based_approvals,
    evaluate_bill_status,
    write_audit,
)
from notifications.tasks import check_due_dates_and_notify
from utils.category_predictor import predict_category
from utils.ocr import extract_text_from_image, parse_ocr_text

from .models import Bill
from .serializers import BillSerializer

ROLE_RECEPTIONIST = 'RECEPTIONIST'


class BillUploadView(generics.CreateAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != ROLE_RECEPTIONIST:
            return Response({'error': 'Only receptionists can upload bills.'}, status=status.HTTP_403_FORBIDDEN)

        vendor_name = (request.data.get('vendor_name') or '').strip()
        amount = request.data.get('amount')
        category = (request.data.get('category') or '').strip()
        bill_date = request.data.get('bill_date')
        bill_due_date = request.data.get('bill_due_date')
        file_path = request.FILES.get('file_path')
        confirm_duplicate = str(request.data.get('confirm_duplicate', '')).lower() in ('1', 'true', 'yes')

        has_manual_payload = all([vendor_name, amount, category, bill_date, bill_due_date])
        if not file_path and not has_manual_payload:
            return Response(
                {'error': 'Attach a bill file (image/PDF) or enter full manual details.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        duplicate_bill = None
        if has_manual_payload:
            duplicate_bill = Bill.objects.filter(
                vendor_name__iexact=vendor_name,
                amount=amount,
                category__iexact=category,
                bill_date=bill_date,
                bill_due_date=bill_due_date,
            ).order_by('bill_id').first()

        if duplicate_bill and not confirm_duplicate:
            return Response(
                {
                    'error': f'This bill is already submitted with Bill ID #{duplicate_bill.bill_id}.',
                    'duplicate_bill_id': duplicate_bill.bill_id,
                    'is_duplicate': True,
                },
                status=status.HTTP_409_CONFLICT,
            )

        response = super().post(request, *args, **kwargs)
        if response.status_code != status.HTTP_201_CREATED:
            return response

        bill = Bill.objects.get(bill_id=response.data['bill_id'])
        bill.uploaded_by = request.user
        bill.status = 'UPLOADED'
        ocr_data = {}
        raw_text = ''

        if bill.file_path and getattr(bill.file_path, 'path', None):
            raw_text = extract_text_from_image(bill.file_path.path)
            ocr_data = parse_ocr_text(raw_text)
            bill.ocr_extracted_data = ocr_data

            if not bill.vendor_name:
                bill.vendor_name = ocr_data.get('vendor_name') or 'Unknown Vendor'
            if bill.amount in (None, '') and ocr_data.get('amount') is not None:
                bill.amount = ocr_data.get('amount')
            if not bill.bill_date and ocr_data.get('bill_date'):
                bill.bill_date = ocr_data.get('bill_date')
            if bill.category == 'Other' and ocr_data.get('category') and ocr_data.get('category') != 'Other':
                bill.category = ocr_data.get('category')

            predicted = predict_category(bill.vendor_name, raw_text)
            if bill.category == 'Other' and predicted != 'Other':
                bill.category = predicted

        post_extract_duplicate = None
        if bill.vendor_name and bill.amount and bill.category and bill.bill_date and bill.bill_due_date:
            post_extract_duplicate = Bill.objects.filter(
                vendor_name__iexact=bill.vendor_name,
                amount=bill.amount,
                category__iexact=bill.category,
                bill_date=bill.bill_date,
                bill_due_date=bill.bill_due_date,
            ).exclude(pk=bill.pk).order_by('bill_id').first()

        if post_extract_duplicate and not confirm_duplicate:
            bill.delete()
            return Response(
                {
                    'error': f'This bill is already submitted with Bill ID #{post_extract_duplicate.bill_id}.',
                    'duplicate_bill_id': post_extract_duplicate.bill_id,
                    'is_duplicate': True,
                },
                status=status.HTTP_409_CONFLICT,
            )

        bill.save()
        ensure_amount_based_approvals(bill)
        write_audit(bill, 'Bill uploaded', request.user.username)

        payload = dict(response.data)
        payload['ocr_extracted_data'] = ocr_data
        duplicate_reference = duplicate_bill or post_extract_duplicate
        if duplicate_reference:
            payload['duplicate_warning'] = f'Confirmed duplicate of Bill #{duplicate_reference.bill_id}'
        return Response(payload, status=status.HTTP_201_CREATED)


class BillListView(generics.ListAPIView):
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            check_due_dates_and_notify()
        except Exception:
            pass
        queryset = Bill.objects.all().order_by('-created_at')
        if self.request.user.role == ROLE_RECEPTIONIST:
            return queryset.filter(Q(uploaded_by=self.request.user) | Q(uploaded_by__isnull=True))
        return queryset


class BillDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            check_due_dates_and_notify()
        except Exception:
            pass
        queryset = Bill.objects.all()
        if self.request.user.role == ROLE_RECEPTIONIST:
            return queryset.filter(Q(uploaded_by=self.request.user) | Q(uploaded_by__isnull=True))
        return queryset

    def patch(self, request, *args, **kwargs):
        if request.user.role != ROLE_ACCOUNTANT:
            return Response({'error': 'Only accountants can verify and edit bill details.'}, status=status.HTTP_403_FORBIDDEN)

        bill = self.get_object()
        response = super().patch(request, *args, **kwargs)
        if response.status_code >= 400:
            return response

        ensure_amount_based_approvals(bill)
        try:
            bill_status = apply_decision(
                bill=bill,
                role=ROLE_ACCOUNTANT,
                decision='approve',
                comments='OCR verified and edited by accountant',
                performed_by=request.user.username,
            )
        except Exception:
            bill.status = evaluate_bill_status(bill)
            bill.save(update_fields=['status'])
            bill_status = bill.status

        write_audit(bill, f'OCR verified and bill details updated by accountant (status: {bill_status})', request.user.username)
        return response


class BillApproveView(generics.UpdateAPIView):
    queryset = Bill.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        try:
            bill = Bill.objects.get(pk=pk)
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role not in (ROLE_ACCOUNTANT, ROLE_MANAGER, ROLE_CEO):
            return Response({'error': 'Only accountant, manager, or CEO can approve bills.'}, status=status.HTTP_403_FORBIDDEN)

        ensure_amount_based_approvals(bill)
        try:
            bill_status = apply_decision(
                bill=bill,
                role=request.user.role,
                decision='approve',
                comments=request.data.get('comments', ''),
                performed_by=request.user.username,
            )
        except PermissionError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'status': 'approved', 'bill_status': bill_status})


class BillRejectView(generics.UpdateAPIView):
    queryset = Bill.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        try:
            bill = Bill.objects.get(pk=pk)
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role not in (ROLE_ACCOUNTANT, ROLE_MANAGER, ROLE_CEO):
            return Response({'error': 'Only accountant, manager, or CEO can reject bills.'}, status=status.HTTP_403_FORBIDDEN)

        ensure_amount_based_approvals(bill)
        try:
            bill_status = apply_decision(
                bill=bill,
                role=request.user.role,
                decision='reject',
                comments=request.data.get('comments', ''),
                performed_by=request.user.username,
            )
        except PermissionError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'status': 'rejected', 'bill_status': bill_status})


class BillMarkPaidView(generics.UpdateAPIView):
    queryset = Bill.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        if request.user.role not in (ROLE_ACCOUNTANT, ROLE_CEO):
            return Response({'error': 'Only accountant or CEO can mark paid.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            bill = Bill.objects.get(pk=pk)
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)

        if bill.status not in ('APPROVED', 'CEO_APPROVED'):
            return Response({'error': 'Only approved bills can be marked as paid.'}, status=status.HTTP_400_BAD_REQUEST)

        bill.status = 'PAID'
        bill.save(update_fields=['status'])
        write_audit(bill, 'Bill marked as paid', request.user.username)
        return Response({'status': 'paid', 'bill_status': bill.status})
