import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  Sparkles, Heart, Globe, Users, Shield, Target, Code, ArrowRight,
  Crown, Zap, Palette, Gamepad2, Cat, MonitorPlay, Brush, Code2, Minimize2,
  Lock, Sliders, RotateCcw, Grid3X3, CheckCircle2, TrendingUp,
  Layers, MousePointerClick, BarChart3, Gift, Clock, Headphones,
  MessageCircle, Video, Terminal, Repeat,
} from 'lucide-react'
import { SiGithub, SiReact, SiTypescript, SiTailwindcss, SiPostgresql, SiVercel, SiBun, SiDrizzle } from 'react-icons/si'

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export const Route = createFileRoute('/_public/about')({
  head: () => ({
    meta: [
      { title: 'About Eziox - The Modern Bio Link Platform' },
      { name: 'description', content: 'Discover Eziox - the next-generation bio link platform with 31+ themes, advanced analytics, and creator-first features.' },
      { property: 'og:title', content: 'About Eziox - The Modern Bio Link Platform' },
      { property: 'og:description', content: 'Discover Eziox - the next-generation bio link platform with 31+ themes, advanced analytics, and creator-first features.' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: AboutPage,
})

const themeCategories = [
  { icon: Sparkles, label: 'General', color: '#8b5cf6', count: 4 },
  { icon: Gamepad2, label: 'Gamer', color: '#22c55e', count: 3 },
  { icon: Cat, label: 'VTuber', color: '#ec4899', count: 3 },
  { icon: Video, label: 'Anime', color: '#f97316', count: 3 },
  { icon: Code2, label: 'Developer', color: '#3b82f6', count: 3 },
  { icon: MonitorPlay, label: 'Streamer', color: '#9333ea', count: 3 },
  { icon: Brush, label: 'Artist', color: '#14b8a6', count: 3 },
  { icon: Minimize2, label: 'Minimal', color: '#6b7280', count: 3 },
  { icon: Crown, label: 'Premium', color: '#f59e0b', count: 5 },
]

const securityFeatures = [
  { icon: Sliders, label: 'Slider Challenge', desc: 'Drag to precise position' },
  { icon: RotateCcw, label: 'Rotate Challenge', desc: 'Click to rotate dial' },
  { icon: Grid3X3, label: 'Pattern Challenge', desc: 'Sequence recognition' },
]

const techStack = [
  { icon: SiReact, name: 'React 19', color: '#61dafb', desc: 'UI Framework' },
  { icon: SiTypescript, name: 'TypeScript 5.9', color: '#3178c6', desc: 'Type Safety' },
  { icon: SiTailwindcss, name: 'Tailwind CSS 4', color: '#06b6d4', desc: 'Styling' },
  { icon: SiPostgresql, name: 'PostgreSQL', color: '#336791', desc: 'Database' },
  { icon: SiBun, name: 'Bun', color: '#fbf0df', desc: 'Runtime' },
  { icon: SiDrizzle, name: 'Drizzle ORM', color: '#c5f74f', desc: 'ORM' },
  { icon: SiVercel, name: 'Vercel Edge', color: '#ffffff', desc: 'Hosting' },
]

const premiumTiers = [
  { name: 'Core', price: 'Free', color: '#6b7280', features: ['Unlimited links', 'Basic analytics', '10 themes', 'Embeds'] },
  { name: 'Pro', price: '€4.99/mo', color: '#3b82f6', features: ['Remove branding', 'Custom backgrounds', 'Realtime analytics', '20+ themes'] },
  { name: 'Creator', price: '€9.99/mo', color: '#8b5cf6', features: ['Custom CSS', 'Custom fonts', 'A/B testing', 'All themes'] },
  { name: 'Lifetime', price: '€30', color: '#f59e0b', features: ['All features forever', 'Exclusive badge', 'Priority support', 'Early access'] },
]

const features = [
  { icon: Layers, title: 'Unlimited Links', desc: 'Add as many links as you need', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track views, clicks & referrers', color: '#22c55e' },
  { icon: Palette, title: '31+ Themes', desc: '9 categories, endless styles', color: '#f59e0b' },
  { icon: Shield, title: 'Bot Protection', desc: 'Cloudflare-style security', color: '#ef4444' },
  { icon: Headphones, title: 'Spotify Integration', desc: 'Show what you\'re listening to', color: '#1db954' },
  { icon: MousePointerClick, title: 'Link Scheduling', desc: 'Schedule links to go live', color: '#ec4899' },
  { icon: TrendingUp, title: 'Leaderboard', desc: 'Compete with other creators', color: '#6366f1' },
  { icon: Gift, title: 'Templates', desc: 'Apply community presets', color: '#14b8a6' },
]

const timeline = [
  { version: '1.0', title: 'Launch', desc: 'Core bio link functionality', date: 'Jan 2026' },
  { version: '1.5', title: 'Spotify', desc: 'Real-time music integration', date: 'Jan 2026' },
  { version: '1.7', title: 'Premium', desc: 'Stripe subscriptions', date: 'Jan 2026' },
  { version: '1.8', title: 'Creator', desc: 'Custom CSS & fonts', date: 'Jan 2026' },
  { version: '2.0', title: 'Themes', desc: '31 modernized themes', date: 'Jan 2026' },
]

function AboutPage() {
  const { theme, themes } = useTheme()
  const getPlatformStats = useServerFn(getPlatformStatsFn)

  const { data: platformStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => getPlatformStats(),
  })

  const stats = [
    { value: platformStats?.totalUsers?.toLocaleString() || '0', label: 'Creators', icon: Users, color: '#8b5cf6' },
    { value: platformStats?.totalLinks?.toLocaleString() || '0', label: 'Links Created', icon: Globe, color: '#22c55e' },
    { value: themes.length.toString(), label: 'Themes', icon: Palette, color: '#f59e0b' },
    { value: '99.9%', label: 'Uptime', icon: Zap, color: '#ef4444' },
  ]

  const values = [
    { icon: Heart, title: 'Creator First', description: 'Every feature is designed with creators in mind. Your success drives our innovation.', color: '#ec4899' },
    { icon: Shield, title: 'Privacy & Security', description: 'Advanced bot protection and GDPR compliance. Your data stays yours.', color: '#6366f1' },
    { icon: Zap, title: 'Lightning Fast', description: 'Edge-deployed globally. Sub-100ms response times worldwide.', color: '#f59e0b' },
    { icon: Code, title: 'Open Innovation', description: 'Modern tech stack with continuous improvements and community feedback.', color: '#22c55e' },
    { icon: Repeat, title: 'No Limits', description: 'Unlimited links, unlimited embeds, unlimited creativity.', color: '#8b5cf6' },
    { icon: MessageCircle, title: 'Community Driven', description: 'Active Discord community. Features shaped by user feedback.', color: '#3b82f6' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
            style={{ background: theme.colors.primary }}
            animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
            style={{ background: theme.colors.accent }}
            animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 25px 50px ${theme.colors.primary}50` }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
            style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
          >
            <Target size={16} style={{ color: theme.colors.primary }} />
            <span className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>About Eziox</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: theme.colors.primary }}>v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold mb-6"
            style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}
          >
            The Modern{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
              Bio Link
            </span>
            {' '}Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl max-w-3xl mx-auto mb-12"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Eziox empowers creators, streamers, and businesses to share everything they create
            from one beautiful, customizable link. Built for the modern web.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="relative p-6 rounded-2xl overflow-hidden group"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                <stat.icon size={28} className="mx-auto mb-3" style={{ color: stat.color }} />
                <p className="text-3xl font-bold mb-1" style={{ color: theme.colors.foreground }}>{stat.value}</p>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <Layers size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Features</span>
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.colors.foreground }}>Everything You Need</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              Powerful features designed to help you grow your audience and track your success.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl group"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: `${feature.color}20` }}>
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="font-bold mb-1" style={{ color: theme.colors.foreground }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme System */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="lg:w-1/3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                  <Palette size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.foreground }}>
                  {themes.length}+ Themes
                </h2>
                <p className="mb-6" style={{ color: theme.colors.foregroundMuted }}>
                  Express yourself with our extensive theme library. From vibrant gamer aesthetics to minimal elegance,
                  find the perfect look for your brand.
                </p>
                <Link to="/playground">
                  <motion.button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Try Themes
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </div>
              <div className="lg:w-2/3 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                {themeCategories.map((cat, i) => (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl text-center"
                    style={{ background: theme.colors.backgroundSecondary }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <cat.icon size={24} style={{ color: cat.color }} />
                    <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>{cat.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${cat.color}20`, color: cat.color }}>{cat.count}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Lock size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.foreground }}>
                  Cloudflare-Style Security
                </h2>
                <p className="mb-6" style={{ color: theme.colors.foregroundMuted }}>
                  Advanced bot protection without annoying CAPTCHAs. Our intelligent challenge system
                  keeps your account safe while providing a seamless user experience.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Honeypot Detection', 'Timing Analysis', 'Interaction Tracking'].map((item) => (
                    <span key={item} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                      <CheckCircle2 size={14} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 grid grid-cols-3 gap-4">
                {securityFeatures.map((feat, i) => (
                  <motion.div
                    key={feat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl text-center"
                    style={{ background: theme.colors.backgroundSecondary }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                      <feat.icon size={32} style={{ color: '#6366f1' }} />
                    </div>
                    <span className="font-semibold" style={{ color: theme.colors.foreground }}>{feat.label}</span>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{feat.desc}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Tiers */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <Crown size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Premium</span>
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.colors.foreground }}>Plans for Everyone</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {premiumTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-2xl"
                style={{ background: theme.colors.card, border: `1px solid ${tier.name === 'Lifetime' ? tier.color : theme.colors.border}` }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                {tier.name === 'Lifetime' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-black" style={{ background: tier.color }}>
                    BEST VALUE
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${tier.color}20` }}>
                  <Crown size={20} style={{ color: tier.color }} />
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: theme.colors.foreground }}>{tier.name}</h3>
                <p className="text-2xl font-bold mb-4" style={{ color: tier.color }}>{tier.price}</p>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: theme.colors.foregroundMuted }}>
                      <CheckCircle2 size={14} style={{ color: tier.color }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <Heart size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Our Values</span>
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.colors.foreground }}>What We Stand For</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: `${value.color}20` }}>
                  <value.icon size={28} style={{ color: value.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.foreground }}>{value.title}</h3>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <Clock size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Journey</span>
            </div>
            <h2 className="text-4xl font-bold" style={{ color: theme.colors.foreground }}>Our Timeline</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: `linear-gradient(to bottom, ${theme.colors.primary}, ${theme.colors.accent}, transparent)` }} />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.version}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${i % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="inline-block p-4 rounded-xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                      <span className="text-xs font-bold px-2 py-1 rounded-md text-white mb-2 inline-block" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                        v{item.version}
                      </span>
                      <h3 className="font-bold" style={{ color: theme.colors.foreground }}>{item.title}</h3>
                      <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{item.desc}</p>
                      <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>{item.date}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full z-10" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 0 20px ${theme.colors.primary}` }} />
                  <div className="w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <Users size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>The Creator</span>
            </div>
            <h2 className="text-4xl font-bold" style={{ color: theme.colors.foreground }}>Meet Saito</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl text-center"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="relative inline-block mb-6">
              <motion.div
                className="w-36 h-36 rounded-full overflow-hidden"
                style={{ boxShadow: `0 0 0 4px ${theme.colors.primary}, 0 0 40px ${theme.colors.primary}40` }}
                whileHover={{ scale: 1.05 }}
              >
                <img src="https://eziox.link/images/avatars/saito.png" alt="Saito" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown size={24} className="text-white" />
              </motion.div>
            </div>

            <h3 className="text-2xl font-bold mb-1" style={{ color: theme.colors.foreground }}>Saito</h3>
            <p className="text-sm mb-2" style={{ color: theme.colors.primary }}>Founder & Lead Developer</p>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              Full-stack developer passionate about creating beautiful, functional web experiences.
              Building tools that empower creators worldwide.
            </p>

            <div className="flex justify-center gap-3">
              <motion.a
                href="https://github.com/XSaitoKungX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl"
                style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <SiGithub size={20} style={{ color: theme.colors.foreground }} />
                <span className="font-medium" style={{ color: theme.colors.foreground }}>GitHub</span>
              </motion.a>
              <motion.a
                href="https://discord.com/invite/KD84DmNA89"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl"
                style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <DiscordIcon size={20} />
                <span className="font-medium" style={{ color: theme.colors.foreground }}>Discord</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
                <Terminal size={14} style={{ color: theme.colors.primary }} />
                <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Tech Stack</span>
              </div>
              <h2 className="text-3xl font-bold" style={{ color: theme.colors.foreground }}>Built with Modern Technology</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {techStack.map((tech, i) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl text-center"
                  style={{ background: theme.colors.backgroundSecondary }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <tech.icon size={32} style={{ color: tech.color }} />
                  <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>{tech.name}</span>
                  <span className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{tech.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="py-8 text-center">
        <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
          Version 2.0.0 • Made with <Heart size={12} className="inline mx-1" style={{ color: '#ef4444' }} /> by Saito
        </p>
      </div>
    </div>
  )
}
