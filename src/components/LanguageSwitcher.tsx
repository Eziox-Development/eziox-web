import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  isValidLanguage,
  type SupportedLanguage,
} from '@/lib/i18n'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const currentLanguage = (
    isValidLanguage(i18n.language) ? i18n.language : 'en'
  ) as SupportedLanguage

  const handleLanguageChange = (lang: SupportedLanguage) => {
    void i18n.changeLanguage(lang)

    const currentPath = location.pathname
    const pathSegments = currentPath.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]

    const isPublicPage = firstSegment && isValidLanguage(firstSegment)

    if (isPublicPage) {
      void navigate({ to: '/' })
    } else {
      return
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {LANGUAGE_FLAGS[currentLanguage]} {LANGUAGE_NAMES[currentLanguage]}
          </span>
          <span className="sm:hidden">{LANGUAGE_FLAGS[currentLanguage]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={currentLanguage === lang ? 'bg-accent' : ''}
          >
            <span className="mr-2">{LANGUAGE_FLAGS[lang]}</span>
            {LANGUAGE_NAMES[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
