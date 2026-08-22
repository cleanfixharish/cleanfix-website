import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export default function LocalPartnersPage() {
  const { lang } = useLanguage();
  const he = lang === 'he';
  return <PublicSite><Header /><main className="flex-1">
    <section className="cf-navy-panel py-[55px] md:py-[89px]"><div className="cf-shell mx-auto max-w-4xl text-center"><p className="cf-eyebrow">{he ? 'עסקים מקומיים משלימים' : 'Complementary local businesses'}</p><div className="cf-gold-rule mx-auto" /><h1 className="text-4xl text-[#f7f2ea] md:text-6xl">{he ? 'מקום לעסקים מצוינים לזרוח.' : 'A place for excellent local businesses to shine.'}</h1><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#e8d8be]">{he ? 'עמוד אוצר לעסקים עצמאיים בשירותים ש-CleanFixHarish אינה מנהלת. כל עסק שומר על הזהות שלו בתוך חוויית שימוש נקייה, ברורה ואמינה.' : 'A curated destination for independent businesses in services CleanFixHarish does not manage. Every business keeps its own identity inside a clean, clear and trustworthy experience.'}</p></div></section>
    <section className="bg-[#fff8e8] py-6"><div className="cf-shell flex items-start gap-3 text-sm leading-6 text-[#684f2b]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>{he ? 'חשוב:' : 'Important:'}</strong> {he ? 'אלה עסקים עצמאיים. מתקשרים ומשלמים להם ישירות, ו-CleanFixHarish אינה מנהלת או מבטיחה את השירות שלהם. כל הפניה מציגה את ההבהרה לפני מעבר או שיתוף פרטים.' : 'These are independent businesses. You contract and pay them directly; CleanFixHarish does not manage or guarantee their service. Every referral repeats this disclosure before leaving or sharing information.'}</p></div></section>
    <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]"><div className="cf-shell">
      <div className="mx-auto max-w-3xl text-center"><p className="cf-eyebrow">{he ? 'ארכיטקטורת מותג' : 'Brand architecture'}</p><div className="cf-gold-rule mx-auto" /><h2 className="text-3xl text-[#102e38] md:text-5xl">{he ? 'המסגרת שלנו. האישיות שלהם.' : 'Our frame. Their personality.'}</h2></div>
      <div className="mt-9 grid gap-5 md:grid-cols-3">{[
        [Palette, he ? 'אי מותג אישי' : 'A personal brand island', he ? 'לוגו מאומת, צבע הדגשה אחד, צילום בבעלות העסק וקול משלו - בלי לצבוע מחדש את הניווט של CleanFix.' : 'Verified logo, one accent color, owned photography and an individual voice - without recoloring CleanFix navigation.'],
        [BadgeCheck, he ? 'אמת לפני קידום' : 'Truth before promotion', he ? 'סטטוס בדיקת פרטים, רישוי כאשר נדרש, תאריך בדיקה ותווית ממומן קבועה.' : 'Contact-check status, licensing where required, review date and persistent sponsored disclosure.'],
        [Sparkles, he ? 'נראות עשירה, דירוג הוגן' : 'Rich presence, fair order', he ? 'תמונה חזקה, פרופיל דו-לשוני ו-QR - ללא קניית דירוג או ביקורות.' : 'Strong imagery, bilingual profile and QR - without buying rank or reviews.'],
      ].map(([Icon, title, copy]) => <article key={String(title)} className="rounded-[21px] border border-[#d8d0c6] bg-[#fbf8f3] p-6 shadow-[0_13px_34px_rgba(8,31,40,.07)]"><Icon className="h-7 w-7 text-[#a87520]" /><h3 className="mt-4 text-2xl text-[#102e38]">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-[#617074]">{String(copy)}</p></article>)}</div>
      <div className="mt-10 rounded-[34px] border border-[#b8842f]/35 bg-[#102e38] p-8 text-center text-[#f7f2ea] md:p-12"><Building2 className="mx-auto h-10 w-10 text-[#f0c96f]" /><h2 className="mt-4 text-3xl md:text-4xl">{he ? 'הקבוצה המייסדת עדיין בבדיקה.' : 'The founding collection is being reviewed.'}</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#e8d8be]">{he ? 'לא נציג עסקים מומצאים או לא-מאומתים כדי למלא את העמוד. ההשקה הראשונה תכלול 6-10 עסקים משלימים בלבד, לאחר בדיקת קטגוריה, זהות, זכויות מותג וטענות.' : 'We will not fill this page with invented or unverified businesses. The first release will contain only 6-10 complementary businesses after category, identity, brand-rights and claims review.'}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild className="min-h-12 bg-[#c49332] text-[#081f28] hover:bg-[#f0c96f]"><Link to="/partners">{he ? 'הגשת מועמדות לעסק' : 'Apply as a business'}<ArrowRight className="ms-2 h-4 w-4" /></Link></Button><Button asChild variant="outline" className="min-h-12 border-[#e8d8be]/50 bg-transparent text-[#f7f2ea] hover:bg-white/10 hover:text-white"><Link to="/quote">{he ? 'צריכים שירות של CleanFix?' : 'Need a CleanFix service?'}</Link></Button></div></div>
    </div></section>
  </main><Footer /></PublicSite>;
}
