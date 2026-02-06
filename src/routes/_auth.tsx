import { getCurrentUser } from '@/server/functions/auth'
import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { useTheme } from '@/components/layout/ThemeProvider'
import { hexToRgb } from '@/lib/utils'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_auth')({
  loader: async ({ location }) => {
    const currentUser = await getCurrentUser()

    if (currentUser && location.pathname !== '/sign-out') {
      throw redirect({ to: '/' })
    }

    return {
      currentUser,
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const { theme } = useTheme()
  const { colors, effects } = theme

  const glowOpacity =
    effects.glowIntensity === 'none'
      ? 0
      : effects.glowIntensity === 'subtle'
        ? 0.1
        : effects.glowIntensity === 'medium'
          ? 0.15
          : 0.2

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: colors.background }}
    >
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full blur-[150px]"
          style={{
            background: `rgba(${hexToRgb(colors.primary)}, ${glowOpacity})`,
            top: '-30%',
            left: '-20%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: `rgba(${hexToRgb(colors.accent)}, ${glowOpacity * 0.8})`,
            bottom: '-20%',
            right: '-15%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: `rgba(${hexToRgb(colors.primary)}, ${glowOpacity * 0.5})`,
            top: '50%',
            right: '10%',
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(${colors.foreground} 1px, transparent 1px), linear-gradient(90deg, ${colors.foreground} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <img
                src="/icon.png"
                alt="Eziox"
                className="w-10 h-10 rounded-xl"
                style={{
                  boxShadow: `0 4px 20px ${colors.primary}40`,
                }}
              />
            </motion.div>
            <span
              className="text-xl font-bold group-hover:opacity-80 transition-opacity hidden sm:block"
              style={{ color: colors.foreground }}
            >
              Eziox
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{ color: colors.foregroundMuted }}
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-xs" style={{ color: colors.foregroundMuted }}>
          © {new Date().getFullYear()} Eziox. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
