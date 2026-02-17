import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { siteConfig } from '../../data/branches'

export default function Footer() {
  const { t, lang } = useLanguage()

  return (
    <footer className="relative bg-cc-black-900 border-t border-white/[0.03]">
      {/* Top divider */}
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-5">
              <img src="/logo-transparent.png" alt="Classic Car" className="h-8 w-auto" />
            </Link>
            <p className="text-cc-gray-400 text-sm leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase text-cc-white mb-6">
              {t('footer.quickLinks')}
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { path: '/inventory', key: 'nav.inventory' },
                { path: '/about', key: 'nav.company' },
                { path: '/branches', key: 'nav.branches' },
                { path: '/contact', key: 'nav.contact' },
              ].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-cc-gray-400 hover:text-cc-red-light text-sm transition-colors duration-300"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase text-cc-white mb-6">
              {t('footer.contactInfo')}
            </h4>
            <div className="flex flex-col gap-4 text-sm text-cc-gray-400">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-3 hover:text-cc-white transition-colors"
              >
                <Phone size={15} className="text-cc-red shrink-0" />
                <span dir="ltr">{siteConfig.phone}</span>
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-3 hover:text-cc-white transition-colors"
              >
                <Mail size={15} className="text-cc-red shrink-0" />
                {siteConfig.email}
              </a>
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-cc-red shrink-0 mt-0.5" />
                <span>{lang === 'ar' ? 'عمّان، الأردن' : 'Amman, Jordan'}</span>
              </div>
            </div>
          </div>

          {/* Working Hours + Social */}
          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase text-cc-white mb-6">
              {t('footer.workingHours')}
            </h4>
            <p className="text-cc-gray-400 text-sm mb-8">
              {t('footer.workingHoursText')}
            </p>

            <h4 className="font-display text-xs tracking-[0.2em] uppercase text-cc-white mb-4">
              {t('footer.followUs')}
            </h4>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded bg-cc-black-700 border border-cc-black-500 text-cc-gray-400 hover:text-cc-red-light hover:border-cc-red/30 transition-all duration-300"
              >
                <Instagram size={16} />
              </a>
              <a
                href={siteConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded bg-cc-black-700 border border-cc-black-500 text-cc-gray-400 hover:text-cc-red-light hover:border-cc-red/30 transition-all duration-300"
              >
                <Facebook size={16} />
              </a>
              <a
                href={siteConfig.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded bg-cc-black-700 border border-cc-black-500 text-cc-gray-400 hover:text-cc-red-light hover:border-cc-red/30 transition-all duration-300"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 10.86 4.46c1.68-1.7 2.14-3.48 2.14-5.58V8.15a8.27 8.27 0 0 0 4.85 1.56V6.27a4.85 4.85 0 0 1-1.41.42Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cc-gray-500 text-xs tracking-wider">
            &copy; {new Date().getFullYear()} Classic Car. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-2 text-cc-gray-500 text-xs">
            <span className="block w-1.5 h-1.5 rounded-full bg-cc-red" />
            <span className="tracking-wider uppercase">Amman, Jordan</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
