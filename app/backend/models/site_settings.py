from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from core.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, nullable=False, default=1)
    primary_color = Column(String(20), nullable=False, default="#102E38", server_default="#102E38")
    accent_color = Column(String(20), nullable=False, default="#B8842F", server_default="#B8842F")
    surface_color = Column(String(20), nullable=False, default="#F7F2EA", server_default="#F7F2EA")
    hero_image_url = Column(String(500), nullable=True)
    cta_image_url = Column(String(500), nullable=True)
    hero_layout = Column(String(30), nullable=False, default="text-left", server_default="text-left")
    primary_cta_en = Column(String(100), nullable=True)
    primary_cta_he = Column(String(100), nullable=True)
    secondary_cta_en = Column(String(100), nullable=True)
    secondary_cta_he = Column(String(100), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
