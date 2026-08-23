import { useLanguage } from '@/contexts/LanguageContext';
import DocumentaryImage from '@/components/DocumentaryImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Send, Users, FileText, CheckCircle } from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

export default function HowItWorksPage() {
  const { t, lang } = useLanguage();

  const steps = [
    { icon: <Send className="h-8 w-8" />, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { icon: <Users className="h-8 w-8" />, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { icon: <FileText className="h-8 w-8" />, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
    { icon: <CheckCircle className="h-8 w-8" />, title: t.howItWorks.step4Title, desc: t.howItWorks.step4Desc },
  ];

  return (
    <PublicSite>
      <Header />
      <main className="flex-1">
        <section className="bg-card py-16 md:py-20">
          <div className="cf-shell">
            <div className="public-grid grid min-w-0 items-center gap-10 lg:grid-cols-2">
              <div className="min-w-0 text-center lg:text-start">
                <h1 className="mb-3 text-3xl font-bold md:text-4xl">{t.howItWorks.title}</h1>
                <p className="mx-auto max-w-lg text-muted-foreground lg:mx-0">{t.howItWorks.subtitle}</p>
              </div>
              <div className="cf-photo cf-media-reveal min-w-0 overflow-hidden rounded-[24px]" style={{ aspectRatio: '3 / 2' }}>
                <DocumentaryImage id="service-journey" lang={lang} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 560px" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="cf-shell">
            <div className="mx-auto max-w-2xl space-y-12">
              {steps.map((step, i) => (
                <div key={i} className="cf-process-step flex min-w-0 items-start gap-6 rounded-[21px] border border-[#b8842f]/20 bg-[#fbf8f3] p-5 shadow-sm">
                  <div className="shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {step.icon}
                    </div>
                  </div>
                  <div className="min-w-0 pt-2">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        {lang === 'en' ? `Step ${i + 1}` : `שלב ${i + 1}`}
                      </span>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold">{step.title}</h2>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <h2 className="mb-4 text-2xl font-bold">
                {lang === 'en' ? 'Start Now — It Takes 30 Seconds' : 'התחילו עכשיו — זה לוקח 30 שניות'}
              </h2>
              <div className="public-hero-actions flex flex-col justify-center gap-3 min-[430px]:flex-row min-[430px]:flex-wrap">
                <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer" className="min-w-0">
                  <Button size="lg" className="w-full min-h-11 gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]">
                    <MessageCircle className="h-5 w-5" />
                    {t.hero.whatsapp}
                  </Button>
                </a>
                <Link to="/quote" className="min-w-0">
                  <Button size="lg" variant="outline" className="w-full min-h-11 gap-2">
                    {t.hero.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
