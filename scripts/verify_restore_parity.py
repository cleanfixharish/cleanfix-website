"""Read-only PostgreSQL recovery-parity verifier.

Connection URLs are read only from CLEANFIX_BASELINE_DATABASE_URL and
CLEANFIX_RESTORE_DATABASE_URL. The report contains aggregate metadata and
digests only; it never prints credentials or row values.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import hmac
import json
import math
import os
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine


CRITICAL_TABLES = (
    ("public", "leads"),
    ("public", "service_quotes"),
    ("public", "bookings"),
    ("public", "jobs"),
    ("job_ledger", "job_events"),
    ("job_ledger", "completed_jobs"),
    ("job_ledger", "completed_job_amendments"),
    ("job_ledger", "financial_entries"),
)
AUDITED_SCHEMAS = ("public", "job_ledger", "job_private", "job_finance")
REQUIRED_SCHEMAS = ("public", "job_ledger")
TOOL_VERSION = "cleanfix-restore-parity/1"
REQUIRED_IMMUTABLE_TRIGGERS = {
    "completed_job_amendments_append_only",
    "completed_jobs_append_only",
    "financial_entries_append_only",
    "job_events_append_only",
}


def _digest(value: Any) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), default=str).encode()
    return hashlib.sha256(encoded).hexdigest()


def _hmac_digest(key: bytes, value: Any) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), default=str).encode()
    return hmac.new(key, encoded, hashlib.sha256).hexdigest()


def _utc(value: datetime) -> datetime:
    return (value if value.tzinfo else value.replace(tzinfo=timezone.utc)).astimezone(timezone.utc)


def _async_url(raw: str) -> str:
    if raw.startswith("postgresql+asyncpg://"):
        return raw
    if raw.startswith("postgresql://"):
        return "postgresql+asyncpg://" + raw.removeprefix("postgresql://")
    if raw.startswith("postgres://"):
        return "postgresql+asyncpg://" + raw.removeprefix("postgres://")
    raise ValueError("Only PostgreSQL connection URLs are accepted")


def _endpoint_identity(raw: str) -> tuple[str | None, int | None, str | None]:
    parsed = make_url(_async_url(raw))
    return (parsed.host or "").lower(), parsed.port or 5432, parsed.database


@dataclass(frozen=True)
class DatabaseSnapshot:
    captured_at_utc: str
    endpoint_identity_digest: str
    migration_head: str
    recovery_complete: bool
    transaction_read_only: bool
    schema_presence: dict[str, bool]
    schema_fingerprint: str
    trigger_fingerprint: str
    immutable_trigger_status: dict[str, str]
    sequence_state_digest: str
    table_metrics: dict[str, dict[str, Any]]
    foreign_key_orphans: dict[str, int]
    job_event_count: int
    job_event_terminal_digest: str
    job_event_chain_errors: int


def compare_snapshots(
    baseline: DatabaseSnapshot,
    restored: DatabaseSnapshot,
    *,
    expected_head: str,
    target_utc: datetime,
    actual_rpo_minutes: float,
    allowed_rpo_minutes: float,
    actual_rto_minutes: float,
    allowed_rto_minutes: float,
) -> list[str]:
    errors: list[str] = []
    if baseline.migration_head != expected_head:
        errors.append("baseline migration head differs from the owner-approved head")
    if restored.migration_head != baseline.migration_head:
        errors.append("restored migration head differs from the baseline")
    if not restored.recovery_complete:
        errors.append("restored database is still in recovery")
    if not baseline.recovery_complete:
        errors.append("baseline database is still in recovery")
    if not baseline.transaction_read_only or not restored.transaction_read_only:
        errors.append("database snapshot was not captured in a read-only transaction")
    if baseline.endpoint_identity_digest == restored.endpoint_identity_digest:
        errors.append("baseline and restored endpoint identities are not isolated")
    if baseline.schema_presence != restored.schema_presence or not all(baseline.schema_presence.get(name, False) for name in REQUIRED_SCHEMAS):
        errors.append("required schema presence differs or is incomplete")
    if restored.schema_fingerprint != baseline.schema_fingerprint:
        errors.append("schema fingerprint differs")
    if restored.trigger_fingerprint != baseline.trigger_fingerprint:
        errors.append("trigger/function fingerprint differs")
    if baseline.immutable_trigger_status != restored.immutable_trigger_status or set(baseline.immutable_trigger_status) != REQUIRED_IMMUTABLE_TRIGGERS or any(value != "O" for value in baseline.immutable_trigger_status.values()):
        errors.append("required append-only triggers are missing, disabled, or different")
    if restored.table_metrics != baseline.table_metrics:
        errors.append("critical-table aggregate metrics differ")
    if restored.sequence_state_digest != baseline.sequence_state_digest:
        errors.append("database sequence state differs")
    missing = [name for name in (f"{schema}.{table}" for schema, table in CRITICAL_TABLES)
               if not baseline.table_metrics.get(name, {}).get("present")
               or not restored.table_metrics.get(name, {}).get("present")]
    if missing:
        errors.append("required recovery tables are missing: " + ", ".join(missing))
    if any(baseline.foreign_key_orphans.values()):
        errors.append("baseline database contains foreign-key orphans")
    if any(restored.foreign_key_orphans.values()):
        errors.append("restored database contains foreign-key orphans")
    if baseline.job_event_chain_errors or restored.job_event_chain_errors:
        errors.append("baseline or restored job-event hash chain is invalid")
    if (
        restored.job_event_count != baseline.job_event_count
        or restored.job_event_terminal_digest != baseline.job_event_terminal_digest
    ):
        errors.append("job-event terminal hashes differ")
    for table, metrics in restored.table_metrics.items():
        raw = metrics.get("max_timestamp")
        if raw and datetime.fromisoformat(raw) > _utc(target_utc):
            errors.append(f"{table} contains a timestamp after the selected recovery point")
    durations = (actual_rpo_minutes, allowed_rpo_minutes, actual_rto_minutes, allowed_rto_minutes)
    if not all(math.isfinite(item) for item in durations) or allowed_rpo_minutes <= 0 or allowed_rto_minutes <= 0 or actual_rpo_minutes < 0 or actual_rto_minutes < 0:
        errors.append("RPO/RTO values are not finite non-negative measurements with positive limits")
        return errors
    if actual_rpo_minutes > allowed_rpo_minutes:
        errors.append("measured RPO exceeds the owner-approved limit")
    if actual_rto_minutes > allowed_rto_minutes:
        errors.append("measured RTO exceeds the owner-approved limit")
    return errors


async def _snapshot(raw_url: str, digest_key: bytes) -> DatabaseSnapshot:
    engine = create_async_engine(_async_url(raw_url), pool_pre_ping=True)
    try:
        async with engine.connect() as connection:
            transaction = await connection.begin()
            try:
                await connection.execute(text("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY"))
                await connection.execute(text("SET LOCAL row_security = off"))
                read_only = str(await connection.scalar(text("SHOW transaction_read_only"))).lower() == "on"
                if not read_only:
                    raise RuntimeError("read_only_transaction_required")
                captured_at, _snapshot_id = (await connection.execute(text(
                    "SELECT clock_timestamp(), txid_current_snapshot()::text"
                ))).one()
                captured_at = _utc(captured_at).isoformat()
                heads = list((await connection.execute(text("SELECT version_num FROM alembic_version"))).scalars())
                if len(heads) != 1:
                    raise RuntimeError("exactly_one_migration_head_required")
                migration_head = str(heads[0])
                recovery_complete = not bool(await connection.scalar(text("SELECT pg_is_in_recovery()")))
                server_identity = tuple((await connection.execute(text(
                    "SELECT current_database(), COALESCE(inet_server_addr()::text, ''), COALESCE(inet_server_port(), 0)"
                ))).one())
                schema_rows = set((await connection.execute(text(
                    "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ANY(:schemas)"
                ), {"schemas": list(AUDITED_SCHEMAS)})).scalars())
                schema_presence = {schema: schema in schema_rows for schema in AUDITED_SCHEMAS}

                catalog_rows = (await connection.execute(text("""
                    SELECT 'column', table_schema, table_name, column_name,
                           concat_ws('|', data_type, udt_schema, udt_name, character_maximum_length::text,
                             numeric_precision::text, numeric_scale::text, datetime_precision::text,
                             collation_name, is_identity, identity_generation, is_generated),
                           is_nullable, COALESCE(column_default, '')
                    FROM information_schema.columns
                    WHERE table_schema = ANY(:schemas)
                    UNION ALL
                    SELECT 'constraint', n.nspname, c.relname, con.conname,
                           con.contype::text, con.convalidated::text, pg_get_constraintdef(con.oid)
                    FROM pg_constraint con
                    JOIN pg_class c ON c.oid = con.conrelid
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = ANY(:schemas)
                    UNION ALL
                    SELECT 'index', n.nspname, t.relname, i.relname,
                           x.indisvalid::text, x.indisready::text, pg_get_indexdef(i.oid)
                    FROM pg_index x
                    JOIN pg_class i ON i.oid=x.indexrelid
                    JOIN pg_class t ON t.oid=x.indrelid
                    JOIN pg_namespace n ON n.oid=t.relnamespace
                    WHERE n.nspname = ANY(:schemas)
                    UNION ALL
                    SELECT 'table_security', n.nspname, c.relname, '',
                           c.relrowsecurity::text, c.relforcerowsecurity::text, c.relkind::text
                    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                    WHERE n.nspname = ANY(:schemas) AND c.relkind IN ('r','p','v','m','S')
                    UNION ALL
                    SELECT 'policy', schemaname, tablename, policyname,
                           permissive, roles::text, concat_ws('|', cmd, qual, with_check)
                    FROM pg_policies WHERE schemaname = ANY(:schemas)
                    UNION ALL
                    SELECT 'extension', n.nspname, e.extname, e.extversion, '', '', ''
                    FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace
                    WHERE n.nspname = ANY(:schemas)
                    UNION ALL
                    SELECT 'grant', table_schema, table_name, grantee,
                           privilege_type, is_grantable, grantor
                    FROM information_schema.role_table_grants
                    WHERE table_schema = ANY(:schemas)
                    ORDER BY 1, 2, 3, 4
                """), {"schemas": list(AUDITED_SCHEMAS)})).all()
                schema_fingerprint = _digest([tuple(row) for row in catalog_rows])

                trigger_rows = (await connection.execute(text("""
                    SELECT n.nspname, c.relname, t.tgname, t.tgenabled::text || '|' || pg_get_triggerdef(t.oid)
                    FROM pg_trigger t
                    JOIN pg_class c ON c.oid = t.tgrelid
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE NOT t.tgisinternal AND n.nspname = ANY(:schemas)
                    UNION ALL
                    SELECT n.nspname, p.proname, '', pg_get_functiondef(p.oid)
                    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                    WHERE n.nspname = ANY(:schemas)
                    ORDER BY 1, 2, 3
                """), {"schemas": list(AUDITED_SCHEMAS)})).all()
                trigger_fingerprint = _digest([tuple(row) for row in trigger_rows])
                immutable_trigger_status = dict((await connection.execute(text("""
                    SELECT t.tgname, t.tgenabled::text
                    FROM pg_trigger t
                    JOIN pg_class c ON c.oid=t.tgrelid
                    JOIN pg_namespace n ON n.oid=c.relnamespace
                    WHERE NOT t.tgisinternal AND n.nspname='job_ledger'
                      AND t.tgname = ANY(:names)
                """), {"names": sorted(REQUIRED_IMMUTABLE_TRIGGERS)})).all())
                sequence_rows = (await connection.execute(text("""
                    SELECT schemaname, sequencename, start_value, min_value, max_value,
                           increment_by, cycle, cache_size, last_value
                    FROM pg_sequences WHERE schemaname = ANY(:schemas)
                    ORDER BY schemaname, sequencename
                """), {"schemas": list(AUDITED_SCHEMAS)})).all()
                sequence_state_digest = _digest([tuple(row) for row in sequence_rows])

                preparer = connection.dialect.identifier_preparer
                table_metrics: dict[str, dict[str, Any]] = {}
                for schema, table in CRITICAL_TABLES:
                    exists = await connection.scalar(
                        text("SELECT to_regclass(:name) IS NOT NULL"), {"name": f"{schema}.{table}"}
                    )
                    key = f"{schema}.{table}"
                    if not exists:
                        table_metrics[key] = {"present": False}
                        continue
                    columns = set((await connection.execute(text("""
                        SELECT column_name FROM information_schema.columns
                        WHERE table_schema=:schema AND table_name=:table
                    """), {"schema": schema, "table": table})).scalars())
                    qualified = f"{preparer.quote(schema)}.{preparer.quote(table)}"
                    id_column = "id" if "id" in columns else None
                    timestamp_column = next((name for name in ("occurred_at", "completed_at", "updated_at", "created_at") if name in columns), None)
                    expressions = ["COUNT(*)"]
                    expressions.append(f"MAX({preparer.quote(id_column)})" if id_column else "NULL")
                    expressions.append(f"MAX({preparer.quote(timestamp_column)})" if timestamp_column else "NULL")
                    count, max_id, max_timestamp = (await connection.execute(text(
                        f"SELECT {', '.join(expressions)} FROM {qualified}"
                    ))).one()
                    row_hmac = hmac.new(digest_key, digestmod=hashlib.sha256)
                    ordering = preparer.quote(id_column) if id_column else "to_jsonb(t)::text"
                    stream = await connection.stream(text(f"SELECT to_jsonb(t)::text FROM {qualified} t ORDER BY {ordering}"))
                    async for row in stream:
                        encoded = row[0].encode("utf-8")
                        row_hmac.update(len(encoded).to_bytes(8, "big"))
                        row_hmac.update(encoded)
                    table_metrics[key] = {
                        "present": True,
                        "count": int(count),
                        "max_id": int(max_id) if max_id is not None else None,
                        "max_timestamp": _utc(max_timestamp).isoformat() if max_timestamp else None,
                        "row_hmac_sha256": row_hmac.hexdigest(),
                    }

                foreign_key_orphans: dict[str, int] = {}
                fk_rows = (await connection.execute(text("""
                    SELECT con.conname, ns.nspname, child.relname, pns.nspname, parent.relname,
                           array_agg(ca.attname ORDER BY key.ord), array_agg(pa.attname ORDER BY key.ord)
                    FROM pg_constraint con
                    JOIN pg_class child ON child.oid=con.conrelid
                    JOIN pg_namespace ns ON ns.oid=child.relnamespace
                    JOIN pg_class parent ON parent.oid=con.confrelid
                    JOIN pg_namespace pns ON pns.oid=parent.relnamespace
                    JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY key(cnum,pnum,ord) ON true
                    JOIN pg_attribute ca ON ca.attrelid=child.oid AND ca.attnum=key.cnum
                    JOIN pg_attribute pa ON pa.attrelid=parent.oid AND pa.attnum=key.pnum
                    WHERE con.contype='f' AND ns.nspname = ANY(:schemas)
                    GROUP BY con.conname, ns.nspname, child.relname, pns.nspname, parent.relname
                    ORDER BY 2,3,1
                """), {"schemas": list(AUDITED_SCHEMAS)})).all()
                for name, cs, ct, ps, pt, child_cols, parent_cols in fk_rows:
                    child_q = f"{preparer.quote(cs)}.{preparer.quote(ct)}"
                    parent_q = f"{preparer.quote(ps)}.{preparer.quote(pt)}"
                    join = " AND ".join(f"c.{preparer.quote(cc)} = p.{preparer.quote(pc)}" for cc, pc in zip(child_cols, parent_cols))
                    non_null = " AND ".join(f"c.{preparer.quote(cc)} IS NOT NULL" for cc in child_cols)
                    missing = f"p.{preparer.quote(parent_cols[0])} IS NULL"
                    count = await connection.scalar(text(f"SELECT COUNT(*) FROM {child_q} c LEFT JOIN {parent_q} p ON {join} WHERE {non_null} AND {missing}"))
                    foreign_key_orphans[f"{cs}.{ct}:{name}"] = int(count or 0)

                event_count = 0
                chain_errors = 0
                terminal: dict[str, str] = {}
                if table_metrics.get("job_ledger.job_events", {}).get("present"):
                    events = (await connection.execute(text("""
                        SELECT job_id, sequence_number, event_uuid, event_type, occurred_at,
                               actor_id, previous_status, new_status, reason, previous_hash, event_hash
                        FROM job_ledger.job_events ORDER BY job_id, sequence_number
                    """))).mappings().all()
                    previous: dict[int, str | None] = {}
                    sequences: dict[int, int] = {}
                    for event in events:
                        event_count += 1
                        job_id = int(event["job_id"])
                        expected_sequence = sequences.get(job_id, 0) + 1
                        if int(event["sequence_number"]) != expected_sequence or event["previous_hash"] != previous.get(job_id):
                            chain_errors += 1
                        material = {
                            "event_uuid": event["event_uuid"], "job_id": job_id,
                            "sequence_number": int(event["sequence_number"]),
                            "event_type": event["event_type"],
                            "occurred_at": _utc(event["occurred_at"]).isoformat(),
                            "actor_id": event["actor_id"],
                            "previous_status": event["previous_status"],
                            "new_status": event["new_status"],
                            "previous_hash": event["previous_hash"],
                        }
                        if event["event_type"] == "job_status_changed":
                            material["reason"] = event["reason"]
                        if _digest(material) != event["event_hash"]:
                            chain_errors += 1
                        sequences[job_id] = int(event["sequence_number"])
                        previous[job_id] = event["event_hash"]
                        terminal[str(job_id)] = event["event_hash"]

                await transaction.rollback()
                return DatabaseSnapshot(
                    captured_at_utc=captured_at,
                    endpoint_identity_digest=_hmac_digest(digest_key, {
                        "configured": _endpoint_identity(raw_url), "observed": server_identity,
                    }),
                    migration_head=migration_head,
                    recovery_complete=recovery_complete,
                    transaction_read_only=read_only,
                    schema_presence=schema_presence,
                    schema_fingerprint=schema_fingerprint,
                    trigger_fingerprint=trigger_fingerprint,
                    immutable_trigger_status=immutable_trigger_status,
                    sequence_state_digest=sequence_state_digest,
                    table_metrics=table_metrics,
                    foreign_key_orphans=foreign_key_orphans,
                    job_event_count=event_count,
                    job_event_terminal_digest=_digest(terminal),
                    job_event_chain_errors=chain_errors,
                )
            except Exception:
                await transaction.rollback()
                raise
    finally:
        await engine.dispose()


def _parse_utc(raw: str) -> datetime:
    value = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    if value.tzinfo is None:
        raise ValueError("timezone_required")
    return _utc(value)


def _write_exclusive(path: str, payload: dict[str, Any]) -> None:
    destination = Path(path).resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("x", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, sort_keys=True, indent=2, default=str)
        handle.write("\n")


def _authenticated_payload(payload: dict[str, Any], digest_key: bytes) -> dict[str, Any]:
    result = dict(payload)
    result["manifest_hmac"] = _hmac_digest(digest_key, {"domain": "restore-evidence", "payload": payload})
    return result


def _load_manifest(path: str, digest_key: bytes) -> dict[str, Any]:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    digest = payload.pop("manifest_hmac", None)
    expected = _hmac_digest(digest_key, {"domain": "restore-evidence", "payload": payload})
    if not digest or not hmac.compare_digest(digest, expected):
        raise RuntimeError("baseline_manifest_digest_mismatch")
    return payload


def _snapshot_from_dict(payload: dict[str, Any]) -> DatabaseSnapshot:
    return DatabaseSnapshot(**payload)


def _add_identity_arguments(parser: argparse.ArgumentParser, prefix: str) -> None:
    parser.add_argument(f"--{prefix}-project-id", required=True)
    parser.add_argument(f"--{prefix}-environment-id", required=True)
    parser.add_argument(f"--{prefix}-service-id", required=True)
    parser.add_argument(f"--{prefix}-volume-id", required=True)


async def _capture(args: argparse.Namespace) -> int:
    raw_url = os.environ.get("CLEANFIX_BASELINE_DATABASE_URL")
    if not raw_url:
        raise RuntimeError("baseline_database_url_required")
    digest_key = os.environ.get("CLEANFIX_RECOVERY_DIGEST_KEY", "").encode()
    if len(digest_key) < 32:
        raise RuntimeError("recovery_digest_key_too_short")
    if not math.isfinite(args.allowed_rpo_minutes) or not math.isfinite(args.allowed_rto_minutes) or args.allowed_rpo_minutes <= 0 or args.allowed_rto_minutes <= 0:
        raise RuntimeError("invalid_owner_approved_objectives")
    snapshot = await _snapshot(raw_url, digest_key)
    captured = _parse_utc(snapshot.captured_at_utc)
    target = captured
    if not snapshot.recovery_complete or not snapshot.transaction_read_only:
        raise RuntimeError("invalid_baseline_database_state")
    if snapshot.migration_head != args.expected_head:
        raise RuntimeError("baseline_migration_head_mismatch")
    identity = {
        "project_id": args.source_project_id,
        "environment_id": args.source_environment_id,
        "service_id": args.source_service_id,
        "volume_id": args.source_volume_id,
        "history_selector": args.history_selector,
        "backup_reference": args.backup_reference,
    }
    target_identity = {
        "project_id": args.target_project_id,
        "environment_id": args.target_environment_id,
        "service_id": args.target_service_id,
        "volume_id": args.target_volume_id,
    }
    if identity["environment_id"] == target_identity["environment_id"] or identity["service_id"] == target_identity["service_id"] or identity["volume_id"] == target_identity["volume_id"]:
        raise RuntimeError("source_and_target_must_be_disjoint")
    payload = {
        "schema_version": "cleanfix-restore-baseline/v1",
        "tool_version": TOOL_VERSION,
        "tool_commit": args.tool_commit,
        "approval_reference": args.approval_reference,
        "write_hold_reference": args.write_hold_reference,
        "operator": args.operator,
        "target_utc": target.isoformat(),
        "expected_head": args.expected_head,
        "allowed_rpo_minutes": args.allowed_rpo_minutes,
        "allowed_rto_minutes": args.allowed_rto_minutes,
        "source_identity": identity,
        "approved_target_identity": target_identity,
        "snapshot": asdict(snapshot),
        "contains_row_values": False,
        "contains_credentials": False,
    }
    authenticated = _authenticated_payload(payload, digest_key)
    _write_exclusive(args.output, authenticated)
    print(json.dumps({"passed": True, "mode": "capture_baseline", "output": Path(args.output).name, "manifest_hmac": authenticated["manifest_hmac"]}))
    return 0


async def _verify(args: argparse.Namespace) -> int:
    restore_url = os.environ.get("CLEANFIX_RESTORE_DATABASE_URL")
    if not restore_url:
        raise RuntimeError("restore_database_url_required")
    digest_key = os.environ.get("CLEANFIX_RECOVERY_DIGEST_KEY", "").encode()
    if len(digest_key) < 32:
        raise RuntimeError("recovery_digest_key_too_short")
    baseline_manifest = _load_manifest(args.baseline_manifest, digest_key)
    if baseline_manifest.get("schema_version") != "cleanfix-restore-baseline/v1":
        raise RuntimeError("unsupported_baseline_manifest")
    source = baseline_manifest["source_identity"]
    target_identity = {
        "project_id": args.target_project_id,
        "environment_id": args.target_environment_id,
        "service_id": args.target_service_id,
        "volume_id": args.target_volume_id,
    }
    if args.confirm_isolated != "I-CONFIRM-ISOLATED-RESTORE":
        raise RuntimeError("isolated_confirmation_required")
    if source["environment_id"] == target_identity["environment_id"] or source["service_id"] == target_identity["service_id"] or source["volume_id"] == target_identity["volume_id"]:
        raise RuntimeError("source_and_target_must_be_disjoint")
    if target_identity != baseline_manifest["approved_target_identity"]:
        raise RuntimeError("target_identity_differs_from_approved_manifest")
    baseline = _snapshot_from_dict(baseline_manifest["snapshot"])
    restored = await _snapshot(restore_url, digest_key)
    if baseline.endpoint_identity_digest == restored.endpoint_identity_digest:
        raise RuntimeError("baseline_and_restore_endpoint_match")
    restore_started = _parse_utc(args.restore_started_utc)
    restore_ready = _parse_utc(args.restore_ready_utc)
    recovered_through = _parse_utc(args.recovered_through_utc)
    target = _parse_utc(baseline_manifest["target_utc"])
    now = datetime.now(timezone.utc)
    if not (target <= restore_started <= restore_ready <= now + timedelta(minutes=5)):
        raise RuntimeError("invalid_restore_operation_timestamps")
    if recovered_through > target or recovered_through > restore_ready or recovered_through > now:
        raise RuntimeError("recovered_through_cannot_follow_target_or_restore")
    actual_rto = (restore_ready - restore_started).total_seconds() / 60
    actual_rpo = (target - recovered_through).total_seconds() / 60
    errors = compare_snapshots(
        baseline, restored, expected_head=baseline_manifest["expected_head"], target_utc=target,
        actual_rpo_minutes=actual_rpo, allowed_rpo_minutes=float(baseline_manifest["allowed_rpo_minutes"]),
        actual_rto_minutes=actual_rto, allowed_rto_minutes=float(baseline_manifest["allowed_rto_minutes"]),
    )
    report = _authenticated_payload({
        "schema_version": "cleanfix-restore-verification/v1",
        "tool_version": TOOL_VERSION,
        "tool_commit": args.tool_commit,
        "mode": "read_only_restore_parity",
        "passed": not errors,
        "errors": errors,
        "approval_reference": baseline_manifest["approval_reference"],
        "verifier": args.verifier,
        "restore_operation_id": args.restore_operation_id,
        "source_identity_digest": _hmac_digest(digest_key, source),
        "target_identity_digest": _hmac_digest(digest_key, target_identity),
        "target_utc": target.isoformat(),
        "restore_started_utc": restore_started.isoformat(),
        "restore_ready_utc": restore_ready.isoformat(),
        "recovered_through_utc": recovered_through.isoformat(),
        "actual_rpo_minutes": actual_rpo,
        "actual_rto_minutes": actual_rto,
        "allowed_rpo_minutes": baseline_manifest["allowed_rpo_minutes"],
        "allowed_rto_minutes": baseline_manifest["allowed_rto_minutes"],
        "baseline_manifest_digest": _digest(baseline_manifest),
        "restored": asdict(restored),
        "credentials_printed": False,
        "row_values_printed": False,
        "mutation_attempted": False,
    }, digest_key)
    _write_exclusive(args.output, report)
    print(json.dumps({"passed": not errors, "mode": "verify_restore", "output": Path(args.output).name, "report_hmac": report["manifest_hmac"]}))
    return 0 if not errors else 1


async def _main() -> int:
    parser = argparse.ArgumentParser(description="Fail-closed PostgreSQL restore parity evidence")
    subparsers = parser.add_subparsers(dest="command", required=True)
    capture = subparsers.add_parser("capture-baseline")
    capture.add_argument("--output", required=True)
    capture.add_argument("--expected-head", required=True)
    capture.add_argument("--history-selector", required=True)
    capture.add_argument("--backup-reference", required=True)
    capture.add_argument("--allowed-rpo-minutes", required=True, type=float)
    capture.add_argument("--allowed-rto-minutes", required=True, type=float)
    capture.add_argument("--approval-reference", required=True)
    capture.add_argument("--write-hold-reference", required=True)
    capture.add_argument("--operator", required=True)
    capture.add_argument("--tool-commit", required=True)
    _add_identity_arguments(capture, "source")
    _add_identity_arguments(capture, "target")
    verify = subparsers.add_parser("verify-restore")
    verify.add_argument("--baseline-manifest", required=True)
    verify.add_argument("--output", required=True)
    verify.add_argument("--restore-operation-id", required=True)
    verify.add_argument("--restore-started-utc", required=True)
    verify.add_argument("--restore-ready-utc", required=True)
    verify.add_argument("--recovered-through-utc", required=True)
    verify.add_argument("--verifier", required=True)
    verify.add_argument("--tool-commit", required=True)
    verify.add_argument("--confirm-isolated", required=True)
    _add_identity_arguments(verify, "target")
    args = parser.parse_args()
    return await (_capture(args) if args.command == "capture-baseline" else _verify(args))


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(_main()))
    except Exception:
        print(json.dumps({"passed": False, "error": "restore_verification_failed"}))
        raise SystemExit(2)
