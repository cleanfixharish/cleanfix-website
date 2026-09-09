import { Construction, Leaf, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LaunchStatusNotice() {
  const { t } = useLanguage();
  return (
    <aside className="border-y border-[#b8842f]/35 bg-[#fff8e8]" aria-labelledby="focused-launch-title">
      <div className="cf-shell grid gap-4 py-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <span className="cf-gold-icon flex h-12 w-12 items-center justify-center rounded-2xl"><Construction className="h-6 w-6 text-[#f0c96f]" /></span>
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#8a6428]">{t.launchStatus.eyebrow}</p><h2 id="focused-launch-title" className="mt-1 text-xl font-semibold text-[#173f46]">{t.launchStatus.title}</h2><p className="mt-1 text-sm leading-6 text-[#625b53]">{t.launchStatus.body}</p></div>
        <div className="flex items-start gap-2 rounded-xl bg-white/75 p-3 text-xs leading-5 text-[#526064]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#174e57]" /><span>{t.launchStatus.requestNote}</span></div>
      </div>
      <div className="cf-shell flex items-start gap-2 pb-5 text-sm text-[#625b53]"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-[#4f7b57]" /><span>{t.launchStatus.gardening}</span></div>
    </aside>
  );
}
