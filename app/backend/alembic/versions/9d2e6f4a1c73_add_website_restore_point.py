"""Add protected website restore point.

Revision ID: 9d2e6f4a1c73
Revises: f6b18ad4c302
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "9d2e6f4a1c73"
down_revision: Union[str, Sequence[str], None] = "f6b18ad4c302"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "website_restore_points",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("website_restore_points")
