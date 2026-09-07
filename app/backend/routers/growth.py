from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from models.growth import GrowthAutomationSettings, GrowthPost, GrowthRun
from schemas.auth import UserResponse
from schemas.growth import (
    GrowthPostCreate,
    GrowthPostResponse,
    GrowthPostUpdate,
    GrowthRejectRequest,
    GrowthRunResponse,
    GrowthScheduleRequest,
    GrowthSettingsData,
    GrowthSettingsResponse,
)
from services.growth import content_hash, generate_daily_drafts, idempotency_key, utm_url


router = APIRouter(
    prefix="/api/v1/admin/growth",
    tags=["growth"],
    dependencies=[Depends(get_admin_user)],
)


async def get_or_create_settings(db: AsyncSession) -> GrowthAutomationSettings:
    row = await db.get(GrowthAutomationSettings, 1)
    if row:
        return row
    row = GrowthAutomationSettings(id=1)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


@router.get("/settings", response_model=GrowthSettingsResponse)
async def read_settings(db: AsyncSession = Depends(get_db)):
    return await get_or_create_settings(db)


@router.put("/settings", response_model=GrowthSettingsResponse)
async def update_settings(data: GrowthSettingsData, db: AsyncSession = Depends(get_db)):
    row = await get_or_create_settings(db)
    for key, value in data.model_dump().items():
        setattr(row, key, value)
    row.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(row)
    return row


@router.get("/posts")
async def list_posts(
    status: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    query = select(GrowthPost).order_by(GrowthPost.created_at.desc()).limit(limit)
    if status:
        query = query.where(GrowthPost.status == status)
    rows = (await db.execute(query)).scalars().all()
    return {"items": [GrowthPostResponse.model_validate(row) for row in rows], "total": len(rows)}


@router.post("/posts", response_model=GrowthPostResponse, status_code=201)
async def create_post(data: GrowthPostCreate, db: AsyncSession = Depends(get_db)):
    campaign_key = data.campaign_name.lower().replace(" ", "-")
    key = idempotency_key(date.today(), data.channel, data.language, f"{campaign_key}:{data.topic}")
    if (await db.execute(select(GrowthPost.id).where(GrowthPost.idempotency_key == key))).scalar_one_or_none():
        raise HTTPException(409, "This campaign variant already exists")
    values = data.model_dump()
    destination = values["destination_url"]
    scheduled_for = values.pop("scheduled_for")
    row = GrowthPost(
        **values,
        scheduled_for=scheduled_for,
        utm_url=utm_url(destination, data.channel, campaign_key),
        content_hash=content_hash(data.body, destination, scheduled_for),
        idempotency_key=key,
        status="draft",
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


@router.put("/posts/{post_id}", response_model=GrowthPostResponse)
async def edit_post(post_id: int, data: GrowthPostUpdate, db: AsyncSession = Depends(get_db)):
    row = await db.get(GrowthPost, post_id)
    if row is None:
        raise HTTPException(404, "Growth post not found")
    if row.status in {"published", "publishing", "cancelled"}:
        raise HTTPException(409, "Published or cancelled posts are immutable")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    row.content_version += 1
    row.approved_version = None
    row.approved_at = None
    row.approved_by = None
    row.status = "draft"
    row.utm_url = utm_url(row.destination_url, row.channel, row.campaign_name)
    row.content_hash = content_hash(row.body, row.destination_url, row.scheduled_for)
    await db.commit()
    await db.refresh(row)
    return row


@router.post("/posts/{post_id}/approve", response_model=GrowthPostResponse)
async def approve_post(
    post_id: int,
    admin: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    row = await db.get(GrowthPost, post_id)
    if row is None:
        raise HTTPException(404, "Growth post not found")
    if row.status not in {"draft", "rejected", "approved"}:
        raise HTTPException(409, "Only reviewable drafts can be approved")
    row.approved_version = row.content_version
    row.approved_at = datetime.now(timezone.utc)
    row.approved_by = admin.email
    row.content_hash = content_hash(row.body, row.destination_url, row.scheduled_for)
    row.status = "approved"
    await db.commit()
    await db.refresh(row)
    return row


@router.post("/posts/{post_id}/schedule", response_model=GrowthPostResponse)
async def schedule_post(post_id: int, data: GrowthScheduleRequest, db: AsyncSession = Depends(get_db)):
    row = await db.get(GrowthPost, post_id)
    if row is None:
        raise HTTPException(404, "Growth post not found")
    if row.approved_version != row.content_version or row.status not in {"approved", "scheduled"}:
        raise HTTPException(409, "Approve this exact post version before scheduling")
    row.scheduled_for = data.scheduled_for
    row.content_hash = content_hash(row.body, row.destination_url, row.scheduled_for)
    row.status = "scheduled"
    await db.commit()
    await db.refresh(row)
    return row


@router.post("/posts/{post_id}/reject", response_model=GrowthPostResponse)
async def reject_post(post_id: int, data: GrowthRejectRequest, db: AsyncSession = Depends(get_db)):
    row = await db.get(GrowthPost, post_id)
    if row is None:
        raise HTTPException(404, "Growth post not found")
    if row.status in {"published", "publishing", "cancelled"}:
        raise HTTPException(409, "Published or cancelled posts are immutable")
    row.status = "rejected"
    row.approved_version = None
    row.approved_at = None
    row.approved_by = None
    row.scheduled_for = None
    row.last_error = data.reason.strip()
    row.content_hash = content_hash(row.body, row.destination_url, None)
    await db.commit()
    await db.refresh(row)
    return row


@router.post("/posts/{post_id}/mark-published", response_model=GrowthPostResponse)
async def mark_manual_post_published(post_id: int, db: AsyncSession = Depends(get_db)):
    row = await db.get(GrowthPost, post_id)
    if row is None:
        raise HTTPException(404, "Growth post not found")
    if row.approved_version != row.content_version or row.status not in {"approved", "scheduled"}:
        raise HTTPException(409, "Only an approved exact version can be marked published")
    row.status = "published"
    row.published_at = datetime.now(timezone.utc)
    row.remote_id = row.remote_id or f"manual:{row.id}:{row.content_hash[:12]}"
    await db.commit()
    await db.refresh(row)
    return row


@router.post("/run-daily", response_model=GrowthRunResponse)
async def run_daily(db: AsyncSession = Depends(get_db)):
    settings = await get_or_create_settings(db)
    if not settings.enabled:
        raise HTTPException(409, "Enable daily growth automation in Settings first")
    if not settings.auto_generate:
        raise HTTPException(409, "Automatic draft generation is disabled in Settings")
    local_day = datetime.now(ZoneInfo(settings.timezone)).date()
    return await generate_daily_drafts(db, settings, local_day, trigger="admin")


@router.get("/runs")
async def list_runs(limit: int = Query(default=30, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(GrowthRun).order_by(GrowthRun.started_at.desc()).limit(limit))).scalars().all()
    return {"items": [GrowthRunResponse.model_validate(row) for row in rows], "total": len(rows)}


@router.get("/summary")
async def growth_summary(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GrowthPost.status, func.count(GrowthPost.id)).group_by(GrowthPost.status))
    counts = {status: count for status, count in result.all()}
    return {
        "counts": counts,
        "automatic_publish_available": False,
        "channel_status": [
            {"provider": "facebook", "state": "needs_official_connection"},
            {"provider": "instagram", "state": "needs_official_connection"},
            {"provider": "x", "state": "not_configured"},
            {"provider": "manual_share", "state": "ready"},
        ],
    }
