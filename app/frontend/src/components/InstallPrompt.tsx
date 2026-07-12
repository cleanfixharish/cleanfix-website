import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function InstallPrompt() {
  const { lang } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Detect platform
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const android = /Android/.test(ua);
    setPlatform(ios ? 'ios' : android ? 'android' : 'desktop');

    // Check if user dismissed before (don't show again for 3 days)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) return;
    }

    // For Android/Desktop: listen for beforeinstallprompt
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 5 seconds
      setTimeout(() => setShowBanner(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS: show banner after 8 seconds
    if (ios) {
      setTimeout(() => setShowBanner(true), 8000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (isStandalone || !showBanner) return null;

  const text = {
    en: {
      title: 'Get the CleanFix App',
      subtitle: 'Install for instant access — no app store needed!',
      install: 'Install Now',
      iosTitle: 'Add CleanFix to Home Screen',
      iosStep1: 'Tap the Share button',
      iosStep2: 'Then tap "Add to Home Screen"',
      gotIt: 'Got it!',
    },
    he: {
      title: 'התקן את CleanFix',
      subtitle: 'גישה מיידית — ללא חנות אפליקציות!',
      install: 'התקן עכשיו',
      iosTitle: 'הוסף CleanFix למסך הבית',
      iosStep1: 'לחץ על כפתור השיתוף',
      iosStep2: 'ואז לחץ "הוסף למסך הבית"',
      gotIt: 'הבנתי!',
    },
  };

  const t = text[lang];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border/60 p-4 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-[#25D366] to-primary" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pt-1">
          {/* App icon */}
          <div className="w-14 h-14 rounded-xl shadow-md shrink-0 bg-primary/10 flex items-center justify-center overflow-hidden">
            <img
              src="/icons/icon-192x192.png"
              alt="CleanFix"
              className="w-14 h-14 rounded-xl object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-foreground leading-tight">
              {platform === 'ios' ? t.iosTitle : t.title}
            </h3>

            {/* iOS instructions */}
            {platform === 'ios' ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Share className="h-3 w-3 text-primary" />
                  </div>
                  <span>{t.iosStep1}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Plus className="h-3 w-3 text-primary" />
                  </div>
                  <span>{t.iosStep2}</span>
                </div>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full text-xs h-8"
                >
                  {t.gotIt}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  {t.subtitle}
                </p>
                {deferredPrompt ? (
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="mt-3 w-full gap-2 text-xs h-9 font-semibold"
                  >
                    <Download className="h-4 w-4" />
                    {t.install}
                  </Button>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                    <Smartphone className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      {lang === 'en'
                        ? 'Look for the install icon (⊕) in your browser\'s address bar'
                        : 'חפש את סמל ההתקנה (⊕) בשורת הכתובת של הדפדפן'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}