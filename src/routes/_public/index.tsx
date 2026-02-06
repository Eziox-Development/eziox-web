/**
 * Home Page
 * Modern landing page with claim username feature and live stats
 * Inspired by haunt.gg, e-z.bio, guns.lol
 */

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { getTopUsersFn } from '@/server/functions/users'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import { getAppHostname } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CTASection } from '@/components/layout/CTASection'
import {
  Link2,
  Zap,
  BarChart3,
  Sparkles,
  ArrowRight,
  Trophy,
  Globe,
  Palette,
  Users,
  Shield,
  MousePointerClick,
  Rocket,
  CheckCircle2,
  Crown,
  TrendingUp,
  Star,
  Layers,
  Wand2,
  Heart,
  Music,
  Video,
  Code2,
  Gamepad2,
  Brush,
  Check,
  X,
  Loader2,
  Eye,
} from 'lucide-react'
import {
  SiSpotify,
  SiYoutube,
  SiTwitch,
  SiDiscord,
  SiGithub,
  SiInstagram,
  SiX,
} from 'react-icons/si'

export const Route = createFileRoute('/_public/')({
  head: () => ({
    meta: [
      { title: 'Eziox – Your Link. Your Style. Your Community.' },
      {
        name: 'description',
        content:
          'Create your personal bio link page in minutes. 30+ themes, live analytics, and completely free.',
      },
    ],
  }),
  component: HomePage,
})

export function HomePage() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const { theme, themes } = useTheme()
  const navigate = useNavigate()
  const getTopUsers = useServerFn(getTopUsersFn)
  const getPlatformStats = useServerFn(getPlatformStatsFn)

  // Claim username state
  const [claimUsername, setClaimUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle')

  // Queries
  const { data: topUsers } = useQuery({
    queryKey: ['topUsers'],
    queryFn: () => getTopUsers({}),
    staleTime: 60000,
  })

  const { data: stats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => getPlatformStats(),
    staleTime: 60000,
  })

  // Theme-based styling
  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  // Username validation regex
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/

  // Check username availability (debounced)
  useEffect(() => {
    if (!claimUsername) {
      setUsernameStatus('idle')
      return
    }

    if (!usernameRegex.test(claimUsername)) {
      setUsernameStatus('invalid')
      return
    }

    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/check-username?username=${encodeURIComponent(claimUsername)}`,
        )
        const data = await response.json()
        setUsernameStatus(data.available ? 'available' : 'taken')
      } catch {
        // Fallback: assume available if API fails
        setUsernameStatus('available')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [claimUsername])

  // Handle claim button click
  const handleClaim = () => {
    if (usernameStatus === 'available' && claimUsername) {
      void navigate({ to: '/sign-up', search: { claim: claimUsername } })
    }
  }

  // Live stats data
  const liveStats = useMemo(
    () => [
      {
        label: t('home.stats.creators'),
        value: stats?.totalUsers || 0,
        icon: Users,
        color: theme.colors.primary,
      },
      {
        label: t('home.stats.links'),
        value: stats?.totalLinks || 0,
        icon: Link2,
        color: '#22c55e',
      },
      {
        label: t('home.stats.clicks'),
        value: stats?.totalClicks || 0,
        icon: MousePointerClick,
        color: '#f59e0b',
      },
      {
        label: t('home.stats.countries'),
        value: stats?.totalCountries || 0,
        icon: Globe,
        color: '#ec4899',
      },
    ],
    [stats, t, theme.colors.primary],
  )

  // Features data
  const features = useMemo(
    () => [
      {
        icon: Link2,
        title: t('home.features.unlimited.title'),
        desc: t('home.features.unlimited.description'),
        color: '#6366f1',
      },
      {
        icon: BarChart3,
        title: t('home.features.analytics.title'),
        desc: t('home.features.analytics.description'),
        color: '#10b981',
      },
      {
        icon: Palette,
        title: t('home.features.themes.title', { count: themes.length }),
        desc: t('home.features.themes.description'),
        color: '#ec4899',
      },
      {
        icon: Shield,
        title: t('home.features.secure.title'),
        desc: t('home.features.secure.description'),
        color: '#f59e0b',
      },
      {
        icon: Zap,
        title: t('home.features.fast.title'),
        desc: t('home.features.fast.description'),
        color: '#8b5cf6',
      },
      {
        icon: Heart,
        title: t('home.features.free.title'),
        desc: t('home.features.free.description'),
        color: '#ef4444',
      },
    ],
    [t, themes.length],
  )

  // Theme categories
  const themeCategories = useMemo(
    () => [
      {
        icon: Sparkles,
        label: t('home.themes.categories.general'),
        color: '#a855f7',
      },
      {
        icon: Gamepad2,
        label: t('home.themes.categories.gamer'),
        color: '#22c55e',
      },
      {
        icon: Heart,
        label: t('home.themes.categories.vtuber'),
        color: '#f472b6',
      },
      {
        icon: Star,
        label: t('home.themes.categories.anime'),
        color: '#f97316',
      },
      {
        icon: Code2,
        label: t('home.themes.categories.developer'),
        color: '#3b82f6',
      },
      {
        icon: Video,
        label: t('home.themes.categories.streamer'),
        color: '#9146ff',
      },
      {
        icon: Brush,
        label: t('home.themes.categories.artist'),
        color: '#f59e0b',
      },
      {
        icon: Layers,
        label: t('home.themes.categories.minimal'),
        color: '#94a3b8',
      },
    ],
    [t],
  )

  // Integrations
  const integrations = useMemo(
    () => [
      {
        icon: SiSpotify,
        name: 'Spotify',
        color: '#1db954',
        desc: t('home.integrations.spotify'),
      },
      {
        icon: SiYoutube,
        name: 'YouTube',
        color: '#ff0000',
        desc: t('home.integrations.youtube'),
      },
      {
        icon: SiTwitch,
        name: 'Twitch',
        color: '#9146ff',
        desc: t('home.integrations.twitch'),
      },
      {
        icon: SiDiscord,
        name: 'Discord',
        color: '#5865f2',
        desc: t('home.integrations.discord'),
      },
      {
        icon: SiGithub,
        name: 'GitHub',
        color: theme.colors.foreground,
        desc: 'Repositories',
      },
    ],
    [t, theme.colors.foreground],
  )

  // How it works steps
  const howItWorksSteps = useMemo(
    () => [
      {
        num: '01',
        title: t('home.howItWorks.step1.title'),
        desc: t('home.howItWorks.step1.description'),
        icon: Rocket,
        color: theme.colors.primary,
      },
      {
        num: '02',
        title: t('home.howItWorks.step2.title'),
        desc: t('home.howItWorks.step2.description'),
        icon: Wand2,
        color: theme.colors.accent,
      },
      {
        num: '03',
        title: t('home.howItWorks.step3.title'),
        desc: t('home.howItWorks.step3.description'),
        icon: Globe,
        color: '#22c55e',
      },
    ],
    [t, theme.colors.primary, theme.colors.accent],
  )

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Aurora Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* Base background */}
        <div className="absolute inset-0" style={{ background: theme.colors.background }} />

        {/* Animated aurora orbs */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${theme.colors.primary}, transparent 70%)`,
            top: '-20%',
            left: '-10%',
          }}
          animate={{
            x: [0, 100, 50, 0],
            y: [0, 50, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: `radial-gradient(circle, ${theme.colors.accent}, transparent 70%)`,
            top: '10%',
            right: '-5%',
          }}
          animate={{
            x: [0, -80, -20, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-[80px]"
          style={{
            background: `radial-gradient(circle, #ec4899, transparent 70%)`,
            bottom: '10%',
            left: '30%',
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.15, 0.85, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(${theme.colors.foreground} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Top-down vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${theme.colors.background}40 50%, ${theme.colors.background} 100%)`,
          }}
        />
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated Aurora Ring behind content */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <motion.div
              className="w-[600px] h-[600px] rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${theme.colors.primary}, ${theme.colors.accent}, #ec4899, ${theme.colors.primary})`,
                filter: 'blur(80px)',
                opacity: 0.15,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10)`,
              border: `1px solid ${theme.colors.primary}25`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={16} style={{ color: theme.colors.accent }} />
            </motion.div>
            <span
              className="text-sm font-medium tracking-wide"
              style={{ color: theme.colors.foreground }}
            >
              {t('home.badge', {
                themes: themes.length,
                creators: stats?.totalUsers || 0,
              })}
            </span>
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: theme.colors.accent }}
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.02] tracking-tight"
            style={{
              fontFamily: theme.typography.displayFont,
            }}
          >
            <span style={{ color: theme.colors.foreground }}>
              {t('home.hero.line1')}{' '}
            </span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent}, #ec4899)`,
                backgroundSize: '200% 200%',
              }}
            >
              {t('home.hero.line2')}
            </span>
            <br />
            <span style={{ color: theme.colors.foreground }}>
              {t('home.hero.line3')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="relative text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('home.hero.subtitle')}
          </motion.p>

          {/* Claim Username Input - Only show for non-logged-in users */}
          {!currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="relative max-w-xl mx-auto mb-10"
            >
              <div
                className="flex items-center gap-2 p-2 rounded-2xl"
                style={{
                  background: `${theme.colors.card}cc`,
                  border: `2px solid ${usernameStatus === 'available' ? '#22c55e' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#ef4444' : theme.colors.border}`,
                  boxShadow:
                    usernameStatus === 'available'
                      ? '0 0 40px rgba(34, 197, 94, 0.25), 0 0 80px rgba(34, 197, 94, 0.1)'
                      : `0 0 60px ${theme.colors.primary}15, 0 20px 60px rgba(0,0,0,0.3)`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: `${theme.colors.backgroundSecondary}cc` }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {getAppHostname()}/
                  </span>
                </div>
                <input
                  type="text"
                  value={claimUsername}
                  onChange={(e) =>
                    setClaimUsername(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]/g, ''),
                    )
                  }
                  placeholder={t('home.claim.placeholder')}
                  className="flex-1 px-4 py-3 bg-transparent outline-none text-lg font-medium"
                  style={{ color: theme.colors.foreground }}
                  maxLength={30}
                />
                <div className="flex items-center gap-2 pr-2">
                  {usernameStatus === 'checking' && (
                    <Loader2
                      size={20}
                      className="animate-spin"
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                  )}
                  {usernameStatus === 'available' && (
                    <Check size={20} style={{ color: '#22c55e' }} />
                  )}
                  {(usernameStatus === 'taken' ||
                    usernameStatus === 'invalid') && (
                    <X size={20} style={{ color: '#ef4444' }} />
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClaim}
                  disabled={usernameStatus !== 'available'}
                  className="px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    background:
                      usernameStatus === 'available'
                        ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                        : theme.colors.backgroundSecondary,
                    color:
                      usernameStatus === 'available'
                        ? '#fff'
                        : theme.colors.foregroundMuted,
                    boxShadow:
                      usernameStatus === 'available'
                        ? `0 8px 30px ${theme.colors.primary}40`
                        : undefined,
                  }}
                >
                  {t('home.claim.button')}
                </motion.button>
              </div>

              {/* Status Message */}
              <AnimatePresence mode="wait">
                {usernameStatus !== 'idle' &&
                  usernameStatus !== 'checking' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 text-sm font-medium flex items-center justify-center gap-2"
                      style={{
                        color:
                          usernameStatus === 'available'
                            ? '#22c55e'
                            : '#ef4444',
                      }}
                    >
                      {usernameStatus === 'available' && (
                        <>
                          <Check size={14} /> {t('home.claim.available')}
                        </>
                      )}
                      {usernameStatus === 'taken' && (
                        <>
                          <X size={14} /> {t('home.claim.taken')}
                        </>
                      )}
                      {usernameStatus === 'invalid' && (
                        <>
                          <X size={14} /> {t('home.claim.invalid')}
                        </>
                      )}
                    </motion.p>
                  )}
              </AnimatePresence>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('home.claim.free')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    style={{ color: theme.colors.primary }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('home.claim.noCard')}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA Buttons for logged-in users */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="relative flex flex-wrap justify-center gap-4 mb-10"
            >
              <Link to="/profile">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    boxShadow: `0 15px 50px ${theme.colors.primary}40, 0 5px 20px rgba(0,0,0,0.3)`,
                  }}
                >
                  <Rocket size={20} />
                  {t('home.hero.dashboard')}
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link to="/creators">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold"
                  style={{
                    background: `${theme.colors.card}cc`,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Users size={20} />
                  {t('home.hero.exploreCreators')}
                </motion.button>
              </Link>
            </motion.div>
          )}

          {/* Preview Card - Centered below hero */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative max-w-sm mx-auto mt-4"
          >
            {/* Glow behind card */}
            <div
              className="absolute -inset-4 rounded-[40px] opacity-30 blur-2xl"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              }}
            />

            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative p-7 overflow-hidden"
              style={{
                background: `${theme.colors.card}e6`,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '28px',
                backdropFilter: 'blur(24px)',
                boxShadow: `0 30px 80px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Gradient shimmer at top */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.colors.primary}80, ${theme.colors.accent}80, transparent)`,
                }}
              />

              {/* Profile Content */}
              <div className="relative text-center">
                {/* Avatar with ring */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <motion.div
                    className="absolute -inset-1 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, ${theme.colors.primary}, ${theme.colors.accent}, ${theme.colors.primary})`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <div
                    className="absolute inset-0.5 rounded-full overflow-hidden"
                    style={{ background: theme.colors.background }}
                  >
                    <img
                      src="/icon.png"
                      alt="Eziox"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div
                    className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2"
                    style={{ borderColor: theme.colors.card }}
                  />
                </div>

                {/* Name & Bio */}
                <h3
                  className="text-xl font-bold mb-0.5"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  Eziox
                </h3>
                <p
                  className="text-xs mb-1"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  @eziox
                </p>
                <p
                  className="text-xs mb-4 max-w-[200px] mx-auto"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t('home.defaultBio')}
                </p>

                {/* Badges */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {[
                    { icon: Crown, color: '#ffd700', label: 'Verified' },
                    { icon: Star, color: theme.colors.primary, label: 'Platform' },
                    { icon: Shield, color: '#22c55e', label: 'Secure' },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: `${badge.color}15`,
                        border: `1px solid ${badge.color}30`,
                      }}
                      title={badge.label}
                    >
                      <badge.icon size={12} style={{ color: badge.color }} />
                    </div>
                  ))}
                </div>

                {/* Social Icons */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[SiDiscord, SiGithub, SiX, SiInstagram].map((Icon, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <Icon
                        size={14}
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                    </div>
                  ))}
                </div>

                {/* Links */}
                <div className="space-y-2">
                  {[
                    { icon: Link2, text: 'My Website', color: theme.colors.primary },
                    { icon: SiYoutube, text: 'YouTube Channel', color: '#ff0000' },
                    { icon: SiSpotify, text: 'Listen on Spotify', color: '#1db954' },
                  ].map((link, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 rounded-xl transition-all"
                      style={{
                        background:
                          i === 0
                            ? `${link.color}12`
                            : `${theme.colors.backgroundSecondary}cc`,
                        border: `1px solid ${i === 0 ? `${link.color}25` : theme.colors.border}`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${link.color}18` }}
                      >
                        <link.icon size={15} style={{ color: link.color }} />
                      </div>
                      <span
                        className="font-medium flex-1 text-left text-sm"
                        style={{ color: theme.colors.foreground }}
                      >
                        {link.text}
                      </span>
                      <ArrowRight
                        size={14}
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating accent cards */}
            <motion.div
              className="absolute -left-16 top-8 p-3 rounded-xl hidden lg:block"
              style={{
                background: `${theme.colors.card}e6`,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: 'blur(16px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}20` }}
                >
                  <Eye size={18} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <p
                    className="text-base font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {(stats?.totalViews || 0).toLocaleString()}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Profile Views
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-16 bottom-16 p-3 rounded-xl hidden lg:block"
              style={{
                background: `${theme.colors.card}e6`,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: 'blur(16px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: '#22c55e20' }}
                >
                  <TrendingUp size={18} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p
                    className="text-base font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    +{stats?.newUsersThisWeek || 0}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    This Week
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== LIVE STATS SECTION ==================== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {liveStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="relative p-6 overflow-hidden group"
                style={{
                  background: `${theme.colors.card}b3`,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter: 'blur(16px)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.2)`,
                }}
              >
                {/* Gradient top border */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                  }}
                />
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${stat.color}15, transparent 70%)`,
                  }}
                />
                <div className="relative flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${stat.color}15`,
                      boxShadow: `0 0 20px ${stat.color}20`,
                    }}
                  >
                    <stat.icon size={22} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <motion.p
                      className="text-2xl lg:text-3xl font-bold"
                      style={{
                        color: theme.colors.foreground,
                        fontFamily: theme.typography.displayFont,
                      }}
                      key={stat.value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      {stat.value.toLocaleString()}+
                    </motion.p>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}12, ${theme.colors.accent}08)`,
                border: `1px solid ${theme.colors.primary}20`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Layers size={16} style={{ color: theme.colors.accent }} />
              <span
                className="text-sm font-medium tracking-wide"
                style={{ color: theme.colors.foreground }}
              >
                {t('home.features.badge')}
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-5"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('home.features.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('home.features.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('home.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative p-6 overflow-hidden group"
                style={{
                  background: `${theme.colors.card}b3`,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 30% 20%, ${feature.color}10, transparent 60%)`,
                  }}
                />
                {/* Top shimmer line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.color}60, transparent)`,
                  }}
                />
                <div className="relative">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}18, ${feature.color}08)`,
                      border: `1px solid ${feature.color}20`,
                      boxShadow: `0 0 24px ${feature.color}15`,
                    }}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <feature.icon size={26} style={{ color: feature.color }} />
                  </motion.div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== THEMES SECTION ==================== */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Section background glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.backgroundSecondary} 30%, ${theme.colors.backgroundSecondary} 70%, ${theme.colors.background} 100%)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
          }}
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}12, ${theme.colors.accent}08)`,
                  border: `1px solid ${theme.colors.primary}20`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Palette size={16} style={{ color: theme.colors.accent }} />
                <span
                  className="text-sm font-medium tracking-wide"
                  style={{ color: theme.colors.foreground }}
                >
                  {t('home.themes.badge')}
                </span>
              </div>
              <h2
                className="text-4xl lg:text-5xl font-bold mb-6"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {t('home.themes.title', { count: themes.length })}{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  {t('home.themes.titleHighlight')}
                </span>
              </h2>
              <p
                className="text-lg mb-8 leading-relaxed"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('home.themes.subtitle')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {themeCategories.map((cat, i) => (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03, x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group"
                    style={{
                      background: `${theme.colors.card}b3`,
                      border: `1px solid ${theme.colors.border}`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-shadow duration-300"
                      style={{
                        background: `${cat.color}15`,
                        boxShadow: `0 0 0px ${cat.color}00`,
                      }}
                    >
                      <cat.icon size={16} style={{ color: cat.color }} />
                    </div>
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.foreground }}
                    >
                      {cat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-4 gap-3"
            >
              {themes.slice(0, 12).map((themeItem, i) => (
                <motion.div
                  key={themeItem.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="aspect-square rounded-xl cursor-pointer relative overflow-hidden"
                  style={{
                    background: themeItem.colors.background,
                    border: `1px solid ${themeItem.colors.primary}50`,
                    boxShadow: `0 0 20px ${themeItem.colors.primary}25`,
                  }}
                  title={themeItem.name}
                >
                  {/* Mini gradient preview */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${themeItem.colors.primary}60, transparent 70%)`,
                    }}
                  />
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        background: themeItem.colors.primary,
                        boxShadow: `0 0 10px ${themeItem.colors.primary}80`,
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full opacity-60"
                      style={{ background: themeItem.colors.accent }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== INTEGRATIONS SECTION ==================== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}12, ${theme.colors.accent}08)`,
                border: `1px solid ${theme.colors.primary}20`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Music size={16} style={{ color: theme.colors.accent }} />
              <span
                className="text-sm font-medium tracking-wide"
                style={{ color: theme.colors.foreground }}
              >
                {t('home.integrations.badge')}
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-5"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('home.integrations.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('home.integrations.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('home.integrations.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {integrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="relative p-6 text-center overflow-hidden group"
                style={{
                  background: `${theme.colors.card}b3`,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${integration.color}12, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${integration.color}60, transparent)`,
                  }}
                />
                <motion.div
                  className="relative w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${integration.color}15, ${integration.color}05)`,
                    border: `1px solid ${integration.color}20`,
                    boxShadow: `0 0 20px ${integration.color}10`,
                  }}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <integration.icon
                    size={32}
                    style={{ color: integration.color }}
                  />
                </motion.div>
                <h3
                  className="relative font-bold mb-1"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  {integration.name}
                </h3>
                <p
                  className="relative text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {integration.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TOP CREATORS SECTION ==================== */}
      {topUsers && topUsers.length > 0 && (
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Section background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.backgroundSecondary} 30%, ${theme.colors.backgroundSecondary} 70%, ${theme.colors.background} 100%)`,
            }}
          />

          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}12, ${theme.colors.accent}08)`,
                  border: `1px solid ${theme.colors.primary}20`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Trophy size={16} style={{ color: theme.colors.accent }} />
                <span
                  className="text-sm font-medium tracking-wide"
                  style={{ color: theme.colors.foreground }}
                >
                  {t('home.creators.badge')}
                </span>
              </div>
              <h2
                className="text-4xl lg:text-5xl font-bold mb-5"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {t('home.creators.title')}{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  {t('home.creators.titleHighlight')}
                </span>
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('home.creators.subtitle')}
              </p>
            </motion.div>

            {/* Top 3 Creators */}
            {topUsers.length >= 3 && (
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                {topUsers.slice(0, 3).map((item, i) => {
                  const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32']
                  const medalColor = medalColors[i] || theme.colors.primary
                  return (
                    <motion.div
                      key={item.user.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to="/$username"
                        params={{ username: item.user.username }}
                      >
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          className="relative p-6 h-full overflow-hidden group"
                          style={{
                            background: `${theme.colors.card}b3`,
                            border: `1px solid ${medalColor}30`,
                            borderRadius: cardRadius,
                            backdropFilter: 'blur(16px)',
                            boxShadow: `0 4px 24px rgba(0,0,0,0.15)`,
                          }}
                        >
                          {/* Top gradient line */}
                          <div
                            className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${medalColor}, transparent)`,
                            }}
                          />
                          {/* Hover glow */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                              background: `radial-gradient(circle at 50% 0%, ${medalColor}10, transparent 70%)`,
                            }}
                          />
                          <div className="relative flex items-center gap-4">
                            <div className="relative">
                              <Avatar
                                className="w-16 h-16 border-2"
                                style={{ borderColor: medalColor }}
                              >
                                <AvatarImage
                                  src={item.profile?.avatar || undefined}
                                />
                                <AvatarFallback
                                  style={{
                                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1.25rem',
                                  }}
                                >
                                  {(item.user.name || item.user.username)
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                  background: medalColor,
                                  color: i === 0 ? '#000' : '#fff',
                                  boxShadow: `0 4px 15px ${medalColor}60`,
                                }}
                              >
                                {i === 0 ? <Crown size={16} /> : i + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-bold text-lg truncate"
                                style={{
                                  color: theme.colors.foreground,
                                  fontFamily: theme.typography.displayFont,
                                }}
                              >
                                {item.user.name || item.user.username}
                              </p>
                              <p
                                className="text-sm truncate"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                @{item.user.username}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <TrendingUp
                                  size={16}
                                  style={{ color: medalColor }}
                                />
                                <span
                                  className="font-bold text-lg"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  {item.stats?.score?.toLocaleString() || 0}
                                </span>
                              </div>
                              <p
                                className="text-xs"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {t('home.creators.points')}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/leaderboard">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    boxShadow: `0 15px 50px ${theme.colors.primary}40, 0 5px 20px rgba(0,0,0,0.3)`,
                  }}
                >
                  <Trophy size={20} />
                  {t('home.creators.viewLeaderboard')}
                </motion.button>
              </Link>
              <Link to="/creators">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold"
                  style={{
                    background: `${theme.colors.card}cc`,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Users size={20} />
                  {t('home.creators.exploreAll')}
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ==================== HOW IT WORKS SECTION ==================== */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}12, ${theme.colors.accent}08)`,
                border: `1px solid ${theme.colors.primary}20`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Star size={16} style={{ color: theme.colors.accent }} />
              <span
                className="text-sm font-medium tracking-wide"
                style={{ color: theme.colors.foreground }}
              >
                {t('home.howItWorks.badge')}
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-5"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('home.howItWorks.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('home.howItWorks.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('home.howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center group"
              >
                {/* Step number watermark */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-7xl font-black opacity-[0.06]"
                  style={{
                    color: step.color,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  {step.num}
                </div>
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)`,
                    border: `1px solid ${step.color}25`,
                    boxShadow: `0 0 30px ${step.color}15`,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <step.icon size={36} style={{ color: step.color }} />
                </motion.div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {step.desc}
                </p>
                {/* Connector line between steps */}
                {i < howItWorksSteps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-10 -right-4 w-8 h-px"
                    style={{
                      background: `linear-gradient(90deg, ${step.color}40, ${howItWorksSteps[i + 1]?.color}40)`,
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA SECTION ==================== */}
      <CTASection />
    </div>
  )
}
