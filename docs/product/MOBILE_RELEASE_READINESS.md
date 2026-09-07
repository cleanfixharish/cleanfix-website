# Mobile and Release Readiness Audit

**Project:** CleanFixHarish  
**Audit date:** 2026-09-07  
**Scope:** Android, iOS, phone/tablet web, installable PWA, and release engineering  
**Audit mode:** repository inspection only; no app code, deployment, signing keys, or production data changed.

**Post-audit update:** `docs/product/SITEMAP_AND_WIREFRAMES.md` was created after this inspection and now provides the missing sitemap and responsive wireframe baseline. The public mobile Playwright suite then completed with 118 passed, 50 skipped, and 0 failed across six phone/landscape projects. Android `testDebugUnitTest`, `lintDebug`, and `assembleDebug` also completed successfully and produced a debug APK; the unit-test task was `NO-SOURCE`. These results strengthen the automated baseline but do not replace real-device, live-backend, signed-release, or store validation.

## Executive decision

The responsive website/PWA is the P0 customer mobile path. It has a real web manifest, service worker, install metadata, responsive viewport settings, Apple touch icon, bilingual/RTL product intent, and a public mobile E2E test file. It is not yet a store-equivalent release until the device matrix and live install/update checks are evidenced.

Android is a real customer-app foundation, not a release candidate. It can submit a lead, open a quote link/code, and accept or decline a published quote. The repository explicitly describes it as a tester/foundation build and the release workflow publishes a debug APK as a prerelease artifact. There is no iOS native project in the repository. iPhone and iPad should therefore use the responsive PWA for P0; an iOS App Store release is not ready or currently buildable.

**Current release posture:**

| Surface | What exists | Readiness | Blocking evidence/gaps |
|---|---|---:|---|
| Responsive web | Vite React app, viewport-fit metadata, mobile UI hooks; public mobile Playwright run: 118 passed, 50 skipped, 0 failed | Automated phone baseline passed | Run real-device phone/tablet, Hebrew/RTL, keyboard, upload, production-like network/API, and accessibility matrices |
| PWA | `manifest.json`, `sw.js`, install prompt, icons, Apple metadata, same-origin cache exclusions for API/auth/navigation | P1 validation required | Verify final HTTPS install/resume/update behavior on Chrome Android, Safari iOS, desktop; add/verify screenshots and manifest asset coverage |
| Android | Kotlin/Compose app, API client, HTTPS App Link intent, custom scheme; debug lint/build passed and debug APK produced | Foundation build verified | Add behavioral tests (`testDebugUnitTest` currently has no sources), bilingual/RTL, photo upload, icons/listing, Digital Asset Links, release signing, privacy/Data safety, internal track, crash/ANR baseline |
| iOS | No Xcode project, Swift source, scheme, signing configuration, or App Store workflow found | Not ready | Decide whether PWA is sufficient for P0; if native is required, create a separately scoped iOS product and release track |
| Tablet | Responsive product intent and release-gate cases for 768x1024, 1024x768, and iPad split view | Unproven | Execute portrait, landscape, split-view, text scaling, keyboard, and two-pane/navigation checks |
| Release engineering | Web CI, Android CI, Android tester release, dated-release policy and cross-platform gates documented | Partial | Add signed artifact provenance, environment separation checks, staged promotion, rollback/kill switch evidence, and mobile observability |

## Repository evidence

### PWA and browser mobile

- `app/frontend/public/manifest.json` defines standalone display, portrait orientation, theme/background colors, shortcuts, English LTR defaults, and 192/512/maskable/Apple icon references.
- `app/frontend/public/sw.js` avoids caching API requests, authenticated responses, navigation, non-static responses, and cross-origin responses. It includes cache retirement and legacy Render-origin redirects.
- `app/frontend/index.html` includes `viewport-fit=cover`, `apple-mobile-web-app-capable`, Apple status-bar/title metadata, Apple touch icon, theme color, and service-worker registration with `updateViaCache: 'none'`.
- `app/frontend/src/lib/pwaInstall.ts` and the install prompt provide browser-aware installation guidance; iOS relies on Add to Home Screen behavior rather than a native install event.
- PWA icons are present under `app/frontend/public/icons/`. The manifest has an empty `screenshots` array, so store-like install UX and listing evidence are incomplete.
- `app/frontend/e2e/public-mobile.spec.ts` exists, but its presence is not proof that the full release-gate matrix has passed.
- Vite generates a sitemap/robots output at build time through `vite-plugin-sitemap`; no checked-in static sitemap file was found. The canonical source is `app/frontend/vite.config.ts` plus the prerender helpers.

### Android

- `apps/android` is a Gradle Kotlin/Compose application with `compileSdk`/`targetSdk` 35, `minSdk` 26, Java/Kotlin 17, and application ID `il.co.cleanfixharish.app`.
- `MainActivity.kt` supports lead submission and quote retrieval/decision flows. The UI strings are currently hardcoded English; full Hebrew/English localization and RTL QA are absent.
- `AndroidManifest.xml` disables cleartext traffic and backup, declares only `INTERNET`, and registers HTTPS App Links for `/quote/` plus a custom `cleanfixharish://quote` scheme.
- `apps/android/README.md` explicitly lists missing photo upload, bilingual strings/RTL QA, app icons/screenshots/privacy policy/store listing, Digital Asset Links, network/Compose tests, and internal testing.
- `.github/workflows/android-ci.yml` builds/tests/lints a debug APK against a preview URL. `.github/workflows/android-release.yml` builds an unsigned-by-project-config debug APK connected to the official site and uploads it as a GitHub prerelease tester artifact. This is not a Play production release pipeline.
- No iOS/native Apple artifacts were found (`.xcodeproj`, `.xcworkspace`, Swift, `Podfile`, App Store workflow, or iOS signing configuration).

## Missing release requirements

### Product and UX

1. Freeze the P0 mobile contract: responsive web/PWA customer request and secure quote link first; native Android remains supplementary until the managed-service loop is proven.
2. Complete service-request parity across web and Android: validation, photo upload after the storage/API contract is approved, clear consent, retry/draft behavior, safe errors, and no false offline success.
3. Localize Android and verify Hebrew RTL, mixed Hebrew/English values, numerals, currency, dates, accessibility labels, text scaling, and screen-reader order.
4. Test tablet layouts at 768x1024, 1024x768, and iPad split view; verify no table/card clipping, overlap, or hidden primary action.
5. Produce approved mobile screenshots and a short install/update/help flow. Do not invent claims, certifications, testimonials, or service promises.

### Store, legal, and privacy

- Publish Hebrew and English privacy notice, terms, cancellation/refund policy, support contact, and data-retention/contact paths. Ensure links are reachable before quote acceptance/payment.
- Build a data inventory covering lead fields, quote tokens, contact data, photos/private media, auth/session data, logs, crash/analytics SDKs, hosting, storage, and every third party. Map it to Google Play Data safety and Apple App Privacy responses.
- If customer accounts are enabled, implement and test in-app account deletion plus a working web deletion/request URL; document legal-retention exceptions and session/token revocation.
- Obtain counsel/security review for Israeli privacy obligations, database classification, access logging/retention, processor/vendor terms, and cross-border processing.
- Never put long-lived bearer tokens, raw quote tokens, secrets, or personal data in URLs, logs, analytics, notifications, clipboard, referrers, or client bundles. Verify server-side authorization and masking with direct unauthorized-request tests.
- For physical home services, use an approved external/standard processor and verify current Play/Apple payment-policy treatment; do not add store billing for the service itself without a policy decision.

### Security, signing, and supply chain

- Configure Android release signing with a protected upload key/keystore, Play App Signing, key backup/rotation/revocation procedure, and CI secret storage. Never commit keystores or passwords.
- Add Android App Links Digital Asset Links at the official origin and test verified links, revoked/expired quote links, reinstall/upgrade behavior, and safe fallback.
- For a future iOS app, configure Apple Developer team/bundle ID, certificates/profiles or managed signing, Associated Domains/universal links, privacy manifest/required-reason API review, and App Store Connect access using protected credentials.
- Pin/lock dependencies, review SDK permissions and transitive packages, generate SBOM/dependency audit evidence, and keep release artifacts traceable to commit, build environment, and tests.
- Enforce HTTPS, HSTS/CSP/security headers, secure cookie flags where applicable, environment separation, production secret isolation, and source-map/log review before release.

### Testing and operations

- Gate every candidate with the existing `CROSS_PLATFORM_RELEASE_GATES.md`, especially PUB-02/03/04, MOB-01/02/03, TAB-01/02, RTL-01/02/03, NET-02, PWA-01/02, SEC-01/02, and the viewer/privacy gates.
- Minimum matrix: current Chrome on Android phone/tablet; current Safari on iPhone/iPad; Edge/Firefox desktop smoke; NVDA and VoiceOver; reduced motion; 200% text/zoom; online, slow 3G, offline, reconnect during mutation.
- Android: unit, network contract, Compose UI, deep-link, rotation/process death, accessibility, offline/retry, privacy leakage, and release-build tests; internal/closed-track test with a production-like but isolated environment.
- PWA: Lighthouse/performance baseline, installability, cold start, offline safe-state, service-worker update, stale HTML prevention, storage quota, private-cache inspection, and uninstall/reinstall tests.
- Establish crash/ANR/error monitoring without collecting unnecessary personal data; define alert ownership, release health thresholds, kill switch, rollback, and incident runbook.
- Attach release evidence: commit SHA, build/version, environment, migration version, signed artifact checksum, device/browser/viewport/language, redacted API evidence, screenshots/video, and owner approval for any P1 exception.

## Prioritized path to installable releases

### Phase 0 — release control (P0)

1. Declare the PWA the canonical P0 iPhone/iPad and general customer mobile experience; keep production mobile changes behind the same backend authorization and state machine.
2. Create a staging environment with isolated database/storage/OAuth and a tested rollback/kill-switch path. Confirm no mobile artifact points at production records during tests.
3. Assign owners for product/UX, information architecture, accessibility/RTL, mobile engineering, backend/security/privacy, QA/device lab, release/signing, and legal/store review.

### Phase 1 — prove the PWA (P0/P1)

1. Run and record the complete cross-platform gates on real iPhone, iPad, Android phone, Android tablet, and desktop.
2. Fix blockers in request/quote/upload, keyboard and safe-area behavior, Hebrew RTL, tablet layouts, error/retry/offline states, and private-cache boundaries.
3. Verify live HTTPS manifest/icon/robots/sitemap responses, install/resume/update/uninstall flows, and production headers. Add screenshots and help copy after the behavior is verified.

### Phase 2 — Android closed test (P1)

1. Finish localization, photo upload, input/accessibility, deep links, icons, privacy disclosures, and network/Compose/security tests.
2. Create a signed release variant and Play App Signing setup in a protected CI context; produce deterministic, checksummed artifacts.
3. Complete Play Console Data safety, privacy/support URLs, deletion path (if accounts), listing assets, review credentials/instructions, internal then closed testing, crash/ANR review, and staged rollout.

### Phase 3 — iOS decision and build (P1/P2)

1. Reassess native demand after PWA and Android managed-service metrics are stable. If PWA meets the P0 need, do not create an iOS store app solely for parity.
2. If native iOS is approved, scope a new project against the same APIs and security contract; implement universal links, localization/RTL, privacy manifest, deletion/support flows, accessibility, signed TestFlight builds, App Store privacy answers, review instructions, and staged release.

### Phase 4 — ongoing release quality

Maintain a dated known-good tag, reproducible build metadata, dependency/SDK review, scheduled device smoke tests, crash/ANR and PWA health dashboards, privacy/access reviews, and a documented rollback/incident process. A store publication is not complete until live behavior, backend authorization, and privacy disclosures agree.

## Explicit non-claims

- No iOS native release is available from this repository today.
- The Android GitHub artifact is a debug tester APK/prerelease, not a Play production-signed artifact.
- Existing manifest/service-worker files demonstrate implementation, not completed installability or device QA.
- A generated sitemap exists in the build path, but no dedicated sitemap/wireframe expert deliverable was found in the repository during this audit.
