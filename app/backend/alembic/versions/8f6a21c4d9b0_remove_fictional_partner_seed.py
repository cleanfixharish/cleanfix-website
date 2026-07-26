"""Remove fictional partner seed data from production.

Revision ID: 8f6a21c4d9b0
Revises: 73c1a9f21e44
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8f6a21c4d9b0"
down_revision: Union[str, Sequence[str], None] = "73c1a9f21e44"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Delete only the known template records; preserve all real partner data."""
    bind = op.get_bind()
    bind.execute(
        sa.text(
            """
            DELETE FROM partners
            WHERE phone LIKE '+972-50-000-000%'
               OR whatsapp LIKE '+97250000000%'
               OR name IN (
                   'CleanFixHarish Team',
                   'Avi''s Plumbing',
                   'Bright Spark Electric',
                   'Cool Air Solutions',
                   'Green Garden Harish'
               )
            """
        )
    )


def downgrade() -> None:
    """Never restore fictional public business claims."""
    pass
