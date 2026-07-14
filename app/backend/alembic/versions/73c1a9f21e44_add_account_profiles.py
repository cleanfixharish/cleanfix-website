"""add account profiles

Revision ID: 73c1a9f21e44
Revises: 412f4525879b
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "73c1a9f21e44"
down_revision: Union[str, Sequence[str], None] = "412f4525879b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "account_profiles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("account_type", sa.String(length=20), nullable=False),
        sa.Column("display_name", sa.String(length=200), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("area", sa.String(length=100), nullable=True),
        sa.Column("preferred_language", sa.String(length=5), server_default="en", nullable=False),
        sa.Column("whatsapp_opt_in", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("vip_number", sa.String(length=30), nullable=False),
        sa.Column("business_name", sa.String(length=200), nullable=True),
        sa.Column("business_category", sa.String(length=150), nullable=True),
        sa.Column("business_description", sa.Text(), nullable=True),
        sa.Column("application_status", sa.String(length=30), server_default="active", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
        sa.UniqueConstraint("vip_number"),
    )
    op.create_index(op.f("ix_account_profiles_id"), "account_profiles", ["id"], unique=False)
    op.create_index(op.f("ix_account_profiles_user_id"), "account_profiles", ["user_id"], unique=True)
    op.create_index(op.f("ix_account_profiles_vip_number"), "account_profiles", ["vip_number"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_account_profiles_vip_number"), table_name="account_profiles")
    op.drop_index(op.f("ix_account_profiles_user_id"), table_name="account_profiles")
    op.drop_index(op.f("ix_account_profiles_id"), table_name="account_profiles")
    op.drop_table("account_profiles")
