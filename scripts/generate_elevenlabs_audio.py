"""Generate a single ElevenLabs MP3 without storing or printing the API key."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request


API_ROOT = "https://api.elevenlabs.io"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice-id", required=True)
    parser.add_argument("--model-id", default="eleven_v3_conversational")
    parser.add_argument("--language-code", choices=("en", "he"), required=True)
    parser.add_argument("--text-file", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise SystemExit("ELEVENLABS_API_KEY is not available")
    if args.output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite existing file: {args.output}")

    text = args.text_file.read_text(encoding="utf-8").strip()
    if not text:
        raise SystemExit("Input text is empty")

    voice_id = urllib.parse.quote(args.voice_id, safe="")
    url = f"{API_ROOT}/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"
    payload = json.dumps(
        {
            "text": text,
            "model_id": args.model_id,
            "language_code": args.language_code,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "xi-api-key": key,
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            audio = response.read()
            character_cost = response.headers.get("character-cost", "unknown")
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise SystemExit(f"ElevenLabs returned HTTP {error.code}: {details}") from error

    if not audio.startswith(b"ID3") and not audio.startswith(b"\xff"):
        raise SystemExit("ElevenLabs response did not look like an MP3")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(audio)
    print(
        json.dumps(
            {
                "output": str(args.output),
                "bytes": len(audio),
                "characters": len(text),
                "character_cost": character_cost,
                "voice_id": args.voice_id,
                "model_id": args.model_id,
                "language_code": args.language_code,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
