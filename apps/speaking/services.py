# apps/speaking/services.py
import logging
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict

from django.conf import settings
from django.db import transaction
from django.db.models import F

from apps.profiles.models import StudentProfile
from apps.core.notifications import notify_telegram_admin_sync
from .models import SpeakingRequest

log = logging.getLogger(__name__)


@transaction.atomic
def create_speaking_request(
    *,
    student: StudentProfile,
    phone_number: str,
    payment_date: datetime,
    checklist: Dict[str, Any] | None = None,
    note: str = "",
) -> SpeakingRequest:
    """
    Create a speaking request: deduct fee, persist, notify admin via Telegram.
    Raises ValueError on business-rule violations.
    """

    # ── Duplicate check ──
    has_active = SpeakingRequest.objects.filter(
        student=student,
        status=SpeakingRequest.STATUS_PENDING,
    ).exists()
    if has_active:
        raise ValueError(
            "Sizda allaqachon faol speaking so'rov mavjud. "
            "Yangi so'rov yaratish uchun avvalgisini yakunlang."
        )

    # ── Fee validation & deduction ──
    fee = Decimal(str(settings.SPEAKING.get("FEE", 0)))
    if fee <= 0:
        raise ValueError("Speaking FEE misconfigured (SPEAKING.FEE <= 0)")

    updated = StudentProfile.objects.filter(pk=student.pk, balance__gte=fee).update(
        balance=F("balance") - fee
    )
    if updated == 0:
        raise ValueError("Hisobingizda mablag' yetarli emas.")

    # ── Snapshot student info ──
    user = student.user
    sr = SpeakingRequest.objects.create(
        student=student,
        full_name=user.fullname,
        telegram_username=user.telegram_username or "",
        phone_number=phone_number,
        payment_date=payment_date,
        checklist=checklist or {},
        fee_amount=fee,
        currency="UZS",
        note=note,
    )

    log.info("Speaking request created: %s for student %s", sr.id, user.fullname)

    # ── Telegram admin notification ──
    checklist_lines = ""
    if checklist:
        for key, val in checklist.items():
            label = key.replace("_", " ").title()
            mark = "✅" if val else "❌"
            checklist_lines += f"  {mark} {label}\n"

    text = (
        "<b>🎤 Yangi Speaking so'rovi</b>\n"
        "━━━━━━━━━━━━━━━━━━\n"
        f"👤 Student: <code>{user.fullname}</code>\n"
        f"📱 Phone: <code>{phone_number}</code>\n"
        f"💬 Telegram: <code>@{user.telegram_username or '-'}</code>\n"
        f"💰 Fee: <b>{fee} UZS</b>\n"
        f"📅 Payment date: <code>{payment_date.strftime('%Y-%m-%d %H:%M')}</code>\n"
    )
    if checklist_lines:
        text += f"\n📋 <b>Checklist:</b>\n{checklist_lines}"
    text += f"\n🆔 Request ID: <code>{sr.id}</code>"

    try:
        notify_telegram_admin_sync(text)
    except Exception:
        log.warning("Telegram notification failed for speaking request %s", sr.id)

    return sr
