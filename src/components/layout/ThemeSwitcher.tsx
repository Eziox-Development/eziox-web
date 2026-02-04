import { useState } from 'react'
import { useTheme } from './ThemeProvider'
import {
  Paintbrush,
  Check,
  Gamepad2,
  Tv,
  Code2,
  Radio,
  Palette,
  Minus,
  Sparkles,
  X,
  Star,
  Crown,
  Lock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { ThemeCategory } from '@/lib/site-config'
import { useAuth } from '@/hooks/use-auth'

const CATEGORIES: {
  id: ThemeCategory
  label: string
  icon: typeof Gamepad2
}[] = [
  { id: 'general', label: 'General', icon: Sparkles },
  { id: 'gamer', label: 'Gamer', icon: Gamepad2 },
  { id: 'vtuber', label: 'VTuber', icon: Tv },
  { id: 'anime', label: 'Anime', icon: Star },
  { id: 'developer', label: 'Dev', icon: Code2 },
  { id: 'streamer', label: 'Stream', icon: Radio },
  { id: 'artist', label: 'Artist', icon: Palette },
  { id: 'minimal', label: 'Minimal', icon: Minus },
]

export function ThemeSwitcher() {
  const { theme, setTheme, themes, themesByCategory, isTransitioning } =
    useTheme()
  const { currentUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>(
    theme.category,
  )

  const userTier = (currentUser?.tier || 'free') as string
  const hasPremiumThemes = ['pro', 'creator', 'lifetime'].includes(userTier)

  // Use themesByCategory from context instead of filtering manually
  const filteredThemes = themesByCategory[activeCategory] || []

  const currentCategoryInfo = CATEGORIES.find((c) => c.id === activeCategory)

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-(--animation-speed) border border-border ${
          isOpen
            ? 'bg-linear-to-br from-primary to-accent text-primary-foreground'
            : 'bg-background-secondary text-foreground'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Change theme"
      >
        <Paintbrush size={18} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-full mt-2 z-50 w-[520px] rounded-lg overflow-hidden bg-card border border-border shadow-2xl"
            >
              <div className="p-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br from-primary to-accent">
                    <Paintbrush size={18} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Themes</p>
                    <p className="text-xs text-foreground-muted">
                      {themes.length} styles available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg transition-colors duration-(--animation-speed) text-foreground-muted hover:bg-background-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 border-b border-border">
                <div className="grid grid-cols-4 gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id
                    const count = themesByCategory[cat.id]?.length || 0
                    if (count === 0) return null
                    return (
                      <motion.button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-(--animation-speed) ${
                          isActive
                            ? 'bg-linear-to-br from-primary to-accent text-primary-foreground'
                            : 'bg-background-secondary text-foreground-muted'
                        }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <cat.icon size={16} />
                        <span className="text-[10px]">{cat.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {currentCategoryInfo && (
                      <currentCategoryInfo.icon
                        size={16}
                        className="text-primary"
                      />
                    )}
                    <span className="text-sm font-semibold text-foreground">
                      {currentCategoryInfo?.label} Themes
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-background-secondary text-foreground-muted">
                    {filteredThemes.length} available
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredThemes.map((t) => {
                    const isActive = theme.id === t.id
                    const isPremium = t.isPremium === true
                    const isLocked = isPremium && !hasPremiumThemes
                    return (
                      <motion.button
                        key={t.id}
                        onClick={() => {
                          if (!isLocked) {
                            setTheme(t.id)
                            setIsOpen(false)
                          }
                        }}
                        disabled={isTransitioning || isLocked}
                        className={`relative flex flex-col p-3 rounded-xl transition-all duration-(--animation-speed) ${
                          isActive
                            ? 'bg-linear-to-br from-primary to-accent'
                            : 'bg-background-secondary border border-border'
                        } ${isLocked ? 'opacity-60' : ''}`}
                        whileHover={{ scale: isLocked ? 1 : 1.02 }}
                        whileTap={{ scale: isLocked ? 1 : 0.98 }}
                      >
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-white/25"
                          >
                            <Check size={12} className="text-white" />
                          </motion.div>
                        )}
                        {isPremium && !isActive && (
                          <div
                            className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white ${
                              isLocked
                                ? 'bg-primary/30'
                                : 'bg-linear-to-r from-violet-500 to-pink-500'
                            }`}
                          >
                            {isLocked ? <Lock size={8} /> : <Crown size={8} />}
                            PRO
                          </div>
                        )}
                        <div className="flex gap-1 mb-2">
                          {[
                            t.colors.primary,
                            t.colors.accent,
                            t.colors.background,
                          ].map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p
                          className={`text-sm font-semibold text-left ${isActive ? 'text-white' : 'text-foreground'}`}
                        >
                          {t.name}
                        </p>
                        <p
                          className={`text-[10px] text-left truncate w-full ${isActive ? 'text-white/70' : 'text-foreground-muted'}`}
                        >
                          {t.description}
                        </p>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between border-t border-border bg-background-secondary">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[theme.colors.primary, theme.colors.accent].map((c, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-foreground-muted">
                    Current: {theme.name}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-primary text-primary-foreground">
                  {theme.category}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
