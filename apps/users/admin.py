# apps/users/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import User
from apps.profiles.models import StudentProfile, TeacherProfile


# ==========================
# Inline Profiles
# ==========================
class StudentProfileInline(admin.StackedInline):
    model = StudentProfile
    can_delete = False
    verbose_name_plural = "Student Profile"
    fk_name = "user"
    readonly_fields = ("created_at", "updated_at")


class TeacherProfileInline(admin.StackedInline):
    model = TeacherProfile
    can_delete = False
    verbose_name_plural = "Teacher Profile"
    fk_name = "user"
    readonly_fields = ("created_at", "updated_at")


# ==========================
# User Admin
# ==========================
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # Fields to display in list view
    list_display = (
        "id",
        "fullname",
        "phone_number",
        "role",
        "type",
        "is_approved",
        "is_staff",
        "is_active",
        "last_activity",
        "created_at",
        "updated_at",
        "profile_link",
    )

    # Fields you can click to edit
    list_display_links = ("fullname", "phone_number")

    # Filters for sidebar
    list_filter = ("role", "is_approved", "is_staff", "is_active", "type", "created_at")

    # Searchable fields
    search_fields = ("fullname", "phone_number", "telegram_username")

    # Ordering
    ordering = ("-created_at",)

    # Readonly fields
    readonly_fields = ("last_activity", "created_at", "updated_at")

    # Inline profiles
    inlines = [StudentProfileInline, TeacherProfileInline]

    # Fieldsets to organize edit form
    fieldsets = (
        (
            "User Info",
            {
                "fields": (
                    "fullname",
                    "telegram_username",
                    "phone_number",
                    "role",
                    "type",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_approved",
                    "is_staff",
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Activity & Timestamps",
            {"fields": ("last_activity", "created_at", "updated_at")},
        ),
    )

    def profile_link(self, obj):
        if obj.role == "student" and hasattr(obj, "student_profile"):
            return format_html(
                '<a href="/admin/profiles/studentprofile/{}/change/">Student Profile</a>',
                obj.student_profile.pk,  # .id o‘rniga .pk ishlatildi
            )
        elif obj.role == "teacher" and hasattr(obj, "teacher_profile"):
            return format_html(
                '<a href="/admin/profiles/teacherprofile/{}/change/">Teacher Profile</a>',
                obj.teacher_profile.pk,  # .id o‘rniga .pk ishlatildi
            )
        return "-"

    profile_link.short_description = "Profile Link"
