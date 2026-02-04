import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  getFollowersFn,
  getFollowingFn,
  followUserFn,
  unfollowUserFn,
} from '@/server/functions/follows'
import {
  X,
  Users,
  Loader2,
  UserPlus,
  UserMinus,
  Crown,
  BadgeCheck,
  Search,
  UserCheck,
  Heart,
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
  accentColor = '#8b5cf6',
}: FollowModalProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const getFollowers = useServerFn(getFollowersFn)
  const getFollowing = useServerFn(getFollowingFn)
  const followUser = useServerFn(followUserFn)
  const unfollowUser = useServerFn(unfollowUserFn)

  const {
    data: followersData,
    isLoading: followersLoading,
  } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => getFollowers({ data: { userId, limit: 50, offset: 0 } }),
    enabled: isOpen && activeTab === 'followers',
    refetchInterval: 30000,
  })

  const {
    data: followingData,
    isLoading: followingLoading,
  } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => getFollowing({ data: { userId, limit: 50, offset: 0 } }),
    enabled: isOpen && activeTab === 'following',
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setSearchQuery('')
    }
  }, [isOpen, initialTab])

  const handleFollowToggle = async (
    targetUserId: string,
    isFollowing: boolean,
  ) => {
    if (!currentUserId) return

    try {
      if (isFollowing) {
        await unfollowUser({ data: { targetUserId } })
      } else {
        await followUser({ data: { targetUserId } })
      }

      await queryClient.invalidateQueries({ queryKey: ['followers', userId] })
      await queryClient.invalidateQueries({ queryKey: ['following', userId] })
      await queryClient.invalidateQueries({ queryKey: ['isFollowing'] })
      await queryClient.invalidateQueries({
        queryKey: ['publicProfile', username],
      })
    } catch (error) {
      console.error('Follow toggle error:', error)
    }
  }

  const filterUsers = (
    users: Array<{
      user: {
        id: string
        username: string
        name: string | null
        role: string | null
      }
      profile: { avatar: string | null; bio: string | null } | null
      isFollowing: boolean
      isSelf: boolean
    }>,
  ) => {
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase()
    return users.filter((item) => {
      const user = item.user
      const name = user?.name?.toLowerCase() || ''
      const uname = user?.username?.toLowerCase() || ''
      const bio = item.profile?.bio?.toLowerCase() || ''

      return name.includes(query) || uname.includes(query) || bio.includes(query)
    })
  }

  const currentData =
    activeTab === 'followers'
      ? followersData?.followers
      : followingData?.following
  const isLoading =
    activeTab === 'followers' ? followersLoading : followingLoading
  const filteredUsers = currentData ? filterUsers(currentData) : []

  const followersCount = followersData?.total || 0
  const followingCount = followingData?.total || 0

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#1e1e2e] to-[#16161f] border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative shrink-0 px-6 pt-6 pb-4 border-b border-white/10">
            {/* Decorative gradient line */}
            <div 
              className="absolute top-0 left-6 right-6 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)` }}
            />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-xl border border-white/10"
                  style={{ background: `${accentColor}15` }}
                >
                  <Heart className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    @{username}
                  </h2>
                  <p className="text-sm text-white/40">
                    {t('followModal.connections')}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/5">
              <button
                onClick={() => setActiveTab('followers')}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'followers'
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {activeTab === 'followers' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: accentColor }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('followModal.followers')}
                  <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                    activeTab === 'followers' ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {followersCount}
                  </span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('following')}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'following'
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {activeTab === 'following' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: accentColor }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  {t('followModal.following')}
                  <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                    activeTab === 'following' ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {followingCount}
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="shrink-0 px-6 py-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('followModal.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2
                  className="w-8 h-8 animate-spin mb-3"
                  style={{ color: accentColor }}
                />
                <p className="text-sm text-white/40">{t('followModal.loading')}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div
                  className="p-4 rounded-2xl mb-4"
                  style={{ background: `${accentColor}10` }}
                >
                  <Users className="w-8 h-8" style={{ color: accentColor }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery
                    ? t('followModal.noResults')
                    : t(`followModal.no${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}
                </h3>
                <p className="text-sm text-white/40 text-center max-w-sm">
                  {searchQuery
                    ? t('followModal.noUsersMatch', { query: searchQuery })
                    : t(`followModal.no${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}Desc`)}
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.02 }}
                        className="group p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <Link
                            to="/$username"
                            params={{ username: user.username }}
                            onClick={onClose}
                            className="shrink-0"
                          >
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/10 group-hover:ring-white/20 transition-all"
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
                                <span className="text-white font-semibold text-base">
                                  {(user.name || user.username).charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </Link>

                          {/* User Info */}
                          <Link
                            to="/$username"
                            params={{ username: user.username }}
                            onClick={onClose}
                            className="flex-1 min-w-0"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-white truncate text-sm">
                                {user.name || user.username}
                              </span>
                              {user.role === 'owner' && (
                                <Crown className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                              )}
                              {user.role === 'admin' && (
                                <BadgeCheck className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                              )}
                            </div>
                            <p className="text-xs text-white/40 truncate">
                              @{user.username}
                            </p>
                          </Link>

                          {/* Follow Button */}
                          {!isCurrentUser && currentUserId && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleFollowToggle(user.id, isFollowing)}
                              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                isFollowing
                                  ? 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                                  : 'text-white'
                              }`}
                              style={!isFollowing ? { background: accentColor } : undefined}
                            >
                              {isFollowing ? (
                                <>
                                  <UserMinus className="w-3.5 h-3.5" />
                                  {t('followModal.unfollow')}
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  {t('followModal.follow')}
                                </>
                              )}
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
