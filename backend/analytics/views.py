from django.db.models import Sum
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from bills.models import Bill

from .chatbot import answer_chat_query


class CEOOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CEO')


class ChatbotRolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ['ACCOUNTANT', 'MANAGER', 'CEO']
        )


class AnalyticsView(APIView):
    permission_classes = [CEOOnlyPermission]

    def get(self, request, format=None):
        total_expenses = Bill.objects.aggregate(total=Sum('amount'))['total'] or 0
        categories = list(Bill.objects.values('category').annotate(total=Sum('amount')))

        approved_count = Bill.objects.filter(status__in=['APPROVED', 'PAID', 'CEO_APPROVED']).count()
        pending_count = Bill.objects.filter(
            status__in=['UPLOADED', 'ACCOUNTANT_VERIFIED', 'MANAGER_APPROVED', 'UNDER_REVIEW']
        ).count()
        rejected_count = Bill.objects.filter(status__in=['REJECTED', 'MANAGER_REJECTED', 'CEO_REJECTED']).count()

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
    permission_classes = [ChatbotRolePermission]

    def post(self, request, format=None):
        prompt = (request.data.get('prompt') or '').strip()
        if not prompt:
            return Response({'error': 'Prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)

        response_text = answer_chat_query(prompt=prompt, user_role=request.user.role)
        return Response(
            {
                'response': response_text,
            },
            status=status.HTTP_200_OK,
        )
