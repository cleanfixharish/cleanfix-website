from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Identity,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)

from core.database import Base


class Booking(Base):
    """Authoritative post-acceptance record; acceptance is not payment or scheduling."""

    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint(
            "status IN ('awaiting_deposit', 'awaiting_schedule', 'confirmed', "
            "'reschedule_requested', 'cancelled')",
            name="ck_bookings_status",
        ),
        UniqueConstraint("quote_id", name="uq_bookings_quote_id"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    quote_id = Column(Integer, ForeignKey("service_quotes.id", ondelete="RESTRICT"), nullable=False, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="RESTRICT"), nullable=True, index=True)
    status = Column(String(30), nullable=False, index=True)
    quoted_total_snapshot = Column(Numeric(12, 2), nullable=False)
    deposit_required_snapshot = Column(Numeric(12, 2), nullable=True)
    currency = Column(String(3), nullable=False, default="ILS", server_default="ILS")
    scope_snapshot = Column(Text, nullable=False)
    exclusions_snapshot = Column(Text, nullable=True)
    terms_snapshot = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now, server_default=func.now())


class QuoteEvent(Base):
    """Append-only evidence of material owner and customer quote actions."""

    __tablename__ = "quote_events"
    __table_args__ = (
        CheckConstraint(
            "event_type IN ('quote_created', 'owner_approved', 'published', 'accepted', 'declined')",
            name="ck_quote_events_type",
        ),
        UniqueConstraint("idempotency_key", name="uq_quote_events_idempotency"),
    )

    id = Column(BigInteger().with_variant(Integer(), "sqlite"), Identity(), primary_key=True)
    quote_id = Column(Integer, ForeignKey("service_quotes.id", ondelete="RESTRICT"), nullable=False, index=True)
    event_type = Column(String(30), nullable=False)
    actor_type = Column(String(30), nullable=False)
    actor_id = Column(String(255), nullable=False)
    actor_role = Column(String(30), nullable=False)
    previous_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    idempotency_key = Column(String(100), nullable=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
