"""Add guarded booking-to-field-work fulfillment.

Revision ID: f2b7c31d9a80
Revises: a9d4e1f72b60
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "f2b7c31d9a80"
down_revision: Union[str, Sequence[str], None] = "a9d4e1f72b60"
branch_labels = None
depends_on = None


def upgrade() -> None:
    is_pg = op.get_bind().dialect.name == "postgresql"
    event_id = sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True) if is_pg else sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True)

    for name, type_, nullable, default in (
        ("service_key", sa.String(120), True, None),
        ("service_area", sa.String(120), True, None),
        ("timezone", sa.String(80), True, None),
        ("confirmed_window_start", sa.DateTime(timezone=True), True, None),
        ("confirmed_window_end", sa.DateTime(timezone=True), True, None),
        ("confirmed_by", sa.String(255), True, None),
        ("confirmed_at", sa.DateTime(timezone=True), True, None),
        ("version", sa.Integer(), False, "1"),
    ):
        op.add_column("bookings", sa.Column(name, type_, nullable=nullable, server_default=default))
    op.create_index("ix_bookings_service_key", "bookings", ["service_key"])
    op.create_index("ix_bookings_service_area", "bookings", ["service_area"])

    op.create_table(
        "booking_events", event_id,
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(40), nullable=False),
        sa.Column("actor_id", sa.String(255), nullable=False),
        sa.Column("previous_status", sa.String(30), nullable=False),
        sa.Column("new_status", sa.String(30), nullable=False),
        sa.Column("source", sa.String(60), nullable=False),
        sa.Column("idempotency_key", sa.String(100), nullable=False),
        sa.Column("command_hash", sa.String(64), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("event_type IN ('schedule_confirmed')", name="ck_booking_events_type"),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("source", "idempotency_key", name="uq_booking_events_source_idempotency"),
    )
    op.create_index("ix_booking_events_booking_id", "booking_events", ["booking_id"])
    op.add_column("job_events", sa.Column("command_hash", sa.String(64), nullable=True), schema="job_ledger" if is_pg else None)

    op.create_table(
        "managed_provider_profiles",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("relationship_id", sa.Integer(), nullable=False),
        sa.Column("display_name", sa.String(160), nullable=False),
        sa.Column("operational_status", sa.String(20), server_default="draft", nullable=False),
        sa.Column("availability_status", sa.String(20), server_default="unavailable", nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("operational_status IN ('draft', 'active', 'paused', 'disabled')", name="ck_provider_profiles_status"),
        sa.CheckConstraint("availability_status IN ('available', 'limited', 'unavailable')", name="ck_provider_profiles_availability"),
        sa.ForeignKeyConstraint(["relationship_id"], ["business_relationships.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("relationship_id", name="uq_provider_profiles_relationship"),
    )
    op.create_index("ix_managed_provider_profiles_relationship_id", "managed_provider_profiles", ["relationship_id"])
    op.create_index("ix_managed_provider_profiles_operational_status", "managed_provider_profiles", ["operational_status"])
    op.create_index("ix_managed_provider_profiles_availability_status", "managed_provider_profiles", ["availability_status"])

    op.create_table(
        "provider_capabilities",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("provider_profile_id", sa.Integer(), nullable=False),
        sa.Column("service_key", sa.String(120), nullable=False),
        sa.Column("service_area", sa.String(120), nullable=False),
        sa.Column("is_verified", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("verified_by", sa.String(255), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["provider_profile_id"], ["managed_provider_profiles.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("provider_profile_id", "service_key", "service_area", name="uq_provider_capability_scope"),
    )
    op.create_index("ix_provider_capabilities_provider_profile_id", "provider_capabilities", ["provider_profile_id"])
    op.create_index("ix_provider_capabilities_service_key", "provider_capabilities", ["service_key"])
    op.create_index("ix_provider_capabilities_service_area", "provider_capabilities", ["service_area"])

    op.create_table(
        "provider_vetting_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("provider_profile_id", sa.Integer(), nullable=False),
        sa.Column("requirement_key", sa.String(100), nullable=False),
        sa.Column("status", sa.String(20), server_default="pending", nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by", sa.String(255), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("status IN ('pending', 'approved', 'rejected', 'expired')", name="ck_provider_vetting_status"),
        sa.ForeignKeyConstraint(["provider_profile_id"], ["managed_provider_profiles.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("provider_profile_id", "requirement_key", name="uq_provider_vetting_requirement"),
    )
    op.create_index("ix_provider_vetting_items_provider_profile_id", "provider_vetting_items", ["provider_profile_id"])

    for name, type_, nullable in (
        ("booking_id", sa.Integer(), True), ("quote_id", sa.Integer(), True),
        ("managed_provider_profile_id", sa.Integer(), True), ("service_key", sa.String(120), True),
        ("service_area", sa.String(120), True), ("confirmed_window_end", sa.DateTime(timezone=True), True),
        ("assignment_confirmed_at", sa.DateTime(timezone=True), True), ("on_the_way_at", sa.DateTime(timezone=True), True),
        ("arrived_at", sa.DateTime(timezone=True), True), ("started_at", sa.DateTime(timezone=True), True),
        ("version", sa.Integer(), False),
    ):
        kwargs = {"server_default": "1"} if name == "version" else {}
        op.add_column("jobs", sa.Column(name, type_, nullable=nullable, **kwargs))
    if is_pg:
        op.create_foreign_key("fk_jobs_booking_id", "jobs", "bookings", ["booking_id"], ["id"], ondelete="RESTRICT")
        op.create_foreign_key("fk_jobs_quote_id", "jobs", "service_quotes", ["quote_id"], ["id"], ondelete="RESTRICT")
        op.create_foreign_key("fk_jobs_provider_profile_id", "jobs", "managed_provider_profiles", ["managed_provider_profile_id"], ["id"], ondelete="RESTRICT")
        op.create_unique_constraint("uq_jobs_booking_id", "jobs", ["booking_id"])
        op.alter_column("jobs", "status", server_default="unassigned")
    else:
        with op.batch_alter_table("jobs") as batch:
            batch.create_foreign_key("fk_jobs_booking_id", "bookings", ["booking_id"], ["id"], ondelete="RESTRICT")
            batch.create_foreign_key("fk_jobs_quote_id", "service_quotes", ["quote_id"], ["id"], ondelete="RESTRICT")
            batch.create_foreign_key("fk_jobs_provider_profile_id", "managed_provider_profiles", ["managed_provider_profile_id"], ["id"], ondelete="RESTRICT")
            batch.create_unique_constraint("uq_jobs_booking_id", ["booking_id"])
            batch.alter_column("status", server_default="unassigned")
    for column in ("booking_id", "quote_id", "managed_provider_profile_id", "service_key", "service_area"):
        op.create_index(f"ix_jobs_{column}", "jobs", [column])

    op.create_table(
        "assignment_offers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("provider_profile_id", sa.Integer(), nullable=False),
        sa.Column("sequence_number", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), server_default="offered", nullable=False),
        sa.Column("provider_payout", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), server_default="ILS", nullable=False),
        sa.Column("service_key", sa.String(120), nullable=False),
        sa.Column("service_area", sa.String(120), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("response_deadline", sa.DateTime(timezone=True), nullable=False),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("decline_reason", sa.Text(), nullable=True),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("declined_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("status IN ('offered', 'accepted', 'declined', 'expired', 'confirmed', 'withdrawn')", name="ck_assignment_offers_status"),
        sa.CheckConstraint("sequence_number > 0", name="ck_assignment_offers_sequence"),
        sa.CheckConstraint("provider_payout >= 0", name="ck_assignment_offers_payout"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["provider_profile_id"], ["managed_provider_profiles.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("job_id", "sequence_number", name="uq_assignment_offers_job_sequence"),
    )
    op.create_index("ix_assignment_offers_job_id", "assignment_offers", ["job_id"])
    op.create_index("ix_assignment_offers_provider_profile_id", "assignment_offers", ["provider_profile_id"])
    op.create_index("ix_assignment_offers_status", "assignment_offers", ["status"])
    op.create_index("uq_assignment_offers_one_open", "assignment_offers", ["job_id"], unique=True, postgresql_where=sa.text("status IN ('offered', 'accepted')"), sqlite_where=sa.text("status IN ('offered', 'accepted')"))
    op.create_index("uq_assignment_offers_one_confirmed", "assignment_offers", ["job_id"], unique=True, postgresql_where=sa.text("status = 'confirmed'"), sqlite_where=sa.text("status = 'confirmed'"))

    event_id2 = sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True) if is_pg else sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True)
    op.create_table(
        "assignment_offer_events", event_id2,
        sa.Column("offer_id", sa.Integer(), nullable=False), sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(40), nullable=False), sa.Column("actor_id", sa.String(255), nullable=False),
        sa.Column("actor_role", sa.String(30), nullable=False), sa.Column("previous_status", sa.String(20), nullable=True),
        sa.Column("new_status", sa.String(20), nullable=False), sa.Column("source", sa.String(60), nullable=False),
        sa.Column("idempotency_key", sa.String(100), nullable=False),
        sa.Column("command_hash", sa.String(64), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["offer_id"], ["assignment_offers.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("source", "idempotency_key", name="uq_assignment_offer_events_source_idempotency"),
    )
    op.create_index("ix_assignment_offer_events_offer_id", "assignment_offer_events", ["offer_id"])
    op.create_index("ix_assignment_offer_events_job_id", "assignment_offer_events", ["job_id"])

    if is_pg:
        op.execute("CREATE TRIGGER booking_events_append_only BEFORE UPDATE OR DELETE ON booking_events FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation()")
        op.execute("CREATE TRIGGER assignment_offer_events_append_only BEFORE UPDATE OR DELETE ON assignment_offer_events FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation()")


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TRIGGER IF EXISTS assignment_offer_events_append_only ON assignment_offer_events")
        op.execute("DROP TRIGGER IF EXISTS booking_events_append_only ON booking_events")
    op.drop_table("assignment_offer_events")
    op.drop_table("assignment_offers")
    for column in ("booking_id", "quote_id", "managed_provider_profile_id", "service_key", "service_area"):
        op.drop_index(f"ix_jobs_{column}", table_name="jobs")
    if op.get_bind().dialect.name == "postgresql":
        op.alter_column("jobs", "status", server_default="scheduled")
        op.drop_constraint("uq_jobs_booking_id", "jobs", type_="unique")
        for name in ("fk_jobs_provider_profile_id", "fk_jobs_quote_id", "fk_jobs_booking_id"):
            op.drop_constraint(name, "jobs", type_="foreignkey")
    else:
        with op.batch_alter_table("jobs") as batch:
            batch.alter_column("status", server_default="scheduled")
            batch.drop_constraint("uq_jobs_booking_id", type_="unique")
            for name in ("fk_jobs_provider_profile_id", "fk_jobs_quote_id", "fk_jobs_booking_id"):
                batch.drop_constraint(name, type_="foreignkey")
    for name in ("version", "started_at", "arrived_at", "on_the_way_at", "assignment_confirmed_at", "confirmed_window_end", "service_area", "service_key", "managed_provider_profile_id", "quote_id", "booking_id"):
        op.drop_column("jobs", name)
    op.drop_table("provider_vetting_items")
    op.drop_table("provider_capabilities")
    op.drop_table("managed_provider_profiles")
    op.drop_column("job_events", "command_hash", schema="job_ledger" if op.get_bind().dialect.name == "postgresql" else None)
    op.drop_table("booking_events")
    op.drop_index("ix_bookings_service_area", table_name="bookings")
    op.drop_index("ix_bookings_service_key", table_name="bookings")
    for name in ("version", "confirmed_at", "confirmed_by", "confirmed_window_end", "confirmed_window_start", "timezone", "service_area", "service_key"):
        op.drop_column("bookings", name)
