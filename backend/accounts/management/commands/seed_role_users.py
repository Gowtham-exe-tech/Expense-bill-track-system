from django.core.management.base import BaseCommand

from accounts.models import User


class Command(BaseCommand):
    help = 'Create default users for each role in the bill approval workflow.'

    def handle(self, *args, **options):
        defaults = [
            ('reception1', 'RECEPTIONIST', 'Front Office'),
            ('account1', 'ACCOUNTANT', 'Finance'),
            ('manager1', 'MANAGER', 'Operations'),
            ('ceo1', 'CEO', 'Executive'),
        ]
        password = 'Pass@12345'

        for username, role, department in defaults:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'role': role, 'department': department, 'is_active': True},
            )
            if created:
                user.set_password(password)
                user.save(update_fields=['password'])
                self.stdout.write(self.style.SUCCESS(f'Created {username} ({role})'))
            else:
                if user.role != role or user.department != department:
                    user.role = role
                    user.department = department
                    user.save(update_fields=['role', 'department'])
                self.stdout.write(self.style.WARNING(f'Exists {username} ({role})'))

        self.stdout.write(self.style.SUCCESS(f'Default password for seeded users: {password}'))
