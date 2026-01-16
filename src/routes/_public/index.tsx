import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getTopUsersFn } from '@/server/functions/users'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
} from 'lucide-react'

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
  })

  const { data: stats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => getPlatformStats(),
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

  const themeCategories = [
    { name: 'Gamer', count: themes.filter(t => t.category === 'gamer').length, color: '#00ff00' },
    { name: 'VTuber', count: themes.filter(t => t.category === 'vtuber').length, color: '#ff6b9d' },
    { name: 'Anime', count: themes.filter(t => t.category === 'anime').length, color: '#ff4500' },
    { name: 'Developer', count: themes.filter(t => t.category === 'developer').length, color: '#58a6ff' },
    { name: 'Streamer', count: themes.filter(t => t.category === 'streamer').length, color: '#9146ff' },
    { name: 'Artist', count: themes.filter(t => t.category === 'artist').length, color: '#e8a87c' },
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative pt-24 pb-32 px-4">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[120px] opacity-30"
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -bottom-40 right-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
            style={{ background: theme.colors.accent }}
            animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, transparent 0%, ${theme.colors.background} 70%)` }} />
        </div>

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

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-[1.1]" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
                Your Digital
                <br />
                <span style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
                    <motion.button
                      className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg text-white"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 20px 40px ${theme.colors.primary}40` }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Go to Dashboard
                      <ArrowRight size={20} />
                    </motion.button>
                  </Link>
                ) : (
                  <>
                    <Link to="/sign-up">
                      <motion.button
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg text-white"
                        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 20px 40px ${theme.colors.primary}40` }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Start Free
                        <Rocket size={20} />
                      </motion.button>
                    </Link>
                    <Link to="/leaderboard">
                      <motion.button
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg"
                        style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Explore Creators
                        <Eye size={20} />
                      </motion.button>
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
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 rounded-3xl blur-2xl opacity-40"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <div
                  className="relative p-8 rounded-3xl"
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
                      <motion.div
                        key={cat.name}
                        className="p-3 rounded-xl text-center"
                        style={{ background: theme.colors.backgroundSecondary }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: cat.color }} />
                        <p className="text-xs font-semibold" style={{ color: theme.colors.foreground }}>{cat.name}</p>
                        <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{cat.count} themes</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {[theme.colors.primary, theme.colors.accent, theme.colors.background, theme.colors.foreground].map((color, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 h-12 rounded-xl"
                        style={{ background: color, border: i > 1 ? `1px solid ${theme.colors.border}` : 'none' }}
                        whileHover={{ scale: 1.05 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {liveStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-2xl overflow-hidden group"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.accent}10)` }} />
                <div className="relative flex items-center gap-4">
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
            >
              <Layers size={16} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Features</span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
              Everything You Need
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              Powerful tools to help you grow your online presence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl transition-all"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ y: -4, boxShadow: `0 20px 40px ${theme.colors.primary}15` }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${feature.color}20` }}>
                  <feature.icon size={26} style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.foreground }}>{feature.title}</h3>
                <p style={{ color: theme.colors.foregroundMuted }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {topUsers && topUsers.length > 0 && (
        <section className="py-24 px-4" style={{ background: theme.colors.backgroundSecondary }}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
            >
              <div>
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                  style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
                >
                  <Trophy size={16} style={{ color: theme.colors.primary }} />
                  <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Leaderboard</span>
                </motion.div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-2" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
                  Top Creators
                </h2>
                <p className="text-lg" style={{ color: theme.colors.foregroundMuted }}>
                  Join {stats?.totalUsers?.toLocaleString() || 0}+ creators on Eziox
                </p>
              </div>
              <Link to="/leaderboard">
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topUsers.slice(0, 6).map((item, i) => {
                const isOwner = item.user.role === 'admin'
                const medals = ['#fbbf24', '#9ca3af', '#cd7f32']
                return (
                  <motion.div
                    key={item.user.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to="/$username" params={{ username: item.user.username }}>
                      <motion.div
                        className="p-5 rounded-2xl transition-all"
                        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                        whileHover={{ y: -4, boxShadow: `0 20px 40px ${theme.colors.primary}15` }}
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
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
            >
              <Star size={16} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>How It Works</span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
              Get Started in Minutes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up free in seconds', icon: Users },
              { step: '02', title: 'Customize', desc: 'Add links & choose theme', icon: Palette },
              { step: '03', title: 'Share', desc: 'Share your unique link', icon: Globe },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center relative"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <item.icon size={36} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: theme.colors.card, border: `2px solid ${theme.colors.primary}`, color: theme.colors.primary }}>
                    {item.step}
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.foreground }}>{item.title}</h3>
                <p style={{ color: theme.colors.foregroundMuted }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              className="absolute -inset-4 rounded-4xl blur-3xl opacity-50"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div
              className="relative p-12 lg:p-16 rounded-3xl text-center"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Rocket size={36} className="text-white" />
              </motion.div>

              <h2 className="text-3xl lg:text-5xl font-bold mb-4" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
                Ready to Stand Out?
              </h2>
              <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
                Join {stats?.totalUsers?.toLocaleString() || 0}+ creators who trust Eziox for their online presence
              </p>

              {currentUser ? (
                <Link to="/links">
                  <motion.button
                    className="flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-lg text-white mx-auto"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 20px 40px ${theme.colors.primary}40` }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Manage Your Links
                    <ArrowRight size={20} />
                  </motion.button>
                </Link>
              ) : (
                <Link to="/sign-up">
                  <motion.button
                    className="flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-lg text-white mx-auto"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 20px 40px ${theme.colors.primary}40` }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Create Your Page
                    <ArrowRight size={20} />
                  </motion.button>
                </Link>
              )}

              <div className="flex items-center justify-center gap-8 mt-10">
                {[
                  { icon: CheckCircle2, text: 'Free Forever' },
                  { icon: Shield, text: 'Secure & Private' },
                  { icon: Zap, text: '2 Min Setup' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <item.icon size={18} style={{ color: theme.colors.primary }} />
                    <span className="text-sm font-medium" style={{ color: theme.colors.foregroundMuted }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
