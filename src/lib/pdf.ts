import type { Language } from '../types'

export interface VehiclePdfRequest {
  slug: string
  lang: Language
}

export interface VehiclePdfResponse {
  blob: Blob
  filename: string
}

function parseFilename(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) return fallback

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).replace(/[/\\?%*:|"<>]/g, '-')
    } catch {
      return utf8Match[1]
    }
  }

  const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
  if (asciiMatch?.[1]) {
    return asciiMatch[1].replace(/[/\\?%*:|"<>]/g, '-')
  }

  return fallback
}

export async function getVehiclePdf({ slug, lang }: VehiclePdfRequest): Promise<VehiclePdfResponse> {
  const params = new URLSearchParams({
    slug,
    lang,
  })

  const response = await fetch(`/api/vehicle-pdf?${params.toString()}`, {
    method: 'GET',
  })

  if (!response.ok) {
    let message = 'Failed to generate PDF'
    try {
      const json = await response.json() as { error?: string }
      if (json?.error) message = json.error
    } catch {
      // Ignore JSON parsing failures.
    }
    throw new Error(message)
  }

  const blob = await response.blob()
  const fallback = `${slug}-${lang}.pdf`
  const filename = parseFilename(response.headers.get('content-disposition'), fallback)
  return { blob, filename }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function openBlobInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (!opened) {
    URL.revokeObjectURL(url)
    return false
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 60_000)

  return true
}

export function canNativeShareFile(file: File) {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false
  if (typeof navigator.canShare !== 'function') return false
  return navigator.canShare({ files: [file] })
}

export async function shareFile(file: File, title: string, text?: string) {
  await navigator.share({
    title,
    text,
    files: [file],
  })
}
