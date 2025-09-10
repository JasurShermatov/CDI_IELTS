# apps/profiles/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import StudentProfile, TeacherProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user_link",
        "balance",
        "type",
        "is_approved",
        "created_at",
        "updated_at",
    )
    list_display_links = ("user_link",)
    search_fields = ("user__fullname", "user__phone_number", "user__telegram_username")
    list_filter = ("type", "is_approved", "created_at")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("User", {"fields": ("user",)}),
        ("Profile Info", {"fields": ("balance", "type", "is_approved")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    def user_link(self, obj):
        if obj.user:
            return format_html(
                '<a href="/admin/users/user/{}/change/">{}</a>',
                obj.user.id,
                obj.user.fullname,
            )
        return "-"

    user_link.short_description = "User"


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user_link",
        "created_at",
        "updated_at",
    )
    list_display_links = ("user_link",)
    search_fields = ("user__fullname", "user__phone_number", "user__telegram_username")
    list_filter = ("created_at",)
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("User", {"fields": ("user",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    def user_link(self, obj):
        if obj.user:
            return format_html(
                '<a href="/admin/users/user/{}/change/">{}</a>',
                obj.user.id,
                obj.user.fullname,
            )
        return "-"

    user_link.short_description = "User"
