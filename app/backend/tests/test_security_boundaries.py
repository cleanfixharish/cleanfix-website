import os

from fastapi.testclient import TestClient
from starlette.requests import Request

from main import app
from routers.auth import get_dynamic_backend_url
from routers.settings import MASKED_VALUE, display_value


client = TestClient(app)


def test_admin_endpoints_reject_anonymous_requests():
    protected_requests = (
        ("GET", "/api/v1/entities/leads"),
        ("GET", "/api/v1/admin/settings"),
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
    assert display_value("VITE_API_BASE_URL", "https://example.test") == "https://example.test"


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
