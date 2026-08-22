import { useLanguage } from '@/contexts/LanguageContext';
import DocumentaryImage from '@/components/DocumentaryImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, BadgeCheck, ShieldCheck, Star, Eye, Clock, Award } from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

export default function WhyTrustUsPage() {
  const { t, lang } = useLanguage();

  const trustPoints = lang === 'en'
    ? [
        { icon: <Eye className="h-6 w-6" />, title: 'No Fake Reviews', desc: 'We never post fake reviews or buy testimonials. Our reputation is built on real work.' },
        { icon: <ShieldCheck className="h-6 w-6" />, title: 'No Exaggerated Promises', desc: 'We tell you what we can do honestly. No bait-and-switch tactics.' },
        { icon: <Star className="h-6 w-6" />, title: 'Quality Workmanship', desc: 'Every job is done with care and attention to detail. We use quality materials.' },
        { icon: <BadgeCheck className="h-6 w-6" />, title: 'Local Professionals', desc: 'Our team and partners live in Harish. We are your neighbors.' },
        { icon: <Clock className="h-6 w-6" />, title: 'Fast Response', desc: 'We respond quickly because we understand your time matters.' },
        { icon: <Award className="h-6 w-6" />, title: 'We Stand Behind Our Work', desc: 'If something is not right, we come back and fix it. Period.' },
      ]
    : [
        { icon: <Eye className="h-6 w-6" />, title: 'בלי ביקורות מזויפות', desc: 'אנחנו אף פעם לא מפרסמים ביקורות מזויפות או קונים המלצות. המוניטין שלנו בנוי על עבודה אמיתית.' },
        { icon: <ShieldCheck className="h-6 w-6" />, title: 'בלי הבטחות מוגזמות', desc: 'אנחנו אומרים לכם מה אנחנו יכולים לעשות בכנות. בלי טקטיקות של פיתוי והחלפה.' },
        { icon: <Star className="h-6 w-6" />, title: 'עבודה איכותית', desc: 'כל עבודה נעשית בקפידה ותשומת לב לפרטים. אנחנו משתמשים בחומרים איכותיים.' },
        { icon: <BadgeCheck className="h-6 w-6" />, title: 'מקצוענים מקומיים', desc: 'הצוות והשותפים שלנו גרים בחריש. אנחנו השכנים שלכם.' },
        { icon: <Clock className="h-6 w-6" />, title: 'תגובה מהירה', desc: 'אנחנו מגיבים מהר כי אנחנו מבינים שהזמן שלכם חשוב.' },
        { icon: <Award className="h-6 w-6" />, title: 'אנחנו עומדים מאחורי העבודה', desc: 'אם משהו לא בסדר, אנחנו חוזרים ומתקנים. נקודה.' },
      ];

  return (
    <PublicSite>
      <Header />
      <main className="flex-1">
        <section className="bg-card py-16 md:py-20">
          <div className="cf-shell">
            <div className="public-grid grid min-w-0 items-center gap-10 lg:grid-cols-2">
              <div className="min-w-0 text-center lg:text-start">
                <h1 className="mb-3 text-3xl font-bold md:text-4xl">{t.whyTrust.title}</h1>
                <p className="mx-auto max-w-lg text-muted-foreground lg:mx-0">{t.whyTrust.subtitle}</p>
              </div>
              <div className="cf-photo min-w-0 overflow-hidden rounded-[24px]" style={{ aspectRatio: '3 / 2' }}>
                <DocumentaryImage id="ac-maintenance" lang={lang} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 560px" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="cf-shell">
            <div className="public-grid grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {trustPoints.map((point, i) => (
                <div key={i} className="flex min-w-0 gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {point.icon}
                  </div>
                  <div className="min-w-0">
                    <h2 className="mb-1 font-semibold">{point.title}</h2>
                    <p className="text-sm text-muted-foreground">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 rounded-2xl bg-card py-12 text-center">
              <h2 className="mb-4 text-2xl font-bold">
                {lang === 'en' ? 'Experience Honest Service' : 'חוו שירות כנה'}
              </h2>
              <div className="public-hero-actions flex flex-col justify-center gap-3 min-[430px]:flex-row min-[430px]:flex-wrap">
                <Link to="/quote" className="min-w-0">
                  <Button size="lg" className="w-full min-h-11 gap-2">
                    {t.hero.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer" className="min-w-0">
                  <Button size="lg" variant="outline" className="w-full min-h-11 gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
                    <MessageCircle className="h-5 w-5" />
                    {t.hero.whatsapp}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
