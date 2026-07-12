from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Partners(Base):
    __tablename__ = "partners"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(String(200), nullable=False)
    business_type = Column(String(100), nullable=True)
    description_en = Column(String, nullable=True)
    description_he = Column(String, nullable=True)
    phone = Column(String(50), nullable=True)
    whatsapp = Column(String(50), nullable=True)
    email = Column(String(200), nullable=True)
    address = Column(String(300), nullable=True)
    area = Column(String(100), nullable=True)
    partner_type = Column(String(50), nullable=False)
    is_active = Column(Boolean, nullable=True, default=True, server_default='true')
    sort_order = Column(Integer, nullable=True, default=0, server_default='0')
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)