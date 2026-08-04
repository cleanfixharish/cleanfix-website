import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from models.site_settings import SiteSettings

router = APIRouter(prefix="/api/v1/site-settings", tags=["site-settings"])


class SiteSettingsData(BaseModel):
    primary_color: str = "#102E38"
    accent_color: str = "#B8842F"
    surface_color: str = "#F7F2EA"
    hero_image_url: Optional[str] = None
    cta_image_url: Optional[str] = None
    hero_layout: str = "text-left"
    primary_cta_en: Optional[str] = None
    primary_cta_he: Optional[str] = None
    secondary_cta_en: Optional[str] = None
    secondary_cta_he: Optional[str] = None

    @field_validator("primary_color", "accent_color", "surface_color")
    @classmethod
    def valid_color(cls, value: str) -> str:
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", value):
            raise ValueError("Colors must use six-digit HEX format")
        return value.upper()

    @field_validator("hero_layout")
    @classmethod
    def valid_layout(cls, value: str) -> str:
        if value not in {"text-left", "image-left"}:
            raise ValueError("Unsupported hero layout")
        return value


class SiteSettingsResponse(SiteSettingsData):
    id: int

    class Config:
        from_attributes = True


async def get_settings(db: AsyncSession) -> SiteSettings:
    settings = await db.get(SiteSettings, 1)
    if settings:
        return settings
    settings = SiteSettings(id=1)
    db.add(settings)
    await db.commit()
    await db.refresh(settings)
    return settings


@router.get("", response_model=SiteSettingsResponse)
async def read_site_settings(db: AsyncSession = Depends(get_db)):
    return await get_settings(db)


@router.put("", response_model=SiteSettingsResponse, dependencies=[Depends(get_admin_user)])
async def update_site_settings(data: SiteSettingsData, db: AsyncSession = Depends(get_db)):
    settings = await get_settings(db)
    for key, value in data.model_dump().items():
        setattr(settings, key, value)
    try:
        await db.commit()
        await db.refresh(settings)
        return settings
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Website settings could not be saved") from exc
