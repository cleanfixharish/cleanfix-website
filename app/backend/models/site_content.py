from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Site_content(Base):
    __tablename__ = "site_content"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    section_key = Column(String(100), nullable=False)
    title_en = Column(String(300), nullable=True)
    title_he = Column(String(300), nullable=True)
    content_en = Column(String, nullable=True)
    content_he = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=True, default=True, server_default='true')
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)