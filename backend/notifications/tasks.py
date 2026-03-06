from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from bills.models import Bill


def check_due_dates_and_notify():
    today = timezone.now().date()
    overdue_bills = Bill.objects.filter(
        bill_due_date__isnull=False,
        bill_due_date__lt=today,
        overdue_notified_at__isnull=True,
    ).exclude(status__in=['APPROVED', 'PAID'])

    notified_count = 0
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'system@bills.local')

    for bill in overdue_bills:
        subject = f'Overdue Bill Alert - Bill #{bill.bill_id}'
        message = (
            "Bill approval is delayed. The due date for this bill has been exceeded.\n\n"
            f"Bill ID: {bill.bill_id}\n"
            f"Vendor Name: {bill.vendor_name}\n"
            f"Amount: {bill.amount}\n"
            f"Category: {bill.category}\n"
            f"Price: {bill.amount}\n"
            f"Due Date: {bill.bill_due_date}\n"
            f"Current Status: {bill.status}\n"
        )

        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=['gowthamaids06@gmail.com'],
            fail_silently=False,
        )
        bill.overdue_notified_at = timezone.now()
        bill.save(update_fields=['overdue_notified_at'])
        notified_count += 1

    return notified_count
