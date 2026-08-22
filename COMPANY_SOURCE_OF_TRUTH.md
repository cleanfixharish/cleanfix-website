# CleanFixHarish Company Source of Truth

Version: 1.0.0
Adopted: 2026-08-23
Status: Core operating constitution. Changes require owner approval, a dated Git commit, focused verification and a new verified-good recovery tag.

## 1. Business identity

CleanFixHarish is a managed local service company and the sole customer-facing contracting brand. It is not an open marketplace, provider directory or lead auction.

- The customer requests, approves and pays CleanFixHarish.
- CleanFixHarish owns the written scope, quote, schedule, support, quality close and remediation path.
- An approved service partner may perform a private CleanFixHarish assignment for a pre-agreed payout.
- The service partner invoices CleanFixHarish; CleanFixHarish invoices or receipts the customer.
- No public screen may expose an internal provider as an independent competing advertiser.

## 2. Service taxonomy

Every request must be classified before price or dispatch:

1. Core: CleanFixHarish scopes, sells, fulfills and remedies it. Internal providers are never publicly advertised.
2. Partner-assisted: CleanFixHarish remains the prime contractor but assigns an approved specialist. The customer experience remains CleanFixHarish.
3. Referral-only complement: a service CleanFixHarish has deliberately chosen not to sell. The external business, direct contract/payment and absence of a CleanFix guarantee must be explicit.
4. Prohibited or pending review: unsafe, emergency, unknown, regulated or legally unapproved work. Do not quote, collect or dispatch.

Unknown work defaults to pending review. Payment never overrides relevance, safety, licensing or quality.

## 3. Customer and provider boundaries

- Internal providers do not publish or hand out a personal number, business card, independent quote or direct-payment request on a CleanFix assignment.
- Communication uses CleanFixHarish chat, telephone or a temporary masked relay.
- After assignment the customer receives a safe arrival identity: first name or approved display identity, recent verified photo, CleanFix provider ID, arrival window, arrival PIN and any mandatory licence information.
- Exact customer address and private media are released only after confirmed assignment and only to the extent required.
- Future work from a CleanFix-introduced customer returns through CleanFixHarish.
- Provider agreements may use only a narrow, counsel-approved non-solicitation/non-circumvention term for specifically introduced customers, with pre-existing relationships excluded and proportionate remedies.
- Customers are never threatened. Off-platform work simply loses CleanFix coordination, documentation and remediation coverage.

## 4. Immutable operating journey

Request -> triage -> information complete -> written scope -> provider capacity and payout floor -> owner-approved quote -> customer acceptance -> payment/deposit -> sequential provider offer -> confirmed assignment -> arrival verification -> work and evidence -> quality review -> remediation when required -> close -> provider payout -> rebook/follow-up.

- No price before required scope facts are complete.
- No verbal extras. Material differences pause affected work and require a versioned change order approved by owner, customer and provider.
- A provider may submit completion but cannot financially close a job.
- Every state change is backend-authorized, role-limited, timestamped and auditable.
- AI may assist drafting and detect missing information; it may not autonomously quote, assign, charge, refund, pay, close a complaint or make a customer promise.

## 5. Money rules

### Managed providers

Internal service partners are paid a fixed, agreed payout per accepted assignment and approved change order. They do not pay CleanFixHarish advertising or lead fees.

Default planning assumptions, pending real Harish evidence:

- Provider payout: 60-70% of net customer price before VAT.
- Quality/rework reserve: 4-7%.
- Payment/direct costs: 3-6%.
- Acquisition/referral allowance: 0-8%.
- Target CleanFix contribution before owner time: 20-25%; warning below 15%.
- Minimum CleanFix shekel contribution before owner time: ILS 100-150 per job.
- Target contribution after valued owner time: at least 8-12%.

Net customer price must satisfy all three floors:

`Pnet >= maximum(minimum basket, (provider payout + fixed direct cost) / (1 - variable cost rate - target margin), (provider payout + fixed direct cost + minimum contribution) / (1 - variable cost rate))`

The legally required consumer total, including applicable VAT, is shown before acceptance. Materials, access, parking and travel treatment are explicit.

Eligible provider payout target: within two business days after quality close and cleared payment. A small complaint does not automatically confiscate the whole payout. Fraud, material breach and disputed scope follow a documented review.

### Referral-only businesses

Paid external promotion remains disabled until the core service has at least 20 reviewed jobs and legal/accounting approval.

When enabled, use a transparent fixed model:

- Fixed monthly verified-partner listing; or
- Fixed completed-referral fee with consent and reliable attribution.

Do not use provider auctions, percentage surprises, pay-to-rank, recruitment rewards, multi-tier referrals or payment for positive reviews. Sponsored placements must be labelled. Referral-only partners contract and collect directly, and CleanFixHarish does not imply a service guarantee.

## 6. Quality and resolution

- Every job has an immutable checklist, inclusions, exclusions, materials responsibility, expected duration and evidence requirements.
- Arrival uses a one-time PIN; substitutions require a new identity notice.
- Before and after evidence links to scope items and remains private by default.
- Serious injury, damage, harassment, fraud or privacy incidents stop work and alert the owner.
- Customer issues are classified as workmanship, scope mismatch, requested extra, hidden condition, damage/safety or no-fault.
- Remedies may include rework, replacement provider, credit, proportional refund or documented no-action.
- Provider deductions require evidence, notice and review.

Public promise: CleanFixHarish remains the customer's contact through the agreed scope and reviews documented issues under the service/remediation policy. Never publish an unlimited or misleading "100% satisfaction" promise.

## 7. Visual truth

- Generated before/after scenes are labelled "design visualizations" until replaced by verified project photography.
- A "completed project" badge requires customer permission and original job evidence.
- No fabricated reviews, savings, customers, revenue, licences, availability or completed work.
- Motion must remain lightweight, respect reduced-motion settings and never block task completion.

## 8. Legal and safety release gates

The system remains quote-only for any flow lacking approved customer terms, cancellation/remediation rules, provider agreement, contractor classification, invoicing/VAT procedure, licence taxonomy, insurance, privacy controls, incident process, payment ledger, refund procedure, payout procedure and audit trail.

Israeli counsel, accountant and insurance adviser must approve the binding documents and exact operational structure before live paid dispatch. Draft legal downloads are informational drafts until approved and versioned as effective.

## 9. Production and recovery

- Production changes require a current verified-good GitHub tag before deployment.
- Changes are committed with a clear scope, pushed to GitHub, built, smoke-tested and checked on live routes.
- A successful release receives a dated `production-good-YYYYMMDD-HHMM` tag.
- "Return to default" may restore only the most recent owner-approved, verified-good website presentation; it must never alter accounts, leads, jobs, providers, payments, payouts, evidence or uploaded customer data.
- Secrets never enter source control or public diagnostics.

## 10. Business workspaces are strictly separated

### Managed provider workspace (`managed_provider`)

- A managed provider fulfils a CleanFix job under the CleanFix service relationship.
- Before confirmation, an offer may show only a CleanFix job ID, generalized area, immutable scope, schedule window, responsibilities, exact gross provider payout, response deadline and required evidence.
- Customer identity, exact address and private media are released only after an owner-confirmed assignment, on a least-privilege and time-limited basis. Contact runs through a CleanFix relay wherever technically possible.
- Providers cannot see the customer price, CleanFix margin, other providers, a reusable customer directory, or unrelated customer history.
- Providers cannot approve extras, collect privately, substitute a worker, close a job financially, approve a payout or publish themselves.
- Required job states are `offered`, `accepted`, `confirmed`, `on_the_way`, `arrived`, `in_progress`, `completion_submitted`, `quality_check`, `completed`, `closed`, with explicit exception states for scope changes, safety, incidents, replacement, rework and cancellation.

### Independent referral-business studio (`referral_partner`)

- A referral partner is an independent business displayed only in referral-only categories. It does not represent CleanFix and does not receive managed jobs through this relationship.
- Every public card, profile, introduction and sponsored placement must clearly disclose the independent relationship. Sponsorship is always labelled and cannot change verification or organic ranking.
- A partner may edit a draft brand profile but cannot self-publish, remove required disclosure, enter a Core category, make unverified claims or edit ranking.
- Anonymous visits remain aggregate. Identifiable fields are shared only after affirmative, versioned customer consent for that specific introduction. They cannot be reused for marketing without separate valid consent.
- The partner contracts, invoices, supports and remedies the customer directly.

### Isolation and owner authority

- The two roles use separate route and authorization scopes. A business with both relationships must switch isolated workspaces; shared searches, caches and exports are prohibited.
- Backend row-level and object-level authorization is authoritative. Hiding a UI control is never a security boundary.
- Only the owner may classify services, approve/suspend relationships, confirm assignments, release addresses, set customer prices and provider payouts, approve changes/refunds/rework/payouts, decide complaints, manage sponsorship/ranking policy, access the full ledger, or restore production.
- Cross-role reads, pre-confirmation address access, post-close contact access, media-link reuse, self-publication, payout self-approval and dual-role context leakage are mandatory release-blocking security tests.
- These roles, states, permissions, privacy rules, field definitions and audit requirements are one platform contract. The public website, admin dashboard, installable PWA and any future Android, iOS or other client must consume the same authorized backend APIs; no client may implement a weaker parallel business logic.
- Empty experiences show field names and explain when real information will appear. They never manufacture customers, jobs, businesses, reviews, balances, percentages or activity counts. Numeric zero is shown only when it is a real query result for a defined period.
- Role-specific onboarding is bilingual and visual, with an equivalent text fallback and optional spoken narration. Tour completion is versioned per user, relationship, language and platform; a material workflow change reoffers the tour.
