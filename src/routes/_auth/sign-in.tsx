import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { z } from 'zod'
import {
  signInFn,
  signInWithOtpFn,
  requestOtpFn,
  getPasskeyAuthOptionsFn,
  verifyPasskeyAuthFn,
  getDiscordLoginUrlFn,
} from '@/server/functions/auth'
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
  Shield,
  AlertCircle,
  Loader2,
  Check,
  Fingerprint,
  Sparkles,
} from 'lucide-react'
import { SiDiscord } from 'react-icons/si'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'
import { useTheme } from '@/components/layout/ThemeProvider'
import { hexToRgb } from '@/lib/utils'

const searchSchema = z.object({
  redirect: z.string().optional(),
  error: z.string().optional(),
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
})

const signInSchema = z.object({
  email: z.string().email('signIn.errors.email.invalid'),
  password: z.string().min(1, 'signIn.errors.password.required'),
  rememberMe: z.boolean(),
})

type SignInFormData = z.infer<typeof signInSchema>
type AuthStep = 'method' | 'password' | 'otp-email' | 'otp-code' | 'passkey'

const DISCORD_ERROR_MESSAGES: Record<string, string> = {
  discord_denied: 'Discord login was cancelled.',
  discord_missing_params: 'Discord login failed. Please try again.',
  discord_invalid_state: 'Discord login failed (invalid state). Please try again.',
  discord_token_failed: 'Could not connect to Discord. Please try again.',
  discord_user_failed: 'Could not fetch your Discord profile. Please try again.',
  discord_callback_failed: 'Discord login failed. Please try again.',
  account_suspended: 'Your account has been suspended.',
  discord_not_configured: 'Discord login is not available right now.',
}

function SignInPage() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_auth/sign-in' })
  const navigate = useNavigate()
  const router = useRouter()
  const signIn = useServerFn(signInFn)
  const requestOtp = useServerFn(requestOtpFn)
  const signInWithOtp = useServerFn(signInWithOtpFn)
  const getPasskeyAuthOptions = useServerFn(getPasskeyAuthOptionsFn)
  const verifyPasskeyAuth = useServerFn(verifyPasskeyAuthFn)
  const { theme } = useTheme()

  const { colors, effects } = theme

  const [step, setStep] = useState<AuthStep>('method')
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(
    search.error ? (DISCORD_ERROR_MESSAGES[search.error] ?? 'An error occurred. Please try again.') : null,
  )

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const resetTurnstileToken = () => {
    setTurnstileToken('')
    try {
      ;(
        window as unknown as { resetTurnstileWidget?: () => void }
      ).resetTurnstileWidget?.()
    } catch {
      const el = document.querySelector('iframe[title*="turnstile"]')
      if (el) {
        ;(el as HTMLIFrameElement).contentWindow?.postMessage(
          { event: 'reset' },
          '*',
        )
      }
    }
  }

  // Password Sign In
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
    onError: (err: { message?: string }) => {
      if (
        err.message?.includes('Bot verification') ||
        err.message?.includes('Token expired')
      ) {
        resetTurnstileToken()
      }
      setError(err.message || t('signIn.errors.general'))
    },
  })

  const getDiscordLoginUrl = useServerFn(getDiscordLoginUrlFn)

  // Discord OAuth
  const discordMutation = useMutation({
    mutationFn: async () => {
      return await getDiscordLoginUrl({ data: { mode: 'login' } })
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url
    },
    onError: (err: Error) => setError(err.message),
  })

  // OTP Request
  const otpRequestMutation = useMutation({
    mutationFn: async (email: string) => {
      return await requestOtp({ data: { email } })
    },
    onSuccess: () => {
      setStep('otp-code')
      setError(null)
    },
    onError: (err: { message?: string }) => {
      setError(err.message || t('signIn.errors.otpFailed'))
    },
  })

  // OTP Verify
  const otpVerifyMutation = useMutation({
    mutationFn: async () => {
      const code = otpCode.join('')
      return await signInWithOtp({ data: { email: otpEmail, code } })
    },
    onSuccess: async () => {
      await router.invalidate()
      await navigate({ to: search.redirect || '/' })
    },
    onError: (err: { message?: string }) => {
      setError(err.message || t('signIn.errors.otpInvalid'))
      setOtpCode(['', '', '', '', '', ''])
    },
  })

  // Passkey
  const passkeyMutation = useMutation({
    mutationFn: async () => {
      if (!window.PublicKeyCredential) {
        throw new Error(t('signIn.errors.passkeyNotSupported'))
      }

      // Get authentication options from server
      const { options } = await getPasskeyAuthOptions({ data: {} })

      // Convert challenge to ArrayBuffer
      const challengeBuffer = Uint8Array.from(options.challenge, (c: string) =>
        c.charCodeAt(0),
      )

      // Request credential from authenticator
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          timeout: options.timeout,
          rpId: options.rpId,
          userVerification:
            options.userVerification as UserVerificationRequirement,
          allowCredentials: options.allowCredentials?.map(
            (c: { id: string; type: 'public-key' }) => ({
              id: Uint8Array.from(atob(c.id), (ch) => ch.charCodeAt(0)),
              type: c.type,
            }),
          ),
        },
      })) as PublicKeyCredential | null

      if (!credential) {
        throw new Error(t('signIn.errors.passkeyCancelled'))
      }

      const response = credential.response as AuthenticatorAssertionResponse

      // Verify with server
      await verifyPasskeyAuth({
        data: {
          credential: {
            id: credential.id,
            rawId: btoa(
              String.fromCharCode(...new Uint8Array(credential.rawId)),
            ),
            response: {
              clientDataJSON: btoa(
                String.fromCharCode(...new Uint8Array(response.clientDataJSON)),
              ),
              authenticatorData: btoa(
                String.fromCharCode(
                  ...new Uint8Array(response.authenticatorData),
                ),
              ),
              signature: btoa(
                String.fromCharCode(...new Uint8Array(response.signature)),
              ),
              userHandle: response.userHandle
                ? btoa(
                    String.fromCharCode(...new Uint8Array(response.userHandle)),
                  )
                : undefined,
            },
            type: 'public-key',
          },
          challenge: options.challenge,
        },
      })

      return { success: true }
    },
    onSuccess: async () => {
      await router.invalidate()
      await navigate({ to: search.redirect || '/' })
    },
    onError: (err: Error) => setError(err.message),
  })

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otpCode]
    newOtp[index] = value.slice(-1)
    setOtpCode(newOtp)

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }

    if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
      otpVerifyMutation.mutate()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`)
      prev?.focus()
    }
  }

  const cardBg =
    effects.cardStyle === 'glass'
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
            backdropFilter:
              effects.cardStyle === 'glass'
                ? 'blur(40px) saturate(180%)'
                : undefined,
            border: `1px solid ${colors.border}40`,
            boxShadow: `0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 0 80px rgba(${hexToRgb(colors.primary)}, 0.1)`,
          }}
        >
          {/* Top Gradient Bar */}
          <div
            className="h-1.5"
            style={{
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.primary})`,
            }}
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
                  background: `linear-gradient(135deg, ${colors.primary}20, ${colors.accent}10)`,
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                <Sparkles size={14} style={{ color: colors.primary }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  {t('signIn.badge')}
                </span>
              </motion.div>

              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: colors.foreground }}
              >
                {t('signIn.title')}
              </h1>
              <p className="text-sm" style={{ color: colors.foregroundMuted }}>
                {t('signIn.description')}
              </p>
            </div>

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
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step: Method Selection */}
            <AnimatePresence mode="wait">
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
                    {t('signIn.continueWithDiscord')}
                  </button>

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
                        className="px-4 text-xs font-medium"
                        style={{
                          background: cardBg,
                          color: colors.foregroundMuted,
                        }}
                      >
                        {t('signIn.orContinueWith')}
                      </span>
                    </div>
                  </div>

                  {/* Method Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('password')}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.02]"
                      style={{
                        background: colors.backgroundSecondary,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Lock
                        className="w-6 h-6"
                        style={{ color: colors.primary }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: colors.foreground }}
                      >
                        {t('signIn.methods.password')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('otp-email')}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.02]"
                      style={{
                        background: colors.backgroundSecondary,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Mail
                        className="w-6 h-6"
                        style={{ color: colors.accent }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: colors.foreground }}
                      >
                        {t('signIn.methods.otp')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => passkeyMutation.mutate()}
                      disabled={passkeyMutation.isPending}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{
                        background: colors.backgroundSecondary,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Fingerprint
                        className="w-6 h-6"
                        style={{ color: '#22c55e' }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: colors.foreground }}
                      >
                        {t('signIn.methods.passkey')}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step: Password Login */}
              {step === 'password' && (
                <motion.form
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={form.handleSubmit((data) =>
                    signInMutation.mutate(data),
                  )}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep('method')
                      setError(null)
                    }}
                    className="flex items-center gap-2 text-sm font-medium mb-4"
                    style={{ color: colors.foregroundMuted }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                  </button>

                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.foreground }}
                    >
                      {t('signIn.email.label')}
                    </label>
                    <div className="relative">
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
                        className="w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all"
                        style={{
                          background: colors.backgroundSecondary,
                          border: `2px solid ${focusedField === 'email' ? colors.primary : colors.border}`,
                          color: colors.foreground,
                        }}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="mt-2 text-xs text-red-400">
                        {t(form.formState.errors.email.message || '')}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: colors.foreground }}
                      >
                        {t('signIn.password.label')}
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium hover:underline"
                        style={{ color: colors.primary }}
                      >
                        {t('signIn.password.forgot')}
                      </Link>
                    </div>
                    <div className="relative">
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
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...form.register('rememberMe')}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                      style={{
                        background: form.watch('rememberMe')
                          ? colors.primary
                          : 'transparent',
                        border: `2px solid ${form.watch('rememberMe') ? colors.primary : colors.border}`,
                      }}
                    >
                      {form.watch('rememberMe') && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: colors.foregroundMuted }}
                    >
                      {t('signIn.rememberMe')}
                    </span>
                  </label>

                  {/* Turnstile */}
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield
                        className="w-4 h-4"
                        style={{ color: colors.foregroundMuted }}
                      />
                      <span
                        className="text-xs"
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
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={signInMutation.isPending || !turnstileToken}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    }}
                  >
                    {signInMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('signIn.signingIn')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {t('signIn.submit')}
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                </motion.form>
              )}

              {/* Step: OTP Email */}
              {step === 'otp-email' && (
                <motion.div
                  key="otp-email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep('method')
                      setError(null)
                    }}
                    className="flex items-center gap-2 text-sm font-medium mb-4"
                    style={{ color: colors.foregroundMuted }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                  </button>

                  <div className="text-center mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: `${colors.accent}20` }}
                    >
                      <Mail
                        className="w-8 h-8"
                        style={{ color: colors.accent }}
                      />
                    </div>
                    <h2
                      className="text-xl font-bold mb-2"
                      style={{ color: colors.foreground }}
                    >
                      {t('signIn.otp.title')}
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: colors.foregroundMuted }}
                    >
                      {t('signIn.otp.description')}
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.foreground }}
                    >
                      {t('signIn.otp.emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder={t('signIn.otp.emailPlaceholder')}
                      className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                      style={{
                        background: colors.backgroundSecondary,
                        border: `2px solid ${colors.border}`,
                        color: colors.foreground,
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => otpRequestMutation.mutate(otpEmail)}
                    disabled={!otpEmail || otpRequestMutation.isPending}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    }}
                  >
                    {otpRequestMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      t('signIn.otp.sendCode')
                    )}
                  </button>
                </motion.div>
              )}

              {/* Step: OTP Code */}
              {step === 'otp-code' && (
                <motion.div
                  key="otp-code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep('otp-email')
                      setError(null)
                      setOtpCode(['', '', '', '', '', ''])
                    }}
                    className="flex items-center gap-2 text-sm font-medium mb-4"
                    style={{ color: colors.foregroundMuted }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                  </button>

                  <div className="text-center mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: `${colors.primary}20` }}
                    >
                      <Shield
                        className="w-8 h-8"
                        style={{ color: colors.primary }}
                      />
                    </div>
                    <h2
                      className="text-xl font-bold mb-2"
                      style={{ color: colors.foreground }}
                    >
                      {t('signIn.otp.enterCode')}
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: colors.foregroundMuted }}
                    >
                      {t('signIn.otp.codeSent', { email: otpEmail })}
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="flex justify-center gap-3">
                    {otpCode.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold rounded-xl outline-none transition-all"
                        style={{
                          background: colors.backgroundSecondary,
                          border: `2px solid ${digit ? colors.primary : colors.border}`,
                          color: colors.foreground,
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => otpVerifyMutation.mutate()}
                    disabled={
                      otpCode.join('').length !== 6 ||
                      otpVerifyMutation.isPending
                    }
                    className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    }}
                  >
                    {otpVerifyMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      t('signIn.otp.verify')
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => otpRequestMutation.mutate(otpEmail)}
                    disabled={otpRequestMutation.isPending}
                    className="w-full py-2 text-sm font-medium"
                    style={{ color: colors.primary }}
                  >
                    {t('signIn.otp.resend')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign Up Link */}
            <div
              className="mt-8 pt-6 text-center"
              style={{ borderTop: `1px solid ${colors.border}` }}
            >
              <p className="text-sm" style={{ color: colors.foregroundMuted }}>
                {t('signIn.noAccount')}{' '}
                <Link
                  to="/sign-up"
                  search={
                    search.redirect ? { redirect: search.redirect } : undefined
                  }
                  className="font-semibold hover:underline"
                  style={{ color: colors.primary }}
                >
                  {t('signIn.createAccount')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
