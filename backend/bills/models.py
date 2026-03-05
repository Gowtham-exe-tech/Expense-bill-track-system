from django.db import models
from django.conf import settings

STATUS_CHOICES = [
    ('UPLOADED', 'UPLOADED'),
    ('ACCOUNTANT_VERIFIED', 'ACCOUNTANT_VERIFIED'),
    ('MANAGER_APPROVED', 'MANAGER_APPROVED'),
    ('MANAGER_REJECTED', 'MANAGER_REJECTED'),
    ('CEO_APPROVED', 'CEO_APPROVED'),
    ('CEO_REJECTED', 'CEO_REJECTED'),
    ('PAID', 'PAID'),
]

CATEGORY_CHOICES = [
    ('Travel', 'Travel'),
    ('Fuel', 'Fuel'),
    ('Repair', 'Repair'),
    ('Courier', 'Courier'),
    ('Office Supplies', 'Office Supplies'),
    ('Other', 'Other'),
]

class Bill(models.Model):
    bill_id = models.AutoField(primary_key=True)
    vendor_name = models.CharField(max_length=255, blank=True, default='')
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    bill_date = models.DateField(null=True, blank=True)
    bill_due_date = models.DateField(null=True, blank=True)
    file_path = models.FileField(upload_to='bills/', null=True, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_bills',
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='UPLOADED')
    ocr_extracted_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vendor_name or 'Unknown Vendor'} - {self.amount or 0}"
