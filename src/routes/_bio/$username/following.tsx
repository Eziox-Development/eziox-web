/**
 * Following List Page
 * Shows all users that a user follows at eziox.link/{username}/following
 */

import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
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
} from 'lucide-react'

export const Route = createFileRoute('/_bio/$username/following')({
  component: FollowingPage,
})

function FollowingPage() {
  const { username } = Route.useParams()
  const queryClient = useQueryClient()
  
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

  const { data: followingData, isLoading } = useQuery({
    queryKey: ['following', profile?.user?.id],
    queryFn: () => getFollowing({ data: { userId: profile!.user.id, limit: 50, offset: 0 } }),
    enabled: !!profile?.user?.id,
  })

  const [loadingFollow, setLoadingFollow] = useState<string | null>(null)

  const handleFollowToggle = async (targetUserId: string, currentlyFollowing: boolean) => {
    if (!isAuthenticated) return
    
    setLoadingFollow(targetUserId)
    try {
      if (currentlyFollowing) {
        await unfollowUser({ data: { targetUserId } })
      } else {
        await followUser({ data: { targetUserId } })
      }
      // Refresh data
      void queryClient.invalidateQueries({ queryKey: ['following', profile?.user?.id] })
    } finally {
      setLoadingFollow(null)
    }
  }

  const profileData = profile?.profile as { accentColor?: string } | undefined
  const accentColor = profileData?.accentColor || '#3b82f6'

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            to="/$username"
            params={{ username }}
            className="p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ color: 'var(--foreground)' }}
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              Following
            </h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              @{username} · {followingData?.total || 0} following
            </p>
          </div>
        </motion.div>

        {/* Following List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
          </div>
        ) : followingData?.following && followingData.following.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {followingData.following.map((followed, index) => (
                <motion.div
                  key={followed.user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  {/* Avatar */}
                  <Link to="/$username" params={{ username: followed.user.username }} className="shrink-0">
                    <div 
                      className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden"
                    >
                      {followed.profile?.avatar ? (
                        <img 
                          src={followed.profile.avatar} 
                          alt={followed.user.name || followed.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {(followed.user.name || followed.user.username).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <Link to="/$username" params={{ username: followed.user.username }} className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                        {followed.user.name || followed.user.username}
                      </span>
                      {followed.user.role === 'owner' && (
                        <Crown size={14} className="text-yellow-500 shrink-0" />
                      )}
                      {followed.user.role === 'admin' && (
                        <BadgeCheck size={14} className="text-blue-500 shrink-0" />
                      )}
                      {followed.user.role === 'premium' && (
                        <Sparkles size={14} className="text-purple-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                      @{followed.user.username}
                    </p>
                  </Link>

                  {/* Follow Button */}
                  {isAuthenticated && !followed.isSelf && (
                    <motion.button
                      onClick={() => handleFollowToggle(followed.user.id, followed.isFollowing)}
                      disabled={loadingFollow === followed.user.id}
                      className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                      style={{
                        background: followed.isFollowing 
                          ? 'var(--background-secondary)' 
                          : accentColor,
                        color: followed.isFollowing ? 'var(--foreground)' : 'white',
                        border: followed.isFollowing ? '1px solid var(--border)' : 'none',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loadingFollow === followed.user.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : followed.isFollowing ? (
                        <span className="flex items-center gap-1">
                          <UserMinus size={14} />
                          Following
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <UserPlus size={14} />
                          Follow
                        </span>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
            <p style={{ color: 'var(--foreground-muted)' }}>Not following anyone yet</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
