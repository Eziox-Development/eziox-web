import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '@/locales/en.json'
import de from '@/locales/de.json'

export const SUPPORTED_LANGUAGES = ['en', 'de'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  de: 'Deutsch',
}

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'eziox-language',
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
}

export function getLanguageFromPath(
  pathname: string,
): SupportedLanguage | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && isValidLanguage(firstSegment)) {
    return firstSegment
  }

  return null
}

export function removeLanguageFromPath(pathname: string): string {
  const lang = getLanguageFromPath(pathname)
  if (lang) {
    return pathname.replace(new RegExp(`^/${lang}`), '') || '/'
  }
  return pathname
}

export function addLanguageToPath(
  pathname: string,
  lang: SupportedLanguage,
): string {
  const cleanPath = removeLanguageFromPath(pathname)
  if (lang === DEFAULT_LANGUAGE) {
    return cleanPath
  }
  return `/${lang}${cleanPath === '/' ? '' : cleanPath}`
}
