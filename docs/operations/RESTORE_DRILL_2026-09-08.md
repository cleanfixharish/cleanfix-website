# Isolated PostgreSQL restore drill — 2026-09-08

## Decision

**FAIL — recovery fidelity is not yet proven. Paid dispatch remains disabled.**

Railway successfully created isolated PostgreSQL services and replayed their configured archive history without changing the live HA source. Both restored databases became available, but neither reached the requested recovery point. They stopped at Alembic revision `d4e7a1b93c20`, while production was read-only verified at `a9d4e1f72b60` during the drill. The restored copies therefore lacked the later `job_ledger` schema and `bookings` table.

This is a backup-history or recovery-selection problem, not evidence that production is unhealthy. Production remained online and unchanged throughout the drill.

## Source and safety controls

- Railway project: `3f6760b5-4e65-404d-9918-ba7559fe2a0d`
- Source: production PostgreSQL HA member volume `e0cb7a3a-e223-4deb-b232-6c24131c3743`
- Source application and database were queried read-only only.
- Restores created new standalone database services; no restore targeted a production volume.
- Restored services had no public application domain or application integrations.
- Temporary database TCP proxies existed only for verification and were deleted afterwards.
- No credentials, customer fields, or row contents were recorded in this evidence.
- Both temporary restore services were deleted after verification to stop unnecessary cost and avoid leaving a production-data copy online.

## Attempt 1 — scheduled-backup timestamp

- Requested recovery point: `2026-09-07T16:11:03.787Z`
- Temporary service: `restore-drill-20260908`
- Temporary service ID: `668675a5-62be-4bf0-bf15-9d34e4a01c91`
- Railway restore workflow: completed without a platform error.
- PostgreSQL: reached `ready to accept connections`.
- Restored migration: `d4e7a1b93c20`
- Aggregate verification: one lead, zero quotes, zero jobs; no `job_ledger` schema; no `bookings` table.
- Cleanup: temporary proxy and service deleted.

## Attempt 2 — current production point

- Requested recovery point: `2026-09-08T15:45:00Z`
- Preflight estimate: base data 32 MB, WAL 5,616 MB, estimated scratch 5,648 MB, within the plan limit.
- Temporary service: `restore-drill-current-20260908`
- Temporary service ID: `83ea53d8-7f04-4131-af3b-9faf16739301`
- Railway restore workflow: completed without a platform error.
- PostgreSQL: completed recovery (`pg_is_in_recovery() = false`).
- Restored migration: `d4e7a1b93c20`.
- Expected migration from production read-only verification: `a9d4e1f72b60`.
- Verification stopped when `public.bookings` was absent. No restored data was mutated.
- Cleanup: temporary proxy and service deleted.

## Production comparison at drill time

The live HA endpoint returned:

- migration `a9d4e1f72b60`;
- one lead;
- zero quotes, bookings, jobs, job events, completed-job records, and financial entries.

Only aggregate counts were printed. The live application and database remained healthy.

## Required corrective action

Tracking issue: `#31` — Production recovery gate: PITR restore stops at stale migration.

1. Escalate the mismatch to Railway with the source volume, requested timestamps, workflow identifiers, and the restored-vs-production migration revisions. Do not include credentials or customer data.
2. Confirm which pgBackRest archive history/sub-prefix contains the current HA timeline. The restore API exposed a `sourceRepoPath` selector but the correct current-history identifier was not available from the CLI queries used in this drill.
3. Repeat into a new isolated service using the confirmed current history.
4. Require the restored migration, aggregate counts, foreign-key checks, append-only triggers, and job-event chains to match the accepted recovery point.
5. Keep `FULFILLMENT_ENABLED=false` and all payment, payout, evidence, completion, advertising, and automatic-publication features disabled until the repeated drill passes.

## Acceptance status

- Source availability: **PASS**
- Scheduled backup presence: **PASS**
- Isolated restore mechanics: **PASS**
- Restored database availability: **PASS**
- Recovery-point fidelity: **FAIL**
- Current schema/ledger recoverability: **FAIL / not proven**
- Cleanup and cost containment: **PASS**
- Overall recovery gate: **FAIL**
