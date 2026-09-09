from datetime import datetime, timezone
import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models.business_relationship import BusinessRelationship
from models.fulfillment import ManagedProviderProfile, ProviderCapability, ProviderVettingItem
from models.pilot import PilotApprovalGate, PilotConfiguration
from services.provider_vetting import provider_vetting_is_valid

PILOT_SCOPE_VERSION = "PILOT-HOME-VISIT-v1"
PILOT_SCOPE_HASH = "1e7b4e3047f8fe32cd1cc4399ba4df35e810880fc5bdc933599dc09836a8ca81"

EXTERNAL_GATES = (
    "LEGAL_CUSTOMER_TERMS_APPROVED",
    "LEGAL_CANCELLATION_REFUND_REMEDIATION_APPROVED",
    "LEGAL_PROVIDER_AGREEMENT_APPROVED",
    "LEGAL_PROVIDER_CLASSIFICATION_REVIEWED",
    "LEGAL_SERVICE_LICENSING_TAXONOMY_APPROVED",
    "LEGAL_PRIVACY_CONSENT_RETENTION_APPROVED",
    "LEGAL_INCIDENT_PROCESS_APPROVED",
    "LEGAL_E_ACCEPTANCE_EVIDENCE_APPROVED",
    "ACCOUNT_ENTITY_VAT_APPROVED",
    "ACCOUNT_CUSTOMER_DOCUMENT_FLOW_APPROVED",
    "ACCOUNT_PROVIDER_INVOICE_WITHHOLDING_APPROVED",
    "ACCOUNT_LEDGER_RECONCILIATION_APPROVED",
    "ACCOUNT_REFUND_CREDIT_NOTE_APPROVED",
    "ACCOUNT_RECORD_RETENTION_EXPORT_APPROVED",
    "INSURANCE_CLEANFIX_COVERAGE_CONFIRMED",
    "INSURANCE_PROVIDER_MINIMUMS_CONFIRMED",
    "INSURANCE_PILOT_SCOPE_COVERED",
    "INSURANCE_EXCLUSIONS_CONDITIONS_RECORDED",
    "INSURANCE_INCIDENT_CLAIM_PROCESS_CONFIRMED",
)
TECHNICAL_GATES = (
    "SYSTEM_BOOKING_SCHEDULE_VERIFIED", "SYSTEM_PROVIDER_ELIGIBILITY_VERIFIED",
    "SYSTEM_OFFER_ASSIGNMENT_VERIFIED", "SYSTEM_PROVIDER_MOBILE_WORKFLOW_VERIFIED",
    "SYSTEM_PRIVATE_EVIDENCE_VERIFIED", "SYSTEM_QUALITY_REWORK_VERIFIED",
    "SYSTEM_PAYMENT_PAYOUT_LEDGER_VERIFIED", "SYSTEM_GUARDED_COMPLETION_VERIFIED",
    "SYSTEM_ISOLATED_RESTORE_PARITY_VERIFIED",
)
REQUIRED_GATES = EXTERNAL_GATES + TECHNICAL_GATES
ALLOWED_TASK_KEYS = frozenset({"mounting_under_5kg", "flat_pack_under_25kg", "cabinet_hardware"})
REQUIRED_PROVIDER_VETTING = frozenset({"identity_check", "provider_agreement", "invoice_capability", "insurance"})


def _as_utc(value: datetime) -> datetime:
    return (value if value.tzinfo else value.replace(tzinfo=timezone.utc)).astimezone(timezone.utc)


def _gate_metadata_is_valid(gate: PilotApprovalGate, now: datetime) -> bool:
    expected_roles = (
        {"israeli_counsel"} if gate.gate_key.startswith("LEGAL_") else
        {"israeli_accountant", "israeli_tax_adviser"} if gate.gate_key.startswith("ACCOUNT_") else
        {"insurance_broker", "insurance_adviser"} if gate.gate_key.startswith("INSURANCE_") else
        {"system_verifier"}
    )
    return bool(
        gate.reviewer_name and gate.reviewer_role in expected_roles
        and gate.evidence_reference and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]{2,119}", gate.evidence_reference)
        and gate.evidence_hash and re.fullmatch(r"[0-9a-fA-F]{64}", gate.evidence_hash)
        and gate.reviewed_at and _as_utc(gate.reviewed_at) <= now
        and gate.effective_at and _as_utc(gate.effective_at) <= now
        and gate.review_trigger and not gate.conditions_open
    )


async def pilot_readiness_blockers(db: AsyncSession, *, include_runtime: bool = True, include_provider: bool = True, lock: bool = False) -> list[str]:
    config_query = select(PilotConfiguration).where(PilotConfiguration.id == 1)
    config = await db.scalar(config_query.with_for_update() if lock else config_query)
    if config is None:
        return ["pilot_configuration_missing"]
    blockers: list[str] = []
    if config.scope_version != PILOT_SCOPE_VERSION or config.scope_hash != PILOT_SCOPE_HASH:
        blockers.append("pilot_scope_not_current")
    if (
        config.operating_area != "Harish" or config.timezone != "Asia/Jerusalem"
        or config.operating_days != "monday,tuesday,wednesday,thursday"
        or config.opening_time != "09:00" or config.closing_time != "17:00"
        or config.weekly_job_cap != 3 or config.max_managed_providers != 2
        or config.owner_onsite_required is not True
    ):
        blockers.append("pilot_scope_values_mismatch")
    if not config.company_legal_name:
        blockers.append("company_legal_name_missing")
    if not config.encrypted_company_registration_id:
        blockers.append("company_registration_id_missing")
    if not config.entity_or_dealer_type:
        blockers.append("entity_or_dealer_type_missing")
    if not config.identifier_type:
        blockers.append("identifier_type_missing")
    gates_query = select(PilotApprovalGate).order_by(PilotApprovalGate.gate_key)
    gates = (await db.execute(gates_query.with_for_update() if lock else gates_query)).scalars().all()
    now = datetime.now(timezone.utc)
    by_key = {gate.gate_key: gate for gate in gates}
    for key in REQUIRED_GATES:
        gate = by_key.get(key)
        if gate is None or gate.status != "approved":
            blockers.append(f"gate_not_approved:{key}")
        elif gate.scope_version != config.scope_version or gate.scope_hash != config.scope_hash:
            blockers.append(f"gate_scope_mismatch:{key}")
        elif gate.gate_key in EXTERNAL_GATES and gate.configuration_version != config.version:
            blockers.append(f"gate_identity_version_mismatch:{key}")
        elif gate.expires_at and _as_utc(gate.expires_at) <= now:
            blockers.append(f"gate_expired:{key}")
        elif not _gate_metadata_is_valid(gate, now):
            blockers.append(f"gate_evidence_incomplete:{key}")
    if include_provider:
        active_profiles = (await db.execute(
            select(ManagedProviderProfile)
            .join(BusinessRelationship, BusinessRelationship.id == ManagedProviderProfile.relationship_id)
            .where(
                ManagedProviderProfile.operational_status == "active",
                ManagedProviderProfile.availability_status.in_(("available", "limited")),
                BusinessRelationship.relationship_type == "managed_provider",
                BusinessRelationship.status == "active",
            )
        )).scalars().all()
        eligible_count = 0
        for profile in active_profiles:
            capability = await db.scalar(select(ProviderCapability.id).where(
                ProviderCapability.provider_profile_id == profile.id,
                ProviderCapability.service_key.in_(ALLOWED_TASK_KEYS),
                ProviderCapability.service_area == "harish",
                ProviderCapability.is_verified.is_(True),
            ))
            if capability is not None and await provider_vetting_is_valid(db, profile.id):
                eligible_count += 1
        if eligible_count < 1:
            blockers.append("eligible_managed_provider_missing")
        if len(active_profiles) > config.max_managed_providers:
            blockers.append("managed_provider_cap_exceeded")
    if include_runtime and not settings.fulfillment_enabled:
        blockers.append("runtime_dispatch_switch_off")
    return blockers


async def require_pilot_dispatch_ready(db: AsyncSession) -> None:
    if not settings.fulfillment_enabled:
        raise RuntimeError("Fulfillment is not enabled")
    # Provider eligibility is re-evaluated against the exact provider, service,
    # area and work window by each assignment command. The global gate protects
    # the approved pilot version and evidence without replacing that check.
    blockers = await pilot_readiness_blockers(db, include_runtime=False, include_provider=True, lock=True)
    if blockers:
        raise RuntimeError("Pilot paid dispatch is blocked")
