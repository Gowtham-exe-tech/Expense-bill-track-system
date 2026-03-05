from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from bills.models import Bill

def check_due_dates_and_notify():
    today = timezone.now().date()
    
    overdue_bills = Bill.objects.filter(
        bill_due_date__lt=today,
        status__in=['Pending', 'Under Review'] # Might not want to alert if it's already Approved/Rejected
    )
    
    for bill in overdue_bills:
        subject = 'Bill Due Date Exceeded Alert'
        message = f"Bill ID {bill.bill_id} submitted for vendor {bill.vendor_name} has exceeded its due date. Please review immediately.\n\n"
        message += f"Amount: {bill.amount}\nDue Date: {bill.bill_due_date}"
        
        # Simulating attachment since we don't have full file path setup locally in console testing
        # email.attach_file(bill.file_path.path)
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'system@bills.local',
            ['gowthamaids06@gmail.com'],
            fail_silently=False,
        )
        
    return overdue_bills.count()
