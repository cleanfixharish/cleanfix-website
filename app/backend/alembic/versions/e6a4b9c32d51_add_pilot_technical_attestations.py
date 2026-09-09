"""Add immutable signed technical-gate attestation receipts.

Revision ID: e6a4b9c32d51
Revises: d5f3a8b21c40
"""

from alembic import op
import sqlalchemy as sa


revision = "e6a4b9c32d51"
down_revision = "d5f3a8b21c40"
branch_labels = None
depends_on = None


TECHNICAL_GATES_SQL = (
    "'SYSTEM_BOOKING_SCHEDULE_VERIFIED',"
    "'SYSTEM_PROVIDER_ELIGIBILITY_VERIFIED',"
    "'SYSTEM_OFFER_ASSIGNMENT_VERIFIED',"
    "'SYSTEM_PROVIDER_MOBILE_WORKFLOW_VERIFIED',"
    "'SYSTEM_PRIVATE_EVIDENCE_VERIFIED',"
    "'SYSTEM_QUALITY_REWORK_VERIFIED',"
    "'SYSTEM_PAYMENT_PAYOUT_LEDGER_VERIFIED',"
    "'SYSTEM_GUARDED_COMPLETION_VERIFIED',"
    "'SYSTEM_ISOLATED_RESTORE_PARITY_VERIFIED'"
)


def upgrade() -> None:
    is_pg = op.get_bind().dialect.name == "postgresql"
    attestation_id = (
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True)
        if is_pg else sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True)
    )
    op.create_table(
        "pilot_technical_attestations",
        attestation_id,
        sa.Column("gate_key", sa.String(100), nullable=False),
        sa.Column("repository", sa.String(200), nullable=False),
        sa.Column("workflow_path", sa.String(200), nullable=False),
        sa.Column("git_ref", sa.String(200), nullable=False),
        sa.Column("run_id", sa.String(40), nullable=False),
        sa.Column("run_attempt", sa.Integer(), nullable=False),
        sa.Column("commit_sha", sa.String(64), nullable=False),
        sa.Column("release_sha", sa.String(64), nullable=False),
        sa.Column("migration_head", sa.String(40), nullable=False),
        sa.Column("scope_version", sa.String(80), nullable=False),
        sa.Column("scope_hash", sa.String(64), nullable=False),
        sa.Column("environment", sa.String(80), nullable=False),
        sa.Column("artifact_reference", sa.String(120), nullable=False),
        sa.Column("artifact_digest", sa.String(64), nullable=False),
        sa.Column("signature_bundle_digest", sa.String(64), nullable=False),
        sa.Column("oidc_issuer", sa.String(300), nullable=False),
        sa.Column("oidc_subject", sa.String(500), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(f"gate_key IN ({TECHNICAL_GATES_SQL})", name="ck_pilot_technical_attestation_gate"),
        sa.CheckConstraint("run_attempt >= 1", name="ck_pilot_technical_attestation_attempt"),
        sa.CheckConstraint("length(commit_sha) = 40 AND length(release_sha) = 40", name="ck_pilot_technical_attestation_release_hashes"),
        sa.CheckConstraint("length(scope_hash) = 64 AND length(artifact_digest) = 64 AND length(signature_bundle_digest) = 64", name="ck_pilot_technical_attestation_digests"),
        sa.CheckConstraint("environment = 'production'", name="ck_pilot_technical_attestation_environment"),
        sa.CheckConstraint("expires_at > issued_at", name="ck_pilot_technical_attestation_lifetime"),
        sa.UniqueConstraint("repository", "workflow_path", "run_id", "run_attempt", name="uq_pilot_technical_attestation_run"),
        sa.UniqueConstraint("artifact_digest", name="uq_pilot_technical_attestation_artifact"),
    )
    op.create_index("ix_pilot_technical_attestations_gate_key", "pilot_technical_attestations", ["gate_key"])
    if is_pg:
        op.execute(
            "CREATE TRIGGER pilot_technical_attestations_append_only "
            "BEFORE UPDATE OR DELETE ON pilot_technical_attestations "
            "FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation()"
        )


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TRIGGER IF EXISTS pilot_technical_attestations_append_only ON pilot_technical_attestations")
    op.drop_index("ix_pilot_technical_attestations_gate_key", table_name="pilot_technical_attestations")
    op.drop_table("pilot_technical_attestations")
