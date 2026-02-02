import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getTopUsersFn } from '@/server/functions/users'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { useTheme } from '@/components/layout/ThemeProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Users2,
  TrendingUp,
  Activity,
  Eye,
  Heart,
  ArrowRight,
  Loader2,
  Sparkles,
  Flame,
  Zap,
  MousePointerClick,
  UserPlus,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const ITEMS_PER_PAGE = 20

export const Route = createFileRoute('/_public/leaderboard')({
  head: () => ({
    meta: [
      { title: 'Leaderboard | Eziox' },
      {
        name: 'description',
        content: 'Top creators on Eziox ranked by engagement and activity',
      },
      { property: 'og:title', content: 'Leaderboard | Eziox' },
      {
        property: 'og:description',
        content: "See who's leading the pack on Eziox",
      },
    ],
  }),
  component: LeaderboardPage,
})

export function LeaderboardPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [currentPage, setCurrentPage] = useState(1)

  const getTopUsers = useServerFn(getTopUsersFn)
  const getPlatformStats = useServerFn(getPlatformStatsFn)

  const {
    data: allUsers,
    isLoading,
    dataUpdatedAt,
    error: usersError,
  } = useQuery({
    queryKey: ['leaderboard-all'],
    queryFn: () => getTopUsers({ data: { limit: 100 } }),
    refetchInterval: 60000, // 1 minute instead of 30 seconds
    staleTime: 300000, // 5 minutes - consider data fresh for 5 minutes
    gcTime: 600000, // 10 minutes - keep in cache for 10 minutes
  })

  const { data: platformStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => getPlatformStats(),
    refetchInterval: 120000, // 2 minutes for stats
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  })

  const totalPages = useMemo(() => {
    if (!allUsers) return 1
    return Math.ceil(allUsers.length / ITEMS_PER_PAGE)
  }, [allUsers])

  const paginatedUsers = useMemo(() => {
    if (!allUsers) return []
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return allUsers.slice(start, start + ITEMS_PER_PAGE)
  }, [allUsers, currentPage])

  const top3 = useMemo(() => {
    if (!allUsers || !Array.isArray(allUsers)) return []
    return allUsers.slice(0, 3)
  }, [allUsers])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  const stats = {
    totalUsers: platformStats?.totalUsers || 0,
    totalScore: platformStats?.totalScore || 0,
    activeToday: platformStats?.activeUsers24h || 0,
    newThisWeek: platformStats?.newUsersThisWeek || 0,
  }

  const medalColors = {
    1: {
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.15)',
      gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    },
    2: {
      color: '#9ca3af',
      bg: 'rgba(156, 163, 175, 0.15)',
      gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)',
    },
    3: {
      color: '#cd7f32',
      bg: 'rgba(205, 127, 50, 0.15)',
      gradient: 'linear-gradient(135deg, #cd7f32, #b8860b)',
    },
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { ...medalColors[1], icon: Crown }
    if (rank === 2) return { ...medalColors[2], icon: Medal }
    if (rank === 3) return { ...medalColors[3], icon: Medal }
    return {
      color: theme.colors.foregroundMuted,
      bg: 'transparent',
      gradient: '',
      icon: null,
    }
  }

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Trophy size={16} style={{ color: theme.colors.primary }} />
            </motion.div>
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.foreground }}
            >
              {t('leaderboard.badge')}
            </span>
            <div className="flex items-center gap-1">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs" style={{ color: '#22c55e' }}>
                {t('leaderboard.live')}
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            {t('leaderboard.hero.title')}{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              }}
            >
              {t('leaderboard.hero.titleHighlight')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg max-w-2xl mx-auto mb-2"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('leaderboard.hero.subtitle')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm flex items-center justify-center gap-2"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <Activity size={14} style={{ color: '#22c55e' }} />
            {t('leaderboard.hero.updated')}{' '}
            {dataUpdatedAt
              ? new Date(dataUpdatedAt).toLocaleTimeString()
              : 'just now'}
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {[
            {
              label: t('leaderboard.stats.totalCreators'),
              value: stats.totalUsers,
              icon: Users2,
              color: theme.colors.primary,
              suffix: '+',
            },
            {
              label: t('leaderboard.stats.totalPoints'),
              value: stats.totalScore,
              icon: Star,
              color: theme.colors.accent,
              suffix: '',
            },
            {
              label: t('leaderboard.stats.activeToday'),
              value: stats.activeToday,
              icon: Flame,
              color: '#ef4444',
              suffix: '',
            },
            {
              label: t('leaderboard.stats.newThisWeek'),
              value: stats.newThisWeek,
              icon: TrendingUp,
              color: '#22c55e',
              suffix: '+',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative p-5 overflow-hidden group"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                backdropFilter:
                  theme.effects.cardStyle === 'glass'
                    ? 'blur(20px)'
                    : undefined,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${stat.color}15, transparent 70%)`,
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-50"
                style={{
                  background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                }}
              />
              <div className="relative flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
                <div>
                  <p
                    className="text-2xl lg:text-3xl font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Top 3 Podium */}
        {top3.length > 0 && currentPage === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, #fbbf24, #f59e0b)`,
                }}
              >
                <Award size={20} className="text-white" />
              </div>
              <h2
                className="text-2xl font-bold"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {t('leaderboard.podium.title')}
              </h2>
            </div>

            {/* Podium Layout: 2nd - 1st - 3rd */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 items-end max-w-4xl mx-auto">
              {[1, 0, 2].map((idx) => {
                const user = top3[idx]
                if (!user) return <div key={idx} />
                const rank = idx + 1
                const rankStyle = getRankStyle(rank)
                const isFirst = rank === 1
                const isSecond = rank === 2
                const heights = {
                  1: 'min-h-[320px]',
                  2: 'min-h-[280px]',
                  3: 'min-h-[260px]',
                }

                return (
                  <motion.div
                    key={user.user.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + idx * 0.1 }}
                    className={
                      isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3'
                    }
                  >
                    <Link
                      to="/$username"
                      params={{ username: user.user.username }}
                    >
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`relative overflow-hidden group ${heights[rank as keyof typeof heights]}`}
                        style={{
                          background: isFirst
                            ? `linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.05))`
                            : theme.effects.cardStyle === 'glass'
                              ? `${theme.colors.card}90`
                              : theme.colors.card,
                          border: `2px solid ${rankStyle.color}${isFirst ? '' : '60'}`,
                          borderRadius: cardRadius,
                          backdropFilter:
                            theme.effects.cardStyle === 'glass'
                              ? 'blur(20px)'
                              : undefined,
                          boxShadow: isFirst
                            ? `0 20px 50px rgba(251, 191, 36, 0.2)`
                            : undefined,
                        }}
                      >
                        {isFirst && (
                          <div
                            className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
                            style={{ background: '#fbbf24' }}
                          />
                        )}

                        <div className="relative p-6 text-center h-full flex flex-col justify-center">
                          {isFirst && (
                            <motion.div
                              animate={{ rotate: [0, 5, -5, 0], y: [0, -3, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                              className="mb-3"
                            >
                              <Crown
                                size={36}
                                style={{ color: '#fbbf24' }}
                                className="mx-auto"
                              />
                            </motion.div>
                          )}

                          <div className="relative inline-block mx-auto mb-4">
                            <div
                              className="absolute inset-0 rounded-full blur-lg opacity-50"
                              style={{ background: rankStyle.gradient }}
                            />
                            <Avatar
                              className={`${isFirst ? 'w-28 h-28' : 'w-20 h-20'} ring-4 relative`}
                              style={
                                {
                                  '--tw-ring-color': rankStyle.color,
                                } as React.CSSProperties
                              }
                            >
                              <AvatarImage
                                src={user.profile?.avatar || undefined}
                              />
                              <AvatarFallback
                                className={`${isFirst ? 'text-3xl' : 'text-2xl'} font-bold`}
                                style={{
                                  background: rankStyle.gradient,
                                  color: 'white',
                                }}
                              >
                                {(user.user.name || user.user.username)
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${isFirst ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-sm'} rounded-full flex items-center justify-center font-bold`}
                              style={{
                                background: rankStyle.gradient,
                                color: rank === 1 ? '#000' : '#fff',
                                boxShadow: `0 4px 15px ${rankStyle.color}60`,
                              }}
                            >
                              {rank}
                            </div>
                          </div>

                          <h3
                            className={`${isFirst ? 'text-xl' : 'text-lg'} font-bold truncate mb-1`}
                            style={{ color: theme.colors.foreground }}
                          >
                            {user.user.name || user.user.username}
                          </h3>
                          <p
                            className="text-sm truncate mb-3"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            @{user.user.username}
                          </p>

                          <div
                            className={`${isFirst ? 'text-3xl' : 'text-2xl'} font-bold`}
                            style={{ color: rankStyle.color }}
                          >
                            {(user.stats?.score || 0).toLocaleString()}
                          </div>
                          <p
                            className="text-sm"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {t('leaderboard.podium.points')}
                          </p>

                          {user.profile?.badges &&
                            user.profile.badges.length > 0 && (
                              <div className="mt-3 flex justify-center">
                                <BadgeDisplay
                                  badges={user.profile.badges}
                                  size="sm"
                                  maxDisplay={3}
                                />
                              </div>
                            )}
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Full Rankings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="overflow-hidden"
            style={{
              background:
                theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}90`
                  : theme.colors.card,
              backdropFilter:
                theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            {/* Header */}
            <div
              className="p-5 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}20` }}
                >
                  <Target size={20} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <h2
                    className="font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('leaderboard.rankings.title')}
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {allUsers?.length || 0}{' '}
                    {t('leaderboard.rankings.competing')}
                  </p>
                </div>
              </div>
              <Link to="/creators">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <Users2 size={16} />
                  {t('leaderboard.rankings.viewAllCreators')}
                </motion.button>
              </Link>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="p-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}20` }}
                >
                  <Loader2
                    className="w-6 h-6"
                    style={{ color: theme.colors.primary }}
                  />
                </motion.div>
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {t('leaderboard.loading')}
                </p>
              </div>
            ) : usersError ? (
              <div className="p-16 text-center">
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}15` }}
                >
                  <Trophy
                    size={48}
                    style={{ color: theme.colors.primary, opacity: 0.5 }}
                  />
                </div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  Error Loading Leaderboard
                </h3>
                <p
                  className="mb-6"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Please try again later.
                </p>
              </div>
            ) : !allUsers || allUsers.length === 0 ? (
              <div className="p-16 text-center">
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}15` }}
                >
                  <Trophy
                    size={48}
                    style={{ color: theme.colors.primary, opacity: 0.5 }}
                  />
                </div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  {t('leaderboard.empty.title')}
                </h3>
                <p
                  className="mb-6"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t('leaderboard.empty.subtitle')}
                </p>
                <Link to="/sign-up">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      boxShadow:
                        glowOpacity > 0
                          ? `0 15px 40px ${theme.colors.primary}40`
                          : undefined,
                    }}
                  >
                    <Sparkles size={20} />
                    {t('leaderboard.empty.cta')}
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div style={{ borderColor: theme.colors.border }}>
                {paginatedUsers.map((user, index) => {
                  const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                  const rankStyle = getRankStyle(rank)
                  const RankIcon = rankStyle.icon
                  const isTop3 = rank <= 3

                  return (
                    <motion.div
                      key={user.user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.01 }}
                      style={{
                        borderBottom:
                          index < paginatedUsers.length - 1
                            ? `1px solid ${theme.colors.border}`
                            : undefined,
                      }}
                    >
                      <Link
                        to="/$username"
                        params={{ username: user.user.username }}
                        className="flex items-center gap-4 p-4 transition-all group hover:bg-opacity-50"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            theme.colors.backgroundSecondary)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'transparent')
                        }
                      >
                        {/* Rank */}
                        <div className="w-12 text-center">
                          {RankIcon ? (
                            <div
                              className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center"
                              style={{ background: rankStyle.bg }}
                            >
                              <RankIcon
                                size={20}
                                style={{ color: rankStyle.color }}
                              />
                            </div>
                          ) : (
                            <span
                              className="text-lg font-bold"
                              style={{ color: theme.colors.foregroundMuted }}
                            >
                              #{rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="relative">
                          <Avatar
                            className={`w-12 h-12 ${isTop3 ? 'ring-2' : ''}`}
                            style={
                              {
                                '--tw-ring-color': isTop3
                                  ? rankStyle.color
                                  : undefined,
                              } as React.CSSProperties
                            }
                          >
                            <AvatarImage
                              src={user.profile?.avatar || undefined}
                            />
                            <AvatarFallback
                              style={{
                                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                                color: 'white',
                                fontWeight: 700,
                              }}
                            >
                              {(user.user.name || user.user.username)
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {user.user.role === 'admin' && (
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{
                                background:
                                  'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                border: `2px solid ${theme.colors.background}`,
                              }}
                            >
                              <Crown size={10} className="text-white" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-semibold"
                              style={{ color: theme.colors.foreground }}
                            >
                              {user.user.name || user.user.username}
                            </span>
                            {user.profile?.badges &&
                              user.profile.badges.length > 0 && (
                                <BadgeDisplay
                                  badges={user.profile.badges}
                                  size="sm"
                                  maxDisplay={3}
                                />
                              )}
                            {isTop3 && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  background: rankStyle.bg,
                                  color: rankStyle.color,
                                }}
                              >
                                Top {rank}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-sm"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            @{user.user.username}
                          </p>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <p
                            className="font-bold text-lg"
                            style={{
                              color: isTop3
                                ? rankStyle.color
                                : theme.colors.primary,
                            }}
                          >
                            {(user.stats?.score || 0).toLocaleString()}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {t('leaderboard.podium.points')}
                          </p>
                        </div>

                        {/* Arrow */}
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ x: 3 }}
                        >
                          <ArrowRight
                            size={18}
                            style={{ color: theme.colors.foregroundMuted }}
                          />
                        </motion.div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="p-4 flex items-center justify-between"
                style={{ borderTop: `1px solid ${theme.colors.border}` }}
              >
                <p
                  className="text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t('leaderboard.pagination.showing')}{' '}
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}{' '}
                  {t('leaderboard.pagination.to')}{' '}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    allUsers?.length || 0,
                  )}{' '}
                  {t('leaderboard.pagination.of')} {allUsers?.length || 0}{' '}
                  {t('leaderboard.pagination.results')}
                </p>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.foreground,
                    }}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
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
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10 h-10 rounded-lg font-medium"
                          style={{
                            background:
                              currentPage === pageNum
                                ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                                : theme.colors.backgroundSecondary,
                            color:
                              currentPage === pageNum
                                ? 'white'
                                : theme.colors.foreground,
                            border:
                              currentPage === pageNum
                                ? 'none'
                                : `1px solid ${theme.colors.border}`,
                          }}
                        >
                          {pageNum}
                        </motion.button>
                      )
                    })}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.foreground,
                    }}
                  >
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* How to Earn Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <div
            className="p-8"
            style={{
              background:
                theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}90`
                  : theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
              backdropFilter:
                theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                <Zap size={20} className="text-white" />
              </div>
              <h3
                className="text-xl font-bold"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {t('leaderboard.earnPoints.title')}
              </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Eye,
                  label: t('leaderboard.earnPoints.profileViews'),
                  points: '+1',
                  desc: t('leaderboard.earnPoints.perView'),
                  color: theme.colors.primary,
                },
                {
                  icon: MousePointerClick,
                  label: t('leaderboard.earnPoints.linkClicks'),
                  points: '+2',
                  desc: t('leaderboard.earnPoints.perClick'),
                  color: theme.colors.accent,
                },
                {
                  icon: Heart,
                  label: t('leaderboard.earnPoints.followers'),
                  points: '+3',
                  desc: t('leaderboard.earnPoints.perFollower'),
                  color: '#ef4444',
                },
                {
                  icon: UserPlus,
                  label: t('leaderboard.earnPoints.referrals'),
                  points: '+5',
                  desc: t('leaderboard.earnPoints.perSignup'),
                  color: '#22c55e',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="text-center p-5"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    borderRadius: cardRadius,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div
                    className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.icon size={28} style={{ color: item.color }} />
                  </div>
                  <p
                    className="font-semibold mb-1"
                    style={{ color: theme.colors.foreground }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: item.color }}
                  >
                    {item.points}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-8">
              <Link to="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    boxShadow:
                      glowOpacity > 0
                        ? `0 15px 40px ${theme.colors.primary}40`
                        : `0 10px 30px rgba(0,0,0,0.2)`,
                  }}
                >
                  <Sparkles size={20} />
                  {t('leaderboard.cta')}
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
