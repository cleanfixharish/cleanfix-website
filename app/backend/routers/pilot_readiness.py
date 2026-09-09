import json
import re
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, Header, HTTPException, Response
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.pilot_identity_crypto import PilotIdentityCryptoError, encrypt_company_registration_id
from dependencies.auth import get_owner_user
from models.pilot import PilotApprovalGate, PilotConfiguration, PilotConfigurationEvent
from models.pilot import PilotTaskClassification
from models.leads import Leads
from schemas.auth import UserResponse
from services.pilot_readiness import EXTERNAL_GATES, PILOT_SCOPE_HASH, PILOT_SCOPE_VERSION, REQUIRED_GATES, TECHNICAL_GATES, _gate_metadata_is_valid, pilot_readiness_blockers

router = APIRouter(prefix="/api/v1/admin/pilot-readiness", tags=["pilot-readiness"])

PLACEHOLDER_MARKERS = ("owner to confirm", "required before activation", "enter securely", "tbd", "unknown", "n/a", "test", "example")


def _private(response: Response) -> None:
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["Pragma"] = "no-cache"


def _real_text(value: str, field_name: str) -> str:
    normalized = " ".join(value.split())
    lowered = normalized.lower()
    if len(normalized) < 2 or not any(character.isalpha() for character in normalized) or any(marker in lowered for marker in PLACEHOLDER_MARKERS) or "[" in normalized or "]" in normalized:
        raise ValueError(f"{field_name} must contain the real value, not instruction or test text")
    return normalized


def _valid_israeli_id(value: str) -> str:
    digits = re.sub(r"[\s-]", "", value)
    if not re.fullmatch(r"\d{9}", digits):
        raise ValueError("Company ID must contain exactly 9 digits")
    total = 0
    for index, character in enumerate(digits):
        product = int(character) * (1 if index % 2 == 0 else 2)
        total += product if product < 10 else product - 9
    if total % 10:
        raise ValueError("Company ID checksum is invalid")
    return digits


class PilotConfigUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    expected_version: int = Field(ge=1)
    company_legal_name: str | None = Field(default=None, max_length=200)
    company_registration_id: str | None = Field(default=None, max_length=40)
    entity_or_dealer_type: str | None = Field(default=None, pattern="^(licensed_dealer|exempt_dealer|company|partnership|other)$")
    identifier_type: str | None = Field(default=None, pattern="^(israeli_business_number)$")

    @field_validator("company_legal_name")
    @classmethod
    def legal_name_is_real(cls, value: str | None) -> str | None:
        return None if value is None else _real_text(value, "Company legal name")

    @field_validator("company_registration_id")
    @classmethod
    def company_id_is_valid(cls, value: str | None) -> str | None:
        return None if value is None else _valid_israeli_id(value)

class GateUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    expected_version: int = Field(ge=1)
    status: str = Field(pattern="^(not_started|packet_ready|submitted|questions_open|conditional|approved|rejected|expired|superseded)$")
    reviewer_name: str | None = Field(default=None, min_length=2, max_length=160)
    reviewer_role: str | None = Field(default=None, pattern="^(israeli_counsel|israeli_accountant|israeli_tax_adviser|insurance_broker|insurance_adviser|system_verifier)$")
    evidence_reference: str | None = Field(default=None, pattern=r"^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$")
    evidence_hash: str | None = Field(default=None, pattern=r"^[0-9a-fA-F]{64}$")
    notes: str | None = Field(default=None, max_length=1000)
    reviewed_at: datetime | None = None
    effective_at: datetime | None = None
    expires_at: datetime | None = None
    review_trigger: str | None = Field(default=None, min_length=3, max_length=300)
    conditions_open: bool = False

    @field_validator("reviewed_at", "effective_at", "expires_at")
    @classmethod
    def dates_are_timezone_aware(cls, value: datetime | None) -> datetime | None:
        if value is not None and value.tzinfo is None:
            raise ValueError("Decision dates must include a timezone")
        return value

    @field_validator("reviewer_name", "review_trigger")
    @classmethod
    def human_text_is_real(cls, value: str | None, info) -> str | None:
        return None if value is None else _real_text(value, info.field_name.replace("_", " "))


class PilotConfigurationResponse(BaseModel):
    scope_version: str
    scope_hash: str
    company_legal_name: str | None
    company_registration_id_configured: bool
    entity_or_dealer_type: str | None
    identifier_type: str | None
    operating_area: str
    timezone: str
    operating_days: list[str]
    opening_time: str
    closing_time: str
    weekly_job_cap: int
    max_managed_providers: int
    owner_onsite_required: bool
    version: int


class TaskClassificationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    lead_id: int = Field(ge=1)
    task_key: str = Field(pattern="^(mounting_under_5kg|flat_pack_under_25kg|cabinet_hardware)$")
    measured_weight_kg: Decimal | None = Field(default=None, ge=0, le=25)
    safety_confirmations: list[str] = Field(min_length=2, max_length=10)
    reason: str = Field(min_length=10, max_length=500)


@router.post("/task-classifications", status_code=201)
async def create_task_classification(data: TaskClassificationCreate, response: Response, db: AsyncSession = Depends(get_db), owner: UserResponse = Depends(get_owner_user)):
    _private(response)
    lead = await db.get(Leads, data.lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Customer request not found")
    required = {
        "mounting_under_5kg": {"customer_supplied_item", "feet_on_floor", "dry_interior_location", "non_utility_zone", "existing_verified_fixing", "no_wall_penetration", "no_powered_drilling", "no_new_anchors"},
        "flat_pack_under_25kg": {"customer_supplied_components", "manufacturer_instructions_available", "no_structural_anchor", "no_utilities", "no_structural_alteration", "no_two_person_lift"},
        "cabinet_hardware": {"specific_hardware_only", "no_locks_security_doors_windows_glazing", "no_utilities"},
    }[data.task_key]
    confirmations = set(data.safety_confirmations)
    if confirmations != required or len(confirmations) != len(data.safety_confirmations):
        raise HTTPException(status_code=422, detail="The exact task-specific safety confirmation set is required")
    if data.task_key in {"mounting_under_5kg", "flat_pack_under_25kg"} and data.measured_weight_kg is None:
        raise HTTPException(status_code=422, detail="A measured weight is required for this task")
    if data.task_key == "mounting_under_5kg" and data.measured_weight_kg > 5:
        raise HTTPException(status_code=422, detail="Mounting item exceeds the 5kg pilot limit")
    existing = await db.scalar(select(PilotTaskClassification.id).where(PilotTaskClassification.lead_id == data.lead_id))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Customer request already has an immutable pilot classification")
    row = PilotTaskClassification(
        lead_id=data.lead_id, task_key=data.task_key, measured_weight_kg=data.measured_weight_kg,
        safety_confirmations=json.dumps(sorted(confirmations)), scope_version=PILOT_SCOPE_VERSION,
        scope_hash=PILOT_SCOPE_HASH, reason=_real_text(data.reason, "Classification reason"), classified_by=owner.id,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return {"id": row.id, "lead_id": row.lead_id, "task_key": row.task_key, "service_area": row.service_area, "scope_version": row.scope_version}


class GateResponse(BaseModel):
    gate_key: str
    status: str
    scope_version: str
    configuration_version: int
    reviewer_name: str | None
    reviewer_role: str | None
    evidence_reference: str | None
    evidence_hash: str | None
    reviewed_at: datetime | None
    effective_at: datetime | None
    expires_at: datetime | None
    review_trigger: str | None
    conditions_open: bool
    is_current_valid: bool
    version: int
    model_config = ConfigDict(from_attributes=True)


async def _load(db: AsyncSession) -> tuple[PilotConfiguration, list[PilotApprovalGate]]:
    config = await db.get(PilotConfiguration, 1)
    if config is None:
        raise HTTPException(status_code=503, detail="Pilot configuration migration is not available")
    gates = (await db.execute(select(PilotApprovalGate).order_by(PilotApprovalGate.gate_key))).scalars().all()
    return config, list(gates)


def _config_response(config: PilotConfiguration) -> PilotConfigurationResponse:
    return PilotConfigurationResponse(
        scope_version=config.scope_version, scope_hash=config.scope_hash,
        company_legal_name=config.company_legal_name,
        company_registration_id_configured=bool(config.encrypted_company_registration_id),
        entity_or_dealer_type=config.entity_or_dealer_type,
        identifier_type=config.identifier_type,
        operating_area=config.operating_area, timezone=config.timezone,
        operating_days=config.operating_days.split(","), opening_time=config.opening_time,
        closing_time=config.closing_time, weekly_job_cap=config.weekly_job_cap,
        max_managed_providers=config.max_managed_providers,
        owner_onsite_required=config.owner_onsite_required, version=config.version,
    )


def _gate_snapshot(gate: PilotApprovalGate) -> str:
    return json.dumps({
        "status": gate.status, "scope_version": gate.scope_version,
        "scope_hash": gate.scope_hash, "configuration_version": gate.configuration_version,
        "reviewer_name": gate.reviewer_name, "reviewer_role": gate.reviewer_role,
        "evidence_reference": gate.evidence_reference, "evidence_hash": gate.evidence_hash,
        "reviewed_at": gate.reviewed_at.isoformat() if gate.reviewed_at else None,
        "effective_at": gate.effective_at.isoformat() if gate.effective_at else None,
        "expires_at": gate.expires_at.isoformat() if gate.expires_at else None,
        "review_trigger": gate.review_trigger, "conditions_open": gate.conditions_open,
    }, sort_keys=True)


def _gate_is_current_valid(gate: PilotApprovalGate, config: PilotConfiguration, now: datetime) -> bool:
    return bool(
        gate.status == "approved"
        and gate.scope_version == config.scope_version
        and gate.scope_hash == config.scope_hash
        and (gate.gate_key not in EXTERNAL_GATES or gate.configuration_version == config.version)
        and (not gate.expires_at or gate.expires_at.replace(tzinfo=gate.expires_at.tzinfo or timezone.utc) > now)
        and _gate_metadata_is_valid(gate, now)
    )


def _gate_response(gate: PilotApprovalGate, config: PilotConfiguration, now: datetime | None = None) -> GateResponse:
    payload = {column.name: getattr(gate, column.name) for column in PilotApprovalGate.__table__.columns}
    payload["is_current_valid"] = _gate_is_current_valid(gate, config, now or datetime.now(timezone.utc))
    return GateResponse.model_validate(payload)


@router.get("", response_model=dict)
async def get_pilot_readiness(response: Response, db: AsyncSession = Depends(get_db), _owner: UserResponse = Depends(get_owner_user)):
    _private(response)
    config, gates = await _load(db)
    blockers = await pilot_readiness_blockers(db)
    return {
        "configuration": _config_response(config).model_dump(),
        "gates": [_gate_response(gate, config).model_dump() for gate in gates],
        "blockers": blockers,
        "approved_gate_count": sum(
            _gate_is_current_valid(gate, config, datetime.now(timezone.utc))
            for gate in gates
        ),
        "required_gate_count": len(REQUIRED_GATES),
        "paid_dispatch_ready": not blockers,
        "runtime_dispatch_enabled": "runtime_dispatch_switch_off" not in blockers,
    }


@router.put("/configuration", response_model=PilotConfigurationResponse)
async def update_pilot_configuration(data: PilotConfigUpdate, response: Response, db: AsyncSession = Depends(get_db), owner: UserResponse = Depends(get_owner_user)):
    _private(response)
    config, _ = await _load(db)
    config = await db.scalar(select(PilotConfiguration).where(PilotConfiguration.id == 1).with_for_update())
    if config.version != data.expected_version:
        raise HTTPException(status_code=409, detail="Pilot configuration changed; refresh before saving")
    changed: list[str] = []
    values = data.model_dump(exclude={"expected_version", "company_registration_id"}, exclude_unset=True)
    for key, value in values.items():
        if getattr(config, key) != value:
            setattr(config, key, value)
            changed.append(key)
    if "company_registration_id" in data.model_fields_set and data.company_registration_id is not None:
        try:
            config.encrypted_company_registration_id = encrypt_company_registration_id(data.company_registration_id)
        except PilotIdentityCryptoError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        changed.append("company_registration_id")
    if changed:
        config.version += 1
        config.updated_by = owner.id
        db.add(PilotConfigurationEvent(event_type="configuration_updated", actor_id=owner.id, target_key=PILOT_SCOPE_VERSION, changed_fields=json.dumps(sorted(set(changed))), resulting_version=config.version, scope_hash=config.scope_hash))
        if set(changed) & {"company_legal_name", "company_registration_id", "entity_or_dealer_type", "identifier_type"}:
            approved_gates = (await db.execute(select(PilotApprovalGate).where(
                PilotApprovalGate.status == "approved", PilotApprovalGate.gate_key.in_(EXTERNAL_GATES),
            ).with_for_update())).scalars().all()
            for gate in approved_gates:
                previous_snapshot = _gate_snapshot(gate)
                gate.status = "superseded"
                gate.version += 1
                gate.updated_by = owner.id
                db.add(PilotConfigurationEvent(
                    event_type="gate_updated", actor_id=owner.id, target_key=gate.gate_key,
                    changed_fields='["status"]', previous_status="approved", new_status="superseded",
                    scope_hash=gate.scope_hash, evidence_hash=gate.evidence_hash,
                    previous_snapshot=previous_snapshot, new_snapshot=_gate_snapshot(gate),
                    resulting_version=gate.version,
                ))
        await db.commit()
        await db.refresh(config)
    return _config_response(config)


@router.put("/gates/{gate_key}", response_model=GateResponse)
async def update_pilot_gate(gate_key: str, data: GateUpdate, response: Response, db: AsyncSession = Depends(get_db), owner: UserResponse = Depends(get_owner_user)):
    _private(response)
    if gate_key not in REQUIRED_GATES:
        raise HTTPException(status_code=404, detail="Pilot gate not found")
    if gate_key in TECHNICAL_GATES:
        raise HTTPException(status_code=403, detail="Technical gates can only be recorded by verified system evidence")
    config = await db.scalar(select(PilotConfiguration).where(PilotConfiguration.id == 1).with_for_update())
    if config is None:
        raise HTTPException(status_code=503, detail="Pilot configuration migration is not available")
    gate = await db.scalar(select(PilotApprovalGate).where(PilotApprovalGate.gate_key == gate_key).with_for_update())
    if gate.version != data.expected_version:
        raise HTTPException(status_code=409, detail="Pilot gate changed; refresh before saving")
    now = datetime.now(timezone.utc)
    identity_bound_statuses = {"submitted", "questions_open", "conditional", "approved", "rejected", "expired", "superseded"}
    if data.status in identity_bound_statuses and not all((config.company_legal_name, config.encrypted_company_registration_id, config.entity_or_dealer_type, config.identifier_type)):
        raise HTTPException(status_code=409, detail="Final legal identity is required before this gate state can be recorded")
    if data.status == "approved" and not all((data.reviewer_name, data.reviewer_role, data.evidence_reference, data.evidence_hash, data.reviewed_at, data.effective_at, data.review_trigger)):
        raise HTTPException(status_code=422, detail="Approved gates require reviewer, role, evidence reference/hash, review/effective dates, and review trigger")
    if data.status == "approved" and (data.conditions_open or data.reviewed_at > now or data.effective_at > now or data.expires_at and data.expires_at <= now):
        raise HTTPException(status_code=422, detail="Approved gates cannot have open conditions, future decision dates, or an expired approval")
    expected_roles = (
        {"israeli_counsel"} if gate_key.startswith("LEGAL_") else
        {"israeli_accountant", "israeli_tax_adviser"} if gate_key.startswith("ACCOUNT_") else
        {"insurance_broker", "insurance_adviser"}
    )
    if data.status == "approved" and data.reviewer_role not in expected_roles:
        raise HTTPException(status_code=422, detail="Reviewer discipline does not match this approval gate")
    previous_snapshot = _gate_snapshot(gate)
    previous_status = gate.status
    changed = [key for key, value in data.model_dump(exclude={"expected_version"}).items() if getattr(gate, key) != value]
    for key, value in data.model_dump(exclude={"expected_version"}).items():
        setattr(gate, key, value)
    gate.scope_version = config.scope_version
    gate.scope_hash = config.scope_hash
    gate.configuration_version = config.version
    gate.version += 1
    gate.updated_by = owner.id
    db.add(PilotConfigurationEvent(event_type="gate_updated", actor_id=owner.id, target_key=gate_key, changed_fields=json.dumps(sorted(changed)), previous_status=previous_status, new_status=gate.status, scope_hash=gate.scope_hash, evidence_hash=gate.evidence_hash, previous_snapshot=previous_snapshot, new_snapshot=_gate_snapshot(gate), resulting_version=gate.version))
    await db.commit()
    await db.refresh(gate)
    return _gate_response(gate, config)
