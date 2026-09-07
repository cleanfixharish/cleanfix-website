# Organic Growth Operations

## Current checkpoint

The Growth Center is a persistent, approval-gated organic marketing workflow. It creates daily Hebrew and English drafts from owner-controlled settings, records each expert run, and keeps every post version auditable.

Automatic public posting is intentionally unavailable until an official channel connection has been verified. Facebook and Instagram must use Meta's official API. Community groups, forums, and WhatsApp groups remain manual share-kit destinations.

## Daily workflow

1. The strategist selects a configured content pillar, channel, audience, and CTA.
2. The bilingual editor creates native Hebrew and English variants.
3. The policy reviewer keeps output in draft state and blocks unsupported promises.
4. The owner reviews and approves the exact content version.
5. The approved version can be scheduled, copied as a share kit, or marked as manually published.

Editing an approved post invalidates its approval. Daily draft keys prevent duplicate channel/language/topic posts for the same date.

## Admin-controlled settings

- automation enabled/disabled
- daily creation time and timezone
- number of daily topics and planning horizon
- languages, channels, and content pillars
- CTA and landing-page destination
- approved facts and banned phrases
- notification email

Credentials and access tokens are deployment secrets and must never be stored in these settings or returned to the browser.

## Production scheduling

The one-shot worker command is:

```text
python growth_daily.py
```

Run it once daily from a dedicated Railway cron service using the same image, database, and environment as the web service. The worker exits safely without creating content when automation is disabled. Repeated runs on the same day are idempotent.

## Next channel phase

1. Connect the CleanFixHarish Facebook Page and Instagram Professional account through a Meta app.
2. Store tokens only in the deployment secret manager.
3. Add connection tests and a private staging publication.
4. Keep owner approval mandatory while measuring reliability.
5. Enable the channel adapter only after successful staging and rollback checks.
