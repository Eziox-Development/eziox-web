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
  CheckCircle2,
  Fingerprint,
} from 'lucide-react'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'

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
  email: z.email({ error: 'Invalid email address' }),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInPage() {
  const { stats } = Route.useLoaderData()
  const search = useSearch({ from: '/_auth/sign-in' })
  const navigate = useNavigate()
  const router = useRouter()
  const signIn = useServerFn(signInFn)

  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormData) => {
      if (!turnstileToken) {
        throw { message: 'Please complete the security check', status: 400 }
      }
      return await signIn({ data: { ...data, turnstileToken } })
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
      form.setError('root', { message: error.message || 'Failed to sign in' })
    },
  })

  const onSubmit = form.handleSubmit((data) => signInMutation.mutate(data))

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))' }} />
        
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <Link to="/" className="inline-flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                <img src="/icon.png" alt="Eziox" className="w-full h-full object-cover" />
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Eziox</span>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6" style={{ color: 'var(--foreground)' }}>
              Welcome back
            </h1>
            <p className="text-xl" style={{ color: 'var(--foreground-muted)' }}>
              Your audience is waiting. Let's get you connected.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: Users, value: stats.totalUsers.toLocaleString(), label: 'Creators' },
              { icon: Zap, value: stats.totalClicks.toLocaleString(), label: 'Clicks' },
              { icon: Shield, value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-5 rounded-2xl backdrop-blur-xl text-center"
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <stat.icon className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--primary)' }} />
                <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</div>
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
                <img src="/icon.png" alt="Eziox" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Eziox</span>
            </Link>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <Fingerprint size={14} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Secure Login</span>
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Sign in</h2>
            <p style={{ color: 'var(--foreground-muted)' }}>
              New here?{' '}
              <Link to="/sign-up" search={search.redirect ? { redirect: search.redirect } : undefined} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                Create account
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
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{form.formState.errors.root.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
                <input
                  {...form.register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                  style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-2 text-xs text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
                <input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                  style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--foreground-muted)' }}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-2 text-xs text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...form.register('rememberMe')} className="sr-only peer" />
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500" style={{ borderColor: 'var(--border)' }}>
                  <motion.div initial={false} animate={{ scale: form.watch('rememberMe') ? 1 : 0 }}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                </div>
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                Forgot password?
              </Link>
            </div>

            <div className="flex justify-center">
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken('')}
                onExpire={() => setTurnstileToken('')}
              />
            </div>

            <motion.button
              type="submit"
              disabled={signInMutation.isPending || !turnstileToken}
              className="w-full py-4 rounded-2xl font-bold text-white relative overflow-hidden group disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)' }}
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm" style={{ background: 'var(--background)', color: 'var(--foreground-muted)' }}>New to Eziox?</span>
            </div>
          </div>

          <Link
            to="/sign-up"
            search={search.redirect ? { redirect: search.redirect } : undefined}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.01]"
            style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            Create free account
          </Link>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: 'var(--primary)' }} />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              <span>Instant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
