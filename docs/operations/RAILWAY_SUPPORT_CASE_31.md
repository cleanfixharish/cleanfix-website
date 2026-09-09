# Railway support case — PITR current-history mismatch

Status: ready to submit through Railway Central Station. This document contains no credentials, database URLs, environment variables, logs with secrets, or customer data.

## Summary

Two PostgreSQL PITR restores into disposable, isolated services completed successfully at the platform level but recovered only to Alembic revision `d4e7a1b93c20`. The live HA database was read-only verified at `a9d4e1f72b60`.

The production application deployment that applied `a9d4e1f72b60` began at `2026-09-08T13:47:17.188Z`. The second requested recovery point was `2026-09-08T15:45:00Z`, so the expected migration preceded the requested recovery point by nearly two hours.

## Sanitized identifiers

- Project: `3f6760b5-4e65-404d-9918-ba7559fe2a0d`
- Production environment: `fe66a5db-af15-446a-8adb-3010f4e7b52d`
- Source HA volume instance: `e0cb7a3a-e223-4deb-b232-6c24131c3743`
- First requested point: `2026-09-07T16:11:03.787Z`
- First disposable service: `668675a5-62be-4bf0-bf15-9d34e4a01c91` (deleted after verification)
- Second requested point: `2026-09-08T15:45:00Z`
- Second disposable service: `83ea53d8-7f04-4131-af3b-9faf16739301` (deleted after verification)
- Restored migration: `d4e7a1b93c20`
- Expected migration: `a9d4e1f72b60`

## Additional read-only API evidence

On 2026-09-09, `volumeInstancePitrRestoreEstimate` returned the same base-backup selection for all three HA members:

- At `2026-09-08T15:45:00Z`: `20260902-172654F_20260907-173111D`
- At a current 2026-09-09 recovery point: `20260902-172654F_20260908-173215D`

Both estimates reported `likelyToFit: true`. The Railway public GraphQL schema exposes an optional `sourceRepoPath` argument on `volumeInstancePitrRestoreEstimate` and `volumeInstancePITRRestore`, but it exposes no authenticated query that enumerates the valid repository-history paths. No third restore was attempted.

## Requested Railway action

Please:

1. identify the exact pgBackRest archive history/sub-prefix accepted as `sourceRepoPath` for the current timeline of source volume instance `e0cb7a3a-e223-4deb-b232-6c24131c3743`;
2. explain why the default/current-history restore for the two timestamps completed at `d4e7a1b93c20`;
3. confirm the supported API or UI selection for restoring the current history into a new isolated service; and
4. confirm the newest recoverable timestamp on the current timeline.

Please do not mutate the production service or volume while investigating.

## Related evidence

- `docs/operations/RESTORE_DRILL_2026-09-08.md`
- GitHub issue `#31`: Production recovery gate: PITR restore stops at stale migration

