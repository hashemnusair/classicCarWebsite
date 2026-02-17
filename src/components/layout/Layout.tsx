import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useLanguage } from '../../context/LanguageContext'

export default function Layout() {
  const location = useLocation()
  const { dir } = useLanguage()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div dir={dir} className="min-h-screen flex flex-col bg-cc-black overflow-x-hidden">
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />

      <Header />

      <main className="flex-1">
        <div className="page-enter" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}
