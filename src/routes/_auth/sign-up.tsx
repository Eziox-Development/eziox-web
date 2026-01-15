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
} from 'lucide-react'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
  validateSearch: searchSchema,
  loader: async () => {
    const stats = await getPlatformStatsFn()
    return { stats }
  },
})

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignUpFormData = z.infer<typeof signUpSchema>

const features = [
  { icon: LinkIcon, title: 'One Link for Everything', description: 'Share all your content with a single bio link' },
  { icon: BarChart3, title: 'Real-time Analytics', description: 'Track views, clicks, and engagement' },
  { icon: Palette, title: 'Full Customization', description: 'Make your page uniquely yours' },
  { icon: Globe, title: 'Custom Domains', description: 'Use your own domain for branding' },
]

function SignUpPage() {
  const { stats } = Route.useLoaderData()
  const search = useSearch({ from: '/_auth/sign-up' })
  const navigate = useNavigate()
  const router = useRouter()
  const signUp = useServerFn(signUpFn)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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
      { label: 'Very weak', color: '#ef4444' },
      { label: 'Weak', color: '#f97316' },
      { label: 'Fair', color: '#eab308' },
      { label: 'Good', color: '#22c55e' },
      { label: 'Strong', color: '#10b981' },
      { label: 'Very strong', color: '#06b6d4' },
    ]
    return { score, ...levels[score] }
  }, [password])

  const passwordRequirements = [
    { label: '8+ characters', met: password?.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password || '') },
    { label: 'Lowercase', met: /[a-z]/.test(password || '') },
    { label: 'Number', met: /[0-9]/.test(password || '') },
  ]

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      // Get referral code from sessionStorage (set by /join/{code} page)
      const referralCode = typeof window !== 'undefined' 
        ? sessionStorage.getItem('referral_code') 
        : null
      
      const result = await signUp({ 
        data: { 
          ...data, 
          referralCode: referralCode || undefined 
        } 
      })
      
      // Clear referral code after successful signup
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('referral_code')
      }
      
      return result
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
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05))',
          }}
        />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-30"
          style={{ background: 'var(--primary)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--accent)' }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link to="/" className="inline-flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl overflow-hidden"
                style={{ boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }}
              >
                <img src="/icon.png" alt="Eziox" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Eziox</span>
                <span className="block text-xs" style={{ color: 'var(--primary)' }}>Bio Link Platform</span>
              </div>
            </Link>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h1
              className="text-4xl xl:text-5xl font-black mb-4 leading-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Create your
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                digital identity
              </span>
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
              Join {stats.totalUsers.toLocaleString()}+ creators sharing their world through one simple link.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-4 rounded-2xl backdrop-blur-sm"
                style={{
                  background: 'rgba(var(--card-rgb, 20, 20, 30), 0.5)',
                  border: '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(99, 102, 241, 0.2)' }}
                >
                  <feature.icon size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                  {feature.title}
                </h3>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Preview URL */}
          {username && username.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 rounded-2xl"
              style={{
                background: 'rgba(var(--card-rgb, 20, 20, 30), 0.6)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <p className="text-xs mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Your bio page will be:
              </p>
              <p className="font-mono text-lg" style={{ color: 'var(--primary)' }}>
                eziox.link/<span className="font-bold">{username}</span>
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                Free to get started
              </span>
            </motion.div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Create your account
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Already have an account?{' '}
              <Link
                to="/sign-in"
                search={search.redirect ? { redirect: search.redirect } : undefined}
                className="font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {form.formState.errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 p-4 rounded-xl flex items-center gap-3"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{form.formState.errors.root.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name & Username Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name field */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Display Name
                </label>
                <div
                  className="relative"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                >
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                    style={{ color: focusedField === 'name' ? 'var(--primary)' : 'var(--foreground-muted)' }}
                  />
                  <input
                    {...form.register('name')}
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all"
                    style={{
                      background: 'var(--background-secondary)',
                      border: `2px solid ${focusedField === 'name' ? 'var(--primary)' : 'var(--border)'}`,
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
              </div>

              {/* Username field */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Username <span className="text-red-400">*</span>
                </label>
                <div
                  className="relative"
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                >
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium transition-colors"
                    style={{ color: focusedField === 'username' ? 'var(--primary)' : 'var(--foreground-muted)' }}
                  >
                    @
                  </span>
                  <input
                    {...form.register('username')}
                    type="text"
                    placeholder="username"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl outline-none transition-all"
                    style={{
                      background: 'var(--background-secondary)',
                      border: `2px solid ${form.formState.errors.username ? 'rgba(239, 68, 68, 0.5)' : focusedField === 'username' ? 'var(--primary)' : 'var(--border)'}`,
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="mt-1.5 text-xs text-red-400">{form.formState.errors.username.message}</p>
                )}
              </div>
            </div>

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Email Address <span className="text-red-400">*</span>
              </label>
              <div
                className="relative"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              >
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                  style={{ color: focusedField === 'email' ? 'var(--primary)' : 'var(--foreground-muted)' }}
                />
                <input
                  {...form.register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all"
                  style={{
                    background: 'var(--background-secondary)',
                    border: `2px solid ${form.formState.errors.email ? 'rgba(239, 68, 68, 0.5)' : focusedField === 'email' ? 'var(--primary)' : 'var(--border)'}`,
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password field */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Password <span className="text-red-400">*</span>
                </label>
                <div
                  className="relative"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                >
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                    style={{ color: focusedField === 'password' ? 'var(--primary)' : 'var(--foreground-muted)' }}
                  />
                  <input
                    {...form.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl outline-none transition-all"
                    style={{
                      background: 'var(--background-secondary)',
                      border: `2px solid ${form.formState.errors.password ? 'rgba(239, 68, 68, 0.5)' : focusedField === 'password' ? 'var(--primary)' : 'var(--border)'}`,
                      color: 'var(--foreground)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Confirm <span className="text-red-400">*</span>
                </label>
                <div
                  className="relative"
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                >
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                    style={{ color: focusedField === 'confirmPassword' ? 'var(--primary)' : 'var(--foreground-muted)' }}
                  />
                  <input
                    {...form.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl outline-none transition-all"
                    style={{
                      background: 'var(--background-secondary)',
                      border: `2px solid ${form.formState.errors.confirmPassword ? 'rgba(239, 68, 68, 0.5)' : focusedField === 'confirmPassword' ? 'var(--primary)' : 'var(--border)'}`,
                      color: 'var(--foreground)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password strength */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl"
                style={{ background: 'var(--background-secondary)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                    Password Strength
                  </span>
                  <span className="text-xs font-bold" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="flex-1 h-1.5 rounded-full transition-all"
                      style={{
                        background: level <= passwordStrength.score ? passwordStrength.color : 'var(--border)',
                      }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      {req.met ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-red-400" />
                      )}
                      {req.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={signUpMutation.isPending}
              className="w-full py-4 rounded-xl font-semibold text-white relative overflow-hidden group disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {signUpMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating your page...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>

            {/* Terms */}
            <p className="text-xs text-center" style={{ color: 'var(--foreground-muted)' }}>
              By creating an account, you agree to our{' '}
              <a href="#" className="underline hover:no-underline" style={{ color: 'var(--primary)' }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:no-underline" style={{ color: 'var(--primary)' }}>
                Privacy Policy
              </a>
            </p>
          </form>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-center gap-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              <Shield size={16} style={{ color: 'var(--primary)' }} />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              <Zap size={16} style={{ color: 'var(--accent)' }} />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span>Free Forever</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
