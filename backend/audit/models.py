from django.db import models
from bills.models import Bill

class AuditTrail(models.Model):
    audit_id = models.AutoField(primary_key=True)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='audit_trails')
    action = models.CharField(max_length=255)
    performed_by = models.CharField(max_length=100, default='System')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} on Bill {self.bill.bill_id}"
