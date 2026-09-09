import json
import re
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.fulfillment import ProviderCapabilityDecision
from services.provider_vetting import ALLOWED_TASK_KEYS, PILOT_SCOPE_HASH, PILOT_SCOPE_VERSION
from services.pilot_tasks import CAPABILITY_ACKNOWLEDGEMENTS, CAPABILITY_CONFIRMATION_SET_VERSION, TASK_DEFINITION_VERSION, confirmation_set_hash, task_definition_hash


def _utc(value: datetime) -> datetime:
    return (value if value.tzinfo else value.replace(tzinfo=timezone.utc)).astimezone(timezone.utc)


def capability_decision_is_valid(decision: ProviderCapabilityDecision, *, now: datetime, required_through: datetime) -> bool:
    try:
        decoded = json.loads(decision.safety_acknowledgements)
        if not isinstance(decoded, list) or len(decoded) != len(CAPABILITY_ACKNOWLEDGEMENTS):
            return False
        acknowledgements = set(decoded)
    except (TypeError, ValueError):
        return False
    return bool(
        decision.service_key in ALLOWED_TASK_KEYS and decision.service_area == "harish"
        and decision.status == "eligible_supervised" and decision.assessment_method == "supervised_trial"
        and decision.assessment_result == "passed" and decision.supervision_only is True
        and decision.scope_version == PILOT_SCOPE_VERSION and decision.scope_hash == PILOT_SCOPE_HASH
        and decision.task_definition_hash == task_definition_hash(decision.service_key)
        and decision.task_definition_version == TASK_DEFINITION_VERSION
        and decision.confirmation_set_version == CAPABILITY_CONFIRMATION_SET_VERSION
        and decision.confirmation_set_hash == confirmation_set_hash()
        and decision.assessor_name and decision.assessor_name.strip()
        and decision.assessor_role in {"owner_supervisor", "qualified_supervisor"}
        and decision.evidence_reference and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]{2,119}", decision.evidence_reference)
        and decision.evidence_hash and re.fullmatch(r"[0-9a-fA-F]{64}", decision.evidence_hash)
        and _utc(decision.assessed_at) <= _utc(decision.effective_at) <= now
        and _utc(decision.effective_at) < _utc(decision.expires_at)
        and _utc(decision.expires_at) >= required_through
        and decision.review_trigger and len(decision.review_trigger.strip()) >= 3
        and decision.decision_reason and len(decision.decision_reason.strip()) >= 10
        and not decision.conditions_open and acknowledgements == CAPABILITY_ACKNOWLEDGEMENTS
    )


async def provider_capability_is_valid(db: AsyncSession, profile_id: int, service_key: str, *, required_through: datetime | None = None) -> bool:
    decision = await current_provider_capability_decision(db, profile_id, service_key)
    if decision is None:
        return False
    now = datetime.now(timezone.utc)
    return capability_decision_is_valid(decision, now=now, required_through=_utc(required_through) if required_through else now)


async def current_provider_capability_decision(db: AsyncSession, profile_id: int, service_key: str) -> ProviderCapabilityDecision | None:
    return await db.scalar(select(ProviderCapabilityDecision).where(
        ProviderCapabilityDecision.provider_profile_id == profile_id,
        ProviderCapabilityDecision.service_key == service_key,
        ProviderCapabilityDecision.service_area == "harish",
    ).order_by(ProviderCapabilityDecision.id.desc()).limit(1))


async def any_provider_capability_is_valid(db: AsyncSession, profile_id: int) -> bool:
    for task_key in ALLOWED_TASK_KEYS:
        if await provider_capability_is_valid(db, profile_id, task_key):
            return True
    return False
