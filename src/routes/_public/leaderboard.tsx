/**
 * Leaderboard Page
 * Shows top users ranked by score, views, clicks, etc.
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getLeaderboardFn } from '@/server/functions/users'
import {
  Trophy,
  Eye,
  Link as LinkIcon,
  Users,
  Crown,
  Medal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export const Route = createFileRoute('/_public/leaderboard')({
  component: LeaderboardPage,
})

type SortBy = 'score' | 'profileViews' | 'totalLinkClicks' | 'followers'

function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>('score')
  const [page, setPage] = useState(0)
  const limit = 20

  const getLeaderboard = useServerFn(getLeaderboardFn)

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', sortBy, page],
    queryFn: () => getLeaderboard({ data: { sortBy, limit, offset: page * limit } }),
  })

  const sortOptions: { value: SortBy; label: string; icon: React.ReactNode }[] = [
    { value: 'score', label: 'Score', icon: <Trophy size={16} /> },
    { value: 'profileViews', label: 'Views', icon: <Eye size={16} /> },
    { value: 'totalLinkClicks', label: 'Clicks', icon: <LinkIcon size={16} /> },
    { value: 'followers', label: 'Followers', icon: <Users size={16} /> },
  ]

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: <Crown size={20} />, color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)' }
    if (rank === 2) return { icon: <Medal size={20} />, color: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.15)' }
    if (rank === 3) return { icon: <Medal size={20} />, color: '#CD7F32', bg: 'rgba(205, 127, 50, 0.15)' }
    return null
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy size={32} style={{ color: 'var(--primary)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              Leaderboard
            </h1>
          </div>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Top users ranked by activity and engagement
          </p>
        </motion.div>

        {/* Sort Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => { setSortBy(option.value); setPage(0) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: sortBy === option.value ? 'var(--primary)' : 'var(--card)',
                color: sortBy === option.value ? 'white' : 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Leaderboard List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : data?.users && data.users.length > 0 ? (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {data.users.map((item, index) => {
                const rank = page * limit + index + 1
                const badge = getRankBadge(rank)

                return (
                  <Link
                    key={item.user.id}
                    to="/$username"
                    params={{ username: item.user.username }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-white/5"
                  >
                    {/* Rank */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                      style={{
                        background: badge?.bg || 'var(--background-secondary)',
                        color: badge?.color || 'var(--foreground-muted)',
                      }}
                    >
                      {badge ? badge.icon : `#${rank}`}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                      style={{
                        background: item.profile?.avatar
                          ? `url(${item.profile.avatar}) center/cover`
                          : `linear-gradient(135deg, ${item.profile?.accentColor || 'var(--primary)'}, var(--accent))`,
                        color: 'white',
                      }}
                    >
                      {!item.profile?.avatar && (item.user.name?.[0] || item.user.username?.[0] || 'U').toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {item.user.name || item.user.username}
                        </span>
                        {item.user.role === 'owner' && (
                          <Crown size={14} style={{ color: '#FFD700' }} />
                        )}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        @{item.user.username}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                          {sortBy === 'score' && (item.stats?.score?.toLocaleString() || 0)}
                          {sortBy === 'profileViews' && (item.stats?.profileViews?.toLocaleString() || 0)}
                          {sortBy === 'totalLinkClicks' && (item.stats?.totalLinkClicks?.toLocaleString() || 0)}
                          {sortBy === 'followers' && (item.stats?.followers?.toLocaleString() || 0)}
                        </div>
                        <div style={{ color: 'var(--foreground-muted)' }}>
                          {sortOptions.find(o => o.value === sortBy)?.label}
                        </div>
                      </div>
                      <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Sparkles size={48} className="mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
              <p style={{ color: 'var(--foreground-muted)' }}>No users yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                Be the first to join!
              </p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {data && data.total > limit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span style={{ color: 'var(--foreground-muted)' }}>
              Page {page + 1} of {Math.ceil(data.total / limit)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * limit >= data.total}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
