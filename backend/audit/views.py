from rest_framework import generics
from .models import AuditTrail
from .serializers import AuditTrailSerializer

class AuditTrailListView(generics.ListAPIView):
    serializer_class = AuditTrailSerializer

    def get_queryset(self):
        bill_id = self.kwargs['bill_id']
        return AuditTrail.objects.filter(bill_id=bill_id).order_by('-timestamp')
