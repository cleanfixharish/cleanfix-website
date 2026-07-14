import secrets
from typing import Literal, Optional

from core.database import get_db
from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, status
from models.account_profile import AccountProfile
from pydantic import BaseModel, Field
from schemas.auth import UserResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/account", tags=["account"])


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
    vip_number: str
    application_status: str


async def find_profile(db: AsyncSession, user_id: str):
    result = await db.execute(select(AccountProfile).where(AccountProfile.user_id == user_id))
    return result.scalar_one_or_none()


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
        vip_number=profile.vip_number,
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
            vip_number=f"CFH-{secrets.token_hex(4).upper()}",
            **values,
        )
        db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return response(profile, current_user.email)
