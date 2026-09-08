from fastapi import APIRouter, Depends
from decimal import Decimal

from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from models.bookings import Booking


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

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=list[BookingResponse])
async def list_bookings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).order_by(Booking.created_at.desc()))
    return result.scalars().all()
