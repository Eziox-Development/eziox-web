import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { requestPasswordResetFn } from '@/server/functions/auth'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Shield,
  Lock,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'
import { useTheme } from '@/components/layout/ThemeProvider'

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
  email: z.email(),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
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
        throw new Error(t('forgotPassword.errors.securityRequired'))
      }
      return await requestReset({ data: { ...data, turnstileToken } })
    },
    onSuccess: () => {
      setEmailSent(true)
    },
    onError: (error: Error) => {
      form.setError('root', {
        message: error.message || t('forgotPassword.errors.general'),
      })
    },
  })

  const onSubmit = form.handleSubmit((data) => resetMutation.mutate(data))

  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  if (emailSent) {
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
                  {t('forgotPassword.success.title')}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm mb-6 leading-relaxed"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {t('forgotPassword.success.message', {
                    email: form.getValues('email'),
                  })}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full space-y-3"
                >
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--background-secondary)' }}
                  >
                    <Clock
                      className="w-4 h-4"
                      style={{ color: 'var(--foreground-muted)' }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {t('forgotPassword.success.expiry')}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--background-secondary)' }}
                  >
                    <Shield
                      className="w-4 h-4"
                      style={{ color: 'var(--foreground-muted)' }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {t('forgotPassword.success.security')}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full mt-8"
                >
                  <Link
                    to="/sign-in"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] text-white"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <ArrowLeft size={18} />
                    {t('forgotPassword.success.backToSignIn')}
                  </Link>
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
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 80% 80%, var(--primary) 0%, transparent 50%)`,
            }}
          />

          <div className="relative">
            {/* Header */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                <Lock size={14} style={{ color: 'var(--primary)' }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}
                >
                  {t('forgotPassword.badge')}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-3"
                style={{ color: 'var(--foreground)' }}
              >
                {t('forgotPassword.title')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm leading-relaxed"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {t('forgotPassword.description')}
              </motion.p>
            </div>

            {/* Error Message */}
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

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {t('forgotPassword.email.label')}
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                  <input
                    {...form.register('email')}
                    type="email"
                    placeholder={t('forgotPassword.email.placeholder')}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all focus:ring-2 ${
                      form.formState.errors.email
                        ? 'ring-2 ring-red-500/50 border-red-500/50'
                        : 'focus:ring-purple-500/50'
                    }`}
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
                {form.formState.errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-red-400"
                  >
                    {t('forgotPassword.email.invalid')}
                  </motion.p>
                )}
              </motion.div>

              {/* Security Check */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield
                      className="w-4 h-4"
                      style={{ color: 'var(--foreground-muted)' }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {t('forgotPassword.security.title')}
                    </span>
                  </div>
                  <TurnstileWidget
                    onVerify={(token) => setTurnstileToken(token)}
                    onError={() => setTurnstileToken('')}
                    onExpire={() => setTurnstileToken('')}
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  type="submit"
                  disabled={resetMutation.isPending || !turnstileToken}
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
                        {t('forgotPassword.sending')}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        {t('forgotPassword.submit')}
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 text-center"
            >
              <Link
                to="/sign-in"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <ArrowLeft size={16} />
                {t('forgotPassword.backToSignIn')}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
