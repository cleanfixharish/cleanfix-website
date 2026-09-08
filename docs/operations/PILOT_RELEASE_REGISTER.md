# Pilot Release Register

Status: **QUOTE ONLY — EXTERNAL APPROVALS NOT RECORDED**
Active pilot scope: `UNAPPROVED-DRAFT-1`
Owner: Aviel Jahav
Business legal name: `[OWNER TO CONFIRM]`
Business or dealer ID: `[OWNER/ACCOUNTANT TO CONFIRM]`

This register intentionally starts with zero approvals. Replace a status only when the applicable professional supplies the evidence required by the External Professional Sign-Off Checklist. Do not report a percentage for binary safety gates.

## Legal

| Gate code | Decision required | Status | Evidence |
| --- | --- | --- | --- |
| `LEGAL_CUSTOMER_TERMS_APPROVED` | Contracting model and bilingual customer terms | `not_started` | None |
| `LEGAL_CANCELLATION_REFUND_REMEDIATION_APPROVED` | Cancellation, service start, refunds, credits, remediation, complaints | `not_started` | None |
| `LEGAL_PROVIDER_AGREEMENT_APPROVED` | Managed-provider agreement | `not_started` | None |
| `LEGAL_PROVIDER_CLASSIFICATION_REVIEWED` | Actual provider relationship/classification | `not_started` | None |
| `LEGAL_SERVICE_LICENSING_TAXONOMY_APPROVED` | Pilot allowlist, prohibited work, licences | `not_started` | None |
| `LEGAL_PRIVACY_CONSENT_RETENTION_APPROVED` | Privacy, consent, media/address, rights, retention | `not_started` | None |
| `LEGAL_INCIDENT_PROCESS_APPROVED` | Incident, escalation, evidence, notifications | `not_started` | None |
| `LEGAL_E_ACCEPTANCE_EVIDENCE_APPROVED` | Quote/terms electronic acceptance evidence | `not_started` | None |

## Accounting and tax

| Gate code | Decision required | Status | Evidence |
| --- | --- | --- | --- |
| `ACCOUNT_ENTITY_VAT_APPROVED` | Legal identity, entity/dealer details, VAT | `not_started` | None |
| `ACCOUNT_CUSTOMER_DOCUMENT_FLOW_APPROVED` | Deposit/balance invoice and receipt flow | `not_started` | None |
| `ACCOUNT_PROVIDER_INVOICE_WITHHOLDING_APPROVED` | Provider documents and payout blocks | `not_started` | None |
| `ACCOUNT_LEDGER_RECONCILIATION_APPROVED` | Ledger entries and reconciliation | `not_started` | None |
| `ACCOUNT_REFUND_CREDIT_NOTE_APPROVED` | Refund/dispute/cancellation documents | `not_started` | None |
| `ACCOUNT_RECORD_RETENTION_EXPORT_APPROVED` | Retention and accountant export | `not_started` | None |

## Insurance

| Gate code | Decision required | Status | Evidence |
| --- | --- | --- | --- |
| `INSURANCE_CLEANFIX_COVERAGE_CONFIRMED` | CleanFix coverage for pilot model | `not_started` | None |
| `INSURANCE_PROVIDER_MINIMUMS_CONFIRMED` | Provider coverage by task/risk | `not_started` | None |
| `INSURANCE_PILOT_SCOPE_COVERED` | Exact pilot allowlist covered | `not_started` | None |
| `INSURANCE_EXCLUSIONS_CONDITIONS_RECORDED` | Exclusions, deductibles, conditions | `not_started` | None |
| `INSURANCE_INCIDENT_CLAIM_PROCESS_CONFIRMED` | Notice deadline and claims path | `not_started` | None |

## Provider readiness

| Provider | Relationship | Service eligibility | Evidence | Holds | Result |
| --- | --- | --- | --- | --- | --- |
| No provider recorded | `applicant` | `unassessed` | Missing | None recorded | `NO-GO` |

## Internal system gates

- [ ] Assignment evaluator blocks missing/expired evidence and non-pilot services.
- [ ] Relationship approval alone cannot create eligibility.
- [ ] Canonical transitions and immutable audit records are active.
- [ ] Private evidence and object-level authorization tests pass.
- [ ] Payment/refund and payout ledgers reconcile in staging.
- [ ] Scope-change, incident, quality, rework, and refund paths pass.
- [ ] Operational records survive website restore and isolated backup restore.

## Current decision

Mandatory external approvals: **0 approved**
Eligible pilot providers: **0**
Decision: **NO-GO FOR PAID DISPATCH**

Quote-only discovery may continue.
