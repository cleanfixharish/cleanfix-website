import logging
import os
import time

from core.database import db_manager
from sqlalchemy import text

logger = logging.getLogger(__name__)


async def check_database_health() -> bool:
    """Check if database is healthy"""
    start_time = time.time()
    logger.debug("[DB_OP] Starting database health check")
    try:
        if not db_manager.async_session_maker:
            return False

        async with db_manager.async_session_maker() as session:
            await session.execute(text("SELECT 1"))
            logger.debug(f"[DB_OP] Database health check completed in {time.time() - start_time:.4f}s - healthy: True")
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        logger.debug(f"[DB_OP] Database health check failed in {time.time() - start_time:.4f}s - healthy: False")
        return False


async def initialize_database():
    """Initialize the database connection and optionally create missing tables.

    Railway runs Alembic in a dedicated pre-deploy container, so runtime table
    creation is disabled there. Existing platforms keep the legacy behavior
    until the migration is complete, unless AUTO_CREATE_TABLES is set explicitly.
    """
    if "MGX_IGNORE_INIT_DB" in os.environ:
        logger.info("Ignore creating tables")
        return
    start_time = time.time()
    logger.debug("[DB_OP] Starting database initialization")
    try:
        logger.info("🔧 Starting database initialization...")
        await db_manager.init_db()
        auto_create_value = os.getenv("AUTO_CREATE_TABLES")
        if auto_create_value is None:
            auto_create_tables = not bool(os.getenv("RAILWAY_ENVIRONMENT"))
        else:
            auto_create_tables = auto_create_value.lower() in ("true", "1", "yes")

        if auto_create_tables:
            logger.info("Creating missing tables at runtime for legacy/local compatibility")
            await db_manager.create_tables()
            logger.info("Table creation completed")
        else:
            logger.info("Runtime table creation disabled; schema is managed by Alembic")
        logger.info("Database initialized successfully")
        logger.debug(f"[DB_OP] Database initialization completed in {time.time() - start_time:.4f}s")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_database():
    """Close database connections"""
    start_time = time.time()
    logger.debug("[DB_OP] Starting database close")
    try:
        await db_manager.close_db()
        logger.info("Database connections closed")
        logger.debug(f"[DB_OP] Database close completed in {time.time() - start_time:.4f}s")
    except Exception as e:
        logger.error(f"Error closing database: {e}")
        logger.debug(f"[DB_OP] Database close failed in {time.time() - start_time:.4f}s")
