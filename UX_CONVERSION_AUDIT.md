# CleanFixHarish UX, Service Design, and Conversion Audit

**Prepared as:** Senior UX/UI, mobile, accessibility, conversion, and service-design review  
**Date:** 19 August 2026  
**Scope:** Current CleanFixHarish frontend and its customer, provider, owner, and viewer journeys  
**Constraint:** Read-only review. No code or production data was changed.

## 1. Evidence and assumptions

### Directly observed in the current frontend

- Public routes exist for Home, Services, How it Works, Why Trust Us, Partners, About, Quote, Account, and Accessibility.
- The homepage offers two primary contact paths: the quote form and WhatsApp.
- The quote form captures name, phone, optional WhatsApp number, requested service, Harish area, and a text description.
- The form creates a lead, but it does not currently collect photographs, desired appointment time, property details, urgency, consent, or price expectations.
- Google sign-in supports customer and local-business/provider account types.
- The customer account describes future request history and job tracking, but these are not yet presented as active customer tools.
- A provider can apply, see application status, and contact CleanFixHarish. Availability, assigned jobs, and payment/quality records are explicitly marked as future tools.
- The owner dashboard includes leads, WhatsApp operations, jobs, providers, services/pricing, price references, website editing, follow-ups, platforms, settings, AI assistance, and protected viewer management.
- Approved viewers receive a read-only dashboard and owner-only sections display “Only Aviel can see this.”
- The public site is bilingual in important areas, but several strings and operational labels remain hard-coded in English.
- Responsive classes are present throughout, including a mobile menu and mobile card layouts.
- Existing imagery includes a hero, service scenes, Harish imagery, a CTA scene, brand assets, and responsive image sizes.
- Effects currently include hover lift, slight image zoom, logo shine, shadows, blur, and accessible reduced-motion overrides.
- During a limited network check, the apex domain returned HTTP 200. The `www` host did not resolve from the audit environment and two direct route requests timed out. This is an operational observation, not proof of a persistent production fault; verify it independently before launch.

### Assumptions requiring owner or market validation

- CleanFixHarish intends to act as the responsible service coordinator, not merely a lead directory.
- Revenue will initially come from a margin retained on completed jobs.
- Harish residents are the first customer segment.
- CleanFixHarish does not yet have a verified body of public reviews, completed-job photographs, service-level guarantees, or a large vetted provider network.
- WhatsApp will remain the primary assisted sales and support channel during launch.
- Payment, provider payouts, refunds, and invoices are not yet fully operational inside the product.
- The first launch should prioritize handyman, move-in/setup, and high-value cleaning work, subject to actual local demand and margin tests.

These assumptions must not be presented to customers as facts until validated.

## 2. Executive diagnosis

The site currently looks like a polished local-services website attached to a promising operating dashboard. It does **not yet behave as one complete service product**.

The missing loop is:

> Need → qualified request → clear scope and price → booked provider → completed job → payment → quality check → review/repeat work → measured margin

The highest-value work is therefore not “add more options.” It is to make this loop complete, simple, trustworthy, and measurable. The interface should make one promise:

> **Tell CleanFixHarish what needs attention. We clarify the work, coordinate a suitable local professional, keep you informed, and remain responsible until the job is closed.**

Every screen should help the user understand one of four things:

1. What CleanFixHarish can solve.
2. Why the customer can trust the process.
3. What happens next and what it may cost.
4. Who is responsible if something changes or goes wrong.

## 3. Required product roles and their jobs

| Role | Main job | Required feeling | Business outcome |
|---|---|---|---|
| Customer | Get a home problem solved with low uncertainty | “Someone responsible is handling this.” | Qualified paid job, repeat customer, review |
| Provider | Receive suitable work with clear scope and reliable payment | “This job is real, fair, and organized.” | Reliable fulfillment, controlled provider cost |
| Owner / Aviel | Control demand, dispatch, customer communication, quality, and margin | “I know what needs attention and what makes money.” | Operational control and profitable decisions |
| Read-only viewer | Experience the real system without exposure or mutation | “The product works, but private controls are protected.” | Safe demonstration to partners/friends/investors |

## 4. Complete customer journey

### Stage 1 — Recognition

**Customer question:** “Can these people solve my specific problem in Harish?”

**Current evidence:** Homepage hero, service cards, service page, local Harish cues, bilingual presentation.

**Required experience:**

- A concrete outcome-focused headline, not a broad corporate description.
- Three priority offers above the fold or immediately below it.
- Starting price or “priced after photos” rule for each priority offer.
- Realistic service photography showing the work, not decorative local imagery alone.
- Clear service area and response expectations.

**Trust/conversion role:** Reduces ambiguity and routes the customer to the right service.

### Stage 2 — Evaluation

**Customer question:** “What exactly is included, how much might it cost, and why should I trust this?”

**Current evidence:** Service cards contain descriptions and optional starting prices; trust page contains six claims.

**Required experience:** A detail page for each priority service containing:

- Included tasks and exclusions.
- Starting price or quote method.
- Materials, VAT, travel, extra time, and urgency rules.
- Expected duration and preparation checklist.
- Genuine proof: completed work, verified provider process, real reviews when available.
- A short FAQ and direct request CTA.

**Trust/conversion role:** Prevents low-quality enquiries and price surprises.

### Stage 3 — Request

**Customer question:** “Can I explain the problem quickly without repeating myself?”

**Current evidence:** Quote form captures identity, contact, service, area, and description; WhatsApp is available.

**Required minimum request flow:** A short mobile-first wizard:

1. Choose service.
2. Describe the job and upload up to five photographs.
3. Add address/area, urgency, and preferred time window.
4. Enter name and phone; provide clear consent and privacy notice.
5. Review and submit.

Keep WhatsApp as an equal assisted route and prefill the same structured information.

**Trust/conversion role:** Improves quote accuracy, reduces follow-up messages, and creates useful operational data.

### Stage 4 — Confirmation and quote

**Customer question:** “Did you receive it, and what happens next?”

**Current evidence:** A success screen confirms the request and suggests WhatsApp.

**Required experience:**

- Unique request number.
- Submitted summary with photographs.
- Specific next-response expectation without making an unproven guarantee.
- Choice to continue in WhatsApp.
- Status link/account connection that does not require a second application.
- Quote presented with scope, included/excluded items, price, expiry, and accept/request-change actions.

**Trust/conversion role:** Prevents lost leads and converts inquiry into commitment.

### Stage 5 — Booking and fulfillment

**Customer question:** “Who is coming, when, and what do I need to do?”

**Required experience:**

- Appointment date/time window.
- Provider first name/business identity only after assignment and approval.
- Scope summary, address, access notes, and preparation checklist.
- Reschedule/cancel/support actions.
- Progress states: request received, clarification, quoted, confirmed, provider assigned, on the way, in progress, completed, quality check.

**Trust/conversion role:** Reduces no-shows, customer anxiety, and costly coordination.

### Stage 6 — Payment and quality close

**Customer question:** “What am I paying for, and what if the result is not right?”

**Required experience:**

- Deposit/full-payment action only after policies and payment provider are approved.
- Price breakdown, receipt/invoice status, cancellation/refund summary.
- Completion confirmation with issue-reporting route.
- Rating/review request only after actual completion.
- Rebook and referral action after satisfaction.

**Margin role:** Makes revenue attributable to a completed job and creates repeat business.

## 5. Complete provider journey

### Discovery and application

The existing account flow supports provider applications. Improve it with service categories, service areas, availability, business/tax details, insurance/qualifications where appropriate, examples of work, and consent to verification. Do not publicly call a provider “verified” until the review has actually occurred.

### Review and activation

Aviel needs a visible checklist: identity, skill fit, service area, rate expectation, responsiveness, documents, trial job, and approval decision. Store the decision and reviewer date.

### Job offer

A provider should receive only relevant work with scope, photographs, location zone, time window, expected provider payment, materials responsibility, and accept/decline deadline. Customer private information should remain limited until assignment.

### Fulfillment

Provider actions should be mobile-first: accept, on the way, arrived, start, add completion photographs, report issue, complete. Each action needs a timestamp and owner visibility.

### Payment and performance

Provider sees agreed payout, payout status, deductions only when contractually valid, customer-quality outcome, and private improvement feedback. Aviel sees acceptance rate, arrival reliability, rework rate, customer score, and gross margin by provider/service.

**Do not build a large provider marketplace yet.** Begin with a controlled job-offer and completion workflow for three dependable providers.

## 6. Complete owner / Aviel journey

### Morning overview

The current dashboard already surfaces lead, job, follow-up, and provider counts. Prioritize actionable queues over vanity totals:

1. Unanswered leads by age.
2. Quotes awaiting action.
3. Today’s jobs and risks.
4. Unassigned confirmed jobs.
5. Customer issues/rework.
6. Payments collected and provider payouts due.

### Lead qualification

One record should show contact, service, photos, scope, source, urgency, estimated customer value, and next action. Status changes should require or suggest the next step. Avoid parallel data in WhatsApp and the dashboard with no reconciliation.

### Quote and dispatch

Aviel needs quote preparation, margin preview, send/approve tracking, provider match, job assignment, and a complete activity history. The product should warn if price minus provider payout and direct costs falls below a chosen margin floor.

### Fulfillment and quality

Today view, exception alerts, provider status, completion evidence, customer follow-up, issue/rework case, and review request belong in one job record.

### Business control

Add a simple profitability view only after payment/cost data is reliable:

- Leads by source.
- Qualified-to-quote and quote-to-book rates.
- Revenue collected.
- Provider payout and direct cost.
- Gross margin per completed job/service/source.
- Cancellation and rework cost.
- Repeat-customer rate.

The dashboard should never claim “profit” from quoted or unpaid value.

## 7. Complete read-only viewer journey

### Entry

- Viewer signs in with an approved Google email.
- A clear persistent read-only banner explains the tour.

### Exploration

- Viewer can navigate overview, leads, jobs, providers, and services using masked/sample-safe fields.
- Disabled or unavailable actions must look visibly inactive and explain why.
- Private areas display the exact owner-only message.

### Exit

- Sign out remains obvious.
- Removing viewer access should invalidate access promptly, not only after a long token lifetime.

### Acceptance rule

No viewer request may create, update, publish, delete, restore, message, upload, or reveal unmasked customer/provider/private business information. This must be verified server-side, not only hidden in the interface.

## 8. Recommended public page architecture

### Primary navigation at launch

1. Services
2. How it works
3. Why CleanFixHarish
4. For providers (secondary)
5. **Request service** (primary button)

Keep WhatsApp persistent. Move About, Accessibility, sign-in, provider information, and legal information into secondary navigation/footer where appropriate. Six equal desktop navigation links plus multiple account/install/contact actions create too many competing choices.

### Homepage hierarchy

1. Local value proposition + Request service + WhatsApp.
2. Three priority offers with price rule.
3. Four-step managed-service process.
4. Concrete trust evidence.
5. Real work photography / before-and-after only when authentic.
6. Testimonials only after verified jobs.
7. Service-area and response/process expectations.
8. Final request CTA.

### Required detail screens

- Service detail template.
- Multi-step request.
- Request confirmation/status.
- Quote review and acceptance.
- Booking/job status.
- Payment/receipt, when operationally ready.
- Completion/issue/review.

## 9. Mobile requirements

The mobile experience should be the primary operational design, not a smaller desktop copy.

### Public site

- Test at 320, 360, 390, 430, and 768 CSS pixels with English and Hebrew.
- No horizontal page scrolling at 200% zoom.
- Keep one clear sticky bottom action bar: **Request service** and **WhatsApp**. Avoid collision with the current floating WhatsApp control and safe-area insets.
- Touch targets at least 44 × 44 CSS pixels with 8 pixels between adjacent actions.
- Hero message and CTA must appear before a large image consumes the first screen.
- Service cards should show outcome, starting price/quote rule, and one action without requiring hover.
- Request wizard saves progress locally and tolerates keyboard opening, rotation, backgrounding, and slow image uploads.
- Use correct mobile keyboard types and autocomplete for name, telephone, address, and email.
- Compress uploads before transfer and show per-file progress/retry.

### Provider mobile

- Today’s accepted job is the first screen.
- One-thumb actions: call support, navigate, on the way, arrived, start, complete, report issue.
- Offline/retry-safe status updates for poor connectivity.
- Never expose more customer data than the assigned job requires.

### Owner mobile

- Bottom or compact drawer navigation with the top five daily sections.
- Avoid dense desktop tables; use cards with a summary and drill-in detail.
- Persistent filters and clear active filter count.
- Destructive/publish/payment actions require confirmation and remain visually separated.
- Photo and message controls must work without horizontal overflow.

## 10. Bilingual and RTL requirements

- Every customer-facing string, validation message, empty state, email/SMS/WhatsApp template, status, and accessibility label must exist in English and Hebrew.
- Do not mix untranslated English operational labels into Hebrew flows unless they are accepted product names.
- Hebrew is RTL, but phone numbers, prices, times, email addresses, and codes need isolated LTR formatting.
- Icons that indicate direction must mirror correctly; universal icons should not be mirrored.
- Translation length must be tested rather than assumed. Buttons must wrap safely without reducing touch targets.
- Store content by meaning, not by visual position (`primary CTA`, not `left button`).
- Review Hebrew with a native speaker for clear, ordinary language rather than literal translation.

## 11. Accessibility audit and requirements

### Strengths observed

- Visible focus rules exist.
- A reduced-motion mode and `prefers-reduced-motion` support exist.
- Many icon-only controls have labels.
- Semantic form labels are used in the quote flow.
- Responsive layout avoids hover as the only public interaction.

### Problems to address

- Add a skip-to-main link and stable `main` landmarks/IDs.
- Announce route/page changes and move focus to the new page heading.
- Verify all icon-only buttons, menu triggers, color inputs, switches, status dots, and dialog close controls have meaningful accessible names.
- Do not use color alone for live/error/status meaning.
- Make form errors field-specific, linked with `aria-describedby`, and summarized on submit.
- Quote service `Select` marked required must expose required state and an accessible error when empty.
- Replace generic or repeated image alt text with a concise description of the visible service action; decorative imagery should use empty alt text.
- Validate contrast for gold text, muted text, pale borders, WhatsApp green text on light backgrounds, and translucent navigation states.
- Test 200% and 400% zoom, keyboard-only navigation, screen readers, and RTL with assistive technology.
- Avoid accessibility controls that imply compliance; the underlying product must work without requiring users to activate a special menu.

**Acceptance target:** WCAG 2.2 AA for public booking, accounts, provider workflow, owner critical workflows, and viewer tour.

## 12. Imagery direction and shot list

### Visual direction

Use documentary-premium local photography: warm Israeli daylight, modern Harish homes, ordinary residents, careful professionals, protected surfaces, organized tools, and calm coordination. Avoid generic luxury interiors, fantasy scenes, impossible before/after transformations, staged handshakes, unsafe ladder/electrical work, fake reviews/certificates, embedded text, or imagery implying a larger verified workforce than exists.

Brand cues may include restrained navy (`#102E38`), gold (`#B8842F`), and ivory (`#F7F2EA`) clothing/details. Branding should not dominate the work.

### P0 shots

1. Hero: CleanFixHarish coordinator/handyman at a modern Harish apartment doorway reviewing the job with a homeowner and phone/work order. Landscape with safe copy space for both LTR and RTL crops.
2. Handyman carefully installing or mounting an everyday item with floor/wall protection.
3. Post-renovation cleaning with controlled dust-removal progress.
4. Coordinator handling a structured WhatsApp request; phone content unreadable or replaced by a designed overlay.
5. Homeowner and provider inspecting the completed result together.

### P1 shots

6. Move-in cleaning with keys and labeled boxes.
7. Safe AC-filter/indoor-unit cleaning.
8. Interior-safe window, frame, and track cleaning.
9. Honest local team portrait after providers are truly approved.
10. Quality-detail image: organized tools, surface protection, shoe covers/gloves.
11. Authentic before/after pairs using the same camera position and lighting.
12. Human-scale Harish neighborhood establishing image rather than aerial imagery alone.
13. Building committee/property-manager consultation.
14. Provider onboarding/checklist conversation.
15. Transparent price/scope explanation at the job site.

### Asset requirements

- Produce landscape master plus 4:5 and 1:1 crops.
- Generate 1536, 1024, 640, and 384 pixel responsive variants as appropriate.
- Prefer AVIF/WebP with JPEG fallback.
- Keep focal points safe for RTL/LTR art direction.
- Alt text must describe the real visible action, not repeat marketing copy.
- Replace generated launch photography with real completed-work photography as soon as consented material exists.

## 13. Safe effects and interaction design

Effects should explain structure and reward interaction, not create spectacle.

### Recommended

- 150–250 ms color/elevation transitions.
- 2–3% service-image scale on pointer hover only.
- Subtle section reveal once on scroll, with no delayed access to content.
- Lightweight progress animation for request/quote/job stages.
- Clear success, warning, saving, saved, and error feedback.
- Optional gentle hero depth on large screens only if it does not affect performance or legibility.

### Avoid

- Autoplay video with sound.
- Continuous parallax or moving particles.
- Cursor-following effects.
- Large entrance animations that delay CTA visibility.
- Animated counters with unverified numbers.
- Fake live-activity popups, fake scarcity, or fake recent bookings.
- Effects on forms that move fields or buttons while users interact.

All motion must be disabled or reduced under `prefers-reduced-motion` and the existing reduced-motion setting.

## 14. Prioritized roadmap

### P0 — Minimum launch experience

1. Approve the single product promise and first three paid offers.
2. Create service detail pages with scope, exclusions, price rule, duration, and request CTA.
3. Upgrade the request flow with photos, preferred timing, urgency, address/area, consent, and a request number.
4. Create a clear lead → clarification → quote → booking → assignment → completion → follow-up status model.
5. Add owner next-action queues and complete job activity history.
6. Create quote scope, price, provider cost, and margin-preview workflow.
7. Add booking/assignment confirmation and customer status communication.
8. Establish provider verification and assignment checklist for the initial controlled network.
9. Instrument the conversion funnel and lead source.
10. Complete mobile, Hebrew/RTL, keyboard, screen-reader, and 200% zoom acceptance testing.
11. Verify apex and `www` domain routing, deep SPA routes, SSL, and Google redirect behavior.

**P0 definition of done:** One real customer can discover a service, submit useful details/photos, receive and accept a clear quote, obtain a confirmed booking/provider, complete the job, pay through the approved operating method, report an issue, and receive follow-up—while Aviel can see the status and gross margin of that job.

### P1 — Trust, retention, and controlled scale

1. Customer status/history connected to the same request.
2. Provider mobile job offer and fulfillment actions.
3. Payment collection, invoice/receipt, provider payout status, and refund handling after legal/accounting review.
4. Genuine review collection and completed-work gallery with consent.
5. Rebooking, referral, and repeat-service reminders.
6. Service-area and availability controls.
7. Profitability dashboard based on collected revenue and real costs.
8. Customer/provider notification preferences and complete bilingual templates.
9. Operational reports for response time, cancellations, rework, and provider reliability.

### P2 — Expansion only after repeatability

1. Maintenance subscriptions.
2. Property manager/building committee plans.
3. Multiple cities/service regions.
4. Automated provider matching with owner override.
5. AI-assisted scope/quote drafts with mandatory human approval.
6. AI-assisted WhatsApp summaries and response drafts with privacy controls.
7. White-label commercial product separated from CleanFixHarish production data and branding.

## 15. What should not be built yet

- An open self-service provider marketplace.
- Complex bidding or provider auctions.
- Fully automatic AI pricing or dispatch.
- Loyalty points, gamification, or a broad VIP program before core service history works.
- Dozens of low-volume service categories.
- Native iOS/Android apps; a strong responsive web/PWA workflow is sufficient for validation.
- Automated dynamic pricing without enough completed-job cost data.
- Large subscription plans before repeat demand is proven.
- Public numerical claims, ratings, provider counts, or response guarantees without evidence.
- The generic business-template product inside the CleanFixHarish production system.
- Heavy animation, 3D scenes, or decorative technology copied from another product without a clear customer or operational benefit.

## 16. Measurement plan

### Customer funnel

- Homepage/service detail → request-start rate.
- Request start → completion rate.
- Photograph-upload completion and form error rate.
- Request → qualified lead rate.
- Qualified lead → quote rate.
- Quote → accepted/paid booking rate.
- Median first-response and quote time.
- Booking → completion rate.
- Cancellation, issue, and rework rates.
- Review and repeat-booking rates.

### Unit economics

- Lead acquisition cost by source.
- Customer price actually collected.
- Provider payout and direct materials/payment/refund costs.
- Gross margin per completed job and service.
- Margin lost to cancellation, discount, refund, and rework.
- Contribution by source, provider, and repeat/new customer.

### Experience quality

- Mobile form completion time and abandonment step.
- Customer satisfaction after completion.
- Provider job acceptance and on-time arrival rates.
- Accessibility critical-error count.
- Core Web Vitals by mobile page.

Do not optimize clicks alone. Optimize completed, satisfactory, profitable jobs.

## 17. Measurable acceptance criteria

### Conversion

- At least 80% of test users can identify the primary offer and next action within five seconds.
- At least 90% of moderated mobile test users can submit a representative request without assistance.
- The request success screen always displays a request number and next step.
- Every lead source and funnel stage is recorded once, without duplicate events.

### Mobile

- No horizontal page scroll at 320 CSS pixels or at 200% zoom on critical routes.
- Primary actions remain visible and do not overlap safe areas, keyboards, dialogs, or the WhatsApp action.
- All critical touch targets meet 44 × 44 CSS pixels.
- Request progress survives refresh/backgrounding until submission or explicit discard.

### Trust and service design

- Every priority service states inclusions, exclusions, price rule, and next step.
- No public trust claim lacks evidence or an honest process explanation.
- Every confirmed job has one owner, one provider, one customer scope, one agreed price, and one visible next action.
- Every completed job can record collected revenue, provider cost, issue/rework status, and follow-up outcome.

### Accessibility and bilingual quality

- Zero critical WCAG 2.2 AA violations on all P0 flows using automated and manual testing.
- Keyboard-only users can complete every P0 flow with visible focus.
- English and Hebrew contain the same operational meaning and validation coverage.
- Screen-reader testing passes in one common Windows/browser combination and one common mobile combination.

### Viewer safety

- Server tests prove that viewers cannot mutate any business resource.
- Viewer payloads contain no unmasked private fields.
- Revoked viewers lose dashboard access promptly.

## 18. Recommended immediate decision workshop

Before implementation, Aviel and the Product Discovery Lead should approve these five decisions in one short workshop:

1. The first customer segment.
2. The first three paid offers.
3. The promise and responsibility boundary.
4. The pricing/margin rule for each offer.
5. The exact P0 customer journey and status definitions.

Once those are approved, implementation tasks can be given to Cursor in small, testable units. The product decisions must remain human-owned; Cursor should audit and implement the agreed product rather than independently redefine the business.
