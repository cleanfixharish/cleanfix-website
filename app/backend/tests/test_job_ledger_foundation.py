from models.job_ledger import CompletedJob, CompletedJobAmendment, FinancialEntry, JobEvent


LEDGER_MODELS = (JobEvent, CompletedJob, CompletedJobAmendment, FinancialEntry)
FORBIDDEN_PII_COLUMNS = {"customer_name", "phone", "email", "address", "access_notes"}


def test_permanent_job_tables_use_dedicated_schema():
    assert {model.__table__.schema for model in LEDGER_MODELS} == {"job_ledger"}
    assert {model.__tablename__ for model in LEDGER_MODELS} == {
        "job_events",
        "completed_jobs",
        "completed_job_amendments",
        "financial_entries",
    }


def test_permanent_job_tables_do_not_store_direct_customer_pii():
    for model in LEDGER_MODELS:
        assert FORBIDDEN_PII_COLUMNS.isdisjoint(model.__table__.columns.keys())


def test_job_events_have_sequence_and_idempotency_guards():
    constraints = {constraint.name for constraint in JobEvent.__table__.constraints}
    assert "uq_job_events_event_uuid" in constraints
    assert "uq_job_events_job_sequence" in constraints
    assert "uq_job_events_source_idempotency" in constraints
    assert "ck_job_events_positive_sequence" in constraints
    assert "ck_job_events_visibility" in constraints


def test_completed_jobs_and_financial_entries_have_integrity_guards():
    completed_constraints = {constraint.name for constraint in CompletedJob.__table__.constraints}
    financial_constraints = {constraint.name for constraint in FinancialEntry.__table__.constraints}

    assert "uq_completed_jobs_job_sequence" in completed_constraints
    assert "uq_completed_jobs_record_hash" in completed_constraints
    assert "ck_completed_jobs_nonnegative_amounts" in completed_constraints
    assert "uq_financial_entries_entry_uuid" in financial_constraints
    assert "uq_financial_entries_entry_hash" in financial_constraints
    assert "ck_financial_entries_nonnegative_amount" in financial_constraints
    assert "ck_financial_entries_type" in financial_constraints
