"""Add immutable business relationship decision audit.

Revision ID: e8a6b42c1d70
Revises: c7d9e2f41a60
"""

from alembic import op
import sqlalchemy as sa


revision = "e8a6b42c1d70"
down_revision = "c7d9e2f41a60"
branch_labels = None
depends_on = None


def upgrade():
    is_postgresql = op.get_bind().dialect.name == "postgresql"
    op.create_table(
        "business_relationship_events",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("relationship_id", sa.Integer(), nullable=False),
        sa.Column("actor_id", sa.String(length=255), nullable=False),
        sa.Column("previous_status", sa.String(length=20), nullable=True),
        sa.Column("new_status", sa.String(length=20), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["relationship_id"], ["business_relationships.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_business_relationship_events_relationship_id",
        "business_relationship_events",
        ["relationship_id"],
    )
    if is_postgresql:
        op.execute(
            """
            CREATE FUNCTION reject_business_relationship_event_mutation() RETURNS trigger AS $$
            BEGIN
              RAISE EXCEPTION 'business relationship audit events are append-only';
            END;
            $$ LANGUAGE plpgsql;
            """
        )
        op.execute(
            """
            CREATE TRIGGER business_relationship_events_reject_mutation
            BEFORE UPDATE OR DELETE ON business_relationship_events
            FOR EACH ROW EXECUTE FUNCTION reject_business_relationship_event_mutation();
            """
        )
    else:
        for operation in ("UPDATE", "DELETE"):
            op.execute(
                f"""
                CREATE TRIGGER business_relationship_events_reject_{operation.lower()}
                BEFORE {operation} ON business_relationship_events
                BEGIN
                    SELECT RAISE(ABORT, 'business relationship audit events are append-only');
                END;
                """
            )


def downgrade():
    is_postgresql = op.get_bind().dialect.name == "postgresql"
    if is_postgresql:
        op.execute("DROP TRIGGER IF EXISTS business_relationship_events_reject_mutation ON business_relationship_events")
        op.execute("DROP FUNCTION IF EXISTS reject_business_relationship_event_mutation()")
    else:
        op.execute("DROP TRIGGER IF EXISTS business_relationship_events_reject_update")
        op.execute("DROP TRIGGER IF EXISTS business_relationship_events_reject_delete")
    op.drop_index("ix_business_relationship_events_relationship_id", table_name="business_relationship_events")
    op.drop_table("business_relationship_events")
