import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe, MessageCircle, Download, Share, Plus, Smartphone, X, UserRound } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { useAuth } from '@/contexts/AuthContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Header() {
  const { t, lang, setLang, dir } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const android = /Android/.test(ua);
    setPlatform(ios ? 'ios' : android ? 'android' : 'desktop');

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowModal(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    // If we have the native prompt (Android/Desktop Chrome), use it directly — one click!
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
      return;
    }

    // Otherwise show the instruction modal
    setShowModal(true);
  }, [installPrompt]);

  // Don't show install button if already installed
  if (isInstalled && !showModal) {
    // Still render the header, just without install button
  }

  const navItems = [
    { href: '/', label: t.nav.home },
    { href: '/services', label: t.nav.services },
    { href: '/how-it-works', label: t.nav.howItWorks },
    { href: '/why-trust-us', label: t.nav.whyTrustUs },
    { href: '/partners', label: t.nav.partners },
    { href: '/about', label: t.nav.about },
  ];

  const isActive = (path: string) => location.pathname === path;

  const installText = {
    en: {
      button: 'Install App',
      modalTitle: 'Install CleanFix',
      iosStep1: 'Tap the Share button at the bottom of Safari',
      iosStep2: 'Scroll down and tap "Add to Home Screen"',
      iosStep3: 'Tap "Add" to confirm',
      chromeStep1: 'Tap the three-dot menu (⋮) at the top right',
      chromeStep2: 'Tap "Install app" or "Add to Home Screen"',
      desktopStep1: 'Click the install icon (⊕) in the address bar',
      desktopStep2: 'Or use Menu → "Install CleanFix Harish..."',
      desktopNote: 'Works in Chrome, Edge, and other Chromium browsers',
      close: 'Close',
    },
    he: {
      button: 'התקן',
      modalTitle: 'התקן את CleanFix',
      iosStep1: 'לחץ על כפתור השיתוף בתחתית ספארי',
      iosStep2: 'גלול למטה ולחץ "הוסף למסך הבית"',
      iosStep3: 'לחץ "הוסף" לאישור',
      chromeStep1: 'לחץ על תפריט שלוש הנקודות (⋮) למעלה',
      chromeStep2: 'לחץ "התקן אפליקציה" או "הוסף למסך הבית"',
      desktopStep1: 'לחץ על סמל ההתקנה (⊕) בשורת הכתובת',
      desktopStep2: 'או השתמש בתפריט → "התקן את CleanFix Harish..."',
      desktopNote: 'עובד בכרום, אדג\', ודפדפני כרומיום אחרים',
      close: 'סגור',
    },
  };

  const it = installText[lang];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="CleanFixHarish" className="w-9 h-9 rounded-full object-cover" />
            <span className="font-semibold text-lg hidden sm:block" style={{ fontFamily: 'Lora, serif' }}>
              CleanFixHarish
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Install App Button — always visible unless installed */}
            {!isInstalled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstallClick}
                className="gap-1.5 border-primary/40 text-primary hover:text-primary hover:bg-primary/5 hover:border-primary/60 transition-all"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-semibold">
                  {it.button}
                </span>
              </Button>
            )}

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
              className="gap-1.5"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">{lang === 'en' ? 'עב' : 'EN'}</span>
            </Button>

            {/* WhatsApp CTA */}
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button size="sm" className="gap-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden md:inline">{t.hero.whatsapp}</span>
              </Button>
            </a>

            {/* Get Quote */}
            <Link to="/quote" className="hidden sm:inline-flex">
              <Button size="sm" variant="default">
                {t.nav.getQuote}
              </Button>
            </Link>

            <Link to={user?.role === 'admin' ? '/admin' : '/account'} className="hidden sm:inline-flex">
              <Button size="sm" variant="ghost" className="gap-1.5">
                <UserRound className="h-4 w-4" />
                <span className="hidden xl:inline">{user ? (lang === 'en' ? 'My account' : 'החשבון שלי') : (lang === 'en' ? 'Sign in' : 'כניסה')}</span>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={dir === 'rtl' ? 'right' : 'left'} className="w-72">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-primary bg-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <hr className="my-2" />
                  <Link to="/quote" onClick={() => setOpen(false)}>
                    <Button className="w-full">{t.nav.getQuote}</Button>
                  </Link>
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
                      <MessageCircle className="h-4 w-4" />
                      {t.hero.whatsapp}
                    </Button>
                  </a>
                  {!isInstalled && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                      onClick={() => { setOpen(false); handleInstallClick(); }}
                    >
                      <Download className="h-4 w-4" />
                      {it.button}
                    </Button>
                  )}
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full text-muted-foreground">
                      {t.nav.admin}
                    </Button>
                  </Link>
                  <Link to={user?.role === 'admin' ? '/admin' : '/account'} onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
                      <UserRound className="h-4 w-4" />
                      {user ? (lang === 'en' ? 'My account' : 'החשבון שלי') : (lang === 'en' ? 'Sign in or join' : 'כניסה או הרשמה')}
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Install Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-center mb-4">{it.modalTitle}</h2>

            {/* Platform-specific instructions */}
            <div className="space-y-3">
              {platform === 'ios' && (
                <>
                  <Step number={1} icon={<Share className="h-4 w-4 text-primary" />} text={it.iosStep1} />
                  <Step number={2} icon={<Plus className="h-4 w-4 text-primary" />} text={it.iosStep2} />
                  <Step number={3} icon={<Download className="h-4 w-4 text-primary" />} text={it.iosStep3} />
                </>
              )}
              {platform === 'android' && (
                <>
                  <Step number={1} icon={<Menu className="h-4 w-4 text-primary" />} text={it.chromeStep1} />
                  <Step number={2} icon={<Download className="h-4 w-4 text-primary" />} text={it.chromeStep2} />
                </>
              )}
              {platform === 'desktop' && (
                <>
                  <Step number={1} icon={<Download className="h-4 w-4 text-primary" />} text={it.desktopStep1} />
                  <Step number={2} icon={<Menu className="h-4 w-4 text-primary" />} text={it.desktopStep2} />
                  <p className="text-xs text-muted-foreground text-center mt-2 italic">{it.desktopNote}</p>
                </>
              )}
            </div>

            <Button
              onClick={() => setShowModal(false)}
              className="w-full mt-5"
              size="lg"
            >
              {it.close}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ number, icon, text }: { number: number; icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
        {number}
      </div>
      <div className="shrink-0">{icon}</div>
      <p className="text-sm text-foreground">{text}</p>
    </div>
  );
}
