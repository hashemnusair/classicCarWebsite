import { en } from './en'
import { ar } from './ar'
import type { Language } from '../types'

const translations = { en, ar }

export function t(lang: Language, path: string): string {
  const keys = path.split('.')
  let value: unknown = translations[lang]
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof value === 'string' ? value : path
}

export { en, ar }
