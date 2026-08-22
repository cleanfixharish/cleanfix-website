import { useMemo } from 'react';
import { toast } from 'sonner';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  Share2,
  UserRound,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Journey = {
  id: 'customer' | 'provider';
  title: string;
  description: string;
  path: string;
  icon: typeof UserRound;
  steps: string[];
  whatsapp: string;
};

export default function ShareOnboarding() {
  const { lang } = useLanguage();
  const he = lang === 'he';
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const journeys = useMemo<Journey[]>(() => he ? [
    {
      id: 'customer',
      title: 'לקוח חדש',
      description: 'קישור פשוט שמוביל את הלקוח לבקשת שירות ברורה ומותאמת לנייד.',
      path: '/quote',
      icon: UserRound,
      steps: ['פותחים את הקישור', 'בוחרים שירות ומוסיפים פרטים', 'הפנייה נכנסת ללוח הלקוחות', 'המנהל ממשיך בוואטסאפ ובהצעת מחיר'],
      whatsapp: 'שלום, אפשר לבקש שירות מ-CleanFixHarish בקישור הזה:',
    },
    {
      id: 'provider',
      title: 'בעל/ת מקצוע חדש/ה',
      description: 'קישור הרשמה ייעודי שבוחר מראש חשבון עסקי ומסביר את תהליך האימות.',
      path: '/account?type=business',
      icon: BriefcaseBusiness,
      steps: ['פותחים את קישור ההרשמה', 'מתחברים וממלאים פרטי עסק', 'הבקשה ממתינה לבדיקת מנהל', 'רק לאחר אישור העסק יכול להופיע ברשת'],
      whatsapp: 'שלום, אפשר להצטרף לרשת בעלי המקצוע של CleanFixHarish בקישור הזה:',
    },
  ] : [
    {
      id: 'customer',
      title: 'New customer',
      description: 'A simple mobile-ready link that leads directly to a clear service request.',
      path: '/quote',
      icon: UserRound,
      steps: ['Open the link', 'Choose a service and add details', 'The inquiry enters the customer dashboard', 'The manager continues in WhatsApp and prepares a quote'],
      whatsapp: 'Hello, you can request a CleanFixHarish service here:',
    },
    {
      id: 'provider',
      title: 'New service provider',
      description: 'A dedicated registration link that preselects a business account and explains verification.',
      path: '/account?type=business',
      icon: BriefcaseBusiness,
      steps: ['Open the registration link', 'Sign in and complete the business profile', 'The application waits for owner review', 'The business appears in the network only after approval'],
      whatsapp: 'Hello, you can apply to the CleanFixHarish provider network here:',
    },
  ], [he]);

  const absoluteUrl = (path: string) => `${origin}${path}`;

  const copyLink = async (journey: Journey) => {
    try {
      await navigator.clipboard.writeText(absoluteUrl(journey.path));
      toast.success(he ? 'הקישור הועתק' : 'Link copied');
    } catch {
      toast.error(he ? 'ההעתקה נחסמה בדפדפן. אפשר לבחור ולהעתיק את הקישור שמופיע מעל.' : 'The browser blocked copying. Select and copy the link shown above.');
    }
  };

  const share = async (journey: Journey) => {
    const url = absoluteUrl(journey.path);
    const text = `${journey.whatsapp} ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: journey.title, text, url });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-[24px] border border-[#B8842F]/35 bg-[#102E38] px-5 py-7 text-[#F7F2EA] shadow-[0_21px_55px_rgba(8,31,40,.12)] sm:px-8 sm:py-9">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#F0C96F]">
          {he ? 'שיתוף והצטרפות' : 'Share & onboarding'}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl sm:text-4xl">
          {he ? 'כל מסלול ברור, מוכן לנייד וניתן לשיתוף' : 'Every journey is clear, mobile-ready, and shareable'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
          {he
            ? 'מכאן מנהלים יכולים להבין בדיוק מה הלקוח או בעל המקצוע רואים, לפתוח את המסלול לבדיקה ולשתף את הקישור הנכון.'
            : 'Admins can see exactly what customers and providers experience, preview each journey, and share the correct link.'}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {journeys.map((journey) => {
          const Icon = journey.icon;
          return (
            <Card key={journey.id} className="min-w-0 border-[#D8D0C6] bg-[#FBF8F3]">
              <CardHeader className="space-y-4 p-5 sm:p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDE9E7] text-[#174E57]">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-[#173F46]">{journey.title}</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-[#756D64]">{journey.description}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 p-5 pt-0 sm:p-6 sm:pt-0">
                <ol className="space-y-3">
                  {journey.steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3 rounded-xl border border-[#E3DBD1] bg-white p-3 text-sm text-[#405155]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#174E57] text-[11px] font-bold text-white">{index + 1}</span>
                      <span className="min-w-0 flex-1 leading-6">{step}</span>
                      {index < journey.steps.length - 1 ? <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#B8842F] rtl:rotate-180" /> : <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />}
                    </li>
                  ))}
                </ol>

                <div className="rounded-xl bg-[#EEE8DF] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#786F65]">{he ? 'קישור לשיתוף' : 'Shareable link'}</p>
                  <p className="mt-1 break-all text-xs text-[#173F46]" dir="ltr">{absoluteUrl(journey.path)}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <Button onClick={() => share(journey)} className="w-full bg-[#174E57]">
                    <Share2 className="me-2 h-4 w-4" />{he ? 'שיתוף' : 'Share'}
                  </Button>
                  <Button onClick={() => copyLink(journey)} variant="outline" className="w-full border-[#B8842F]/50">
                    <Copy className="me-2 h-4 w-4" />{he ? 'העתקה' : 'Copy'}
                  </Button>
                  <Button asChild variant="outline" className="w-full border-[#B8842F]/50">
                    <a href={journey.path} target="_blank" rel="noreferrer">
                      <ExternalLink className="me-2 h-4 w-4" />{he ? 'תצוגה' : 'Preview'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-[#C9D8D4] bg-[#E6EFEC]">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#174E57]" />
            <div>
              <p className="font-semibold text-[#173F46]">{he ? 'המערכת לא שולחת דבר בלי פעולה של מנהל' : 'Nothing is sent without an admin action'}</p>
              <p className="mt-1 text-sm leading-6 text-[#5B6E6A]">{he ? 'כפתור השיתוף פותח את תפריט השיתוף של המכשיר או את WhatsApp. תמיד אפשר לבדוק את הקישור לפני השליחה.' : 'The share button opens the device share menu or WhatsApp. You can always preview the link before sending it.'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
