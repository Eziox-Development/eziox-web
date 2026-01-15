import { useState } from 'react'
import { useTheme } from './ThemeProvider'
import { Paintbrush, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export function ThemeSwitcher() {
  const { theme, setTheme, themes, isTransitioning } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

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
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}
            >
              <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  <Paintbrush size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Theme</p>
                  <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>Auto-saved</p>
                </div>
              </div>

              <div className="p-2 space-y-1">
                {themes.map((t) => {
                  const isActive = theme.id === t.id
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setIsOpen(false) }}
                      disabled={isTransitioning}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: isActive ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent' }}
                      whileHover={{ backgroundColor: isActive ? undefined : 'var(--background-secondary)' }}
                    >
                      <div className="flex gap-1">
                        {[t.colors.primary, t.colors.accent, t.colors.background].map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color, border: i === 2 ? '1px solid var(--border)' : 'none', boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}
                          />
                        ))}
                      </div>
                      <span className="flex-1 text-left text-sm font-medium" style={{ color: isActive ? 'white' : 'var(--foreground)' }}>
                        {t.name}
                      </span>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.2)' }}
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
