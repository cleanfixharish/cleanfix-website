# Fulfillment Security Contract

Status: implementation contract for the first supervised paid job.
Scope: private job evidence, quality/rework, external-money records, guarded completion, and recovery.

## Release boundary

The existing quote-to-booking flow is the last currently enabled customer commitment. Quote acceptance creates a booking request; it does not collect money, confirm a schedule, assign a provider, or complete a job.

Every new fulfillment capability ships behind a server-side, environment-specific flag that defaults to `false`. Hiding a control in the browser is not a security boundary.

| Flag | First safe use | Must remain `false` until |
|---|---|---|
| `JOB_EVIDENCE_OWNER_ENABLED` | Owner-only staging/pilot upload | Quarantine, content verification, EXIF removal, short-lived object authorization, and owner object-access tests pass. |
| `JOB_EVIDENCE_PROVIDER_ENABLED` | Assigned provider upload | Authoritative assignment exists and cross-provider/job authorization and revocation tests pass. |
| `JOB_EVIDENCE_CUSTOMER_ENABLED` | Customer upload/view | Customer-to-job ownership, consent notice, and cross-customer tests pass. |
| `QUALITY_WORKFLOW_ENABLED` | Completion submission and owner review | Required-checklist, open-case, rework, concurrency, and audit tests pass. |
| `EXTERNAL_MONEY_RECORDS_ENABLED` | Owner records verified external facts | Idempotency, reversal, role, amount-source, and reconciliation tests pass. This flag never authorizes processor calls. |
| `JOB_FINAL_COMPLETION_ENABLED` | Owner finalizes quality-approved work | Evidence, quality, transaction atomicity, hash, and concurrency gates pass. |
| `JOB_FINANCIAL_CLOSE_ENABLED` | Owner closes a reconciled job | Customer collections/refunds and provider payable/payout are reconciled with no open exception. |
| `PAYMENTS_ENABLED` | Processor sandbox, then narrow production rollout | Accountant-approved mapping, server-derived payment orders, signed webhook verification, adversarial tests, reconciliation, and kill switch pass. |
| `REFUNDS_ENABLED` | Processor sandbox only initially | Refund-maximum concurrency, approval, idempotency, reversal, and customer-notice tests pass. |
| `PROVIDER_PAYOUTS_ENABLED` | Processor sandbox only initially | Provider eligibility, compensation snapshot, bank-change hold, approval, idempotency, and reconciliation pass. |
| `AI_JOB_DATA_ENABLED` | Advisory summaries only | Purpose/model allowlist, PII redaction, vendor review, prompt-injection controls, budget, audit, and no-mutation proof pass. |

The first pilot keeps provider/customer evidence, processor payments, refunds, payouts, AI job data, automatic assignment, automatic completion/close, and all advertising/publication automation disabled. Until owner-only evidence and external-money slices pass, use an approved private external evidence channel and accountant-approved external payment records.

## Data boundaries

Use the existing PostgreSQL HA database, with separate schemas and least-privilege roles.

### Private evidence

`job_private.evidence_objects` is an erasable private metadata projection:

- opaque `evidence_uuid`, `job_id`, optional completion-submission link;
- evidence kind (`before`, `after`, `completion`, `issue`, `rework`, `customer_authorization`);
- server-selected bucket and opaque object key;
- declared and detected MIME type, byte size, expected and verified SHA-256;
- uploader type/ID, captured/uploaded/verified times;
- scan and availability states, retention class, erase time, legal-hold/deletion state;
- optimistic version.

`job_ledger.evidence_events` is append-only and records initiation, upload, verification, quarantine/rejection, acceptance, authorized access, legal hold, and erasure. It stores object UUIDs and hashes, never raw PII, original filenames, signed URLs, addresses, or credentials.

Uploads use this sequence:

1. Re-authorize the actor and exact job.
2. Generate the bucket and key server-side.
3. Issue a 5–10 minute upload authorization constrained by size, MIME and checksum.
4. Receive into quarantine.
5. Verify file signature, decodeability, size/pixel/count limits and checksum; malware-scan and strip EXIF/location metadata.
6. Promote only clean content to a private bucket.
7. Re-authorize every download and issue a 30–60 second `no-store` URL.

Owner may access evidence for an active operational, quality, privacy, dispute, or legal purpose. A provider may upload only for a currently active assignment and may not choose job/bucket/key or see customer-only intake evidence. A customer may access only their own explicitly customer-visible evidence. Viewers, referral partners and unrelated providers receive no object or metadata access. Erasure removes the object and appends a hash tombstone; it does not rewrite history.

### Completion and quality

`job_ledger.completion_submissions` is append-only, with one sequence per attempt, actor, checklist schema/version and non-PII result, scope summary, submission time, event link, hash, and idempotency key.

`job_operations.quality_cases` is a versioned operational projection for customer issues, quality failures, damage, safety, scope change, rework, and disputes. `job_ledger.quality_events` and `job_ledger.quality_reviews` preserve every opening, decision, waiver, rework request, resolution, and reopening. Providers can submit work but cannot review, waive, approve, complete, financially close, refund, or approve their own payout.

### External money and payout

Use a separate `job_finance` schema:

- `payment_orders` derives job, booking, accepted quote/version, purpose, amount and currency on the server;
- append-only `payment_events` records verified external/processor state with a unique source event ID;
- `refund_orders` and `refund_events` preserve reason, approval, maximum and reversals;
- immutable `provider_compensation_snapshots` preserve agreed gross compensation and scope version;
- `provider_payables`, `payout_orders` and append-only `payout_events` keep eligibility, approval, submission, paid/failed/reversed/held states;
- payout-account data is a processor token/reference plus masked display, never raw bank credentials.

The existing `job_ledger.financial_entries` is an operational append-only foundation, not yet a complete accounting ledger. Quotes, payment orders, captured money, refunds, provider payable, provider paid, fees, acquisition cost, direct cost and rework cost remain distinct. Corrections use reversals. The approved external accounting/processor record remains authoritative until balanced journal/reconciliation support is released.

## Command and audit rules

- All material writes use named backend commands, not generic CRUD.
- Each command requires actor, role/capability, request ID, expected aggregate version, idempotency key, reason where material, and a canonical command hash.
- Same key and same command returns the original result; same key with a different command returns conflict.
- Lock the job/payment/payout aggregate before deriving sequence or limits.
- Projection update and append-only event commit in one short transaction.
- Direct ledger `UPDATE` and `DELETE` are denied by database privileges and mutation triggers. The application role does not own ledger tables and has no `BYPASSRLS`.
- Events hash all security-relevant canonical fields, including actor, role, source, request, type, sequence, statuses, reason, visibility, payload hash, times and previous hash.
- Never include PII, secrets, tokens, signed URLs or raw financial credentials in events, logs, analytics, errors, AI prompts, tickets or CI output.

## Completion invariants

`complete_job` succeeds only when, inside one row-locked transaction:

1. The expected job version matches and the job is `quality_approved`.
2. An accepted quote and authoritative booking exist.
3. The latest immutable completion submission exists.
4. An owner quality approval references that exact submission.
5. Every service-required evidence object is clean, available, checksum-verified and linked.
6. No open safety, damage, dispute, refund-review, customer-issue or rework case exists.
7. The completion sequence and prior event hash are derived under lock.
8. Snapshot fields and financial facts are derived server-side; the client cannot supply amounts, authoritative times, evidence URLs or hashes.
9. `completed_jobs`, the `job_completed` event and the mutable job projection are written atomically.

`completed` means the work passed quality review. It does not imply all money is reconciled. `close_job` is separate and requires reconciled customer collections/refunds, resolved provider payable/payout or an explicit hold, required accounting-document references, and no open financial/dispute exception. Reopening or correcting appends a new cycle/amendment and never rewrites the original.

## Required test matrix

### Authorization and evidence

- Customer/provider cannot authorize upload or download for another job.
- Revoked, paused, unassigned or post-closure provider access stops on the next request.
- Client-selected bucket/key is rejected or ignored.
- Wrong-signature, oversized, corrupt, polyglot, executable, malware-positive, checksum-mismatched and EXIF-bearing inputs cannot become available.
- Signed URLs expire; erased evidence cannot download; immutable tombstone remains.

### Quality and completion

- Missing checklist/evidence blocks submission.
- Provider cannot approve quality or waive a case.
- Open issue/rework/safety/dispute blocks completion.
- Rework creates a new submission sequence and preserves the original.
- Concurrent review/finalization produces one winner and one version conflict.
- Failure at every transaction boundary leaves no partial projection, event or completion record.
- Direct status update cannot reach `completed` or `closed`.
- Final values are recomputed from authoritative records.

### Money

- Browser-supplied amount/currency is ignored or rejected.
- Duplicate command or source event cannot duplicate money.
- Forged, stale, duplicate, out-of-order, wrong-account, wrong-job, wrong-amount or wrong-currency event cannot mark paid.
- Concurrent refunds cannot exceed captured less successful/pending refunds.
- Payout cannot exceed approved payable and cannot pass an eligibility/bank-change hold.
- Customer never receives provider payout/margin; provider never receives customer price/margin.
- Reversals preserve originals and reconciliation identifies every exception.

### Database and recovery

- PostgreSQL tests use production-equivalent roles and prove RLS/grant boundaries and append-only rejection.
- Automated scans find no raw PII/token/signed URL in ledger payloads or logs.
- An isolated restore matches migration head, aggregate counts, maximum IDs/times, FK integrity and event hashes within the accepted RPO/RTO.

## Smallest safe releases

1. Complete a read-only preflight and isolated restore drill of the current baseline.
2. Add evidence schemas, permissions, events and disabled flags without endpoints.
3. Enable owner-only quarantined evidence in staging, then one supervised pilot.
4. Add immutable completion submissions, quality cases/reviews and rework; keep final completion disabled.
5. Add owner-only verified external-money records and reversals; make no processor calls.
6. Enable guarded `complete_job`; keep financial close disabled.
7. Add provider evidence only after authoritative assignment and cross-provider tests.
8. Add processor payments/refunds/payouts last, after sandbox, professional decisions, adversarial tests, reconciliation and kill switches.
