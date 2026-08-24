from __future__ import annotations

import asyncio
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import edge_tts
import imageio_ffmpeg


ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "app" / "frontend" / "public" / "media"
EPISODES = ("concept", "customer", "technology", "elevator")
VOICES = {
    "יעל": ("he-IL-HilaNeural", "-5%", "+1Hz"),
    "דניאל": ("he-IL-AvriNeural", "-7%", "-1Hz"),
}


def parse_dialogue(path: Path) -> list[tuple[str, str]]:
    turns: list[tuple[str, str]] = []
    current_speaker: str | None = None
    current_text: list[str] = []

    def flush() -> None:
        nonlocal current_speaker, current_text
        if current_speaker and current_text:
            text = " ".join(part.strip() for part in current_text if part.strip())
            if text:
                turns.append((current_speaker, text))
        current_speaker = None
        current_text = []

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        match = re.match(r"^(יעל|דניאל):\s*(.*)$", line)
        if match:
            flush()
            current_speaker = match.group(1)
            current_text = [match.group(2)]
        elif current_speaker and line:
            current_text.append(line)
    flush()
    if len(turns) < 8:
        raise ValueError(f"Expected at least 8 dialogue turns in {path}, found {len(turns)}")
    return turns


async def synthesize_episode(key: str) -> None:
    transcript = MEDIA / f"CleanFixHarish-{key}-HE.txt"
    output = MEDIA / f"CleanFixHarish-{key}-HE-v2.mp3"
    turns = parse_dialogue(transcript)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    with tempfile.TemporaryDirectory(prefix=f"cleanfix-{key}-") as temp_dir_name:
        temp_dir = Path(temp_dir_name)
        segment_paths: list[Path] = []
        for index, (speaker, text) in enumerate(turns):
            voice, rate, pitch = VOICES[speaker]
            segment = temp_dir / f"{index:03d}-{speaker}.mp3"
            await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(str(segment))
            segment_paths.append(segment)

        concat_file = temp_dir / "segments.txt"
        concat_file.write_text(
            "\n".join(f"file '{path.as_posix()}'" for path in segment_paths),
            encoding="utf-8",
        )
        temp_output = temp_dir / output.name
        subprocess.run(
            [
                ffmpeg,
                "-hide_banner",
                "-loglevel",
                "error",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_file),
                "-c:a",
                "libmp3lame",
                "-b:a",
                "128k",
                "-ar",
                "24000",
                "-y",
                str(temp_output),
            ],
            check=True,
        )
        shutil.copy2(temp_output, output)
        print(f"built {output.name}: {len(turns)} turns, {output.stat().st_size} bytes")


async def main() -> None:
    for episode in EPISODES:
        await synthesize_episode(episode)


if __name__ == "__main__":
    asyncio.run(main())
