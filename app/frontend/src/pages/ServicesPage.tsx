import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { getWhatsAppServiceLink } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';

const services = [
  { id: 'handyman', mark: '/assets/brand/v2/symbol-handyman.svg', image: 'service-handyman-v2', name_en: 'Handyman services', name_he: 'שירותי הנדימן', desc_en: 'Practical repairs, mounting, assembly, installations and adjustments—handled carefully and clearly.', desc_he: 'תיקונים מעשיים, תלייה, הרכבה, התקנות והתאמות—בעבודה זהירה וברורה.', priority: true },
  { id: 'post-renovation', mark: '/assets/brand/v2/symbol-cleaning.svg', image: 'service-post-renovation-cleaning-v2', name_en: 'Post-renovation cleaning', name_he: 'ניקיון אחרי שיפוץ', desc_en: 'Detailed removal of construction dust and residue so the finished home can finally feel ready.', desc_he: 'ניקוי יסודי של אבק ושאריות בנייה, כדי שהבית המשופץ ירגיש מוכן באמת.' },
  { id: 'move', mark: '/assets/brand/v2/symbol-access.svg', image: 'service-move-cleaning-v2', name_en: 'Move-in & move-out cleaning', name_he: 'ניקיון כניסה ויציאה', desc_en: 'A thorough reset before receiving the key, moving in, or handing the property over.', desc_he: 'ניקיון יסודי לפני קבלת מפתח, כניסה לבית או מסירת הנכס.' },
  { id: 'ac', mark: '/assets/brand/v2/symbol-ac.svg', image: 'service-ac-cleaning-v2', name_en: 'AC cleaning', name_he: 'ניקוי מזגנים', desc_en: 'Careful cleaning for fresher airflow and a more comfortable home environment.', desc_he: 'ניקוי זהיר לזרימת אוויר רעננה יותר ולסביבה ביתית נעימה.' },
  { id: 'windows', mark: '/assets/brand/v2/symbol-window.svg', image: 'service-window-cleaning-v2', name_en: 'Window cleaning', name_he: 'ניקוי חלונות', desc_en: 'Glass, frames and tracks cleaned for brighter rooms and a polished finish.', desc_he: 'ניקוי זכוכית, מסגרות ומסילות לחדרים בהירים ולגימור מוקפד.' },
  { id: 'home-cleaning', mark: '/assets/brand/v2/symbol-cleaning.svg', image: 'service-home-cleaning-v2', name_en: 'Home cleaning', name_he: 'ניקיון בתים', desc_en: 'Reliable, well-organized cleaning for homes that need careful ongoing attention.', desc_he: 'ניקיון אמין ומסודר לבתים שזקוקים לטיפול שוטף ומוקפד.' },
];

export default function ServicesPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="cf-navy-panel py-[55px] md:py-[89px]">
          <div className="cf-shell text-center">
            <p className="cf-eyebrow">Home services in Harish</p>
            <div className="cf-gold-rule mx-auto" />
            <h1 className="mb-4 text-4xl font-bold text-[#f7f2ea] md:text-6xl">{t.services.title}</h1>
            <p className="mx-auto max-w-2xl text-[#e8d8be]">{t.services.subtitle}</p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]">
          <div className="cf-shell">
            <div className="grid grid-cols-1 gap-[21px] md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className={`group overflow-hidden border-[#b8842f]/40 bg-[#fbf8f3] transition duration-300 hover:-translate-y-1 hover:shadow-[0_21px_55px_rgba(8,31,40,.13)] ${service.priority ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                  <div className={`grid h-full ${service.priority ? 'md:grid-cols-[1.618fr_1fr]' : ''}`}>
                    <picture className="block min-h-[240px] overflow-hidden">
                      <source media="(max-width: 640px)" srcSet={`/assets/images/home-support-v2/web/${service.image}-384.jpg`} />
                      <img src={`/assets/images/home-support-v2/web/${service.image}-${service.priority ? '1024' : '640'}.jpg`} alt={lang === 'en' ? service.name_en : service.name_he} className="h-full min-h-[240px] w-full object-cover transition duration-500 group-hover:scale-[1.025]" loading="lazy" />
                    </picture>
                  <CardContent className="flex flex-col p-6">
                    <div className="cf-gold-icon mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
                      <img src={service.mark} alt="" className="h-12 w-12" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {lang === 'en' ? service.name_en : service.name_he}
                    </h3>
                    <p className="mb-5 flex-1 text-sm leading-6 text-muted-foreground">
                      {lang === 'en' ? service.desc_en : service.desc_he}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={getWhatsAppServiceLink(lang === 'en' ? service.name_en : service.name_he, lang)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="gap-1.5 bg-[#102e38] text-[#f7f2ea] hover:bg-[#163f49]">
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </Button>
                      </a>
                      <Link to="/quote">
                        <Button size="sm" variant="outline" className="gap-1 border-[#b8842f]/55">
                          {t.nav.getQuote}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
