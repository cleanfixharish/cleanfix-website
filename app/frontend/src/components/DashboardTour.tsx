import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Play, RotateCcw, Square, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type TourKind = 'admin' | 'customer' | 'provider' | 'partner';
type TourStep = readonly [title: string, body: string, destination?: string];
const TOUR_VERSION = 1;

const copy: Record<TourKind, { en: readonly TourStep[]; he: readonly TourStep[] }> = {
  admin: {
    en: [
      ['Today', 'Begin here. Counters and the priority inbox show real records needing attention; an empty state means there is no live work to display.', 'overview'],
      ['Customers', 'Open a request, confirm its scope and contact details, keep factual notes, and choose one clear next action. Never invent missing information.', 'leads'],
      ['Jobs', 'Create a job only from a genuine request. Job status follows a controlled path, and every accepted transition is permanently recorded.', 'jobs'],
      ['Providers', 'Approve a provider relationship only after identity, capability, insurance, and operating terms have been reviewed. Access is role-limited.', 'providers'],
      ['Services and pricing', 'Keep public descriptions and price guidance accurate. A price estimate is not collected revenue, and material changes require review.', 'services'],
      ['Website and growth', 'Preview every public change. Publishing and advertising stay separate; automatic advertising remains disabled until you deliberately approve it.', 'content'],
      ['System safety', 'Use read-only access for observers. Review health, backups, and alerts before important releases. Never place secrets or customer data in AI prompts.', 'internal'],
    ],
    he: [
      ['היום', 'מתחילים כאן. המונים ותיבת העדיפויות מציגים רשומות אמיתיות שדורשות טיפול; מצב ריק פירושו שאין עבודה חיה להצגה.', 'overview'],
      ['לקוחות', 'פותחים בקשה, מאמתים היקף ופרטי קשר, שומרים הערות עובדתיות ובוחרים פעולה ברורה אחת. לא ממציאים מידע חסר.', 'leads'],
      ['עבודות', 'יוצרים עבודה רק מבקשה אמיתית. מצב העבודה מתקדם במסלול מבוקר וכל מעבר שהתקבל נרשם לצמיתות.', 'jobs'],
      ['נותני שירות', 'מאשרים קשר רק לאחר בדיקת זהות, יכולת, ביטוח ותנאי עבודה. הגישה מוגבלת לפי תפקיד.', 'providers'],
      ['שירותים ותמחור', 'שומרים על תיאור ומחיר מדויקים. הצעת מחיר אינה הכנסה שנגבתה ושינוי מהותי דורש בדיקה.', 'services'],
      ['אתר וצמיחה', 'בודקים כל שינוי ציבורי לפני פרסום. פרסום תוכן ופרסום ממומן נפרדים; פרסום אוטומטי נשאר כבוי עד לאישור מפורש.', 'content'],
      ['בטיחות מערכת', 'משתמשים בגישת צפייה בלבד לצופים. בודקים בריאות, גיבויים והתראות לפני שחרור חשוב ולא שולחים סודות או פרטי לקוחות ל-AI.', 'internal'],
    ],
  },
  customer: {
    en: [
      ['Request a service', 'Choose the closest service and describe the result you need. Useful photos and measurements help; never include passwords or alarm codes.', '/quote'],
      ['Review and contact', 'CleanFix reviews the request and may ask questions before preparing a scope, price, or schedule. A request is not automatic approval or payment.'],
      ['Approve clearly', 'Read the written scope, exclusions, timing, and price before agreeing. Ask us to correct anything that does not match your understanding.'],
      ['During the job', 'Use the agreed communication path. If scope changes or a safety issue appears, pause the affected work until it is reviewed in writing.'],
      ['Completion and help', 'Completion is checked against the agreed scope. Report a problem promptly with factual details and photos so it can be reviewed.'],
    ],
    he: [
      ['בקשת שירות', 'בוחרים את השירות הקרוב ביותר ומתארים את התוצאה הרצויה. תמונות ומידות עוזרות; לא שולחים סיסמאות או קודי אזעקה.', '/quote'],
      ['בדיקה ויצירת קשר', 'CleanFix בודקת את הבקשה ועשויה לשאול שאלות לפני היקף, מחיר או לוח זמנים. בקשה אינה אישור או תשלום אוטומטי.'],
      ['אישור ברור', 'קוראים את ההיקף, החריגים, הזמן והמחיר הכתובים לפני הסכמה. מבקשים תיקון אם משהו אינו תואם להבנה שלכם.'],
      ['במהלך העבודה', 'משתמשים בערוץ התקשורת המוסכם. אם ההיקף משתנה או עולה בעיית בטיחות, עוצרים עד לבדיקה כתובה.'],
      ['סיום ועזרה', 'הסיום נבדק מול ההיקף המוסכם. מדווחים במהירות על בעיה עם פרטים עובדתיים ותמונות כדי שנוכל לבדוק.'],
    ],
  },
  provider: {
    en: [
      ['Today', 'See only real actions requiring attention: a confirmed assignment, expiring offer, missing evidence, compliance hold, or payout update.'],
      ['Offers', 'Each activated offer shows job ID, general area, written scope, schedule, responsibilities, and agreed gross payout—never customer price.'],
      ['Active job', 'Customer and address information needed for an accepted job appears only after CleanFix confirms the assignment.'],
      ['Evidence and changes', 'Follow the evidence checklist. Unexpected work must pause while CleanFix reviews a written change request.'],
      ['Completion and earnings', 'Submitting evidence does not complete the job. CleanFix performs the quality close and records the approved payout path.'],
    ],
    he: [
      ['היום', 'מוצגות רק פעולות אמיתיות שדורשות טיפול: שיבוץ מאושר, הצעה שפגה, תיעוד חסר, עיכוב מסמכים או עדכון תשלום.'],
      ['הצעות עבודה', 'כל הצעה פעילה תציג מזהה עבודה, אזור כללי, היקף כתוב, זמנים, אחריות ותשלום ברוטו מוסכם—לעולם לא מחיר לקוח.'],
      ['עבודה פעילה', 'פרטי לקוח וכתובת הדרושים לעבודה יוצגו רק לאחר ש-CleanFix תאשר את השיבוץ.'],
      ['תיעוד ושינויים', 'פועלים לפי רשימת התיעוד. עבודה בלתי צפויה נעצרת עד לבדיקת בקשת שינוי כתובה.'],
      ['סיום ותשלום', 'הגשת תיעוד אינה מסיימת עבודה. CleanFix מבצעת בקרת איכות ומתעדת את מסלול התשלום המאושר.'],
    ],
  },
  partner: {
    en: [
      ['Relationship', 'This is an independent advertised-business relationship, not a CleanFix-managed job. The customer contracts and pays the business directly.'],
      ['Brand profile', 'Prepare legal and trading names, logo, bilingual description, service area, hours, media rights, and reviewable claims.'],
      ['Introductions', 'Anonymous visits stay anonymous. A request shows only fields the customer explicitly agrees to share with your business.'],
      ['Performance', 'After activation, privacy-safe profile views and consented introductions appear here. Very small totals may be hidden.'],
      ['Plan and verification', 'Billing and sponsored placement remain separate from verification and unpaid listing order.'],
    ],
    he: [
      ['סוג הקשר', 'זהו קשר עם עסק עצמאי מפורסם ולא עבודה בניהול CleanFix. הלקוח מתקשר ומשלם ישירות לעסק.'],
      ['פרופיל מותג', 'מכינים שם משפטי ומסחרי, לוגו, תיאור דו-לשוני, אזור, שעות, זכויות מדיה וטענות שניתן לבדוק.'],
      ['פניות בהסכמה', 'ביקור אנונימי נשאר אנונימי. פנייה מציגה רק שדות שהלקוח הסכים במפורש לשתף.'],
      ['ביצועים', 'לאחר הפעלה יוצגו צפיות תוך שמירת פרטיות ופניות בהסכמה. נתונים קטנים מאוד עשויים להיות מוסתרים.'],
      ['מסלול ואימות', 'חיוב ומיקום ממומן נשארים נפרדים מאימות ומסדר הצגה שאינו ממומן.'],
    ],
  },
};

const headings: Record<TourKind, { en: string; he: string }> = {
  admin: { en: 'Learn to operate Manager OS safely', he: 'ללמוד להפעיל את מערכת הניהול בבטחה' },
  customer: { en: 'See how your service journey works', he: 'כך עובד מסלול השירות שלך' },
  provider: { en: 'Know what you are accepting before you travel', he: 'לדעת בדיוק למה מסכימים לפני שיוצאים' },
  partner: { en: 'Build local visibility with clear boundaries', he: 'לבנות נראות מקומית עם גבולות ברורים' },
};

export default function DashboardTour({ kind, he, onDestination }: { kind: TourKind; he: boolean; onDestination?: (destination: string) => void }) {
  const storageKey = `cleanfix-tour-${kind}-v${TOUR_VERSION}`;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [completed, setCompleted] = useState(() => typeof window !== 'undefined' && localStorage.getItem(storageKey) === 'completed');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const launchRef = useRef<HTMLButtonElement>(null);
  const steps = useMemo(() => copy[kind][he ? 'he' : 'en'], [he, kind]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  useEffect(() => {
    if (!open) return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    headingRef.current?.focus();
    const destination = steps[step]?.[2];
    if (destination && onDestination) onDestination(destination);
  }, [open, step, steps, onDestination]);
  const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const speak = () => { if (!speechAvailable) return; window.speechSynthesis.cancel(); const [stepTitle, stepBody] = steps[step]; const utterance = new SpeechSynthesisUtterance(`${stepTitle}. ${stepBody}`); utterance.lang = he ? 'he-IL' : 'en-US'; utterance.rate = he ? .86 : .92; utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(utterance); };
  const stop = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  const close = () => { stop(); setOpen(false); requestAnimationFrame(() => launchRef.current?.focus()); };
  const finish = () => { localStorage.setItem(storageKey, 'completed'); setCompleted(true); close(); };
  const start = () => { setStep(0); setOpen(true); };
  const reset = () => { localStorage.removeItem(storageKey); setCompleted(false); start(); };
  if (!open) return <Card className="border-[#bca36d] bg-gradient-to-r from-[#fffaf0] to-[#f0f5f1]"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#76551d]">{completed && <CheckCircle2 className="h-4 w-4" />}{he ? (completed ? 'הסיור הושלם' : 'סיור מותאם לחשבון') : (completed ? 'Tour completed' : 'Account-specific tour')}</p><h2 className="mt-1 font-sans text-lg font-semibold text-[#173f46]">{headings[kind][he ? 'he' : 'en']}</h2><p className="mt-1 text-sm text-[#5f5a54]">{he ? 'הדרכה חזותית וקולית ללא נתוני דוגמה או פעולות אוטומטיות.' : 'Visual and spoken guidance with no sample data or automatic actions.'}</p></div><Button ref={launchRef} onClick={completed ? reset : start} className="min-h-11 bg-[#174e57]">{completed ? <RotateCcw className="me-2 h-4 w-4" /> : <Play className="me-2 h-4 w-4" />}{he ? (completed ? 'הפעלה מחדש' : 'התחלת הסיור') : (completed ? 'Replay tour' : 'Start tour')}</Button></CardContent></Card>;
  const [title, body] = steps[step];
  const PreviousIcon = he ? ChevronRight : ChevronLeft;
  const NextIcon = he ? ChevronLeft : ChevronRight;
  return <Card className="overflow-hidden border-[#bca36d] bg-white"><CardContent className="p-0"><div className="flex items-center justify-between bg-[#102f38] px-5 py-4 text-white"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#e8c46f]" aria-live="polite">{he ? `שלב ${step + 1} מתוך ${steps.length}` : `Step ${step + 1} of ${steps.length}`}</p><h2 ref={headingRef} tabIndex={-1} className="mt-1 font-sans text-xl font-semibold outline-none">{title}</h2></div><Button size="icon" variant="ghost" onClick={close} className="h-11 w-11 text-white hover:bg-white/10 hover:text-white" aria-label={he ? 'סגירת הסיור' : 'Close tour'}><X className="h-5 w-5" /></Button></div><div className="p-5 sm:p-6"><div role="progressbar" aria-label={he ? 'התקדמות בסיור' : 'Tour progress'} aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1} className="h-1.5 overflow-hidden rounded-full bg-[#e7e2d8]"><div className="h-full bg-[#c49332] transition-all motion-reduce:transition-none" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><p className="mt-5 min-h-16 text-base leading-7 text-[#4f5d5f]">{body}</p><div className="mt-5 flex flex-wrap items-center gap-2"><Button variant="outline" disabled={!speechAvailable} aria-pressed={speaking} onClick={() => speaking ? stop() : speak()} className="min-h-11">{speaking ? <Square className="me-2 h-4 w-4" /> : <Volume2 className="me-2 h-4 w-4" />}{speaking ? (he ? 'עצירת שמע' : 'Stop audio') : speechAvailable ? (he ? 'השמעת השלב' : 'Listen') : (he ? 'שמע אינו זמין' : 'Audio unavailable')}</Button><span className="flex-1" /><Button variant="ghost" disabled={step === 0} onClick={() => { stop(); setStep(step - 1); }} className="min-h-11"><PreviousIcon className="me-1 h-4 w-4" />{he ? 'הקודם' : 'Previous'}</Button><Button onClick={() => step === steps.length - 1 ? finish() : (stop(), setStep(step + 1))} className="min-h-11 bg-[#174e57]">{step === steps.length - 1 ? (he ? 'סיום' : 'Finish') : (he ? 'הבא' : 'Next')}<NextIcon className="ms-1 h-4 w-4" /></Button></div></div></CardContent></Card>;
}
