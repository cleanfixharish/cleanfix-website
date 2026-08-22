import { useEffect, useState } from 'react';
import { Accessibility, Check, Contrast, Link2, RotateCcw, Text, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

type Preferences = { largeText: boolean; highContrast: boolean; underlineLinks: boolean; reduceMotion: boolean };
const defaults: Preferences = { largeText: false, highContrast: false, underlineLinks: false, reduceMotion: false };

export default function AccessibilityMenu() {
  const { lang, dir } = useLanguage();
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem('cleanfix_accessibility') || '{}') }; }
    catch { return defaults; }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('a11y-large-text', prefs.largeText);
    root.classList.toggle('a11y-high-contrast', prefs.highContrast);
    root.classList.toggle('a11y-underline-links', prefs.underlineLinks);
    root.classList.toggle('a11y-reduce-motion', prefs.reduceMotion);
    localStorage.setItem('cleanfix_accessibility', JSON.stringify(prefs));
  }, [prefs]);

  const copy = lang === 'he'
    ? {
        open: 'פתיחת אפשרויות נגישות',
        title: 'נגישות',
        heading: 'אפשרויות נגישות',
        description: 'התאימו את התצוגה במכשיר הזה בלי לשנות את החשבון. ההגדרות נשמרות בדפדפן הזה.',
        information: 'מידע על נגישות',
        reset: 'איפוס',
        options: [
          ['largeText', Text, 'טקסט גדול יותר', 'הגדלת גודל הטקסט הבסיסי'],
          ['highContrast', Contrast, 'ניגודיות גבוהה', 'חיזוק הניגודיות של טקסט ומשטחים'],
          ['underlineLinks', Link2, 'קו תחתון לקישורים', 'הקלה בזיהוי קישורים'],
          ['reduceMotion', ZapOff, 'הפחתת תנועה', 'צמצום אנימציות ומעברים'],
        ],
      }
    : {
        open: 'Open accessibility options',
        title: 'Accessibility',
        heading: 'Accessibility options',
        description: 'Adjust this device without changing your account. Settings stay in this browser.',
        information: 'Accessibility information',
        reset: 'Reset',
        options: [
          ['largeText', Text, 'Larger text', 'Increase the base text size'],
          ['highContrast', Contrast, 'Higher contrast', 'Strengthen text and surface contrast'],
          ['underlineLinks', Link2, 'Underline links', 'Make links easier to identify'],
          ['reduceMotion', ZapOff, 'Reduce motion', 'Limit animations and transitions'],
        ],
      };

  const options = copy.options as Array<[
    keyof Preferences,
    typeof Text,
    string,
    string,
  ]>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label={copy.open}
          title={copy.title}
          className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50 h-12 w-12 rounded-full bg-[#173F46] p-0 text-white shadow-lg hover:bg-[#0E343B] ${dir === 'rtl' ? 'right-6' : 'left-6'}`}
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-[#D8D0C6] bg-[#FBF8F3]" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#173F46]">
            <Accessibility className="h-5 w-5" />
            {copy.heading}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-6 text-[#756D64]">{copy.description}</p>
        <div className="space-y-2">
          {options.map(([key, Icon, title, detail]) => (
            <button
              key={key}
              onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })}
              aria-pressed={prefs[key]}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-start ${prefs[key] ? 'border-[#174E57] bg-[#E4ECEA]' : 'border-[#DDD3C7] bg-white'}`}
            >
              <Icon className="h-5 w-5 text-[#174E57]" />
              <span className="flex-1">
                <span className="block text-sm font-medium text-[#243538]">{title}</span>
                <span className="block text-xs text-[#786F65]">{detail}</span>
              </span>
              {prefs[key] && <Check className="h-4 w-4 text-[#174E57]" />}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <a href="/accessibility" className="text-sm font-medium text-[#174E57] underline underline-offset-4">
            {copy.information}
          </a>
          <Button variant="ghost" size="sm" onClick={() => setPrefs(defaults)}>
            <RotateCcw className="me-1.5 h-4 w-4" />
            {copy.reset}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
