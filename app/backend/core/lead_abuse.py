import time
from collections import OrderedDict
from dataclasses import dataclass
from threading import Lock

from fastapi import HTTPException, Request, status

MAX_LEAD_INTAKE_REQUESTS = 10
LEAD_INTAKE_WINDOW_SECONDS = 3600
MAX_TRACKED_LEAD_INTAKE_IPS = 10_000

_lock = Lock()
_request_times: OrderedDict[str, list[float]] = OrderedDict()


@dataclass
class LeadIntakeGuardResult:
    allowed: bool
    reason: str = ""


def client_ip(request: Request) -> str:
    cloudflare_ip = request.headers.get("cf-connecting-ip")
    if cloudflare_ip:
        return cloudflare_ip.strip()
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _prune_expired_timestamps(
    timestamps: list[float],
    current_time: float,
    window_seconds: int,
) -> list[float]:
    return [timestamp for timestamp in timestamps if current_time - timestamp < window_seconds]


def _purge_stale_ips(current_time: float, window_seconds: int) -> None:
    stale_ips = [
        ip
        for ip, timestamps in _request_times.items()
        if not _prune_expired_timestamps(timestamps, current_time, window_seconds)
    ]
    for ip in stale_ips:
        del _request_times[ip]


def _ensure_ip_capacity(max_tracked_ips: int) -> None:
    while len(_request_times) >= max_tracked_ips:
        _request_times.popitem(last=False)


def tracked_lead_intake_ip_count() -> int:
    """Return the number of IPs currently tracked (for tests)."""
    with _lock:
        return len(_request_times)


def evaluate_lead_intake_submission(
    request: Request,
    honeypot: str | None,
    *,
    max_requests: int = MAX_LEAD_INTAKE_REQUESTS,
    window_seconds: int = LEAD_INTAKE_WINDOW_SECONDS,
    max_tracked_ips: int = MAX_TRACKED_LEAD_INTAKE_IPS,
    now: float | None = None,
) -> LeadIntakeGuardResult:
    """Apply lightweight local abuse controls for anonymous quote submissions."""
    if honeypot and honeypot.strip():
        return LeadIntakeGuardResult(allowed=False, reason="honeypot")

    current_time = time.monotonic() if now is None else now
    ip = client_ip(request)

    with _lock:
        _purge_stale_ips(current_time, window_seconds)

        recent = _prune_expired_timestamps(_request_times.get(ip, []), current_time, window_seconds)
        if len(recent) >= max_requests:
            if recent:
                _request_times[ip] = recent
                _request_times.move_to_end(ip)
            return LeadIntakeGuardResult(allowed=False, reason="rate_limit")

        if ip not in _request_times:
            _ensure_ip_capacity(max_tracked_ips)

        recent.append(current_time)
        _request_times[ip] = recent
        _request_times.move_to_end(ip)

    return LeadIntakeGuardResult(allowed=True)


def enforce_lead_intake_guard(request: Request, honeypot: str | None) -> None:
    result = evaluate_lead_intake_submission(request, honeypot)
    if result.allowed:
        return

    if result.reason == "honeypot":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid submission")

    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Too many quote requests. Please try again later or contact us on WhatsApp.",
    )


def reset_lead_intake_guard_state() -> None:
    """Clear in-memory rate-limit state (for tests)."""
    with _lock:
        _request_times.clear()
