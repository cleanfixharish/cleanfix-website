# CleanFixHarish — Perplexity Deep Research Brief

Run this as **Deep Research** inside the Perplexity Space named **CleanFixHarish**.

## Research instruction

You are the market-research and pricing analyst for CleanFixHarish, a managed home-services business based in Harish, Israel. Produce a source-cited, decision-ready market and pricing report that can later become the evidence base for a human-approved AI price-estimation system.

Research date: use the current date. Prefer sources updated within the last 24 months. Clearly label older evidence.

### Geographic scope

Analyze prices and availability separately where evidence permits for:

1. Harish
2. Pardes Hanna-Karkur
3. Hadera
4. Kfar Kara
5. Katzir
6. Or Akiva
7. Caesarea
8. Binyamina-Giv'at Ada
9. Zichron Yaakov

Do not invent a local price where no reliable local evidence exists. Instead, use a national or regional baseline, label it as an inference, explain the adjustment method, and assign low, medium, or high confidence.

### Service categories

Research at least these categories and their common sub-jobs:

1. Handyman call-out and hourly work
2. Shelf, mirror, picture, television, curtain rail, and accessory installation
3. Flat-pack and furniture assembly
4. Move-in and move-out cleaning
5. Post-renovation cleaning
6. Regular apartment and house cleaning
7. Window, frame, shutter, and track cleaning
8. Air-conditioner filter and routine indoor-unit cleaning, excluding regulated repair work
9. Small plumbing work that legally may be performed without a specialist licence
10. Small painting, patching, silicone, sealing, and cosmetic repair work

Explicitly identify work that requires a licensed or specially insured professional in Israel. Do not recommend that unlicensed providers perform regulated electrical, gas, pest-control, structural, height, or other legally restricted work.

### Competitor and channel analysis

Map direct and indirect competitors serving these areas, including when relevant:

- Midrag
- The Professionals / HaMikצוענים
- B144
- Easy
- Calliber
- Local Facebook groups
- Local WhatsApp groups
- Google Business Profiles
- Independent providers and cleaning companies

For each competitor or channel, report:

- Business model
- Geographic coverage
- How customers request work
- Whether prices are fixed, ranged, quoted, auctioned, or negotiated
- Trust mechanisms such as reviews, vetting, insurance, guarantees, or support
- Provider fees, customer fees, or lead fees when publicly documented
- Strengths, weaknesses, and opportunity for CleanFixHarish

### Price evidence table

Create a structured table with one row per price observation and these exact columns:

- service_category
- sub_service
- city_or_area
- source_name
- source_url
- source_publication_or_update_date
- observed_on_date
- listed_price_min_ils
- listed_price_max_ils
- typical_or_average_price_ils
- vat_status: included / excluded / unclear
- callout_included: yes / no / unclear
- materials_included: yes / no / partial / unclear
- labor_basis: fixed / hourly / per_item / per_room / per_square_meter / quote_only
- minimum_charge_ils
- urgency_or_after_hours_adjustment
- travel_or_distance_adjustment
- important_inclusions
- important_exclusions
- evidence_type: published_price_guide / provider_listing / marketplace_listing / completed_job_data / advertisement / other
- confidence: high / medium / low
- notes

Use exact quotations sparingly and within copyright limits. Paraphrase most content. Link directly to the supporting page, not a search-results page.

### Local benchmark recommendations

For each service and each geographic cluster, recommend:

- Defensible market-low benchmark
- Typical benchmark
- Premium benchmark
- Suggested CleanFixHarish customer estimate range
- Suggested provider payout range
- Target gross margin in shekels and percentage
- Conditions that should widen the range
- Questions and photos required before estimating
- Conditions requiring an on-site visit
- Conditions requiring a licensed provider
- Confidence level and number of supporting sources

Treat the following existing CleanFixHarish offers as hypotheses to test, not facts to defend:

- Home Visit from ILS 299 for tightly scoped small handyman work
- New Home Setup package from ILS 699–999
- Post-renovation cleaning priced only after photos, with an indicative four-room hypothesis around ILS 2,000–4,000

Evaluate whether each hypothesis is commercially and locally defensible. State precisely what is included, excluded, and what would cause a higher price.

### AI-estimator data design

Design the evidence schema for a future estimator. The estimator will receive:

- Customer explanation in Hebrew or English
- Customer photos
- City and neighborhood
- Property type and size
- Floor and elevator/access details
- Urgency and preferred time
- Materials status
- Parking/travel conditions
- Risk indicators

Recommend:

1. Required intake fields by service
2. Photo checklist by service
3. Complexity and risk factors
4. Price adjustment rules expressed as transparent ranges, not false precision
5. Confidence scoring
6. Missing-information rules
7. Human approval rules
8. Provider-matching fields
9. What must never be inferred from a photo alone
10. What records should be saved after each completed job so estimates improve over time

The launch version must produce a **non-binding estimate range**, confidence level, assumptions, exclusions, and follow-up questions. It must not automatically promise a final customer price. Aviel must approve the estimate during the first 20 paid jobs.

### Provider selection and marketplace safety

Evaluate CleanFixHarish's proposed approach: set the customer price and then find a suitable professional who accepts the job at an approved payout.

Recommend a safe provider-ranking model that does not simply select the lowest bidder. Include:

- Verified skills and licences where relevant
- Insurance
- Quality and rework history
- Reliability and cancellation history
- Customer rating based only on genuine completed jobs
- Availability
- Travel distance
- Expected duration
- Provider payout
- CleanFixHarish margin

Explain risks of reverse-auction behavior, underpricing, misclassification, unsafe work, bait-and-switch pricing, and provider churn, and give practical controls.

### Legal and commercial caveats

Flag items requiring confirmation by an Israeli accountant, lawyer, insurance broker, or relevant licensing authority, including VAT presentation, cancellation rights, invoicing, privacy/photo retention, consumer disclosures, provider classification, accessibility, insurance, and regulated trades.

Do not provide invented legal conclusions. Cite official Israeli sources where available and clearly separate research from professional advice.

### Required final deliverables

Return the report in this order:

1. Executive summary
2. Known facts versus assumptions
3. Market size and local demand indicators
4. Competitor comparison table
5. Complete price-evidence table
6. Local benchmark table by service and geographic cluster
7. Evaluation of the three CleanFixHarish launch offers
8. Recommended customer-pricing and provider-payout logic
9. AI-estimator intake, photo, confidence, and human-approval design
10. Provider-ranking and safety model
11. First-20-jobs validation plan
12. Legal/compliance questions requiring professional confirmation
13. Source list with direct links and publication/update dates
14. Machine-readable JSON appendix matching the price-evidence fields above

Do not hide uncertainty. A missing local price is better than a fabricated one. Every numerical recommendation must show its evidence or be clearly labeled as a hypothesis.
