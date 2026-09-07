from datetime import date, datetime, timezone
from types import SimpleNamespace

import pytest
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from core.database import Base
from growth_daily import is_due
from models.growth import GrowthAutomationSettings, GrowthPost, GrowthRun
from routers.growth import reject_post
from schemas.growth import GrowthRejectRequest, GrowthSettingsData
from services.growth import build_daily_draft, content_hash, generate_daily_drafts, idempotency_key, utm_url


def settings():
    return SimpleNamespace(
        default_cta="Send details for an owner-reviewed quote",
        destination_url="https://cleanfixharish.co.il/quote",
    )


def test_growth_defaults_keep_owner_approval_and_auto_publish_off():
    data = GrowthSettingsData()
    assert data.require_owner_approval is True
    assert data.auto_publish is False
    assert data.timezone == "Asia/Jerusalem"


def test_growth_settings_reject_unapproved_publication():
    with pytest.raises(ValidationError, match="Owner approval is mandatory"):
        GrowthSettingsData(require_owner_approval=False)
    with pytest.raises(ValidationError, match="official channel"):
        GrowthSettingsData(auto_publish=True)


def test_daily_drafts_are_idempotent_and_draft_only():
    day = date(2026, 9, 7)
    first = build_daily_draft(settings(), day, "facebook", "en", "helpful_tip")
    second = build_daily_draft(settings(), day, "facebook", "en", "helpful_tip")
    assert first["idempotency_key"] == second["idempotency_key"]
    assert first["status"] == "draft"
    assert "utm_medium=organic_social" in first["utm_url"]
    assert first["content_hash"] == content_hash(first["body"], first["destination_url"], None)


def test_schedule_change_changes_approval_hash():
    copy = "A sufficiently long, owner-reviewed social post."
    destination = "https://cleanfixharish.co.il/quote"
    before = content_hash(copy, destination, None)
    after = content_hash(copy, destination, datetime(2026, 9, 8, 9, tzinfo=timezone.utc))
    assert before != after


def test_utm_and_idempotency_are_stable():
    url = utm_url("https://cleanfixharish.co.il/quote?ref=admin", "instagram", "daily-organic")
    assert "ref=admin" in url
    assert "utm_source=instagram" in url
    assert idempotency_key(date(2026, 9, 7), "instagram", "he", "local_trust") == idempotency_key(
        date(2026, 9, 7), "instagram", "he", "local_trust"
    )


def test_daily_worker_respects_admin_time_and_one_run_per_day():
    before = datetime(2026, 9, 7, 8, 59, tzinfo=timezone.utc)
    due = datetime(2026, 9, 7, 9, 0, tzinfo=timezone.utc)
    assert is_due(before, "09:00", completed_today=False) is False
    assert is_due(due, "09:00", completed_today=False) is True
    assert is_due(due, "09:00", completed_today=True) is False


@pytest.mark.asyncio
async def test_daily_growth_run_persists_once_per_channel_language_and_day():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as db:
        growth_settings = GrowthAutomationSettings(id=1, enabled=True, daily_post_limit=1)
        db.add(growth_settings)
        await db.commit()
        await db.refresh(growth_settings)
        first = await generate_daily_drafts(db, growth_settings, date(2026, 9, 7), trigger="scheduler")
        second = await generate_daily_drafts(db, growth_settings, date(2026, 9, 7), trigger="scheduler")
        post_count = await db.scalar(select(func.count(GrowthPost.id)))
        run_count = await db.scalar(select(func.count(GrowthRun.id)))
        post = await db.scalar(select(GrowthPost).limit(1))
        post.status = "scheduled"
        post.approved_version = post.content_version
        post.scheduled_for = datetime(2026, 9, 8, 9, tzinfo=timezone.utc)
        await db.commit()
        rejected = await reject_post(post.id, GrowthRejectRequest(reason="Needs a more specific local claim"), db)
    await engine.dispose()

    assert first.drafts_created == 4
    assert second.drafts_created == 0
    assert post_count == 4
    assert run_count == 2
    assert rejected.status == "rejected"
    assert rejected.approved_version is None
    assert rejected.scheduled_for is None
    assert rejected.last_error == "Needs a more specific local claim"
