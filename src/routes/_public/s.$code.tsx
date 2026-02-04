import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { resolveShortLinkFn } from '@/server/functions/shortener'
import { useTheme } from '@/components/layout/ThemeProvider'
import { getAppHostname } from '@/lib/utils'
import {
  LinkIcon,
  Home,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Search,
  Users,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  Clock,
  XCircle,
} from 'lucide-react'

export const Route = createFileRoute('/_public/s/$code')({
  head: () => ({
    meta: [
      { title: 'Link Not Found | Eziox' },
      {
        name: 'description',
        content: 'This short link does not exist or has expired.',
      },
    ],
  }),
  loader: async ({ params }) => {
    const result = await resolveShortLinkFn({ data: { code: params.code } })
    if (result?.targetUrl) {
      throw redirect({ href: result.targetUrl })
    }
    return { code: params.code }
  },
  component: ShortLinkNotFound,
})

export function ShortLinkNotFound() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { code } = Route.useLoaderData()

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

  const possibleReasons = [
    { icon: Clock, key: 'expired' },
    { icon: XCircle, key: 'removed' },
    { icon: AlertTriangle, key: 'typo' },
  ]

  const quickActions = [
    { icon: Home, labelKey: 'shortlink.actions.home', href: '/' },
    { icon: Users, labelKey: 'shortlink.actions.creators', href: '/creators' },
    { icon: Search, labelKey: 'shortlink.actions.search', href: '/' },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: `${theme.colors.primary}`,
            opacity: glowOpacity * 0.2,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.15,
          }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background:
                i % 2 === 0 ? theme.colors.primary : theme.colors.accent,
              opacity: 0.3,
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative overflow-hidden"
          style={{
            background:
              theme.effects.cardStyle === 'glass'
                ? `${theme.colors.card}95`
                : theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: cardRadius,
            backdropFilter:
              theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
          }}
        >
          {/* Top gradient bar */}
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent}, ${theme.colors.primary})`,
            }}
          />

          <div className="p-8 md:p-12">
            {/* Icon Section */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10)`,
                    border: `2px solid ${theme.colors.primary}25`,
                  }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <LinkIcon size={44} style={{ color: theme.colors.primary }} />
                </motion.div>
                {/* Error badge */}
                <motion.div
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.3,
                    type: 'spring',
                    stiffness: 500,
                    damping: 25,
                  }}
                >
                  <XCircle size={22} className="text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {t('shortlink.title')}{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  {t('shortlink.titleHighlight')}
                </span>
              </h1>

              {/* Code display */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4"
                style={{
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <ExternalLink
                  size={16}
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <code
                  className="font-mono text-sm"
                  style={{ color: theme.colors.primary }}
                >
                  {getAppHostname()}/s/{code}
                </code>
              </motion.div>

              <p
                className="text-base"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('shortlink.description')}
              </p>
            </motion.div>

            {/* Possible Reasons */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div
                className="flex items-center gap-2 mb-4"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <HelpCircle size={16} />
                <span className="text-sm font-medium">
                  {t('shortlink.reasons.title')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {possibleReasons.map((reason, i) => (
                  <motion.div
                    key={reason.key}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${theme.colors.primary}15` }}
                    >
                      <reason.icon
                        size={16}
                        style={{ color: theme.colors.primary }}
                      />
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: theme.colors.foreground }}
                    >
                      {t(`shortlink.reasons.${reason.key}`)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/" className="flex-1">
                <motion.button
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    boxShadow:
                      glowOpacity > 0
                        ? `0 10px 30px ${theme.colors.primary}35`
                        : undefined,
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Home size={20} />
                  {t('shortlink.buttons.home')}
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link to="/creators" className="flex-1">
                <motion.button
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles size={20} />
                  {t('shortlink.buttons.discover')}
                </motion.button>
              </Link>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="pt-6"
              style={{ borderTop: `1px solid ${theme.colors.border}` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div
                  className="flex items-center gap-2"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  <RefreshCw size={14} />
                  <span className="text-xs">{t('shortlink.tryAgain')}</span>
                </div>
                <div className="flex items-center gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.labelKey}
                      to={action.href}
                      className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: theme.colors.primary }}
                    >
                      <action.icon size={14} />
                      {t(action.labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-6 p-5 flex items-start gap-4"
          style={{
            background:
              theme.effects.cardStyle === 'glass'
                ? `${theme.colors.card}80`
                : theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: cardRadius,
            backdropFilter:
              theme.effects.cardStyle === 'glass' ? 'blur(10px)' : undefined,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${theme.colors.accent}15` }}
          >
            <Search size={20} style={{ color: theme.colors.accent }} />
          </div>
          <div>
            <p
              className="font-medium mb-1"
              style={{ color: theme.colors.foreground }}
            >
              {t('shortlink.help.title')}
            </p>
            <p
              className="text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('shortlink.help.description')}{' '}
              <Link
                to="/creators"
                className="font-medium hover:underline"
                style={{ color: theme.colors.primary }}
              >
                {t('shortlink.help.creatorDirectory')}
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center mt-6 text-xs"
          style={{ color: theme.colors.foregroundMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {t('shortlink.footer')}
        </motion.p>
      </div>
    </div>
  )
}
