"""Build the branded, scan-safe CleanFixHarish QR asset pack."""

from __future__ import annotations

from pathlib import Path

import qrcode
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont
from qrcode.constants import ERROR_CORRECT_H

URL = "https://cleanfixharish.co.il/"
NAVY = "#081F28"
IVORY = "#F7F2EA"
GOLD = "#B8842F"
MUTED = "#6F675F"

FRONTEND = Path(__file__).resolve().parents[1]
PUBLIC = FRONTEND / "public"
OUT = PUBLIC / "assets" / "qr"
LOGO = PUBLIC / "assets" / "brand" / "cf-gold-monogram-256.png"
FONT = Path("C:/Windows/Fonts/arial.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/arialbd.ttf")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT), size)


def make_qr(size: int) -> Image.Image:
    qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_H, box_size=18, border=4)
    qr.add_data(URL)
    qr.make(fit=True)
    image = qr.make_image(fill_color=NAVY, back_color=IVORY).convert("RGB")
    image = image.resize((size, size), Image.Resampling.NEAREST)

    logo = Image.open(LOGO).convert("RGBA")
    logo_size = round(size * 0.145)
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    badge_size = round(size * 0.19)
    badge = Image.new("RGBA", (badge_size, badge_size), IVORY)
    badge_draw = ImageDraw.Draw(badge)
    badge_draw.rounded_rectangle(
        (3, 3, badge_size - 4, badge_size - 4),
        radius=round(badge_size * 0.24),
        fill=IVORY,
        outline=GOLD,
        width=max(3, size // 180),
    )
    badge.alpha_composite(logo, ((badge_size - logo.width) // 2, (badge_size - logo.height) // 2))
    image.paste(badge, ((size - badge_size) // 2, (size - badge_size) // 2), badge)
    return image


def centered(draw: ImageDraw.ImageDraw, text: str, y: int, fnt: ImageFont.FreeTypeFont, fill: str, width: int) -> None:
    box = draw.textbbox((0, 0), text, font=fnt)
    draw.text(((width - (box[2] - box[0])) / 2, y), text, font=fnt, fill=fill)


def centered_he(draw: ImageDraw.ImageDraw, text: str, y: int, fnt: ImageFont.FreeTypeFont, fill: str, width: int) -> None:
    """Center Hebrew correctly even when Pillow was built without libraqm."""
    centered(draw, get_display(text), y, fnt, fill, width)


def paste_mark(canvas: Image.Image, size: int, center_x: int, top: int) -> None:
    mark = Image.open(LOGO).convert("RGBA")
    mark.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas.paste(mark, (center_x - mark.width // 2, top), mark)


def save_master() -> Image.Image:
    master = make_qr(1600)
    master.save(OUT / "cleanfixharish-qr-master-1600.png", optimize=True, dpi=(300, 300))
    for size in (1024, 512, 256):
        master.resize((size, size), Image.Resampling.NEAREST).save(
            OUT / f"cleanfixharish-qr-{size}.png", optimize=True
        )
    return master


def save_social(master: Image.Image) -> None:
    width = height = 1600
    canvas = Image.new("RGB", (width, height), IVORY)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((70, 70, 1530, 1530), radius=90, outline=GOLD, width=8)
    paste_mark(canvas, 210, width // 2, 105)
    centered_he(draw, "סרקו להזמנת שירות", 330, font(66, True), NAVY, width)
    centered(draw, "Scan to book trusted local help", 415, font(46), MUTED, width)
    qr = master.resize((900, 900), Image.Resampling.NEAREST)
    canvas.paste(qr, ((width - 900) // 2, 500))
    centered(draw, "cleanfixharish.co.il", 1400, font(42, True), GOLD, width)
    canvas.save(OUT / "cleanfixharish-qr-social-square-1600.png", optimize=True, dpi=(300, 300))


def save_business_card(master: Image.Image) -> None:
    width, height = 1050, 600
    canvas = Image.new("RGB", (width, height), IVORY)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((20, 20, width - 21, height - 21), radius=45, outline=GOLD, width=5)
    qr = master.resize((470, 470), Image.Resampling.NEAREST)
    canvas.paste(qr, (535, 65))
    paste_mark(canvas, 175, 260, 65)
    hebrew = get_display("סרקו להזמנת שירות")
    draw.text((70, 265), hebrew, font=font(42, True), fill=NAVY)
    draw.text((70, 330), "Scan to book", font=font(38, True), fill=GOLD)
    draw.text((70, 400), "Trusted local home services", font=font(27), fill=MUTED)
    draw.text((70, 465), "cleanfixharish.co.il", font=font(28, True), fill=NAVY)
    canvas.save(OUT / "cleanfixharish-qr-business-card-1050x600.png", optimize=True, dpi=(300, 300))


def save_flyer(master: Image.Image) -> None:
    width, height = 1748, 2480
    canvas = Image.new("RGB", (width, height), IVORY)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((85, 85, width - 86, height - 86), radius=110, outline=GOLD, width=12)
    paste_mark(canvas, 280, width // 2, 170)
    centered_he(draw, "שירותי בית מקומיים בחריש", 475, font(74, True), NAVY, width)
    centered(draw, "Trusted local home services", 585, font(52), MUTED, width)
    qr = master.resize((1250, 1250), Image.Resampling.NEAREST)
    canvas.paste(qr, ((width - 1250) // 2, 730))
    centered_he(draw, "סרקו לקבלת הצעת מחיר", 2050, font(72, True), NAVY, width)
    centered(draw, "Scan for a quote", 2165, font(56, True), GOLD, width)
    centered(draw, "cleanfixharish.co.il", 2290, font(44, True), MUTED, width)
    canvas.save(OUT / "cleanfixharish-qr-a5-flyer-1748x2480.png", optimize=True, dpi=(300, 300))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    master = save_master()
    save_social(master)
    save_business_card(master)
    save_flyer(master)
    (OUT / "README.txt").write_text(
        "CleanFixHarish branded QR pack\n"
        f"Destination: {URL}\n"
        "Master QR uses high error correction and a protected quiet zone.\n"
        "Do not crop, recolor, or place the code on a patterned background.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
