# WEBSITE REQUIREMENTS

## Purpose

This file is the source of truth for the CleanFixHarish website implementation.
Atoms AI and Codex must consult it before proposing or implementing website changes.

## Core Build Rules

- Preserve the existing Atoms project before changing it.
- Audit first, then propose the smallest Phase 1 change set.
- Handyman services remain the primary growth focus.
- Mobile first, fast loading, bilingual, and local SEO focused.
- Hebrew and English must both be complete and natural.
- Use correct RTL for Hebrew and LTR for English.
- WhatsApp is the primary conversion channel.
- Avoid duplicate tools, unnecessary integrations, and premature automation.
- GitHub is the source of truth for code and rollback.
- Do not deploy, change DNS, enable paid services, or consume substantial credits without approval.

## Full Product Target

The long-term product is a visually exceptional, fully functional, secure bilingual PWA,
not merely a static landing page. It should remain simple for the owner to operate even
when its customer-facing capabilities become advanced.

Required product areas:

- premium responsive public website
- reliable PWA installation and app-like behavior
- secure customer registration and sign-in with Google
- customer account area
- owner-controlled admin panel
- lead, quote, booking, customer, service, content, and partner management
- secure photo and file handling when required
- useful customer-service bot with human handoff
- useful repeat-visit features that justify keeping the PWA installed
- analytics, audit history, backups, and safe rollback

These capabilities must be implemented in controlled phases after auditing the existing
Atoms project. “Fully functional” does not authorize unnecessary complexity, duplicate
systems, unapproved spending, or insecure shortcuts.

## Visual Quality for Every Section

- Every section requires a deliberate visual purpose, hierarchy, and responsive composition.
- Use the approved Golden Ratio system where it improves composition.
- Use consistent photography, icons, lighting, palette, typography, and spacing.
- Provide complete loading, empty, error, success, disabled, hover, focus, and mobile states.
- Avoid decorative sections that do not improve trust, clarity, conversion, or usefulness.
- Preserve performance: compress responsive images, avoid unnecessary animation, and prevent layout shifts.
- Accessibility and readability take priority over rigid visual ratios.

## Admin Panel

The owner must be able to manage the business without editing code.

The admin panel is the CleanFixHarish control center for the whole website and operating
application. It must be fully functional, responsive, bilingual where appropriate, and
usable from desktop and mobile. It is not a collection of decorative dashboard cards.

Target capabilities:

- dashboard summary
- leads and contact requests
- customer records
- quotes and quote status
- bookings and job status
- service definitions and visibility
- website content and bilingual copy
- media and approved photos
- visual system controls: approved logos, colors, section backgrounds, image assignments,
  alt text, visibility, ordering, and safe preview before publishing
- page and section controls: bilingual content, navigation, CTAs, SEO metadata, draft,
  scheduled, published, disabled, and archived states
- partner/business records and routing status
- WhatsApp templates and contact routing
- bot knowledge and approved answers
- users, roles, and access
- customer profiles, customer numbers, VIP membership, consent, preferences, and account status
- inbox for leads, contact messages, quote requests, bot handoffs, and internal notes
- notifications and reusable email/WhatsApp message templates
- approved integration and plugin registry with status, permissions, health, owner, cost,
  configuration guidance, and safe enable/disable controls
- feature flags for unfinished or future capabilities
- system health, failed jobs, form-delivery checks, PWA version, and connection status
- analytics and source attribution
- activity/audit history
- export and backup

Every management area must provide search, filtering, sorting, pagination where needed,
clear empty/loading/error/success states, confirmation for destructive actions, and a safe
draft/preview workflow. Media replacement and content publishing must support rollback.

Plugin and integration controls must never expose secret values in the browser. The panel
may show whether a connection is healthy and allow approved configuration actions, but
OAuth authorization, secret rotation, billing changes, DNS changes, deployment, and paid
service activation require explicit owner confirmation.

Admin access must be separate from ordinary customer access and protected by role-based
authorization. Hiding an admin link is not security. Sensitive actions require server-side
authorization, audit logging, and re-authentication where appropriate. Start with an Owner
role and introduce narrower Admin, Content Editor, Support, and Operations roles only when
real team access is needed.

## Customer Accounts and Google Authentication

- Use Google sign-in through the existing approved authentication stack if one exists.
- Audit Atoms authentication and the existing backend before choosing or adding a provider.
- Do not add a second authentication or database system when the current one is adequate.
- Request the minimum identity permissions required.
- Never store Google passwords.
- Use secure server-side session handling supported by the chosen platform.
- Protect account, booking, quote, photo, and customer-history data with authorization checks.
- Provide sign-out, account-data review, and a documented account-deletion request process.
- Do not enable Google OAuth or create credentials until the redirect domains, privacy policy,
  authorized origins, data handling, and owner approval are ready.

Potential customer account features:

- saved contact and property details
- request and quote history
- booking/job status
- secure photo submission
- saved service preferences
- home-maintenance checklist
- useful seasonal maintenance reminders
- support and human-contact handoff

## Customer-Service Bot

The bot should provide real service value, not novelty.

Approved target functions:

- answer from approved CleanFixHarish knowledge only
- explain services and intake requirements
- help customers choose the correct service
- collect a structured service request
- prepare a WhatsApp handoff to `+972508275505`
- suggest safe, low-risk home-maintenance guidance
- show when an answer is uncertain
- route pricing, booking, complaints, emergencies, and unusual cases to a human

Bot restrictions:

- no invented prices, guarantees, availability, credentials, or policies
- no diagnosis of hazardous electrical, gas, structural, medical, or emergency situations
- no autonomous booking or customer-data changes without authenticated confirmation
- no training on private customer conversations without explicit policy and consent
- no OpenAI API or other paid AI service until a proven need, cost estimate, privacy review,
  usage limit, and owner approval exist
- provide a non-bot contact path at all times

Use deterministic FAQ/search and structured flows first where they solve the task without
AI usage. Add AI only where it creates measurable customer value.

## Retention and Useful PWA Features

Prioritize useful reasons to return:

- service-request and job-status tracking
- saved property/service profile
- maintenance checklist and seasonal reminders
- photo history for submitted work requests
- simple repeat-service request
- helpful Harish-relevant home-care guidance
- saved quotes and completed-job information
- direct human support through WhatsApp

Do not add feeds, points, gamification, notifications, or content systems without a clear
customer benefit and an approved operating workflow.

## PWA Installation and Reliability

Audit and repair the existing installation experience across supported desktop, Android,
and iOS browsers.

Required checks:

- valid web app manifest
- correct app name, short name, description, theme color, background color, start URL, scope,
  and standalone display behavior
- complete maskable and standard icon set
- registered service worker with a controlled caching and update strategy
- HTTPS deployment
- functional offline or connection-loss fallback
- install control shown only when the platform supports the relevant flow
- clear platform-specific instructions when automatic install prompting is unavailable
- no repeated or misleading install prompts
- safe update notification and recovery from stale caches
- installed-app navigation, deep links, forms, authentication, and logout tested

## Security and Privacy Baseline

- inventory all data collected and why it is needed
- collect the minimum personal data
- keep secrets out of client code and GitHub
- validate and sanitize all input server-side
- enforce authorization server-side for every protected operation
- use secure upload validation, file-size/type limits, and private storage where appropriate
- protect against spam, abuse, injection, cross-site scripting, request forgery, and account enumeration
- rate-limit authentication, forms, uploads, bot usage, and sensitive operations
- use secure headers and HTTPS
- maintain dependency and vulnerability review
- keep audit logs for important admin actions
- define backups and test restoration
- provide privacy, terms, accessibility, and contact information appropriate for Israel
- complete a security and accessibility review before production launch


## Official Contact Routing

All services, service providers, partner listings, business listings, quote requests,
and customer CTAs must route through CleanFixHarish unless the owner explicitly approves
an exception.

### WhatsApp and Phone

- Display format: `050-827-5505`
- Israeli link format: `tel:0508275505`
- International / WhatsApp format: `+972508275505`
- WhatsApp base URL: `https://wa.me/972508275505`

Do not publish alternate service, provider, partner, or business WhatsApp numbers.
Use service-specific pre-filled messages while keeping the destination number identical.

### Email

- Official email: `info@cleanfixharish.co.il`
- Email URL: `mailto:info@cleanfixharish.co.il`

Do not publish personal email addresses or alternate business emails on the website.

## Accessibility and Israeli Standard

Build toward Israeli Standard 5568 at accessibility level AA and the applicable Israeli
Equal Rights for Persons with Disabilities service-accessibility requirements. This is an
implementation target, not a legal certification. Final compliance and any exemption or
formal declaration should be reviewed by a qualified Israeli accessibility professional.

### Required Technical Accessibility

- Semantic HTML and logical heading order.
- Hebrew `lang="he"` and `dir="rtl"`; English `lang="en"` and `dir="ltr"`.
- Complete keyboard operation using Tab, Shift+Tab, Enter, Space, and Escape where relevant.
- Visible focus indicators.
- A skip-to-main-content link.
- Accessible navigation and language switching.
- Meaningful alternative text for informative images; empty alt text for decorative images.
- Sufficient AA color contrast.
- Text resizing and browser zoom without content loss or horizontal obstruction.
- Form labels, instructions, required-field identification, validation, and understandable errors.
- Accessible names for icons, controls, WhatsApp links, and buttons.
- Touch targets appropriate for mobile use.
- No meaning communicated by color alone.
- Captions or transcripts for future audio/video content.
- Respect `prefers-reduced-motion` and avoid flashing content.
- Screen-reader-friendly dynamic updates and status messages.
- Accessible file formats or accessible alternatives for downloadable documents.

### Accessibility Options

The site may include a clearly labeled accessibility control offering useful options such as:

- increased text size
- higher contrast
- reduced motion
- emphasized links
- reset to default

These controls are optional enhancements. They do not replace semantic HTML, keyboard
support, screen-reader compatibility, testing, or the accessibility statement.

### Accessibility Statement

Provide a dedicated, currently disabled/unpublished accessibility section or page during
development. Enable it before public launch after the final details are confirmed.

It should include:

- the accessibility standard and level targeted
- accessibility measures implemented
- known limitations and third-party limitations
- last review date
- instructions for reporting an accessibility problem
- an accessibility contact method using `info@cleanfixharish.co.il`
- phone contact using `050-827-5505`

Do not claim certified compliance until the site has been tested and the claim is supportable.

## Golden Ratio and Visual Layout

- Use the Golden Ratio `1:1.618` as a composition guide.
- Desktop hero: approximately 38% copy and 62% image.
- Service cards: approximately 38% visual and 62% content/CTA.
- Place important subjects near Golden Ratio intersections.
- On mobile, prioritize readability and accessibility over preserving desktop ratios.
- Follow `CleanFixHarish_Brain/CleanFixHarish_Visual_System.md`.

## Photography

- Photorealistic images only.
- Bright natural daylight and soft shadows.
- Realistic Israeli homes and small offices, not luxury mansions.
- Calm, warm, clean, precise, and trustworthy.
- Consistent lighting and color temperature across the site.
- Avoid staged stock smiles, HDR, heavy grading, dark interiors, and chaotic tools.

## Atoms and Credit Governance

Codex should perform local planning, prompt refinement, code review, and any work that can
be completed safely without Atoms credits. Use Atoms for work that requires its existing
project environment, backend, or platform-specific implementation.

Before asking Atoms to build:

1. Review the request against the project files.
2. Inspect and preserve the existing implementation.
3. Prepare one bounded prompt.
4. Estimate the likely build/credit impact when possible.
5. Request owner approval for material or paid work.
6. Review Atoms output before issuing another build prompt.
