import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  siteConfig,
  getThemeById,
  getDefaultTheme,
  type Theme,
  type ThemeCategory,
} from '@/lib/site-config'
import { hexToRgb } from '@/lib/utils'

interface ThemeContextType {
  theme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
  themesByCategory: Record<ThemeCategory, Theme[]>
  isTransitioning: boolean
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const STORAGE_KEY = 'eziox-theme'
const TRANSITION_MS = 250
const GOOGLE_FONTS_PRECONNECT = 'https://fonts.googleapis.com'
const GOOGLE_FONTS_STATIC = 'https://fonts.gstatic.com'

// Group themes by category for easier access
const themesByCategory = siteConfig.themes.reduce(
  (acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = []
    acc[theme.category].push(theme)
    return acc
  },
  {} as Record<ThemeCategory, Theme[]>,
)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getDefaultTheme())
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const t = getThemeById(saved)
      if (t) setThemeState(t)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const { colors, typography, effects } = theme

    const glowValues = {
      none: '0',
      subtle: '0.2',
      medium: '0.4',
      strong: '0.6',
    }
    const radiusValues = {
      sharp: '0.375rem',
      rounded: '0.75rem',
      pill: '1.25rem',
    }
    const animationValues = { slow: '400ms', normal: '250ms', fast: '150ms' }

    // All CSS variables for the theme
    const vars: Record<string, string> = {
      // Colors
      '--background': colors.background,
      '--background-secondary': colors.backgroundSecondary,
      '--foreground': colors.foreground,
      '--foreground-muted': colors.foregroundMuted,
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--accent': colors.accent,
      '--accent-foreground': colors.accentForeground,
      '--border': colors.border,
      '--card': colors.card,
      '--card-foreground': colors.cardForeground,
      // RGB values for opacity-based colors
      '--primary-rgb': hexToRgb(colors.primary),
      '--accent-rgb': hexToRgb(colors.accent),
      '--background-rgb': hexToRgb(colors.background),
      '--background-secondary-rgb': hexToRgb(colors.backgroundSecondary),
      '--foreground-rgb': hexToRgb(colors.foreground),
      '--foreground-muted-rgb': hexToRgb(colors.foregroundMuted),
      '--border-rgb': hexToRgb(colors.border),
      '--card-rgb': hexToRgb(colors.card),
      // Typography
      '--font-display': typography.displayFont,
      '--font-body': typography.bodyFont,
      // Effects
      '--theme-transition': `${TRANSITION_MS}ms ease-out`,
      '--glow-intensity': glowValues[effects.glowIntensity],
      '--radius': radiusValues[effects.borderRadius],
      '--card-style': effects.cardStyle,
      '--animation-speed': animationValues[effects.animationSpeed],
      // Theme metadata
      '--theme-id': theme.id,
      '--theme-category': theme.category,
      '--theme-is-premium': theme.isPremium ? '1' : '0',
    }

    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))

    // Set data attributes for CSS selectors
    root.setAttribute('data-theme', theme.id)
    root.setAttribute('data-theme-category', theme.category)
    if (theme.isPremium) {
      root.setAttribute('data-theme-premium', 'true')
    } else {
      root.removeAttribute('data-theme-premium')
    }

    // Update meta theme-color for browser UI
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.setAttribute('content', colors.background)

    // Font loading with preconnect optimization
    const existingPreconnects = document.querySelectorAll(
      'link[data-theme-preconnect]',
    )
    if (existingPreconnects.length === 0) {
      const preconnectUrls = [GOOGLE_FONTS_PRECONNECT, GOOGLE_FONTS_STATIC]
      preconnectUrls.forEach((url) => {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = url
        link.crossOrigin = 'anonymous'
        link.setAttribute('data-theme-preconnect', 'true')
        document.head.appendChild(link)
      })
    }

    // Load theme fonts
    document
      .querySelectorAll('link[data-theme-font]')
      .forEach((l) => l.remove())
    ;[typography.displayFontUrl, typography.bodyFontUrl].forEach((url, i) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.setAttribute('data-theme-font', i === 0 ? 'display' : 'body')
      document.head.appendChild(link)
    })

    // Apply body styles with transition
    document.body.style.transition = `background-color ${TRANSITION_MS}ms, color ${TRANSITION_MS}ms`
    document.body.style.backgroundColor = colors.background
    document.body.style.color = colors.foreground
  }, [theme, mounted])

  const setTheme = useCallback(
    (id: string) => {
      const t = getThemeById(id)
      if (t && t.id !== theme.id) {
        setIsTransitioning(true)
        setThemeState(t)
        localStorage.setItem(STORAGE_KEY, id)
        setTimeout(() => setIsTransitioning(false), TRANSITION_MS)
      }
    },
    [theme.id],
  )

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: siteConfig.themes,
      themesByCategory,
      isTransitioning,
      mounted,
    }),
    [theme, setTheme, isTransitioning, mounted],
  )

  return (
    <ThemeContext.Provider value={value}>
      {mounted ? (
        children
      ) : (
        <div style={{ visibility: 'hidden' }} aria-hidden="true">
          {children}
        </div>
      )}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
