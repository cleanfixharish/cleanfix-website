# CleanFixHarish production experts and readiness roadmap

Audit date: 2026-09-07  
Scope: `C:\Users\Aviel\Documents\ChatGPT\CleanFixHarish Production` (official production repository)  
Decision: **public web production is online; the full cross-platform product is not yet production-ready**

## Current readiness bar

**Provisional readiness: 70%**

`[██████████████░░░░░░] 70%`

This is a gate-based estimate, not a claim that 70% of the work is safe to ship. It reflects meaningful implementation and test evidence while unresolved signed mobile release, iOS, observability, operations, finance/compliance, and live workflow gates remain.

| Workstream | Status | Evidence | Release implication |
|---|---|---|---|
| Product surface and routes | Green/Amber | `app/frontend/src/App.tsx` defines public, quote, account, provider, partner, admin, and auth routes; `docs/product/SITEMAP_AND_WIREFRAMES.md` now maps the role-safe journeys. | The baseline IA exists and now needs product approval plus implementation reconciliation. |
| Sitemap and SEO plumbing | Green/Amber | `/how-we-work` now redirects to canonical `/how-it-works`; the rebuilt sitemap contains 11 unique URLs, includes `/how-it-works`, and excludes the legacy path. The scheduled audit now rejects duplicate and legacy sitemap entries. | Deploy the corrected sitemap, then complete canonical-domain and noindex validation. |
| Wireframe / UX specification | Green/Amber | A responsive low-fidelity wireframe package now exists at `docs/product/SITEMAP_AND_WIREFRAMES.md`. | Review it with product/operations and turn approved states into implementation tickets. |
| Frontend quality | Green | `pnpm lint`, `pnpm typecheck`, and `pnpm build` all completed successfully; 2,086 modules transformed and the production bundle/prerender output was generated. The public mobile Playwright suite completed with 118 passed, 50 skipped, and 0 failed across six phone/landscape projects. | Add real-device, tablet, install/update, accessibility, and production-like backend evidence; retain the release artifact. |
| Backend quality and security | Green/Amber | `71 passed`; 10 dependency deprecation warnings. Existing tests cover auth, access roles, privacy boundaries, pricing/quote guardrails, readiness endpoints, and the production CSP baseline. | Good automated baseline; deploy and browser-verify the CSP, then capture staging mutation and production-like smoke evidence. |
| Android foundation | Amber | `testDebugUnitTest`, `lintDebug`, and `assembleDebug` completed successfully and produced a debug APK. The unit-test task reported `NO-SOURCE`, so this is build/lint evidence rather than behavioral test coverage. | Add tests, localization/RTL, photo upload, verified App Links, release signing, store privacy/listing assets, internal-track evidence, and crash monitoring. |
| Deployment and operations | Green/Amber | Railway is the selected live platform. Deployment `fc5915d3-82cb-4a3e-8e47-bf729feaebaa` is online at `https://cleanfixharish.co.il`; `/`, `/about`, `/admin`, and `/health/ready` returned 200. | Record rollback evidence, rationalize legacy Render configuration, and complete observability/restore drills. |
| Release governance | Amber | `CROSS_PLATFORM_RELEASE_GATES.md` and `COMPANY_SOURCE_OF_TRUTH.md` require staging evidence and a dated good-production tag. | Current HEAD is `chore/official-project-migration`; no fresh release evidence was found in this audit. |

## Expert roster to create and use

These are the minimum accountable roles for production readiness. One person may hold multiple roles, but each gate needs a named owner and evidence.

| Expert | Owns | First deliverable | Depends on |
|---|---|---|---|
| Product / IA lead | Scope, route taxonomy, public vs private journeys | Approved sitemap and route inventory | Current routes and business contract |
| UX / wireframe lead | Mobile-first layouts, states, navigation, quote funnel | Annotated wireframes for key journeys | Approved sitemap, visual system |
| SEO / content lead | Canonicals, metadata, robots, sitemap coverage, Hebrew/English content | Sitemap validation report and SEO acceptance checklist | Approved sitemap, deployed origin |
| Frontend release engineer | Build reproducibility, routing, PWA shell, client error states | Clean production build and route smoke report | UX sign-off, backend contract |
| Backend / data migration lead | API contracts, PostgreSQL migrations, seed safety, readiness | Staging migration and rollback evidence | Deployment environment and backup |
| Security / identity lead | OIDC, roles, viewer read-only boundary, secrets and privacy | Production-like auth and boundary test evidence | Staging domains and identities |
| Payments / compliance lead | Quote/payment/refund guardrails, legal release gates | P0 finance/compliance sign-off | Product contract, test payment setup |
| QA / release manager | Cross-platform gates, regression, acceptance evidence | Release packet with pass/fail matrix | All technical workstreams |
| DevOps / SRE lead | Railway/Render ownership, DNS/TLS, secrets, observability, rollback | Deployment runbook and verified staging deployment | Build artifact, migration plan |
| Accessibility / performance lead | Keyboard, RTL, touch targets, LCP, error and loading states | Mobile/RTL/accessibility and performance report | Wireframes, build artifact |
| Operations / support lead | Lead intake, assignment, incident and recovery procedures | Go-live support checklist and escalation rota | Product flows, monitoring, compliance |

## Prioritized roadmap

### P0 — unblock a safe release

| Priority | Owner | Work and dependency | Acceptance criteria |
|---|---|---|---|
| P0.1 | Product / IA + UX | Create and approve the sitemap and wireframes for home → services → quote, account/auth, provider, partner, and admin. Include public/private/noindex boundaries and mobile/RTL states. | Artifacts are reviewable; every implemented route maps to one node; every primary CTA and error/empty state has a defined destination. |
| P0.2 | Frontend release engineer | Re-run lint, typecheck, build, and route smoke tests in a clean checkout/output directory; investigate the `ENOTEMPTY` build failure. | Clean build exits 0; generated `dist/sitemap.xml`, `robots.txt`, manifest, and hashed assets are present; no stale-output workaround is relied upon. |
| P0.3 | DevOps / SRE | Choose the single release target (Railway or Render), confirm repository/branch, domains, TLS, environment variables, database, migration command, health checks, and rollback owner. | A staging deployment is reachable; `/health` is 200 and `/health/ready` is 200 with a real database; deployment ID, commit SHA, and timestamp are recorded. |
| P0.4 | Backend / data + Security | Restore/seed a non-production database, run Alembic migrations, verify `RAILWAY_ENVIRONMENT` prevents runtime table creation, and test secrets are external only. | Migration is repeatable; no production records are used in staging; missing/invalid secrets fail safely; backup and rollback procedure is rehearsed. |
| P0.5 | Security / identity + QA | Exercise owner auth, viewer read-only behavior, provider/partner gating, private quote access, error responses, and data leakage checks in staging. | All P0 gates in `CROSS_PLATFORM_RELEASE_GATES.md` pass; no stack traces, secrets, private records, or fabricated dashboard data leak. |

### P1 — validate the customer and operator experience

| Owner | Work | Acceptance criteria |
|---|---|---|
| QA + Accessibility/performance | Run Playwright public/mobile coverage, keyboard/RTL checks, touch-target checks, and representative LCP/CLS checks against staging. | Existing `app/frontend/e2e/public-mobile.spec.ts` passes for public routes and no P1 accessibility/performance blocker remains. |
| Payments/compliance + Operations | Exercise quote, lead, payment/refund/rework, assignment, contact-release, and incident paths with test data. | Contract P0 guardrails and legal/safety release gates pass; support has an escalation and recovery checklist. |
| SEO/content | Compare approved sitemap with generated sitemap and live canonical URLs; verify bilingual metadata and noindex private routes. | No duplicate or missing canonical public pages; robots points to the live sitemap; daily SEO audit succeeds against staging/live target. |
| DevOps/SRE | Add or verify deployment logs, uptime alerting, database backup schedule, restore evidence, and rollback command/runbook. | A failed deploy can be rolled back within the agreed recovery objective; alerts reach the owner; no secrets appear in logs. |

### P2 — post-launch hardening

| Owner | Work | Acceptance criteria |
|---|---|---|
| Product + Analytics | Define funnel events and weekly review for quote starts, qualified leads, conversion, and support incidents. | Events are documented, privacy-safe, and visible to the operator without exposing customer secrets. |
| Frontend + Backend | Remove template metadata, stale docs, and non-production assumptions discovered during release review; address deprecation warnings. | Production-facing title/description and error states are product-specific; warning budget is understood or cleared. |
| Operations | Run a first-20-paid-jobs review before moving from P0 to P1 as required by `PRODUCT_CONTRACT_P0.md`. | Evidence is attached to the release record and follow-up decisions are documented. |

## Sitemap and wireframe expert check

- **Sitemap / information-architecture expert:** activated. The canonical baseline is now `docs/product/SITEMAP_AND_WIREFRAMES.md`, including public/private/noindex boundaries and role-based navigation.
- **Wireframe expert:** activated. The same artifact now contains responsive low-fidelity wireframes for public, customer, provider, referral-partner, owner/admin, phone, tablet, Android/iOS/PWA, Hebrew RTL, and accessibility states.
- **Required next action:** obtain product/operations approval, reconcile the implemented routes and duplicate How-it-works URLs, then convert the approved states into tracked implementation and QA tickets.

## Evidence captured in this audit

- Frontend lint: passed.
- Frontend TypeScript check: passed.
- Frontend production build: passed after the SEO/security hardening checkpoint; 2,082 modules transformed and production assets were emitted successfully. The generated sitemap contains 11 unique locations with no legacy `/how-we-work` entry.
- Backend tests: **71 passed**, with 10 Pydantic deprecation warnings.
- Public mobile Playwright suite: **118 passed, 50 skipped, 0 failed** across phone widths 320/360/390/412, phone landscape, and Android desktop-site emulation. Local preview `/api` proxy warnings were expected because the backend was not running; fallback states passed, but this is not production-like API integration evidence.
- Android Gradle gates: `testDebugUnitTest`, `lintDebug`, and `assembleDebug` completed successfully. A debug APK was produced; `testDebugUnitTest` was `NO-SOURCE`, and no signed Play release was created.
- CI has separate backend, frontend, container, Android, and scheduled SEO jobs in `.github/workflows/`.
- Railway is the selected live target. Deployment `fc5915d3-82cb-4a3e-8e47-bf729feaebaa` is online and its public/readiness smoke checks passed. Render configuration remains legacy cleanup work, not the active host.
- No application code was changed by this audit.

## Definition of production-ready

Production-ready means P0 release gates pass in staging, the approved sitemap and wireframes exist, a clean build artifact is reproducible, migrations/backups/rollback are evidenced, identity/privacy/payment boundaries pass, live health and canonical-domain checks pass, and a dated verified-good commit/tag is recorded per the repository release policy.
