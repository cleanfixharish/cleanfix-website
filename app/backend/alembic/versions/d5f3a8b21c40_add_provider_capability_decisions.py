"""Add append-only evidence-backed provider capability decisions.

Revision ID: d5f3a8b21c40
Revises: c4e2a7d91b30
"""

from alembic import op
import sqlalchemy as sa

revision = "d5f3a8b21c40"
down_revision = "c4e2a7d91b30"
branch_labels = None
depends_on = None


def _protect_sqlite_offer_events() -> None:
    op.execute("""
        CREATE TRIGGER IF NOT EXISTS assignment_offer_events_append_only_update
        BEFORE UPDATE ON assignment_offer_events
        BEGIN SELECT RAISE(ABORT, 'assignment_offer_events is append-only'); END
    """)
    op.execute("""
        CREATE TRIGGER IF NOT EXISTS assignment_offer_events_append_only_delete
        BEFORE DELETE ON assignment_offer_events
        BEGIN SELECT RAISE(ABORT, 'assignment_offer_events is append-only'); END
    """)


def upgrade() -> None:
    op.create_table(
        "provider_capability_decisions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("provider_profile_id", sa.Integer(), nullable=False),
        sa.Column("service_key", sa.String(60), nullable=False),
        sa.Column("service_area", sa.String(30), server_default="harish", nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("assessment_method", sa.String(50), nullable=False),
        sa.Column("assessment_result", sa.String(30), nullable=False),
        sa.Column("evidence_reference", sa.String(120), nullable=False),
        sa.Column("evidence_hash", sa.String(64), nullable=False),
        sa.Column("assessor_name", sa.String(160), nullable=False),
        sa.Column("assessor_role", sa.String(60), nullable=False),
        sa.Column("assessed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("effective_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("review_trigger", sa.String(300), nullable=False),
        sa.Column("conditions_open", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("supervision_only", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("safety_acknowledgements", sa.Text(), nullable=False),
        sa.Column("scope_version", sa.String(80), nullable=False),
        sa.Column("scope_hash", sa.String(64), nullable=False),
        sa.Column("task_definition_hash", sa.String(64), nullable=False),
        sa.Column("task_definition_version", sa.String(40), nullable=False),
        sa.Column("confirmation_set_version", sa.String(50), nullable=False),
        sa.Column("confirmation_set_hash", sa.String(64), nullable=False),
        sa.Column("decision_reason", sa.String(500), nullable=False),
        sa.Column("supersedes_id", sa.Integer(), nullable=True),
        sa.Column("recorded_by", sa.String(255), nullable=False),
        sa.Column("idempotency_key", sa.String(100), nullable=False),
        sa.Column("command_hash", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("status IN ('eligible_supervised', 'suspended', 'rejected', 'expired', 'superseded')", name="ck_provider_capability_decision_status"),
        sa.CheckConstraint("service_area = 'harish'", name="ck_provider_capability_decision_area"),
        sa.CheckConstraint("supervision_only = true", name="ck_provider_capability_decision_supervision"),
        sa.ForeignKeyConstraint(["provider_profile_id"], ["managed_provider_profiles.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["supersedes_id"], ["provider_capability_decisions.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("supersedes_id", name="uq_provider_capability_decision_supersedes"),
        sa.UniqueConstraint("idempotency_key", name="uq_provider_capability_decision_idempotency"),
    )
    op.create_index("ix_provider_capability_decisions_provider_profile_id", "provider_capability_decisions", ["provider_profile_id"])
    op.create_index("ix_provider_capability_decisions_service_key", "provider_capability_decisions", ["service_key"])
    if op.get_bind().dialect.name == "postgresql":
        op.add_column("assignment_offers", sa.Column("capability_decision_id", sa.Integer(), nullable=True))
        op.add_column("assignment_offers", sa.Column("capability_task_definition_hash", sa.String(64), nullable=True))
        op.add_column("assignment_offers", sa.Column("capability_evidence_hash", sa.String(64), nullable=True))
        op.create_foreign_key("fk_assignment_offers_capability_decision", "assignment_offers", "provider_capability_decisions", ["capability_decision_id"], ["id"], ondelete="RESTRICT")
    else:
        with op.batch_alter_table("assignment_offers") as batch:
            batch.add_column(sa.Column("capability_decision_id", sa.Integer(), nullable=True))
            batch.add_column(sa.Column("capability_task_definition_hash", sa.String(64), nullable=True))
            batch.add_column(sa.Column("capability_evidence_hash", sa.String(64), nullable=True))
            batch.create_foreign_key("fk_assignment_offers_capability_decision", "provider_capability_decisions", ["capability_decision_id"], ["id"], ondelete="RESTRICT")
    op.create_index("ix_assignment_offers_capability_decision_id", "assignment_offers", ["capability_decision_id"])
    event_columns = (
        sa.Column("capability_decision_id", sa.Integer(), nullable=True),
        sa.Column("capability_task_definition_hash", sa.String(64), nullable=True),
        sa.Column("capability_evidence_hash", sa.String(64), nullable=True),
        sa.Column("service_key_snapshot", sa.String(120), nullable=True),
        sa.Column("service_area_snapshot", sa.String(120), nullable=True),
        sa.Column("window_start_snapshot", sa.DateTime(timezone=True), nullable=True),
        sa.Column("window_end_snapshot", sa.DateTime(timezone=True), nullable=True),
    )
    if op.get_bind().dialect.name == "postgresql":
        for column in event_columns:
            op.add_column("assignment_offer_events", column)
        op.create_foreign_key("fk_assignment_offer_events_capability_decision", "assignment_offer_events", "provider_capability_decisions", ["capability_decision_id"], ["id"], ondelete="RESTRICT")
    else:
        with op.batch_alter_table("assignment_offer_events") as batch:
            for column in event_columns:
                batch.add_column(column)
            batch.create_foreign_key("fk_assignment_offer_events_capability_decision", "provider_capability_decisions", ["capability_decision_id"], ["id"], ondelete="RESTRICT")
        _protect_sqlite_offer_events()
    op.create_index("ix_assignment_offer_events_capability_decision_id", "assignment_offer_events", ["capability_decision_id"])
    if op.get_bind().dialect.name == "postgresql":
        op.execute("CREATE TRIGGER provider_capability_decisions_append_only BEFORE UPDATE OR DELETE ON provider_capability_decisions FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation()")


def downgrade() -> None:
    op.drop_index("ix_assignment_offer_events_capability_decision_id", table_name="assignment_offer_events")
    event_columns = (
        "window_end_snapshot", "window_start_snapshot", "service_area_snapshot",
        "service_key_snapshot", "capability_evidence_hash",
        "capability_task_definition_hash", "capability_decision_id",
    )
    if op.get_bind().dialect.name == "postgresql":
        op.drop_constraint("fk_assignment_offer_events_capability_decision", "assignment_offer_events", type_="foreignkey")
        for column in event_columns:
            op.drop_column("assignment_offer_events", column)
    else:
        with op.batch_alter_table("assignment_offer_events") as batch:
            batch.drop_constraint("fk_assignment_offer_events_capability_decision", type_="foreignkey")
            for column in event_columns:
                batch.drop_column(column)
        _protect_sqlite_offer_events()
    op.drop_index("ix_assignment_offers_capability_decision_id", table_name="assignment_offers")
    if op.get_bind().dialect.name == "postgresql":
        op.drop_constraint("fk_assignment_offers_capability_decision", "assignment_offers", type_="foreignkey")
        op.drop_column("assignment_offers", "capability_evidence_hash")
        op.drop_column("assignment_offers", "capability_task_definition_hash")
        op.drop_column("assignment_offers", "capability_decision_id")
    else:
        with op.batch_alter_table("assignment_offers") as batch:
            batch.drop_constraint("fk_assignment_offers_capability_decision", type_="foreignkey")
            batch.drop_column("capability_evidence_hash")
            batch.drop_column("capability_task_definition_hash")
            batch.drop_column("capability_decision_id")
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TRIGGER IF EXISTS provider_capability_decisions_append_only ON provider_capability_decisions")
    op.drop_index("ix_provider_capability_decisions_service_key", table_name="provider_capability_decisions")
    op.drop_index("ix_provider_capability_decisions_provider_profile_id", table_name="provider_capability_decisions")
    op.drop_table("provider_capability_decisions")
