import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const navLinks = [
  { path: '/', key: 'nav.home' },
  { path: '/inventory', key: 'nav.inventory' },
  { path: '/about', key: 'nav.company' },
  { path: '/branches', key: 'nav.branches' },
  { path: '/contact', key: 'nav.contact' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { t, toggleLanguage, lang } = useLanguage()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ${
          isScrolled
            ? 'bg-cc-black/90 backdrop-blur-xl border-white/[0.03] shadow-2xl shadow-black/50'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="relative z-10 flex items-center gap-2 shrink-0">
              <img
                src="/logo-transparent.png"
                alt="Classic Car"
                className="h-[12rem] md:h-[14rem] w-auto mt-0.5"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => {
                const isActive = location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path))
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                      isActive
                        ? 'text-cc-red-light'
                        : 'text-cc-gray-200 hover:text-cc-white'
                    }`}
                  >
                    {t(link.key)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cc-red rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right side: Language + Mobile menu */}
            <div className="flex items-center gap-3">
              {/* Language Toggle - desktop only (mobile version is in burger menu) */}
              <button
                onClick={toggleLanguage}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs tracking-wider text-cc-gray-200 hover:text-cc-white transition-colors border border-transparent hover:border-cc-black-500 cursor-pointer"
              >
                <Globe size={14} />
                <span className="font-medium">{t('lang.toggle')}</span>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden relative flex items-center justify-center w-10 h-10 -mt-0.5 text-cc-white cursor-pointer"
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                <span
                  className={`absolute h-[2px] w-5 rounded-full bg-current transform-gpu transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] ${
                    mobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-[7px]'
                  }`}
                />
                <span
                  className={`absolute h-[2px] w-5 rounded-full bg-current transform-gpu transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] ${
                    mobileOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                  }`}
                />
                <span
                  className={`absolute h-[2px] w-5 rounded-full bg-current transform-gpu transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] ${
                    mobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[7px]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-cc-black/98 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              {navLinks.map((link, i) => {
                const isActive = location.pathname === link.path
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-8 py-4 text-center font-display text-lg tracking-[0.2em] uppercase transition-colors ${
                        isActive ? 'text-cc-red-light' : 'text-cc-gray-200'
                      }`}
                    >
                      {t(link.key)}
                    </Link>
                  </motion.div>
                )
              })}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 w-12 h-[1px] bg-cc-red"
              />
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={toggleLanguage}
                className="mt-4 flex items-center gap-2 text-cc-gray-300 text-sm tracking-wider cursor-pointer"
              >
                <Globe size={16} />
                {lang === 'en' ? 'العربية' : 'English'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
