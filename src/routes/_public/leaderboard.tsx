import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getTopUsersFn } from '@/server/functions/users'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  Trophy, Crown, Medal, Star, Users2, TrendingUp, Activity,
  Eye, Heart, ArrowRight, Loader2, Sparkles, Flame, Zap,
  MousePointerClick, UserPlus,
} from 'lucide-react'

export const Route = createFileRoute('/_public/leaderboard')({
  head: () => ({
    meta: [
      { title: 'Leaderboard | Eziox' },
      { name: 'description', content: 'Top creators on Eziox ranked by engagement and activity' },
    ],
  }),
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const { theme } = useTheme()
  const getTopUsers = useServerFn(getTopUsersFn)
  const getPlatformStats = useServerFn(getPlatformStatsFn)

  const { data: topUsers, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getTopUsers({ data: { limit: 50 } }),
    refetchInterval: 30000,
  })

  const { data: platformStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => getPlatformStats(),
    refetchInterval: 30000,
  })

  const stats = {
    totalUsers: platformStats?.totalUsers || 0,
    totalScore: platformStats?.totalScore || 0,
    activeToday: platformStats?.activeUsers24h || 0,
    newThisWeek: platformStats?.newUsersThisWeek || 0,
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Crown }
    if (rank === 2) return { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', icon: Medal }
    if (rank === 3) return { color: '#d97706', bg: 'rgba(217, 119, 6, 0.15)', icon: Medal }
    return { color: 'var(--foreground-muted)', bg: 'transparent', icon: null }
  }

  const top3 = topUsers?.slice(0, 3) || []

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ background: theme.colors.primary }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{ background: theme.colors.accent }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
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
                <Trophy size={28} className="text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#22c55e' }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap size={12} className="text-white" />
                </motion.div>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Leaderboard</h1>
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
            { label: 'Total Creators', value: stats.totalUsers, icon: Users2, color: theme.colors.primary, bg: `${theme.colors.primary}20` },
            { label: 'Total Points', value: stats.totalScore, icon: Star, color: theme.colors.accent, bg: `${theme.colors.accent}20` },
            { label: 'Active Today', value: stats.activeToday, icon: Flame, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
            { label: 'New This Week', value: stats.newThisWeek, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative p-5 rounded-2xl overflow-hidden group"
              style={{
                background: theme.colors.card,
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
                    {stat.value.toLocaleString()}
                  </motion.p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {top3.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                <Trophy size={16} style={{ color: theme.colors.primary }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Top 3</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 items-end">
              {[1, 0, 2].map((idx) => {
                const user = top3[idx]
                if (!user) return <div key={idx} />
                const rank = idx + 1
                const rankStyle = getRankStyle(rank)
                const isFirst = rank === 1
                return (
                  <motion.div
                    key={user.user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.05 }}
                    className={isFirst ? 'order-2' : idx === 0 ? 'order-1' : 'order-3'}
                  >
                    <Link
                      to="/$username"
                      params={{ username: user.user.username }}
                      className="block rounded-2xl overflow-hidden group"
                      style={{
                        background: isFirst
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isFirst ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                      }}
                    >
                      <div className={`p-${isFirst ? '6' : '5'} text-center`}>
                        {isFirst && <Crown size={28} className="mx-auto mb-2" style={{ color: '#f59e0b' }} />}
                        <div className="relative inline-block mb-3">
                          <div
                            className={`${isFirst ? 'w-24 h-24' : 'w-20 h-20'} mx-auto rounded-xl flex items-center justify-center text-white font-bold ${isFirst ? 'text-3xl' : 'text-2xl'} overflow-hidden`}
                            style={{
                              background: user.profile?.avatar
                                ? `url(${user.profile.avatar}) center/cover`
                                : `linear-gradient(135deg, ${rankStyle.color}, #8b5cf6)`,
                              boxShadow: `0 0 0 3px ${rankStyle.color}`,
                            }}
                          >
                            {!user.profile?.avatar && (user.user.name ?? user.user.username).charAt(0).toUpperCase()}
                          </div>
                          <div
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                            style={{ background: rankStyle.color, color: rank === 1 ? 'black' : 'white' }}
                          >
                            {rank}
                          </div>
                        </div>
                        <h3 className={`${isFirst ? 'text-lg' : 'text-base'} font-bold truncate`} style={{ color: 'var(--foreground)' }}>
                          {user.user.name || user.user.username}
                        </h3>
                        <p className="text-sm truncate mb-2" style={{ color: 'var(--foreground-muted)' }}>@{user.user.username}</p>
                        <p className={`${isFirst ? 'text-2xl' : 'text-xl'} font-bold`} style={{ color: rankStyle.color }}>
                          {(user.stats?.score || 0).toLocaleString()} pts
                        </p>
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
                  <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>All Rankings</h2>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{topUsers?.length || 0} creators ranked</p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 className="w-8 h-8 mx-auto" style={{ color: 'var(--primary)' }} />
                </motion.div>
                <p className="mt-3 text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading rankings...</p>
              </div>
            ) : !topUsers || topUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${theme.colors.primary}15` }}>
                  <Trophy size={40} style={{ color: theme.colors.primary, opacity: 0.5 }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>No rankings yet</h3>
                <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>Be the first to claim the top spot!</p>
                <Link to="/sign-up">
                  <motion.button
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles size={18} />
                    Join Now
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {topUsers.map((user, index) => {
                  const rank = index + 1
                  const rankStyle = getRankStyle(rank)
                  const RankIcon = rankStyle.icon
                  return (
                    <motion.div
                      key={user.user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.02 }}
                    >
                      <Link
                        to="/$username"
                        params={{ username: user.user.username }}
                        className="flex items-center gap-4 p-4 transition-all hover:bg-white/5 group"
                      >
                        <div className="w-10 text-center">
                          {RankIcon ? (
                            <RankIcon size={20} style={{ color: rankStyle.color }} />
                          ) : (
                            <span className="text-lg font-bold" style={{ color: 'var(--foreground-muted)' }}>#{rank}</span>
                          )}
                        </div>
                        <div className="relative">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                            style={{
                              background: user.profile?.avatar
                                ? `url(${user.profile.avatar}) center/cover`
                                : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                              boxShadow: rank <= 3 ? `0 0 0 2px ${rankStyle.color}` : 'none',
                            }}
                          >
                            {!user.profile?.avatar && (user.user.name ?? user.user.username).charAt(0).toUpperCase()}
                          </div>
                          {user.user.role === 'owner' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#fbbf24', border: '2px solid var(--background)' }}>
                              <Crown size={10} className="text-black" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                              {user.user.name || user.user.username}
                            </span>
                            {user.profile?.badges && user.profile.badges.length > 0 && (
                              <BadgeDisplay badges={user.profile.badges} size="sm" maxDisplay={3} />
                            )}
                            {rank <= 3 && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: rankStyle.bg, color: rankStyle.color }}>
                                Top {rank}
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{user.user.username}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: rank <= 3 ? rankStyle.color : 'var(--primary)' }}>
                            {(user.stats?.score || 0).toLocaleString()}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>points</p>
                        </div>
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ x: 2 }}
                        >
                          <ArrowRight size={18} style={{ color: 'var(--foreground-muted)' }} />
                        </motion.div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div
            className="p-6 rounded-3xl"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                <Sparkles size={16} style={{ color: theme.colors.primary }} />
              </div>
              <h3 className="font-bold" style={{ color: theme.colors.foreground }}>How to Earn Points</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Eye, label: 'Profile Views', points: '+1 pt', color: theme.colors.primary },
                { icon: MousePointerClick, label: 'Link Clicks', points: '+2 pts', color: theme.colors.accent },
                { icon: Heart, label: 'Followers', points: '+3 pts', color: '#ef4444' },
                { icon: UserPlus, label: 'Referrals', points: '+5 pts', color: '#22c55e' },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                    <item.icon size={20} style={{ color: item.color }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>{item.label}</p>
                  <p className="text-lg font-bold" style={{ color: item.color }}>{item.points}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
