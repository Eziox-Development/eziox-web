import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Link } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Users2,
  MessageSquare,
  Fingerprint,
  Eye,
  Search,
  Ban,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  UserX,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  adminSearchUsersFn,
  adminBanUserFn,
  adminUnbanUserFn,
  adminGetPendingAppealsFn,
  adminReviewAppealFn,
  adminGetMultiAccountLinksFn,
  adminUpdateMultiAccountStatusFn,
  adminGetModerationStatsFn,
  adminGetModerationLogFn,
} from '@/server/functions/admin-moderation'

type BanFormType = {
  banType: 'temporary' | 'permanent' | 'shadow'
  reason: string
  internalNotes: string
  durationType: 'hours' | 'days' | 'weeks' | 'months' | 'years' | 'permanent'
  durationValue: number
}

export function ModerationTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [activeSubTab, setActiveSubTab] = useState<
    'users' | 'appeals' | 'multiAccount' | 'logs'
  >('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [banForm, setBanForm] = useState<BanFormType>({
    banType: 'temporary',
    reason: '',
    internalNotes: '',
    durationType: 'days',
    durationValue: 7,
  })

  const searchUsers = useServerFn(adminSearchUsersFn)
  const banUser = useServerFn(adminBanUserFn)
  const unbanUser = useServerFn(adminUnbanUserFn)
  const getPendingAppeals = useServerFn(adminGetPendingAppealsFn)
  const reviewAppeal = useServerFn(adminReviewAppealFn)
  const getMultiAccountLinks = useServerFn(adminGetMultiAccountLinksFn)
  const updateMultiAccountStatus = useServerFn(adminUpdateMultiAccountStatusFn)
  const getModerationStats = useServerFn(adminGetModerationStatsFn)
  const getModerationLog = useServerFn(adminGetModerationLogFn)

  const { data: stats } = useQuery({
    queryKey: ['admin', 'moderation', 'stats'],
    queryFn: () => getModerationStats(),
  })
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['admin', 'users', 'search', searchQuery, currentPage, pageSize],
    queryFn: () =>
      searchUsers({ data: { query: searchQuery || undefined, page: currentPage, limit: pageSize } }),
  })
  const { data: appeals, isLoading: appealsLoading } = useQuery({
    queryKey: ['admin', 'appeals'],
    queryFn: () => getPendingAppeals(),
    enabled: activeSubTab === 'appeals',
  })
  const { data: multiAccountLinks, isLoading: multiAccountLoading } = useQuery({
    queryKey: ['admin', 'multiAccount'],
    queryFn: () => getMultiAccountLinks({ data: { status: 'detected' } }),
    enabled: activeSubTab === 'multiAccount',
  })
  const { data: moderationLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'moderation', 'logs'],
    queryFn: () => getModerationLog({ data: { page: 1, limit: 50 } }),
    enabled: activeSubTab === 'logs',
  })

  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      await banUser({
        data: {
          userId,
          banType: banForm.banType,
          reason: banForm.reason,
          internalNotes: banForm.internalNotes || undefined,
          duration:
            banForm.banType === 'permanent'
              ? { type: 'permanent' }
              : { type: banForm.durationType, value: banForm.durationValue },
        },
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      setShowBanModal(false)
      setSelectedUser(null)
      setBanForm({
        banType: 'temporary',
        reason: '',
        internalNotes: '',
        durationType: 'days',
        durationValue: 7,
      })
    },
  })

  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      await unbanUser({ data: { userId } })
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })

  const reviewAppealMutation = useMutation({
    mutationFn: async ({
      banId,
      decision,
      response,
    }: {
      banId: string
      decision: 'approved' | 'rejected'
      response: string
    }) => {
      await reviewAppeal({ data: { banId, decision, response } })
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['admin', 'appeals'] }),
  })

  const updateMultiAccountMutation = useMutation({
    mutationFn: async ({
      linkId,
      status,
      notes,
    }: {
      linkId: string
      status: 'confirmed' | 'allowed' | 'false_positive'
      notes?: string
    }) => {
      await updateMultiAccountStatus({ data: { linkId, status, notes } })
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'multiAccount'],
      }),
  })

  const subTabs = [
    {
      id: 'users' as const,
      labelKey: 'admin.moderation.tabs.users',
      icon: Users2,
      color: '#3b82f6',
    },
    {
      id: 'appeals' as const,
      labelKey: 'admin.moderation.tabs.appeals',
      icon: MessageSquare,
      badge: stats?.bans.pendingAppeals,
      color: '#f59e0b',
    },
    {
      id: 'multiAccount' as const,
      labelKey: 'admin.moderation.tabs.multiAccount',
      icon: Fingerprint,
      badge: stats?.multiAccount.detected,
      color: theme.colors.primary,
    },
    {
      id: 'logs' as const,
      labelKey: 'admin.moderation.tabs.logs',
      icon: Eye,
      color: '#6b7280',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: '#ef444415' }}
          >
            <Shield size={24} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: theme.colors.foreground }}
            >
              {t('admin.moderation.title')}
            </h1>
            <p
              className="text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('admin.moderation.description')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            void queryClient.invalidateQueries({ queryKey: ['admin'] })
          }
          className="gap-2"
        >
          <RefreshCw size={14} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            labelKey: 'admin.moderation.stats.activeBans',
            value: stats?.bans.active || 0,
            icon: Ban,
            color: '#ef4444',
          },
          {
            labelKey: 'admin.moderation.stats.pendingAppeals',
            value: stats?.bans.pendingAppeals || 0,
            icon: MessageSquare,
            color: '#f59e0b',
          },
          {
            labelKey: 'admin.moderation.stats.detectedMultiAccounts',
            value: stats?.multiAccount.detected || 0,
            icon: Fingerprint,
            color: theme.colors.primary,
          },
          {
            labelKey: 'admin.moderation.stats.blockedContent',
            value: stats?.moderation.blocked || 0,
            icon: AlertTriangle,
            color: '#ef4444',
          },
        ].map((stat) => (
          <div
            key={stat.labelKey}
            className="p-4 rounded-xl"
            style={{
              background: `${theme.colors.card}80`,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p
                  className="text-xl font-bold"
                  style={{ color: theme.colors.foreground }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t(stat.labelKey)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 p-1 mb-6 rounded-xl"
        style={{
          background: `${theme.colors.foreground}08`,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative"
            style={{
              background:
                activeSubTab === tab.id
                  ? `${theme.colors.foreground}10`
                  : 'transparent',
              color:
                activeSubTab === tab.id
                  ? theme.colors.foreground
                  : theme.colors.foregroundMuted,
            }}
          >
            <tab.icon
              size={16}
              style={{ color: activeSubTab === tab.id ? tab.color : undefined }}
            />
            <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full text-xs flex items-center justify-center bg-red-500 text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeSubTab === 'users' && (
          <div className="flex flex-col">
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <Input
                placeholder={t('admin.moderation.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{
                  background: `${theme.colors.foreground}05`,
                  borderColor: theme.colors.border,
                }}
              />
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: `${theme.colors.card}80`,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              {searchLoading ? (
                <div className="p-8 text-center">
                  <Loader2
                    className="w-6 h-6 mx-auto animate-spin"
                    style={{ color: theme.colors.primary }}
                  />
                </div>
              ) : searchResults?.users?.length === 0 ? (
                <div
                  className="p-8 text-center"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t('admin.moderation.noResults')}
                </div>
              ) : (
                searchResults?.users?.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 flex items-center gap-4"
                    style={{
                      borderBottom: `1px solid ${theme.colors.border}30`,
                    }}
                  >
                    <Link
                      to="/$username"
                      params={{ username: user.username || '' }}
                      className="shrink-0"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username || 'User'}
                          className="w-10 h-10 rounded-xl object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold hover:scale-105 transition-transform"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                          }}
                        >
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to="/$username"
                          params={{ username: user.username || '' }}
                          className="font-medium hover:underline"
                          style={{ color: theme.colors.foreground }}
                        >
                          {user.username}
                        </Link>
                        {user.isBanned && (
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              background: '#ef444420',
                              color: '#ef4444',
                            }}
                          >
                            {t('admin.moderation.banned')}
                          </span>
                        )}
                        {user.role === 'admin' && (
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              background: `${theme.colors.primary}20`,
                              color: theme.colors.primary,
                            }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm truncate"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unbanMutation.mutate(user.id)}
                          disabled={unbanMutation.isPending}
                          className="gap-1"
                        >
                          <CheckCircle2 size={14} />
                          {t('admin.moderation.unban')}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user.id)
                            setShowBanModal(true)
                          }}
                          disabled={
                            user.role === 'admin' || user.role === 'owner'
                          }
                          className="gap-1"
                        >
                          <UserX size={14} />
                          {t('admin.moderation.ban')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {searchResults?.pagination && searchResults.pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4 rounded-xl" style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                    {t('admin.moderation.perPage')}:
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                    {t('admin.moderation.page')} {searchResults.pagination.page} {t('admin.moderation.of')} {searchResults.pagination.totalPages}
                  </span>
                  <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    ({searchResults.pagination.total} {t('admin.moderation.totalUsers')})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    {'<<'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    {'<'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(searchResults.pagination.totalPages, p + 1))}
                    disabled={currentPage === searchResults.pagination.totalPages}
                  >
                    {'>'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(searchResults.pagination.totalPages)}
                    disabled={currentPage === searchResults.pagination.totalPages}
                  >
                    {'>>'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'appeals' && (
          <div>
            {appealsLoading ? (
              <div className="p-8 text-center">
                <Loader2
                  className="w-6 h-6 mx-auto animate-spin"
                  style={{ color: theme.colors.primary }}
                />
              </div>
            ) : !appeals?.appeals?.length ? (
              <div
                className="p-8 text-center rounded-xl"
                style={{
                  background: `${theme.colors.card}80`,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <MessageSquare
                  size={40}
                  className="mx-auto mb-3 opacity-20"
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {t('admin.moderation.noAppeals')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appeals.appeals.map((appeal) => (
                  <AppealCard
                    key={appeal.banId}
                    appeal={appeal}
                    onReview={(d, r) =>
                      reviewAppealMutation.mutate({
                        banId: appeal.banId,
                        decision: d,
                        response: r,
                      })
                    }
                    isReviewing={reviewAppealMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'multiAccount' && (
          <div>
            {multiAccountLoading ? (
              <div className="p-8 text-center">
                <Loader2
                  className="w-6 h-6 mx-auto animate-spin"
                  style={{ color: theme.colors.primary }}
                />
              </div>
            ) : !multiAccountLinks?.links?.length ? (
              <div
                className="p-8 text-center rounded-xl"
                style={{
                  background: `${theme.colors.card}80`,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <Fingerprint
                  size={40}
                  className="mx-auto mb-3 opacity-20"
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {t('admin.moderation.noMultiAccounts')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {multiAccountLinks.links.map((link) => (
                  <MultiAccountCard
                    key={link.id}
                    link={link}
                    onUpdateStatus={(s, n) =>
                      updateMultiAccountMutation.mutate({
                        linkId: link.id,
                        status: s,
                        notes: n,
                      })
                    }
                    isUpdating={updateMultiAccountMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'logs' && (
          <div>
            {logsLoading ? (
              <div className="p-8 text-center">
                <Loader2
                  className="w-6 h-6 mx-auto animate-spin"
                  style={{ color: theme.colors.primary }}
                />
              </div>
            ) : !moderationLogs?.logs?.length ? (
              <div
                className="p-8 text-center rounded-xl"
                style={{
                  background: `${theme.colors.card}80`,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <FileText
                  size={40}
                  className="mx-auto mb-3 opacity-20"
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {t('admin.moderation.noLogs')}
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: `${theme.colors.card}80`,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                {moderationLogs.logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ban Modal */}
      <AnimatePresence>
        {showBanModal && selectedUser && (
          <BanModal
            onClose={() => {
              setShowBanModal(false)
              setSelectedUser(null)
            }}
            onSubmit={() => banMutation.mutate(selectedUser)}
            form={banForm}
            setForm={setBanForm}
            isSubmitting={banMutation.isPending}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AppealCard({
  appeal,
  onReview,
  isReviewing,
}: {
  appeal: {
    banId: string
    username: string
    banType: string
    reason: string
    appealMessage: string | null
  }
  onReview: (d: 'approved' | 'rejected', r: string) => void
  isReviewing: boolean
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [response, setResponse] = useState('')

  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="font-medium"
            style={{ color: theme.colors.foreground }}
          >
            {appeal.username}
          </h3>
          <p
            className="text-sm"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('admin.moderation.banType')}: {appeal.banType}
          </p>
        </div>
        <span
          className="px-2 py-1 rounded text-xs"
          style={{ background: '#f59e0b20', color: '#f59e0b' }}
        >
          {t('admin.moderation.pendingReview')}
        </span>
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <p
            className="text-xs font-medium mb-1"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('admin.moderation.originalReason')}:
          </p>
          <p className="text-sm" style={{ color: theme.colors.foreground }}>
            {appeal.reason}
          </p>
        </div>
        <div>
          <p
            className="text-xs font-medium mb-1"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('admin.moderation.appealMessage')}:
          </p>
          <p className="text-sm" style={{ color: theme.colors.foreground }}>
            {appeal.appealMessage || '—'}
          </p>
        </div>
      </div>
      <textarea
        placeholder={t('admin.moderation.responsePlaceholder')}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        className="w-full p-3 rounded-lg text-sm resize-none mb-3"
        style={{
          background: `${theme.colors.background}80`,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.foreground,
        }}
        rows={2}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReview('approved', response)}
          disabled={isReviewing || !response}
          className="flex-1 gap-1"
        >
          <CheckCircle2 size={14} />
          {t('admin.moderation.approve')}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onReview('rejected', response)}
          disabled={isReviewing || !response}
          className="flex-1 gap-1"
        >
          <XCircle size={14} />
          {t('admin.moderation.reject')}
        </Button>
      </div>
    </div>
  )
}

function MultiAccountCard({
  link,
  onUpdateStatus,
  isUpdating,
}: {
  link: {
    id: string
    linkedUsername: string
    linkType: string
    confidence: number
    status: string | null
  }
  onUpdateStatus: (
    s: 'confirmed' | 'allowed' | 'false_positive',
    n?: string,
  ) => void
  isUpdating: boolean
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const confidence = link.confidence ?? 0
  const confidenceColor =
    confidence >= 80 ? '#ef4444' : confidence >= 50 ? '#f59e0b' : '#22c55e'

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: `${theme.colors.card}80`,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${theme.colors.primary}15` }}
          >
            <Fingerprint size={20} style={{ color: theme.colors.primary }} />
          </div>
          <div>
            <span
              className="font-medium"
              style={{ color: theme.colors.foreground }}
            >
              {link.linkedUsername}
            </span>
            <p
              className="text-xs"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {link.linkType === 'ip_match'
                ? t('admin.moderation.ipMatch')
                : t('admin.moderation.fingerprintMatch')}
            </p>
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ background: `${confidenceColor}20`, color: confidenceColor }}
        >
          {confidence}%
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onUpdateStatus('confirmed')}
          disabled={isUpdating}
          className="flex-1"
        >
          {t('admin.moderation.confirm')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateStatus('allowed')}
          disabled={isUpdating}
          className="flex-1"
        >
          {t('admin.moderation.allow')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateStatus('false_positive')}
          disabled={isUpdating}
          className="flex-1"
        >
          {t('admin.moderation.falsePositive')}
        </Button>
      </div>
    </div>
  )
}

function LogRow({
  log,
}: {
  log: {
    id: string
    contentType: string
    contentValue: string
    action: string
    reason: string
    createdAt: Date
  }
}) {
  const { theme } = useTheme()
  const actionColor =
    log.action === 'blocked'
      ? '#ef4444'
      : log.action === 'flagged'
        ? '#f59e0b'
        : '#6b7280'

  return (
    <div
      className="p-3 flex items-center gap-3"
      style={{ borderBottom: `1px solid ${theme.colors.border}30` }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${actionColor}15` }}
      >
        <AlertTriangle size={14} style={{ color: actionColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate"
          style={{ color: theme.colors.foreground }}
        >
          <span className="font-medium">{log.contentType}:</span>{' '}
          {log.contentValue.substring(0, 40)}...
        </p>
        <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
          {log.reason} • {log.action}
        </p>
      </div>
      <div
        className="flex items-center gap-1 text-xs"
        style={{ color: theme.colors.foregroundMuted }}
      >
        <Clock size={12} />
        {new Date(log.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}

function BanModal({
  onClose,
  onSubmit,
  form,
  setForm,
  isSubmitting,
}: {
  onClose: () => void
  onSubmit: () => void
  form: BanFormType
  setForm: React.Dispatch<React.SetStateAction<BanFormType>>
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md p-6 rounded-2xl"
        style={{
          background: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#ef444415' }}
          >
            <Ban size={20} style={{ color: '#ef4444' }} />
          </div>
          <h2
            className="text-lg font-bold"
            style={{ color: theme.colors.foreground }}
          >
            {t('admin.moderation.banUser')}
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('admin.moderation.banType')}
            </label>
            <div className="flex gap-2">
              {(['temporary', 'permanent', 'shadow'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, banType: type })}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background:
                      form.banType === type
                        ? '#ef444420'
                        : `${theme.colors.foreground}05`,
                    color:
                      form.banType === type
                        ? '#ef4444'
                        : theme.colors.foregroundMuted,
                    border:
                      form.banType === type
                        ? '1px solid #ef444430'
                        : '1px solid transparent',
                  }}
                >
                  {t(`admin.moderation.${type}`)}
                </button>
              ))}
            </div>
          </div>
          {form.banType === 'temporary' && (
            <div className="flex gap-2">
              <Input
                type="number"
                value={form.durationValue}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationValue: parseInt(e.target.value) || 1,
                  })
                }
                min={1}
                max={100}
                className="w-24"
                style={{
                  background: `${theme.colors.foreground}05`,
                  borderColor: theme.colors.border,
                }}
              />
              <Select
                value={form.durationType}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    durationType: value as BanFormType['durationType'],
                  })
                }
              >
                <SelectTrigger className="flex-1 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">{t('admin.moderation.hours')}</SelectItem>
                  <SelectItem value="days">{t('admin.moderation.days')}</SelectItem>
                  <SelectItem value="weeks">{t('admin.moderation.weeks')}</SelectItem>
                  <SelectItem value="months">{t('admin.moderation.months')}</SelectItem>
                  <SelectItem value="years">{t('admin.moderation.years')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('admin.moderation.reason')} *
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder={t('admin.moderation.reasonPlaceholder')}
              className="w-full p-3 rounded-lg text-sm resize-none"
              style={{
                background: `${theme.colors.foreground}05`,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.foreground,
              }}
              rows={3}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('admin.moderation.internalNotes')}
            </label>
            <textarea
              value={form.internalNotes}
              onChange={(e) =>
                setForm({ ...form, internalNotes: e.target.value })
              }
              placeholder={t('admin.moderation.internalNotesPlaceholder')}
              className="w-full p-3 rounded-lg text-sm resize-none"
              style={{
                background: `${theme.colors.foreground}05`,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.foreground,
              }}
              rows={2}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={onSubmit}
              disabled={isSubmitting || !form.reason}
              className="flex-1"
            >
              {isSubmitting
                ? t('common.loading')
                : t('admin.moderation.confirmBan')}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
