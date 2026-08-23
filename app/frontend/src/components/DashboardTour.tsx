import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Square, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type TourKind = 'provider' | 'partner';
const copy = {
  provider: {
    en: [
      ['Today', 'See only real actions requiring attention: a confirmed assignment, an expiring offer, missing evidence, a compliance hold or a payout update.'],
      ['Offers', 'When offers are activated, each real offer will show the job ID, general area, written scope, schedule window, responsibilities and agreed gross payout before tax and business expenses—never the customer price.'],
      ['Active job', 'When field mode is activated, customer and address information needed for an accepted job will appear only after CleanFix confirms the assignment.'],
      ['Evidence and changes', 'When a job is active, this area will explain the required evidence. Unexpected work must pause while CleanFix reviews a written change request.'],
      ['Earnings', 'When payout tracking is activated, this area will show agreed gross payout, approved extras, document requirements, holds and payment references for real assignments only.'],
    ],
    he: [
      ['היום', 'מוצגות רק פעולות אמיתיות שדורשות תשומת לב: שיבוץ מאושר, הצעה שפגה, תיעוד חסר, עיכוב מסמכים או עדכון תשלום.'],
      ['הצעות עבודה', 'לאחר הפעלת ההצעות, כל הצעה אמיתית תציג מזהה עבודה, אזור כללי, היקף כתוב, חלון זמנים, אחריות ותשלום ברוטו מוסכם לפני מס והוצאות—לעולם לא מחיר הלקוח.'],
      ['עבודה פעילה', 'לאחר הפעלת מצב השטח, פרטי הלקוח והכתובת הנחוצים לעבודה שהתקבלה יוצגו רק אחרי ש-CleanFix תאשר את השיבוץ.'],
      ['תיעוד ושינויים', 'כאשר עבודה פעילה, האזור יסביר איזה תיעוד נדרש. עבודה בלתי צפויה חייבת להיעצר עד ש-CleanFix תבדוק בקשת שינוי כתובה.'],
      ['תשלומים', 'לאחר הפעלת מעקב התשלומים, האזור יציג תשלום ברוטו מוסכם, תוספות מאושרות, דרישות מסמך, עיכובים ואסמכתאות—רק לעבודות אמיתיות.'],
    ],
  },
  partner: {
    en: [
      ['Overview', 'When publishing is activated, this area will show the genuine state of your independent listing. Empty means no live data—not a sample.'],
      ['Brand profile', 'When profile editing is activated, prepare legal and trading names, a logo, one accent color, bilingual description, service area, hours, gallery rights and reviewable claims.'],
      ['Introductions', 'When introductions are activated, anonymous visits will stay anonymous. A request will show only fields the customer explicitly agrees to share with your business.'],
      ['Performance', 'After publication and measurement are activated, this area will show privacy-safe profile views and customer-approved introductions. Very small totals may be hidden.'],
      ['Plan and verification', 'When billing is activated, plans and sponsored placement will remain separate from verification and unpaid listing order.'],
    ],
    he: [
      ['סקירה', 'לאחר הפעלת הפרסום, האזור יציג את המצב האמיתי של העסק העצמאי. מצב ריק פירושו שאין מידע חי—לא שמוצגת דוגמה.'],
      ['פרופיל מותג', 'לאחר הפעלת עריכת הפרופיל, ניתן יהיה להכין שם משפטי ומסחרי, לוגו, צבע הדגשה אחד, תיאור דו-לשוני, אזור שירות, שעות, זכויות תמונה וטענות לבדיקה.'],
      ['פניות בהסכמה', 'לאחר הפעלת הפניות, ביקור אנונימי יישאר אנונימי. פנייה תציג רק שדות שהלקוח הסכים במפורש לשתף עם העסק שלכם.'],
      ['ביצועים', 'לאחר הפעלת הפרסום והמדידה, האזור יציג צפיות בפרופיל ופניות שאושרו על ידי לקוחות, תוך הגנה על הפרטיות. נתונים קטנים מאוד עשויים להיות מוסתרים.'],
      ['מסלול ואימות', 'לאחר הפעלת החיוב, מסלולים ופרסום ממומן יישארו נפרדים מאימות ומסדר ההצגה שאינו ממומן.'],
    ],
  },
} as const;

export default function DashboardTour({ kind, he }: { kind: TourKind; he: boolean }) {
  const [open, setOpen] = useState(false); const [step, setStep] = useState(0); const [speaking, setSpeaking] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const steps = copy[kind][he ? 'he' : 'en'];
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  useEffect(() => {
    if (!open) return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    headingRef.current?.focus();
  }, [he, kind, open, step]);
  const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const speak = () => { if (!speechAvailable) return; window.speechSynthesis.cancel(); const [stepTitle, stepBody] = steps[step]; const utterance = new SpeechSynthesisUtterance(`${stepTitle}. ${stepBody}`); utterance.lang = he ? 'he-IL' : 'en-US'; utterance.rate = he ? .86 : .92; utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(utterance); };
  const stop = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  const close = () => { stop(); setOpen(false); };
  const move = (nextStep: number) => { stop(); setStep(nextStep); };
  if (!open) return <Card className="border-[#bca36d] bg-gradient-to-r from-[#fffaf0] to-[#f0f5f1]"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#9a7438]">{he ? 'סיור מותאם לחשבון' : 'Account-specific tour'}</p><h2 className="mt-1 font-sans text-lg font-semibold text-[#173f46]">{kind === 'provider' ? (he ? 'לדעת בדיוק למה מסכימים — לפני שיוצאים לדרך' : 'Know what you are accepting before you travel') : (he ? 'לבנות נראות מקומית — בלי לטשטש מי נותן את השירות' : 'Build local visibility without blurring who serves the customer')}</h2><p className="mt-1 text-sm text-[#6e6a62]">{he ? 'סיור חזותי וקולי. אין בו עבודות, לקוחות או מספרים לדוגמה.' : 'A visual and spoken tour with no sample jobs, customers or numbers.'}</p></div><Button onClick={() => { setStep(0); setOpen(true); }} className="min-h-11 bg-[#174e57]"><Play className="me-2 h-4 w-4" />{he ? 'התחלת הסיור' : 'Start tour'}</Button></CardContent></Card>;
  const [title, body] = steps[step];
  const PreviousIcon = he ? ChevronRight : ChevronLeft;
  const NextIcon = he ? ChevronLeft : ChevronRight;
  return <Card className="overflow-hidden border-[#bca36d] bg-white"><CardContent className="p-0"><div className="flex items-center justify-between bg-[#102f38] px-5 py-4 text-white"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#e8c46f]" aria-live="polite">{he ? `שלב ${step + 1} מתוך ${steps.length}` : `Step ${step + 1} of ${steps.length}`}</p><h2 ref={headingRef} tabIndex={-1} className="mt-1 font-sans text-xl font-semibold outline-none">{title}</h2></div><Button size="icon" variant="ghost" onClick={close} className="h-11 w-11 text-white hover:bg-white/10 hover:text-white" aria-label={he ? 'סגירת הסיור' : 'Close tour'}><X className="h-5 w-5" /></Button></div><div className="p-5 sm:p-6"><div role="progressbar" aria-label={he ? 'התקדמות בסיור' : 'Tour progress'} aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1} className="h-1.5 overflow-hidden rounded-full bg-[#e7e2d8]"><div className="h-full bg-[#c49332] transition-all motion-reduce:transition-none" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><p className="mt-5 min-h-16 text-base leading-7 text-[#4f5d5f]">{body}</p><div className="mt-5 flex flex-wrap items-center gap-2"><Button variant="outline" disabled={!speechAvailable} aria-pressed={speaking} onClick={() => speaking ? stop() : speak()} className="min-h-11">{speaking ? <Square className="me-2 h-4 w-4" /> : <Volume2 className="me-2 h-4 w-4" />}{speaking ? (he ? 'עצירת שמע' : 'Stop audio') : speechAvailable ? (he ? 'השמעת השלב' : 'Listen to this step') : (he ? 'שמע אינו זמין' : 'Audio unavailable')}</Button><span className="flex-1" /><Button variant="ghost" disabled={step === 0} onClick={() => move(step - 1)} className="min-h-11"><PreviousIcon className="me-1 h-4 w-4" />{he ? 'הקודם' : 'Previous'}</Button><Button onClick={() => step === steps.length - 1 ? close() : move(step + 1)} className="min-h-11 bg-[#174e57]">{step === steps.length - 1 ? (he ? 'סיום' : 'Finish') : (he ? 'הבא' : 'Next')}<NextIcon className="ms-1 h-4 w-4" /></Button></div></div></CardContent></Card>;
}
