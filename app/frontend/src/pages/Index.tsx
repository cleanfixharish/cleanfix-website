import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  Sparkles,
  Wrench,
  Thermometer,
  Wind,
  KeyRound,
  ArrowRight,
  Shield,
  Clock,
  BadgeCheck,
  Heart,
} from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';
import { cleanfixApi } from '@/lib/cleanfixApi';

type ContentBlock = { title_en?: string; title_he?: string; content_en?: string; content_he?: string; is_active?: boolean };

const serviceIcons: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-6 w-6" />,
  wrench: <Wrench className="h-6 w-6" />,
  thermometer: <Thermometer className="h-6 w-6" />,
  wind: <Wind className="h-6 w-6" />,
  key: <KeyRound className="h-6 w-6" />,
};

const services = [
  { icon: 'wrench', name_en: 'Handyman', name_he: 'הנדימן', desc_en: 'Small repairs, installations, mounting, adjustments, and practical apartment fixes.', desc_he: 'תיקונים קטנים, התקנות, תלייה, התאמות ועבודות מעשיות בדירה.', featured: true },
  { icon: 'sparkles', name_en: 'Post-renovation cleaning', name_he: 'ניקיון אחרי שיפוץ', desc_en: 'Detailed dust and surface cleaning that helps the home feel truly finished.', desc_he: 'ניקוי יסודי של אבק ומשטחים, כדי שהבית ירגיש באמת מוכן.' },
  { icon: 'key', name_en: 'Move-in & move-out cleaning', name_he: 'ניקיון כניסה ויציאה', desc_en: 'A clean reset before entering a home or handing it over.', desc_he: 'התחלה נקייה לפני כניסה לבית או מסירה שלו.' },
  { icon: 'thermometer', name_en: 'AC cleaning', name_he: 'ניקוי מזגנים', desc_en: 'Practical cleaning for a fresher, more comfortable home environment.', desc_he: 'ניקוי מעשי לסביבה ביתית רעננה ונעימה יותר.' },
  { icon: 'wind', name_en: 'Window cleaning', name_he: 'ניקוי חלונות', desc_en: 'Glass, frames, and tracks cleaned for a brighter, more polished space.', desc_he: 'ניקוי זכוכית, מסגרות ומסילות לחלל בהיר ומטופח יותר.' },
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
      <section className="relative overflow-hidden bg-[#f3efe7]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Text - ~38% */}
            <div className="lg:col-span-2">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#0f514b]">
                {t.hero.eyebrow}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-tight mb-5 text-foreground">
                {cmsValue('hero', 'title', t.hero.title)}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                {cmsValue('hero', 'content', t.hero.subtitle)}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/quote">
                  <Button size="lg" className="gap-2 text-base shadow-sm">
                    {t.hero.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 text-base border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5">
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
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/assets/images/hero-home-services-trust.png"
                  alt="Professional home services"
                  className="w-full h-64 md:h-[420px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-[#fbfaf7]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0f514b]">{t.services.eyebrow}</p>
            <h2 className="text-3xl font-bold mb-3">{t.services.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.services.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {services.map((service) => (
              <Card key={service.icon} className={`group hover:shadow-md transition-all duration-300 border-border/50 bg-white ${service.featured ? 'sm:col-span-2 lg:col-span-2 border-[#b79252]/50' : 'lg:col-span-1'}`}>
                <CardContent className="p-6 h-full flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#e4ece8] text-[#0f514b] flex items-center justify-center shrink-0 group-hover:bg-[#0f514b] group-hover:text-white transition-colors duration-300">
                    {serviceIcons[service.icon]}
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
      <section className="py-16 md:py-24 bg-[#e9eee9]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{cmsValue('how_it_works', 'title', t.howItWorks.title)}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t.howItWorks.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '1', title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, icon: <MessageCircle className="h-5 w-5" /> },
              { num: '2', title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, icon: <BadgeCheck className="h-5 w-5" /> },
              { num: '3', title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, icon: <Shield className="h-5 w-5" /> },
              { num: '4', title: t.howItWorks.step4Title, desc: t.howItWorks.step4Desc, icon: <Heart className="h-5 w-5" /> },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-white text-[#0f514b] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {step.icon}
                </div>
                <h3 className="font-semibold mb-2 text-sm">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-16 md:py-24 bg-background">
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
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/harish-city-aerial.png"
                alt="Harish community"
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#103d3a] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {lang === 'en' ? 'Tell us what needs attention.' : 'ספרו לנו במה צריך לטפל.'}
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            {lang === 'en'
              ? 'Send the service, your area in Harish, and photos if relevant. We will review the details and explain the next step.'
              : 'שלחו את סוג השירות, האזור בחריש ותמונות אם הן רלוונטיות. נבדוק את הפרטים ונסביר מה השלב הבא.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 text-base bg-[#f3efe7] text-[#103d3a] hover:bg-white">
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
