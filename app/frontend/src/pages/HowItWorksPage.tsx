import { useLanguage } from '@/contexts/LanguageContext';
import DocumentaryImage from '@/components/DocumentaryImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  MessageCircle,
  MessageSquareLock,
  Send,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

export default function HowItWorksPage() {
  const { t, lang } = useLanguage();
  const he = lang === 'he';

  const steps = [
    { icon: <Send className="h-8 w-8" />, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { icon: <Users className="h-8 w-8" />, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { icon: <FileText className="h-8 w-8" />, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
    { icon: <CheckCircle className="h-8 w-8" />, title: t.howItWorks.step4Title, desc: t.howItWorks.step4Desc },
  ];

  const policies = [
    [MessageSquareLock, t.howItWorks.policyContactTitle, t.howItWorks.policyContactDesc],
    [WalletCards, t.howItWorks.policyPaymentTitle, t.howItWorks.policyPaymentDesc],
    [ShieldCheck, t.howItWorks.policyResolutionTitle, t.howItWorks.policyResolutionDesc],
  ] as const;

  const legalDocs = he
    ? [
        ['/legal/customer-service-terms-he.pdf', t.howItWorks.legalCustomerTerms],
        ['/legal/privacy-notice-he.pdf', t.howItWorks.legalPrivacyNotice],
        ['/legal/provider-principles-he.pdf', t.howItWorks.legalProviderPrinciples],
      ]
    : [
        ['/legal/customer-service-terms-en.pdf', t.howItWorks.legalCustomerTerms],
        ['/legal/privacy-notice-en.pdf', t.howItWorks.legalPrivacyNotice],
        ['/legal/provider-principles-en.pdf', t.howItWorks.legalProviderPrinciples],
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
                        {he ? `שלב ${i + 1}` : `Step ${i + 1}`}
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
                {he ? 'התחילו עכשיו — זה לוקח 30 שניות' : 'Start Now — It Takes 30 Seconds'}
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

        <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]">
          <div className="cf-shell grid gap-8 lg:grid-cols-[1fr_1.618fr]">
            <div>
              <p className="cf-eyebrow">{t.howItWorks.journeyEyebrow}</p>
              <div className="cf-gold-rule" />
              <h2 className="text-3xl text-[#102e38] md:text-5xl">{t.howItWorks.journeyTitle}</h2>
              <p className="mt-4 leading-7 text-[#617074]">{t.howItWorks.journeySubtitle}</p>
            </div>
            <ol className="space-y-3">
              {t.howItWorks.operationalSteps.map((step, index) => (
                <li key={step} className="flex items-center gap-4 rounded-2xl border border-[#d8d0c6] bg-[#fbf8f3] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#102e38] font-bold text-[#f0c96f]">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-[#324346]">{step}</span>
                  <CheckCircle2 className="ms-auto h-5 w-5 text-[#4f7b57]" />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-[#fbf8f3] py-[55px]">
          <div className="cf-shell grid gap-5 md:grid-cols-3">
            {policies.map(([Icon, title, copy]) => (
              <article key={title} className="rounded-[21px] border border-[#d8d0c6] bg-white p-6">
                <Icon className="h-7 w-7 text-[#a87520]" />
                <h2 className="mt-4 text-2xl text-[#102e38]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#617074]">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cf-ivory-orbit py-[55px] md:py-[89px]">
          <div className="cf-shell">
            <div className="mx-auto max-w-3xl text-center">
              <FileCheck2 className="mx-auto h-9 w-9 text-[#a87520]" />
              <h2 className="mt-4 text-3xl text-[#102e38] md:text-5xl">{t.howItWorks.legalTitle}</h2>
              <p className="mt-4 text-sm leading-6 text-[#617074]">{t.howItWorks.legalSubtitle}</p>
            </div>
            <div className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-3">
              {legalDocs.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  download
                  className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[#b8842f]/45 bg-[#fbf8f3] px-4 font-semibold text-[#174e57] shadow-sm hover:border-[#b8842f]"
                >
                  <Download className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-9 text-center">
              <Button asChild className="min-h-12 bg-[#102e38]">
                <Link to="/quote">
                  {t.howItWorks.serviceRequestCta}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
