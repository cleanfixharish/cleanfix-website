import secrets
from datetime import datetime
from typing import List, Literal, Optional

from core.database import get_db
from dependencies.auth import get_admin_user, get_current_user
from fastapi import APIRouter, Depends, HTTPException, Response, status
from models.account_profile import AccountProfile
from models.auth import User
from pydantic import BaseModel, Field
from schemas.auth import UserResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/account", tags=["account"])

PRIVILEGED_DIRECTORY_ROLES = {"admin", "viewer"}


class AccountProfileUpdate(BaseModel):
    account_type: Literal["customer", "business"]
    display_name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=8, max_length=50)
    area: Optional[str] = Field(default="Harish", max_length=100)
    preferred_language: Literal["en", "he"] = "en"
    whatsapp_opt_in: bool = False
    business_name: Optional[str] = Field(default=None, max_length=200)
    business_category: Optional[str] = Field(default=None, max_length=150)
    business_description: Optional[str] = Field(default=None, max_length=2000)


class AccountProfileResponse(AccountProfileUpdate):
    id: int
    email: str
    account_number: str
    application_status: str


class AdminAccountProfileResponse(BaseModel):
    id: int = 0
    user_id: str
    email: str = ""
    account_type: str = "customer"
    display_name: str = ""
    phone: str = ""
    area: Optional[str] = "Harish"
    preferred_language: str = "en"
    whatsapp_opt_in: bool = False
    account_number: str = ""
    business_name: Optional[str] = None
    business_category: Optional[str] = None
    business_description: Optional[str] = None
    application_status: str = "setup_incomplete"
    created_at: Optional[datetime] = None


async def find_profile(db: AsyncSession, user_id: str):
    result = await db.execute(select(AccountProfile).where(AccountProfile.user_id == user_id))
    return result.scalar_one_or_none()


def _directory_display_name(user: User, profile: Optional[AccountProfile]) -> str:
    if profile and (profile.display_name or "").strip():
        return profile.display_name.strip()
    name = (getattr(user, "name", None) or "").strip()
    if name:
        return name
    email = (getattr(user, "email", None) or "").strip()
    if "@" in email:
        return email.split("@", 1)[0]
    return email or "Customer"


def build_admin_directory_entry(
    user: User, profile: Optional[AccountProfile] = None
) -> AdminAccountProfileResponse:
    """Map a registered user, with or without a completed profile, for the owner directory."""
    email = (getattr(user, "email", None) or "").strip()
    created_at = getattr(user, "created_at", None) or getattr(user, "last_login", None)
    if not profile:
        return AdminAccountProfileResponse(
            id=0,
            user_id=user.id,
            email=email,
            display_name=_directory_display_name(user, None),
            created_at=created_at,
        )
    return AdminAccountProfileResponse(
        id=profile.id or 0,
        user_id=getattr(user, "id", None) or profile.user_id,
        email=email,
        account_type=profile.account_type or "customer",
        display_name=_directory_display_name(user, profile),
        phone=profile.phone or "",
        area=profile.area or "Harish",
        preferred_language=profile.preferred_language or "en",
        whatsapp_opt_in=bool(profile.whatsapp_opt_in),
        account_number=profile.account_number or "",
        business_name=profile.business_name,
        business_category=profile.business_category,
        business_description=profile.business_description,
        application_status=profile.application_status or "active",
        created_at=profile.created_at or created_at,
    )


def response(profile: AccountProfile, email: str) -> AccountProfileResponse:
    return AccountProfileResponse(
        id=profile.id,
        email=email,
        account_type=profile.account_type,
        display_name=profile.display_name,
        phone=profile.phone,
        area=profile.area,
        preferred_language=profile.preferred_language,
        whatsapp_opt_in=profile.whatsapp_opt_in,
        account_number=profile.account_number,
        business_name=profile.business_name,
        business_category=profile.business_category,
        business_description=profile.business_description,
        application_status=profile.application_status,
    )


@router.get("/profile", response_model=AccountProfileResponse)
async def get_account_profile(
    db: AsyncSession = Depends(get_db), current_user: UserResponse = Depends(get_current_user)
):
    profile = await find_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account setup is incomplete")
    return response(profile, current_user.email)


@router.get(
    "/profiles",
    response_model=List[AdminAccountProfileResponse],
    dependencies=[Depends(get_admin_user)],
)
async def list_account_profiles(response: Response, db: AsyncSession = Depends(get_db)):
    """Return real customer and provider registrations to the owner dashboard.

    Google sign-in creates a user immediately. The owner directory must show that
    registration even before the customer finishes the account-profile form.
    """
    response.headers["Cache-Control"] = "private, no-store"
    result = await db.execute(
        select(User, AccountProfile)
        .outerjoin(AccountProfile, AccountProfile.user_id == User.id)
        .where(~User.role.in_(PRIVILEGED_DIRECTORY_ROLES))
        .order_by(
            func.coalesce(AccountProfile.created_at, User.created_at, User.last_login).desc(),
            User.id.desc(),
        )
    )
    return [build_admin_directory_entry(user, profile) for user, profile in result.all()]


@router.put("/profile", response_model=AccountProfileResponse)
async def upsert_account_profile(
    data: AccountProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    if data.account_type == "business" and not data.business_name:
        raise HTTPException(status_code=422, detail="Business name is required for a business account")

    profile = await find_profile(db, current_user.id)
    values = data.model_dump()
    values["application_status"] = "pending" if data.account_type == "business" else "active"
    if profile:
        for key, value in values.items():
            setattr(profile, key, value)
    else:
        profile = AccountProfile(
            user_id=current_user.id,
            account_number=f"CFH-{secrets.token_hex(4).upper()}",
            **values,
        )
        db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return response(profile, current_user.email)
