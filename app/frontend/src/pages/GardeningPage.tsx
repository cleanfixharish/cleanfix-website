import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Leaf, MessageCircle, Sprout } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

export default function GardeningPage() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const stages = isEn
    ? ['Send the garden details and photos', 'We check fit and the gardener’s availability', 'Scope and price are confirmed in writing', 'Only then can a booking be agreed']
    : ['שולחים פרטי גינה ותמונות', 'אנחנו בודקים התאמה וזמינות של הגנן', 'היקף ומחיר מאושרים בכתב', 'רק לאחר מכן ניתן להסכים על הזמנה'];
  return (
    <PublicSite>
      <Header />
      <main className="flex-1">
        <section className="cf-navy-panel overflow-hidden py-[55px] md:py-[89px]">
          <div className="cf-shell grid items-center gap-8 lg:grid-cols-[1fr_1.618fr]">
            <div>
              <p className="cf-eyebrow">{isEn ? 'Focused gardening requests · Harish' : 'בקשות גינון ממוקדות · חריש'}</p>
              <div className="cf-gold-rule" />
              <h1 className="text-4xl text-[#f7f2ea] md:text-6xl">{isEn ? 'One local gardener. Every request checked first.' : 'גנן מקומי אחד. כל בקשה נבדקת תחילה.'}</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#e8d8be]">{isEn ? 'Gardening is separate from the four CleanFix service categories. We currently consider requests through one local gardener, subject to fit, written scope and availability.' : 'גינון נפרד מארבע קטגוריות השירות של CleanFix. בשלב זה בקשות נבדקות מול גנן מקומי אחד, בכפוף להתאמה, להיקף כתוב ולזמינות.'}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="min-h-12 bg-[#c49332] text-[#081f28] hover:bg-[#f0c96f]"><Link to="/quote?service=gardening">{isEn ? 'Send a gardening request' : 'שליחת בקשת גינון'}<ArrowRight className="ms-2 h-4 w-4" /></Link></Button>
                <Button asChild variant="outline" className="min-h-12 border-[#e8d8be]/60 bg-transparent text-[#f7f2ea] hover:bg-white/10 hover:text-white"><a href={getWhatsAppLink(getWhatsAppQuoteMessage(undefined, lang))} target="_blank" rel="noreferrer"><MessageCircle className="me-2 h-4 w-4" />WhatsApp</a></Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-[34px] border border-[#f0c96f]/35 shadow-[0_34px_89px_rgba(0,0,0,.3)]">
              <img src="/assets/images/transformations/garden-hillside-cascade-1536.webp" alt={isEn ? 'Large hillside garden design visualization before and after' : 'הדמיית לפני ואחרי של גינת מדרון גדולה'} width={1536} height={1024} fetchPriority="high" className="aspect-[3/2] w-full object-cover" />
              <p className="bg-[#081f28] px-4 py-2 text-xs text-[#e8d8be]">{isEn ? 'Illustrative concept — not a completed CleanFixHarish customer garden.' : 'הדמיה להמחשה — לא גינת לקוח שהושלמה על ידי CleanFixHarish.'}</p>
            </div>
          </div>
        </section>
        <section className="bg-[#fbf8f3] py-[55px]">
          <div className="cf-shell grid gap-5 md:grid-cols-3">
            {[
              [Leaf, isEn ? 'One gardener at launch' : 'גנן אחד בהשקה', isEn ? 'We do not present a large gardening network that does not exist.' : 'איננו מציגים רשת גינון גדולה שאינה קיימת.'],
              [Sprout, isEn ? 'Fit and availability first' : 'קודם התאמה וזמינות', isEn ? 'A request is reviewed with the gardener before any commitment.' : 'הבקשה נבדקת מול הגנן לפני כל התחייבות.'],
              [CheckCircle2, isEn ? 'Written confirmation' : 'אישור בכתב', isEn ? 'Scope, price and booking must be confirmed separately in writing.' : 'היקף, מחיר והזמנה חייבים לקבל אישור נפרד בכתב.'],
            ].map(([Icon, title, copy]) => (
              <div key={String(title)} className="rounded-[21px] border border-[#d8d0c6] bg-white p-6"><Icon className="h-7 w-7 text-[#a87520]" /><h2 className="mt-4 text-2xl text-[#102e38]">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-[#617074]">{String(copy)}</p></div>
            ))}
          </div>
        </section>
        <section className="cf-ivory-orbit py-[55px] md:py-[89px]">
          <div className="cf-shell grid gap-8 lg:grid-cols-[1fr_1.618fr]">
            <div><p className="cf-eyebrow">{isEn ? 'Before any booking' : 'לפני כל הזמנה'}</p><div className="cf-gold-rule" /><h2 className="text-3xl text-[#102e38] md:text-5xl">{isEn ? 'A request starts a review—not a commitment.' : 'בקשה מתחילה בדיקה — לא התחייבות.'}</h2><p className="mt-4 leading-7 text-[#617074]">{isEn ? 'Sending details does not confirm that the gardener is available, that the job fits, what it will cost or that it is booked.' : 'שליחת פרטים אינה מאשרת שהגנן זמין, שהעבודה מתאימה, מה יהיה המחיר או שנקבעה הזמנה.'}</p></div>
            <ol className="space-y-3">{stages.map((stage, index) => <li key={stage} className="flex items-center gap-4 rounded-2xl border border-[#d8d0c6] bg-[#fbf8f3]/90 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#102e38] font-bold text-[#f0c96f]">{index + 1}</span><span className="font-semibold text-[#324346]">{stage}</span><CheckCircle2 className="ms-auto h-5 w-5 text-[#4f7b57]" /></li>)}</ol>
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
