import { useState, useEffect, useCallback, useRef } from 'react'
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
  XCircle,
  ShieldCheck,
  RotateCcw,
  Fingerprint,
} from 'lucide-react'
import { generateChallenge, validateChallenge, validateBotCheck, getDeviceType, type ChallengeData } from '@/lib/bot-protection'

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
  acceptTerms: z.boolean().refine(val => val, { message: 'Required' }),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInPage() {
  const { stats } = Route.useLoaderData()
  const search = useSearch({ from: '/_auth/sign-in' })
  const navigate = useNavigate()
  const router = useRouter()
  const signIn = useServerFn(signInFn)

  const [showPassword, setShowPassword] = useState(false)
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
    const percent = (x / rect.width) * 100
    setSliderValue(percent)
  }, [isDragging])

  const handleSliderEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
      handleSliderMove(clientX)
    }
    const handleUp = () => handleSliderEnd()

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
  }, [isDragging, handleSliderMove, handleSliderEnd])

  const handlePatternClick = useCallback((index: number) => {
    setPatternInput(prev => {
      if (prev.includes(index)) return prev
      return [...prev, index]
    })
  }, [])

  const handleVerify = useCallback(() => {
    if (!challenge) return

    let userInput: number | number[]
    if (challenge.type === 'slider') {
      userInput = sliderValue
    } else if (challenge.type === 'rotate') {
      userInput = rotateAngle
    } else if (challenge.type === 'pattern') {
      userInput = patternInput
    } else {
      return
    }

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

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      acceptTerms: false,
    },
  })

  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormData) => {
      if (!botCheckPassed) {
        throw { message: 'Please complete the security check', status: 400 }
      }
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
      form.setError('root', { message: error.message || 'Failed to sign in' })
    },
  })

  const onSubmit = form.handleSubmit((data) => signInMutation.mutate(data))

  const isMobile = deviceType === 'mobile'

  const renderChallenge = () => {
    if (!challenge) return null

    if (challenge.type === 'slider') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--foreground)' }}>Slide to the marked position</span>
            <span className="font-mono px-2 py-1 rounded" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>
              {challenge.targetPosition}%
            </span>
          </div>
          <div
            ref={sliderRef}
            className="relative h-12 rounded-xl cursor-pointer select-none"
            style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)' }}
            onMouseDown={(e) => {
              setIsDragging(true)
              handleSliderMove(e.clientX)
            }}
            onTouchStart={(e) => {
              setIsDragging(true)
              handleSliderMove(e.touches[0]!.clientX)
            }}
          >
            <div
              className="absolute top-0 bottom-0 left-0 rounded-l-xl transition-all"
              style={{ width: `${sliderValue}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
            />
            <div
              className="absolute top-1 bottom-1 w-1 rounded-full"
              style={{ left: `${challenge.targetPosition}%`, background: 'rgba(255,255,255,0.5)', transform: 'translateX(-50%)' }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing"
              style={{ left: `${sliderValue}%`, transform: 'translate(-50%, -50%)', background: 'white' }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex flex-col gap-0.5">
                <div className="w-4 h-0.5 rounded-full bg-gray-400" />
                <div className="w-4 h-0.5 rounded-full bg-gray-400" />
                <div className="w-4 h-0.5 rounded-full bg-gray-400" />
              </div>
            </motion.div>
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--foreground-muted)' }}>
            Current: {Math.round(sliderValue)}% | Target: {challenge.targetPosition}%
          </p>
        </div>
      )
    }

    if (challenge.type === 'rotate') {
      return (
        <div className="space-y-4">
          <p className="text-sm text-center" style={{ color: 'var(--foreground)' }}>
            Rotate to <span className="font-bold" style={{ color: '#6366f1' }}>{challenge.targetAngle}°</span>
          </p>
          <div className="flex justify-center">
            <div
              className="relative w-32 h-32 rounded-full cursor-pointer"
              style={{ background: 'var(--background-secondary)', border: '2px solid var(--border)' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90
                setRotateAngle(((angle % 360) + 360) % 360)
              }}
            >
              <motion.div
                className="absolute inset-2 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                animate={{ rotate: rotateAngle }}
              >
                <div className="absolute top-2 w-2 h-6 rounded-full bg-white" />
              </motion.div>
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4 rounded-full"
                style={{ background: '#22c55e', transform: `translateX(-50%) rotate(${challenge.targetAngle}deg)`, transformOrigin: '50% 64px' }}
              />
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--foreground-muted)' }}>
            Current: {Math.round(rotateAngle)}° | Target: {challenge.targetAngle}°
          </p>
        </div>
      )
    }

    if (challenge.type === 'pattern') {
      return (
        <div className="space-y-4">
          <p className="text-sm text-center" style={{ color: 'var(--foreground)' }}>
            Repeat the pattern: <span className="font-mono font-bold" style={{ color: '#6366f1' }}>{challenge.pattern.map(n => n + 1).join(' → ')}</span>
          </p>
          <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
            {Array.from({ length: challenge.gridSize * challenge.gridSize }).map((_, i) => {
              const patternIndex = patternInput.indexOf(i)
              const isInPattern = patternIndex !== -1
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => handlePatternClick(i)}
                  className="aspect-square rounded-xl flex items-center justify-center text-lg font-bold transition-all"
                  style={{
                    background: isInPattern ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--background-secondary)',
                    border: `2px solid ${isInPattern ? '#6366f1' : 'var(--border)'}`,
                    color: isInPattern ? 'white' : 'var(--foreground-muted)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isInPattern ? patternIndex + 1 : i + 1}
                </motion.button>
              )
            })}
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--foreground-muted)' }}>
            Your input: {patternInput.length > 0 ? patternInput.map(n => n + 1).join(' → ') : 'Click cells in order'}
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {!isMobile && (
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08), rgba(168, 85, 247, 0.05))' }}
          />

          <motion.div
            className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'rgba(139, 92, 246, 0.2)' }}
            animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'rgba(99, 102, 241, 0.15)' }}
            animate={{ scale: [1.1, 1, 1.1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
              <Link to="/" className="inline-flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all">
                  <img src="/icon.png" alt="Eziox" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-3xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Eziox</span>
                  <span className="block text-sm font-medium" style={{ color: 'var(--primary)' }}>Bio Link Platform</span>
                </div>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
              <h1 className="text-5xl xl:text-6xl font-black mb-6 leading-[1.1]" style={{ color: 'var(--foreground)' }}>
                Welcome
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  back
                </span>
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
      )}

      <div className={`flex-1 flex items-center justify-center p-6 ${isMobile ? 'pt-8' : 'lg:p-12'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {isMobile && (
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/icon.png" alt="Eziox" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Eziox</span>
            </Link>
          )}

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
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute -left-[9999px] opacity-0"
              tabIndex={-1}
              autoComplete="off"
            />

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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: botCheckPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)' }}>
                    {botCheckPassed ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                    ) : (
                      <ShieldCheck className="w-5 h-5" style={{ color: '#6366f1' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                      {botCheckPassed ? 'Verified!' : "I'm not a robot"}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      {botCheckPassed ? 'Human verified' : 'Click to verify'}
                    </p>
                  </div>
                  {!botCheckPassed && (
                    <div className="w-6 h-6 rounded border-2 flex items-center justify-center" style={{ borderColor: 'rgba(99, 102, 241, 0.4)' }} />
                  )}
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
                      {renderChallenge()}

                      {botCheckFailed && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-red-400 text-center mt-3 flex items-center justify-center gap-1"
                        >
                          <XCircle size={12} /> Incorrect, try again
                        </motion.p>
                      )}

                      <motion.button
                        type="button"
                        onClick={handleVerify}
                        className="w-full mt-4 py-2.5 rounded-xl font-semibold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
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
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500" style={{ borderColor: 'var(--border)' }}>
                  <motion.div initial={false} animate={{ scale: form.watch('acceptTerms') ? 1 : 0 }}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
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
              disabled={signInMutation.isPending || !botCheckPassed}
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
