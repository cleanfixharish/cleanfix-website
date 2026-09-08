# Permanent Job Registry

Status: implementation baseline approved by the owner on 2026-09-08.

## Decision

CleanFixHarish will keep one authoritative transactional database. The permanent Job Registry lives in a dedicated, append-only `job_ledger` schema inside the existing Railway PostgreSQL HA cluster.

A second physical database is intentionally deferred. It would add cost, another secret and connection pool, synchronization failure modes, and more complex restores. Reconsider physical separation only if regulation, independent retention, a separate operating team, scaling, or blast-radius requirements justify it.

## Record model

- `jobs` remains the editable operational projection while work is active.
- `job_ledger.job_events` records every material action with actor, time, reason, state change, idempotency key, and integrity hash.
- `job_ledger.completed_jobs` stores immutable, non-PII completion snapshots. A reopened and recompleted job receives another completion sequence; the earlier record remains.
- `job_ledger.completed_job_amendments` records owner-approved corrections without rewriting the original completion.
- `job_ledger.financial_entries` records collections, refunds, provider liabilities/payments, direct costs, fees, rework, and acquisition costs. Errors use reversing entries rather than update or deletion.
- Private evidence stays in private object storage. The ledger stores only controlled object references, metadata, and cryptographic hashes.
- Customer identity, phone, email, exact address, and access instructions will move to a separately permissioned, erasable private-data boundary. "Permanent" does not mean retaining raw PII forever.

## Non-negotiable behavior

- Ledger rows are append-only; database triggers reject `UPDATE` and `DELETE`.
- No application or public hard-delete operation may remove completed history.
- Status changes use backend-controlled transitions, row version checks, and idempotency keys in one transaction with the matching event.
- Only the primary owner may finalize, reopen, amend, export, approve completion, or approve financial changes.
- Provider completion submission does not complete a job. Completion requires owner quality approval, required evidence, recorded customer outcome, and no unresolved safety, damage, rework, refund, or customer issue.
- Viewer, customer, and provider responses are separately shaped. They never expose internal payout, margin, unrelated jobs, private notes, or unnecessary customer data.
- The registry never depends on an AI model. Optional AI summaries are advisory, budgeted, attributable, and cannot approve or mutate material state.

## Delivery phases

1. Create the additive ledger schema, immutable tables, constraints, indexes, and database mutation guards.
2. Add canonical state-transition and event-writing services with concurrency and idempotency tests.
3. Add private PII/evidence boundaries and role/object-level access tests.
4. Add completion, amendment, payment/refund, and provider-payout commands.
5. Build the owner Job Command Center and read-only Completed Job Records screens.
6. Backfill existing jobs as `legacy_imported` without inventing missing facts; incomplete history remains visibly incomplete.
7. Disable arbitrary status writes and replace hard deletion with owner-recorded cancellation or void events.
8. Run isolated staging migration, transaction, authorization, privacy, concurrency, immutability, backup, and restore tests before production.
9. Add the first-20-paid-jobs report using collected money and recorded costs, never accepted quotes labeled as revenue or profit.

## Launch gates

- Duplicate idempotency keys create one result.
- Concurrent transitions produce one winner and one conflict.
- Invalid transitions fail without partial events or projection changes.
- Direct ledger `UPDATE` and `DELETE` fail at the database boundary.
- Completion fails without evidence and owner quality approval, or while a quality case is open.
- Corrections and reversals preserve their originals.
- Automated scans find no raw PII, credentials, access tokens, or public evidence URLs in ledger payloads.
- Backup restore into isolated staging matches ledger counts, maximum event IDs, hashes, and sampled timelines within the documented RPO/RTO.
- No runtime startup path creates or repairs ledger tables outside Alembic.

Retention periods for financial records, private media, privacy erasure, and legal holds remain configurable and require Israeli accountant, privacy, and legal approval before the first paid job.
