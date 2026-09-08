"""Run a synthetic, permanently-audited job command smoke test in isolated staging."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4

import httpx


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "app" / "backend"))

from core.auth import create_access_token  # noqa: E402
from core.config import settings  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-staging-mutation", action="store_true")
    args = parser.parse_args()
    base_url = os.environ.get("STAGING_BASE_URL", "").rstrip("/")
    host = (urlparse(base_url).hostname or "").lower()
    if not args.allow_staging_mutation or "staging" not in host or host == "cleanfixharish.co.il":
        raise SystemExit("Refusing mutation: explicit isolated staging URL and flag are required")

    owner_email = str(getattr(settings, "admin_user_email", "")).strip()
    if not owner_email:
        raise SystemExit("Primary owner email is not configured")
    token = create_access_token(
        {"sub": "job-lifecycle-staging-smoke", "email": owner_email, "role": "admin", "name": "Staging smoke"},
        expires_minutes=3,
    )
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    create_headers = {**headers, "Idempotency-Key": f"staging-create-{uuid4()}"}
    with httpx.Client(base_url=base_url, timeout=20.0, follow_redirects=False) as client:
        created = client.post(
            "/api/v1/entities/jobs",
            headers=create_headers,
            json={
                "customer_name": "STAGING SYNTHETIC — NOT A CUSTOMER",
                "title": "Controlled lifecycle release proof",
                "status": "scheduled",
                "notes": "Synthetic staging-only record. No customer or provider data.",
            },
        )
        created.raise_for_status()
        job_id = created.json()["id"]

        started = client.post(
            f"/api/v1/entities/jobs/{job_id}/transitions",
            headers=headers,
            json={"new_status": "in_progress", "idempotency_key": f"staging-start-{uuid4()}"},
        )
        started.raise_for_status()

        invalid = client.post(
            f"/api/v1/entities/jobs/{job_id}/transitions",
            headers=headers,
            json={"new_status": "completed", "idempotency_key": f"staging-invalid-{uuid4()}"},
        )
        if invalid.status_code not in {409, 422}:
            raise RuntimeError(f"Unsafe direct completion returned HTTP {invalid.status_code}")

        cancelled = client.post(
            f"/api/v1/entities/jobs/{job_id}/transitions",
            headers=headers,
            json={
                "new_status": "cancelled",
                "idempotency_key": f"staging-cancel-{uuid4()}",
                "reason": "Release proof finished; retain this synthetic staging audit trail.",
            },
        )
        cancelled.raise_for_status()
        events = client.get(f"/api/v1/entities/jobs/{job_id}/events", headers=headers)
        events.raise_for_status()
        event_list = events.json()
        if [item["new_status"] for item in event_list] != ["scheduled", "in_progress", "cancelled"]:
            raise RuntimeError("Unexpected permanent job timeline")

        hard_delete = client.delete(f"/api/v1/entities/jobs/{job_id}", headers=headers)
        if hard_delete.status_code != 405:
            raise RuntimeError(f"Hard delete was not blocked: HTTP {hard_delete.status_code}")

    print("PASS: isolated staging job lifecycle, audit timeline, completion lock, and hard-delete guard")


if __name__ == "__main__":
    main()
