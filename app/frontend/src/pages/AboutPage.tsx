import { useLanguage } from '@/contexts/LanguageContext';
import DocumentaryImage from '@/components/DocumentaryImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Shield, Users, MapPin, Heart } from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';
import StoryMedia from '@/components/StoryMedia';

export default function AboutPage() {
  const { t, lang } = useLanguage();

  const values = lang === 'en'
    ? [
        { icon: <Shield className="h-6 w-6" />, title: 'Trust First', desc: 'No fake reviews, no exaggerated promises. Just honest service.' },
        { icon: <Heart className="h-6 w-6" />, title: 'Fair Pricing', desc: 'Transparent quotes with no hidden fees or surprises.' },
        { icon: <Users className="h-6 w-6" />, title: 'Local Team', desc: 'We live and work in Harish. Your neighbors are our team.' },
        { icon: <MapPin className="h-6 w-6" />, title: 'Community Focus', desc: 'Supporting local professionals and building trust in our community.' },
      ]
    : [
        { icon: <Shield className="h-6 w-6" />, title: 'אמון קודם', desc: 'בלי ביקורות מזויפות, בלי הבטחות מוגזמות. רק שירות כנה.' },
        { icon: <Heart className="h-6 w-6" />, title: 'מחיר הוגן', desc: 'הצעות מחיר שקופות ללא עלויות נסתרות או הפתעות.' },
        { icon: <Users className="h-6 w-6" />, title: 'צוות מקומי', desc: 'אנחנו גרים ועובדים בחריש. השכנים שלכם הם הצוות שלנו.' },
        { icon: <MapPin className="h-6 w-6" />, title: 'מיקוד קהילתי', desc: 'תמיכה במקצוענים מקומיים ובניית אמון בקהילה שלנו.' },
      ];

  return (
    <PublicSite>
      <Header />
      <main className="flex-1">
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
                  <DocumentaryImage id="move-in-window-cleaning" lang={lang} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 560px" />
                </div>
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

        <StoryMedia />

        <section className="bg-card py-12 md:py-16">
          <div className="cf-shell text-center">
            <h2 className="mb-4 text-2xl font-bold">
              {lang === 'en' ? 'Ready to Experience the Difference?' : 'מוכנים לחוות את ההבדל?'}
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
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
