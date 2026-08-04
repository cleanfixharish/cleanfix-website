from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from models.site_media import SiteMedia

router = APIRouter(prefix="/api/v1/site-media", tags=["site-media"])
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


class MediaItem(BaseModel):
    id: int
    filename: str
    content_type: str
    alt_text: Optional[str] = None
    url: str


@router.get("", response_model=list[MediaItem], dependencies=[Depends(get_admin_user)])
async def list_media(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteMedia).order_by(SiteMedia.created_at.desc()).limit(100))
    return [MediaItem(id=item.id, filename=item.filename, content_type=item.content_type, alt_text=item.alt_text, url=f"/api/v1/site-media/{item.id}") for item in result.scalars().all()]


@router.post("", response_model=MediaItem, status_code=201, dependencies=[Depends(get_admin_user)])
async def upload_media(
    image: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG, WEBP, or GIF image")
    data = await image.read(MAX_IMAGE_BYTES + 1)
    if not data or len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be smaller than 5 MB")
    item = SiteMedia(filename=(image.filename or "website-image")[:255], content_type=image.content_type, alt_text=(alt_text or "")[:300], data=data)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return MediaItem(id=item.id, filename=item.filename, content_type=item.content_type, alt_text=item.alt_text, url=f"/api/v1/site-media/{item.id}")


@router.get("/{media_id}")
async def read_media(media_id: int, db: AsyncSession = Depends(get_db)):
    item = await db.get(SiteMedia, media_id)
    if not item:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=item.data, media_type=item.content_type, headers={"Cache-Control": "public, max-age=86400"})
