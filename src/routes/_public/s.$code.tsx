import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { resolveShortLinkFn } from '@/server/functions/shortener'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  LinkIcon,
  Home,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Search,
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

function ShortLinkNotFound() {
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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{ background: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.2,
          }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="text-center max-w-lg relative"
      >
        {/* Icon */}
        <motion.div
          className="w-28 h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
            border: `2px solid ${theme.colors.primary}30`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.1,
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${theme.colors.primary}30, transparent 70%)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <LinkIcon size={52} style={{ color: theme.colors.primary }} />
          </motion.div>

          {/* Alert badge */}
          <motion.div
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: '#ef4444',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 400,
              damping: 20,
            }}
          >
            <AlertCircle size={22} className="text-white" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl font-bold mb-4"
          style={{
            color: theme.colors.foreground,
            fontFamily: theme.typography.displayFont,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Link{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            }}
          >
            Not Found
          </span>
        </motion.h1>

        {/* Code display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <code
            className="px-4 py-2 rounded-xl text-base font-mono inline-block"
            style={{
              background: theme.colors.backgroundSecondary,
              color: theme.colors.primary,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            eziox.link/s/{code}
          </code>
        </motion.div>

        <motion.p
          className="text-lg mb-8"
          style={{ color: theme.colors.foregroundMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          This short link doesn't exist, has expired, or was removed by the
          owner.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/">
            <motion.button
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold w-full sm:w-auto text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                boxShadow:
                  glowOpacity > 0
                    ? `0 15px 40px ${theme.colors.primary}40`
                    : `0 8px 25px rgba(0,0,0,0.2)`,
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Home size={20} />
              Go Home
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link to="/creators">
            <motion.button
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold w-full sm:w-auto"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                color: theme.colors.foreground,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter:
                  theme.effects.cardStyle === 'glass'
                    ? 'blur(10px)'
                    : undefined,
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Sparkles size={20} />
              Discover Creators
            </motion.button>
          </Link>
        </motion.div>

        {/* Help card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 text-left"
          style={{
            background:
              theme.effects.cardStyle === 'glass'
                ? `${theme.colors.card}90`
                : theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: cardRadius,
            backdropFilter:
              theme.effects.cardStyle === 'glass' ? 'blur(10px)' : undefined,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${theme.colors.primary}15` }}
            >
              <Search size={20} style={{ color: theme.colors.primary }} />
            </div>
            <div>
              <p
                className="font-medium mb-1"
                style={{ color: theme.colors.foreground }}
              >
                Looking for someone?
              </p>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Try searching for their username at{' '}
                <Link
                  to="/"
                  className="font-medium hover:underline"
                  style={{ color: theme.colors.primary }}
                >
                  eziox.link
                </Link>{' '}
                or browse our{' '}
                <Link
                  to="/creators"
                  className="font-medium hover:underline"
                  style={{ color: theme.colors.primary }}
                >
                  creator directory
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
