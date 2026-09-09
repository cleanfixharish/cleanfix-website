from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from core.database import Base
from models.business_relationship import BusinessRelationship
from models.fulfillment import ManagedProviderProfile, ProviderCapability, ProviderCapabilityDecision
from routers.fulfillment import CapabilityDecisionCommand, CapabilityStopCommand, add_capability_decision, stop_capability_decision
from schemas.auth import UserResponse
from services.pilot_tasks import CAPABILITY_ACKNOWLEDGEMENTS
from services.provider_capability import provider_capability_is_valid


def _approval(profile_id: int, now: datetime, **overrides):
    values = {
        "service_key": "mounting_under_5kg", "status": "eligible_supervised",
        "assessment_method": "supervised_trial", "assessment_result": "passed",
        "evidence_reference": "CAPABILITY-2026-001", "evidence_hash": "a" * 64,
        "assessor_name": "Owner Supervisor", "assessor_role": "owner_supervisor",
        "assessed_at": now, "effective_at": now, "expires_at": now + timedelta(days=30),
        "review_trigger": "Scope, incident, policy, or expiry change", "conditions_open": False,
        "supervision_only": True, "safety_acknowledgements": sorted(CAPABILITY_ACKNOWLEDGEMENTS),
        "decision_reason": "Observed supervised trial passed safely", "supersedes_id": None,
    }
    values.update(overrides)
    return CapabilityDecisionCommand(**values)


@pytest.mark.asyncio
async def test_capability_history_is_evidence_bound_idempotent_and_stoppable(monkeypatch):
    monkeypatch.setattr("routers.fulfillment.settings.fulfillment_setup_enabled", True)
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    tables = [BusinessRelationship.__table__, ManagedProviderProfile.__table__, ProviderCapability.__table__, ProviderCapabilityDecision.__table__]
    async with engine.begin() as connection:
        await connection.run_sync(lambda sync: Base.metadata.create_all(sync, tables=tables))
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    owner = UserResponse(id="owner", email="owner@example.invalid", role="admin")
    now = datetime.now(timezone.utc)
    async with sessions() as db:
        relationship = BusinessRelationship(user_id="provider", relationship_type="managed_provider", status="active")
        db.add(relationship)
        await db.flush()
        profile = ManagedProviderProfile(relationship_id=relationship.id, display_name="Provider")
        db.add(profile)
        await db.flush()
        db.add(ProviderCapability(provider_profile_id=profile.id, service_key="mounting_under_5kg", service_area="harish", is_verified=True))
        await db.commit()
        assert not await provider_capability_is_valid(db, profile.id, "mounting_under_5kg")

        confirmations = sorted(CAPABILITY_ACKNOWLEDGEMENTS)
        bad = _approval(profile.id, now, safety_acknowledgements=confirmations[:-1] + [confirmations[0]])
        with pytest.raises(HTTPException) as missing_confirmation:
            await add_capability_decision(profile.id, bad, Response(), "cap-bad-0001", db, owner)
        assert missing_confirmation.value.status_code == 422

        command = _approval(profile.id, now)
        created = await add_capability_decision(profile.id, command, Response(), "cap-good-0001", db, owner)
        replay = await add_capability_decision(profile.id, command, Response(), "cap-good-0001", db, owner)
        assert created["id"] == replay["id"]
        assert await provider_capability_is_valid(db, profile.id, "mounting_under_5kg")
        changed = _approval(profile.id, now, decision_reason="A different decision reason")
        with pytest.raises(HTTPException) as mismatch:
            await add_capability_decision(profile.id, changed, Response(), "cap-good-0001", db, owner)
        assert mismatch.value.status_code == 409

        stop = CapabilityStopCommand(
            status="suspended", service_key="mounting_under_5kg", supersedes_id=created["id"],
            decision_reason="Immediate safety hold pending review",
        )
        stopped = await stop_capability_decision(profile.id, stop, Response(), "cap-stop-0001", db, owner)
        assert stopped["status"] == "suspended"
        assert not await provider_capability_is_valid(db, profile.id, "mounting_under_5kg")
        assert await db.scalar(select(func.count(ProviderCapabilityDecision.id))) == 2

        with pytest.raises(HTTPException) as stale:
            await stop_capability_decision(profile.id, stop, Response(), "cap-stop-0002", db, owner)
        assert stale.value.status_code == 409

        renewed = _approval(profile.id, now, evidence_reference="CAPABILITY-2026-002", supersedes_id=stopped["id"])
        replacement = await add_capability_decision(profile.id, renewed, Response(), "cap-good-0002", db, owner)
        assert replacement["id"] != created["id"]
        assert await provider_capability_is_valid(db, profile.id, "mounting_under_5kg")
    await engine.dispose()
