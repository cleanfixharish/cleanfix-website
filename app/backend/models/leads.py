from core.database import Base
from datetime import datetime
from sqlalchemy import Column, Date, DateTime, Integer, String


class Leads(Base):
    __tablename__ = "leads"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    customer_name = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=False)
    whatsapp = Column(String(50), nullable=True)
    email = Column(String(200), nullable=True)
    area = Column(String(100), nullable=True)
    service_requested = Column(String(200), nullable=True)
    description = Column(String, nullable=True)
    source = Column(String(100), nullable=True)
    status = Column(String(50), nullable=True, default='new', server_default='new')
    assignment = Column(String(50), nullable=True)
    assigned_partner_id = Column(Integer, nullable=True)
    quote_status = Column(String(50), nullable=True)
    booking_status = Column(String(50), nullable=True)
    follow_up_status = Column(String(50), nullable=True)
    follow_up_date = Column(Date, nullable=True)
    notes = Column(String, nullable=True)
    outcome = Column(String(100), nullable=True)
    priority = Column(String(20), nullable=True, default='normal', server_default='normal')
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)