from unittest.mock import AsyncMock

from fastapi.testclient import TestClient
import pytest

import main
from services import database


client = TestClient(main.app)


def test_readiness_reports_healthy_database(monkeypatch):
    monkeypatch.setattr(main, "check_database_health", AsyncMock(return_value=True))
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "healthy"}


def test_readiness_rejects_unhealthy_database(monkeypatch):
    monkeypatch.setattr(main, "check_database_health", AsyncMock(return_value=False))
    response = client.get("/health/ready")
    assert response.status_code == 503


@pytest.mark.asyncio
async def test_railway_startup_does_not_create_tables(monkeypatch):
    monkeypatch.setenv("RAILWAY_ENVIRONMENT", "production")
    monkeypatch.delenv("AUTO_CREATE_TABLES", raising=False)
    init_db = AsyncMock()
    create_tables = AsyncMock()
    monkeypatch.setattr(database.db_manager, "init_db", init_db)
    monkeypatch.setattr(database.db_manager, "create_tables", create_tables)

    await database.initialize_database()

    init_db.assert_awaited_once()
    create_tables.assert_not_awaited()


@pytest.mark.asyncio
async def test_legacy_startup_keeps_table_creation(monkeypatch):
    monkeypatch.delenv("RAILWAY_ENVIRONMENT", raising=False)
    monkeypatch.delenv("AUTO_CREATE_TABLES", raising=False)
    init_db = AsyncMock()
    create_tables = AsyncMock()
    monkeypatch.setattr(database.db_manager, "init_db", init_db)
    monkeypatch.setattr(database.db_manager, "create_tables", create_tables)

    await database.initialize_database()

    init_db.assert_awaited_once()
    create_tables.assert_awaited_once()
