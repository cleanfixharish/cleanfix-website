"""Generate JPEG/WebP srcset variants for public documentary photos."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "public" / "assets" / "images"
WIDTHS = (480, 768, 1200)
SOURCES = [
    ROOT / "cleanfix-mobile-v3" / "ac-maintenance.png",
    ROOT / "cleanfix-mobile-v3" / "handyman-shelf.png",
    ROOT / "cleanfix-mobile-v3" / "move-in-window-cleaning.png",
    ROOT / "cleanfix-mobile-v3" / "post-renovation-cleaning.png",
    ROOT / "cleanfix-documentary" / "hero-managed-service.png",
    ROOT / "cleanfix-documentary" / "quality-handover.png",
    ROOT / "cleanfix-documentary" / "service-journey.png",
]


def fit_width(image: Image.Image, width: int) -> Image.Image:
    if image.width <= width:
        return image
    height = max(1, round(image.height * (width / image.width)))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def main() -> None:
    for source in SOURCES:
        if not source.exists():
            out_dir = source.parent / "web"
            expected = [
                out_dir / f"{source.stem}-{width}.{ext}"
                for width in WIDTHS
                for ext in ("jpg", "webp")
            ]
            if all(path.exists() for path in expected):
                print(f"Using existing optimized variants for {source.stem}")
                continue
            raise SystemExit(f"Missing source image and optimized variants: {source}")

        image = ImageOps.exif_transpose(Image.open(source))
        image = image.convert("RGB")
        out_dir = source.parent / "web"
        out_dir.mkdir(exist_ok=True)
        stem = source.stem
        print(f"{source.relative_to(ROOT)} {image.size[0]}x{image.size[1]}")

        for width in WIDTHS:
            resized = fit_width(image, width)
            jpeg_path = out_dir / f"{stem}-{resized.width}.jpg"
            webp_path = out_dir / f"{stem}-{resized.width}.webp"
            resized.save(jpeg_path, "JPEG", quality=76, optimize=True, progressive=True)
            resized.save(webp_path, "WEBP", quality=72, method=6)
            print(
                f"  {jpeg_path.name} {jpeg_path.stat().st_size}  "
                f"{webp_path.name} {webp_path.stat().st_size}  {resized.size[0]}x{resized.size[1]}"
            )


if __name__ == "__main__":
    main()
