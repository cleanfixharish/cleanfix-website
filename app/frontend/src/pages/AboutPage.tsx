import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Shield, Users, MapPin, Heart } from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-20 bg-card">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.about.title}</h1>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t.about.description}
                </p>
              </div>
              <div className="rounded-xl overflow-hidden">
                <picture>
                  <source media="(max-width: 640px)" srcSet="/assets/images/home-support-v2/web/harish-city-aerial-v2-640.jpg" />
                  <source media="(max-width: 1100px)" srcSet="/assets/images/home-support-v2/web/harish-city-aerial-v2-960.jpg" />
                  <img src="/assets/images/home-support-v2/web/harish-city-aerial-v2-1536.jpg" alt="Aerial view of Harish, Israel" className="h-64 w-full object-cover md:h-80" loading="lazy" />
                </picture>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-20">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-10">
              {lang === 'en' ? 'Our Values' : 'הערכים שלנו'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    {v.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-card">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {lang === 'en' ? 'Ready to Experience the Difference?' : 'מוכנים לחוות את ההבדל?'}
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
        </section>
      </main>
      <Footer />
    </div>
  );
}
