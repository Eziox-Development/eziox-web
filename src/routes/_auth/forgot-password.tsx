import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { requestPasswordResetFn } from '@/server/functions/auth'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'

export const Route = createFileRoute('/_auth/forgot-password')({
  head: () => ({
    meta: [
      { title: 'Forgot Password | Eziox' },
      { name: 'description', content: 'Reset your Eziox account password' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ForgotPasswordPage,
})

const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordPage() {
  const requestReset = useServerFn(requestPasswordResetFn)
  const [emailSent, setEmailSent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const resetMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      if (!turnstileToken) {
        throw { message: 'Please complete the security check', status: 400 }
      }
      return await requestReset({ data: { ...data, turnstileToken } })
    },
    onSuccess: () => {
      setEmailSent(true)
    },
    onError: (error: { message?: string }) => {
      form.setError('root', {
        message: error.message || 'Failed to send reset email',
      })
    },
  })

  const onSubmit = form.handleSubmit((data) => resetMutation.mutate(data))

  if (emailSent) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: '#22c55e' }} />
          </div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Check your email
          </h2>
          <p className="mb-8" style={{ color: 'var(--foreground-muted)' }}>
            If an account exists for <strong>{form.getValues('email')}</strong>,
            we've sent password reset instructions.
          </p>
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <ArrowLeft size={18} />
            Back to Sign In
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:underline"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>

        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <KeyRound size={14} style={{ color: 'var(--primary)' }} />
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--primary)' }}
            >
              Password Reset
            </span>
          </div>
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Forgot password?
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Enter your email and we'll send you instructions to reset your
            password.
          </p>
        </div>

        {form.formState.errors.root && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl flex items-center gap-3"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">
              {form.formState.errors.root.message}
            </p>
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--foreground-muted)' }}
              />
              <input
                {...form.register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                style={{
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            {form.formState.errors.email && (
              <p className="mt-2 text-xs text-red-400">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <TurnstileWidget
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken('')}
              onExpire={() => setTurnstileToken('')}
            />
          </div>

          <motion.button
            type="submit"
            disabled={resetMutation.isPending || !turnstileToken}
            className="w-full py-4 rounded-2xl font-bold text-white relative overflow-hidden group disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
