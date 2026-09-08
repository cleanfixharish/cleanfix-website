import { useLanguage } from '@/contexts/LanguageContext';
import DocumentaryImage from '@/components/DocumentaryImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, BadgeCheck, ShieldCheck, FileCheck2, Eye, Clock, MapPin } from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

export default function WhyTrustUsPage() {
  const { t, lang } = useLanguage();

  const trustPoints = lang === 'en'
    ? [
        { icon: <Eye className="h-6 w-6" />, title: 'No invented proof', desc: 'We do not use fabricated reviews, providers or completed-job history.' },
        { icon: <ShieldCheck className="h-6 w-6" />, title: 'No Exaggerated Promises', desc: 'We tell you what we can do honestly. No bait-and-switch tactics.' },
        { icon: <FileCheck2 className="h-6 w-6" />, title: 'Written next step', desc: 'Availability, scope, price and booking are confirmed separately.' },
        { icon: <BadgeCheck className="h-6 w-6" />, title: 'Four current categories', desc: 'Handyman, cleaning, painting and AC cleaning stay within the focused launch.' },
        { icon: <Clock className="h-6 w-6" />, title: 'Careful review', desc: 'We review the request before making a timing or assignment commitment.' },
        { icon: <MapPin className="h-6 w-6" />, title: 'Gardening is separate', desc: 'One local gardener is available subject to written scope and availability.' },
      ]
    : [
        { icon: <Eye className="h-6 w-6" />, title: 'בלי הוכחות מומצאות', desc: 'איננו משתמשים בביקורות, בעלי מקצוע או היסטוריית עבודות שהומצאו.' },
        { icon: <ShieldCheck className="h-6 w-6" />, title: 'בלי הבטחות מוגזמות', desc: 'אנחנו אומרים לכם מה אנחנו יכולים לעשות בכנות. בלי טקטיקות של פיתוי והחלפה.' },
        { icon: <FileCheck2 className="h-6 w-6" />, title: 'השלב הבא בכתב', desc: 'זמינות, היקף, מחיר והזמנה מאושרים בנפרד.' },
        { icon: <BadgeCheck className="h-6 w-6" />, title: 'ארבע קטגוריות כעת', desc: 'הנדימן, ניקיון, צביעה וניקוי מזגנים נשארים בגבולות ההשקה הממוקדת.' },
        { icon: <Clock className="h-6 w-6" />, title: 'בדיקה זהירה', desc: 'אנחנו בודקים את הבקשה לפני התחייבות לזמן או לשיבוץ.' },
        { icon: <MapPin className="h-6 w-6" />, title: 'גינון בנפרד', desc: 'גנן מקומי אחד, בכפוף להיקף כתוב ולזמינות.' },
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
              <div className="min-w-0">
                <div className="cf-photo cf-media-reveal overflow-hidden rounded-[24px]" style={{ aspectRatio: '3 / 2' }}>
                  <DocumentaryImage id="quality-handover" lang={lang} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 560px" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{lang === 'he' ? 'תמונה להמחשה — לא עבודת לקוח שהושלמה על ידי CleanFixHarish.' : 'Illustrative image — not a completed CleanFixHarish customer job.'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="cf-shell">
            <div className="public-grid grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {trustPoints.map((point, i) => (
                <div key={i} className="cf-trust-card flex min-w-0 gap-4 rounded-[21px] border border-[#b8842f]/20 bg-[#fbf8f3] p-5 shadow-sm">
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
                {lang === 'en' ? 'Send a request for review' : 'שלחו בקשה לבדיקה'}
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
              <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">{lang === 'en' ? 'A request does not confirm availability, price, assignment or booking.' : 'בקשה אינה מאשרת זמינות, מחיר, שיבוץ או הזמנה.'}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
