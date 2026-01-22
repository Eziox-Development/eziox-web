import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  ArrowRight,
  Users,
  Link2,
  Palette,
  Shield,
  BarChart3,
  Heart,
  Sparkles,
  Lock,
  Eye,
  Layers,
  Music,
  Calendar,
  Code2,
  CheckCircle,
  Star,
  TrendingUp,
  QrCode,
  Bell,
  UserPlus,
} from 'lucide-react'
import {
  SiGithub,
  SiDiscord,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiPostgresql,
  SiStripe,
  SiCloudflare,
  SiVercel,
} from 'react-icons/si'

export const Route = createFileRoute('/_public/about')({
  head: () => ({
    meta: [
      { title: 'About | Eziox' },
      {
        name: 'description',
        content:
          'Eziox is a free bio link platform for creators. Unlimited links, 30+ themes, real analytics — no paywalls.',
      },
    ],
  }),
  component: AboutPage,
})

function AboutPage() {
  const { theme, themes } = useTheme()
  const getPlatformStats = useServerFn(getPlatformStatsFn)

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => getPlatformStats(),
    staleTime: 60000,
  })

  const themeCategories = [
    {
      name: 'General',
      count: themes.filter((t) => t.category === 'general').length,
      color: theme.colors.primary,
    },
    {
      name: 'Gamer',
      count: themes.filter((t) => t.category === 'gamer').length,
      color: '#22c55e',
    },
    {
      name: 'VTuber',
      count: themes.filter((t) => t.category === 'vtuber').length,
      color: '#ec4899',
    },
    {
      name: 'Anime',
      count: themes.filter((t) => t.category === 'anime').length,
      color: '#ef4444',
    },
    {
      name: 'Developer',
      count: themes.filter((t) => t.category === 'developer').length,
      color: '#3b82f6',
    },
    {
      name: 'Streamer',
      count: themes.filter((t) => t.category === 'streamer').length,
      color: '#9147ff',
    },
    {
      name: 'Artist',
      count: themes.filter((t) => t.category === 'artist').length,
      color: '#f59e0b',
    },
    {
      name: 'Minimal',
      count: themes.filter((t) => t.category === 'minimal').length,
      color: '#71717a',
    },
  ]

  const coreFeatures = [
    {
      icon: Link2,
      title: 'Unlimited Links',
      desc: 'Add as many links as you need. No artificial limits.',
      color: theme.colors.primary,
    },
    {
      icon: Palette,
      title: `${themes.length}+ Themes`,
      desc: 'Curated themes for every style. Switch anytime.',
      color: '#ec4899',
    },
    {
      icon: BarChart3,
      title: 'Real Analytics',
      desc: 'Track views, clicks, and referrers. No paywall.',
      color: '#22c55e',
    },
    {
      icon: Music,
      title: 'Spotify Integration',
      desc: "Show what you're listening to in real-time.",
      color: '#1db954',
    },
    {
      icon: Calendar,
      title: 'Link Scheduling',
      desc: 'Schedule links to appear or expire automatically.',
      color: '#f59e0b',
    },
    {
      icon: QrCode,
      title: 'QR Codes',
      desc: 'Generate custom QR codes for your bio page.',
      color: '#6366f1',
    },
    {
      icon: Bell,
      title: 'Notifications',
      desc: 'Get notified about new followers and milestones.',
      color: '#ef4444',
    },
    {
      icon: UserPlus,
      title: 'Referral System',
      desc: 'Invite friends and earn rewards together.',
      color: '#14b8a6',
    },
  ]

  const premiumFeatures = [
    {
      title: 'Custom CSS',
      desc: 'Full control over your page styling',
      tier: 'Pro',
    },
    {
      title: 'Custom Fonts',
      desc: 'Upload and use your own fonts',
      tier: 'Pro',
    },
    {
      title: 'Remove Branding',
      desc: 'Clean, white-label experience',
      tier: 'Pro',
    },
    {
      title: 'Analytics Export',
      desc: 'Download your data as CSV/JSON',
      tier: 'Pro',
    },
    {
      title: 'Custom Domain',
      desc: 'Use your own domain name',
      tier: 'Creator',
    },
    {
      title: 'Link Passwords',
      desc: 'Protect links with passwords',
      tier: 'Creator',
    },
  ]

  const techStack = [
    {
      icon: SiReact,
      name: 'React 19',
      color: '#61dafb',
      desc: 'Latest React with Server Components',
    },
    {
      icon: SiTypescript,
      name: 'TypeScript',
      color: '#3178c6',
      desc: 'Type-safe codebase',
    },
    {
      icon: SiTailwindcss,
      name: 'Tailwind CSS',
      color: '#06b6d4',
      desc: 'Utility-first styling',
    },
    {
      icon: SiPostgresql,
      name: 'PostgreSQL',
      color: '#336791',
      desc: 'Reliable database',
    },
    {
      icon: SiStripe,
      name: 'Stripe',
      color: '#635bff',
      desc: 'Secure payments',
    },
    {
      icon: SiCloudflare,
      name: 'Cloudflare',
      color: '#f38020',
      desc: 'DDoS protection',
    },
    {
      icon: SiVercel,
      name: 'Vercel',
      color: '#ffffff',
      desc: 'Edge deployment',
    },
  ]

  const borderRadius =
    theme.effects.borderRadius === 'pill'
      ? '9999px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.4
      : theme.effects.glowIntensity === 'medium'
        ? 0.25
        : theme.effects.glowIntensity === 'subtle'
          ? 0.15
          : 0

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Hero Section */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse, ${theme.colors.primary}${Math.round(
                glowOpacity * 255,
              )
                .toString(16)
                .padStart(2, '0')} 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse, ${theme.colors.accent}20 0%, transparent 70%)`,
            }}
            animate={{ scale: [1.1, 1, 1.1], x: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-8"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.primary}10`
                    : `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
                borderRadius,
                backdropFilter:
                  theme.effects.cardStyle === 'glass'
                    ? 'blur(10px)'
                    : undefined,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                About Eziox
              </span>
            </motion.div>

            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              The bio link platform <br className="hidden md:block" />
              <span
                className="relative"
                style={{
                  color: theme.colors.primary,
                  textShadow:
                    glowOpacity > 0
                      ? `0 0 40px ${theme.colors.primary}60`
                      : undefined,
                }}
              >
                built for creators
              </span>
            </h1>

            <p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
              style={{ color: theme.colors.foregroundMuted }}
            >
              No paywalls on essential features. No artificial limits. No
              selling your data.
              <br className="hidden md:block" />
              Just a beautiful, fast bio page that respects you and your
              audience.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/sign-up">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    borderRadius,
                    boxShadow:
                      glowOpacity > 0
                        ? `0 8px 32px ${theme.colors.primary}40`
                        : undefined,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start for Free <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link to="/playground">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 font-semibold"
                  style={{
                    background:
                      theme.effects.cardStyle === 'glass'
                        ? `${theme.colors.card}80`
                        : theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius,
                    color: theme.colors.foreground,
                    backdropFilter:
                      theme.effects.cardStyle === 'glass'
                        ? 'blur(10px)'
                        : undefined,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye size={20} /> Try Playground
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              {
                value: stats?.totalUsers?.toLocaleString() || '—',
                label: 'Creators',
                icon: Users,
                gradient: 'from-violet-500 to-purple-600',
              },
              {
                value: stats?.totalLinks?.toLocaleString() || '—',
                label: 'Links Created',
                icon: Link2,
                gradient: 'from-pink-500 to-rose-600',
              },
              {
                value: themes.length.toString(),
                label: 'Themes',
                icon: Palette,
                gradient: 'from-cyan-500 to-blue-600',
              },
              {
                value: stats?.totalViews?.toLocaleString() || '—',
                label: 'Page Views',
                icon: Eye,
                gradient: 'from-emerald-500 to-green-600',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="relative p-6 text-center overflow-hidden group"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}60`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}
                >
                  <stat.icon size={24} className="text-white" />
                </div>
                <p
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section
        className="py-20 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Everything you need,{' '}
              <span style={{ color: theme.colors.primary }}>included</span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              No premium required for the essentials. Build your perfect bio
              page from day one.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 group"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}60`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
                }}
              >
                <div
                  className="w-12 h-12 mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    background: `${feature.color}15`,
                    borderRadius:
                      theme.effects.borderRadius === 'pill' ? '16px' : '12px',
                  }}
                >
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Eziox & Privacy */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}60`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
                backdropFilter:
                  theme.effects.cardStyle === 'glass'
                    ? 'blur(10px)'
                    : undefined,
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    borderRadius:
                      theme.effects.borderRadius === 'pill' ? '18px' : '14px',
                  }}
                >
                  <Heart size={28} className="text-white" />
                </div>
                <h3
                  className="text-2xl font-bold"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  Why Eziox?
                </h3>
              </div>
              <div
                className="space-y-4"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <p className="leading-relaxed">
                  Most bio link platforms treat basic features as premium. Want
                  to remove a watermark? $5/month. Want a decent theme? Premium
                  only. Want your own analytics? Pay up.
                </p>
                <p className="leading-relaxed">
                  <strong style={{ color: theme.colors.foreground }}>
                    Eziox flips that script.
                  </strong>{' '}
                  Unlimited links, all {themes.length} themes, full
                  customization, real analytics — completely free. The paid
                  tiers exist for advanced features that actually cost money to
                  run, like custom domains and priority support.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    'No watermarks',
                    'No link limits',
                    'No theme restrictions',
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
                      style={{
                        background: `${theme.colors.primary}15`,
                        color: theme.colors.primary,
                        borderRadius,
                      }}
                    >
                      <CheckCircle size={14} /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}60`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
                backdropFilter:
                  theme.effects.cardStyle === 'glass'
                    ? 'blur(10px)'
                    : undefined,
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius:
                      theme.effects.borderRadius === 'pill' ? '18px' : '14px',
                  }}
                >
                  <Shield size={28} className="text-white" />
                </div>
                <h3
                  className="text-2xl font-bold"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  Privacy First
                </h3>
              </div>
              <div
                className="space-y-4"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <p className="leading-relaxed">
                  Your data belongs to you. We don't sell it, we don't track you
                  across the web, and we don't stuff your page with third-party
                  scripts.
                </p>
                <p className="leading-relaxed">
                  <strong style={{ color: theme.colors.foreground }}>
                    GDPR compliant
                  </strong>{' '}
                  with full data export and deletion. Cloudflare Turnstile for
                  bot protection without annoying CAPTCHAs. IP addresses are
                  anonymized in analytics.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {['GDPR compliant', 'No tracking', 'Data export'].map(
                    (item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          borderRadius,
                        }}
                      >
                        <Lock size={14} /> {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section
        className="py-20 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              <span style={{ color: theme.colors.primary }}>
                {themes.length}
              </span>{' '}
              Themes for Every Style
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              From minimal elegance to vibrant gamer aesthetics. Each theme
              includes custom fonts, colors, and effects.
            </p>
          </motion.div>

          {/* Theme Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {themeCategories.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-2 px-4 py-2"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: cat.color }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {cat.name}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: `${cat.color}20`, color: cat.color }}
                >
                  {cat.count}
                </span>
              </div>
            ))}
          </div>

          {/* Theme Preview Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 md:p-8"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {themes.slice(0, 24).map((t, i) => (
                <motion.div
                  key={t.id}
                  className="aspect-square relative group cursor-pointer overflow-hidden"
                  style={{
                    background: t.colors.background,
                    border: `2px solid ${t.colors.primary}`,
                    borderRadius:
                      t.effects.borderRadius === 'pill'
                        ? '16px'
                        : t.effects.borderRadius === 'sharp'
                          ? '4px'
                          : '10px',
                  }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  title={t.name}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                  >
                    <span className="text-xs font-medium text-white text-center px-1">
                      {t.name}
                    </span>
                  </div>
                  {t.isPremium && (
                    <div className="absolute top-1 right-1">
                      <Star
                        size={10}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <Link to="/playground">
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    borderRadius,
                    color: '#fff',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Palette size={18} /> Browse All Themes{' '}
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Go further with{' '}
              <span style={{ color: theme.colors.primary }}>Premium</span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Advanced features for power users. Starting at just €2.99/month.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-5 flex items-start gap-4"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <div
                  className="w-10 h-10 shrink-0 flex items-center justify-center"
                  style={{
                    background:
                      feature.tier === 'Creator'
                        ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                        : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    borderRadius: '10px',
                  }}
                >
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className="font-semibold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {feature.title}
                    </h4>
                    <span
                      className="text-xs px-2 py-0.5 font-medium"
                      style={{
                        background:
                          feature.tier === 'Creator'
                            ? 'rgba(236, 72, 153, 0.15)'
                            : `${theme.colors.primary}15`,
                        color:
                          feature.tier === 'Creator'
                            ? '#ec4899'
                            : theme.colors.primary,
                        borderRadius: '6px',
                      }}
                    >
                      {feature.tier}
                    </span>
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link to="/pricing">
              <motion.button
                className="flex items-center gap-2 px-6 py-3 font-semibold"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius,
                  color: theme.colors.foreground,
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <TrendingUp size={18} /> View Pricing <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section
        className="py-20 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-4"
              style={{ background: `${theme.colors.primary}15`, borderRadius }}
            >
              <Code2 size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                Built with Modern Tech
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Fast, Reliable, Secure
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Built on battle-tested technologies for speed and reliability.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 text-center group"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <tech.icon
                  size={32}
                  className="mx-auto mb-3 transition-transform group-hover:scale-110"
                  style={{ color: tech.color }}
                />
                <p
                  className="font-semibold text-sm mb-1"
                  style={{ color: theme.colors.foreground }}
                >
                  {tech.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {tech.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Quote */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-8 md:p-10"
            style={{
              background:
                theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}60`
                  : theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
              backdropFilter:
                theme.effects.cardStyle === 'glass' ? 'blur(10px)' : undefined,
            }}
          >
            <div
              className="absolute -top-4 left-8 text-6xl font-serif"
              style={{ color: theme.colors.primary, opacity: 0.3 }}
            >
              "
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="shrink-0">
                <img
                  src="/images/avatars/saito.png"
                  alt="Saito"
                  className="w-20 h-20 object-cover"
                  style={{
                    borderRadius:
                      theme.effects.borderRadius === 'pill' ? '50%' : '16px',
                    border: `3px solid ${theme.colors.primary}`,
                  }}
                />
              </div>
              <div className="flex-1">
                <p
                  className="text-lg md:text-xl leading-relaxed mb-6 italic"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  I started Eziox because every bio link platform I tried felt
                  like a funnel. Pay to remove a watermark, pay to change fonts,
                  pay to get data that should be yours. Eziox flips that script.
                  The essentials stay free forever so newcomers can grow without
                  a bill breathing down their neck. If you want advanced toys
                  like custom CSS or domains, opt in. Otherwise, enjoy a fast,
                  beautiful page that respects your work and your audience.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div>
                    <h4
                      className="font-bold text-lg"
                      style={{
                        color: theme.colors.foreground,
                        fontFamily: theme.typography.displayFont,
                      }}
                    >
                      Saito
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.primary }}
                    >
                      Creator of Eziox
                    </p>
                  </div>
                  <div className="flex gap-3 sm:ml-auto">
                    <a
                      href="https://github.com/XSaitoKungX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        borderRadius,
                        color: theme.colors.foreground,
                      }}
                    >
                      <SiGithub size={18} /> GitHub
                    </a>
                    <a
                      href="https://discord.gg/KD84DmNA89"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        borderRadius,
                        color: theme.colors.foreground,
                      }}
                    >
                      <SiDiscord size={18} style={{ color: '#5865F2' }} />{' '}
                      Discord
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Ready to build your{' '}
              <span style={{ color: theme.colors.primary }}>bio page</span>?
            </h2>
            <p
              className="text-lg mb-10 max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Join thousands of creators who trust Eziox for their online
              presence. Free forever, no credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/sign-up">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    borderRadius,
                    boxShadow:
                      glowOpacity > 0
                        ? `0 8px 32px ${theme.colors.primary}40`
                        : undefined,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Your Page <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link to="/templates">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 font-semibold"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius,
                    color: theme.colors.foreground,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Layers size={20} /> Browse Templates
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
