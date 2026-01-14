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
import { signInFn } from '@/server/functions/auth'
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
  Sparkles,
  Shield,
  Zap,
  AlertCircle,
  Loader2,
  Users,
  TrendingUp,
  Globe,
} from 'lucide-react'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInPage,
  validateSearch: searchSchema,
  loader: async () => {
    const stats = await getPlatformStatsFn()
    return { stats }
  },
})

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInPage() {
  const { stats } = Route.useLoaderData()
  const search = useSearch({ from: '/_auth/sign-in' })
  const navigate = useNavigate()
  const router = useRouter()
  const signIn = useServerFn(signInFn)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormData) => {
      return await signIn({ data })
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
        message: error.message || 'Failed to sign in',
      })
    },
  })

  const onSubmit = form.handleSubmit((data) => signInMutation.mutate(data))

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left Side - Branding & Social Proof */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
          }}
        />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-30"
          style={{ background: 'var(--accent)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--primary)' }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
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
                style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
              >
                <img src="/icon.png" alt="Eziox" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Eziox</span>
                <span className="block text-xs" style={{ color: 'var(--accent)' }}>Bio Link Platform</span>
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
              Welcome back,
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                creator
              </span>
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
              Your audience is waiting. Let's get you back to your dashboard.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { icon: Users, value: stats.totalUsers.toLocaleString(), label: 'Creators' },
              { icon: TrendingUp, value: stats.totalClicks.toLocaleString(), label: 'Link Clicks' },
              { icon: Globe, value: `${stats.totalCountries}+`, label: 'Countries' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-4 rounded-2xl text-center backdrop-blur-sm"
                style={{
                  background: 'rgba(var(--card-rgb, 20, 20, 30), 0.5)',
                  border: '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                }}
              >
                <stat.icon size={24} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</div>
                <div className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="space-y-3">
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
              Trusted by creators worldwide
            </p>
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-3 rounded-xl backdrop-blur-sm flex items-center gap-2"
                style={{
                  background: 'rgba(var(--card-rgb, 20, 20, 30), 0.5)',
                  border: '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                }}
              >
                <Shield size={18} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Secure Login</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-3 rounded-xl backdrop-blur-sm flex items-center gap-2"
                style={{
                  background: 'rgba(var(--card-rgb, 20, 20, 30), 0.5)',
                  border: '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                }}
              >
                <Zap size={18} style={{ color: 'var(--primary)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Instant Access</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <Shield size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                Secure Login
              </span>
            </motion.div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Sign in to your account
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Don't have an account?{' '}
              <Link
                to="/sign-up"
                search={search.redirect ? { redirect: search.redirect } : undefined}
                className="font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Sign up free
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
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Email Address
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
                  className="w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all"
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

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Password
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
                  className="w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all"
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
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={signInMutation.isPending}
              className="w-full py-4 rounded-xl font-semibold text-white relative overflow-hidden group disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {signInMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm" style={{ background: 'var(--background)', color: 'var(--foreground-muted)' }}>
                New to Eziox?
              </span>
            </div>
          </div>

          {/* Sign up CTA */}
          <Link
            to="/sign-up"
            search={search.redirect ? { redirect: search.redirect } : undefined}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all hover:scale-[1.01]"
            style={{
              background: 'var(--background-secondary)',
              border: '2px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            Create your free account
            <ArrowRight size={18} style={{ color: 'var(--primary)' }} />
          </Link>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-center gap-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              <Shield size={16} style={{ color: 'var(--primary)' }} />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              <Zap size={16} style={{ color: 'var(--accent)' }} />
              <span>Instant Access</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
