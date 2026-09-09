from datetime import datetime

from sqlalchemy import (
    BigInteger, Boolean, CheckConstraint, Column, DateTime, ForeignKey, Identity,
    Index, Integer, Numeric, String, Text, UniqueConstraint, func, text,
)

from core.database import Base


class ManagedProviderProfile(Base):
    __tablename__ = "managed_provider_profiles"
    __table_args__ = (
        CheckConstraint("operational_status IN ('draft', 'active', 'paused', 'disabled')", name="ck_provider_profiles_status"),
        CheckConstraint("availability_status IN ('available', 'limited', 'unavailable')", name="ck_provider_profiles_availability"),
        UniqueConstraint("relationship_id", name="uq_provider_profiles_relationship"),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    relationship_id = Column(Integer, ForeignKey("business_relationships.id", ondelete="RESTRICT"), nullable=False, index=True)
    display_name = Column(String(160), nullable=False)
    operational_status = Column(String(20), nullable=False, default="draft", server_default="draft", index=True)
    availability_status = Column(String(20), nullable=False, default="unavailable", server_default="unavailable", index=True)
    version = Column(Integer, nullable=False, default=1, server_default="1")
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now, server_default=func.now())


class ProviderCapability(Base):
    __tablename__ = "provider_capabilities"
    __table_args__ = (
        UniqueConstraint("provider_profile_id", "service_key", "service_area", name="uq_provider_capability_scope"),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_profile_id = Column(Integer, ForeignKey("managed_provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    service_key = Column(String(120), nullable=False, index=True)
    service_area = Column(String(120), nullable=False, index=True)
    is_verified = Column(Boolean, nullable=False, default=False, server_default="false")
    verified_by = Column(String(255), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)


class ProviderCapabilityDecision(Base):
    __tablename__ = "provider_capability_decisions"
    __table_args__ = (
        CheckConstraint("status IN ('eligible_supervised', 'suspended', 'rejected', 'expired', 'superseded')", name="ck_provider_capability_decision_status"),
        CheckConstraint("service_area = 'harish'", name="ck_provider_capability_decision_area"),
        CheckConstraint("supervision_only = true", name="ck_provider_capability_decision_supervision"),
        UniqueConstraint("supersedes_id", name="uq_provider_capability_decision_supersedes"),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_profile_id = Column(Integer, ForeignKey("managed_provider_profiles.id", ondelete="RESTRICT"), nullable=False, index=True)
    service_key = Column(String(60), nullable=False, index=True)
    service_area = Column(String(30), nullable=False, default="harish", server_default="harish")
    status = Column(String(30), nullable=False)
    assessment_method = Column(String(50), nullable=False)
    assessment_result = Column(String(30), nullable=False)
    evidence_reference = Column(String(120), nullable=False)
    evidence_hash = Column(String(64), nullable=False)
    assessor_name = Column(String(160), nullable=False)
    assessor_role = Column(String(60), nullable=False)
    assessed_at = Column(DateTime(timezone=True), nullable=False)
    effective_at = Column(DateTime(timezone=True), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    review_trigger = Column(String(300), nullable=False)
    conditions_open = Column(Boolean, nullable=False, default=False, server_default="false")
    supervision_only = Column(Boolean, nullable=False, default=True, server_default="true")
    safety_acknowledgements = Column(Text, nullable=False)
    scope_version = Column(String(80), nullable=False)
    scope_hash = Column(String(64), nullable=False)
    task_definition_hash = Column(String(64), nullable=False)
    task_definition_version = Column(String(40), nullable=False)
    confirmation_set_version = Column(String(50), nullable=False)
    confirmation_set_hash = Column(String(64), nullable=False)
    decision_reason = Column(String(500), nullable=False)
    supersedes_id = Column(Integer, ForeignKey("provider_capability_decisions.id", ondelete="RESTRICT"), nullable=True)
    recorded_by = Column(String(255), nullable=False)
    idempotency_key = Column(String(100), nullable=False, unique=True)
    command_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())


class ProviderVettingItem(Base):
    __tablename__ = "provider_vetting_items"
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'approved', 'rejected', 'expired')", name="ck_provider_vetting_status"),
        UniqueConstraint("provider_profile_id", "requirement_key", name="uq_provider_vetting_requirement"),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_profile_id = Column(Integer, ForeignKey("managed_provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_key = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="pending", server_default="pending")
    expires_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(String(255), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    effective_at = Column(DateTime(timezone=True), nullable=True)
    reviewer_role = Column(String(80), nullable=True)
    evidence_reference = Column(String(120), nullable=True)
    evidence_hash = Column(String(64), nullable=True)
    scope_version = Column(String(80), nullable=True)
    scope_hash = Column(String(64), nullable=True)
    review_trigger = Column(String(300), nullable=True)
    conditions_open = Column(Boolean, nullable=False, default=False, server_default="false")


class AssignmentOffer(Base):
    __tablename__ = "assignment_offers"
    __table_args__ = (
        CheckConstraint("status IN ('offered', 'accepted', 'declined', 'expired', 'confirmed', 'withdrawn')", name="ck_assignment_offers_status"),
        CheckConstraint("sequence_number > 0", name="ck_assignment_offers_sequence"),
        CheckConstraint("provider_payout >= 0", name="ck_assignment_offers_payout"),
        UniqueConstraint("job_id", "sequence_number", name="uq_assignment_offers_job_sequence"),
        Index("uq_assignment_offers_one_open", "job_id", unique=True, postgresql_where=text("status IN ('offered', 'accepted')"), sqlite_where=text("status IN ('offered', 'accepted')")),
        Index("uq_assignment_offers_one_confirmed", "job_id", unique=True, postgresql_where=text("status = 'confirmed'"), sqlite_where=text("status = 'confirmed'")),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="RESTRICT"), nullable=False, index=True)
    provider_profile_id = Column(Integer, ForeignKey("managed_provider_profiles.id", ondelete="RESTRICT"), nullable=False, index=True)
    capability_decision_id = Column(Integer, ForeignKey("provider_capability_decisions.id", ondelete="RESTRICT"), nullable=True, index=True)
    capability_task_definition_hash = Column(String(64), nullable=True)
    capability_evidence_hash = Column(String(64), nullable=True)
    sequence_number = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="offered", server_default="offered", index=True)
    provider_payout = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="ILS", server_default="ILS")
    service_key = Column(String(120), nullable=False)
    service_area = Column(String(120), nullable=False)
    window_start = Column(DateTime(timezone=True), nullable=False)
    window_end = Column(DateTime(timezone=True), nullable=False)
    response_deadline = Column(DateTime(timezone=True), nullable=False)
    instructions = Column(Text, nullable=True)
    decline_reason = Column(Text, nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    declined_at = Column(DateTime(timezone=True), nullable=True)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    version = Column(Integer, nullable=False, default=1, server_default="1")
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now, server_default=func.now())


class AssignmentOfferEvent(Base):
    __tablename__ = "assignment_offer_events"
    __table_args__ = (
        UniqueConstraint("source", "idempotency_key", name="uq_assignment_offer_events_source_idempotency"),
    )
    id = Column(BigInteger().with_variant(Integer(), "sqlite"), Identity(), primary_key=True)
    offer_id = Column(Integer, ForeignKey("assignment_offers.id", ondelete="RESTRICT"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="RESTRICT"), nullable=False, index=True)
    capability_decision_id = Column(Integer, ForeignKey("provider_capability_decisions.id", ondelete="RESTRICT"), nullable=True, index=True)
    capability_task_definition_hash = Column(String(64), nullable=True)
    capability_evidence_hash = Column(String(64), nullable=True)
    service_key_snapshot = Column(String(120), nullable=True)
    service_area_snapshot = Column(String(120), nullable=True)
    window_start_snapshot = Column(DateTime(timezone=True), nullable=True)
    window_end_snapshot = Column(DateTime(timezone=True), nullable=True)
    event_type = Column(String(40), nullable=False)
    actor_id = Column(String(255), nullable=False)
    actor_role = Column(String(30), nullable=False)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    source = Column(String(60), nullable=False)
    idempotency_key = Column(String(100), nullable=False)
    command_hash = Column(String(64), nullable=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())


class ServiceLocation(Base):
    __tablename__ = "service_locations"
    __table_args__ = (UniqueConstraint("booking_id", name="uq_service_locations_booking"),)
    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False, index=True)
    encrypted_payload = Column(Text, nullable=False)
    payload_version = Column(Integer, nullable=False, default=1, server_default="1")
    version = Column(Integer, nullable=False, default=1, server_default="1")
    set_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now, server_default=func.now())


class ServiceLocationEvent(Base):
    __tablename__ = "service_location_events"
    __table_args__ = (
        CheckConstraint(
            "event_type IN ('location_set', 'location_updated', 'owner_accessed', 'provider_accessed')",
            name="ck_service_location_events_type",
        ),
        UniqueConstraint("source", "idempotency_key", name="uq_service_location_events_source_idempotency"),
    )
    id = Column(BigInteger().with_variant(Integer(), "sqlite"), Identity(), primary_key=True)
    service_location_id = Column(Integer, ForeignKey("service_locations.id", ondelete="RESTRICT"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="RESTRICT"), nullable=True, index=True)
    event_type = Column(String(40), nullable=False)
    location_version = Column(Integer, nullable=False)
    actor_id = Column(String(255), nullable=False)
    actor_role = Column(String(30), nullable=False)
    source = Column(String(60), nullable=False)
    idempotency_key = Column(String(100), nullable=True)
    command_hash = Column(String(64), nullable=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now, server_default=func.now())
