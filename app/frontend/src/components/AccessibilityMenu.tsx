import { useEffect, useState } from 'react';
import { Accessibility, AudioLines, Check, Contrast, Eye, Link2, MousePointer2, RotateCcw, Rows3, Square, Text, Type, Volume2, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

type Preferences = { largeText: boolean; highContrast: boolean; underlineLinks: boolean; reduceMotion: boolean; readableFont: boolean; grayscale: boolean; textSpacing: boolean; largePointer: boolean; describeControls: boolean };
const defaults: Preferences = { largeText: false, highContrast: false, underlineLinks: false, reduceMotion: false, readableFont: false, grayscale: false, textSpacing: false, largePointer: false, describeControls: false };

export default function AccessibilityMenu() {
  const { lang, dir } = useLanguage();
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem('cleanfix_accessibility') || '{}') }; }
    catch { return defaults; }
  });
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('a11y-large-text', prefs.largeText);
    root.classList.toggle('a11y-high-contrast', prefs.highContrast);
    root.classList.toggle('a11y-underline-links', prefs.underlineLinks);
    root.classList.toggle('a11y-reduce-motion', prefs.reduceMotion);
    root.classList.toggle('a11y-readable-font', prefs.readableFont);
    root.classList.toggle('a11y-grayscale', prefs.grayscale);
    root.classList.toggle('a11y-text-spacing', prefs.textSpacing);
    root.classList.toggle('a11y-large-pointer', prefs.largePointer);
    localStorage.setItem('cleanfix_accessibility', JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  useEffect(() => {
    if (!prefs.describeControls || !('speechSynthesis' in window)) return;
    let timer = 0;
    let lastSpoken = '';
    const describe = (event: Event) => {
      const node = event.target instanceof Element ? event.target.closest('button, a, img, [role="button"], [aria-label]') : null;
      if (!node || node.closest('input, textarea, select')) return;
      const text = (node.getAttribute('aria-label') || node.getAttribute('alt') || node.getAttribute('title') || node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 220);
      if (!text || text === lastSpoken) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'he' ? 'he-IL' : 'en-US';
        utterance.rate = 0.95;
        lastSpoken = text;
        window.speechSynthesis.speak(utterance);
      }, 550);
    };
    const cancelPending = () => window.clearTimeout(timer);
    document.addEventListener('mouseover', describe);
    document.addEventListener('focusin', describe);
    document.addEventListener('mouseout', cancelPending);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseover', describe);
      document.removeEventListener('focusin', describe);
      document.removeEventListener('mouseout', cancelPending);
      window.speechSynthesis.cancel();
    };
  }, [prefs.describeControls, lang]);

  const readPage = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const source = document.querySelector('main')?.textContent || document.body.textContent || '';
    const utterance = new SpeechSynthesisUtterance(source.replace(/\s+/g, ' ').trim());
    utterance.lang = lang === 'he' ? 'he-IL' : 'en-US';
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };

  const copy = lang === 'he'
    ? {
        open: 'פתיחת אפשרויות נגישות',
        title: 'נגישות',
        heading: 'אפשרויות נגישות',
        description: 'התאימו את התצוגה במכשיר הזה בלי לשנות את החשבון. ההגדרות נשמרות בדפדפן הזה.',
        information: 'מידע על נגישות',
        reset: 'איפוס',
        read: 'הקראת העמוד',
        stop: 'עצירת הקראה',
        options: [
          ['largeText', Text, 'טקסט גדול יותר', 'הגדלת גודל הטקסט הבסיסי'],
          ['highContrast', Contrast, 'ניגודיות גבוהה', 'חיזוק הניגודיות של טקסט ומשטחים'],
          ['underlineLinks', Link2, 'קו תחתון לקישורים', 'הקלה בזיהוי קישורים'],
          ['reduceMotion', ZapOff, 'הפחתת תנועה', 'צמצום אנימציות ומעברים'],
          ['readableFont', Type, 'גופן קריא', 'החלפת גופנים דקורטיביים בגופן פשוט'],
          ['grayscale', Eye, 'גווני אפור', 'הסרת צבעים מהתצוגה'],
          ['textSpacing', Rows3, 'ריווח טקסט', 'הגדלת המרווח בין אותיות ושורות'],
          ['largePointer', MousePointer2, 'סמן גדול', 'הגדלת סמן העכבר'],
          ['describeControls', AudioLines, 'תיאור קולי', 'הקראת כפתורים, קישורים ותמונות במעבר או במיקוד'],
        ],
      }
    : {
        open: 'Open accessibility options',
        title: 'Accessibility',
        heading: 'Accessibility options',
        description: 'Adjust this device without changing your account. Settings stay in this browser.',
        information: 'Accessibility information',
        reset: 'Reset',
        read: 'Read this page aloud',
        stop: 'Stop reading',
        options: [
          ['largeText', Text, 'Larger text', 'Increase the base text size'],
          ['highContrast', Contrast, 'Higher contrast', 'Strengthen text and surface contrast'],
          ['underlineLinks', Link2, 'Underline links', 'Make links easier to identify'],
          ['reduceMotion', ZapOff, 'Reduce motion', 'Limit animations and transitions'],
          ['readableFont', Type, 'Readable font', 'Replace decorative type with a simple font'],
          ['grayscale', Eye, 'Grayscale', 'Remove color from the display'],
          ['textSpacing', Rows3, 'Text spacing', 'Increase letter and line spacing'],
          ['largePointer', MousePointer2, 'Large pointer', 'Make the mouse pointer easier to see'],
          ['describeControls', AudioLines, 'Spoken descriptions', 'Describe buttons, links and images on hover or keyboard focus'],
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
      <DialogContent className="max-h-[88dvh] max-w-md overflow-y-auto border-[#D8D0C6] bg-[#FBF8F3]" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#173F46]">
            <Accessibility className="h-5 w-5" />
            {copy.heading}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-6 text-[#756D64]">{copy.description}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" onClick={readPage} disabled={speaking} className="bg-[#174E57] hover:bg-[#103A41]">
            <Volume2 className="me-2 h-4 w-4" />{copy.read}
          </Button>
          <Button type="button" variant="outline" onClick={stopReading} disabled={!speaking}>
            <Square className="me-2 h-3.5 w-3.5" />{copy.stop}
          </Button>
        </div>
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
          <Button variant="ghost" size="sm" onClick={() => { stopReading(); setPrefs(defaults); }}>
            <RotateCcw className="me-1.5 h-4 w-4" />
            {copy.reset}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
