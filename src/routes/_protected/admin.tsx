/**
 * Admin Panel - Badge Management
 * Only accessible by owner/admin roles
 */

import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getAllUsersWithBadgesFn, assignBadgeFn, removeBadgeFn } from '@/server/functions/badges'
import { BADGE_LIST, type BadgeId } from '@/lib/badges'
import { BadgeDisplay } from '@/components/ui/BadgeDisplay'
import {
  Shield, Search, Loader2, Plus, X, Check, Users,
  ChevronDown, Award, AlertCircle,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export const Route = createFileRoute('/_protected/admin')({
  beforeLoad: async ({ context }) => {
    const { currentUser } = context as { currentUser?: { role?: string } }
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
      throw redirect({ to: '/profile' })
    }
  },
  head: () => ({
    meta: [
      { title: 'Admin Panel | Eziox' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminPage,
})

function AdminPage() {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const getAllUsers = useServerFn(getAllUsersWithBadgesFn)
  const assignBadge = useServerFn(assignBadgeFn)
  const removeBadge = useServerFn(removeBadgeFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers({ data: { limit: 100 } }),
  })

  const users = usersData?.users || []
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  const handleAssignBadge = async (userId: string, badgeId: BadgeId) => {
    setIsAssigning(true)
    try {
      const result = await assignBadge({ data: { userId, badgeId } })
      setActionResult({ type: 'success', message: result.message })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (e) {
      setActionResult({ type: 'error', message: (e as { message?: string }).message || 'Failed to assign badge' })
    } finally {
      setIsAssigning(false)
      setTimeout(() => setActionResult(null), 3000)
    }
  }

  const handleRemoveBadge = async (userId: string, badgeId: BadgeId) => {
    setIsAssigning(true)
    try {
      const result = await removeBadge({ data: { userId, badgeId } })
      setActionResult({ type: 'success', message: result.message })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (e) {
      setActionResult({ type: 'error', message: (e as { message?: string }).message || 'Failed to remove badge' })
    } finally {
      setIsAssigning(false)
      setTimeout(() => setActionResult(null), 3000)
    }
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
    return null
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence>
          {actionResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 ${
                actionResult.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {actionResult.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span className="text-white font-medium">{actionResult.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Admin Panel</h1>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Manage user badges</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <Users size={20} style={{ color: 'var(--foreground-muted)' }} />
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Users</span>
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>({users.length})</span>
              </div>

              <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--primary)' }} />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center" style={{ color: 'var(--foreground-muted)' }}>
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                        selectedUser === user.id ? 'bg-white/5' : 'hover:bg-white/5'
                      }`}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          background: user.avatar
                            ? `url(${user.avatar}) center/cover`
                            : 'linear-gradient(135deg, var(--primary), var(--accent))',
                        }}
                      >
                        {!user.avatar && (user.name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                            {user.name || user.username}
                          </span>
                          {user.badges.length > 0 && (
                            <BadgeDisplay badges={user.badges} size="sm" maxDisplay={3} />
                          )}
                        </div>
                        <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                          @{user.username} · {user.role}
                        </p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${selectedUser === user.id ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--foreground-muted)' }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div
              className="rounded-2xl overflow-hidden sticky top-28"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <Award size={20} style={{ color: 'var(--foreground-muted)' }} />
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Badge Manager</span>
              </div>

              {selectedUser ? (
                <div className="p-4">
                  {(() => {
                    const user = users.find(u => u.id === selectedUser)
                    if (!user) return null

                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                              background: user.avatar
                                ? `url(${user.avatar}) center/cover`
                                : 'linear-gradient(135deg, var(--primary), var(--accent))',
                            }}
                          >
                            {!user.avatar && (user.name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{user.name || user.username}</p>
                            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{user.username}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {BADGE_LIST.map((badge) => {
                            const hasBadge = user.badges.includes(badge.id)
                            return (
                              <div
                                key={badge.id}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'var(--background-secondary)' }}
                              >
                                {(() => {
                                  const IconComponent = LucideIcons[badge.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; style?: React.CSSProperties }>
                                  return IconComponent ? <IconComponent size={20} style={{ color: hasBadge ? badge.color : 'var(--foreground-muted)' }} /> : null
                                })()}
                                <div className="flex-1">
                                  <p className="text-sm font-medium" style={{ color: hasBadge ? badge.color : 'var(--foreground)' }}>
                                    {badge.name}
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{badge.rarity}</p>
                                </div>
                                <button
                                  onClick={() => hasBadge
                                    ? handleRemoveBadge(user.id, badge.id)
                                    : handleAssignBadge(user.id, badge.id)
                                  }
                                  disabled={isAssigning}
                                  className={`p-2 rounded-lg transition-colors ${
                                    hasBadge ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-green-500/20 hover:bg-green-500/30'
                                  }`}
                                >
                                  {isAssigning ? (
                                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--foreground-muted)' }} />
                                  ) : hasBadge ? (
                                    <X size={16} className="text-red-500" />
                                  ) : (
                                    <Plus size={16} className="text-green-500" />
                                  )}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Award size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
                  <p style={{ color: 'var(--foreground-muted)' }}>Select a user to manage badges</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
