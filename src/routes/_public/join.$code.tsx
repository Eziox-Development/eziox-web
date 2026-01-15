/**
 * Referral Join Page
 * Handles referral signups at eziox.link/join/{code}
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { validateReferralCodeFn } from '@/server/functions/referrals'
import {
  Gift,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Crown,
  CheckCircle,
} from 'lucide-react'

export const Route = createFileRoute('/_public/join/$code')({
  component: JoinPage,
})

function JoinPage() {
  const { code } = Route.useParams()
  const [storedCode, setStoredCode] = useState(false)

  const validateCode = useServerFn(validateReferralCodeFn)

  const { data: validation, isLoading, error } = useQuery({
    queryKey: ['validateReferral', code],
    queryFn: () => validateCode({ data: { code } }),
    retry: false,
  })

  // Mark code as ready for redirect
  useEffect(() => {
    if (validation?.valid && code) {
      setStoredCode(true)
    }
  }, [validation?.valid, code])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Validating referral code...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !validation?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Invalid Referral Code
          </h1>
          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            The referral code "{code}" is not valid or has expired.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              Sign Up Anyway
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
              style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
            >
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const referrer = validation.referrer

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--primary)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--accent)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        {/* Gift Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        >
          <Gift className="w-12 h-12 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          You've Been Invited!
        </motion.h1>

        {/* Referrer Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl mb-6"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Avatar */}
            <div 
              className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden"
            >
              {referrer?.avatar ? (
                <img 
                  src={referrer.avatar} 
                  alt={referrer.name || referrer.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {(referrer?.name || referrer?.username || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                  {referrer?.name || referrer?.username}
                </span>
                {referrer?.isOwner && (
                  <Crown size={18} className="text-yellow-500" />
                )}
              </div>
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                @{referrer?.username}
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--foreground-muted)' }}>
            invited you to join <span className="font-semibold" style={{ color: 'var(--primary)' }}>Eziox</span>
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <CheckCircle size={20} style={{ color: '#22c55e' }} />
              <span style={{ color: 'var(--foreground)' }}>Create your personal bio page</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <CheckCircle size={20} style={{ color: '#22c55e' }} />
              <span style={{ color: 'var(--foreground)' }}>Share all your links in one place</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <CheckCircle size={20} style={{ color: '#22c55e' }} />
              <span style={{ color: 'var(--foreground)' }}>Track views and analytics</span>
            </div>
          </div>
        </motion.div>

        {/* Stored Code Indicator */}
        {storedCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mb-4 text-sm"
            style={{ color: '#22c55e' }}
          >
            <Sparkles size={16} />
            <span>Referral code: {code.toUpperCase()}</span>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/sign-up"
            search={{ referral: code.toUpperCase() }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 w-full sm:w-auto"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Sparkles size={20} />
            Join Eziox Now
            <ArrowRight size={20} />
          </Link>
        </motion.div>

        {/* Already have account */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm"
          style={{ color: 'var(--foreground-muted)' }}
        >
          Already have an account?{' '}
          <Link to="/sign-in" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            Sign In
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
