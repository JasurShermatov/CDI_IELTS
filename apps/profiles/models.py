# apps/profiles/models.py

from django.db import models
from django.utils import timezone

from apps.users.models import User


# Student Profile
class StudentProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, primary_key=True, related_name="student_profile"
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    type = models.CharField(
        max_length=10,
        choices=[("online", "Online"), ("offline", "Offline")],
        null=True,
        blank=True,
    )
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "student_profiles"

    def __str__(self):
        return f"StudentProfile: {self.user.fullname}"


# Teacher Profile
class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, primary_key=True, related_name="teacher_profile"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "teacher_profiles"

    def __str__(self):
        return f"TeacherProfile: {self.user.fullname}"
