from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from routers import auth as auth_router
from schemas.auth import SupabaseTokenExchangeRequest


class _Response:
    def __init__(self, status_code, body):
        self.status_code = status_code
        self._body = body

    def json(self):
        return self._body


class _Client:
    response = _Response(401, {})

    def __init__(self, **_kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    async def get(self, *_args, **_kwargs):
        return self.response


@pytest.mark.asyncio
async def test_supabase_exchange_requires_confirmed_server_validated_email(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://project.supabase.co")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test")
    _Client.response = _Response(200, {"id": "user-1", "email": "person@example.com", "email_confirmed_at": None})
    monkeypatch.setattr(auth_router.httpx, "AsyncClient", _Client)

    with pytest.raises(HTTPException) as error:
        await auth_router.exchange_supabase_token(SupabaseTokenExchangeRequest(access_token="session"), SimpleNamespace())
    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_supabase_exchange_issues_existing_application_token(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://project.supabase.co")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test")
    _Client.response = _Response(200, {
        "id": "user-1", "email": "Person@Example.com", "email_confirmed_at": "2026-08-23T00:00:00Z",
        "user_metadata": {"name": "Person"},
    })
    monkeypatch.setattr(auth_router.httpx, "AsyncClient", _Client)

    async def fake_user(self, platform_sub, email, name):
        assert platform_sub == "supabase:user-1"
        assert email == "person@example.com"
        return SimpleNamespace(id="existing-google-id", email=email, name=name, role="user", last_login=None)

    async def fake_token(self, user):
        return "cleanfix-token", SimpleNamespace(timestamp=lambda: 0), {}

    monkeypatch.setattr(auth_router.AuthService, "get_or_create_user", fake_user)
    monkeypatch.setattr(auth_router.AuthService, "issue_app_token", fake_token)
    result = await auth_router.exchange_supabase_token(SupabaseTokenExchangeRequest(access_token="session"), SimpleNamespace())
    assert result.token == "cleanfix-token"


@pytest.mark.asyncio
async def test_supabase_exchange_rejects_invalid_provider_token(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://project.supabase.co")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test")
    _Client.response = _Response(401, {})
    monkeypatch.setattr(auth_router.httpx, "AsyncClient", _Client)
    with pytest.raises(HTTPException) as error:
        await auth_router.exchange_supabase_token(SupabaseTokenExchangeRequest(access_token="invalid"), SimpleNamespace())
    assert error.value.status_code == 401
