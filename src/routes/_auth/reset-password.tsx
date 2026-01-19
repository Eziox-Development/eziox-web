import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { resetPasswordFn } from '@/server/functions/auth'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'

const searchSchema = z.object({
  token: z.string(),
})

export const Route = createFileRoute('/_auth/reset-password')({
  head: () => ({
    meta: [
      { title: 'Reset Password | Eziox' },
      { name: 'description', content: 'Set a new password for your Eziox account' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ResetPasswordPage,
  validateSearch: searchSchema,
})

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordPage() {
  const search = useSearch({ from: '/_auth/reset-password' })
  const resetPassword = useServerFn(resetPasswordFn)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      return await resetPassword({ data: { token: search.token, password: data.password } })
    },
    onSuccess: () => {
      setResetSuccess(true)
    },
    onError: (error: { message?: string }) => {
      form.setError('root', { message: error.message || 'Failed to reset password' })
    },
  })

  const onSubmit = form.handleSubmit((data) => resetMutation.mutate(data))

  const password = form.watch('password')
  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'Uppercase letter' },
    { met: /[a-z]/.test(password), text: 'Lowercase letter' },
    { met: /[0-9]/.test(password), text: 'Number' },
  ]

  if (resetSuccess) {
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
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Password reset successful
          </h2>
          <p className="mb-8" style={{ color: 'var(--foreground-muted)' }}>
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            Sign In
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
            style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
          >
            <KeyRound size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>New Password</span>
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Reset password
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Enter your new password below.
          </p>
        </div>

        {form.formState.errors.root && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl flex items-center gap-3"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{form.formState.errors.root.message}</p>
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
              <input
                {...form.register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                style={{
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="mt-2 text-xs text-red-400">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {requirements.map((req) => (
              <div key={req.text} className="flex items-center gap-2 text-xs" style={{ color: req.met ? '#22c55e' : 'var(--foreground-muted)' }}>
                <CheckCircle2 size={12} />
                <span>{req.text}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
              <input
                {...form.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                style={{
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="mt-2 text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={resetMutation.isPending}
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
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
