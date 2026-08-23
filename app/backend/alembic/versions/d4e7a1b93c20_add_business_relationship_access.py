"""Add isolated, owner-approved business portal relationships.

Revision ID: d4e7a1b93c20
Revises: c3f84a219d62
"""

from alembic import op
import sqlalchemy as sa


revision = "d4e7a1b93c20"
down_revision = "c3f84a219d62"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "business_relationships",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("relationship_type", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("approved_by", sa.String(length=255), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "relationship_type", name="uq_business_relationship_user_type"),
    )
    op.create_index(
        op.f("ix_business_relationships_id"),
        "business_relationships",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_business_relationships_user_id"),
        "business_relationships",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_business_relationships_relationship_type"),
        "business_relationships",
        ["relationship_type"],
        unique=False,
    )
    op.create_index(
        op.f("ix_business_relationships_status"),
        "business_relationships",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_business_relationships_status"), table_name="business_relationships")
    op.drop_index(
        op.f("ix_business_relationships_relationship_type"),
        table_name="business_relationships",
    )
    op.drop_index(op.f("ix_business_relationships_user_id"), table_name="business_relationships")
    op.drop_index(op.f("ix_business_relationships_id"), table_name="business_relationships")
    op.drop_table("business_relationships")
