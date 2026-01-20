import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getAllUsersWithBadgesFn, assignBadgeFn, removeBadgeFn } from '@/server/functions/badges'
import { adminSetUserTierFn } from '@/server/functions/subscriptions'
import { BADGE_LIST, type BadgeId } from '@/lib/badges'
import { BadgeDisplay } from '@/components/ui/badge-display'
import type { TierType } from '@/server/lib/stripe'
import {
  ShieldCheck, Search, Loader2, Plus, Minus, CheckCircle2, XCircle,
  Users2, Crown, Sparkles, TrendingUp, Activity, UserCheck, Filter,
  Handshake, ChevronRight, Gem, Star, Zap,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

const TIER_ICONS: Record<TierType, React.ElementType> = {
  free: Zap,
  pro: Star,
  creator: Crown,
  lifetime: Gem,
}

const TIER_COLORS: Record<TierType, { primary: string; bg: string }> = {
  free: { primary: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' },
  pro: { primary: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  creator: { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  lifetime: { primary: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
}

export const Route = createFileRoute('/_protected/admin/')({
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const getAllUsers = useServerFn(getAllUsersWithBadgesFn)
  const assignBadge = useServerFn(assignBadgeFn)
  const removeBadge = useServerFn(removeBadgeFn)
  const setUserTier = useServerFn(adminSetUserTierFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'badges' | 'tier'>('badges')

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner'

  useEffect(() => {
    if (currentUser && !isAdmin) {
      void navigate({ to: '/profile' })
    }
  }, [currentUser, isAdmin, navigate])

  const { data: usersData, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers({ data: { limit: 100 } }),
    refetchInterval: 30000,
  })

  const users = usersData?.users || []
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'owner').length,
    withBadges: users.filter(u => u.badges.length > 0).length,
    totalBadges: users.reduce((sum, u) => sum + u.badges.length, 0),
  }

  const tierMutation = useMutation({
    mutationFn: (params: { userId: string; tier: TierType }) => 
      setUserTier({ data: { userId: params.userId, tier: params.tier } }),
    onSuccess: (result) => {
      setActionResult({ type: 'success', message: result.message })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setTimeout(() => setActionResult(null), 3000)
    },
    onError: (e: { message?: string }) => {
      setActionResult({ type: 'error', message: e.message || 'Failed to update tier' })
      setTimeout(() => setActionResult(null), 3000)
    },
  })

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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10" style={{ color: 'var(--primary)' }} />
        </motion.div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))' }}
            animate={{ boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 0 20px rgba(239, 68, 68, 0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldCheck size={40} style={{ color: '#ef4444' }} />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Access Restricted</h1>
          <p className="text-lg mb-6" style={{ color: 'var(--foreground-muted)' }}>
            This area requires elevated privileges.
          </p>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <span style={{ color: 'var(--foreground-muted)' }}>Current role:</span>
            <span className="font-mono font-semibold" style={{ color: 'var(--primary)' }}>{currentUser.role || 'user'}</span>
          </div>
        </motion.div>
      </div>
    )
  }

  const selectedUserData = users.find(u => u.id === selectedUser)

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(139, 92, 246, 0.08)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'rgba(236, 72, 153, 0.06)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <AnimatePresence>
        {actionResult && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl flex items-center gap-3"
            style={{
              background: actionResult.type === 'success'
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            {actionResult.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span className="text-white font-medium">{actionResult.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Crown size={28} className="text-white" />
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                  animate={{ opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Admin Console</h1>
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
            { label: 'Total Users', value: stats.totalUsers, icon: Users2, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
            { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
            { label: 'With Badges', value: stats.withBadges, icon: Sparkles, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
            { label: 'Total Badges', value: stats.totalBadges, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative p-5 rounded-2xl overflow-hidden group"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                    {stat.value}
                  </motion.p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Admin Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/partner-applications"
              className="group p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(139, 92, 246, 0.2))' }}>
                <Handshake size={24} style={{ color: '#14b8a6' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: 'var(--foreground)' }}>Partner Applications</p>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Review & manage applications</p>
              </div>
              <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--foreground-muted)' }} />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div
              className="rounded-3xl"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <Users2 size={20} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>User Directory</h2>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{filteredUsers.length} of {users.length} users</p>
                  </div>
                </div>
                <div className="flex-1 flex gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search by name or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:ring-2 focus:ring-purple-500/30"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div className="relative">
                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="pl-10 pr-8 py-2.5 rounded-xl text-sm appearance-none cursor-pointer"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--foreground)' }}
                    >
                      <option value="all">All Roles</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 className="w-8 h-8 mx-auto" style={{ color: 'var(--primary)' }} />
                    </motion.div>
                    <p className="mt-3 text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users2 size={48} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--foreground-muted)' }} />
                    <p style={{ color: 'var(--foreground-muted)' }}>No users match your criteria</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                        className={`p-4 flex items-center gap-4 cursor-pointer transition-all ${
                          selectedUser === user.id
                            ? 'bg-purple-500/10'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="relative">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                            style={{
                              background: user.avatar
                                ? `url(${user.avatar}) center/cover`
                                : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            }}
                          >
                            {!user.avatar && (user.name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                          </div>
                          {(user.role === 'owner' || user.role === 'admin') && (
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: user.role === 'owner' ? '#fbbf24' : '#ef4444', border: '2px solid var(--background)' }}
                            >
                              {user.role === 'owner' ? <Crown size={10} className="text-black" /> : <ShieldCheck size={10} className="text-white" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                              {user.name || user.username}
                            </span>
                            {user.badges.length > 0 && (
                              <BadgeDisplay badges={user.badges} size="sm" maxDisplay={4} />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{user.username}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              background: user.role === 'owner' ? 'rgba(251, 191, 36, 0.15)' : user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: user.role === 'owner' ? '#fbbf24' : user.role === 'admin' ? '#ef4444' : 'var(--foreground-muted)',
                            }}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: selectedUser === user.id ? 180 : 0 }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: selectedUser === user.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent' }}
                        >
                          <LucideIcons.ChevronDown size={18} style={{ color: selectedUser === user.id ? '#8b5cf6' : 'var(--foreground-muted)' }} />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div
              className="rounded-3xl overflow-hidden sticky top-28"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="p-5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <Crown size={20} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>User Manager</h2>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      {selectedUserData ? `Managing ${selectedUserData.name || selectedUserData.username}` : 'Select a user'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('badges')}
                    className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: activeTab === 'badges' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: activeTab === 'badges' ? '#f59e0b' : 'var(--foreground-muted)',
                      border: activeTab === 'badges' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                    }}
                  >
                    <Sparkles size={14} className="inline mr-1.5" />
                    Badges
                  </button>
                  <button
                    onClick={() => setActiveTab('tier')}
                    className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: activeTab === 'tier' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: activeTab === 'tier' ? '#ec4899' : 'var(--foreground-muted)',
                      border: activeTab === 'tier' ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid transparent',
                    }}
                  >
                    <Gem size={14} className="inline mr-1.5" />
                    Tier
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedUserData ? (
                  <motion.div
                    key={`${selectedUserData.id}-${activeTab}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5"
                  >
                    <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden"
                        style={{
                          background: selectedUserData.avatar
                            ? `url(${selectedUserData.avatar}) center/cover`
                            : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                        }}
                      >
                        {!selectedUserData.avatar && (selectedUserData.name?.[0] || selectedUserData.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{selectedUserData.name || selectedUserData.username}</p>
                        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{selectedUserData.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <UserCheck size={12} style={{ color: '#22c55e' }} />
                          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{selectedUserData.badges.length} badges</span>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'badges' ? (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {BADGE_LIST.map((badge, index) => {
                          const hasBadge = selectedUserData.badges.includes(badge.id)
                          const IconComponent = LucideIcons[badge.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>
                          return (
                            <motion.div
                              key={badge.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="flex items-center gap-3 p-3 rounded-xl transition-all"
                              style={{
                                background: hasBadge ? badge.bgColor : 'rgba(255, 255, 255, 0.03)',
                                boxShadow: hasBadge ? `inset 0 0 0 1px ${badge.color}40` : undefined,
                              }}
                            >
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ background: hasBadge ? badge.color + '20' : 'rgba(255, 255, 255, 0.05)' }}
                              >
                                {IconComponent && <IconComponent size={18} style={{ color: hasBadge ? badge.color : 'var(--foreground-muted)' }} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ color: hasBadge ? badge.color : 'var(--foreground)' }}>
                                  {badge.name}
                                </p>
                                <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>{badge.description}</p>
                              </div>
                              <motion.button
                                onClick={() => hasBadge
                                  ? handleRemoveBadge(selectedUserData.id, badge.id)
                                  : handleAssignBadge(selectedUserData.id, badge.id)
                                }
                                disabled={isAssigning}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{
                                  background: hasBadge ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                }}
                              >
                                {isAssigning ? (
                                  <Loader2 size={14} className="animate-spin" style={{ color: 'var(--foreground-muted)' }} />
                                ) : hasBadge ? (
                                  <Minus size={14} style={{ color: '#ef4444' }} />
                                ) : (
                                  <Plus size={14} style={{ color: '#22c55e' }} />
                                )}
                              </motion.button>
                            </motion.div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>
                          Select tier to assign (badges sync automatically)
                        </p>
                        {(['free', 'pro', 'creator', 'lifetime'] as TierType[]).map((tier) => {
                          const TierIcon = TIER_ICONS[tier]
                          const colors = TIER_COLORS[tier]
                          const userTier = (selectedUserData as { tier?: string }).tier || 'free'
                          const isCurrentTier = userTier === tier || (tier === 'free' && !['pro', 'creator', 'lifetime'].includes(userTier))
                          
                          return (
                            <motion.button
                              key={tier}
                              onClick={() => !isCurrentTier && tierMutation.mutate({ userId: selectedUserData.id, tier })}
                              disabled={isCurrentTier || tierMutation.isPending}
                              whileHover={!isCurrentTier ? { scale: 1.02 } : {}}
                              whileTap={!isCurrentTier ? { scale: 0.98 } : {}}
                              className="w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left"
                              style={{
                                background: isCurrentTier ? colors.bg : 'rgba(255, 255, 255, 0.03)',
                                border: isCurrentTier ? `2px solid ${colors.primary}` : '2px solid transparent',
                                opacity: tierMutation.isPending ? 0.7 : 1,
                              }}
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: colors.bg }}
                              >
                                <TierIcon size={20} style={{ color: colors.primary }} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold" style={{ color: isCurrentTier ? colors.primary : 'var(--foreground)' }}>
                                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                  {tier === 'free' && 'Basic access'}
                                  {tier === 'pro' && '€4.99/mo features'}
                                  {tier === 'creator' && '€9.99/mo features'}
                                  {tier === 'lifetime' && 'Permanent access'}
                                </p>
                              </div>
                              {isCurrentTier ? (
                                <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: colors.bg, color: colors.primary }}>
                                  Current
                                </span>
                              ) : tierMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--foreground-muted)' }} />
                              ) : (
                                <ChevronRight size={16} style={{ color: 'var(--foreground-muted)' }} />
                              )}
                            </motion.button>
                          )
                        })}
                        <p className="text-[10px] mt-4 p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                          ⚠️ Manual tier changes bypass Stripe. Use for gifts, testing, or support cases only.
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--foreground-muted)' }} />
                    </motion.div>
                    <p className="font-medium" style={{ color: 'var(--foreground-muted)' }}>Select a user from the list</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)', opacity: 0.6 }}>to manage their badges</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
