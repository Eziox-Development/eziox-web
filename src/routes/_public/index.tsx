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
  Eye,
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
import { SiSpotify, SiYoutube, SiSoundcloud, SiTwitch, SiDiscord } from 'react-icons/si'

export const Route = createFileRoute('/_public/')({
  head: () => ({
    meta: [
      { title: 'Eziox - Modern Bio Link Platform' },
      { name: 'description', content: 'Create your personalized bio link page. Share all your links in one place with a beautiful, customizable profile.' },
      { property: 'og:title', content: 'Eziox - Modern Bio Link Platform' },
      { property: 'og:description', content: 'Create your personalized bio link page. Share all your links in one place with a beautiful, customizable profile.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Eziox - Modern Bio Link Platform' },
      { name: 'twitter:description', content: 'Create your personalized bio link page. Share all your links in one place with a beautiful, customizable profile.' },
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

  const liveStats = [
    { label: 'Creators', value: stats?.totalUsers || 0, icon: Users, suffix: '+' },
    { label: 'Links', value: stats?.totalLinks || 0, icon: Link2, suffix: '+' },
    { label: 'Clicks', value: stats?.totalClicks || 0, icon: MousePointerClick, suffix: '' },
    { label: 'Countries', value: stats?.totalCountries || 0, icon: Globe, suffix: '' },
  ]

  const features = [
    { icon: Link2, title: 'Unlimited Links', desc: 'Add as many links as you need', color: '#6366f1' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time click tracking', color: '#10b981' },
    { icon: Palette, title: `${themes.length} Themes`, desc: '8 categories to choose from', color: '#ec4899' },
    { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security', color: '#f59e0b' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Optimized performance', color: '#8b5cf6' },
    { icon: Heart, title: 'Free Forever', desc: 'No hidden costs', color: '#ef4444' },
  ]

  const themeCategories = useMemo(() => [
    { name: 'Gamer', count: themes.filter(t => t.category === 'gamer').length, color: '#00ff00' },
    { name: 'VTuber', count: themes.filter(t => t.category === 'vtuber').length, color: '#ff6b9d' },
    { name: 'Anime', count: themes.filter(t => t.category === 'anime').length, color: '#ff4500' },
    { name: 'Developer', count: themes.filter(t => t.category === 'developer').length, color: '#58a6ff' },
    { name: 'Streamer', count: themes.filter(t => t.category === 'streamer').length, color: '#9146ff' },
    { name: 'Artist', count: themes.filter(t => t.category === 'artist').length, color: '#e8a87c' },
  ], [themes])

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative pt-24 pb-32 px-4">
        <div 
          className="absolute inset-0 pointer-events-none -z-10"
          style={{ background: `radial-gradient(ellipse at 30% 20%, ${theme.colors.primary}15 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${theme.colors.accent}10 0%, transparent 50%)` }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
              >
                <Sparkles size={16} style={{ color: theme.colors.primary }} />
                <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>
                  {themes.length} Themes • {stats?.totalUsers || 0}+ Creators
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] relative z-10" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
                Your Digital
                <br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                  Identity
                </span>
                <br />
                Unified.
              </h1>

              <p className="text-lg lg:text-xl mb-10 max-w-lg leading-relaxed" style={{ color: theme.colors.foregroundMuted }}>
                Create a stunning bio link page that reflects your unique style. 
                Share everything you create from one beautiful, customizable link.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                {currentUser ? (
                  <Link to="/profile">
                    <button
                      className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg text-white transition-transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 20px 40px ${theme.colors.primary}40` }}
                    >
                      Go to Dashboard
                      <ArrowRight size={20} />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link to="/sign-up">
                      <button
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg text-white transition-transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
                        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 20px 40px ${theme.colors.primary}40` }}
                      >
                        Start Free
                        <Rocket size={20} />
                      </button>
                    </Link>
                    <Link to="/leaderboard">
                      <button
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
                        style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                      >
                        Explore Creators
                        <Eye size={20} />
                      </button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6">
                {[
                  { icon: CheckCircle2, text: 'Free Forever' },
                  { icon: Zap, text: 'Instant Setup' },
                  { icon: Shield, text: 'Secure' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <item.icon size={16} style={{ color: theme.colors.primary }} />
                    <span className="text-sm font-medium" style={{ color: theme.colors.foregroundMuted }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative hidden lg:block"
            >
              <div
                className="p-8 rounded-3xl"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                    <Wand2 size={28} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: theme.colors.foreground }}>Theme Preview</p>
                    <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Current: {theme.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {themeCategories.map((cat) => (
                    <div
                      key={cat.name}
                      className="p-3 rounded-xl text-center transition-transform hover:scale-105"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: cat.color }} />
                      <p className="text-xs font-semibold" style={{ color: theme.colors.foreground }}>{cat.name}</p>
                      <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{cat.count} themes</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {[theme.colors.primary, theme.colors.accent, theme.colors.background, theme.colors.foreground].map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-12 rounded-xl transition-transform hover:scale-105"
                      style={{ background: color, border: i > 1 ? `1px solid ${theme.colors.border}` : 'none' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveStats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-2xl transition-transform hover:scale-[1.02]"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${theme.colors.primary}15` }}>
                    <stat.icon size={22} style={{ color: theme.colors.primary }} />
                  </div>
                  <div>
                    <p className="text-2xl lg:text-3xl font-bold" style={{ color: theme.colors.foreground }}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix}
                    </p>
                    <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
            >
              <Layers size={16} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
              Everything You Need
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              Powerful tools to help you grow your online presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${feature.color}20` }}>
                  <feature.icon size={26} style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.foreground }}>{feature.title}</h3>
                <p style={{ color: theme.colors.foregroundMuted }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
              >
                <Palette size={16} style={{ color: theme.colors.primary }} />
                <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Theme System</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
                {themes.length} Themes,{' '}
                <span style={{ color: theme.colors.primary }}>8 Categories</span>
              </h2>
              <p className="text-lg mb-8" style={{ color: theme.colors.foregroundMuted }}>
                From gamer aesthetics to minimal elegance. Each theme includes custom colors, 
                typography, and effects. Switch anytime — all themes are free.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Sparkles, label: 'General', color: '#a855f7' },
                  { icon: Gamepad2, label: 'Gamer', color: '#22c55e' },
                  { icon: Heart, label: 'VTuber', color: '#f472b6' },
                  { icon: Star, label: 'Anime', color: '#f97316' },
                  { icon: Code2, label: 'Developer', color: '#3b82f6' },
                  { icon: Video, label: 'Streamer', color: '#9146ff' },
                  { icon: Brush, label: 'Artist', color: '#f59e0b' },
                  { icon: Layers, label: 'Minimal', color: '#94a3b8' },
                ].map((cat) => (
                  <div
                    key={cat.label}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                  >
                    <cat.icon size={20} style={{ color: cat.color }} />
                    <span className="font-medium" style={{ color: theme.colors.foreground }}>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {themes.slice(0, 12).map((t) => (
                <div
                  key={t.id}
                  className="aspect-square rounded-xl transition-transform hover:scale-110 cursor-pointer"
                  style={{ 
                    background: t.colors.background, 
                    border: `2px solid ${t.colors.primary}`,
                    boxShadow: `0 0 20px ${t.colors.primary}30`
                  }}
                  title={t.name}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full" style={{ background: t.colors.primary }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
            >
              <Music size={16} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Integrations</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
              Connect Your World
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              Embed your favorite platforms directly on your bio page
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: SiSpotify, name: 'Spotify', color: '#1db954', desc: 'Now Playing' },
              { icon: SiYoutube, name: 'YouTube', color: '#ff0000', desc: 'Videos' },
              { icon: SiSoundcloud, name: 'SoundCloud', color: '#ff5500', desc: 'Tracks' },
              { icon: SiTwitch, name: 'Twitch', color: '#9146ff', desc: 'Live Status' },
              { icon: SiDiscord, name: 'Discord', color: '#5865f2', desc: 'Server' },
            ].map((integration) => (
              <div
                key={integration.name}
                className="p-6 rounded-2xl text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${integration.color}20` }}
                >
                  <integration.icon size={28} style={{ color: integration.color }} />
                </div>
                <h3 className="font-bold mb-1" style={{ color: theme.colors.foreground }}>{integration.name}</h3>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{integration.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                  <BarChart3 size={32} className="mb-4" style={{ color: theme.colors.primary }} />
                  <p className="text-3xl font-bold mb-1" style={{ color: theme.colors.foreground }}>Real-time</p>
                  <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Live click tracking</p>
                </div>
                <div className="p-6 rounded-2xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                  <Globe size={32} className="mb-4" style={{ color: '#22c55e' }} />
                  <p className="text-3xl font-bold mb-1" style={{ color: theme.colors.foreground }}>Global</p>
                  <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Visitor locations</p>
                </div>
                <div className="p-6 rounded-2xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                  <TrendingUp size={32} className="mb-4" style={{ color: '#f59e0b' }} />
                  <p className="text-3xl font-bold mb-1" style={{ color: theme.colors.foreground }}>Trends</p>
                  <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Performance insights</p>
                </div>
                <div className="p-6 rounded-2xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                  <Calendar size={32} className="mb-4" style={{ color: '#ec4899' }} />
                  <p className="text-3xl font-bold mb-1" style={{ color: theme.colors.foreground }}>30 Days</p>
                  <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Data retention</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
              >
                <BarChart3 size={16} style={{ color: theme.colors.primary }} />
                <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Analytics</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
                Know Your{' '}
                <span style={{ color: theme.colors.primary }}>Audience</span>
              </h2>
              <p className="text-lg mb-6" style={{ color: theme.colors.foregroundMuted }}>
                Track every click, see where your visitors come from, and understand what content 
                resonates. All analytics are included free — no premium required.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Click Tracking', 'Referrer Data', 'Device Stats', 'Export Data'].map((feature) => (
                  <span
                    key={feature}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: `${theme.colors.primary}15`, color: theme.colors.foreground }}
                  >
                    <CheckCircle2 size={14} style={{ color: theme.colors.primary }} />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {topUsers && topUsers.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                  style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
                >
                  <Trophy size={16} style={{ color: theme.colors.primary }} />
                  <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Leaderboard</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-2" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
                  Top Creators
                </h2>
                <p className="text-lg" style={{ color: theme.colors.foregroundMuted }}>
                  Join {stats?.totalUsers?.toLocaleString() || 0}+ creators on Eziox
                </p>
              </div>
              <Link to="/leaderboard">
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                >
                  View All
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topUsers.slice(0, 6).map((item, i) => {
                const isOwner = item.user.role === 'admin'
                const medals = ['#fbbf24', '#9ca3af', '#cd7f32']
                return (
                  <Link key={item.user.id} to="/$username" params={{ username: item.user.username }}>
                    <div
                      className="p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
                      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-14 h-14 ring-2" style={{ '--tw-ring-color': i < 3 ? medals[i] : theme.colors.border } as React.CSSProperties}>
                            <AvatarImage src={item.profile?.avatar || undefined} />
                            <AvatarFallback style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: 'white', fontWeight: 700 }}>
                              {(item.user.name || item.user.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {i < 3 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: medals[i] }}>
                              {i + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold truncate" style={{ color: theme.colors.foreground }}>
                              {item.user.name || item.user.username}
                            </p>
                            {isOwner && <Crown size={14} className="text-amber-500 shrink-0" />}
                          </div>
                          <p className="text-sm truncate" style={{ color: theme.colors.foregroundMuted }}>@{item.user.username}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={14} style={{ color: theme.colors.primary }} />
                            <span className="font-bold" style={{ color: theme.colors.primary }}>{item.stats?.score?.toLocaleString() || 0}</span>
                          </div>
                          <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>points</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
            >
              <Star size={16} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>How It Works</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
              Get Started in Minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up free in seconds', icon: Users },
              { step: '02', title: 'Customize', desc: 'Add links & choose theme', icon: Palette },
              { step: '03', title: 'Share', desc: 'Share your unique link', icon: Globe },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center relative transition-transform hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                >
                  <item.icon size={36} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: theme.colors.card, border: `2px solid ${theme.colors.primary}`, color: theme.colors.primary }}>
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.foreground }}>{item.title}</h3>
                <p style={{ color: theme.colors.foregroundMuted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
