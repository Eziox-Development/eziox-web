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
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Sparkles,
  Shield,
  Zap,
  AlertCircle,
  Loader2,
  Check,
  X,
  Link as LinkIcon,
  BarChart3,
  Palette,
  Globe,
  CheckCircle2,
} from 'lucide-react'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'

const searchSchema = z.object({
  redirect: z.string().optional(),
  referral: z.string().optional(),
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
    name: z.string().min(2, 'Min 2 characters').optional(),
    username: z
      .string()
      .min(3, 'Min 3 characters')
      .max(30, 'Max 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, _ and - only'),
    email: z.email({ error: 'Invalid email' }),
    password: z
      .string()
      .min(8, 'Min 8 characters')
      .regex(/[A-Z]/, 'Need uppercase')
      .regex(/[a-z]/, 'Need lowercase')
      .regex(/[0-9]/, 'Need number'),
    confirmPassword: z.string().min(1, 'Confirm password'),
    acceptTerms: z.boolean().refine((val) => val, { message: 'Required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

const features = [
  { icon: LinkIcon, title: 'One Link', desc: 'All your content in one place' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track views and clicks' },
  { icon: Palette, title: 'Customize', desc: 'Make it yours' },
  { icon: Globe, title: 'Global', desc: 'Reach worldwide' },
]

function SignUpPage() {
  const { stats } = Route.useLoaderData()
  const search = useSearch({ from: '/_auth/sign-up' })
  const navigate = useNavigate()
  const router = useRouter()
  const signUp = useServerFn(signUpFn)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')

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
      { label: 'Weak', color: '#ef4444' },
      { label: 'Weak', color: '#f97316' },
      { label: 'Fair', color: '#eab308' },
      { label: 'Good', color: '#22c55e' },
      { label: 'Strong', color: '#10b981' },
      { label: 'Very Strong', color: '#06b6d4' },
    ]
    return { score, ...levels[score] }
  }, [password])

  const requirements = [
    { label: '8+ chars', met: password?.length >= 8 },
    { label: 'A-Z', met: /[A-Z]/.test(password || '') },
    { label: 'a-z', met: /[a-z]/.test(password || '') },
    { label: '0-9', met: /[0-9]/.test(password || '') },
  ]

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      if (!turnstileToken) {
        throw { message: 'Please complete the security check', status: 400 }
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
      form.setError('root', {
        message: error.message || 'Failed to create account',
      })
    },
  })

  const onSubmit = form.handleSubmit((data) => signUpMutation.mutate(data))

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
          }}
        />

        <motion.div
          className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(99, 102, 241, 0.2)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'rgba(139, 92, 246, 0.15)' }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link to="/" className="inline-flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                <img
                  src="/icon.png"
                  alt="Eziox"
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className="text-3xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Eziox
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h1
              className="text-5xl xl:text-6xl font-bold leading-tight mb-6"
              style={{ color: 'var(--foreground)' }}
            >
              Create your
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                bio page
              </span>
            </h1>
            <p className="text-xl" style={{ color: 'var(--foreground-muted)' }}>
              Join {stats.totalUsers.toLocaleString()}+ creators sharing their
              world.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-5 rounded-2xl backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <feature.icon
                  className="w-6 h-6 mb-3"
                  style={{ color: 'var(--primary)' }}
                />
                <div
                  className="font-semibold mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  {feature.title}
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {feature.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img
                  src="/icon.png"
                  alt="Eziox"
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Eziox
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span
                className="text-xs font-semibold"
                style={{ color: 'var(--primary)' }}
              >
                Free Forever
              </span>
            </div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Create account
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Already have an account?{' '}
              <Link
                to="/sign-in"
                search={
                  search.redirect ? { redirect: search.redirect } : undefined
                }
                className="font-semibold hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Sign in
              </Link>
            </p>
          </div>

          <AnimatePresence>
            {form.formState.errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
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
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                  <input
                    {...form.register('name')}
                    type="text"
                    placeholder="Your name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Username
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    @
                  </span>
                  <input
                    {...form.register('username')}
                    type="text"
                    placeholder="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="mt-1 text-xs text-red-400">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {username && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                }}
              >
                <span style={{ color: 'var(--foreground-muted)' }}>
                  Your link:{' '}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: 'var(--primary)' }}
                >
                  eziox.link/{username}
                </span>
              </motion.div>
            )}

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
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                  style={{
                    background: 'var(--background-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: 'var(--foreground-muted)' }}
                />
                <input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
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
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          background:
                            i <= passwordStrength.score
                              ? passwordStrength.color
                              : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {requirements.map((req) => (
                      <span
                        key={req.label}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: req.met
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          color: req.met ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {req.met ? <Check size={10} /> : <X size={10} />}
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: 'var(--foreground-muted)' }}
                />
                <input
                  {...form.register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                  style={{
                    background: 'var(--background-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">
                  {form.formState.errors.confirmPassword.message}
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

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  {...form.register('acceptTerms')}
                  className="sr-only peer"
                />
                <div
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <motion.div
                    initial={false}
                    animate={{ scale: form.watch('acceptTerms') ? 1 : 0 }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                </div>
              </div>
              <span
                className="text-sm"
                style={{ color: 'var(--foreground-muted)' }}
              >
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="font-medium underline"
                  style={{ color: 'var(--primary)' }}
                >
                  Terms
                </Link>
                {' & '}
                <Link
                  to="/privacy"
                  className="font-medium underline"
                  style={{ color: 'var(--primary)' }}
                >
                  Privacy
                </Link>
              </span>
            </label>

            <motion.button
              type="submit"
              disabled={signUpMutation.isPending || !turnstileToken}
              className="w-full py-4 rounded-2xl font-bold text-white relative overflow-hidden group disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {signUpMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          <div
            className="mt-8 flex items-center justify-center gap-6 text-xs"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: 'var(--primary)' }} />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              <span>Fast</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
