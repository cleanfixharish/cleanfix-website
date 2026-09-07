import hashlib
from datetime import date, datetime, timezone
from urllib.parse import urlencode, urlsplit, urlunsplit, parse_qsl

from sqlalchemy import select

from models.growth import GrowthPost, GrowthRun


TEMPLATES = {
    "helpful_tip": {
        "en": "Before booking home service, send a clear photo and describe what changed. It helps us review the scope, identify questions, and prepare a clearer next step.",
        "he": "לפני שמזמינים שירות לבית, שלחו תמונה ברורה ותארו מה השתנה. כך נוכל לבדוק את ההיקף, לזהות שאלות ולהכין שלב הבא ברור יותר.",
    },
    "service_explainer": {
        "en": "A good service request starts with one clear scope: what needs attention, where it is, and when access is possible. CleanFixHarish reviews the details before any price or schedule is promised.",
        "he": "בקשת שירות טובה מתחילה בהיקף ברור: מה דורש טיפול, היכן העבודה ומתי אפשר להיכנס. CleanFixHarish בודקת את הפרטים לפני שמבטיחים מחיר או מועד.",
    },
    "local_trust": {
        "en": "One local contact, a written scope, and documented changes. That is how CleanFixHarish keeps home-service work in Harish easier to understand from request to completion.",
        "he": "איש קשר מקומי אחד, היקף כתוב ושינויים מתועדים. כך CleanFixHarish הופכת עבודות שירות בחריש לברורות יותר, מהבקשה ועד הסיום.",
    },
    "before_you_book": {
        "en": "Before work begins, confirm what is included, what is excluded, the agreed price, and the next decision point. A few clear lines can prevent a long misunderstanding.",
        "he": "לפני תחילת העבודה, ודאו מה כלול, מה לא כלול, מה המחיר שסוכם ומהי נקודת ההחלטה הבאה. כמה שורות ברורות יכולות למנוע אי־הבנה ארוכה.",
    },
}


def content_hash(copy: str, destination_url: str, scheduled_for: datetime | None) -> str:
    payload = f"{copy.strip()}\n{destination_url.strip()}\n{scheduled_for.isoformat() if scheduled_for else ''}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def idempotency_key(day: date, channel: str, language: str, topic: str) -> str:
    return hashlib.sha256(f"{day.isoformat()}:{channel}:{language}:{topic}".encode()).hexdigest()


def utm_url(destination_url: str, channel: str, campaign: str) -> str:
    parts = urlsplit(destination_url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.update({"utm_source": channel, "utm_medium": "organic_social", "utm_campaign": campaign})
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def build_daily_draft(settings, day: date, channel: str, language: str, topic: str) -> dict:
    campaign = f"daily-organic-{day.isoformat()}"
    template = TEMPLATES.get(topic, TEMPLATES["helpful_tip"])[language]
    cta = settings.default_cta.strip()
    copy = f"{template}\n\n{cta}"
    destination = settings.destination_url.strip()
    return {
        "campaign_name": campaign,
        "topic": topic,
        "audience": "customer",
        "channel": channel,
        "language": language,
        "body": copy,
        "alt_text": "CleanFixHarish local home-service guidance" if language == "en" else "טיפ מקומי לשירותי בית מבית CleanFixHarish",
        "destination_url": destination,
        "utm_url": utm_url(destination, channel, campaign),
        "status": "draft",
        "content_version": 1,
        "content_hash": content_hash(copy, destination, None),
        "idempotency_key": idempotency_key(day, channel, language, topic),
        "created_at": datetime.now(timezone.utc),
    }


async def generate_daily_drafts(db, settings, day: date, trigger: str = "admin") -> GrowthRun:
    """Create one idempotent, owner-reviewable batch from the saved admin settings."""
    run = GrowthRun(
        trigger=trigger,
        status="running",
        strategist_summary="Selected approved content pillars, channels, languages, and CTA from admin settings.",
        copywriter_summary="Created native Hebrew/English variants from reviewed CleanFixHarish templates.",
        policy_summary="Draft-only output. Owner approval remains mandatory; no external channel was contacted.",
    )
    db.add(run)
    await db.flush()
    created = 0
    pillars = settings.content_pillars or ["helpful_tip"]
    for index in range(settings.daily_post_limit):
        topic = pillars[(day.toordinal() + index) % len(pillars)]
        for channel in settings.channels:
            for language in settings.languages:
                values = build_daily_draft(settings, day, channel, language, topic)
                exists = (
                    await db.execute(select(GrowthPost.id).where(GrowthPost.idempotency_key == values["idempotency_key"]))
                ).scalar_one_or_none()
                if exists:
                    continue
                db.add(GrowthPost(**values))
                created += 1
    run.drafts_created = created
    run.status = "completed"
    run.finished_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(run)
    return run
