from datetime import datetime
from typing import Optional

from core.database import get_db
from dependencies.auth import get_admin_user
from fastapi import APIRouter, Depends, HTTPException, status
from models.viewer_access import ViewerAccess
from pydantic import BaseModel, EmailStr
from schemas.auth import UserResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/admin/viewers", tags=["viewer-access"])


class ViewerCreate(BaseModel):
    email: EmailStr


class ViewerResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.get("", response_model=list[ViewerResponse])
async def list_viewers(
    _admin: UserResponse = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ViewerAccess).where(ViewerAccess.is_active.is_(True)).order_by(ViewerAccess.email))
    return result.scalars().all()


@router.post("", response_model=ViewerResponse, status_code=status.HTTP_201_CREATED)
async def add_viewer(
    data: ViewerCreate, _admin: UserResponse = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    email = str(data.email).strip().lower()
    result = await db.execute(select(ViewerAccess).where(ViewerAccess.email == email))
    viewer = result.scalar_one_or_none()
    if viewer:
        viewer.is_active = True
    else:
        viewer = ViewerAccess(email=email, is_active=True)
        db.add(viewer)
    await db.commit()
    await db.refresh(viewer)
    return viewer


@router.delete("/{viewer_id}")
async def remove_viewer(
    viewer_id: int, _admin: UserResponse = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    viewer = await db.get(ViewerAccess, viewer_id)
    if not viewer:
        raise HTTPException(status_code=404, detail="Viewer not found")
    viewer.is_active = False
    await db.commit()
    return {"removed": True}
