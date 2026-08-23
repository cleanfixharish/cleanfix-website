import os
from types import SimpleNamespace

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
    assert "cleanfix-harish-v7-mobile-install-recovery" in response.text
    assert "shouldNeverCache" in response.text
    assert "isSameOrigin" in response.text
    assert "'/'," not in response.text


def test_frontend_shell_is_never_cached_but_hashed_assets_are_immutable(tmp_path):
    index_file = tmp_path / "index.html"
    index_file.write_text("<!doctype html>", encoding="utf-8")
    asset_dir = tmp_path / "assets"
    asset_dir.mkdir()
    asset_file = asset_dir / "index-release123.js"
    asset_file.write_text("console.log('ok')", encoding="utf-8")
    sw_file = tmp_path / "sw.js"
    sw_file.write_text("self.addEventListener('fetch', () => {})", encoding="utf-8")
    photo_file = tmp_path / "assets" / "images"
    photo_file.mkdir()
    photo = photo_file / "handyman-shelf.png"
    photo.write_bytes(b"png")
    webp = photo_file / "handyman-shelf.webp"
    webp.write_bytes(b"webp")

    shell_response = main.frontend_file_response(index_file)
    asset_response = main.frontend_file_response(asset_file)
    sw_response = main.frontend_file_response(sw_file)
    photo_response = main.frontend_file_response(photo)
    webp_response = main.frontend_file_response(webp)

    assert shell_response.headers["cache-control"] == "no-store, no-cache, must-revalidate"
    assert asset_response.headers["cache-control"] == "public, max-age=31536000, immutable"
    assert sw_response.headers["cache-control"] == "no-cache, must-revalidate"
    assert photo_response.headers["cache-control"] == "public, max-age=3600"
    assert webp_response.media_type == "image/webp"


def test_account_directory_is_not_public():
    response = client.get("/api/v1/account/profiles")
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication credentials were not provided"


def test_account_directory_rejects_non_admin():
    from core.database import get_db
    from dependencies.auth import get_current_user
    from schemas.auth import UserResponse

    async def customer_user():
        return UserResponse(id="customer-1", email="customer@example.com", role="user")

    async def unused_db():
        yield None

    app.dependency_overrides[get_current_user] = customer_user
    app.dependency_overrides[get_db] = unused_db
    try:
        response = client.get("/api/v1/account/profiles")
        assert response.status_code == 403
        assert "Admin access required" in response.text
    finally:
        app.dependency_overrides.clear()


def test_account_directory_rejects_viewer():
    from core.database import get_db
    from dependencies.auth import get_current_user
    from schemas.auth import UserResponse

    async def viewer_user():
        return UserResponse(id="viewer-1", email="viewer@example.com", role="viewer")

    async def unused_db():
        yield None

    app.dependency_overrides[get_current_user] = viewer_user
    app.dependency_overrides[get_db] = unused_db
    try:
        response = client.get("/api/v1/account/profiles")
        assert response.status_code == 403
        assert "Admin access required" in response.text
    finally:
        app.dependency_overrides.clear()


def test_incomplete_google_registration_appears_in_admin_directory():
    from routers.account import build_admin_directory_entry

    user = SimpleNamespace(
        id="google-sub-123",
        email="new.customer@gmail.com",
        name="Dana Cohen",
        role="user",
        created_at=None,
        last_login=None,
    )
    entry = build_admin_directory_entry(user, None)
    payload = entry.model_dump()

    assert entry.user_id == "google-sub-123"
    assert entry.email == "new.customer@gmail.com"
    assert entry.display_name == "Dana Cohen"
    assert entry.application_status == "setup_incomplete"
    assert entry.phone == ""
    assert "Admin access required" not in str(payload)


def test_completed_profile_keeps_customer_details_in_admin_directory():
    from routers.account import build_admin_directory_entry

    user = SimpleNamespace(id="google-sub-456", email="ready@example.com", name="Ignored")
    profile = SimpleNamespace(
        id=17,
        user_id="google-sub-456",
        account_type="business",
        display_name="Harish Plumbing",
        phone="0508275505",
        area="Harish",
        preferred_language="he",
        whatsapp_opt_in=True,
        account_number="CFH-ABCD1234",
        business_name="Harish Plumbing",
        business_category="Plumbing",
        business_description="Local repairs",
        application_status="pending",
        created_at=None,
    )
    entry = build_admin_directory_entry(user, profile)

    assert entry.id == 17
    assert entry.account_type == "business"
    assert entry.display_name == "Harish Plumbing"
    assert entry.phone == "0508275505"
    assert entry.account_number == "CFH-ABCD1234"
    assert entry.application_status == "pending"


def test_admin_directory_response_allows_incomplete_phone():
    from routers.account import AdminAccountProfileResponse

    payload = AdminAccountProfileResponse(
        user_id="google-sub-789",
        email="new@example.com",
        display_name="new",
        phone="",
        application_status="setup_incomplete",
    )
    assert payload.phone == ""
    assert payload.id == 0


def test_admin_endpoints_reject_anonymous_requests():
    protected_requests = (
        ("GET", "/api/v1/entities/leads"),
        ("GET", "/api/v1/account/profiles"),
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
        ("POST", "/api/v1/theme-palettes/generate"),
        ("POST", "/api/v1/aihub/gentxt"),
        ("POST", "/api/v1/storage/create-bucket"),
    )

    for method, path in protected_requests:
        response = client.request(method, path, json={})
        assert response.status_code == 401, (method, path, response.text)


def test_public_partner_directory_route_is_anonymous_and_contact_safe():
    from routers.partners import PublicPartnerResponse

    matching_routes = [
        route
        for route in app.routes
        if getattr(route, "path", None) == "/api/v1/entities/partners/public"
        and "GET" in getattr(route, "methods", set())
    ]
    assert matching_routes
    assert all(not route.dependencies for route in matching_routes)

    public_partner = PublicPartnerResponse.model_validate(
        {
            "id": 1,
            "name": "Safe Partner",
            "partner_type": "partner",
            "phone": "0500000000",
            "whatsapp": "0500000000",
            "email": "private@example.com",
            "has_phone": True,
            "has_whatsapp": True,
        }
    ).model_dump()
    assert "phone" not in public_partner
    assert "whatsapp" not in public_partner
    assert "email" not in public_partner


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
