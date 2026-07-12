import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  Sparkles,
  Wrench,
  Zap,
  Paintbrush,
  Thermometer,
  Hammer,
  ArrowRight,
  Shield,
  Clock,
  BadgeCheck,
  Heart,
} from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

const serviceIcons: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-6 w-6" />,
  wrench: <Wrench className="h-6 w-6" />,
  zap: <Zap className="h-6 w-6" />,
  paintbrush: <Paintbrush className="h-6 w-6" />,
  thermometer: <Thermometer className="h-6 w-6" />,
  hammer: <Hammer className="h-6 w-6" />,
};

const services = [
  { icon: 'sparkles', name_en: 'Home Cleaning', name_he: 'ניקיון בתים' },
  { icon: 'wrench', name_en: 'Plumbing', name_he: 'אינסטלציה' },
  { icon: 'zap', name_en: 'Electrical Work', name_he: 'עבודות חשמל' },
  { icon: 'paintbrush', name_en: 'Painting', name_he: 'צביעה' },
  { icon: 'thermometer', name_en: 'AC Services', name_he: 'שירותי מיזוג' },
  { icon: 'hammer', name_en: 'Handyman', name_he: 'איש תחזוקה' },
];

export default function Index() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section - Golden Ratio Layout (38% text / 62% image) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50/30 to-green-50/20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Text - ~38% */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-tight mb-5 text-foreground">
                {t.hero.title}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                {t.hero.subtitle}
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
            </div>
            {/* Image - ~62% */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://mgx-backend-cdn.metadl.com/generate/images/575787/2026-07-08/scx2evqcaizq/hero-home-services-trust.png"
                  alt="Professional home services"
                  className="w-full h-64 md:h-[420px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{t.services.title}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t.services.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <Card key={service.icon} className="group hover:shadow-sm transition-all duration-300 cursor-pointer border-border/40 bg-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {serviceIcons[service.icon]}
                  </div>
                  <div>
                    <h3 className="font-medium text-base text-foreground">
                      {lang === 'en' ? service.name_en : service.name_he}
                    </h3>
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
      <section className="py-16 md:py-24 bg-slate-50/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{t.howItWorks.title}</h2>
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
                <div className="w-12 h-12 rounded-full bg-green-50 text-accent flex items-center justify-center mx-auto mb-4">
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
              <h2 className="text-3xl font-bold mb-3">{t.whyTrust.title}</h2>
              <p className="text-muted-foreground mb-6">{t.whyTrust.subtitle}</p>
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
                src="https://mgx-backend-cdn.metadl.com/generate/images/575787/2026-07-08/scx2gmicaizq/harish-city-aerial.png"
                alt="Harish community"
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-sky-600 to-sky-700 text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {lang === 'en' ? 'Ready to Get Started?' : 'מוכנים להתחיל?'}
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            {lang === 'en'
              ? 'Contact us today for a free quote. No obligations, just honest service.'
              : 'צרו איתנו קשר היום להצעת מחיר חינם. ללא התחייבות, רק שירות כנה.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 text-base bg-white text-sky-700 hover:bg-white/90">
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