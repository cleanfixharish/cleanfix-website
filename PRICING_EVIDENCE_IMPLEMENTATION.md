# Pricing evidence and estimator boundary

Status: implemented locally on `feature/pricing-evidence-estimator`; not deployed.

## What is safe to use now

Nineteen national observations are marked `verified` and may be selected as reference evidence for a draft estimate. Eleven VAT-inclusive handyman observations come from The Professionals. Eight Midrag cleaning and air-conditioning observations were manually revalidated on 2026-08-20; their VAT status remains unspecified. All 19 are national references, not Harish prices.

Corrected source relationships:

- `NAT_PRO_HANDY_VISIT` -> `SRC_NAT_PRO_HANDY_VISIT`
- All other `NAT_PRO_*` observations -> `SRC_NAT_PRO_INDEX`
- All four post-renovation cleaning observations -> `SRC_NAT_MID_POST4409`
- All four air-conditioning observations -> `SRC_NAT_MID_AC18`

## Midrag validation completed on 2026-08-20

The live indexed text of both source pages was checked for exact task, range, scope, geography, exclusions, and supplements. The eight rows now point to their correct sources and are eligible only as national evidence for a human-approved draft:

- Post-renovation cleaning: four rooms, 1,500–3,200 NIS.
- Post-renovation cleaning: 100 sqm/four rooms, 1,300–2,000 NIS.
- Post-renovation cleaning: 120 sqm/five rooms, 1,700–2,300 NIS.
- Many windows or glass walls supplement for four rooms, 300–400 NIS.
- Split-unit filter cleaning, 262–325 NIS.
- Deep split-unit cleaning, 377–565 NIS.
- Accessible split-unit mold cleaning, 360–550 NIS.
- Diagnostic technician visit only, 283–351 NIS.

The post-renovation guide says ordinary window cleaning is included, while waste removal, wall cleaning, appliance cleaning, and polishing are excluded or additional. The AC page describes averages from provider price lists and customer transactions. Neither source page states VAT for these rows, so the implementation does not claim VAT is included.

Sources:

- https://www.midrag.co.il/Content/Price/4409
- https://www.midrag.co.il/Content/SectorPriceList/18

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
