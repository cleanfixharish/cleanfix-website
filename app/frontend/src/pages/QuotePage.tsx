import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { cleanfixApi } from '@/lib/cleanfixApi';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

const serviceOptions = [
  { en: 'Handyman', he: 'הנדימן' },
  { en: 'Post-renovation cleaning', he: 'ניקיון אחרי שיפוץ' },
  { en: 'Move-in / move-out cleaning', he: 'ניקיון כניסה / יציאה' },
  { en: 'AC cleaning', he: 'ניקוי מזגנים' },
  { en: 'Window cleaning', he: 'ניקוי חלונות' },
  { en: 'Other', he: 'אחר' },
];

const areaOptions = [
  { en: 'Harish Center', he: 'מרכז חריש', key: 'harishCenter' as const },
  { en: 'Harish North', he: 'חריש צפון', key: 'harishNorth' as const },
  { en: 'Harish South', he: 'חריש דרום', key: 'harishSouth' as const },
  { en: 'Harish East', he: 'חריש מזרח', key: 'harishEast' as const },
  { en: 'Harish West', he: 'חריש מערב', key: 'harishWest' as const },
];

export default function QuotePage() {
  const { t, lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    whatsapp: '',
    area: '',
    service_requested: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await cleanfixApi.createLead({
        customer_name: form.customer_name,
        phone: form.phone,
        ...(form.whatsapp ? { whatsapp: form.whatsapp } : {}),
        ...(form.area ? { area: form.area } : {}),
        service_requested: form.service_requested,
        ...(form.description ? { description: form.description } : {}),
        company_website: companyWebsite,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit quote request:', err);
      setError(lang === 'en'
        ? 'The form could not be sent. Your details were not lost—please contact us on WhatsApp below.'
        : 'לא הצלחנו לשלוח את הטופס. אפשר לפנות אלינו ישירות בוואטסאפ למטה.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {lang === 'en' ? 'Request Sent!' : 'הבקשה נשלחה!'}
              </h2>
              <p className="text-muted-foreground mb-6">{t.quote.success}</p>
              <a href={getWhatsAppLink(getWhatsAppQuoteMessage(form.service_requested, lang))} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white">
                  <MessageCircle className="h-4 w-4" />
                  {lang === 'en' ? 'Also message us on WhatsApp' : 'גם שלחו לנו הודעה בוואטסאפ'}
                </Button>
              </a>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{t.quote.title}</h1>
              <p className="text-muted-foreground">{t.quote.subtitle}</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    type="text"
                    name="company_website"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0 pointer-events-none"
                  />
                  <div>
                    <Label htmlFor="name">{t.quote.name} *</Label>
                    <Input
                      id="name"
                      required
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">{t.quote.phone} *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1.5"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">{t.quote.whatsapp}</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={form.whatsapp}
                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                        placeholder={lang === 'en' ? 'Same as phone if empty' : 'זהה לטלפון אם ריק'}
                        className="mt-1.5"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t.quote.service} *</Label>
                    <Select
                      value={form.service_requested}
                      onValueChange={(val) => setForm({ ...form, service_requested: val })}
                      required
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder={t.quote.selectService} />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((s) => (
                          <SelectItem key={s.en} value={s.en}>
                            {lang === 'en' ? s.en : s.he}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t.quote.area}</Label>
                    <Select
                      value={form.area}
                      onValueChange={(val) => setForm({ ...form, area: val })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder={t.quote.selectArea} />
                      </SelectTrigger>
                      <SelectContent>
                        {areaOptions.map((area) => (
                          <SelectItem key={area.en} value={area.en}>
                            {lang === 'en' ? area.en : area.he}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">{t.quote.description}</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="mt-1.5 min-h-[100px]"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (lang === 'en' ? 'Sending...' : 'שולח...') : t.quote.submit}
                  </Button>
                  {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
                </form>
              </CardContent>
            </Card>

            {/* WhatsApp Alternative */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {lang === 'en' ? 'Prefer WhatsApp? Message us directly:' : 'מעדיפים וואטסאפ? שלחו לנו הודעה ישירות:'}
              </p>
              <a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
                  <MessageCircle className="h-4 w-4" />
                  {t.hero.whatsapp}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
