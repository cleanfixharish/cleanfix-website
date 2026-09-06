# CleanFixHarish WhatsApp and Intake Flows

> Ready-to-use bilingual (Hebrew + English) WhatsApp scripts, intake questions, quote and
> follow-up templates, and CRM logic. Keep replies short, human, calm, and premium.
> Never promise exact prices before scope is known.

---

## Principles

1. **Speed** — reply as fast as possible.
2. **Clarity** — ask only what's needed, one step at a time.
3. **Trust** — polite, human, honest.
4. **Low friction** — always give an easy next step.
5. **Premium tone** — calm and respectful, never salesy or robotic.

First reply should be short. Ask for the minimum first. Hebrew first for local customers,
English underneath when bilingual.

---

## Minimum Intake Data (collect over the conversation, not all at once)

- Name
- Phone / WhatsApp
- Area (in/near Harish)
- Service needed
- Timing / urgency
- Notes or photos (especially for handyman + post-renovation)

---

## 1. WhatsApp First Reply — General

**Hebrew:**
```
שלום, תודה שפנית ל-CleanFixHarish 🙏
אשמח לעזור. באיזה שירות מדובר, ובאיזה אזור בחריש?
אם יש תמונות רלוונטיות, אפשר לשלוח — זה עוזר לתת מענה מדויק.
```

**English:**
```
Hi, thanks for reaching out to CleanFixHarish.
Happy to help. What service do you need, and which area in/near Harish?
If you have relevant photos, feel free to send them — it helps us reply accurately.
```

---

## 2. WhatsApp First Reply — Handyman (primary service)

**Hebrew:**
```
שלום 🙂 קיבלנו את הפנייה לשירות תיקונים/התקנות.
כדי לתת מענה מדויק — מה צריך לתקן או להתקין, ובאיזה אזור בחריש?
תמונה קצרה של המקום תעזור מאוד.
```

**English:**
```
Hi. We received your request for repairs/installation.
To reply accurately — what needs fixing or installing, and which area in/near Harish?
A quick photo of the spot would help a lot.
```

---

## 3. Quote-Request Flow (short, high-conversion)

Ask these in order, one or two at a time — not as a long form:

1. What do you need? (service)
2. Which area (in/near Harish)?
3. When would suit you? (timing/urgency)
4. A photo or two, if relevant.
5. Name to save the request under.

**Wrap-up message (Hebrew):**
```
מעולה, רשמנו הכול. נחזור אליך עם הצעד הבא בהקדם.
תודה על הסבלנות 🙏
```

**Wrap-up message (English):**
```
Great, we've noted everything. We'll get back to you with the next step shortly.
Thanks for your patience.
```

---

## 4. Quote / Estimate Follow-Up (after photos or details)

**Hebrew:**
```
תודה על הפרטים. לפי מה שנשלח, הנה הצעד הבא: [scope / next step].
המחיר נקבע לפי היקף העבודה בפועל, ונשמור על מחיר הוגן וברור.
מתאים להתקדם?
```

**English:**
```
Thanks for the details. Based on what you sent, here's the next step: [scope / next step].
Pricing is based on the actual scope of work, and we keep it fair and clear.
Shall we go ahead?
```

---

## 5. Appointment Confirmation

**Hebrew:**
```
קבענו: [שירות] ביום [תאריך] בשעה [שעה], באזור [אזור].
אם משהו משתנה, עדכן/י אותנו מראש. נתראה 🙂
```

**English:**
```
You're booked: [service] on [date] at [time], in [area].
If anything changes, let us know in advance. See you then.
```

---

## 6. Reminder (day before)

**Hebrew:**
```
תזכורת קטנה: מחר [שעה] מגיעים אליך ל[שירות]. הכול בתוקף? 🙂
```

**English:**
```
A quick reminder: we're coming tomorrow at [time] for [service]. Still good for you?
```

---

## 7. Polite Follow-Up (no reply after a quote)

**Hebrew:**
```
היי, רק בודקים אם התלבטת לגבי [שירות]. נשמח לעזור אם יש שאלות —
ואפשר להתקדם בכל רגע שנוח לך.
```

**English:**
```
Hi, just checking in about [service]. Happy to answer any questions —
and we can move forward whenever it suits you.
```

---

## 8. Post-Job Wrap-Up (ask for review only when appropriate)

**Hebrew:**
```
תודה שבחרת ב-CleanFixHarish 🙏 מקווים שאתה מרוצה מהתוצאה.
אם היה טוב — נשמח מאוד לחוות דעת קצרה. וכמובן, כאן להמשך.
```

**English:**
```
Thank you for choosing CleanFixHarish. We hope you're happy with the result.
If it was good, a short review would mean a lot. And of course, we're here for next time.
```

Only ask for a review when the customer seems satisfied. Never pressure. Never fabricate.

---

## Entry Points (Click-to-WhatsApp)

Use `wa.me` links with a pre-filled message so the CRM/source is easy to track:

- **General:** `https://wa.me/<number>?text=Hi%20CleanFixHarish%2C%20I%27d%20like%20help%20with...`
- **Handyman:** pre-fill "Hi, I need a handyman for..."
- **Per service card:** pre-fill the service name so the incoming message already labels the lead.

Place CTAs on: hero, each service card, sticky mobile button, contact section, and social bios.

---

## CRM / Lead Logic

Every WhatsApp conversation or form submission should create or update a CRM lead.

**Lead fields:**
- Name
- Phone / WhatsApp
- Source (which entry point / channel)
- Requested service
- Area in Harish
- Handled by: CleanFixHarish team / partner
- Quote status: none / sent / accepted / declined
- Booking status: none / scheduled / completed / cancelled
- Follow-up status: none / pending / done
- Notes
- Job outcome: won / lost / completed

**Lead stages:** New → Contacted → Quoted → Booked → Completed → (or Lost).

**Automations (recommended):**
- Form submitted → create lead → notify admin.
- WhatsApp started → log/update lead.
- Status changed → trigger the right follow-up template.
- Partner-assigned lead → notify partner/admin.
- Social inquiry → centralize into the same CRM.
- Missed / stale lead → reminder to follow up.

**When staff take over manually:** pricing negotiation, unusual scope, scheduling conflicts,
or any sensitive customer situation. Automations handle logging, routing, reminders, and
first-touch templates — humans handle judgment.
