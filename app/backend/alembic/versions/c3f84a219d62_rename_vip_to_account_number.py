"""Rename the legacy VIP identifier to a neutral account number.

Revision ID: c3f84a219d62
Revises: b8d1e42f9c70
"""

from alembic import op

revision = "c3f84a219d62"
down_revision = "b8d1e42f9c70"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("account_profiles", "vip_number", new_column_name="account_number")


def downgrade() -> None:
    op.alter_column("account_profiles", "account_number", new_column_name="vip_number")
