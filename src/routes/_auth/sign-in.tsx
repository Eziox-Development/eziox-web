import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { z } from 'zod'
import { signInFn } from '@/server/functions/auth'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  AlertCircle,
  Loader2,
  Users,
  Check,
  MousePointerClick,
  Globe,
  TrendingUp,
  LogIn,
} from 'lucide-react'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'
import { useTheme } from '@/components/layout/ThemeProvider'

function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '99, 102, 241'
  const h = hex.slice(1)
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/sign-in')({
  head: () => ({
    meta: [
      { title: 'Sign In | Eziox' },
      { name: 'description', content: 'Sign in to your Eziox account' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: SignInPage,
  validateSearch: searchSchema,
  loader: async () => {
    const stats = await getPlatformStatsFn()
    return { stats }
  },
})

const signInSchema = z.object({
  email: z.string().email('signIn.errors.email.invalid'),
  password: z.string().min(1, 'signIn.errors.password.required'),
  rememberMe: z.boolean(),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInPage() {
  const { t } = useTranslation()
  const { stats } = Route.useLoaderData()
  const search = useSearch({ from: '/_auth/sign-in' })
  const navigate = useNavigate()
  const router = useRouter()
  const signIn = useServerFn(signInFn)
  const { theme } = useTheme()

  const { colors, effects } = theme
  const glowOpacity =
    effects.glowIntensity === 'none'
      ? 0
      : effects.glowIntensity === 'subtle'
        ? 0.08
        : effects.glowIntensity === 'medium'
          ? 0.12
          : 0.18

  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [currentStatIndex, setCurrentStatIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // Reset turnstile token on error to allow retry
  const resetTurnstileToken = () => {
    setTurnstileToken('')
    // Use the proper turnstile reset function
    try {
      ;(window as unknown as { resetTurnstileWidget?: () => void }).resetTurnstileWidget?.()
    } catch {
      // Fallback: try to find and reset the widget manually
      const turnstileElement = document.querySelector('iframe[title*="turnstile"]')
      if (turnstileElement) {
        const turnstileWindow = (turnstileElement as HTMLIFrameElement).contentWindow
        turnstileWindow?.postMessage({ event: 'reset' }, '*')
      }
    }
  }

  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormData) => {
      if (!turnstileToken) {
        throw { message: t('signIn.errors.securityRequired'), status: 400 }
      }
      return await signIn({ data: { ...data, turnstileToken } })
    },
    onSuccess: async () => {
      await router.invalidate()
      await navigate({ to: search.redirect || '/' })
    },
    onError: (error) => {
      // Reset turnstile token on any authentication error
      if (error.message?.includes('Bot verification failed') || 
          error.message?.includes('Token expired') ||
          error.message?.includes('refresh the page') ||
          error.message?.includes('Invalid email or password')) {
        resetTurnstileToken()
      }
      
      form.setError('root', {
        message: error.message || t('signIn.errors.general'),
      })
    },
  })

  const onSubmit = form.handleSubmit((data) => signInMutation.mutate(data))

  const liveStats = [
    {
      icon: Users,
      value: stats.totalUsers.toLocaleString(),
      label: t('signIn.stats.creators'),
      color: colors.primary,
    },
    {
      icon: MousePointerClick,
      value: stats.totalClicks.toLocaleString(),
      label: t('signIn.stats.clicks'),
      color: colors.accent,
    },
    {
      icon: Globe,
      value: '99.9%',
      label: t('signIn.stats.uptime'),
      color: '#22c55e',
    },
  ]

  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 pt-24"
      style={{ background: colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: `rgba(${hexToRgb(colors.primary)}, ${glowOpacity})`,
            top: '-20%',
            left: '-10%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{
            background: `rgba(${hexToRgb(colors.accent)}, ${glowOpacity * 0.8})`,
            bottom: '-15%',
            right: '-5%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background:
              effects.cardStyle === 'glass'
                ? `rgba(${hexToRgb(colors.card)}, 0.7)`
                : colors.card,
            backdropFilter:
              effects.cardStyle === 'glass'
                ? 'blur(24px) saturate(180%)'
                : undefined,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 60px rgba(${hexToRgb(colors.primary)}, ${glowOpacity})`,
          }}
        >
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            }}
          />

          <div className="relative p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, rgba(${hexToRgb(colors.primary)}, 0.15), rgba(${hexToRgb(colors.accent)}, 0.1))`,
                  border: `1px solid rgba(${hexToRgb(colors.primary)}, 0.2)`,
                }}
              >
                <LogIn size={14} style={{ color: colors.primary }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  {t('signIn.badge')}
                </span>
              </motion.div>

              <h1
                className="text-3xl font-bold mb-3"
                style={{ color: colors.foreground }}
              >
                {t('signIn.title')}
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{ color: colors.foregroundMuted }}
              >
                {t('signIn.description')}
              </p>
            </motion.div>

            {/* Live Stats Ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 p-3 rounded-xl overflow-hidden"
              style={{
                background: `rgba(${hexToRgb(colors.backgroundSecondary)}, 0.5)`,
                border: `1px solid ${colors.border}`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStatIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center gap-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {(() => {
                      const StatIcon = liveStats[currentStatIndex]!.icon
                      return (
                        <StatIcon
                          size={18}
                          style={{ color: liveStats[currentStatIndex]!.color }}
                        />
                      )
                    })()}
                  </motion.div>
                  <span
                    className="font-bold"
                    style={{ color: colors.foreground }}
                  >
                    {liveStats[currentStatIndex]!.value}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: colors.foregroundMuted }}
                  >
                    {liveStats[currentStatIndex]!.label}
                  </span>
                  <TrendingUp size={14} style={{ color: '#22c55e' }} />
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center gap-1.5 mt-2">
                {liveStats.map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        i === currentStatIndex ? colors.primary : colors.border,
                    }}
                    animate={{ scale: i === currentStatIndex ? 1.2 : 1 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {form.formState.errors.root && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="p-4 rounded-xl flex items-center gap-3 overflow-hidden"
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
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.foreground }}
                >
                  {t('signIn.email.label')}
                </label>
                <motion.div
                  className="relative"
                  animate={{ scale: focusedField === 'email' ? 1.01 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                    style={{
                      color:
                        focusedField === 'email'
                          ? colors.primary
                          : colors.foregroundMuted,
                    }}
                  />
                  <input
                    {...form.register('email')}
                    type="email"
                    placeholder={t('signIn.email.placeholder')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                      form.formState.errors.email
                        ? 'ring-2 ring-red-500/50 border-red-500/50'
                        : ''
                    }`}
                    style={{
                      background: colors.backgroundSecondary,
                      border: `2px solid ${focusedField === 'email' ? colors.primary : colors.border}`,
                      color: colors.foreground,
                      boxShadow:
                        focusedField === 'email'
                          ? `0 0 20px rgba(${hexToRgb(colors.primary)}, 0.15)`
                          : 'none',
                    }}
                  />
                </motion.div>
                {form.formState.errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-red-400"
                  >
                    {form.formState.errors.email.message
                      ? t(form.formState.errors.email.message)
                      : ''}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: colors.foreground }}
                  >
                    {t('signIn.password.label')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {t('signIn.password.forgot')}
                  </Link>
                </div>
                <motion.div
                  className="relative"
                  animate={{ scale: focusedField === 'password' ? 1.01 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                    style={{
                      color:
                        focusedField === 'password'
                          ? colors.primary
                          : colors.foregroundMuted,
                    }}
                  />
                  <input
                    {...form.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('signIn.password.placeholder')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all ${
                      form.formState.errors.password
                        ? 'ring-2 ring-red-500/50 border-red-500/50'
                        : ''
                    }`}
                    style={{
                      background: colors.backgroundSecondary,
                      border: `2px solid ${focusedField === 'password' ? colors.primary : colors.border}`,
                      color: colors.foreground,
                      boxShadow:
                        focusedField === 'password'
                          ? `0 0 20px rgba(${hexToRgb(colors.primary)}, 0.15)`
                          : 'none',
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: colors.foregroundMuted }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </motion.button>
                </motion.div>
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

              {/* Remember Me */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...form.register('rememberMe')}
                    className="sr-only peer"
                  />
                  <motion.div
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                    style={{
                      background: form.watch('rememberMe')
                        ? colors.primary
                        : 'transparent',
                      border: `2px solid ${form.watch('rememberMe') ? colors.primary : colors.border}`,
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence>
                      {form.watch('rememberMe') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span
                    className="text-sm"
                    style={{ color: colors.foregroundMuted }}
                  >
                    {t('signIn.rememberMe')}
                  </span>
                </label>
              </motion.div>

              {/* Security Check */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield
                    className="w-4 h-4"
                    style={{ color: colors.foregroundMuted }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: colors.foregroundMuted }}
                  >
                    {t('signIn.security.title')}
                  </span>
                </div>
                <TurnstileWidget
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken('')}
                  onExpire={() => setTurnstileToken('')}
                  onReset={() => setTurnstileToken('')}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={signInMutation.isPending || !turnstileToken}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="w-full py-4 rounded-xl font-bold text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                  boxShadow: `0 10px 40px rgba(${hexToRgb(colors.primary)}, 0.3)`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {signInMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('signIn.signingIn')}
                    </>
                  ) : (
                    <>
                      {t('signIn.submit')}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full"
                  style={{ borderTop: `1px solid ${colors.border}` }}
                />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-4 text-sm"
                  style={{
                    background:
                      effects.cardStyle === 'glass'
                        ? 'transparent'
                        : colors.card,
                    color: colors.foregroundMuted,
                  }}
                >
                  {t('signIn.divider')}
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Link
                to="/sign-up"
                search={
                  search.redirect ? { redirect: search.redirect } : undefined
                }
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all group hover:scale-[1.02]"
                style={{
                  background: colors.backgroundSecondary,
                  border: `1px solid ${colors.border}`,
                  color: colors.foreground,
                }}
              >
                <Sparkles
                  size={18}
                  style={{ color: colors.primary }}
                  className="group-hover:rotate-12 transition-transform"
                />
                {t('signIn.createAccount')}
              </Link>
            </motion.div>

            {/* Security Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex items-center justify-center gap-6 text-xs"
              style={{ color: colors.foregroundMuted }}
            >
              <div className="flex items-center gap-2">
                <Shield size={14} style={{ color: colors.primary }} />
                <span>{t('signIn.footer.ssl')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: colors.accent }} />
                <span>{t('signIn.footer.instant')}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
