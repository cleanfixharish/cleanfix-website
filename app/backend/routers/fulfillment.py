from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, Header, HTTPException, Response
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.config import settings
from dependencies.auth import BusinessPortalPrincipal, get_managed_provider, get_owner_user
from models.business_relationship import BusinessRelationship
from models.fulfillment import AssignmentOffer, ManagedProviderProfile, ProviderCapability, ProviderVettingItem
from models.jobs import Jobs
from schemas.auth import UserResponse
from services.fulfillment import REQUIRED_PILOT_VETTING, FulfillmentConflict, FulfillmentNotFound, FulfillmentService

router = APIRouter(prefix="/api/v1", tags=["fulfillment"])


def _private(response: Response) -> None:
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["Pragma"] = "no-cache"


def require_fulfillment_enabled() -> None:
    if not settings.fulfillment_enabled:
        raise HTTPException(status_code=503, detail="Fulfillment is not enabled")


def require_fulfillment_setup_enabled() -> None:
    if not settings.fulfillment_setup_enabled:
        raise HTTPException(status_code=503, detail="Fulfillment setup is not enabled")


async def _active_provider_profile(db: AsyncSession, relationship_id: int) -> ManagedProviderProfile:
    profile = await db.scalar(
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
    if profile is None:
        raise HTTPException(status_code=403, detail="Provider is not operationally active")
    return profile


def _raise(exc: Exception) -> None:
    if isinstance(exc, FulfillmentNotFound):
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    raise HTTPException(status_code=409, detail=str(exc)) from exc


class ProviderProfileCreate(BaseModel):
    relationship_id: int = Field(ge=1)
    display_name: str = Field(min_length=1, max_length=160)
    availability_status: str = Field(pattern="^(available|limited|unavailable)$")


class ProviderProfileResponse(BaseModel):
    id: int
    relationship_id: int
    display_name: str
    operational_status: str
    availability_status: str
    version: int
    model_config = ConfigDict(from_attributes=True)


@router.post("/admin/managed-providers", response_model=ProviderProfileResponse, status_code=201)
async def create_provider_profile(data: ProviderProfileCreate, response: Response, db: AsyncSession = Depends(get_db), _owner: UserResponse = Depends(get_owner_user)):
    _private(response)
    require_fulfillment_setup_enabled()
    relationship = await db.scalar(select(BusinessRelationship).where(
        BusinessRelationship.id == data.relationship_id,
        BusinessRelationship.relationship_type == "managed_provider",
        BusinessRelationship.status == "active",
    ))
    if relationship is None:
        raise HTTPException(status_code=409, detail="An active managed-provider relationship is required")
    profile = ManagedProviderProfile(relationship_id=data.relationship_id, display_name=data.display_name.strip(), availability_status=data.availability_status)
    db.add(profile)
    try:
        await db.commit()
        await db.refresh(profile)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Provider profile already exists") from exc
    return profile


class CapabilityCommand(BaseModel):
    service_key: str = Field(min_length=1, max_length=120)
    service_area: str = Field(min_length=1, max_length=120)
    verified: bool


@router.post("/admin/managed-providers/{profile_id}/capabilities", status_code=201)
async def add_capability(profile_id: int, data: CapabilityCommand, response: Response, db: AsyncSession = Depends(get_db), owner: UserResponse = Depends(get_owner_user)):
    _private(response)
    require_fulfillment_setup_enabled()
    if await db.get(ManagedProviderProfile, profile_id) is None:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    capability = ProviderCapability(
        provider_profile_id=profile_id, service_key=data.service_key.strip().lower(),
        service_area=data.service_area.strip().lower(), is_verified=data.verified,
        verified_by=owner.id if data.verified else None, verified_at=datetime.now().astimezone() if data.verified else None,
    )
    db.add(capability)
    try:
        await db.commit()
        await db.refresh(capability)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Capability already exists") from exc
    return {"id": capability.id, "provider_profile_id": profile_id, "verified": capability.is_verified}


class VettingCommand(BaseModel):
    requirement_key: str = Field(min_length=1, max_length=100)
    status: str = Field(pattern="^(pending|approved|rejected|expired)$")
    expires_at: datetime | None = None


@router.post("/admin/managed-providers/{profile_id}/vetting", status_code=201)
async def add_vetting(profile_id: int, data: VettingCommand, response: Response, db: AsyncSession = Depends(get_db), owner: UserResponse = Depends(get_owner_user)):
    _private(response)
    require_fulfillment_setup_enabled()
    if await db.get(ManagedProviderProfile, profile_id) is None:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    item = ProviderVettingItem(
        provider_profile_id=profile_id, requirement_key=data.requirement_key.strip().lower(),
        status=data.status, expires_at=data.expires_at, reviewed_by=owner.id,
        reviewed_at=datetime.now().astimezone(),
    )
    db.add(item)
    try:
        await db.commit()
        await db.refresh(item)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Vetting requirement already exists") from exc
    return {"id": item.id, "provider_profile_id": profile_id, "status": item.status}


class ActivateProviderCommand(BaseModel):
    expected_version: int = Field(ge=1)


@router.post("/admin/managed-providers/{profile_id}/activate", response_model=ProviderProfileResponse)
async def activate_provider(profile_id: int, data: ActivateProviderCommand, response: Response, db: AsyncSession = Depends(get_db), _owner: UserResponse = Depends(get_owner_user)):
    _private(response)
    require_fulfillment_setup_enabled()
    profile = await db.scalar(select(ManagedProviderProfile).where(ManagedProviderProfile.id == profile_id).with_for_update())
    if profile is None:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    if profile.version != data.expected_version:
        raise HTTPException(status_code=409, detail="Provider profile was changed; refresh before retrying")
    relationship = await db.scalar(select(BusinessRelationship.id).where(
        BusinessRelationship.id == profile.relationship_id,
        BusinessRelationship.relationship_type == "managed_provider",
        BusinessRelationship.status == "active",
    ))
    if relationship is None:
        raise HTTPException(status_code=409, detail="Managed-provider relationship is not active")
    verified = await db.scalar(select(func.count(ProviderCapability.id)).where(ProviderCapability.provider_profile_id == profile_id, ProviderCapability.is_verified.is_(True)))
    now = datetime.now().astimezone()
    approved_required = await db.scalar(select(func.count(func.distinct(ProviderVettingItem.requirement_key))).where(
        ProviderVettingItem.provider_profile_id == profile_id,
        ProviderVettingItem.requirement_key.in_(REQUIRED_PILOT_VETTING),
        ProviderVettingItem.status == "approved",
        ProviderVettingItem.expires_at.is_(None) |
        (ProviderVettingItem.expires_at >= now),
    ))
    if not verified or int(approved_required or 0) != len(REQUIRED_PILOT_VETTING):
        raise HTTPException(status_code=409, detail="Verified capability and all required pilot vetting are required")
    profile.operational_status = "active"
    profile.version += 1
    await db.commit()
    return profile


class OfferCreate(BaseModel):
    provider_profile_id: int = Field(ge=1)
    provider_payout: Decimal = Field(ge=0)
    response_deadline: datetime
    instructions: str | None = Field(default=None, max_length=2000)
    expected_job_version: int = Field(ge=1)


class OfferResponse(BaseModel):
    id: int
    job_id: int
    provider_profile_id: int
    sequence_number: int
    status: str
    provider_payout: Decimal
    currency: str
    service_key: str
    service_area: str
    window_start: datetime
    window_end: datetime
    response_deadline: datetime
    instructions: str | None
    version: int
    model_config = ConfigDict(from_attributes=True)


@router.post("/admin/jobs/{job_id}/assignment-offers", response_model=OfferResponse, status_code=201)
async def create_offer(job_id: int, data: OfferCreate, response: Response, db: AsyncSession = Depends(get_db), owner: UserResponse = Depends(get_owner_user), idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100)):
    require_fulfillment_enabled()
    _private(response)
    try:
        return await FulfillmentService(db).create_offer(job_id, provider_profile_id=data.provider_profile_id, provider_payout=data.provider_payout, response_deadline=data.response_deadline, instructions=data.instructions, expected_job_version=data.expected_job_version, actor_id=owner.id, idempotency_key=idempotency_key)
    except (FulfillmentConflict, FulfillmentNotFound) as exc:
        _raise(exc)


class OfferDecision(BaseModel):
    expected_version: int = Field(ge=1)
    decline_reason: str | None = Field(default=None, max_length=1000)


async def _decide(offer_id: int, decision: str, data: OfferDecision, response: Response, db: AsyncSession, provider: BusinessPortalPrincipal, key: str):
    require_fulfillment_enabled()
    _private(response)
    try:
        return await FulfillmentService(db).provider_decide_offer(offer_id, relationship_id=provider.relationship_id, decision=decision, expected_version=data.expected_version, actor_id=provider.user.id, idempotency_key=key, decline_reason=data.decline_reason)
    except (FulfillmentConflict, FulfillmentNotFound) as exc:
        _raise(exc)


@router.post("/provider/offers/{offer_id}/accept", response_model=OfferResponse)
async def accept_offer(offer_id: int, data: OfferDecision, response: Response, db: AsyncSession = Depends(get_db), provider: BusinessPortalPrincipal = Depends(get_managed_provider), idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100)):
    return await _decide(offer_id, "accepted", data, response, db, provider, idempotency_key)


@router.post("/provider/offers/{offer_id}/decline", response_model=OfferResponse)
async def decline_offer(offer_id: int, data: OfferDecision, response: Response, db: AsyncSession = Depends(get_db), provider: BusinessPortalPrincipal = Depends(get_managed_provider), idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100)):
    return await _decide(offer_id, "declined", data, response, db, provider, idempotency_key)


class ConfirmAssignment(BaseModel):
    expected_offer_version: int = Field(ge=1)
    expected_job_version: int = Field(ge=1)


@router.post("/admin/assignment-offers/{offer_id}/confirm")
async def confirm_assignment(offer_id: int, data: ConfirmAssignment, response: Response, db: AsyncSession = Depends(get_db), owner: UserResponse = Depends(get_owner_user), idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100)):
    require_fulfillment_enabled()
    _private(response)
    try:
        offer, job = await FulfillmentService(db).confirm_assignment(offer_id, expected_offer_version=data.expected_offer_version, expected_job_version=data.expected_job_version, actor_id=owner.id, idempotency_key=idempotency_key)
    except (FulfillmentConflict, FulfillmentNotFound) as exc:
        _raise(exc)
    return {"offer_id": offer.id, "offer_status": offer.status, "job_id": job.id, "job_status": job.status, "job_version": job.version}


class JobAdvance(BaseModel):
    expected_version: int = Field(ge=1)


async def _advance(job_id: int, command: str, data: JobAdvance, response: Response, db: AsyncSession, provider: BusinessPortalPrincipal, key: str):
    require_fulfillment_enabled()
    _private(response)
    try:
        job = await FulfillmentService(db).provider_advance_job(job_id, relationship_id=provider.relationship_id, command=command, expected_version=data.expected_version, actor_id=provider.user.id, idempotency_key=key)
    except (FulfillmentConflict, FulfillmentNotFound) as exc:
        _raise(exc)
    return {"job_id": job.id, "status": job.status, "version": job.version}


@router.post("/provider/jobs/{job_id}/on-the-way")
async def on_the_way(job_id: int, data: JobAdvance, response: Response, db: AsyncSession = Depends(get_db), provider: BusinessPortalPrincipal = Depends(get_managed_provider), idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100)):
    return await _advance(job_id, "on_the_way", data, response, db, provider, idempotency_key)


@router.post("/provider/jobs/{job_id}/arrive")
async def arrive(job_id: int, data: JobAdvance, response: Response, db: AsyncSession = Depends(get_db), provider: BusinessPortalPrincipal = Depends(get_managed_provider), idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100)):
    return await _advance(job_id, "arrived", data, response, db, provider, idempotency_key)


@router.post("/provider/jobs/{job_id}/start")
async def start_job(job_id: int, data: JobAdvance, response: Response, db: AsyncSession = Depends(get_db), provider: BusinessPortalPrincipal = Depends(get_managed_provider), idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100)):
    return await _advance(job_id, "start", data, response, db, provider, idempotency_key)


@router.get("/provider/offers", response_model=list[OfferResponse])
async def list_provider_offers(response: Response, db: AsyncSession = Depends(get_db), provider: BusinessPortalPrincipal = Depends(get_managed_provider)):
    _private(response)
    require_fulfillment_enabled()
    profile = await _active_provider_profile(db, provider.relationship_id)
    result = await db.execute(select(AssignmentOffer).where(AssignmentOffer.provider_profile_id == profile.id).order_by(AssignmentOffer.created_at.desc()))
    return result.scalars().all()


@router.get("/provider/jobs")
async def list_provider_jobs(response: Response, db: AsyncSession = Depends(get_db), provider: BusinessPortalPrincipal = Depends(get_managed_provider)):
    _private(response)
    require_fulfillment_enabled()
    profile = await _active_provider_profile(db, provider.relationship_id)
    result = await db.execute(
        select(Jobs)
        .join(AssignmentOffer, AssignmentOffer.job_id == Jobs.id)
        .where(
            Jobs.managed_provider_profile_id == profile.id,
            Jobs.status.in_(("confirmed", "on_the_way", "arrived", "in_progress")),
            AssignmentOffer.provider_profile_id == profile.id,
            AssignmentOffer.status == "confirmed",
        )
        .order_by(Jobs.scheduled_for.asc())
    )
    return [{"id": j.id, "title": j.title, "general_area": j.service_area, "scheduled_for": j.scheduled_for, "confirmed_window_end": j.confirmed_window_end, "status": j.status, "version": j.version} for j in result.scalars().all()]


@router.get("/provider/jobs/{job_id}")
async def get_provider_job(job_id: int, response: Response, db: AsyncSession = Depends(get_db), provider: BusinessPortalPrincipal = Depends(get_managed_provider)):
    _private(response)
    require_fulfillment_enabled()
    profile = await _active_provider_profile(db, provider.relationship_id)
    job = await db.scalar(
        select(Jobs)
        .join(AssignmentOffer, AssignmentOffer.job_id == Jobs.id)
        .where(
            Jobs.id == job_id,
            Jobs.managed_provider_profile_id == profile.id,
            Jobs.status.in_(("confirmed", "on_the_way", "arrived", "in_progress")),
            AssignmentOffer.provider_profile_id == profile.id,
            AssignmentOffer.status == "confirmed",
        )
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"id": job.id, "title": job.title, "general_area": job.service_area, "exact_address": None, "phone": job.phone, "scheduled_for": job.scheduled_for, "confirmed_window_end": job.confirmed_window_end, "status": job.status, "version": job.version}
