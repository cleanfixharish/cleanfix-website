import pytest

from services.mock_data import initialize_mock_data


@pytest.mark.asyncio
async def test_production_refuses_mock_data(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "prod")
    monkeypatch.setenv("ENABLE_MOCK_DATA", "true")
    with pytest.raises(RuntimeError, match="Refusing to start production"):
        await initialize_mock_data()


@pytest.mark.asyncio
async def test_disabled_mock_data_is_safe_in_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "prod")
    monkeypatch.delenv("ENABLE_MOCK_DATA", raising=False)
    await initialize_mock_data()
