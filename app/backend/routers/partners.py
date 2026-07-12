import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.partners import PartnersService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/partners", tags=["partners"])


# ---------- Pydantic Schemas ----------
class PartnersData(BaseModel):
    """Entity data schema (for create/update)"""
    name: str
    business_type: str = None
    description_en: str = None
    description_he: str = None
    phone: str = None
    whatsapp: str = None
    email: str = None
    address: str = None
    area: str = None
    partner_type: str
    is_active: bool = None
    sort_order: int = None


class PartnersUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    name: Optional[str] = None
    business_type: Optional[str] = None
    description_en: Optional[str] = None
    description_he: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    partner_type: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class PartnersResponse(BaseModel):
    """Entity response schema"""
    id: int
    name: str
    business_type: Optional[str] = None
    description_en: Optional[str] = None
    description_he: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    partner_type: str
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PartnersListResponse(BaseModel):
    """List response schema"""
    items: List[PartnersResponse]
    total: int
    skip: int
    limit: int


class PartnersBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[PartnersData]


class PartnersBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: PartnersUpdateData


class PartnersBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[PartnersBatchUpdateItem]


class PartnersBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=PartnersListResponse)
async def query_partnerss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query partnerss with filtering, sorting, and pagination"""
    logger.debug(f"Querying partnerss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = PartnersService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} partnerss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying partnerss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=PartnersListResponse)
async def query_partnerss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query partnerss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying partnerss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = PartnersService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} partnerss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying partnerss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=PartnersResponse)
async def get_partners(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single partners by ID"""
    logger.debug(f"Fetching partners with id: {id}, fields={fields}")
    
    service = PartnersService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Partners with id {id} not found")
            raise HTTPException(status_code=404, detail="Partners not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching partners {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=PartnersResponse, status_code=201)
async def create_partners(
    data: PartnersData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new partners"""
    logger.debug(f"Creating new partners with data: {data}")
    
    service = PartnersService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create partners")
        
        logger.info(f"Partners created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating partners: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating partners: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[PartnersResponse], status_code=201)
async def create_partnerss_batch(
    request: PartnersBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple partnerss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} partnerss")
    
    service = PartnersService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} partnerss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[PartnersResponse])
async def update_partnerss_batch(
    request: PartnersBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple partnerss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} partnerss")
    
    service = PartnersService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} partnerss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=PartnersResponse)
async def update_partners(
    id: int,
    data: PartnersUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing partners"""
    logger.debug(f"Updating partners {id} with data: {data}")

    service = PartnersService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Partners with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Partners not found")
        
        logger.info(f"Partners {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating partners {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating partners {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_partnerss_batch(
    request: PartnersBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple partnerss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} partnerss")
    
    service = PartnersService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} partnerss successfully")
        return {"message": f"Successfully deleted {deleted_count} partnerss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_partners(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single partners by ID"""
    logger.debug(f"Deleting partners with id: {id}")
    
    service = PartnersService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Partners with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Partners not found")
        
        logger.info(f"Partners {id} deleted successfully")
        return {"message": "Partners deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting partners {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")