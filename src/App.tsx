import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/layout/Layout'

const Home = lazy(() => import('./pages/Home'))
const Inventory = lazy(() => import('./pages/Inventory'))
const VehicleDetails = lazy(() => import('./pages/VehicleDetails'))
const About = lazy(() => import('./pages/About'))
const Branches = lazy(() => import('./pages/Branches'))
const Contact = lazy(() => import('./pages/Contact'))

function SpeedInsightsTracker() {
  const location = useLocation()
  const route = `${location.pathname}${location.search}${location.hash}`

  return <SpeedInsights route={route} />
}

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <span className="text-xs tracking-[0.2em] uppercase text-cc-gray-400">Loading...</span>
    </div>
  )
}

function withRouteSuspense(page: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{page}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SpeedInsightsTracker />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={withRouteSuspense(<Home />)} />
            <Route path="/inventory" element={withRouteSuspense(<Inventory />)} />
            <Route path="/inventory/:slug" element={withRouteSuspense(<VehicleDetails />)} />
            <Route path="/about" element={withRouteSuspense(<About />)} />
            <Route path="/branches" element={withRouteSuspense(<Branches />)} />
            <Route path="/contact" element={withRouteSuspense(<Contact />)} />
          </Route>
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  )
}
