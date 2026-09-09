from datetime import datetime

from sqlalchemy import BigInteger, Boolean, CheckConstraint, Column, DateTime, ForeignKey, Identity, Integer, Numeric, String, Text, UniqueConstraint, func

from core.database import Base


class PilotConfiguration(Base):
    __tablename__ = "pilot_configurations"
    __table_args__ = (
        CheckConstraint("id = 1", name="ck_pilot_configuration_singleton"),
        CheckConstraint("weekly_job_cap BETWEEN 1 AND 20", name="ck_pilot_configuration_weekly_cap"),
        CheckConstraint("max_managed_providers BETWEEN 1 AND 10", name="ck_pilot_configuration_provider_cap"),
        CheckConstraint("operating_area = 'Harish'", name="ck_pilot_configuration_v1_area"),
        CheckConstraint("timezone = 'Asia/Jerusalem'", name="ck_pilot_configuration_v1_timezone"),
        CheckConstraint("operating_days = 'monday,tuesday,wednesday,thursday'", name="ck_pilot_configuration_v1_days"),
        CheckConstraint("opening_time = '09:00' AND closing_time = '17:00'", name="ck_pilot_configuration_v1_hours"),
        CheckConstraint("weekly_job_cap = 3 AND max_managed_providers = 2", name="ck_pilot_configuration_v1_caps"),
        CheckConstraint("owner_onsite_required = true", name="ck_pilot_configuration_v1_owner_onsite"),
    )
    id = Column(Integer, primary_key=True, default=1)
    scope_version = Column(String(80), nullable=False, default="PILOT-HOME-VISIT-v1", server_default="PILOT-HOME-VISIT-v1")
    scope_hash = Column(String(64), nullable=False)
    company_legal_name = Column(String(200), nullable=True)
    encrypted_company_registration_id = Column(Text, nullable=True)
    entity_or_dealer_type = Column(String(40), nullable=True)
    identifier_type = Column(String(40), nullable=True)
    operating_area = Column(String(120), nullable=False, default="Harish", server_default="Harish")
    timezone = Column(String(80), nullable=False, default="Asia/Jerusalem", server_default="Asia/Jerusalem")
    operating_days = Column(String(80), nullable=False, default="monday,tuesday,wednesday,thursday", server_default="monday,tuesday,wednesday,thursday")
    opening_time = Column(String(5), nullable=False, default="09:00", server_default="09:00")
    closing_time = Column(String(5), nullable=False, default="17:00", server_default="17:00")
    weekly_job_cap = Column(Integer, nullable=False, default=3, server_default="3")
    max_managed_providers = Column(Integer, nullable=False, default=2, server_default="2")
    owner_onsite_required = Column(Boolean, nullable=False, default=True, server_default="true")
    version = Column(Integer, nullable=False, default=1, server_default="1")
    updated_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now, server_default=func.now())


class PilotApprovalGate(Base):
    __tablename__ = "pilot_approval_gates"
    __table_args__ = (
        CheckConstraint("status IN ('not_started', 'packet_ready', 'submitted', 'questions_open', 'conditional', 'approved', 'rejected', 'expired', 'superseded')", name="ck_pilot_approval_gate_status"),
        UniqueConstraint("gate_key", name="uq_pilot_approval_gate_key"),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    gate_key = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="not_started", server_default="not_started")
    scope_version = Column(String(80), nullable=False)
    scope_hash = Column(String(64), nullable=False)
    configuration_version = Column(Integer, nullable=False, default=1, server_default="1")
    reviewer_name = Column(String(160), nullable=True)
    reviewer_role = Column(String(100), nullable=True)
    evidence_reference = Column(String(500), nullable=True)
    evidence_hash = Column(String(64), nullable=True)
    notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    effective_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    review_trigger = Column(String(300), nullable=True)
    conditions_open = Column(Boolean, nullable=False, default=False, server_default="false")
    version = Column(Integer, nullable=False, default=1, server_default="1")
    updated_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now, server_default=func.now())


class PilotConfigurationEvent(Base):
    __tablename__ = "pilot_configuration_events"
    __table_args__ = (CheckConstraint("event_type IN ('configuration_updated', 'gate_updated')", name="ck_pilot_configuration_event_type"),)
    id = Column(BigInteger().with_variant(Integer(), "sqlite"), Identity(), primary_key=True)
    event_type = Column(String(40), nullable=False)
    actor_id = Column(String(255), nullable=False)
    target_key = Column(String(100), nullable=False)
    changed_fields = Column(Text, nullable=False)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=True)
    scope_hash = Column(String(64), nullable=False)
    evidence_hash = Column(String(64), nullable=True)
    previous_snapshot = Column(Text, nullable=True)
    new_snapshot = Column(Text, nullable=True)
    resulting_version = Column(Integer, nullable=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())


class PilotTaskClassification(Base):
    __tablename__ = "pilot_task_classifications"
    __table_args__ = (
        CheckConstraint("task_key IN ('mounting_under_5kg', 'flat_pack_under_25kg', 'cabinet_hardware')", name="ck_pilot_task_classification_key"),
        UniqueConstraint("lead_id", name="uq_pilot_task_classification_lead"),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="RESTRICT"), nullable=False, index=True)
    task_key = Column(String(60), nullable=False)
    service_area = Column(String(30), nullable=False, default="harish", server_default="harish")
    measured_weight_kg = Column(Numeric(6, 2), nullable=True)
    safety_confirmations = Column(Text, nullable=False)
    scope_version = Column(String(80), nullable=False)
    scope_hash = Column(String(64), nullable=False)
    reason = Column(String(500), nullable=False)
    classified_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())


class PilotTechnicalAttestation(Base):
    """Immutable receipt for a signature-verified technical release check."""

    __tablename__ = "pilot_technical_attestations"
    __table_args__ = (
        CheckConstraint("gate_key IN ('SYSTEM_BOOKING_SCHEDULE_VERIFIED','SYSTEM_PROVIDER_ELIGIBILITY_VERIFIED','SYSTEM_OFFER_ASSIGNMENT_VERIFIED','SYSTEM_PROVIDER_MOBILE_WORKFLOW_VERIFIED','SYSTEM_PRIVATE_EVIDENCE_VERIFIED','SYSTEM_QUALITY_REWORK_VERIFIED','SYSTEM_PAYMENT_PAYOUT_LEDGER_VERIFIED','SYSTEM_GUARDED_COMPLETION_VERIFIED','SYSTEM_ISOLATED_RESTORE_PARITY_VERIFIED')", name="ck_pilot_technical_attestation_gate"),
        CheckConstraint("run_attempt >= 1", name="ck_pilot_technical_attestation_attempt"),
        CheckConstraint("length(commit_sha) = 40 AND length(release_sha) = 40", name="ck_pilot_technical_attestation_release_hashes"),
        CheckConstraint("length(scope_hash) = 64 AND length(artifact_digest) = 64 AND length(signature_bundle_digest) = 64", name="ck_pilot_technical_attestation_digests"),
        CheckConstraint("environment = 'production'", name="ck_pilot_technical_attestation_environment"),
        CheckConstraint("expires_at > issued_at", name="ck_pilot_technical_attestation_lifetime"),
        UniqueConstraint("repository", "workflow_path", "run_id", "run_attempt", name="uq_pilot_technical_attestation_run"),
        UniqueConstraint("artifact_digest", name="uq_pilot_technical_attestation_artifact"),
    )
    id = Column(BigInteger().with_variant(Integer(), "sqlite"), Identity(), primary_key=True)
    gate_key = Column(String(100), nullable=False, index=True)
    repository = Column(String(200), nullable=False)
    workflow_path = Column(String(200), nullable=False)
    git_ref = Column(String(200), nullable=False)
    run_id = Column(String(40), nullable=False)
    run_attempt = Column(Integer, nullable=False)
    commit_sha = Column(String(64), nullable=False)
    release_sha = Column(String(64), nullable=False)
    migration_head = Column(String(40), nullable=False)
    scope_version = Column(String(80), nullable=False)
    scope_hash = Column(String(64), nullable=False)
    environment = Column(String(80), nullable=False)
    artifact_reference = Column(String(120), nullable=False)
    artifact_digest = Column(String(64), nullable=False)
    signature_bundle_digest = Column(String(64), nullable=False)
    oidc_issuer = Column(String(300), nullable=False)
    oidc_subject = Column(String(500), nullable=False)
    issued_at = Column(DateTime(timezone=True), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
