/**
 * Following List Page - Modern Design
 * Shows all users that a user follows at eziox.link/{username}/following
 * Real-time updates, modern UI/UX, dynamic page title
 */

import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPublicProfileFn } from '@/server/functions/users'
import { getFollowingFn, followUserFn, unfollowUserFn } from '@/server/functions/follows'
import {
  ArrowLeft,
  Users,
  Loader2,
  UserPlus,
  UserMinus,
  Crown,
  BadgeCheck,
  Sparkles,
  RefreshCw,
  Search,
  Eye,
} from 'lucide-react'

export const Route = createFileRoute('/_bio/$username/following')({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} is Following | Eziox` },
      { name: 'description', content: `See who @${params.username} follows on Eziox` },
      { property: 'og:title', content: `@${params.username} is Following | Eziox` },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: FollowingPage,
})

function FollowingPage() {
  const { username } = Route.useParams()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Get currentUser from parent layout
  const routerState = useRouterState()
  const bioMatch = routerState.matches.find((m: { routeId: string }) => m.routeId === '/_bio')
  const currentUser = (bioMatch?.loaderData as { currentUser?: { id: string; username: string } } | undefined)?.currentUser
  const isAuthenticated = !!currentUser

  const getProfile = useServerFn(getPublicProfileFn)
  const getFollowing = useServerFn(getFollowingFn)
  const followUser = useServerFn(followUserFn)
  const unfollowUser = useServerFn(unfollowUserFn)

  const { data: profile } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => getProfile({ data: { username } }),
  })

  const { data: followingData, isLoading, refetch } = useQuery({
    queryKey: ['following', profile?.user?.id],
    queryFn: () => getFollowing({ data: { userId: profile!.user.id, limit: 100, offset: 0 } }),
    enabled: !!profile?.user?.id,
    refetchInterval: 30000, // Real-time: refresh every 30s
  })

  const [loadingFollow, setLoadingFollow] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleFollowToggle = async (targetUserId: string, currentlyFollowing: boolean) => {
    if (!isAuthenticated) return
    
    setLoadingFollow(targetUserId)
    try {
      if (currentlyFollowing) {
        await unfollowUser({ data: { targetUserId } })
      } else {
        await followUser({ data: { targetUserId } })
      }
      void queryClient.invalidateQueries({ queryKey: ['following', profile?.user?.id] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile', username] })
    } finally {
      setLoadingFollow(null)
    }
  }

  const profileData = profile?.profile as { accentColor?: string; avatar?: string } | undefined
  const accentColor = profileData?.accentColor || '#3b82f6'

  // Filter following by search query
  const filteredFollowing = followingData?.following?.filter(followed => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      followed.user.username.toLowerCase().includes(query) ||
      (followed.user.name?.toLowerCase().includes(query) ?? false)
    )
  }) || []

  // Dynamic page title update
  useEffect(() => {
    if (profile?.user) {
      document.title = `@${profile.user.username} is Following | Eziox`
    }
  }, [profile?.user])

  return (
    <div 
      className="min-h-screen"
      style={{ background: 'var(--background)' }}
    >
      {/* Gradient Header Background */}
      <div 
        className="absolute top-0 left-0 right-0 h-64 opacity-30"
        style={{ 
          background: `linear-gradient(180deg, ${accentColor}40 0%, transparent 100%)`,
          pointerEvents: 'none'
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 mb-6 backdrop-blur-xl"
          style={{ 
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}
        >
          {/* Top Row: Back + Profile Info */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/$username"
              params={{ username }}
              className="p-2.5 rounded-xl transition-all hover:scale-105"
              style={{ 
                background: 'var(--background-secondary)',
                color: 'var(--foreground)'
              }}
            >
              <ArrowLeft size={20} />
            </Link>
            
            {/* Profile Mini Card */}
            <Link 
              to="/$username" 
              params={{ username }}
              className="flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all hover:bg-white/5"
              style={{ background: 'var(--background-secondary)' }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ring-2"
                style={{ 
                  background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
                }}
              >
                {profileData?.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt={profile?.user?.name || username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {(profile?.user?.name || username).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold truncate" style={{ color: 'var(--foreground)' }}>
                    {profile?.user?.name || username}
                  </span>
                  {profile?.user?.role === 'owner' && <Crown size={14} className="text-yellow-500" />}
                  {profile?.user?.role === 'admin' && <BadgeCheck size={14} className="text-blue-500" />}
                </div>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{username}</p>
              </div>
            </Link>

            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl transition-all"
              style={{ 
                background: 'var(--background-secondary)',
                color: 'var(--foreground-muted)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </motion.button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-xl"
                style={{ background: `${accentColor}20` }}
              >
                <UserPlus size={18} style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {followingData?.total?.toLocaleString() || 0}
                </p>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  Following
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--background-secondary)' }}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                Live
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--foreground-muted)' }}
            />
            <input
              type="text"
              placeholder="Search following..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
              style={{ 
                background: 'var(--background-secondary)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            />
          </div>
        </motion.div>

        {/* Following List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={32} style={{ color: accentColor }} />
            </motion.div>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Loading following...
            </p>
          </div>
        ) : filteredFollowing.length > 0 ? (
          <div className="space-y-3">
            {/* Results Count */}
            {searchQuery && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm px-2 mb-4"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {filteredFollowing.length} result{filteredFollowing.length !== 1 ? 's' : ''} for "{searchQuery}"
              </motion.p>
            )}

            <AnimatePresence mode="popLayout">
              {filteredFollowing.map((followed, index) => (
                <motion.div
                  key={followed.user.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 30 }}
                  className="group rounded-2xl p-4 transition-all hover:scale-[1.01]"
                  style={{ 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar with Ring */}
                    <Link to="/$username" params={{ username: followed.user.username }} className="shrink-0">
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-offset-2 ring-blue-500/30"
                          style={{ 
                            background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
                          }}
                        >
                          {followed.profile?.avatar ? (
                            <img 
                              src={followed.profile.avatar} 
                              alt={followed.user.name || followed.user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-xl">
                              {(followed.user.name || followed.user.username).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2" style={{ borderColor: 'var(--card)' }} />
                      </motion.div>
                    </Link>

                    {/* User Info */}
                    <Link to="/$username" params={{ username: followed.user.username }} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {followed.user.name || followed.user.username}
                        </span>
                        {followed.user.role === 'owner' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10">
                            <Crown size={12} className="text-yellow-500" />
                            <span className="text-xs text-yellow-500 font-medium">Owner</span>
                          </div>
                        )}
                        {followed.user.role === 'admin' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10">
                            <BadgeCheck size={12} className="text-blue-500" />
                            <span className="text-xs text-blue-500 font-medium">Admin</span>
                          </div>
                        )}
                        {followed.user.role === 'premium' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10">
                            <Sparkles size={12} className="text-purple-500" />
                            <span className="text-xs text-purple-500 font-medium">Pro</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                        @{followed.user.username}
                      </p>
                      {followed.profile?.bio && (
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--foreground-muted)' }}>
                          {followed.profile.bio}
                        </p>
                      )}
                    </Link>

                    {/* Follow Button */}
                    {isAuthenticated && !followed.isSelf && (
                      <motion.button
                        onClick={() => handleFollowToggle(followed.user.id, followed.isFollowing)}
                        disabled={loadingFollow === followed.user.id}
                        className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: followed.isFollowing 
                            ? 'var(--background-secondary)' 
                            : `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
                          color: followed.isFollowing ? 'var(--foreground)' : 'white',
                          border: followed.isFollowing ? '1px solid var(--border)' : 'none',
                          boxShadow: followed.isFollowing ? 'none' : `0 4px 12px ${accentColor}40`
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {loadingFollow === followed.user.id ? (
                          <Loader2 size={16} className="animate-spin mx-auto" />
                        ) : followed.isFollowing ? (
                          <span className="flex items-center gap-1.5">
                            <UserMinus size={15} />
                            Following
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <UserPlus size={15} />
                            Follow
                          </span>
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-3xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: `${accentColor}10` }}
            >
              <Users size={36} style={{ color: accentColor }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              {searchQuery ? 'No Results Found' : 'Not Following Anyone'}
            </h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              {searchQuery 
                ? `No users match "${searchQuery}"`
                : `@${username} isn't following anyone yet.`
              }
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 pb-8"
        >
          <Link
            to="/$username"
            params={{ username }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
            style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
          >
            <Eye size={14} />
            View @{username}'s Profile
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
