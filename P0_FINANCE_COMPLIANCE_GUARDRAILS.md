# CleanFixHarish P0 Finance, Trust, and Compliance Guardrails

Status: implementation specification for launch review  
Scope: public website, admin PWA, customer Android/iOS apps, future provider apps  
Prepared: 2026-08-21  
Owner approval required: yes  

> This document is a product and engineering control plan, not legal, tax, accounting, employment, or insurance advice. Israeli counsel, an Israeli accountant/tax adviser, and an insurance broker must confirm the marked decisions before money is accepted or providers are dispatched.

## 1. Executive release decision

The current repository is suitable for controlled quote testing, but **not yet for live customer payments, provider payouts, or dispatch of regulated work**.

The following are P0 launch blockers:

1. No domain-owned payment, refund, ledger, payout, reconciliation, or webhook-event records exist.
2. A public quote can be accepted by possession of a bearer link, without a durable customer-identity confirmation or an immutable acceptance snapshot.
3. Providers have contact/directory fields, but no license, insurance, tax, bank-account-verification, contract, or qualification controls.
4. Jobs use mutable free-text status and can be hard-deleted; there is no financial or regulated-service state machine.
5. Authorization is coarse (`admin`, `user`, `viewer`) and lacks separation of finance, operations, compliance, support, provider, and customer duties.
6. There is no append-only audit/event ledger for sensitive reads and financial or operational decisions.
7. There is no implemented customer privacy-rights/account-deletion workflow or mobile-store disclosure inventory.
8. AI endpoints are admin-only and content-generating, which is a useful boundary, but they lack purpose, PII, model, retention, and human-approval controls.
9. The Android app is a foundation only; no iOS app was found. Store privacy, deletion, deep-link, and review requirements are incomplete.

**P0 rule:** until every blocker has an automated test and a named human owner, production must remain `QUOTE_ONLY`: no live charge, payout, automated dispatch, regulated work, or AI mutation.

## 2. Repository evidence: what already works

These controls should be preserved:

- Admin API routes use `get_admin_user`; viewer access uses a separate active allowlist.
- A global middleware rejects every state-changing API request made with a `viewer` token.
- Viewer dashboard responses mask customer names, phone numbers, addresses, notes, and prices.
- Price estimates require verified, eligible source evidence and owner/admin approval before quote creation.
- Public quotes omit provider budgets and owner identity.
- Public quote tokens are generated randomly and stored only as SHA-256 digests.
- Quote expiry and deposit bounds are validated.
- AI Hub endpoints are admin-only and currently generate content rather than directly mutating business records.
- Android disables cleartext traffic and backup and supports RTL.
- Existing tests cover anonymous admin rejection, viewer read-only behavior, quote token hashing, and hiding internal quote data.

Relevant implementation locations:

- `app/backend/dependencies/auth.py`
- `app/backend/main.py`
- `app/backend/models/auth.py`
- `app/backend/models/pricing.py`
- `app/backend/routers/pricing.py`
- `app/backend/routers/quotes.py`
- `app/backend/routers/viewer_dashboard.py`
- `app/backend/models/jobs.py`
- `app/backend/models/partners.py`
- `app/backend/routers/jobs.py`
- `app/backend/routers/aihub.py`
- `app/backend/services/payment.py`
- `apps/android/`

## 3. Required operating modes and feature flags

Create server-side flags; clients must never be authoritative:

| Flag | Safe default | Unlock condition |
|---|---:|---|
| `QUOTE_PUBLISHING_ENABLED` | `false` outside approved staging | terms/versioning and identity acceptance tests pass |
| `LIVE_PAYMENTS_ENABLED` | `false` | payment processor, tax, refund, webhook, reconciliation controls pass |
| `PROVIDER_PAYOUTS_ENABLED` | `false` | provider verification, completion, dispute, ledger, and dual approval pass |
| `REGULATED_SERVICES_ENABLED` | `false` | counsel-approved service taxonomy and license verification pass |
| `AI_MUTATIONS_ENABLED` | `false` | per-action allowlist, preview, approval, idempotency, and audit pass |
| `CUSTOMER_ACCOUNTS_ENABLED` | `false` | privacy notice, deletion, export/access, authentication, and store gates pass |
| `PROVIDER_APP_ENABLED` | `false` | provider agreement, access isolation, payout and privacy gates pass |

Feature flags must be environment-specific, changed only by `owner_admin`, and recorded in an append-only audit event.

## 4. Roles, data exposure, and approval matrix

Replace free-string authorization with a database-backed role and permission model. Deny by default. A user may hold multiple roles, but P0 high-risk operations require separation or explicit owner override with reason.

| Role | May see | May do | Must not do |
|---|---|---|---|
| `owner_admin` | all business data except processor secrets/raw payment credentials | configuration, final approvals, emergency revoke | bypass audit; edit immutable financial events |
| `operations_manager` | customer/job/provider operational data | prepare quotes, schedule, assign qualified provider | charge/refund/payout; view bank details; approve own exception |
| `finance_manager` | quote totals, payments, refunds, ledger, masked payout account | reconcile, prepare refunds/payouts | edit service completion; change provider qualification |
| `compliance_manager` | licenses, insurance, contracts, privacy cases, audit | approve qualification, holds, privacy requests | charge/refund/payout alone |
| `support_agent` | minimum customer/job context | communicate, open cancellation/refund case | expose provider budget; approve money movement |
| `readonly_viewer` | masked demo dashboard only | view synthetic/aggregated state | mutate, export, view stable internal/customer/provider identifiers |
| `customer` | own quotes, jobs, payments, messages, privacy controls | accept/decline, pay, cancel/request refund, manage own account | access provider internal data or other customers |
| `provider` | only assigned work and own earnings/compliance | accept assignment, update work evidence, request payout | see customer history beyond job need; set price/payout; access competitors |
| `auditor` | time-limited read-only audit/financial evidence | export approved audit package | mutate any record |
| `service_account` | explicit machine scope only | one narrow documented task | interactive login or broad admin scope |

### Mandatory approval gates

- Quote publish: operations prepares; owner/authorized approver publishes.
- Price below approved margin floor: finance plus owner; reason required.
- Refund: support/finance prepares; finance approves; owner approval above configured threshold.
- Provider activation: compliance approves only after all required evidence is current.
- Provider assignment to regulated work: automated eligibility check plus operations confirmation.
- Payout: completion acceptance plus finance approval; second approver above threshold or for bank-detail changes.
- Bank-detail change: provider re-authentication, out-of-band verification, cooling-off/hold, and dual approval.
- Privacy deletion/export: identity verification and compliance approval; legal-retention exceptions recorded.
- AI-proposed mutation: named human previews the exact diff and confirms; P0 keeps mutation disabled.

## 5. Append-only audit foundation

Create `audit_events` before enabling any sensitive workflow:

- `id` (UUID), `occurred_at` (server UTC), `request_id`, `actor_type`, `actor_id`, `role_snapshot`
- `action`, `resource_type`, `resource_id`, `workspace_id`
- `before_hash`, `after_hash`, `reason_code`, `reason_text`
- `source_channel` (`web`, `android`, `ios`, `api`, `worker`, `admin`)
- `ip_hash` or privacy-reviewed network evidence, `user_agent_hash`, `correlation_id`
- `approval_chain`, `policy_version`, `result`, `error_code`

Requirements:

- Application roles cannot update/delete audit rows.
- Never store access tokens, quote tokens, card data, passwords, full AI prompts containing secrets, or raw bank credentials.
- Audit sensitive reads as well as writes: customer details, provider documents, finance screens, exports, and viewer access.
- Log retention and access must be set after privacy/counsel review. The Israeli Privacy Protection Authority publishes specific guidance for automatic access logs in databases subject to medium/high security levels; classify the database before choosing retention. [Authority logging guidance](https://www.gov.il/BlobFolder/reports/takana10d/he/Takna10_Tikon13.pdf)

## 6. Quote guardrails

### Required state machine

`draft -> pending_approval -> approved -> published -> viewed -> accepted | declined | expired | superseded | cancelled`

No backward transition. Corrections create a new version and supersede the old version. Never edit a published or accepted snapshot.

### Required quote records

Add:

- `quote_version`, `public_quote_number`, `customer_id` or verified contact challenge
- legal entity name/number, VAT status, currency fixed to `ILS`
- subtotal, VAT amount/rate/treatment, discounts, total, deposit, balance
- service line items, quantity/unit, materials assumptions, scope, exclusions
- site/address assumptions, schedule window, validity/expiry
- cancellation/refund summary and linked policy version
- terms version/hash, privacy notice version/hash, language (`he`/`en`)
- internal cost budget, margin amount/percentage, margin-policy result (never public)
- service risk class and required qualification IDs
- creator, approver, published timestamp, superseded quote ID

### Publish and acceptance criteria

- Only an approved estimate may produce a quote; preserve this current control.
- Enforce minimum margin or require two-person exception approval.
- Reject publish if regulated-service qualifications cannot be determined.
- Raw bearer links must be short-lived, revocable, rate-limited, absent from logs/analytics/referrers, and rotated after use.
- Prefer a one-time link exchange into an authenticated/OTP-bound session. Do not treat link possession alone as durable identity proof for payment or contract acceptance.
- Acceptance stores an immutable canonical quote snapshot, terms/policy hashes, exact affirmative action, server timestamp, actor/customer ID, language, and privacy-reviewed evidence of the session.
- The public response must never include provider cost/budget, margin, approval notes, provider private data, or internal IDs.
- Quote acceptance does **not** mean payment or dispatch. It creates `payment_required` or `manual_confirmation_required` according to policy.

### Consumer-law gate

Before launch, Israeli consumer counsel must approve the Hebrew/English pre-contract disclosure, cancellation paths, fee rules, service-start consent, refund timing, and exceptions. The Consumer Protection Authority's public guide says remote service transactions generally have cancellation rights and that an internet cancellation method must be offered when the transaction can be made online; exact application depends on the service and facts. [Consumer guide](https://www.gov.il/BlobFolder/generalpage/general_tuota/he/HB_Brushur_SITE.PDF) [Knesset cancellation-method summary](https://main.knesset.gov.il/Activity/Legislation/pages/lawsintoeffect2017-2.aspx)

## 7. Payments, refunds, and reconciliation

`app/backend/services/payment.py` is a generic Stripe helper. It is not a business payment system and must not be connected directly to arbitrary client-supplied amounts.

### Required records

- `payment_orders`: accepted quote/version, payer, currency, amount due, purpose, status, idempotency key.
- `payment_attempts`: processor, checkout/session reference, status, processor timestamps, failure code; no card data.
- `payment_events`: unique processor event ID, verified signature result, payload hash, received/processed timestamps, outcome.
- `refund_cases`: reason, requested amount, evidence, approval chain, customer notices, status.
- `refund_transactions`: processor refund ID, amount, status, event link.
- `ledger_entries`: append-only double-entry debit/credit lines for customer receivable, cash/processor clearing, revenue, VAT/tax liability, provider payable, refunds, fees, disputes, and adjustments.
- `reconciliation_runs`: expected versus settled amounts, differences, owner, resolution.

### Payment rules

1. Server derives currency and amount from the accepted immutable quote; client amount is ignored.
2. P0 supports `ILS` only unless accountant and processor approve another currency.
3. Hosted processor checkout only; CleanFixHarish must never receive/store raw PAN, CVV, or card credentials.
4. Every create/refund/payout call uses a durable idempotency key tied to one business operation.
5. A verified, allowlisted processor webhook is authoritative; browser success redirects are informational only.
6. Verify webhook signature against the raw request body; enforce timestamp tolerance; deduplicate event IDs; tolerate out-of-order and repeated events.
7. Amount, currency, merchant account, quote reference, and payment-order state must match before marking paid.
8. Never fulfill/dispatch from a client `verify_payment` response alone.
9. Failed, expired, disputed, partially refunded, and chargeback states must be modeled explicitly.
10. Daily automated reconciliation plus a human exception queue is mandatory.
11. Refunds cannot exceed captured less already-refunded amount. No negative or duplicate refund.
12. Financial records are corrected by reversing entries, never deletion or overwrite.

### Tax/invoicing gate

Before enabling payments, the accountant must decide and document:

- legal entity/authorized dealer status and correct legal details;
- VAT treatment and whether displayed prices include VAT;
- approved invoice/receipt system and issue timing for deposits, final payments, refunds/credits;
- withholding-at-source and provider-document requirements;
- required retention period and export format;
- whether Israel's invoice-allocation-number rules apply at relevant invoice values/dates.

The engineering team must implement those decisions, not infer them. Official starting references: [Israel Tax Authority business guide](https://www.gov.il/en/pages/income-tax-guide-open-business?chapterindex=6), [withholding certificates](https://www.gov.il/he/service/itc-gmishurim), and [VAT invoice allocation information](https://www.gov.il/he/pages/vat-to-the-new-dealer?chapterIndex=14).

## 8. Provider onboarding, assignment, and payouts

The current `partners` record is a directory entry, not a qualified provider record.

### Required provider/compliance records

- legal/individual identity and verified contact channels;
- business/tax classification, invoice capability, withholding certificate status/expiry;
- written provider agreement version and acceptance evidence;
- worker-versus-independent-contractor review status (human/legal determination, not a checkbox conclusion);
- services and geographic scope;
- license/certification type, number, issuing authority, permitted scope, status, issue/expiry, verification timestamp and evidence;
- insurance policy type, insurer, coverage/limits, expiry and verified evidence;
- background/safety checks only where lawful, necessary, proportionate, and privacy-reviewed;
- payout account token/reference held by a payment provider, verification status, last-four display only;
- active/suspended/expired/under-review status and reason;
- privacy/access acknowledgement and minimum customer-data handling rules.

### Assignment gate

`eligible(provider, service, job_time)` must require:

- active provider agreement;
- approved tax and payout profile;
- service qualification mapped to job risk class;
- every required license and insurance current through the scheduled job date;
- no compliance/quality/payment hold;
- no conflict or duplicate assignment;
- manual operations confirmation at P0.

### Completion and payout state machines

Job:

`requested -> quoted -> payment_required -> confirmed -> assigned -> accepted_by_provider -> in_progress -> completion_submitted -> customer_review | operations_review -> completed -> closed`

Payout:

`not_eligible -> eligible -> prepared -> pending_approval -> approved -> submitted -> paid | failed | reversed | held`

Rules:

- Provider cannot mark their own work financially complete or approve their own payout.
- Payout amount is computed from the accepted provider compensation agreement/version, not a client field.
- Require completion evidence, customer/operations acceptance, cleared payment, refund/dispute hold window, and no compliance hold.
- Bank-detail changes create a payout hold and require out-of-band verification plus dual approval.
- Maintain provider payable ledger, processor fees, withholding/tax documents, payout statements, and reconciliation.
- Never advertise a provider earning amount as guaranteed. Store estimated gross compensation separately from actual payout, expenses, tax, and net income.

### Employment and service-contractor gate

Israeli employment counsel/accountant must review the actual relationship, control, exclusivity, scheduling, equipment, substitution, economic dependence, benefits, and invoicing facts. The platform must not label a person "contractor" and assume that resolves classification. If CleanFixHarish supplies cleaning workers as a service/manpower contractor, specialist advice is required on whether a Ministry of Labor license applies. [Ministry of Labor service/manpower contractor licensing](https://www.gov.il/he/service/manpower-contractor-license-request)

## 9. Regulated and higher-risk services

Create a versioned service taxonomy. Every service has:

- `risk_class`: `ordinary`, `elevated`, `regulated`, `prohibited_pending_review`;
- required license types/levels;
- required insurance types/limits;
- allowed provider types;
- quote/dispatch/manual-approval policy;
- prohibited scope and escalation instructions.

P0 behavior:

- Unknown/new service defaults to `prohibited_pending_review`.
- "Handyman" must never be used as permission to perform licensed work.
- Electrical work is blocked unless the provider's current license type and permitted scope cover the exact job. Israel's Ministry of Labor states electrical work must be performed according to the license type and property scope. [Electrician licensing service](https://www.gov.il/he/service/applying-for-an-electricians-license)
- Plumbing/gas, refrigeration/HVAC, structural/building, pest control, elevators, fire systems, hazardous materials, and other potentially regulated trades require a counsel-reviewed gate before being listed or dispatched.
- Emergency/safety reports instruct the customer to contact the appropriate emergency/utility authority; AI and unqualified staff must not diagnose hazardous conditions.
- Regulated assignments require stored verification evidence, expiry monitoring, and an audit event. Expiry immediately prevents new assignment.

## 10. Privacy and security controls

### Data inventory and purpose limitation

Maintain a versioned inventory for each field/SDK/API:

- data item and sensitivity;
- person (`customer`, `provider`, `staff`, `viewer`);
- source and purpose;
- lawful/approved basis and notice version (counsel-confirmed);
- who can access it and where it is sent;
- retention/deletion rule;
- processor/vendor and data location/transfer review;
- web, Android, and iOS disclosure mapping.

Collect only what is necessary. Photos of homes, addresses, messages, identity/license documents, precise location, financial history, and AI prompts require explicit handling rules.

### Required user-facing controls

- Hebrew and English privacy notice, terms, cancellation/refund policy, provider terms, and contact channel.
- Just-in-time notice before photos, location, camera, or sensitive free-text collection.
- Manual address entry if location permission is declined.
- Customer access/correction/export/deletion request flow with identity verification and status tracking.
- In-app account deletion plus public web deletion/request path when account creation is enabled.
- Clear explanation of retained financial/legal records after account deletion; delete or irreversibly de-identify everything else according to approved policy.
- Consent/preferences must be purpose-specific, versioned, timestamped, revocable, and not bundled with mandatory service terms.

### Security requirements

- Classify the database under Israeli privacy/security rules with counsel/security adviser.
- Maintain the required database definitions/security document, access roster, incident process, vendor agreements, backups, restore tests, vulnerability/dependency management, and periodic access review.
- Encrypt in transit and at rest; secrets only in a managed secrets store; rotate/revoke on exposure.
- MFA/step-up authentication for owner, finance, compliance, exports, bank changes, refunds, payouts, and role changes.
- Field-level masking and export controls; no production data in demos, analytics, crash logs, test environments, screenshots, or AI prompts.
- Stable customer/provider/internal IDs should not be returned to demo viewers; use per-view synthetic opaque IDs.
- Add viewer expiry, purpose, revocation, last-access, no-export, and sensitive-read audit.
- Rate-limit login, quote-link exchange, quote decisions, customer requests, uploads, and AI endpoints.
- Validate MIME by content, cap size/count, malware-scan uploads, strip image metadata where appropriate, and quarantine before use.
- Incident runbook must include containment, evidence preservation, processor/vendor coordination, legal notification assessment, and customer communication approval.

Amendment 13 changed database-registration scope but did not remove other privacy/security duties. Registration and notification applicability must be assessed from actual processing. [Amendment 13 Q&A](https://www.gov.il/he/pages/tikun13_qa?chapterIndex=6) [database registration guidance](https://www.gov.il/he/service/registration_in_the_database)

## 11. AI action boundaries

### P0 allowed

- Draft customer replies, scope summaries, internal checklists, quote explanations, and marketing copy from redacted/minimized inputs.
- Extract proposed structured fields into a preview that a human confirms.
- Suggest, never decide, service category, provider candidates, or price comparisons.

### P0 prohibited

- Charging, refunding, paying providers, changing bank data, changing roles, publishing quotes, dispatching providers, or deleting data.
- Final price/discount/margin approval.
- Deciding provider employment classification, license validity/scope, insurance sufficiency, fraud, safety, eligibility, or legal compliance.
- Diagnosing regulated or dangerous work.
- Sending customer/provider messages without human preview and approval.
- Training or external model retention of production data unless separately approved and contractually configured.

### Required AI controls

- Purpose enum and model allowlist; no arbitrary model name from client.
- Server-side prompt templates and output schema validation.
- PII/secret classifier and redaction before provider call; no quote tokens, auth tokens, payment/bank credentials, IDs, or license documents in prompts by default.
- Prompt-injection defense: uploaded/customer text is untrusted data, never instructions.
- Per-purpose model/vendor/data-retention configuration and data-processing review.
- Cost, size, rate, and concurrency limits.
- `ai_action_events`: actor, purpose, model/version, redacted input hash, output hash, data classes, vendor, approval status, resulting resource/action, timestamps, error.
- Label AI-generated drafts and preserve the human editor/approver.
- No autonomous tools with write credentials at P0; future tools require exact parameter preview, least privilege, idempotency, reversible action where possible, and human confirmation.

## 12. Public web and mobile-store launch gates

### All clients

- One backend authorization policy; never rely on hidden buttons or client roles.
- Environment banner and account/workspace identity; no production secrets in bundles.
- Privacy/terms/cancellation versions accessible before acceptance/payment.
- Accessibility review for Hebrew/RTL, keyboard, screen reader, contrast, text scaling, touch targets, error messages, and dynamic content.
- Customer/provider data isolation tests and forced logout/revocation tests.
- Safe offline behavior: no stale payment, payout, license, or dispatch decision can be completed offline.

### Android / Google Play P0

- Complete Data safety inventory for app, backend, every SDK, crash/analytics, and vendor; ensure the listing matches actual behavior. [Google Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- If account creation is enabled, provide in-app deletion and a working web deletion/request URL. [Google Play account deletion](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en-EN)
- Request sensitive permissions only in context with prominent disclosure/consent where required; provide manual alternatives.
- Use verified HTTPS App Links for quote/customer routes. Do not place long-lived bearer tokens in custom-scheme URLs, logs, analytics, notifications, clipboard, or referrers.
- Physical home services should use an external/standard payment processor rather than Google Play Billing; confirm final checkout against current policy. [Google Play payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en)
- Privacy policy URL, support contact, test account/review instructions, accurate screenshots/descriptions, signed release, dependency/SDK review, crash/ANR baseline, and internal/closed testing completed.

### iOS / Apple P0

- No iOS project was found; do not claim iOS launch readiness.
- App privacy responses must match every SDK/backend data practice. [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- Provide in-app account deletion if account creation exists. [Apple account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- If Google Sign-In is used for the primary account, review whether an equivalent login option meeting Apple guideline 4.8 is required.
- Physical services may use payment methods other than In-App Purchase; confirm final implementation under current guideline 3.1. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Complete privacy manifest/required-reason API and third-party SDK review, permission purpose strings, privacy/support URLs, review account/instructions, deletion path, account/data isolation tests, crash baseline, and accessibility review.

## 13. Required P0 admin screens

1. **Release Control:** environment, feature flags, deploy/version, kill switches, approval/audit history.
2. **Quote Approval:** immutable versions, source evidence, public/internal split, margin gate, terms/policy version, approver.
3. **Payments:** payment order/attempt/event timeline, amount/currency match, webhook status, never raw card data.
4. **Refund Cases:** request evidence, consumer-policy timer, eligible maximum, approvals, processor result, customer notice.
5. **Finance Ledger & Reconciliation:** append-only entries, settlement matching, exceptions, tax-document references, export audit.
6. **Providers & Compliance:** identity, agreement, services, license scope/expiry, insurance, tax documents, verification, holds.
7. **Assignments:** provider eligibility explanation, service risk class, required qualifications, manual confirmation.
8. **Payouts:** eligibility evidence, compensation version, holds, approvals, processor result, reconciliation.
9. **Privacy Requests:** access/correction/export/deletion, identity check, retention exceptions, due dates, completion evidence.
10. **Roles & Access:** permissions, MFA status, viewer scope/expiry, last access, service accounts, access review.
11. **Audit Explorer:** immutable event search with redaction and controlled export.
12. **AI Activity:** purpose, model, data classes, cost, draft/approval/result, safety flags.
13. **Incidents & Disputes:** security, quality, chargeback, safety and regulatory holds with owner and timeline.

## 14. P0 automated acceptance tests

Release must fail unless tests prove:

- Every role is deny-by-default; viewer/customer/provider cross-tenant and mutation attempts return 403/404 without data leakage.
- Sensitive reads, exports, role changes, quote publication, refunds, payouts, bank changes, qualification changes, and feature flags create audit events.
- Published/accepted quote snapshots cannot be updated or deleted; supersession works.
- Acceptance fails for expired/revoked/reused token and stores the approved terms/policy/version evidence.
- Public payloads never expose budget, margin, private provider data, internal approval notes, or stable demo identifiers.
- Client-supplied payment amount/currency is ignored/rejected.
- Forged, stale, duplicate, out-of-order, wrong-account, wrong-amount, and wrong-currency webhooks cannot mark paid.
- Duplicate checkout/refund/payout requests cannot create duplicate money movement.
- Refund maximum and payout eligibility constraints hold under concurrency.
- Provider with expired/missing/wrong-scope qualification cannot be assigned.
- Job/financial/audit records cannot be hard-deleted; reversal/correction paths work.
- Bank-detail changes force re-authentication, hold, and two-person approval.
- Privacy deletion removes/de-identifies eligible data, preserves only approved retained records, and revokes sessions/tokens.
- Quote/deep-link tokens never appear in application logs, analytics events, crash reports, or referrers.
- AI cannot invoke a write, payment, payout, refund, role, dispatch, deletion, or regulated-service tool.
- Android verified links and iOS universal links (when built) isolate accounts and handle expired/revoked links safely.
- Backup restore, reconciliation, incident kill switches, and feature-flag rollback are tested in staging.

## 15. Human decisions required before implementation unlock

Aviel must approve, in writing:

- legal entity presented to customers and merchant of record;
- exact launch services and which are excluded/regulated;
- quote, deposit, cancellation, refund, no-show, materials, warranty, and dispute policies;
- minimum margin and exception/approval thresholds;
- provider compensation model, payout timing, hold window, and bank-change procedure;
- staff roles and named approvers;
- customer/provider data collected, viewer demo scope, retention, deletion, and AI use;
- initial platform scope: web only, Android, iOS, provider app;
- processors/vendors and budget limits;
- whether `QUOTE_ONLY` remains the launch mode until the professional reviews below are complete.

Professional sign-offs required:

- **Israeli accountant/tax adviser:** VAT, invoices/receipts/credits, allocation numbers, withholding, provider documentation, ledger mapping, record retention.
- **Israeli consumer/privacy/employment counsel:** terms, remote-sale/cancellation/refund disclosure, privacy/security/database duties, provider classification, regulated/service-contractor licensing, marketing consents.
- **Insurance broker:** company, professional/public/product liability, employer/workers, cyber, vehicle/tools, subcontractor certificates, limits/exclusions.
- **Payment processor/acquirer:** Israeli merchant eligibility, ILS, deposits/partial capture/refunds, payout capability, 3DS/fraud controls, webhook/settlement data, PCI scope.

## 16. Implementation order

1. Freeze P0 business policy and service taxonomy; retain `QUOTE_ONLY`.
2. Implement roles/permissions, MFA gates, audit events, immutable records, and deletion restrictions.
3. Implement provider qualification and regulated-service assignment gates.
4. Harden quote versioning, customer identity confirmation, policy acceptance, and public token handling.
5. Implement payment/refund ledger, webhook verification, idempotency, tax-document references, and reconciliation in sandbox.
6. Implement completion, dispute, provider payable, payout approvals, and sandbox reconciliation.
7. Implement privacy requests, account deletion, retention jobs, incident controls, and disclosure inventory.
8. Implement AI purpose/redaction/audit/approval boundaries; keep mutation disabled.
9. Complete public web and Android gates; build and review iOS separately.
10. Run the P0 test suite and operational tabletop exercises; obtain professional sign-offs.
11. Aviel explicitly approves each production flag. Enable one narrow flow at a time with monitoring and rollback.

No DNS, deployment, database migration, payment activation, provider payout, or store submission is authorized by this document.
