import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { resolveShortLinkFn } from '@/server/functions/shortener'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { LinkIcon, Home, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/_public/s/$code')({
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: theme.colors.background }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
          style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <LinkIcon size={48} style={{ color: theme.colors.primary }} />
        </motion.div>

        <h1 className="text-3xl font-bold mb-3" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
          Link Not Found
        </h1>
        <p className="text-lg mb-2" style={{ color: theme.colors.foregroundMuted }}>
          The short link <code className="px-2 py-1 rounded-lg text-sm font-mono" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.primary }}>/s/{code}</code> doesn't exist.
        </p>
        <p className="text-sm mb-8" style={{ color: theme.colors.foregroundMuted }}>
          It may have expired or been removed by the owner.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <motion.button
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium w-full sm:w-auto"
              style={{ background: theme.colors.primary, color: 'white' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home size={18} />
              Go Home
            </motion.button>
          </Link>
          <Link to="/creators">
            <motion.button
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium w-full sm:w-auto"
              style={{ background: theme.colors.card, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={18} />
              Discover Creators
            </motion.button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-4 rounded-xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
            Looking for someone? Try searching for their username at{' '}
            <Link to="/" className="font-medium hover:underline" style={{ color: theme.colors.primary }}>
              eziox.link
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
