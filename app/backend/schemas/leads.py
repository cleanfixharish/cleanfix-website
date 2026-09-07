from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_LEAD_DESCRIPTION_LENGTH = 2000
MAX_UTM_SOURCE_LENGTH = 100
MAX_UTM_MEDIUM_LENGTH = 100
MAX_UTM_CAMPAIGN_LENGTH = 200
UTM_TOKEN_PATTERN = r"^[A-Za-z0-9][A-Za-z0-9._~-]*$"


class PublicLeadIntakeRequest(BaseModel):
    """Customer-supplied fields accepted from the anonymous public quote form."""

    customer_name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=1, max_length=50)
    whatsapp: Optional[str] = Field(default=None, max_length=50)
    area: Optional[str] = Field(default=None, max_length=100)
    service_requested: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=MAX_LEAD_DESCRIPTION_LENGTH)
    utm_source: Optional[str] = Field(
        default=None,
        max_length=MAX_UTM_SOURCE_LENGTH,
        pattern=UTM_TOKEN_PATTERN,
    )
    utm_medium: Optional[str] = Field(
        default=None,
        max_length=MAX_UTM_MEDIUM_LENGTH,
        pattern=UTM_TOKEN_PATTERN,
    )
    utm_campaign: Optional[str] = Field(
        default=None,
        max_length=MAX_UTM_CAMPAIGN_LENGTH,
        pattern=UTM_TOKEN_PATTERN,
    )
    # Honeypot field: legitimate users never fill this in.
    company_website: Optional[str] = Field(default=None, max_length=200)

    model_config = ConfigDict(extra="forbid")

    @field_validator("utm_source", "utm_medium", "utm_campaign", mode="before")
    @classmethod
    def strip_empty_utm_values(cls, value):
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None

    @field_validator("utm_source", "utm_medium")
    @classmethod
    def normalize_utm_dimensions(cls, value: Optional[str]) -> Optional[str]:
        return value.lower() if value else value


PUBLIC_LEAD_DEFAULTS = {
    "source": "website",
    "status": "new",
    "assignment": "internal",
    "quote_status": "pending",
    "booking_status": "pending",
    "follow_up_status": "none",
    "priority": "normal",
}


def build_lead_from_public_intake(intake: PublicLeadIntakeRequest) -> dict:
    """Merge customer fields with server-owned CRM defaults."""
    data = intake.model_dump(exclude={"company_website"}, exclude_none=True)
    if not data.get("whatsapp"):
        data["whatsapp"] = data["phone"]
    return {**PUBLIC_LEAD_DEFAULTS, **data}
