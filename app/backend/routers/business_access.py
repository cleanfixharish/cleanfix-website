from datetime import datetime, timezone
from typing import Literal

from core.database import get_db
from dependencies.auth import (
    BusinessPortalPrincipal,
    get_admin_user,
    get_current_user,
    get_managed_provider,
    get_referral_partner,
)
from fastapi import APIRouter, Depends, HTTPException, Response, status
from models.account_profile import AccountProfile
from models.auth import User
from models.business_relationship import BusinessRelationship
from pydantic import BaseModel
from schemas.auth import UserResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(prefix="/api/v1/business-access", tags=["business-access"])

RelationshipType = Literal["managed_provider", "referral_partner"]
RelationshipStatus = Literal["pending", "active", "paused", "rejected", "revoked"]


class RelationshipResponse(BaseModel):
    id: int
    user_id: str
    relationship_type: RelationshipType
    status: RelationshipStatus
    approved_by: str | None = None
    approved_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class MyBusinessAccessResponse(BaseModel):
    account_type: Literal["business"]
    relationships: list[RelationshipResponse]


class RelationshipDecision(BaseModel):
    user_id: str
    relationship_type: RelationshipType
    status: RelationshipStatus


class PortalContextResponse(BaseModel):
    relationship_id: int
    relationship_type: RelationshipType
    status: Literal["active"] = "active"


async def _require_business_profile(db: AsyncSession, user_id: str) -> AccountProfile:
    result = await db.execute(select(AccountProfile).where(AccountProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if profile is None or profile.account_type != "business":
        raise HTTPException(status_code=403, detail="A business account is required")
    return profile


@router.get("/me", response_model=MyBusinessAccessResponse)
async def get_my_business_access(
    response: Response,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_business_profile(db, current_user.id)
    result = await db.execute(
        select(BusinessRelationship)
        .where(BusinessRelationship.user_id == current_user.id)
        .order_by(BusinessRelationship.relationship_type)
    )
    response.headers["Cache-Control"] = "private, no-store"
    return MyBusinessAccessResponse(
        account_type="business",
        relationships=list(result.scalars().all()),
    )


@router.post(
    "/relationships/{relationship_type}/request",
    response_model=RelationshipResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def request_relationship(
    relationship_type: RelationshipType,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a pending application without ever self-granting access."""
    await _require_business_profile(db, current_user.id)
    result = await db.execute(
        select(BusinessRelationship).where(
            BusinessRelationship.user_id == current_user.id,
            BusinessRelationship.relationship_type == relationship_type,
        )
    )
    relationship = result.scalar_one_or_none()
    if relationship is not None:
        return relationship

    relationship = BusinessRelationship(
        user_id=current_user.id,
        relationship_type=relationship_type,
        status="pending",
    )
    db.add(relationship)
    await db.commit()
    await db.refresh(relationship)
    return relationship


@router.get("/provider/context", response_model=PortalContextResponse)
async def get_provider_context(
    response: Response,
    principal: BusinessPortalPrincipal = Depends(get_managed_provider),
):
    response.headers["Cache-Control"] = "private, no-store"
    return PortalContextResponse(
        relationship_id=principal.relationship_id,
        relationship_type="managed_provider",
    )


@router.get("/partner/context", response_model=PortalContextResponse)
async def get_partner_context(
    response: Response,
    principal: BusinessPortalPrincipal = Depends(get_referral_partner),
):
    response.headers["Cache-Control"] = "private, no-store"
    return PortalContextResponse(
        relationship_id=principal.relationship_id,
        relationship_type="referral_partner",
    )


@router.get(
    "/admin/relationships",
    response_model=list[RelationshipResponse],
    dependencies=[Depends(get_admin_user)],
)
async def list_relationships(response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BusinessRelationship).order_by(
            BusinessRelationship.created_at.desc(),
            BusinessRelationship.id.desc(),
        )
    )
    response.headers["Cache-Control"] = "private, no-store"
    return list(result.scalars().all())


@router.put(
    "/admin/relationships",
    response_model=RelationshipResponse,
)
async def decide_relationship(
    decision: RelationshipDecision,
    admin: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create or update a relationship; only the owner/admin can activate it."""
    user_result = await db.execute(select(User).where(User.id == decision.user_id))
    if user_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="User not found")
    await _require_business_profile(db, decision.user_id)

    result = await db.execute(
        select(BusinessRelationship).where(
            BusinessRelationship.user_id == decision.user_id,
            BusinessRelationship.relationship_type == decision.relationship_type,
        )
    )
    relationship = result.scalar_one_or_none()
    if relationship is None:
        relationship = BusinessRelationship(
            user_id=decision.user_id,
            relationship_type=decision.relationship_type,
            status=decision.status,
        )
        db.add(relationship)
    else:
        relationship.status = decision.status

    if decision.status == "active":
        relationship.approved_by = admin.id
        relationship.approved_at = datetime.now(timezone.utc)
    else:
        relationship.approved_by = None
        relationship.approved_at = None

    await db.commit()
    await db.refresh(relationship)
    return relationship
