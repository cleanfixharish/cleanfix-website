from types import SimpleNamespace

from routers.services import is_public_service
from routers.viewer_dashboard import _viewer_safe_service


def test_viewer_service_projection_excludes_owner_pricing_and_draft_fields():
    service = SimpleNamespace(
        id=7,
        name_en="AC cleaning",
        name_he="ניקוי מזגן",
        description_en="Public description",
        description_he="תיאור ציבורי",
        category="cleaning",
        is_active=True,
        sort_order=1,
        price_from=450,
        price_unit="from",
        price_note_en="Internal margin note",
        image_url="/private-draft-image",
    )

    projected = _viewer_safe_service(service)

    assert projected["name_en"] == "AC cleaning"
    assert projected["is_active"] is True
    assert "price_from" not in projected
    assert "price_unit" not in projected
    assert "price_note_en" not in projected
    assert "image_url" not in projected


def test_inactive_services_are_not_public():
    assert is_public_service(SimpleNamespace(is_active=True)) is True
    assert is_public_service(SimpleNamespace(is_active=False)) is False
    assert is_public_service(SimpleNamespace(is_active=None)) is False
