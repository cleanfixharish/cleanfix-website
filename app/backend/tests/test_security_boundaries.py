import os

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError
from starlette.requests import Request

import main
from core.environment import fastapi_documentation_urls, legacy_platform_token_exchange_enabled
from core.lead_abuse import (
    evaluate_lead_intake_submission,
    reset_lead_intake_guard_state,
    tracked_lead_intake_ip_count,
)
from main import app
from routers.auth import build_frontend_callback_url, get_dynamic_backend_url
from routers.settings import MASKED_VALUE, display_value, ensure_settings_mutation_allowed
from schemas.leads import (
    MAX_LEAD_DESCRIPTION_LENGTH,
    PublicLeadIntakeRequest,
    build_lead_from_public_intake,
)


client = TestClient(app)


def test_render_page_redirects_to_official_domain():
    response = client.get(
        "/services?source=render",
        headers={"host": "cleanfixharish-web.onrender.com"},
        follow_redirects=False,
    )
    assert response.status_code == 308
    assert response.headers["location"] == "https://www.cleanfixharish.co.il/services?source=render"


def test_render_health_check_is_not_redirected():
    response = client.get(
        "/health",
        headers={"host": "cleanfixharish-web.onrender.com"},
        follow_redirects=False,
    )
    assert response.status_code == 200


def test_render_service_worker_is_available_for_cache_retirement(monkeypatch):
    monkeypatch.setattr(main, "FRONTEND_DIST", main.FRONTEND_DIST.parent / "public")
    response = client.get(
        "/sw.js",
        headers={"host": "cleanfixharish-web.onrender.com"},
        follow_redirects=False,
    )
    assert response.status_code == 200
    assert "IS_LEGACY_RENDER_ORIGIN" in response.text
    assert "cleanfix-harish-v4-security" in response.text
    assert "shouldNeverCache" in response.text
    assert "isSameOrigin" in response.text
    assert "'/'," not in response.text


def test_admin_endpoints_reject_anonymous_requests():
    protected_requests = (
        ("GET", "/api/v1/entities/leads"),
        ("GET", "/api/v1/entities/partners"),
        ("GET", "/api/v1/admin/settings"),
        ("PUT", "/api/v1/site-settings"),
        ("GET", "/api/v1/site-media"),
        ("GET", "/api/v1/pricing/references"),
        ("GET", "/api/v1/pricing/estimates"),
        ("GET", "/api/v1/pricing/local-evidence"),
        ("GET", "/api/v1/pricing/local-benchmarks"),
        ("GET", "/api/v1/quotes"),
        ("GET", "/api/v1/entities/jobs"),
        ("POST", "/api/v1/site-media"),
        ("POST", "/api/v1/aihub/gentxt"),
        ("POST", "/api/v1/storage/create-bucket"),
    )

    for method, path in protected_requests:
        response = client.request(method, path, json={})
        assert response.status_code == 401, (method, path, response.text)


def test_public_lead_creation_remains_available_without_authentication():
    matching_routes = [
        route
        for route in app.routes
        if getattr(route, "path", None) == "/api/v1/entities/leads"
        and "POST" in getattr(route, "methods", set())
    ]
    assert matching_routes
    assert all(not route.dependencies for route in matching_routes)


def test_secret_values_are_masked_for_admin_display():
    assert display_value("JWT_SECRET_KEY", "super-secret") == MASKED_VALUE
    assert display_value("DATABASE_URL", "postgresql://private") == MASKED_VALUE
    assert display_value("APP_AI_KEY", "sk-live-example") == MASKED_VALUE
    assert display_value("OPENAI_API_KEY", "sk-live-example") == MASKED_VALUE
    assert display_value("VITE_API_BASE_URL", "https://example.test") == "https://example.test"


def test_public_lead_intake_rejects_privileged_fields():
    with pytest.raises(ValidationError):
        PublicLeadIntakeRequest.model_validate(
            {
                "customer_name": "Test User",
                "phone": "0501234567",
                "status": "closed",
                "assigned_partner_id": 99,
                "notes": "internal only",
                "priority": "urgent",
            }
        )


def test_public_lead_intake_enforces_field_length_limits():
    intake = PublicLeadIntakeRequest.model_validate(
        {
            "customer_name": "Test User",
            "phone": "0501234567",
            "description": "x" * MAX_LEAD_DESCRIPTION_LENGTH,
        }
    )
    lead_data = build_lead_from_public_intake(intake)
    assert len(lead_data["description"]) == MAX_LEAD_DESCRIPTION_LENGTH

    with pytest.raises(ValidationError):
        PublicLeadIntakeRequest.model_validate(
            {
                "customer_name": "Test User",
                "phone": "0501234567",
                "description": "x" * (MAX_LEAD_DESCRIPTION_LENGTH + 1),
            }
        )


def test_public_lead_intake_applies_server_defaults_for_allowed_fields():
    intake = PublicLeadIntakeRequest.model_validate(
        {
            "customer_name": "Test User",
            "phone": "0501234567",
        }
    )
    lead_data = build_lead_from_public_intake(intake)

    assert lead_data["customer_name"] == "Test User"
    assert lead_data["status"] == "new"
    assert lead_data["priority"] == "normal"
    assert lead_data["whatsapp"] == "0501234567"


def test_lead_intake_honeypot_blocks_submission():
    reset_lead_intake_guard_state()
    result = evaluate_lead_intake_submission(_request("127.0.0.1"), "https://spam.example")
    assert result.allowed is False
    assert result.reason == "honeypot"


def test_lead_intake_rate_limit_blocks_excess_submissions():
    reset_lead_intake_guard_state()
    request = _request("127.0.0.1")
    start = 1_000.0

    for offset in range(10):
        assert evaluate_lead_intake_submission(request, None, now=start + offset).allowed is True

    blocked = evaluate_lead_intake_submission(request, None, now=start + 10)
    assert blocked.allowed is False
    assert blocked.reason == "rate_limit"


def test_lead_intake_rate_limiter_bounds_tracked_ip_memory():
    reset_lead_intake_guard_state()
    start = 2_000.0
    max_tracked_ips = 5

    for index in range(max_tracked_ips + 3):
        result = evaluate_lead_intake_submission(
            _request(f"10.0.0.{index}"),
            None,
            now=start + index,
            max_tracked_ips=max_tracked_ips,
        )
        assert result.allowed is True

    assert tracked_lead_intake_ip_count() <= max_tracked_ips


def test_legacy_platform_token_exchange_is_disabled_by_default(monkeypatch):
    monkeypatch.delenv("ENABLE_LEGACY_PLATFORM_TOKEN_EXCHANGE", raising=False)
    assert legacy_platform_token_exchange_enabled() is False
    response = client.post("/api/v1/auth/token/exchange", json={"platform_token": "legacy-token"})
    assert response.status_code == 404


def test_settings_mutations_are_disabled_in_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "prod")
    with pytest.raises(HTTPException) as exc:
        ensure_settings_mutation_allowed()
    assert exc.value.status_code == 403


def test_settings_mutations_remain_available_in_development(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "dev")
    ensure_settings_mutation_allowed()


def test_fastapi_docs_are_disabled_in_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "prod")
    assert fastapi_documentation_urls() == {
        "docs_url": None,
        "redoc_url": None,
        "openapi_url": None,
    }


def test_fastapi_docs_remain_available_in_development(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "dev")
    assert fastapi_documentation_urls() == {
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "openapi_url": "/openapi.json",
    }


def test_security_headers_are_applied_in_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "prod")
    response = client.get("/health", headers={"x-forwarded-proto": "https"})
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert response.headers["Strict-Transport-Security"] == "max-age=31536000; includeSubDomains"


def test_security_headers_are_not_applied_in_development(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "dev")
    response = client.get("/health")
    assert "X-Frame-Options" not in response.headers


def _request(host: str, forwarded_proto: str = "https") -> Request:
    headers = [(b"host", host.encode()), (b"x-forwarded-proto", forwarded_proto.encode())]
    return Request({"type": "http", "method": "GET", "path": "/", "headers": headers})


def test_oauth_redirect_rejects_untrusted_host(monkeypatch):
    monkeypatch.setenv("PYTHON_BACKEND_URL", "https://api.cleanfixharish.co.il")
    monkeypatch.setenv("ALLOWED_DOMAINS", "api.cleanfixharish.co.il")
    assert get_dynamic_backend_url(_request("attacker.example")) == "https://api.cleanfixharish.co.il"


def test_oauth_redirect_accepts_configured_host(monkeypatch):
    monkeypatch.setenv("PYTHON_BACKEND_URL", "https://api.cleanfixharish.co.il")
    monkeypatch.setenv("ALLOWED_DOMAINS", "api.cleanfixharish.co.il")
    assert get_dynamic_backend_url(_request("api.cleanfixharish.co.il")) == "https://api.cleanfixharish.co.il"


def test_oauth_success_token_stays_out_of_server_visible_query():
    callback_url = build_frontend_callback_url(
        "https://staging.example", "sensitive-token", 1_800_000_000
    )
    assert callback_url.startswith("https://staging.example/auth/callback#")
    assert "?" not in callback_url
    assert "token=sensitive-token" in callback_url.split("#", 1)[1]
