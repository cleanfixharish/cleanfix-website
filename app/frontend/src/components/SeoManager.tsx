import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const BASE = 'https://cleanfixharish.co.il';
const pages: Record<string, { en: [string, string]; he: [string, string] }> = {
  '/': { en: ['CleanFixHarish | Handyman, Cleaning, Painting & AC Cleaning', 'Request four focused home-service categories in Harish. Scope, availability, price and booking are confirmed separately.'], he: ['CleanFixHarish | הנדימן, ניקיון, צביעה וניקוי מזגנים', 'בקשת ארבע קטגוריות שירות ממוקדות בחריש. היקף, זמינות, מחיר והזמנה מאושרים בנפרד.'] },
  '/services': { en: ['Focused Home-Service Requests in Harish | CleanFixHarish', 'Handyman, cleaning, painting and AC-cleaning requests, plus gardening separately through one local gardener.'], he: ['בקשות שירות ממוקדות בחריש | CleanFixHarish', 'בקשות הנדימן, ניקיון, צביעה וניקוי מזגנים, וגינון בנפרד דרך גנן מקומי אחד.'] },
  '/gardening': { en: ['Gardening Requests in Harish | One Local Gardener', 'Gardening requests are reviewed through one local gardener, subject to written scope and availability.'], he: ['בקשות גינון בחריש | גנן מקומי אחד', 'בקשות גינון נבדקות מול גנן מקומי אחד, בכפוף להיקף כתוב ולזמינות.'] },
  '/how-it-works': { en: ['How Service Requests Work | CleanFixHarish', 'See how requests are reviewed before scope, availability, price, assignment or booking is confirmed.'], he: ['איך עובדות בקשות שירות | CleanFixHarish', 'כך בקשות נבדקות לפני אישור היקף, זמינות, מחיר, שיבוץ או הזמנה.'] },
  '/about': { en: ['About CleanFixHarish | Focused Launch in Harish', 'How the staged launch handles handyman, cleaning, painting and AC-cleaning requests, with gardening kept separate.'], he: ['אודות CleanFixHarish | השקה ממוקדת בחריש', 'כך ההשקה המדורגת מטפלת בבקשות הנדימן, ניקיון, צביעה וניקוי מזגנים, כאשר גינון נשאר נפרד.'] },
  '/partners': { en: ['Harish Business Network | Not Launched', 'The wider independent Harish business network is a future phase and is not currently operating.'], he: ['רשת העסקים בחריש | טרם הושקה', 'רשת העסקים העצמאיים הרחבה בחריש היא שלב עתידי ואינה פועלת כעת.'] },
  '/local-partners': { en: ['Harish Business Network | Not Launched', 'The wider independent Harish business network is a future phase and is not currently operating.'], he: ['רשת העסקים בחריש | טרם הושקה', 'רשת העסקים העצמאיים הרחבה בחריש היא שלב עתידי ואינה פועלת כעת.'] },
};

export default function SeoManager() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  useEffect(() => {
    const page = pages[pathname] || pages['/'];
    const [title, description] = page[lang];
    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => document.querySelector(selector)?.setAttribute(attribute, value);
    const privateRoute = ['/admin', '/account', '/auth', '/provider', '/partner'].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) || ['/partners', '/local-partners'].includes(pathname) || /^\/quote\/.+/.test(pathname);
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
