import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Crown, Heart, MessageCircle, Shield, UserRound } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { absoluteApiUrl, cleanfixApi } from '@/lib/cleanfixApi';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

type ContentBlock = {
  title_en?: string;
  title_he?: string;
  content_en?: string;
  content_he?: string;
  is_active?: boolean;
};

const fallbackServices = [
  { mark: '/assets/brand/v2/symbol-handyman.svg', name_en: 'Handyman', name_he: 'הנדימן', desc_en: 'Small repairs, mounting and practical apartment fixes.', desc_he: 'תיקונים קטנים, תלייה ועבודות מעשיות בדירה.', featured: true },
  { mark: '/assets/brand/v2/symbol-cleaning.svg', name_en: 'Post-renovation cleaning', name_he: 'ניקיון אחרי שיפוץ', desc_en: 'Detailed dust and surface cleaning that helps the home feel finished.', desc_he: 'ניקוי יסודי של אבק ומשטחים כדי שהבית ירגיש מוכן.' },
  { mark: '/assets/brand/v2/symbol-access.svg', name_en: 'Move-in & move-out cleaning', name_he: 'ניקיון כניסה ויציאה', desc_en: 'A clean reset before entering or handing over a home.', desc_he: 'התחלה נקייה לפני כניסה לבית או מסירה שלו.' },
  { mark: '/assets/brand/v2/symbol-ac.svg', name_en: 'AC cleaning', name_he: 'ניקוי מזגנים', desc_en: 'Practical cleaning for a fresher home environment.', desc_he: 'ניקוי מעשי לסביבה ביתית רעננה יותר.' },
  { mark: '/assets/brand/v2/symbol-window.svg', name_en: 'Window cleaning', name_he: 'ניקוי חלונות', desc_en: 'Glass, frames and tracks cleaned for a brighter space.', desc_he: 'ניקוי זכוכית, מסגרות ומסילות לחלל בהיר יותר.' },
];

const documentaryMoments = [
  { src: '/assets/images/cleanfix-documentary/coordinator-whatsapp.png', en: 'One responsible local coordinator', he: 'מתאם מקומי אחד שאחראי על התהליך', alt: 'CleanFixHarish coordinator reviewing a customer request at a desk' },
  { src: '/assets/images/cleanfix-documentary/handyman-shelf.png', en: 'Careful work in a lived-in home', he: 'עבודה זהירה בבית שחיים בו', alt: 'Handyman carefully mounting a shelf while protecting the floor' },
  { src: '/assets/images/cleanfix-documentary/completed-job-handoff.png', en: 'A clear handoff when the job is done', he: 'מסירה ברורה כשהעבודה הושלמה', alt: 'Homeowner and service provider reviewing completed work together' },
];

export default function Index() {
  const { t, lang } = useLanguage();
  const [cms, setCms] = useState<Record<string, ContentBlock>>({});
  const [site, setSite] = useState<any>({ primary_color: '#102E38', accent_color: '#B8842F', surface_color: '#F7F2EA', hero_layout: 'text-left', effects_mode: 'reduced' });
  const [liveServices, setLiveServices] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([cleanfixApi.listSiteContent(), cleanfixApi.getSiteSettings(), cleanfixApi.listServices()])
      .then(([result, settings, serviceResult]) => {
        const blocks = (result?.items || []).reduce((acc: Record<string, ContentBlock>, item: ContentBlock & { section_key: string }) => {
          if (item.is_active !== false) acc[item.section_key] = item;
          return acc;
        }, {});
        setCms(blocks);
        setSite(settings);
        setLiveServices((serviceResult?.items || []).filter((item: any) => item.is_active !== false));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.effects = site.effects_mode || 'reduced';
    return () => delete document.documentElement.dataset.effects;
  }, [site.effects_mode]);

  const cmsValue = (section: string, field: 'title' | 'content', fallback: string) => {
    const value = cms[section]?.[`${field}_${lang}` as keyof ContentBlock];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };
  const services = liveServices.length
    ? liveServices.map((item, index) => ({ ...item, mark: fallbackServices[index % fallbackServices.length].mark, desc_en: item.description_en, desc_he: item.description_he }))
    : fallbackServices;
  const primaryButton = (lang === 'en' ? site.primary_cta_en : site.primary_cta_he) || t.hero.cta;
  const secondaryButton = (lang === 'en' ? site.secondary_cta_en : site.secondary_cta_he) || t.hero.whatsapp;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <section className="relative overflow-hidden" style={{ backgroundColor: site.surface_color }}>
          <div className="absolute inset-0 bg-[url('/assets/brand/v2/ivory-golden-orbit.svg')] bg-cover bg-center opacity-70" aria-hidden="true" />
          <div className="cf-shell relative py-[55px] md:py-[89px]">
            <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)] lg:gap-[55px]">
              <div className={`relative z-10 ${site.hero_layout === 'image-left' ? 'lg:order-2' : ''}`}>
                <p className="cf-eyebrow mb-4">{t.hero.eyebrow}</p>
                <h1 className="mb-5 break-words text-4xl font-bold leading-[1.02] text-[#081f28] sm:text-5xl md:text-[3.8rem]">{cmsValue('hero', 'title', t.hero.title)}</h1>
                <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">{cmsValue('hero', 'content', t.hero.subtitle)}</p>
                <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:flex-wrap">
                  <Link to="/quote"><Button size="lg" className="w-full gap-2 text-white" style={{ backgroundColor: site.primary_color }}>{primaryButton}<ArrowRight className="h-4 w-4" /></Button></Link>
                  <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline" className="w-full gap-2 border-[#b8842f]/60 bg-[#f7f2ea]/80 text-[#102e38]"><MessageCircle className="h-5 w-5" />{secondaryButton}</Button></a>
                </div>
                <Link to="/account" className="mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-[#b8842f]/40 bg-[#fbf8f3]/80 p-3 text-[#102e38] no-underline shadow-sm">
                  <span className="cf-gold-icon flex h-11 w-11 items-center justify-center rounded-xl"><Crown className="h-5 w-5 text-[#f0c96f]" /></span>
                  <span className="flex-1"><strong className="block text-sm">Join CleanFixHarish VIP</strong><span className="block text-xs text-[#5d6b6d]">Create a customer or local-business account</span></span><UserRound className="h-5 w-5" />
                </Link>
              </div>
              <div className={`relative ${site.hero_layout === 'image-left' ? 'lg:order-1' : ''}`}>
                <div className="cf-photo overflow-hidden rounded-[34px] bg-[#102e38]">
                  <img src={site.hero_image_url ? absoluteApiUrl(site.hero_image_url) : '/assets/images/cleanfix-documentary/hero-managed-service.png'} alt="CleanFixHarish representative reviewing a service request with a Harish homeowner" className="h-72 w-full object-cover md:h-[500px]" fetchPriority="high" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 rounded-2xl border border-white/20 bg-[#102e38]/92 p-3 text-center text-[#f7f2ea] shadow-2xl backdrop-blur-md sm:left-auto sm:w-[360px]">
                  <div><strong className="block text-sm text-[#f0c96f]">WhatsApp</strong><span className="text-[10px] text-white/70">First response</span></div>
                  <div className="border-x border-white/15"><strong className="block text-sm text-[#f0c96f]">Harish</strong><span className="text-[10px] text-white/70">Local service</span></div>
                  <div><strong className="block text-sm text-[#f0c96f]">Clear</strong><span className="text-[10px] text-white/70">Next steps</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fbf8f3] py-[55px] md:py-[89px]">
          <div className="cf-shell">
            <div className="mb-12 text-center"><p className="cf-eyebrow mb-3">{t.services.eyebrow}</p><h2 className="mb-3 text-4xl font-bold text-[#081f28] md:text-5xl">{t.services.title}</h2><p className="mx-auto max-w-2xl text-muted-foreground">{t.services.subtitle}</p></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {services.slice(0, 5).map((service: any, index: number) => (
                <Card key={service.id || index} className={`group border-[#b8842f]/35 bg-[#f7f2ea] transition ${service.featured ? 'sm:col-span-2 lg:col-span-2' : 'lg:col-span-1'}`}>
                  <CardContent className="flex h-full flex-col gap-4 p-6"><div className="cf-gold-icon flex h-14 w-14 items-center justify-center rounded-2xl"><img src={service.mark} alt="" className="h-12 w-12" /></div><div><h3 className="font-medium">{lang === 'en' ? service.name_en : service.name_he}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lang === 'en' ? service.desc_en : service.desc_he}</p></div></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]">
          <div className="cf-shell"><div className="mb-10 max-w-2xl"><p className="cf-eyebrow mb-3">{lang === 'en' ? 'A managed local service' : 'שירות מקומי מנוהל'}</p><h2 className="text-4xl font-bold text-[#081f28]">{lang === 'en' ? 'From the first message to a checked result.' : 'מההודעה הראשונה ועד לתוצאה שנבדקה.'}</h2></div>
            <div className="grid gap-6 md:grid-cols-3">{documentaryMoments.map((moment) => <article key={moment.src} className="group overflow-hidden rounded-[24px] border border-[#b8842f]/25 bg-[#fbf8f3] shadow-sm"><div className="overflow-hidden"><img src={moment.src} alt={moment.alt} className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" loading="lazy" /></div><p className="p-5 text-lg font-semibold text-[#102e38]">{lang === 'en' ? moment.en : moment.he}</p></article>)}</div>
          </div>
        </section>

        <section className="cf-navy-panel py-[55px] md:py-[89px]">
          <div className="cf-shell"><div className="mb-12 text-center"><h2 className="mb-3 text-4xl font-bold text-[#f7f2ea] md:text-5xl">{cmsValue('how_it_works', 'title', t.howItWorks.title)}</h2><p className="text-[#e8d8be]">{t.howItWorks.subtitle}</p></div>
            <div className="grid gap-8 md:grid-cols-4">{[
              [t.howItWorks.step1Title, t.howItWorks.step1Desc, <MessageCircle className="h-5 w-5" />],
              [t.howItWorks.step2Title, t.howItWorks.step2Desc, <BadgeCheck className="h-5 w-5" />],
              [t.howItWorks.step3Title, t.howItWorks.step3Desc, <Shield className="h-5 w-5" />],
              [t.howItWorks.step4Title, t.howItWorks.step4Desc, <Heart className="h-5 w-5" />],
            ].map(([title, desc, icon], index) => <div key={index} className="text-center text-[#f7f2ea]"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#c49332]/65 bg-[#163f49] text-[#f0c96f]">{icon}</div><h3 className="mb-2 font-semibold">{title}</h3><p className="text-sm leading-relaxed text-[#e8d8be]/80">{desc}</p></div>)}</div>
          </div>
        </section>

        <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]"><div className="cf-shell grid items-center gap-12 lg:grid-cols-2"><div><h2 className="mb-3 text-3xl font-bold">{cmsValue('why_trust', 'title', t.whyTrust.title)}</h2><p className="mb-6 text-muted-foreground">{cmsValue('why_trust', 'content', t.whyTrust.subtitle)}</p><div className="space-y-4">{[t.whyTrust.point1, t.whyTrust.point2, t.whyTrust.point3, t.whyTrust.point4, t.whyTrust.point5, t.whyTrust.point6].map((point) => <div key={point} className="flex gap-3"><BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b8842f]" /><p className="text-sm">{point}</p></div>)}</div></div><div className="cf-photo overflow-hidden rounded-[24px]"><img src="/assets/images/cleanfix-documentary/post-renovation-cleaning.png" alt="Cleaning professional carefully removing renovation dust in a bright apartment" className="h-80 w-full object-cover md:h-96" loading="lazy" /></div></div></section>

        <section className="text-white" style={{ backgroundColor: site.primary_color }}><div className="cf-shell py-[55px] md:py-[89px]"><p className="cf-eyebrow">Local support</p><h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">{lang === 'en' ? 'Tell us what needs attention.' : 'ספרו לנו במה צריך לטפל.'}</h2><p className="mb-8 max-w-xl text-white/80">{lang === 'en' ? 'Send the service, your area and clear photos. We will review the details and explain the next step.' : 'שלחו את סוג השירות, האזור ותמונות ברורות. נבדוק את הפרטים ונסביר מה השלב הבא.'}</p><Link to="/quote"><Button size="lg" className="bg-[#e8d8be] text-[#102e38] hover:bg-[#f7f2ea]">{primaryButton}</Button></Link></div></section>
      </main>

      <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg" aria-label="Chat on WhatsApp"><MessageCircle className="h-7 w-7 text-white" /></a>
      <Footer />
    </div>
  );
}
