export const HERO_PERFORMANCE_RECOVERY_ENABLED =
  import.meta.env.VITE_HERO_PERFORMANCE_RECOVERY !== 'false'

export const HERO_AUTOPLAY_ATTEMPT_WINDOW_MS = 5000
export const HERO_AUTOPLAY_RETRY_INTERVAL_MS = 700

export const MOBILE_PERFORMANCE_QUERY = '(max-width: 1024px)'
export const MOBILE_PORTRAIT_QUERY = '(max-width: 767px) and (orientation: portrait)'
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const INVENTORY_PREFETCH_IDLE_TIMEOUT_MS = 4000
