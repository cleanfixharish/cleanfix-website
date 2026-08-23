import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const adminHebrew: Record<string, string> = {
  // Navigation
  Today: 'היום',
  Sales: 'מכירות',
  Customers: 'לקוחות',
  Messages: 'הודעות',
  'Price estimator': 'מחשבון מחיר',
  Operations: 'תפעול',
  Jobs: 'עבודות',
  'Follow-ups': 'מעקבים',
  Providers: 'בעלי מקצוע',
  Business: 'עסק',
  'Services & pricing': 'שירותים ותמחור',
  'AI Assistant': 'עוזר AI',
  Website: 'אתר',
  'AI Video Studio': 'סטודיו וידאו AI',
  'Share & onboarding': 'שיתוף והצטרפות',
  'Website editor': 'עורך האתר',
  System: 'מערכת',
  'Platforms and Costs': 'פלטפורמות ועלויות',
  Settings: 'הגדרות',
  More: 'עוד',
  Dashboard: 'לוח בקרה',
  'Owner workspace': 'סביבת הבעלים',
  'Read-only viewer': 'צפייה בלבד',
  'CleanFixHarish operations': 'תפעול CleanFixHarish',
  Welcome: 'ברוך הבא',
  'Live data': 'נתונים חיים',
  Connecting: 'מתחבר',
  'Connection error': 'שגיאת חיבור',
  'Open dashboard navigation': 'פתיחת ניווט לוח הבקרה',
  'Primary mobile navigation': 'ניווט ראשי בנייד',
  'Sign out': 'יציאה',
  'Live read-only tour': 'סיור חי לצפייה בלבד',
  'You can explore the working dashboard and open its tools. Private customer information is hidden, and no button can save, publish, delete, message, restore, or change business data.':
    'אפשר לעיין בלוח הבקרה הפעיל ולפתוח את הכלים. מידע לקוחות פרטי מוסתר, ואף כפתור לא יכול לשמור, לפרסם, למחוק, לשלוח הודעות, לשחזר או לשנות נתוני עסק.',
  'Only Aviel can see this': 'רק אביאל יכול לראות את זה',
  'This area contains private business information or controls. Your Viewer account is working correctly, but this section is safely locked.':
    'אזור זה מכיל מידע עסקי פרטי או בקרות. חשבון הצפייה שלך עובד כראוי, אך החלק הזה נעול בבטחה.',
  'Read-only protection active': 'הגנת צפייה בלבד פעילה',

  // Overview
  'Business overview': 'סקירת העסק',
  'What needs your attention today, across leads, jobs and customer follow-up.':
    'מה דורש את תשומת הלב שלך היום: לקוחות, עבודות ומעקבים.',
  'View leads': 'צפייה בלידים',
  'Total leads': 'סה״כ לידים',
  'All sources': 'כל המקורות',
  'New leads': 'לידים חדשים',
  'Needs triage': 'דורש מיון',
  'Active jobs': 'עבודות פעילות',
  'Scheduled + active': 'מתוזמנות ופעילות',
  Completed: 'הושלמו',
  'This workspace': 'סביבת עבודה זו',
  'Needs reply': 'ממתינים לתשובה',
  'Active directory': 'מאגר פעיל',
  'Priority inbox': 'תיבת עדיפות',
  'New and unanswered customer requests': 'בקשות לקוח חדשות וללא מענה',
  'View all': 'הצג הכל',
  Reply: 'תגובה',
  'Quick actions': 'פעולות מהירות',
  'View providers': 'צפייה בבעלי מקצוע',
  'Send WhatsApp': 'שליחת וואטסאפ',
  'Review jobs': 'סקירת עבודות',
  'Inbound email': 'דואר נכנס',
  'Open received email': 'פתיחת הדואר שהתקבל',
  'Active work': 'עבודה פעילה',
  'Real leads marked scheduled or in progress': 'לידים אמיתיים שסומנו כמתוזמנים או בתהליך',
  'No active work is recorded yet.': 'עדיין לא נרשמה עבודה פעילה.',
  'Recent lead activity': 'פעילות לידים אחרונה',
  'Newest real records in the database': 'הרשומות האחרונות במאגר',
  'No lead activity is recorded yet.': 'עדיין לא נרשמה פעילות לידים.',

  // Leads
  'Customer pipeline': 'צינור לקוחות',
  'Leads CRM': 'ניהול לקוחות',
  'Search, triage and move every real inquiry toward a clear next action.':
    'חיפוש, מיון וקידום כל פנייה אמיתית לשלב הבא.',
  'Search name, phone, service or provider': 'חיפוש לפי שם, טלפון, שירות או בעל מקצוע',
  Customer: 'לקוח',
  Service: 'שירות',
  Source: 'מקור',
  Status: 'סטטוס',
  Provider: 'בעל מקצוע',
  'No real leads are stored yet.': 'עדיין לא נשמרו לידים.',
  'All statuses': 'כל הסטטוסים',

  // Lead statuses
  new: 'חדש',
  contacted: 'נוצר קשר',
  quoted: 'הצעת מחיר',
  scheduled: 'מתוזמן',
  'in progress': 'בתהליך',
  completed: 'הושלם',
  'follow-up': 'מעקב',
  cancelled: 'בוטל',

  // WhatsApp
  'Customer messages': 'הודעות לקוחות',
  'WhatsApp-first operations': 'תפעול שמתחיל בוואטסאפ',
  'Use approved, calm templates and keep unanswered customers visible.':
    'השתמשו בתבניות מאושרות וברורות והשאירו לקוחות שממתינים לתשובה גלויים.',
  'replies needed': 'תשובות נדרשות',
  'Oldest unanswered inquiries should be handled first': 'יש לטפל קודם בפניות הישנות ביותר ללא מענה',
  'Approved response templates': 'תבניות תשובה מאושרות',
  'Review the text before WhatsApp opens': 'בדקו את הטקסט לפני שוואטסאפ נפתח',
  'New inquiry': 'פנייה חדשה',
  Scheduling: 'תיאום',
  'Quote follow-up': 'מעקב הצעת מחיר',
  'Review request': 'בקשת ביקורת',
  English: 'אנגלית',
  Copy: 'העתקה',
  'Template copied': 'התבנית הועתקה',
  'Use for next lead': 'שימוש לליד הבא',

  // Jobs
  Delivery: 'מסירה',
  'Every item here is a real job saved in the CleanFixHarish database.':
    'כל פריט כאן הוא עבודה אמיתית שנשמרה במאגר CleanFixHarish.',
  'Job #': 'עבודה #',
  'Location and schedule': 'מיקום ולוח זמנים',
  'Address not added': 'כתובת לא נוספה',
  'Schedule not added': 'לוח זמנים לא נוסף',
  'No jobs exist yet. Open a customer and choose Create job.':
    'עדיין אין עבודות. פתחו לקוח ובחרו יצירת עבודה.',

  // AI Assistant
  'Owner intelligence': 'מודיעין עסקי לבעלים',
  'CleanFixHarish AI Assistant': 'עוזר ה-AI של CleanFixHarish',
  'Ask for guidance, plans, quotes, messages, and website ideas. You review every suggestion before anything changes.':
    'בקשו הדרכה, תוכניות, הצעות מחיר, הודעות ורעיונות לאתר. כל הצעה עוברת אישור שלך לפני שינוי.',
  'Ask about customers, pricing, marketing, the website, or your next step…':
    'שאלו על לקוחות, תמחור, שיווק, האתר או השלב הבא…',
  'Try asking': 'נסו לשאול',
  'Useful places to begin': 'נקודות התחלה שימושיות',
  'Safety and control': 'בטיחות ושליטה',
  'What this first version can do': 'מה הגרסה הראשונה יכולה לעשות',

  // Providers
  'Trusted network': 'רשת בעלי מקצוע',
  'Add providers and control who is active in your real directory.':
    'הוסיפו בעלי מקצוע וקבעו מי פעיל במאגר האמיתי.',
  'Add a provider': 'הוספת בעל מקצוע',
  'No providers are stored yet.': 'עדיין לא נשמרו בעלי מקצוע.',

  // Services
  'Offer management': 'ניהול הצעות',
  'Edit service and price': 'עריכת שירות ומחיר',
  'No services are stored yet.': 'עדיין לא נשמרו שירותים.',
  'Evidence-backed pricing': 'תמחור מבוסס נתונים',
  'Compare CleanFixHarish starting prices with published Israeli reference ranges. These ranges guide decisions; they do not automatically change your prices.':
    'השוו את מחירי הפתיחה של CleanFixHarish לטווחי מחיר ישראליים שפורסמו. הטווחים מסייעים להחלטה ואינם משנים מחירים אוטומטית.',
  'Israeli market reference': 'השוואת שוק ישראלי',
  'Price comparison': 'השוואת מחירים',
  'From ₪': 'החל מ-₪',

  // Pricing workspace
  '1. Create a draft estimate': '1. יצירת הערכת מחיר טיוטה',
  'Only green Verified rows can be used': 'ניתן להשתמש רק בשורות מאומתות (ירוק)',
  'Choose a verified service': 'בחרו שירות מאומת',
  '2. Owner approval queue': '2. תור אישור בעלים',
  'No customer message is sent from this screen': 'לא נשלחת הודעת לקוח ממסך זה',
  'No estimates yet.': 'עדיין אין הערכות מחיר.',
  '3. Prepare the customer quote': '3. הכנת הצעת מחיר ללקוח',
  'A private link is created only after you publish': 'קישור פרטי נוצר רק לאחר פרסום',
  'Choose an approved estimate': 'בחרו הערכת מחיר מאושרת',
  '4. Record real local evidence': '4. תיעוד ראיות מקומיות אמיתיות',
  'Provider quote or completed CleanFixHarish job': 'הצעת מחיר מבעל מקצוע או עבודה שהושלמה',
  '5. Review local evidence': '5. סקירת ראיות מקומיות',
  'Only Aviel-approved records count': 'רק רשומות שאושרו על ידי אביאל נספרות',
  'No local evidence yet.': 'עדיין אין ראיות מקומיות.',
  'Evidence status': 'סטטוס ראיות',
  'What the estimator is allowed to use': 'מה מותר למחשבון המחיר להשתמש',

  // Content
  'Edit your website': 'עריכת האתר',
  'Change words, colors, buttons, layout, and pictures without touching code.':
    'שנו מילים, צבעים, כפתורים, פריסה ותמונות בלי לגעת בקוד.',
  'Website Studio': 'סטודיו אתר',
  'Protected default': 'ברירת מחדל מוגנת',
  'Your original working website is kept as a safety copy': 'האתר המקורי נשמר כעותק גיבוי',
  '1. Words': '1. מילים',
  '2. Look and buttons': '2. מראה וכפתורים',
  'Choose safe brand colors and the homepage layout': 'בחרו צבעי מותג בטוחים ופריסת דף הבית',
  '3. Pictures': '3. תמונות',
  'Upload once, then choose Hero or Bottom banner': 'העלו פעם אחת, ואז בחרו באנר ראשי או תחתון',
  'How this works': 'איך זה עובד',
  'Three simple steps': 'שלושה שלבים פשוטים',
  'English name': 'שם באנגלית',
  'Hebrew name': 'שם בעברית',
  'English description': 'תיאור באנגלית',
  'Hebrew description': 'תיאור בעברית',
  'Starting price (₪)': 'מחיר התחלתי (₪)',

  // Follow-ups
  'Follow-up queue': 'תור מעקבים',
  'Close the loop calmly and save every completed follow-up.':
    'סגרו כל מעקב בצורה מסודרת ושמרו כל פעולה שהושלמה.',
  'Customer care': 'טיפול בלקוחות',
  'Follow-ups & reviews': 'מעקבים וביקורות',
  'Prioritized by next useful customer action': 'ממוין לפי הפעולה הבאה הכי שימושית',
  'Mark follow-up complete': 'סימון מעקב כהושלם',
  'No follow-ups need attention.': 'אין מעקבים שדורשים טיפול.',

  // Platforms
  'Owner-only inventory': 'מלאי לבעלים בלבד',
  'Search name, purpose, owner, or notes': 'חיפוש לפי שם, מטרה, בעלים או הערות',
  Category: 'קטגוריה',
  Cost: 'עלות',
  'Filter by category': 'סינון לפי קטגוריה',
  'Filter by cost': 'סינון לפי עלות',
  'Filter by status': 'סינון לפי סטטוס',
  'Search platforms': 'חיפוש פלטפורמות',
  'No platforms match these filters.': 'אין פלטפורמות שמתאימות לסינון.',
  'Security boundary': 'גבול אבטחה',
  'This static directory never reads or displays secrets':
    'מדריך סטטי זה לא קורא ולא מציג סודות',

  // Settings
  'Settings & system': 'הגדרות ומערכת',
  'Verified platform status and the rules that protect your business.':
    'מצב פלטפורמות מאומת וכללי ההגנה על העסק.',
  'Company headquarters': 'מטה החברה',
  'Viewer access': 'גישת צפייה',
  'Let trusted people explore the dashboard without changing anything':
    'אפשרו לאנשים מהימנים לעיין בלוח הבקרה בלי לשנות דבר',
  'No dashboard viewers have been added here yet.': 'עדיין לא נוספו צופים ללוח הבקרה.',
  'System status': 'סטטוס מערכת',
  'Current verified state': 'מצב מאומת נוכחי',
  'Operating principles': 'עקרונות תפעול',
  'Applied before every change': 'מיושמים לפני כל שינוי',

  // Lead dialog
  Phone: 'טלפון',
  Location: 'מיקום',
  'Customer message': 'הודעת לקוח',
  'Internal notes': 'הערות פנימיות',
  'Save notes': 'שמירת הערות',
  Saving: 'שומר',
  'Create job': 'יצירת עבודה',
  'View job': 'צפייה בעבודה',
  Active: 'פעיל',
  Pending: 'ממתין',
  Verified: 'מאומת',
  Send: 'שליחה',
  Search: 'חיפוש',
  'All categories': 'כל הקטגוריות',
  'No customer selected': 'לא נבחר לקוח',
  WhatsApp: 'וואטסאפ',

  // AI Video Studio
  'Create polished CleanFixHarish videos in a few simple choices.':
    'יצירת סרטוני CleanFixHarish מלוטשים בכמה בחירות פשוטות.',
  'Choose the purpose, describe one clear scene, optionally add a reference image, and generate one quality-controlled shot at a time.':
    'בחרו מטרה, תארו סצנה אחת ברורה, הוסיפו תמונת ייחוס (אופציונלי) ויצרו צילום אחד בכל פעם.',
  'Safe default': 'ברירת מחדל בטוחה',
  '4 seconds · 720p · one paid generation': '4 שניות · 720p · יצירה בתשלום אחת',
  'What is this video for?': 'למה הסרטון הזה?',
  'Start from a proven marketing direction.': 'התחילו מכיוון שיווקי מוכח.',
  'Before & after': 'לפני ואחרי',
  'A satisfying cleaning transformation': 'טרנספורמציית ניקיון מספקת',
  'Service spotlight': 'הדגשת שירות',
  'Show a professional at work': 'הצגת בעל מקצוע בעבודה',
  'Trust & care': 'אמון וטיפול',
  'A warm customer-confidence scene': 'סצנה חמה שמחזקת אמון',
  'Seasonal offer': 'מבצע עונתי',
  'An attention-grabbing social ad': 'פרסומת חברתית שמושכת תשומת לב',
  'Describe the scene': 'תיאור הסצנה',
  'Plain language is enough. The quality rules are added automatically.':
    'שפה פשוטה מספיקה. כללי האיכות מתווספים אוטומטית.',
  'Video description': 'תיאור הסרטון',
  'Keep it to one scene and one main action.': 'הגבילו לסצנה אחת ופעולה מרכזית אחת.',
  'Add a reference image (optional)': 'הוספת תמונת ייחוס (אופציונלי)',
  'Use a room, service photo, or desired opening frame.':
    'השתמשו בתמונת חדר, שירות או פריים פתיחה רצוי.',
  'Remove reference image': 'הסרת תמונת ייחוס',
  'Selected video reference': 'תמונת ייחוס שנבחרה',
  'Choose an image': 'בחירת תמונה',
  'JPG, PNG or WebP · maximum 8 MB': 'JPG, PNG או WebP · עד 8 MB',
  'Ready to create': 'מוכן ליצירה',
  'Creative direction': 'כיוון יצירתי',
  'Brand quality rules': 'כללי איכות מותג',
  'Reference image': 'תמונת ייחוס',
  'One-generation cost guardrail': 'מגבלת עלות ליצירה אחת',
  Optional: 'אופציונלי',
  'One click creates one four-second 1280×720 AI shot. Nothing is published automatically.':
    'לחיצה אחת יוצרת צילום AI אחד בן 4 שניות ב-1280×720. שום דבר לא מתפרסם אוטומטית.',
  'Create AI video': 'יצירת וידאו AI',
  'Creating your shot…': 'יוצר את הצילום…',
  'Reset studio': 'איפוס הסטודיו',
  'Generating motion and checking the result…': 'יוצר תנועה ובודק את התוצאה…',
  'Your result will appear here': 'התוצאה תופיע כאן',
  'Latest AI shot': 'צילום AI אחרון',
  'Not generated yet': 'עדיין לא נוצר',
  Download: 'הורדה',
  'Next production layer': 'שכבת הפקה הבאה',
  'Long-form music syncing, multiple-shot timelines, captions and social resizing will run through the dedicated GPU worker without changing this simple workflow.':
    'סנכרון מוזיקה, צירי זמן מרובי צילומים, כתוביות ושינוי גודל לרשתות יפעלו דרך עובד GPU ייעודי בלי לשנות את זרימת העבודה הפשוטה.',
  'Choose a JPG, PNG or WebP image.': 'בחרו תמונת JPG, PNG או WebP.',
  'The reference image must be smaller than 8 MB.': 'תמונת הייחוס חייבת להיות קטנה מ-8 MB.',
  'Describe the scene in a little more detail first.': 'תארו את הסצנה בקצת יותר פירוט.',
  'Your AI video shot is ready.': 'צילום ה-AI מוכן.',
  'Video generation failed.': 'יצירת הווידאו נכשלה.',
  'Example: A careful professional cleans a sunlit kitchen while the homeowner relaxes...':
    'דוגמה: איש מקצוע זהיר מנקה מטבח מואר בזמן שבעל הבית נח…',

  // Toasts and actions
  'The manager could not load live business data. No demonstration data was shown.':
    'לא ניתן היה לטעון נתונים חיים. לא הוצגו נתוני הדגמה.',
  'The status was not saved. Please try again.': 'הסטטוס לא נשמר. נסו שוב.',
  'moved to': 'הועבר אל',
  'Notes saved to the database.': 'ההערות נשמרו במאגר.',
  'The notes were not saved.': 'ההערות לא נשמרו.',
  'Customer job': 'עבודת לקוח',
  'A real job was created.': 'נוצרה עבודה אמיתית.',
  'The job was not created.': 'העבודה לא נוצרה.',
  'Follow-up saved as complete.': 'המעקב סומן כהושלם.',
  'The follow-up was not saved.': 'המעקב לא נשמר.',
  'Nothing needs your attention right now.': 'אין כרגע דבר שדורש טיפול.',
  'The job status was not saved.': 'סטטוס העבודה לא נשמר.',
  'The AI Assistant could not connect. Check the Railway AI settings and try again.':
    'עוזר ה-AI לא הצליח להתחבר. בדקו את הגדרות ה-AI ב-Railway ונסו שוב.',
  'is now': 'הוא כעת',
  inactive: 'לא פעיל',
  active: 'פעיל',
  'The provider change was not saved.': 'שינוי בעל המקצוע לא נשמר.',
  'Please enter the provider name.': 'נא להזין את שם בעל המקצוע.',
  'Provider saved to the database.': 'בעל המקצוע נשמר במאגר.',
  'The provider was not created.': 'בעל המקצוע לא נוצר.',
  published: 'פורסם',
  accepted: 'אושרה',
  declined: 'נדחתה',
  expired: 'פג תוקף',
  hidden: 'מוסתר',
  'The service change was not saved.': 'שינוי השירות לא נשמר.',
  'Service and price published.': 'השירות והמחיר פורסמו.',
  'The service was not saved.': 'השירות לא נשמר.',
  'Pricing workspace could not load.': 'סביבת התמחור לא נטענה.',
  'Choose verified evidence and describe the job clearly.':
    'בחרו ראיה מאומתת ותארו את העבודה בבירור.',
  'Draft saved. It has not been sent to the customer.':
    'הטיוטה נשמרה. היא לא נשלחה ללקוח.',
  'Draft was not saved.': 'הטיוטה לא נשמרה.',
  'Owner approval recorded. Nothing was sent automatically.':
    'אישור הבעלים נרשם. דבר לא נשלח אוטומטית.',
  'Approval failed.': 'האישור נכשל.',
  'Private quote saved as a draft. Nothing was sent.':
    'הצעת מחיר פרטית נשמרה כטיוטה. דבר לא נשלח.',
  'Quote was not saved.': 'הצעת המחיר לא נשמרה.',
  'Quote could not be published.': 'לא ניתן היה לפרסם את ההצעה.',
  'Add the service and exact scope.': 'הוסיפו את השירות ואת היקף העבודה המדויק.',
  'Local evidence saved for owner review.': 'ראיה מקומית נשמרה לסקירת הבעלים.',
  'Local evidence was not saved.': 'הראיה המקומית לא נשמרה.',
  'Local evidence approved and counted.': 'הראיה המקומית אושרה ונספרה.',
  'Local evidence approval failed.': 'אישור הראיה המקומית נכשל.',
  'Website content could not be loaded.': 'תוכן האתר לא נטען.',
  'The protected default could not be prepared.': 'ברירת המחדל המוגנת לא הוכנה.',
  'The content was not saved.': 'התוכן לא נשמר.',
  'Website design published.': 'עיצוב האתר פורסם.',
  'The website design was not saved.': 'עיצוב האתר לא נשמר.',
  'Image uploaded. Choose where to use it.': 'התמונה הועלתה. בחרו היכן להשתמש בה.',
  'The original working website has been restored.': 'האתר המקורי שוחזר.',
  'The website was not restored. Nothing was changed.':
    'האתר לא שוחזר. דבר לא השתנה.',
  'Viewer access list could not be loaded.': 'רשימת הצפייה לא נטענה.',
  'Please enter a complete email address.': 'נא להזין כתובת אימייל מלאה.',
  'Viewer access added. They can sign in with Google.':
    'גישת צפייה נוספה. אפשר להיכנס עם Google.',
  'Administrator access added. They can sign in with Google.':
    'גישת מנהל נוספה. אפשר להיכנס עם Google.',
  'Viewer': 'צופה',
  'Administrator': 'מנהל',
  'Approve access': 'אישור גישה',
  'Google verifies the email. The server assigns the approved role and automatically opens the correct dashboard after sign-in.':
    'Google מאמתת את האימייל. השרת מקצה את התפקיד המאושר ופותח אוטומטית את לוח הבקרה הנכון לאחר הכניסה.',
  'Viewer access was not added.': 'גישת הצפייה לא נוספה.',
  'can no longer sign in as a Viewer.': 'לא יכול יותר להיכנס כצופה.',
  'Viewer access was not removed.': 'גישת הצפייה לא הוסרה.',
  'Answer copied': 'התשובה הועתקה',

  // Assistant
  'Ask your business assistant': 'שאלו את העוזר העסקי',
  'Advice and drafts only · You remain in control':
    'ייעוץ וטיוטות בלבד · השליטה נשארת אצלכם',
  'How can I help you today?': 'איך אפשר לעזור היום?',
  'Choose a starting question or write your own. English and Hebrew are both supported.':
    'בחרו שאלת פתיחה או כתבו בעצמכם. עברית ואנגלית נתמכות.',
  'Thinking about your business…': 'חושב על העסק…',
  'Press Enter to send · Shift + Enter for a new line · Check prices, dates, and promises before using a draft.':
    'Enter לשליחה · Shift + Enter לשורה חדשה · בדקו מחירים, תאריכים והתחייבויות לפני שימוש בטיוטה.',
  'What should I focus on today?': 'על מה כדאי להתמקד היום?',
  'Create a simple 30-day growth plan.': 'צרו תוכנית צמיחה פשוטה ל-30 יום.',
  'Draft a friendly WhatsApp reply for a new customer.':
    'נסחו תשובת וואטסאפ ידידותית ללקוח חדש.',
  'Suggest improvements for my website homepage.':
    'הציעו שיפורים לדף הבית של האתר.',
  'Help me create a professional service quote.':
    'עזרו לי ליצור הצעת מחיר מקצועית.',
  'How can I get my first 20 paying customers?':
    'איך מגיעים ל-20 הלקוחות המשלמים הראשונים?',
  'Read the business summary shown in Manager OS':
    'קריאת סיכום העסק שמוצג ב-Manager OS',
  'Explain, plan, recommend, and prepare drafts':
    'הסבר, תכנון, המלצה והכנת טיוטות',
  'Cannot publish, message, charge, delete, or change records':
    'לא יכול לפרסם, לשלוח הודעות, לחייב, למחוק או לשנות רשומות',

  // Providers
  'Add provider': 'הוספת בעל מקצוע',
  'Provider name': 'שם בעל המקצוע',
  'Business type': 'סוג עסק',
  Area: 'אזור',
  Description: 'תיאור',
  'Save provider': 'שמירת בעל מקצוע',

  // Services
  'Change names, descriptions, starting prices, images, and public visibility.':
    'שינוי שמות, תיאורים, מחירי פתיחה, תמונות ונראות ציבורית.',
  'No public description is stored.': 'אין תיאור ציבורי שמור.',
  Edit: 'עריכה',
  Public: 'ציבורי',
  'Price unit (example: per visit)': 'יחידת מחיר (לדוגמה: לביקור)',
  'English price note': 'הערת מחיר באנגלית',
  'Hebrew price note': 'הערת מחיר בעברית',
  'Image URL (or choose an uploaded image in Website Studio)':
    'כתובת תמונה (או בחרו תמונה שהועלתה בסטודיו האתר)',
  'Publish service': 'פרסום שירות',

  // Market comparison
  'Handyman visit': 'ביקור הנדימן',
  'per standard weekday visit': 'לביקור רגיל באמצע השבוע',
  'Post-renovation cleaning — 4 rooms': 'ניקיון אחרי שיפוץ — 4 חדרים',
  'standard apartment up to 80 m²': 'דירה רגילה עד 80 מ״ר',
  'No CleanFix price yet': 'עדיין אין מחיר CleanFix',
  'Below market range': 'מתחת לטווח השוק',
  'Above market range': 'מעל לטווח השוק',
  'Inside market range': 'בתוך טווח השוק',
  'CleanFix from': 'CleanFix החל מ',
  'Not matched': 'לא הותאם',
  'Israel range': 'טווח בישראל',
  'VAT included by source': 'מע״מ כלול לפי המקור',
  'Market ranges are external references, not official government tariffs. Confirm scope, VAT, materials, travel, urgency, apartment size, and service quality before setting a customer price. Update the checked date whenever the source is reviewed.':
    'טווחי השוק הם הפניות חיצוניות, לא תעריפים ממשלתיים. יש לאשר היקף, מע״מ, חומרים, נסיעות, דחיפות, גודל דירה ואיכות שירות לפני קביעת מחיר. עדכנו את תאריך הבדיקה בכל סקירת מקור.',

  // Pricing workspace
  'Use verified national references, add the real job scope, then approve the price yourself. The system never sends or finalizes a price automatically.':
    'השתמשו בהפניות ארציות מאומתות, הוסיפו את היקף העבודה האמיתי, ואז אשרו את המחיר בעצמכם. המערכת אף פעם לא שולחת או סוגרת מחיר אוטומטית.',
  'Market reference': 'הפניית שוק',
  'National reference': 'הפניה ארצית',
  'Open source': 'פתיחת מקור',
  'Exact work requested, measurements, access and photo findings':
    'העבודה המדויקת, מידות, גישה וממצאים מהתמונות',
  'Customer minimum ₪': 'מינימום ללקוח ₪',
  'Customer maximum ₪': 'מקסימום ללקוח ₪',
  'Provider budget ₪': 'תקציב בעל מקצוע ₪',
  'Save draft for my review': 'שמירת טיוטה לסקירה שלי',
  'Non-binding. Final scope and price require Aviel’s approval.':
    'לא מחייב. היקף ומחיר סופיים דורשים את אישור אביאל.',
  Approve: 'אישור',
  approved: 'מאושר',
  draft: 'טיוטה',
  pending: 'ממתין',
  'Approved estimate': 'הערכת מחיר מאושרת',
  'Final quoted total ₪': 'סכום הצעה סופי ₪',
  'Deposit required ₪': 'מקדמה נדרשת ₪',
  'Exact included scope': 'היקף כלול מדויק',
  Exclusions: 'חריגים',
  Terms: 'תנאים',
  'Valid until': 'בתוקף עד',
  'Save private quote draft': 'שמירת טיוטת הצעה פרטית',
  expires: 'פג תוקף',
  'Create private customer link': 'יצירת קישור פרטי ללקוח',
  'Copy link again': 'העתקת הקישור שוב',
  'For security, this link is available only in this browser session.':
    'מטעמי אבטחה, הקישור זמין רק בסשן הדפדפן הזה.',
  'Evidence type': 'סוג ראיה',
  'Provider quote': 'הצעת מחיר מבעל מקצוע',
  'Completed job': 'עבודה שהושלמה',
  'Specific service': 'שירות ספציפי',
  'Customer price ₪': 'מחיר ללקוח ₪',
  'Provider amount ₪': 'סכום לבעל מקצוע ₪',
  'Exact comparable scope': 'היקף בר-השוואה מדויק',
  'Save as pending evidence': 'שמירה כראיה ממתינה',
  'Approve evidence': 'אישור ראיה',
  'Usable national rows': 'שורות ארציות לשימוש',
  'Blocked from estimates': 'חסום מהערכות מחיר',
  samples: 'דגימות',
  'Local guidance remains hidden until enough comparable evidence exists.':
    'הנחיה מקומית נשארת מוסתרת עד שיש מספיק ראיות ברות-השוואה.',
  'Harish and Pardes Hanna adjustments appear only after at least five owner-approved comparable local records with both customer and provider amounts.':
    'התאמות לחריש ולפרדס חנה מופיעות רק אחרי לפחות חמש רשומות מקומיות מאושרות עם סכומי לקוח ובעל מקצוע.',

  // Website editor
  'Return to default': 'חזרה לברירת מחדל',
  'Open live preview': 'פתיחת תצוגה חיה',
  'Preparing safety copy…': 'מכין עותק בטיחות…',
  'Restores website words, colors, buttons, selected pictures, services, prices, and visibility. It never changes accounts, leads, jobs, providers, payments, or uploaded files.':
    'משחזר מילים, צבעים, כפתורים, תמונות נבחרות, שירותים, מחירים ונראות. לא משנה חשבונות, לידים, עבודות, בעלי מקצוע, תשלומים או קבצים שהועלו.',
  'Loading…': 'טוען…',
  'Click a section to edit English and Hebrew': 'לחצו על מקטע לעריכת אנגלית ועברית',
  Untitled: 'ללא כותרת',
  Hidden: 'מוסתר',
  Published: 'פורסם',
  'Main color': 'צבע ראשי',
  'Gold accent': 'מבטא זהב',
  'Page background': 'רקע הדף',
  'Hero layout': 'פריסת באנר ראשי',
  'Words left, picture right': 'מילים משמאל, תמונה מימין',
  'Picture left, words right': 'תמונה משמאל, מילים מימין',
  'Motion and visual effects': 'תנועה ואפקטים חזותיים',
  'Reduced — recommended': 'מופחת — מומלץ',
  'Full — gentle motion': 'מלא — תנועה עדינה',
  'Off — no motion': 'כבוי — בלי תנועה',
  "Reduced is the safest default. A visitor's device accessibility preference always overrides this setting and disables motion.":
    'מופחת היא ברירת המחדל הבטוחה. העדפת הנגישות במכשיר המבקר תמיד גוברת ומבטלת תנועה.',
  'Main button — English': 'כפתור ראשי — אנגלית',
  'Main button — Hebrew': 'כפתור ראשי — עברית',
  'WhatsApp button — English': 'כפתור וואטסאפ — אנגלית',
  'WhatsApp button — Hebrew': 'כפתור וואטסאפ — עברית',
  'Publish design and buttons': 'פרסום עיצוב וכפתורים',
  'Uploading…': 'מעלה…',
  'Upload a picture (maximum 5 MB)': 'העלאת תמונה (עד 5 MB)',
  Hero: 'באנר ראשי',
  Bottom: 'באנר תחתון',
  'No uploaded pictures yet.': 'עדיין לא הועלו תמונות.',
  'Publish selected pictures': 'פרסום התמונות שנבחרו',
  'Make one change.': 'בצעו שינוי אחד.',
  'Press the green Publish button in that box.':
    'לחצו על כפתור הפרסום הירוק באותו תיבה.',
  'Open live preview and refresh the page.':
    'פתחו תצוגה חיה ורעננו את הדף.',
  'Safe by design': 'בטוח לפי עיצוב',
  'Your logo and essential structure stay protected. You can change the parts customers see most.':
    'הלוגו והמבנה החיוני נשארים מוגנים. אפשר לשנות את החלקים שהלקוחות רואים הכי הרבה.',
  'English title': 'כותרת באנגלית',
  'Hebrew title': 'כותרת בעברית',
  'English content': 'תוכן באנגלית',
  'Hebrew content': 'תוכן בעברית',
  'Published on website': 'פורסם באתר',
  'Turn this off to hide this saved text.': 'כבו זאת כדי להסתיר את הטקסט השמור.',
  'Publishing…': 'מפרסם…',
  'Publish words': 'פרסום מילים',
  'Return to the original working website?': 'לחזור לאתר העובד המקורי?',
  'This will replace your current website words, design choices, selected pictures, and service presentation with the protected default.':
    'פעולה זו תחליף את המילים, בחירות העיצוב, התמונות הנבחרות ומצגת השירותים בברירת המחדל המוגנת.',
  'Your business records stay safe.': 'רשומות העסק נשארות בטוחות.',
  'Accounts, leads, jobs, providers, payments, and uploaded files are not changed.':
    'חשבונות, לידים, עבודות, בעלי מקצוע, תשלומים וקבצים שהועלו לא משתנים.',
  Cancel: 'ביטול',
  'Restoring…': 'משחזר…',
  'Yes, restore default': 'כן, שחזר ברירת מחדל',
  'Edit ': 'עריכת ',

  // Follow-ups
  'No notes added': 'לא נוספו הערות',
  'Request review': 'בקשת ביקורת',
  'Follow up': 'מעקב',

  // Platforms
  'A read-only inventory of the external services evidenced in this repository. Unknown costs stay unknown until confirmed in the provider account.':
    'מלאי לקריאה בלבד של השירותים החיצוניים שמופיעים במאגר. עלויות לא ידועות נשארות לא ידועות עד אישור בחשבון הספק.',
  'Confirmed monthly recurring': 'חיוב חודשי מאומת',
  'Unknown costs and currencies excluded': 'עלויות ומטבעות לא ידועים לא נכללים',
  'Usage-based services': 'שירותים לפי שימוש',
  'Plan type marked usage-based': 'סוג התוכנית מסומן כתלוי-שימוש',
  'Renewals in 30 days': 'חידושים ב-30 יום',
  'Based on recorded renewal dates': 'לפי תאריכי חידוש שנרשמו',
  'Needs confirmation': 'דורש אישור',
  'Cost or verification date missing': 'חסרים עלות או תאריך אימות',
  'No confirmed recurring costs': 'אין עלויות חוזרות מאומתות',
  'All costs': 'כל העלויות',
  'Confirmed cost': 'עלות מאומתת',
  Production: 'ייצור',
  'Business tool': 'כלי עסקי',
  'Required check': 'בדיקה נדרשת',
  Retired: 'יצא משימוש',
  'Plan type': 'סוג תוכנית',
  Cadence: 'מחזור חיוב',
  Currency: 'מטבע',
  Renewal: 'חידוש',
  'Account owner': 'בעל החשבון',
  'Last verified': 'אומת לאחרונה',
  'Not recorded': 'לא נרשם',
  Notes: 'הערות',
  Usage: 'שימוש',
  Billing: 'חיוב',
  Documentation: 'תיעוד',
  Unknown: 'לא ידוע',
  'Unknown — confirm in account': 'לא ידוע — יש לאשר בחשבון',
  'CleanFixHarish owner': 'בעלים של CleanFixHarish',
  Hosting: 'אירוח',
  Database: 'מסד נתונים',
  'DNS & security': 'DNS ואבטחה',
  'Source control': 'בקרת מקור',
  Identity: 'זהות',
  'Email & admin': 'אימייל וניהול',
  'AI service': 'שירות AI',
  'Customer communications': 'תקשורת לקוחות',
  'Knowledge & training': 'ידע והדרכה',
  'Design & marketing': 'עיצוב ושיווק',
  'Developer tools': 'כלי פיתוח',
  'Research tools': 'כלי מחקר',
  'Domain & registrar': 'דומיין ורשם',
  'Runs the production website and backend application.':
    'מריץ את אתר הייצור ואת יישום השרת.',
  'Stores live business records for the application.':
    'שומר רשומות עסקיות חיות ליישום.',
  'Controls the domain, DNS, and public connection security.':
    'שולט בדומיין, DNS ואבטחת החיבור הציבורי.',
  'Single source of truth for the website code.':
    'מקור האמת היחיד לקוד האתר.',
  'Provides Google sign-in for the owner account.':
    'מספק כניסה עם Google לחשבון הבעלים.',
  'Runs company email and the administrator identity.':
    'מריץ את אימייל החברה ואת זהות המנהל.',
  'Connects Manager OS to the configured AI model.':
    'מחבר את Manager OS למודל ה-AI שהוגדר.',
  'Customer conversations and owner-approved message drafts.':
    'שיחות לקוחות וטיוטות הודעות שאושרו על ידי הבעלים.',
  'Creates internal explanations, podcasts, and training material.':
    'יוצר הסברים פנימיים, פודקאסטים וחומרי הדרכה.',
  'Creates optional branded pictures and marketing designs.':
    'יוצר תמונות ממותגות ועיצובים שיווקיים אופציונליים.',
  'AI-assisted coding tool used in the project workflow.':
    'כלי קידוד בסיוע AI בזרימת העבודה של הפרויקט.',
  'AI assistant and coding-agent workspace used for project work.':
    'עוזר AI וסביבת סוכן קידוד לעבודת הפרויקט.',
  'Research tool used for the project’s pricing and validation briefs.':
    'כלי מחקר לתמחור ולתיקי אימות של הפרויקט.',
  'Registration and renewal of the cleanfixharish.co.il domain.':
    'רישום וחידוש של הדומיין cleanfixharish.co.il.',
  'Previous website host; no longer the production platform.':
    'אירוח אתר קודם; כבר לא פלטפורמת הייצור.',
  'Environment variables and deployment access must stay in Railway.':
    'משתני סביבה וגישת פריסה חייבים להישאר ב-Railway.',
  'Confirm a usable backup before migrations or other risky releases.':
    'אשרו גיבוי שמיש לפני מיגרציות או שחרורים מסוכנים.',
  'The cleanfixharish.co.il zone, SSL, and email DNS records are sensitive.':
    'אזור cleanfixharish.co.il, SSL ורשומות DNS לאימייל הם רגישים.',
  'Review changes before they reach Railway and keep two-step verification on.':
    'סקרו שינויים לפני שהם מגיעים ל-Railway והשאירו אימות דו-שלבי פעיל.',
  'OAuth secrets and approved callback addresses are never displayed here.':
    'סודות OAuth וכתובות קולבק מאושרות אף פעם לא מוצגות כאן.',
  'Preserve Google MX records and administrator recovery methods.':
    'שמרו על רשומות MX של Google ועל שיטות שחזור למנהל.',
  'The provider and consumption URL are intentionally not inferred from private variables.':
    'הספק וכתובת הצריכה לא מוסקות במכוון ממשתנים פרטיים.',
  'Messages are still reviewed and sent by the owner, not automatically.':
    'הודעות עדיין נסקרות ונשלחות על ידי הבעלים, לא אוטומטית.',
  'Not part of the live website; upload only material suitable for the notebook audience.':
    'לא חלק מהאתר החי; העלו רק חומר שמתאים לקהל המחברת.',
  'Export and approve an asset before publishing it on the website.':
    'ייצאו ואשרו נכס לפני פרסום באתר.',
  'The project workflow names Cursor; account, renewal, and usage details are not recorded here.':
    'זרימת העבודה מציינת את Cursor; פרטי חשבון, חידוש ושימוש לא נרשמים כאן.',
  'The project is maintained through a ChatGPT/Codex workflow; subscription and usage details are not inferred.':
    'הפרויקט מתוחזק דרך זרימת ChatGPT/Codex; פרטי מנוי ושימוש לא מוסקות.',
  'Perplexity research briefs are present in the project; account and billing details are not recorded.':
    'תיקי מחקר של Perplexity קיימים בפרויקט; פרטי חשבון וחיוב לא נרשמים.',
  'The domain is evidenced in the project, but its registrar and direct account URLs require confirmation.':
    'הדומיין מתועד בפרויקט, אך הרשם וכתובות החשבון דורשים אישור.',
  'Do not deploy new work here; retain access only if an old backup is still needed.':
    'אל תפרסו עבודה חדשה כאן; השאירו גישה רק אם עדיין נדרש גיבוי ישן.',
  'Usage-based — provider not recorded': 'לפי שימוש — ספק לא נרשם',
  'Pro — cost unconfirmed': 'Pro — עלות לא אומתה',
  'Unknown — cost unconfirmed': 'לא ידוע — עלות לא אומתה',
  'Unknown — registrar not recorded': 'לא ידוע — רשם לא נרשם',
  'Retired — confirm any remaining account': 'יצא משימוש — אשרו אם נשאר חשבון',
  'Passwords, API keys, OAuth secrets, database addresses, and environment values stay inside their secure provider platform.':
    'סיסמאות, מפתחות API, סודות OAuth, כתובות מסד נתונים וערכי סביבה נשארים בפלטפורמת הספק המאובטחת.',

  // Settings
  'Adding…': 'מוסיף…',
  'Add viewer': 'הוספת צופה',
  'Viewers see a working read-only dashboard. Private areas show “Only Aviel can see this.”':
    'צופים רואים לוח בקרה פעיל לקריאה בלבד. אזורים פרטיים מציגים "רק אביאל יכול לראות את זה."',
  Remove: 'הסרה',
  'Railway application': 'יישום Railway',
  'Google sign-in': 'כניסה עם Google',
  'PostgreSQL database': 'מסד נתונים PostgreSQL',
  'Production DNS': 'DNS ייצור',
  Connected: 'מחובר',
  Available: 'זמין',
  'Via GitHub': 'דרך GitHub',
  'Simplicity before complexity': 'פשיטות לפני מורכבות',
  'Trust before growth hacks': 'אמון לפני קיצורי דרך לצמיחה',
  'Preserve existing work': 'שמירה על עבודה קיימת',
  'One source of truth': 'מקור אמת אחד',
  'No infrastructure change without approval': 'אין שינוי תשתית בלי אישור',
  'Manager OS': 'מערכת ניהול',
  'items need attention': 'פריטים דורשים טיפול',
  'Registered accounts': 'חשבונות רשומים',
  'Account registrations appear here immediately. A service message appears in the lead pipeline only after the customer sends a request.':
    'הרשמות לחשבון מופיעות כאן מיד. הודעת שירות מופיעה בצינור הלידים רק לאחר שהלקוח שולח בקשה.',
  'Service provider account': 'חשבון בעל מקצוע',
  'Customer account': 'חשבון לקוח',
  'Category pending': 'קטגוריה ממתינה',
  'Open WhatsApp': 'פתיחת וואטסאפ',
  'Find service requests': 'חיפוש בקשות שירות',
  'No registered customer or provider accounts yet.': 'עדיין אין חשבונות לקוחות או בעלי מקצוע רשומים.',
  'Registered accounts could not be loaded.': 'לא ניתן היה לטעון את החשבונות הרשומים.',
  'Phone will appear after account setup.': 'מספר הטלפון יופיע לאחר השלמת פרטי החשבון.',
  'Just registered': 'נרשם עכשיו',
  setup_incomplete: 'טרם הושלמה ההרשמה',
};

export function useAdminTranslation() {
  const { lang } = useLanguage();
  return useCallback(
    (text: string) => (lang === 'he' ? adminHebrew[text] || text : text),
    [lang],
  );
}

export function adminTranslate(text: string, lang: 'en' | 'he') {
  return lang === 'he' ? adminHebrew[text] || text : text;
}
