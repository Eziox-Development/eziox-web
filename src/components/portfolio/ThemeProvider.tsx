import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { siteConfig, getThemeById, getDefaultTheme, type Theme } from '@/lib/site-config'

interface ThemeContextType {
  theme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
  isTransitioning: boolean
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const STORAGE_KEY = 'eziox-theme'
const TRANSITION_MS = 250

function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '99, 102, 241'
  const h = hex.slice(1)
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}

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
    const { colors, typography } = theme

    const vars: Record<string, string> = {
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
      '--primary-rgb': hexToRgb(colors.primary),
      '--accent-rgb': hexToRgb(colors.accent),
      '--background-rgb': hexToRgb(colors.background),
      '--border-rgb': hexToRgb(colors.border),
      '--font-display': typography.displayFont,
      '--font-body': typography.bodyFont,
      '--theme-transition': `${TRANSITION_MS}ms ease-out`,
    }

    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))

    document.querySelectorAll('link[data-theme-font]').forEach((l) => l.remove())
    ;[typography.displayFontUrl, typography.bodyFontUrl].forEach((url, i) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.setAttribute('data-theme-font', i === 0 ? 'display' : 'body')
      document.head.appendChild(link)
    })

    document.body.style.transition = `background-color ${TRANSITION_MS}ms, color ${TRANSITION_MS}ms`
    document.body.style.backgroundColor = colors.background
    document.body.style.color = colors.foreground
  }, [theme, mounted])

  const setTheme = useCallback((id: string) => {
    const t = getThemeById(id)
    if (t && t.id !== theme.id) {
      setIsTransitioning(true)
      setThemeState(t)
      localStorage.setItem(STORAGE_KEY, id)
      setTimeout(() => setIsTransitioning(false), TRANSITION_MS)
    }
  }, [theme.id])

  const value = useMemo(() => ({
    theme,
    setTheme,
    themes: siteConfig.themes,
    isTransitioning,
    mounted,
  }), [theme, setTheme, isTransitioning, mounted])

  return (
    <ThemeContext.Provider value={value}>
      {mounted ? children : <div style={{ visibility: 'hidden' }} aria-hidden="true">{children}</div>}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
