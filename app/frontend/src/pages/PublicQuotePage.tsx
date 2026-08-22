import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cleanfixApi } from '@/lib/cleanfixApi';
import { useLanguage } from '@/contexts/LanguageContext';

type PublicQuote = {
  id: number;
  quoted_total: number;
  deposit_required?: number | null;
  scope: string;
  exclusions?: string | null;
  terms?: string | null;
  status: 'published' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  currency: string;
  notice: string;
};

const money = (value?: number | null) => value == null ? '—' : `₪${Number(value).toLocaleString('en-IL', { maximumFractionDigits: 2 })}`;

export default function PublicQuotePage() {
  const { token = '' } = useParams();
  const { t, lang } = useLanguage();
  const q = t.publicQuote;
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    cleanfixApi.getPublicServiceQuote(token)
      .then(setQuote)
      .catch((requestError) => setError(requestError?.response?.data?.detail || q.notFound))
      .finally(() => setLoading(false));
  }, [token, q.notFound]);

  const decide = async (decision: 'accept' | 'decline') => {
    setDeciding(true);
    setError('');
    try {
      setQuote(await cleanfixApi.decidePublicServiceQuote(token, decision));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || q.saveFailed);
    } finally {
      setDeciding(false);
    }
  };

  return <main className="min-h-screen bg-[#F7F2EA] px-4 py-8 text-[#173F46] sm:py-14">
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#102E38] text-[#D6A85F]">CF</div><div><p className="text-xl font-semibold">CleanFixHarish</p><p className="text-sm text-[#746D65]">{q.privateQuote}</p></div></div>
      {loading && <Card><CardContent className="p-8 text-center">{q.loading}</CardContent></Card>}
      {error && !quote && <Card className="border-red-200"><CardContent className="p-8 text-center"><XCircle className="mx-auto mb-3 h-9 w-9 text-red-600"/><p className="font-medium">{error}</p><p className="mt-2 text-sm text-[#746D65]">{q.askNew}</p></CardContent></Card>}
      {quote && <Card className="overflow-hidden border-[#D8D0C6] shadow-sm">
        <CardHeader className="bg-[#102E38] text-white"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-white/70" dir="ltr">Quote #{quote.id}</p><CardTitle className="mt-1 text-4xl" dir="ltr">{money(quote.quoted_total)}</CardTitle></div><Badge className="bg-[#F7F2EA] text-[#173F46]">{quote.status}</Badge></div></CardHeader>
        <CardContent className="space-y-6 p-5 sm:p-8">
          <section><h2 className="font-semibold">{q.included}</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[#625B53]">{quote.scope}</p></section>
          {quote.exclusions && <section><h2 className="font-semibold">{q.notIncluded}</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[#625B53]">{quote.exclusions}</p></section>}
          {quote.terms && <section><h2 className="font-semibold">{q.terms}</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[#625B53]">{quote.terms}</p></section>}
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#F0EAE1] p-4"><p className="text-xs uppercase tracking-wider text-[#786F65]">{q.deposit}</p><p className="mt-1 text-xl font-semibold" dir="ltr">{money(quote.deposit_required)}</p></div><div className="rounded-2xl bg-[#F0EAE1] p-4"><p className="text-xs uppercase tracking-wider text-[#786F65]">{q.validUntil}</p><p className="mt-1 font-medium">{new Date(quote.expires_at).toLocaleString(lang === 'he' ? 'he-IL' : 'en-IL')}</p></div></div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {quote.status === 'published' && <div className="grid gap-3 sm:grid-cols-2"><Button disabled={deciding} onClick={() => decide('accept')} className="h-12 bg-[#174E57]"><CheckCircle2 className="me-2 h-5 w-5"/>{q.accept}</Button><Button disabled={deciding} onClick={() => decide('decline')} variant="outline" className="h-12"><XCircle className="me-2 h-5 w-5"/>{q.decline}</Button></div>}
          {quote.status === 'accepted' && <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mb-2 h-6 w-6"/><strong>{q.accepted}</strong><p className="mt-1 text-sm">{q.acceptedNote}</p></div>}
          {quote.status === 'declined' && <div className="rounded-2xl bg-slate-100 p-4"><XCircle className="mb-2 h-6 w-6"/><strong>{q.declined}</strong><p className="mt-1 text-sm">{q.declinedNote}</p></div>}
          {quote.status === 'expired' && <div className="rounded-2xl bg-amber-50 p-4 text-amber-900"><Clock3 className="mb-2 h-6 w-6"/><strong>{q.expired}</strong></div>}
          <div className="flex gap-2 text-xs leading-5 text-[#786F65]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/><p>{quote.notice} {q.noCard}</p></div>
        </CardContent>
      </Card>}
    </div>
  </main>;
}
