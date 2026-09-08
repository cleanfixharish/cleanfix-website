import hashlib
import secrets
from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Path, Response
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_owner_user
from models.bookings import Booking, QuoteEvent
from models.leads import Leads
from models.pricing import PriceEstimate, ServiceQuote
from schemas.auth import UserResponse


admin_router = APIRouter(
    prefix="/api/v1/quotes",
    tags=["quotes"],
    dependencies=[Depends(get_admin_user)],
)
public_router = APIRouter(prefix="/api/v1/public/quotes", tags=["public-quotes"])


def hash_quote_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def quote_is_expired(expires_at: datetime, now: Optional[datetime] = None) -> bool:
    comparison = now or datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return comparison >= expires_at


def apply_customer_decision(current_status: str, decision: str) -> str:
    if current_status == "accepted" and decision == "accept":
        return "accepted"
    if current_status == "declined" and decision == "decline":
        return "declined"
    if current_status != "published":
        raise ValueError("Only a published quote can be accepted or declined")
    return "accepted" if decision == "accept" else "declined"


def booking_status_for_deposit(deposit_required: Optional[Decimal]) -> str:
    return "awaiting_deposit" if (deposit_required or Decimal("0")) > 0 else "awaiting_schedule"


class QuoteCreate(BaseModel):
    estimate_id: int
    quoted_total: Decimal = Field(gt=0)
    deposit_required: Optional[Decimal] = Field(default=None, ge=0)
    scope: str = Field(min_length=10, max_length=5000)
    exclusions: Optional[str] = Field(default=None, max_length=5000)
    terms: Optional[str] = Field(default=None, max_length=5000)
    expires_at: datetime

    @model_validator(mode="after")
    def validate_quote(self):
        if self.deposit_required is not None and self.deposit_required > self.quoted_total:
            raise ValueError("deposit_required cannot exceed quoted_total")
        if quote_is_expired(self.expires_at):
            raise ValueError("expires_at must be in the future")
        return self


class CustomerDecision(BaseModel):
    decision: Literal["accept", "decline"]


def public_quote_payload(quote: ServiceQuote) -> dict:
    """Return only fields the customer is allowed to see."""
    return {
        "id": quote.id,
        "quoted_total": quote.quoted_total,
        "deposit_required": quote.deposit_required,
        "scope": quote.scope,
        "exclusions": quote.exclusions,
        "terms": quote.terms,
        "status": quote.status,
        "expires_at": quote.expires_at,
        "published_at": quote.published_at,
        "accepted_at": quote.accepted_at,
        "declined_at": quote.declined_at,
        "currency": "ILS",
        "notice": "This quote is valid only for the written scope and until the expiry time shown.",
        "next_step": "Acceptance records a booking request. It does not collect payment, confirm a schedule, or assign a provider.",
    }


def set_private_quote_headers(response: Response) -> None:
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["Pragma"] = "no-cache"
    response.headers["Referrer-Policy"] = "no-referrer"


@admin_router.post("", status_code=201)
async def create_quote(
    data: QuoteCreate,
    admin: UserResponse = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    estimate = await db.get(PriceEstimate, data.estimate_id)
    if estimate is None:
        raise HTTPException(404, "Estimate not found")
    if estimate.status != "approved":
        raise HTTPException(409, "The estimate must be owner-approved before a quote is created")
    existing = (
        await db.execute(select(ServiceQuote).where(ServiceQuote.estimate_id == estimate.id))
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(409, "A quote already exists for this estimate")

    quote = ServiceQuote(
        **data.model_dump(),
        lead_id=estimate.lead_id,
        status="draft",
        created_by=admin.email,
    )
    db.add(quote)
    await db.flush()
    db.add(
        QuoteEvent(
            quote_id=quote.id,
            event_type="quote_created",
            actor_type="user",
            actor_id=admin.id,
            actor_role="owner",
            previous_status=None,
            new_status="draft",
        )
    )
    await db.commit()
    await db.refresh(quote)
    return quote


@admin_router.get("")
async def list_quotes(db: AsyncSession = Depends(get_db)):
    rows = (
        await db.execute(select(ServiceQuote).order_by(ServiceQuote.created_at.desc()))
    ).scalars().all()
    return {"items": rows, "total": len(rows)}


@admin_router.post("/{quote_id}/approve")
async def approve_quote(
    quote_id: int,
    owner: UserResponse = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    quote = (
        await db.execute(
            select(ServiceQuote).where(ServiceQuote.id == quote_id).with_for_update()
        )
    ).scalar_one_or_none()
    if quote is None:
        raise HTTPException(404, "Quote not found")
    if quote.status != "draft":
        raise HTTPException(409, "Only a draft quote can be owner-approved")
    if quote_is_expired(quote.expires_at):
        raise HTTPException(409, "This quote has already expired")
    quote.status = "owner_approved"
    quote.approved_by = owner.email
    quote.approved_at = datetime.now(timezone.utc)
    db.add(
        QuoteEvent(
            quote_id=quote.id,
            event_type="owner_approved",
            actor_type="user",
            actor_id=owner.id,
            actor_role="owner",
            previous_status="draft",
            new_status="owner_approved",
        )
    )
    await db.commit()
    await db.refresh(quote)
    return quote


@admin_router.post("/{quote_id}/publish")
async def publish_quote(
    quote_id: int,
    owner: UserResponse = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    quote = (
        await db.execute(
            select(ServiceQuote).where(ServiceQuote.id == quote_id).with_for_update()
        )
    ).scalar_one_or_none()
    if quote is None:
        raise HTTPException(404, "Quote not found")
    if quote.status != "owner_approved":
        raise HTTPException(409, "Only an owner-approved quote can be published")
    if quote_is_expired(quote.expires_at):
        raise HTTPException(409, "This quote has already expired")

    raw_token = secrets.token_urlsafe(32)
    quote.public_token_hash = hash_quote_token(raw_token)
    quote.status = "published"
    quote.published_at = datetime.now(timezone.utc)
    db.add(
        QuoteEvent(
            quote_id=quote.id,
            event_type="published",
            actor_type="user",
            actor_id=owner.id,
            actor_role="owner",
            previous_status="owner_approved",
            new_status="published",
        )
    )
    if quote.lead_id is not None:
        lead = await db.get(Leads, quote.lead_id)
        if lead is not None:
            lead.quote_status = "sent"
    await db.commit()
    return {
        "id": quote.id,
        "status": quote.status,
        "customer_access_token": raw_token,
        "public_path": f"/quote/{raw_token}",
        "warning": "This access token is shown once. Send it only to the intended customer.",
    }


async def _quote_from_token(token: str, db: AsyncSession) -> ServiceQuote:
    token_hash = hash_quote_token(token)
    quote = (
        await db.execute(
            select(ServiceQuote).where(ServiceQuote.public_token_hash == token_hash)
        )
    ).scalar_one_or_none()
    if quote is None:
        raise HTTPException(404, "Quote not found")
    return quote


@public_router.get("/{token}")
async def view_public_quote(
    response: Response,
    token: str = Path(min_length=32, max_length=128),
    db: AsyncSession = Depends(get_db),
):
    quote = await _quote_from_token(token, db)
    set_private_quote_headers(response)
    payload = public_quote_payload(quote)
    if quote.status == "published" and quote_is_expired(quote.expires_at):
        payload["status"] = "expired"
    return payload


@public_router.post("/{token}/decision")
async def decide_public_quote(
    response: Response,
    data: CustomerDecision,
    token: str = Path(min_length=32, max_length=128),
    idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=100),
    db: AsyncSession = Depends(get_db),
):
    set_private_quote_headers(response)
    token_hash = hash_quote_token(token)
    quote = (
        await db.execute(
            select(ServiceQuote)
            .where(ServiceQuote.public_token_hash == token_hash)
            .with_for_update()
        )
    ).scalar_one_or_none()
    if quote is None:
        raise HTTPException(404, "Quote not found")
    previous_event = (
        await db.execute(
            select(QuoteEvent).where(
                QuoteEvent.idempotency_key == idempotency_key
            )
        )
    ).scalar_one_or_none()
    decision_event_type = "accepted" if data.decision == "accept" else "declined"
    if previous_event is not None:
        if previous_event.quote_id != quote.id or previous_event.event_type != decision_event_type:
            raise HTTPException(409, "This command key was already used for a different decision")
        return public_quote_payload(quote)
    if quote_is_expired(quote.expires_at):
        raise HTTPException(409, "This quote has expired")
    previous_status = quote.status
    try:
        quote.status = apply_customer_decision(quote.status, data.decision)
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc

    now = datetime.now(timezone.utc)
    if quote.status == "accepted":
        quote.accepted_at = quote.accepted_at or now
        existing_booking = (
            await db.execute(select(Booking).where(Booking.quote_id == quote.id))
        ).scalar_one_or_none()
        if existing_booking is None:
            deposit = quote.deposit_required or Decimal("0")
            db.add(
                Booking(
                    quote_id=quote.id,
                    lead_id=quote.lead_id,
                    status=booking_status_for_deposit(deposit),
                    quoted_total_snapshot=quote.quoted_total,
                    deposit_required_snapshot=quote.deposit_required,
                    scope_snapshot=quote.scope,
                    exclusions_snapshot=quote.exclusions,
                    terms_snapshot=quote.terms,
                )
            )
    else:
        quote.declined_at = quote.declined_at or now

    db.add(
        QuoteEvent(
            quote_id=quote.id,
            event_type=decision_event_type,
            actor_type="private_quote_link",
            actor_id=f"quote-link:{token_hash[:12]}",
            actor_role="customer",
            previous_status=previous_status,
            new_status=quote.status,
            idempotency_key=idempotency_key,
            occurred_at=now,
        )
    )

    if quote.lead_id is not None:
        lead = await db.get(Leads, quote.lead_id)
        if lead is not None:
            lead.quote_status = quote.status
            if quote.status == "accepted":
                lead.booking_status = booking_status_for_deposit(quote.deposit_required)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(409, "The quote decision was already recorded") from exc
    await db.refresh(quote)
    return public_quote_payload(quote)
