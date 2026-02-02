import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getCreatorsFn, getCreatorStatsFn } from '@/server/functions/creators'
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
  ChevronRight,
  Video,
  Radio,
  Brush,
  Music,
  Gamepad2,
  Code2,
  MoreHorizontal,
  Crown,
  ChevronLeft,
  Trophy,
  Medal,
  Award,
  Filter,
  X,
  type LucideIcon,
} from 'lucide-react'

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

type SortOption = 'views' | 'followers' | 'newest' | 'name'
type CategoryId =
  | 'all'
  | 'vtuber'
  | 'streamer'
  | 'artist'
  | 'musician'
  | 'gamer'
  | 'developer'
  | 'other'

interface CategoryConfig {
  id: CategoryId
  icon: LucideIcon
  color: string
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { id: 'all', icon: Users2, color: '#8b5cf6' },
  { id: 'vtuber', icon: Video, color: '#ec4899' },
  { id: 'streamer', icon: Radio, color: '#8b5cf6' },
  { id: 'artist', icon: Brush, color: '#14b8a6' },
  { id: 'musician', icon: Music, color: '#f59e0b' },
  { id: 'gamer', icon: Gamepad2, color: '#22c55e' },
  { id: 'developer', icon: Code2, color: '#3b82f6' },
  { id: 'other', icon: MoreHorizontal, color: '#6b7280' },
]

const DEFAULT_CATEGORY: CategoryConfig = {
  id: 'all',
  icon: Users2,
  color: '#8b5cf6',
}
const ITEMS_PER_PAGE = 20

function getCategoryById(id: string | null | undefined): CategoryConfig {
  return CATEGORY_CONFIGS.find((c) => c.id === id) ?? DEFAULT_CATEGORY
}

export function CreatorsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const getCreators = useServerFn(getCreatorsFn)
  const getStats = useServerFn(getCreatorStatsFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')
  const [sortBy, setSortBy] = useState<SortOption>('views')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const categories = useMemo(
    () =>
      CATEGORY_CONFIGS.map((cfg) => ({
        ...cfg,
        label: t(`creators.categories.${cfg.id}.label`),
      })),
    [t],
  )

  const sortOptions = useMemo(
    () => [
      { id: 'views' as const, label: t('creators.sort.views'), icon: Eye },
      {
        id: 'followers' as const,
        label: t('creators.sort.followers'),
        icon: Heart,
      },
      {
        id: 'newest' as const,
        label: t('creators.sort.newest'),
        icon: Sparkles,
      },
      { id: 'name' as const, label: t('creators.sort.nameAsc'), icon: Users2 },
    ],
    [t],
  )

  const { data: creatorsData, isLoading } = useQuery({
    queryKey: ['creators', selectedCategory],
    queryFn: () =>
      getCreators({
        data: {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          limit: 50,
        },
      }),
    refetchInterval: 60000,
  })

  const { data: statsData } = useQuery({
    queryKey: ['creator-stats'],
    queryFn: () => getStats(),
    refetchInterval: 60000,
  })

  const creators = creatorsData?.creators ?? []

  const filteredAndSortedCreators = useMemo(() => {
    const filtered = creators.filter(
      (c) =>
        c.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.user.name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()),
    )

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return (b.stats?.profileViews ?? 0) - (a.stats?.profileViews ?? 0)
        case 'followers':
          return (b.stats?.followers ?? 0) - (a.stats?.followers ?? 0)
        case 'newest':
          return (
            new Date(b.user.createdAt ?? 0).getTime() -
            new Date(a.user.createdAt ?? 0).getTime()
          )
        case 'name':
          return (a.user.name ?? a.user.username).localeCompare(
            b.user.name ?? b.user.username,
          )
        default:
          return 0
      }
    })
  }, [creators, searchQuery, sortBy])

  const totalPages = Math.ceil(
    filteredAndSortedCreators.length / ITEMS_PER_PAGE,
  )
  const paginatedCreators = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedCreators.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAndSortedCreators, currentPage])

  const stats = {
    total: statsData?.totalCreators ?? 0,
    featured: statsData?.featuredCount ?? 0,
  }

  const selectedCatConfig = getCategoryById(selectedCategory)
  const selectedCatLabel =
    categories.find((c) => c.id === selectedCategory)?.label ??
    t('creators.categories.all.label')

  const handleCategoryChange = (cat: CategoryId) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Trophy size={18} className="text-yellow-400" />
    if (rank === 2) return <Medal size={18} className="text-gray-300" />
    if (rank === 3) return <Award size={18} className="text-amber-600" />
    return (
      <span
        className="text-sm font-medium"
        style={{ color: theme.colors.foregroundMuted }}
      >
        {rank}
      </span>
    )
  }

  return (
    <div
      className="min-h-screen pb-12"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Hero */}
      <section className="relative pt-24 pb-8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${theme.colors.primary}15, transparent)`,
          }}
        />

        <div className="max-w-5xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}25`,
              }}
            >
              <Sparkles size={14} style={{ color: theme.colors.primary }} />
              <span
                className="text-xs font-medium"
                style={{ color: theme.colors.primary }}
              >
                {t('creators.badge')}
              </span>
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{
                fontFamily: theme.typography.displayFont,
                color: theme.colors.foreground,
              }}
            >
              {t('creators.hero.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('creators.hero.titleHighlight')}
              </span>
            </h1>

            <p
              className="text-sm max-w-lg mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('creators.hero.subtitle')}
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <p
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.foreground }}
                >
                  {stats.total}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t('creators.stats.creators')}
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.primary }}
                >
                  {stats.featured}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t('creators.stats.featured')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {/* Search & Filter Toggle */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <input
                type="text"
                placeholder={t('creators.search.placeholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10"
                >
                  <X
                    size={14}
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: showFilters
                  ? theme.colors.primary
                  : theme.colors.card,
                border: `1px solid ${showFilters ? theme.colors.primary : theme.colors.border}`,
                color: showFilters ? '#fff' : theme.colors.foreground,
              }}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="p-4 rounded-xl mb-4"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  {/* Categories */}
                  <div className="mb-4">
                    <p
                      className="text-xs font-medium mb-2"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('creators.categories.all.label')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const isActive = selectedCategory === cat.id
                        const Icon = cat.icon
                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: isActive
                                ? cat.color
                                : `${cat.color}15`,
                              color: isActive ? '#fff' : cat.color,
                            }}
                          >
                            <Icon size={14} />
                            {cat.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <p
                      className="text-xs font-medium mb-2"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('creators.sort.views')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((opt) => {
                        const isActive = sortBy === opt.id
                        const Icon = opt.icon
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSortChange(opt.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: isActive
                                ? theme.colors.primary
                                : theme.colors.backgroundSecondary,
                              color: isActive
                                ? '#fff'
                                : theme.colors.foreground,
                            }}
                          >
                            <Icon size={14} />
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Summary */}
          {(selectedCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategory !== 'all' && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{
                    background: `${selectedCatConfig.color}20`,
                    color: selectedCatConfig.color,
                  }}
                >
                  <selectedCatConfig.icon size={12} />
                  {selectedCatLabel}
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 hover:opacity-70"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {searchQuery && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                  }}
                >
                  <Search size={12} />"{searchQuery}"
                  <button
                    onClick={() => handleSearch('')}
                    className="ml-1 hover:opacity-70"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Results Header */}
        <div
          className="flex items-center justify-between py-3 px-4 rounded-t-xl"
          style={{
            background: theme.colors.card,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className="text-xs font-medium w-12"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Rank
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: theme.colors.foregroundMuted }}
            >
              User
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={14} style={{ color: theme.colors.foregroundMuted }} />
            <span
              className="text-xs font-medium"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {sortBy === 'followers'
                ? t('creators.sort.followers')
                : t('creators.sort.views')}
            </span>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            className="py-16 text-center rounded-b-xl"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderTop: 'none',
            }}
          >
            <Loader2
              className="w-8 h-8 mx-auto animate-spin"
              style={{ color: theme.colors.primary }}
            />
            <p
              className="mt-3 text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('creators.loading')}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredAndSortedCreators.length === 0 && (
          <div
            className="py-16 text-center rounded-b-xl"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderTop: 'none',
            }}
          >
            <Users2
              size={40}
              className="mx-auto mb-3 opacity-30"
              style={{ color: theme.colors.foregroundMuted }}
            />
            <p
              className="font-medium mb-1"
              style={{ color: theme.colors.foreground }}
            >
              {t('creators.empty.title')}
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('creators.empty.subtitle')}
            </p>
            <button
              onClick={() => {
                handleSearch('')
                handleCategoryChange('all')
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: theme.colors.primary, color: '#fff' }}
            >
              {t('creators.empty.clearFilters')}
            </button>
          </div>
        )}

        {/* Creator List */}
        {!isLoading && paginatedCreators.length > 0 && (
          <div
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderTop: 'none',
            }}
            className="rounded-b-xl overflow-hidden"
          >
            {paginatedCreators.map((creator, index) => {
              const globalRank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
              const creatorTypes =
                (creator.profile.creatorTypes as string[]) ?? []
              const catConfig = getCategoryById(creatorTypes[0])
              const accentColor = creator.profile.accentColor ?? catConfig.color

              return (
                <Link
                  key={creator.user.id}
                  to="/$username"
                  params={{ username: creator.user.username }}
                  className="flex items-center justify-between px-4 py-3 transition-all hover:bg-white/5 group"
                  style={{
                    borderBottom:
                      index < paginatedCreators.length - 1
                        ? `1px solid ${theme.colors.border}`
                        : 'none',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getRankDisplay(globalRank)}
                    </div>

                    {/* Avatar & Info */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                          style={{
                            background: creator.profile.avatar
                              ? `url(${creator.profile.avatar}) center/cover`
                              : `linear-gradient(135deg, ${accentColor}, ${catConfig.color})`,
                          }}
                        >
                          {!creator.profile.avatar &&
                            (creator.user.name ?? creator.user.username)
                              .charAt(0)
                              .toUpperCase()}
                        </div>

                        {/* Featured/Owner Badge */}
                        {(creator.profile.isFeatured ||
                          creator.user.role === 'owner') && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                creator.user.role === 'owner'
                                  ? '#fbbf24'
                                  : theme.colors.primary,
                            }}
                          >
                            {creator.user.role === 'owner' ? (
                              <Crown size={10} className="text-black" />
                            ) : (
                              <Star size={10} className="text-white" />
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-medium text-sm"
                            style={{ color: theme.colors.foreground }}
                          >
                            {creator.user.name ?? creator.user.username}
                          </span>
                          {creator.profile.badges &&
                            creator.profile.badges.length > 0 && (
                              <BadgeDisplay
                                badges={creator.profile.badges}
                                size="sm"
                                maxDisplay={2}
                              />
                            )}
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          @{creator.user.username}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: theme.colors.foreground }}
                    >
                      {(sortBy === 'followers'
                        ? creator.stats?.followers
                        : creator.stats?.profileViews) ?? 0}
                    </span>
                    <ChevronRight
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p
              className="text-xs"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredAndSortedCreators.length,
              )}{' '}
              of {filteredAndSortedCreators.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-all disabled:opacity-30"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <ChevronLeft
                  size={16}
                  style={{ color: theme.colors.foreground }}
                />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background:
                          currentPage === pageNum
                            ? theme.colors.primary
                            : 'transparent',
                        color:
                          currentPage === pageNum
                            ? '#fff'
                            : theme.colors.foreground,
                      }}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-all disabled:opacity-30"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <ChevronRight
                  size={16}
                  style={{ color: theme.colors.foreground }}
                />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
