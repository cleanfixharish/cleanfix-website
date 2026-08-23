import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="border-t border-[#b8842f]/45 bg-[#081f28] text-[#f7f2ea]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="public-grid grid min-w-0 grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <img
              src="/assets/brand/cf-gold-wordmark-master.png"
              alt="CleanFix Harish"
              width={260}
              height={96}
              loading="lazy"
              className="mb-3 h-24 w-auto max-w-full rounded-2xl object-contain object-start sm:max-w-[260px]"
            />
            <p className="max-w-xs text-sm text-[#e8d8be]/75">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[#f0c96f]">{lang === 'en' ? 'Quick Links' : 'קישורים מהירים'}</h2>
            <div className="flex flex-col gap-2">
              <Link to="/services" className="text-sm text-[#e8d8be]/70 transition-colors hover:text-white">
                {t.nav.services}
              </Link>
              <Link to="/quote" className="text-sm text-[#e8d8be]/70 transition-colors hover:text-white">
                {t.nav.getQuote}
              </Link>
              <Link to="/gardening" className="text-sm text-[#e8d8be]/70 transition-colors hover:text-white">
                {lang === 'en' ? 'Gardening & landscape design' : 'גינון ועיצוב נוף'}
              </Link>
              <Link to="/how-we-work" className="text-sm text-[#e8d8be]/70 transition-colors hover:text-white">
                {lang === 'en' ? 'How CleanFix works' : 'איך CleanFix עובדת'}
              </Link>
              <Link to="/partners" className="text-sm text-[#e8d8be]/70 transition-colors hover:text-white">
                {t.nav.partners}
              </Link>
              <Link to="/local-partners" className="text-sm text-[#e8d8be]/70 transition-colors hover:text-white">
                {lang === 'en' ? 'Complementary local businesses' : 'עסקים מקומיים משלימים'}
              </Link>
              <Link to="/about" className="text-sm text-[#e8d8be]/70 transition-colors hover:text-white">
                {t.nav.about}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[#f0c96f]">{t.contact.title}</h2>
            <div className="flex flex-col gap-3">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#e8d8be]/70 transition-colors hover:text-white"
                dir="ltr"
              >
                <MessageCircle className="h-4 w-4" />
                050-827-5505
              </a>
              <a
                href="tel:0508275505"
                className="flex items-center gap-2 text-sm text-[#e8d8be]/70 transition-colors hover:text-white"
                dir="ltr"
              >
                <Phone className="h-4 w-4" />
                050-827-5505
              </a>
              <a
                href="mailto:info@cleanfixharish.co.il"
                className="flex items-center gap-2 text-sm text-[#e8d8be]/70 transition-colors hover:text-white"
                dir="ltr"
              >
                <Mail className="h-4 w-4" />
                info@cleanfixharish.co.il
              </a>
            </div>

            {/* Social Media */}
            <h2 className="mb-3 mt-6 text-sm font-semibold text-[#f0c96f]">{lang === 'en' ? 'Follow Us' : 'עקבו אחרינו'}</h2>
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com/cleanfixharish"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center text-[#e8d8be]/70 transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/cleanfixharish"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center text-[#e8d8be]/70 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/CleanFixHarish"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center text-[#e8d8be]/70 transition-colors hover:text-white"
                aria-label="X (Twitter)"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <div className="mb-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
            <a href="/legal/customer-service-terms-en.pdf" download className="text-[#e8d8be]/70">Customer terms EN</a>
            <a href="/legal/customer-service-terms-he.pdf" download className="text-[#e8d8be]/70">תנאי שירות</a>
            <a href="/legal/privacy-notice-en.pdf" download className="text-[#e8d8be]/70">Privacy EN</a>
            <a href="/legal/privacy-notice-he.pdf" download className="text-[#e8d8be]/70">פרטיות</a>
            <a href="/legal/provider-principles-en.pdf" download className="text-[#e8d8be]/70">Provider principles EN</a>
            <a href="/legal/provider-principles-he.pdf" download className="text-[#e8d8be]/70">עקרונות ספקים</a>
          </div>
          <p className="text-xs text-[#e8d8be]/60">
            © {new Date().getFullYear()} CleanFixHarish. {t.footer.rights}.
          </p>
          <p className="mt-1 text-xs text-[#e8d8be]/60">
            {lang === 'en' ? 'Harish, Israel' : 'חריש, ישראל'} •{' '}
            <a href="https://www.cleanfixharish.co.il" className="hover:text-primary transition-colors" dir="ltr">
              www.cleanfixharish.co.il
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
