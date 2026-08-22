import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type TourKind = 'provider' | 'partner';
const copy = {
  provider: {
    en: [
      ['Today', 'See only real actions requiring attention: a confirmed assignment, an expiring offer, missing evidence, a compliance hold or a payout update.'],
      ['Offers', 'Before confirmation you see the job ID, general area, written scope, schedule window, responsibilities and exact gross payout—never the customer price.'],
      ['Active job', 'After CleanFix confirms the assignment, field mode reveals only the customer and address information needed for that job, plus relay communication and the checklist.'],
      ['Evidence and changes', 'Capture required before-and-after evidence. Unexpected work pauses while CleanFix reviews a written change request.'],
      ['Earnings', 'See your agreed gross payout, approved extras, document requirements, eligibility, holds and payment reference for real assignments only.'],
    ],
    he: [
      ['היום', 'מוצגות רק פעולות אמיתיות שדורשות תשומת לב: שיבוץ מאושר, הצעה שפגה, תיעוד חסר, עיכוב מסמכים או עדכון תשלום.'],
      ['הצעות עבודה', 'לפני אישור מוצגים מזהה עבודה, אזור כללי, היקף כתוב, חלון זמנים, אחריות ותשלום ברוטו מדויק—לעולם לא מחיר הלקוח.'],
      ['עבודה פעילה', 'לאחר אישור השיבוץ, מצב השטח מציג רק את פרטי הלקוח והכתובת הנחוצים לעבודה, תקשורת מתווכת ורשימת בדיקה.'],
      ['תיעוד ושינויים', 'מצלמים תיעוד לפני ואחרי. עבודה בלתי צפויה נעצרת עד ש-CleanFix בודקת בקשת שינוי כתובה.'],
      ['תשלומים', 'מוצגים תשלום ברוטו מוסכם, תוספות מאושרות, דרישות מסמך, זכאות, עיכובים ואסמכתא—רק לעבודות אמיתיות.'],
    ],
  },
  partner: {
    en: [
      ['Overview', 'See the genuine state of your independent listing: draft, review, published, renewal due or paused. Empty means no live data—not a sample.'],
      ['Brand profile', 'Prepare your legal and trading names, logo, one accent color, bilingual description, service area, hours, gallery rights and verifiable claims.'],
      ['Introductions', 'Anonymous visits stay anonymous. A request shows only the fields that the customer explicitly consented to share with your business.'],
      ['Performance', 'After publication, see your own eligible views, disclosure-confirmed actions and consented introductions. Tiny cohorts are suppressed for privacy.'],
      ['Plan and verification', 'Billing, sponsorship and evidence remain separate. Paying never changes verification, taxonomy or organic ranking.'],
    ],
    he: [
      ['סקירה', 'מוצג המצב האמיתי של העסק העצמאי: טיוטה, בדיקה, פורסם, חידוש או השהיה. מצב ריק אינו דוגמה.'],
      ['פרופיל מותג', 'מכינים שם משפטי ומסחרי, לוגו, צבע הדגשה אחד, תיאור דו-לשוני, אזור שירות, שעות, זכויות תמונה וטענות שניתנות לאימות.'],
      ['פניות בהסכמה', 'ביקור אנונימי נשאר אנונימי. פנייה מציגה רק שדות שהלקוח הסכים במפורש לשתף עם העסק שלכם.'],
      ['ביצועים', 'לאחר הפרסום מוצגים צפיות זכאיות, פעולות לאחר גילוי ופניות בהסכמה של העסק שלכם בלבד. קבוצות קטנות מוסתרות לפרטיות.'],
      ['מסלול ואימות', 'חיוב, חסות וראיות נשארים נפרדים. תשלום אינו משנה אימות, סיווג או דירוג אורגני.'],
    ],
  },
} as const;

export default function DashboardTour({ kind, he }: { kind: TourKind; he: boolean }) {
  const [open, setOpen] = useState(false); const [step, setStep] = useState(0); const [speaking, setSpeaking] = useState(false);
  const steps = copy[kind][he ? 'he' : 'en'];
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const speak = () => { if (!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const [stepTitle, stepBody] = steps[step]; const utterance = new SpeechSynthesisUtterance(`${stepTitle}. ${stepBody}`); utterance.lang = he ? 'he-IL' : 'en-US'; utterance.rate = he ? .88 : .95; utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(utterance); };
  const stop = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  if (!open) return <Card className="border-[#bca36d] bg-gradient-to-r from-[#fffaf0] to-[#f0f5f1]"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#9a7438]">{he ? 'סיור מותאם לחשבון' : 'Account-specific tour'}</p><h2 className="mt-1 font-sans text-lg font-semibold text-[#173f46]">{he ? 'הכירו את סביבת העבודה לפני שהמידע האמיתי מגיע' : 'Learn the workspace before real information arrives'}</h2><p className="mt-1 text-sm text-[#6e6a62]">{he ? 'סיור חזותי וקולי. אין בו עבודות, לקוחות או מספרים לדוגמה.' : 'A visual and spoken tour with no sample jobs, customers or numbers.'}</p></div><Button onClick={() => setOpen(true)} className="min-h-11 bg-[#174e57]"><Play className="me-2 h-4 w-4" />{he ? 'התחלת הסיור' : 'Start tour'}</Button></CardContent></Card>;
  const [title, body] = steps[step];
  return <Card className="overflow-hidden border-[#bca36d] bg-white"><CardContent className="p-0"><div className="flex items-center justify-between bg-[#102f38] px-5 py-4 text-white"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#e8c46f]">{he ? `שלב ${step + 1} מתוך ${steps.length}` : `Step ${step + 1} of ${steps.length}`}</p><h2 className="mt-1 font-sans text-xl font-semibold">{title}</h2></div><Button size="icon" variant="ghost" onClick={() => { stop(); setOpen(false); }} className="text-white hover:bg-white/10 hover:text-white" aria-label={he ? 'סגירת הסיור' : 'Close tour'}><X className="h-5 w-5" /></Button></div><div className="p-5 sm:p-6"><div className="h-1.5 overflow-hidden rounded-full bg-[#e7e2d8]"><div className="h-full bg-[#c49332] transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><p className="mt-5 min-h-16 text-base leading-7 text-[#4f5d5f]">{body}</p><div className="mt-5 flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => speaking ? stop() : speak()}>{speaking ? <Pause className="me-2 h-4 w-4" /> : <Volume2 className="me-2 h-4 w-4" />}{speaking ? (he ? 'עצירה' : 'Stop audio') : (he ? 'השמעת הסיור' : 'Listen to tour')}</Button><span className="flex-1" /><Button variant="ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}><ChevronLeft className="h-4 w-4" />{he ? 'הקודם' : 'Previous'}</Button><Button onClick={() => step === steps.length - 1 ? setOpen(false) : setStep(s => s + 1)} className="bg-[#174e57]">{step === steps.length - 1 ? (he ? 'סיום' : 'Finish') : (he ? 'הבא' : 'Next')}<ChevronRight className="ms-1 h-4 w-4" /></Button></div></div></CardContent></Card>;
}
