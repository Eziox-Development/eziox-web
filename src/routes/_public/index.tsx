import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getTopUsersFn } from '@/server/functions/users'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/layout/ThemeProvider'
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
  Calendar,
  Code2,
  Gamepad2,
  Brush,
} from 'lucide-react'
import {
  SiSpotify,
  SiYoutube,
  SiSoundcloud,
  SiTwitch,
  SiDiscord,
} from 'react-icons/si'

export const Route = createFileRoute('/_public/')({
  head: () => ({
    meta: [
      { title: 'Eziox – Your Link. Your Style. Your Community.' },
      {
        name: 'description',
        content:
          'Create your personal bio link page in minutes. 30+ themes, live analytics, and completely free. For creators, streamers, VTubers, and everyone who wants to stand out.',
      },
      {
        property: 'og:title',
        content: 'Eziox – Your Link. Your Style. Your Community.',
      },
      {
        property: 'og:description',
        content:
          'Create your personal bio link page in minutes. 30+ themes, live analytics, and completely free.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: 'Eziox – Your Link. Your Style. Your Community.',
      },
      {
        name: 'twitter:description',
        content:
          'Create your personal bio link page in minutes. 30+ themes, live analytics, and completely free.',
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const { currentUser } = useAuth()
  const { theme, themes } = useTheme()
  const getTopUsers = useServerFn(getTopUsersFn)
  const getPlatformStats = useServerFn(getPlatformStatsFn)

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

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  const liveStats = [
    {
      label: 'Creators',
      value: stats?.totalUsers || 0,
      icon: Users,
      suffix: '+',
      color: theme.colors.primary,
    },
    {
      label: 'Links',
      value: stats?.totalLinks || 0,
      icon: Link2,
      suffix: '+',
      color: '#22c55e',
    },
    {
      label: 'Clicks',
      value: stats?.totalClicks || 0,
      icon: MousePointerClick,
      suffix: '',
      color: '#f59e0b',
    },
    {
      label: 'Countries',
      value: stats?.totalCountries || 0,
      icon: Globe,
      suffix: '',
      color: '#ec4899',
    },
  ]

  const features = [
    {
      icon: Link2,
      title: 'Unlimited Links',
      desc: 'Add as many links as you need – no limits',
      color: '#6366f1',
    },
    {
      icon: BarChart3,
      title: 'Live Analytics',
      desc: 'See who clicks and where they come from',
      color: '#10b981',
    },
    {
      icon: Palette,
      title: `${themes.length}+ Themes`,
      desc: 'From gamer to minimal – find your style',
      color: '#ec4899',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      desc: 'Your data belongs to you. Period.',
      color: '#f59e0b',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Optimized for every device',
      color: '#8b5cf6',
    },
    {
      icon: Heart,
      title: 'Free. Really.',
      desc: 'No hidden costs, no catch',
      color: '#ef4444',
    },
  ]

  const themeCategories = useMemo(
    () => [
      {
        name: 'Gamer',
        count: themes.filter((t) => t.category === 'gamer').length,
        color: '#00ff00',
        icon: Gamepad2,
      },
      {
        name: 'VTuber',
        count: themes.filter((t) => t.category === 'vtuber').length,
        color: '#ff6b9d',
        icon: Heart,
      },
      {
        name: 'Anime',
        count: themes.filter((t) => t.category === 'anime').length,
        color: '#ff4500',
        icon: Star,
      },
      {
        name: 'Developer',
        count: themes.filter((t) => t.category === 'developer').length,
        color: '#58a6ff',
        icon: Code2,
      },
      {
        name: 'Streamer',
        count: themes.filter((t) => t.category === 'streamer').length,
        color: '#9146ff',
        icon: Video,
      },
      {
        name: 'Artist',
        count: themes.filter((t) => t.category === 'artist').length,
        color: '#e8a87c',
        icon: Brush,
      },
    ],
    [themes],
  )

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full blur-[250px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.35,
          }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 80, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-60 -right-40 w-[800px] h-[800px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.3,
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -60, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{
            background: `${theme.colors.primary}60`,
            opacity: glowOpacity * 0.15,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background:
                i % 2 === 0 ? theme.colors.primary : theme.colors.accent,
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              opacity: 0.5,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, i % 2 === 0 ? 25 : -25, 0],
              scale: [1, 1.8, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                  border: `1px solid ${theme.colors.primary}30`,
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={16} style={{ color: theme.colors.primary }} />
                </motion.div>
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {themes.length}+ Themes • {stats?.totalUsers || 0}+ Creators •
                  Free
                </span>
              </motion.div>

              {/* Headline */}
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05]"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                Your Link.
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  Your Style.
                </span>
                <br />
                <span className="relative inline-block">
                  Your Community.
                  <motion.div
                    className="absolute -right-10 -top-2"
                    animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Zap size={28} style={{ color: theme.colors.accent }} />
                  </motion.div>
                </span>
              </h1>

              {/* Subheadline */}
              <p
                className="text-lg md:text-xl mb-10 max-w-xl leading-relaxed"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Forget boring link pages. With Eziox, create a bio page in
                minutes that truly looks like you – with themes that match your
                vibe.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                {currentUser ? (
                  <Link to="/profile">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg text-white"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        boxShadow:
                          glowOpacity > 0
                            ? `0 20px 50px ${theme.colors.primary}50`
                            : `0 10px 30px rgba(0,0,0,0.3)`,
                      }}
                    >
                      Go to Dashboard
                      <ArrowRight size={20} />
                    </motion.button>
                  </Link>
                ) : (
                  <>
                    <Link to="/sign-up">
                      <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg text-white"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                          boxShadow:
                            glowOpacity > 0
                              ? `0 20px 50px ${theme.colors.primary}50`
                              : `0 10px 30px rgba(0,0,0,0.3)`,
                        }}
                      >
                        Get Started – Free
                        <Rocket size={20} />
                      </motion.button>
                    </Link>
                    <Link to="/creators">
                      <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg"
                        style={{
                          background:
                            theme.effects.cardStyle === 'glass'
                              ? `${theme.colors.card}80`
                              : theme.colors.card,
                          border: `1px solid ${theme.colors.border}`,
                          color: theme.colors.foreground,
                          backdropFilter:
                            theme.effects.cardStyle === 'glass'
                              ? 'blur(10px)'
                              : undefined,
                        }}
                      >
                        Explore Creators
                        <Users size={20} />
                      </motion.button>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6">
                {[
                  { icon: CheckCircle2, text: 'Free Forever' },
                  { icon: Zap, text: 'Online in 2 Min' },
                  { icon: Shield, text: 'GDPR Compliant' },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <item.icon
                      size={16}
                      style={{ color: theme.colors.primary }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Interactive Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Main Preview Card */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative p-8 overflow-hidden"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}90`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(20px)'
                      : undefined,
                }}
              >
                {/* Glow effect */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl"
                  style={{
                    background: theme.colors.primary,
                    opacity: glowOpacity * 0.3,
                  }}
                />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      }}
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Wand2 size={28} className="text-white" />
                    </motion.div>
                    <div>
                      <p
                        className="font-bold text-lg"
                        style={{ color: theme.colors.foreground }}
                      >
                        Theme: {theme.name}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        Switch anytime – all free
                      </p>
                    </div>
                  </div>

                  {/* Theme Categories Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {themeCategories.map((cat, i) => (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.4 + i * 0.05,
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="p-3 rounded-xl text-center cursor-pointer group"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ background: `${cat.color}20` }}
                        >
                          <cat.icon size={16} style={{ color: cat.color }} />
                        </div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: theme.colors.foreground }}
                        >
                          {cat.name}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {cat.count} Themes
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Color Preview */}
                  <div className="flex gap-2">
                    {[
                      { color: theme.colors.primary, label: 'Primary' },
                      { color: theme.colors.accent, label: 'Accent' },
                      {
                        color: theme.colors.background,
                        label: 'BG',
                        border: true,
                      },
                      {
                        color: theme.colors.foreground,
                        label: 'Text',
                        border: true,
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1, y: -2 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="flex-1 h-12 rounded-xl cursor-pointer"
                        style={{
                          background: item.color,
                          border: item.border
                            ? `1px solid ${theme.colors.border}`
                            : 'none',
                        }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 -left-6 p-4"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}95`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 20px 40px rgba(0,0,0,0.2)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.colors.primary}20` }}
                  >
                    <TrendingUp
                      size={20}
                      style={{ color: theme.colors.primary }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-lg font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      +{stats?.totalClicks?.toLocaleString() || '0'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Clicks today
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -8, 0] }}
                transition={{
                  opacity: { delay: 0.8 },
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.8,
                  },
                }}
                className="absolute -top-4 -right-4 px-4 py-2 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow: `0 10px 30px ${theme.colors.primary}40`,
                }}
              >
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Star size={14} /> New: {themes.length} Themes
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + i * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="relative p-6 overflow-hidden group"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
                }}
              >
                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${stat.color}15, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)`,
                  }}
                />

                <div className="relative flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}20` }}
                  >
                    <stat.icon size={22} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <motion.p
                      className="text-2xl lg:text-3xl font-bold"
                      style={{ color: theme.colors.foreground }}
                      key={stat.value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      {typeof stat.value === 'number'
                        ? stat.value.toLocaleString()
                        : stat.value}
                      {stat.suffix}
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

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Layers size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                What's Included
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Everything you need.{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Nothing you don't.
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              No complicated settings. No paywalls for basic features. Just get
              started and look good.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative p-6 overflow-hidden group"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
                }}
              >
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 30% 0%, ${feature.color}10, transparent 60%)`,
                  }}
                />

                <div className="relative">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.color}20` }}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <feature.icon size={26} style={{ color: feature.color }} />
                  </motion.div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: theme.colors.foregroundMuted }}>
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme System Section */}
      <section
        className="py-24 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                  border: `1px solid ${theme.colors.primary}30`,
                }}
              >
                <Palette size={16} style={{ color: theme.colors.primary }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  Theme System
                </span>
              </div>
              <h2
                className="text-4xl lg:text-5xl font-bold mb-6"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {themes.length}+ Themes.{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  8 Categories.
                </span>
              </h2>
              <p
                className="text-lg mb-8"
                style={{ color: theme.colors.foregroundMuted }}
              >
                From gamer aesthetics to minimalist elegance. Each theme has its
                own colors, fonts, and effects. Switch whenever you want – all
                are free.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: Sparkles, label: 'General', color: '#a855f7' },
                  { icon: Gamepad2, label: 'Gamer', color: '#22c55e' },
                  { icon: Heart, label: 'VTuber', color: '#f472b6' },
                  { icon: Star, label: 'Anime', color: '#f97316' },
                  { icon: Code2, label: 'Developer', color: '#3b82f6' },
                  { icon: Video, label: 'Streamer', color: '#9146ff' },
                  { icon: Brush, label: 'Artist', color: '#f59e0b' },
                  { icon: Layers, label: 'Minimal', color: '#94a3b8' },
                ].map((cat, i) => (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.05,
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                    whileHover={{ scale: 1.03, x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group"
                    style={{
                      background: theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: `${cat.color}20` }}
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
              {themes.slice(0, 12).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.03,
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="aspect-square rounded-xl cursor-pointer"
                  style={{
                    background: t.colors.background,
                    border: `2px solid ${t.colors.primary}`,
                    boxShadow: `0 0 25px ${t.colors.primary}40`,
                  }}
                  title={t.name}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: t.colors.primary }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Music size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                Integrations
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Connect Your{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Platforms
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Show what you're listening to, streaming, or creating – right on
              your bio page
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                icon: SiSpotify,
                name: 'Spotify',
                color: '#1db954',
                desc: 'Now Playing',
              },
              {
                icon: SiYoutube,
                name: 'YouTube',
                color: '#ff0000',
                desc: 'Embed Videos',
              },
              {
                icon: SiSoundcloud,
                name: 'SoundCloud',
                color: '#ff5500',
                desc: 'Your Tracks',
              },
              {
                icon: SiTwitch,
                name: 'Twitch',
                color: '#9146ff',
                desc: 'Live Status',
              },
              {
                icon: SiDiscord,
                name: 'Discord',
                color: '#5865f2',
                desc: 'Server Invite',
              },
            ].map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="p-6 text-center group"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
                }}
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${integration.color}20` }}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <integration.icon
                    size={28}
                    style={{ color: integration.color }}
                  />
                </motion.div>
                <h3
                  className="font-bold mb-1"
                  style={{ color: theme.colors.foreground }}
                >
                  {integration.name}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {integration.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section
        className="py-24 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: BarChart3,
                    title: 'Real-time',
                    desc: 'Live Click Tracking',
                    color: theme.colors.primary,
                  },
                  {
                    icon: Globe,
                    title: 'Global',
                    desc: 'Visitor Locations',
                    color: '#22c55e',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Trends',
                    desc: 'Performance Insights',
                    color: '#f59e0b',
                  },
                  {
                    icon: Calendar,
                    title: '30 Days',
                    desc: 'Data Retention',
                    color: '#ec4899',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.1,
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="p-6"
                    style={{
                      background: theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: cardRadius,
                    }}
                  >
                    <item.icon
                      size={32}
                      className="mb-4"
                      style={{ color: item.color }}
                    />
                    <p
                      className="text-2xl font-bold mb-1"
                      style={{ color: theme.colors.foreground }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                  border: `1px solid ${theme.colors.primary}30`,
                }}
              >
                <BarChart3 size={16} style={{ color: theme.colors.primary }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  Analytics
                </span>
              </div>
              <h2
                className="text-4xl lg:text-5xl font-bold mb-6"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                Know Your{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  Audience
                </span>
              </h2>
              <p
                className="text-lg mb-6"
                style={{ color: theme.colors.foregroundMuted }}
              >
                See every click, where your visitors come from, and what
                resonates best. All analytics are free – no premium required.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  'Click Tracking',
                  'Referrer Data',
                  'Device Stats',
                  'Data Export',
                ].map((feature, i) => (
                  <motion.span
                    key={feature}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{
                      background: `${theme.colors.primary}15`,
                      color: theme.colors.foreground,
                    }}
                  >
                    <CheckCircle2
                      size={14}
                      style={{ color: theme.colors.primary }}
                    />
                    {feature}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      {topUsers && topUsers.length > 0 && (
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Background decoration */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${theme.colors.primary}08 0%, transparent 50%)`,
            }}
          />

          <div className="max-w-7xl mx-auto relative">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                  border: `1px solid ${theme.colors.primary}30`,
                }}
              >
                <Trophy size={16} style={{ color: theme.colors.primary }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  Community Spotlight
                </span>
              </div>
              <h2
                className="text-4xl lg:text-5xl font-bold mb-4"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                Meet Our{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  Top Creators
                </span>
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto mb-8"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Discover amazing creators who are already using Eziox to share
                their content with the world
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  {
                    value: stats?.totalUsers || 0,
                    label: 'Active Creators',
                    suffix: '+',
                  },
                  {
                    value: stats?.totalLinks || 0,
                    label: 'Links Shared',
                    suffix: '+',
                  },
                  {
                    value: stats?.totalClicks || 0,
                    label: 'Total Clicks',
                    suffix: '',
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-center"
                  >
                    <p
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.primary }}
                    >
                      {stat.value.toLocaleString()}
                      {stat.suffix}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Featured Creator (1st Place) */}
            {topUsers[0] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <Link
                  to="/$username"
                  params={{ username: topUsers[0].user.username }}
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative p-8 overflow-hidden group"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.card}95, ${theme.colors.card}80)`,
                      border: `2px solid #fbbf24`,
                      borderRadius: cardRadius,
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 20px 60px rgba(251, 191, 36, 0.15)`,
                    }}
                  >
                    {/* Crown decoration */}
                    <div className="absolute top-4 right-4">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Crown size={32} className="text-amber-400" />
                      </motion.div>
                    </div>

                    {/* Glow effect */}
                    <div
                      className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                      style={{ background: '#fbbf24' }}
                    />

                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                      {/* Avatar */}
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-full blur-xl opacity-50"
                          style={{
                            background: `linear-gradient(135deg, #fbbf24, ${theme.colors.primary})`,
                          }}
                        />
                        <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-4 ring-amber-400 relative">
                          <AvatarImage
                            src={topUsers[0].profile?.avatar || undefined}
                          />
                          <AvatarFallback
                            className="text-3xl font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                              color: 'white',
                            }}
                          >
                            {(
                              topUsers[0].user.name || topUsers[0].user.username
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                          style={{
                            background:
                              'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            boxShadow: '0 4px 15px rgba(251, 191, 36, 0.5)',
                          }}
                        >
                          1
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              background:
                                'linear-gradient(135deg, #fbbf24, #f59e0b)',
                              color: '#000',
                            }}
                          >
                            #1 Creator
                          </span>
                          {topUsers[0].user.role === 'admin' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                              Owner
                            </span>
                          )}
                        </div>
                        <h3
                          className="text-2xl md:text-3xl font-bold mb-1"
                          style={{ color: theme.colors.foreground }}
                        >
                          {topUsers[0].user.name || topUsers[0].user.username}
                        </h3>
                        <p
                          className="text-lg mb-3"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          @{topUsers[0].user.username}
                        </p>
                        {topUsers[0].profile?.bio && (
                          <p
                            className="text-sm line-clamp-2 max-w-md mx-auto md:mx-0 mb-4"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {topUsers[0].profile.bio}
                          </p>
                        )}

                        {/* Stats row */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-amber-400" />
                            <span
                              className="font-bold text-lg"
                              style={{ color: theme.colors.foreground }}
                            >
                              {topUsers[0].stats?.score?.toLocaleString() || 0}
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: theme.colors.foregroundMuted }}
                            >
                              points
                            </span>
                          </div>
                          {topUsers[0].stats?.profileViews && (
                            <div className="flex items-center gap-2">
                              <Users
                                size={16}
                                style={{ color: theme.colors.foregroundMuted }}
                              />
                              <span
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {topUsers[0].stats.profileViews.toLocaleString()}{' '}
                                views
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="hidden md:block">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 25,
                          }}
                          className="px-6 py-3 rounded-xl font-semibold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                            boxShadow: `0 10px 30px ${theme.colors.primary}40`,
                          }}
                        >
                          View Profile
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )}

            {/* 2nd and 3rd Place */}
            {topUsers.length > 1 && (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {topUsers.slice(1, 3).map((item, i) => {
                  const rank = i + 2
                  const medalColors = { 2: '#9ca3af', 3: '#cd7f32' }
                  const medalColor =
                    medalColors[rank as keyof typeof medalColors]

                  return (
                    <motion.div
                      key={item.user.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to="/$username"
                        params={{ username: item.user.username }}
                      >
                        <motion.div
                          whileHover={{ y: -4, scale: 1.02 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 25,
                          }}
                          className="relative p-6 h-full overflow-hidden group"
                          style={{
                            background:
                              theme.effects.cardStyle === 'glass'
                                ? `${theme.colors.card}90`
                                : theme.colors.card,
                            border: `2px solid ${medalColor}60`,
                            borderRadius: cardRadius,
                            backdropFilter:
                              theme.effects.cardStyle === 'glass'
                                ? 'blur(10px)'
                                : undefined,
                          }}
                        >
                          {/* Subtle glow */}
                          <div
                            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
                            style={{ background: medalColor }}
                          />

                          <div className="relative flex items-center gap-4">
                            {/* Rank badge */}
                            <div
                              className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                              style={{
                                background: medalColor,
                                boxShadow: `0 2px 10px ${medalColor}60`,
                              }}
                            >
                              {rank}
                            </div>

                            {/* Avatar */}
                            <Avatar
                              className="w-16 h-16 ring-2"
                              style={
                                {
                                  '--tw-ring-color': medalColor,
                                } as React.CSSProperties
                              }
                            >
                              <AvatarImage
                                src={item.profile?.avatar || undefined}
                              />
                              <AvatarFallback
                                style={{
                                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                                  color: 'white',
                                  fontWeight: 700,
                                }}
                              >
                                {(item.user.name || item.user.username)
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p
                                  className="font-bold text-lg truncate"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  {item.user.name || item.user.username}
                                </p>
                                {item.user.role === 'admin' && (
                                  <Crown
                                    size={14}
                                    className="text-amber-500 shrink-0"
                                  />
                                )}
                              </div>
                              <p
                                className="text-sm truncate mb-2"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                @{item.user.username}
                              </p>
                              {item.profile?.bio && (
                                <p
                                  className="text-xs line-clamp-1"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {item.profile.bio}
                                </p>
                              )}
                            </div>

                            {/* Score */}
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
                                points
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

            {/* Rest of creators (4-6) */}
            {topUsers.length > 3 && (
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {topUsers.slice(3, 6).map((item, i) => {
                  const rank = i + 4
                  return (
                    <motion.div
                      key={item.user.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to="/$username"
                        params={{ username: item.user.username }}
                      >
                        <motion.div
                          whileHover={{ y: -4, scale: 1.02 }}
                          className="p-5 h-full"
                          style={{
                            background:
                              theme.effects.cardStyle === 'glass'
                                ? `${theme.colors.card}80`
                                : theme.colors.card,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: cardRadius,
                            backdropFilter:
                              theme.effects.cardStyle === 'glass'
                                ? 'blur(10px)'
                                : undefined,
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage
                                  src={item.profile?.avatar || undefined}
                                />
                                <AvatarFallback
                                  style={{
                                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                                    color: 'white',
                                    fontWeight: 700,
                                  }}
                                >
                                  {(item.user.name || item.user.username)
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{
                                  background: theme.colors.backgroundSecondary,
                                  border: `1px solid ${theme.colors.border}`,
                                  color: theme.colors.foregroundMuted,
                                }}
                              >
                                {rank}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold truncate"
                                style={{ color: theme.colors.foreground }}
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
                              <span
                                className="font-bold"
                                style={{ color: theme.colors.primary }}
                              >
                                {item.stats?.score?.toLocaleString() || 0}
                              </span>
                              <p
                                className="text-xs"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                pts
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
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    boxShadow:
                      glowOpacity > 0
                        ? `0 15px 40px ${theme.colors.primary}40`
                        : `0 10px 30px rgba(0,0,0,0.2)`,
                  }}
                >
                  <Trophy size={20} />
                  View Full Leaderboard
                </motion.button>
              </Link>
              <Link to="/creators">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                >
                  <Users size={20} />
                  Explore All Creators
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Star size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                How It Works
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Get Started in{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Minutes
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign up free in seconds',
                icon: Users,
              },
              {
                step: '02',
                title: 'Customize',
                desc: 'Add links & choose your theme',
                icon: Palette,
              },
              {
                step: '03',
                title: 'Share',
                desc: 'Share your unique link',
                icon: Globe,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    boxShadow:
                      glowOpacity > 0
                        ? `0 15px 40px ${theme.colors.primary}40`
                        : `0 10px 30px rgba(0,0,0,0.2)`,
                  }}
                >
                  <item.icon size={36} className="text-white" />
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: theme.colors.card,
                      border: `2px solid ${theme.colors.primary}`,
                      color: theme.colors.primary,
                    }}
                  >
                    {item.step}
                  </div>
                </motion.div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  {item.title}
                </h3>
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
