import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Plus,
  Minus,
  ChevronRight,
  Gem,
  Star,
  Zap,
  ChevronDown,
  Sparkles,
  UserCheck,
  Crown,
  ShieldCheck,
  Loader2,
  Users2,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Input } from '@/components/ui/input'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { BADGE_LIST, type BadgeId } from '@/lib/badges'
import type { TierType } from '@/server/lib/stripe'
import {
  getAllUsersWithBadgesFn,
  assignBadgeFn,
  removeBadgeFn,
} from '@/server/functions/badges'
import { adminSetUserTierFn } from '@/server/functions/subscriptions'

const TIER_ICONS: Record<TierType, React.ElementType> = {
  free: Zap,
  pro: Star,
  creator: Crown,
  lifetime: Gem,
}

export function UserManagerTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const getAllUsers = useServerFn(getAllUsersWithBadgesFn)
  const assignBadge = useServerFn(assignBadgeFn)
  const removeBadge = useServerFn(removeBadgeFn)
  const setUserTier = useServerFn(adminSetUserTierFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [activeSubTab, setActiveSubTab] = useState<'badges' | 'tier'>('badges')

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers({ data: { limit: 100 } }),
    refetchInterval: 30000,
  })

  const users = usersData?.users || []
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const tierMutation = useMutation({
    mutationFn: (p: { userId: string; tier: TierType }) =>
      setUserTier({ data: p }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const handleBadge = async (
    userId: string,
    badgeId: BadgeId,
    remove: boolean,
  ) => {
    setIsAssigning(true)
    try {
      await (remove ? removeBadge : assignBadge)({ data: { userId, badgeId } })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } finally {
      setIsAssigning(false)
    }
  }

  const selectedUserData = users.find((u) => u.id === selectedUser)
  const tierColors: Record<TierType, { primary: string; bg: string }> = {
    free: { primary: '#6b7280', bg: '#6b728015' },
    pro: { primary: '#3b82f6', bg: '#3b82f615' },
    creator: { primary: '#f59e0b', bg: '#f59e0b15' },
    lifetime: { primary: '#ec4899', bg: '#ec489915' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* User List */}
        <div
          className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{
            background: `${theme.colors.card}80`,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            className="p-4 flex flex-col sm:flex-row gap-3"
            style={{ borderBottom: `1px solid ${theme.colors.border}` }}
          >
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <Input
                placeholder={t('admin.userManager.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{
                  background: `${theme.colors.foreground}05`,
                  borderColor: theme.colors.border,
                }}
              />
            </div>
            <Select
              value={filterRole}
              onValueChange={(value) => setFilterRole(value)}
            >
              <SelectTrigger className="w-[130px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.userManager.allRoles')}</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2
                  className="w-8 h-8 mx-auto animate-spin"
                  style={{ color: theme.colors.primary }}
                />
                <p
                  className="mt-3 text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t('admin.userManager.loadingUsers')}
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users2
                  size={48}
                  className="mx-auto mb-3 opacity-20"
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {t('admin.userManager.noUsers')}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() =>
                    setSelectedUser(selectedUser === user.id ? null : user.id)
                  }
                  className="p-4 flex items-center gap-4 cursor-pointer transition-all hover:bg-white/5"
                  style={{
                    background:
                      selectedUser === user.id
                        ? `${theme.colors.primary}15`
                        : 'transparent',
                    borderBottom: `1px solid ${theme.colors.border}30`,
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden"
                      style={{
                        background: user.avatar
                          ? `url(${user.avatar}) center/cover`
                          : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      }}
                    >
                      {!user.avatar &&
                        (
                          user.name?.[0] ||
                          user.username?.[0] ||
                          'U'
                        ).toUpperCase()}
                    </div>
                    {(user.role === 'owner' || user.role === 'admin') && (
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            user.role === 'owner' ? '#fbbf24' : '#ef4444',
                          border: `2px solid ${theme.colors.background}`,
                        }}
                      >
                        {user.role === 'owner' ? (
                          <Crown size={10} className="text-black" />
                        ) : (
                          <ShieldCheck size={10} className="text-white" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-semibold"
                        style={{ color: theme.colors.foreground }}
                      >
                        {user.name || user.username}
                      </span>
                      {user.badges.length > 0 && (
                        <BadgeDisplay
                          badges={user.badges}
                          size="sm"
                          maxDisplay={3}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-sm"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        @{user.username}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            user.role === 'owner'
                              ? '#fbbf2415'
                              : user.role === 'admin'
                                ? '#ef444415'
                                : `${theme.colors.foreground}08`,
                          color:
                            user.role === 'owner'
                              ? '#fbbf24'
                              : user.role === 'admin'
                                ? '#ef4444'
                                : theme.colors.foregroundMuted,
                        }}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${selectedUser === user.id ? 'rotate-180' : ''}`}
                    style={{
                      color:
                        selectedUser === user.id
                          ? theme.colors.primary
                          : theme.colors.foregroundMuted,
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Manager Panel */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: `${theme.colors.card}80`,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            className="p-4"
            style={{ borderBottom: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${theme.colors.primary}15` }}
              >
                <Crown size={20} style={{ color: theme.colors.primary }} />
              </div>
              <div>
                <h2
                  className="font-semibold"
                  style={{ color: theme.colors.foreground }}
                >
                  {t('admin.userManager.title')}
                </h2>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {selectedUserData
                    ? t('admin.userManager.managing', {
                        name:
                          selectedUserData.name || selectedUserData.username,
                      })
                    : t('admin.userManager.selectUser')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubTab('badges')}
                className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background:
                    activeSubTab === 'badges'
                      ? '#f59e0b15'
                      : `${theme.colors.foreground}05`,
                  color:
                    activeSubTab === 'badges'
                      ? '#f59e0b'
                      : theme.colors.foregroundMuted,
                  border:
                    activeSubTab === 'badges'
                      ? '1px solid #f59e0b30'
                      : '1px solid transparent',
                }}
              >
                <Sparkles size={14} className="inline mr-1.5" />
                {t('admin.userManager.badges')}
              </button>
              <button
                onClick={() => setActiveSubTab('tier')}
                className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background:
                    activeSubTab === 'tier'
                      ? '#ec489915'
                      : `${theme.colors.foreground}05`,
                  color:
                    activeSubTab === 'tier'
                      ? '#ec4899'
                      : theme.colors.foregroundMuted,
                  border:
                    activeSubTab === 'tier'
                      ? '1px solid #ec489930'
                      : '1px solid transparent',
                }}
              >
                <Gem size={14} className="inline mr-1.5" />
                {t('admin.userManager.tier')}
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedUserData ? (
                <motion.div
                  key={`${selectedUserData.id}-${activeSubTab}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* User Info Header */}
                  <div
                    className="flex items-center gap-4 mb-5 pb-5"
                    style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg"
                      style={{
                        background: selectedUserData.avatar
                          ? `url(${selectedUserData.avatar}) center/cover`
                          : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      }}
                    >
                      {!selectedUserData.avatar &&
                        (
                          selectedUserData.name?.[0] ||
                          selectedUserData.username?.[0] ||
                          'U'
                        ).toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-lg font-bold"
                        style={{ color: theme.colors.foreground }}
                      >
                        {selectedUserData.name || selectedUserData.username}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        @{selectedUserData.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <UserCheck size={12} style={{ color: '#22c55e' }} />
                        <span
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {t('admin.userManager.badgeCount', {
                            count: selectedUserData.badges.length,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeSubTab === 'badges' ? (
                    <div className="space-y-2">
                      {BADGE_LIST.map((badge) => {
                        const hasBadge = selectedUserData.badges.includes(
                          badge.id,
                        )
                        const Icon = LucideIcons[
                          badge.icon as keyof typeof LucideIcons
                        ] as React.ComponentType<{
                          size?: number
                          style?: React.CSSProperties
                        }>
                        return (
                          <div
                            key={badge.id}
                            className="flex items-center gap-3 p-3 rounded-xl transition-all"
                            style={{
                              background: hasBadge
                                ? badge.bgColor
                                : `${theme.colors.foreground}05`,
                              boxShadow: hasBadge
                                ? `inset 0 0 0 1px ${badge.color}40`
                                : undefined,
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center"
                              style={{
                                background: hasBadge
                                  ? `${badge.color}20`
                                  : `${theme.colors.foreground}08`,
                              }}
                            >
                              {Icon && (
                                <Icon
                                  size={18}
                                  style={{
                                    color: hasBadge
                                      ? badge.color
                                      : theme.colors.foregroundMuted,
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-medium"
                                style={{
                                  color: hasBadge
                                    ? badge.color
                                    : theme.colors.foreground,
                                }}
                              >
                                {badge.name}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {badge.description}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleBadge(
                                  selectedUserData.id,
                                  badge.id,
                                  hasBadge,
                                )
                              }
                              disabled={isAssigning}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              style={{
                                background: hasBadge
                                  ? '#ef444415'
                                  : '#22c55e15',
                              }}
                            >
                              {isAssigning ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                />
                              ) : hasBadge ? (
                                <Minus size={14} style={{ color: '#ef4444' }} />
                              ) : (
                                <Plus size={14} style={{ color: '#22c55e' }} />
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p
                        className="text-xs font-medium mb-3"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {t('admin.userManager.selectTier')}
                      </p>
                      {(
                        ['free', 'pro', 'creator', 'lifetime'] as TierType[]
                      ).map((tier) => {
                        const TierIcon = TIER_ICONS[tier]
                        const colors = tierColors[tier]
                        const userTier =
                          (selectedUserData as { tier?: string }).tier || 'free'
                        const isCurrentTier =
                          userTier === tier ||
                          (tier === 'free' &&
                            !['pro', 'creator', 'lifetime'].includes(userTier))
                        return (
                          <button
                            key={tier}
                            onClick={() =>
                              !isCurrentTier &&
                              tierMutation.mutate({
                                userId: selectedUserData.id,
                                tier,
                              })
                            }
                            disabled={isCurrentTier || tierMutation.isPending}
                            className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                            style={{
                              background: isCurrentTier
                                ? colors.bg
                                : `${theme.colors.foreground}05`,
                              border: isCurrentTier
                                ? `2px solid ${colors.primary}`
                                : '2px solid transparent',
                              opacity: tierMutation.isPending ? 0.7 : 1,
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: colors.bg }}
                            >
                              <TierIcon
                                size={20}
                                style={{ color: colors.primary }}
                              />
                            </div>
                            <div className="flex-1">
                              <p
                                className="font-semibold"
                                style={{
                                  color: isCurrentTier
                                    ? colors.primary
                                    : theme.colors.foreground,
                                }}
                              >
                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {t(
                                  `admin.userManager.${tier === 'free' ? 'basicAccess' : tier === 'pro' ? 'proFeatures' : tier === 'creator' ? 'creatorFeatures' : 'lifetimeAccess'}`,
                                )}
                              </p>
                            </div>
                            {isCurrentTier ? (
                              <span
                                className="text-xs px-2 py-1 rounded-lg font-medium"
                                style={{
                                  background: colors.bg,
                                  color: colors.primary,
                                }}
                              >
                                {t('admin.userManager.currentTier')}
                              </span>
                            ) : tierMutation.isPending ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                                style={{ color: theme.colors.foregroundMuted }}
                              />
                            ) : (
                              <ChevronRight
                                size={16}
                                style={{ color: theme.colors.foregroundMuted }}
                              />
                            )}
                          </button>
                        )
                      })}
                      <p
                        className="text-[10px] mt-4 p-3 rounded-lg"
                        style={{ background: '#f59e0b15', color: '#f59e0b' }}
                      >
                        ⚠️ {t('admin.userManager.tierWarning')}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="py-12 text-center">
                  <Sparkles
                    size={48}
                    className="mx-auto mb-4 opacity-20"
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                  <p
                    className="font-medium"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('admin.userManager.selectUser')}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
