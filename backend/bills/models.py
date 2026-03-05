from django.db import models

STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Under Review', 'Under Review'),
    ('Approved', 'Approved'),
    ('Rejected', 'Rejected'),
]

CATEGORY_CHOICES = [
    ('Travel', 'Travel'),
    ('Fuel', 'Fuel'),
    ('Repair', 'Repair'),
    ('Courier', 'Courier'),
    ('Other', 'Other'),
]

class Bill(models.Model):
    bill_id = models.AutoField(primary_key=True)
    vendor_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    bill_date = models.DateField(null=True, blank=True)
    bill_due_date = models.DateField(null=True, blank=True)
    file_path = models.FileField(upload_to='bills/')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vendor_name} - {self.amount}"
