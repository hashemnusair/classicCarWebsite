import { useEffect, useState } from 'react'
import { MOBILE_PERFORMANCE_QUERY } from '../config/performance'

const getMatch = (query: string) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches

export function useIsMobilePerformanceMode() {
  const [isMobilePerformanceMode, setIsMobilePerformanceMode] = useState(() =>
    getMatch(MOBILE_PERFORMANCE_QUERY),
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(MOBILE_PERFORMANCE_QUERY)

    const sync = () => {
      setIsMobilePerformanceMode(media.matches)
    }

    sync()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }

    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [])

  return isMobilePerformanceMode
}
