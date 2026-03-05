from django.db.models import Sum
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from bills.models import Bill


class CEOOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CEO')


class AnalyticsView(APIView):
    permission_classes = [CEOOnlyPermission]

    def get(self, request, format=None):
        total_expenses = Bill.objects.aggregate(total=Sum('amount'))['total'] or 0
        categories = list(Bill.objects.values('category').annotate(total=Sum('amount')))

        approved_count = Bill.objects.filter(status__in=['CEO_APPROVED', 'PAID']).count()
        pending_count = Bill.objects.filter(status__in=['UPLOADED', 'ACCOUNTANT_VERIFIED', 'MANAGER_APPROVED']).count()
        rejected_count = Bill.objects.filter(status__in=['MANAGER_REJECTED', 'CEO_REJECTED']).count()

        return Response(
            {
                'total_expenses': total_expenses,
                'expenses_by_category': categories,
                'approval_statistics': {
                    'approved': approved_count,
                    'pending': pending_count,
                    'rejected': rejected_count,
                },
            }
        )


class AIAssistantView(APIView):
    permission_classes = [CEOOnlyPermission]

    def post(self, request, format=None):
        prompt = (request.data.get('prompt') or '').strip()
        if not prompt:
            return Response({'error': 'Prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)

        total_bills = Bill.objects.count()
        total_expenses = Bill.objects.aggregate(total=Sum('amount'))['total'] or 0
        rejected = Bill.objects.filter(status__in=['MANAGER_REJECTED', 'CEO_REJECTED']).count()
        top_category = (
            Bill.objects.values('category').annotate(total=Sum('amount')).order_by('-total').first()
        )

        summary = (
            f"Processed {total_bills} bills with total expenses {total_expenses}. "
            f"Rejected bills: {rejected}. "
            f"Top spend category: {(top_category or {}).get('category', 'N/A')}."
        )

        return Response({'response': f"{summary} You asked: {prompt}"}, status=status.HTTP_200_OK)
