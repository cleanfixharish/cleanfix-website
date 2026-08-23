"""Add owner-approved administrator access roles.

Revision ID: b8d1e42f9c70
Revises: a7c9e21d4f63
"""

from alembic import op
import sqlalchemy as sa

revision = "b8d1e42f9c70"
down_revision = "a7c9e21d4f63"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "viewer_access",
        sa.Column("access_role", sa.String(length=20), server_default="viewer", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("viewer_access", "access_role")
