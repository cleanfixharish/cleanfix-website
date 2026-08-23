from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import HTTPException, Response

from dependencies.auth import (
    _get_business_portal_principal,
    get_managed_provider,
    get_referral_partner,
)
from routers.business_access import get_partner_context, get_provider_context, request_relationship
from schemas.auth import UserResponse


class _Result:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class _DB:
    def __init__(self, *values):
        self.values = list(values)
        self.calls = 0

    async def execute(self, _statement):
        self.calls += 1
        return _Result(self.values.pop(0))


class _WriteDB(_DB):
    def __init__(self, *values):
        super().__init__(*values)
        self.added = []
        self.commits = 0

    def add(self, value):
        self.added.append(value)

    async def commit(self):
        self.commits += 1

    async def refresh(self, value):
        value.id = 1


def _user(user_id="business-1", role="user"):
    return UserResponse(id=user_id, email=f"{user_id}@example.com", role=role)


@pytest.mark.asyncio
async def test_active_provider_relationship_grants_only_provider_context():
    profile = SimpleNamespace(account_type="business")
    relationship = SimpleNamespace(id=41, status="active")
    principal = await _get_business_portal_principal(
        "managed_provider", _user(), _DB(profile, relationship)
    )
    assert principal.relationship_id == 41
    assert principal.relationship_type == "managed_provider"

    response = Response()
    context = await get_provider_context(response, principal)
    assert context.relationship_type == "managed_provider"
    assert context.status == "active"
    assert response.headers["Cache-Control"] == "private, no-store"


@pytest.mark.asyncio
async def test_provider_approval_does_not_grant_referral_partner_access():
    profile = SimpleNamespace(account_type="business")
    with pytest.raises(HTTPException) as error:
        await _get_business_portal_principal(
            "referral_partner", _user(), _DB(profile, None)
        )
    assert error.value.status_code == 403
    assert "referral_partner" in error.value.detail


@pytest.mark.asyncio
@pytest.mark.parametrize("relationship_status", ["pending", "paused", "rejected", "revoked"])
async def test_non_active_relationship_cannot_enter_portal(relationship_status):
    # The active-status filter makes every non-active relationship indistinguishable
    # from no approval and prevents status probing through the portal endpoint.
    profile = SimpleNamespace(account_type="business")
    with pytest.raises(HTTPException) as error:
        await _get_business_portal_principal(
            "managed_provider", _user(), _DB(profile, None)
        )
    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_customer_account_cannot_enter_either_business_portal():
    for relationship_type in ("managed_provider", "referral_partner"):
        db = _DB(SimpleNamespace(account_type="customer"))
        with pytest.raises(HTTPException) as error:
            await _get_business_portal_principal(relationship_type, _user(), db)
        assert error.value.status_code == 403
        assert error.value.detail == "A business account is required"
        assert db.calls == 1


@pytest.mark.asyncio
async def test_admin_or_viewer_token_does_not_inherit_provider_access():
    for role in ("admin", "viewer"):
        db = _DB()
        with pytest.raises(HTTPException) as error:
            await _get_business_portal_principal(
                "managed_provider", _user(role=role), db
            )
        assert error.value.status_code == 403
        assert db.calls == 0


@pytest.mark.asyncio
async def test_dependency_helpers_keep_relationships_isolated():
    provider = await get_managed_provider(
        _user("provider"),
        _DB(SimpleNamespace(account_type="business"), SimpleNamespace(id=7)),
    )
    partner = await get_referral_partner(
        _user("partner"),
        _DB(SimpleNamespace(account_type="business"), SimpleNamespace(id=9)),
    )
    assert provider.relationship_type == "managed_provider"
    assert partner.relationship_type == "referral_partner"
    assert (await get_partner_context(Response(), partner)).relationship_id == 9


@pytest.mark.asyncio
async def test_business_can_only_create_a_pending_relationship_request():
    db = _WriteDB(SimpleNamespace(account_type="business"), None)
    relationship = await request_relationship("managed_provider", _user(), db)
    assert relationship.status == "pending"
    assert relationship.approved_by is None
    assert relationship.approved_at is None
    assert db.commits == 1
    assert db.added == [relationship]


def test_production_startup_has_no_mock_data_initializer():
    backend = Path(__file__).resolve().parents[1]
    for relative_path in ("main.py", "lambda_handler.py"):
        source = (backend / relative_path).read_text(encoding="utf-8")
        assert "initialize_mock_data" not in source
