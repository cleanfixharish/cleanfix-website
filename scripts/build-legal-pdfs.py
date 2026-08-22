from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from bidi.algorithm import get_display

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "app" / "frontend" / "public" / "legal"
OUT.mkdir(parents=True, exist_ok=True)

pdfmetrics.registerFont(TTFont("CleanFix", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("CleanFix-Bold", r"C:\Windows\Fonts\arialbd.ttf"))

NAVY, GOLD, IVORY, INK, MUTED = map(HexColor, ["#102E38", "#C49332", "#F7F2EA", "#24373C", "#625B53"])
W, H = A4

DOCUMENTS = [
    ("customer-service-terms-en.pdf", False, "Customer Service Terms - Review Draft", [
        ("Important status", "This document is an operational draft, not the final binding agreement. Israeli counsel, an accountant and an insurance adviser must approve it, complete the legal entity details and assign an effective date before paid dispatch."),
        ("1. The service relationship", "The customer contracts with and pays CleanFixHarish. CleanFixHarish defines the written scope, price, schedule, communication, quality review and remediation path. An approved independent service partner may perform the assignment under CleanFixHarish management."),
        ("2. Quote and scope", "A quote is valid only for its stated scope, assumptions, exclusions, address, schedule and expiry. Photos and descriptions assist scoping but do not disclose hidden conditions. Acceptance records the exact version, language, price and applicable VAT treatment."),
        ("3. Payment and cancellation", "Payment or a proportionate deposit is made only to CleanFixHarish through an approved method. Cancellation rights, fees, refunds and online cancellation methods will follow applicable Israeli consumer law and the disclosure shown before acceptance."),
        ("4. Access and safety", "The customer provides safe, lawful and timely access, identifies known hazards and protects valuables, children and animals. CleanFixHarish may stop or refuse unsafe, regulated, materially different or inaccessible work."),
        ("5. Changes", "No verbal extra is binding. A material difference pauses affected work until CleanFixHarish issues a written change order showing revised scope, price, schedule and provider payout, and the required parties approve it."),
        ("6. Provider contact", "The assigned person is safely identified through a CleanFixHarish arrival card. Booking, changes, payment, complaints and future requests remain through CleanFixHarish. Direct private payment or solicitation is outside CleanFixHarish coordination and remediation coverage."),
        ("7. Quality and remediation", "A customer should report a specific issue with supporting information within the displayed review period. CleanFixHarish compares the issue with the agreed scope and evidence. A covered remedy may be rework, a replacement provider, credit or proportional refund. New work, hidden defects, customer-supplied material failure, later damage and normal wear are excluded unless expressly accepted."),
        ("8. Regulated work", "Regulated work is offered only after the relevant service and assigned professional pass the applicable licence, insurance and scope gates. The applicable licence information will be disclosed where required."),
        ("9. Privacy", "Home photos, address, communications and job evidence are handled under the CleanFixHarish Privacy Notice and are shared with an assigned provider only as necessary to perform the job."),
        ("10. Legal completion required", "Counsel must add the legal entity name and number, address, governing law and venue, liability and insurance language, statutory cancellation text, accessibility method, notices and any mandatory Hebrew precedence clause."),
        ("Contact", "CleanFixHarish, Harish, Israel | info@cleanfixharish.co.il | 050-827-5505"),
    ]),
    ("privacy-notice-en.pdf", False, "Privacy Notice - Review Draft", [
        ("Important status", "This is a privacy implementation draft pending Israeli legal review, database mapping and completion of the controller's legal identity."),
        ("Information collected", "Contact and account details; service request, address and scheduling information; private photos and files; quotes, payments and refunds; job status and evidence; support communications; consent, security and audit records; device and usage information needed to operate and protect the service."),
        ("Purposes", "Respond to requests, assess scope and safety, prepare quotes, assign approved providers, operate communication, process payment and payout, document quality, resolve issues, secure the service, comply with law and improve operations using truthful aggregated measures."),
        ("Sharing", "Information is shared only with assigned service partners and processors to the minimum necessary, and with advisers, insurers, payment providers or authorities where legally or operationally required. CleanFixHarish does not sell private home photos or customer contact lists."),
        ("Provider access", "Exact address and job media are withheld until confirmed assignment where practical. Provider access is limited to job necessity, time, role and audit controls. Providers may not use customer information for independent marketing or direct solicitation."),
        ("Retention and security", "Retention periods must be approved by counsel and mapped by data category. Financial and legal records may require longer retention. Access control, encryption in transit, backups, audit logs and incident procedures are used proportionately; no system can promise absolute security."),
        ("Marketing", "Marketing messages require the appropriate consent and a working opt-out. Transactional service messages are separated from promotional messages. Groups and forums are not scraped or mass messaged."),
        ("Choices and requests", "Subject to applicable law, people may request access, correction, deletion, consent withdrawal or information about processing. Some records may be retained for legal, financial, safety or dispute purposes."),
        ("International processors", "Any processing outside Israel, cross-border transfer basis and current processor list must be confirmed and disclosed before this notice becomes effective."),
        ("Contact", "Privacy requests: info@cleanfixharish.co.il | 050-827-5505. Counsel must add the controller's full legal identity, response procedure and effective date."),
    ]),
    ("provider-principles-en.pdf", False, "Service Partner Principles - Review Draft", [
        ("Important status", "This is not the final subcontract. Israeli counsel, accountant and insurance adviser must approve classification, licensing, tax, insurance, payment and non-solicitation terms before assignment."),
        ("Role", "The partner accepts a specific CleanFixHarish assignment for a written payout. CleanFixHarish remains the customer-facing contractor and owns scope, quote, communication, quality close and remediation."),
        ("Eligibility", "Identity, business and invoice capability, service boundaries, references, applicable licences, insurance, availability and payout floor must be current. Expired or missing evidence pauses eligibility."),
        ("Customer relationship", "No personal business card, private quote, direct payment or invitation to bypass CleanFixHarish is permitted on an assignment. Future requests from a customer introduced by CleanFixHarish are redirected to CleanFixHarish. Any final restriction must be narrow, time-limited, exclude provable pre-existing relationships and use proportionate remedies."),
        ("Confidentiality and privacy", "Customer identity, address, photos, access details, prices, job packets and communications are confidential and used only for the assignment. No independent marketing, copying or unnecessary retention."),
        ("Execution", "The partner follows the immutable scope, safety requirements and evidence checklist, identifies through the approved arrival process and may not substitute another person without CleanFixHarish approval and customer notice."),
        ("Change orders", "Unexpected work is documented and the affected task pauses. Only a CleanFixHarish written change order approved by the required parties can change scope, customer price, schedule or payout."),
        ("Quality and incidents", "Completion evidence is submitted for review. Safety, injury, damage, harassment, fraud or privacy incidents are reported immediately and preserved. Rework and deductions require evidence, notice and review."),
        ("Payout", "The assignment displays the agreed payout, material responsibility and conditions. Planning target: eligible undisputed payout within two business days after quality close and cleared payment. Final tax, invoice, withholding, dispute and bank-verification rules require professional approval."),
        ("Independence and classification", "The operational reality, not the contract title, determines employment classification. The final model must preserve genuine independence or use compliant employment/service-company arrangements where control or dependency becomes employee-like."),
        ("Contact", "CleanFixHarish partner operations | info@cleanfixharish.co.il | 050-827-5505"),
    ]),
    ("customer-service-terms-he.pdf", True, "תנאי שירות ללקוח - טיוטה לבדיקה", [
        ("מעמד חשוב", "זהו מסמך תפעולי בטיוטה ואינו ההסכם המחייב הסופי. עורך דין ישראלי, רואה חשבון וסוכן ביטוח חייבים לאשר אותו, להשלים את פרטי הישות המשפטית ולקבוע תאריך תחילה לפני גביית תשלום ושיגור עבודה."),
        ("1. מערכת היחסים", "הלקוח מתקשר עם CleanFixHarish ומשלם לה. CleanFixHarish מנהלת את ההיקף הכתוב, המחיר, התיאום, התקשורת, בדיקת האיכות ודרך הפתרון. בעל מקצוע עצמאי ומאושר רשאי לבצע את המשימה בניהול CleanFixHarish."),
        ("2. הצעה והיקף", "הצעת מחיר תקפה רק להיקף, להנחות, להחרגות, לכתובת, למועד ולתוקף שצוינו בה. תמונות ותיאור מסייעים להערכה אך אינם חושפים תנאים נסתרים. האישור שומר את הגרסה, השפה, המחיר וטיפול המע״מ."),
        ("3. תשלום וביטול", "תשלום או מקדמה מידתית מועברים רק ל-CleanFixHarish באמצעי מאושר. זכויות ביטול, דמי ביטול, החזרים ודרך ביטול מקוונת יהיו בהתאם לדין הישראלי ולגילוי שיוצג לפני האישור."),
        ("4. גישה ובטיחות", "הלקוח מספק גישה בטוחה וחוקית, מדווח על סיכונים ידועים ושומר על חפצי ערך, ילדים ובעלי חיים. CleanFixHarish רשאית לעצור או לסרב לעבודה מסוכנת, מוסדרת, שונה מהותית או ללא גישה."),
        ("5. שינויים", "תוספת בעל פה אינה מחייבת. שינוי מהותי עוצר את העבודה הרלוונטית עד להפקת הוראת שינוי כתובה עם היקף, מחיר, לוח זמנים ותשלום מעודכנים ואישור הצדדים הנדרשים."),
        ("6. קשר עם בעל המקצוע", "בעל המקצוע מזוהה בבטחה בכרטיס הגעה של CleanFixHarish. הזמנות, שינויים, תשלום, תלונות ובקשות עתידיות נעשים דרך CleanFixHarish. תשלום פרטי או עקיפה נמצאים מחוץ לתיאום ולכיסוי הפתרון של CleanFixHarish."),
        ("7. איכות ופתרון", "יש לדווח על בעיה מוגדרת עם מידע תומך בתוך חלון הבדיקה שיוצג. CleanFixHarish תשווה את הבעיה להיקף ולתיעוד. פתרון מכוסה עשוי להיות תיקון, בעל מקצוע חלופי, זיכוי או החזר יחסי. עבודה חדשה, פגם נסתר, כשל חומר שסיפק הלקוח, נזק מאוחר ובלאי רגיל מוחרגים אלא אם אושרו במפורש."),
        ("8. עבודה מוסדרת", "עבודה מוסדרת תוצע רק לאחר שהשירות ובעל המקצוע עברו את שערי הרישוי, הביטוח וההיקף. פרטי רישיון יוצגו כאשר הדין מחייב."),
        ("9. פרטיות", "תמונות הבית, הכתובת, התקשורת ותיעוד העבודה מטופלים לפי הודעת הפרטיות ומשותפים עם בעל מקצוע משובץ רק במידה הנדרשת לביצוע."),
        ("10. השלמה משפטית", "עורך הדין ישלים שם ומספר ישות, כתובת, דין וסמכות, אחריות וביטוח, נוסח ביטול סטטוטורי, נגישות, הודעות וכל הוראת עדיפות לשפה העברית."),
        ("יצירת קשר", "CleanFixHarish, חריש, ישראל | info@cleanfixharish.co.il | 050-827-5505"),
    ]),
    ("privacy-notice-he.pdf", True, "הודעת פרטיות - טיוטה לבדיקה", [
        ("מעמד חשוב", "זוהי טיוטת יישום פרטיות הממתינה לבדיקה משפטית בישראל, למיפוי מאגרי מידע ולהשלמת זהות בעל השליטה המשפטי."),
        ("מידע שנאסף", "פרטי קשר וחשבון; בקשת שירות, כתובת ותיאום; תמונות וקבצים פרטיים; הצעות, תשלומים והחזרים; מצב עבודה ותיעוד; תקשורת תמיכה; הסכמות, אבטחה וביקורת; מידע מכשיר ושימוש הנדרש להפעלת השירות ולהגנתו."),
        ("מטרות", "מענה לבקשות, בדיקת היקף ובטיחות, הכנת הצעה, שיבוץ בעל מקצוע מאושר, הפעלת תקשורת, טיפול בתשלום ובתשלום לבעל המקצוע, תיעוד איכות, פתרון בעיות, אבטחה, עמידה בדין ושיפור באמצעות מדדים מצרפיים ואמיתיים."),
        ("שיתוף", "מידע משותף רק עם בעל מקצוע משובץ וספקי עיבוד במידה הנדרשת, ועם יועצים, מבטחים, ספקי תשלום או רשויות כאשר נדרש. CleanFixHarish אינה מוכרת תמונות בית פרטיות או רשימות קשר של לקוחות."),
        ("גישה של בעל מקצוע", "כתובת מדויקת ומדיה נשמרות עד לשיבוץ מאושר ככל שניתן. הגישה מוגבלת לצורך, לזמן, לתפקיד ולביקורת. אסור להשתמש במידע לשיווק עצמאי או לפנייה ישירה."),
        ("שמירה ואבטחה", "תקופות שמירה יאושרו משפטית לפי סוג מידע. רשומות כספיות ומשפטיות עשויות להישמר זמן ארוך יותר. נעשה שימוש בבקרת גישה, הצפנה בתעבורה, גיבוי, יומני ביקורת ונוהל אירוע באופן מידתי; אין מערכת שמבטיחה אבטחה מוחלטת."),
        ("שיווק", "מסרים שיווקיים מחייבים הסכמה מתאימה ואפשרות הסרה פעילה. הודעות שירות מופרדות משיווק. קבוצות ופורומים אינם נסרקים ואינם מקבלים הודעות המוניות."),
        ("בחירות ובקשות", "בכפוף לדין ניתן לבקש עיון, תיקון, מחיקה, משיכת הסכמה או מידע על העיבוד. רשומות מסוימות יישמרו לצורך חוק, כספים, בטיחות או מחלוקת."),
        ("עיבוד מחוץ לישראל", "יש לאשר ולגלות כל עיבוד מחוץ לישראל, בסיס להעברה ורשימת ספקי העיבוד לפני כניסת ההודעה לתוקף."),
        ("יצירת קשר", "בקשות פרטיות: info@cleanfixharish.co.il | 050-827-5505. עורך הדין ישלים זהות משפטית, הליך מענה ותאריך תחילה."),
    ]),
    ("provider-principles-he.pdf", True, "עקרונות התקשרות לבעלי מקצוע - טיוטה לבדיקה", [
        ("מעמד חשוב", "זה אינו הסכם קבלן המשנה הסופי. עורך דין ישראלי, רואה חשבון וסוכן ביטוח חייבים לאשר סיווג, רישוי, מס, ביטוח, תשלום ואי-שידול לפני שיבוץ."),
        ("התפקיד", "בעל המקצוע מקבל משימת CleanFixHarish מוגדרת תמורת תשלום כתוב. CleanFixHarish נשארת הצד מול הלקוח ומנהלת היקף, הצעה, תקשורת, סגירת איכות ופתרון."),
        ("כשירות", "זהות, יכולת עסקית והפקת חשבונית, גבולות שירות, ממליצים, רישיונות, ביטוח, זמינות ורצפת תשלום חייבים להיות בתוקף. מסמך חסר או שפג תוקפו משהה כשירות."),
        ("קשר עם הלקוח", "אין למסור כרטיס ביקור פרטי, הצעה פרטית, דרישת תשלום ישירה או הזמנה לעקוף את CleanFixHarish. בקשה עתידית מלקוח שהוצג דרך CleanFixHarish מוחזרת אליה. כל מגבלה סופית תהיה צרה, מוגבלת בזמן, תחריג קשר קודם מוכח ותשתמש בסעד מידתי."),
        ("סודיות ופרטיות", "זהות לקוח, כתובת, תמונות, פרטי גישה, מחירים, חבילת עבודה ותקשורת הם חסויים ומשמשים רק למשימה. אסור שיווק עצמאי, העתקה או שמירה שאינה נדרשת."),
        ("ביצוע", "בעל המקצוע פועל לפי ההיקף, הבטיחות ורשימת התיעוד, מזדהה בתהליך ההגעה ואינו מחליף מבצע ללא אישור CleanFixHarish והודעה ללקוח."),
        ("הוראות שינוי", "עבודה בלתי צפויה מתועדת והמשימה הרלוונטית נעצרת. רק הוראת שינוי כתובה של CleanFixHarish שאושרה כנדרש משנה היקף, מחיר, לוח זמנים או תשלום."),
        ("איכות ואירועים", "תיעוד השלמה נשלח לבדיקה. בטיחות, פציעה, נזק, הטרדה, הונאה או אירוע פרטיות מדווחים מיד ונשמרים. תיקון וקיזוז מחייבים ראיות, הודעה ובדיקה."),
        ("תשלום", "המשימה מציגה תשלום מוסכם, אחריות לחומרים ותנאים. יעד תכנון: תשלום זכאי ולא שנוי במחלוקת בתוך שני ימי עסקים לאחר סגירת איכות ותשלום שנפרע. מס, חשבונית, ניכוי, מחלוקת ואימות בנק יאושרו מקצועית."),
        ("עצמאות וסיווג", "המציאות התפעולית ולא כותרת ההסכם קובעת את יחסי העבודה. יש לשמור על עצמאות אמיתית או להשתמש בהעסקה או בחברת שירות תואמת כאשר השליטה או התלות דומות ליחסי עובד."),
        ("יצירת קשר", "תפעול בעלי מקצוע CleanFixHarish | info@cleanfixharish.co.il | 050-827-5505"),
    ]),
]

def wrap(text, font, size, width):
    words, lines, current = text.split(), [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current: lines.append(current)
            current = word
    if current: lines.append(current)
    return lines

def build(filename, rtl, title, sections):
    path = OUT / filename
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    page = 0
    y = 0
    def new_page():
        nonlocal page, y
        if page: c.showPage()
        page += 1
        c.setFillColor(NAVY); c.rect(0, H-86, W, 86, fill=1, stroke=0)
        c.setFillColor(GOLD); c.rect(0, H-90, W, 4, fill=1, stroke=0)
        c.setFillColor(IVORY); c.setFont("CleanFix-Bold", 17)
        display = get_display(title) if rtl else title
        (c.drawRightString if rtl else c.drawString)(W-48 if rtl else 48, H-52, display)
        c.setFillColor(MUTED); c.setFont("CleanFix", 8)
        footer = "CleanFixHarish | DRAFT - COUNSEL APPROVAL REQUIRED | 2026-08-23 | v0.1"
        c.drawCentredString(W/2, 24, footer)
        c.setFillColor(GOLD); c.drawRightString(W-42, 24, str(page))
        y = H-120
    new_page()
    for heading, body in sections:
        heading_lines = wrap(heading, "CleanFix-Bold", 12, W-96)
        body_lines = wrap(body, "CleanFix", 9.4, W-96)
        needed = len(heading_lines)*16 + len(body_lines)*13.5 + 22
        if y-needed < 48: new_page()
        c.setFillColor(NAVY); c.setFont("CleanFix-Bold", 12)
        for line in heading_lines:
            display = get_display(line) if rtl else line
            (c.drawRightString if rtl else c.drawString)(W-48 if rtl else 48, y, display); y -= 16
        c.setFillColor(INK); c.setFont("CleanFix", 9.4)
        for line in body_lines:
            display = get_display(line) if rtl else line
            (c.drawRightString if rtl else c.drawString)(W-48 if rtl else 48, y, display); y -= 13.5
        y -= 10
    c.save()

for document in DOCUMENTS:
    build(*document)
print(f"Created {len(DOCUMENTS)} PDFs in {OUT}")
