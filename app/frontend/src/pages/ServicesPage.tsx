import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Sparkles, Wrench, Zap, Paintbrush, Thermometer, Hammer } from 'lucide-react';
import { getWhatsAppServiceLink } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';

const serviceIcons: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-8 w-8" />,
  wrench: <Wrench className="h-8 w-8" />,
  zap: <Zap className="h-8 w-8" />,
  paintbrush: <Paintbrush className="h-8 w-8" />,
  thermometer: <Thermometer className="h-8 w-8" />,
  hammer: <Hammer className="h-8 w-8" />,
};

const services = [
  { icon: 'sparkles', name_en: 'Home Cleaning', name_he: 'ניקיון בתים', desc_en: 'Professional deep cleaning for homes and apartments. Thorough, reliable, and affordable.', desc_he: 'ניקיון יסודי ומקצועי לבתים ודירות. יסודי, אמין ובמחיר הוגן.' },
  { icon: 'wrench', name_en: 'Plumbing', name_he: 'אינסטלציה', desc_en: 'Expert plumbing repairs and installations. Fast response, fair pricing.', desc_he: 'תיקוני אינסטלציה והתקנות מקצועיות. תגובה מהירה, מחיר הוגן.' },
  { icon: 'zap', name_en: 'Electrical Work', name_he: 'עבודות חשמל', desc_en: 'Licensed electricians for all electrical needs. Safe, certified, and professional.', desc_he: 'חשמלאים מוסמכים לכל צורכי החשמל. בטוח, מוסמך ומקצועי.' },
  { icon: 'paintbrush', name_en: 'Painting', name_he: 'צביעה', desc_en: 'Interior and exterior painting services. Clean work, quality materials.', desc_he: 'שירותי צביעה פנימית וחיצונית. עבודה נקייה, חומרים איכותיים.' },
  { icon: 'thermometer', name_en: 'AC Services', name_he: 'שירותי מיזוג', desc_en: 'Air conditioning installation, repair, and maintenance.', desc_he: 'התקנה, תיקון ותחזוקה של מערכות מיזוג אוויר.' },
  { icon: 'hammer', name_en: 'Handyman', name_he: 'איש תחזוקה', desc_en: 'General repairs, assembly, and maintenance for your home.', desc_he: 'תיקונים כלליים, הרכבות ותחזוקה לבית שלך.' },
];

export default function ServicesPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-20 bg-card">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.services.title}</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">{t.services.subtitle}</p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 md:py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.icon} className="group hover:shadow-md transition-all duration-200 border-border/50">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      {serviceIcons[service.icon]}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {lang === 'en' ? service.name_en : service.name_he}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {lang === 'en' ? service.desc_en : service.desc_he}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={getWhatsAppServiceLink(lang === 'en' ? service.name_en : service.name_he, lang)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="gap-1.5 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </Button>
                      </a>
                      <Link to="/quote">
                        <Button size="sm" variant="secondary">
                          {t.nav.getQuote}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Image Section */}
        <section className="py-12">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl overflow-hidden">
              <img
                src="/assets/images/service-cleaning-professional.png"
                alt="Professional cleaning"
                className="w-full h-64 object-cover rounded-xl"
              />
              <img
                src="/assets/images/service-repair-handyman.png"
                alt="Professional repairs"
                className="w-full h-64 object-cover rounded-xl"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
