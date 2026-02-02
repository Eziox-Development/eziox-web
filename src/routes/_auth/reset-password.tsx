import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { resetPasswordFn } from '@/server/functions/auth'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  Shield,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'
import { useTheme } from '@/components/layout/ThemeProvider'

const searchSchema = z.object({
  token: z.string(),
})

export const Route = createFileRoute('/_auth/reset-password')({
  head: () => ({
    meta: [
      { title: 'Reset Password | Eziox' },
      {
        name: 'description',
        content: 'Set a new password for your Eziox account',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ResetPasswordPage,
  validateSearch: searchSchema,
})

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'resetPassword.errors.password.minLength')
      .regex(/[A-Z]/, 'resetPassword.errors.password.uppercase')
      .regex(/[a-z]/, 'resetPassword.errors.password.lowercase')
      .regex(/[0-9]/, 'resetPassword.errors.password.number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'resetPassword.errors.password.match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const search = useSearch({ from: '/_auth/reset-password' })
  const resetPassword = useServerFn(resetPasswordFn)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      if (!turnstileToken) {
        throw new Error(t('resetPassword.errors.securityRequired'))
      }
      return await resetPassword({
        data: { token: search.token, password: data.password },
      })
    },
    onSuccess: () => {
      setResetSuccess(true)
    },
    onError: (error: Error) => {
      form.setError('root', {
        message: error.message || t('resetPassword.errors.general'),
      })
    },
  })

  const onSubmit = form.handleSubmit((data) => resetMutation.mutate(data))

  const password = form.watch('password')
  const requirements = [
    {
      met: password.length >= 8,
      text: t('resetPassword.requirements.minLength'),
      icon: 'length',
    },
    {
      met: /[A-Z]/.test(password),
      text: t('resetPassword.requirements.uppercase'),
      icon: 'uppercase',
    },
    {
      met: /[a-z]/.test(password),
      text: t('resetPassword.requirements.lowercase'),
      icon: 'lowercase',
    },
    {
      met: /[0-9]/.test(password),
      text: t('resetPassword.requirements.number'),
      icon: 'number',
    },
  ]

  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  if (resetSuccess) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div
            className="relative overflow-hidden rounded-2xl p-8"
            style={{
              background: 'var(--background-primary)',
              border: '1px solid var(--border)',
              boxShadow: `0 20px 60px rgba(34, 197, 94, ${glowOpacity})`,
            }}
          >
            {/* Success Animation Background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #10b981)',
              }}
            />

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #10b981)',
                    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-3"
                  style={{ color: 'var(--foreground)' }}
                >
                  {t('resetPassword.success.title')}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm mb-6 leading-relaxed"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {t('resetPassword.success.message')}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-3 w-full"
                >
                  <div className="flex items-center gap-2">
                    <Shield
                      className="w-4 h-4"
                      style={{ color: 'var(--foreground-muted)' }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {t('resetPassword.success.security')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Info
                      className="w-4 h-4"
                      style={{ color: 'var(--foreground-muted)' }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {t('resetPassword.success.info')}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 w-full"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/sign-in"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      <ArrowLeft size={18} />
                      {t('resetPassword.success.signIn')}
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: 'var(--background-primary)',
            border: '1px solid var(--border)',
            boxShadow: `0 20px 60px rgba(99, 102, 241, ${glowOpacity})`,
          }}
        >
          {/* Gradient Background */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}
          />

          <div className="relative">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                <KeyRound size={14} style={{ color: 'var(--primary)' }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}
                >
                  {t('resetPassword.badge')}
                </span>
              </div>

              <h1
                className="text-3xl font-bold mb-3"
                style={{ color: 'var(--foreground)' }}
              >
                {t('resetPassword.title')}
              </h1>

              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {t('resetPassword.description')}
              </p>
            </motion.div>

            {/* Error Display */}
            {form.formState.errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl flex items-center gap-3"
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
              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {t('resetPassword.password.label')}
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                  <input
                    {...form.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('resetPassword.password.placeholder')}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all focus:ring-2 ${
                      form.formState.errors.password
                        ? 'ring-2 ring-red-500/50 border-red-500/50'
                        : 'focus:ring-purple-500/50'
                    }`}
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-red-400"
                  >
                    {form.formState.errors.password.message
                      ? t(form.formState.errors.password.message)
                      : ''}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield
                    className="w-4 h-4"
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {t('resetPassword.requirements.title')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {requirements.map((req) => (
                    <motion.div
                      key={req.icon}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.4 + requirements.indexOf(req) * 0.1,
                      }}
                      className="flex items-center gap-2 text-xs p-2 rounded-lg"
                      style={{
                        background: req.met
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: req.met ? '#22c55e' : 'var(--foreground-muted)',
                      }}
                    >
                      {req.met ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}
                      <span>{req.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {t('resetPassword.confirmPassword.label')}
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                  <input
                    {...form.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('resetPassword.confirmPassword.placeholder')}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all focus:ring-2 ${
                      form.formState.errors.confirmPassword
                        ? 'ring-2 ring-red-500/50 border-red-500/50'
                        : 'focus:ring-purple-500/50'
                    }`}
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-red-400"
                  >
                    {form.formState.errors.confirmPassword.message
                      ? t(form.formState.errors.confirmPassword.message)
                      : ''}
                  </motion.p>
                )}
              </motion.div>

              {/* Security Check */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield
                    className="w-4 h-4"
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {t('resetPassword.security.title')}
                  </span>
                </div>
                <TurnstileWidget
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => {
                    form.setError('root', {
                      message: t('resetPassword.errors.securityFailed'),
                    })
                  }}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                type="submit"
                disabled={resetMutation.isPending}
                className="w-full py-4 rounded-xl font-bold text-white relative overflow-hidden group disabled:opacity-60"
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
                      {t('resetPassword.resetting')}
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5" />
                      {t('resetPassword.submit')}
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <Link
                to="/sign-in"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <ArrowLeft size={16} />
                {t('resetPassword.backToSignIn')}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
