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
} from 'lucide-react'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInPage,
  validateSearch: searchSchema,
})

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInPage() {
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{ background: 'var(--background)' }}
        />
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--primary)' }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--accent)' }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Glass card */}
        <div
          className="relative rounded-3xl p-8 backdrop-blur-xl"
          style={{
            background: 'rgba(var(--card-rgb, 20, 20, 30), 0.8)',
            border: '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Gradient border effect */}
          <div
            className="absolute inset-0 rounded-3xl -z-10 opacity-50"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              padding: '1px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
            }}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                boxShadow: '0 10px 40px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
              }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Sign in to continue your journey
            </motion.p>
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
                <p className="text-sm text-red-400">
                  {form.formState.errors.root.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Email
              </label>
              <div
                className="relative group"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              >
                <div
                  className="absolute inset-0 rounded-xl transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    opacity: focusedField === 'email' ? 0.2 : 0,
                  }}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail
                    className="w-5 h-5 transition-colors duration-300"
                    style={{
                      color: focusedField === 'email' ? 'var(--primary)' : 'var(--foreground-muted)',
                    }}
                  />
                </div>
                <input
                  {...form.register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all duration-300"
                  style={{
                    background: 'var(--background-secondary)',
                    border: `1px solid ${form.formState.errors.email ? 'rgba(239, 68, 68, 0.5)' : focusedField === 'email' ? 'var(--primary)' : 'var(--border)'}`,
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-2 text-sm text-red-400">
                  {form.formState.errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Password
              </label>
              <div
                className="relative group"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              >
                <div
                  className="absolute inset-0 rounded-xl transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    opacity: focusedField === 'password' ? 0.2 : 0,
                  }}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock
                    className="w-5 h-5 transition-colors duration-300"
                    style={{
                      color: focusedField === 'password' ? 'var(--primary)' : 'var(--foreground-muted)',
                    }}
                  />
                </div>
                <input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl outline-none transition-all duration-300"
                  style={{
                    background: 'var(--background-secondary)',
                    border: `1px solid ${form.formState.errors.password ? 'rgba(239, 68, 68, 0.5)' : focusedField === 'password' ? 'var(--primary)' : 'var(--border)'}`,
                    color: 'var(--foreground)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-2 text-sm text-red-400">
                  {form.formState.errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                type="submit"
                disabled={signInMutation.isPending}
                className="w-full py-4 rounded-xl font-semibold text-white relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  boxShadow: '0 10px 40px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 15px 50px rgba(var(--primary-rgb, 99, 102, 241), 0.4)' }}
                whileTap={{ scale: 0.98 }}
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
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                  }}
                />
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-4"
                style={{ background: 'var(--card)', color: 'var(--foreground-muted)' }}
              >
                New here?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Link
              to="/sign-up"
              search={search.redirect ? { redirect: search.redirect } : undefined}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 group"
              style={{
                background: 'var(--background-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Create an account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--primary)' }} />
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 pt-6 border-t grid grid-cols-2 gap-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              <Shield className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Secure login
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Fast access
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
