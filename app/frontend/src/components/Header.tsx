import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe, MessageCircle, Download, Share, Plus, Smartphone, X, UserRound } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { useAuth } from '@/contexts/AuthContext';
import { requestPwaInstall, subscribeToPwaInstall } from '@/lib/pwaInstall';

export default function Header() {
  const { t, lang, setLang, dir } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [nativeInstallReady, setNativeInstallReady] = useState(false);
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

    return subscribeToPwaInstall(({ prompt, installed }) => {
      setNativeInstallReady(Boolean(prompt));
      setIsInstalled(installed);
      if (installed) setShowModal(false);
    });
  }, []);

  const handleInstallClick = useCallback(async () => {
    // If we have the native prompt (Android/Desktop Chrome), use it directly — one click!
    if (nativeInstallReady) {
      const outcome = await requestPwaInstall();
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      return;
    }

    // Otherwise show the instruction modal
    setShowModal(true);
  }, [nativeInstallReady]);

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
      <header className="sticky top-0 z-50 w-full border-b border-[#b8842f]/35 bg-[#f7f2ea]/95 shadow-[0_4px_21px_rgba(8,31,40,.05)] backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="CleanFixHarish home">
            <span className="cf-logo-shine"><img src="/assets/brand/cf-home-support-emblem-256.png" alt="" className="h-14 w-14 rounded-[17px] shadow-[0_5px_16px_rgba(8,31,40,.18)]" /></span>
            <span className="hidden sm:block">
              <span className="block text-[1.35rem] font-semibold leading-none text-[#102e38]" style={{ fontFamily: 'Cormorant Garamond, Noto Serif Hebrew, serif' }}>CleanFixHarish</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.18em] text-[#95651f]">Home support · Harish</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`rounded-md border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'border-[#b8842f] bg-[#e8d8be]/60 text-[#102e38]'
                    : 'border-transparent text-[#435a5f] hover:border-[#c49332]/60 hover:bg-[#e8d8be]/35 hover:text-[#102e38]'
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
                className="gap-1.5 border-[#b8842f]/45 bg-[#fbf8f3] text-[#102e38] transition-all hover:border-[#b8842f]/70 hover:bg-[#e8d8be]/45 hover:text-[#102e38]"
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
              <Button size="sm" className="gap-1.5 bg-[#102e38] text-[#f7f2ea] hover:bg-[#163f49]">
                <MessageCircle className="h-4 w-4 text-[#f0c96f]" />
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
              <Button size="sm" variant="outline" className="gap-1.5 border-[#b8842f]/55 bg-[#fbf8f3]">
                <UserRound className="h-4 w-4" />
                <span className="hidden xl:inline">{user ? (lang === 'en' ? 'My dashboard' : 'האזור שלי') : (lang === 'en' ? 'Join / Sign in' : 'הרשמה / כניסה')}</span>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={dir === 'rtl' ? 'right' : 'left'} className="w-72 border-[#b8842f]/35 bg-[#f7f2ea]">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-lg border-s-4 px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'border-[#b8842f] bg-[#e8d8be]/55 text-[#102e38]'
                          : 'border-transparent text-muted-foreground hover:border-[#c49332]/55 hover:bg-muted/50 hover:text-foreground'
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
                    <Button variant="outline" className="w-full gap-2 border-[#b8842f]/50 text-[#102e38] hover:bg-[#e8d8be]/50">
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
          <div className="relative w-full max-w-sm animate-in rounded-[21px] border border-[#b8842f]/40 bg-[#f7f2ea] p-6 shadow-2xl duration-200 zoom-in-95">
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
