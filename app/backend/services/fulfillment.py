import hashlib
import json
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.private_data_crypto import decrypt_private_payload, encrypt_private_payload
from models.bookings import Booking, BookingEvent
from models.business_relationship import BusinessRelationship
from models.fulfillment import (
    AssignmentOffer, AssignmentOfferEvent, ManagedProviderProfile,
    ProviderCapability, ProviderVettingItem, ServiceLocation, ServiceLocationEvent,
)
from models.job_ledger import JobEvent
from models.jobs import Jobs
from models.leads import Leads
from services.pilot_readiness import ALLOWED_TASK_KEYS, require_pilot_dispatch_ready
from models.pilot import PilotConfiguration, PilotTaskClassification
from services.pilot_readiness import PILOT_SCOPE_HASH, PILOT_SCOPE_VERSION
from services.provider_vetting import PILOT_PROVIDER_VETTING_KEYS, provider_vetting_is_valid
from services.provider_capability import current_provider_capability_decision, provider_capability_is_valid


class FulfillmentConflict(ValueError):
    pass


class FulfillmentNotFound(ValueError):
    pass


REQUIRED_PILOT_VETTING = PILOT_PROVIDER_VETTING_KEYS


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def _require_enabled(db: AsyncSession) -> None:
    try:
        await require_pilot_dispatch_ready(db)
    except RuntimeError as exc:
        raise FulfillmentConflict(str(exc)) from exc


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _canonical_datetime(value: datetime) -> str:
    return _aware(value).astimezone(timezone.utc).isoformat()


def _canonical_decimal(value: Decimal) -> str:
    return format(Decimal(value).normalize(), "f")


def _hash(payload: dict) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()


def _require_pilot_job_scope(job: Jobs) -> None:
    if job.service_key not in ALLOWED_TASK_KEYS or job.service_area != "harish":
        raise FulfillmentConflict("Job is outside the approved first paid pilot scope")


def _offer_authorization_matches(offer: AssignmentOffer, decision, job: Jobs) -> bool:
    """Verify the mutable offer projection against its authoritative decision and job."""
    return bool(
        decision is not None
        and decision.id == offer.capability_decision_id
        and decision.provider_profile_id == offer.provider_profile_id
        and decision.service_key == offer.service_key == job.service_key
        and decision.service_area == offer.service_area == job.service_area
        and decision.task_definition_hash == offer.capability_task_definition_hash
        and decision.evidence_hash == offer.capability_evidence_hash
        and _canonical_datetime(offer.window_start) == _canonical_datetime(job.scheduled_for)
        and _canonical_datetime(offer.window_end) == _canonical_datetime(job.confirmed_window_end)
    )


async def _append_job_event(
    db: AsyncSession, job: Jobs, *, event_type: str, actor_id: str,
    actor_role: str, source: str, idempotency_key: str,
    previous_status: str | None, new_status: str, command_hash: str,
) -> None:
    sequence = int(await db.scalar(select(func.coalesce(func.max(JobEvent.sequence_number), 0)).where(JobEvent.job_id == job.id)) or 0) + 1
    previous_hash = await db.scalar(select(JobEvent.event_hash).where(JobEvent.job_id == job.id).order_by(JobEvent.sequence_number.desc()).limit(1))
    occurred_at = _utcnow()
    event_uuid = str(uuid4())
    material = {
        "event_uuid": event_uuid, "job_id": job.id, "sequence_number": sequence,
        "event_type": event_type, "occurred_at": occurred_at.isoformat(),
        "actor_id": actor_id, "previous_status": previous_status,
        "new_status": new_status, "previous_hash": previous_hash,
    }
    db.add(JobEvent(
        event_uuid=event_uuid, job_id=job.id, sequence_number=sequence,
        event_type=event_type, occurred_at=occurred_at, actor_type="user",
        actor_id=actor_id, actor_role=actor_role, source=source,
        previous_status=previous_status, new_status=new_status,
        visibility="owner", payload={}, idempotency_key=idempotency_key,
        command_hash=command_hash, previous_hash=previous_hash, event_hash=_hash(material),
    ))


async def provider_is_eligible(
    db: AsyncSession, profile_id: int, service_key: str, service_area: str,
    *, required_through: datetime,
) -> bool:
    profile = await db.scalar(
        select(ManagedProviderProfile)
        .join(BusinessRelationship, BusinessRelationship.id == ManagedProviderProfile.relationship_id)
        .where(
            ManagedProviderProfile.id == profile_id,
            ManagedProviderProfile.operational_status == "active",
            ManagedProviderProfile.availability_status.in_(("available", "limited")),
            BusinessRelationship.relationship_type == "managed_provider",
            BusinessRelationship.status == "active",
        )
        .with_for_update()
    )
    if profile is None:
        return False
    if service_area != "harish" or not await provider_capability_is_valid(db, profile_id, service_key, required_through=required_through):
        return False
    return await provider_vetting_is_valid(db, profile_id, required_through=required_through)


async def _operational_profile(db: AsyncSession, relationship_id: int, profile_id: int | None = None):
    query = (
        select(ManagedProviderProfile)
        .join(BusinessRelationship, BusinessRelationship.id == ManagedProviderProfile.relationship_id)
        .where(
            ManagedProviderProfile.relationship_id == relationship_id,
            ManagedProviderProfile.operational_status == "active",
            ManagedProviderProfile.availability_status.in_(("available", "limited")),
            BusinessRelationship.relationship_type == "managed_provider",
            BusinessRelationship.status == "active",
        )
    )
    if profile_id is not None:
        query = query.where(ManagedProviderProfile.id == profile_id)
    return await db.scalar(query.with_for_update())


async def _locked_provider_profile(db: AsyncSession, profile_id: int) -> ManagedProviderProfile | None:
    """Serialize dispatch commands with capability approval and emergency stop."""
    return await db.scalar(
        select(ManagedProviderProfile)
        .where(ManagedProviderProfile.id == profile_id)
        .with_for_update()
    )


class FulfillmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def set_service_location(
        self, booking_id: int, *, exact_address: str, access_instructions: str | None,
        expected_version: int, actor_id: str, idempotency_key: str,
    ) -> ServiceLocation:
        await _require_enabled(self.db)
        address = exact_address.strip()
        instructions = (access_instructions or "").strip() or None
        command_hash = _hash({
            "command": "set_service_location", "booking_id": booking_id,
            "exact_address": address, "access_instructions": instructions,
            "expected_version": expected_version, "actor_id": actor_id,
        })
        replay = await self.db.scalar(select(ServiceLocationEvent).where(
            ServiceLocationEvent.source == "owner_location_command",
            ServiceLocationEvent.idempotency_key == idempotency_key,
        ))
        if replay:
            if replay.command_hash != command_hash or replay.booking_id != booking_id:
                raise FulfillmentConflict("Idempotency key payload does not match the recorded command")
            location = await self.db.get(ServiceLocation, replay.service_location_id)
            if location is None or location.version != replay.location_version:
                raise FulfillmentConflict("Service location changed after this command; refresh before retrying")
            return location
        if not address:
            raise FulfillmentConflict("Exact service address is required")
        booking = await self.db.get(Booking, booking_id)
        if booking is None:
            raise FulfillmentNotFound("Booking not found")
        location = await self.db.scalar(
            select(ServiceLocation).where(ServiceLocation.booking_id == booking_id).with_for_update()
        )
        previous_version = location.version if location else 0
        if previous_version != expected_version:
            raise FulfillmentConflict("Service location was changed; refresh before retrying")
        encrypted = encrypt_private_payload({
            "exact_address": address, "access_instructions": instructions,
        })
        if location is None:
            location = ServiceLocation(
                booking_id=booking_id, encrypted_payload=encrypted,
                payload_version=1, version=1, set_by=actor_id,
            )
            self.db.add(location)
            await self.db.flush()
            event_type = "location_set"
        else:
            location.encrypted_payload = encrypted
            location.set_by = actor_id
            location.version += 1
            event_type = "location_updated"
        self.db.add(ServiceLocationEvent(
            service_location_id=location.id, booking_id=booking_id, job_id=None,
            event_type=event_type, location_version=location.version,
            actor_id=actor_id, actor_role="owner", source="owner_location_command",
            idempotency_key=idempotency_key, command_hash=command_hash,
        ))
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise FulfillmentConflict("Service-location command conflicts with an existing command") from exc
        return location

    async def owner_access_service_location(
        self, booking_id: int, *, actor_id: str,
    ) -> tuple[ServiceLocation, dict[str, str | None]]:
        await _require_enabled(self.db)
        location = await self.db.scalar(select(ServiceLocation).where(ServiceLocation.booking_id == booking_id))
        if location is None:
            raise FulfillmentNotFound("Service location not found")
        payload = decrypt_private_payload(location.encrypted_payload)
        self.db.add(ServiceLocationEvent(
            service_location_id=location.id, booking_id=booking_id, job_id=None,
            event_type="owner_accessed", location_version=location.version,
            actor_id=actor_id, actor_role="owner", source="owner_location_access",
            idempotency_key=None, command_hash=None,
        ))
        await self.db.commit()
        return location, payload

    async def provider_access_service_location(
        self, job_id: int, *, relationship_id: int, actor_id: str,
    ) -> tuple[ServiceLocation, dict[str, str | None]]:
        await _require_enabled(self.db)
        profile = await _operational_profile(self.db, relationship_id)
        job = await self.db.scalar(select(Jobs).where(
            Jobs.id == job_id,
            Jobs.status.in_(("confirmed", "on_the_way", "arrived", "in_progress")),
        ))
        if profile is None or job is None or job.booking_id is None or job.managed_provider_profile_id != profile.id:
            raise FulfillmentNotFound("Service location not found")
        confirmed_offer = await self.db.scalar(select(AssignmentOffer.id).where(
            AssignmentOffer.job_id == job.id,
            AssignmentOffer.provider_profile_id == profile.id,
            AssignmentOffer.status == "confirmed",
        ))
        if confirmed_offer is None:
            raise FulfillmentNotFound("Service location not found")
        location = await self.db.scalar(select(ServiceLocation).where(ServiceLocation.booking_id == job.booking_id))
        if location is None:
            raise FulfillmentNotFound("Service location not found")
        payload = decrypt_private_payload(location.encrypted_payload)
        self.db.add(ServiceLocationEvent(
            service_location_id=location.id, booking_id=job.booking_id, job_id=job.id,
            event_type="provider_accessed", location_version=location.version,
            actor_id=actor_id, actor_role="managed_provider", source="provider_location_access",
            idempotency_key=None, command_hash=None,
        ))
        await self.db.commit()
        return location, payload

    async def confirm_booking_schedule(
        self, booking_id: int, *, start: datetime, end: datetime, timezone_name: str,
        expected_version: int, actor_id: str, idempotency_key: str,
    ) -> tuple[Booking, Jobs]:
        await _require_enabled(self.db)
        command_hash = _hash({
            "command": "confirm_booking_schedule", "booking_id": booking_id,
            "start": _canonical_datetime(start), "end": _canonical_datetime(end),
            "timezone": timezone_name, "expected_version": expected_version,
            "actor_id": actor_id,
        })
        replay = await self.db.scalar(select(BookingEvent).where(
            BookingEvent.source == "booking_schedule_command",
            BookingEvent.idempotency_key == idempotency_key,
        ))
        if replay:
            if replay.command_hash != command_hash:
                raise FulfillmentConflict("Idempotency key payload does not match the recorded command")
            if replay.booking_id != booking_id or replay.event_type != "schedule_confirmed":
                raise FulfillmentConflict("Idempotency key was used for another command")
            booking = await self.db.get(Booking, booking_id)
            job = await self.db.scalar(select(Jobs).where(Jobs.booking_id == booking_id))
            return booking, job

        booking = await self.db.scalar(select(Booking).where(Booking.id == booking_id).with_for_update())
        if booking is None:
            raise FulfillmentNotFound("Booking not found")
        if booking.version != expected_version:
            raise FulfillmentConflict("Booking was changed; refresh before retrying")
        if booking.status != "awaiting_schedule":
            raise FulfillmentConflict("Only an awaiting-schedule booking can be confirmed")
        if booking.deposit_required_snapshot and Decimal(booking.deposit_required_snapshot) > 0:
            raise FulfillmentConflict("Deposit-required bookings cannot be confirmed in this release")
        now = _utcnow()
        if timezone_name != "Asia/Jerusalem":
            raise FulfillmentConflict("Pilot scheduling requires Asia/Jerusalem timezone")
        if _aware(start) <= now:
            raise FulfillmentConflict("Schedule must begin in the future")
        if _aware(start) >= _aware(end):
            raise FulfillmentConflict("Schedule end must be after start")
        if _aware(end) - _aware(start) > timedelta(hours=12):
            raise FulfillmentConflict("Schedule window cannot exceed 12 hours")
        if _aware(start) - now > timedelta(days=180):
            raise FulfillmentConflict("Schedule cannot be more than 180 days ahead")
        if booking.lead_id is None:
            raise FulfillmentConflict("Booking has no authoritative customer request")
        lead = await self.db.get(Leads, booking.lead_id)
        if lead is None:
            raise FulfillmentConflict("Booking customer request no longer exists")
        classification = await self.db.scalar(select(PilotTaskClassification).where(
            PilotTaskClassification.lead_id == lead.id,
        ))
        if classification is None:
            raise FulfillmentConflict("Owner-reviewed pilot task classification is required")
        if classification.scope_version != PILOT_SCOPE_VERSION or classification.scope_hash != PILOT_SCOPE_HASH:
            raise FulfillmentConflict("Pilot task classification is stale")
        service_key = classification.task_key
        service_area = classification.service_area
        if service_key not in ALLOWED_TASK_KEYS:
            raise FulfillmentConflict("Task is outside the approved first paid pilot allowlist")
        if service_area != "harish":
            raise FulfillmentConflict("The first paid pilot is limited to Harish")
        local_zone = ZoneInfo("Asia/Jerusalem")
        local_start = _aware(start).astimezone(local_zone)
        local_end = _aware(end).astimezone(local_zone)
        if local_start.date() != local_end.date() or local_start.weekday() > 3:
            raise FulfillmentConflict("Pilot work must be scheduled Monday through Thursday")
        if local_start.strftime("%H:%M") < "09:00" or local_end.strftime("%H:%M") > "17:00":
            raise FulfillmentConflict("Pilot work must stay within 09:00–17:00 Asia/Jerusalem")
        week_start_local = (local_start - timedelta(days=local_start.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        week_end_local = week_start_local + timedelta(days=7)
        # Serialize all bookings for the shared weekly pilot quota. Locking only
        # the booking row would let concurrent bookings both pass the count.
        config = await self.db.scalar(select(PilotConfiguration).where(PilotConfiguration.id == 1).with_for_update())
        scheduled_count = int(await self.db.scalar(select(func.count(Jobs.id)).where(
            Jobs.booking_id.is_not(None), Jobs.scheduled_for >= week_start_local.astimezone(timezone.utc),
            Jobs.scheduled_for < week_end_local.astimezone(timezone.utc),
        )) or 0)
        if config is None or scheduled_count >= config.weekly_job_cap:
            raise FulfillmentConflict("Pilot weekly job cap has been reached")
        existing = await self.db.scalar(select(Jobs).where(Jobs.booking_id == booking_id))
        if existing is not None:
            raise FulfillmentConflict("Booking already has a job")

        booking.status = "confirmed"
        booking.confirmed_window_start = start
        booking.confirmed_window_end = end
        booking.timezone = timezone_name
        booking.service_key = service_key
        booking.service_area = service_area
        booking.confirmed_by = actor_id
        booking.confirmed_at = _utcnow()
        booking.version += 1
        job = Jobs(
            booking_id=booking.id, quote_id=booking.quote_id, lead_id=lead.id,
            customer_name=lead.customer_name, phone=lead.phone,
            address=None, title=lead.service_requested or booking.scope_snapshot[:200],
            status="unassigned", service_key=service_key, service_area=service_area,
            scheduled_for=start, confirmed_window_end=end,
            price=booking.quoted_total_snapshot, version=1,
        )
        self.db.add(job)
        await self.db.flush()
        self.db.add(BookingEvent(
            booking_id=booking.id, event_type="schedule_confirmed", actor_id=actor_id,
            previous_status="awaiting_schedule", new_status="confirmed",
            source="booking_schedule_command", idempotency_key=idempotency_key,
            command_hash=command_hash,
        ))
        await _append_job_event(
            self.db, job, event_type="job_created_from_booking", actor_id=actor_id,
            actor_role="owner", source="booking_schedule_command",
            idempotency_key=idempotency_key, previous_status=None, new_status="unassigned",
            command_hash=command_hash,
        )
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise FulfillmentConflict("Schedule confirmation conflicts with an existing command") from exc
        return booking, job

    async def create_offer(
        self, job_id: int, *, provider_profile_id: int, provider_payout: Decimal,
        response_deadline: datetime, instructions: str | None,
        expected_job_version: int, actor_id: str, idempotency_key: str,
    ) -> AssignmentOffer:
        await _require_enabled(self.db)
        command_material = {
            "command": "create_assignment_offer", "job_id": job_id,
            "provider_profile_id": provider_profile_id, "provider_payout": _canonical_decimal(provider_payout),
            "currency": "ILS", "response_deadline": _canonical_datetime(response_deadline),
            "instructions": instructions, "expected_job_version": expected_job_version,
            "actor_id": actor_id,
        }
        replay = await self.db.scalar(select(AssignmentOfferEvent).where(
            AssignmentOfferEvent.source == "owner_offer_command",
            AssignmentOfferEvent.idempotency_key == idempotency_key,
        ))
        if replay:
            replay_offer = await self.db.get(AssignmentOffer, replay.offer_id)
            if replay_offer is None:
                raise FulfillmentConflict("Recorded offer no longer exists")
            replay_hash = _hash({
                **command_material,
                "service_key": replay_offer.service_key,
                "service_area": replay_offer.service_area,
                "window_start": _canonical_datetime(replay_offer.window_start),
                "window_end": _canonical_datetime(replay_offer.window_end),
                "capability_decision_id": replay_offer.capability_decision_id,
                "capability_task_definition_hash": replay_offer.capability_task_definition_hash,
                "capability_evidence_hash": replay_offer.capability_evidence_hash,
            })
            if replay.command_hash != replay_hash:
                raise FulfillmentConflict("Idempotency key payload does not match the recorded command")
            if replay.job_id != job_id or replay.event_type != "offer_created":
                raise FulfillmentConflict("Idempotency key was used for another command")
            return replay_offer
        preview_job = await self.db.get(Jobs, job_id)
        if preview_job is None:
            raise FulfillmentNotFound("Job not found")
        if await _locked_provider_profile(self.db, provider_profile_id) is None:
            raise FulfillmentConflict("Provider is not currently eligible for this job")
        job = await self.db.scalar(select(Jobs).where(Jobs.id == job_id).with_for_update())
        if job is None:
            raise FulfillmentNotFound("Job not found")
        _require_pilot_job_scope(job)
        if job.version != expected_job_version:
            raise FulfillmentConflict("Job was changed; refresh before retrying")
        if job.status != "unassigned" or not job.service_key or not job.service_area or not job.scheduled_for or not job.confirmed_window_end:
            raise FulfillmentConflict("Job is not eligible for an assignment offer")
        if _aware(response_deadline) <= _utcnow():
            raise FulfillmentConflict("Offer deadline must be in the future")
        if not await provider_is_eligible(
            self.db, provider_profile_id, job.service_key, job.service_area,
            required_through=job.confirmed_window_end,
        ):
            raise FulfillmentConflict("Provider is not currently eligible for this job")
        capability_decision = await current_provider_capability_decision(self.db, provider_profile_id, job.service_key)
        if capability_decision is None:
            raise FulfillmentConflict("Provider capability evidence is missing")
        command_hash = _hash({
            **command_material,
            "service_key": job.service_key,
            "service_area": job.service_area,
            "window_start": _canonical_datetime(job.scheduled_for),
            "window_end": _canonical_datetime(job.confirmed_window_end),
            "capability_decision_id": capability_decision.id,
            "capability_task_definition_hash": capability_decision.task_definition_hash,
            "capability_evidence_hash": capability_decision.evidence_hash,
        })
        open_offer = await self.db.scalar(select(AssignmentOffer.id).where(
            AssignmentOffer.job_id == job_id,
            AssignmentOffer.status.in_(("offered", "accepted")),
        ))
        if open_offer:
            raise FulfillmentConflict("Job already has an open assignment offer")
        sequence = int(await self.db.scalar(select(func.coalesce(func.max(AssignmentOffer.sequence_number), 0)).where(AssignmentOffer.job_id == job_id)) or 0) + 1
        offer = AssignmentOffer(
            job_id=job_id, provider_profile_id=provider_profile_id,
            capability_decision_id=capability_decision.id,
            capability_task_definition_hash=capability_decision.task_definition_hash,
            capability_evidence_hash=capability_decision.evidence_hash,
            sequence_number=sequence, provider_payout=provider_payout,
            service_key=job.service_key, service_area=job.service_area,
            window_start=job.scheduled_for, window_end=job.confirmed_window_end,
            response_deadline=response_deadline, instructions=instructions, status="offered",
        )
        self.db.add(offer)
        await self.db.flush()
        self.db.add(AssignmentOfferEvent(
            offer_id=offer.id, job_id=job_id, event_type="offer_created",
            capability_decision_id=capability_decision.id,
            capability_task_definition_hash=capability_decision.task_definition_hash,
            capability_evidence_hash=capability_decision.evidence_hash,
            service_key_snapshot=job.service_key, service_area_snapshot=job.service_area,
            window_start_snapshot=job.scheduled_for, window_end_snapshot=job.confirmed_window_end,
            actor_id=actor_id, actor_role="owner", previous_status=None,
            new_status="offered", source="owner_offer_command", idempotency_key=idempotency_key,
            command_hash=command_hash,
        ))
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise FulfillmentConflict("Offer conflicts with an existing open offer") from exc
        return offer

    async def provider_decide_offer(
        self, offer_id: int, *, relationship_id: int, decision: str,
        expected_version: int, actor_id: str, idempotency_key: str,
        decline_reason: str | None = None,
    ) -> AssignmentOffer:
        await _require_enabled(self.db)
        source = "provider_offer_command"
        command_hash = _hash({
            "command": f"provider_offer_{decision}", "offer_id": offer_id,
            "expected_version": expected_version, "decline_reason": (decline_reason or "").strip() or None,
            "actor_id": actor_id, "relationship_id": relationship_id,
        })
        replay = await self.db.scalar(select(AssignmentOfferEvent).where(
            AssignmentOfferEvent.source == source,
            AssignmentOfferEvent.idempotency_key == idempotency_key,
        ))
        if replay:
            replay_offer = await self.db.get(AssignmentOffer, offer_id)
            replay_profile = None if replay_offer is None else await _operational_profile(
                self.db, relationship_id, replay_offer.provider_profile_id,
            )
            if replay_profile is None:
                raise FulfillmentNotFound("Offer not found")
            if replay.command_hash != command_hash:
                raise FulfillmentConflict("Idempotency key payload does not match the recorded command")
            if replay.offer_id != offer_id or replay.event_type != f"offer_{decision}":
                raise FulfillmentConflict("Idempotency key was used for another command")
            return replay_offer
        preview_offer = await self.db.get(AssignmentOffer, offer_id)
        if preview_offer is None:
            raise FulfillmentNotFound("Offer not found")
        profile = await _operational_profile(self.db, relationship_id, preview_offer.provider_profile_id)
        offer = await self.db.scalar(select(AssignmentOffer).where(AssignmentOffer.id == offer_id).with_for_update())
        if offer is None or profile is None or offer.provider_profile_id != profile.id:
            raise FulfillmentNotFound("Offer not found")
        if offer.version != expected_version:
            raise FulfillmentConflict("Offer was changed; refresh before retrying")
        if offer.status != "offered":
            raise FulfillmentConflict("Offer is no longer open")
        if _aware(offer.response_deadline) <= _utcnow():
            raise FulfillmentConflict("Offer has expired")
        if decision == "declined" and not (decline_reason or "").strip():
            raise FulfillmentConflict("A decline reason is required")
        job = await self.db.scalar(select(Jobs).where(Jobs.id == offer.job_id).with_for_update())
        _require_pilot_job_scope(job)
        previous = offer.status
        now = _utcnow()
        if decision == "accepted":
            if job.status != "unassigned":
                raise FulfillmentConflict("Job is no longer unassigned")
            if not await provider_is_eligible(
                self.db, profile.id, job.service_key, job.service_area,
                required_through=job.confirmed_window_end,
            ):
                raise FulfillmentConflict("Provider is no longer eligible for this job")
            current_capability = await current_provider_capability_decision(self.db, profile.id, job.service_key)
            if not _offer_authorization_matches(offer, current_capability, job):
                raise FulfillmentConflict("Provider capability decision changed; issue a new offer")
            offer.status, offer.accepted_at = "accepted", now
            job.status = "assigned"
            job.managed_provider_profile_id = profile.id
            job.version += 1
            await _append_job_event(self.db, job, event_type="provider_offer_accepted", actor_id=actor_id, actor_role="managed_provider", source=source, idempotency_key=idempotency_key, previous_status="unassigned", new_status="assigned", command_hash=command_hash)
        else:
            offer.status, offer.declined_at, offer.decline_reason = "declined", now, decline_reason.strip()
        offer.version += 1
        self.db.add(AssignmentOfferEvent(
            offer_id=offer.id, job_id=offer.job_id, event_type=f"offer_{decision}",
            capability_decision_id=offer.capability_decision_id,
            capability_task_definition_hash=offer.capability_task_definition_hash,
            capability_evidence_hash=offer.capability_evidence_hash,
            service_key_snapshot=offer.service_key, service_area_snapshot=offer.service_area,
            window_start_snapshot=offer.window_start, window_end_snapshot=offer.window_end,
            actor_id=actor_id, actor_role="managed_provider", previous_status=previous,
            new_status=offer.status, source=source, idempotency_key=idempotency_key,
            command_hash=command_hash,
        ))
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise FulfillmentConflict("Provider decision was already recorded") from exc
        return offer

    async def confirm_assignment(
        self, offer_id: int, *, expected_offer_version: int,
        expected_job_version: int, actor_id: str, idempotency_key: str,
    ) -> tuple[AssignmentOffer, Jobs]:
        await _require_enabled(self.db)
        source = "owner_assignment_command"
        command_hash = _hash({
            "command": "confirm_assignment", "offer_id": offer_id,
            "expected_offer_version": expected_offer_version,
            "expected_job_version": expected_job_version, "actor_id": actor_id,
        })
        replay = await self.db.scalar(select(AssignmentOfferEvent).where(
            AssignmentOfferEvent.source == source,
            AssignmentOfferEvent.idempotency_key == idempotency_key,
        ))
        if replay:
            if replay.command_hash != command_hash:
                raise FulfillmentConflict("Idempotency key payload does not match the recorded command")
            if replay.offer_id != offer_id or replay.event_type != "assignment_confirmed":
                raise FulfillmentConflict("Idempotency key was used for another command")
            return await self.db.get(AssignmentOffer, offer_id), await self.db.get(Jobs, replay.job_id)
        preview_offer = await self.db.get(AssignmentOffer, offer_id)
        if preview_offer is None:
            raise FulfillmentNotFound("Offer not found")
        if await _locked_provider_profile(self.db, preview_offer.provider_profile_id) is None:
            raise FulfillmentConflict("Provider is no longer eligible for this job")
        offer = await self.db.scalar(select(AssignmentOffer).where(AssignmentOffer.id == offer_id).with_for_update())
        if offer is None or offer.provider_profile_id != preview_offer.provider_profile_id:
            raise FulfillmentNotFound("Offer not found")
        job = await self.db.scalar(select(Jobs).where(Jobs.id == offer.job_id).with_for_update())
        _require_pilot_job_scope(job)
        if offer.version != expected_offer_version or job.version != expected_job_version:
            raise FulfillmentConflict("Offer or job was changed; refresh before retrying")
        if offer.status != "accepted" or job.status != "assigned" or job.managed_provider_profile_id != offer.provider_profile_id:
            raise FulfillmentConflict("Only the accepted assignment for this job can be confirmed")
        if not await provider_is_eligible(
            self.db, offer.provider_profile_id, job.service_key, job.service_area,
            required_through=job.confirmed_window_end,
        ):
            raise FulfillmentConflict("Provider is no longer eligible for this job")
        current_capability = await current_provider_capability_decision(self.db, offer.provider_profile_id, job.service_key)
        if not _offer_authorization_matches(offer, current_capability, job):
            raise FulfillmentConflict("Provider capability decision changed; issue a new offer")
        previous = offer.status
        now = _utcnow()
        offer.status, offer.confirmed_at = "confirmed", now
        offer.version += 1
        job.status, job.assignment_confirmed_at = "confirmed", now
        job.version += 1
        self.db.add(AssignmentOfferEvent(
            offer_id=offer.id, job_id=job.id, event_type="assignment_confirmed",
            capability_decision_id=offer.capability_decision_id,
            capability_task_definition_hash=offer.capability_task_definition_hash,
            capability_evidence_hash=offer.capability_evidence_hash,
            service_key_snapshot=offer.service_key, service_area_snapshot=offer.service_area,
            window_start_snapshot=offer.window_start, window_end_snapshot=offer.window_end,
            actor_id=actor_id, actor_role="owner", previous_status=previous,
            new_status="confirmed", source=source, idempotency_key=idempotency_key,
            command_hash=command_hash,
        ))
        await _append_job_event(self.db, job, event_type="assignment_confirmed", actor_id=actor_id, actor_role="owner", source=source, idempotency_key=idempotency_key, previous_status="assigned", new_status="confirmed", command_hash=command_hash)
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise FulfillmentConflict("Assignment confirmation was already recorded") from exc
        return offer, job

    async def provider_advance_job(
        self, job_id: int, *, relationship_id: int, command: str,
        expected_version: int, actor_id: str, idempotency_key: str,
    ) -> Jobs:
        await _require_enabled(self.db)
        transitions = {
            "on_the_way": ("confirmed", "on_the_way", "on_the_way_at"),
            "arrived": ("on_the_way", "arrived", "arrived_at"),
            "start": ("arrived", "in_progress", "started_at"),
        }
        previous_required, new_status, timestamp_field = transitions[command]
        command_hash = _hash({
            "command": f"provider_job_{command}", "job_id": job_id,
            "expected_version": expected_version, "actor_id": actor_id,
            "relationship_id": relationship_id,
        })
        replay = await self.db.scalar(select(AssignmentOfferEvent).where(
            AssignmentOfferEvent.source == "provider_job_command",
            AssignmentOfferEvent.idempotency_key == idempotency_key,
        ))
        if replay:
            replay_profile = await _operational_profile(self.db, relationship_id)
            replay_job = await self.db.get(Jobs, job_id)
            if replay_profile is None or replay_job is None or replay_job.managed_provider_profile_id != replay_profile.id:
                raise FulfillmentNotFound("Job not found")
            _require_pilot_job_scope(replay_job)
            replay_assignment = await self.db.scalar(select(AssignmentOffer).where(
                AssignmentOffer.job_id == job_id,
                AssignmentOffer.provider_profile_id == replay_profile.id,
                AssignmentOffer.status == "confirmed",
            ))
            replay_capability = await current_provider_capability_decision(self.db, replay_profile.id, replay_job.service_key)
            if replay_assignment is None or not _offer_authorization_matches(replay_assignment, replay_capability, replay_job) or not await provider_is_eligible(
                self.db, replay_profile.id, replay_job.service_key, replay_job.service_area,
                required_through=replay_job.confirmed_window_end,
            ):
                raise FulfillmentNotFound("Job not found")
            if replay.command_hash != command_hash:
                raise FulfillmentConflict("Idempotency key payload does not match the recorded command")
            if replay.job_id != job_id or replay.event_type != f"provider_{command}":
                raise FulfillmentConflict("Idempotency key was used for another command")
            return replay_job
        profile = await _operational_profile(self.db, relationship_id)
        job = await self.db.scalar(select(Jobs).where(Jobs.id == job_id).with_for_update())
        if profile is None or job is None or job.managed_provider_profile_id != profile.id:
            raise FulfillmentNotFound("Job not found")
        _require_pilot_job_scope(job)
        confirmed_offer = await self.db.scalar(select(AssignmentOffer).where(
            AssignmentOffer.job_id == job_id,
            AssignmentOffer.provider_profile_id == profile.id,
            AssignmentOffer.status == "confirmed",
        ))
        if confirmed_offer is None:
            raise FulfillmentNotFound("Job not found")
        if not await provider_is_eligible(
            self.db, profile.id, job.service_key, job.service_area,
            required_through=job.confirmed_window_end,
        ):
            raise FulfillmentNotFound("Job not found")
        current_capability = await current_provider_capability_decision(self.db, profile.id, job.service_key)
        if not _offer_authorization_matches(confirmed_offer, current_capability, job):
            raise FulfillmentNotFound("Job not found")
        if job.version != expected_version:
            raise FulfillmentConflict("Job was changed; refresh before retrying")
        if job.status != previous_required:
            raise FulfillmentConflict(f"Job must be {previous_required} before {command}")
        previous = job.status
        job.status = new_status
        setattr(job, timestamp_field, _utcnow())
        job.version += 1
        self.db.add(AssignmentOfferEvent(
            offer_id=confirmed_offer.id, job_id=job.id, event_type=f"provider_{command}",
            capability_decision_id=confirmed_offer.capability_decision_id,
            capability_task_definition_hash=confirmed_offer.capability_task_definition_hash,
            capability_evidence_hash=confirmed_offer.capability_evidence_hash,
            service_key_snapshot=confirmed_offer.service_key, service_area_snapshot=confirmed_offer.service_area,
            window_start_snapshot=confirmed_offer.window_start, window_end_snapshot=confirmed_offer.window_end,
            actor_id=actor_id, actor_role="managed_provider", previous_status=previous,
            new_status=new_status, source="provider_job_command", idempotency_key=idempotency_key,
            command_hash=command_hash,
        ))
        await _append_job_event(self.db, job, event_type=f"provider_{command}", actor_id=actor_id, actor_role="managed_provider", source="provider_job_command", idempotency_key=idempotency_key, previous_status=previous, new_status=new_status, command_hash=command_hash)
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise FulfillmentConflict("Provider job command was already recorded") from exc
        return job
