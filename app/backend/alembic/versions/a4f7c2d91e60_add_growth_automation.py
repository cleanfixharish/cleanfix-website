"""Add approval-gated organic growth automation.

Revision ID: a4f7c2d91e60
Revises: d4e7a1b93c20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a4f7c2d91e60"
down_revision: Union[str, Sequence[str], None] = "d4e7a1b93c20"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "growth_automation_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("enabled", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("auto_generate", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("auto_publish", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("require_owner_approval", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("timezone", sa.String(length=80), server_default="Asia/Jerusalem", nullable=False),
        sa.Column("daily_time", sa.String(length=5), server_default="09:00", nullable=False),
        sa.Column("daily_post_limit", sa.Integer(), server_default="1", nullable=False),
        sa.Column("lookahead_days", sa.Integer(), server_default="7", nullable=False),
        sa.Column("languages", sa.JSON(), nullable=False),
        sa.Column("channels", sa.JSON(), nullable=False),
        sa.Column("content_pillars", sa.JSON(), nullable=False),
        sa.Column("default_cta", sa.String(length=240), nullable=False),
        sa.Column("destination_url", sa.String(length=500), nullable=False),
        sa.Column("approved_facts", sa.Text(), nullable=True),
        sa.Column("banned_phrases", sa.Text(), nullable=True),
        sa.Column("notification_email", sa.String(length=255), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "growth_posts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("campaign_name", sa.String(length=160), nullable=False),
        sa.Column("topic", sa.String(length=80), nullable=False),
        sa.Column("audience", sa.String(length=40), nullable=False),
        sa.Column("service", sa.String(length=120), nullable=True),
        sa.Column("channel", sa.String(length=40), nullable=False),
        sa.Column("language", sa.String(length=8), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("alt_text", sa.String(length=500), nullable=True),
        sa.Column("image_url", sa.String(length=1000), nullable=True),
        sa.Column("destination_url", sa.String(length=1000), nullable=False),
        sa.Column("utm_url", sa.String(length=1200), nullable=False),
        sa.Column("status", sa.String(length=30), server_default="draft", nullable=False),
        sa.Column("content_version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("approved_version", sa.Integer(), nullable=True),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("idempotency_key", sa.String(length=64), nullable=False),
        sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by", sa.String(length=255), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_by", sa.String(length=255), nullable=True),
        sa.Column("publication_url", sa.String(length=1000), nullable=True),
        sa.Column("remote_id", sa.String(length=255), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index("ix_growth_posts_channel", "growth_posts", ["channel"])
    op.create_index("ix_growth_posts_language", "growth_posts", ["language"])
    op.create_index("ix_growth_posts_status", "growth_posts", ["status"])
    op.create_index("ix_growth_posts_scheduled_for", "growth_posts", ["scheduled_for"])
    op.create_index("ix_growth_posts_idempotency_key", "growth_posts", ["idempotency_key"], unique=True)
    op.create_table(
        "growth_runs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("trigger", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("strategist_summary", sa.Text(), nullable=True),
        sa.Column("copywriter_summary", sa.Text(), nullable=True),
        sa.Column("policy_summary", sa.Text(), nullable=True),
        sa.Column("drafts_created", sa.Integer(), server_default="0", nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_growth_runs_status", "growth_runs", ["status"])


def downgrade() -> None:
    op.drop_index("ix_growth_runs_status", table_name="growth_runs")
    op.drop_table("growth_runs")
    op.drop_index("ix_growth_posts_idempotency_key", table_name="growth_posts")
    op.drop_index("ix_growth_posts_scheduled_for", table_name="growth_posts")
    op.drop_index("ix_growth_posts_status", table_name="growth_posts")
    op.drop_index("ix_growth_posts_language", table_name="growth_posts")
    op.drop_index("ix_growth_posts_channel", table_name="growth_posts")
    op.drop_table("growth_posts")
    op.drop_table("growth_automation_settings")
