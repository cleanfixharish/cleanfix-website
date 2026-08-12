from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String


class Services(Base):
    __tablename__ = "services"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name_en = Column(String(200), nullable=False)
    name_he = Column(String(200), nullable=False)
    description_en = Column(String, nullable=True)
    description_he = Column(String, nullable=True)
    icon = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    price_from = Column(Numeric(12, 2), nullable=True)
    price_unit = Column(String(80), nullable=True)
    price_note_en = Column(String(300), nullable=True)
    price_note_he = Column(String(300), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=True, default=True, server_default='true')
    sort_order = Column(Integer, nullable=True, default=0, server_default='0')
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
