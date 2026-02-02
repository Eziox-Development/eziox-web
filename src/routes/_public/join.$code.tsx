/**
 * Referral Join Page
 * Handles referral signups at eziox.link/join/{code}
 */

import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { validateReferralCodeFn } from '@/server/functions/referrals'
import { useTheme } from '@/components/layout/ThemeProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Gift,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Crown,
  CheckCircle,
  Users,
  Link2,
  Palette,
  BarChart3,
  Zap,
  Star,
} from 'lucide-react'

export const Route = createFileRoute('/_public/join/$code')({
  head: () => ({
    meta: [
      { title: 'Join Eziox – Referral Invite' },
      {
        name: 'description',
        content:
          "You've been invited to join Eziox! Create your personal bio link page for free.",
      },
    ],
  }),
  component: JoinPage,
})

export function JoinPage() {
  const params = useParams({ strict: false })
  const code = params.code || ''
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [storedCode, setStoredCode] = useState(false)

  const validateCode = useServerFn(validateReferralCodeFn)

  const {
    data: validation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['validateReferral', code],
    queryFn: () => validateCode({ data: { code } }),
    retry: false,
    enabled: !!code,
  })

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  useEffect(() => {
    if (validation?.valid && code) {
      setStoredCode(true)
    }
  }, [validation?.valid, code])

  // Loading State
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.colors.background }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
          >
            <Loader2
              className="w-8 h-8"
              style={{ color: theme.colors.primary }}
            />
          </motion.div>
          <p
            className="text-lg font-medium"
            style={{ color: theme.colors.foreground }}
          >
            {t('join.loading.title')}
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('join.loading.code')}: {code.toUpperCase()}
          </p>
        </motion.div>
      </div>
    )
  }

  // Error State
  if (error || !validation?.valid) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: theme.colors.background }}
      >
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[200px]"
            style={{ background: '#ef4444', opacity: glowOpacity * 0.2 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertCircle className="w-12 h-12 text-red-500" />
          </motion.div>

          <h1
            className="text-3xl font-bold mb-3"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            {t('join.error.title')}
          </h1>
          <p
            className="text-lg mb-2"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('join.error.codeInvalid')}{' '}
            <span
              className="font-mono font-bold"
              style={{ color: theme.colors.foreground }}
            >
              "{code.toUpperCase()}"
            </span>
          </p>
          <p className="mb-8" style={{ color: theme.colors.foregroundMuted }}>
            {t('join.error.expired')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/sign-up">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white w-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow:
                    glowOpacity > 0
                      ? `0 10px 30px ${theme.colors.primary}40`
                      : undefined,
                }}
              >
                {t('join.error.signUpAnyway')}
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold w-full"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                }}
              >
                {t('join.error.goHome')}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const referrer = validation.referrer

  // Success State
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-20"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background:
                i % 2 === 0 ? theme.colors.primary : theme.colors.accent,
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              opacity: 0.4,
            }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-xl w-full"
      >
        {/* Invite Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
            border: `1px solid ${theme.colors.primary}30`,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={16} style={{ color: theme.colors.primary }} />
          </motion.div>
          <span
            className="text-sm font-medium"
            style={{ color: theme.colors.foreground }}
          >
            {t('join.badge')}
          </span>
          <Star size={14} style={{ color: theme.colors.accent }} />
        </motion.div>

        {/* Gift Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="relative w-28 h-28 mx-auto mb-8"
        >
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              opacity: 0.4,
            }}
          />
          <div
            className="relative w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              boxShadow: `0 20px 50px ${theme.colors.primary}50`,
            }}
          >
            <Gift className="w-14 h-14 text-white" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: '#22c55e',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.5)',
              }}
            >
              <CheckCircle size={18} className="text-white" />
            </div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{
            color: theme.colors.foreground,
            fontFamily: theme.typography.displayFont,
          }}
        >
          {t('join.success.titleStart')}{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            }}
          >
            {t('join.success.titleHighlight')}
          </span>
        </motion.h1>

        {/* Referrer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative p-6 mb-8 overflow-hidden"
          style={{
            background:
              theme.effects.cardStyle === 'glass'
                ? `${theme.colors.card}90`
                : theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: cardRadius,
            backdropFilter:
              theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl"
            style={{
              background: theme.colors.primary,
              opacity: glowOpacity * 0.15,
            }}
          />

          <div className="relative flex items-center justify-center gap-5">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  opacity: 0.4,
                }}
              />
              <Avatar
                className="w-20 h-20 ring-4 relative"
                style={
                  {
                    '--tw-ring-color': theme.colors.primary,
                  } as React.CSSProperties
                }
              >
                <AvatarImage src={referrer?.avatar || undefined} />
                <AvatarFallback
                  className="text-2xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    color: 'white',
                  }}
                >
                  {(referrer?.name || referrer?.username || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {referrer?.isOwner && (
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    boxShadow: '0 2px 10px rgba(251, 191, 36, 0.5)',
                  }}
                >
                  <Crown size={14} className="text-white" />
                </div>
              )}
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-bold text-xl"
                  style={{ color: theme.colors.foreground }}
                >
                  {referrer?.name || referrer?.username}
                </span>
                {referrer?.isOwner && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: '#000',
                    }}
                  >
                    {t('join.success.owner')}
                  </span>
                )}
              </div>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                @{referrer?.username}
              </p>
              <p
                className="text-sm mt-2"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('join.success.invitedYou')}{' '}
                <span
                  className="font-semibold"
                  style={{ color: theme.colors.primary }}
                >
                  Eziox
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <p
            className="text-sm font-medium mb-4"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('join.success.benefits.title')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: Link2,
                text: t('join.success.benefits.links'),
                color: '#6366f1',
              },
              {
                icon: Palette,
                text: t('join.success.benefits.themes'),
                color: '#ec4899',
              },
              {
                icon: BarChart3,
                text: t('join.success.benefits.analytics'),
                color: '#22c55e',
              },
              {
                icon: Zap,
                text: t('join.success.benefits.setup'),
                color: '#f59e0b',
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center gap-3 p-3"
                style={{
                  background: theme.colors.backgroundSecondary,
                  borderRadius: cardRadius,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${benefit.color}20` }}
                >
                  <benefit.icon size={16} style={{ color: benefit.color }} />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {benefit.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Referral Code Badge */}
        {storedCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm font-medium text-green-500">
              {t('join.success.codeApplied')}: {code.toUpperCase()}
            </span>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/sign-up" search={{ referral: code.toUpperCase() }}>
            <motion.button
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl text-white w-full sm:w-auto mx-auto"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                boxShadow:
                  glowOpacity > 0
                    ? `0 20px 50px ${theme.colors.primary}50`
                    : `0 10px 30px rgba(0,0,0,0.3)`,
              }}
            >
              <Users size={24} />
              {t('join.success.cta')}
              <ArrowRight size={24} />
            </motion.button>
          </Link>
        </motion.div>

        {/* Already have account */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-sm"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {t('join.success.alreadyHaveAccount')}{' '}
          <Link
            to="/sign-in"
            className="font-semibold hover:underline"
            style={{ color: theme.colors.primary }}
          >
            {t('join.success.signIn')}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
