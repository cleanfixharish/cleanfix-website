# Role-based Learning System

Status: first production slice implemented; advanced tracked training remains staged work.

## Product decision

CleanFixHarish uses one deterministic, bilingual learning system with separate content for the owner/admin, customer, managed provider, and independent advertised partner. Training explains permissions but never grants them. A tour never clicks, submits, messages, publishes, pays, approves, or changes a business record.

No fictional customers, jobs, prices, or performance numbers appear in production. Future hands-on simulations belong in an isolated training environment with synthetic data, disabled outbound communications and payments, no production secrets, and a permanent TRAINING label.

## Delivered first slice

- Owner Learning Center in Manager OS with a seven-step visual and optional device-spoken tour.
- Five short owner operating modules linking learning to the relevant dashboard area.
- Customer service-journey tour in the signed-in customer account.
- Updated managed-provider and independent-partner tours with explicit privacy, completion, payment, and relationship boundaries.
- English and Hebrew content, RTL-aware navigation, semantic progress, keyboard focus, reduced-motion support, 44-pixel controls, replay, and versioned local completion state.
- No AI model, third-party analytics, customer data, or automatic action is required by the tours.

## Owner operating sequence

1. **Start of day:** confirm live connection, review alerts, new requests, today's jobs, missing evidence, follow-ups, and money awaiting reconciliation.
2. **Request review:** confirm service fit, safety, contact details, photos, and missing facts; record one next action.
3. **Scope and quote:** record inclusions, exclusions, schedule assumptions, customer price, provider payout, and evidence. An estimate is not collected revenue.
4. **Booking and assignment:** confirm timing and exactly one provider; reveal only the customer information needed for the confirmed assignment.
5. **During work:** use controlled job transitions. Unexpected work or a safety issue pauses the affected scope until written review.
6. **Quality close:** provider submission is not completion. Review evidence, customer outcome, and unresolved safety, damage, rework, or refund issues before approval.
7. **Money close:** record actual collection, refunds, costs, fees, approved provider payable, and payment. Never infer revenue or profit from a quote.
8. **End of day:** reconcile open actions and money, review access anomalies and evidence gaps, and leave a factual handoff note.

## Next learning phases

1. Persist tour definitions and progress server-side per user, relationship, role, language, module version, and policy version.
2. Add stable `data-help-id` anchors and just-in-time help beside real controls.
3. Add a role-filtered, searchable Help Center with emergency/stop-work guidance always visible.
4. Add a sanitized owner preview for each role; it must not impersonate users or query private role data.
5. Add an isolated training environment with scope-change, missing-evidence, safety, issue, refund, and payout-hold scenarios.
6. Add privacy-safe aggregate completion and failed-anchor metrics without names, contacts, addresses, job content, tokens, or free text.
7. Require separate policy acknowledgement and practical qualification where needed; finishing a tour is never legal acceptance or proof of competence.

Advertising-partner activation and publication training remain disabled with advertising. They should resume only after the existing 20-reviewed-jobs and professional legal/accounting gates are satisfied.
