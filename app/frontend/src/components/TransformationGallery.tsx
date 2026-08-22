import { Link } from 'react-router-dom';
import { ArrowUpRight, Droplets, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TransformationStory } from '@/lib/transformationStories';
import { Button } from '@/components/ui/button';

export default function TransformationGallery({
  stories,
  titleEn,
  titleHe,
  introEn,
  introHe,
  featured = false,
}: {
  stories: TransformationStory[];
  titleEn: string;
  titleHe: string;
  introEn: string;
  introHe: string;
  featured?: boolean;
}) {
  const { lang } = useLanguage();
  return (
    <section className="bg-[#f7f2ea] py-[55px] md:py-[89px]">
      <div className="cf-shell">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="cf-eyebrow">{lang === 'en' ? 'Transformation stories' : 'סיפורי שינוי'}</p>
          <div className="cf-gold-rule mx-auto" />
          <h2 className="text-3xl text-[#102e38] md:text-5xl">{lang === 'en' ? titleEn : titleHe}</h2>
          <p className="mt-4 leading-7 text-[#55666a]">{lang === 'en' ? introEn : introHe}</p>
          <p className="mt-3 text-xs font-semibold text-[#876129]">
            {lang === 'en' ? 'Design visualizations - final scope and result depend on the actual site.' : 'הדמיות תכנון - ההיקף והתוצאה הסופיים תלויים באתר בפועל.'}
          </p>
        </div>
        <div className={`grid gap-5 ${featured ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
          {stories.map((story, index) => (
            <article key={story.id} className={`group overflow-hidden rounded-[21px] border border-[#b8842f]/35 bg-[#fbf8f3] shadow-[0_13px_34px_rgba(8,31,40,.09)] ${featured && index % 5 === 0 ? 'md:col-span-2' : ''}`}>
              <div className="relative overflow-hidden bg-[#102e38]">
                <img src={story.image} alt={lang === 'en' ? story.titleEn : story.titleHe} width={1536} height={1024} loading="lazy" decoding="async" className={`w-full object-cover transition duration-700 group-hover:scale-[1.018] ${featured && index % 5 === 0 ? 'aspect-[2/1]' : 'aspect-[3/2]'}`} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081f28]/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 start-3 flex gap-2">
                  <span className="rounded-full bg-[#081f28]/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#f7f2ea] backdrop-blur">{lang === 'en' ? story.scale : story.scale === 'small' ? 'קטן' : story.scale === 'medium' ? 'בינוני' : 'גדול'}</span>
                  {story.water && <span className="flex items-center gap-1 rounded-full bg-[#e8d8be]/90 px-3 py-1 text-[11px] font-bold text-[#102e38]"><Droplets className="h-3 w-3" />{lang === 'en' ? 'Water feature' : 'אלמנט מים'}</span>}
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-1 rounded-xl bg-[#e8d8be] p-2 text-[#805416]"><Sparkles className="h-4 w-4" /></span>
                  <div>
                    <h3 className="text-xl text-[#102e38]">{lang === 'en' ? story.titleEn : story.titleHe}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#617074]">{lang === 'en' ? story.summaryEn : story.summaryHe}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild className="min-h-12 bg-[#102e38] px-6 text-[#f7f2ea] hover:bg-[#174e57]">
            <Link to="/quote">{lang === 'en' ? 'Show us what you want to transform' : 'הראו לנו מה תרצו לשנות'}<ArrowUpRight className="ms-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
