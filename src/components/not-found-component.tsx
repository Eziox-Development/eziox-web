import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'

export function NotFoundComponent() {
  const { theme } = useTheme()

  return (
    <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 sm:px-6">
      <div className="relative max-w-2xl w-full text-center space-y-8">
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${theme.colors.primary}, transparent 70%)`,
          }}
        />

        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div
              className="mx-auto w-32 h-32 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                boxShadow: `0 0 60px ${theme.colors.primary}40`,
              }}
            >
              <span
                className="text-5xl font-bold"
                style={{
                  color: 'white',
                }}
              >
                404
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl font-bold"
          style={{ color: theme.colors.foreground }}
        >
          Page not found
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg max-w-md mx-auto"
          style={{ color: theme.colors.foregroundMuted }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              color: 'white',
              boxShadow: `0 4px 20px ${theme.colors.primary}40`,
            }}
          >
            <Home size={18} />
            Go Home
          </Link>

          <Link
            to="/creators"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.foreground,
            }}
          >
            <Search size={18} />
            Browse Creators
          </Link>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <ArrowLeft size={14} />
            Go back to previous page
          </button>
        </motion.div>
      </div>
    </div>
  )
}
