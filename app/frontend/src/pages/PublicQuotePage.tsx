import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cleanfixApi } from '@/lib/cleanfixApi';

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
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    cleanfixApi.getPublicServiceQuote(token)
      .then(setQuote)
      .catch((requestError) => setError(requestError?.response?.data?.detail || 'This quote could not be found.'))
      .finally(() => setLoading(false));
  }, [token]);

  const decide = async (decision: 'accept' | 'decline') => {
    setDeciding(true);
    setError('');
    try {
      setQuote(await cleanfixApi.decidePublicServiceQuote(token, decision));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || 'Your response could not be saved.');
    } finally {
      setDeciding(false);
    }
  };

  return <main className="min-h-screen bg-[#F7F2EA] px-4 py-8 text-[#173F46] sm:py-14">
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#102E38] text-[#D6A85F]">CF</div><div><p className="text-xl font-semibold">CleanFixHarish</p><p className="text-sm text-[#746D65]">Private service quote</p></div></div>
      {loading && <Card><CardContent className="p-8 text-center">Loading your quote…</CardContent></Card>}
      {error && !quote && <Card className="border-red-200"><CardContent className="p-8 text-center"><XCircle className="mx-auto mb-3 h-9 w-9 text-red-600"/><p className="font-medium">{error}</p><p className="mt-2 text-sm text-[#746D65]">Please ask CleanFixHarish for a new private link.</p></CardContent></Card>}
      {quote && <Card className="overflow-hidden border-[#D8D0C6] shadow-sm">
        <CardHeader className="bg-[#102E38] text-white"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-white/70">Quote #{quote.id}</p><CardTitle className="mt-1 text-4xl">{money(quote.quoted_total)}</CardTitle></div><Badge className="bg-[#F7F2EA] text-[#173F46]">{quote.status}</Badge></div></CardHeader>
        <CardContent className="space-y-6 p-5 sm:p-8">
          <section><h2 className="font-semibold">Work included</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[#625B53]">{quote.scope}</p></section>
          {quote.exclusions && <section><h2 className="font-semibold">Not included</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[#625B53]">{quote.exclusions}</p></section>}
          {quote.terms && <section><h2 className="font-semibold">Terms</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[#625B53]">{quote.terms}</p></section>}
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#F0EAE1] p-4"><p className="text-xs uppercase tracking-wider text-[#786F65]">Deposit</p><p className="mt-1 text-xl font-semibold">{money(quote.deposit_required)}</p></div><div className="rounded-2xl bg-[#F0EAE1] p-4"><p className="text-xs uppercase tracking-wider text-[#786F65]">Valid until</p><p className="mt-1 font-medium">{new Date(quote.expires_at).toLocaleString('en-IL')}</p></div></div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {quote.status === 'published' && <div className="grid gap-3 sm:grid-cols-2"><Button disabled={deciding} onClick={() => decide('accept')} className="h-12 bg-[#174E57]"><CheckCircle2 className="mr-2 h-5 w-5"/>Accept quote</Button><Button disabled={deciding} onClick={() => decide('decline')} variant="outline" className="h-12"><XCircle className="mr-2 h-5 w-5"/>Decline</Button></div>}
          {quote.status === 'accepted' && <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mb-2 h-6 w-6"/><strong>Quote accepted.</strong><p className="mt-1 text-sm">CleanFixHarish will contact you to confirm scheduling. Acceptance does not process a payment.</p></div>}
          {quote.status === 'declined' && <div className="rounded-2xl bg-slate-100 p-4"><XCircle className="mb-2 h-6 w-6"/><strong>Quote declined.</strong><p className="mt-1 text-sm">Contact us if you would like the scope reviewed.</p></div>}
          {quote.status === 'expired' && <div className="rounded-2xl bg-amber-50 p-4 text-amber-900"><Clock3 className="mb-2 h-6 w-6"/><strong>This quote has expired.</strong></div>}
          <div className="flex gap-2 text-xs leading-5 text-[#786F65]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/><p>{quote.notice} This page never asks for card details.</p></div>
        </CardContent>
      </Card>}
    </div>
  </main>;
}
