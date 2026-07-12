import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-20 bg-card">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.howItWorks.title}</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">{t.howItWorks.subtitle}</p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-12">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {lang === 'en' ? `Step ${i + 1}` : `שלב ${i + 1}`}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <h2 className="text-2xl font-bold mb-4">
                {lang === 'en' ? 'Start Now — It Takes 30 Seconds' : 'התחילו עכשיו — זה לוקח 30 שניות'}
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white">
                    <MessageCircle className="h-5 w-5" />
                    {t.hero.whatsapp}
                  </Button>
                </a>
                <Link to="/quote">
                  <Button size="lg" variant="outline" className="gap-2">
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
    </div>
  );
}