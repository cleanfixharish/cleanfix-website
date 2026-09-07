from datetime import datetime
from typing import Literal, Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, Field, field_validator, model_validator


Channel = Literal["facebook", "instagram", "x", "manual_share"]
Language = Literal["he", "en"]


class GrowthSettingsData(BaseModel):
    enabled: bool = False
    auto_generate: bool = True
    auto_publish: bool = False
    require_owner_approval: bool = True
    timezone: str = "Asia/Jerusalem"
    daily_time: str = "09:00"
    daily_post_limit: int = Field(default=1, ge=1, le=5)
    lookahead_days: int = Field(default=7, ge=1, le=30)
    languages: list[Language] = Field(default_factory=lambda: ["he", "en"], min_length=1)
    channels: list[Channel] = Field(default_factory=lambda: ["facebook", "instagram"], min_length=1)
    content_pillars: list[str] = Field(
        default_factory=lambda: ["helpful_tip", "service_explainer", "local_trust", "before_you_book"],
        min_length=1,
        max_length=12,
    )
    default_cta: str = Field(default="Send details for an owner-reviewed quote", min_length=5, max_length=240)
    destination_url: str = Field(default="https://cleanfixharish.co.il/quote", max_length=500)
    approved_facts: Optional[str] = Field(default=None, max_length=5000)
    banned_phrases: Optional[str] = Field(default=None, max_length=2000)
    notification_email: Optional[str] = Field(default=None, max_length=255)

    @field_validator("daily_time")
    @classmethod
    def validate_time(cls, value: str) -> str:
        parts = value.split(":")
        if len(parts) != 2 or not all(part.isdigit() for part in parts):
            raise ValueError("daily_time must use HH:MM")
        hour, minute = map(int, parts)
        if hour > 23 or minute > 59:
            raise ValueError("daily_time must use HH:MM")
        return f"{hour:02d}:{minute:02d}"

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("timezone must be a valid IANA timezone") from exc
        return value

    @model_validator(mode="after")
    def enforce_safe_automation(self):
        if not self.require_owner_approval:
            raise ValueError("Owner approval is mandatory for public marketing")
        if self.auto_publish:
            raise ValueError("Connect and verify an official channel before enabling automatic publishing")
        return self


class GrowthSettingsResponse(GrowthSettingsData):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GrowthPostCreate(BaseModel):
    campaign_name: str = Field(min_length=3, max_length=160)
    topic: str = Field(min_length=2, max_length=80)
    audience: Literal["customer", "provider", "partner"] = "customer"
    service: Optional[str] = Field(default=None, max_length=120)
    channel: Channel
    language: Language
    body: str = Field(min_length=20, max_length=5000)
    alt_text: Optional[str] = Field(default=None, max_length=500)
    image_url: Optional[str] = Field(default=None, max_length=1000)
    destination_url: str = Field(max_length=1000)
    scheduled_for: Optional[datetime] = None


class GrowthPostUpdate(BaseModel):
    body: Optional[str] = Field(default=None, min_length=20, max_length=5000)
    alt_text: Optional[str] = Field(default=None, max_length=500)
    image_url: Optional[str] = Field(default=None, max_length=1000)
    destination_url: Optional[str] = Field(default=None, max_length=1000)
    scheduled_for: Optional[datetime] = None


class GrowthScheduleRequest(BaseModel):
    scheduled_for: datetime


class GrowthPostResponse(BaseModel):
    id: int
    campaign_name: str
    topic: str
    audience: str
    service: Optional[str]
    channel: str
    language: str
    body: str
    alt_text: Optional[str]
    image_url: Optional[str]
    destination_url: str
    utm_url: str
    status: str
    content_version: int
    approved_version: Optional[int]
    scheduled_for: Optional[datetime]
    approved_at: Optional[datetime]
    approved_by: Optional[str]
    published_at: Optional[datetime]
    remote_id: Optional[str]
    last_error: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class GrowthRunResponse(BaseModel):
    id: int
    trigger: str
    status: str
    strategist_summary: Optional[str]
    copywriter_summary: Optional[str]
    policy_summary: Optional[str]
    drafts_created: int
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    error: Optional[str]

    class Config:
        from_attributes = True
