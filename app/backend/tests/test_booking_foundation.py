from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from fastapi import HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from core.database import Base
from models.bookings import Booking, QuoteEvent
from models.leads import Leads
from models.pricing import PriceEstimate, PriceObservation, PricingSource, ServiceQuote
from routers.quotes import (
    CustomerDecision,
    decide_public_quote,
    hash_quote_token,
    set_private_quote_headers,
)


def test_booking_has_one_record_per_accepted_quote_and_snapshot_fields():
    constraints = {constraint.name for constraint in Booking.__table__.constraints}
    columns = set(Booking.__table__.columns.keys())

    assert "uq_bookings_quote_id" in constraints
    assert "ck_bookings_status" in constraints
    assert {
        "quoted_total_snapshot",
        "deposit_required_snapshot",
        "scope_snapshot",
        "exclusions_snapshot",
        "terms_snapshot",
    } <= columns


def test_quote_actions_are_idempotent_append_only_records():
    constraints = {constraint.name for constraint in QuoteEvent.__table__.constraints}
    assert "uq_quote_events_idempotency" in constraints
    assert "ck_quote_events_type" in constraints


def test_private_quote_responses_disable_caching_and_referrers():
    response = Response()
    set_private_quote_headers(response)

    assert response.headers["cache-control"] == "private, no-store"
    assert response.headers["pragma"] == "no-cache"
    assert response.headers["referrer-policy"] == "no-referrer"


@pytest.mark.asyncio
async def test_acceptance_atomically_creates_one_booking_and_one_decision():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    tables = [
        Leads.__table__,
        PricingSource.__table__,
        PriceObservation.__table__,
        PriceEstimate.__table__,
        ServiceQuote.__table__,
        Booking.__table__,
        QuoteEvent.__table__,
    ]
    async with engine.begin() as connection:
        await connection.run_sync(
            lambda sync_connection: Base.metadata.create_all(sync_connection, tables=tables)
        )

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    token = "a" * 48
    async with session_factory() as db:
        lead = Leads(customer_name="Synthetic Customer", phone="000", status="new")
        db.add(lead)
        await db.flush()
        quote = ServiceQuote(
            estimate_id=1,
            lead_id=lead.id,
            quoted_total=Decimal("500"),
            deposit_required=Decimal("100"),
            scope="Synthetic bounded service scope",
            exclusions="No additional work",
            terms="Synthetic test terms",
            status="published",
            public_token_hash=hash_quote_token(token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
            created_by="owner@example.invalid",
        )
        db.add(quote)
        await db.commit()

        response = Response()
        payload = await decide_public_quote(
            response=response,
            data=CustomerDecision(decision="accept"),
            token=token,
            idempotency_key="booking-test-key-1",
            db=db,
        )
        replay = await decide_public_quote(
            response=Response(),
            data=CustomerDecision(decision="accept"),
            token=token,
            idempotency_key="booking-test-key-1",
            db=db,
        )

        booking = (await db.execute(select(Booking))).scalar_one()
        assert payload["status"] == replay["status"] == "accepted"
        assert booking.status == "awaiting_deposit"
        assert booking.scope_snapshot == quote.scope
        assert await db.scalar(select(func.count(Booking.id))) == 1
        assert await db.scalar(select(func.count(QuoteEvent.id))) == 1

        with pytest.raises(HTTPException) as conflict:
            await decide_public_quote(
                response=Response(),
                data=CustomerDecision(decision="decline"),
                token=token,
                idempotency_key="booking-test-key-1",
                db=db,
            )
        assert conflict.value.status_code == 409

    await engine.dispose()
