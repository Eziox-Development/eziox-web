/**
 * FollowModal Component
 * Modern modal with tabs for Followers/Following
 * Features: Real-time updates, search, animations, follow/unfollow
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Link } from '@tanstack/react-router'
import { getFollowersFn, getFollowingFn, followUserFn, unfollowUserFn } from '@/server/functions/follows'
import {
  X,
  Users,
  Loader2,
  UserPlus,
  UserMinus,
  Crown,
  BadgeCheck,
  RefreshCw,
  Search,
  Eye,
} from 'lucide-react'

interface FollowModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  userId: string
  initialTab?: 'followers' | 'following'
  currentUserId?: string
  accentColor?: string
}

type TabType = 'followers' | 'following'

export function FollowModal({ 
  isOpen, 
  onClose, 
  username,
  userId,
  initialTab = 'followers',
  currentUserId,
  accentColor = '#8b5cf6'
}: FollowModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const getFollowers = useServerFn(getFollowersFn)
  const getFollowing = useServerFn(getFollowingFn)
  const followUser = useServerFn(followUserFn)
  const unfollowUser = useServerFn(unfollowUserFn)

  // Followers query
  const { data: followersData, isLoading: followersLoading, refetch: refetchFollowers } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => getFollowers({ data: { userId, limit: 50, offset: 0 } }),
    enabled: isOpen && activeTab === 'followers',
    refetchInterval: 30000,
  })

  // Following query
  const { data: followingData, isLoading: followingLoading, refetch: refetchFollowing } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => getFollowing({ data: { userId, limit: 50, offset: 0 } }),
    enabled: isOpen && activeTab === 'following',
    refetchInterval: 30000,
  })

  // Update initial tab when prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setSearchQuery('')
    }
  }, [isOpen, initialTab])

  // Handle follow/unfollow
  const handleFollowToggle = async (targetUserId: string, isFollowing: boolean) => {
    if (!currentUserId) return

    try {
      if (isFollowing) {
        await unfollowUser({ data: { targetUserId } })
      } else {
        await followUser({ data: { targetUserId } })
      }
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['followers', userId] })
      await queryClient.invalidateQueries({ queryKey: ['following', userId] })
      await queryClient.invalidateQueries({ queryKey: ['isFollowing'] })
      await queryClient.invalidateQueries({ queryKey: ['publicProfile', username] })
    } catch (error) {
      console.error('Follow toggle error:', error)
    }
  }

  // Filter users based on search
  const filterUsers = (users: Array<{
    user: { id: string; username: string; name: string | null; role: string | null }
    profile: { avatar: string | null; bio: string | null } | null
    isFollowing: boolean
    isSelf: boolean
  }>) => {
    if (!searchQuery.trim()) return users
    
    const query = searchQuery.toLowerCase()
    return users.filter(item => {
      const user = item.user
      const name = user?.name?.toLowerCase() || ''
      const username = user?.username?.toLowerCase() || ''
      const bio = item.profile?.bio?.toLowerCase() || ''
      
      return name.includes(query) || username.includes(query) || bio.includes(query)
    })
  }

  const currentData = activeTab === 'followers' ? followersData?.followers : followingData?.following
  const isLoading = activeTab === 'followers' ? followersLoading : followingLoading
  const filteredUsers = currentData ? filterUsers(currentData) : []

  const handleRefresh = () => {
    if (activeTab === 'followers') {
      void refetchFollowers()
    } else {
      void refetchFollowing()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden"
          style={{ 
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="relative p-6 pb-4"
            style={{
              background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
              borderBottom: '1px solid var(--border)'
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-white/10"
              style={{ color: 'var(--foreground)' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-2xl"
                style={{ background: `${accentColor}20` }}
              >
                <Users className="w-6 h-6" style={{ color: accentColor }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  @{username}
                </h2>
                <p className="text-sm opacity-60">
                  {activeTab === 'followers' ? 'Followers' : 'Following'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('followers')}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
                style={{
                  background: activeTab === 'followers' ? accentColor : 'transparent',
                  color: activeTab === 'followers' ? '#fff' : 'var(--foreground)',
                  opacity: activeTab === 'followers' ? 1 : 0.6,
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Followers</span>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ 
                    background: activeTab === 'followers' ? 'rgba(255,255,255,0.2)' : 'var(--background-secondary)'
                  }}>
                    {followersData?.total || 0}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('following')}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
                style={{
                  background: activeTab === 'following' ? accentColor : 'transparent',
                  color: activeTab === 'following' ? '#fff' : 'var(--foreground)',
                  opacity: activeTab === 'following' ? 1 : 0.6,
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Following</span>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ 
                    background: activeTab === 'following' ? 'rgba(255,255,255,0.2)' : 'var(--background-secondary)'
                  }}>
                    {followingData?.total || 0}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--background-secondary)' }}>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': `${accentColor}40`
                  } as React.CSSProperties}
                />
              </div>
              
              <button
                onClick={handleRefresh}
                className="p-2.5 rounded-xl border transition-all hover:bg-white/5"
                style={{ borderColor: 'var(--border)' }}
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {searchQuery && (
              <p className="text-xs opacity-60 mt-2">
                {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 280px)' }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: accentColor }} />
                <p className="text-sm opacity-60">Loading...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div 
                  className="p-4 rounded-full mb-4"
                  style={{ background: `${accentColor}15` }}
                >
                  <Users className="w-8 h-8" style={{ color: accentColor }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No results found' : `No ${activeTab} yet`}
                </h3>
                <p className="text-sm opacity-60 text-center max-w-sm">
                  {searchQuery 
                    ? `No users match "${searchQuery}"`
                    : activeTab === 'followers' 
                      ? 'This user has no followers yet'
                      : 'This user is not following anyone yet'
                  }
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((item, index) => {
                    const user = item.user
                    const profile = item.profile
                    
                    if (!user) return null

                    const isCurrentUser = currentUserId === user.id
                    const isFollowing = item.isFollowing || false

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 rounded-2xl transition-all hover:bg-white/5"
                        style={{
                          background: 'var(--background-secondary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <Link to="/$username" params={{ username: user.username }} className="shrink-0">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <div 
                                className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-offset-2 ring-blue-500/30"
                                style={{ 
                                  background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
                                }}
                              >
                                {profile?.avatar ? (
                                  <img 
                                    src={profile.avatar} 
                                    alt={user.name || user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-xl">
                                    {(user.name || user.username).charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          </Link>

                          {/* User Info */}
                          <Link to="/$username" params={{ username: user.username }} className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                                {user.name || user.username}
                              </h3>
                              
                              {user.role === 'owner' && (
                                <Crown className="w-4 h-4 shrink-0" style={{ color: '#fbbf24' }} />
                              )}
                              {user.role === 'admin' && (
                                <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: '#3b82f6' }} />
                              )}
                            </div>
                            
                            <p className="text-sm opacity-60 mb-1">@{user.username}</p>
                            
                            {profile?.bio && (
                              <p className="text-sm opacity-70 line-clamp-1">
                                {profile.bio}
                              </p>
                            )}
                          </Link>

                          {/* Follow Button */}
                          {!isCurrentUser && currentUserId && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleFollowToggle(user.id, isFollowing)}
                              className="px-4 py-2 rounded-xl font-medium transition-all shrink-0"
                              style={{
                                background: isFollowing ? 'transparent' : accentColor,
                                color: isFollowing ? 'var(--foreground)' : '#fff',
                                border: isFollowing ? '1px solid var(--border)' : 'none',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {isFollowing ? (
                                  <>
                                    <UserMinus className="w-4 h-4" />
                                    <span>Unfollow</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4" />
                                    <span>Follow</span>
                                  </>
                                )}
                              </div>
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
