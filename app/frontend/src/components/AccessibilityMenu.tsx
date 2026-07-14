import { useEffect, useState } from 'react';
import { Accessibility, Check, Contrast, Link2, RotateCcw, Text, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Preferences = { largeText: boolean; highContrast: boolean; underlineLinks: boolean; reduceMotion: boolean };
const defaults: Preferences = { largeText: false, highContrast: false, underlineLinks: false, reduceMotion: false };

export default function AccessibilityMenu() {
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

  const options = [
    { key: 'largeText' as const, icon: Text, title: 'Larger text', detail: 'Increase the base text size' },
    { key: 'highContrast' as const, icon: Contrast, title: 'Higher contrast', detail: 'Strengthen text and surface contrast' },
    { key: 'underlineLinks' as const, icon: Link2, title: 'Underline links', detail: 'Make links easier to identify' },
    { key: 'reduceMotion' as const, icon: ZapOff, title: 'Reduce motion', detail: 'Limit animations and transitions' },
  ];

  return <Dialog><DialogTrigger asChild><Button aria-label="Open accessibility options" title="Accessibility" className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-[#173F46] p-0 text-white shadow-lg hover:bg-[#0E343B]"><Accessibility className="h-6 w-6"/></Button></DialogTrigger><DialogContent className="max-w-md border-[#D8D0C6] bg-[#FBF8F3]"><DialogHeader><DialogTitle className="flex items-center gap-2 text-[#173F46]"><Accessibility className="h-5 w-5"/>Accessibility options</DialogTitle></DialogHeader><p className="text-sm leading-6 text-[#756D64]">Adjust this device without changing your account. Settings stay in this browser.</p><div className="space-y-2">{options.map((option) => <button key={option.key} onClick={() => setPrefs({...prefs,[option.key]:!prefs[option.key]})} aria-pressed={prefs[option.key]} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${prefs[option.key] ? 'border-[#174E57] bg-[#E4ECEA]' : 'border-[#DDD3C7] bg-white'}`}><option.icon className="h-5 w-5 text-[#174E57]"/><span className="flex-1"><span className="block text-sm font-medium text-[#243538]">{option.title}</span><span className="block text-xs text-[#786F65]">{option.detail}</span></span>{prefs[option.key] && <Check className="h-4 w-4 text-[#174E57]"/>}</button>)}</div><div className="flex items-center justify-between"><a href="/accessibility" className="text-sm font-medium text-[#174E57] underline underline-offset-4">Accessibility information</a><Button variant="ghost" size="sm" onClick={() => setPrefs(defaults)}><RotateCcw className="mr-1.5 h-4 w-4"/>Reset</Button></div></DialogContent></Dialog>;
}
