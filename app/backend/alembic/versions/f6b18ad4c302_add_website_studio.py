"""Add Website Studio settings, media, and service pricing.

Revision ID: f6b18ad4c302
Revises: e4d7c0a921bf
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "f6b18ad4c302"
down_revision: Union[str, Sequence[str], None] = "e4d7c0a921bf"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("services", sa.Column("price_from", sa.Numeric(12, 2), nullable=True))
    op.add_column("services", sa.Column("price_unit", sa.String(length=80), nullable=True))
    op.add_column("services", sa.Column("price_note_en", sa.String(length=300), nullable=True))
    op.add_column("services", sa.Column("price_note_he", sa.String(length=300), nullable=True))
    op.add_column("services", sa.Column("image_url", sa.String(length=500), nullable=True))
    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("primary_color", sa.String(length=20), server_default="#102E38", nullable=False),
        sa.Column("accent_color", sa.String(length=20), server_default="#B8842F", nullable=False),
        sa.Column("surface_color", sa.String(length=20), server_default="#F7F2EA", nullable=False),
        sa.Column("hero_image_url", sa.String(length=500), nullable=True),
        sa.Column("cta_image_url", sa.String(length=500), nullable=True),
        sa.Column("hero_layout", sa.String(length=30), server_default="text-left", nullable=False),
        sa.Column("primary_cta_en", sa.String(length=100), nullable=True),
        sa.Column("primary_cta_he", sa.String(length=100), nullable=True),
        sa.Column("secondary_cta_en", sa.String(length=100), nullable=True),
        sa.Column("secondary_cta_he", sa.String(length=100), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "site_media",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("alt_text", sa.String(length=300), nullable=True),
        sa.Column("data", sa.LargeBinary(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_site_media_id"), "site_media", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_site_media_id"), table_name="site_media")
    op.drop_table("site_media")
    op.drop_table("site_settings")
    op.drop_column("services", "image_url")
    op.drop_column("services", "price_note_he")
    op.drop_column("services", "price_note_en")
    op.drop_column("services", "price_unit")
    op.drop_column("services", "price_from")
