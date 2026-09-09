"""Add encrypted private service locations and access audit.

Revision ID: f8c2d41a6e90
Revises: f2b7c31d9a80
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "f8c2d41a6e90"
down_revision: Union[str, Sequence[str], None] = "f2b7c31d9a80"
branch_labels = None
depends_on = None


def upgrade() -> None:
    is_pg = op.get_bind().dialect.name == "postgresql"
    op.create_table(
        "service_locations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("encrypted_payload", sa.Text(), nullable=False),
        sa.Column("payload_version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("set_by", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("booking_id", name="uq_service_locations_booking"),
    )
    op.create_index("ix_service_locations_booking_id", "service_locations", ["booking_id"])
    event_id = sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True) if is_pg else sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True)
    op.create_table(
        "service_location_events", event_id,
        sa.Column("service_location_id", sa.Integer(), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(40), nullable=False),
        sa.Column("location_version", sa.Integer(), nullable=False),
        sa.Column("actor_id", sa.String(255), nullable=False),
        sa.Column("actor_role", sa.String(30), nullable=False),
        sa.Column("source", sa.String(60), nullable=False),
        sa.Column("idempotency_key", sa.String(100), nullable=True),
        sa.Column("command_hash", sa.String(64), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("event_type IN ('location_set', 'location_updated', 'owner_accessed', 'provider_accessed')", name="ck_service_location_events_type"),
        sa.ForeignKeyConstraint(["service_location_id"], ["service_locations.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("source", "idempotency_key", name="uq_service_location_events_source_idempotency"),
    )
    op.create_index("ix_service_location_events_service_location_id", "service_location_events", ["service_location_id"])
    op.create_index("ix_service_location_events_booking_id", "service_location_events", ["booking_id"])
    op.create_index("ix_service_location_events_job_id", "service_location_events", ["job_id"])
    if is_pg:
        op.execute("CREATE TRIGGER service_location_events_append_only BEFORE UPDATE OR DELETE ON service_location_events FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation()")


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TRIGGER IF EXISTS service_location_events_append_only ON service_location_events")
    op.drop_table("service_location_events")
    op.drop_table("service_locations")
