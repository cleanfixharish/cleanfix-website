from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.config import settings
from dependencies.auth import get_admin_user, get_owner_user
from models.bookings import Booking
from schemas.auth import UserResponse
from services.fulfillment import FulfillmentConflict, FulfillmentNotFound, FulfillmentService


router = APIRouter(
    prefix="/api/v1/bookings",
    tags=["bookings"],
    dependencies=[Depends(get_admin_user)],
)


class BookingResponse(BaseModel):
    id: int
    quote_id: int
    lead_id: int | None
    status: str
    quoted_total_snapshot: Decimal
    deposit_required_snapshot: Decimal | None
    currency: str
    scope_snapshot: str
    exclusions_snapshot: str | None
    terms_snapshot: str | None
    service_key: str | None = None
    service_area: str | None = None
    timezone: str | None = None
    confirmed_window_start: datetime | None = None
    confirmed_window_end: datetime | None = None
    version: int

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=list[BookingResponse])
async def list_bookings(response: Response, db: AsyncSession = Depends(get_db)):
    response.headers["Cache-Control"] = "private, no-store"
    result = await db.execute(select(Booking).order_by(Booking.created_at.desc()))
    return result.scalars().all()


class ConfirmScheduleCommand(BaseModel):
    model_config = ConfigDict(extra="forbid")
    window_start: datetime
    window_end: datetime
    timezone: str = Field(min_length=1, max_length=80)
    expected_version: int = Field(ge=1)


class ConfirmScheduleResponse(BaseModel):
    booking: BookingResponse
    job_id: int
    job_status: str


@router.post("/{booking_id}/confirm-schedule", response_model=ConfirmScheduleResponse)
async def confirm_schedule(
    booking_id: int,
    command: ConfirmScheduleCommand,
    response: Response,
    db: AsyncSession = Depends(get_db),
    owner: UserResponse = Depends(get_owner_user),
    idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100),
):
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["Pragma"] = "no-cache"
    if not settings.fulfillment_enabled:
        raise HTTPException(status_code=503, detail="Fulfillment is not enabled")
    try:
        booking, job = await FulfillmentService(db).confirm_booking_schedule(
            booking_id, start=command.window_start, end=command.window_end,
            timezone_name=command.timezone, expected_version=command.expected_version,
            actor_id=owner.id, idempotency_key=idempotency_key,
        )
    except FulfillmentNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except FulfillmentConflict as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"booking": booking, "job_id": job.id, "job_status": job.status}
