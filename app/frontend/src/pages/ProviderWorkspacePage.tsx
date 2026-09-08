import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, BriefcaseBusiness, CalendarClock, CheckCircle2, Clock3, HelpCircle, MapPin, Navigation, RefreshCw, ShieldCheck, TimerReset } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import BusinessPortalShell, { PortalNavItem } from '@/components/BusinessPortalShell';
import DashboardTour from '@/components/DashboardTour';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBusinessPortalAccess } from '@/hooks/useBusinessPortalAccess';
import { cleanfixApi } from '@/lib/cleanfixApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Offer = { id: number; job_id: number; status: string; provider_payout: number; currency: string; service_key: string; service_area: string; window_start: string; window_end: string; response_deadline: string; instructions?: string; version: number };
type ProviderJob = { id: number; title: string; general_area?: string; scheduled_for?: string; confirmed_window_end?: string; status: 'confirmed' | 'on_the_way' | 'arrived' | 'in_progress'; version: number };
type PrivateLocation = { exact_address: string; access_instructions?: string; version: number };

const nav: PortalNavItem[] = [
  { href: '/provider', labelEn: 'Today', labelHe: 'היום', icon: CalendarClock },
  { href: '/provider/offers', labelEn: 'Offers', labelHe: 'הצעות', icon: TimerReset },
  { href: '/provider/jobs', labelEn: 'Active jobs', labelHe: 'עבודות פעילות', icon: BriefcaseBusiness },
];

function stableKey(scope: string) {
  const storageKey = `cleanfix.provider.command.${scope}`;
  const current = sessionStorage.getItem(storageKey);
  if (current) return current;
  const created = crypto.randomUUID();
  sessionStorage.setItem(storageKey, created);
  return created;
}

function message(error: unknown, he: boolean) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 503) return he ? 'עבודות השטח עדיין כבויות בשרת.' : 'Field fulfillment is still disabled on the server.';
    if (typeof error.response?.data?.detail === 'string') return error.response.data.detail;
  }
  return he ? 'לא ניתן להשלים את הפעולה.' : 'The action could not be completed.';
}

function formatDate(value: string | undefined, he: boolean) {
  if (!value) return '—';
  return new Date(value).toLocaleString(he ? 'he-IL' : 'en-IL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jerusalem' });
}

export default function ProviderWorkspacePage() {
  const { lang } = useLanguage();
  const { pathname } = useLocation();
  const { user, checking, business, authorized, relationshipStatus } = useBusinessPortalAccess('provider');
  const he = lang === 'he';
  return <BusinessPortalShell nav={nav} badgeEn="Secure provider workspace" badgeHe="סביבת ספק מאובטחת" eyebrowEn="Managed service partner" eyebrowHe="שותף ביצוע מנוהל" titleEn="Your real offers and active jobs" titleHe="ההצעות והעבודות הפעילות שלך" descriptionEn="Only records assigned to your approved provider relationship appear here. Customer price and CleanFix margin are never shown." descriptionHe="כאן מופיעות רק רשומות ששויכו לקשר הספק המאושר שלך. מחיר הלקוח והמרווח של CleanFix לעולם אינם מוצגים.">
    {checking ? <Loading he={he} /> : !user ? <SignIn he={he} /> : !business ? <WrongAccount he={he} /> : !authorized ? <ApprovalRequired he={he} status={relationshipStatus} /> : <ProviderWork he={he} view={pathname} />}
  </BusinessPortalShell>;
}

function ProviderWork({ he, view }: { he: boolean; view: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [jobs, setJobs] = useState<ProviderJob[]>([]);
  const [declineReasons, setDeclineReasons] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [locations, setLocations] = useState<Record<number, PrivateLocation>>({});

  const load = async () => {
    setLoading(true);
    setLocations({});
    try {
      const [offerRows, jobRows] = await Promise.all([cleanfixApi.listProviderOffers(), cleanfixApi.listProviderJobs()]);
      setOffers(offerRows as Offer[]); setJobs(jobRows as ProviderJob[]); setDisabled(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 503) { setDisabled(true); setOffers([]); setJobs([]); }
      else toast.error(message(error, he));
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const decide = async (offer: Offer, decision: 'accept' | 'decline') => {
    const reason = declineReasons[offer.id]?.trim();
    if (decision === 'decline' && !reason) { toast.error(he ? 'נא לציין סיבה לדחייה.' : 'Please provide a decline reason.'); return; }
    setBusy(`${decision}-${offer.id}`);
    try {
      await cleanfixApi.decideProviderOffer(offer.id, decision, { expected_version: offer.version, decline_reason: decision === 'decline' ? reason : null }, stableKey(`${decision}-offer-${offer.id}-v${offer.version}-${reason || 'no-reason'}`));
      toast.success(decision === 'accept' ? (he ? 'ההצעה התקבלה וממתינה לאישור הבעלים.' : 'Offer accepted and waiting for owner confirmation.') : (he ? 'ההצעה נדחתה.' : 'Offer declined.'));
      await load();
    } catch (error) { toast.error(message(error, he)); }
    finally { setBusy(''); }
  };

  const advance = async (job: ProviderJob) => {
    const command = job.status === 'confirmed' ? 'on-the-way' : job.status === 'on_the_way' ? 'arrive' : job.status === 'arrived' ? 'start' : null;
    if (!command) return;
    setBusy(`${command}-${job.id}`);
    try {
      await cleanfixApi.advanceProviderJob(job.id, command, job.version, stableKey(`${command}-job-${job.id}-v${job.version}`));
      toast.success(he ? 'מצב העבודה עודכן.' : 'Job status updated.'); await load();
    } catch (error) { toast.error(message(error, he)); }
    finally { setBusy(''); }
  };

  const revealLocation = async (job: ProviderJob) => {
    setBusy(`location-${job.id}`);
    try {
      const location = await cleanfixApi.getProviderServiceLocation(job.id) as PrivateLocation;
      setLocations((current) => ({ ...current, [job.id]: location }));
    } catch (error) { toast.error(message(error, he)); }
    finally { setBusy(''); }
  };

  if (disabled) return <Disabled he={he} retry={() => void load()} />;
  if (loading) return <Loading he={he} />;

  const showOffers = view === '/provider' || view === '/provider/offers';
  const showJobs = view === '/provider' || view === '/provider/jobs';
  const openOffers = offers.filter((item) => item.status === 'offered');
  return <div className="space-y-5">
    {view === '/provider' && <DashboardTour kind="provider" he={he} />}
    {showOffers && <section><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold text-[#173f46]">{he ? 'הצעות שממתינות לתשובה' : 'Offers awaiting your decision'}</h2><Badge variant="outline">{openOffers.length}</Badge></div><div className="grid gap-4 xl:grid-cols-2">{openOffers.map((offer) => <OfferCard key={offer.id} offer={offer} he={he} busy={!!busy} reason={declineReasons[offer.id] || ''} setReason={(value) => setDeclineReasons((current) => ({ ...current, [offer.id]: value }))} decide={decide} />)}{!openOffers.length && <Empty text={he ? 'אין הצעות פתוחות אמיתיות כרגע.' : 'There are no real open offers right now.'} />}</div></section>}
    {showJobs && <section><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold text-[#173f46]">{he ? 'עבודות פעילות' : 'Active jobs'}</h2><Badge variant="outline">{jobs.length}</Badge></div><div className="grid gap-4 xl:grid-cols-2">{jobs.map((job) => <JobCard key={job.id} job={job} he={he} busy={!!busy} location={locations[job.id]} advance={advance} revealLocation={revealLocation} />)}{!jobs.length && <Empty text={he ? 'אין עבודות פעילות שמשויכות לחשבון.' : 'No active jobs are assigned to this account.'} />}</div></section>}
  </div>;
}

function OfferCard({ offer, he, busy, reason, setReason, decide }: { offer: Offer; he: boolean; busy: boolean; reason: string; setReason: (value: string) => void; decide: (offer: Offer, decision: 'accept' | 'decline') => Promise<void> }) {
  return <Card className="border-[#d9d7cf] bg-[#fbfaf7]"><CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-2 text-lg"><span>{he ? 'הצעה' : 'Offer'} #{offer.id}</span><Badge>{offer.service_key}</Badge></CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 text-sm sm:grid-cols-2"><Info icon={MapPin} label={he ? 'אזור כללי' : 'General area'} value={offer.service_area} /><Info icon={Clock3} label={he ? 'חלון עבודה' : 'Work window'} value={`${formatDate(offer.window_start, he)} – ${formatDate(offer.window_end, he)}`} /><Info icon={CheckCircle2} label={he ? 'תשלום ברוטו מוסכם' : 'Agreed gross payout'} value={`${offer.currency} ${Number(offer.provider_payout).toLocaleString()}`} /><Info icon={TimerReset} label={he ? 'מועד תשובה' : 'Response deadline'} value={formatDate(offer.response_deadline, he)} /></div>{offer.instructions && <p className="rounded-xl bg-white p-3 text-sm leading-6 text-[#526064]">{offer.instructions}</p>}<p className="text-xs text-[#736f68]">{he ? 'זהות הלקוח וכתובת מדויקת אינן מוצגות לפני אישור השיבוץ.' : 'Customer identity and exact address are not shown before assignment confirmation.'}</p><div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"><Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={he ? 'סיבה נדרשת רק לדחייה' : 'Reason required only to decline'} /><Button variant="outline" disabled={busy} onClick={() => void decide(offer, 'decline')}>{he ? 'דחייה' : 'Decline'}</Button><Button className="bg-[#174e57]" disabled={busy} onClick={() => void decide(offer, 'accept')}>{he ? 'קבלה' : 'Accept'}</Button></div></CardContent></Card>;
}

function JobCard({ job, he, busy, location, advance, revealLocation }: { job: ProviderJob; he: boolean; busy: boolean; location?: PrivateLocation; advance: (job: ProviderJob) => Promise<void>; revealLocation: (job: ProviderJob) => Promise<void> }) {
  const action = job.status === 'confirmed' ? (he ? 'יצאתי לדרך' : 'I am on the way') : job.status === 'on_the_way' ? (he ? 'הגעתי' : 'I arrived') : job.status === 'arrived' ? (he ? 'התחלת עבודה' : 'Start work') : null;
  return <Card className="border-[#d9d7cf] bg-white"><CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-2 text-lg"><span>#{job.id} · {job.title}</span><Badge variant="outline">{job.status.replace(/_/g, ' ')}</Badge></CardTitle></CardHeader><CardContent className="space-y-4"><Info icon={MapPin} label={he ? 'אזור כללי' : 'General area'} value={job.general_area || '—'} /><Info icon={CalendarClock} label={he ? 'חלון מאושר' : 'Confirmed window'} value={`${formatDate(job.scheduled_for, he)} – ${formatDate(job.confirmed_window_end, he)}`} />{location ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-3" aria-live="polite"><p className="text-xs font-semibold uppercase tracking-wide text-amber-800">{he ? 'מיקום פרטי · הצפייה נרשמה' : 'Private location · access audited'}</p><p className="mt-1 font-semibold text-[#173f46]">{location.exact_address}</p>{location.access_instructions && <p className="mt-2 text-sm text-[#526064]">{location.access_instructions}</p>}</div> : <div className="space-y-2"><p className="text-xs leading-5 text-[#736f68]">{he ? 'הכתובת המדויקת אינה מוצגת ברשימות. היא זמינה רק לשיבוץ המאושר וכל צפייה נרשמת.' : 'The exact address is excluded from listings. It is available only for this confirmed assignment and every reveal is audited.'}</p><Button variant="outline" className="w-full" disabled={busy} onClick={() => void revealLocation(job)}><MapPin className="me-2 h-4 w-4" />{he ? 'הצגת מיקום שירות מאובטח' : 'Reveal secure service location'}</Button></div>}{action ? <Button className="min-h-12 w-full bg-[#174e57]" disabled={busy} onClick={() => void advance(job)}><Navigation className="me-2 h-4 w-4" />{action}</Button> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{he ? 'העבודה החלה. בקרות סיום, תיעוד ותשלום עדיין אינן זמינות.' : 'Work is in progress. Completion, evidence, and payment controls are not available yet.'}</div>}</CardContent></Card>;
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) { return <div className="flex min-w-0 gap-2 rounded-xl bg-[#f3f5f1] p-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#a67d39]" /><div className="min-w-0"><p className="text-[11px] uppercase tracking-wide text-[#7a746c]">{label}</p><p className="break-words font-medium text-[#334b4f]">{value}</p></div></div>; }
function Empty({ text }: { text: string }) { return <Card className="border-dashed"><CardContent className="p-7 text-center text-sm text-[#6f6a62]">{text}</CardContent></Card>; }
function Loading({ he }: { he: boolean }) { return <Card aria-live="polite"><CardContent className="p-8 text-center text-sm text-[#6f6a62]">{he ? 'טוענים רשומות מאובטחות…' : 'Loading secured records…'}</CardContent></Card>; }
function Disabled({ he, retry }: { he: boolean; retry: () => void }) { return <Card className="border-amber-300 bg-amber-50" aria-live="polite"><CardContent className="p-6"><ShieldCheck className="h-7 w-7 text-amber-700" /><h2 className="mt-3 text-xl font-semibold">{he ? 'עבודות השטח עדיין כבויות' : 'Field fulfillment is not enabled yet'}</h2><p className="mt-2 text-sm text-[#6f6a62]">{he ? 'השרת חוסם הצעות ושיבוץ עד להשלמת האישורים. אין כאן נתוני דוגמה.' : 'The server is blocking offers and dispatch until approvals are complete. No sample data is shown.'}</p><Button variant="outline" className="mt-4" onClick={retry}><RefreshCw className="me-2 h-4 w-4" />{he ? 'בדיקה מחדש' : 'Check again'}</Button></CardContent></Card>; }
function SignIn({ he }: { he: boolean }) { return <Card className="border-[#d5c59f] bg-[#fffaf0]"><CardContent className="p-7 text-center"><AlertTriangle className="mx-auto h-7 w-7 text-[#a97928]" /><h2 className="mt-3 text-xl font-semibold">{he ? 'נדרשת כניסה מאובטחת' : 'Secure sign-in required'}</h2><Button asChild className="mt-5 bg-[#174e57]"><Link to="/account?type=business">{he ? 'כניסה לחשבון' : 'Open business account'}</Link></Button></CardContent></Card>; }
function WrongAccount({ he }: { he: boolean }) { return <Card><CardContent className="p-7 text-center"><ShieldCheck className="mx-auto h-7 w-7" /><h2 className="mt-3 text-xl font-semibold">{he ? 'נדרש חשבון עסקי' : 'A business account is required'}</h2></CardContent></Card>; }
function ApprovalRequired({ he, status }: { he: boolean; status: string }) { return <Card className="border-[#d5c59f] bg-[#fffaf0]" aria-live="polite"><CardContent className="p-7 text-center"><HelpCircle className="mx-auto h-7 w-7 text-[#a97928]" /><h2 className="mt-3 text-xl font-semibold">{he ? 'אישור שותף ביצוע נדרש' : 'Managed-provider approval is required'}</h2><p className="mt-2 text-sm text-[#6f6a62]">{he ? `מצב הקשר: ${status}` : `Relationship status: ${status}`}</p><Button asChild variant="outline" className="mt-5"><Link to="/account">{he ? 'חזרה לחשבון' : 'Back to account'}</Link></Button></CardContent></Card>; }
