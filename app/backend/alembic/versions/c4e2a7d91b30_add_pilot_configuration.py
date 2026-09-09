"""Add owner-managed pilot configuration and approval register.

Revision ID: c4e2a7d91b30
Revises: f8c2d41a6e90
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c4e2a7d91b30"
down_revision: Union[str, Sequence[str], None] = "f8c2d41a6e90"
branch_labels = None
depends_on = None


def upgrade() -> None:
    is_pg = op.get_bind().dialect.name == "postgresql"
    for name, type_, nullable, default in (
        ("effective_at", sa.DateTime(timezone=True), True, None),
        ("reviewer_role", sa.String(80), True, None),
        ("evidence_reference", sa.String(120), True, None),
        ("evidence_hash", sa.String(64), True, None),
        ("scope_version", sa.String(80), True, None),
        ("scope_hash", sa.String(64), True, None),
        ("review_trigger", sa.String(300), True, None),
        ("conditions_open", sa.Boolean(), False, "false"),
    ):
        op.add_column("provider_vetting_items", sa.Column(name, type_, nullable=nullable, server_default=default))
    op.create_table(
        "pilot_configurations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("scope_version", sa.String(80), server_default="PILOT-HOME-VISIT-v1", nullable=False),
        sa.Column("scope_hash", sa.String(64), nullable=False),
        sa.Column("company_legal_name", sa.String(200), nullable=True),
        sa.Column("encrypted_company_registration_id", sa.Text(), nullable=True),
        sa.Column("entity_or_dealer_type", sa.String(40), nullable=True),
        sa.Column("identifier_type", sa.String(40), nullable=True),
        sa.Column("operating_area", sa.String(120), server_default="Harish", nullable=False),
        sa.Column("timezone", sa.String(80), server_default="Asia/Jerusalem", nullable=False),
        sa.Column("operating_days", sa.String(80), server_default="monday,tuesday,wednesday,thursday", nullable=False),
        sa.Column("opening_time", sa.String(5), server_default="09:00", nullable=False),
        sa.Column("closing_time", sa.String(5), server_default="17:00", nullable=False),
        sa.Column("weekly_job_cap", sa.Integer(), server_default="3", nullable=False),
        sa.Column("max_managed_providers", sa.Integer(), server_default="2", nullable=False),
        sa.Column("owner_onsite_required", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("updated_by", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("id = 1", name="ck_pilot_configuration_singleton"),
        sa.CheckConstraint("weekly_job_cap BETWEEN 1 AND 20", name="ck_pilot_configuration_weekly_cap"),
        sa.CheckConstraint("max_managed_providers BETWEEN 1 AND 10", name="ck_pilot_configuration_provider_cap"),
        sa.CheckConstraint("operating_area = 'Harish'", name="ck_pilot_configuration_v1_area"),
        sa.CheckConstraint("timezone = 'Asia/Jerusalem'", name="ck_pilot_configuration_v1_timezone"),
        sa.CheckConstraint("operating_days = 'monday,tuesday,wednesday,thursday'", name="ck_pilot_configuration_v1_days"),
        sa.CheckConstraint("opening_time = '09:00' AND closing_time = '17:00'", name="ck_pilot_configuration_v1_hours"),
        sa.CheckConstraint("weekly_job_cap = 3 AND max_managed_providers = 2", name="ck_pilot_configuration_v1_caps"),
        sa.CheckConstraint("owner_onsite_required = true", name="ck_pilot_configuration_v1_owner_onsite"),
    )
    op.create_table(
        "pilot_approval_gates",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("gate_key", sa.String(100), nullable=False),
        sa.Column("status", sa.String(20), server_default="not_started", nullable=False),
        sa.Column("scope_version", sa.String(80), nullable=False),
        sa.Column("scope_hash", sa.String(64), nullable=False),
        sa.Column("configuration_version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("reviewer_name", sa.String(160), nullable=True),
        sa.Column("reviewer_role", sa.String(100), nullable=True),
        sa.Column("evidence_reference", sa.String(500), nullable=True),
        sa.Column("evidence_hash", sa.String(64), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("effective_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_trigger", sa.String(300), nullable=True),
        sa.Column("conditions_open", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("updated_by", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("status IN ('not_started', 'packet_ready', 'submitted', 'questions_open', 'conditional', 'approved', 'rejected', 'expired', 'superseded')", name="ck_pilot_approval_gate_status"),
        sa.UniqueConstraint("gate_key", name="uq_pilot_approval_gate_key"),
    )
    event_id = sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True) if is_pg else sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True)
    op.create_table(
        "pilot_configuration_events", event_id,
        sa.Column("event_type", sa.String(40), nullable=False),
        sa.Column("actor_id", sa.String(255), nullable=False),
        sa.Column("target_key", sa.String(100), nullable=False),
        sa.Column("changed_fields", sa.Text(), nullable=False),
        sa.Column("previous_status", sa.String(20), nullable=True),
        sa.Column("new_status", sa.String(20), nullable=True),
        sa.Column("scope_hash", sa.String(64), nullable=False),
        sa.Column("evidence_hash", sa.String(64), nullable=True),
        sa.Column("previous_snapshot", sa.Text(), nullable=True),
        sa.Column("new_snapshot", sa.Text(), nullable=True),
        sa.Column("resulting_version", sa.Integer(), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("event_type IN ('configuration_updated', 'gate_updated')", name="ck_pilot_configuration_event_type"),
    )
    op.create_table(
        "pilot_task_classifications",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer(), nullable=False),
        sa.Column("task_key", sa.String(60), nullable=False),
        sa.Column("service_area", sa.String(30), server_default="harish", nullable=False),
        sa.Column("measured_weight_kg", sa.Numeric(6, 2), nullable=True),
        sa.Column("safety_confirmations", sa.Text(), nullable=False),
        sa.Column("scope_version", sa.String(80), nullable=False),
        sa.Column("scope_hash", sa.String(64), nullable=False),
        sa.Column("reason", sa.String(500), nullable=False),
        sa.Column("classified_by", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("task_key IN ('mounting_under_5kg', 'flat_pack_under_25kg', 'cabinet_hardware')", name="ck_pilot_task_classification_key"),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("lead_id", name="uq_pilot_task_classification_lead"),
    )
    op.create_index("ix_pilot_task_classifications_lead_id", "pilot_task_classifications", ["lead_id"])
    if is_pg:
        op.add_column("service_quotes", sa.Column("pilot_task_classification_id", sa.Integer(), nullable=True))
        op.add_column("service_quotes", sa.Column("pilot_task_key", sa.String(60), nullable=True))
        op.add_column("service_quotes", sa.Column("pilot_scope_hash", sa.String(64), nullable=True))
        op.create_foreign_key("fk_service_quotes_pilot_task_classification", "service_quotes", "pilot_task_classifications", ["pilot_task_classification_id"], ["id"], ondelete="RESTRICT")
    else:
        with op.batch_alter_table("service_quotes") as batch:
            batch.add_column(sa.Column("pilot_task_classification_id", sa.Integer(), nullable=True))
            batch.add_column(sa.Column("pilot_task_key", sa.String(60), nullable=True))
            batch.add_column(sa.Column("pilot_scope_hash", sa.String(64), nullable=True))
            batch.create_foreign_key("fk_service_quotes_pilot_task_classification", "pilot_task_classifications", ["pilot_task_classification_id"], ["id"], ondelete="RESTRICT")
    op.create_index("ix_service_quotes_pilot_task_classification_id", "service_quotes", ["pilot_task_classification_id"])
    scope_hash = "1e7b4e3047f8fe32cd1cc4399ba4df35e810880fc5bdc933599dc09836a8ca81"
    pilot_table = sa.table(
        "pilot_configurations",
        sa.column("id", sa.Integer()), sa.column("scope_version", sa.String()),
        sa.column("scope_hash", sa.String()),
    )
    op.bulk_insert(pilot_table, [{"id": 1, "scope_version": "PILOT-HOME-VISIT-v1", "scope_hash": scope_hash}])
    gate_table = sa.table(
        "pilot_approval_gates",
        sa.column("gate_key", sa.String()), sa.column("scope_version", sa.String()),
        sa.column("scope_hash", sa.String()), sa.column("configuration_version", sa.Integer()),
    )
    op.bulk_insert(gate_table, [{"gate_key": key, "scope_version": "PILOT-HOME-VISIT-v1", "scope_hash": scope_hash, "configuration_version": 1} for key in (
        "LEGAL_CUSTOMER_TERMS_APPROVED", "LEGAL_CANCELLATION_REFUND_REMEDIATION_APPROVED",
        "LEGAL_PROVIDER_AGREEMENT_APPROVED", "LEGAL_PROVIDER_CLASSIFICATION_REVIEWED",
        "LEGAL_SERVICE_LICENSING_TAXONOMY_APPROVED", "LEGAL_PRIVACY_CONSENT_RETENTION_APPROVED",
        "LEGAL_INCIDENT_PROCESS_APPROVED", "LEGAL_E_ACCEPTANCE_EVIDENCE_APPROVED",
        "ACCOUNT_ENTITY_VAT_APPROVED", "ACCOUNT_CUSTOMER_DOCUMENT_FLOW_APPROVED",
        "ACCOUNT_PROVIDER_INVOICE_WITHHOLDING_APPROVED", "ACCOUNT_LEDGER_RECONCILIATION_APPROVED",
        "ACCOUNT_REFUND_CREDIT_NOTE_APPROVED", "ACCOUNT_RECORD_RETENTION_EXPORT_APPROVED",
        "INSURANCE_CLEANFIX_COVERAGE_CONFIRMED", "INSURANCE_PROVIDER_MINIMUMS_CONFIRMED",
        "INSURANCE_PILOT_SCOPE_COVERED", "INSURANCE_EXCLUSIONS_CONDITIONS_RECORDED",
        "INSURANCE_INCIDENT_CLAIM_PROCESS_CONFIRMED",
        "SYSTEM_BOOKING_SCHEDULE_VERIFIED", "SYSTEM_PROVIDER_ELIGIBILITY_VERIFIED",
        "SYSTEM_OFFER_ASSIGNMENT_VERIFIED", "SYSTEM_PROVIDER_MOBILE_WORKFLOW_VERIFIED",
        "SYSTEM_PRIVATE_EVIDENCE_VERIFIED", "SYSTEM_QUALITY_REWORK_VERIFIED",
        "SYSTEM_PAYMENT_PAYOUT_LEDGER_VERIFIED", "SYSTEM_GUARDED_COMPLETION_VERIFIED",
        "SYSTEM_ISOLATED_RESTORE_PARITY_VERIFIED",
    )])
    if is_pg:
        op.execute("CREATE TRIGGER pilot_configuration_events_append_only BEFORE UPDATE OR DELETE ON pilot_configuration_events FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation()")
        op.execute("CREATE TRIGGER pilot_task_classifications_append_only BEFORE UPDATE OR DELETE ON pilot_task_classifications FOR EACH ROW EXECUTE FUNCTION job_ledger.reject_immutable_mutation()")


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TRIGGER IF EXISTS pilot_configuration_events_append_only ON pilot_configuration_events")
        op.execute("DROP TRIGGER IF EXISTS pilot_task_classifications_append_only ON pilot_task_classifications")
    op.drop_index("ix_service_quotes_pilot_task_classification_id", table_name="service_quotes")
    if op.get_bind().dialect.name == "postgresql":
        op.drop_constraint("fk_service_quotes_pilot_task_classification", "service_quotes", type_="foreignkey")
        op.drop_column("service_quotes", "pilot_scope_hash")
        op.drop_column("service_quotes", "pilot_task_key")
        op.drop_column("service_quotes", "pilot_task_classification_id")
    else:
        with op.batch_alter_table("service_quotes") as batch:
            batch.drop_constraint("fk_service_quotes_pilot_task_classification", type_="foreignkey")
            batch.drop_column("pilot_scope_hash")
            batch.drop_column("pilot_task_key")
            batch.drop_column("pilot_task_classification_id")
    op.drop_table("pilot_task_classifications")
    op.drop_table("pilot_configuration_events")
    op.drop_table("pilot_approval_gates")
    op.drop_table("pilot_configurations")
    for name in ("conditions_open", "review_trigger", "scope_hash", "scope_version", "evidence_hash", "evidence_reference", "reviewer_role", "effective_at"):
        op.drop_column("provider_vetting_items", name)
