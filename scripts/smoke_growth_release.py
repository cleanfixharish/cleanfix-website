"""Read-only production verification for the approval-gated Growth Center.

Run through ``railway run`` so the short-lived token is signed with the live
service configuration. The script never prints credentials, email addresses,
post bodies, or campaign URLs, and it has no write operations.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit
from urllib.request import Request, urlopen


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPOSITORY_ROOT / "app" / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from core.auth import create_access_token  # noqa: E402
from core.config import settings  # noqa: E402


BASE_URL = "https://cleanfixharish.co.il"
GROWTH_API = f"{BASE_URL}/api/v1/admin/growth"
PILOT_AT = datetime(2026, 9, 8, 16, 30, tzinfo=timezone.utc)


def fail(message: str) -> None:
    raise SystemExit(f"FAIL: {message}")


def get_json(path: str, token: str) -> Any:
    request = Request(
        f"{GROWTH_API}{path}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        method="GET",
    )
    try:
        with urlopen(request, timeout=30) as response:
            status = response.status
            payload = json.load(response)
    except HTTPError as exc:
        fail(f"GET {path} returned HTTP {exc.code}")
    except (URLError, TimeoutError, json.JSONDecodeError) as exc:
        fail(f"GET {path} failed ({type(exc).__name__})")
    if status != 200:
        fail(f"GET {path} returned HTTP {status}")
    print(f"PASS: GET {path} -> 200")
    return payload


def parse_api_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def validate_settings(payload: dict[str, Any], owner_email: str) -> None:
    expected = {
        "enabled": False,
        "auto_generate": True,
        "auto_publish": False,
        "require_owner_approval": True,
        "timezone": "Asia/Jerusalem",
        "daily_time": "08:30",
        "daily_post_limit": 1,
        "lookahead_days": 3,
        "languages": ["he", "en"],
        "channels": ["facebook", "instagram"],
        "destination_url": "https://cleanfixharish.co.il/quote",
        "notification_email": owner_email,
    }
    for key, value in expected.items():
        if payload.get(key) != value:
            fail(f"unsafe or unexpected setting: {key}")
    if not str(payload.get("approved_facts", "")).strip():
        fail("approved factual reference notes are empty")
    if not str(payload.get("banned_phrases", "")).strip():
        fail("banned phrases are empty")
    print("PASS: conservative operating settings remain safely disabled")


def validate_summary(payload: dict[str, Any]) -> None:
    if payload.get("automatic_publish_available") is not False:
        fail("automatic publishing is unexpectedly available")
    states = {row.get("provider"): row.get("state") for row in payload.get("channel_status", [])}
    if states.get("manual_share") != "ready":
        fail("manual-share channel is not ready")
    for provider in ("facebook", "instagram", "x"):
        if states.get(provider) not in {"needs_official_connection", "not_configured"}:
            fail(f"{provider} is unexpectedly connected")
    print("PASS: external automatic publishing remains unavailable")


def validate_posts(payload: dict[str, Any]) -> list[dict[str, Any]]:
    items = payload.get("items")
    if not isinstance(items, list):
        fail("posts response has an unexpected shape")
    for post in items:
        status = post.get("status")
        content_version = post.get("content_version")
        approved_version = post.get("approved_version")
        if status in {"draft", "rejected"} and approved_version is not None:
            fail("an unapproved post retains an approved version")
        if status in {"approved", "scheduled", "published"} and approved_version != content_version:
            fail("an approved post has a stale approval version")
        if status == "published" and (not post.get("published_by") or not post.get("published_at")):
            fail("a published post is missing actor or timestamp")
    print(f"PASS: {len(items)} post record(s) are internally consistent")
    return items


def validate_live_links(posts: list[dict[str, Any]]) -> None:
    for post in posts:
        target = str(post.get("utm_url", ""))
        parts = urlsplit(target)
        if parts.scheme != "https" or parts.hostname != "cleanfixharish.co.il" or parts.path != "/quote":
            fail("a stored post has an unsafe campaign destination")
        try:
            request = Request(target, headers={"User-Agent": "CleanFixHarish release smoke"})
            with urlopen(request, timeout=30) as response:
                if response.status != 200:
                    fail("a campaign destination did not return HTTP 200")
        except HTTPError as exc:
            fail(f"a campaign destination returned HTTP {exc.code}")
        except (URLError, TimeoutError) as exc:
            fail(f"a campaign destination failed ({type(exc).__name__})")
    print(f"PASS: {len(posts)} campaign link(s) reach the live quote page")


def verify_first_batch(
    settings_payload: dict[str, Any],
    posts_payload: dict[str, Any],
    posts: list[dict[str, Any]],
    runs_payload: dict[str, Any],
    summary_payload: dict[str, Any],
) -> None:
    runs = runs_payload.get("items")
    if len(posts) != 4 or posts_payload.get("total") != 4:
        fail("first batch no longer contains exactly four posts")
    if not isinstance(runs, list) or len(runs) != 1 or runs_payload.get("total") != 1:
        fail("first batch no longer contains exactly one run")
    run = runs[0]
    if (
        run.get("trigger") != "admin"
        or run.get("status") != "completed"
        or run.get("drafts_created") != 4
        or run.get("error") is not None
    ):
        fail("first run is not a clean four-draft admin completion")

    expected_pairs = {
        (channel, language)
        for channel in ("facebook", "instagram")
        for language in ("he", "en")
    }
    actual_pairs = {(post.get("channel"), post.get("language")) for post in posts}
    if actual_pairs != expected_pairs:
        fail("first batch channel/language coverage changed")

    pilots = [post for post in posts if post.get("channel") == "facebook" and post.get("language") == "he"]
    if len(pilots) != 1:
        fail("prepared Hebrew Facebook pilot is missing or duplicated")
    pilot = pilots[0]
    if (
        pilot.get("id") != 1
        or pilot.get("content_version") != 3
        or parse_api_datetime(pilot.get("scheduled_for")) != PILOT_AT
    ):
        fail("prepared pilot ID, version, or time changed")
    if pilot.get("image_url") is not None or pilot.get("alt_text") is not None:
        fail("prepared text-only pilot unexpectedly has an asset")

    blocked = [
        phrase.strip().casefold()
        for phrase in str(settings_payload.get("banned_phrases", "")).splitlines()
        if phrase.strip()
    ]
    campaigns: set[str] = set()
    publication_fields = {
        "approved_version",
        "approved_at",
        "approved_by",
        "published_at",
        "published_by",
        "publication_url",
        "remote_id",
    }
    for post in posts:
        if post.get("status") != "draft" or any(post.get(field) is not None for field in publication_fields):
            fail("first batch is no longer entirely unapproved and unpublished")
        body = str(post.get("body", ""))
        if any(phrase in body.casefold() for phrase in blocked):
            fail("a first-batch draft contains a configured banned phrase")
        utm = urlsplit(str(post.get("utm_url", "")))
        query = parse_qs(utm.query)
        if query.get("utm_source") != [post.get("channel")] or query.get("utm_medium") != ["organic_social"]:
            fail("a first-batch UTM source or medium changed")
        campaigns.add(query.get("utm_campaign", [""])[0])
    if len(campaigns) != 1 or not next(iter(campaigns)).startswith("daily-organic-"):
        fail("first-batch campaign grouping changed")
    if summary_payload.get("counts") != {"draft": 4}:
        fail("summary no longer reports exactly four drafts")
    print("PASS: first supervised batch and prepared pilot remain exact")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--verify-first-batch",
        action="store_true",
        help="Verify the exact first production batch and prepared pilot without changing them.",
    )
    args = parser.parse_args()

    owner_email = str(getattr(settings, "admin_user_email", "")).strip()
    if not owner_email:
        fail("primary owner email is not configured")
    token = create_access_token(
        {
            "sub": "growth-release-smoke",
            "email": owner_email,
            "role": "admin",
            "name": "Release smoke",
        },
        expires_minutes=3,
    )

    settings_payload = get_json("/settings", token)
    posts_payload = get_json("/posts", token)
    summary_payload = get_json("/summary", token)
    runs_payload = get_json("/runs", token)
    validate_settings(settings_payload, owner_email)
    validate_summary(summary_payload)
    posts = validate_posts(posts_payload)
    validate_live_links(posts)
    if args.verify_first_batch:
        verify_first_batch(settings_payload, posts_payload, posts, runs_payload, summary_payload)
    print("PASS: Growth Center production read-only smoke completed")


if __name__ == "__main__":
    main()
