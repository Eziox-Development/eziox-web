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
} from '@/lib/site-config'

interface ThemeContextType {
  theme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
  isTransitioning: boolean
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'portfolio-theme'
const TRANSITION_DURATION = 300

/**
 * Extracts RGB values from a color string for use in rgba() functions
 */
function extractRgbValues(color: string): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `${r}, ${g}, ${b}`
  }
  // Handle rgb/rgba colors
  const match = color.match(/\d+/g)
  if (match && match.length >= 3) {
    return `${match[0]}, ${match[1]}, ${match[2]}`
  }
  return '99, 102, 241' // Default fallback
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getDefaultTheme())
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedThemeId) {
      const savedTheme = getThemeById(savedThemeId)
      if (savedTheme) {
        setThemeState(savedTheme)
      }
    }
    setMounted(true)
  }, [])

  // Apply theme CSS variables with smooth transition
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const { colors, typography } = theme

    // Enable smooth transitions for theme changes
    root.style.setProperty(
      '--theme-transition',
      `${TRANSITION_DURATION}ms ease-in-out`,
    )

    // Apply colors
    root.style.setProperty('--background', colors.background)
    root.style.setProperty('--background-secondary', colors.backgroundSecondary)
    root.style.setProperty('--foreground', colors.foreground)
    root.style.setProperty('--foreground-muted', colors.foregroundMuted)
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-foreground', colors.accentForeground)
    root.style.setProperty('--border', colors.border)
    root.style.setProperty('--card', colors.card)
    root.style.setProperty('--card-foreground', colors.cardForeground)

    // Apply RGB values for use in rgba() functions (glow effects, etc.)
    root.style.setProperty('--primary-rgb', extractRgbValues(colors.primary))
    root.style.setProperty('--accent-rgb', extractRgbValues(colors.accent))
    root.style.setProperty(
      '--background-rgb',
      extractRgbValues(colors.background),
    )

    // Apply typography
    root.style.setProperty('--font-display', typography.displayFont)
    root.style.setProperty('--font-body', typography.bodyFont)

    // Load fonts dynamically
    const existingFontLinks = document.querySelectorAll('link[data-theme-font]')
    existingFontLinks.forEach((link) => link.remove())

    const displayFontLink = document.createElement('link')
    displayFontLink.rel = 'stylesheet'
    displayFontLink.href = typography.displayFontUrl
    displayFontLink.setAttribute('data-theme-font', 'display')
    document.head.appendChild(displayFontLink)

    const bodyFontLink = document.createElement('link')
    bodyFontLink.rel = 'stylesheet'
    bodyFontLink.href = typography.bodyFontUrl
    bodyFontLink.setAttribute('data-theme-font', 'body')
    document.head.appendChild(bodyFontLink)

    // Update body background with transition
    document.body.style.transition = `background-color ${TRANSITION_DURATION}ms ease-in-out, color ${TRANSITION_DURATION}ms ease-in-out`
    document.body.style.backgroundColor = colors.background
    document.body.style.color = colors.foreground
  }, [theme, mounted])

  // Memoized setTheme function with transition state
  const setTheme = useCallback(
    (themeId: string) => {
      const newTheme = getThemeById(themeId)
      if (newTheme && newTheme.id !== theme.id) {
        setIsTransitioning(true)
        setThemeState(newTheme)
        localStorage.setItem(THEME_STORAGE_KEY, themeId)

        // Reset transition state after animation completes
        setTimeout(() => {
          setIsTransitioning(false)
        }, TRANSITION_DURATION)
      }
    },
    [theme.id],
  )

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      themes: siteConfig.themes,
      isTransitioning,
      mounted,
    }),
    [theme, setTheme, isTransitioning, mounted],
  )

  return (
    <ThemeContext.Provider value={contextValue}>
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

/**
 * Hook to access the current theme and theme switching functionality
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
