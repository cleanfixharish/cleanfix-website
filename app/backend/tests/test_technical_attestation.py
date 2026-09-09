from datetime import datetime, timedelta, timezone

import pytest

from models.pilot import PilotTechnicalAttestation
from services.technical_attestation import (
    EXPECTED_MIGRATION_HEAD, EXPECTED_REPOSITORY, EXPECTED_GIT_REF,
    TechnicalAttestationEnvelope, TechnicalAttestationRejected,
    TechnicalAttestationVerificationUnavailable, WORKFLOW_GATE_ALLOWLIST,
    ingest_signed_github_attestation, validate_attestation_claims,
)
from services.pilot_readiness import PILOT_SCOPE_HASH, PILOT_SCOPE_VERSION, TECHNICAL_GATES


RELEASE = "a" * 40


class _LiveDatabaseAtExpectedHead:
    async def scalar(self, _statement):
        return EXPECTED_MIGRATION_HEAD


def envelope(**changes) -> TechnicalAttestationEnvelope:
    now = datetime.now(timezone.utc)
    workflow, gate = next(iter(WORKFLOW_GATE_ALLOWLIST.items()))
    data = {
        "schema_version": "cleanfix-pilot-attestation/v1", "gate_key": gate,
        "repository": EXPECTED_REPOSITORY, "workflow_path": workflow,
        "git_ref": EXPECTED_GIT_REF, "run_id": "123", "run_attempt": 1,
        "commit_sha": RELEASE, "release_sha": RELEASE,
        "migration_head": EXPECTED_MIGRATION_HEAD,
        "scope_version": PILOT_SCOPE_VERSION, "scope_hash": PILOT_SCOPE_HASH,
        "environment": "production", "artifact_reference": "gha:123:artifact:pilot",
        "artifact_digest": "b" * 64, "issued_at": now,
        "expires_at": now + timedelta(hours=1),
    }
    data.update(changes)
    return TechnicalAttestationEnvelope(**data)


def test_allowlist_maps_each_technical_gate_exactly_once():
    assert set(WORKFLOW_GATE_ALLOWLIST.values()) == set(TECHNICAL_GATES)
    assert len(WORKFLOW_GATE_ALLOWLIST) == len(TECHNICAL_GATES)


def test_claim_policy_rejects_gate_workflow_release_and_replay_scope_drift():
    validate_attestation_claims(envelope(), expected_release_sha=RELEASE)
    with pytest.raises(TechnicalAttestationRejected):
        validate_attestation_claims(envelope(gate_key="SYSTEM_GUARDED_COMPLETION_VERIFIED"), expected_release_sha=RELEASE)
    with pytest.raises(TechnicalAttestationRejected):
        validate_attestation_claims(envelope(release_sha="c" * 40), expected_release_sha=RELEASE)
    with pytest.raises(TechnicalAttestationRejected):
        validate_attestation_claims(envelope(scope_hash="d" * 64), expected_release_sha=RELEASE)


@pytest.mark.asyncio
async def test_ingestion_is_fail_closed_until_signature_verifier_exists():
    with pytest.raises(TechnicalAttestationVerificationUnavailable, match="no gate was changed"):
        await ingest_signed_github_attestation(
            _LiveDatabaseAtExpectedHead(), envelope=envelope(),
            expected_release_sha=RELEASE, signature_bundle=b"untrusted"
        )


@pytest.mark.asyncio
async def test_ingestion_rejects_live_database_head_drift():
    class DriftedDatabase:
        async def scalar(self, _statement):
            return "obsolete"

    with pytest.raises(TechnicalAttestationRejected, match="Live database migration head"):
        await ingest_signed_github_attestation(
            DriftedDatabase(), envelope=envelope(),
            expected_release_sha=RELEASE, signature_bundle=b"untrusted",
        )


def test_attestation_ledger_has_replay_and_release_binding_columns():
    columns = set(PilotTechnicalAttestation.__table__.columns.keys())
    assert {"gate_key", "repository", "workflow_path", "run_id", "run_attempt", "release_sha", "migration_head", "scope_hash", "artifact_digest", "signature_bundle_digest", "oidc_issuer", "oidc_subject"} <= columns
