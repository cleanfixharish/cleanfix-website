# Cursor Workstream: Growth Center Review Controls

## Goal

Complete the frontend-only review experience for the approval-gated organic Growth Center. Work from a separate Git worktree and branch based on commit `e7b30b0`. Do not edit backend, migration, deployment, authentication, or unrelated media files.

## Allowed files

- `app/frontend/src/components/admin/GrowthCenter.tsx`
- `app/frontend/src/lib/cleanfixApi.ts`
- new focused frontend tests for the Growth Center

## Existing API contract

- `PUT /api/v1/admin/growth/posts/{id}` accepts any subset of `body`, `alt_text`, `image_url`, `destination_url`, and `scheduled_for`.
- Editing increments `content_version`, clears approval, and returns the post to `draft`.
- Approval, scheduling, and manual-published endpoints already exist in `cleanfixApi.ts`.
- `POST /api/v1/admin/growth/posts/{id}/reject` accepts `{ "reason": "..." }`, clears approval and scheduling, and returns the post with `status: "rejected"`.

## Required UI

1. Add an Edit action for unpublished posts.
2. Edit body, alt text, image URL, and landing URL in an accessible dialog or inline editor.
3. Clearly warn that saving invalidates prior approval.
4. Add a preview mode approximating Facebook/Instagram presentation without claiming exact platform parity.
5. Display content version and approved version.
6. Preserve Hebrew/English directionality, keyboard access, focus behavior, mobile layout, and existing visual tokens.
7. Add a reject action with a required reviewer reason.
8. Improve API error extraction so FastAPI response details are visible without exposing sensitive response data.

## Acceptance checks

```text
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

Add focused tests if the existing frontend test stack supports them. Commit only the allowed files and provide the commit hash; do not merge, push, deploy, or reformat unrelated code.
