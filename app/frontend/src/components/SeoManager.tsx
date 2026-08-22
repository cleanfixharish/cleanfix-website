import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const BASE = 'https://cleanfixharish.co.il';
const pages: Record<string, { en: [string, string]; he: [string, string] }> = {
  '/': { en: ['CleanFixHarish | Managed Home Services in Harish', 'One responsible local contact for carefully scoped handyman, cleaning and home services in Harish.'], he: ['CleanFixHarish | שירותי בית מנוהלים בחריש', 'איש קשר מקומי ואחראי לעבודות הנדימן, ניקיון ושירותי בית עם היקף ברור בחריש.'] },
  '/services': { en: ['Home Services in Harish | CleanFixHarish', 'Explore managed handyman, cleaning, window, AC, move-in and gardening services.'], he: ['שירותי בית בחריש | CleanFixHarish', 'שירותי הנדימן, ניקיון, חלונות, מזגנים, מעבר דירה וגינון בניהול אחראי.'] },
  '/gardening': { en: ['Gardening & Landscape Design in Harish | CleanFixHarish', 'Gardeners and high-level garden designers for balconies, family gardens, water features and complete landscapes.'], he: ['גינון ועיצוב גינות בחריש | CleanFixHarish', 'גננים ומעצבי גינות ברמה גבוהה למרפסות, גינות משפחתיות, אלמנטי מים ונוף שלם.'] },
  '/how-we-work': { en: ['How CleanFixHarish Works | Scope, Quality & Resolution', 'Understand how CleanFix manages scope, providers, payment, evidence, quality and issue resolution.'], he: ['איך CleanFixHarish עובדת | היקף, איכות ופתרון', 'כך CleanFix מנהלת היקף, בעלי מקצוע, תשלום, תיעוד, איכות ופתרון בעיות.'] },
  '/local-partners': { en: ['Complementary Local Businesses in Harish | CleanFixHarish', 'A clearly disclosed collection of independent local businesses in services CleanFixHarish does not manage.'], he: ['עסקים מקומיים משלימים בחריש | CleanFixHarish', 'אוסף גלוי וברור של עסקים עצמאיים בשירותים ש-CleanFixHarish אינה מנהלת.'] },
};

export default function SeoManager() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  useEffect(() => {
    const page = pages[pathname] || pages['/'];
    const [title, description] = page[lang];
    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => document.querySelector(selector)?.setAttribute(attribute, value);
    const privateRoute = ['/admin', '/account', '/auth', '/provider', '/partner'].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) || /^\/quote\/.+/.test(pathname);
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = privateRoute ? 'noindex,nofollow,noarchive' : 'index,follow,max-image-preview:large';
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${BASE}${pathname}`;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  }, [lang, pathname]);
  return null;
}
