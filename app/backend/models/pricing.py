from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text

from core.database import Base


class PricingSource(Base):
    __tablename__ = "pricing_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_key = Column(String(80), unique=True, nullable=False, index=True)
    publisher = Column(String(120), nullable=False)
    url = Column(String(1000), nullable=False)
    geography = Column(String(120), nullable=False, default="Israel national")
    evidence_type = Column(String(50), nullable=False, default="displayed_price")
    accessed_on = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)


class PriceObservation(Base):
    __tablename__ = "price_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    observation_key = Column(String(80), unique=True, nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("pricing_sources.id"), nullable=False, index=True)
    category = Column(String(120), nullable=False, index=True)
    sub_service = Column(String(240), nullable=False)
    geography = Column(String(120), nullable=False, default="Israel national")
    min_price = Column(Numeric(12, 2), nullable=True)
    max_price = Column(Numeric(12, 2), nullable=True)
    typical_price = Column(Numeric(12, 2), nullable=True)
    vat_status = Column(String(40), nullable=False, default="unspecified")
    basis = Column(Text, nullable=True)
    confidence = Column(String(30), nullable=False, default="medium")
    validation_status = Column(String(30), nullable=False, default="pending")
    eligible_for_estimate = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), default=datetime.now)


class PriceEstimate(Base):
    __tablename__ = "price_estimates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True, index=True)
    observation_id = Column(Integer, ForeignKey("price_observations.id"), nullable=True, index=True)
    service_description = Column(Text, nullable=False)
    geography = Column(String(120), nullable=False)
    photo_notes = Column(Text, nullable=True)
    assumptions = Column(Text, nullable=True)
    exclusions = Column(Text, nullable=True)
    suggested_min = Column(Numeric(12, 2), nullable=True)
    suggested_max = Column(Numeric(12, 2), nullable=True)
    customer_min = Column(Numeric(12, 2), nullable=True)
    customer_max = Column(Numeric(12, 2), nullable=True)
    provider_budget = Column(Numeric(12, 2), nullable=True)
    status = Column(String(30), nullable=False, default="draft", server_default="draft")
    disclaimer = Column(Text, nullable=False)
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)


class ServiceQuote(Base):
    """A fixed, customer-facing offer created from an owner-approved estimate.

    The raw access token is never stored. Only its SHA-256 digest is persisted,
    so a database read does not reveal usable customer quote links.
    """

    __tablename__ = "service_quotes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    estimate_id = Column(Integer, ForeignKey("price_estimates.id"), nullable=False, unique=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True, index=True)
    quoted_total = Column(Numeric(12, 2), nullable=False)
    deposit_required = Column(Numeric(12, 2), nullable=True)
    scope = Column(Text, nullable=False)
    exclusions = Column(Text, nullable=True)
    terms = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="draft", server_default="draft", index=True)
    public_token_hash = Column(String(64), nullable=True, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    declined_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)


class LocalPriceEvidence(Base):
    __tablename__ = "local_price_evidence"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_kind = Column(String(30), nullable=False)  # provider_quote or completed_job
    category = Column(String(120), nullable=False, index=True)
    sub_service = Column(String(240), nullable=False)
    geography = Column(String(120), nullable=False, index=True)
    customer_price = Column(Numeric(12, 2), nullable=True)
    provider_amount = Column(Numeric(12, 2), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    provider_id = Column(Integer, ForeignKey("partners.id"), nullable=True)
    scope_notes = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="pending", server_default="pending")
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
