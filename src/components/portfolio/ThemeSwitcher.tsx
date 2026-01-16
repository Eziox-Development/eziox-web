import { useState, useMemo } from 'react'
import { useTheme } from './ThemeProvider'
import { Paintbrush, Check, Gamepad2, Tv, Code2, Radio, Palette, Minus, Sparkles, X, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { ThemeCategory } from '@/lib/site-config'

const CATEGORIES: { id: ThemeCategory; label: string; icon: typeof Gamepad2 }[] = [
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
  const { theme, setTheme, themes, isTransitioning } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>(theme.category)

  const filteredThemes = useMemo(() => 
    themes.filter(t => t.category === activeCategory),
    [themes, activeCategory]
  )

  const currentCategoryInfo = CATEGORIES.find(c => c.id === activeCategory)

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
        style={{
          background: isOpen ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--background-secondary)',
          border: '1px solid var(--border)',
          color: isOpen ? 'white' : 'var(--foreground)',
        }}
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
              className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                    <Paintbrush size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--foreground)' }}>Themes</p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{themes.length} styles available</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--foreground-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="relative" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="p-2 flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth" id="category-tabs">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id
                    const count = themes.filter(t => t.category === cat.id).length
                    if (count === 0) return null
                    return (
                      <motion.button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                        style={{
                          background: isActive ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent',
                          color: isActive ? 'white' : 'var(--foreground-muted)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <cat.icon size={12} />
                        <span>{cat.label}</span>
                        <span className="px-1 py-0.5 rounded text-[9px]" style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--background-secondary)' }}>
                          {count}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                  {currentCategoryInfo && <currentCategoryInfo.icon size={14} style={{ color: 'var(--primary)' }} />}
                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
                    {currentCategoryInfo?.label} Themes
                  </span>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {filteredThemes.map((t) => {
                    const isActive = theme.id === t.id
                    return (
                      <motion.button
                        key={t.id}
                        onClick={() => { setTheme(t.id); setIsOpen(false) }}
                        disabled={isTransitioning}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group"
                        style={{ 
                          background: isActive ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent',
                        }}
                        whileHover={{ backgroundColor: isActive ? undefined : 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="flex gap-0.5">
                          {[t.colors.primary, t.colors.accent, t.colors.background].map((color, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 first:rounded-l-lg last:rounded-r-lg"
                              style={{ 
                                backgroundColor: color, 
                                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.3)' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold" style={{ color: isActive ? 'white' : 'var(--foreground)' }}>
                            {t.name}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--foreground-muted)' }}>
                            {t.description}
                          </p>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.2)' }}
                          >
                            <Check size={14} className="text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', background: 'var(--background-secondary)' }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[theme.colors.primary, theme.colors.accent].map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>Current: {theme.name}</span>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
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
