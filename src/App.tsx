import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import VehicleDetails from './pages/VehicleDetails'
import About from './pages/About'
import Branches from './pages/Branches'
import Contact from './pages/Contact'

function SpeedInsightsTracker() {
  const location = useLocation()
  const route = `${location.pathname}${location.search}${location.hash}`

  return <SpeedInsights route={route} />
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SpeedInsightsTracker />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:slug" element={<VehicleDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  )
}
