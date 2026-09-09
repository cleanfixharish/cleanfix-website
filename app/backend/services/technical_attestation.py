"""Fail-closed policy foundation for signed technical-gate attestations.

No route or CLI calls this module yet.  In particular, claim validation is not
signature verification: ingestion deliberately raises until GitHub OIDC and
Sigstore bundle verification is implemented and covered by integration tests.
"""

from datetime import datetime, timedelta, timezone
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from services.pilot_readiness import PILOT_SCOPE_HASH, PILOT_SCOPE_VERSION, TECHNICAL_GATES


EXPECTED_REPOSITORY = "cleanfixharish/cleanfix-website"
EXPECTED_GIT_REF = "refs/heads/main"
EXPECTED_MIGRATION_HEAD = "e6a4b9c32d51"
EXPECTED_OIDC_ISSUER = "https://token.actions.githubusercontent.com"
WORKFLOW_GATE_ALLOWLIST = {
    ".github/workflows/pilot-booking-schedule.yml": "SYSTEM_BOOKING_SCHEDULE_VERIFIED",
    ".github/workflows/pilot-provider-eligibility.yml": "SYSTEM_PROVIDER_ELIGIBILITY_VERIFIED",
    ".github/workflows/pilot-offer-assignment.yml": "SYSTEM_OFFER_ASSIGNMENT_VERIFIED",
    ".github/workflows/pilot-provider-mobile.yml": "SYSTEM_PROVIDER_MOBILE_WORKFLOW_VERIFIED",
    ".github/workflows/pilot-private-evidence.yml": "SYSTEM_PRIVATE_EVIDENCE_VERIFIED",
    ".github/workflows/pilot-quality-rework.yml": "SYSTEM_QUALITY_REWORK_VERIFIED",
    ".github/workflows/pilot-payment-payout-ledger.yml": "SYSTEM_PAYMENT_PAYOUT_LEDGER_VERIFIED",
    ".github/workflows/pilot-guarded-completion.yml": "SYSTEM_GUARDED_COMPLETION_VERIFIED",
    ".github/workflows/pilot-isolated-restore-parity.yml": "SYSTEM_ISOLATED_RESTORE_PARITY_VERIFIED",
}


class TechnicalAttestationRejected(ValueError):
    pass


class TechnicalAttestationVerificationUnavailable(RuntimeError):
    pass


class TechnicalAttestationEnvelope(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    schema_version: str = Field(pattern=r"^cleanfix-pilot-attestation/v1$")
    gate_key: str
    repository: str
    workflow_path: str
    git_ref: str
    run_id: str = Field(pattern=r"^[1-9][0-9]{0,39}$")
    run_attempt: int = Field(ge=1)
    commit_sha: str = Field(pattern=r"^[0-9a-f]{40}$")
    release_sha: str = Field(pattern=r"^[0-9a-f]{40}$")
    migration_head: str
    scope_version: str
    scope_hash: str = Field(pattern=r"^[0-9a-f]{64}$")
    environment: str = Field(pattern=r"^production$")
    artifact_reference: str = Field(pattern=r"^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$")
    artifact_digest: str = Field(pattern=r"^[0-9a-f]{64}$")
    issued_at: datetime
    expires_at: datetime

    @field_validator("issued_at", "expires_at")
    @classmethod
    def timestamps_are_aware(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("Attestation timestamps must include a timezone")
        return value


def validate_attestation_claims(
    envelope: TechnicalAttestationEnvelope, *, expected_release_sha: str,
    now: datetime | None = None,
) -> None:
    current = now or datetime.now(timezone.utc)
    expected_gate = WORKFLOW_GATE_ALLOWLIST.get(envelope.workflow_path)
    if expected_gate is None or expected_gate != envelope.gate_key or envelope.gate_key not in TECHNICAL_GATES:
        raise TechnicalAttestationRejected("Workflow is not allowlisted for this technical gate")
    if envelope.repository != EXPECTED_REPOSITORY or envelope.git_ref != EXPECTED_GIT_REF:
        raise TechnicalAttestationRejected("Repository or protected ref does not match policy")
    if envelope.scope_version != PILOT_SCOPE_VERSION or envelope.scope_hash != PILOT_SCOPE_HASH:
        raise TechnicalAttestationRejected("Pilot scope binding does not match the reviewed release")
    if envelope.migration_head != EXPECTED_MIGRATION_HEAD:
        raise TechnicalAttestationRejected("Migration head does not match the reviewed release")
    if not re.fullmatch(r"[0-9a-f]{40}", expected_release_sha):
        raise TechnicalAttestationRejected("The deployed release SHA is unavailable")
    if envelope.commit_sha != envelope.release_sha or envelope.release_sha != expected_release_sha:
        raise TechnicalAttestationRejected("Attestation does not describe the deployed release")
    issued = envelope.issued_at.astimezone(timezone.utc)
    expires = envelope.expires_at.astimezone(timezone.utc)
    if issued > current + timedelta(minutes=5) or expires <= current or expires > issued + timedelta(hours=24):
        raise TechnicalAttestationRejected("Attestation is not current or exceeds its maximum lifetime")


async def ingest_signed_github_attestation(
    db: AsyncSession, *, envelope: TechnicalAttestationEnvelope, expected_release_sha: str,
    signature_bundle: bytes, **_kwargs,
):
    """Validate public claims, then stop until cryptographic verification exists."""
    validate_attestation_claims(envelope, expected_release_sha=expected_release_sha)
    try:
        live_head = await db.scalar(text("SELECT version_num FROM alembic_version"))
    except SQLAlchemyError as exc:
        raise TechnicalAttestationVerificationUnavailable(
            "Live database migration state is unavailable; no gate was changed"
        ) from exc
    if live_head != EXPECTED_MIGRATION_HEAD:
        raise TechnicalAttestationRejected("Live database migration head does not match the reviewed release")
    if not signature_bundle:
        raise TechnicalAttestationRejected("A Sigstore signature bundle is required")
    raise TechnicalAttestationVerificationUnavailable(
        "GitHub OIDC/Sigstore verification is not configured; no gate was changed"
    )


assert set(WORKFLOW_GATE_ALLOWLIST.values()) == set(TECHNICAL_GATES)
