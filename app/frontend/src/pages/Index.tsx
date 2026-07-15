import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  ArrowRight,
  Shield,
  BadgeCheck,
  Heart,
} from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';
import { cleanfixApi } from '@/lib/cleanfixApi';

type ContentBlock = { title_en?: string; title_he?: string; content_en?: string; content_he?: string; is_active?: boolean };

const services = [
  { icon: 'wrench', mark: '/assets/brand/v2/symbol-handyman.svg', name_en: 'Handyman', name_he: 'הנדימן', desc_en: 'Small repairs, installations, mounting, adjustments, and practical apartment fixes.', desc_he: 'תיקונים קטנים, התקנות, תלייה, התאמות ועבודות מעשיות בדירה.', featured: true },
  { icon: 'sparkles', mark: '/assets/brand/v2/symbol-cleaning.svg', name_en: 'Post-renovation cleaning', name_he: 'ניקיון אחרי שיפוץ', desc_en: 'Detailed dust and surface cleaning that helps the home feel truly finished.', desc_he: 'ניקוי יסודי של אבק ומשטחים, כדי שהבית ירגיש באמת מוכן.' },
  { icon: 'key', mark: '/assets/brand/v2/symbol-access.svg', name_en: 'Move-in & move-out cleaning', name_he: 'ניקיון כניסה ויציאה', desc_en: 'A clean reset before entering a home or handing it over.', desc_he: 'התחלה נקייה לפני כניסה לבית או מסירה שלו.' },
  { icon: 'thermometer', mark: '/assets/brand/v2/symbol-ac.svg', name_en: 'AC cleaning', name_he: 'ניקוי מזגנים', desc_en: 'Practical cleaning for a fresher, more comfortable home environment.', desc_he: 'ניקוי מעשי לסביבה ביתית רעננה ונעימה יותר.' },
  { icon: 'wind', mark: '/assets/brand/v2/symbol-window.svg', name_en: 'Window cleaning', name_he: 'ניקוי חלונות', desc_en: 'Glass, frames, and tracks cleaned for a brighter, more polished space.', desc_he: 'ניקוי זכוכית, מסגרות ומסילות לחלל בהיר ומטופח יותר.' },
];

export default function Index() {
  const { t, lang } = useLanguage();
  const [cms, setCms] = useState<Record<string, ContentBlock>>({});

  useEffect(() => {
    cleanfixApi.listSiteContent().then((result) => {
      const blocks = (result?.items || []).reduce((acc: Record<string, ContentBlock>, item: ContentBlock & { section_key: string }) => {
        if (item.is_active !== false) acc[item.section_key] = item;
        return acc;
      }, {});
      setCms(blocks);
    }).catch(() => undefined);
  }, []);

  const cmsValue = (section: string, field: 'title' | 'content', fallback: string) => {
    const value = cms[section]?.[`${field}_${lang}` as keyof ContentBlock];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section - Golden Ratio Layout (38% text / 62% image) */}
      <section className="relative overflow-hidden bg-[#f7f2ea]">
        <div className="absolute inset-0 bg-[url('/assets/brand/v2/ivory-golden-orbit.svg')] bg-cover bg-center opacity-70" aria-hidden="true" />
        <div className="cf-shell relative py-[55px] md:py-[89px]">
          <div className="grid grid-cols-1 items-center gap-[34px] lg:grid-cols-[1fr_1.618fr] lg:gap-[55px]">
            {/* Text - ~38% */}
            <div className="lg:col-span-2">
              <p className="cf-eyebrow mb-4">
                {t.hero.eyebrow}
              </p>
              <h1 className="mb-5 text-4xl font-bold leading-[.98] text-[#081f28] sm:text-5xl md:text-[3.8rem]">
                {cmsValue('hero', 'title', t.hero.title)}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                {cmsValue('hero', 'content', t.hero.subtitle)}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/quote">
                  <Button size="lg" className="gap-2 bg-[#102e38] text-base shadow-lg hover:bg-[#163f49]">
                    {t.hero.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 border-[#b8842f]/60 bg-[#f7f2ea]/80 text-base text-[#102e38] hover:bg-[#e8d8be]">
                    <MessageCircle className="h-5 w-5" />
                    {t.hero.whatsapp}
                  </Button>
                </a>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                {t.hero.responseNote}
              </p>
            </div>
            {/* Image - ~62% */}
            <div className="lg:col-span-3">
              <div className="cf-photo overflow-hidden rounded-[34px] bg-[#102e38]">
                <picture>
                  <source media="(max-width: 640px)" srcSet="/assets/images/home-support-v2/web/hero-handyman-harish-v2-640.jpg" />
                  <source media="(max-width: 1100px)" srcSet="/assets/images/home-support-v2/web/hero-handyman-harish-v2-960.jpg" />
                  <img src="/assets/images/home-support-v2/web/hero-handyman-harish-v2-1536.jpg" alt="CleanFixHarish handyman helping in a local Harish home" className="h-72 w-full object-cover md:h-[500px]" fetchPriority="high" />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-[#fbf8f3] py-[55px] md:py-[89px]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="cf-eyebrow mb-3">{t.services.eyebrow}</p>
            <h2 className="mb-3 text-4xl font-bold text-[#081f28] md:text-5xl">{t.services.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.services.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {services.map((service) => (
              <Card key={service.icon} className={`group overflow-hidden border-[#b8842f]/35 bg-[#f7f2ea] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_21px_55px_rgba(8,31,40,.12)] ${service.featured ? 'sm:col-span-2 lg:col-span-2 border-[#b8842f]/65' : 'lg:col-span-1'}`}>
                <CardContent className="p-6 h-full flex flex-col gap-4">
                  <div className="cf-gold-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105">
                    <img src={service.mark} alt="" className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base text-foreground">
                      {lang === 'en' ? service.name_en : service.name_he}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {lang === 'en' ? service.desc_en : service.desc_he}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services">
              <Button variant="outline" className="gap-2 border-border/60">
                {t.services.viewAll}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="cf-navy-panel py-[55px] md:py-[89px]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-3 text-4xl font-bold text-[#f7f2ea] md:text-5xl">{cmsValue('how_it_works', 'title', t.howItWorks.title)}</h2>
            <p className="mx-auto max-w-md text-[#e8d8be]">{t.howItWorks.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '1', title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, icon: <MessageCircle className="h-5 w-5" /> },
              { num: '2', title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, icon: <BadgeCheck className="h-5 w-5" /> },
              { num: '3', title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, icon: <Shield className="h-5 w-5" /> },
              { num: '4', title: t.howItWorks.step4Title, desc: t.howItWorks.step4Desc, icon: <Heart className="h-5 w-5" /> },
            ].map((step) => (
              <div key={step.num} className="text-center text-[#f7f2ea]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#c49332]/65 bg-[#163f49] text-[#f0c96f] shadow-lg">
                  {step.icon}
                </div>
                <h3 className="font-semibold mb-2 text-sm">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#e8d8be]/80">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-3">{cmsValue('why_trust', 'title', t.whyTrust.title)}</h2>
              <p className="text-muted-foreground mb-6">{cmsValue('why_trust', 'content', t.whyTrust.subtitle)}</p>
              <div className="space-y-4">
                {[t.whyTrust.point1, t.whyTrust.point2, t.whyTrust.point3, t.whyTrust.point4, t.whyTrust.point5, t.whyTrust.point6].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <BadgeCheck className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="cf-photo overflow-hidden rounded-[21px]">
              <picture><source media="(max-width: 640px)" srcSet="/assets/images/home-support-v2/web/harish-city-aerial-v2-640.jpg"/><source media="(max-width: 1100px)" srcSet="/assets/images/home-support-v2/web/harish-city-aerial-v2-960.jpg"/><img src="/assets/images/home-support-v2/web/harish-city-aerial-v2-1536.jpg" alt="Aerial view of Harish, Israel" className="h-64 w-full object-cover md:h-96" loading="lazy"/></picture>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[#102e38] text-white">
        <div className="grid min-h-[430px] lg:grid-cols-[1.618fr_1fr]">
          <div className="flex items-center px-4 py-[55px] sm:px-8 lg:px-[89px]">
            <div className="max-w-xl">
          <p className="cf-eyebrow">Local support</p>
          <div className="cf-gold-rule" />
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            {lang === 'en' ? 'Tell us what needs attention.' : 'ספרו לנו במה צריך לטפל.'}
          </h2>
          <p className="mb-8 max-w-md text-white/80">
            {lang === 'en'
              ? 'Send the service, your area in Harish, and photos if relevant. We will review the details and explain the next step.'
              : 'שלחו את סוג השירות, האזור בחריש ותמונות אם הן רלוונטיות. נבדוק את הפרטים ונסביר מה השלב הבא.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-[#e8d8be] text-base text-[#102e38] hover:bg-[#f7f2ea]">
                <MessageCircle className="h-5 w-5" />
                {t.hero.whatsapp}
              </Button>
            </a>
            <Link to="/quote">
              <Button size="lg" variant="outline" className="gap-2 text-base border-white/40 text-white hover:bg-white/10">
                {t.hero.cta}
              </Button>
            </Link>
          </div>
            </div>
          </div>
          <picture className="min-h-[320px]"><source media="(max-width: 640px)" srcSet="/assets/images/home-support-v2/web/cta-local-support-v2-640.jpg"/><source media="(max-width: 1100px)" srcSet="/assets/images/home-support-v2/web/cta-local-support-v2-960.jpg"/><img src="/assets/images/home-support-v2/web/cta-local-support-v2-1536.jpg" alt="Harish homeowner receiving local service support" className="h-full w-full object-cover" loading="lazy"/></picture>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </a>

      <Footer />
    </div>
  );
}
