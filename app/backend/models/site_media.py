from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, LargeBinary, String

from core.database import Base


class SiteMedia(Base):
    __tablename__ = "site_media"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    alt_text = Column(String(300), nullable=True)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
