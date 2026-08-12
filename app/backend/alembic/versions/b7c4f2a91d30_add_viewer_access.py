"""Add owner-managed viewer access.

Revision ID: b7c4f2a91d30
Revises: 9d2e6f4a1c73
"""

from typing import Sequence, Union

from alembic import op
import os
import sqlalchemy as sa

revision: str = "b7c4f2a91d30"
down_revision: Union[str, Sequence[str], None] = "9d2e6f4a1c73"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "viewer_access",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_viewer_access_email", "viewer_access", ["email"], unique=True)
    configured_emails = sorted({
        item.strip().lower()
        for item in os.environ.get("VIEWER_USER_EMAILS", "").split(",")
        if item.strip()
    })
    if configured_emails:
        viewer_table = sa.table(
            "viewer_access",
            sa.column("email", sa.String),
            sa.column("is_active", sa.Boolean),
        )
        op.bulk_insert(viewer_table, [{"email": email, "is_active": True} for email in configured_emails])


def downgrade() -> None:
    op.drop_index("ix_viewer_access_email", table_name="viewer_access")
    op.drop_table("viewer_access")
