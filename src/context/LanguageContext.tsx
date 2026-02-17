import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Language } from '../types'
import { t } from '../i18n'

interface LanguageContextType {
  lang: Language
  dir: 'ltr' | 'rtl'
  toggleLanguage: () => void
  t: (path: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('classiccar-lang')
    return (saved === 'ar' ? 'ar' : 'en') as Language
  })

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const toggleLanguage = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'ar' : 'en'
      localStorage.setItem('classiccar-lang', next)
      return next
    })
  }, [])

  const translate = useCallback((path: string) => t(lang, path), [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  return (
    <LanguageContext.Provider value={{ lang, dir, toggleLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
