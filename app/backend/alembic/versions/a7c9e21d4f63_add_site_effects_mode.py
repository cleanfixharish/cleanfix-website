"""add site effects mode

Revision ID: a7c9e21d4f63
Revises: f1a6c3d82b40
"""

from alembic import op
import sqlalchemy as sa


revision = "a7c9e21d4f63"
down_revision = "f1a6c3d82b40"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "site_settings",
        sa.Column("effects_mode", sa.String(length=20), server_default="reduced", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("site_settings", "effects_mode")
