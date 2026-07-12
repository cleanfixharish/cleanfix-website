import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/assets/logo.png" alt="CleanFixHarish" className="w-9 h-9 rounded-full object-cover" />
              <span className="font-semibold text-lg" style={{ fontFamily: 'Lora, serif' }}>
                CleanFixHarish
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{lang === 'en' ? 'Quick Links' : 'קישורים מהירים'}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.services}
              </Link>
              <Link to="/quote" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.getQuote}
              </Link>
              <Link to="/partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.partners}
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.about}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{t.contact.title}</h4>
            <div className="flex flex-col gap-3">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                050-827-5505
              </a>
              <a
                href="tel:+972508275505"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                050-827-5505
              </a>
              <a
                href="mailto:info@cleanfixharish.co.il"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@cleanfixharish.co.il
              </a>
            </div>

            {/* Social Media */}
            <h4 className="font-semibold text-sm mb-3 mt-6">{lang === 'en' ? 'Follow Us' : 'עקבו אחרינו'}</h4>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com/cleanfixharish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#1877F2] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/cleanfixharish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#E4405F] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/CleanFixHarish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CleanFixHarish. {t.footer.rights}.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === 'en' ? 'Harish, Israel' : 'חריש, ישראל'} •{' '}
            <a href="https://www.cleanfix.co.il" className="hover:text-primary transition-colors">
              www.cleanfix.co.il
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}