from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from core.database import Base


class WebsiteRestorePoint(Base):
    __tablename__ = "website_restore_points"

    id = Column(Integer, primary_key=True, nullable=False, default=1)
    name = Column(String(120), nullable=False, default="Original working website")
    payload = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now, nullable=False)
