import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useServerFn } from '@tanstack/react-start'
import { verifyEmailChangeFn } from '@/server/functions/auth'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  Shield,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'

export const Route = createFileRoute('/_public/verify-email-change')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
  head: () => ({
    meta: [
      { title: 'Verify Email Change | Eziox' },
      {
        name: 'description',
        content: 'Confirm your new email address for Eziox',
      },
    ],
  }),
  component: VerifyEmailChangePage,
})

const ACCENT_COLOR = '#8b5cf6'

export function VerifyEmailChangePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const search = Route.useSearch()
  const token = 'token' in search ? search.token : ''
  const navigate = useNavigate()
  const verifyEmailChange = useServerFn(verifyEmailChangeFn)

  const [status, setStatus] = useState<
    'pending' | 'loading' | 'success' | 'error' | 'no-token'
  >(token ? 'pending' : 'no-token')
  const [message, setMessage] = useState(
    token ? '' : t('verifyEmailChange.noToken.message'),
  )
  const [countdown, setCountdown] = useState(5)

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '32px'
      : theme.effects.borderRadius === 'sharp'
        ? '12px'
        : '24px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.3
        : theme.effects.glowIntensity === 'subtle'
          ? 0.15
          : 0

  const handleVerify = async () => {
    if (!token || status === 'loading') return

    setStatus('loading')

    try {
      const result = await verifyEmailChange({ data: { token } })
      setStatus('success')
      setMessage(result.message)
    } catch (err) {
      setStatus('error')
      setMessage(
        (err as { message?: string })?.message ||
          t('verifyEmailChange.error.defaultMessage'),
      )
    }
  }

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (status === 'success' && countdown === 0) {
      void navigate({ to: '/profile' })
    }
    return undefined
  }, [status, countdown, navigate])

  const statusConfig = {
    pending: {
      icon: ShieldCheck,
      iconColor: ACCENT_COLOR,
      bgColor: `${ACCENT_COLOR}20`,
      animate: false,
    },
    loading: {
      icon: Loader2,
      iconColor: ACCENT_COLOR,
      bgColor: `${ACCENT_COLOR}20`,
      animate: true,
    },
    success: {
      icon: CheckCircle,
      iconColor: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      animate: false,
    },
    error: {
      icon: XCircle,
      iconColor: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      animate: false,
    },
    'no-token': {
      icon: Mail,
      iconColor: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
      animate: false,
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ background: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${ACCENT_COLOR}${Math.round(
              glowOpacity * 30,
            )
              .toString(16)
              .padStart(2, '0')}, transparent 70%)`,
          }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, #6366f1${Math.round(
              glowOpacity * 25,
            )
              .toString(16)
              .padStart(2, '0')}, transparent 70%)`,
          }}
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? ACCENT_COLOR : '#6366f1',
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              opacity: 0.4,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Main Card */}
        <div
          className="p-8 sm:p-10 text-center relative overflow-hidden"
          style={{
            background:
              theme.effects.cardStyle === 'glass'
                ? `${theme.colors.card}90`
                : theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: cardRadius,
            backdropFilter:
              theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
            boxShadow:
              glowOpacity > 0
                ? `0 0 60px ${ACCENT_COLOR}${Math.round(glowOpacity * 40)
                    .toString(16)
                    .padStart(2, '0')}`
                : undefined,
          }}
        >
          {/* Decorative Top Border */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${ACCENT_COLOR}, #6366f1, ${ACCENT_COLOR})`,
            }}
          />

          {/* Icon with Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="relative mx-auto mb-8"
          >
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center relative"
              style={{ background: config.bgColor }}
            >
              <StatusIcon
                size={44}
                className={config.animate ? 'animate-spin' : ''}
                style={{ color: config.iconColor }}
              />
              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles size={20} style={{ color: '#10b981' }} />
                </motion.div>
              )}
            </div>

            {/* Pulse Ring for Loading */}
            {status === 'loading' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${config.iconColor}` }}
                animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Pending State - Waiting for User Confirmation */}
              {status === 'pending' && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-4"
                    style={{
                      background: `${ACCENT_COLOR}15`,
                      borderRadius: '100px',
                    }}
                  >
                    <Mail size={14} style={{ color: ACCENT_COLOR }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: ACCENT_COLOR }}
                    >
                      {t('verifyEmailChange.pending.badge')}
                    </span>
                  </motion.div>

                  <h1
                    className="text-2xl sm:text-3xl font-bold mb-3"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {t('verifyEmailChange.pending.title')}
                  </h1>
                  <p
                    className="text-base mb-8"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('verifyEmailChange.pending.message')}
                  </p>

                  <motion.button
                    onClick={handleVerify}
                    className="inline-flex items-center gap-3 px-8 py-4 font-semibold text-lg transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT_COLOR}, #6366f1)`,
                      color: '#fff',
                      borderRadius: '16px',
                      boxShadow: `0 4px 20px ${ACCENT_COLOR}50`,
                    }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: `0 6px 30px ${ACCENT_COLOR}60`,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CheckCircle size={22} />
                    {t('verifyEmailChange.pending.button')}
                  </motion.button>

                  <div
                    className="mt-6 flex items-center justify-center gap-2"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    <AlertTriangle size={14} />
                    <p className="text-xs">
                      {t('verifyEmailChange.pending.hint')}
                    </p>
                  </div>
                </>
              )}

              {/* Loading State */}
              {status === 'loading' && (
                <>
                  <h1
                    className="text-2xl sm:text-3xl font-bold mb-3"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {t('verifyEmailChange.loading.title')}
                  </h1>
                  <p
                    className="text-base"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('verifyEmailChange.loading.message')}
                  </p>
                  <div className="mt-6 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: config.iconColor }}
                        animate={{ y: [-3, 3, -3] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Success State */}
              {status === 'success' && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-4"
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      borderRadius: '100px',
                    }}
                  >
                    <Shield size={14} style={{ color: '#10b981' }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#10b981' }}
                    >
                      {t('verifyEmailChange.success.badge')}
                    </span>
                  </motion.div>

                  <h1
                    className="text-2xl sm:text-3xl font-bold mb-3"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {t('verifyEmailChange.success.title')}
                  </h1>
                  <p
                    className="text-base mb-6"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {message || t('verifyEmailChange.success.message')}
                  </p>

                  {/* Countdown */}
                  <div className="mb-6">
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        borderRadius: '12px',
                      }}
                    >
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {t('verifyEmailChange.success.redirect', {
                          seconds: countdown,
                        })}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    {t('verifyEmailChange.success.button')}
                    <ArrowRight size={20} />
                  </Link>
                </>
              )}

              {/* Error State */}
              {status === 'error' && (
                <>
                  <h1
                    className="text-2xl sm:text-3xl font-bold mb-3"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {t('verifyEmailChange.error.title')}
                  </h1>
                  <p
                    className="text-base mb-6"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {message}
                  </p>

                  <div className="space-y-4">
                    <Link
                      to="/profile"
                      className="inline-flex items-center gap-2 px-8 py-4 font-semibold transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${ACCENT_COLOR}, #6366f1)`,
                        color: '#fff',
                        borderRadius: '16px',
                        boxShadow: `0 4px 20px ${ACCENT_COLOR}50`,
                      }}
                    >
                      {t('verifyEmailChange.error.button')}
                      <ArrowRight size={18} />
                    </Link>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('verifyEmailChange.error.hint')}
                    </p>
                  </div>
                </>
              )}

              {/* No Token State */}
              {status === 'no-token' && (
                <>
                  <h1
                    className="text-2xl sm:text-3xl font-bold mb-3"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {t('verifyEmailChange.noToken.title')}
                  </h1>
                  <p
                    className="text-base mb-6"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('verifyEmailChange.noToken.message')}
                  </p>

                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-8 py-4 font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT_COLOR}, #6366f1)`,
                      color: '#fff',
                      borderRadius: '16px',
                      boxShadow: `0 4px 20px ${ACCENT_COLOR}50`,
                    }}
                  >
                    {t('verifyEmailChange.noToken.button')}
                    <ArrowRight size={18} />
                  </Link>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div
            className="inline-flex items-center gap-2 text-xs"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <Shield size={12} />
            <span>{t('verifyEmailChange.securityNote')}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default VerifyEmailChangePage
