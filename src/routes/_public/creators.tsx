import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getCreatorsFn, getCreatorStatsFn } from '@/server/functions/creators'
import type { Creator } from '@/server/functions/creators'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  Sparkles,
  Search,
  Loader2,
  Users2,
  Star,
  Eye,
  Heart,
  ArrowRight,
  Video,
  Radio,
  Brush,
  Music,
  Gamepad2,
  Code2,
  MoreHorizontal,
  Crown,
  ExternalLink,
  ArrowUpDown,
  Zap,
  Globe,
} from 'lucide-react'

type SortOption = 'name_asc' | 'name_desc' | 'views' | 'followers' | 'newest'

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'name_asc', label: 'Name A → Z' },
  { id: 'name_desc', label: 'Name Z → A' },
  { id: 'views', label: 'Most Views' },
  { id: 'followers', label: 'Most Followers' },
  { id: 'newest', label: 'Newest First' },
]

export const Route = createFileRoute('/_public/creators')({
  head: () => ({
    meta: [
      { title: 'Creators | Eziox' },
      {
        name: 'description',
        content:
          'Discover amazing creators on Eziox - VTubers, Streamers, Artists, Musicians, Gamers, and Developers.',
      },
    ],
  }),
  component: CreatorsPage,
})

const CATEGORIES = [
  {
    id: 'all',
    label: 'All',
    icon: Users2,
    color: '#8b5cf6',
    description: 'Browse all creators',
  },
  {
    id: 'vtuber',
    label: 'VTubers',
    icon: Video,
    color: '#ec4899',
    description: 'Virtual content creators',
  },
  {
    id: 'streamer',
    label: 'Streamers',
    icon: Radio,
    color: '#8b5cf6',
    description: 'Live streamers',
  },
  {
    id: 'artist',
    label: 'Artists',
    icon: Brush,
    color: '#14b8a6',
    description: 'Digital & traditional artists',
  },
  {
    id: 'musician',
    label: 'Musicians',
    icon: Music,
    color: '#f59e0b',
    description: 'Music producers & artists',
  },
  {
    id: 'gamer',
    label: 'Gamers',
    icon: Gamepad2,
    color: '#22c55e',
    description: 'Gaming content creators',
  },
  {
    id: 'developer',
    label: 'Developers',
    icon: Code2,
    color: '#3b82f6',
    description: 'Coders & tech creators',
  },
  {
    id: 'other',
    label: 'Other',
    icon: MoreHorizontal,
    color: '#6b7280',
    description: 'Other creators',
  },
] as const

function CreatorsPage() {
  const { theme } = useTheme()
  const getCreators = useServerFn(getCreatorsFn)
  const getStats = useServerFn(getCreatorStatsFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('name_asc')

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

  const {
    data: creatorsData,
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['creators', selectedCategory],
    queryFn: () =>
      getCreators({
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

  const filteredCreators = useMemo(() => {
    return creators.filter(
      (c) =>
        c.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.user.name?.toLowerCase() || '').includes(
          searchQuery.toLowerCase(),
        ) ||
        (c.profile.bio?.toLowerCase() || '').includes(
          searchQuery.toLowerCase(),
        ),
    )
  }, [creators, searchQuery])

  const sortCreators = <T extends (typeof filteredCreators)[0]>(
    list: T[],
  ): T[] => {
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.user.name || a.user.username).localeCompare(
            b.user.name || b.user.username,
          )
        case 'name_desc':
          return (b.user.name || b.user.username).localeCompare(
            a.user.name || a.user.username,
          )
        case 'views':
          return (b.stats?.profileViews || 0) - (a.stats?.profileViews || 0)
        case 'followers':
          return (b.stats?.followers || 0) - (a.stats?.followers || 0)
        case 'newest':
          return (
            new Date(b.user.createdAt || 0).getTime() -
            new Date(a.user.createdAt || 0).getTime()
          )
        default:
          return 0
      }
    })
  }

  const featuredCreators = useMemo(
    () => sortCreators(filteredCreators.filter((c) => c.profile.isFeatured)),
    [filteredCreators, sortBy],
  )
  const regularCreators = useMemo(
    () => sortCreators(filteredCreators.filter((c) => !c.profile.isFeatured)),
    [filteredCreators, sortBy],
  )

  const stats = {
    total: statsData?.totalCreators || 0,
    featured: statsData?.featuredCount || 0,
    categories: statsData?.categoryCount || 0,
    referred: statsData?.referredCreators || 0,
  }

  const getCategoryConfig = (type: string | null | undefined) => {
    const cat = CATEGORIES.find((c) => c.id === type)
    return cat || CATEGORIES[0]
  }

  const selectedCategoryConfig = getCategoryConfig(selectedCategory)

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Primary glow */}
        <motion.div
          className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.4,
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Accent glow */}
        <motion.div
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.35,
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Center glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{
            background: `${theme.colors.primary}50`,
            opacity: glowOpacity * 0.2,
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background:
                i % 2 === 0 ? theme.colors.primary : theme.colors.accent,
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              opacity: 0.4,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10, transparent)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={16} style={{ color: theme.colors.primary }} />
              </motion.div>
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.primary }}
              >
                Creator Community
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>

            {/* Main title */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
              style={{ fontFamily: theme.typography.displayFont }}
            >
              <span style={{ color: theme.colors.foreground }}>Discover </span>
              <span
                className="bg-clip-text text-transparent relative"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Amazing
                <motion.span
                  className="absolute -right-8 -top-4"
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap size={24} style={{ color: theme.colors.accent }} />
                </motion.span>
              </span>
              <br />
              <span style={{ color: theme.colors.foreground }}>Creators</span>
            </h1>

            <p
              className="text-xl md:text-2xl max-w-2xl mx-auto mb-8"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Connect with talented VTubers, Streamers, Artists, Musicians, and
              more from around the world
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {[
                {
                  icon: Users2,
                  value: stats.total,
                  label: 'Creators',
                  color: theme.colors.primary,
                },
                {
                  icon: Star,
                  value: stats.featured,
                  label: 'Featured',
                  color: '#f59e0b',
                },
                {
                  icon: Globe,
                  value: stats.categories,
                  label: 'Categories',
                  color: theme.colors.accent,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                  style={{
                    background: `${theme.colors.card}80`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}20` }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  <div className="text-left">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Live indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>
                Live · Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
              </span>
            </motion.div>
          </motion.div>

          {/* Category Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8"
          >
            {CATEGORIES.map((cat, i) => {
              const isActive = selectedCategory === cat.id
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-4 rounded-2xl text-center transition-all overflow-hidden group"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${cat.color}30, ${cat.color}15)`
                      : theme.effects.cardStyle === 'glass'
                        ? `${theme.colors.card}60`
                        : theme.colors.card,
                    border: `2px solid ${isActive ? cat.color : theme.colors.border}`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${cat.color}20, transparent 70%)`,
                    }}
                  />

                  <div
                    className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center relative"
                    style={{
                      background: isActive ? cat.color : `${cat.color}20`,
                      boxShadow: isActive
                        ? `0 4px 20px ${cat.color}40`
                        : undefined,
                    }}
                  >
                    <cat.icon
                      size={24}
                      style={{ color: isActive ? '#fff' : cat.color }}
                    />
                  </div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: isActive ? cat.color : theme.colors.foreground,
                    }}
                  >
                    {cat.label}
                  </p>
                </motion.button>
              )
            })}
          </motion.div>

          {/* Search and Sort Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <input
                type="text"
                placeholder="Search creators by name, username, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-base transition-all focus:ring-2 outline-none"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                  backdropFilter: 'blur(10px)',
                }}
              />
            </div>
            <div className="relative">
              <ArrowUpDown
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-12 pr-6 py-4 rounded-2xl text-base appearance-none cursor-pointer min-w-[180px]"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${selectedCategoryConfig.color}30, ${selectedCategoryConfig.color}15)`,
                border: `1px solid ${selectedCategoryConfig.color}40`,
              }}
            >
              <selectedCategoryConfig.icon
                size={24}
                style={{ color: selectedCategoryConfig.color }}
              />
            </div>
            <div>
              <h2
                className="text-2xl font-bold"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {selectedCategoryConfig.label === 'All'
                  ? 'All Creators'
                  : selectedCategoryConfig.label}
              </h2>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {filteredCreators.length} creator
                {filteredCreators.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {featuredCreators.length > 0 && (
            <div
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Star size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.primary }}
              >
                {featuredCreators.length} Featured
              </span>
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Loader2
                className="w-12 h-12"
                style={{ color: theme.colors.primary }}
              />
            </motion.div>
            <p
              className="mt-4 text-lg"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Discovering amazing creators...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCreators.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Users2
                size={48}
                style={{ color: theme.colors.primary, opacity: 0.6 }}
              />
            </div>
            <h3
              className="text-2xl font-bold mb-3"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              No creators found
            </h3>
            <p
              className="text-lg mb-6"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Try adjusting your search or explore different categories
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                color: '#fff',
              }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Creator Cards Grid */}
        {!isLoading && filteredCreators.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {/* Featured Creators First */}
            {featuredCreators.map((creator, index) => (
              <CreatorCard
                key={creator.user.id}
                creator={creator}
                index={index}
                isFeatured={true}
                theme={theme}
                cardRadius={cardRadius}
                getCategoryConfig={getCategoryConfig}
              />
            ))}

            {/* Regular Creators */}
            {regularCreators.map((creator, index) => (
              <CreatorCard
                key={creator.user.id}
                creator={creator}
                index={featuredCreators.length + index}
                isFeatured={false}
                theme={theme}
                cardRadius={cardRadius}
                getCategoryConfig={getCategoryConfig}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Creator Card Component
interface CreatorCardProps {
  creator: Creator
  index: number
  isFeatured: boolean
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  getCategoryConfig: (
    type: string | null | undefined,
  ) => (typeof CATEGORIES)[number]
}

function CreatorCard({
  creator,
  index,
  isFeatured,
  theme,
  cardRadius,
  getCategoryConfig,
}: CreatorCardProps) {
  const creatorTypes = (creator.profile.creatorTypes as string[]) || []
  const catConfig = getCategoryConfig(creatorTypes[0])
  const accentColor = creator.profile.accentColor || catConfig.color

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Link
        to="/$username"
        params={{ username: creator.user.username }}
        className="block h-full relative overflow-hidden"
        style={{
          background:
            theme.effects.cardStyle === 'glass'
              ? `${theme.colors.card}90`
              : theme.colors.card,
          backdropFilter:
            theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
          border: isFeatured
            ? `2px solid ${theme.colors.primary}50`
            : `1px solid ${theme.colors.border}`,
          borderRadius: cardRadius,
        }}
      >
        {/* Featured Badge */}
        {isFeatured && (
          <div
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              boxShadow: `0 4px 15px ${theme.colors.primary}40`,
            }}
          >
            <Star size={12} className="text-white" />
            <span className="text-xs font-bold text-white">Featured</span>
          </div>
        )}

        {/* Owner Badge */}
        {creator.user.role === 'owner' && (
          <div
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: '#fbbf24' }}
          >
            <Crown size={12} className="text-black" />
            <span className="text-xs font-bold text-black">Owner</span>
          </div>
        )}

        {/* Banner / Gradient Background */}
        <div className="relative h-24 overflow-hidden">
          {creator.profile.banner ? (
            <img
              src={creator.profile.banner}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${accentColor}60, ${catConfig.color}30, ${theme.colors.primary}20)`,
              }}
            />
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${theme.colors.card}, transparent 60%)`,
            }}
          />
        </div>

        {/* Content */}
        <div className="p-5 -mt-10 relative">
          {/* Avatar */}
          <div className="flex items-end gap-4 mb-4">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: creator.profile.avatar
                    ? `url(${creator.profile.avatar}) center/cover`
                    : `linear-gradient(135deg, ${accentColor}, ${catConfig.color})`,
                  boxShadow: `0 4px 20px ${accentColor}40, 0 0 0 4px ${theme.colors.card}`,
                }}
              >
                {!creator.profile.avatar &&
                  (creator.user.name ?? creator.user.username)
                    .charAt(0)
                    .toUpperCase()}
              </div>
              {/* Category indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: catConfig.color,
                  boxShadow: `0 2px 8px ${catConfig.color}50`,
                }}
              >
                <catConfig.icon size={14} className="text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="font-bold text-lg truncate"
                  style={{ color: theme.colors.foreground }}
                >
                  {creator.user.name || creator.user.username}
                </span>
                {creator.profile.badges &&
                  creator.profile.badges.length > 0 && (
                    <BadgeDisplay
                      badges={creator.profile.badges}
                      size="sm"
                      maxDisplay={3}
                    />
                  )}
              </div>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                @{creator.user.username}
              </p>
            </div>
          </div>

          {/* Bio */}
          {creator.profile.bio ? (
            <p
              className="text-sm line-clamp-2 mb-4 min-h-10"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {creator.profile.bio}
            </p>
          ) : (
            <div className="mb-4 min-h-10" />
          )}

          {/* Stats & Action */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Eye
                  size={14}
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {creator.stats?.profileViews || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart
                  size={14}
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {creator.stats?.followers || 0}
                </span>
              </div>
            </div>

            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all"
              style={{
                background: `${theme.colors.primary}15`,
                color: theme.colors.primary,
              }}
              whileHover={{ gap: '0.75rem' }}
            >
              <span>View</span>
              <ArrowRight size={14} />
            </motion.div>
          </div>

          {/* Referrer */}
          {creator.referrer && (
            <div
              className="flex items-center gap-1.5 mt-3 pt-3"
              style={{ borderTop: `1px solid ${theme.colors.border}` }}
            >
              <ExternalLink
                size={12}
                style={{ color: theme.colors.foregroundMuted }}
              />
              <span
                className="text-xs"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Invited by @{creator.referrer.username}
              </span>
            </div>
          )}
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${accentColor}15, transparent 60%)`,
          }}
        />
      </Link>
    </motion.div>
  )
}
