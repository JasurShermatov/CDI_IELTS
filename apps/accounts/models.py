# apps/accounts/models.py
import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User


class VerificationCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="verification_codes"
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        """Default expiry date qo‘yish"""
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=2)
        super().save(*args, **kwargs)

    def is_valid(self, code: str) -> bool:
        """Kodni tekshirish"""
        return self.code == code and timezone.now() < self.expires_at

    def __str__(self):
        return f"VerificationCode for {self.user.phone_number}"
