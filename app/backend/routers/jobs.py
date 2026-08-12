from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from services.jobs import JobsService

router = APIRouter(
    prefix="/api/v1/entities/jobs",
    tags=["jobs"],
    dependencies=[Depends(get_admin_user)],
)


class JobData(BaseModel):
    lead_id: Optional[int] = None
    provider_id: Optional[int] = None
    customer_name: str
    title: str
    phone: Optional[str] = None
    address: Optional[str] = None
    status: str = "scheduled"
    scheduled_for: Optional[datetime] = None
    price: Optional[Decimal] = None
    notes: Optional[str] = None


class JobUpdate(BaseModel):
    lead_id: Optional[int] = None
    provider_id: Optional[int] = None
    customer_name: Optional[str] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    price: Optional[Decimal] = None
    notes: Optional[str] = None


class JobResponse(JobData):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    skip: int
    limit: int


@router.get("", response_model=JobListResponse)
async def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=2000),
    sort: str = Query("-created_at"),
    db: AsyncSession = Depends(get_db),
):
    return await JobsService(db).get_list(skip=skip, limit=limit, sort=sort)


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(data: JobData, db: AsyncSession = Depends(get_db)):
    return await JobsService(db).create(data.model_dump())


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(job_id: int, data: JobUpdate, db: AsyncSession = Depends(get_db)):
    updates = {key: value for key, value in data.model_dump().items() if value is not None}
    job = await JobsService(db).update(job_id, updates)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/{job_id}")
async def delete_job(job_id: int, db: AsyncSession = Depends(get_db)):
    if not await JobsService(db).delete(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted", "id": job_id}
