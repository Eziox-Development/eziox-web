import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getCreatorsFn, getFeaturedCreatorsFn, getCreatorCategoriesFn, getCreatorStatsFn } from '@/server/functions/creators'
import { BadgeDisplay } from '@/components/ui/BadgeDisplay'
import {
  Sparkles, Users2, Star, Search, Filter, ExternalLink,
  Eye, Heart, ArrowRight, Loader2, UserPlus,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export const Route = createFileRoute('/_public/creators')({
  head: () => ({
    meta: [
      { title: 'Creators | Eziox' },
      { name: 'description', content: 'Discover amazing creators, streamers, VTubers, and artists on Eziox' },
    ],
  }),
  component: CreatorsPage,
})

const DEFAULT_CATEGORY = { icon: 'Sparkles' as keyof typeof LucideIcons, color: '#f59e0b', label: 'Creator' }

const CATEGORY_CONFIG: Record<string, { icon: keyof typeof LucideIcons; color: string; label: string }> = {
  vtuber: { icon: 'Video', color: '#8b5cf6', label: 'VTuber' },
  streamer: { icon: 'Radio', color: '#ef4444', label: 'Streamer' },
  artist: { icon: 'Brush', color: '#ec4899', label: 'Artist' },
  musician: { icon: 'Music', color: '#f472b6', label: 'Musician' },
  gamer: { icon: 'Gamepad2', color: '#22c55e', label: 'Gamer' },
  developer: { icon: 'Wand2', color: '#06b6d4', label: 'Developer' },
  other: DEFAULT_CATEGORY,
}

function getCategoryConfig(type: string | null | undefined) {
  return CATEGORY_CONFIG[type || 'other'] || DEFAULT_CATEGORY
}

function CreatorsPage() {
  const getCreators = useServerFn(getCreatorsFn)
  const getFeatured = useServerFn(getFeaturedCreatorsFn)
  const getCategories = useServerFn(getCreatorCategoriesFn)
  const getStats = useServerFn(getCreatorStatsFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data: statsData } = useQuery({
    queryKey: ['creator-stats'],
    queryFn: () => getStats({}),
  })

  const { data: featuredData } = useQuery({
    queryKey: ['featured-creators'],
    queryFn: () => getFeatured({ data: { limit: 6 } }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['creator-categories'],
    queryFn: () => getCategories({}),
  })

  const { data: creatorsData, isLoading } = useQuery({
    queryKey: ['creators', selectedCategory],
    queryFn: () => getCreators({ data: { category: selectedCategory === 'all' ? undefined : selectedCategory, limit: 50 } }),
  })

  const stats = statsData || { totalCreators: 0, featuredCount: 0, categoryCount: 0, referredCreators: 0 }
  const featured = featuredData || []
  const categories = categoriesData || []
  const creators = creatorsData?.creators || []

  const filteredCreators = creators.filter(c =>
    c.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'rgba(139, 92, 246, 0.08)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(236, 72, 153, 0.06)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 right-10 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'rgba(34, 197, 94, 0.05)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Sparkles size={16} style={{ color: '#8b5cf6' }} />
            <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>Creator Showcase</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Discover Amazing <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Creators</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Explore our community of talented streamers, VTubers, artists, and content creators
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'Total Creators', value: stats.totalCreators, icon: Users2, color: '#8b5cf6' },
            { label: 'Featured', value: stats.featuredCount, icon: Star, color: '#f59e0b' },
            { label: 'Categories', value: stats.categoryCount, icon: Filter, color: '#22c55e' },
            { label: 'Referred', value: stats.referredCreators, icon: UserPlus, color: '#ec4899' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative p-5 rounded-2xl overflow-hidden group"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)` }} />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {featured.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                <Star size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Featured Creators</h2>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Handpicked by our team</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((creator, index) => {
                const categoryConfig = getCategoryConfig(creator.profile.creatorType)
                const CategoryIcon = LucideIcons[categoryConfig.icon] as React.ComponentType<{ size?: number; style?: React.CSSProperties }>
                return (
                  <motion.div
                    key={creator.user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link
                      to="/$username"
                      params={{ username: creator.user.username }}
                      className="block rounded-3xl overflow-hidden group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="relative h-32">
                        {creator.profile.banner ? (
                          <img src={creator.profile.banner} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${creator.profile.accentColor || '#8b5cf6'}40, ${creator.profile.accentColor || '#ec4899'}20)` }} />
                        )}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg flex items-center gap-1.5" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                          {CategoryIcon && <CategoryIcon size={12} style={{ color: categoryConfig.color }} />}
                          <span className="text-xs font-medium" style={{ color: categoryConfig.color }}>{categoryConfig.label}</span>
                        </div>
                        <div className="absolute top-3 left-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.9)' }}>
                            <Star size={12} className="text-black" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 -mt-8 relative">
                        <div className="flex items-end gap-3 mb-3">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden"
                            style={{
                              background: creator.profile.avatar
                                ? `url(${creator.profile.avatar}) center/cover`
                                : `linear-gradient(135deg, ${creator.profile.accentColor || '#8b5cf6'}, #ec4899)`,
                              boxShadow: '0 0 0 4px var(--background)',
                            }}
                          >
                            {!creator.profile.avatar && (creator.user.name ?? creator.user.username).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold truncate" style={{ color: 'var(--foreground)' }}>{creator.user.name || creator.user.username}</span>
                              {creator.profile.badges && creator.profile.badges.length > 0 && (
                                <BadgeDisplay badges={creator.profile.badges} size="sm" maxDisplay={2} />
                              )}
                            </div>
                            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{creator.user.username}</p>
                          </div>
                        </div>
                        {creator.profile.bio && (
                          <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--foreground-muted)' }}>{creator.profile.bio}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Eye size={14} style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{creator.stats?.profileViews || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Heart size={14} style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{creator.stats?.followers || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: 'var(--primary)' }}>
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
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <Users2 size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>All Creators</h2>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{filteredCreators.length} creators found</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:ring-2 focus:ring-purple-500/30"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--foreground)' }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: selectedCategory === 'all' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${selectedCategory === 'all' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: selectedCategory === 'all' ? '#8b5cf6' : 'var(--foreground-muted)',
                  }}
                >
                  All
                </button>
                {categories.slice(0, 5).map((cat) => {
                  const config = getCategoryConfig(cat.category)
                  const configColor = config.color
                  const configLabel = config.label
                  return (
                    <button
                      key={cat.category}
                      onClick={() => setSelectedCategory(cat.category)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                      style={{
                        background: selectedCategory === cat.category ? `${configColor}20` : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${selectedCategory === cat.category ? `${configColor}40` : 'rgba(255, 255, 255, 0.08)'}`,
                        color: selectedCategory === cat.category ? configColor : 'var(--foreground-muted)',
                      }}
                    >
                      {configLabel}
                      <span className="text-xs opacity-60">({cat.count})</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 className="w-10 h-10 mx-auto" style={{ color: 'var(--primary)' }} />
              </motion.div>
              <p className="mt-4" style={{ color: 'var(--foreground-muted)' }}>Loading creators...</p>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="py-20 text-center">
              <Users2 size={64} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--foreground-muted)' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--foreground-muted)' }}>No creators found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)', opacity: 0.6 }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredCreators.map((creator, index) => {
                  const categoryConfig = getCategoryConfig(creator.profile.creatorType)
                  const catColor = categoryConfig.color
                  const catLabel = categoryConfig.label
                  const CategoryIcon = LucideIcons[categoryConfig.icon] as React.ComponentType<{ size?: number; style?: React.CSSProperties }>
                  return (
                    <motion.div
                      key={creator.user.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link
                        to="/$username"
                        params={{ username: creator.user.username }}
                        className="block rounded-2xl overflow-hidden group h-full"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="relative">
                              <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                                style={{
                                  background: creator.profile.avatar
                                    ? `url(${creator.profile.avatar}) center/cover`
                                    : `linear-gradient(135deg, ${creator.profile.accentColor || '#8b5cf6'}, #ec4899)`,
                                }}
                              >
                                {!creator.profile.avatar && (creator.user.name ?? creator.user.username).charAt(0).toUpperCase()}
                              </div>
                              {creator.profile.isFeatured && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#f59e0b' }}>
                                  <Star size={10} className="text-black" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>{creator.user.name || creator.user.username}</span>
                                {creator.profile.badges && creator.profile.badges.length > 0 && (
                                  <BadgeDisplay badges={creator.profile.badges} size="sm" maxDisplay={2} />
                                )}
                              </div>
                              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{creator.user.username}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                {CategoryIcon && <CategoryIcon size={12} style={{ color: catColor }} />}
                                <span className="text-xs" style={{ color: catColor }}>{catLabel}</span>
                              </div>
                            </div>
                          </div>
                          {creator.profile.bio && (
                            <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--foreground-muted)' }}>{creator.profile.bio}</p>
                          )}
                          {creator.referrer && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                              <UserPlus size={12} style={{ color: '#8b5cf6' }} />
                              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                Joined via <span style={{ color: '#8b5cf6' }}>@{creator.referrer.username}</span>
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Eye size={12} style={{ color: 'var(--foreground-muted)' }} />
                                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{creator.stats?.profileViews || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart size={12} style={{ color: 'var(--foreground-muted)' }} />
                                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{creator.stats?.followers || 0}</span>
                              </div>
                            </div>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--primary)' }} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
