import hashlib
import secrets
from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
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
    }


@admin_router.post("", status_code=201)
async def create_quote(
    data: QuoteCreate,
    admin: UserResponse = Depends(get_admin_user),
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
    await db.commit()
    await db.refresh(quote)
    return quote


@admin_router.get("")
async def list_quotes(db: AsyncSession = Depends(get_db)):
    rows = (
        await db.execute(select(ServiceQuote).order_by(ServiceQuote.created_at.desc()))
    ).scalars().all()
    return {"items": rows, "total": len(rows)}


@admin_router.post("/{quote_id}/publish")
async def publish_quote(quote_id: int, db: AsyncSession = Depends(get_db)):
    quote = await db.get(ServiceQuote, quote_id)
    if quote is None:
        raise HTTPException(404, "Quote not found")
    if quote.status != "draft":
        raise HTTPException(409, "Only a draft quote can be published")
    if quote_is_expired(quote.expires_at):
        raise HTTPException(409, "This quote has already expired")

    raw_token = secrets.token_urlsafe(32)
    quote.public_token_hash = hash_quote_token(raw_token)
    quote.status = "published"
    quote.published_at = datetime.now(timezone.utc)
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
    if quote_is_expired(quote.expires_at) and quote.status == "published":
        quote.status = "expired"
        await db.commit()
    return quote


@public_router.get("/{token}")
async def view_public_quote(
    token: str = Path(min_length=32, max_length=128),
    db: AsyncSession = Depends(get_db),
):
    quote = await _quote_from_token(token, db)
    return public_quote_payload(quote)


@public_router.post("/{token}/decision")
async def decide_public_quote(
    data: CustomerDecision,
    token: str = Path(min_length=32, max_length=128),
    db: AsyncSession = Depends(get_db),
):
    quote = await _quote_from_token(token, db)
    if quote.status == "expired":
        raise HTTPException(409, "This quote has expired")
    try:
        quote.status = apply_customer_decision(quote.status, data.decision)
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc

    now = datetime.now(timezone.utc)
    if quote.status == "accepted":
        quote.accepted_at = quote.accepted_at or now
    else:
        quote.declined_at = quote.declined_at or now

    if quote.lead_id is not None:
        lead = await db.get(Leads, quote.lead_id)
        if lead is not None:
            lead.quote_status = quote.status
            if quote.status == "accepted":
                lead.booking_status = "pending"
    await db.commit()
    await db.refresh(quote)
    return public_quote_payload(quote)
