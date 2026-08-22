from pathlib import Path
from PIL import Image


SOURCE = Path(r"C:\Users\Aviel\.codex\generated_images\01a0280a-c50a-7320-866a-3981bf0f5d4b")
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "assets" / "images" / "transformations"

ASSETS = {
    "garden-balcony": "exec-431833cd-f9db-417e-9f18-9efcf2cf853d.png",
    "garden-entrance": "exec-d7abda26-0c9a-436b-b4f4-ad9374567323.png",
    "garden-family": "exec-e929e696-9359-45d4-b3b1-afc0d91290c6.png",
    "garden-estate": "exec-39951bbd-0fde-44e9-86c4-4929e3cd17bd.png",
    "garden-courtyard-waterfall": "exec-c0c8b967-9a4b-42ca-b152-f910c8c4f98d.png",
    "garden-sensory-stream": "exec-2547ee14-e823-42af-9e29-f491b376bf2b.png",
    "garden-rooftop-water": "exec-b4160e6a-dec7-4b6f-b3c7-2263019fa1f8.png",
    "garden-hillside-cascade": "exec-72001355-a9a4-4f06-bb4b-e21f877fc5e9.png",
    "deep-cleaning-kitchen": "exec-907bbdca-5d68-40ce-9c33-82e8d0a5007b.png",
    "post-renovation-living": "exec-63c0f3d8-ceea-4bde-821a-4fa6c4517166.png",
    "handyman-wall": "exec-109e3e0a-79e0-49d7-b0ef-d62c484e79f8.png",
    "window-cleaning": "exec-ca122220-a1f9-4cba-82ec-8e5c2c80b4a7.png",
    "ac-cleaning": "exec-f11b970e-41a6-4112-8b94-578875dff955.png",
    "move-in-setup": "exec-a7b7dd67-1dd6-4246-ab06-eeefe475c646.png",
}


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for slug, source_name in ASSETS.items():
        source = SOURCE / source_name
        if not source.exists():
            raise FileNotFoundError(source)
        with Image.open(source) as image:
            image = image.convert("RGB")
            image.thumbnail((1536, 1024), Image.Resampling.LANCZOS)
            image.save(OUTPUT / f"{slug}-1536.webp", "WEBP", quality=84, method=6)
            mobile = image.copy()
            mobile.thumbnail((960, 640), Image.Resampling.LANCZOS)
            mobile.save(OUTPUT / f"{slug}-960.webp", "WEBP", quality=82, method=6)


if __name__ == "__main__":
    main()
