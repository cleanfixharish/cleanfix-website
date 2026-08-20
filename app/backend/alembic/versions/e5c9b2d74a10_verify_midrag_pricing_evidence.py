"""Verify the manually reviewed Midrag national pricing observations.

Revision ID: e5c9b2d74a10
Revises: d3a7e9c41f20

This migration only changes the eight observations reviewed on 2026-08-20.
They remain national references and must not be presented as Harish-local prices.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5c9b2d74a10"
down_revision: Union[str, Sequence[str], None] = "d3a7e9c41f20"
branch_labels = None
depends_on = None


MIDRAG_KEYS = (
    "NAT_MID_POST4",
    "NAT_MID_POST100",
    "NAT_MID_POST5",
    "NAT_MID_GLASS4",
    "NAT_MID_AC_FILTER",
    "NAT_MID_AC_DEEP",
    "NAT_MID_AC_MOLD",
    "NAT_MID_AC_VISIT",
)


def upgrade() -> None:
    observations = sa.table(
        "price_observations",
        sa.column("observation_key", sa.String),
        sa.column("validation_status", sa.String),
        sa.column("eligible_for_estimate", sa.Boolean),
        sa.column("confidence", sa.String),
        sa.column("vat_status", sa.String),
    )
    sources = sa.table(
        "pricing_sources",
        sa.column("source_key", sa.String),
        sa.column("notes", sa.Text),
        sa.column("accessed_on", sa.String),
    )

    op.execute(
        observations.update()
        .where(observations.c.observation_key.in_(MIDRAG_KEYS))
        .values(
            validation_status="verified",
            eligible_for_estimate=True,
            confidence="high",
            vat_status="VAT unspecified",
        )
    )
    op.execute(
        sources.update()
        .where(sources.c.source_key == "SRC_NAT_MID_POST4409")
        .values(
            accessed_on="2026-08-20",
            notes=(
                "National displayed-price guide manually revalidated 2026-08-20; "
                "VAT is not stated on this page."
            ),
        )
    )
    op.execute(
        sources.update()
        .where(sources.c.source_key == "SRC_NAT_MID_AC18")
        .values(
            accessed_on="2026-08-20",
            notes=(
                "National price-list averages manually revalidated 2026-08-20; "
                "VAT is not stated on this page."
            ),
        )
    )


def downgrade() -> None:
    observations = sa.table(
        "price_observations",
        sa.column("observation_key", sa.String),
        sa.column("validation_status", sa.String),
        sa.column("eligible_for_estimate", sa.Boolean),
        sa.column("confidence", sa.String),
    )
    op.execute(
        observations.update()
        .where(observations.c.observation_key.in_(MIDRAG_KEYS))
        .values(
            validation_status="pending",
            eligible_for_estimate=False,
            confidence="provisional",
        )
    )
