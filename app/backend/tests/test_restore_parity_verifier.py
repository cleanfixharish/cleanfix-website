from datetime import datetime, timedelta, timezone
import importlib.util
import math
from pathlib import Path
import sys


SCRIPT = Path(__file__).parents[3] / "scripts" / "verify_restore_parity.py"
SPEC = importlib.util.spec_from_file_location("verify_restore_parity", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


def snapshot(**changes):
    metrics = {
        f"{schema}.{table}": {"present": True, "count": 0, "max_id": None, "max_timestamp": None}
        for schema, table in MODULE.CRITICAL_TABLES
    }
    metrics["public.jobs"] = {"present": True, "count": 1, "max_id": 1, "max_timestamp": "2026-09-09T08:00:00+00:00"}
    values = {
        "captured_at_utc": "2026-09-09T08:55:00+00:00",
        "endpoint_identity_digest": "restore-endpoint",
        "migration_head": "expected", "recovery_complete": True,
        "transaction_read_only": True,
        "schema_presence": {name: True for name in MODULE.AUDITED_SCHEMAS},
        "schema_fingerprint": "schema", "trigger_fingerprint": "triggers",
        "immutable_trigger_status": {name: "O" for name in MODULE.REQUIRED_IMMUTABLE_TRIGGERS},
        "sequence_state_digest": "sequences",
        "table_metrics": metrics,
        "foreign_key_orphans": {"public.jobs:fk": 0},
        "job_event_count": 1, "job_event_terminal_digest": "terminal",
        "job_event_chain_errors": 0,
    }
    values.update(changes)
    return MODULE.DatabaseSnapshot(**values)


def compare(restored=None, **limits):
    baseline = snapshot(endpoint_identity_digest="baseline-endpoint")
    return MODULE.compare_snapshots(
        baseline, restored or snapshot(), expected_head="expected",
        target_utc=datetime(2026, 9, 9, 9, tzinfo=timezone.utc),
        actual_rpo_minutes=limits.get("actual_rpo_minutes", 5), allowed_rpo_minutes=10,
        actual_rto_minutes=limits.get("actual_rto_minutes", 10), allowed_rto_minutes=20,
    )


def test_matching_read_only_snapshots_pass():
    assert compare() == []


def test_equivalent_postgres_urls_have_same_preliminary_identity():
    first = MODULE._endpoint_identity("postgres://user:one@DB.EXAMPLE/recovery")
    second = MODULE._endpoint_identity("postgresql://user:two@db.example:5432/recovery")
    assert first == second


def test_stale_migration_and_missing_schema_fail_closed():
    errors = compare(snapshot(migration_head="stale", schema_fingerprint="old"))
    assert "restored migration head differs from the baseline" in errors
    assert "schema fingerprint differs" in errors


def test_missing_required_table_fails_even_when_both_snapshots_match():
    missing = snapshot()
    missing.table_metrics["public.bookings"] = {"present": False}
    errors = compare(missing)
    assert any("required recovery tables are missing" in item for item in errors)


def test_manifest_is_non_overwriting_and_detects_tamper(tmp_path):
    path = tmp_path / "baseline.json"
    key = b"k" * 32
    payload = MODULE._authenticated_payload({"schema_version": "test", "value": 1}, key)
    MODULE._write_exclusive(str(path), payload)
    assert MODULE._load_manifest(str(path), key)["value"] == 1
    try:
        MODULE._write_exclusive(str(path), payload)
        assert False, "existing evidence must not be overwritten"
    except FileExistsError:
        pass
    path.write_text(path.read_text().replace('"value": 1', '"value": 2'))
    try:
        MODULE._load_manifest(str(path), key)
        assert False, "tampered evidence must fail"
    except RuntimeError:
        pass


def test_orphans_chain_damage_and_objective_breach_fail_closed():
    damaged = snapshot(
        foreign_key_orphans={"public.jobs:fk": 1},
        job_event_chain_errors=1,
        job_event_terminal_digest="wrong",
    )
    errors = compare(damaged, actual_rpo_minutes=11, actual_rto_minutes=21)
    assert len(errors) == 5


def test_nan_negative_and_disabled_trigger_fail_closed():
    restored = snapshot(immutable_trigger_status={name: "D" for name in MODULE.REQUIRED_IMMUTABLE_TRIGGERS})
    errors = compare(restored, actual_rpo_minutes=math.nan, actual_rto_minutes=-1)
    assert any("append-only triggers" in item for item in errors)
    assert any("RPO/RTO values" in item for item in errors)


def test_rows_after_selected_target_fail_closed():
    future = datetime(2026, 9, 9, 10, tzinfo=timezone.utc)
    restored = snapshot()
    restored.table_metrics["public.jobs"] = {
        "present": True, "count": 1, "max_id": 1, "max_timestamp": future.isoformat()
    }
    errors = compare(restored)
    assert any("after the selected recovery point" in item for item in errors)
