import { useState, useMemo, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { z } from 'zod'
import { signUpFn } from '@/server/functions/auth'
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
  User,
  Shield,
  Zap,
  AlertCircle,
  Loader2,
  Check,
  X,
  Link as LinkIcon,
  BarChart3,
  Palette,
  Users,
  TrendingUp,
  UserPlus,
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
  referral: z.string().optional(),
  claim: z.string().optional(),
})

export const Route = createFileRoute('/_auth/sign-up')({
  head: () => ({
    meta: [
      { title: 'Sign Up | Eziox' },
      { name: 'description', content: 'Create your free Eziox account' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: SignUpPage,
  validateSearch: searchSchema,
  loader: async () => {
    const stats = await getPlatformStatsFn()
    return { stats }
  },
})

const signUpSchema = z
  .object({
    name: z.string().min(2, 'signUp.errors.name.minLength').optional(),
    username: z
      .string()
      .min(3, 'signUp.errors.username.minLength')
      .max(30, 'signUp.errors.username.maxLength')
      .regex(/^[a-zA-Z0-9_-]+$/, 'signUp.errors.username.invalid'),
    email: z.string().email('signUp.errors.email.invalid'),
    password: z
      .string()
      .min(8, 'signUp.errors.password.minLength')
      .regex(/[A-Z]/, 'signUp.errors.password.uppercase')
      .regex(/[a-z]/, 'signUp.errors.password.lowercase')
      .regex(/[0-9]/, 'signUp.errors.password.number'),
    confirmPassword: z
      .string()
      .min(1, 'signUp.errors.confirmPassword.required'),
    acceptTerms: z
      .boolean()
      .refine((val) => val, { message: 'signUp.errors.terms.required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'signUp.errors.confirmPassword.match',
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

function SignUpPage() {
  const { t } = useTranslation()
  const { stats } = Route.useLoaderData()
  const search = useSearch({ from: '/_auth/sign-up' })
  const navigate = useNavigate()
  const router = useRouter()
  const signUp = useServerFn(signUpFn)
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
  const [showConfirm, setShowConfirm] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)

  const features = [
    {
      icon: LinkIcon,
      title: t('signUp.features.oneLink.title'),
      desc: t('signUp.features.oneLink.desc'),
      color: colors.primary,
    },
    {
      icon: BarChart3,
      title: t('signUp.features.analytics.title'),
      desc: t('signUp.features.analytics.desc'),
      color: colors.accent,
    },
    {
      icon: Palette,
      title: t('signUp.features.customize.title'),
      desc: t('signUp.features.customize.desc'),
      color: '#22c55e',
    },
    {
      icon: Users,
      title: `${stats.totalUsers.toLocaleString()}+`,
      desc: t('signUp.features.creators'),
      color: '#f59e0b',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onChange',
  })

  const password = form.watch('password')
  const username = form.watch('username')

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const levels = [
      { label: t('signUp.password.strength.weak'), color: '#ef4444' },
      { label: t('signUp.password.strength.weak'), color: '#f97316' },
      { label: t('signUp.password.strength.fair'), color: '#eab308' },
      { label: t('signUp.password.strength.good'), color: '#22c55e' },
      { label: t('signUp.password.strength.strong'), color: '#10b981' },
      { label: t('signUp.password.strength.veryStrong'), color: '#06b6d4' },
    ]
    return { score, ...levels[score] }
  }, [password, t])

  const requirements = [
    {
      label: t('signUp.password.requirements.minLength'),
      met: password?.length >= 8,
    },
    {
      label: t('signUp.password.requirements.uppercase'),
      met: /[A-Z]/.test(password || ''),
    },
    {
      label: t('signUp.password.requirements.lowercase'),
      met: /[a-z]/.test(password || ''),
    },
    {
      label: t('signUp.password.requirements.number'),
      met: /[0-9]/.test(password || ''),
    },
  ]

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      if (!turnstileToken) {
        throw { message: t('signUp.errors.securityRequired'), status: 400 }
      }
      return await signUp({
        data: { ...data, referralCode: search.referral, turnstileToken },
      })
    },
    onSuccess: async () => {
      await router.invalidate()
      await navigate({ to: search.redirect || '/' })
    },
    onError: async (error: { status?: number; message?: string }) => {
      if (error?.status === 302) {
        await router.invalidate()
        await navigate({ to: search.redirect || '/' })
        return
      }
      
      // Reset turnstile token on bot verification errors
      if (error.message?.includes('Bot verification failed') || 
          error.message?.includes('Token expired') ||
          error.message?.includes('refresh the page')) {
        setTurnstileToken('')
        // Trigger turnstile reset
        const turnstileElement = document.querySelector('iframe[title*="turnstile"]')
        if (turnstileElement) {
          const turnstileWindow = (turnstileElement as HTMLIFrameElement).contentWindow
          turnstileWindow?.postMessage({ event: 'reset' }, '*')
        }
        return
      }
      
      form.setError('root', {
        message: error.message || t('signUp.errors.general'),
      })
    },
  })

  const onSubmit = form.handleSubmit((data) => signUpMutation.mutate(data))

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
            right: '-10%',
          }}
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{
            background: `rgba(${hexToRgb(colors.accent)}, ${glowOpacity * 0.8})`,
            bottom: '-15%',
            left: '-5%',
          }}
          animate={{ x: [0, 80, 0], y: [0, -40, 0], scale: [1.1, 1, 1.1] }}
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
              className="text-center mb-6"
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
                <UserPlus size={14} style={{ color: colors.primary }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  {t('signUp.badge')}
                </span>
              </motion.div>

              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: colors.foreground }}
              >
                {t('signUp.title')}
              </h1>
              <p className="text-sm" style={{ color: colors.foregroundMuted }}>
                {t('signUp.description', { count: stats.totalUsers })}
              </p>
            </motion.div>

            {/* Features Ticker */}
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
                  key={currentFeatureIndex}
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
                      const Icon = features[currentFeatureIndex]!.icon
                      return (
                        <Icon
                          size={18}
                          style={{
                            color: features[currentFeatureIndex]!.color,
                          }}
                        />
                      )
                    })()}
                  </motion.div>
                  <span
                    className="font-bold"
                    style={{ color: colors.foreground }}
                  >
                    {features[currentFeatureIndex]!.title}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: colors.foregroundMuted }}
                  >
                    {features[currentFeatureIndex]!.desc}
                  </span>
                  <TrendingUp size={14} style={{ color: '#22c55e' }} />
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-1.5 mt-2">
                {features.map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        i === currentFeatureIndex
                          ? colors.primary
                          : colors.border,
                    }}
                    animate={{ scale: i === currentFeatureIndex ? 1.2 : 1 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {form.formState.errors.root && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
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
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name & Username */}
              <div className="grid grid-cols-2 gap-3">
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.foreground }}
                  >
                    {t('signUp.name.label')}
                  </label>
                  <motion.div
                    className="relative"
                    animate={{ scale: focusedField === 'name' ? 1.01 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                      style={{
                        color:
                          focusedField === 'name'
                            ? colors.primary
                            : colors.foregroundMuted,
                      }}
                    />
                    <input
                      {...form.register('name')}
                      type="text"
                      placeholder={t('signUp.name.placeholder')}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-3 py-3 text-sm rounded-xl outline-none transition-all"
                      style={{
                        background: colors.backgroundSecondary,
                        border: `2px solid ${focusedField === 'name' ? colors.primary : colors.border}`,
                        color: colors.foreground,
                        boxShadow:
                          focusedField === 'name'
                            ? `0 0 15px rgba(${hexToRgb(colors.primary)}, 0.15)`
                            : 'none',
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* Username */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.foreground }}
                  >
                    {t('signUp.username.label')}
                  </label>
                  <motion.div
                    className="relative"
                    animate={{ scale: focusedField === 'username' ? 1.01 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors"
                      style={{
                        color:
                          focusedField === 'username'
                            ? colors.primary
                            : colors.foregroundMuted,
                      }}
                    >
                      @
                    </span>
                    <input
                      {...form.register('username')}
                      type="text"
                      placeholder={t('signUp.username.placeholder')}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-8 pr-3 py-3 text-sm rounded-xl outline-none transition-all"
                      style={{
                        background: colors.backgroundSecondary,
                        border: `2px solid ${focusedField === 'username' ? colors.primary : colors.border}`,
                        color: colors.foreground,
                        boxShadow:
                          focusedField === 'username'
                            ? `0 0 15px rgba(${hexToRgb(colors.primary)}, 0.15)`
                            : 'none',
                      }}
                    />
                  </motion.div>
                  {form.formState.errors.username && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-xs text-red-400"
                    >
                      {form.formState.errors.username.message
                        ? t(form.formState.errors.username.message)
                        : ''}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Username Preview */}
              <AnimatePresence>
                {username && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl text-sm overflow-hidden"
                    style={{
                      background: `rgba(${hexToRgb(colors.primary)}, 0.08)`,
                      border: `1px solid rgba(${hexToRgb(colors.primary)}, 0.15)`,
                    }}
                  >
                    <span style={{ color: colors.foregroundMuted }}>
                      {t('signUp.username.preview')}{' '}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: colors.primary }}
                    >
                      eziox.link/{username}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: colors.foreground }}
                >
                  {t('signUp.email.label')}
                </label>
                <motion.div
                  className="relative"
                  animate={{ scale: focusedField === 'email' ? 1.01 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
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
                    placeholder={t('signUp.email.placeholder')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-3 py-3 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: colors.backgroundSecondary,
                      border: `2px solid ${focusedField === 'email' ? colors.primary : colors.border}`,
                      color: colors.foreground,
                      boxShadow:
                        focusedField === 'email'
                          ? `0 0 15px rgba(${hexToRgb(colors.primary)}, 0.15)`
                          : 'none',
                    }}
                  />
                </motion.div>
                {form.formState.errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-xs text-red-400"
                  >
                    {form.formState.errors.email.message
                      ? t(form.formState.errors.email.message)
                      : ''}
                  </motion.p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: colors.foreground }}
                >
                  {t('signUp.password.label')}
                </label>
                <motion.div
                  className="relative"
                  animate={{ scale: focusedField === 'password' ? 1.01 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
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
                    placeholder={t('signUp.password.placeholder')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: colors.backgroundSecondary,
                      border: `2px solid ${focusedField === 'password' ? colors.primary : colors.border}`,
                      color: colors.foreground,
                      boxShadow:
                        focusedField === 'password'
                          ? `0 0 15px rgba(${hexToRgb(colors.primary)}, 0.15)`
                          : 'none',
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: colors.foregroundMuted }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </motion.button>
                </motion.div>

                {/* Password Strength */}
                <AnimatePresence>
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            className="h-1 flex-1 rounded-full"
                            initial={{ scaleX: 0 }}
                            animate={{
                              scaleX: 1,
                              background:
                                i <= passwordStrength.score
                                  ? passwordStrength.color
                                  : colors.border,
                            }}
                            transition={{ delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {requirements.map((req) => (
                          <motion.span
                            key={req.label}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: req.met
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)',
                              color: req.met ? '#22c55e' : '#ef4444',
                            }}
                            animate={{ scale: req.met ? [1, 1.1, 1] : 1 }}
                          >
                            {req.met ? <Check size={10} /> : <X size={10} />}
                            {req.label}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: colors.foreground }}
                >
                  {t('signUp.confirmPassword.label')}
                </label>
                <motion.div
                  className="relative"
                  animate={{
                    scale: focusedField === 'confirmPassword' ? 1.01 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                    style={{
                      color:
                        focusedField === 'confirmPassword'
                          ? colors.primary
                          : colors.foregroundMuted,
                    }}
                  />
                  <input
                    {...form.register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder={t('signUp.confirmPassword.placeholder')}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: colors.backgroundSecondary,
                      border: `2px solid ${focusedField === 'confirmPassword' ? colors.primary : colors.border}`,
                      color: colors.foreground,
                      boxShadow:
                        focusedField === 'confirmPassword'
                          ? `0 0 15px rgba(${hexToRgb(colors.primary)}, 0.15)`
                          : 'none',
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: colors.foregroundMuted }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </motion.button>
                </motion.div>
                {form.formState.errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-xs text-red-400"
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
                transition={{ delay: 0.65 }}
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
                    {t('signUp.security.title')}
                  </span>
                </div>
                <TurnstileWidget
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken('')}
                  onExpire={() => setTurnstileToken('')}
                />
              </motion.div>

              {/* Terms */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-xl"
                style={{
                  background: `rgba(${hexToRgb(colors.primary)}, 0.08)`,
                  border: `2px solid ${form.watch('acceptTerms') ? colors.primary : `rgba(${hexToRgb(colors.primary)}, 0.2)`}`,
                  boxShadow: form.watch('acceptTerms')
                    ? `0 0 20px rgba(${hexToRgb(colors.primary)}, 0.2)`
                    : 'none',
                }}
              >
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...form.register('acceptTerms')}
                    className="sr-only peer"
                  />
                  <motion.div
                    className="w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center transition-all shrink-0"
                    style={{
                      background: form.watch('acceptTerms')
                        ? `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`
                        : colors.backgroundSecondary,
                      border: `2px solid ${form.watch('acceptTerms') ? colors.primary : colors.border}`,
                      boxShadow: form.watch('acceptTerms')
                        ? `0 4px 12px rgba(${hexToRgb(colors.primary)}, 0.3)`
                        : 'none',
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence>
                      {form.watch('acceptTerms') && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <Check
                            className="w-4 h-4 text-white"
                            strokeWidth={3}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span
                    className="text-sm font-medium leading-relaxed"
                    style={{ color: colors.foreground }}
                  >
                    {t('signUp.terms.text')}{' '}
                    <Link
                      to="/terms"
                      className="font-bold underline hover:no-underline transition-all"
                      style={{ color: colors.primary }}
                    >
                      {t('signUp.terms.termsLink')}
                    </Link>
                    {' & '}
                    <Link
                      to="/privacy"
                      className="font-bold underline hover:no-underline transition-all"
                      style={{ color: colors.primary }}
                    >
                      {t('signUp.terms.privacyLink')}
                    </Link>
                  </span>
                </label>
                {form.formState.errors.acceptTerms && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-xs text-red-400"
                  >
                    {form.formState.errors.acceptTerms.message
                      ? t(form.formState.errors.acceptTerms.message)
                      : ''}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={signUpMutation.isPending || !turnstileToken}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
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
                  {signUpMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('signUp.creating')}
                    </>
                  ) : (
                    <>
                      {t('signUp.submit')}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
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
                  {t('signUp.divider')}
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                to="/sign-in"
                search={
                  search.redirect ? { redirect: search.redirect } : undefined
                }
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all group hover:scale-[1.02]"
                style={{
                  background: colors.backgroundSecondary,
                  border: `1px solid ${colors.border}`,
                  color: colors.foreground,
                }}
              >
                {t('signUp.signInLink')}
              </Link>
            </motion.div>

            {/* Security Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="mt-6 flex items-center justify-center gap-6 text-xs"
              style={{ color: colors.foregroundMuted }}
            >
              <div className="flex items-center gap-2">
                <Shield size={14} style={{ color: colors.primary }} />
                <span>{t('signUp.footer.ssl')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: colors.accent }} />
                <span>{t('signUp.footer.free')}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
