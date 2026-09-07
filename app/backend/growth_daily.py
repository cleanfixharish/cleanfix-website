"""One-shot organic growth worker for a daily production cron service."""

import asyncio
from datetime import datetime, time, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import select

from core.database import db_manager
from models.growth import GrowthAutomationSettings, GrowthRun
from services.growth import generate_daily_drafts


def is_due(local_now: datetime, daily_time: str, completed_today: bool) -> bool:
    hour, minute = (int(part) for part in daily_time.split(":"))
    return not completed_today and local_now.timetz().replace(tzinfo=None) >= time(hour, minute)


async def run() -> int:
    await db_manager.init_db()
    try:
        async with db_manager.async_session_maker() as db:
            settings = await db.get(GrowthAutomationSettings, 1)
            if settings is None or not settings.enabled or not settings.auto_generate:
                print("Growth automation is disabled; no drafts created.")
                return 0
            zone = ZoneInfo(settings.timezone)
            local_now = datetime.now(zone)
            local_midnight_utc = datetime.combine(local_now.date(), time.min, tzinfo=zone).astimezone(timezone.utc)
            completed_today = (
                await db.execute(
                    select(GrowthRun.id).where(
                        GrowthRun.trigger == "scheduler",
                        GrowthRun.status == "completed",
                        GrowthRun.started_at >= local_midnight_utc,
                    )
                )
            ).scalar_one_or_none() is not None
            if not is_due(local_now, settings.daily_time, completed_today):
                print("Growth automation is not due or already completed today; no drafts created.")
                return 0
            try:
                result = await generate_daily_drafts(db, settings, local_now.date(), trigger="scheduler")
                print(f"Growth run {result.id} completed; {result.drafts_created} drafts created.")
                return 0
            except Exception as exc:
                await db.rollback()
                db.add(
                    GrowthRun(
                        trigger="scheduler",
                        status="failed",
                        error=f"{type(exc).__name__}: growth worker execution failed",
                        finished_at=datetime.now(timezone.utc),
                    )
                )
                await db.commit()
                raise
    finally:
        await db_manager.close_db()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run()))
