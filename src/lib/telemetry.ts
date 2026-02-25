type TelemetryPayload = Record<string, string | number | boolean | null>

declare global {
  interface Window {
    va?: {
      track?: (eventName: string, payload?: TelemetryPayload) => void
    }
  }
}

export function trackTelemetry(eventName: string, payload: TelemetryPayload = {}) {
  if (typeof window === 'undefined') return

  try {
    if (typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent(`classiccar:${eventName}`, { detail: payload }))
    }
  } catch {
    // Ignore event dispatch failures on restrictive browsers.
  }

  if (typeof window.va?.track === 'function') {
    try {
      window.va.track(eventName, payload)
    } catch {
      // Ignore telemetry transport failures.
    }
  }

  if (import.meta.env.DEV) {
    console.info(`[telemetry] ${eventName}`, payload)
  }
}
