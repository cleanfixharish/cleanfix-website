import pytest
from pydantic import ValidationError

from routers import theme_palette


class _Response:
    def raise_for_status(self):
        return None

    def json(self):
        return {
            "success": True,
            "data": {
                "palette": [
                    {"hex": "#b6832f"},
                    {"hex": "#2fb683"},
                    {"hex": "not-a-color"},
                ]
            },
        }


class _Client:
    def __init__(self, *args, **kwargs):
        self.request = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, url, json, headers):
        self.request = (url, json, headers)
        return _Response()


def test_palette_request_normalizes_hex_and_rejects_invalid_values():
    request = theme_palette.ThemePaletteRequest(color="#b8842f", type="triadic")
    assert request.color == "#B8842F"
    with pytest.raises(ValidationError):
        theme_palette.ThemePaletteRequest(color="gold", type="triadic")


@pytest.mark.asyncio
async def test_botoi_palette_response_is_filtered_and_normalized(monkeypatch):
    monkeypatch.setattr(theme_palette.httpx, "AsyncClient", _Client)
    response = await theme_palette.generate_theme_palette(
        theme_palette.ThemePaletteRequest(color="#B8842F", type="triadic")
    )
    assert response.provider == "botoi"
    assert response.harmony == "triadic"
    assert response.colors == ["#B6832F", "#2FB683"]
