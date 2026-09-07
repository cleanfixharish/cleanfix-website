# CURRENT STATE

## Company Stage

Pre-launch.

## Website

Existing Atoms project exported into `atoms-site` and under local audit.
The source contains a React/Vite frontend, FastAPI backend, CRM entities, admin dashboard,
Atoms authentication, bilingual pages, and PWA support.

## Manager Dashboard

The first polished owner operating-system dashboard is implemented in the existing React application.

Available sections:

- Overview and priority inbox
- Leads CRM with search, filters, lead detail, status changes, and WhatsApp actions
- WhatsApp response templates and reply queue
- Jobs and next-action tracking
- Provider directory and internal reliability notes
- Services, public copy, internal pricing guidance, and visibility controls
- Website content and visual-system overview
- Follow-up and review-request queue
- Internal priorities, operating principles, project progress, and connection status

The dashboard reads from the existing leads API when available and otherwise displays clearly labeled
starter data. External integrations and unfinished create/edit operations are not represented as live.

## GitHub

Canonical repository: `cleanfixharish/cleanfix-website`.
The repository contains the Atoms source and direct GitHub CLI access is verified.
Launch PR `#1` was merged into `main` on 2026-07-12.
Current Render production commit: `1fc4186`.
PR `#5` merged the account safety repair and fictional-provider cleanup into `main`.
PR `#6` fixed the live authentication configuration guard.
PR `#7` fixed Google `at_hash` validation by supplying the matching access token while preserving the security check.
PR `#8` removed an incorrect footer link to `cleanfix.co.il` and replaced it with the official `www.cleanfixharish.co.il` domain.

PR `#2` added account portals, direct API connections, live content editing, accessibility tools, and the handyman-first homepage.

PR `#3` added the single-service Render production deployment and same-origin PWA/API serving.

PR `#4` made the verified Google Workspace email the automatic admin identity.

## ChatGPT Work

Connected.

## Google Workspace

Available.

## Perplexity Pro

Available.

## Main Objective

Launch website and start receiving leads.

## Website Content — 2026-07-14

- Homepage Version 1 content is implemented with an English-first interface and Hebrew support.
- Handyman is presented as the primary service.
- Supporting services are post-renovation cleaning, move-in / move-out cleaning, AC cleaning, and window cleaning.
- The updated frontend production build passes.

## Account System Status

- Secure OIDC/JWT sign-in routing and admin-role protection are implemented.
- Customer and business/provider onboarding are implemented.
- Customer VIP numbers, customer dashboard, and provider application dashboard are implemented.
- Public lead capture and admin lead updates connect directly to the backend API.
- Homepage content loads from persistent storage and the admin can publish bilingual content edits.
- Google OAuth production credentials were created and installed in Render on 2026-07-26.
- The account page detects OAuth readiness and now presents an active `Continue with Google` action.
- Customer and business account selection is explicit and persists into onboarding after Google returns.
- Authentication failures use a branded recovery page with Account and WhatsApp actions and no forced redirect.

## Visual Asset Status

- The gold `CF` monogram supplied as `Generated image 3.png` is the canonical icon and compact logo as of 2026-07-26.
- The matching `CLEANFIX HARISH` wordmark supplied as `Generated image 4.png` is the canonical named logo for wide brand placements.
- Protected masters plus responsive website, favicon, Apple, Android/PWA, maskable, Microsoft tile, and social-sharing files are generated locally.
- The approved monogram and wordmark are installed in the website header, footer, account experience, manager dashboard, metadata, and PWA manifest.
- Background vectors and seven service/hero image candidates exist locally; final image-set approval remains pending.
- Visual System V2 was approved by the owner on 2026-07-16 and is installed across the public website, account experience, and manager dashboard foundation.
- The V2 review set contains 9 photographic masters, 27 responsive web derivatives, 6 matching gold service symbols, 3 reusable vector backgrounds, and a documented golden-ratio layout and spacing system.
- Review file: `atoms-site/VISUAL_REVIEW_V2.html`.
- The verified frontend production build passes after the approved visual installation.

## Accessibility and PWA

- Accessibility options include larger text, higher contrast, visible link underlines, and reduced motion.
- An accessibility information page targets Israeli Standard 5568 and WCAG 2.1 AA without claiming certification.
- PWA metadata and premium teal/ivory theme are updated.
- The install manifest, service worker, Apple icon, standard PWA icons, and maskable icons are live and return HTTP 200 on the final HTTPS domain.
- The install action is shown only when the browser exposes a real native install prompt; iOS receives Add to Home Screen guidance, while unsupported browsers such as Comet no longer receive a non-working installation popup.
- The former Render origin serves a cache-retirement service worker that clears its obsolete offline cache and redirects future page navigation to the official domain.

## Local Master Copy

Safe project snapshot created at:

`C:\Users\Aviel\Desktop\Aviel's GPT workspace Files and Dashboard\all System files`

This location must be refreshed after material project changes without copying secrets or disposable caches.

Private GitHub system backup:

`https://github.com/cleanfixharish/cleanfixharish-system-backup`

External WD Elements project backup:

`D:\Aviel's GPT workspace Files and Dashboard\Cleanfix Harish Complete Backup`

AES-256 encrypted credential backup verified on 2026-07-26:

`D:\Aviel's GPT workspace Files and Dashboard\Private Credentials Backup`

The recovery password is stored separately on the C: desktop backup folder with restricted Windows permissions. The credential archive contains the existing GitHub token artifact, Google Cloud CLI owner configuration, Render CLI credentials, the Google OAuth production-client JSON, and contents/status manifests. Cloudflare credentials must be added after they are created.

## Current Blockers

- Google OAuth requires one final interactive sign-in with `info@cleanfixharish.co.il` to verify the callback, admin role, and dashboard end to end. Google accepts the client and displays its normal sign-in page without a redirect mismatch.
- Windows browser capture fails with `SetIsBorderRequired failed: No such interface supported (0x80004002)`, so credential-console forms must not be automated with blind clicks.
- Render Free PostgreSQL expires on 2026-08-14. Migrate to a durable free database before that date or obtain approval for a paid database; do not let production data expire silently.

## Official Domain Launch — 2026-07-26

- Cloudflare now has DNS-only CNAME records for both the apex domain and `www`, pointing to `cleanfixharish-web.onrender.com`.
- The five Google Workspace MX records and existing SPF and Google-verification TXT records were preserved.
- Render reports both `cleanfixharish.co.il` and `www.cleanfixharish.co.il` as verified.
- `https://www.cleanfixharish.co.il` returns HTTP 200 over HTTPS.
- `https://cleanfixharish.co.il` returns HTTP 200 after redirecting to `https://www.cleanfixharish.co.il/`.
- Cloudflare and Google public DNS resolvers return Render addresses for the apex domain.
- The former DNS launch blocker is resolved. Remaining launch validation is Google sign-in, account-role routing, PWA installation, and founder approval of the final live presentation.

## Live Verification — 2026-07-26

- Production commit `1fc4186` is live on the free Frankfurt Render service and on `https://www.cleanfixharish.co.il`.
- Temporary Render page addresses now redirect permanently to the canonical `https://www.cleanfixharish.co.il` address while API and health routes remain available to the platform.
- The live root page, PWA manifest, service worker, application icon, and API health endpoint return HTTP 200.
- The production API reports healthy, and the PostgreSQL database health endpoint reports healthy.
- After OAuth installation, the authentication-status endpoint reports `configured: true`; Google accepts the production client and the live account page enables signup.
- Release `c88ca33` is live with application and database health checks passing. The first interactive callback exposed Google's required `at_hash` verification; the standards-compliant fix is deployed and awaits one user retry.
- Starting sign-in while Google is unconfigured redirects to the branded recovery page instead of returning a server error.
- The public provider API contains zero fictional template providers; real providers can be added later through controlled operations.
- The public lead creation route validates input (HTTP 422 for an empty payload without creating data), while lead listing is protected (HTTP 401 without authentication).
- Render has registered and verified `www.cleanfixharish.co.il` plus the apex redirect; free HTTPS is active on both addresses.
- Cloudflare DNS now routes both official addresses to the current Render deployment rather than the older site.
- Google sign-in is the only live application endpoint still unavailable; Google requires re-verification of `info@cleanfixharish.co.il` before the web OAuth client can be created.
- The deployed repair adds a public authentication-status check, safe disabled signup state, branded error recovery, customer-account access in the mobile menu, and a five-service catalogue aligned with the operating system.
- Inline links use visible underlines and gold/bronze contrast; desktop and mobile navigation show a persistent gold active-page indicator and a visible keyboard-focus ring.
- Final live desktop and mobile screenshots confirm the approved navy, richer gold, ivory, official logo, golden-ratio composition, five approved services, visible VIP entry, correct phone number, and correct email address.
- Live verification after release `1584b24` confirms the footer displays `www.cleanfixharish.co.il`; the unrelated `cleanfix.co.il` reference no longer exists in source or the deployed page.
- Live verification after release `da78693` confirms the Render root and page routes return HTTP 308 to the matching official-domain path, the apex returns HTTP 301 to `www`, the official homepage returns HTTP 200, and every PWA icon referenced by the manifest returns HTTP 200.
- Live verification after release `9e6e0a0` confirms the Render-origin service worker returns HTTP 200 with the cache-retirement logic, resolving stale installed/offline copies that could bypass the server redirect.
- Live verification after release `1fc4186` confirms the responsive header has no horizontal overflow at 1024, 1280, 1440, or 1536 pixel desktop widths. Navigation, language, WhatsApp, quote, account, and responsive-menu controls remain available without cutting off the page.
- Release `16aa2b7` replaces the former headset emblem with the approved gold CF monogram and matching CleanFix Harish wordmark across the header, footer, account entry, manager dashboard, social image, favicon, and full PWA icon set. The frontend lint and production build checks pass.

## Verification — 2026-07-12

- Frontend ESLint passes.
- Frontend TypeScript validation passes.
- Frontend production build passes and prerenders `/` and `/blog/`.
- Manager dashboard production build and ESLint verification pass.
- Backend source compilation and application import pass.
- Backend regression suite: 5 tests passing.
- Python dependency consistency check passes.
- Alembic migration head: `412f4525879b`.
- FastAPI and SSE dependencies are bounded to compatible release families.
- Admin settings no longer return stored secret values to the browser.
- OAuth callback host selection rejects untrusted host headers.
