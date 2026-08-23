from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from dependencies.auth import get_admin_user
from schemas.auth import UserResponse


class _Result:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class _DB:
    def __init__(self, value):
        self.value = value
        self.calls = 0

    async def execute(self, _statement):
        self.calls += 1
        return _Result(self.value)


@pytest.mark.asyncio
async def test_owner_approved_secondary_admin_is_accepted(monkeypatch):
    monkeypatch.setenv("ADMIN_USER_EMAIL", "owner@example.com")
    user = UserResponse(id="secondary", email="admin2@example.com", role="admin")
    db = _DB(SimpleNamespace(access_role="admin", is_active=True))
    assert await get_admin_user(user, db) == user
    assert db.calls == 1


@pytest.mark.asyncio
async def test_removed_secondary_admin_is_rejected(monkeypatch):
    monkeypatch.setenv("ADMIN_USER_EMAIL", "owner@example.com")
    user = UserResponse(id="removed", email="removed@example.com", role="admin")
    with pytest.raises(HTTPException) as error:
        await get_admin_user(user, _DB(None))
    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_non_admin_token_is_always_rejected(monkeypatch):
    monkeypatch.setenv("ADMIN_USER_EMAIL", "owner@example.com")
    user = UserResponse(id="customer", email="customer@example.com", role="user")
    with pytest.raises(HTTPException) as error:
        await get_admin_user(user, _DB(SimpleNamespace(access_role="admin")))
    assert error.value.status_code == 403
