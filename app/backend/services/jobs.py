import logging
from typing import Any, Dict, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.jobs import Jobs

logger = logging.getLogger(__name__)


class JobsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Jobs:
        try:
            job = Jobs(**data)
            self.db.add(job)
            await self.db.commit()
            await self.db.refresh(job)
            return job
        except Exception:
            await self.db.rollback()
            logger.exception("Failed to create job")
            raise

    async def get_by_id(self, job_id: int) -> Optional[Jobs]:
        result = await self.db.execute(select(Jobs).where(Jobs.id == job_id))
        return result.scalar_one_or_none()

    async def get_list(self, skip: int = 0, limit: int = 200, sort: str = "-created_at") -> Dict[str, Any]:
        query = select(Jobs)
        sort_name = sort.lstrip("-")
        sort_column = getattr(Jobs, sort_name, Jobs.created_at)
        query = query.order_by(sort_column.desc() if sort.startswith("-") else sort_column.asc())
        count = await self.db.scalar(select(func.count(Jobs.id)))
        result = await self.db.execute(query.offset(skip).limit(limit))
        return {"items": result.scalars().all(), "total": count or 0, "skip": skip, "limit": limit}

    async def update(self, job_id: int, data: Dict[str, Any]) -> Optional[Jobs]:
        job = await self.get_by_id(job_id)
        if not job:
            return None
        try:
            for key, value in data.items():
                setattr(job, key, value)
            await self.db.commit()
            await self.db.refresh(job)
            return job
        except Exception:
            await self.db.rollback()
            logger.exception("Failed to update job %s", job_id)
            raise

    async def delete(self, job_id: int) -> bool:
        job = await self.get_by_id(job_id)
        if not job:
            return False
        try:
            await self.db.delete(job)
            await self.db.commit()
            return True
        except Exception:
            await self.db.rollback()
            logger.exception("Failed to delete job %s", job_id)
            raise
