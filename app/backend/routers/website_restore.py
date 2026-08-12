import json
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from models.services import Services
from models.site_content import Site_content
from models.site_settings import SiteSettings
from models.website_restore_point import WebsiteRestorePoint

router = APIRouter(prefix="/api/v1/website-restore", tags=["website-restore"])

SETTINGS_FIELDS = (
    "primary_color", "accent_color", "surface_color", "hero_image_url", "cta_image_url",
    "hero_layout", "primary_cta_en", "primary_cta_he", "secondary_cta_en", "secondary_cta_he",
)
CONTENT_FIELDS = ("section_key", "title_en", "title_he", "content_en", "content_he", "is_active")
SERVICE_FIELDS = (
    "name_en", "name_he", "description_en", "description_he", "icon", "category",
    "price_from", "price_unit", "price_note_en", "price_note_he", "image_url",
    "is_active", "sort_order",
)


class RestoreResponse(BaseModel):
    name: str
    created_at: datetime
    restored: bool = False
    content_sections: int
    services: int


def _serializable(value):
    return str(value) if isinstance(value, Decimal) else value


async def _capture_current_website(db: AsyncSession) -> WebsiteRestorePoint:
    existing = await db.get(WebsiteRestorePoint, 1)
    if existing:
        return existing

    settings = await db.get(SiteSettings, 1)
    content = (await db.execute(select(Site_content).order_by(Site_content.id))).scalars().all()
    services = (await db.execute(select(Services).order_by(Services.id))).scalars().all()
    payload = {
        "settings": {field: getattr(settings, field) for field in SETTINGS_FIELDS} if settings else {},
        "content": [
            {"id": item.id, **{field: getattr(item, field) for field in CONTENT_FIELDS}}
            for item in content
        ],
        "services": [
            {"id": item.id, **{field: _serializable(getattr(item, field)) for field in SERVICE_FIELDS}}
            for item in services
        ],
    }
    restore_point = WebsiteRestorePoint(
        id=1,
        name="Original working website",
        payload=json.dumps(payload, ensure_ascii=False),
        created_at=datetime.now(timezone.utc),
    )
    db.add(restore_point)
    await db.commit()
    await db.refresh(restore_point)
    return restore_point


def _response(restore_point: WebsiteRestorePoint, restored: bool = False) -> RestoreResponse:
    payload = json.loads(restore_point.payload)
    return RestoreResponse(
        name=restore_point.name,
        created_at=restore_point.created_at,
        restored=restored,
        content_sections=len(payload.get("content", [])),
        services=len(payload.get("services", [])),
    )


@router.get("/default", response_model=RestoreResponse, dependencies=[Depends(get_admin_user)])
async def get_default_restore_point(db: AsyncSession = Depends(get_db)):
    """Create the protected default once, then report its status."""
    try:
        return _response(await _capture_current_website(db))
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail="The protected default could not be prepared") from exc


@router.post("/default", response_model=RestoreResponse, dependencies=[Depends(get_admin_user)])
async def restore_default_website(db: AsyncSession = Depends(get_db)):
    """Restore public presentation data without touching operations, accounts, or media files."""
    restore_point = await db.get(WebsiteRestorePoint, 1)
    if not restore_point:
        raise HTTPException(status_code=409, detail="The protected default has not been prepared yet")

    payload = json.loads(restore_point.payload)
    try:
        settings = await db.get(SiteSettings, 1)
        if not settings:
            settings = SiteSettings(id=1)
            db.add(settings)
        for field, value in payload.get("settings", {}).items():
            if field in SETTINGS_FIELDS:
                setattr(settings, field, value)

        baseline_content = {item["id"]: item for item in payload.get("content", [])}
        current_content = (await db.execute(select(Site_content))).scalars().all()
        for item in current_content:
            saved = baseline_content.get(item.id)
            if saved:
                for field in CONTENT_FIELDS:
                    setattr(item, field, saved.get(field))
            else:
                item.is_active = False

        baseline_services = {item["id"]: item for item in payload.get("services", [])}
        current_services = (await db.execute(select(Services))).scalars().all()
        for item in current_services:
            saved = baseline_services.get(item.id)
            if saved:
                for field in SERVICE_FIELDS:
                    value = saved.get(field)
                    if field == "price_from" and value is not None:
                        value = Decimal(value)
                    setattr(item, field, value)
            else:
                item.is_active = False

        await db.commit()
        return _response(restore_point, restored=True)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail="The website could not be restored") from exc
