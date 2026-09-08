import { useLanguage } from '@/contexts/LanguageContext';
import DocumentaryImage from '@/components/DocumentaryImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import LaunchStatusNotice from '@/components/LaunchStatusNotice';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Shield, Users, MapPin, Heart } from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

export default function AboutPage() {
  const { t, lang } = useLanguage();

  const values = lang === 'en'
    ? [
        { icon: <Shield className="h-6 w-6" />, title: 'Truth before promises', desc: 'We state what is available now and what is still being built.' },
        { icon: <Heart className="h-6 w-6" />, title: 'Written clarity', desc: 'Scope, availability and price are confirmed before a booking.' },
        { icon: <Users className="h-6 w-6" />, title: 'Focused launch', desc: 'We currently accept four CleanFix request categories—not every trade.' },
        { icon: <MapPin className="h-6 w-6" />, title: 'Harish first', desc: 'Requests are reviewed for homes in Harish through one local contact.' },
      ]
    : [
        { icon: <Shield className="h-6 w-6" />, title: 'אמת לפני הבטחות', desc: 'אנחנו מציינים מה זמין כעת ומה עדיין בבנייה.' },
        { icon: <Heart className="h-6 w-6" />, title: 'בהירות בכתב', desc: 'היקף, זמינות ומחיר מאושרים לפני הזמנה.' },
        { icon: <Users className="h-6 w-6" />, title: 'השקה ממוקדת', desc: 'אנחנו מקבלים כעת ארבע קטגוריות בקשה של CleanFix — לא כל תחום.' },
        { icon: <MapPin className="h-6 w-6" />, title: 'חריש תחילה', desc: 'בקשות לבתים בחריש נבדקות דרך איש קשר מקומי אחד.' },
      ];

  return (
    <PublicSite>
      <Header />
      <main className="flex-1">
        <LaunchStatusNotice />
        <section className="bg-card py-16 md:py-20">
          <div className="cf-shell">
            <div className="public-grid grid min-w-0 grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="min-w-0">
                <h1 className="mb-4 text-3xl font-bold md:text-4xl">{t.about.title}</h1>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {t.about.description}
                </p>
              </div>
              <div className="min-w-0 overflow-hidden rounded-xl">
                <div className="cf-photo overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
                  <DocumentaryImage id="service-journey" lang={lang} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 560px" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{lang === 'he' ? 'תמונה להמחשה — לא עבודת לקוח שהושלמה על ידי CleanFixHarish.' : 'Illustrative image — not a completed CleanFixHarish customer job.'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="cf-shell">
            <h2 className="mb-10 text-center text-2xl font-bold">
              {lang === 'en' ? 'Our Values' : 'הערכים שלנו'}
            </h2>
            <div className="public-grid grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <div key={i} className="min-w-0 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {v.icon}
                  </div>
                  <h3 className="mb-2 font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#e8efe9] py-12 md:py-16"><div className="cf-shell"><div className="mx-auto max-w-3xl text-center"><p className="cf-eyebrow">{lang === 'he' ? 'המודל היום' : 'The model today'}</p><h2 className="mt-2 text-3xl text-[#173f46]">{lang === 'he' ? 'קטן, ברור ובנוי להתרחב בזהירות.' : 'Small, clear and designed to expand carefully.'}</h2></div><div className="public-grid mt-8 grid gap-5 md:grid-cols-3">{(lang === 'he' ? [
          ['CleanFix', 'הנדימן, ניקיון, צביעה וניקוי מזגנים נבדקים דרך תהליך בקשה אחד.'],
          ['גינון נפרד', 'גנן מקומי אחד בלבד בשלב זה, בכפוף להיקף כתוב ולזמינות.'],
          ['בהמשך', 'רשת עסקים עצמאיים רחבה יותר בחריש עדיין לא הושקה.'],
        ] : [
          ['CleanFix', 'Handyman, cleaning, painting and AC-cleaning requests use one request process.'],
          ['Gardening separately', 'One local gardener only at this stage, subject to written scope and availability.'],
          ['Later', 'A wider independent Harish business network has not launched yet.'],
        ]).map(([title, copy]) => <article key={title} className="rounded-[21px] border border-[#b8842f]/25 bg-white p-6"><h3 className="text-xl font-semibold text-[#173f46]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#617074]">{copy}</p></article>)}</div></div></section>

        <section className="bg-card py-12 md:py-16">
          <div className="cf-shell text-center">
            <h2 className="mb-4 text-2xl font-bold">
              {lang === 'en' ? 'Tell us what needs attention.' : 'ספרו לנו במה צריך לטפל.'}
            </h2>
            <div className="public-hero-actions flex flex-col justify-center gap-3 min-[430px]:flex-row min-[430px]:flex-wrap">
              <Link to="/quote" className="min-w-0">
                <Button size="lg" className="w-full min-h-11 gap-2">
                  {t.hero.cta}
                  <ArrowRight className={`h-4 w-4 ${lang === 'he' ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
              <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer" className="min-w-0">
                <Button size="lg" variant="outline" className="w-full min-h-11 gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
                  <MessageCircle className="h-5 w-5" />
                  {t.hero.whatsapp}
                </Button>
              </a>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">{t.launchStatus.requestNote}</p>
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
