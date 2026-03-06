from decimal import Decimal

from django.utils import timezone

from audit.models import AuditTrail

from .models import Approval

ROLE_ACCOUNTANT = 'ACCOUNTANT'
ROLE_MANAGER = 'MANAGER'
ROLE_CEO = 'CEO'

ALL_APPROVAL_ROLES = [ROLE_ACCOUNTANT, ROLE_MANAGER, ROLE_CEO]


def get_required_roles_for_amount(amount):
    value = Decimal(amount or 0)
    if value < Decimal('2000'):
        return [ROLE_ACCOUNTANT]
    if value <= Decimal('15000'):
        return [ROLE_ACCOUNTANT, ROLE_MANAGER]
    return [ROLE_ACCOUNTANT, ROLE_MANAGER, ROLE_CEO]


def ensure_amount_based_approvals(bill):
    required_roles = set(get_required_roles_for_amount(bill.amount))
    for role in ALL_APPROVAL_ROLES:
        approval, created = Approval.objects.get_or_create(
            bill=bill,
            approver_role=role,
            defaults={'status': 'Pending', 'is_required': role in required_roles},
        )
        if not created and approval.is_required != (role in required_roles):
            approval.is_required = role in required_roles
            approval.save(update_fields=['is_required'])
    return required_roles


def evaluate_bill_status(bill):
    required_approvals = list(bill.approvals.filter(is_required=True))
    if not required_approvals:
        return 'UPLOADED'

    required_statuses = [item.status for item in required_approvals]
    if all(value == 'Approved' for value in required_statuses):
        return 'APPROVED'
    if all(value == 'Rejected' for value in required_statuses):
        return 'REJECTED'

    all_decisions = list(bill.approvals.filter(status__in=['Approved', 'Rejected']).values_list('status', flat=True))
    if 'Approved' in all_decisions and 'Rejected' in all_decisions:
        return 'UNDER_REVIEW'

    accountant = bill.approvals.filter(approver_role=ROLE_ACCOUNTANT).first()
    manager = bill.approvals.filter(approver_role=ROLE_MANAGER).first()
    ceo = bill.approvals.filter(approver_role=ROLE_CEO).first()
    manager_required = bool(manager and manager.is_required)
    ceo_required = bool(ceo and ceo.is_required)

    if accountant and accountant.status == 'Approved' and not manager_required and not ceo_required:
        return 'APPROVED'
    if accountant and accountant.status == 'Approved' and manager_required and manager.status == 'Pending':
        return 'ACCOUNTANT_VERIFIED'
    if manager and manager.status == 'Approved' and ceo_required and ceo.status == 'Pending':
        return 'MANAGER_APPROVED'
    return 'UPLOADED'


def write_audit(bill, action, performed_by):
    AuditTrail.objects.create(
        bill=bill,
        action=action,
        performed_by=performed_by,
    )


def apply_decision(bill, role, decision, comments, performed_by):
    approval = bill.approvals.filter(approver_role=role).first()
    if not approval:
        raise ValueError('No approval step found for this role.')

    if decision == 'approve':
        can_approve = approval.is_required or approval.status == 'Rejected'
        if not can_approve:
            raise PermissionError('You are not allowed to approve this bill for the current amount bracket.')
        approval.status = 'Approved'
        action = f'{role} approved bill'
    elif decision == 'reject':
        can_reject = role in (ROLE_MANAGER, ROLE_CEO) or approval.is_required or approval.status == 'Approved'
        if not can_reject:
            raise PermissionError('You are not allowed to reject this bill for the current amount bracket.')
        approval.status = 'Rejected'
        action = f'{role} rejected bill'
    else:
        raise ValueError('Unsupported decision type.')

    approval.comments = comments
    approval.approved_at = timezone.now()
    approval.save(update_fields=['status', 'comments', 'approved_at'])

    previous_status = bill.status
    next_status = evaluate_bill_status(bill)
    bill.status = next_status
    bill.save(update_fields=['status'])

    if next_status == 'UNDER_REVIEW':
        write_audit(bill, 'Bill moved to UNDER_REVIEW due to conflicting decisions', performed_by)

    if previous_status != next_status:
        write_audit(bill, f'Status changed from {previous_status} to {next_status}', performed_by)

    write_audit(bill, action, performed_by)
    return bill.status
