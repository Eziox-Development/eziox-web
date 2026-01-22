import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  ArrowRight, Users, Link2, Palette, Shield, BarChart3, Zap, Heart,
  Sparkles, Lock, Eye, Layers, Music, Calendar, Trophy,
} from 'lucide-react'
import { SiGithub, SiDiscord, SiReact, SiTypescript, SiTailwindcss, SiPostgresql } from 'react-icons/si'

export const Route = createFileRoute('/_public/about')({
  head: () => ({
    meta: [
      { title: 'About | Eziox' },
      { name: 'description', content: 'Eziox is a free bio link platform for creators. Unlimited links, 30+ themes, real analytics — no paywalls.' },
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

  const features = [
    { icon: Link2, label: 'Unlimited Links', color: '#8b5cf6' },
    { icon: Palette, label: `${themes.length} Themes`, color: '#ec4899' },
    { icon: BarChart3, label: 'Analytics', color: '#22c55e' },
    { icon: Music, label: 'Spotify', color: '#1db954' },
    { icon: Calendar, label: 'Scheduling', color: '#f59e0b' },
    { icon: Trophy, label: 'Leaderboard', color: '#6366f1' },
    { icon: Layers, label: 'Templates', color: '#14b8a6' },
    { icon: Shield, label: 'Bot Protection', color: '#ef4444' },
  ]

  const techStack = [
    { icon: SiReact, name: 'React 19', color: '#61dafb' },
    { icon: SiTypescript, name: 'TypeScript', color: '#3178c6' },
    { icon: SiTailwindcss, name: 'Tailwind 4', color: '#06b6d4' },
    { icon: SiPostgresql, name: 'PostgreSQL', color: '#336791' },
  ]

  return (
    <div className="min-h-screen">
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ 
            background: `radial-gradient(ellipse at 50% 0%, ${theme.colors.primary}20 0%, transparent 70%)`,
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
            >
              <Sparkles size={14} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>About Eziox</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: theme.colors.foreground }}>
              Bio links,{' '}
              <span style={{ color: theme.colors.primary }}>done right</span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: theme.colors.foregroundMuted }}>
              No paywalls on basic features. No artificial limits. 
              Just a clean, powerful bio page that actually works.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/sign-up">
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: theme.colors.primary }}
                >
                  Get Started <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/playground">
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                >
                  <Eye size={18} /> Try Playground
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
          >
            {[
              { value: stats?.totalUsers?.toLocaleString() || '—', label: 'Creators', icon: Users },
              { value: stats?.totalLinks?.toLocaleString() || '—', label: 'Links', icon: Link2 },
              { value: themes.length.toString(), label: 'Themes', icon: Palette },
              { value: stats?.totalViews?.toLocaleString() || '—', label: 'Page Views', icon: Eye },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 rounded-2xl text-center transition-transform hover:scale-[1.02]"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <stat.icon size={20} className="mx-auto mb-2" style={{ color: theme.colors.primary }} />
                <p className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>{stat.value}</p>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: theme.colors.foreground }}>
              Everything you need
            </h2>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              All features included. No premium required.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl text-center transition-transform hover:scale-[1.03]"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <div 
                  className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${theme.colors.primary}15` }}>
                  <Heart size={24} style={{ color: theme.colors.primary }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Why Eziox?</h3>
              </div>
              <div className="space-y-3 text-sm" style={{ color: theme.colors.foregroundMuted }}>
                <p>Most bio link tools charge for basic features. Removing a watermark? $5/month. Using a decent theme? Premium only.</p>
                <p>Eziox is different. Unlimited links, all themes, full customization — free. The paid tiers are for advanced features that actually cost money to run.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                  <Lock size={24} style={{ color: '#6366f1' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Privacy First</h3>
              </div>
              <div className="space-y-3 text-sm" style={{ color: theme.colors.foregroundMuted }}>
                <p>No tracking scripts. No selling your data. GDPR compliant with full data export and deletion.</p>
                <p>Your bio page, your data. We use Cloudflare-style bot protection without annoying CAPTCHAs.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="md:w-1/2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent || theme.colors.primary})` }}>
                    <Palette size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>{themes.length} Themes</h3>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Switch anytime, all free</p>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: theme.colors.foregroundMuted }}>
                  From minimal elegance to vibrant gamer aesthetics. Find the perfect look for your brand.
                </p>
                <Link to="/playground">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-[1.02]"
                    style={{ background: theme.colors.primary, color: '#fff' }}
                  >
                    Browse Themes <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
              <div className="md:w-1/2 grid grid-cols-4 gap-2">
                {themes.slice(0, 8).map((t) => (
                  <div
                    key={t.id}
                    className="aspect-square rounded-lg transition-transform hover:scale-105"
                    style={{ background: t.colors.background, border: `2px solid ${t.colors.primary}` }}
                    title={t.name}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.foreground }}>Modern Tech Stack</h2>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Built for speed and reliability</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-transform hover:scale-[1.02]"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <tech.icon size={20} style={{ color: tech.color }} />
                <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>{tech.name}</span>
              </div>
            ))}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <Zap size={20} style={{ color: '#f59e0b' }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Vercel Edge</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="/images/avatars/saito.png" 
                alt="Saito" 
                className="w-14 h-14 rounded-full object-cover"
                style={{ border: `3px solid ${theme.colors.primary}` }}
              />
              <div>
                <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Saito</h3>
                <p className="text-xs" style={{ color: theme.colors.primary }}>Creator of Eziox</p>
              </div>
            </div>
            <p className="text-sm italic leading-relaxed" style={{ color: theme.colors.foregroundMuted }}>
              "I started Eziox because every bio link platform I tried felt like a funnel. Pay to remove a watermark, 
              pay to change fonts, pay to get data that should be yours. Eziox flips that script.
              The essentials stay free forever so newcomers can grow without a bill breathing down their neck. 
              If you want advanced toys like custom CSS or domains, opt in. Otherwise, enjoy a fast, beautiful page 
              that respects your work and your audience."
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://github.com/XSaitoKungX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-80"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
              >
                <SiGithub size={16} /> GitHub
              </a>
              <a
                href="https://discord.gg/KD84DmNA89"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-80"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
              >
                <SiDiscord size={16} style={{ color: '#5865F2' }} /> Discord
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
