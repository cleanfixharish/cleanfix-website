from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

MAX_LEAD_DESCRIPTION_LENGTH = 2000


class PublicLeadIntakeRequest(BaseModel):
    """Customer-supplied fields accepted from the anonymous public quote form."""

    customer_name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=1, max_length=50)
    whatsapp: Optional[str] = Field(default=None, max_length=50)
    area: Optional[str] = Field(default=None, max_length=100)
    service_requested: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=MAX_LEAD_DESCRIPTION_LENGTH)
    # Honeypot field: legitimate users never fill this in.
    company_website: Optional[str] = Field(default=None, max_length=200)

    model_config = ConfigDict(extra="forbid")


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
