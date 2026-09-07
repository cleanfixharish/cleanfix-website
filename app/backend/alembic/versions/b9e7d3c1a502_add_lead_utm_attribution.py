"""Add first-party campaign attribution to leads.

Revision ID: b9e7d3c1a502
Revises: a4f7c2d91e60
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b9e7d3c1a502"
down_revision: Union[str, Sequence[str], None] = "a4f7c2d91e60"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("utm_source", sa.String(length=100), nullable=True))
    op.add_column("leads", sa.Column("utm_medium", sa.String(length=100), nullable=True))
    op.add_column("leads", sa.Column("utm_campaign", sa.String(length=200), nullable=True))


def downgrade() -> None:
    op.drop_column("leads", "utm_campaign")
    op.drop_column("leads", "utm_medium")
    op.drop_column("leads", "utm_source")
