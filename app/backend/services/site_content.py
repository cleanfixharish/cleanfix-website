import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.site_content import Site_content

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Site_contentService:
    """Service layer for Site_content operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Site_content]:
        """Create a new site_content"""
        try:
            obj = Site_content(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created site_content with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating site_content: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Site_content]:
        """Get site_content by ID"""
        try:
            query = select(Site_content).where(Site_content.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching site_content {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of site_contents"""
        try:
            query = select(Site_content)
            count_query = select(func.count(Site_content.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Site_content, field):
                        query = query.where(getattr(Site_content, field) == value)
                        count_query = count_query.where(getattr(Site_content, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Site_content, field_name):
                        query = query.order_by(getattr(Site_content, field_name).desc())
                else:
                    if hasattr(Site_content, sort):
                        query = query.order_by(getattr(Site_content, sort))
            else:
                query = query.order_by(Site_content.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching site_content list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Site_content]:
        """Update site_content"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Site_content {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated site_content {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating site_content {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete site_content"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Site_content {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted site_content {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting site_content {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Site_content]:
        """Get site_content by any field"""
        try:
            if not hasattr(Site_content, field_name):
                raise ValueError(f"Field {field_name} does not exist on Site_content")
            result = await self.db.execute(
                select(Site_content).where(getattr(Site_content, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching site_content by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Site_content]:
        """Get list of site_contents filtered by field"""
        try:
            if not hasattr(Site_content, field_name):
                raise ValueError(f"Field {field_name} does not exist on Site_content")
            result = await self.db.execute(
                select(Site_content)
                .where(getattr(Site_content, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Site_content.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching site_contents by {field_name}: {str(e)}")
            raise