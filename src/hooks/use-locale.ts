import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  DEFAULT_LANGUAGE,
  isValidLanguage,
  type SupportedLanguage,
} from '@/lib/i18n'

export function useLocale(): SupportedLanguage {
  const { i18n } = useTranslation()
  const params = useParams({ strict: false })

  // Try to get locale from URL params first
  if (
    params &&
    'locale' in params &&
    isValidLanguage(params.locale as string)
  ) {
    return params.locale as SupportedLanguage
  }

  // Fall back to i18n language
  if (isValidLanguage(i18n.language)) {
    return i18n.language
  }

  return DEFAULT_LANGUAGE
}

export function useLocalePath() {
  const locale = useLocale()

  return (path: string): string => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path

    // Return locale-prefixed path
    return `/${locale}/${cleanPath}`
  }
}
