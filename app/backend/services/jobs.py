import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from models.job_ledger import JobEvent
from models.jobs import Jobs

logger = logging.getLogger(__name__)

CANONICAL_JOB_TRANSITIONS = {
    "scheduled": {"in_progress", "cancelled"},
    "in_progress": {"completion_submitted", "cancelled"},
    "in progress": {"completion_submitted", "cancelled"},
    "completion_submitted": {"quality_approved", "in_progress", "cancelled"},
    # Final completion remains locked until the immutable completion command
    # writes its evidence, quality, and commercial snapshot atomically.
    "quality_approved": {"in_progress"},
    "completed": {"reopened"},
    "reopened": {"in_progress", "cancelled"},
    "cancelled": {"reopened"},
}


class InvalidJobTransition(ValueError):
    pass


class DuplicateJobCommand(ValueError):
    pass


def validate_job_transition(previous_status: str, new_status: str) -> None:
    allowed = CANONICAL_JOB_TRANSITIONS.get(previous_status, set())
    if new_status not in allowed:
        raise InvalidJobTransition(
            f"Job cannot move from {previous_status!r} to {new_status!r}"
        )


def _event_hash(payload: Dict[str, Any]) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


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

    async def create_with_event(
        self,
        data: Dict[str, Any],
        *,
        actor_id: str,
        actor_role: str,
        idempotency_key: str,
    ) -> Jobs:
        occurred_at = datetime.now(timezone.utc)
        event_uuid = str(uuid4())
        try:
            job = Jobs(**data)
            self.db.add(job)
            await self.db.flush()
            hash_material = {
                "event_uuid": event_uuid,
                "job_id": job.id,
                "sequence_number": 1,
                "event_type": "job_created",
                "occurred_at": occurred_at.isoformat(),
                "actor_id": actor_id,
                "previous_status": None,
                "new_status": job.status,
                "previous_hash": None,
            }
            self.db.add(
                JobEvent(
                    event_uuid=event_uuid,
                    job_id=job.id,
                    sequence_number=1,
                    event_type="job_created",
                    occurred_at=occurred_at,
                    actor_type="user",
                    actor_id=actor_id,
                    actor_role=actor_role,
                    source="admin_job_command",
                    previous_status=None,
                    new_status=job.status,
                    visibility="owner",
                    payload={},
                    idempotency_key=idempotency_key,
                    previous_hash=None,
                    event_hash=_event_hash(hash_material),
                )
            )
            await self.db.commit()
            await self.db.refresh(job)
            return job
        except IntegrityError as exc:
            await self.db.rollback()
            raise DuplicateJobCommand("This job command was already recorded") from exc
        except Exception:
            await self.db.rollback()
            logger.exception("Failed to create job with audit event")
            raise

    async def transition(
        self,
        job_id: int,
        new_status: str,
        *,
        actor_id: str,
        actor_role: str,
        idempotency_key: str,
        reason: Optional[str] = None,
    ) -> Optional[Jobs]:
        """Move a job through the canonical state machine and append one audit event.

        The job row is locked and the projection plus event are committed together.
        Replaying an idempotency key is rejected instead of creating a second event.
        """
        result = await self.db.execute(
            select(Jobs).where(Jobs.id == job_id).with_for_update()
        )
        job = result.scalar_one_or_none()
        if not job:
            return None

        previous_status = str(job.status)
        validate_job_transition(previous_status, new_status)
        occurred_at = datetime.now(timezone.utc)
        sequence_number = int(
            await self.db.scalar(
                select(func.coalesce(func.max(JobEvent.sequence_number), 0)).where(
                    JobEvent.job_id == job_id
                )
            )
            or 0
        ) + 1
        previous_hash = await self.db.scalar(
            select(JobEvent.event_hash)
            .where(JobEvent.job_id == job_id)
            .order_by(JobEvent.sequence_number.desc())
            .limit(1)
        )
        event_uuid = str(uuid4())
        hash_material = {
            "event_uuid": event_uuid,
            "job_id": job_id,
            "sequence_number": sequence_number,
            "event_type": "job_status_changed",
            "occurred_at": occurred_at.isoformat(),
            "actor_id": actor_id,
            "previous_status": previous_status,
            "new_status": new_status,
            "reason": reason,
            "previous_hash": previous_hash,
        }
        event = JobEvent(
            event_uuid=event_uuid,
            job_id=job_id,
            sequence_number=sequence_number,
            event_type="job_status_changed",
            occurred_at=occurred_at,
            actor_type="user",
            actor_id=actor_id,
            actor_role=actor_role,
            source="admin_job_command",
            reason=reason,
            previous_status=previous_status,
            new_status=new_status,
            visibility="owner",
            payload={},
            idempotency_key=idempotency_key,
            previous_hash=previous_hash,
            event_hash=_event_hash(hash_material),
        )
        try:
            job.status = new_status
            self.db.add(event)
            await self.db.commit()
            await self.db.refresh(job)
            return job
        except IntegrityError as exc:
            await self.db.rollback()
            raise DuplicateJobCommand("This job command was already recorded") from exc
        except Exception:
            await self.db.rollback()
            logger.exception("Failed to transition job %s", job_id)
            raise

    async def get_by_id(self, job_id: int) -> Optional[Jobs]:
        result = await self.db.execute(select(Jobs).where(Jobs.id == job_id))
        return result.scalar_one_or_none()

    async def get_events(self, job_id: int):
        result = await self.db.execute(
            select(JobEvent)
            .where(JobEvent.job_id == job_id)
            .order_by(JobEvent.sequence_number.asc())
        )
        return result.scalars().all()

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
