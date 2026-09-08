from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String

from core.database import Base


class Jobs(Base):
    __tablename__ = "jobs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    lead_id = Column(Integer, nullable=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=True, unique=True, index=True)
    quote_id = Column(Integer, ForeignKey("service_quotes.id", ondelete="RESTRICT"), nullable=True, index=True)
    provider_id = Column(Integer, nullable=True, index=True)
    managed_provider_profile_id = Column(Integer, ForeignKey("managed_provider_profiles.id", ondelete="RESTRICT"), nullable=True, index=True)
    customer_name = Column(String(200), nullable=False)
    title = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(String(300), nullable=True)
    status = Column(String(50), nullable=False, default="unassigned", server_default="unassigned")
    service_key = Column(String(120), nullable=True, index=True)
    service_area = Column(String(120), nullable=True, index=True)
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    confirmed_window_end = Column(DateTime(timezone=True), nullable=True)
    assignment_confirmed_at = Column(DateTime(timezone=True), nullable=True)
    on_the_way_at = Column(DateTime(timezone=True), nullable=True)
    arrived_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    version = Column(Integer, nullable=False, default=1, server_default="1")
    price = Column(Numeric(12, 2), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
