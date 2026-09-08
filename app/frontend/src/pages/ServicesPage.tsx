import { useLanguage } from '@/contexts/LanguageContext';
import DocumentaryImage from '@/components/DocumentaryImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { getWhatsAppServiceLink } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';
import { type DocumentaryId } from '@/lib/documentaryMedia';
import LaunchStatusNotice from '@/components/LaunchStatusNotice';

const fallbackServices = [
  { id: 'handyman', mark: '/assets/brand/v2/symbol-handyman.svg', photo: 'handyman-shelf' as DocumentaryId, name_en: 'Handyman services', name_he: 'שירותי הנדימן', desc_en: 'Non-regulated mounting, assembly, minor repair and adjustment requests scoped before confirmation.', desc_he: 'בקשות לתלייה, הרכבה, תיקונים קלים והתאמות שאינן עבודות מוסדרות, ומוגדרות לפני אישור.', priority: true },
  { id: 'cleaning', mark: '/assets/brand/v2/symbol-cleaning.svg', photo: 'post-renovation-cleaning' as DocumentaryId, name_en: 'Cleaning', name_he: 'ניקיון', desc_en: 'Cleaning requests reviewed against the property, timing and written scope.', desc_he: 'בקשות ניקיון שנבדקות לפי הנכס, התזמון והיקף כתוב.' },
  { id: 'painting', mark: '/assets/brand/v2/symbol-handyman.svg', photo: 'handyman-shelf' as DocumentaryId, name_en: 'Painting', name_he: 'צביעה', desc_en: 'Interior painting requests scoped by area, preparation and finish.', desc_he: 'בקשות לצביעת פנים לפי שטח, הכנה וגימור.' },
  { id: 'ac', mark: '/assets/brand/v2/symbol-ac.svg', photo: 'ac-maintenance' as DocumentaryId, name_en: 'AC cleaning', name_he: 'ניקוי מזגנים', desc_en: 'AC-cleaning requests reviewed by unit, access and requested scope.', desc_he: 'בקשות לניקוי מזגנים שנבדקות לפי היחידה, הגישה וההיקף המבוקש.' },
];

export default function ServicesPage() {
  const { t, lang } = useLanguage();
  const services = fallbackServices;

  return (
    <PublicSite>
      <Header />
      <main className="flex-1">
        <LaunchStatusNotice />
        <section className="cf-navy-panel py-[55px] md:py-[89px]">
          <div className="cf-shell text-center">
            <p className="cf-eyebrow">{lang === 'he' ? 'שירותי בית בחריש' : 'Home services in Harish'}</p>
            <div className="cf-gold-rule mx-auto" />
            <h1 className="mb-4 text-4xl font-bold text-[#f7f2ea] md:text-6xl">{t.services.title}</h1>
            <p className="mx-auto max-w-2xl text-[#e8d8be]">{t.services.subtitle}</p>
          </div>
        </section>

        <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]">
          <div className="cf-shell">
            <div className="public-grid grid min-w-0 grid-cols-1 gap-[21px] md:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => (
                <Card key={service.id} className={`group min-w-0 overflow-hidden border-[#b8842f]/40 bg-[#fbf8f3] transition duration-300 hover:shadow-[0_21px_55px_rgba(8,31,40,.13)] ${service.priority ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                  <div className={`grid h-full min-w-0 ${service.priority ? 'md:grid-cols-[1.618fr_1fr]' : ''}`}>
                    <div className="relative aspect-[3/2] min-h-[240px] overflow-hidden bg-[#102e38]/10 md:aspect-auto md:h-full">
                      {service.id === 'painting' ? <div className="flex h-full items-center justify-center bg-[#e8d8be]"><img src={service.mark} alt="" className="h-24 w-24" /></div> : <DocumentaryImage id={service.photo} lang={lang} sizes={service.priority ? '(max-width: 640px) 100vw, 60vw' : '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw'} />}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081f28]/65 via-transparent to-transparent" />
                      <span className="absolute bottom-3 start-3 rounded-full border border-[#f0c96f]/35 bg-[#081f28]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#f7f2ea] backdrop-blur">{lang === 'en' ? 'Illustrative service image' : 'תמונת שירות להמחשה'}</span>
                    </div>
                    <CardContent className="flex min-w-0 flex-col p-6">
                      <div className="cf-gold-icon mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
                        <img src={service.mark} alt="" width={48} height={48} className="h-12 w-12" />
                      </div>
                      <h2 className="mb-2 text-lg font-semibold">
                        {lang === 'en' ? service.name_en : service.name_he}
                      </h2>
                      <p className="mb-5 flex-1 text-sm leading-6 text-muted-foreground">
                        {lang === 'en' ? service.desc_en : service.desc_he}
                      </p>
                      <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap">
                        <a
                          href={getWhatsAppServiceLink(lang === 'en' ? service.name_en : service.name_he, lang)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0"
                        >
                          <Button size="sm" className="w-full min-h-11 gap-1.5 bg-[#102e38] text-[#f7f2ea] hover:bg-[#163f49]">
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                        </a>
                        <Link to="/quote" className="min-w-0">
                          <Button size="sm" variant="outline" className="w-full min-h-11 gap-1 border-[#b8842f]/55">
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
        <section className="bg-[#102e38] py-10">
          <div className="cf-shell flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#f0c96f]">{lang === 'en' ? 'Gardening is separate' : 'גינון הוא מסלול נפרד'}</p><h2 className="mt-2 text-3xl text-[#f7f2ea]">{lang === 'en' ? 'One local gardener, subject to written scope and availability.' : 'גנן מקומי אחד, בכפוף להיקף כתוב ולזמינות.'}</h2></div>
            <Button asChild className="min-h-12 shrink-0 bg-[#c49332] text-[#081f28] hover:bg-[#f0c96f]"><Link to="/gardening">{lang === 'en' ? 'About gardening requests' : 'מידע על בקשות גינון'}<ArrowRight className="ms-2 h-4 w-4" /></Link></Button>
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
