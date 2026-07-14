from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func


class AccountProfile(Base):
    __tablename__ = "account_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), unique=True, index=True, nullable=False)
    account_type = Column(String(20), nullable=False)  # customer/business
    display_name = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=False)
    area = Column(String(100), nullable=True)
    preferred_language = Column(String(5), nullable=False, server_default="en")
    whatsapp_opt_in = Column(Boolean, nullable=False, server_default="false")
    vip_number = Column(String(30), unique=True, index=True, nullable=False)
    business_name = Column(String(200), nullable=True)
    business_category = Column(String(150), nullable=True)
    business_description = Column(Text, nullable=True)
    application_status = Column(String(30), nullable=False, server_default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
