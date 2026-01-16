import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  XCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import { generateChallenge, validateChallenge, validateBotCheck, getDeviceType, type ChallengeData } from '@/lib/bot-protection'

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

const signUpSchema = z.object({
  name: z.string().min(2, 'Min 2 characters').optional(),
  username: z.string()
    .min(3, 'Min 3 characters')
    .max(30, 'Max 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, _ and - only'),
  email: z.email({ error: 'Invalid email' }),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Need uppercase')
    .regex(/[a-z]/, 'Need lowercase')
    .regex(/[0-9]/, 'Need number'),
  confirmPassword: z.string().min(1, 'Confirm password'),
  acceptTerms: z.boolean().refine(val => val, { message: 'Required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
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
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  const [challenge, setChallenge] = useState<ChallengeData | null>(null)
  const [botCheckPassed, setBotCheckPassed] = useState(false)
  const [botCheckFailed, setBotCheckFailed] = useState(false)
  const [showChallenge, setShowChallenge] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [sliderValue, setSliderValue] = useState(0)
  const [rotateAngle, setRotateAngle] = useState(0)
  const [patternInput, setPatternInput] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef(Date.now())
  const interactionCountRef = useRef(0)
  const mouseMovementsRef = useRef(0)

  useEffect(() => {
    setDeviceType(getDeviceType())
    setChallenge(generateChallenge())
    
    const handleMouseMove = () => { mouseMovementsRef.current++ }
    const handleInteraction = () => { interactionCountRef.current++ }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [])

  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderRef.current || !isDragging) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setSliderValue((x / rect.width) * 100)
  }, [isDragging])

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
      handleSliderMove(clientX)
    }
    const handleUp = () => setIsDragging(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, handleSliderMove])

  const handlePatternClick = useCallback((index: number) => {
    setPatternInput(prev => prev.includes(index) ? prev : [...prev, index])
  }, [])

  const handleVerify = useCallback(() => {
    if (!challenge) return
    let userInput: number | number[]
    if (challenge.type === 'slider') userInput = sliderValue
    else if (challenge.type === 'rotate') userInput = rotateAngle
    else if (challenge.type === 'pattern') userInput = patternInput
    else return

    const isCorrect = validateChallenge(challenge, userInput)
    const result = validateBotCheck({
      honeypotValue: honeypot,
      startTime: startTimeRef.current,
      challengePassed: isCorrect,
      interactionCount: interactionCountRef.current,
      mouseMovements: mouseMovementsRef.current,
    })
    if (result.passed) {
      setBotCheckPassed(true)
      setBotCheckFailed(false)
      setShowChallenge(false)
    } else {
      setBotCheckFailed(true)
      setTimeout(() => {
        resetChallenge()
        setBotCheckFailed(false)
      }, 1500)
    }
  }, [challenge, sliderValue, rotateAngle, patternInput, honeypot])

  const resetChallenge = useCallback(() => {
    setChallenge(generateChallenge())
    setSliderValue(0)
    setRotateAngle(0)
    setPatternInput([])
    setBotCheckFailed(false)
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
      if (!botCheckPassed) {
        throw { message: 'Complete security check', status: 400 }
      }
      return await signUp({ data: { ...data, referralCode: search.referral } })
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
      form.setError('root', { message: error.message || 'Failed to create account' })
    },
  })

  const onSubmit = form.handleSubmit((data) => signUpMutation.mutate(data))
  const isMobile = deviceType === 'mobile'

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {!isMobile && (
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
                <div>
                  <span className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Eziox</span>
                  <span className="block text-sm font-medium" style={{ color: 'var(--primary)' }}>Bio Link Platform</span>
                </div>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
              <h1 className="text-5xl xl:text-6xl font-black mb-4 leading-[1.1]" style={{ color: 'var(--foreground)' }}>
                Create your
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  digital identity
                </span>
              </h1>
              <p className="text-xl" style={{ color: 'var(--foreground-muted)' }}>
                Join {stats.totalUsers.toLocaleString()}+ creators worldwide
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="p-4 rounded-2xl backdrop-blur-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                    <f.icon size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--foreground)' }}>{f.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {username && username.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl"
                style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>Your bio page:</p>
                <p className="font-mono text-lg" style={{ color: 'var(--primary)' }}>
                  eziox.link/<span className="font-bold">{username}</span>
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      <div className={`flex-1 flex items-center justify-center p-6 ${isMobile ? 'pt-8' : 'lg:p-12'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          {isMobile && (
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/icon.png" alt="Eziox" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Eziox</span>
            </Link>
          )}

          <div className="mb-6">
            {search.referral ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <Sparkles size={14} style={{ color: '#22c55e' }} />
                <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Referral: {search.referral}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Free forever</span>
              </div>
            )}
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Create account</h2>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Have an account?{' '}
              <Link to="/sign-in" search={search.redirect ? { redirect: search.redirect } : undefined} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
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
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{form.formState.errors.root.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-4">
            <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute -left-[9999px] opacity-0" tabIndex={-1} autoComplete="off" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                  <input {...form.register('name')} type="text" placeholder="John" className="w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50 text-sm" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Username <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>@</span>
                  <input {...form.register('username')} type="text" placeholder="username" className="w-full pl-9 pr-4 py-3.5 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50 text-sm" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                </div>
                {form.formState.errors.username && <p className="mt-1 text-xs text-red-400">{form.formState.errors.username.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Email <span className="text-red-400">*</span></label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                <input {...form.register('email')} type="email" placeholder="you@example.com" className="w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50 text-sm" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              </div>
              {form.formState.errors.email && <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                  <input {...form.register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-11 pr-10 py-3.5 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50 text-sm" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Confirm <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                  <input {...form.register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-11 pr-10 py-3.5 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-500/50 text-sm" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>

            {password && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>Strength</span>
                  <span className="text-xs font-bold" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                </div>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((l) => (
                    <div key={l} className="flex-1 h-1 rounded-full transition-all" style={{ background: l <= passwordStrength.score ? passwordStrength.color : 'var(--border)' }} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {requirements.map((r) => (
                    <div key={r.label} className="flex items-center gap-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      {r.met ? <Check className="w-3 h-3 text-green-400" /> : <X className="w-3 h-3 text-red-400" />}
                      {r.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              <motion.div
                className="p-4 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: botCheckPassed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(99, 102, 241, 0.05)',
                  border: `1px solid ${botCheckPassed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(99, 102, 241, 0.15)'}`,
                }}
                onClick={() => !botCheckPassed && setShowChallenge(true)}
                whileHover={{ scale: botCheckPassed ? 1 : 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: botCheckPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)' }}>
                    {botCheckPassed ? <CheckCircle2 size={18} style={{ color: '#22c55e' }} /> : <ShieldCheck size={18} style={{ color: '#6366f1' }} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                      {botCheckPassed ? 'Verified!' : "I'm not a robot"}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      {botCheckPassed ? 'Human verified' : 'Click to verify'}
                    </p>
                  </div>
                  {!botCheckPassed && <div className="w-5 h-5 rounded border-2" style={{ borderColor: 'rgba(99, 102, 241, 0.4)' }} />}
                </div>
              </motion.div>

              <AnimatePresence>
                {showChallenge && !botCheckPassed && challenge && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)' }}
                  >
                    <div className="p-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-white" />
                        <p className="text-sm font-semibold text-white">Security Check</p>
                      </div>
                      <button type="button" onClick={resetChallenge} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                        <RotateCcw size={14} className="text-white" />
                      </button>
                    </div>
                    <div className="p-4">
                      {challenge.type === 'slider' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: 'var(--foreground)' }}>Slide to position</span>
                            <span className="font-mono px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>{challenge.targetPosition}%</span>
                          </div>
                          <div
                            ref={sliderRef}
                            className="relative h-10 rounded-xl cursor-pointer select-none"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                            onMouseDown={(e) => { setIsDragging(true); handleSliderMove(e.clientX) }}
                            onTouchStart={(e) => { setIsDragging(true); handleSliderMove(e.touches[0]!.clientX) }}
                          >
                            <div className="absolute top-0 bottom-0 left-0 rounded-l-xl" style={{ width: `${sliderValue}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                            <div className="absolute top-1 bottom-1 w-0.5 rounded-full" style={{ left: `${challenge.targetPosition}%`, background: 'rgba(255,255,255,0.4)', transform: 'translateX(-50%)' }} />
                            <motion.div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing bg-white" style={{ left: `${sliderValue}%`, transform: 'translate(-50%, -50%)' }}>
                              <div className="flex flex-col gap-0.5">
                                <div className="w-3 h-0.5 rounded-full bg-gray-400" />
                                <div className="w-3 h-0.5 rounded-full bg-gray-400" />
                              </div>
                            </motion.div>
                          </div>
                          <p className="text-[10px] text-center" style={{ color: 'var(--foreground-muted)' }}>{Math.round(sliderValue)}% / {challenge.targetPosition}%</p>
                        </div>
                      )}
                      {challenge.type === 'rotate' && (
                        <div className="space-y-3">
                          <p className="text-sm text-center" style={{ color: 'var(--foreground)' }}>Rotate to <span className="font-bold" style={{ color: '#6366f1' }}>{challenge.targetAngle}°</span></p>
                          <div className="flex justify-center">
                            <div
                              className="relative w-28 h-28 rounded-full cursor-pointer"
                              style={{ background: 'var(--background)', border: '2px solid var(--border)' }}
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2) * (180 / Math.PI) + 90
                                setRotateAngle(((angle % 360) + 360) % 360)
                              }}
                            >
                              <motion.div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} animate={{ rotate: rotateAngle }}>
                                <div className="absolute top-2 w-1.5 h-5 rounded-full bg-white" />
                              </motion.div>
                            </div>
                          </div>
                          <p className="text-[10px] text-center" style={{ color: 'var(--foreground-muted)' }}>{Math.round(rotateAngle)}° / {challenge.targetAngle}°</p>
                        </div>
                      )}
                      {challenge.type === 'pattern' && (
                        <div className="space-y-3">
                          <p className="text-sm text-center" style={{ color: 'var(--foreground)' }}>Pattern: <span className="font-mono font-bold" style={{ color: '#6366f1' }}>{challenge.pattern.map(n => n + 1).join('→')}</span></p>
                          <div className="grid grid-cols-3 gap-1.5 max-w-[140px] mx-auto">
                            {Array.from({ length: 9 }).map((_, i) => {
                              const idx = patternInput.indexOf(i)
                              return (
                                <motion.button key={i} type="button" onClick={() => handlePatternClick(i)} className="aspect-square rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: idx !== -1 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--background)', border: `1px solid ${idx !== -1 ? '#6366f1' : 'var(--border)'}`, color: idx !== -1 ? 'white' : 'var(--foreground-muted)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  {idx !== -1 ? idx + 1 : i + 1}
                                </motion.button>
                              )
                            })}
                          </div>
                          <p className="text-[10px] text-center" style={{ color: 'var(--foreground-muted)' }}>{patternInput.length > 0 ? patternInput.map(n => n + 1).join('→') : 'Click in order'}</p>
                        </div>
                      )}
                      {botCheckFailed && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 text-center mt-3 flex items-center justify-center gap-1">
                          <XCircle size={12} /> Incorrect, try again
                        </motion.p>
                      )}
                      <motion.button type="button" onClick={handleVerify} className="w-full mt-3 py-2 rounded-xl font-semibold text-sm text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        Verify
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input type="checkbox" {...form.register('acceptTerms')} className="sr-only peer" />
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-500" style={{ borderColor: 'var(--border)' }}>
                  <motion.div initial={false} animate={{ scale: form.watch('acceptTerms') ? 1 : 0 }}>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                </div>
              </div>
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                I agree to the{' '}
                <Link to="/terms" className="font-medium underline" style={{ color: 'var(--primary)' }}>Terms</Link>
                {' & '}
                <Link to="/privacy" className="font-medium underline" style={{ color: 'var(--primary)' }}>Privacy</Link>
              </span>
            </label>

            <motion.button
              type="submit"
              disabled={signUpMutation.isPending || !botCheckPassed}
              className="w-full py-4 rounded-2xl font-bold text-white relative overflow-hidden group disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {signUpMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
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

          <div className="mt-6 flex items-center justify-center gap-6 text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: 'var(--primary)' }} />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span>Free</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
