from datetime import datetime, timedelta

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import AuditTrail
from .serializers import AuditTrailSerializer


class AuditTrailListView(generics.ListAPIView):
    serializer_class = AuditTrailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        bill_id = self.kwargs['bill_id']
        return AuditTrail.objects.filter(bill_id=bill_id).order_by('-timestamp')


class AuditTrailAllView(generics.ListAPIView):
    serializer_class = AuditTrailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AuditTrail.objects.select_related('bill').order_by('-timestamp')

    def list(self, request, *args, **kwargs):
        if request.user.role != 'CEO':
            return Response({'error': 'Only CEO can access audit logs.'}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        bill_id = params.get('bill_id')
        user_name = params.get('user')
        action_type = params.get('action_type')
        status_value = params.get('status')
        date_from = params.get('date_from')
        date_to = params.get('date_to')

        if bill_id:
            queryset = queryset.filter(bill_id=bill_id)
        if user_name:
            queryset = queryset.filter(performed_by__icontains=user_name)
        if action_type:
            queryset = queryset.filter(action__icontains=action_type)
        if status_value:
            queryset = queryset.filter(bill__status=status_value)

        if date_from:
            try:
                start = datetime.strptime(date_from, '%Y-%m-%d')
                queryset = queryset.filter(timestamp__gte=start)
            except ValueError:
                pass
        if date_to:
            try:
                end = datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1)
                queryset = queryset.filter(timestamp__lt=end)
            except ValueError:
                pass

        return queryset
