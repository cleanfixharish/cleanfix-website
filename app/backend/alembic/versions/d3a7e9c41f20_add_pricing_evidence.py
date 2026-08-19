"""Add evidence-backed pricing and human-approved estimates.

Revision ID: d3a7e9c41f20
Revises: b7c4f2a91d30
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "d3a7e9c41f20"
down_revision: Union[str, Sequence[str], None] = "b7c4f2a91d30"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("pricing_sources", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("source_key", sa.String(80), nullable=False), sa.Column("publisher", sa.String(120), nullable=False), sa.Column("url", sa.String(1000), nullable=False), sa.Column("geography", sa.String(120), nullable=False), sa.Column("evidence_type", sa.String(50), nullable=False), sa.Column("accessed_on", sa.String(20)), sa.Column("notes", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_pricing_sources_source_key", "pricing_sources", ["source_key"], unique=True)
    op.create_table("price_observations", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("observation_key", sa.String(80), nullable=False), sa.Column("source_id", sa.Integer(), sa.ForeignKey("pricing_sources.id"), nullable=False), sa.Column("category", sa.String(120), nullable=False), sa.Column("sub_service", sa.String(240), nullable=False), sa.Column("geography", sa.String(120), nullable=False), sa.Column("min_price", sa.Numeric(12,2)), sa.Column("max_price", sa.Numeric(12,2)), sa.Column("typical_price", sa.Numeric(12,2)), sa.Column("vat_status", sa.String(40), nullable=False), sa.Column("basis", sa.Text()), sa.Column("confidence", sa.String(30), nullable=False), sa.Column("validation_status", sa.String(30), nullable=False), sa.Column("eligible_for_estimate", sa.Boolean(), nullable=False, server_default="false"), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_price_observations_observation_key", "price_observations", ["observation_key"], unique=True)
    op.create_index("ix_price_observations_source_id", "price_observations", ["source_id"])
    op.create_index("ix_price_observations_category", "price_observations", ["category"])
    op.create_table("price_estimates", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("lead_id", sa.Integer(), sa.ForeignKey("leads.id")), sa.Column("observation_id", sa.Integer(), sa.ForeignKey("price_observations.id")), sa.Column("service_description", sa.Text(), nullable=False), sa.Column("geography", sa.String(120), nullable=False), sa.Column("photo_notes", sa.Text()), sa.Column("assumptions", sa.Text()), sa.Column("exclusions", sa.Text()), sa.Column("suggested_min", sa.Numeric(12,2)), sa.Column("suggested_max", sa.Numeric(12,2)), sa.Column("customer_min", sa.Numeric(12,2)), sa.Column("customer_max", sa.Numeric(12,2)), sa.Column("provider_budget", sa.Numeric(12,2)), sa.Column("status", sa.String(30), nullable=False, server_default="draft"), sa.Column("disclaimer", sa.Text(), nullable=False), sa.Column("approved_by", sa.String(255)), sa.Column("approved_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("local_price_evidence", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("evidence_kind", sa.String(30), nullable=False), sa.Column("category", sa.String(120), nullable=False), sa.Column("sub_service", sa.String(240), nullable=False), sa.Column("geography", sa.String(120), nullable=False), sa.Column("customer_price", sa.Numeric(12,2)), sa.Column("provider_amount", sa.Numeric(12,2)), sa.Column("job_id", sa.Integer(), sa.ForeignKey("jobs.id")), sa.Column("provider_id", sa.Integer(), sa.ForeignKey("partners.id")), sa.Column("scope_notes", sa.Text(), nullable=False), sa.Column("status", sa.String(30), nullable=False, server_default="pending"), sa.Column("approved_by", sa.String(255)), sa.Column("approved_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    # Seeding is performed by the application service after tables exist, preserving review decisions.


def downgrade():
    op.drop_table("local_price_evidence")
    op.drop_table("price_estimates")
    op.drop_table("price_observations")
    op.drop_table("pricing_sources")
