import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTheme } from './ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import {
  Rocket,
  ArrowUpRight,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Settings,
} from 'lucide-react'

interface CTASectionProps {
  variant?: 'default' | 'compact'
}

export function CTASection({ variant = 'default' }: CTASectionProps) {
  const { theme } = useTheme()
  const { currentUser } = useAuth()

  // Logged in user sees different CTA
  if (currentUser) {
    return (
      <div
        className="relative"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`flex flex-col ${variant === 'compact' ? 'md:flex-row items-center justify-between' : 'lg:flex-row items-center justify-between'} gap-8 p-8 rounded-3xl`}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow: `0 10px 40px ${theme.colors.primary}40`,
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Sparkles size={28} className="text-white" />
              </motion.div>
              <div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: theme.colors.foreground }}
                >
                  Welcome back, {currentUser.name || currentUser.username}!
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Manage your bio link page and track your analytics
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/$username" params={{ username: currentUser.username }}>
                <motion.button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    boxShadow: `0 4px 20px ${theme.colors.primary}40`,
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LayoutDashboard size={16} />
                  View Page
                </motion.button>
              </Link>
              <Link to="/analytics">
                <motion.button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 size={16} />
                  Analytics
                </motion.button>
              </Link>
              <Link to="/profile">
                <motion.button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings size={16} />
                  Settings
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Not logged in - show signup CTA
  return (
    <div
      className="relative"
      style={{ background: theme.colors.backgroundSecondary }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`flex flex-col ${variant === 'compact' ? 'md:flex-row items-center justify-between' : 'lg:flex-row items-center justify-between'} gap-8 p-8 rounded-3xl`}
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`,
            border: `1px solid ${theme.colors.primary}30`,
          }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                boxShadow: `0 10px 40px ${theme.colors.primary}40`,
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Rocket size={32} className="text-white" />
            </motion.div>
            <div>
              <h3
                className="text-xl font-bold mb-1"
                style={{ color: theme.colors.foreground }}
              >
                Ready to Get Started?
              </h3>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Create your free bio link page in seconds
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/sign-up">
              <motion.button
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow: `0 4px 20px ${theme.colors.primary}40`,
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Your Page
                <ArrowUpRight size={18} />
              </motion.button>
            </Link>
            <Link to="/about">
              <motion.button
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
                <ChevronRight size={18} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
