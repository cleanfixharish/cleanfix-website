"""Add owner-approved quotes and authoritative acceptance bookings.

Revision ID: a9d4e1f72b60
Revises: e8a6b42c1d70
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a9d4e1f72b60"
down_revision: Union[str, Sequence[str], None] = "e8a6b42c1d70"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgresql = bind.dialect.name == "postgresql"

    op.add_column("service_quotes", sa.Column("approved_by", sa.String(255), nullable=True))
    op.add_column("service_quotes", sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("quote_id", sa.Integer(), nullable=False),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("quoted_total_snapshot", sa.Numeric(12, 2), nullable=False),
        sa.Column("deposit_required_snapshot", sa.Numeric(12, 2), nullable=True),
        sa.Column("currency", sa.String(3), server_default="ILS", nullable=False),
        sa.Column("scope_snapshot", sa.Text(), nullable=False),
        sa.Column("exclusions_snapshot", sa.Text(), nullable=True),
        sa.Column("terms_snapshot", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "status IN ('awaiting_deposit', 'awaiting_schedule', 'confirmed', "
            "'reschedule_requested', 'cancelled')",
            name="ck_bookings_status",
        ),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["quote_id"], ["service_quotes.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("quote_id", name="uq_bookings_quote_id"),
    )
    op.create_index("ix_bookings_lead_id", "bookings", ["lead_id"])
    op.create_index("ix_bookings_quote_id", "bookings", ["quote_id"])
    op.create_index("ix_bookings_status", "bookings", ["status"])

    event_id_type = sa.BigInteger().with_variant(sa.Integer(), "sqlite")
    event_id_args = {"autoincrement": True} if not is_postgresql else {}
    if is_postgresql:
        event_id_type = sa.BigInteger()
        event_id_column = sa.Column("id", event_id_type, sa.Identity(), primary_key=True)
    else:
        event_id_column = sa.Column("id", event_id_type, primary_key=True, **event_id_args)
    op.create_table(
        "quote_events",
        event_id_column,
        sa.Column("quote_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(30), nullable=False),
        sa.Column("actor_type", sa.String(30), nullable=False),
        sa.Column("actor_id", sa.String(255), nullable=False),
        sa.Column("actor_role", sa.String(30), nullable=False),
        sa.Column("previous_status", sa.String(30), nullable=True),
        sa.Column("new_status", sa.String(30), nullable=False),
        sa.Column("idempotency_key", sa.String(100), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "event_type IN ('quote_created', 'owner_approved', 'published', 'accepted', 'declined')",
            name="ck_quote_events_type",
        ),
        sa.ForeignKeyConstraint(["quote_id"], ["service_quotes.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("idempotency_key", name="uq_quote_events_idempotency"),
    )
    op.create_index("ix_quote_events_quote_id", "quote_events", ["quote_id"])

    if is_postgresql:
        op.execute(
            """
            CREATE TRIGGER quote_events_append_only
            BEFORE UPDATE OR DELETE ON quote_events
            FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation();
            """
        )


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TRIGGER IF EXISTS quote_events_append_only ON quote_events")
    op.drop_index("ix_quote_events_quote_id", table_name="quote_events")
    op.drop_table("quote_events")
    op.drop_index("ix_bookings_status", table_name="bookings")
    op.drop_index("ix_bookings_quote_id", table_name="bookings")
    op.drop_index("ix_bookings_lead_id", table_name="bookings")
    op.drop_table("bookings")
    op.drop_column("service_quotes", "approved_at")
    op.drop_column("service_quotes", "approved_by")
