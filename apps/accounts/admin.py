# apps/accounts/admin.py
from django.contrib import admin
from .models import VerificationCode


@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "code",
        "created_at",
        "expires_at",
        "is_expired",
    )
    list_filter = ("created_at", "expires_at")
    search_fields = ("user__phone_number", "code")
    readonly_fields = ("created_at", "expires_at")
    ordering = ("-created_at",)
    list_per_page = 25

    def is_expired(self, obj):
        return obj.expires_at < obj.created_at

    is_expired.boolean = True
    is_expired.short_description = "Expired?"
