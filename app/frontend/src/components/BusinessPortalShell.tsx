import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LockKeyhole, Menu } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PortalNavItem = { href: string; labelEn: string; labelHe: string; icon: React.ElementType };

export default function BusinessPortalShell({ eyebrowEn, eyebrowHe, titleEn, titleHe, descriptionEn, descriptionHe, nav, children }: { eyebrowEn: string; eyebrowHe: string; titleEn: string; titleHe: string; descriptionEn: string; descriptionHe: string; nav: PortalNavItem[]; children: ReactNode }) {
  const { lang } = useLanguage(); const { pathname } = useLocation(); const he = lang === 'he'; const Arrow = he ? ArrowLeft : ArrowRight;
  return <PublicSite className="min-h-screen bg-[#eef1ed] text-[#163b43]"><Header /><main className="mx-auto max-w-7xl px-3 py-5 sm:px-5 sm:py-8"><section className="overflow-hidden rounded-[28px] bg-[#0d3038] text-white shadow-[0_24px_70px_rgba(8,31,40,.14)]"><div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e5bd65]">{he ? eyebrowHe : eyebrowEn}</p><Badge className="border border-white/20 bg-white/10 text-white hover:bg-white/10"><LockKeyhole className="me-1 h-3 w-3" />{he ? 'תצוגת סביבת עבודה' : 'Workspace preview'}</Badge></div><h1 className="mt-3 max-w-3xl text-3xl text-[#fff9ee] sm:text-4xl">{he ? titleHe : titleEn}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">{he ? descriptionHe : descriptionEn}</p></div><Button asChild variant="outline" className="min-h-11 w-fit border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/account">{he ? 'חזרה לחשבון' : 'Back to account'}<Arrow className="ms-2 h-4 w-4" /></Link></Button></div></section><div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><aside className="rounded-2xl border border-[#d9d7cf] bg-[#fbfaf7] p-2 lg:sticky lg:top-4 lg:h-fit"><div className="flex items-center gap-2 px-3 py-3 text-xs font-semibold uppercase tracking-[.16em] text-[#8f7345]"><Menu className="h-4 w-4" />{he ? 'מפת המערכת' : 'System map'}</div><nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible" aria-label={he ? 'מפת סביבת עבודה' : 'Workspace map'}>{nav.map(({ href, labelEn, labelHe, icon: Icon }) => { const active = pathname === href; return <Link key={href} to={href} aria-current={active ? 'page' : undefined} className={cn('flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium transition', active ? 'bg-[#dfeae6] text-[#0d4a51]' : 'text-[#5f6865] hover:bg-[#f0eee8] hover:text-[#173f46]')}><Icon className="h-4 w-4" />{he ? labelHe : labelEn}</Link>; })}</nav></aside><section className="min-w-0">{children}</section></div></main><Footer /></PublicSite>;
}
