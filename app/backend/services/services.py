import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.services import Services

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class ServicesService:
    """Service layer for Services operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Services]:
        """Create a new services"""
        try:
            obj = Services(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created services with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating services: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Services]:
        """Get services by ID"""
        try:
            query = select(Services).where(Services.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching services {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of servicess"""
        try:
            query = select(Services)
            count_query = select(func.count(Services.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Services, field):
                        query = query.where(getattr(Services, field) == value)
                        count_query = count_query.where(getattr(Services, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Services, field_name):
                        query = query.order_by(getattr(Services, field_name).desc())
                else:
                    if hasattr(Services, sort):
                        query = query.order_by(getattr(Services, sort))
            else:
                query = query.order_by(Services.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching services list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Services]:
        """Update services"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Services {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated services {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating services {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete services"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Services {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted services {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting services {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Services]:
        """Get services by any field"""
        try:
            if not hasattr(Services, field_name):
                raise ValueError(f"Field {field_name} does not exist on Services")
            result = await self.db.execute(
                select(Services).where(getattr(Services, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching services by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Services]:
        """Get list of servicess filtered by field"""
        try:
            if not hasattr(Services, field_name):
                raise ValueError(f"Field {field_name} does not exist on Services")
            result = await self.db.execute(
                select(Services)
                .where(getattr(Services, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Services.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching servicess by {field_name}: {str(e)}")
            raise