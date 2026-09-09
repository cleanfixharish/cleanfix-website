# Per-Job Provider Eligibility Checklist

Status: mandatory pilot gate; quote-only until external approvals are recorded

Run this checklist for a specific provider, task scope, risk class, schedule, and policy version before confirming every assignment. A provider is never globally eligible for unknown work.

## Job and provider

- [ ] Exact service/tasks, scope, exclusions, responsibilities, checklist, evidence, and risk class recorded.
- [ ] Work is on the approved pilot allowlist and contains no unknown, prohibited, emergency, unsafe, or potentially regulated task.
- [ ] Relationship is `approved_relationship`.
- [ ] Service eligibility is `eligible_supervised` or `eligible` for this exact risk class.
- [ ] Required agreement, tax, licence, insurance, safety, and privacy evidence remains current through the scheduled end.
- [ ] No hold, conflict, or duplicate confirmed assignment exists.
- [ ] Provider capacity and travel are realistic.

## Offer and confirmation

- [ ] Offer contains only job ID, general area, schedule, immutable scope, responsibilities, gross payout, response deadline, and evidence requirements.
- [ ] Customer identity, exact address, private media, customer price, and margin remain hidden before confirmation.
- [ ] Provider accepts the exact offer version.
- [ ] Exactly one provider is confirmed transactionally.
- [ ] Owner records confirmation and only then releases minimum necessary customer data for a limited time.

## Backend blocking reasons

- `RELATIONSHIP_NOT_APPROVED`
- `CAPABILITY_NOT_APPROVED`
- `MISSING_CREDENTIAL`
- `EXPIRED_CREDENTIAL`
- `PROFESSIONAL_SIGNOFF_MISSING`
- `ACTIVE_HOLD`
- `SCHEDULE_CONFLICT`
- `SERVICE_NOT_IN_PILOT`
- `REGULATED_SERVICE_DISABLED`
- `ASSIGNMENT_ALREADY_CONFIRMED`

The owner cannot override a missing legal, licence, or insurance requirement. A professional waiver requires scoped evidence, conditions, and a review date.

## Stop and escalate

Do not confirm the assignment if the provider proposes private payment, customer solicitation, worker substitution, undisclosed off-platform communication, work outside the scope, or use of customer media for another purpose.
