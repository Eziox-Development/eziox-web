import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ScrollToTop() {
  const { theme } = useTheme()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setVisible(scrollY > 300)
      setProgress(docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer group"
          style={{
            background: `${theme.colors.card}e0`,
            border: `1px solid ${theme.colors.border}40`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
          }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Scroll to top"
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke={`${theme.colors.border}30`}
              strokeWidth="2"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-150 ease-out"
            />
          </svg>

          {/* Arrow icon */}
          <ArrowUp
            size={16}
            className="relative transition-transform duration-200 group-hover:-translate-y-0.5"
            style={{ color: theme.colors.foreground }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
