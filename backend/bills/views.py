from rest_framework import generics, status
from rest_framework.response import Response
from .models import Bill
from .serializers import BillSerializer
from utils.ocr import extract_text_from_image, parse_ocr_text
from utils.category_predictor import predict_category
from audit.models import AuditTrail
from approvals.models import Approval
from django.utils import timezone

class BillUploadView(generics.CreateAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

    def post(self, request, *args, **kwargs):
        vendor_name = request.data.get('vendor_name')
        amount = request.data.get('amount')
        bill_date = request.data.get('bill_date')
        
        # Duplicate detection logic
        if vendor_name and amount and bill_date:
            exists = Bill.objects.filter(vendor_name=vendor_name, amount=amount, bill_date=bill_date).exists()
            if exists:
                kwargs['duplicate_warning'] = "Possible duplicate bill detected"
        
        # Standard creation logic
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            bill_id = response.data['bill_id']
            bill = Bill.objects.get(bill_id=bill_id)
            
            # OCR + prediction
            if bill.file_path:
                text = extract_text_from_image(bill.file_path.path)
                ocr_data = parse_ocr_text(text)
                
                # Fill missing data
                if not bill.vendor_name:
                    bill.vendor_name = ocr_data.get('vendor_name') or 'Unknown Vendor'
                if not bill.amount:
                    bill.amount = ocr_data.get('amount') or 0.0
                
                category = predict_category(bill.vendor_name, text)
                if bill.category == 'Other' and category != 'Other':
                    bill.category = category
                    
                bill.save()

            # Create Audit Trail
            AuditTrail.objects.create(
                bill=bill,
                action="Bill uploaded",
                performed_by=request.user.username if request.user.is_authenticated else "System"
            )

            # Workflow Engine logic
            if bill.amount < 5000:
                Approval.objects.create(bill=bill, approver_role="Accounts", status="Pending")
            elif 5000 <= bill.amount <= 20000:
                Approval.objects.create(bill=bill, approver_role="Accounts", status="Pending")
                Approval.objects.create(bill=bill, approver_role="Manager", status="Pending")
            elif bill.amount > 20000:
                Approval.objects.create(bill=bill, approver_role="Accounts", status="Pending")
                Approval.objects.create(bill=bill, approver_role="Manager", status="Pending")
                Approval.objects.create(bill=bill, approver_role="MD", status="Pending")

        return response

class BillListView(generics.ListAPIView):
    queryset = Bill.objects.all().order_by('-created_at')
    serializer_class = BillSerializer

class BillDetailView(generics.RetrieveAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

class BillApproveView(generics.UpdateAPIView):
    queryset = Bill.objects.all()
    
    def post(self, request, pk, *args, **kwargs):
        try:
            bill = Bill.objects.get(pk=pk)
            # Find next pending approval
            pending_approvals = Approval.objects.filter(bill=bill, status="Pending").order_by('approval_id')
            if pending_approvals.exists():
                approval = pending_approvals.first()
                approval.status = "Approved"
                approval.approved_at = timezone.now()
                approval.save()
                
                AuditTrail.objects.create(
                    bill=bill,
                    action=f"{approval.approver_role} approved",
                    performed_by=request.user.username if request.user.is_authenticated else approval.approver_role
                )
                
                # Check if all approvals are done
                if not Approval.objects.filter(bill=bill, status="Pending").exists():
                    bill.status = "Approved"
                    bill.save()
                    
                return Response({'status': 'approved'})
            else:
                return Response({'error': 'No pending approvals'}, status=status.HTTP_400_BAD_REQUEST)
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)

class BillRejectView(generics.UpdateAPIView):
    queryset = Bill.objects.all()
    
    def post(self, request, pk, *args, **kwargs):
        try:
            bill = Bill.objects.get(pk=pk)
            pending_approvals = Approval.objects.filter(bill=bill, status="Pending").order_by('approval_id')
            if pending_approvals.exists():
                approval = pending_approvals.first()
                approval.status = "Rejected"
                approval.comments = request.data.get('comments', '')
                approval.save()
                
                bill.status = "Rejected"
                bill.save()
                
                AuditTrail.objects.create(
                    bill=bill,
                    action="Bill rejected",
                    performed_by=request.user.username if request.user.is_authenticated else approval.approver_role
                )
                
                return Response({'status': 'rejected'})
            else:
                return Response({'error': 'No pending approvals'}, status=status.HTTP_400_BAD_REQUEST)
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)
