import { Link } from 'react-router-dom';
import { Building2, Leaf, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PartnersPage() {
  const { lang } = useLanguage();
  const he = lang === 'he';
  return <PublicSite><Header /><main className="flex-1 bg-[#f7f2ea]"><section className="cf-shell py-[55px] md:py-[89px]"><div className="mx-auto max-w-3xl rounded-[34px] border border-[#b8842f]/35 bg-white p-7 text-center shadow-[0_21px_55px_rgba(8,31,40,.09)] md:p-12"><Building2 className="mx-auto h-10 w-10 text-[#a87520]" /><p className="cf-eyebrow mt-5">{he ? 'שלב עתידי' : 'Future phase'}</p><h1 className="mt-3 text-4xl text-[#173f46]">{he ? 'רשת העסקים הרחבה בחריש טרם הושקה.' : 'The wider Harish business network has not launched.'}</h1><p className="mx-auto mt-4 max-w-2xl leading-7 text-[#617074]">{he ? 'איננו מציגים כעת מדריך, צוות או רשת מאומתת. אם וכאשר השלב הזה ייפתח, עסקים עצמאיים יוצגו בהפרדה ברורה משירותי CleanFix.' : 'We are not currently presenting a directory, team or verified network. If this phase opens, independent businesses will be clearly separated from CleanFix services.'}</p><div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-xl bg-[#fff8e8] p-4 text-start text-sm leading-6 text-[#684f2b]"><Leaf className="mt-0.5 h-5 w-5 shrink-0" /><span>{he ? 'גינון נבדק בנפרד מול גנן מקומי אחד בלבד ובכפוף לזמינות.' : 'Gardening is reviewed separately through one local gardener only and remains subject to availability.'}</span></div><div className="mt-7 flex justify-center"><Button asChild className="min-h-11 bg-[#174e57]"><Link to="/services"><ShieldCheck className="me-2 h-4 w-4" />{he ? 'השירותים הזמינים כעת' : 'Services available now'}</Link></Button></div></div></section></main><Footer /></PublicSite>;
}
