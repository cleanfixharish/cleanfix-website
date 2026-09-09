from datetime import datetime, timedelta, timezone
from decimal import Decimal
import json
from zoneinfo import ZoneInfo

import pytest
from fastapi import HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from core.database import Base
from core.config import Settings
from core.private_data_crypto import PrivateDataCryptoError, decrypt_private_payload, encrypt_private_payload
from models.auth import User  # registers the relationship FK target
from models.bookings import Booking, BookingEvent
from models.business_relationship import BusinessRelationship
from models.fulfillment import AssignmentOffer, AssignmentOfferEvent, ManagedProviderProfile, ProviderCapability, ProviderCapabilityDecision, ProviderVettingItem, ServiceLocation, ServiceLocationEvent
from models.jobs import Jobs
from models.leads import Leads
from models.pricing import ServiceQuote  # registers the booking/job FK target
from models.pilot import PilotApprovalGate, PilotConfiguration, PilotTaskClassification
from routers.fulfillment import (
    _private, list_assignment_offers, list_provider_profiles,
    require_fulfillment_controls_enabled, require_fulfillment_enabled, require_fulfillment_setup_enabled,
)
from routers.jobs import JobData, create_job
from schemas.auth import UserResponse
from services.fulfillment import REQUIRED_PILOT_VETTING, FulfillmentConflict, FulfillmentNotFound, FulfillmentService, _offer_authorization_matches, provider_is_eligible
from services.pilot_readiness import PILOT_SCOPE_HASH, PILOT_SCOPE_VERSION, REQUIRED_GATES
from services.pilot_tasks import CAPABILITY_ACKNOWLEDGEMENTS, CAPABILITY_CONFIRMATION_SET_VERSION, TASK_DEFINITION_VERSION, confirmation_set_hash, task_definition_hash


def test_fulfillment_constraints_enforce_one_job_and_one_open_offer():
    job_constraints = {item.name for item in Jobs.__table__.constraints}
    offer_constraints = {item.name for item in AssignmentOffer.__table__.constraints}
    offer_indexes = {item.name for item in AssignmentOffer.__table__.indexes}
    assert any(item.unique and {column.name for column in item.columns} == {"booking_id"} for item in Jobs.__table__.indexes)
    assert "uq_assignment_offers_job_sequence" in offer_constraints
    assert {"uq_assignment_offers_one_open", "uq_assignment_offers_one_confirmed"} <= offer_indexes


def test_private_fulfillment_responses_are_not_cacheable():
    response = Response()
    _private(response)
    assert response.headers["Cache-Control"] == "private, no-store"
    assert response.headers["Pragma"] == "no-cache"


def test_private_location_encryption_fails_closed_and_never_stores_plaintext(monkeypatch):
    monkeypatch.setattr("core.private_data_crypto.settings.service_location_encryption_key", "")
    with pytest.raises(PrivateDataCryptoError):
        encrypt_private_payload({"exact_address": "Synthetic 1", "access_instructions": None})
    monkeypatch.setattr("core.private_data_crypto.settings.service_location_encryption_key", "test-only-secret-with-at-least-thirty-two-characters")
    ciphertext = encrypt_private_payload({"exact_address": "Synthetic 1", "access_instructions": "Gate B"})
    assert "Synthetic 1" not in ciphertext and "Gate B" not in ciphertext
    assert decrypt_private_payload(ciphertext)["exact_address"] == "Synthetic 1"


def test_fulfillment_dispatch_defaults_disabled(monkeypatch):
    monkeypatch.setattr("routers.fulfillment.settings.fulfillment_enabled", False)
    with pytest.raises(HTTPException) as exc:
        require_fulfillment_enabled()
    assert exc.value.status_code == 503
    monkeypatch.setattr("routers.fulfillment.settings.fulfillment_setup_enabled", False)
    with pytest.raises(HTTPException) as setup_exc:
        require_fulfillment_setup_enabled()
    assert setup_exc.value.status_code == 503
    monkeypatch.setattr("routers.fulfillment.settings.fulfillment_enabled", True)
    require_fulfillment_controls_enabled()


@pytest.mark.parametrize(("raw", "enabled"), [(None, False), ("false", False), ("0", False), ("true", True)])
def test_fulfillment_environment_flags_are_strictly_parsed(monkeypatch, raw, enabled):
    if raw is None:
        monkeypatch.delenv("FULFILLMENT_ENABLED", raising=False)
    else:
        monkeypatch.setenv("FULFILLMENT_ENABLED", raw)
    if raw is None:
        monkeypatch.delenv("FULFILLMENT_SETUP_ENABLED", raising=False)
    else:
        monkeypatch.setenv("FULFILLMENT_SETUP_ENABLED", raw)
    parsed = Settings()
    assert parsed.fulfillment_enabled is enabled
    assert parsed.fulfillment_setup_enabled is enabled


@pytest.mark.asyncio
async def test_manual_job_creation_is_retired_only_when_fulfillment_is_enabled(monkeypatch):
    monkeypatch.setattr("routers.jobs.settings.fulfillment_enabled", True)
    with pytest.raises(HTTPException) as exc:
        await create_job(
            JobData(customer_name="Synthetic", title="Synthetic"),
            db=None,
            owner=UserResponse(id="owner", email="owner@example.invalid", role="admin"),
            idempotency_key="manual-job-test",
        )
    assert exc.value.status_code == 405


@pytest.mark.asyncio
async def test_guarded_flow_reaches_in_progress_and_replay_is_idempotent(monkeypatch):
    async def no_ledger_event(*_args, **_kwargs):
        return None

    monkeypatch.setattr("services.fulfillment._append_job_event", no_ledger_event)
    monkeypatch.setattr("services.fulfillment.settings.fulfillment_enabled", True)
    monkeypatch.setattr("core.private_data_crypto.settings.service_location_encryption_key", "test-only-secret-with-at-least-thirty-two-characters")
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    tables = [
        Leads.__table__, Booking.__table__, BookingEvent.__table__,
        BusinessRelationship.__table__, ManagedProviderProfile.__table__,
            ProviderCapability.__table__, ProviderVettingItem.__table__, Jobs.__table__,
            ProviderCapabilityDecision.__table__,
        AssignmentOffer.__table__, AssignmentOfferEvent.__table__, ServiceLocation.__table__,
            ServiceLocationEvent.__table__,
                PilotConfiguration.__table__, PilotApprovalGate.__table__,
                PilotTaskClassification.__table__,
    ]
    async with engine.begin() as connection:
        await connection.run_sync(lambda sync: Base.metadata.create_all(sync, tables=tables))
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    now = datetime.now(timezone.utc)
    local_candidate = (now.astimezone(ZoneInfo("Asia/Jerusalem")) + timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0)
    while local_candidate.weekday() > 3:
        local_candidate += timedelta(days=1)
    scheduled_start = local_candidate.astimezone(timezone.utc)
    scheduled_end = scheduled_start + timedelta(hours=2)
    async with sessions() as db:
        lead = Leads(customer_name="Synthetic Customer", phone="000", area="harish", service_requested="mounting_under_5kg")
        relationship = BusinessRelationship(user_id="provider-user", relationship_type="managed_provider", status="active")
        db.add_all([lead, relationship])
        await db.flush()
        booking = Booking(
            quote_id=1, lead_id=lead.id, status="awaiting_schedule",
            quoted_total_snapshot=Decimal("500"), deposit_required_snapshot=None,
            scope_snapshot="Synthetic scope", version=1,
        )
        profile = ManagedProviderProfile(
            relationship_id=relationship.id, display_name="Synthetic Provider",
            operational_status="active", availability_status="available",
        )
        db.add_all([booking, profile])
        await db.flush()
        db.add(PilotTaskClassification(
            lead_id=lead.id, task_key="mounting_under_5kg", service_area="harish",
            measured_weight_kg=Decimal("4.5"),
            safety_confirmations='["customer_supplied_item","feet_on_floor","fixing_method_verified"]',
            scope_version=PILOT_SCOPE_VERSION, scope_hash=PILOT_SCOPE_HASH,
            reason="Synthetic owner-reviewed classification", classified_by="owner",
        ))
        db.add(PilotConfiguration(
            id=1, scope_version=PILOT_SCOPE_VERSION, scope_hash=PILOT_SCOPE_HASH,
            company_legal_name="Synthetic Registered Business",
            encrypted_company_registration_id="test-ciphertext",
            entity_or_dealer_type="licensed_dealer", identifier_type="israeli_business_number",
        ))
        db.add_all([
            PilotApprovalGate(
                gate_key=key, status="approved", scope_version=PILOT_SCOPE_VERSION,
                scope_hash=PILOT_SCOPE_HASH, reviewer_name="Synthetic Reviewer",
                reviewer_role="system_verifier" if key.startswith("SYSTEM_") else "israeli_counsel" if key.startswith("LEGAL_") else "israeli_accountant" if key.startswith("ACCOUNT_") else "insurance_broker", evidence_reference=f"TEST-{key}",
                evidence_hash="a" * 64, reviewed_at=now, effective_at=now,
                review_trigger="Review on scope change", conditions_open=False,
            ) for key in REQUIRED_GATES
        ])
        db.add(ProviderCapability(provider_profile_id=profile.id, service_key="mounting_under_5kg", service_area="harish", is_verified=True))
        db.add(ProviderCapabilityDecision(
            provider_profile_id=profile.id, service_key="mounting_under_5kg", service_area="harish",
            status="eligible_supervised", assessment_method="supervised_trial", assessment_result="passed",
            evidence_reference="CAPABILITY-TEST", evidence_hash="c" * 64,
            assessor_name="Owner Supervisor", assessor_role="owner_supervisor", assessed_at=now, effective_at=now,
            expires_at=now + timedelta(days=30), review_trigger="Review on scope or incident change",
            conditions_open=False, supervision_only=True, safety_acknowledgements=json.dumps(sorted(CAPABILITY_ACKNOWLEDGEMENTS)),
            scope_version=PILOT_SCOPE_VERSION, scope_hash=PILOT_SCOPE_HASH,
            task_definition_hash=task_definition_hash("mounting_under_5kg"), task_definition_version=TASK_DEFINITION_VERSION,
            confirmation_set_version=CAPABILITY_CONFIRMATION_SET_VERSION, confirmation_set_hash=confirmation_set_hash(),
            decision_reason="Observed supervised trial passed", recorded_by="owner",
            idempotency_key="capability-test-key", command_hash="d" * 64,
        ))
        db.add_all([
            ProviderVettingItem(
                provider_profile_id=profile.id, requirement_key=key, status="approved",
                expires_at=now + timedelta(days=30), reviewed_by="owner",
                reviewed_at=now, effective_at=now,
                reviewer_role="identity_verifier" if key == "identity_check" else "contract_reviewer" if key == "provider_agreement" else "accountant" if key == "invoice_capability" else "insurance_broker",
                evidence_reference=f"PROVIDER-{key}", evidence_hash="b" * 64,
                scope_version=PILOT_SCOPE_VERSION, scope_hash=PILOT_SCOPE_HASH,
                review_trigger="Review on expiry or scope change", conditions_open=False,
            )
            for key in REQUIRED_PILOT_VETTING
        ])
        await db.commit()

        insurance = await db.scalar(select(ProviderVettingItem).where(
            ProviderVettingItem.provider_profile_id == profile.id,
            ProviderVettingItem.requirement_key == "insurance",
        ))
        insurance.expires_at = now + timedelta(hours=12)
        await db.commit()
        assert not await provider_is_eligible(
            db, profile.id, "mounting_under_5kg", "harish",
            required_through=scheduled_end,
        )
        insurance.expires_at = now + timedelta(days=30)
        await db.commit()

        service = FulfillmentService(db)
        with pytest.raises(FulfillmentConflict):
            await service.confirm_booking_schedule(
                booking.id, start=now - timedelta(minutes=1), end=now + timedelta(hours=1),
                timezone_name="Asia/Jerusalem", expected_version=1,
                actor_id="owner", idempotency_key="past-schedule-key",
            )
        with pytest.raises(FulfillmentConflict):
            await service.confirm_booking_schedule(
                booking.id, start=scheduled_start, end=scheduled_start + timedelta(hours=13),
                timezone_name="Asia/Jerusalem", expected_version=1,
                actor_id="owner", idempotency_key="long-schedule-key",
            )
        with pytest.raises(FulfillmentConflict):
            await service.confirm_booking_schedule(
                booking.id, start=scheduled_start, end=scheduled_end,
                timezone_name="UTC", expected_version=1,
                actor_id="owner", idempotency_key="timezone-schedule-key",
            )
        booking, job = await service.confirm_booking_schedule(
            booking.id, start=scheduled_start, end=scheduled_end,
            timezone_name="Asia/Jerusalem",
            expected_version=1, actor_id="owner", idempotency_key="schedule-key-1",
        )
        replay_booking, replay_job = await service.confirm_booking_schedule(
            booking.id, start=scheduled_start, end=scheduled_end,
            timezone_name="Asia/Jerusalem",
            expected_version=1, actor_id="owner", idempotency_key="schedule-key-1",
        )
        assert booking.status == "confirmed"
        assert replay_booking.id == booking.id and replay_job.id == job.id
        assert job.service_key == "mounting_under_5kg" and job.service_area == "harish"
        with pytest.raises(FulfillmentConflict):
            await service.confirm_booking_schedule(
                booking.id, start=scheduled_start, end=scheduled_start + timedelta(hours=3),
                timezone_name="Asia/Jerusalem", expected_version=1,
                actor_id="owner", idempotency_key="schedule-key-1",
            )
        assert await provider_is_eligible(
            db, profile.id, "mounting_under_5kg", "harish",
            required_through=scheduled_end,
        )

        location = await service.set_service_location(
            booking.id, exact_address="Synthetic Street 10", access_instructions="Gate B",
            expected_version=0, actor_id="owner", idempotency_key="location-key-001",
        )
        assert "Synthetic Street 10" not in location.encrypted_payload
        replay_location = await service.set_service_location(
            booking.id, exact_address="Synthetic Street 10", access_instructions="Gate B",
            expected_version=0, actor_id="owner", idempotency_key="location-key-001",
        )
        assert replay_location.id == location.id
        with pytest.raises(FulfillmentConflict):
            await service.set_service_location(
                booking.id, exact_address="Different Address 11", access_instructions="Gate B",
                expected_version=0, actor_id="owner", idempotency_key="location-key-001",
            )
        owner_location, owner_payload = await service.owner_access_service_location(booking.id, actor_id="owner")
        assert owner_location.id == location.id and owner_payload["exact_address"] == "Synthetic Street 10"
        with pytest.raises(FulfillmentNotFound):
            await service.provider_access_service_location(
                job.id, relationship_id=relationship.id, actor_id="provider-user",
            )

        offer = await service.create_offer(
            job.id, provider_profile_id=profile.id, provider_payout=Decimal("300"),
            response_deadline=now + timedelta(hours=1), instructions=None,
            expected_job_version=1, actor_id="owner", idempotency_key="offer-key-001",
        )
        created_event = await db.scalar(select(AssignmentOfferEvent).where(
            AssignmentOfferEvent.offer_id == offer.id,
            AssignmentOfferEvent.event_type == "offer_created",
        ))
        assert created_event.capability_decision_id == offer.capability_decision_id
        assert created_event.capability_task_definition_hash == offer.capability_task_definition_hash
        assert created_event.capability_evidence_hash == offer.capability_evidence_hash
        assert created_event.service_key_snapshot == offer.service_key
        assert created_event.service_area_snapshot == offer.service_area
        assert created_event.window_start_snapshot.replace(tzinfo=timezone.utc) == offer.window_start
        assert created_event.window_end_snapshot.replace(tzinfo=timezone.utc) == offer.window_end
        replay_offer = await service.create_offer(
            job.id, provider_profile_id=profile.id, provider_payout=Decimal("300.00"),
            response_deadline=now + timedelta(hours=1), instructions=None,
            expected_job_version=1, actor_id="owner", idempotency_key="offer-key-001",
        )
        assert replay_offer.id == offer.id
        original_evidence_hash = offer.capability_evidence_hash
        offer.capability_evidence_hash = "f" * 64
        await db.commit()
        with pytest.raises(FulfillmentConflict, match="Idempotency key payload"):
            await service.create_offer(
                job.id, provider_profile_id=profile.id, provider_payout=Decimal("300.00"),
                response_deadline=now + timedelta(hours=1), instructions=None,
                expected_job_version=1, actor_id="owner", idempotency_key="offer-key-001",
            )
        offer.capability_evidence_hash = original_evidence_hash
        await db.commit()
        with pytest.raises(FulfillmentConflict):
            await service.create_offer(
                job.id, provider_profile_id=profile.id, provider_payout=Decimal("301"),
                response_deadline=now + timedelta(hours=1), instructions=None,
                expected_job_version=1, actor_id="owner", idempotency_key="offer-key-001",
            )
        with pytest.raises(FulfillmentNotFound):
            await service.provider_decide_offer(
                offer.id, relationship_id=9999, decision="accepted", expected_version=1,
                actor_id="intruder", idempotency_key="intruder-key",
            )
        capability_decision = await db.get(ProviderCapabilityDecision, offer.capability_decision_id)
        assert _offer_authorization_matches(offer, capability_decision, job)
        tamper_cases = {
            "capability_decision_id": offer.capability_decision_id + 1,
            "capability_task_definition_hash": "e" * 64,
            "capability_evidence_hash": "f" * 64,
            "service_key": "cabinet_hardware",
            "service_area": "outside-pilot",
            "window_start": offer.window_start + timedelta(minutes=1),
            "window_end": offer.window_end + timedelta(minutes=1),
        }
        for field, tampered in tamper_cases.items():
            original = getattr(offer, field)
            setattr(offer, field, tampered)
            assert not _offer_authorization_matches(offer, capability_decision, job)
            setattr(offer, field, original)
        offer.capability_evidence_hash = "f" * 64
        await db.commit()
        with pytest.raises(FulfillmentConflict, match="capability decision changed"):
            await service.provider_decide_offer(
                offer.id, relationship_id=relationship.id, decision="accepted", expected_version=1,
                actor_id="provider-user", idempotency_key="accept-tampered-key",
            )
        offer.capability_evidence_hash = original_evidence_hash
        await db.commit()
        offer = await service.provider_decide_offer(
            offer.id, relationship_id=relationship.id, decision="accepted", expected_version=1,
            actor_id="provider-user", idempotency_key="accept-key-01",
        )
        assert offer.status == "accepted" and job.status == "assigned"
        with pytest.raises(FulfillmentNotFound):
            await service.provider_decide_offer(
                offer.id, relationship_id=9999, decision="accepted", expected_version=1,
                actor_id="intruder", idempotency_key="accept-key-01",
            )
        offer, job = await service.confirm_assignment(
            offer.id, expected_offer_version=2, expected_job_version=2,
            actor_id="owner", idempotency_key="confirm-key-1",
        )
        assert offer.status == "confirmed" and job.status == "confirmed"
        monkeypatch.setattr("routers.fulfillment.settings.fulfillment_setup_enabled", True)
        owner = UserResponse(id="owner", email="owner@example.invalid", role="admin")
        profile_rows = await list_provider_profiles(Response(), db, owner)
        offer_rows = await list_assignment_offers(Response(), db, owner)
        assert profile_rows[0]["id"] == profile.id
        assert {item["requirement_key"] for item in profile_rows[0]["vetting"]} == REQUIRED_PILOT_VETTING
        assert offer_rows[0].id == offer.id and offer_rows[0].status == "confirmed"
        provider_location, provider_payload = await service.provider_access_service_location(
            job.id, relationship_id=relationship.id, actor_id="provider-user",
        )
        assert provider_location.id == location.id and provider_payload["access_instructions"] == "Gate B"
        access_events = (await db.execute(select(ServiceLocationEvent).where(
            ServiceLocationEvent.service_location_id == location.id,
            ServiceLocationEvent.event_type.in_(("owner_accessed", "provider_accessed")),
        ))).scalars().all()
        assert {event.actor_role for event in access_events} == {"owner", "managed_provider"}
        profile.operational_status = "paused"
        await db.commit()
        with pytest.raises(FulfillmentConflict):
            await service.provider_access_service_location(
                job.id, relationship_id=relationship.id, actor_id="provider-user",
            )
        with pytest.raises(FulfillmentConflict):
            await service.provider_advance_job(
                job.id, relationship_id=relationship.id, command="on_the_way",
                expected_version=job.version, actor_id="provider-user",
                idempotency_key="paused-provider-command",
            )
        profile.operational_status = "active"
        await db.commit()
        for command, expected in (("on_the_way", "on_the_way"), ("arrived", "arrived"), ("start", "in_progress")):
            job = await service.provider_advance_job(
                job.id, relationship_id=relationship.id, command=command,
                expected_version=job.version, actor_id="provider-user",
                idempotency_key=f"advance-{command}",
            )
            assert job.status == expected
            with pytest.raises(FulfillmentNotFound):
                await service.provider_advance_job(
                    job.id, relationship_id=9999, command=command,
                    expected_version=job.version, actor_id="intruder",
                    idempotency_key=f"advance-{command}",
                )
    await engine.dispose()
