from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB

from core.database import Base


class JobEvent(Base):
    __tablename__ = "job_events"
    __table_args__ = (
        CheckConstraint("sequence_number > 0", name="ck_job_events_positive_sequence"),
        CheckConstraint("schema_version > 0", name="ck_job_events_positive_schema_version"),
        CheckConstraint(
            "visibility IN ('owner', 'customer', 'provider')",
            name="ck_job_events_visibility",
        ),
        UniqueConstraint("event_uuid", name="uq_job_events_event_uuid"),
        UniqueConstraint("job_id", "sequence_number", name="uq_job_events_job_sequence"),
        UniqueConstraint("source", "idempotency_key", name="uq_job_events_source_idempotency"),
        Index("ix_job_events_job_id_id", "job_id", "id"),
        Index("ix_job_events_recorded_at_id", "recorded_at", "id"),
        {"schema": "job_ledger"},
    )

    id = Column(BigInteger, Identity(), primary_key=True)
    event_uuid = Column(String(36), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="RESTRICT"), nullable=False)
    sequence_number = Column(Integer, nullable=False)
    event_type = Column(String(80), nullable=False)
    schema_version = Column(Integer, nullable=False, default=1, server_default="1")
    occurred_at = Column(DateTime(timezone=True), nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    actor_type = Column(String(30), nullable=False)
    actor_id = Column(String(255), nullable=False)
    actor_role = Column(String(30), nullable=False)
    source = Column(String(60), nullable=False)
    request_id = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    visibility = Column(String(30), nullable=False, default="owner", server_default="owner")
    payload = Column(JSONB, nullable=False, default=dict, server_default="{}")
    idempotency_key = Column(String(100), nullable=False)
    previous_hash = Column(String(64), nullable=True)
    event_hash = Column(String(64), nullable=False)


class CompletedJob(Base):
    __tablename__ = "completed_jobs"
    __table_args__ = (
        CheckConstraint("completion_sequence > 0", name="ck_completed_jobs_positive_sequence"),
        CheckConstraint("record_version > 0", name="ck_completed_jobs_positive_record_version"),
        CheckConstraint("currency = 'ILS'", name="ck_completed_jobs_currency_ils"),
        CheckConstraint(
            "customer_collected_amount >= 0 AND provider_payable_amount >= 0 "
            "AND provider_paid_amount >= 0 AND direct_cost_amount >= 0 "
            "AND payment_fee_amount >= 0 AND refund_amount >= 0 AND rework_cost_amount >= 0",
            name="ck_completed_jobs_nonnegative_amounts",
        ),
        UniqueConstraint("job_id", "completion_sequence", name="uq_completed_jobs_job_sequence"),
        UniqueConstraint("record_hash", name="uq_completed_jobs_record_hash"),
        Index("ix_completed_jobs_completed_at_id", "completed_at", "id"),
        Index("ix_completed_jobs_provider_completed", "provider_id", "completed_at"),
        Index("ix_completed_jobs_service_completed", "service_id", "completed_at"),
        {"schema": "job_ledger"},
    )

    id = Column(BigInteger, Identity(), primary_key=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="RESTRICT"), nullable=False)
    completion_sequence = Column(Integer, nullable=False, default=1, server_default="1")
    completion_event_id = Column(
        BigInteger,
        ForeignKey("job_ledger.job_events.id", ondelete="RESTRICT"),
        nullable=False,
    )
    job_number = Column(String(40), nullable=False)
    service_id = Column(Integer, nullable=True)
    provider_id = Column(Integer, nullable=True)
    general_area = Column(String(100), nullable=True)
    scope_snapshot = Column(JSONB, nullable=False)
    actual_work_snapshot = Column(JSONB, nullable=False)
    schedule_snapshot = Column(JSONB, nullable=False)
    commercial_snapshot = Column(JSONB, nullable=False)
    evidence_manifest = Column(JSONB, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completion_submitted_at = Column(DateTime(timezone=True), nullable=False)
    quality_approved_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=False)
    finalized_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    currency = Column(String(3), nullable=False, default="ILS", server_default="ILS")
    customer_collected_amount = Column(Numeric(14, 2), nullable=False)
    provider_payable_amount = Column(Numeric(14, 2), nullable=False)
    provider_paid_amount = Column(Numeric(14, 2), nullable=False, default=0, server_default="0")
    direct_cost_amount = Column(Numeric(14, 2), nullable=False, default=0, server_default="0")
    payment_fee_amount = Column(Numeric(14, 2), nullable=False, default=0, server_default="0")
    refund_amount = Column(Numeric(14, 2), nullable=False, default=0, server_default="0")
    rework_cost_amount = Column(Numeric(14, 2), nullable=False, default=0, server_default="0")
    quality_outcome = Column(String(50), nullable=False)
    issue_summary = Column(JSONB, nullable=False)
    owner_coordination_minutes = Column(Integer, nullable=True)
    finalized_by = Column(String(255), nullable=False)
    record_version = Column(Integer, nullable=False, default=1, server_default="1")
    record_hash = Column(String(64), nullable=False)


class CompletedJobAmendment(Base):
    __tablename__ = "completed_job_amendments"
    __table_args__ = (
        Index("ix_completed_job_amendments_record_id", "completed_job_id", "id"),
        {"schema": "job_ledger"},
    )

    id = Column(BigInteger, Identity(), primary_key=True)
    completed_job_id = Column(
        BigInteger,
        ForeignKey("job_ledger.completed_jobs.id", ondelete="RESTRICT"),
        nullable=False,
    )
    amendment_type = Column(String(60), nullable=False)
    reason = Column(Text, nullable=False)
    changes = Column(JSONB, nullable=False)
    corrects_amendment_id = Column(
        BigInteger,
        ForeignKey("job_ledger.completed_job_amendments.id", ondelete="RESTRICT"),
        nullable=True,
    )
    created_by = Column(String(255), nullable=False)
    approved_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    effective_at = Column(DateTime(timezone=True), nullable=False)
    previous_record_hash = Column(String(64), nullable=False)
    new_record_hash = Column(String(64), nullable=False)


class FinancialEntry(Base):
    __tablename__ = "financial_entries"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="ck_financial_entries_nonnegative_amount"),
        CheckConstraint("currency = 'ILS'", name="ck_financial_entries_currency_ils"),
        CheckConstraint(
            "entry_type IN ('customer_collection', 'customer_refund', 'provider_payable', "
            "'provider_payment', 'direct_cost', 'payment_fee', 'rework_cost', 'acquisition_cost')",
            name="ck_financial_entries_type",
        ),
        UniqueConstraint("entry_uuid", name="uq_financial_entries_entry_uuid"),
        UniqueConstraint("entry_hash", name="uq_financial_entries_entry_hash"),
        Index("ix_financial_entries_job_id_id", "job_id", "id"),
        Index("ix_financial_entries_recorded_at_id", "recorded_at", "id"),
        {"schema": "job_ledger"},
    )

    id = Column(BigInteger, Identity(), primary_key=True)
    entry_uuid = Column(String(36), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="RESTRICT"), nullable=False)
    event_id = Column(
        BigInteger,
        ForeignKey("job_ledger.job_events.id", ondelete="RESTRICT"),
        nullable=False,
    )
    entry_type = Column(String(40), nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="ILS", server_default="ILS")
    external_reference = Column(String(255), nullable=True)
    reverses_entry_id = Column(
        BigInteger,
        ForeignKey("job_ledger.financial_entries.id", ondelete="RESTRICT"),
        nullable=True,
    )
    recorded_by = Column(String(255), nullable=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    reason = Column(Text, nullable=True)
    entry_hash = Column(String(64), nullable=False)
