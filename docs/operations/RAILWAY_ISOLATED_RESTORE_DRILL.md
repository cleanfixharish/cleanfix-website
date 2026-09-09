# Railway Isolated PostgreSQL Restore Drill

This procedure proves recoverability without changing production. It does not authorize a restore, new paid resource, production cutover, or deletion. Creating the isolated target may incur cost and requires the owner's explicit approval of target, backup, reason and expected lifetime.

## Safety rules

- Never restore over a production service or volume.
- Never print or persist connection URLs, environment variables, tokens, customer rows or object URLs in terminal, CI, issues or chat.
- Use the existing `staging-isolated` environment only after confirming its IDs are different from production and deciding whether its current data may be replaced. Prefer a new disposable restore environment when there is any doubt.
- Do not copy production outbound secrets. The restore target must have messaging, AI, payments, refunds, payouts, publishing, scheduled jobs and production object-store writes disabled.
- Do not attach a production custom domain. Restrict access to the drill operators.
- Treat the restored copy as production-confidential data, including during cleanup.

## Phase A: read-only preflight

From a clean canonical checkout:

```powershell
./scripts/audit_restore_preflight.ps1
```

The preflight only checks Railway CLI authentication, exact project/environment separation, staging service health metadata, and the existing HA backup audit. It does not read variables, connect to a database, create a resource, or restore anything.

Record without secrets:

- project ID;
- production and intended isolated environment IDs/names;
- selected backup name/ID and UTC creation time;
- backup age and schedule classes;
- expected migration head, RPO and RTO;
- drill owner and verifier;
- intended isolated target and cleanup decision.

Stop if the environment IDs match, backup audit fails, target identity is ambiguous, outbound integrations cannot be disabled, or the target contains data that has not been approved for replacement.

## Phase B: owner-approved isolated target

1. Select the exact completed HA snapshot. Do not use an in-progress or stale snapshot.
2. Create a new Railway environment/database/volume or explicitly approve the existing isolated target. Never mutate the source backup or production volume.
3. Configure only the minimum application/database secrets required for the drill.
4. Set all fulfillment, payments, refunds, payouts, AI job-data, growth/publication and outbound-notification flags to `false`.
5. Confirm the target has no production custom domain and no production outbound credentials.
6. Restore using the Railway-supported backup restore action into the isolated target. Record operation and target identifiers, not credentials.

Because Railway CLI capabilities can change, do not invent a restore command. Use the current Railway UI/API operation documented for the selected backup, inspect the resolved source and destination immediately before confirmation, and retain its operation/deployment ID.

## Phase C: verification

Use an ephemeral credential passed through process environment without echoing it. Prefer aggregate/checksum queries whose output contains no customer data.

Verify:

1. Database accepts read-only connection and reports expected PostgreSQL version.
2. `alembic_version` matches the expected deployed head.
3. Required public, `job_ledger`, `job_private` and `job_finance` schemas/tables match the release stage.
4. Aggregate row counts and maximum IDs/timestamps are consistent with the selected backup time.
5. Foreign-key orphan queries return zero.
6. Job, quote, evidence, quality and financial event hashes/chains verify.
7. Evidence metadata manifests exist without attempting public object access.
8. Application starts with integrations disabled; `/health` and `/health/ready` return 200.
9. Production-equivalent application role cannot directly update/delete append-only rows.
10. A staging-only synthetic workflow can be run and rolled back or retained with a clear synthetic marker according to the registry policy.

Do not display sampled PII. For timeline verification, report only opaque IDs, event types, sequence counts and hash pass/fail.

## Phase D: acceptance and cleanup

Capture:

- backup time and restore start/end;
- measured RPO and RTO;
- target environment/service/volume IDs;
- migration head;
- aggregate/hash/FK/readiness results;
- verifier and any deviation;
- decision to retain temporarily or securely remove the restored copy.

If verification fails, leave production unchanged, preserve the isolated target and operation logs, classify the failure, and repair the backup/runbook through the normal reviewed release process.

Cleanup is a destructive operation. Re-resolve the exact isolated environment/service/volume IDs, prove none equals a production ID, obtain owner authorization, then remove the approved target through Railway. Record when access and data were removed and account for Railway backup retention. Never delete the source backup or production volume as cleanup.

## Pass criteria

- Selected backup is within the approved RPO.
- Restore completes within the approved RTO.
- Migration, counts, maximum IDs/times, FK integrity and hash verification pass.
- Readiness passes with outbound integrations disabled.
- Append-only protections work under the real application role.
- No secret or PII appears in drill evidence.
- Restored-data retention/cleanup is explicitly closed.
