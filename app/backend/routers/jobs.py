from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.config import settings
from dependencies.auth import get_admin_user, get_owner_user
from schemas.auth import UserResponse
from services.jobs import DuplicateJobCommand, InvalidJobTransition, JobsService

router = APIRouter(
    prefix="/api/v1/entities/jobs",
    tags=["jobs"],
    dependencies=[Depends(get_admin_user)],
)


class JobData(BaseModel):
    lead_id: Optional[int] = None
    provider_id: Optional[int] = None
    customer_name: str
    title: str
    phone: Optional[str] = None
    address: Optional[str] = None
    status: str = "scheduled"
    scheduled_for: Optional[datetime] = None
    price: Optional[Decimal] = None
    notes: Optional[str] = None


class JobUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lead_id: Optional[int] = None
    provider_id: Optional[int] = None
    customer_name: Optional[str] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    price: Optional[Decimal] = None
    notes: Optional[str] = None


class JobResponse(JobData):
    id: int
    booking_id: Optional[int] = None
    quote_id: Optional[int] = None
    managed_provider_profile_id: Optional[int] = None
    service_key: Optional[str] = None
    service_area: Optional[str] = None
    confirmed_window_end: Optional[datetime] = None
    version: int = 1
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    skip: int
    limit: int


class JobEventResponse(BaseModel):
    sequence_number: int
    event_type: str
    occurred_at: datetime
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class JobTransitionCommand(BaseModel):
    new_status: Literal[
        "in_progress",
        "completion_submitted",
        "quality_approved",
        "cancelled",
        "reopened",
    ]
    idempotency_key: str = Field(min_length=8, max_length=100)
    reason: Optional[str] = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def require_reason_for_exception_transitions(self):
        if self.new_status in {"completion_submitted", "quality_approved", "cancelled", "reopened"} and not (self.reason or "").strip():
            raise ValueError("A reason is required for this reviewed job transition")
        return self


@router.get("", response_model=JobListResponse)
async def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=2000),
    sort: str = Query("-created_at"),
    db: AsyncSession = Depends(get_db),
):
    return await JobsService(db).get_list(skip=skip, limit=limit, sort=sort)


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(
    data: JobData,
    db: AsyncSession = Depends(get_db),
    owner: UserResponse = Depends(get_owner_user),
    idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100),
):
    if not settings.fulfillment_enabled:
        if data.status != "scheduled":
            raise HTTPException(status_code=422, detail="New jobs must begin as scheduled")
        try:
            return await JobsService(db).create_with_event(
                data.model_dump(), actor_id=owner.id, actor_role="owner",
                idempotency_key=idempotency_key,
            )
        except DuplicateJobCommand as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
    raise HTTPException(
        status_code=405,
        detail="Manual job creation is retired. Confirm an accepted booking schedule instead.",
    )


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    data: JobUpdate,
    db: AsyncSession = Depends(get_db),
    _owner: UserResponse = Depends(get_owner_user),
):
    existing = await JobsService(db).get_by_id(job_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")
    if existing.booking_id is not None:
        raise HTTPException(status_code=405, detail="Booking-backed jobs may only change through fulfillment commands")
    updates = {key: value for key, value in data.model_dump().items() if value is not None}
    job = await JobsService(db).update(job_id, updates)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/{job_id}/transitions", response_model=JobResponse)
async def transition_job(
    job_id: int,
    command: JobTransitionCommand,
    db: AsyncSession = Depends(get_db),
    owner: UserResponse = Depends(get_owner_user),
):
    existing = await JobsService(db).get_by_id(job_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")
    if existing.booking_id is not None:
        raise HTTPException(status_code=405, detail="Booking-backed jobs may only change through fulfillment commands")
    try:
        job = await JobsService(db).transition(
            job_id,
            command.new_status,
            actor_id=owner.id,
            actor_role="owner",
            idempotency_key=command.idempotency_key,
            reason=command.reason,
        )
    except InvalidJobTransition as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except DuplicateJobCommand as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{job_id}/events", response_model=List[JobEventResponse])
async def list_job_events(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    _owner: UserResponse = Depends(get_owner_user),
):
    if not await JobsService(db).get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    return await JobsService(db).get_events(job_id)


@router.delete("/{job_id}", status_code=405)
async def delete_job(job_id: int):
    raise HTTPException(
        status_code=405,
        detail="Jobs are permanent records. Record a cancellation transition instead.",
    )
