import { useState, useMemo } from 'react'
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
import { getOAuthUrlFn } from '@/server/functions/social-integrations'
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
  ArrowLeft,
  User,
  Shield,
  AlertCircle,
  Loader2,
  Check,
  X,
  Sparkles,
  Rocket,
} from 'lucide-react'
import { SiDiscord } from 'react-icons/si'
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
    confirmPassword: z.string().min(1, 'signUp.errors.confirmPassword.required'),
    acceptTerms: z.boolean().refine((val) => val, { message: 'signUp.errors.terms.required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'signUp.errors.confirmPassword.match',
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>
type SignUpStep = 'method' | 'details' | 'password' | 'verify'

function SignUpPage() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_auth/sign-up' })
  const navigate = useNavigate()
  const router = useRouter()
  const signUp = useServerFn(signUpFn)
  const { theme } = useTheme()

  const { colors, effects } = theme

  const [step, setStep] = useState<SignUpStep>('method')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      username: search.claim || '',
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
    { label: t('signUp.password.requirements.minLength'), met: password?.length >= 8 },
    { label: t('signUp.password.requirements.uppercase'), met: /[A-Z]/.test(password || '') },
    { label: t('signUp.password.requirements.lowercase'), met: /[a-z]/.test(password || '') },
    { label: t('signUp.password.requirements.number'), met: /[0-9]/.test(password || '') },
  ]

  const resetTurnstileToken = () => {
    setTurnstileToken('')
    try {
      ;(window as unknown as { resetTurnstileWidget?: () => void }).resetTurnstileWidget?.()
    } catch {
      const el = document.querySelector('iframe[title*="turnstile"]')
      if (el) {
        (el as HTMLIFrameElement).contentWindow?.postMessage({ event: 'reset' }, '*')
      }
    }
  }

  // Sign Up Mutation
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
    onError: async (err: { status?: number; message?: string }) => {
      if (err?.status === 302) {
        await router.invalidate()
        await navigate({ to: search.redirect || '/' })
        return
      }
      if (err.message?.includes('Bot verification') || err.message?.includes('Token expired')) {
        resetTurnstileToken()
      }
      setError(err.message || t('signUp.errors.general'))
    },
  })

  // Discord OAuth
  const discordMutation = useMutation({
    mutationFn: async () => {
      const result = await getOAuthUrlFn({ data: { platform: 'discord' } })
      if ('error' in result) throw new Error(result.error)
      return result
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url
    },
    onError: (err: Error) => setError(err.message),
  })

  const canProceedToPassword = () => {
    const { username, email } = form.getValues()
    return username && username.length >= 3 && email && email.includes('@')
  }

  const cardBg = effects.cardStyle === 'glass'
    ? `rgba(${hexToRgb(colors.card)}, 0.6)`
    : colors.card

  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Main Card */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: cardBg,
            backdropFilter: effects.cardStyle === 'glass' ? 'blur(40px) saturate(180%)' : undefined,
            border: `1px solid ${colors.border}40`,
            boxShadow: `0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 0 80px rgba(${hexToRgb(colors.primary)}, 0.1)`,
          }}
        >
          {/* Top Gradient Bar */}
          <div 
            className="h-1.5"
            style={{ background: `linear-gradient(90deg, ${colors.accent}, ${colors.primary}, ${colors.accent})` }}
          />

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}20, ${colors.primary}10)`,
                  border: `1px solid ${colors.accent}30`,
                }}
              >
                <Rocket size={14} style={{ color: colors.accent }} />
                <span className="text-xs font-semibold" style={{ color: colors.accent }}>
                  {t('signUp.badge')}
                </span>
              </motion.div>
              
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
                {t('signUp.title')}
              </h1>
              <p className="text-sm" style={{ color: colors.foregroundMuted }}>
                {t('signUp.subtitle')}
              </p>
            </div>

            {/* Progress Indicator */}
            {step !== 'method' && (
              <div className="flex items-center justify-center gap-2 mb-6">
                {['details', 'password', 'verify'].map((s, i) => (
                  <div
                    key={s}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: step === s ? 32 : 8,
                      background: ['details', 'password', 'verify'].indexOf(step) >= i 
                        ? colors.primary 
                        : colors.border,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-6 p-4 rounded-xl flex items-center gap-3"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                  <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">×</button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* Step: Method Selection */}
              {step === 'method' && (
                <motion.div
                  key="method"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Discord */}
                  <button
                    type="button"
                    onClick={() => discordMutation.mutate()}
                    disabled={discordMutation.isPending}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{ background: '#5865F2', color: 'white' }}
                  >
                    {discordMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <SiDiscord className="w-5 h-5" />
                    )}
                    {t('signUp.continueWithDiscord')}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full" style={{ borderTop: `1px solid ${colors.border}` }} />
                    </div>
                    <div className="relative flex justify-center">
                      <span 
                        className="px-4 text-xs font-medium"
                        style={{ background: cardBg, color: colors.foregroundMuted }}
                      >
                        {t('signUp.orContinueWith')}
                      </span>
                    </div>
                  </div>

                  {/* Email Sign Up */}
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: colors.backgroundSecondary,
                      border: `1px solid ${colors.border}`,
                      color: colors.foreground,
                    }}
                  >
                    <Mail className="w-5 h-5" style={{ color: colors.primary }} />
                    {t('signUp.continueWithEmail')}
                  </button>
                </motion.div>
              )}

              {/* Step: Details */}
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => { setStep('method'); setError(null) }}
                    className="flex items-center gap-2 text-sm font-medium mb-4"
                    style={{ color: colors.foregroundMuted }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                  </button>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
                      {t('signUp.name.label')} <span style={{ color: colors.foregroundMuted }}>({t('common.optional')})</span>
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                        style={{ color: focusedField === 'name' ? colors.primary : colors.foregroundMuted }}
                      />
                      <input
                        {...form.register('name')}
                        type="text"
                        placeholder={t('signUp.name.placeholder')}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all"
                        style={{
                          background: colors.backgroundSecondary,
                          border: `2px solid ${focusedField === 'name' ? colors.primary : colors.border}`,
                          color: colors.foreground,
                        }}
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
                      {t('signUp.username.label')} *
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium transition-colors"
                        style={{ color: focusedField === 'username' ? colors.primary : colors.foregroundMuted }}
                      >
                        @
                      </span>
                      <input
                        {...form.register('username')}
                        type="text"
                        placeholder={t('signUp.username.placeholder')}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-4 py-4 rounded-xl outline-none transition-all"
                        style={{
                          background: colors.backgroundSecondary,
                          border: `2px solid ${focusedField === 'username' ? colors.primary : colors.border}`,
                          color: colors.foreground,
                        }}
                      />
                    </div>
                    {form.formState.errors.username && (
                      <p className="mt-2 text-xs text-red-400">{t(form.formState.errors.username.message || '')}</p>
                    )}
                    {username && !form.formState.errors.username && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 rounded-lg"
                        style={{ background: `${colors.primary}10`, border: `1px solid ${colors.primary}20` }}
                      >
                        <p className="text-sm" style={{ color: colors.foregroundMuted }}>
                          {t('signUp.username.preview')}{' '}
                          <span className="font-semibold" style={{ color: colors.primary }}>eziox.link/{username}</span>
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
                      {t('signUp.email.label')} *
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                        style={{ color: focusedField === 'email' ? colors.primary : colors.foregroundMuted }}
                      />
                      <input
                        {...form.register('email')}
                        type="email"
                        placeholder={t('signUp.email.placeholder')}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all"
                        style={{
                          background: colors.backgroundSecondary,
                          border: `2px solid ${focusedField === 'email' ? colors.primary : colors.border}`,
                          color: colors.foreground,
                        }}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="mt-2 text-xs text-red-400">{t(form.formState.errors.email.message || '')}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('password')}
                    disabled={!canProceedToPassword()}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {t('common.continue')}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </button>
                </motion.div>
              )}

              {/* Step: Password */}
              {step === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => { setStep('details'); setError(null) }}
                    className="flex items-center gap-2 text-sm font-medium mb-4"
                    style={{ color: colors.foregroundMuted }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                  </button>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
                      {t('signUp.password.label')} *
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                        style={{ color: focusedField === 'password' ? colors.primary : colors.foregroundMuted }}
                      />
                      <input
                        {...form.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('signUp.password.placeholder')}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all"
                        style={{
                          background: colors.backgroundSecondary,
                          border: `2px solid ${focusedField === 'password' ? colors.primary : colors.border}`,
                          color: colors.foreground,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: colors.foregroundMuted }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-2"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="h-1.5 flex-1 rounded-full transition-all"
                              style={{
                                background: i <= passwordStrength.score ? passwordStrength.color : colors.border,
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {requirements.map((req) => (
                            <span
                              key={req.label}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                              style={{
                                background: req.met ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: req.met ? '#22c55e' : '#ef4444',
                              }}
                            >
                              {req.met ? <Check size={12} /> : <X size={12} />}
                              {req.label}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
                      {t('signUp.confirmPassword.label')} *
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                        style={{ color: focusedField === 'confirmPassword' ? colors.primary : colors.foregroundMuted }}
                      />
                      <input
                        {...form.register('confirmPassword')}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder={t('signUp.confirmPassword.placeholder')}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all"
                        style={{
                          background: colors.backgroundSecondary,
                          border: `2px solid ${focusedField === 'confirmPassword' ? colors.primary : colors.border}`,
                          color: colors.foreground,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: colors.foregroundMuted }}
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="mt-2 text-xs text-red-400">{t(form.formState.errors.confirmPassword.message || '')}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('verify')}
                    disabled={!password || requirements.some(r => !r.met) || form.watch('confirmPassword') !== password}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {t('common.continue')}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </button>
                </motion.div>
              )}

              {/* Step: Verify */}
              {step === 'verify' && (
                <motion.form
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={form.handleSubmit((data) => signUpMutation.mutate(data))}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => { setStep('password'); setError(null) }}
                    className="flex items-center gap-2 text-sm font-medium mb-4"
                    style={{ color: colors.foregroundMuted }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                  </button>

                  {/* Summary */}
                  <div 
                    className="p-4 rounded-xl space-y-3"
                    style={{ background: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.foregroundMuted }}>{t('signUp.username.label')}</span>
                      <span className="font-medium" style={{ color: colors.foreground }}>@{form.watch('username')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.foregroundMuted }}>{t('signUp.email.label')}</span>
                      <span className="font-medium" style={{ color: colors.foreground }}>{form.watch('email')}</span>
                    </div>
                  </div>

                  {/* Turnstile */}
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="w-4 h-4" style={{ color: colors.foregroundMuted }} />
                      <span className="text-xs" style={{ color: colors.foregroundMuted }}>
                        {t('signUp.security.title')}
                      </span>
                    </div>
                    <TurnstileWidget
                      onVerify={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken('')}
                      onExpire={() => setTurnstileToken('')}
                    />
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" {...form.register('acceptTerms')} className="sr-only" />
                    <div
                      className="w-5 h-5 mt-0.5 rounded-md flex items-center justify-center transition-all shrink-0"
                      style={{
                        background: form.watch('acceptTerms') ? colors.primary : 'transparent',
                        border: `2px solid ${form.watch('acceptTerms') ? colors.primary : colors.border}`,
                      }}
                    >
                      {form.watch('acceptTerms') && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm" style={{ color: colors.foregroundMuted }}>
                      {t('signUp.terms.prefix')}{' '}
                      <Link to="/terms" className="underline" style={{ color: colors.primary }}>{t('signUp.terms.terms')}</Link>
                      {' '}&{' '}
                      <Link to="/privacy" className="underline" style={{ color: colors.primary }}>{t('signUp.terms.privacy')}</Link>
                    </span>
                  </label>
                  {form.formState.errors.acceptTerms && (
                    <p className="text-xs text-red-400">{t(form.formState.errors.acceptTerms.message || '')}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={signUpMutation.isPending || !turnstileToken || !form.watch('acceptTerms')}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
                  >
                    {signUpMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('signUp.creating')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        {t('signUp.submit')}
                      </span>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Sign In Link */}
            <div className="mt-8 pt-6 text-center" style={{ borderTop: `1px solid ${colors.border}` }}>
              <p className="text-sm" style={{ color: colors.foregroundMuted }}>
                {t('signUp.hasAccount')}{' '}
                <Link
                  to="/sign-in"
                  search={search.redirect ? { redirect: search.redirect } : undefined}
                  className="font-semibold hover:underline"
                  style={{ color: colors.primary }}
                >
                  {t('signUp.signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
