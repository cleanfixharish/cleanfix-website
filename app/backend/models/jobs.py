from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, Numeric, String

from core.database import Base


class Jobs(Base):
    __tablename__ = "jobs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    lead_id = Column(Integer, nullable=True, index=True)
    provider_id = Column(Integer, nullable=True, index=True)
    customer_name = Column(String(200), nullable=False)
    title = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(String(300), nullable=True)
    status = Column(String(50), nullable=False, default="scheduled", server_default="scheduled")
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    price = Column(Numeric(12, 2), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
