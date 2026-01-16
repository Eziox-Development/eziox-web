import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPlatformStatsFn } from '@/server/functions/stats'
import {
  Sparkles,
  Heart,
  Globe,
  Users,
  Shield,
  Rocket,
  Target,
  Code,
  ArrowRight,
  Crown,
  Zap,
  Palette,
  Gamepad2,
  Cat,
  MonitorPlay,
  Brush,
  Code2,
  Minimize2,
  Star,
  Lock,
  Sliders,
  RotateCcw,
  Grid3X3,
} from 'lucide-react'
import { SiGithub, SiReact, SiTypescript, SiTailwindcss, SiPostgresql, SiVercel } from 'react-icons/si'
import { useTheme } from '@/components/portfolio/ThemeProvider'

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export const Route = createFileRoute('/_public/about')({
  head: () => ({
    meta: [
      { title: 'About Eziox - Our Story & Mission' },
      { name: 'description', content: 'Learn about Eziox, the modern bio link platform with 25+ themes and advanced security.' },
      { property: 'og:title', content: 'About Eziox - Our Story & Mission' },
      { property: 'og:description', content: 'Learn about Eziox, the modern bio link platform with 25+ themes and advanced security.' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: AboutPage,
})

const themeCategories = [
  { icon: Gamepad2, label: 'Gamer', color: '#00ff00' },
  { icon: Cat, label: 'VTuber', color: '#ff6b9d' },
  { icon: Sparkles, label: 'Anime', color: '#ff4500' },
  { icon: Code2, label: 'Developer', color: '#58a6ff' },
  { icon: MonitorPlay, label: 'Streamer', color: '#9146ff' },
  { icon: Brush, label: 'Artist', color: '#e8a87c' },
  { icon: Minimize2, label: 'Minimal', color: '#888888' },
]

const securityFeatures = [
  { icon: Sliders, label: 'Slider Challenge', desc: 'Precise position verification' },
  { icon: RotateCcw, label: 'Rotate Challenge', desc: 'Angle-based verification' },
  { icon: Grid3X3, label: 'Pattern Challenge', desc: 'Sequence recognition' },
]

const techStack = [
  { icon: SiReact, name: 'React 19', color: '#61dafb' },
  { icon: SiTypescript, name: 'TypeScript', color: '#3178c6' },
  { icon: SiTailwindcss, name: 'Tailwind CSS', color: '#06b6d4' },
  { icon: SiPostgresql, name: 'PostgreSQL', color: '#336791' },
  { icon: SiVercel, name: 'Vercel', color: '#ffffff' },
]

function AboutPage() {
  const { theme, themes } = useTheme()
  const getPlatformStats = useServerFn(getPlatformStatsFn)

  const { data: platformStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => getPlatformStats(),
  })

  const stats = [
    { value: platformStats?.totalUsers?.toLocaleString() || '0', label: 'Creators', icon: Users },
    { value: platformStats?.totalLinks?.toLocaleString() || '0', label: 'Links', icon: Globe },
    { value: themes.length.toString(), label: 'Themes', icon: Palette },
    { value: '99.9%', label: 'Uptime', icon: Zap },
  ]

  const values = [
    { icon: Heart, title: 'User First', description: 'Everything starts with our users. Your success is our success.', color: '#ec4899' },
    { icon: Shield, title: 'Security', description: 'Cloudflare-inspired bot protection keeps your account safe.', color: '#6366f1' },
    { icon: Zap, title: 'Performance', description: 'Optimized for speed. Every millisecond matters.', color: '#f59e0b' },
    { icon: Code, title: 'Innovation', description: 'Modern tech stack with continuous improvements.', color: '#22c55e' },
  ]

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{ background: theme.colors.primary }}
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{ background: theme.colors.accent }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 20px 40px ${theme.colors.primary}40` }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
          >
            <Target size={14} style={{ color: theme.colors.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>About Us</span>
          </div>

          <h1
            className="text-4xl lg:text-6xl font-bold mb-6"
            style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}
          >
            Building the Future of{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
              Bio Links
            </span>
          </h1>

          <p className="text-lg max-w-3xl mx-auto mb-12" style={{ color: theme.colors.foregroundMuted }}>
            Eziox is a modern bio link platform that helps creators, influencers, and businesses
            share everything they create from one beautiful, customizable link.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="p-5 rounded-2xl text-center"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <stat.icon size={24} className="mx-auto mb-2" style={{ color: theme.colors.primary }} />
                <p className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>{stat.value}</p>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 p-6 rounded-3xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
              <Palette size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Theme System</h3>
              <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{themes.length}+ themes across 8 categories</p>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {themeCategories.map((cat) => (
              <motion.div
                key={cat.label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                style={{ background: theme.colors.backgroundSecondary }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <cat.icon size={24} style={{ color: cat.color }} />
                <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>{cat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-16 p-6 rounded-3xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Lock size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Cloudflare-Style Security</h3>
              <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Advanced bot protection without annoying CAPTCHAs</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {securityFeatures.map((feat) => (
              <motion.div
                key={feat.label}
                className="flex flex-col items-center gap-2 p-5 rounded-xl text-center"
                style={{ background: theme.colors.backgroundSecondary }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                  <feat.icon size={28} style={{ color: '#6366f1' }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>{feat.label}</span>
                <span className="text-[11px]" style={{ color: theme.colors.foregroundMuted }}>{feat.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <Heart size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Our Values</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: theme.colors.foreground }}>What We Stand For</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="p-6 rounded-2xl text-center"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: `${value.color}20` }}>
                  <value.icon size={28} style={{ color: value.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.foreground }}>{value.title}</h3>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <Users size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>The Creator</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: theme.colors.foreground }}>Meet Saito</h2>
          </div>

          <motion.div
            className="max-w-md mx-auto p-8 rounded-3xl text-center"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 4px ${theme.colors.primary}` }}>
                <img src="https://eziox.link/images/avatars/saito.png" alt="Saito" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Crown size={20} className="text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-1" style={{ color: theme.colors.foreground }}>Saito</h3>
            <p className="text-sm mb-4" style={{ color: theme.colors.primary }}>Founder & Developer</p>
            <p className="mb-6" style={{ color: theme.colors.foregroundMuted }}>
              Full-stack developer passionate about creating beautiful, functional web experiences for creators worldwide.
            </p>

            <div className="flex justify-center gap-3">
              <motion.a
                href="https://github.com/XSaitoKungX"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: theme.colors.backgroundSecondary }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <SiGithub size={22} style={{ color: theme.colors.foreground }} />
              </motion.a>
              <motion.a
                href="https://discord.com/invite/KD84DmNA89"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: theme.colors.backgroundSecondary }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <DiscordIcon size={22} />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-16 p-6 rounded-3xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <Code size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Tech Stack</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>Built with Modern Technology</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                className="flex items-center gap-3 px-5 py-3 rounded-xl"
                style={{ background: theme.colors.backgroundSecondary }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <tech.icon size={24} style={{ color: tech.color }} />
                <span className="font-medium" style={{ color: theme.colors.foreground }}>{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} />
          <div className="relative p-12 rounded-3xl text-center" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.55 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            >
              <Rocket size={40} className="text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.foreground }}>Ready to Join?</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              Create your free bio link page today and join thousands of creators worldwide.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/sign-up">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 10px 40px ${theme.colors.primary}40` }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link to="/changelog">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold"
                  style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Star size={20} style={{ color: theme.colors.primary }} />
                  View Changelog
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            Version 1.5.0 • Made with <Heart size={12} className="inline mx-1" style={{ color: '#ef4444' }} /> by Saito
          </p>
        </motion.div>
      </div>
    </div>
  )
}
