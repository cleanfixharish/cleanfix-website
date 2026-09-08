# Provider Vetting Checklist

Status: owner operating checklist; professional approval is not yet recorded
Applies to: managed service providers only

A business account, completed profile, or uploaded document does not make a provider eligible for work. Record each item as `missing`, `requested`, `submitted`, `owner_checked`, `professionally_confirmed`, `rejected`, `expired`, or `superseded`. Record the evidence reference, reviewer, verification time, expiry, and reason.

## Identity and business

- [ ] Legal and trading names, business number, verified phone, and verified email.
- [ ] Government identity checked using the minimum information approved by counsel.
- [ ] Agreement signer, invoice issuer, and payout recipient are the same approved person or entity.
- [ ] Accountant-approved tax classification and invoice capability.
- [ ] Withholding-at-source evidence and expiry where required.
- [ ] Payout account verified through an approved provider or out-of-band process; store a token/reference and masked details only.

## Agreement and conduct

- [ ] Counsel-approved provider agreement version accepted in the provider's chosen language.
- [ ] Counsel's classification decision for the actual relationship recorded.
- [ ] Provider acknowledges: no direct quote or collection, customer solicitation, reusable customer list, or unapproved substitution.
- [ ] Provider acknowledges scope-change, cancellation, no-show, evidence, rework, incident, privacy, payout, suspension, and termination rules.

## Capability and task limits

- [ ] Capability recorded at task level, not only as a broad trade such as `handyman`.
- [ ] Allowed and prohibited scope written.
- [ ] Area, availability, languages, equipment, materials responsibility, and capacity recorded.
- [ ] References or work samples reviewed and result recorded.
- [ ] Supervised trial or skills check passed where required.
- [ ] Every required licence records type/level, holder, number, authority, permitted scope, issue/expiry, independent verification source, reviewer, and time.
- [ ] Unknown, emergency, unsafe, and potentially regulated work remains blocked pending an approved exact rule.

## Insurance

- [ ] Insured name matches the contracting provider.
- [ ] Activities, territory, policy types, limits, deductibles, exclusions, subcontractor treatment, and dates recorded.
- [ ] Insurance adviser confirms suitability for the exact pilot work and operating model.
- [ ] Any required endorsements and the incident-notice path recorded.
- [ ] Coverage remains valid through the scheduled job.

CleanFixHarish does not select its own coverage types or minimum limits without the insurance adviser's written decision.

## Safety, privacy, and field readiness

- [ ] Stop-work and incident procedure acknowledged.
- [ ] Equipment and task-specific safety controls confirmed.
- [ ] Background checks used only if counsel finds them lawful, necessary, and proportionate.
- [ ] Approved arrival photo/display identity and CleanFix provider ID recorded.
- [ ] Privacy/media handling and post-job access limits acknowledged.
- [ ] Provider passes a supervised offer, arrival PIN, evidence upload, scope-change, unsafe-condition, and completion-submission exercise.

## Expiry rules

| Item | Review | Blocking rule |
| --- | --- | --- |
| Identity/business | Onboarding, annually, and on change | Block unresolved mismatch |
| Agreement/policies | Every material version | Block until current version accepted |
| Tax/withholding | Official expiry or accountant date | Block at expiry unless accountant documents an approved alternative |
| Licence | Official expiry/status | Block if job exceeds validity or status is suspended |
| Insurance | Policy expiry/adviser conditions | Block if job exceeds validity |
| Bank verification | Every change | Hold payout until reverified |
| Capability | After incidents/failures and annually | Suspend affected service while reviewed |
| Safety/privacy training | Annually and on material change | Block until current version acknowledged |

Show reminders 60, 30, 14, and 7 days before expiry.

## Separate statuses

Relationship: `applicant`, `under_review`, `approved_relationship`, `suspended`, `rejected`, `ended`.

Service eligibility: `unassessed`, `evidence_requested`, `under_review`, `eligible_supervised`, `eligible`, `suspended`, `rejected`, `expired`.

The first paid pilot uses `eligible_supervised`. Relationship approval alone never permits assignment.

## Owner decision

- [ ] Each service and risk class has its own decision.
- [ ] No compliance, quality, incident, privacy, bank-change, or payout hold exists.
- [ ] Approval, rejection, suspension, or reactivation records actor, time, reason, and policy version.
- [ ] Historical evidence is superseded, never overwritten.
