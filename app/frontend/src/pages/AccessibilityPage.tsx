import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AccessibilityPage() {
  const { t } = useLanguage();
  const a = t.accessibility;
  return <PublicSite className="bg-[#F3EFE7] text-[#243538]"><Header/><main id="main-content" className="mx-auto max-w-3xl px-4 py-12 sm:py-16"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">{a.eyebrow}</p><h1 className="mt-3 text-4xl text-[#173F46]">{a.title}</h1><p className="mt-5 text-base leading-8 text-[#6F675F]">{a.intro}</p><Card className="mt-8 border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="space-y-7 p-6 sm:p-8"><Section title={a.toolsNow}><ul><li>{a.keyboard}</li><li>{a.direction}</li><li>{a.responsive}</li><li>{a.menu}</li><li>{a.labels}</li></ul></Section><Section title={a.needHelp}><p>{a.helpText}</p><p className="mt-3"><a href="tel:+972508275505" dir="ltr">050-827-5505</a><br/><a href="mailto:info@cleanfixharish.co.il" dir="ltr">info@cleanfixharish.co.il</a></p></Section><Section title={a.ongoing}><p>{a.ongoingText}</p></Section></CardContent></Card></main><Footer/></PublicSite>;
}

function Section({title,children}:{title:string;children:React.ReactNode}) { return <section><h2 className="font-sans text-lg font-semibold text-[#173F46]">{title}</h2><div className="mt-2 text-sm leading-7 text-[#625B53] [&_a]:font-medium [&_a]:text-[#174E57] [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:ps-5">{children}</div></section>; }
