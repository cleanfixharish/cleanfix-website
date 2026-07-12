import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-20 bg-card">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.whyTrust.title}</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">{t.whyTrust.subtitle}</p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trustPoints.map((point, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{point.title}</h3>
                    <p className="text-sm text-muted-foreground">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16 py-12 bg-card rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">
                {lang === 'en' ? 'Experience Honest Service' : 'חוו שירות כנה'}
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/quote">
                  <Button size="lg" className="gap-2">
                    {t.hero.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
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
    </div>
  );
}