from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from models.pricing import LocalPriceEvidence, PriceEstimate, PriceObservation, PricingSource
from schemas.auth import UserResponse

router = APIRouter(prefix="/api/v1/pricing", tags=["pricing"], dependencies=[Depends(get_admin_user)])
DISCLAIMER = "Non-binding estimate. Final scope and price require CleanFixHarish owner approval."
LOCAL_GUIDANCE_MINIMUM_SAMPLES = 5


def observation_can_support_estimate(validation_status: str, eligible_for_estimate: bool) -> bool:
    return validation_status == "verified" and eligible_for_estimate is True


def local_guidance_is_ready(sample_count: int) -> bool:
    return sample_count >= LOCAL_GUIDANCE_MINIMUM_SAMPLES


class EstimateCreate(BaseModel):
    lead_id: Optional[int] = None
    observation_id: int
    service_description: str = Field(min_length=10, max_length=4000)
    geography: str = Field(min_length=2, max_length=120)
    photo_notes: Optional[str] = Field(default=None, max_length=4000)
    assumptions: Optional[str] = Field(default=None, max_length=4000)
    exclusions: Optional[str] = Field(default=None, max_length=4000)
    customer_min: Optional[Decimal] = Field(default=None, ge=0)
    customer_max: Optional[Decimal] = Field(default=None, ge=0)
    provider_budget: Optional[Decimal] = Field(default=None, ge=0)

    @model_validator(mode="after")
    def valid_range(self):
        if self.customer_min is not None and self.customer_max is not None and self.customer_min > self.customer_max:
            raise ValueError("customer_min cannot exceed customer_max")
        return self


class EvidenceCreate(BaseModel):
    evidence_kind: Literal["provider_quote", "completed_job"]
    category: str = Field(min_length=2, max_length=120)
    sub_service: str = Field(min_length=2, max_length=240)
    geography: str = Field(min_length=2, max_length=120)
    customer_price: Optional[Decimal] = Field(default=None, ge=0)
    provider_amount: Optional[Decimal] = Field(default=None, ge=0)
    job_id: Optional[int] = None
    provider_id: Optional[int] = None
    scope_notes: str = Field(min_length=10, max_length=4000)


def _observation(row, source):
    return {
        "id": row.id, "observation_key": row.observation_key, "category": row.category,
        "sub_service": row.sub_service, "geography": row.geography,
        "min_price": row.min_price, "max_price": row.max_price, "typical_price": row.typical_price,
        "vat_status": row.vat_status, "basis": row.basis, "confidence": row.confidence,
        "validation_status": row.validation_status, "eligible_for_estimate": row.eligible_for_estimate,
        "source": {"source_key": source.source_key, "publisher": source.publisher, "url": source.url, "notes": source.notes},
    }


@router.get("/references")
async def list_references(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PriceObservation, PricingSource).join(PricingSource).order_by(PriceObservation.category, PriceObservation.sub_service))
    rows = [_observation(observation, source) for observation, source in result.all()]
    return {"items": rows, "total": len(rows), "eligible": sum(bool(row["eligible_for_estimate"]) for row in rows), "rule": DISCLAIMER}


@router.post("/estimates", status_code=201)
async def create_estimate(data: EstimateCreate, db: AsyncSession = Depends(get_db)):
    observation = await db.get(PriceObservation, data.observation_id)
    if observation is None:
        raise HTTPException(404, "Pricing observation not found")
    if not observation_can_support_estimate(observation.validation_status, observation.eligible_for_estimate):
        raise HTTPException(409, "This evidence is provisional and cannot support an estimate")
    estimate = PriceEstimate(**data.model_dump(), suggested_min=observation.min_price, suggested_max=observation.max_price, status="draft", disclaimer=DISCLAIMER)
    db.add(estimate)
    await db.commit()
    await db.refresh(estimate)
    return estimate


@router.get("/estimates")
async def list_estimates(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(PriceEstimate).order_by(PriceEstimate.created_at.desc()))).scalars().all()
    return {"items": rows, "total": len(rows)}


@router.post("/estimates/{estimate_id}/approve")
async def approve_estimate(estimate_id: int, admin: UserResponse = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    estimate = await db.get(PriceEstimate, estimate_id)
    if estimate is None:
        raise HTTPException(404, "Estimate not found")
    if estimate.customer_min is None or estimate.customer_max is None or estimate.provider_budget is None:
        raise HTTPException(409, "Set customer range and provider budget before approval")
    estimate.status = "approved"
    estimate.approved_by = admin.email
    estimate.approved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(estimate)
    return estimate


@router.post("/estimates/{estimate_id}/reject")
async def reject_estimate(estimate_id: int, db: AsyncSession = Depends(get_db)):
    estimate = await db.get(PriceEstimate, estimate_id)
    if estimate is None:
        raise HTTPException(404, "Estimate not found")
    estimate.status = "rejected"
    await db.commit()
    return {"id": estimate.id, "status": estimate.status}


@router.post("/local-evidence", status_code=201)
async def create_local_evidence(data: EvidenceCreate, db: AsyncSession = Depends(get_db)):
    row = LocalPriceEvidence(**data.model_dump(), status="pending")
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


@router.get("/local-evidence")
async def list_local_evidence(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(LocalPriceEvidence).order_by(LocalPriceEvidence.created_at.desc()))).scalars().all()
    return {"items": rows, "total": len(rows)}


@router.post("/local-evidence/{evidence_id}/approve")
async def approve_local_evidence(evidence_id: int, admin: UserResponse = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    row = await db.get(LocalPriceEvidence, evidence_id)
    if row is None:
        raise HTTPException(404, "Local evidence not found")
    row.status, row.approved_by, row.approved_at = "approved", admin.email, datetime.now(timezone.utc)
    await db.commit()
    return {"id": row.id, "status": row.status}


@router.get("/local-benchmarks")
async def local_benchmarks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LocalPriceEvidence.category, LocalPriceEvidence.sub_service, LocalPriceEvidence.geography, func.count(LocalPriceEvidence.id),
               func.avg(LocalPriceEvidence.customer_price), func.avg(LocalPriceEvidence.provider_amount))
        .where(
            LocalPriceEvidence.status == "approved",
            LocalPriceEvidence.customer_price.is_not(None),
            LocalPriceEvidence.provider_amount.is_not(None),
        )
        .group_by(LocalPriceEvidence.category, LocalPriceEvidence.sub_service, LocalPriceEvidence.geography)
    )
    items = []
    for category, sub_service, geography, sample_count, customer_avg, provider_avg in result.all():
        ready = local_guidance_is_ready(sample_count)
        items.append({"category": category, "sub_service": sub_service, "geography": geography, "sample_count": sample_count,
                      "customer_average": customer_avg if ready else None, "provider_average": provider_avg if ready else None,
                      "margin_average": (customer_avg - provider_avg) if ready and customer_avg is not None and provider_avg is not None else None,
                      "ready_for_guidance": ready, "minimum_samples": LOCAL_GUIDANCE_MINIMUM_SAMPLES})
    return {"items": items, "rule": "Local adjustments stay hidden until five owner-approved comparable records exist."}
