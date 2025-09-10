# apps/users/models.py
import uuid

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
    Group,
    Permission,
)
from django.db import models
from django.utils import timezone


# User Manager
class UserManager(BaseUserManager):
    def create_user(
        self, fullname: str, phone_number: str, role: str, password=None, **extra_fields
    ):
        if not fullname:
            raise ValueError("Fullname is required")
        if not phone_number:
            raise ValueError("Phone number is required")
        if not role:
            raise ValueError("Role is required")

        user = self.model(
            fullname=fullname, phone_number=phone_number, role=role, **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
        self, fullname: str, phone_number: str, password=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_approved", True)
        return self.create_user(
            fullname, phone_number, role="superadmin", password=password, **extra_fields
        )


# Custom User Model
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("superadmin", "Superadmin"),
        ("student", "Student"),
        ("teacher", "Teacher"),
    ]
    TYPE_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fullname = models.CharField(max_length=100)
    telegram_username = models.CharField(
        max_length=50, unique=True, null=True, blank=True
    )
    phone_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, null=True, blank=True)
    is_approved = models.BooleanField(default=False)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    last_activity = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    # === PermissionsMixin maydonlarini override qilamiz ===
    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_set",
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_permissions_set",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    objects = UserManager()

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ["fullname", "role"]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.fullname} ({self.phone_number})"

    def update_last_activity(self):
        self.last_activity = timezone.now()
        self.save(update_fields=["last_activity"])
