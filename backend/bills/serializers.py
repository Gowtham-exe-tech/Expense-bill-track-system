from rest_framework import serializers
from .models import Bill
from approvals.serializers import ApprovalSerializer
from audit.serializers import AuditTrailSerializer

class BillSerializer(serializers.ModelSerializer):
    approvals = ApprovalSerializer(many=True, read_only=True)
    audit_trails = AuditTrailSerializer(many=True, read_only=True)

    class Meta:
        model = Bill
        fields = '__all__'
