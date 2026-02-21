# apps/speaking/serializers.py
import re
from rest_framework import serializers
from .models import SpeakingRequest

PHONE_RE = re.compile(r"^\+?[1-9]\d{7,14}$")


class SpeakingRequestCreateSerializer(serializers.Serializer):
    """Validates incoming speaking request payload."""

    phone_number = serializers.CharField(max_length=20)
    payment_date = serializers.DateTimeField()
    checklist = serializers.DictField(required=False, default=dict)

    def validate_phone_number(self, value: str) -> str:
        cleaned = value.strip().replace(" ", "").replace("-", "")
        if not PHONE_RE.match(cleaned):
            raise serializers.ValidationError(
                "Phone must be in international format, e.g. +998901234567"
            )
        return cleaned


class SpeakingRequestSerializer(serializers.ModelSerializer):
    """Read-only serializer for speaking request responses."""

    student_id = serializers.UUIDField(source="student.id", read_only=True)

    class Meta:
        model = SpeakingRequest
        fields = [
            "id",
            "student_id",
            "full_name",
            "telegram_username",
            "phone_number",
            "payment_date",
            "checklist",
            "status",
            "fee_amount",
            "currency",
            "note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
