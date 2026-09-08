# Production recovery runbook

Last verified: 2026-09-08 (Asia/Jerusalem)

## Scope and safety

This runbook covers the CleanFixHarish web application and its PostgreSQL data on Railway. It does not authorize advertising, content publication, payments, data deletion, or database restoration. Those actions remain owner-controlled.

Never print environment variables, database URLs, access tokens, or customer records into a terminal log, issue, or chat. Prefer read-only diagnosis first. Database restoration and production cutover require an exact backup, target time, reason, and owner confirmation.

## Verified production baseline

- Canonical URL: `https://cleanfixharish.co.il`
- Railway environment: `production`
- Web service ID: `b0b6b3d7-3486-48a7-9f9d-e8168efc755e`
- Active verified deployment: `f6589e19-dc32-4315-af95-1ae97caad14c`
- Application commit: `f02f3172e1d10c746021553efe88babc241a412d`
- Known-good application tag: `production-good-20260908-1508`
- Production migration head: `e8a6b42c1d70`
- Required deployment gate: `python -m alembic upgrade head`
- Required readiness path: `/health/ready`
- Active database route: PostgreSQL HA through the `Postgres HA` endpoint
- HA backup policy: daily, weekly, and monthly schedules on all three PostgreSQL members
- Latest verified daily snapshots: 2026-09-07 on all three members

## Permanent Job Registry evidence

The additive Job Registry foundation was released on 2026-09-08 (Asia/Jerusalem):

- Pull request `24` passed backend, frontend, and container CI.
- Isolated staging deployment `1f28bdef-e29f-4d47-b1a6-507363b6f6c4` completed successfully before production promotion.
- Staging migration verification found all four `job_ledger` tables at Alembic head `c7d9e2f41a60`.
- Rollback-only staging probes proved PostgreSQL rejects both direct `UPDATE` and direct `DELETE` against ledger events; the transaction left zero test rows.
- Production deployment `504f306e-a1b4-4761-a5b1-5cf578f2331f` completed successfully.
- Production passed all 20 live route, readiness, security-header, anonymous-access, and public-config checks.
- Read-only production verification found all four ledger tables, active immutable-mutation trigger events, and zero initial ledger rows.

Phase 1 is the additive persistence foundation. Release `f02f317` added the first controlled-command slice: owner-only job creation and transitions write append-only events atomically; generic status updates are rejected; hard deletion returns HTTP 405; cancellation/reopening and reviewed completion stages require reasons; the owner can read the permanent event timeline. Final completion remains deliberately locked until the immutable evidence, quality, and financial-close command is released. Private evidence/PII boundaries and the full Completed Job Records interface remain gated follow-up work.

## Controlled jobs and learning release evidence

Release `f02f317` was promoted on 2026-09-08 after:

- pull request `26` and post-merge `main` CI passed backend, frontend, and container jobs;
- 103 backend tests, frontend type-check/lint/build, and isolated migration upgrade/downgrade checks passed locally;
- isolated staging deployment `db7763e0-29f0-40f8-aed5-e00147cf4f4f` completed successfully;
- a staging-only synthetic job proved create/start/cancel events, direct-completion rejection, permanent timeline order, and HTTP 405 hard-delete rejection;
- staging and production each passed all 20 live route, readiness, security-header, anonymous-access, discovery, and public-config checks;
- production deployment `f6589e19-dc32-4315-af95-1ae97caad14c` migrated PostgreSQL to `e8a6b42c1d70` and passed `/health/ready`;
- the known-good rollback tag `production-good-20260908-1508` was pushed after verification.

The same release made business-relationship decisions primary-owner-only, requires a reason, stores an immutable decision audit event, and removes internal approver identity from the business self-service response. It also introduced bilingual role tours and the Manager OS Learning Center. Advertising and automatic publication remain disabled.

## Production acceptance evidence

The supervised web-production intake gate passed on 2026-09-08 (Asia/Jerusalem):

- The owner submitted a clearly identified acceptance lead through the live `/quote` flow.
- The HA production database stored exactly one matching record as lead `34`.
- Required phone, area, requested service, and description fields were present.
- The server assigned `source=website` and `status=new`; the public form did not override protected CRM state.
- A short-lived owner-scoped audit token retrieved lead `34` through the protected admin API with HTTP 200.
- Verification output omitted contact values, notes, and other customer data.
- No record was changed, contacted, or assigned during verification.

This proves the production path from public quote submission through database persistence to authenticated admin visibility. After verification, the owner explicitly requested cleanup of acceptance-test lead `34`. The protected admin API deleted that exact revalidated record and a follow-up GET returned HTTP 404. The evidence above retains no contact values or customer content.

## Isolated staging acceptance evidence

The isolated staging environment was refreshed to accepted repository commit `480c0e8ccb0804c0b8d36f6e17fb08ed6d458067` on 2026-09-08 (Asia/Jerusalem):

- Railway deployment `8b67c0d6-9a97-4309-8bf2-02784999729e` completed with status `SUCCESS`.
- The first deployment attempt safely stopped before release because staging referenced abandoned revision `a1f3c8d74e20` from an older private-backup branch.
- Read-only inspection proved the three tables owned by that abandoned migration contained zero rows.
- The exact historical downgrade removed only those empty staging-only tables and returned the database to shared revision `d4e7a1b93c20`.
- The canonical pre-deploy migration gate then advanced staging to head `b9e7d3c1a502`.
- Schema verification found all three canonical growth tables and all three lead attribution columns, with zero abandoned financial tables remaining.
- `/health`, `/health/ready`, and the home page returned HTTP 200.
- The expanded reusable application audit passed all 20 route, readiness, security-header, anonymous-access and public-config checks with zero failures.
- A short-lived staging-only owner token completed the authenticated lead-to-job workflow: synthetic lead creation, owner update, refresh persistence, linked job creation and update.
- The synthetic job and lead were deleted immediately after verification; the lead follow-up read returned HTTP 404.

This repair affected only `staging-isolated`; production application and database services were not changed.

## First five minutes

Run these read-only checks from a clean repository checkout:

```powershell
node scripts/daily-seo-audit.mjs

railway service list `
  --project 3f6760b5-4e65-404d-9918-ba7559fe2a0d `
  --environment fe66a5db-af15-446a-8adb-3010f4e7b52d `
  --json

railway logs `
  --project 3f6760b5-4e65-404d-9918-ba7559fe2a0d `
  --environment fe66a5db-af15-446a-8adb-3010f4e7b52d `
  --service b0b6b3d7-3486-48a7-9f9d-e8168efc755e `
  --since 30m `
  --lines 100 `
  --filter "@level:error"
```

Classify the incident before changing anything:

- **SEV-1:** customer data exposure, destructive data change, site-wide outage, or unauthorized financial/publication action. Stop automation and escalate to the owner immediately.
- **SEV-2:** quote intake, login, admin, or database readiness is unavailable. Preserve logs and prepare an application rollback.
- **SEV-3:** a non-critical page, SEO check, or cosmetic function fails. Fix through the normal pull-request path.

## Application rollback

Use this when the application is unhealthy but the database is healthy. The known-good application migration adds nullable attribution columns and is compatible with the preceding application release.

1. Create an isolated worktree at the verified tag. Do not alter the owner's working directory.

   ```powershell
   git fetch origin --tags
   git worktree add "C:\Temp\CleanFixHarish-Rollback" production-good-20260908-1052
   ```

2. Verify the exact revision and build before deploying.

   ```powershell
   git -C "C:\Temp\CleanFixHarish-Rollback" rev-parse HEAD
   docker build --tag cleanfixharish:rollback-check "C:\Temp\CleanFixHarish-Rollback"
   ```

   The revision must be `89c8717e26fbbc5c617664ce86788522d163002a`. Stop if it differs or the build fails.

3. Deploy that exact worktree. This is a production mutation and requires the incident owner to confirm the target and reason.

   ```powershell
   railway up "C:\Temp\CleanFixHarish-Rollback" `
     --project 3f6760b5-4e65-404d-9918-ba7559fe2a0d `
     --environment fe66a5db-af15-446a-8adb-3010f4e7b52d `
     --service b0b6b3d7-3486-48a7-9f9d-e8168efc755e `
     --detach `
     --json `
     --message "Incident rollback to production-good-20260908-1052"
   ```

4. Poll deployment state and inspect deployment logs. Do not treat upload completion as release success.

   ```powershell
   railway deployment list `
     --project 3f6760b5-4e65-404d-9918-ba7559fe2a0d `
     --environment fe66a5db-af15-446a-8adb-3010f4e7b52d `
     --service b0b6b3d7-3486-48a7-9f9d-e8168efc755e `
     --limit 5 `
     --json
   ```

5. Require `SUCCESS`, then rerun `node scripts/daily-seo-audit.mjs`. Record the deployment ID, commit, incident reason, start time, recovery time, and verifier.

If a future release contains a destructive or backward-incompatible migration, do not use application-only rollback. Follow the migration-specific recovery plan instead.

## Database recovery

Current evidence confirms healthy HA database services, ready persistent volumes, and successful scheduled snapshots. Run the reusable read-only audit from an authenticated Railway CLI session:

```powershell
./scripts/audit_railway_backups.ps1
```

The audit requires daily, weekly, and monthly schedules on every PostgreSQL HA member and a latest snapshot no more than 30 hours old. It prints schedule and timestamp evidence only; it does not print credentials or customer data.

Required production policy:

- Confirm which PostgreSQL service the web application's database reference targets without printing its connection string; apply backup settings only to that database topology.
- Preserve the verified daily, weekly, and monthly volume-backup schedules on all HA members.
- Record retention, incremental storage cost, backup owner, and any schedule change.
- Prefer restoring into a new service or staged volume so the source remains untouched.
- Validate schema, row counts, quote intake, admin access, and the application health checks before cutover.
- Never run a restore directly against production merely to test it.

Railway CLI `5.30.1` exposes backup schedule and snapshot data through `railway api`, even though it does not expose the documented `railway postgres pitr` command. Use the audit script for verification. Schedule changes, new backup storage, PITR activation, and restores may incur charges or mutate production and therefore require owner approval.

## Recovery drill evidence

A recovery gate passes only when all of the following are recorded without secrets or customer data:

- backup identifier and creation time;
- isolated restore target;
- restore start and completion times;
- migration revision at the restored target;
- aggregate table-count comparison;
- successful `/health` and `/health/ready` results;
- successful supervised quote-to-admin test using clearly marked test data;
- cleanup decision for the isolated restore target;
- owner acceptance of measured recovery time and recovery point.

## After recovery

Keep advertising and automatic publication disabled. Preserve relevant logs, write a short timeline, identify the triggering change, add a regression check, and use a reviewed pull request for the permanent fix. Never delete the failed deployment or original database volume while the incident is under review.
