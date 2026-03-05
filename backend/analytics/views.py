from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from bills.models import Bill

class AnalyticsView(APIView):
    def get(self, request, format=None):
        total_expenses = Bill.objects.aggregate(total=Sum('amount'))['total'] or 0
        monthly_spending = {} # simplified for format
        
        categories = list(Bill.objects.values('category').annotate(total=Sum('amount')))
        
        approved_count = Bill.objects.filter(status='Approved').count()
        pending_count = Bill.objects.filter(status='Pending').count()
        rejected_count = Bill.objects.filter(status='Rejected').count()
        
        return Response({
            'total_expenses': total_expenses,
            'expenses_by_category': categories,
            'approval_statistics': {
                'approved': approved_count,
                'pending': pending_count,
                'rejected': rejected_count
            }
        })
