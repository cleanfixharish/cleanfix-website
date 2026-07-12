import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { client } from '@/lib/api';

interface Partner {
  id: number;
  name: string;
  business_type: string;
  description_en: string;
  description_he: string;
  phone: string;
  whatsapp: string;
  area: string;
  partner_type: string;
  is_active: boolean;
}

export default function PartnersPage() {
  const { t, lang } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await client.entities.partners.query({
          query: { is_active: true },
          sort: 'sort_order',
          limit: 50,
        });
        setPartners(response.data?.items || []);
      } catch (err) {
        console.error('Failed to fetch partners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const internalTeam = partners.filter((p) => p.partner_type === 'internal');
  const directPartners = partners.filter((p) => p.partner_type === 'partner');
  const directory = partners.filter((p) => p.partner_type === 'directory');

  const PartnerCard = ({ partner }: { partner: Partner }) => (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-base">{partner.name}</h3>
            <p className="text-sm text-muted-foreground">{partner.business_type}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {partner.partner_type === 'internal' ? (lang === 'en' ? 'Our Team' : 'הצוות שלנו') :
             partner.partner_type === 'partner' ? (lang === 'en' ? 'Partner' : 'שותף') :
             (lang === 'en' ? 'Directory' : 'מדריך')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {lang === 'en' ? partner.description_en : partner.description_he}
        </p>
        {partner.area && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5" />
            {partner.area}
          </div>
        )}
        <div className="flex gap-2">
          {partner.phone && (
            <a href={`tel:${partner.phone}`}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {t.partners.callNow}
              </Button>
            </a>
          )}
          {partner.whatsapp && (
            <a href={`https://wa.me/${partner.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
                <MessageCircle className="h-3.5 w-3.5" />
                {t.partners.whatsapp}
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-20 bg-card">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.partners.title}</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">{t.partners.subtitle}</p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-5 h-40" />
                  </Card>
                ))}
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">{lang === 'en' ? 'All' : 'הכל'}</TabsTrigger>
                  <TabsTrigger value="internal">{t.partners.ourTeam}</TabsTrigger>
                  <TabsTrigger value="partners">{t.partners.directPartners}</TabsTrigger>
                  <TabsTrigger value="directory">{t.partners.localDirectory}</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partners.map((p) => <PartnerCard key={p.id} partner={p} />)}
                  </div>
                </TabsContent>
                <TabsContent value="internal">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {internalTeam.map((p) => <PartnerCard key={p.id} partner={p} />)}
                  </div>
                </TabsContent>
                <TabsContent value="partners">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {directPartners.map((p) => <PartnerCard key={p.id} partner={p} />)}
                  </div>
                </TabsContent>
                <TabsContent value="directory">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {directory.map((p) => <PartnerCard key={p.id} partner={p} />)}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}