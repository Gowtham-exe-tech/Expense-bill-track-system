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
