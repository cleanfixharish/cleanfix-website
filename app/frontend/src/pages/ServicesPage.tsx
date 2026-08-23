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
import { useEffect, useState } from 'react';
import { absoluteApiUrl, cleanfixApi } from '@/lib/cleanfixApi';
import { serviceDocumentaryMap, type DocumentaryId } from '@/lib/documentaryMedia';
import TransformationGallery from '@/components/TransformationGallery';
import { serviceStories, serviceThumbnailMap } from '@/lib/transformationStories';

const fallbackServices = [
  { id: 'handyman', mark: '/assets/brand/v2/symbol-handyman.svg', photo: 'handyman-shelf' as DocumentaryId, name_en: 'Handyman services', name_he: 'שירותי הנדימן', desc_en: 'Practical repairs, mounting, assembly, installations and adjustments—handled carefully and clearly.', desc_he: 'תיקונים מעשיים, תלייה, הרכבה, התקנות והתאמות—בעבודה זהירה וברורה.', priority: true },
  { id: 'post-renovation', mark: '/assets/brand/v2/symbol-cleaning.svg', photo: 'post-renovation-cleaning' as DocumentaryId, name_en: 'Post-renovation cleaning', name_he: 'ניקיון אחרי שיפוץ', desc_en: 'Detailed removal of construction dust and residue so the finished home can finally feel ready.', desc_he: 'ניקוי יסודי של אבק ושאריות בנייה, כדי שהבית המשופץ ירגיש מוכן באמת.' },
  { id: 'move', mark: '/assets/brand/v2/symbol-access.svg', photo: 'move-in-window-cleaning' as DocumentaryId, name_en: 'Move-in & move-out cleaning', name_he: 'ניקיון כניסה ויציאה', desc_en: 'A thorough reset before receiving the key, moving in, or handing the property over.', desc_he: 'ניקיון יסודי לפני קבלת מפתח, כניסה לבית או מסירת הנכס.' },
  { id: 'ac', mark: '/assets/brand/v2/symbol-ac.svg', photo: 'ac-maintenance' as DocumentaryId, name_en: 'AC cleaning', name_he: 'ניקוי מזגנים', desc_en: 'Careful cleaning for fresher airflow and a more comfortable home environment.', desc_he: 'ניקוי זהיר לזרימת אוויר רעננה יותר ולסביבה ביתית נעימה.' },
  { id: 'windows', mark: '/assets/brand/v2/symbol-window.svg', photo: 'move-in-window-cleaning' as DocumentaryId, name_en: 'Window cleaning', name_he: 'ניקוי חלונות', desc_en: 'Glass, frames and tracks cleaned for brighter rooms and a polished finish.', desc_he: 'ניקוי זכוכית, מסגרות ומסילות לחדרים בהירים ולגימור מוקפד.' },
  { id: 'gardening', mark: '/assets/brand/cf-home-support-emblem-128.png', photo: 'hero-managed-service' as DocumentaryId, name_en: 'Gardening & landscape design', name_he: 'גינון ועיצוב גינות', desc_en: 'Experienced gardeners and high-level designers for balconies, family gardens, water features and complete landscapes.', desc_he: 'גננים ומעצבי גינות ברמה גבוהה למרפסות, גינות משפחתיות, אלמנטי מים ונופים שלמים.' },
];

export default function ServicesPage() {
  const { t, lang } = useLanguage();
  const [liveServices, setLiveServices] = useState<any[]>([]);

  useEffect(() => {
    cleanfixApi.listServices().then((result) => setLiveServices((result?.items || []).filter((item: any) => item.is_active !== false))).catch(() => undefined);
  }, []);

  const services = liveServices.length ? liveServices.map((item, index) => {
    const fallback = fallbackServices[index % fallbackServices.length];
    return {
      ...fallback,
      ...item,
      id: item.id,
      desc_en: item.description_en,
      desc_he: item.description_he,
      photo: serviceDocumentaryMap[String(item.slug || fallback.id)] || fallback.photo,
      thumbnail: serviceThumbnailMap[String(item.slug || fallback.id)] || serviceThumbnailMap[fallback.id],
      priority: index === 0,
    };
  }) : fallbackServices.map((service) => ({ ...service, thumbnail: serviceThumbnailMap[service.id] }));

  return (
    <PublicSite>
      <Header />
      <main className="flex-1">
        <section className="cf-navy-panel py-[55px] md:py-[89px]">
          <div className="cf-shell text-center">
            <p className="cf-eyebrow">Home services in Harish</p>
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
                      {service.image_url ? (
                        <img src={absoluteApiUrl(service.image_url)} alt={lang === 'en' ? service.name_en : service.name_he} width={1200} height={800} className="h-full w-full object-cover" loading="lazy" />
                      ) : service.thumbnail ? (
                        <picture>
                          <source
                            type="image/webp"
                            srcSet={`${service.thumbnail.replace('-1536.webp', '-960.webp')} 960w, ${service.thumbnail} 1536w`}
                            sizes={service.priority ? '(max-width: 640px) 100vw, 60vw' : '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw'}
                          />
                          <img src={service.thumbnail} alt={lang === 'en' ? service.name_en : service.name_he} width={1536} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" loading="lazy" decoding="async" />
                        </picture>
                      ) : (
                        <DocumentaryImage id={service.photo} lang={lang} sizes={service.priority ? '(max-width: 640px) 100vw, 60vw' : '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw'} />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081f28]/65 via-transparent to-transparent" />
                      <span className="absolute bottom-3 start-3 rounded-full border border-[#f0c96f]/35 bg-[#081f28]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#f7f2ea] backdrop-blur">{lang === 'en' ? 'Transformation view' : 'מבט על השינוי'}</span>
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
                      {service.price_from != null && <div className="mb-5 rounded-xl bg-[#EEE4D4] p-3 text-sm text-[#765D38]"><strong>{t.servicesPage.fromPrice}{Number(service.price_from).toLocaleString()}</strong>{service.price_unit ? ` ${service.price_unit}` : ''}{(lang === 'en' ? service.price_note_en : service.price_note_he) && <span className="mt-1 block text-xs">{lang === 'en' ? service.price_note_en : service.price_note_he}</span>}</div>}
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
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#f0c96f]">{lang === 'en' ? 'A complete gardening studio' : 'סטודיו מלא לגינון'}</p><h2 className="mt-2 text-3xl text-[#f7f2ea]">{lang === 'en' ? 'From a balcony planter to a complete landscape.' : 'מאדנית במרפסת ועד נוף שלם.'}</h2></div>
            <Button asChild className="min-h-12 shrink-0 bg-[#c49332] text-[#081f28] hover:bg-[#f0c96f]"><Link to="/gardening">{lang === 'en' ? 'Explore gardens' : 'לגלות את הגינות'}<ArrowRight className="ms-2 h-4 w-4" /></Link></Button>
          </div>
        </section>
        <TransformationGallery stories={serviceStories} titleEn="See the journey, not just the promise" titleHe="לראות את הדרך, לא רק את ההבטחה" introEn="Each visual story connects a real customer problem to a written scope, controlled fulfillment and a documented result." introHe="כל סיפור חזותי מחבר בעיה אמיתית של לקוח להיקף כתוב, ביצוע מבוקר ותוצאה מתועדת." />
      </main>
      <Footer />
    </PublicSite>
  );
}
