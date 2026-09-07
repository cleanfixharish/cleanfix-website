# CleanFixHarish Growth Center — implementation brief

## Outcome

Build one bilingual admin workspace for search visibility, branded campaign creation,
approval, scheduling, distribution, and measurement. It must help the operator work
consistently without promising rankings, posting spam, or silently changing public copy.

## Navigation

Add **Growth Center / מרכז הצמיחה** to the admin dashboard with these tabs:

1. Today — actionable checks, scheduled posts, approvals, and alerts.
2. Campaigns — create one campaign and derive channel-specific variants.
3. Calendar — week/month publishing calendar with draft/approved/scheduled/published/failed states.
4. SEO Center — route metadata, schema, sitemap, content opportunities, and audit history.
5. Brand Studio — approved palette, typography, layouts, imagery, QR lockups, and preview/export.
6. Channels — connection status and permissions, without exposing credentials.
7. Reports — UTM/QR traffic, leads, quote starts, conversions, and channel comparisons.

Everything must work in Hebrew RTL and English LTR, including mobile admin layouts.

## Branded campaign engine

Inputs: campaign goal, audience (customer/provider/investor), service, location, language,
offer/CTA, publish window, and approved source facts.

Outputs per campaign:

- Hebrew and English copy written natively, not literal translations.
- Facebook/Instagram feed 4:5, square 1:1, story/reel cover 9:16, X 16:9,
  WhatsApp share image, A5 flyer, and business-card variants.
- Accessible alt text, concise hooks, platform-specific body copy, CTA, hashtags,
  UTM link, and a unique campaign QR URL.
- A preview showing crop-safe zones, text overflow, contrast, and QR readability.

Brand invariants:

- CF gold monogram is the primary mark; never substitute arbitrary logos.
- Use semantic CleanFixHarish navy/ivory/gold tokens. Gold is an accent, not body text.
- Use golden-ratio composition as a layout guide, while accessibility and readability win.
- Documentary/local imagery; no misleading before/after claims or invented testimonials.
- Each asset remains recognizable without relying on the caption.

QR invariants:

- Destination is a first-party CleanFixHarish redirect containing campaign and channel IDs.
- Preserve a four-module quiet zone and strong light/dark contrast.
- Do not place the code over faces, detail, noisy textures, or crop-risk areas.
- Use an approved CF center mark only when error correction and scan tests pass.
- Decode-test every exported bitmap before it can be approved or scheduled.
- Provide a plain-link fallback in every caption.

## Distribution policy

Direct publishing is allowed only through official, connected APIs and only after an admin
approves the exact copy, image, destination, and time. Initial supported connections:

- Facebook Page and Instagram Business/Creator via Meta APIs.
- X via the official X API when the account/API tier permits posting.
- WhatsApp Business one-to-one/template messaging only where consent and platform rules allow.

Facebook groups, WhatsApp groups, community forums, and directories use a **share kit**:
copy button, approved asset download, destination link, suggested disclosure, and a checklist.
Do not automate mass group/forum posting, bypass moderation, scrape members, or send unsolicited messages.

Scheduling must respect Asia/Jerusalem time, support retry with idempotency, and never duplicate
a successfully published post. Show clear failure reasons and require approval for materially changed retries.

## SEO Center

Baseline technical implementation:

- Distinct, descriptive title and meta description for every public route.
- Canonical URL, Open Graph, Twitter card, robots directive, and social image per route.
- Separate crawlable Hebrew and English URLs with reciprocal hreflang and x-default.
- Accurate `lang` and `dir`; one clear H1; semantic headings and descriptive internal links.
- XML sitemap including only canonical indexable pages; correct robots.txt sitemap URL.
- JSON-LD based only on verified facts: WebSite/Organization (home), LocalBusiness when
  real business details are supplied, Service, BreadcrumbList, Article, and FAQ only where visible.
- Image width/height, responsive formats, descriptive filenames/alt text, and image sitemap where useful.
- Noindex for admin, account, auth, private quotes, previews, and internal tools.

Daily audit (safe automation):

- Crawl canonical public URLs and check status, indexability, canonical/hreflang reciprocity,
  title/description uniqueness, H1, schema validity, broken internal links, image/alt issues,
  sitemap drift, performance budget, and mobile viewport regressions.
- Save immutable audit runs and compare with the previous run.
- Auto-fix only deterministic generated artifacts such as sitemap entries and cached audit data.
- Create recommendations/diffs for public titles, descriptions, schema facts, links, and copy.
  Require explicit admin approval before publishing those changes.
- Add Search Console integration only after OAuth is connected; never store tokens in frontend code.

Content opportunity workflow:

- Cluster real Harish-area customer questions by service and intent.
- Propose useful bilingual service guides, checklists, FAQs, and case studies.
- Require a human to confirm facts, local relevance, claims, permissions, and publication.
- Reject keyword stuffing, doorway/location-spam pages, copied competitor text, fake reviews,
  fabricated credentials, and scaled low-value AI pages.

## Data model (minimum)

- `growth_campaigns`: goal, audience, service, locale, status, owner, approved facts.
- `growth_assets`: campaign, format, file URL, alt text, QR destination/hash, scan result, version.
- `growth_posts`: channel, copy, asset, scheduled time, state, remote ID, error, idempotency key.
- `growth_approvals`: entity/version, approver, timestamp, decision, note.
- `growth_channels`: provider, connection state, scopes, account label; secrets remain server-side.
- `growth_events`: UTM/QR/campaign/channel/event/time with privacy-minimized attribution.
- `seo_routes`: locale/path, metadata, canonical, robots, schema, status, version.
- `seo_audit_runs` and `seo_audit_findings`: severity, rule, URL, evidence, resolution state.

## First release acceptance criteria

- Admin can create one bilingual campaign, generate all required copy/asset specifications,
  preview each crop, validate its QR, approve it, and place it on a calendar.
- Unconnected channels produce a complete share kit; connected channels expose a publish adapter
  but cannot publish without approval.
- Public routes expose correct route-specific metadata and JSON-LD in rendered HTML.
- Hebrew and English canonical URLs are crawlable and reciprocally linked.
- A daily CI job produces an SEO audit artifact and the admin can see findings/history.
- All admin screens are usable at 360 px, keyboard accessible, and fully translated.
- Tests cover permissions, approval gates, scheduling idempotency, QR validation, metadata generation,
  sitemap contents, hreflang, and noindex protection.

## Production release and restore contract

- Changes are prepared and tested in the repository, then deployed to the live Railway site promptly;
  do not expose an unverified intermediate build to visitors.
- Every verified production deployment gets a dated immutable Git tag and release record containing
  commit SHA, UTC and Asia/Jerusalem timestamps, migration level, build/test summary, and health-check result.
- The admin **Restore latest good version** control must display that release label and timestamp.
- The latest-good pointer advances only after production health, public routes, admin access, database
  compatibility, and a smoke quote/customer-registration flow pass.
- Restore creates a fresh pre-restore database/content snapshot, records the actor and audit event,
  restores the latest-good presentation/content snapshot, and redeploys the tagged code through the
  normal trusted pipeline. It must never delete accounts, leads, jobs, providers, payments, or uploads.
- Database migrations must be backward-compatible with the latest-good release or provide an explicit,
  tested recovery migration. A Git checkout alone is not considered a complete database rollback.
- The restore action requires an explicit confirmation showing the target version/time and scope.

## Delivery order

1. Metadata/schema/sitemap foundations and daily read-only SEO audit.
2. Growth Center shell, campaign data model, approvals, calendar, and share kits.
3. Brand/QR export pipeline and scan validation.
4. Official channel adapters behind feature flags.
5. Search Console and privacy-safe reporting.
