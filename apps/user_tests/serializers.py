#  apps/user_tests/serializers.py
from rest_framework import serializers

from apps.tests.models.ielts import Test
from .models import UserTest, TestResult


class TestListItemSerializer(serializers.ModelSerializer):
    """
    All tests uchun element.
    purchased -> annotate(Exists(UserTest)) dan keladi (read_only)
    price -> Test modelida yo'q bo'lsa 0 qaytaramiz (moslashuvchan).
    """

    purchased = serializers.BooleanField(read_only=True)
    price = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ["id", "title", "created_at", "price", "purchased"]

    def get_price(self, obj):
        return getattr(obj, "price", 0)


class TestSerializer(serializers.ModelSerializer):
    """Ichki joylarda Test’ni minimal ko‘rinishda ko‘rsatish uchun."""

    class Meta:
        model = Test
        fields = ["id", "title", "created_at"]


class UserTestSerializer(serializers.ModelSerializer):
    """
    My tests (UserTest) uchun serializer.
    """

    test = TestSerializer(read_only=True)

    class Meta:
        model = UserTest
        fields = [
            "id",
            "test",
            "status",
            "price_paid",
            "started_at",
            "completed_at",
            "created_at",
        ]


class TestResultSerializer(serializers.ModelSerializer):
    """
    Result reviews (TestResult) uchun serializer.
    """

    user_test = UserTestSerializer(read_only=True)

    class Meta:
        model = TestResult
        fields = [
            "id",
            "user_test",
            "listening_score",
            "reading_score",
            "writing_score",
            "overall_score",
            "feedback",
            "errors_analysis",
            "created_at",
        ]
