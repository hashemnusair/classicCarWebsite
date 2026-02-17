import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import VehicleDetails from './pages/VehicleDetails'
import About from './pages/About'
import Branches from './pages/Branches'
import Contact from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
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
