import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import {
  getNotificationSettingsFn,
  updateLastSeenChangelogFn,
} from '@/server/functions/notifications'
import {
  X,
  Sparkles,
  ArrowRight,
  Check,
  TrendingUp,
  Bug,
  Shield,
  AlertTriangle,
  Gift,
} from 'lucide-react'
import { APP_VERSION } from '@/lib/version'

export const CURRENT_VERSION = APP_VERSION

interface ChangelogChange {
  type: 'feature' | 'improvement' | 'fix' | 'security' | 'breaking'
  text: string
}

const latestChanges: ChangelogChange[] = [
  { type: 'feature', text: 'Completely redesigned Playground with live data preview' },
  { type: 'feature', text: 'Desktop/Mobile preview toggle in Playground' },
  { type: 'feature', text: '30+ animated background presets in 5 categories' },
  { type: 'improvement', text: 'Unified theme system - ThemeSwitcher now controls all colors' },
  { type: 'improvement', text: 'Removed redundant Appearance section from Settings' },
  { type: 'fix', text: 'Fixed animated backgrounds not showing on Bio Page' },
  { type: 'fix', text: 'Fixed Vite HMR warning for ANIMATED_PRESETS' },
]

const typeConfig: Record<ChangelogChange['type'], { icon: React.ElementType; color: string }> = {
  feature: { icon: Sparkles, color: '#22c55e' },
  improvement: { icon: TrendingUp, color: '#3b82f6' },
  fix: { icon: Bug, color: '#f59e0b' },
  security: { icon: Shield, color: '#ef4444' },
  breaking: { icon: AlertTriangle, color: '#8b5cf6' },
}

export function ChangelogModal() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  const getSettings = useServerFn(getNotificationSettingsFn)
  const updateLastSeen = useServerFn(updateLastSeenChangelogFn)

  const { data: settings } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: () => getSettings(),
    enabled: !!currentUser,
  })

  const updateMutation = useMutation({
    mutationFn: () => updateLastSeen({ data: { version: CURRENT_VERSION } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })
    },
  })

  useEffect(() => {
    if (!currentUser || hasChecked || !settings) return

    const shouldShow =
      settings.notifySystemUpdates !== false &&
      settings.lastSeenChangelog !== CURRENT_VERSION

    if (shouldShow) {
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
    setHasChecked(true)
    return
  }, [currentUser, settings, hasChecked])

  const handleClose = () => {
    setIsOpen(false)
    setHasChecked(true)
    updateMutation.mutate()
  }

  const handleDismiss = () => {
    setIsOpen(false)
    setHasChecked(true)
  }

  if (!currentUser) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div
                className="relative p-6 pb-8"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}20)` }}
              >
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={20} style={{ color: theme.colors.foregroundMuted }} />
                </button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                >
                  <Gift size={32} className="text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-center"
                  style={{ color: theme.colors.foreground }}
                >
                  What's New in v{CURRENT_VERSION}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-center mt-2"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Check out the latest updates and improvements
                </motion.p>
              </div>

              <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
                {latestChanges.map((change, i) => {
                  const config = typeConfig[change.type]
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${config.color}20` }}
                      >
                        <Icon size={16} style={{ color: config.color }} />
                      </div>
                      <p className="text-sm pt-1" style={{ color: theme.colors.foreground }}>
                        {change.text}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              <div className="p-6 pt-0 space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleClose}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check size={18} />
                  Got it!
                </motion.button>

                <Link
                  to="/changelog"
                  onClick={handleClose}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all hover:bg-white/5"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  View full changelog
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
