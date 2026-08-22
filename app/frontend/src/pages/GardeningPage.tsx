import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Leaf, PenTool, ShieldCheck, Sprout } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import TransformationGallery from '@/components/TransformationGallery';
import { gardeningStories } from '@/lib/transformationStories';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export default function GardeningPage() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const stages = isEn
    ? ['Site conversation and photos', 'Garden designer concept and practical scope', 'Written price, materials and provider payout', 'Controlled implementation and evidence', 'Quality review and care handover']
    : ['שיחה ותמונות של האתר', 'קונספט של מעצב גינות והיקף מעשי', 'מחיר, חומרים ותשלום לבעל המקצוע בכתב', 'ביצוע מבוקר ותיעוד', 'בדיקת איכות ומסירת הוראות טיפול'];
  return (
    <PublicSite>
      <Header />
      <main className="flex-1">
        <section className="cf-navy-panel overflow-hidden py-[55px] md:py-[89px]">
          <div className="cf-shell grid items-center gap-8 lg:grid-cols-[1fr_1.618fr]">
            <div>
              <p className="cf-eyebrow">{isEn ? 'Gardening and landscape design' : 'גינון ועיצוב נוף'}</p>
              <div className="cf-gold-rule" />
              <h1 className="text-4xl text-[#f7f2ea] md:text-6xl">{isEn ? 'From an empty space to a garden with a soul.' : 'משטח ריק לגינה עם נשמה.'}</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#e8d8be]">{isEn ? 'Small balconies, family gardens and ambitious landscapes - planned by experienced gardeners and high-level garden designers, then managed through one CleanFixHarish scope.' : 'ממרפסות קטנות וגינות משפחתיות ועד פרויקטים שאפתניים - בתכנון גננים ומעצבי גינות ברמה גבוהה, ובניהול היקף אחד של CleanFixHarish.'}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="min-h-12 bg-[#c49332] text-[#081f28] hover:bg-[#f0c96f]"><Link to="/quote">{isEn ? 'Plan my garden' : 'תכננו לי את הגינה'}<ArrowRight className="ms-2 h-4 w-4" /></Link></Button>
                <Button asChild variant="outline" className="min-h-12 border-[#e8d8be]/60 bg-transparent text-[#f7f2ea] hover:bg-white/10 hover:text-white"><a href="#journey">{isEn ? 'Explore transformations' : 'לגלות את השינויים'}</a></Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-[34px] border border-[#f0c96f]/35 shadow-[0_34px_89px_rgba(0,0,0,.3)]">
              <img src="/assets/images/transformations/garden-hillside-cascade-1536.webp" alt={isEn ? 'Large hillside garden design visualization before and after' : 'הדמיית לפני ואחרי של גינת מדרון גדולה'} width={1536} height={1024} fetchPriority="high" className="aspect-[3/2] w-full object-cover" />
            </div>
          </div>
        </section>
        <section className="bg-[#fbf8f3] py-[55px]">
          <div className="cf-shell grid gap-5 md:grid-cols-3">
            {[
              [PenTool, isEn ? 'Design first' : 'קודם מתכננים', isEn ? 'A concept must become a buildable scope, budget and maintenance plan.' : 'הקונספט הופך להיקף בר-ביצוע, תקציב ותכנית תחזוקה.'],
              [Sprout, isEn ? 'Right team for the scale' : 'הצוות הנכון להיקף', isEn ? 'Gardener, garden designer and specialist partners are selected privately for the job.' : 'גנן, מעצב גינות ובעלי מקצוע נבחרים באופן פרטי לפי העבודה.'],
              [ShieldCheck, isEn ? 'One accountable contact' : 'איש קשר אחראי אחד', isEn ? 'CleanFix manages scope, communication, changes, evidence and resolution.' : 'CleanFix מנהלת היקף, תקשורת, שינויים, תיעוד ופתרון בעיות.'],
            ].map(([Icon, title, copy]) => (
              <div key={String(title)} className="rounded-[21px] border border-[#d8d0c6] bg-white p-6"><Icon className="h-7 w-7 text-[#a87520]" /><h2 className="mt-4 text-2xl text-[#102e38]">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-[#617074]">{String(copy)}</p></div>
            ))}
          </div>
        </section>
        <div id="journey"><TransformationGallery stories={gardeningStories} featured titleEn="Gardens at every scale" titleHe="גינות בכל קנה מידה" introEn="Realistic visual journeys for balconies, entrances, family gardens, rooftops and complete landscapes - including carefully engineered water features." introHe="מסעות חזותיים מציאותיים למרפסות, כניסות, גינות משפחתיות, גגות ונופים שלמים - כולל אלמנטי מים שמתוכננים לביצוע." /></div>
        <section className="cf-ivory-orbit py-[55px] md:py-[89px]">
          <div className="cf-shell grid gap-8 lg:grid-cols-[1fr_1.618fr]">
            <div><p className="cf-eyebrow">{isEn ? 'The controlled journey' : 'המסע המבוקר'}</p><div className="cf-gold-rule" /><h2 className="text-3xl text-[#102e38] md:text-5xl">{isEn ? 'Magic needs logistics.' : 'גם קסם צריך לוגיסטיקה.'}</h2><p className="mt-4 leading-7 text-[#617074]">{isEn ? 'Water, drainage, electricity, planting, access and maintenance are agreed before implementation. No verbal extras and no surprise provider invoices.' : 'מים, ניקוז, חשמל, צמחייה, גישה ותחזוקה מוסכמים לפני הביצוע. אין תוספות בעל פה ואין חשבוניות מפתיעות מבעל המקצוע.'}</p></div>
            <ol className="space-y-3">{stages.map((stage, index) => <li key={stage} className="flex items-center gap-4 rounded-2xl border border-[#d8d0c6] bg-[#fbf8f3]/90 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#102e38] font-bold text-[#f0c96f]">{index + 1}</span><span className="font-semibold text-[#324346]">{stage}</span><CheckCircle2 className="ms-auto h-5 w-5 text-[#4f7b57]" /></li>)}</ol>
          </div>
        </section>
      </main>
      <Footer />
    </PublicSite>
  );
}
