import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ClipboardCheck, Heart, MessageCircle, Shield, UserRound } from 'lucide-react';
import DocumentaryImage from '@/components/DocumentaryImage';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PublicSite from '@/components/PublicSite';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { absoluteApiUrl, cleanfixApi } from '@/lib/cleanfixApi';
import { documentaryAssets, resolveServiceVisualKey, type DocumentaryId } from '@/lib/documentaryMedia';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

type ContentBlock = {
  title_en?: string;
  title_he?: string;
  content_en?: string;
  content_he?: string;
  is_active?: boolean;
};

const fallbackServices = [
  { id: 'handyman', mark: '/assets/brand/v2/symbol-handyman.svg', photo: 'handyman-shelf' as DocumentaryId, name_en: 'Handyman', name_he: 'הנדימן', desc_en: 'Small repairs, mounting and practical apartment fixes.', desc_he: 'תיקונים קטנים, תלייה ועבודות מעשיות בדירה.', featured: true },
  { id: 'post-renovation', mark: '/assets/brand/v2/symbol-cleaning.svg', photo: 'post-renovation-cleaning' as DocumentaryId, name_en: 'Post-renovation cleaning', name_he: 'ניקיון אחרי שיפוץ', desc_en: 'Detailed dust and surface cleaning that helps the home feel finished.', desc_he: 'ניקוי יסודי של אבק ומשטחים כדי שהבית ירגיש מוכן.' },
  { id: 'move', mark: '/assets/brand/v2/symbol-access.svg', photo: 'move-in-window-cleaning' as DocumentaryId, name_en: 'Move-in & move-out cleaning', name_he: 'ניקיון כניסה ויציאה', desc_en: 'A clean reset before entering or handing over a home.', desc_he: 'התחלה נקייה לפני כניסה לבית או מסירה שלו.' },
  { id: 'ac', mark: '/assets/brand/v2/symbol-ac.svg', photo: 'ac-maintenance' as DocumentaryId, name_en: 'AC cleaning', name_he: 'ניקוי מזגנים', desc_en: 'Practical cleaning for a fresher home environment.', desc_he: 'ניקוי מעשי לסביבה ביתית רעננה יותר.' },
  { id: 'windows', mark: '/assets/brand/v2/symbol-window.svg', photo: 'move-in-window-cleaning' as DocumentaryId, name_en: 'Window cleaning', name_he: 'ניקוי חלונות', desc_en: 'Glass, frames and tracks cleaned for a brighter space.', desc_he: 'ניקוי זכוכית, מסגרות ומסילות לחלל בהיר יותר.' },
];

const documentaryMoments: Array<{ id: DocumentaryId; en: string; he: string }> = [
  { id: 'handyman-shelf', en: 'Careful work in a lived-in home', he: 'עבודה זהירה בבית שחיים בו' },
  { id: 'post-renovation-cleaning', en: 'A finished home after the dust is gone', he: 'בית מוכן אחרי שהאבק יורד' },
  { id: 'move-in-window-cleaning', en: 'A clear reset before keys change hands', he: 'איפוס ברור לפני החלפת מפתחות' },
];

function readableTextColor(background: string) {
  const hex = background.trim().replace('#', '');
  if (!/^[\da-f]{6}$/i.test(hex)) return '#081f28';
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const luminance = channels
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const contrastWithNavy = (luminance + 0.05) / 0.063;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithNavy >= contrastWithWhite ? '#081f28' : '#ffffff';
}

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
    return () => {
      delete document.documentElement.dataset.effects;
    };
  }, [site.effects_mode]);

  const cmsValue = (section: string, field: 'title' | 'content', fallback: string) => {
    const value = cms[section]?.[`${field}_${lang}` as keyof ContentBlock];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };
  const services = liveServices.length
    ? liveServices.map((item, index) => {
        const visualKey = resolveServiceVisualKey(item);
        const fallback = fallbackServices.find((service) => service.id === visualKey) || fallbackServices[index % fallbackServices.length];
        return { ...fallback, ...item, mark: fallback.mark, photo: fallback.photo, desc_en: item.description_en, desc_he: item.description_he };
      })
    : fallbackServices;
  const primaryButton = (lang === 'en' ? site.primary_cta_en : site.primary_cta_he) || t.hero.cta;
  const secondaryButton = (lang === 'en' ? site.secondary_cta_en : site.secondary_cta_he) || t.hero.whatsapp;
  const hero = documentaryAssets['hero-managed-service'];
  const primaryTextColor = readableTextColor(site.primary_color || '#102E38');

  return (
    <PublicSite>
      <Header />
      <main>
        <section className="relative overflow-hidden" style={{ backgroundColor: site.surface_color }}>
          <div className="absolute inset-0 bg-[url('/assets/brand/v2/ivory-golden-orbit.svg')] bg-cover bg-center opacity-70" aria-hidden="true" />
          <div className="cf-shell relative py-[55px] md:py-[89px]">
            <div className="public-grid public-hero-grid grid min-w-0 items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)] lg:gap-[55px]">
              <div className={`relative z-10 min-w-0 ${site.hero_layout === 'image-left' ? 'lg:order-2' : ''}`}>
                <p className="cf-eyebrow mb-4">{t.hero.eyebrow}</p>
                <h1 className="mb-5 break-words text-4xl font-bold leading-[1.02] text-[#081f28] sm:text-5xl md:text-[3.8rem]">{cmsValue('hero', 'title', t.hero.title)}</h1>
                <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">{cmsValue('hero', 'content', t.hero.subtitle)}</p>
                <div className="public-hero-actions flex flex-col gap-3 min-[430px]:flex-row min-[430px]:flex-wrap">
                  <Link to="/quote" className="min-w-0"><Button size="lg" className="w-full min-h-11 gap-2" style={{ backgroundColor: site.primary_color, color: primaryTextColor }}>{primaryButton}<ArrowRight className="h-4 w-4 rtl-flip" /></Button></Link>
                  <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer" className="min-w-0"><Button size="lg" variant="outline" className="w-full min-h-11 gap-2 border-[#b8842f]/60 bg-[#f7f2ea]/80 text-[#102e38]"><MessageCircle className="h-5 w-5" />{secondaryButton}</Button></a>
                </div>
                <Link to="/account" className="mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-[#b8842f]/40 bg-[#fbf8f3]/80 p-3 text-[#102e38] no-underline shadow-sm">
                  <span className="cf-gold-icon flex h-11 w-11 items-center justify-center rounded-xl"><ClipboardCheck className="h-5 w-5 text-[#f0c96f]" /></span>
                  <span className="min-w-0 flex-1"><strong className="block text-sm">{t.home.vipTitle}</strong><span className="block text-xs text-[#5d6b6d]">{t.home.vipSubtitle}</span></span><UserRound className="h-5 w-5 shrink-0" />
                </Link>
              </div>
              <div className={`relative min-w-0 ${site.hero_layout === 'image-left' ? 'lg:order-1' : ''}`}>
                <div className="cf-photo overflow-hidden rounded-[34px] bg-[#102e38]" style={{ aspectRatio: `${hero.width} / ${hero.height}` }}>
                  {site.hero_image_url ? (
                    <img src={absoluteApiUrl(site.hero_image_url)} alt={lang === 'he' ? hero.altHe : hero.altEn} width={hero.width} height={hero.height} className="h-full w-full object-cover" fetchPriority="high" />
                  ) : (
                    <DocumentaryImage id="hero-managed-service" lang={lang} priority sizes="(max-width: 640px) 100vw, (max-width: 1100px) 92vw, 720px" />
                  )}
                </div>
                <div className="public-hero-stats mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-[#102e38]/10 bg-[#102e38] p-3 text-center text-[#f7f2ea] sm:absolute sm:bottom-4 sm:left-4 sm:right-4 sm:mt-0 sm:border-white/20 sm:bg-[#102e38]/92 sm:shadow-2xl sm:backdrop-blur-md lg:left-auto lg:w-[360px]">
                  <div className="min-w-0"><strong className="block text-sm text-[#f0c96f]">{t.home.whatsappLabel}</strong><span className="text-xs text-white/70">{t.home.firstResponse}</span></div>
                  <div className="min-w-0 border-x border-white/15"><strong className="block text-sm text-[#f0c96f]">{t.home.harishLabel}</strong><span className="text-xs text-white/70">{t.home.localService}</span></div>
                  <div className="min-w-0"><strong className="block text-sm text-[#f0c96f]">{t.home.clearLabel}</strong><span className="text-xs text-white/70">{t.home.nextSteps}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fbf8f3] py-[55px] md:py-[89px]">
          <div className="cf-shell">
            <div className="mb-12 text-center"><p className="cf-eyebrow mb-3">{t.services.eyebrow}</p><h2 className="mb-3 text-4xl font-bold text-[#081f28] md:text-5xl">{t.services.title}</h2><p className="mx-auto max-w-2xl text-muted-foreground">{t.services.subtitle}</p></div>
            <div className="public-grid public-services-grid grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {services.slice(0, 5).map((service: any, index: number) => (
                <Card key={service.id || index} className={`cf-visual-card group min-w-0 overflow-hidden border-[#b8842f]/35 bg-[#f7f2ea] transition ${service.featured ? 'sm:col-span-2 lg:col-span-2' : 'lg:col-span-1'}`}>
                  <div className="cf-media-frame aspect-[3/2] overflow-hidden bg-[#102e38]/10">
                    <DocumentaryImage id={service.photo} lang={lang} className="cf-media-image" sizes={service.featured ? '(max-width: 640px) 100vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 20vw'} />
                  </div>
                  <CardContent className="flex h-full flex-col gap-4 p-6"><div className="cf-gold-icon flex h-14 w-14 items-center justify-center rounded-2xl"><img src={service.mark} alt="" width={48} height={48} className="h-12 w-12" /></div><div><h3 className="font-medium">{lang === 'en' ? service.name_en : service.name_he}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lang === 'en' ? service.desc_en : service.desc_he}</p></div></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]">
          <div className="cf-shell"><div className="mb-10 max-w-2xl"><p className="cf-eyebrow mb-3">{t.home.managedService}</p><h2 className="text-4xl font-bold text-[#081f28]">{t.home.managedTitle}</h2></div>
            <div className="public-grid public-moments-grid grid min-w-0 gap-6 md:grid-cols-3">{documentaryMoments.map((moment) => <article key={moment.id} className="group min-w-0 overflow-hidden rounded-[24px] border border-[#b8842f]/25 bg-[#fbf8f3] shadow-sm"><div className="aspect-[3/2] overflow-hidden"><DocumentaryImage id={moment.id} lang={lang} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 33vw" /></div><p className="p-5 text-lg font-semibold text-[#102e38]">{lang === 'en' ? moment.en : moment.he}</p></article>)}</div>
          </div>
        </section>

        <section className="cf-navy-panel py-[55px] md:py-[89px]">
          <div className="cf-shell"><div className="mb-12 text-center"><h2 className="mb-3 text-4xl font-bold text-[#f7f2ea] md:text-5xl">{cmsValue('how_it_works', 'title', t.howItWorks.title)}</h2><p className="text-[#e8d8be]">{t.howItWorks.subtitle}</p></div>
            <div className="public-grid public-process-grid grid min-w-0 gap-8 md:grid-cols-4">{[
              [t.howItWorks.step1Title, t.howItWorks.step1Desc, <MessageCircle className="h-5 w-5" />],
              [t.howItWorks.step2Title, t.howItWorks.step2Desc, <BadgeCheck className="h-5 w-5" />],
              [t.howItWorks.step3Title, t.howItWorks.step3Desc, <Shield className="h-5 w-5" />],
              [t.howItWorks.step4Title, t.howItWorks.step4Desc, <Heart className="h-5 w-5" />],
            ].map(([title, desc, icon], index) => <div key={index} className="min-w-0 text-center text-[#f7f2ea]"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#c49332]/65 bg-[#163f49] text-[#f0c96f]">{icon}</div><h3 className="mb-2 font-semibold">{title}</h3><p className="text-sm leading-relaxed text-[#e8d8be]/80">{desc}</p></div>)}</div>
          </div>
        </section>

        <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]">
          <div className="public-grid public-trust-grid cf-shell grid min-w-0 items-center gap-12 lg:grid-cols-2">
            <div className="min-w-0">
              <h2 className="mb-3 text-3xl font-bold">{cmsValue('why_trust', 'title', t.whyTrust.title)}</h2>
              <p className="mb-6 text-muted-foreground">{cmsValue('why_trust', 'content', t.whyTrust.subtitle)}</p>
              <div className="space-y-4">{[t.whyTrust.point1, t.whyTrust.point2, t.whyTrust.point3, t.whyTrust.point4, t.whyTrust.point5, t.whyTrust.point6].map((point) => <div key={point} className="flex gap-3"><BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b8842f]" /><p className="text-sm">{point}</p></div>)}</div>
            </div>
            <div className="cf-photo min-w-0 overflow-hidden rounded-[24px]" style={{ aspectRatio: '3 / 2' }}>
              <DocumentaryImage id="post-renovation-cleaning" lang={lang} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 560px" />
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: site.primary_color, color: primaryTextColor }}><div className="cf-shell py-[55px] md:py-[89px]"><p className="cf-eyebrow" style={{ color: primaryTextColor }}>{t.home.localSupport}</p><h2 className="mb-4 text-4xl font-bold md:text-5xl">{t.home.ctaTitle}</h2><p className="mb-8 max-w-xl">{t.home.ctaSubtitle}</p><Link to="/quote"><Button size="lg" className="min-h-11 bg-[#e8d8be] text-[#102e38] hover:bg-[#f7f2ea]">{primaryButton}</Button></Link></div></section>
      </main>

      <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-4 z-50 flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 font-semibold text-[#0b2815] shadow-lg" aria-label={`${t.hero.whatsapp} — WhatsApp`}><MessageCircle className="h-6 w-6" /><span className="text-sm">{t.hero.whatsapp}</span></a>
      <Footer />
    </PublicSite>
  );
}
