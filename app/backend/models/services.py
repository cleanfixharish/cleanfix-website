from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String


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
    is_active = Column(Boolean, nullable=True, default=True, server_default='true')
    sort_order = Column(Integer, nullable=True, default=0, server_default='0')
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)