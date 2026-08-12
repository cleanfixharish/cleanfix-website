"""Manage account and OIDC state tables with Alembic.

Revision ID: c2a8d17f4b91
Revises: 8f6a21c4d9b0
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c2a8d17f4b91"
down_revision: Union[str, Sequence[str], None] = "8f6a21c4d9b0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create auth tables only when legacy runtime creation has not done so."""
    bind = op.get_bind()
    existing_tables = set(sa.inspect(bind).get_table_names())

    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(length=255), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=True),
            sa.Column("role", sa.String(length=50), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    if "oidc_states" not in existing_tables:
        op.create_table(
            "oidc_states",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("state", sa.String(length=255), nullable=False),
            sa.Column("nonce", sa.String(length=255), nullable=False),
            sa.Column("code_verifier", sa.String(length=255), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("state"),
        )
        op.create_index(op.f("ix_oidc_states_id"), "oidc_states", ["id"], unique=False)
        op.create_index(op.f("ix_oidc_states_state"), "oidc_states", ["state"], unique=True)


def downgrade() -> None:
    """Preserve account data during rollback.

    These tables may predate this migration and can contain production accounts,
    so an automated downgrade must never delete them.
    """
    pass
