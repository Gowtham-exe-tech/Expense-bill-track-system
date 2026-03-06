from datetime import timedelta

from django.db.models import Count, Sum
from django.utils import timezone

from approvals.models import Approval
from audit.models import AuditTrail
from bills.models import Bill

try:
    import spacy
except Exception:
    spacy = None


_NLP = None


def _nlp():
    global _NLP
    if _NLP is None and spacy is not None:
        try:
            _NLP = spacy.blank("en")
        except Exception:
            _NLP = None
    return _NLP


def _normalize(prompt):
    model = _nlp()
    if model is None:
        return prompt.lower().strip()
    doc = model(prompt.lower().strip())
    return " ".join(token.text for token in doc)


def _month_label(dt):
    return dt.strftime("%B %Y")


def answer_chat_query(prompt, user_role):
    text = _normalize(prompt)
    now = timezone.now()
    today = now.date()
    week_start = now - timedelta(days=7)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_name = _month_label(now)

    if 'pending' in text:
        pending_count = Bill.objects.filter(
            status__in=['UPLOADED', 'ACCOUNTANT_VERIFIED', 'MANAGER_APPROVED', 'UNDER_REVIEW']
        ).count()
        return f"There are currently {pending_count} bills awaiting approval in the system."

    if 'under review' in text:
        count = Bill.objects.filter(status='UNDER_REVIEW').count()
        return f"There are {count} bills under review right now, which indicates conflicting approval decisions that need resolution."

    if 'uploaded this week' in text or ('uploaded' in text and 'week' in text):
        weekly = Bill.objects.filter(created_at__gte=week_start).count()
        return f"In the last 7 days, {weekly} bills were uploaded to the platform."

    if 'awaiting my approval' in text:
        waiting = Approval.objects.filter(approver_role=user_role, status='Pending').count()
        return f"You currently have {waiting} bills awaiting your approval."

    if 'rejected bills this month' in text or ('rejected' in text and 'month' in text):
        rejected = Bill.objects.filter(status='REJECTED', created_at__gte=month_start).count()
        return f"In {month_name}, {rejected} bills were rejected."

    if ('monthly spend' in text) or (('spend' in text or 'spent' in text) and 'month' in text):
        total = Bill.objects.filter(created_at__gte=month_start).aggregate(total=Sum('amount'))['total'] or 0
        bills = Bill.objects.filter(created_at__gte=month_start).count()
        return f"The total company spending for {month_name} is ₹{total} across {bills} submitted bills."

    if 'highest vendor' in text or 'highest payments' in text or ('vendors' in text and 'highest' in text):
        top = (
            Bill.objects.values('vendor_name')
            .annotate(total=Sum('amount'))
            .order_by('-total')
            .first()
        )
        if not top:
            return "No vendor payment data is available yet."
        return f"The highest cumulative vendor payment is to {top.get('vendor_name') or 'Unknown Vendor'}, totaling ₹{top.get('total') or 0}."

    if 'above 20000' in text or 'high value' in text:
        count = Bill.objects.filter(amount__gt=20000).count()
        return f"There are {count} high-value bills above ₹20000 in the current dataset."

    if 'due date' in text or 'overdue' in text or 'crossed due date' in text:
        overdue = Bill.objects.filter(bill_due_date__lt=today).exclude(status__in=['APPROVED', 'PAID']).count()
        return f"There are {overdue} bills that crossed their due date and are still not fully approved."

    if 'vendor' in text and ('frequent' in text or 'most' in text):
        top = (
            Bill.objects.values('vendor_name')
            .annotate(count=Count('bill_id'))
            .order_by('-count')
            .first()
        )
        if not top:
            return "No vendor frequency data is available yet."
        return f"The most frequent vendor is {top.get('vendor_name') or 'Unknown Vendor'} with {top.get('count') or 0} bills."

    audit_entries = AuditTrail.objects.count()
    approvals_logged = Approval.objects.count()
    return (
        f"I analyzed {audit_entries} audit entries and {approvals_logged} approval records. "
        "Ask about pending bills, under review items, monthly spending, high-value bills, vendor payments, or overdue approvals."
    )
