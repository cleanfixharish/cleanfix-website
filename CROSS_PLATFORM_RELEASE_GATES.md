# CleanFixHarish Cross-Platform Release Gates

This document is the release checklist for public web, the owner dashboard, viewer mode, customer/provider flows, and the PWA experience. It is intentionally executable: each gate has a concrete action and pass condition. No gate is passed by visual inspection alone when a server-side or API boundary is involved.

## Release rule

Release is blocked if any P0 or P1 gate fails. P2 issues may ship only when documented with an owner and follow-up date. Test against a staging/preview deployment first; never use production for destructive or mutation testing.

## Test matrix

| ID | Area | Action | Pass condition | Priority |
|---|---|---|---|---|
| PUB-01 | Public routes | Open `/`, `/services`, `/how-it-works`, `/why-trust-us`, `/partners`, `/about`, `/quote`, `/account`, `/accessibility` | Every route returns usable content without console-blocking errors | P0 |
| PUB-02 | Quote flow | Submit a valid quote with service, location, description, and photos | Submission completes; confirmation is clear; no private data appears in URL | P0 |
| PUB-03 | Quote validation | Try missing fields, oversized/unsupported files, and malformed input | Inline errors identify the fix; server rejects invalid input safely | P1 |
| PUB-04 | Public quote token | Open `/quote/:token` with valid, expired, random, and altered tokens | Valid token shows only intended quote; invalid tokens show safe error/no data | P0 |
| PUB-05 | Customer account | Sign in, refresh, sign out, and revisit `/account` | Session state is correct; sign-out invalidates protected requests | P0 |
| PUB-06 | WhatsApp | Test CTA on desktop and phone, with and without WhatsApp installed | Correct encoded message opens or falls back to web; no broken popup | P1 |
| PUB-07 | SEO/assets | Check favicon, manifest, robots, image alt text, and direct asset URLs | Brand assets load; no missing critical image; no private file is public | P1 |
| ADM-01 | Owner auth | Open `/admin` unauthenticated in production-like mode | Redirect/login gate appears; development bypass is not active | P0 |
| ADM-02 | Admin loading | Sign in as owner and refresh each section | Live-data state is truthful; no demo/fake records appear when database is empty | P0 |
| ADM-03 | Lead operations | Search/filter a lead; change status; save notes; create a job | API mutation succeeds, UI updates, refresh preserves state | P0 |
| ADM-04 | Job/provider operations | Assign provider, schedule/update job, and reload | Permission and validation rules hold; audit-relevant data persists | P0 |
| ADM-05 | Website Studio | Edit EN and HE text, colors, CTA, layout, and images; publish | Public page reflects changes in both directions and languages | P0 |
| ADM-06 | Restore default | Make a safe staged change, restore default, refresh | Website configuration reverts; accounts, leads, jobs, providers, payments, and files remain unchanged | P0 |
| ADM-07 | Pricing estimator | Request an estimate with insufficient, national, and approved local evidence | Result remains non-binding; human approval is required; unsupported local price is not implied | P0 |
| ADM-08 | Viewer mode | Sign in as viewer and inspect Today, Customers, Jobs, Providers | Read-only banner appears; allowed data is visible only at permitted detail level | P0 |
| ADM-09 | Viewer mutation | Attempt direct API POST/PATCH/DELETE as viewer, not only UI clicks | Server returns authorization failure; no state changes | P0 |
| ADM-10 | Private fields | Inspect viewer API payloads and network responses | Phone, address, notes, financial data, and owner-only sections are server-side masked | P0 |
| ADM-11 | Owner-only sections | Try assistant, messages, pricing, Website, follow-ups, platforms, and settings as viewer | Section is blocked or safe explanation is shown; no sensitive payload is fetched | P0 |
| ADM-12 | Accessibility | Keyboard-only navigate admin; use screen reader labels; zoom to 200% | Focus is visible and logical; dialogs trap/restore focus; no essential control disappears | P1 |
| ADM-13 | Effects | Test Full, Reduced, and Off effects plus OS reduced-motion preference | Decorative motion follows preference; essential feedback remains available | P1 |
| FLOW-01 | Customer lifecycle | Inquiry → review → estimate → human approval → quote → booking → completion → review | Each state has a visible next action and no accidental automatic final price | P0 |
| FLOW-02 | Provider lifecycle | Invite/login → coverage → job offer → accept/decline → completion evidence → payout status | Provider sees only assigned/allowed work; owner retains approval | P1 |
| NET-01 | Offline load | Disable network during initial load and while navigating | Clear offline state; no fake success; retry is available | P1 |
| NET-02 | Offline mutation | Disable network during publish, save, status, upload, and restore | Action is not falsely reported as saved; draft is preserved where safe | P0 |
| NET-03 | Server failures | Return 401, 403, 404, 409, 422, and 5xx responses in staging | User receives an actionable safe message; no stack trace/secrets | P1 |
| MOB-01 | Compact phone | Test 320×568 and 360×800 CSS px | No horizontal overflow; CTAs and fields fit; touch targets are ≥44px | P0 |
| MOB-02 | Standard phone | Test 390×844 and 430×932 in Safari/Chrome | Layout, keyboard, safe-area bottom, upload, and WhatsApp work | P0 |
| MOB-03 | Landscape phone | Test 568×320 and 844×390 | Header, dialogs, sheets, and keyboard do not hide primary actions | P1 |
| TAB-01 | Tablet portrait | Test 768×1024 and iPad portrait | Drawer/two-pane transition is usable; no desktop table clipping | P1 |
| TAB-02 | Tablet landscape/split view | Test 1024×768 and iPad split-screen | Content remains readable; detail panels do not overlap | P1 |
| RTL-01 | Hebrew public | Set Hebrew; inspect every public route and quote flow | Correct `dir=rtl`, mirrored layout, readable mixed text, correct currency | P0 |
| RTL-02 | Hebrew admin | Use Website Studio and lead/job views in Hebrew context | Inputs, icons, drawers, tables/cards, and actions mirror logically | P1 |
| RTL-03 | Mixed data | Test Hebrew names with English URLs, phones, dates, prices, and addresses | `dir=auto`/formatting prevents punctuation and numeric corruption | P1 |
| PWA-01 | Install | Install from Chrome Android, Safari iOS where supported, and desktop | Manifest name/icon/theme are correct; launch opens the intended app | P1 |
| PWA-02 | Resume/update | Kill app, reopen offline/online, then deploy a new version | App resumes safely; update does not erase drafts or auth unexpectedly | P1 |
| SEC-01 | Headers | Check HTTPS, HSTS, CSP/security headers, and cookie flags | HTTPS and expected security headers are present; auth cookies are secure | P0 |
| SEC-02 | No data leakage | Inspect HTML, logs returned to client, URLs, errors, and source maps in preview | No secrets, database URLs, private records, or owner-only fields leak | P0 |

## Device/browser minimum set

- Chrome latest: Windows desktop, Android phone, Android tablet.
- Safari latest supported: iPhone and iPad.
- Edge latest: Windows desktop.
- Firefox latest: desktop smoke test.
- Screen reader: NVDA on Windows and VoiceOver on iPhone/iPad.
- Network profiles: online, slow 3G, offline, reconnect during mutation.

## Highest-risk areas to test first

1. Viewer privacy and server enforcement (`ADM-08`–`ADM-11`, `SEC-02`). The interface claims private data is hidden, but this must be proven from API payloads and direct unauthorized requests.
2. Production admin authentication (`ADM-01`). Development-mode admin bypass must never be active in a deployed build.
3. Website Studio restore boundary (`ADM-05`–`ADM-06`). Verify restore changes only website configuration and cannot affect business records.
4. Pricing guardrails (`ADM-07`, `FLOW-01`). National evidence must not be presented as local evidence; estimates must stay human-approved and non-binding.
5. Mobile quote/upload and mutation reliability (`PUB-02`, `MOB-01`–`MOB-03`, `NET-02`). This is the main customer conversion path and most likely to fail under keyboard, photo, or poor-network conditions.
6. Hebrew mixed-direction behavior (`RTL-01`–`RTL-03`). Hardcoded left/right classes in admin are likely to cause mirrored-layout defects.
7. Preview/production separation (`SEC-01`, `PWA-02`). Confirm preview OAuth, domains, database, and storage cannot point at production records.

## Evidence to attach to a release

- Deployment ID, commit SHA, environment, and timestamp.
- Screenshot or video for each failed gate and a link to the issue.
- API response evidence for auth, viewer masking, pricing guardrails, and restore boundaries (with personal data redacted).
- Device/browser/viewport and language used.
- Test database migration version and counts; never include connection strings or secrets.
- Final owner sign-off for any P1 exception.
