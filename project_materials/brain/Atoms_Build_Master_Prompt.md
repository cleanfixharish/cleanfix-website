# CleanFixHarish — Atoms AI Build Master Prompt

> The master prompt used to brief Atoms AI (a no-code/AI app-builder platform) to design
> and build the full CleanFixHarish operating system — not just a website, but CRM,
> WhatsApp flow, admin, automations, webhooks, and social lead capture.
> Reusable in ChatGPT too, when you want it to think like a senior systems architect.

---

## Long version (systems-consultant brief)

```text
You are a senior product architect, automation strategist, full-stack builder, CRM
designer, and UX expert.

Build the best practical system for CleanFixHarish, a local service business in Harish,
Israel. The business should look premium and trustworthy, but the system must stay simple
enough for a non-technical owner to understand, edit, and manage independently.

Business model:
- CleanFixHarish presents its own trusted team.
- CleanFixHarish also works directly with strong local service providers in Harish.
- The platform may include a page/section for other local businesses, with direct contact
  details where appropriate.
- Trust-first, fair-price, quality-first. Avoid fake reviews, fake claims, exaggerated promises.

Design and build a complete business operating platform including whatever is needed:
public website, CRM, admin/dashboard, WhatsApp integration, forms, lead routing, webhooks,
automations, social media connection points, content editing workflow, partner/business
directory management, internal notes and status tracking, notifications, future scalability.

Create the best Phase 1 practical launch system, shortest path to going live, with a
foundation strong enough to expand later. Prioritize real lead generation and operational
clarity over unnecessary technical complexity.

1. Bilingual website in English and Hebrew. English must NOT be secondary (audience includes
   multiple language groups in Harish).
2. WhatsApp as a primary conversion channel (quick contact, quote, help, booking with minimal
   friction).
3. A real CRM structure (not just a contact form), tracking: new leads, source, requested
   service, name, phone/WhatsApp, area in Harish, handled by team vs partner, quote status,
   booking status, follow-up status, notes, job outcome.
4. Admin-friendly content editing so a non-technical owner can update text, services, partner
   listings, directory content, and key sections.
5. Partner/business logic layer: own team vs direct partner collaboration vs optional local
   business directory listing; clear distinction between internal leads, partner-routed leads,
   and direct contact listings.
6. Premium, elegant, calm, trustworthy design — "Rolls-Royce feel" — but practical for a local
   handyman/service business.
7. Realistic for a low-technical-skill owner. Prefer easy-to-operate solutions.

Do not give only code. Think like a business systems architect.

Produce:
- Best stack and structure per layer (website, CRM, admin/content, WhatsApp, automation,
  webhook, social lead capture, analytics/tracking). For each layer: what tool/service, why it
  fits, ease for a non-technical owner, cost level, what to improve later.
- Split the build into Phase 1 (fastest practical launch), Phase 2 (better automation/management),
  Phase 3 (scale and optimization). Be strict about essential-now vs later.
- Public site structure/sections: Home, Services, How it works, Why trust us, WhatsApp CTA,
  Quote request form, Partner/local businesses, About, Contact, Language switching, optional
  future app links. Copy focus: fair pricing, trusted people, service quality, fast help, local
  Harish relevance, clear honest communication.
- CRM pipeline and data model: lead stages, tags, statuses, ownership, follow-up logic, customer
  history, quote workflow, booking workflow, completed/lost outcomes + recommended fields/automations.
- WhatsApp system: click-to-WhatsApp entry points, pre-filled templates, qualification questions,
  routing logic, follow-ups, reminders, manual vs automated messages, when WhatsApp creates/updates
  CRM records, when staff take over.
- Automations: form submitted -> create lead; WhatsApp started -> log lead; new lead -> notify
  admin; status changed -> trigger follow-up; partner-assigned -> notify partner/admin; social
  inquiry -> centralize into CRM; missed/stale lead -> reminder. Show webhook logic simply.
- Social integration (Facebook, Instagram, etc.): lead capture, CTA destinations, WhatsApp-first
  actions, form fallback, source attribution, content workflow.
- Beginner-friendly admin: where to edit content, manage leads, update partners/listings, see form
  submissions, where WhatsApp fits, daily and weekly workflow. Include a plain-language section
  called "How I will actually use this system day to day".
- At the end: full system blueprint, recommended tool stack, sitemap, CRM pipeline, WhatsApp flow,
  automation map, admin workflow, MVP build order, clear next actions.

Do not over-engineer. Do not assume the owner is technical. Do not suggest complex
developer-heavy systems unless absolutely necessary. Prefer practical launch speed. Keep it
trustworthy, clean, scalable, manageable. Avoid fake marketing language and generic startup jargon.
Make recommendations for a real small local business, not a venture-backed SaaS company.

Respond in this order:
1. Executive recommendation
2. Best system architecture
3. Phase 1 launch plan
4. Website structure
5. CRM structure
6. WhatsApp flow
7. Automations and webhooks
8. Social media integration
9. Admin workflow
10. Day-to-day owner usage
11. Risks / tradeoffs
12. Exact build order

Be specific, opinionated, and practical.
```

---

## Short version (faster, more decisive)

```text
Build the best practical operating system for CleanFixHarish, a local service business in
Harish, Israel. This is not just a website project. I need a full business system that may
include: website, CRM, admin dashboard, WhatsApp integration, forms, webhooks, automations,
social media lead capture, partner directory management, content editing, and internal workflow.

Business context:
- We have our own trusted team.
- We also collaborate directly with strong service providers in Harish.
- We may list other local businesses in a directory-style section.
- We care about trust, fair pricing, good service, honesty, practical customer experience.
- We want a premium "Rolls-Royce" feel, but for a real local handyman/service business.
- The owner is not technical, so the system must be simple to understand and manage.

Requirements:
- Bilingual English + Hebrew website (English not secondary)
- WhatsApp-first lead flow
- Real CRM with statuses, tags, notes, ownership, quote and booking tracking
- Easy editing for website content and partner/business listings
- Clear distinction between internal leads, partner-routed leads, directory listings
- Social media and form leads flow into one simple system
- Fastest realistic Phase 1 launch, improve later

Give me:
1. Best recommended architecture
2. Best tools/services per layer
3. Phase 1 vs later phases
4. Website sitemap and page structure
5. CRM pipeline and fields
6. WhatsApp workflow
7. Webhooks and automations
8. Social media integration plan
9. Admin workflow for a beginner
10. Simple "how I will use this day to day"
11. Exact build order

Be practical, not theoretical. Do not over-engineer. Recommend the best setup for a
non-technical small business owner.
```

---

## Follow-up prompts (after the first answer)

```text
Good. Now turn your recommendation into:
1. the exact stack,
2. the exact database / CRM fields,
3. the exact WhatsApp flows,
4. the exact page structure,
5. the exact admin dashboard sections,
6. the exact MVP build checklist,
with no fluff and no generic advice.
```

```text
Now convert this into a build-ready product spec for designers, developers, and automation
builders. Include user flows, data fields, trigger logic, admin roles, and all required integrations.
```
