import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Shield, Home, ArrowRight, Loader2 } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@/server/functions/auth'
import { useTheme } from '@/components/layout/ThemeProvider'

function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '99, 102, 241'
  const h = hex.slice(1)
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}

export const Route = createFileRoute('/_auth/sign-out')({
  component: SignOutPage,
})

function SignOutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const router = useRouter()
  const signOut = useServerFn(signOutFn)
  const { theme } = useTheme()

  const [isSigningOut, setIsSigningOut] = useState(true)
  const [signOutComplete, setSignOutComplete] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const { colors, effects } = theme
  const glowOpacity =
    effects.glowIntensity === 'none'
      ? 0
      : effects.glowIntensity === 'subtle'
        ? 0.08
        : effects.glowIntensity === 'medium'
          ? 0.12
          : 0.18

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut()
        await router.invalidate()
        setSignOutComplete(true)

        // Countdown for redirect
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              void navigate({ to: '/' })
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } catch (error) {
        console.error('Sign out error:', error)
        // Still redirect even if sign out fails
        void navigate({ to: '/' })
      } finally {
        setIsSigningOut(false)
      }
    }

    void performSignOut()
  }, [signOut, router, navigate])

  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 pt-24"
      style={{ background: colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: `rgba(${hexToRgb(colors.primary)}, ${glowOpacity})`,
            top: '-20%',
            left: '-10%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{
            background: `rgba(${hexToRgb(colors.accent)}, ${glowOpacity * 0.8})`,
            bottom: '-15%',
            right: '-5%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background:
              effects.cardStyle === 'glass'
                ? `rgba(${hexToRgb(colors.card)}, 0.7)`
                : colors.card,
            backdropFilter:
              effects.cardStyle === 'glass'
                ? 'blur(24px) saturate(180%)'
                : undefined,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 60px rgba(${hexToRgb(colors.primary)}, ${glowOpacity})`,
          }}
        >
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            }}
          />

          <div className="relative p-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-8"
              style={{
                boxShadow: `0 0 30px rgba(${hexToRgb(colors.primary)}, 0.3)`,
              }}
            >
              <img
                src="/icon.png"
                alt="Eziox"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Status Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: signOutComplete
                  ? 'linear-gradient(135deg, #22c55e, #10b981)'
                  : 'linear-gradient(135deg, #f59e0b, #f97316)',
                boxShadow: signOutComplete
                  ? '0 8px 32px rgba(34, 197, 94, 0.3)'
                  : '0 8px 32px rgba(245, 158, 11, 0.3)',
              }}
            >
              {isSigningOut ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-white" />
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-center mb-3"
              style={{ color: colors.foreground }}
            >
              {isSigningOut ? t('signOut.signingOut') : t('signOut.signedOut')}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-center leading-relaxed mb-6"
              style={{ color: colors.foregroundMuted }}
            >
              {isSigningOut
                ? t('signOut.signingOutDescription')
                : t('signOut.signedOutDescription')}
            </motion.p>

            {/* Countdown */}
            {signOutComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mb-6"
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{
                    background: `rgba(${hexToRgb(colors.backgroundSecondary)}, 0.5)`,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Home size={16} style={{ color: colors.primary }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.foreground }}
                  >
                    {t('signOut.redirecting', { seconds: countdown })}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Security Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 text-xs"
              style={{ color: colors.foregroundMuted }}
            >
              <Shield size={14} style={{ color: colors.primary }} />
              <span>{t('signOut.security')}</span>
            </motion.div>

            {/* Manual Redirect Button */}
            {signOutComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6"
              >
                <motion.button
                  onClick={() => void navigate({ to: '/' })}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: colors.backgroundSecondary,
                    border: `1px solid ${colors.border}`,
                    color: colors.foreground,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('signOut.goHome')}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
