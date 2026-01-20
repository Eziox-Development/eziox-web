import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getCreatorsFn, getCreatorStatsFn } from '@/server/functions/creators'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  Sparkles, Search, Loader2, Users2, Star, TrendingUp, Activity,
  Filter, Eye, Heart, ArrowRight, Video, Radio, Brush, Music,
  Gamepad2, Code2, MoreHorizontal, Crown, ExternalLink, ArrowUpDown,
} from 'lucide-react'

type SortOption = 'name_asc' | 'name_desc' | 'views' | 'followers' | 'newest'

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'name_asc', label: 'A → Z' },
  { id: 'name_desc', label: 'Z → A' },
  { id: 'views', label: 'Most Views' },
  { id: 'followers', label: 'Most Followers' },
  { id: 'newest', label: 'Newest' },
]

export const Route = createFileRoute('/_public/creators')({
  head: () => ({
    meta: [
      { title: 'Creators | Eziox' },
      { name: 'description', content: 'Discover amazing creators on Eziox' },
    ],
  }),
  component: CreatorsPage,
})

const CATEGORIES = [
  { id: 'all', label: 'All Creators', icon: Users2, color: '#8b5cf6' },
  { id: 'vtuber', label: 'VTubers', icon: Video, color: '#ec4899' },
  { id: 'streamer', label: 'Streamers', icon: Radio, color: '#8b5cf6' },
  { id: 'artist', label: 'Artists', icon: Brush, color: '#14b8a6' },
  { id: 'musician', label: 'Musicians', icon: Music, color: '#f59e0b' },
  { id: 'gamer', label: 'Gamers', icon: Gamepad2, color: '#22c55e' },
  { id: 'developer', label: 'Developers', icon: Code2, color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: '#6b7280' },
] as const

function CreatorsPage() {
  const { theme } = useTheme()
  const getCreators = useServerFn(getCreatorsFn)
  const getStats = useServerFn(getCreatorStatsFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('name_asc')

  const { data: creatorsData, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['creators', selectedCategory],
    queryFn: () => getCreators({
      data: {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 100,
      },
    }),
    refetchInterval: 30000,
  })

  const { data: statsData } = useQuery({
    queryKey: ['creator-stats'],
    queryFn: () => getStats({}),
    refetchInterval: 30000,
  })

  const creators = creatorsData?.creators || []
  const filteredCreators = creators.filter(c =>
    c.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  const sortCreators = <T extends typeof filteredCreators[0]>(list: T[]): T[] => {
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.user.name || a.user.username).localeCompare(b.user.name || b.user.username)
        case 'name_desc':
          return (b.user.name || b.user.username).localeCompare(a.user.name || a.user.username)
        case 'views':
          return (b.stats?.profileViews || 0) - (a.stats?.profileViews || 0)
        case 'followers':
          return (b.stats?.followers || 0) - (a.stats?.followers || 0)
        case 'newest':
          return new Date(b.user.createdAt || 0).getTime() - new Date(a.user.createdAt || 0).getTime()
        default:
          return 0
      }
    })
  }

  const featuredCreators = sortCreators(filteredCreators.filter(c => c.profile.isFeatured))
  const regularCreators = sortCreators(filteredCreators.filter(c => !c.profile.isFeatured))

  const stats = {
    total: statsData?.totalCreators || 0,
    featured: statsData?.featuredCount || 0,
    categories: statsData?.categoryCount || 0,
    referred: statsData?.referredCreators || 0,
  }

  const getCategoryConfig = (type: string | null | undefined) => {
    const cat = CATEGORIES.find(c => c.id === type)
    return cat || CATEGORIES[0]
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ background: theme.colors.primary }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{ background: theme.colors.accent }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Sparkles size={28} className="text-white" />
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                  animate={{ opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Creators</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Activity size={14} style={{ color: '#22c55e' }} />
                  <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    Live · Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Creators', value: stats.total, icon: Users2, color: theme.colors.primary, bg: `${theme.colors.primary}20` },
            { label: 'Featured', value: stats.featured, icon: Star, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
            { label: 'Categories', value: stats.categories, icon: Sparkles, color: theme.colors.accent, bg: `${theme.colors.accent}20` },
            { label: 'Referred', value: stats.referred, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative p-5 rounded-2xl overflow-hidden group"
              style={{
                background: `${theme.colors.card}80`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at 50% 0%, ${stat.bg}, transparent 70%)` }}
              />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)` }} />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <div>
                  <motion.p
                    className="text-2xl font-bold"
                    style={{ color: 'var(--foreground)' }}
                    key={stat.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: theme.colors.card,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                  <Filter size={20} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Browse Creators</h2>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{filteredCreators.length} creators found</p>
                </div>
              </div>
              <div className="flex-1 flex gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:ring-2 focus:ring-purple-500/30"
                    style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  />
                </div>
                <div className="relative">
                  <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="pl-10 pr-8 py-2.5 rounded-xl text-sm appearance-none cursor-pointer"
                    style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 flex flex-wrap gap-2" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: isActive ? `${cat.color}20` : theme.colors.backgroundSecondary,
                      border: `1px solid ${isActive ? `${cat.color}40` : theme.colors.border}`,
                      color: isActive ? cat.color : theme.colors.foregroundMuted,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <cat.icon size={16} />
                    <span>{cat.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {featuredCreators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                <Star size={16} style={{ color: theme.colors.primary }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Featured Creators</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCreators.map((creator, index) => {
                const creatorTypes = (creator.profile.creatorTypes as string[]) || []
                const catConfig = getCategoryConfig(creatorTypes[0])
                return (
                  <motion.div
                    key={creator.user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Link
                      to="/$username"
                      params={{ username: creator.user.username }}
                      className="block rounded-2xl overflow-hidden group"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10)`,
                        border: `1px solid ${theme.colors.primary}30`,
                      }}
                    >
                      <div className="relative h-28">
                        {creator.profile.banner ? (
                          <img src={creator.profile.banner} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${creator.profile.accentColor || '#8b5cf6'}40, ${catConfig.color}20)` }} />
                        )}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: theme.colors.primary }}>
                          <Star size={12} style={{ color: theme.colors.primaryForeground }} />
                          <span className="text-xs font-semibold" style={{ color: theme.colors.primaryForeground }}>Featured</span>
                        </div>
                      </div>
                      <div className="p-4 -mt-8 relative">
                        <div className="flex items-end gap-3 mb-3">
                          <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl overflow-hidden"
                            style={{
                              background: creator.profile.avatar
                                ? `url(${creator.profile.avatar}) center/cover`
                                : `linear-gradient(135deg, ${creator.profile.accentColor || '#8b5cf6'}, #ec4899)`,
                              boxShadow: '0 0 0 3px var(--background)',
                            }}
                          >
                            {!creator.profile.avatar && (creator.user.name ?? creator.user.username).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold truncate" style={{ color: 'var(--foreground)' }}>{creator.user.name || creator.user.username}</span>
                              {creator.profile.badges && creator.profile.badges.length > 0 && (
                                <BadgeDisplay badges={creator.profile.badges} size="sm" maxDisplay={4} />
                              )}
                            </div>
                            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{creator.user.username}</p>
                          </div>
                        </div>
                        {creator.profile.bio && (
                          <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--foreground-muted)' }}>{creator.profile.bio}</p>
                        )}
                        <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <catConfig.icon size={14} style={{ color: catConfig.color }} />
                              <span className="text-xs" style={{ color: catConfig.color }}>{catConfig.label}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: theme.colors.primary }}>
                            <span>View</span>
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: theme.colors.card,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                  <Users2 size={20} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>All Creators</h2>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{regularCreators.length} creators</p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 className="w-8 h-8 mx-auto" style={{ color: 'var(--primary)' }} />
                </motion.div>
                <p className="mt-3 text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading creators...</p>
              </div>
            ) : regularCreators.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${theme.colors.primary}15` }}>
                  <Users2 size={40} style={{ color: theme.colors.primary, opacity: 0.5 }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>No creators found</h3>
                <p style={{ color: 'var(--foreground-muted)' }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularCreators.map((creator, index) => {
                  const creatorTypes = (creator.profile.creatorTypes as string[]) || []
                const catConfig = getCategoryConfig(creatorTypes[0])
                  return (
                    <motion.div
                      key={creator.user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link
                        to="/$username"
                        params={{ username: creator.user.username }}
                        className="block rounded-2xl group"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="relative">
                              <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl overflow-hidden"
                                style={{
                                  background: creator.profile.avatar
                                    ? `url(${creator.profile.avatar}) center/cover`
                                    : `linear-gradient(135deg, ${creator.profile.accentColor || '#8b5cf6'}, #ec4899)`,
                                }}
                              >
                                {!creator.profile.avatar && (creator.user.name ?? creator.user.username).charAt(0).toUpperCase()}
                              </div>
                              {creator.user.role === 'owner' && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#fbbf24', border: '2px solid var(--background)' }}>
                                  <Crown size={12} className="text-black" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-bold truncate" style={{ color: 'var(--foreground)' }}>
                                  {creator.user.name || creator.user.username}
                                </span>
                                {creator.profile.badges && creator.profile.badges.length > 0 && (
                                  <BadgeDisplay badges={creator.profile.badges} size="sm" maxDisplay={4} />
                                )}
                              </div>
                              <p className="text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>@{creator.user.username}</p>
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit" style={{ background: `${catConfig.color}15` }}>
                                <catConfig.icon size={12} style={{ color: catConfig.color }} />
                                <span className="text-xs font-medium" style={{ color: catConfig.color }}>{catConfig.label}</span>
                              </div>
                            </div>
                          </div>
                          
                          {creator.profile.bio && (
                            <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--foreground-muted)' }}>
                              {creator.profile.bio}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <Eye size={14} style={{ color: 'var(--foreground-muted)' }} />
                                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{creator.stats?.profileViews || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Heart size={14} style={{ color: 'var(--foreground-muted)' }} />
                                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{creator.stats?.followers || 0}</span>
                              </div>
                            </div>
                            <motion.div
                              className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
                              style={{ color: 'var(--primary)' }}
                            >
                              <span>View</span>
                              <ArrowRight size={14} />
                            </motion.div>
                          </div>

                          {creator.referrer && (
                            <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <ExternalLink size={12} style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Joined via @{creator.referrer.username}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
