# CleanFixHarish P0 Product Contract

**Status:** Implementation-ready product contract  
**Owner:** Aviel Jahav  
**Product model:** Managed local home-services operator  
**Initial operating area:** Harish, Israel  
**Validation horizon:** First 20 paid jobs  
**Document date:** 21 August 2026

## 1. Purpose

This contract defines the smallest complete CleanFixHarish product that can take a real customer from a home-service request through a controlled quote, provider assignment, completed job, payment, quality close, and repeat-work opportunity.

P0 is not an open marketplace, a reverse-auction platform, a fully autonomous AI system, or a multi-business SaaS product. It is the operating system for a carefully managed local service company.

The P0 promise is:

> Tell CleanFixHarish what needs attention. We clarify the work, provide a clear quote, coordinate a suitable provider, keep the customer informed, and remain responsible until the job is properly closed.

## 2. Current repository foundation

The existing repository already provides useful foundations:

- Public website and service pages.
- Public request/lead intake.
- Google authentication and account profiles.
- Owner/admin and masked read-only viewer access.
- Basic leads, partners/providers, services, and jobs.
- Verified national pricing references.
- Owner-reviewed price estimates.
- Private customer quotes with hashed access tokens.
- Customer quote acceptance and decline.
- Website Studio and protected restore point.
- Advice-only AI Assistant.
- PWA manifest and service worker.
- An early Android customer application for request submission and quote decisions.

These foundations do not yet form a complete operational loop. P0 must connect them through the canonical entities, states, rules, screens, and acceptance criteria below.

## 3. Product principles

1. **One source of truth.** Web, PWA, Android, and future iOS clients use the same backend records and status transitions.
2. **Human approval at material decisions.** Aviel approves customer price, provider payout, assignment, refund, and financial override.
3. **No invented certainty.** The product must not claim unverified availability, reviews, response times, provider verification, prices, revenue, or completed work.
4. **Managed accountability.** CleanFixHarish remains the customer’s responsible coordinator through quality close.
5. **Scope before price.** A price is valid only for a written scope and exclusions.
6. **Quality before lowest price.** Providers are selected by suitability and reliability, not a lowest-bid auction.
7. **Collected money is revenue.** Quotes, accepted quotes, and scheduled jobs are not collected revenue.
8. **Mobile-first field work.** Customer intake and provider job actions must work comfortably on a phone.
9. **Privacy by role.** Each role sees only the data necessary for its job.
10. **Auditability.** Material transitions record actor, timestamp, previous state, new state, and reason.

## 4. P0 roles and permissions

### 4.1 Owner/admin

May:

- View and manage all operational records.
- Qualify requests.
- Prepare and approve estimates and quotes.
- Publish private quote links.
- Vet and activate providers.
- Set provider payout and assign jobs.
- Record customer payments and provider payouts.
- Approve scope changes, refunds, rework, and exceptions.
- Close quality cases and jobs.
- Manage website content, services, viewers, and business settings.

### 4.2 Customer

May:

- Submit and update their own request.
- Upload request media.
- View their private request status and quote.
- Accept, decline, or request a quote change.
- Confirm or request a schedule change.
- View customer-safe job progress.
- Pay through an approved flow when activated.
- Confirm satisfaction or report an issue.

May not view provider payout, internal margin, provider private records, other customers, or internal notes.

### 4.3 Provider

May:

- Maintain P0-relevant profile and availability information.
- View only job offers sent to that provider.
- Accept or decline an offer.
- View assigned job scope, agreed payout, schedule, and necessary customer information.
- Record on-the-way, arrival, start, issue, and completion actions.
- Upload completion evidence.
- View their own payout state.

May not change customer price, approve extras, view company margin, view competing providers, or access unrelated customer records.

### 4.4 Read-only viewer

May:

- Explore approved masked dashboard areas.
- See workflow structure, service catalogue, and non-sensitive operational totals.

May not:

- Save, publish, delete, message, assign, approve, restore, charge, upload, export sensitive data, or alter records.
- View real customer identity, contact details, address, media, messages, notes, quote tokens, financial amounts, credentials, AI context, or private system controls.

## 5. Canonical entities

P0 may extend current tables or add related tables, but these concepts must be represented without duplicating authoritative state.

### 5.1 Account

Required fields:

- `id`
- `auth_user_id`
- `email`
- `role`: `owner`, `customer`, `provider`, or `viewer`
- `display_name`
- `preferred_language`: `he` or `en`
- `is_active`
- `created_at`, `updated_at`

### 5.2 Customer

Required fields:

- `id`
- optional `account_id`
- `full_name`
- `phone`
- optional `whatsapp`
- optional `email`
- preferred language
- consent/communication fields and timestamps
- created/updated timestamps

Anonymous request submission remains allowed. An authenticated account may be linked later without duplicating the customer.

### 5.3 Service

Required fields:

- `id`
- English and Hebrew name/description
- category
- scope summary
- exclusions summary
- pricing method: `starting_price`, `photo_quote`, or `site_visit`
- optional public starting price and price unit
- active/public status
- required provider capability tags
- expected duration range where approved

### 5.4 Service request

The current `leads` concept becomes the P0 service-request record.

Required fields:

- `id`
- customer linkage and contact snapshot
- service linkage and requested-service snapshot
- area and address/access fields
- customer description
- structured scope answers
- urgency
- preferred date/time windows
- source/campaign
- status
- priority
- next action
- next-action due timestamp
- qualification/loss reason
- assigned owner
- created/updated timestamps

### 5.5 Media attachment

Required fields:

- `id`
- owner entity type and ID
- media type
- private storage key/URL
- original filename
- MIME type and size
- customer/provider/owner source
- consent or usage classification
- created timestamp

Private customer and provider evidence must not be placed in publicly enumerable storage.

### 5.6 Price evidence and estimate

Continue using the current pricing-source, observation, local-evidence, and estimate foundations.

An approved estimate requires:

- service request or explicit standalone scope
- verified reference evidence
- geography
- written work description
- assumptions and exclusions
- customer minimum and maximum
- provider budget/floor
- owner identity and approval timestamp
- non-binding disclaimer

### 5.7 Customer quote

Continue using the current private token model.

Required fields:

- estimate and request linkage
- final customer total
- VAT treatment
- deposit requirement
- exact included scope
- exclusions
- materials/travel/parking treatment
- terms and cancellation summary
- expiry
- status and event timestamps
- creator/approver
- hashed public token only

### 5.8 Booking

Required fields:

- `id`
- accepted quote and request linkage
- status
- service address
- requested and confirmed time windows
- access/preparation notes
- deposit requirement and state
- cancellation/reschedule reason
- created/updated timestamps

### 5.9 Provider profile

The current `partners` concept may remain the provider directory foundation.

Required P0 fields:

- account linkage where applicable
- identity/business/contact information
- services/capability tags
- service areas
- approval state
- vetting checklist state and reviewed timestamp
- licence/insurance restrictions where relevant
- payout expectations
- availability summary
- active/paused/rejected state
- internal quality notes

### 5.10 Assignment offer

Required fields:

- `id`
- booking/job linkage
- provider linkage
- offered scope snapshot
- general area before acceptance
- schedule
- provider payout
- materials responsibility
- response deadline
- status
- accepted/declined/expired timestamp and reason

One job may have sequential offers. P0 does not expose competing bids.

### 5.11 Job

Required fields:

- request, quote, booking, customer, provider, and accepted-assignment linkage
- immutable scope-at-confirmation snapshot
- customer price snapshot
- agreed provider payout snapshot
- status
- service address and access notes
- confirmed schedule
- customer/provider confirmation states
- work checklist
- actual arrival/start/completion timestamps
- completion notes
- created/updated timestamps

### 5.12 Audit/job event

Required fields:

- entity type and ID
- event type
- actor role and ID/email
- previous and new state
- reason/notes
- timestamp
- optional visibility: owner, customer, provider

### 5.13 Scope-change request

Required fields:

- job linkage
- requested by
- description and evidence
- customer price change
- provider payout change
- schedule impact
- status
- owner decision
- customer decision where customer price changes
- timestamps

No extra charge or materially expanded work is authorized before required approvals.

### 5.14 Customer payment record

Required fields:

- job/booking/quote linkage
- type: deposit, balance, refund, or adjustment
- amount and currency
- status
- method/provider
- external reference where applicable
- recorded/confirmed by
- paid/refunded timestamp
- notes

### 5.15 Provider payout record

Required fields:

- job/provider linkage
- agreed amount
- approved extras/adjustments
- final payable amount
- status
- approved by/at
- payment reference and paid timestamp
- hold/adjustment reason

### 5.16 Quality case

Required fields:

- job linkage
- status and severity
- customer outcome
- issue category and description
- evidence
- owner and due date
- resolution type
- rework/refund amount
- resolved timestamp

### 5.17 Review/repeat record

Required fields:

- job/customer linkage
- quality passed timestamp
- review-request state and timestamp
- optional verified review URL/reference
- repeat-work eligibility
- referral source/result where used

## 6. Canonical states and permitted transitions

All clients must use these backend-controlled transitions. Direct arbitrary status writes are not a P0-compliant implementation.

### 6.1 Service request

`new → needs_information → qualified → estimate_preparing → quote_ready → converted`

Permitted terminal close:

`new|needs_information|qualified|estimate_preparing|quote_ready → closed`

Required close reason:

- out of scope
- unserviceable area
- no capacity
- unreachable
- price objection
- duplicate
- spam
- customer cancelled
- other with note

### 6.2 Quote

`draft → owner_approved → published → viewed → accepted`

Alternative transitions:

- `published|viewed → change_requested`
- `published|viewed → declined`
- `published|viewed → expired`
- `draft|owner_approved|published|viewed|change_requested → superseded`

A superseding quote preserves the earlier quote and audit history.

### 6.3 Booking

`awaiting_deposit → awaiting_schedule → confirmed`

Alternative transitions:

- `awaiting_deposit|awaiting_schedule|confirmed → reschedule_requested`
- `reschedule_requested → confirmed`
- any nonterminal state → `cancelled`, with reason

If no deposit is required, booking begins at `awaiting_schedule`.

### 6.4 Assignment offer

`draft → offered → accepted → confirmed`

Alternative transitions:

- `offered → declined`
- `offered → expired`
- `accepted → withdrawn`, owner reason required

Only one assignment may be confirmed for a job at a time.

### 6.5 Job

`unassigned → assigned → confirmed → on_the_way → arrived → in_progress → completion_submitted → quality_check → completed`

Exception states:

- `replacement_needed`
- `customer_unavailable`
- `scope_change_pending`
- `unsafe_condition`
- `incident_open`
- `rework_required`
- `cancelled`

Returning from an exception requires an owner-recorded resolution.

### 6.6 Customer payment

`not_required` or `deposit_due → deposit_paid → balance_due → paid`

After funds exist:

- `deposit_paid|paid → partially_refunded`
- `deposit_paid|paid|partially_refunded → refunded`
- `deposit_paid|paid → disputed`

### 6.7 Provider payout

`not_calculated → proposed → approved → payable → paid`

Exception transitions:

- `proposed|approved|payable → held`
- `proposed|approved|held → adjusted`
- `held|adjusted → approved|payable`

### 6.8 Quality case

`not_started → evidence_received → customer_contacted → passed`

Issue path:

`customer_contacted → issue_opened → rework → resolved`

Alternative issue resolution:

- refunded
- escalated
- closed_no_action, with owner reason

## 7. Exact P0 screen priorities

### Priority 0A — Required for the first paid job

#### 7.1 Public request wizard

Steps:

1. Choose service.
2. Describe work and answer service-specific scope questions.
3. Upload photographs.
4. Add Harish area/address, access, urgency, and preferred time.
5. Enter contact, language, and communication/privacy consent.
6. Review and submit.

Must be usable on a 360-pixel-wide phone without horizontal scrolling.

#### 7.2 Request confirmation/status

Shows:

- request number
- submitted summary
- missing-information request when applicable
- current customer-safe status
- next expected step without an unapproved time guarantee
- WhatsApp/support action

#### 7.3 Admin Today

Ordered action queues:

- unanswered requests by age
- requests missing information
- estimates/quotes awaiting approval
- accepted quotes awaiting booking
- confirmed jobs without providers
- today’s jobs and exceptions
- completion awaiting quality close
- customer payments/provider payouts due

#### 7.4 Admin request detail

One record shows:

- customer and source
- scope answers and media
- service/area/urgency
- qualification state
- next action and due time
- related estimate, quote, booking, job, payment, and quality state
- complete audit timeline

#### 7.5 Admin quote workspace

Preserve the current evidence → estimate → owner approval → private quote structure, adding:

- provider payout floor
- expected direct costs
- expected contribution in shekels and percentage
- VAT treatment
- deposit rule
- margin warning and override reason

#### 7.6 Private customer quote

Shows only:

- exact scope and exclusions
- customer price and VAT treatment
- deposit
- materials/travel terms
- expiry
- accept, request change, or decline
- notice that acceptance does not itself process payment or guarantee a schedule

#### 7.7 Admin Job Command Center

One screen connects:

- customer/request
- accepted quote
- booking/schedule
- provider and payout
- confirmations
- checklist and evidence
- timeline/exceptions
- customer payment
- provider payout
- quality close
- review/repeat next action

#### 7.8 Provider secure job flow

P0 may use a secure mobile web/PWA flow rather than a full provider account application.

Provider actions:

- view offer
- accept/decline
- confirm schedule
- on the way
- arrived
- start
- request scope change/report issue
- submit completion evidence

#### 7.9 Money ledger

Owner can record and reconcile:

- deposit
- balance
- refund
- provider payable amount
- provider payout

Manual recording is acceptable before a payment processor is activated, but each entry requires actor, timestamp, amount, status, method/reference, and notes.

#### 7.10 Quality close

Owner can:

- review evidence
- contact customer
- record pass or issue
- create rework/refund/escalation action
- close job only after quality resolution
- trigger an honest review request

### Priority 0B — Required before scaling demand

#### 7.11 Provider directory and vetting

- application/profile
- capability and service area
- documented vetting checklist
- active/paused/rejected
- payout expectation
- performance/incident summary after real work

#### 7.12 Services/offers control

- approved launch offers only
- exact scope/exclusions
- pricing method
- provider capability requirement
- public visibility

#### 7.13 First-20 metrics

- funnel
- fulfillment
- quality
- contribution
- repeat/referral

#### 7.14 Viewer safety

- masked operational tour
- no mutation controls
- owner-only sections removed or clearly locked
- revocable access

## 8. Platform responsibility in P0

### Public responsive web

- Discovery, trust, service details, request wizard, authentication, private quote, secure status.

### Owner web/PWA

- Full operations and financial control.
- Desktop supports dense tables and schedule.
- Phone uses Today, Requests, Jobs, and More navigation.
- Tablet uses navigation rail and list/detail split view where practical.

### Customer mobile

- P0 is responsive web/PWA and secure links.
- Native Android remains an internal foundation and must use the same APIs/states.
- iPhone/iPad use responsive PWA in P0.

### Provider mobile

- P0 is secure responsive web/PWA focused on offers and field actions.

No P0 feature may require a customer or provider to install a native application.

## 9. Business rules

### 9.1 Managed-service rule

CleanFixHarish owns customer communication, scope confirmation, quote, assignment, quality resolution, and financial approval.

### 9.2 Quote rules

- No customer quote without a written scope and exclusions.
- No published quote without owner approval.
- Public starting prices are not final prices unless the package scope exactly matches.
- Complex cleaning and ambiguous work require photographs and may require site review.
- Acceptance creates a booking action; it does not automatically charge, schedule, or assign.

### 9.3 Provider rules

- Only active, appropriately qualified providers may receive offers.
- Regulated/specialist work requires the appropriate recorded capability/licensing gate.
- Provider selection considers capability, area, availability, reliability, quality, and sustainable payout.
- No lowest-bid reverse auction.
- Provider payout is agreed before assignment.
- Customer identity and exact address are limited until assignment is accepted/confirmed.

### 9.4 Assignment and scheduling rules

- No confirmed booking without capacity review.
- No job may have more than one confirmed provider.
- Customer and provider receive the same confirmed scope and schedule snapshot.
- Reschedule/cancellation records actor, time, and reason.

### 9.5 Scope-change rules

- Provider may not promise or charge an extra directly through the platform.
- A material change pauses affected work.
- Owner reviews scope, safety, customer price, provider payout, and schedule impact.
- Customer approves any customer-price increase before extra work.

### 9.6 Completion and quality rules

- Completion requires the applicable checklist and evidence.
- Provider submission does not alone make a job completed.
- Owner performs quality close and records customer outcome.
- Open safety, damage, rework, refund, or customer issues prevent final closure.

### 9.7 Review rules

- Review requests are linked to real completed jobs.
- No fabricated, purchased, staff-created, or provider-created customer review.
- Generated/stock imagery cannot be presented as completed customer work.

### 9.8 AI rule

P0 AI may explain, analyze, classify, summarize, and draft. It may not autonomously publish, quote, assign, charge, refund, pay, change customer records, or promise availability.

## 10. Monetization loop

The P0 money loop is:

1. Customer submits a qualified request.
2. Aviel prepares an evidence-backed estimate.
3. A provider payout floor/budget and direct costs are identified.
4. Aviel approves a customer price that satisfies the margin controls or records an override.
5. Customer accepts the private quote.
6. Required deposit is collected/recorded.
7. Provider accepts the agreed payout and performs the job.
8. Approved extras are added through the scope-change process.
9. Customer balance is collected/recorded.
10. Quality is closed.
11. Provider payout is approved and paid.
12. Actual contribution is calculated.
13. Review, repeat work, and referral are requested only after a satisfactory close.

### 10.1 Required calculations

`Expected contribution = customer price excluding handled VAT - provider payout - expected direct costs - payment fees - rework allowance`

`Expected contribution margin % = expected contribution / customer price excluding handled VAT`

`Actual contribution = collected customer money excluding handled VAT - paid provider amount - actual direct costs - payment fees - refunds - rework cost`

Do not label contribution as full accounting profit.

### 10.2 Owner-controlled financial settings

P0 must support owner-configured values rather than inventing them:

- minimum provider payout/floor by service or explicit job
- minimum contribution shekels
- minimum contribution percentage
- deposit rule
- maximum discount without override
- refund approval threshold
- rework allowance
- VAT mode/treatment

Changing these settings is owner-only and audited.

### 10.3 Financial truth rules

- Quoted amount is `quoted`, not revenue.
- Accepted amount is `accepted`, not revenue.
- Payment is revenue only when recorded as successfully collected.
- Provider payout is a cost only when payable/paid according to reporting definition.
- Refunds and rework remain visible against the originating job.
- Provider sees agreed payout, not internal margin.
- Customer sees customer price, not provider payout.

## 11. First-20-jobs operating controls

Until 20 paid jobs have been completed and reviewed:

- Operate Harish-first.
- Publish only owner-approved launch offers.
- Set capacity manually by day/week.
- Manually approve every quote.
- Manually confirm every booking.
- Manually select every provider.
- Manually approve every provider payout.
- Do not auto-send a final price.
- Do not auto-book based only on customer preference.
- Do not use reverse bidding.
- Do not promise unverified response or arrival times.
- Require completion evidence and quality close.
- Preserve WhatsApp as a support fallback.
- Record source, quoted amount, collected amount, provider payout, direct cost, actual duration, owner coordination time, issue/rework/refund, and customer outcome.

## 12. Acceptance criteria

### 12.1 Request intake

- A customer can complete the request on a 360-pixel-wide screen without horizontal scrolling.
- Required fields and consent are clearly identified in Hebrew and English.
- At least one supported image can be uploaded safely; limits and errors are clear.
- Submission creates one authoritative request ID and confirmation.
- Private media is not exposed through a public predictable URL.
- Failed submission does not present success or create misleading duplicate records.
- Owner sees the request and its next action in Today.

### 12.2 Request qualification

- Owner can mark a request as needing information, qualified, or closed with reason.
- Customer-safe status does not expose internal notes.
- Every status transition records actor and timestamp.
- A qualified request can start an estimate without re-entering customer/scope data.

### 12.3 Estimate and quote

- Only eligible verified evidence can support a P0 estimate.
- Owner must enter customer range and provider budget/floor before approval.
- Margin calculation and warning are visible before owner approval.
- Override below the configured floor requires a reason.
- Published quote contains scope, exclusions, price, VAT/material/travel treatment, deposit, expiry, and terms.
- Raw public quote token is not stored.
- Customer can accept, request change, or decline.
- Quote acceptance does not mark payment collected or job scheduled.

### 12.4 Booking

- Accepted quote creates or exposes one booking action.
- Owner can record deposit requirement/state and schedule.
- Confirming a schedule stores a snapshot visible to owner and customer.
- Cancellation/reschedule requires actor and reason.

### 12.5 Provider offer and assignment

- Only active suitable providers can receive an offer.
- Offer shows scope, area, time, payout, materials responsibility, and deadline.
- Provider can accept or decline on a phone.
- Only one accepted assignment can become confirmed.
- Exact customer contact/address disclosure follows the approved assignment rule.
- Assignment and agreed payout become immutable snapshots on the job, except through audited owner adjustment.

### 12.6 Job execution

- Provider can record on-the-way, arrived, started, issue, and completion submission.
- Invalid transition is rejected by backend rules, not only hidden in UI.
- Scope change can be requested with evidence.
- Customer-price increase cannot be approved without customer decision.
- Completion submission requires defined evidence/checklist.

### 12.7 Money

- Owner can distinguish quote, accepted value, collected deposit, collected balance, refund, provider payable, and provider paid.
- Every financial entry has amount, status, actor, timestamp, method/reference, and linked job.
- Customer and provider receive only role-appropriate financial values.
- Actual contribution uses collected and actual values, not quotes.

### 12.8 Quality and closure

- Job cannot become completed directly from in-progress without completion submission and quality check.
- Customer issue creates a quality case with owner and next action.
- Open issue/rework blocks clean completion.
- Resolution records outcome and cost.
- Review request is available only after satisfactory closure.

### 12.9 Owner dashboard

- Today shows action queues ordered by urgency/age.
- Job Command Center displays request, quote, schedule, provider, money, evidence, quality, and next action together.
- No demonstration data appears as live business data.
- Empty states truthfully say when there are no records.

### 12.10 Viewer safety

- Viewer mutations return authorization failure even if manually called.
- Customer names, contact, addresses, media, notes, quotes, tokens, and money are masked or absent.
- Sensitive sections and controls are absent or explicitly locked.
- Owner can revoke viewer access.

### 12.11 Mobile and accessibility

- Customer and provider P0 actions work at 360, 390, and 430 pixel widths.
- Owner critical actions work on phone and tablet without horizontal page overflow.
- Touch targets, focus order, labels, errors, contrast, keyboard operation, RTL, and reduced motion meet the project’s accessibility standard.
- No core P0 action depends on hover.

### 12.12 Reliability and security

- Role authorization is enforced server-side.
- Authenticated/API/private media responses are not stored by the public service-worker cache.
- Material transitions are auditable.
- Secrets are not embedded in frontend or native apps.
- Production failures show a truthful recoverable state and do not fall back to fictional data.

## 13. Required P0 metrics

### Funnel

- submitted requests
- qualified-request rate
- first-response time
- quote rate
- quote-view rate
- quote-acceptance rate
- accepted-to-booked rate
- loss reason

### Fulfillment

- time from acceptance to confirmed schedule
- confirmed jobs without provider
- provider offer acceptance rate
- on-time arrival rate
- completion rate
- cancellation/no-show rate
- owner coordination minutes per job

### Quality

- first-time completion rate
- issue rate
- rework rate
- refund/dispute rate
- customer outcome
- verified review-request/completion rate

### Economics

- collected customer revenue
- provider payout
- direct cost
- actual contribution shekels and percentage
- refund/rework cost
- source/customer acquisition cost where known
- contribution after acquisition where known

### Retention

- repeat request/job rate
- referral count and result
- time to second paid job

Metrics must define denominator and time window. “Profit” is prohibited unless full accounting inputs are present.

## 14. Implementation sequence

1. Implement canonical state-transition enforcement and audit events.
2. Upgrade public request intake and private media handling.
3. Create the unified admin request detail and next-action model.
4. Extend estimate/quote workflow with contribution and approval controls.
5. Add booking and confirmed schedule.
6. Add assignment offers and secure provider mobile actions.
7. Build the Job Command Center and completion evidence.
8. Add customer payment/provider payout ledger.
9. Add quality cases, rework, review, and repeat-work records.
10. Add first-20 metrics and validation report.
11. Validate mobile, viewer privacy, authorization, transition, and financial-truth acceptance criteria.

## 15. Explicitly deferred features

The following are outside P0 unless a safety-critical dependency requires part of them:

- Open provider marketplace.
- Lowest-bid or reverse-auction workflow.
- Automated provider matching/assignment.
- Automated final pricing.
- AI autonomous actions or financial authority.
- Instant self-service booking for variable-scope work.
- Automatic refunds or provider payouts.
- Dynamic surge pricing.
- Customer/provider live map tracking.
- In-app chat replacing WhatsApp.
- Large loyalty, points, coupon, or gamification system.
- Subscriptions/memberships.
- Provider lead fees.
- Multi-city expansion.
- Native iPhone/iPad application.
- Public launch of a full native Android application.
- Offline-first field operation.
- Complex staff roles beyond owner and viewer.
- Multi-tenant white-label Business OS.
- Commercial template billing/onboarding.
- Advanced accounting, payroll, tax filing, or ERP.
- Automated review publication.
- Unverified public rankings or “best provider” scoring.
- Large paid-advertising scale before capacity and economics are validated.

## 16. P0 exit gate

P0 is ready to move to P1 only after Aviel reviews evidence from up to the first 20 paid jobs and can answer:

- Which customer segment and service were actually purchased?
- Which source converted to satisfactory paid jobs?
- What did customers actually pay?
- What did providers and direct costs actually cost?
- Was contribution positive after rework/refunds and known acquisition cost?
- How much owner coordination was required?
- Which provider and service were reliably fulfilled?
- What caused cancellations, issues, and rework?
- Did customers repeat, refer, or leave legitimate reviews?
- Which repeated bottleneck justifies the next product feature?

P1 scope must be selected from observed repeated bottlenecks, not from an unvalidated feature wish list.
