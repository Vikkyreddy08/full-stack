from django.db import models
from django.contrib.auth.models import AbstractUser

# ==========================================
# CUSTOM USER MODEL - ✅ ADDED ROLE SUPPORT
# ==========================================
class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('employee', 'Employee'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
