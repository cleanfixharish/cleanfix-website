# Pricing evidence and estimator boundary

Status: implemented locally on `feature/pricing-evidence-estimator`; not deployed.

## What is safe to use now

Eleven national, VAT-inclusive observations from The Professionals are marked `verified` and may be selected as reference evidence for a draft estimate. They are national references, not Harish prices.

Corrected source relationships:

- `NAT_PRO_HANDY_VISIT` -> `SRC_NAT_PRO_HANDY_VISIT`
- All other `NAT_PRO_*` observations -> `SRC_NAT_PRO_INDEX`
- All four post-renovation cleaning observations -> `SRC_NAT_MID_POST4409`
- All four air-conditioning observations -> `SRC_NAT_MID_AC18`

## What remains blocked

The eight Midrag observations are stored as `pending`, `provisional`, and `eligible_for_estimate=false`. A draft estimate cannot be created from them.

Before an owner changes any of these rows to verified, the live page must be manually checked for:

1. Exact task and scope.
2. Exact minimum and maximum.
3. Whether the amount includes VAT.
4. Included work, exclusions, and supplements.
5. Geography (national versus local).
6. Live URL and review date.

If the page does not display enough evidence, the row stays pending.

## Estimator safety rules

- Every price is a non-binding draft.
- Only an authenticated owner can use pricing tools.
- A draft requires owner-entered scope, geography, and a verified reference.
- Approval requires an explicit customer range and provider budget.
- The system records who approved and when.
- There is no automatic customer-send or automatic final-price endpoint.
- Provider quotes and completed jobs are stored separately as local evidence.
- Local averages and margins remain hidden until five owner-approved records exist for the same service and geography, each with both customer and provider amounts.

## Required next evidence

Collect real provider quotations and completed-job records for Harish, Pardes Hanna-Karkur, and Hadera. Keep category, sub-service, scope, customer price, provider amount, and geography consistent. Only then can the system calculate an evidence-backed local adjustment and real retained margin.
