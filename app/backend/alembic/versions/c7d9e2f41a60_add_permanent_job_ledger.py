"""Add the append-only permanent job ledger foundation.

Revision ID: c7d9e2f41a60
Revises: b9e7d3c1a502
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c7d9e2f41a60"
down_revision: Union[str, Sequence[str], None] = "b9e7d3c1a502"
branch_labels = None
depends_on = None


LEDGER_TABLES = (
    "job_events",
    "completed_jobs",
    "completed_job_amendments",
    "financial_entries",
)


def upgrade() -> None:
    is_postgresql = op.get_bind().dialect.name == "postgresql"
    schema_name = "job_ledger" if is_postgresql else None
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgresql else sa.JSON()
    json_default = sa.text("'{}'::jsonb") if is_postgresql else sa.text("'{}'")
    jobs_fk = "public.jobs.id" if is_postgresql else "jobs.id"
    events_fk = "job_ledger.job_events.id" if is_postgresql else "job_events.id"
    completed_fk = "job_ledger.completed_jobs.id" if is_postgresql else "completed_jobs.id"
    amendments_fk = (
        "job_ledger.completed_job_amendments.id" if is_postgresql else "completed_job_amendments.id"
    )
    financial_fk = "job_ledger.financial_entries.id" if is_postgresql else "financial_entries.id"

    if is_postgresql:
        op.execute("CREATE SCHEMA IF NOT EXISTS job_ledger")

    op.create_table(
        "job_events",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("event_uuid", sa.String(length=36), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("sequence_number", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("schema_version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("actor_type", sa.String(length=30), nullable=False),
        sa.Column("actor_id", sa.String(length=255), nullable=False),
        sa.Column("actor_role", sa.String(length=30), nullable=False),
        sa.Column("source", sa.String(length=60), nullable=False),
        sa.Column("request_id", sa.String(length=100), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("previous_status", sa.String(length=50), nullable=True),
        sa.Column("new_status", sa.String(length=50), nullable=True),
        sa.Column("visibility", sa.String(length=30), server_default="owner", nullable=False),
        sa.Column(
            "payload",
            json_type,
            server_default=json_default,
            nullable=False,
        ),
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("previous_hash", sa.String(length=64), nullable=True),
        sa.Column("event_hash", sa.String(length=64), nullable=False),
        sa.CheckConstraint("sequence_number > 0", name="ck_job_events_positive_sequence"),
        sa.CheckConstraint("schema_version > 0", name="ck_job_events_positive_schema_version"),
        sa.CheckConstraint(
            "visibility IN ('owner', 'customer', 'provider')",
            name="ck_job_events_visibility",
        ),
        sa.ForeignKeyConstraint(["job_id"], [jobs_fk], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("event_uuid", name="uq_job_events_event_uuid"),
        sa.UniqueConstraint("job_id", "sequence_number", name="uq_job_events_job_sequence"),
        sa.UniqueConstraint("source", "idempotency_key", name="uq_job_events_source_idempotency"),
        schema=schema_name,
    )
    op.create_index("ix_job_events_job_id_id", "job_events", ["job_id", "id"], schema=schema_name)
    op.create_index("ix_job_events_recorded_at_id", "job_events", ["recorded_at", "id"], schema=schema_name)

    op.create_table(
        "completed_jobs",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("completion_sequence", sa.Integer(), server_default="1", nullable=False),
        sa.Column("completion_event_id", sa.BigInteger(), nullable=False),
        sa.Column("job_number", sa.String(length=40), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=True),
        sa.Column("provider_id", sa.Integer(), nullable=True),
        sa.Column("general_area", sa.String(length=100), nullable=True),
        sa.Column("scope_snapshot", json_type, nullable=False),
        sa.Column("actual_work_snapshot", json_type, nullable=False),
        sa.Column("schedule_snapshot", json_type, nullable=False),
        sa.Column("commercial_snapshot", json_type, nullable=False),
        sa.Column("evidence_manifest", json_type, nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completion_submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("quality_approved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finalized_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("currency", sa.String(length=3), server_default="ILS", nullable=False),
        sa.Column("customer_collected_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("provider_payable_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("provider_paid_amount", sa.Numeric(14, 2), server_default="0", nullable=False),
        sa.Column("direct_cost_amount", sa.Numeric(14, 2), server_default="0", nullable=False),
        sa.Column("payment_fee_amount", sa.Numeric(14, 2), server_default="0", nullable=False),
        sa.Column("refund_amount", sa.Numeric(14, 2), server_default="0", nullable=False),
        sa.Column("rework_cost_amount", sa.Numeric(14, 2), server_default="0", nullable=False),
        sa.Column("quality_outcome", sa.String(length=50), nullable=False),
        sa.Column("issue_summary", json_type, nullable=False),
        sa.Column("owner_coordination_minutes", sa.Integer(), nullable=True),
        sa.Column("finalized_by", sa.String(length=255), nullable=False),
        sa.Column("record_version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("record_hash", sa.String(length=64), nullable=False),
        sa.CheckConstraint("completion_sequence > 0", name="ck_completed_jobs_positive_sequence"),
        sa.CheckConstraint("record_version > 0", name="ck_completed_jobs_positive_record_version"),
        sa.CheckConstraint("currency = 'ILS'", name="ck_completed_jobs_currency_ils"),
        sa.CheckConstraint(
            "customer_collected_amount >= 0 AND provider_payable_amount >= 0 "
            "AND provider_paid_amount >= 0 AND direct_cost_amount >= 0 "
            "AND payment_fee_amount >= 0 AND refund_amount >= 0 AND rework_cost_amount >= 0",
            name="ck_completed_jobs_nonnegative_amounts",
        ),
        sa.ForeignKeyConstraint(["job_id"], [jobs_fk], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["completion_event_id"], [events_fk], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id", "completion_sequence", name="uq_completed_jobs_job_sequence"),
        sa.UniqueConstraint("record_hash", name="uq_completed_jobs_record_hash"),
        schema=schema_name,
    )
    op.create_index("ix_completed_jobs_completed_at_id", "completed_jobs", ["completed_at", "id"], schema=schema_name)
    op.create_index(
        "ix_completed_jobs_provider_completed",
        "completed_jobs",
        ["provider_id", "completed_at"],
        schema=schema_name,
    )
    op.create_index(
        "ix_completed_jobs_service_completed",
        "completed_jobs",
        ["service_id", "completed_at"],
        schema=schema_name,
    )

    op.create_table(
        "completed_job_amendments",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("completed_job_id", sa.BigInteger(), nullable=False),
        sa.Column("amendment_type", sa.String(length=60), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("changes", json_type, nullable=False),
        sa.Column("corrects_amendment_id", sa.BigInteger(), nullable=True),
        sa.Column("created_by", sa.String(length=255), nullable=False),
        sa.Column("approved_by", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("effective_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("previous_record_hash", sa.String(length=64), nullable=False),
        sa.Column("new_record_hash", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["completed_job_id"], [completed_fk], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(
            ["corrects_amendment_id"],
            [amendments_fk],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        schema=schema_name,
    )
    op.create_index(
        "ix_completed_job_amendments_record_id",
        "completed_job_amendments",
        ["completed_job_id", "id"],
        schema=schema_name,
    )

    op.create_table(
        "financial_entries",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("entry_uuid", sa.String(length=36), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("event_id", sa.BigInteger(), nullable=False),
        sa.Column("entry_type", sa.String(length=40), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), server_default="ILS", nullable=False),
        sa.Column("external_reference", sa.String(length=255), nullable=True),
        sa.Column("reverses_entry_id", sa.BigInteger(), nullable=True),
        sa.Column("recorded_by", sa.String(length=255), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("entry_hash", sa.String(length=64), nullable=False),
        sa.CheckConstraint("amount >= 0", name="ck_financial_entries_nonnegative_amount"),
        sa.CheckConstraint("currency = 'ILS'", name="ck_financial_entries_currency_ils"),
        sa.CheckConstraint(
            "entry_type IN ('customer_collection', 'customer_refund', 'provider_payable', "
            "'provider_payment', 'direct_cost', 'payment_fee', 'rework_cost', 'acquisition_cost')",
            name="ck_financial_entries_type",
        ),
        sa.ForeignKeyConstraint(["job_id"], [jobs_fk], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["event_id"], [events_fk], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["reverses_entry_id"], [financial_fk], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("entry_uuid", name="uq_financial_entries_entry_uuid"),
        sa.UniqueConstraint("entry_hash", name="uq_financial_entries_entry_hash"),
        schema=schema_name,
    )
    op.create_index(
        "ix_financial_entries_job_id_id",
        "financial_entries",
        ["job_id", "id"],
        schema=schema_name,
    )
    op.create_index(
        "ix_financial_entries_recorded_at_id",
        "financial_entries",
        ["recorded_at", "id"],
        schema=schema_name,
    )

    if is_postgresql:
        op.execute(
            """
            CREATE FUNCTION job_ledger.reject_immutable_mutation() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'job ledger rows are append-only';
            END;
            $$ LANGUAGE plpgsql;
            """
        )
        for table_name in LEDGER_TABLES:
            op.execute(
                f"""
                CREATE TRIGGER {table_name}_append_only
                BEFORE UPDATE OR DELETE ON job_ledger.{table_name}
                FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation();
                """
            )
    else:
        for table_name in LEDGER_TABLES:
            for operation in ("UPDATE", "DELETE"):
                op.execute(
                    f"""
                    CREATE TRIGGER {table_name}_append_only_{operation.lower()}
                    BEFORE {operation} ON {table_name}
                    BEGIN
                        SELECT RAISE(ABORT, 'job ledger rows are append-only');
                    END;
                    """
                )


def downgrade() -> None:
    is_postgresql = op.get_bind().dialect.name == "postgresql"
    schema_name = "job_ledger" if is_postgresql else None

    for table_name in reversed(LEDGER_TABLES):
        if is_postgresql:
            op.execute(f"DROP TRIGGER IF EXISTS {table_name}_append_only ON job_ledger.{table_name}")
        else:
            op.execute(f"DROP TRIGGER IF EXISTS {table_name}_append_only_update")
            op.execute(f"DROP TRIGGER IF EXISTS {table_name}_append_only_delete")
    if is_postgresql:
        op.execute("DROP FUNCTION IF EXISTS job_ledger.reject_immutable_mutation()")

    op.drop_index("ix_financial_entries_recorded_at_id", table_name="financial_entries", schema=schema_name)
    op.drop_index("ix_financial_entries_job_id_id", table_name="financial_entries", schema=schema_name)
    op.drop_table("financial_entries", schema=schema_name)
    op.drop_index(
        "ix_completed_job_amendments_record_id",
        table_name="completed_job_amendments",
        schema=schema_name,
    )
    op.drop_table("completed_job_amendments", schema=schema_name)
    op.drop_index("ix_completed_jobs_service_completed", table_name="completed_jobs", schema=schema_name)
    op.drop_index("ix_completed_jobs_provider_completed", table_name="completed_jobs", schema=schema_name)
    op.drop_index("ix_completed_jobs_completed_at_id", table_name="completed_jobs", schema=schema_name)
    op.drop_table("completed_jobs", schema=schema_name)
    op.drop_index("ix_job_events_recorded_at_id", table_name="job_events", schema=schema_name)
    op.drop_index("ix_job_events_job_id_id", table_name="job_events", schema=schema_name)
    op.drop_table("job_events", schema=schema_name)
    if is_postgresql:
        op.execute("DROP SCHEMA IF EXISTS job_ledger")
