#  apps/speaking/admin.py
from django.contrib import admin
from .models import SpeakingRequest


@admin.register(SpeakingRequest)
class SpeakingRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "phone_number",
        "status",
        "fee_amount",
        "currency",
        "payment_date",
        "created_at",
    )
    list_filter = ("status", "created_at", "payment_date")
    search_fields = (
        "full_name",
        "phone_number",
        "telegram_username",
        "student__user__fullname",
        "student__user__phone_number",
        "id",
    )
    raw_id_fields = ("student",)
    readonly_fields = ("checklist",)
    ordering = ("-created_at",)
