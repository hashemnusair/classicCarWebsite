import { useEffect } from 'react'
import Hero from '../components/home/Hero'
import FeaturedInventory from '../components/home/FeaturedInventory'
import BrandProof from '../components/home/BrandProof'

function canPrefetchInventory() {
  if (typeof navigator === 'undefined') return false

  const connection = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean
        effectiveType?: string
      }
    }
  ).connection

  if (!connection) return true
  if (connection.saveData) return false
  return !['slow-2g', '2g'].includes(connection.effectiveType ?? '')
}

export default function Home() {
  useEffect(() => {
    if (!canPrefetchInventory()) return

    const timeoutId = window.setTimeout(() => {
      void import('./Inventory')
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <>
      <Hero />
      <FeaturedInventory />
      <BrandProof />
    </>
  )
}
