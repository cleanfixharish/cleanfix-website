"""Curated pricing baseline. Local directory pages are intentionally excluded."""

SOURCES = [
    {"source_key": "SRC_NAT_PRO_HANDY_VISIT", "publisher": "The Professionals", "url": "https://www.pro.co.il/handymen/pricing/handyman-service", "notes": "National VAT-inclusive displayed price."},
    {"source_key": "SRC_NAT_PRO_INDEX", "publisher": "The Professionals", "url": "https://www.pro.co.il/handymen/pricing", "notes": "National VAT-inclusive handyman price index."},
    {"source_key": "SRC_NAT_MID_POST4409", "publisher": "Midrag", "url": "https://www.midrag.co.il/Content/Price/4409", "notes": "National displayed-price guide manually revalidated 2026-08-20; VAT is not stated on this page."},
    {"source_key": "SRC_NAT_MID_AC18", "publisher": "Midrag", "url": "https://www.midrag.co.il/Content/SectorPriceList/18", "notes": "National price-list averages manually revalidated 2026-08-20; VAT is not stated on this page."},
]

# Midrag rows were manually revalidated against the live indexed page text on 2026-08-20.
# They remain national benchmarks only; local Harish-area adjustments require approved local evidence.
OBSERVATIONS = [
    ("NAT_PRO_HANDY_VISIT", "SRC_NAT_PRO_HANDY_VISIT", "Handyman", "Standard handyman visit", 250, 350, 300, "verified", True, "VAT included"),
    ("NAT_PRO_TV", "SRC_NAT_PRO_INDEX", "Handyman", "TV mounting, standard arm up to 42 inches; arm excluded", 250, 300, None, "verified", True, "VAT included"),
    ("NAT_PRO_PICTURE", "SRC_NAT_PRO_INDEX", "Handyman", "Hang one picture", 150, 150, 150, "verified", True, "VAT included"),
    ("NAT_PRO_MIRROR", "SRC_NAT_PRO_INDEX", "Handyman", "Hang a mirror", 200, 400, None, "verified", True, "VAT included"),
    ("NAT_PRO_SHELVES", "SRC_NAT_PRO_INDEX", "Handyman", "Hang up to three shelves", 300, 350, None, "verified", True, "VAT included"),
    ("NAT_PRO_CURTAIN", "SRC_NAT_PRO_INDEX", "Handyman", "Install curtain rod", 200, 300, None, "verified", True, "VAT included"),
    ("NAT_PRO_SMALL_FURN", "SRC_NAT_PRO_INDEX", "Assembly", "Assemble small furniture", 300, 400, None, "verified", True, "VAT included"),
    ("NAT_PRO_LARGE_FURN", "SRC_NAT_PRO_INDEX", "Assembly", "Assemble large furniture", 300, 500, None, "verified", True, "VAT included"),
    ("NAT_PRO_PAINT", "SRC_NAT_PRO_INDEX", "Handyman", "Small paint repair", 300, 500, None, "verified", True, "VAT included"),
    ("NAT_PRO_PUTTY", "SRC_NAT_PRO_INDEX", "Handyman", "Small putty repair", 300, 400, None, "verified", True, "VAT included"),
    ("NAT_PRO_SEAL", "SRC_NAT_PRO_INDEX", "Handyman", "Small sealing job", 280, 350, None, "verified", True, "VAT included"),
    ("NAT_MID_POST4", "SRC_NAT_MID_POST4409", "Cleaning", "Post-renovation cleaning, four rooms", 1500, 3200, None, "verified", True, "VAT unspecified"),
    ("NAT_MID_POST100", "SRC_NAT_MID_POST4409", "Cleaning", "Post-renovation cleaning, 100 sqm/four rooms", 1300, 2000, None, "verified", True, "VAT unspecified"),
    ("NAT_MID_POST5", "SRC_NAT_MID_POST4409", "Cleaning", "Post-renovation cleaning, 120 sqm/five rooms", 1700, 2300, None, "verified", True, "VAT unspecified"),
    ("NAT_MID_GLASS4", "SRC_NAT_MID_POST4409", "Cleaning", "Many windows or glass walls supplement, four rooms", 300, 400, None, "verified", True, "VAT unspecified"),
    ("NAT_MID_AC_FILTER", "SRC_NAT_MID_AC18", "Air conditioning", "Split-unit filter cleaning", 262, 325, None, "verified", True, "VAT unspecified"),
    ("NAT_MID_AC_DEEP", "SRC_NAT_MID_AC18", "Air conditioning", "Deep split-unit cleaning", 377, 565, None, "verified", True, "VAT unspecified"),
    ("NAT_MID_AC_MOLD", "SRC_NAT_MID_AC18", "Air conditioning", "Accessible split-unit mold cleaning", 360, 550, None, "verified", True, "VAT unspecified"),
    ("NAT_MID_AC_VISIT", "SRC_NAT_MID_AC18", "Air conditioning", "Diagnostic technician visit only", 283, 351, None, "verified", True, "VAT unspecified"),
]


async def ensure_pricing_baseline(db):
    """Idempotently seed corrected source relationships without overwriting review decisions."""
    from sqlalchemy import select
    from models.pricing import PriceObservation, PricingSource

    source_ids = {}
    for item in SOURCES:
        source = (await db.execute(select(PricingSource).where(PricingSource.source_key == item["source_key"]))).scalar_one_or_none()
        if source is None:
            source = PricingSource(**item, geography="Israel national", evidence_type="displayed_price", accessed_on="2026-08-20")
            db.add(source)
            await db.flush()
        source_ids[item["source_key"]] = source.id
    for key, source_key, category, sub_service, minimum, maximum, typical, status, eligible, vat in OBSERVATIONS:
        exists = (await db.execute(select(PriceObservation.id).where(PriceObservation.observation_key == key))).scalar_one_or_none()
        if exists is None:
            db.add(PriceObservation(observation_key=key, source_id=source_ids[source_key], category=category, sub_service=sub_service, geography="Israel national", min_price=minimum, max_price=maximum, typical_price=typical, vat_status=vat, basis="Public displayed price; scope and exclusions must be reviewed.", confidence="high" if eligible else "provisional", validation_status=status, eligible_for_estimate=eligible))
    await db.commit()
