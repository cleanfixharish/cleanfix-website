import { Download, Headphones, Presentation, QrCode } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

type Episode = {
  key: 'concept' | 'customer' | 'technology' | 'elevator';
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
};

const episodes: Episode[] = [
  { key: 'concept', titleEn: 'The concept, system, and money', titleHe: 'המודל העסקי והמבחן האמיתי', descriptionEn: 'What problem the business solves, how work moves, what customers pay, and how providers are paid.', descriptionHe: '8:24 דקות · שיחת עומק על תנועת הכסף, דוגמת אלף שקלים, סיכונים ועשרים עבודות האימות הראשונות.' },
  { key: 'customer', titleEn: 'The customer guide', titleHe: 'מהנזילה הראשונה לסגירת העבודה', descriptionEn: 'A simple journey from the first request through a written quote, the work, and the quality check.', descriptionHe: '8:56 דקות · הסיפור של דנה והנזילה בכיור מסביר כל שלב, שינוי, תשלום ובדיקת איכות.' },
  { key: 'technology', titleEn: 'Technology and the owner dashboard', titleHe: 'מגדל הפיקוח שמאחורי האתר', descriptionEn: 'How the website, accounts, permissions, admin tools, AI limits, and safe backups work together.', descriptionHe: '8:40 דקות · זהויות, הרשאות, לוחות בקרה, גבולות הבינה המלאכותית, פרטיות וגרסה בטוחה.' },
  { key: 'elevator', titleEn: 'The elevator pitch', titleHe: 'הפיץ׳ שאפשר לזכור', descriptionEn: 'The shortest explanation of the problem, the answer, and why CleanFixHarish is different.', descriptionHe: '5:48 דקות · סיפור ברז שהתפוצץ, דימוי של מסילת רכבת והחזון שמתחיל בחריש.' },
];

const ENGLISH_MEDIA_RELEASE_BASE = 'https://raw.githubusercontent.com/cleanfixharish/cleanfix-website/7629386/app/frontend/public';
const HEBREW_MEDIA_RELEASE_BASE = 'https://raw.githubusercontent.com/cleanfixharish/cleanfix-website/82df383/app/frontend/public';

export default function StoryMedia({ compact = false }: { compact?: boolean }) {
  const { lang } = useLanguage();
  const he = lang === 'he';
  const languageCode = he ? 'HE' : 'EN';

  return (
    <section className="bg-[#081f28] py-[55px] text-[#f7f2ea] md:py-[89px]">
      <div className="cf-shell">
        <div className={`public-grid grid min-w-0 items-end gap-8 ${compact ? 'lg:grid-cols-[1fr_1.618fr]' : 'lg:grid-cols-2'}`}>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0c96f]">{he ? 'הסיפור בקול' : 'The story in sound'}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#f7f2ea] md:text-5xl">{he ? 'ארבעה הסברים פשוטים. תמונה אחת ברורה.' : 'Four simple explanations. One clear picture.'}</h2>
          </div>
          <p className="max-w-2xl leading-7 text-[#e8d8be]">{he ? 'כל פרק משתמש במשפטים קצרים ובדוגמאות יומיומיות, כדי שגם ילד בן שמונה יוכל להבין — בלי לדבר אל המבוגרים בצורה ילדותית.' : 'Every episode uses short sentences and everyday examples so even an eight-year-old can follow—without talking down to adults.'}</p>
        </div>

        <div className="public-grid mt-10 grid min-w-0 gap-5 md:grid-cols-2">
          {episodes.map((episode) => {
            const fileBase = `CleanFixHarish-${episode.key}-${languageCode}`;
            const audioExtension = episode.key === 'elevator' || (episode.key === 'customer' && !he) ? 'm4a' : 'mp3';
            const audioFile = he ? `${fileBase}-v2.mp3` : `${fileBase}.${audioExtension}`;
            const audioType = audioFile.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg';
            const mediaBase = he ? HEBREW_MEDIA_RELEASE_BASE : ENGLISH_MEDIA_RELEASE_BASE;
            return (
              <article key={`${episode.key}-${languageCode}`} className="min-w-0 rounded-[24px] border border-[#f0c96f]/25 bg-[#123640] p-5 shadow-xl sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="cf-gold-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"><Headphones className="h-5 w-5 text-[#f0c96f]" /></span>
                  <div className="min-w-0"><h3 className="font-semibold text-[#f7f2ea]">{he ? episode.titleHe : episode.titleEn}</h3><p className="mt-1 text-sm leading-6 text-[#e8d8be]/85">{he ? episode.descriptionHe : episode.descriptionEn}</p></div>
                </div>
                <audio key={audioFile} className="mt-5 w-full" controls preload="none" aria-label={he ? `${episode.titleHe} — פודקאסט בעברית` : `${episode.titleEn} — English podcast`}><source src={`${mediaBase}/media/${audioFile}`} type={audioType} />{he ? 'הדפדפן אינו תומך בנגן האודיו.' : 'Your browser does not support the audio player.'}</audio>
                <a className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#f0c96f] underline-offset-4 hover:underline" href={`/media/${fileBase}.txt`} target="_blank" rel="noreferrer"><Download className="me-2 h-4 w-4" />{he ? 'קריאת תסריט או הערות הפרק (נפתח בלשונית חדשה)' : 'Read the episode script or source notes (opens a new tab)'}</a>
              </article>
            );
          })}
        </div>

        <div className="public-grid mt-6 grid min-w-0 items-center gap-6 rounded-[24px] border border-[#f0c96f]/30 bg-[#0d2b34] p-5 sm:p-7 lg:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <p className="text-xs leading-5 text-[#e8d8be]/75">{he ? 'הפרקים נוצרו בסיוע AI ומבוססים על מקורות החברה. פרטים משפטיים, כספיים ותפעוליים כפופים למסמכים המאושרים.' : 'These AI-assisted episodes are grounded in company sources. Legal, financial, and operational details remain subject to approved documents.'}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="min-h-11 bg-[#e8d8be] text-[#102e38] hover:bg-[#f7f2ea]"><a href={`${ENGLISH_MEDIA_RELEASE_BASE}/downloads/CleanFixHarish-Story-Deck-EN.pptx`}><Presentation className="me-2 h-4 w-4" />{he ? 'הורדת המצגת באנגלית' : 'Download the presentation'}</a></Button>
              <Button asChild variant="outline" className="min-h-11 border-[#f0c96f]/50 bg-transparent text-[#f7f2ea] hover:bg-white/10 hover:text-white"><a href="https://cleanfixharish.co.il/" aria-label={he ? 'פתיחת דף הבית של CleanFixHarish' : 'Open the CleanFixHarish home page'}><QrCode className="me-2 h-4 w-4" />{he ? 'פתיחת דף הבית' : 'Open the home page'}</a></Button>
            </div>
          </div>
          <a href="https://cleanfixharish.co.il/" className="mx-auto block w-full max-w-[320px] shrink-0 overflow-hidden rounded-2xl border border-[#f0c96f]/50 bg-[#f7f2ea] p-2 lg:mx-0" aria-label={he ? 'פתיחת דף הבית של CleanFixHarish' : 'Open the CleanFixHarish home page'}><img src="/assets/brand/cleanfixharish-home-qr.png" alt={he ? 'קוד QR ממותג לדף הבית של CleanFixHarish' : 'Branded QR code for the CleanFixHarish home page'} width="1600" height="1600" className="h-auto w-full" loading="lazy" /></a>
        </div>
      </div>
    </section>
  );
}
