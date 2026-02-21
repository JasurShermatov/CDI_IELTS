#  apps/speaking/models.py
from django.db import models

from apps.profiles.models import StudentProfile
from apps.users.models import UUIDPrimaryKeyMixin, TimeStampedMixin


class SpeakingRequest(UUIDPrimaryKeyMixin, TimeStampedMixin):

    STATUS_PENDING = "pending"
    STATUS_CONNECTED = "connected"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONNECTED, "Connected"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="speaking_requests"
    )

    # ── Student info snapshot (at request time) ──
    full_name = models.CharField(max_length=100)
    telegram_username = models.CharField(max_length=50, blank=True, default="")
    phone_number = models.CharField(max_length=20)

    # ── Payment & checklist ──
    payment_date = models.DateTimeField(
        help_text="Date/time student made the payment.",
    )
    checklist = models.JSONField(
        default=dict,
        blank=True,
        help_text="Structured checklist data sent with the request.",
    )

    # ── Fee tracking (existing) ──
    fee_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="UZS")
    note = models.CharField(max_length=255, blank=True, default="")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )

    class Meta:
        db_table = "speaking_requests"
        indexes = [
            models.Index(fields=["student", "status"], name="spreq_student_status_idx"),
            models.Index(fields=["created_at"], name="spreq_created_idx"),
        ]

    def __str__(self) -> str:
        return f"SpeakingRequest<{self.id}> {self.full_name} [{self.status}]"  # type: ignore[attr-defined]
