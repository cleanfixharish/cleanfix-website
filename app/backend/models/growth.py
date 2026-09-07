from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, Text

from core.database import Base


class GrowthAutomationSettings(Base):
    __tablename__ = "growth_automation_settings"

    id = Column(Integer, primary_key=True, default=1)
    enabled = Column(Boolean, nullable=False, default=False, server_default="false")
    auto_generate = Column(Boolean, nullable=False, default=True, server_default="true")
    auto_publish = Column(Boolean, nullable=False, default=False, server_default="false")
    require_owner_approval = Column(Boolean, nullable=False, default=True, server_default="true")
    timezone = Column(String(80), nullable=False, default="Asia/Jerusalem", server_default="Asia/Jerusalem")
    daily_time = Column(String(5), nullable=False, default="09:00", server_default="09:00")
    daily_post_limit = Column(Integer, nullable=False, default=1, server_default="1")
    lookahead_days = Column(Integer, nullable=False, default=7, server_default="7")
    languages = Column(JSON, nullable=False, default=lambda: ["he", "en"])
    channels = Column(JSON, nullable=False, default=lambda: ["facebook", "instagram"])
    content_pillars = Column(
        JSON,
        nullable=False,
        default=lambda: ["helpful_tip", "service_explainer", "local_trust", "before_you_book"],
    )
    default_cta = Column(String(240), nullable=False, default="Send details for an owner-reviewed quote")
    destination_url = Column(String(500), nullable=False, default="https://cleanfixharish.co.il/quote")
    approved_facts = Column(Text, nullable=True)
    banned_phrases = Column(Text, nullable=True)
    notification_email = Column(String(255), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)


class GrowthPost(Base):
    __tablename__ = "growth_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    campaign_name = Column(String(160), nullable=False)
    topic = Column(String(80), nullable=False)
    audience = Column(String(40), nullable=False, default="customer")
    service = Column(String(120), nullable=True)
    channel = Column(String(40), nullable=False, index=True)
    language = Column(String(8), nullable=False, index=True)
    body = Column(Text, nullable=False)
    alt_text = Column(String(500), nullable=True)
    image_url = Column(String(1000), nullable=True)
    destination_url = Column(String(1000), nullable=False)
    utm_url = Column(String(1200), nullable=False)
    status = Column(String(30), nullable=False, default="draft", server_default="draft", index=True)
    content_version = Column(Integer, nullable=False, default=1, server_default="1")
    approved_version = Column(Integer, nullable=True)
    content_hash = Column(String(64), nullable=False)
    idempotency_key = Column(String(64), nullable=False, unique=True, index=True)
    scheduled_for = Column(DateTime(timezone=True), nullable=True, index=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(String(255), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    remote_id = Column(String(255), nullable=True)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)


class GrowthRun(Base):
    __tablename__ = "growth_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trigger = Column(String(30), nullable=False, default="admin")
    status = Column(String(30), nullable=False, default="running", index=True)
    strategist_summary = Column(Text, nullable=True)
    copywriter_summary = Column(Text, nullable=True)
    policy_summary = Column(Text, nullable=True)
    drafts_created = Column(Integer, nullable=False, default=0, server_default="0")
    started_at = Column(DateTime(timezone=True), default=datetime.now)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    error = Column(Text, nullable=True)
