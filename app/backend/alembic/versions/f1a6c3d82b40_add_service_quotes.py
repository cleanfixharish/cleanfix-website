"""Add secure customer-facing service quotes.

Revision ID: f1a6c3d82b40
Revises: e5c9b2d74a10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f1a6c3d82b40"
down_revision: Union[str, Sequence[str], None] = "e5c9b2d74a10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "service_quotes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("estimate_id", sa.Integer(), nullable=False),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.Column("quoted_total", sa.Numeric(12, 2), nullable=False),
        sa.Column("deposit_required", sa.Numeric(12, 2), nullable=True),
        sa.Column("scope", sa.Text(), nullable=False),
        sa.Column("exclusions", sa.Text(), nullable=True),
        sa.Column("terms", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), server_default="draft", nullable=False),
        sa.Column("public_token_hash", sa.String(length=64), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("declined_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["estimate_id"], ["price_estimates.id"]),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("estimate_id"),
        sa.UniqueConstraint("public_token_hash"),
    )
    op.create_index("ix_service_quotes_estimate_id", "service_quotes", ["estimate_id"])
    op.create_index("ix_service_quotes_lead_id", "service_quotes", ["lead_id"])
    op.create_index("ix_service_quotes_public_token_hash", "service_quotes", ["public_token_hash"])
    op.create_index("ix_service_quotes_status", "service_quotes", ["status"])


def downgrade() -> None:
    op.drop_index("ix_service_quotes_status", table_name="service_quotes")
    op.drop_index("ix_service_quotes_public_token_hash", table_name="service_quotes")
    op.drop_index("ix_service_quotes_lead_id", table_name="service_quotes")
    op.drop_index("ix_service_quotes_estimate_id", table_name="service_quotes")
    op.drop_table("service_quotes")
