from django.db import models
from bills.models import Bill

ROLE_CHOICES = [
    ('Accounts', 'Accounts'),
    ('Manager', 'Manager'),
    ('MD', 'MD'),
]

STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Approved', 'Approved'),
    ('Rejected', 'Rejected'),
    ('Under Review', 'Under Review'),
]

class Approval(models.Model):
    approval_id = models.AutoField(primary_key=True)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='approvals')
    approver_role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    comments = models.TextField(blank=True, null=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Approval {self.approval_id} for Bill {self.bill.bill_id}"
