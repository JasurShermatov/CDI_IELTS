from decimal import Decimal
from django.db import transaction
from django.db.models import F
from django.core.exceptions import ValidationError

from apps.tests.models.ielts import Test
from apps.profiles.models import StudentProfile
from .models import UserTest


@transaction.atomic
def purchase_test(*, user, test: Test) -> UserTest:
    sp = user.student_profile
    price = (
        Decimal(getattr(test, "price", 0))
        if sp.type == StudentProfile.TYPE_ONLINE
        else Decimal("0.00")
    )

    ut, created = UserTest.objects.get_or_create(
        user=user, test=test, defaults={"price_paid": price}
    )
    if not created:
        return ut

    if price > 0:
        if sp.balance < price:
            raise ValidationError("Balance yetarli emas!")
        StudentProfile.objects.filter(pk=sp.pk, balance__gte=price).update(
            balance=F("balance") - price
        )

    return ut
