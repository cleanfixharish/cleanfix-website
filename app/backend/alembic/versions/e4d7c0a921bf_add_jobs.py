"""Add real jobs storage for Manager OS.

Revision ID: e4d7c0a921bf
Revises: c2a8d17f4b91
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "e4d7c0a921bf"
down_revision: Union[str, Sequence[str], None] = "c2a8d17f4b91"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.Column("provider_id", sa.Integer(), nullable=True),
        sa.Column("customer_name", sa.String(length=200), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("address", sa.String(length=300), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="scheduled", nullable=False),
        sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_jobs_id"), "jobs", ["id"], unique=False)
    op.create_index(op.f("ix_jobs_lead_id"), "jobs", ["lead_id"], unique=False)
    op.create_index(op.f("ix_jobs_provider_id"), "jobs", ["provider_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_jobs_provider_id"), table_name="jobs")
    op.drop_index(op.f("ix_jobs_lead_id"), table_name="jobs")
    op.drop_index(op.f("ix_jobs_id"), table_name="jobs")
    op.drop_table("jobs")
