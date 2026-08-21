from datetime import datetime, timedelta, timezone
from decimal import Decimal
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from routers.quotes import (
    QuoteCreate,
    apply_customer_decision,
    hash_quote_token,
    public_quote_payload,
    quote_is_expired,
)


def test_quote_token_is_stored_as_a_digest_not_plaintext():
    token = "private-customer-token"
    digest = hash_quote_token(token)
    assert token not in digest
    assert len(digest) == 64
    assert digest == hash_quote_token(token)


def test_quote_requires_future_expiry_and_valid_deposit():
    with pytest.raises(ValidationError):
        QuoteCreate(
            estimate_id=1,
            quoted_total=Decimal("500"),
            deposit_required=Decimal("600"),
            scope="Mount two shelves and protect the work area.",
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        )
    with pytest.raises(ValidationError):
        QuoteCreate(
            estimate_id=1,
            quoted_total=Decimal("500"),
            scope="Mount two shelves and protect the work area.",
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )


def test_customer_decision_has_strict_terminal_transitions():
    assert apply_customer_decision("published", "accept") == "accepted"
    assert apply_customer_decision("published", "decline") == "declined"
    assert apply_customer_decision("accepted", "accept") == "accepted"
    with pytest.raises(ValueError):
        apply_customer_decision("accepted", "decline")
    with pytest.raises(ValueError):
        apply_customer_decision("draft", "accept")


def test_expiry_is_timezone_safe():
    now = datetime(2026, 8, 20, tzinfo=timezone.utc)
    assert quote_is_expired(now - timedelta(seconds=1), now) is True
    assert quote_is_expired(now + timedelta(seconds=1), now) is False


def test_public_quote_never_exposes_internal_budget_or_owner_identity():
    quote = SimpleNamespace(
        id=4,
        quoted_total=Decimal("499"),
        deposit_required=Decimal("100"),
        scope="Mount two shelves.",
        exclusions="Materials.",
        terms="Payment after completion.",
        status="published",
        expires_at=datetime.now(timezone.utc) + timedelta(days=2),
        published_at=datetime.now(timezone.utc),
        accepted_at=None,
        declined_at=None,
        provider_budget=Decimal("300"),
        created_by="owner@example.com",
    )
    payload = public_quote_payload(quote)
    assert "provider_budget" not in payload
    assert "created_by" not in payload
    assert payload["currency"] == "ILS"
