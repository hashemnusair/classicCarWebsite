import { useEffect } from 'react'
import Hero from '../components/home/Hero'
import FeaturedInventory from '../components/home/FeaturedInventory'
import BrandProof from '../components/home/BrandProof'
import { INVENTORY_PREFETCH_IDLE_TIMEOUT_MS } from '../config/performance'

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

    let didPrefetch = false
    let timeoutId: number | undefined
    let idleCallbackId: number | undefined

    const runPrefetch = () => {
      if (didPrefetch) return
      didPrefetch = true
      void import('./Inventory')
    }

    const onFirstInteraction = () => {
      runPrefetch()
      removeInteractionListeners()
    }

    const removeInteractionListeners = () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('touchstart', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
      window.removeEventListener('scroll', onFirstInteraction)
    }

    window.addEventListener('pointerdown', onFirstInteraction, { passive: true, once: true })
    window.addEventListener('touchstart', onFirstInteraction, { passive: true, once: true })
    window.addEventListener('keydown', onFirstInteraction, { once: true })
    window.addEventListener('scroll', onFirstInteraction, { passive: true, once: true })

    if (typeof window.requestIdleCallback === 'function') {
      idleCallbackId = window.requestIdleCallback(runPrefetch, {
        timeout: INVENTORY_PREFETCH_IDLE_TIMEOUT_MS,
      })
    } else {
      timeoutId = window.setTimeout(runPrefetch, INVENTORY_PREFETCH_IDLE_TIMEOUT_MS)
    }

    return () => {
      removeInteractionListeners()
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      if (idleCallbackId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleCallbackId)
      }
    }
  }, [])

  return (
    <>
      <Hero />
      <FeaturedInventory />
      <BrandProof />
    </>
  )
}
