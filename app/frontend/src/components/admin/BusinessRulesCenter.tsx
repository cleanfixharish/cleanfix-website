import { useMemo, useState } from 'react';
import { Calculator, FileDown, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateJobEconomics, calculatePartnerRevenue } from '@/lib/unitEconomics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const money = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
const pct = (value: number) => `${Math.round(value * 100)}%`;

export default function BusinessRulesCenter() {
  const { lang } = useLanguage();
  const he = lang === 'he';
  const [providerPayout, setProviderPayout] = useState(390);
  const [directCost, setDirectCost] = useState(25);
  const [ownerMinutes, setOwnerMinutes] = useState(35);
  const [monthlyListing, setMonthlyListing] = useState(149);
  const [referrals, setReferrals] = useState(4);
  const [referralFee, setReferralFee] = useState(50);
  const result = useMemo(() => calculateJobEconomics({ providerPayout, fixedDirectCost: directCost, reserveRate: .05, paymentRate: .04, acquisitionRate: .05, targetMarginRate: .22, minimumContribution: 125, ownerMinutes, ownerHourlyValue: 100, vatRate: .18 }), [providerPayout, directCost, ownerMinutes]);
  const partner = useMemo(() => calculatePartnerRevenue(monthlyListing, referrals, referralFee, .18), [monthlyListing, referrals, referralFee]);
  return (
    <div className="space-y-6">
      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a87520]">{he ? 'חוקת ההפעלה' : 'Operating constitution'}</p><h1 className="mt-2 text-3xl text-[#173f46]">{he ? 'כללי העסק והכלכלה' : 'Business rules & economics'}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#625b53]">{he ? 'מרכז חישוב תפעולי. התוצאות הן הנחות לתכנון עד שיצטברו נתוני אמת מחריש ויתקבל אישור מקצועי.' : 'Operational planning calculator. Results remain assumptions until supported by real Harish records and professional approval.'}</p></div>
      <Card className="border-[#c8b07c] bg-[#fff8e8]"><CardContent className="flex gap-3 p-4 text-sm text-[#684f2b]"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" /><span>{he ? 'אין לגבות תשלום או לשגר עבודה מוסדרת לפני השלמת שערי החוק, הביטוח, החשבונאות והתפעול.' : 'Do not collect or dispatch regulated work until the legal, insurance, accounting and operational gates are complete.'}</span></CardContent></Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-[#d8d0c6] bg-[#fbf8f3]"><CardHeader><CardTitle className="flex items-center gap-2 text-xl text-[#173f46]"><Calculator className="h-5 w-5 text-[#a87520]" />{he ? 'מחיר עבודה ותשלום לספק' : 'Job price & provider payout'}</CardTitle></CardHeader><CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label={he ? 'תשלום מוסכם לספק' : 'Agreed provider payout'} value={providerPayout} setValue={setProviderPayout} />
            <NumberField label={he ? 'עלות ישירה קבועה' : 'Fixed direct cost'} value={directCost} setValue={setDirectCost} />
            <NumberField label={he ? 'דקות ניהול בעלים' : 'Owner minutes'} value={ownerMinutes} setValue={setOwnerMinutes} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Metric label={he ? 'מחיר נטו מינימלי' : 'Minimum net price'} value={money.format(result.netPrice)} />
            <Metric label={he ? 'סה״כ ללקוח כולל מע״מ' : 'Customer total incl. VAT'} value={money.format(result.grossPrice)} />
            <Metric label={he ? 'חלק הספק מהנטו' : 'Provider share of net'} value={pct(result.providerShare)} />
            <Metric label={he ? 'עתודת איכות' : 'Quality reserve'} value={money.format(result.reserve)} />
            <Metric label={he ? 'תרומה לפני זמן בעלים' : 'Contribution before owner'} value={`${money.format(result.contributionBeforeOwner)} · ${pct(result.contributionBeforeOwnerRate)}`} />
            <Metric label={he ? 'תרומה אחרי זמן בעלים' : 'Contribution after owner'} value={`${money.format(result.contributionAfterOwner)} · ${pct(result.contributionAfterOwnerRate)}`} />
          </dl>
          <Badge className={`mt-5 ${result.healthy ? 'bg-[#dceadf] text-[#2e6840]' : 'bg-[#f2e1d7] text-[#854d37]'}`}>{result.healthy ? (he ? 'עומד ברצפת התכנון' : 'Meets planning floor') : (he ? 'לתמחר מחדש או לדחות' : 'Reprice or decline')}</Badge>
        </CardContent></Card>
        <Card className="border-[#d8d0c6] bg-[#fbf8f3]"><CardHeader><CardTitle className="flex items-center gap-2 text-xl text-[#173f46]"><ShieldCheck className="h-5 w-5 text-[#a87520]" />{he ? 'עסק חיצוני - הפניה בלבד' : 'External referral-only business'}</CardTitle></CardHeader><CardContent>
          <p className="mb-4 text-xs leading-5 text-[#786f65]">{he ? 'כבוי עד 20 עבודות ליבה שנבדקו ואישור משפטי/חשבונאי. לעולם לא משמש לפרסום מתחרה בשירות ליבה.' : 'Disabled until 20 reviewed core jobs and legal/accounting approval. Never used to advertise a competitor in a core service.'}</p>
          <div className="grid gap-4 sm:grid-cols-3"><NumberField label={he ? 'רישום חודשי נטו' : 'Monthly listing net'} value={monthlyListing} setValue={setMonthlyListing} /><NumberField label={he ? 'הפניות שהושלמו' : 'Completed referrals'} value={referrals} setValue={setReferrals} /><NumberField label={he ? 'תשלום קבוע להפניה' : 'Fixed referral fee'} value={referralFee} setValue={setReferralFee} /></div>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm"><Metric label={he ? 'הכנסה חודשית נטו' : 'Monthly net revenue'} value={money.format(partner.net)} /><Metric label={he ? 'חשבונית כולל מע״מ' : 'Invoice incl. VAT'} value={money.format(partner.gross)} /></dl>
          <Badge className="mt-5 bg-[#eee4d4] text-[#765d38]">{he ? 'תכונה נעולה לפני שערי השקה' : 'Feature locked before launch gates'}</Badge>
        </CardContent></Card>
      </div>
      <Card className="border-[#d8d0c6] bg-[#fbf8f3]"><CardHeader><CardTitle className="text-xl text-[#173f46]">{he ? 'מסמכי מקור והורדות' : 'Source documents & downloads'}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[
        ['/legal/customer-service-terms-en.pdf', 'Customer service terms'], ['/legal/customer-service-terms-he.pdf', 'תנאי שירות ללקוח'], ['/legal/privacy-notice-en.pdf', 'Privacy notice'], ['/legal/privacy-notice-he.pdf', 'הודעת פרטיות'], ['/legal/provider-principles-en.pdf', 'Provider principles'], ['/legal/provider-principles-he.pdf', 'עקרונות התקשרות לספק'],
      ].map(([href, label]) => <a key={href} href={href} download className="flex min-h-12 items-center gap-2 rounded-xl border border-[#d8d0c6] bg-white px-4 text-sm font-semibold text-[#174e57] hover:border-[#b8842f]"><FileDown className="h-4 w-4" />{label}</a>)}</CardContent></Card>
    </div>
  );
}

function NumberField({ label, value, setValue }: { label: string; value: number; setValue: (value: number) => void }) { return <div><Label className="text-xs text-[#625b53]">{label}</Label><Input type="number" min="0" value={value} onChange={(event) => setValue(Math.max(0, Number(event.target.value) || 0))} className="mt-1 bg-white" /></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#e5ddd3] bg-white p-3"><dt className="text-xs text-[#786f65]">{label}</dt><dd className="mt-1 font-bold text-[#173f46]" dir="ltr">{value}</dd></div>; }
