from rest_framework import serializers
from .models import AuditTrail

class AuditTrailSerializer(serializers.ModelSerializer):
    bill_status = serializers.CharField(source='bill.status', read_only=True)

    class Meta:
        model = AuditTrail
        fields = '__all__'
