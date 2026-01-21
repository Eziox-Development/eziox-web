import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useServerFn } from '@tanstack/react-start'
import { verifyEmailFn } from '@/server/functions/auth'
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/_public/verify-email')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
  head: () => ({
    meta: [
      { title: 'Verify Email | Eziox' },
      { name: 'description', content: 'Verify your email address for Eziox' },
    ],
  }),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const search = Route.useSearch()
  const token = 'token' in search ? search.token : ''
  const navigate = useNavigate()
  const verifyEmail = useServerFn(verifyEmailFn)
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      setMessage('No verification token provided')
      return
    }

    const verify = async () => {
      try {
        const result = await verifyEmail({ data: { token } })
        setStatus('success')
        setMessage(result.message)
        
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          void navigate({ to: '/profile' })
        }, 3000)
      } catch (err) {
        setStatus('error')
        setMessage((err as { message?: string })?.message || 'Verification failed')
      }
    }

    void verify()
  }, [token, verifyEmail, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl text-center"
        style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.08)' 
        }}
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Verifying your email...
            </h1>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <CheckCircle size={32} style={{ color: '#10b981' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Email Verified!
            </h1>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              {message}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
              Redirecting to your profile...
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
            >
              Go to Profile
              <ArrowRight size={18} />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <XCircle size={32} style={{ color: '#ef4444' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Verification Failed
            </h1>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              {message}
            </p>
            <div className="space-y-3">
              <Link
                to="/profile"
                className="block w-full px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
              >
                Go to Profile
              </Link>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                You can request a new verification email from your profile settings.
              </p>
            </div>
          </>
        )}

        {status === 'no-token' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
              <Mail size={32} style={{ color: '#fbbf24' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              No Token Provided
            </h1>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              Please use the link from your verification email.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
            >
              Go to Profile
              <ArrowRight size={18} />
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}
