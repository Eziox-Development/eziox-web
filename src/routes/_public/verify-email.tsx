import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useServerFn } from '@tanstack/react-start'
import { verifyEmailFn } from '@/server/functions/auth'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  Shield,
  Sparkles,
  RefreshCw,
} from 'lucide-react'

export const Route = createFileRoute('/_public/verify-email')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
  head: () => ({
    meta: [
      { title: 'Verify Email | Eziox' },
      {
        name: 'description',
        content: 'Verify your email address for Eziox',
      },
    ],
  }),
  component: VerifyEmailPage,
})

const ACCENT_COLOR = '#10b981'

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const search = Route.useSearch()
  const token = 'token' in search ? search.token : ''
  const navigate = useNavigate()
  const verifyEmail = useServerFn(verifyEmailFn)

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'no-token'
  >('loading')
  const [message, setMessage] = useState('')
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

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      setMessage(t('verifyEmail.noToken.message'))
      return
    }

    const verify = async () => {
      try {
        const result = await verifyEmail({ data: { token } })
        setStatus('success')
        setMessage(result.message)
      } catch (err) {
        setStatus('error')
        setMessage(
          (err as { message?: string })?.message ||
            t('verifyEmail.error.defaultMessage'),
        )
      }
    }

    void verify()
  }, [token, verifyEmail, t])

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
    loading: {
      icon: Loader2,
      iconColor: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.15)',
      animate: true,
    },
    success: {
      icon: CheckCircle,
      iconColor: ACCENT_COLOR,
      bgColor: `${ACCENT_COLOR}20`,
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
                  <Sparkles size={20} style={{ color: ACCENT_COLOR }} />
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
                    {t('verifyEmail.loading.title')}
                  </h1>
                  <p
                    className="text-base"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('verifyEmail.loading.message')}
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
                      background: `${ACCENT_COLOR}15`,
                      borderRadius: '100px',
                    }}
                  >
                    <Shield size={14} style={{ color: ACCENT_COLOR }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: ACCENT_COLOR }}
                    >
                      {t('verifyEmail.success.badge')}
                    </span>
                  </motion.div>

                  <h1
                    className="text-2xl sm:text-3xl font-bold mb-3"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {t('verifyEmail.success.title')}
                  </h1>
                  <p
                    className="text-base mb-6"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {message || t('verifyEmail.success.message')}
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
                        {t('verifyEmail.success.redirect', {
                          seconds: countdown,
                        })}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT_COLOR}, #059669)`,
                      color: '#fff',
                      borderRadius: '16px',
                      boxShadow: `0 4px 20px ${ACCENT_COLOR}50`,
                    }}
                  >
                    {t('verifyEmail.success.button')}
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
                    {t('verifyEmail.error.title')}
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
                        background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                        color: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                      }}
                    >
                      {t('verifyEmail.error.button')}
                      <ArrowRight size={18} />
                    </Link>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('verifyEmail.error.hint')}
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
                    {t('verifyEmail.noToken.title')}
                  </h1>
                  <p
                    className="text-base mb-6"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('verifyEmail.noToken.message')}
                  </p>

                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-8 py-4 font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                      color: '#fff',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {t('verifyEmail.noToken.button')}
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
            <span>{t('verifyEmail.securityNote')}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default VerifyEmailPage
