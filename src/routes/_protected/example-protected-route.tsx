import { useAuth } from '@/hooks/use-auth'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Shield, User, Mail, LogOut, Home } from 'lucide-react'

export const Route = createFileRoute('/_protected/example-protected-route')({
  component: ProtectedPage,
})

function ProtectedPage() {
  const { currentUser } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full shadow-lg"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Shield size={18} style={{ color: 'var(--primary)' }} />
          <span
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Protected Route
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl sm:text-5xl font-bold"
          style={{
            color: 'var(--foreground)',
            fontFamily: 'var(--font-display)',
          }}
        >
          Welcome Back!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg max-w-xl mx-auto"
          style={{ color: 'var(--foreground-muted)' }}
        >
          You're viewing a protected page. Only authenticated users can see this
          content.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-8 rounded-2xl space-y-6"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            <User size={28} />
          </div>
          <div>
            <h2
              className="text-xl font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              Your Account
            </h2>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Account details and information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <Mail size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Email
              </p>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                {currentUser?.email || 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <Home size={18} />
          Back to Home
        </Link>
        <Link
          to="/sign-out"
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg"
          style={{
            backgroundColor: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
          }}
        >
          <LogOut size={18} />
          Sign Out
        </Link>
      </motion.div>
    </motion.div>
  )
}
