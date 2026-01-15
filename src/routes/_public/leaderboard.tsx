/**
 * Leaderboard Page
 * Modern design showcasing top creators with real-time rankings
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getTopUsersFn } from '@/server/functions/users'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Users,
  TrendingUp,
  Zap,
  Eye,
  MousePointerClick,
  Heart,
  ArrowRight,
  Sparkles,
  Award,
  Flame,
} from 'lucide-react'

export const Route = createFileRoute('/_public/leaderboard')({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const getTopUsers = useServerFn(getTopUsersFn)
  const getPlatformStats = useServerFn(getPlatformStatsFn)
  
  const { data: topUsers, isLoading } = useQuery({
    queryKey: ['topUsers', 'leaderboard'],
    queryFn: () => getTopUsers({ data: { limit: 50 } }),
  })
  
  const { data: platformStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => getPlatformStats(),
  })

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} className="text-yellow-500" />
      case 2:
        return <Medal size={24} className="text-gray-400" />
      case 3:
        return <Medal size={24} className="text-amber-600" />
      default:
        return <span className="text-lg font-bold" style={{ color: 'var(--foreground-muted)' }}>#{rank}</span>
    }
  }

  
  const stats = [
    { label: 'Total Creators', value: platformStats?.totalUsers || 0, icon: Users, gradient: 'from-indigo-500 to-purple-500' },
    { label: 'Total Points', value: platformStats?.totalScore || 0, icon: Star, gradient: 'from-yellow-500 to-amber-500' },
    { label: 'Active Today', value: platformStats?.activeUsers24h || 0, icon: Flame, gradient: 'from-orange-500 to-red-500' },
    { label: 'New This Week', value: platformStats?.newUsersThisWeek || 0, icon: TrendingUp, gradient: 'from-green-500 to-emerald-500' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12), rgba(245, 158, 11, 0.08))' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Trophy className="w-10 h-10 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#22c55e' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={14} className="text-white" />
            </motion.div>
          </motion.div>
          
          <Badge variant="outline" className="mb-4">
            <Sparkles size={14} className="mr-1" />
            Live Rankings
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Creator Leaderboard
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Discover the top creators on Eziox. Earn points by growing your profile, getting clicks, and inviting friends.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card>
                <CardContent className="p-5 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}>
                    <stat.icon size={24} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {isLoading ? '-' : stat.value}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Top 3 Podium */}
        {(() => {
          if (isLoading || !topUsers || topUsers.length < 3) return null
          const first = topUsers[0]
          const second = topUsers[1]
          const third = topUsers[2]
          if (!first || !second || !third) return null
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <div className="grid grid-cols-3 gap-4 items-end">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/$username" params={{ username: second.user.username }}>
                    <Card className="hover:scale-[1.02] transition-transform">
                      <CardContent className="p-6 text-center">
                        <div className="relative inline-block mb-4">
                          <Avatar className="w-20 h-20 mx-auto ring-4 ring-gray-400">
                            <AvatarImage src={second.profile?.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-2xl font-bold">
                              {(second.user.name || second.user.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                            2
                          </div>
                        </div>
                        <h3 className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {second.user.name || second.user.username}
                        </h3>
                        <p className="text-sm truncate mb-2" style={{ color: 'var(--foreground-muted)' }}>
                          @{second.user.username}
                        </p>
                        <p className="text-xl font-bold" style={{ color: '#9ca3af' }}>
                          {second.stats?.score?.toLocaleString() || 0} pts
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Link to="/$username" params={{ username: first.user.username }}>
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                      />
                      <Card className="relative hover:scale-[1.02] transition-transform border-2 border-yellow-500/50">
                        <CardContent className="p-8 text-center">
                          <Crown size={32} className="mx-auto mb-2 text-yellow-500" />
                          <div className="relative inline-block mb-4">
                            <Avatar className="w-28 h-28 mx-auto ring-4 ring-yellow-500">
                              <AvatarImage src={first.profile?.avatar || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white text-3xl font-bold">
                                {(first.user.name || first.user.username).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                              1
                            </div>
                          </div>
                          <h3 className="text-xl font-bold truncate" style={{ color: 'var(--foreground)' }}>
                            {first.user.name || first.user.username}
                          </h3>
                          <p className="text-sm truncate mb-2" style={{ color: 'var(--foreground-muted)' }}>
                            @{first.user.username}
                          </p>
                          <p className="text-2xl font-bold text-yellow-500">
                            {first.stats?.score?.toLocaleString() || 0} pts
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link to="/$username" params={{ username: third.user.username }}>
                    <Card className="hover:scale-[1.02] transition-transform">
                      <CardContent className="p-6 text-center">
                        <div className="relative inline-block mb-4">
                          <Avatar className="w-20 h-20 mx-auto ring-4 ring-amber-600">
                            <AvatarImage src={third.profile?.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-600 text-white text-2xl font-bold">
                              {(third.user.name || third.user.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                            3
                          </div>
                        </div>
                        <h3 className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {third.user.name || third.user.username}
                        </h3>
                        <p className="text-sm truncate mb-2" style={{ color: 'var(--foreground-muted)' }}>
                          @{third.user.username}
                        </p>
                        <p className="text-xl font-bold" style={{ color: '#d97706' }}>
                          {third.stats?.score?.toLocaleString() || 0} pts
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )
        })()}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                      All Creators
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      Complete rankings by score
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {topUsers?.length || 0} creators
                  </Badge>
                </div>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {topUsers?.slice(3).map((item, index) => {
                    const rank = index + 4
                    const isOwner = item.user.role === 'admin'
                    return (
                      <motion.div
                        key={item.user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.02 }}
                      >
                        <Link
                          to="/$username"
                          params={{ username: item.user.username }}
                          className="flex items-center gap-4 p-5 transition-all hover:bg-white/5"
                        >
                          {/* Rank */}
                          <div className="w-10 text-center">
                            {getRankIcon(rank)}
                          </div>

                          {/* Avatar */}
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={item.profile?.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                              {(item.user.name || item.user.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                                {item.user.name || item.user.username}
                              </p>
                              {isOwner && <Crown size={14} className="text-amber-500" />}
                            </div>
                            <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                              @{item.user.username}
                            </p>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <p className="font-bold" style={{ color: 'var(--primary)' }}>
                              {item.stats?.score?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                              points
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && (!topUsers || topUsers.length === 0) && (
                <div className="p-12 text-center">
                  <div 
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--background-secondary)' }}
                  >
                    <Users size={40} style={{ color: 'var(--foreground-muted)' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    No creators yet
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
                    Be the first to join and claim the top spot!
                  </p>
                  <Link to="/sign-up">
                    <motion.button
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Join Now
                      <ArrowRight size={18} />
                    </motion.button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Earn Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-4">
                  <Award size={14} className="mr-1" />
                  How to Earn Points
                </Badge>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Climb the Leaderboard
                </h2>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { icon: Eye, label: 'Profile Views', points: '+1 pt', description: 'Each profile view' },
                  { icon: MousePointerClick, label: 'Link Clicks', points: '+2 pts', description: 'Each link click' },
                  { icon: Heart, label: 'Followers', points: '+3 pts', description: 'Each new follower' },
                  { icon: Users, label: 'Referrals', points: '+5 pts', description: 'Each referral' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div 
                      className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--background-secondary)' }}
                    >
                      <item.icon size={28} style={{ color: 'var(--primary)' }} />
                    </div>
                    <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {item.label}
                    </p>
                    <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                      {item.points}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
