import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from fastapi import HTTPException, Response
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from core.database import Base
from core.pilot_identity_crypto import PilotIdentityCryptoError, encrypt_company_registration_id
from models.fulfillment import ManagedProviderProfile, ProviderCapability, ProviderVettingItem
from models.auth import User
from models.business_relationship import BusinessRelationship
from models.jobs import Jobs
from models.leads import Leads
from models.pilot import PilotApprovalGate, PilotConfiguration, PilotConfigurationEvent, PilotTaskClassification
from routers.pilot_readiness import PilotConfigUpdate, TaskClassificationCreate, _config_response, _private, _valid_israeli_id, create_task_classification
from routers.pilot_readiness import router as pilot_router
from dependencies.auth import get_owner_user
from schemas.auth import UserResponse
from services.fulfillment import FulfillmentConflict, _require_pilot_job_scope
from services.pilot_readiness import PILOT_SCOPE_HASH, PILOT_SCOPE_VERSION, REQUIRED_GATES, pilot_readiness_blockers, require_pilot_dispatch_ready
from services.provider_vetting import provider_vetting_is_valid


def test_scope_hash_is_bound_to_reviewed_pilot_document():
    document = Path(__file__).resolve().parents[3] / "docs" / "operations" / "PILOT_HOME_VISIT_V1.md"
    canonical = document.read_text(encoding="utf-8").replace("\r\n", "\n").replace("\r", "\n")
    assert hashlib.sha256(canonical.encode()).hexdigest() == PILOT_SCOPE_HASH


def test_placeholder_text_and_invalid_ids_are_rejected():
    base = dict(expected_version=1)
    for text in ("Company legal name — required before activation", "[OWNER TO CONFIRM]", "test company"):
        with pytest.raises(ValidationError):
            PilotConfigUpdate(company_legal_name=text, **base)
    for text in ("00", "--"):
        with pytest.raises(ValidationError):
            PilotConfigUpdate(company_legal_name=text, **base)
    with pytest.raises(ValueError):
        _valid_israeli_id("123456789")


def test_private_response_headers_and_identifier_is_presence_only():
    response = Response()
    _private(response)
    assert response.headers["Cache-Control"] == "private, no-store"
    config = PilotConfiguration(
        id=1, scope_version=PILOT_SCOPE_VERSION, scope_hash=PILOT_SCOPE_HASH,
        encrypted_company_registration_id="ciphertext", operating_days="monday,tuesday",
        operating_area="Harish", timezone="Asia/Jerusalem", opening_time="09:00",
        closing_time="17:00", weekly_job_cap=3, max_managed_providers=2,
        owner_onsite_required=True, version=1,
    )
    payload = _config_response(config).model_dump()
    assert payload["company_registration_id_configured"] is True
    assert "encrypted_company_registration_id" not in payload


def test_identity_encryption_fails_closed_and_hides_plaintext(monkeypatch):
    monkeypatch.setattr("core.pilot_identity_crypto.settings.pilot_identity_encryption_key", "")
    with pytest.raises(PilotIdentityCryptoError):
        encrypt_company_registration_id("123456782")
    monkeypatch.setattr("core.pilot_identity_crypto.settings.pilot_identity_encryption_key", "test-only-pilot-identity-key-at-least-32-chars")
    ciphertext = encrypt_company_registration_id("123456782")
    assert "123456782" not in ciphertext


@pytest.mark.asyncio
async def test_readiness_is_fail_closed_and_requires_database_and_runtime(monkeypatch):
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    tables = [User.__table__, BusinessRelationship.__table__, ManagedProviderProfile.__table__, ProviderCapability.__table__, ProviderVettingItem.__table__, PilotConfiguration.__table__, PilotApprovalGate.__table__]
    async with engine.begin() as connection:
        await connection.run_sync(lambda sync: Base.metadata.create_all(sync, tables=tables))
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as db:
        assert await pilot_readiness_blockers(db) == ["pilot_configuration_missing"]
        config = PilotConfiguration(id=1, scope_version=PILOT_SCOPE_VERSION, scope_hash=PILOT_SCOPE_HASH)
        db.add(config)
        db.add_all([PilotApprovalGate(gate_key=key, scope_version=PILOT_SCOPE_VERSION, scope_hash=PILOT_SCOPE_HASH) for key in REQUIRED_GATES])
        await db.commit()
        blockers = await pilot_readiness_blockers(db)
        assert "company_legal_name_missing" in blockers
        assert "company_registration_id_missing" in blockers
        assert "runtime_dispatch_switch_off" in blockers
        monkeypatch.setattr("services.pilot_readiness.settings.fulfillment_enabled", True)
        with pytest.raises(RuntimeError, match="blocked"):
            await require_pilot_dispatch_ready(db)
    await engine.dispose()


def test_pilot_audit_events_never_have_identity_value_column():
    assert "company_registration_id" not in PilotConfigurationEvent.__table__.columns
    assert set(PilotConfigurationEvent.__table__.columns.keys()) >= {"actor_id", "changed_fields", "resulting_version"}


def test_every_pilot_route_is_owner_only():
    for route in pilot_router.routes:
        assert any(dependency.call is get_owner_user for dependency in route.dependant.dependencies), route.path


@pytest.mark.asyncio
async def test_delegated_admin_is_not_the_owner(monkeypatch):
    monkeypatch.setenv("ADMIN_USER_EMAIL", "owner@example.invalid")
    with pytest.raises(HTTPException) as exc:
        await get_owner_user(UserResponse(id="delegated", email="admin@example.invalid", role="admin"))
    assert exc.value.status_code == 403


def test_out_of_scope_job_is_rejected_again_at_assignment_boundary():
    with pytest.raises(FulfillmentConflict, match="outside"):
        _require_pilot_job_scope(Jobs(customer_name="Synthetic", title="Cleaning", service_key="cleaning", service_area="harish"))


@pytest.mark.asyncio
async def test_provider_vetting_rejects_wrong_role_future_and_malformed_evidence():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    tables = [BusinessRelationship.__table__, ManagedProviderProfile.__table__, ProviderVettingItem.__table__]
    async with engine.begin() as connection:
        await connection.run_sync(lambda sync: Base.metadata.create_all(sync, tables=tables))
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    now = datetime.now(timezone.utc)
    roles = {"identity_check": "identity_verifier", "provider_agreement": "contract_reviewer", "invoice_capability": "accountant", "insurance": "insurance_broker"}
    async with sessions() as db:
        relationship = BusinessRelationship(user_id="provider", relationship_type="managed_provider", status="active")
        db.add(relationship)
        await db.flush()
        profile = ManagedProviderProfile(relationship_id=relationship.id, display_name="Provider")
        db.add(profile)
        await db.flush()
        items = []
        for key, role in roles.items():
            item = ProviderVettingItem(
                provider_profile_id=profile.id, requirement_key=key, status="approved",
                reviewed_by="owner", reviewed_at=now, effective_at=now, reviewer_role=role,
                evidence_reference=f"PROVIDER-{key}", evidence_hash="a" * 64,
                scope_version=PILOT_SCOPE_VERSION, scope_hash=PILOT_SCOPE_HASH,
                review_trigger="Review on expiry or scope change", conditions_open=False,
                expires_at=now + timedelta(days=30),
            )
            items.append(item)
            db.add(item)
        await db.commit()
        assert await provider_vetting_is_valid(db, profile.id)
        items[0].reviewer_role = "insurance_broker"
        await db.commit()
        assert not await provider_vetting_is_valid(db, profile.id)
        items[0].reviewer_role = "identity_verifier"
        items[1].effective_at = now + timedelta(days=1)
        await db.commit()
        assert not await provider_vetting_is_valid(db, profile.id)
        items[1].effective_at = now
        items[2].evidence_hash = "not-a-sha256"
        await db.commit()
        assert not await provider_vetting_is_valid(db, profile.id)
    await engine.dispose()


@pytest.mark.asyncio
async def test_task_classification_is_lead_bound_immutable_and_requires_exact_confirmations():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(lambda sync: Base.metadata.create_all(sync, tables=[Leads.__table__, PilotTaskClassification.__table__]))
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    owner = UserResponse(id="owner", email="owner@example.invalid", role="admin")
    exact = ["customer_supplied_item", "feet_on_floor", "dry_interior_location", "non_utility_zone", "existing_verified_fixing", "no_wall_penetration", "no_powered_drilling", "no_new_anchors"]
    async with sessions() as db:
        lead = Leads(customer_name="Customer", phone="000", area="harish", service_requested="mount a supplied item")
        db.add(lead)
        await db.commit()
        await db.refresh(lead)
        base = dict(lead_id=lead.id, task_key="mounting_under_5kg", measured_weight_kg="4.5", reason="Owner measured and verified the narrow task")
        with pytest.raises(HTTPException, match="exact"):
            await create_task_classification(TaskClassificationCreate(**base, safety_confirmations=exact[:-1]), Response(), db, owner)
        result = await create_task_classification(TaskClassificationCreate(**base, safety_confirmations=exact), Response(), db, owner)
        assert result["lead_id"] == lead.id
        with pytest.raises(HTTPException) as duplicate:
            await create_task_classification(TaskClassificationCreate(**base, safety_confirmations=exact), Response(), db, owner)
        assert duplicate.value.status_code == 409
    await engine.dispose()
