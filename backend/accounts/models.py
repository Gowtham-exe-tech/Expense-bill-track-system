from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_RECEPTIONIST = 'RECEPTIONIST'
    ROLE_ACCOUNTANT = 'ACCOUNTANT'
    ROLE_MANAGER = 'MANAGER'
    ROLE_CEO = 'CEO'

    ROLE_CHOICES = [
        (ROLE_RECEPTIONIST, 'Receptionist'),
        (ROLE_ACCOUNTANT, 'Accountant'),
        (ROLE_MANAGER, 'Manager'),
        (ROLE_CEO, 'CEO'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_RECEPTIONIST)
    department = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return f'{self.username} ({self.role})'
