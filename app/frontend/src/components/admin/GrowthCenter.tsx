import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Copy, ExternalLink, Globe2, Image, LockKeyhole, QrCode, SearchCheck, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const routes = ['/', '/services', '/gardening', '/how-we-work', '/quote', '/partners', '/about'];

export default function GrowthCenter() {
  const { lang } = useLanguage();
  const he = lang === 'he';
  const [campaign, setCampaign] = useState(he ? 'הגינה שלכם יכולה להרגיש כמו מקום חדש - עם תכנון ברור, צוות מתאים ואיש קשר אחד.' : 'Your garden can feel like a new place - with a clear plan, the right team and one accountable contact.');
  const [date, setDate] = useState('');
  const [approved, setApproved] = useState(false);
  const utm = useMemo(() => `https://cleanfixharish.co.il/gardening?utm_source=manual-share&utm_medium=social&utm_campaign=garden-transformations`, []);
  const copy = async (text: string) => { await navigator.clipboard.writeText(text); toast.success(he ? 'הועתק' : 'Copied'); };
  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a87520]">SEO + campaigns</p><h1 className="mt-2 text-3xl text-[#173f46]">{he ? 'מרכז צמיחה' : 'Growth Center'}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#625b53]">{he ? 'SEO יומי אוטומטי, תכנון קמפיינים וערכת שיתוף מאושרת. פרסום חיצוני נשאר נעול עד חיבור הרשאות רשמיות.' : 'Automatic daily SEO checks, campaign planning and an approved share kit. External publishing stays locked until official channel permissions are connected.'}</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Status icon={SearchCheck} label={he ? 'בדיקת SEO יומית' : 'Daily SEO audit'} value={he ? 'GitHub מתוזמן' : 'GitHub scheduled'} tone="ready" />
      <Status icon={Globe2} label={he ? 'מסלולים ציבוריים' : 'Public routes'} value={`${routes.length}`} tone="ready" />
      <Status icon={ShieldCheck} label={he ? 'מסכים פרטיים' : 'Private screens'} value="noindex" tone="ready" />
      <Status icon={LockKeyhole} label={he ? 'פרסום אוטומטי' : 'Automatic posting'} value={he ? 'נעול' : 'Locked'} tone="locked" />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <Card className="border-[#d8d0c6] bg-[#fbf8f3]"><CardHeader><CardTitle className="flex items-center gap-2 text-xl text-[#173f46]"><CalendarClock className="h-5 w-5 text-[#a87520]" />{he ? 'מתכנן קמפיין' : 'Campaign planner'}</CardTitle></CardHeader><CardContent className="space-y-4">
        <Textarea value={campaign} onChange={(event) => setCampaign(event.target.value)} rows={5} className="bg-white" aria-label={he ? 'טקסט קמפיין' : 'Campaign copy'} />
        <div className="grid gap-3 sm:grid-cols-2"><Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} className="bg-white" /><Button variant={approved ? 'default' : 'outline'} onClick={() => setApproved(!approved)} className="min-h-11">{approved ? <CheckCircle2 className="me-2 h-4 w-4" /> : <ShieldCheck className="me-2 h-4 w-4" />}{approved ? (he ? 'מאושר לשיתוף' : 'Approved for sharing') : (he ? 'אישור בעלים' : 'Owner approval')}</Button></div>
        <div className="rounded-xl border border-[#e5ddd3] bg-white p-3 text-xs text-[#625b53]"><strong>UTM:</strong><span className="mt-1 block break-all" dir="ltr">{utm}</span></div>
        <div className="flex flex-wrap gap-2"><Button onClick={() => copy(`${campaign}\n\n${utm}`)} disabled={!approved} className="min-h-11 bg-[#174e57]"><Copy className="me-2 h-4 w-4" />{he ? 'העתקת ערכת שיתוף' : 'Copy share kit'}</Button><Button asChild variant="outline" className="min-h-11"><a href="/assets/qr/cleanfixharish-qr-social-square-1600.png" download><QrCode className="me-2 h-4 w-4" />{he ? 'QR מאושר' : 'Approved QR'}</a></Button><Button asChild variant="outline" className="min-h-11"><a href="/gardening" target="_blank"><ExternalLink className="me-2 h-4 w-4" />{he ? 'תצוגה מקדימה' : 'Preview'}</a></Button></div>
      </CardContent></Card>
      <Card className="border-[#d8d0c6] bg-[#fbf8f3]"><CardHeader><CardTitle className="text-xl text-[#173f46]">{he ? 'ערוצי פרסום' : 'Publishing channels'}</CardTitle></CardHeader><CardContent className="space-y-3">
        {['Facebook Page / Instagram', 'X', 'WhatsApp groups', 'Facebook groups / forums'].map((name, index) => <div key={name} className="flex items-center gap-3 rounded-xl border border-[#e5ddd3] bg-white p-3"><span className="rounded-lg bg-[#dde9e7] p-2">{index < 2 ? <Send className="h-4 w-4 text-[#174e57]" /> : <Image className="h-4 w-4 text-[#174e57]" />}</span><span className="min-w-0 flex-1 text-sm font-semibold text-[#324346]">{name}</span><Badge className={index < 2 ? 'bg-[#eee4d4] text-[#765d38]' : 'bg-[#dceadf] text-[#2e6840]'}>{index < 2 ? (he ? 'דורש API' : 'Needs API') : (he ? 'שיתוף ידני' : 'Manual share')}</Badge></div>)}
        <p className="text-xs leading-5 text-[#786f65]">{he ? 'אין פרסום לקבוצות או פורומים ללא בדיקת כללי הקבוצה ואישור אנושי. אין ספאם ואין טענות מומצאות.' : 'No group or forum post is automated without rule review and human approval. No spam and no fabricated claims.'}</p>
      </CardContent></Card>
    </div>
  </div>;
}

function Status({ icon: Icon, label, value, tone }: { icon: typeof SearchCheck; label: string; value: string; tone: 'ready' | 'locked' }) { return <Card className="border-[#d8d0c6] bg-[#fbf8f3]"><CardContent className="flex items-center gap-3 p-4"><span className="rounded-xl bg-[#dde9e7] p-2"><Icon className="h-5 w-5 text-[#174e57]" /></span><div><p className="text-xs text-[#786f65]">{label}</p><p className="mt-1 font-bold text-[#173f46]">{value}</p></div><Badge className={`ms-auto ${tone === 'ready' ? 'bg-[#dceadf] text-[#2e6840]' : 'bg-[#eee4d4] text-[#765d38]'}`}>{tone === 'ready' ? 'ON' : 'OFF'}</Badge></CardContent></Card>; }
