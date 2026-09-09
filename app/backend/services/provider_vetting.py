import re
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.fulfillment import ProviderVettingItem

PILOT_PROVIDER_VETTING_ROLES = {
    "identity_check": {"identity_verifier"},
    "provider_agreement": {"contract_reviewer"},
    "invoice_capability": {"accountant"},
    "insurance": {"insurance_broker", "insurance_adviser"},
}
PILOT_PROVIDER_VETTING_KEYS = frozenset(PILOT_PROVIDER_VETTING_ROLES)
PILOT_SCOPE_VERSION = "PILOT-HOME-VISIT-v1"
PILOT_SCOPE_HASH = "1e7b4e3047f8fe32cd1cc4399ba4df35e810880fc5bdc933599dc09836a8ca81"


def _utc(value: datetime) -> datetime:
    return (value if value.tzinfo else value.replace(tzinfo=timezone.utc)).astimezone(timezone.utc)


def provider_vetting_item_is_valid(item: ProviderVettingItem, *, now: datetime, required_through: datetime) -> bool:
    return bool(
        item.requirement_key in PILOT_PROVIDER_VETTING_ROLES
        and item.status == "approved"
        and item.scope_version == PILOT_SCOPE_VERSION
        and item.scope_hash == PILOT_SCOPE_HASH
        and item.reviewer_role in PILOT_PROVIDER_VETTING_ROLES[item.requirement_key]
        and item.reviewed_by and item.reviewed_by.strip()
        and item.reviewed_at and _utc(item.reviewed_at) <= now
        and item.effective_at and _utc(item.effective_at) <= now
        and item.evidence_reference and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]{2,119}", item.evidence_reference)
        and item.evidence_hash and re.fullmatch(r"[0-9a-fA-F]{64}", item.evidence_hash)
        and item.review_trigger and len(item.review_trigger.strip()) >= 3
        and not item.conditions_open
        and (item.expires_at is None or _utc(item.expires_at) >= required_through)
    )


async def provider_vetting_is_valid(
    db: AsyncSession, profile_id: int, *, required_through: datetime | None = None,
) -> bool:
    now = datetime.now(timezone.utc)
    coverage_end = _utc(required_through) if required_through else now
    rows = (await db.execute(select(ProviderVettingItem).where(
        ProviderVettingItem.provider_profile_id == profile_id,
        ProviderVettingItem.requirement_key.in_(PILOT_PROVIDER_VETTING_KEYS),
    ))).scalars().all()
    by_key = {item.requirement_key: item for item in rows}
    return set(by_key) == set(PILOT_PROVIDER_VETTING_KEYS) and all(
        provider_vetting_item_is_valid(by_key[key], now=now, required_through=coverage_end)
        for key in PILOT_PROVIDER_VETTING_KEYS
    )
