import os


def is_production_environment() -> bool:
    """Return True unless ENVIRONMENT is explicitly set to dev."""
    return os.environ.get("ENVIRONMENT", "prod").lower() != "dev"


def legacy_platform_token_exchange_enabled() -> bool:
    """Legacy platform token exchange is opt-in only."""
    return os.environ.get("ENABLE_LEGACY_PLATFORM_TOKEN_EXCHANGE", "").strip().lower() in (
        "true",
        "1",
        "yes",
    )


def fastapi_documentation_urls() -> dict[str, str | None]:
    """Expose OpenAPI docs only in development."""
    if is_production_environment():
        return {"docs_url": None, "redoc_url": None, "openapi_url": None}
    return {"docs_url": "/docs", "redoc_url": "/redoc", "openapi_url": "/openapi.json"}
