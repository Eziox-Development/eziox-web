import { useTheme } from '@/components/layout/ThemeProvider'
import { useLocation } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function ErrorComponent({
  error,
  info,
}: {
  error: Error
  info?: { componentStack: string }
  reset: () => void
}) {
  const randomErrorId = useRef<string>(
    Math.random().toString(36).substring(2, 15),
  )
  const { theme: currentTheme } = useTheme()
  const location = useLocation()

  const message = {
    type: 'NOTIFY_ERROR',
    data: {
      errorId: randomErrorId.current,
      href: location.href,
      errorMessage: error.message,
      errorStack: error.stack,
      errorCause: error.cause,
      errorComponentStack: info?.componentStack,
    },
  }

  // Every 1 second, notify parent that an error exists
  useEffect(() => {
    const interval = setInterval(() => {
      window.parent.postMessage(message)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 sm:px-6">
      <div className="relative max-w-2xl w-full text-center space-y-8">
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${currentTheme.colors.primary}, transparent 70%)`,
          }}
        />

        {/* Error Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div
              className="mx-auto w-32 h-32 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <AlertTriangle size={64} style={{ color: '#ef4444' }} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: currentTheme.colors.foreground }}
          >
            Oops! Something went wrong
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg mb-8"
            style={{ color: currentTheme.colors.foregroundMuted }}
          >
            We encountered an unexpected error. Don't worry, our team has been notified.
          </motion.p>
        </motion.div>

        {/* Error Details */}
        {error.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl text-left overflow-auto max-h-48"
            style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <p className="text-xs font-mono" style={{ color: '#ef4444' }}>
              {error.message}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
              color: 'white',
              boxShadow: `0 4px 20px ${currentTheme.colors.primary}40`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={18} />
            Reload Page
          </motion.button>

          <Link to="/">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: currentTheme.colors.card,
                border: `1px solid ${currentTheme.colors.border}`,
                color: currentTheme.colors.foreground,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home size={18} />
              Go Home
            </motion.button>
          </Link>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: currentTheme.colors.foregroundMuted }}
          >
            <ArrowLeft size={14} />
            Go back
          </button>
        </motion.div>
      </div>
    </div>
  )
}
