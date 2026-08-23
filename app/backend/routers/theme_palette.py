import re
from typing import Literal

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator

from dependencies.auth import get_admin_user


router = APIRouter(prefix="/api/v1/theme-palettes", tags=["theme-palettes"])


class ThemePaletteRequest(BaseModel):
    color: str
    type: Literal["complementary", "analogous", "triadic"] = "complementary"

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str) -> str:
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", value):
            raise ValueError("Color must use six-digit HEX format")
        return value.upper()


class ThemePaletteResponse(BaseModel):
    provider: Literal["botoi"]
    base_color: str
    harmony: Literal["complementary", "analogous", "triadic"]
    colors: list[str]


@router.post("/generate", response_model=ThemePaletteResponse, dependencies=[Depends(get_admin_user)])
async def generate_theme_palette(data: ThemePaletteRequest):
    """Generate an admin-only palette through Botoi without exposing a browser-side dependency."""
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            response = await client.post(
                "https://api.botoi.com/v1/color/palette",
                json={"color": data.color, "type": data.type},
                headers={"Accept": "application/json", "User-Agent": "CleanFixHarish/1.0"},
            )
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="The external palette service is temporarily unavailable") from exc

    swatches = payload.get("data", {}).get("palette", []) if isinstance(payload, dict) else []
    colors = [
        str(item.get("hex", "")).upper()
        for item in swatches
        if isinstance(item, dict) and re.fullmatch(r"#[0-9A-Fa-f]{6}", str(item.get("hex", "")))
    ]
    if not colors:
        raise HTTPException(status_code=502, detail="The palette service returned an invalid response")

    return ThemePaletteResponse(
        provider="botoi",
        base_color=data.color,
        harmony=data.type,
        colors=colors,
    )
