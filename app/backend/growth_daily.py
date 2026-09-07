"""One-shot organic growth worker for a daily production cron service."""

import asyncio
from datetime import datetime
from zoneinfo import ZoneInfo

from core.database import db_manager
from models.growth import GrowthAutomationSettings
from services.growth import generate_daily_drafts


async def run() -> int:
    await db_manager.init_db()
    try:
        async with db_manager.async_session_maker() as db:
            settings = await db.get(GrowthAutomationSettings, 1)
            if settings is None or not settings.enabled or not settings.auto_generate:
                print("Growth automation is disabled; no drafts created.")
                return 0
            day = datetime.now(ZoneInfo(settings.timezone)).date()
            result = await generate_daily_drafts(db, settings, day, trigger="scheduler")
            print(f"Growth run {result.id} completed; {result.drafts_created} drafts created.")
            return 0
    finally:
        await db_manager.close_db()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run()))
