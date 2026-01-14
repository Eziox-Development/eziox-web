import { useState } from 'react'
import { useTheme } from './ThemeProvider'
import { Palette, Check, ChevronDown, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export function ThemeSwitcher() {
  const { theme, setTheme, themes, isTransitioning } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300"
        style={{
          backgroundColor: isOpen
            ? 'var(--primary)'
            : 'var(--background-secondary)',
          border: '1px solid var(--border)',
          color: isOpen ? 'var(--primary-foreground)' : 'var(--foreground)',
          boxShadow: isOpen
            ? '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)'
            : 'none',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Change theme"
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Palette
            size={18}
            style={{
              color: isOpen ? 'var(--primary-foreground)' : 'var(--primary)',
            }}
          />
        </motion.div>
        <span
          className="text-sm font-semibold hidden sm:inline"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {theme.name}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            size={14}
            style={{
              color: isOpen
                ? 'var(--primary-foreground)'
                : 'var(--foreground-muted)',
            }}
          />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
              className="absolute right-0 top-full mt-3 z-50 min-w-[240px] rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow:
                  '0 20px 50px rgba(0, 0, 0, 0.2), 0 0 30px rgba(var(--primary-rgb, 99, 102, 241), 0.1)',
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                }}
              >
                <Sparkles
                  size={14}
                  style={{ color: 'var(--primary-foreground)' }}
                />
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: 'var(--primary-foreground)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Select Theme
                </p>
              </div>

              {/* Theme Options */}
              <div className="p-2">
                {themes.map((t, index) => {
                  const isActive = theme.id === t.id
                  return (
                    <motion.button
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setTheme(t.id)
                        setIsOpen(false)
                      }}
                      disabled={isTransitioning}
                      className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                          : 'transparent',
                        boxShadow: isActive
                          ? '0 4px 12px rgba(var(--primary-rgb, 99, 102, 241), 0.3)'
                          : 'none',
                      }}
                    >
                      {/* Color preview with glow */}
                      <div className="relative flex gap-1">
                        {/* Glow effect */}
                        {isActive && (
                          <motion.div
                            className="absolute -inset-1 rounded-full blur-md"
                            style={{ background: t.colors.primary }}
                            layoutId="theme-glow"
                          />
                        )}
                        <motion.div
                          className="relative w-4 h-4 rounded-full ring-2 ring-white/20"
                          style={{ backgroundColor: t.colors.primary }}
                          whileHover={{ scale: 1.2 }}
                        />
                        <motion.div
                          className="relative w-4 h-4 rounded-full ring-2 ring-white/20"
                          style={{ backgroundColor: t.colors.accent }}
                          whileHover={{ scale: 1.2 }}
                        />
                        <motion.div
                          className="relative w-4 h-4 rounded-full ring-2 ring-white/20"
                          style={{
                            backgroundColor: t.colors.background,
                            border: '1px solid var(--border)',
                          }}
                          whileHover={{ scale: 1.2 }}
                        />
                      </div>

                      <span
                        className="flex-1 text-left text-sm font-semibold"
                        style={{
                          color: isActive
                            ? 'var(--primary-foreground)'
                            : 'var(--foreground)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {t.name}
                      </span>

                      {/* Check indicator */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="p-1 rounded-full"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                          >
                            <Check
                              size={12}
                              style={{ color: 'var(--primary-foreground)' }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer hint */}
              <div
                className="px-4 py-2 text-center"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p
                  className="text-xs"
                  style={{
                    color: 'var(--foreground-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Theme is saved automatically
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
