import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  Handshake,
  Search,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Mail,
  Globe,
  Calendar,
  MessageSquare,
  FileText,
  Loader2,
  ArrowLeft,
  X,
  Tv,
  Gamepad2,
  Code,
  Palette,
  Music,
  Building2,
  Users,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import {
  getPartnerApplicationsFn,
  updateApplicationStatusFn,
  type PartnerApplicationWithUser,
} from '@/server/functions/partners'
import { CATEGORIES } from '@/lib/partner-categories'
import { getSocialUrl } from '@/lib/social-links'

function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '99, 102, 241'
  const h = hex.slice(1)
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}

const STATUS_CONFIG = {
  pending: {
    labelKey: 'admin.partners.pending',
    color: '#f59e0b',
    icon: Clock,
  },
  reviewing: {
    labelKey: 'admin.partners.reviewing',
    color: '#3b82f6',
    icon: Eye,
  },
  approved: {
    labelKey: 'admin.partners.approved',
    color: '#22c55e',
    icon: CheckCircle2,
  },
  rejected: {
    labelKey: 'admin.partners.rejected',
    color: '#ef4444',
    icon: XCircle,
  },
} as const

const CATEGORY_ICONS: Record<string, typeof Tv> = {
  streamer: Tv,
  vtuber: Sparkles,
  content_creator: Tv,
  gamer: Gamepad2,
  developer: Code,
  game_creator: Gamepad2,
  artist: Palette,
  musician: Music,
  brand: Building2,
  agency: Users,
  other: MessageSquare,
}

export function PartnersTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const getApplications = useServerFn(getPartnerApplicationsFn)
  const updateStatus = useServerFn(updateApplicationStatusFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] =
    useState<PartnerApplicationWithUser | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  const {
    data: applications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['partner-applications'],
    queryFn: () => getApplications(),
  })

  const updateMutation = useMutation({
    mutationFn: (params: {
      applicationId: string
      status: 'pending' | 'reviewing' | 'approved' | 'rejected'
      adminNotes?: string
    }) => updateStatus({ data: params }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['partner-applications'] })
      setSelectedApplication(null)
      setAdminNotes('')
    },
  })

  const filteredApplications = useMemo(() => {
    return (
      applications?.filter((app) => {
        const matchesSearch =
          app.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.application.companyName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesStatus =
          statusFilter === 'all' || app.application.status === statusFilter
        const matchesCategory =
          categoryFilter === 'all' ||
          app.application.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
      }) || []
    )
  }, [applications, searchQuery, statusFilter, categoryFilter])

  const stats = useMemo(
    () => ({
      total: applications?.length || 0,
      pending:
        applications?.filter((a) => a.application.status === 'pending')
          .length || 0,
      reviewing:
        applications?.filter((a) => a.application.status === 'reviewing')
          .length || 0,
      approved:
        applications?.filter((a) => a.application.status === 'approved')
          .length || 0,
      rejected:
        applications?.filter((a) => a.application.status === 'rejected')
          .length || 0,
    }),
    [applications],
  )

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  const getCategoryLabel = (categoryId: string) =>
    CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId

  const renderCategoryData = (data: Record<string, unknown> | null) => {
    if (!data || Object.keys(data).length === 0) return null
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          if (!value) return null
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
          if (Array.isArray(value)) {
            return (
              <div key={key}>
                <span
                  className="text-xs font-medium"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {label}:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {value.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{
                        background: `rgba(${hexToRgb(theme.colors.primary)}, 0.1)`,
                        color: theme.colors.primary,
                      }}
                    >
                      {String(item)}
                    </span>
                  ))}
                </div>
              </div>
            )
          }
          if (typeof value === 'object') {
            return (
              <div key={key}>
                <span
                  className="text-xs font-medium"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {label}:
                </span>
                <div className="space-y-1.5 mt-1">
                  {Object.entries(value as Record<string, string>).map(
                    ([k, v]) => {
                      if (!v) return null
                      const platformKey = k.toLowerCase().replace(/\s+/g, '')
                      const fullUrl = v.startsWith('http')
                        ? v
                        : getSocialUrl(platformKey, v)
                      return (
                        <div key={k} className="flex items-center gap-2">
                          <span
                            className="text-xs"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {k}:
                          </span>
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium flex items-center gap-1 hover:underline"
                            style={{ color: theme.colors.primary }}
                          >
                            {v}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )
                    },
                  )}
                </div>
              </div>
            )
          }
          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="text-xs font-medium"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {label}:
              </span>
              <span
                className="text-xs"
                style={{ color: theme.colors.foreground }}
              >
                {String(value)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              boxShadow: `0 0 40px rgba(${hexToRgb(theme.colors.primary)}, 0.3)`,
            }}
          >
            <Handshake size={28} className="text-white" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: theme.colors.foreground }}
            >
              {t('admin.partners.title')}
            </h1>
            <p style={{ color: theme.colors.foregroundMuted }}>
              {t('admin.partners.description')}
            </p>
          </div>
        </div>
        {stats.pending > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <Clock size={16} style={{ color: '#f59e0b' }} />
            <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>
              {t('admin.partners.pendingReview', { count: stats.pending })}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            labelKey: 'admin.partners.total',
            value: stats.total,
            color: theme.colors.foreground,
            icon: FileText,
          },
          {
            labelKey: 'admin.partners.pending',
            value: stats.pending,
            color: '#f59e0b',
            icon: Clock,
          },
          {
            labelKey: 'admin.partners.reviewing',
            value: stats.reviewing,
            color: '#3b82f6',
            icon: Eye,
          },
          {
            labelKey: 'admin.partners.approved',
            value: stats.approved,
            color: '#22c55e',
            icon: CheckCircle2,
          },
          {
            labelKey: 'admin.partners.rejected',
            value: stats.rejected,
            color: '#ef4444',
            icon: XCircle,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl text-center cursor-pointer hover:scale-[1.02] transition-all"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
            onClick={() =>
              setStatusFilter(
                stat.labelKey.split('.').pop() === 'total'
                  ? 'all'
                  : stat.labelKey.split('.').pop() || 'all',
              )
            }
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: `rgba(${hexToRgb(stat.color)}, 0.1)` }}
            >
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div
              className="text-xs font-medium"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t(stat.labelKey)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: theme.colors.foregroundMuted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.partners.searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.foreground,
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'reviewing', 'approved', 'rejected'].map(
            (status) => {
              const config =
                status === 'all'
                  ? null
                  : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
              const isActive = statusFilter === status
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium hover:scale-[1.02] transition-all"
                  style={{
                    background: isActive
                      ? config
                        ? `rgba(${hexToRgb(config.color)}, 0.15)`
                        : `rgba(${hexToRgb(theme.colors.primary)}, 0.15)`
                      : theme.colors.card,
                    border: `1px solid ${isActive ? (config ? config.color : theme.colors.primary) : theme.colors.border}`,
                    color: isActive
                      ? config
                        ? config.color
                        : theme.colors.primary
                      : theme.colors.foregroundMuted,
                  }}
                >
                  {status === 'all'
                    ? t('admin.partners.all')
                    : t(config?.labelKey || '')}
                </button>
              )
            },
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <span
          className="text-xs font-medium py-2"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {t('admin.partners.category')}:
        </span>
        <button
          onClick={() => setCategoryFilter('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            background:
              categoryFilter === 'all'
                ? `rgba(${hexToRgb(theme.colors.primary)}, 0.15)`
                : 'transparent',
            border: `1px solid ${categoryFilter === 'all' ? theme.colors.primary : theme.colors.border}`,
            color:
              categoryFilter === 'all'
                ? theme.colors.primary
                : theme.colors.foregroundMuted,
          }}
        >
          {t('admin.partners.all')}
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] || MessageSquare
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background:
                  categoryFilter === cat.id
                    ? `rgba(${hexToRgb(cat.color)}, 0.15)`
                    : 'transparent',
                border: `1px solid ${categoryFilter === cat.id ? cat.color : theme.colors.border}`,
                color:
                  categoryFilter === cat.id
                    ? cat.color
                    : theme.colors.foregroundMuted,
              }}
            >
              <Icon size={12} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2
            size={40}
            className="animate-spin"
            style={{ color: theme.colors.primary }}
          />
          <p
            className="mt-4 text-sm"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('admin.partners.loading')}
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <XCircle size={32} style={{ color: '#ef4444' }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: theme.colors.foreground }}
          >
            {t('admin.partners.loadFailed')}
          </h3>
          <p style={{ color: theme.colors.foregroundMuted }}>
            {t('admin.partners.tryAgain')}
          </p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: `rgba(${hexToRgb(theme.colors.primary)}, 0.1)`,
            }}
          >
            <FileText size={32} style={{ color: theme.colors.primary }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: theme.colors.foreground }}
          >
            {t('admin.partners.noApplications')}
          </h3>
          <p style={{ color: theme.colors.foregroundMuted }}>
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? t('admin.partners.adjustFilters')
              : t('admin.partners.noSubmissions')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app, index) => {
            const status =
              STATUS_CONFIG[
                app.application.status as keyof typeof STATUS_CONFIG
              ]
            const CategoryIcon =
              CATEGORY_ICONS[app.application.category] || MessageSquare
            return (
              <motion.div
                key={app.application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-5 rounded-2xl cursor-pointer group hover:scale-[1.005] transition-all"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
                onClick={() => {
                  setSelectedApplication(app)
                  setAdminNotes(app.application.adminNotes || '')
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={
                        app.profile?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.user.username}`
                      }
                      alt={app.user.name || app.user.username}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center"
                      style={{ background: status.color }}
                    >
                      <status.icon size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3
                        className="font-semibold"
                        style={{ color: theme.colors.foreground }}
                      >
                        {app.user.name || app.user.username}
                      </h3>
                      <span
                        className="text-sm"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        @{app.user.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: `rgba(${hexToRgb(status.color)}, 0.1)`,
                          color: status.color,
                        }}
                      >
                        <status.icon size={12} />
                        {t(status.labelKey)}
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        <CategoryIcon size={14} />
                        {getCategoryLabel(app.application.category)}
                      </div>
                      {app.application.companyName && (
                        <div
                          className="flex items-center gap-1.5 text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          <Building2 size={14} />
                          {app.application.companyName}
                        </div>
                      )}
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        <Calendar size={14} />
                        {formatDate(app.application.createdAt)}
                      </div>
                    </div>
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {app.application.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className="opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="sticky top-0 z-10 p-6 pb-4"
                style={{
                  background: theme.colors.card,
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <ArrowLeft
                        size={20}
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                    </button>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          selectedApplication.profile?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedApplication.user.username}`
                        }
                        alt={
                          selectedApplication.user.name ||
                          selectedApplication.user.username
                        }
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h2
                          className="text-xl font-bold"
                          style={{ color: theme.colors.foreground }}
                        >
                          {selectedApplication.user.name ||
                            selectedApplication.user.username}
                        </h2>
                        <p
                          className="text-sm"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          @{selectedApplication.user.username}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X
                      size={20}
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status & Category */}
                <div className="flex items-center gap-3 flex-wrap">
                  {(() => {
                    const status =
                      STATUS_CONFIG[
                        selectedApplication.application
                          .status as keyof typeof STATUS_CONFIG
                      ]
                    return (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                          background: `rgba(${hexToRgb(status.color)}, 0.1)`,
                          color: status.color,
                        }}
                      >
                        <status.icon size={16} />
                        {t(status.labelKey)}
                      </div>
                    )
                  })()}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      background: `rgba(${hexToRgb(theme.colors.primary)}, 0.1)`,
                      color: theme.colors.primary,
                    }}
                  >
                    {(() => {
                      const CategoryIcon =
                        CATEGORY_ICONS[
                          selectedApplication.application.category
                        ] || MessageSquare
                      return <CategoryIcon size={16} />
                    })()}
                    {getCategoryLabel(selectedApplication.application.category)}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('admin.partners.applied')}{' '}
                    {formatDate(selectedApplication.application.createdAt)}
                  </span>
                </div>

                {/* Contact Info */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl"
                  style={{
                    background: `rgba(${hexToRgb(theme.colors.card)}, 0.5)`,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Mail
                      size={18}
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {t('admin.partners.email')}
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.colors.foreground }}
                      >
                        {selectedApplication.user.email}
                      </p>
                    </div>
                  </div>
                  {selectedApplication.application.website && (
                    <div className="flex items-center gap-3">
                      <Globe
                        size={18}
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {t('admin.partners.website')}
                        </p>
                        <a
                          href={selectedApplication.application.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium flex items-center gap-1 hover:underline"
                          style={{ color: theme.colors.primary }}
                        >
                          {selectedApplication.application.website}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedApplication.application.companyName && (
                    <div className="flex items-center gap-3">
                      <Building2
                        size={18}
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {t('admin.partners.company')}
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.colors.foreground }}
                        >
                          {selectedApplication.application.companyName}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.application.audienceSize && (
                    <div className="flex items-center gap-3">
                      <Users
                        size={18}
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {t('admin.partners.audienceSize')}
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.colors.foreground }}
                        >
                          {selectedApplication.application.audienceSize}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Data */}
                {selectedApplication.application.categoryData &&
                  Object.keys(selectedApplication.application.categoryData)
                    .length > 0 && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        background: `rgba(${hexToRgb(theme.colors.primary)}, 0.05)`,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <h3
                        className="text-sm font-semibold mb-3"
                        style={{ color: theme.colors.foreground }}
                      >
                        {t('admin.partners.categoryDetails')}
                      </h3>
                      {renderCategoryData(
                        selectedApplication.application.categoryData as Record<
                          string,
                          unknown
                        >,
                      )}
                    </div>
                  )}

                {/* Description */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: `${theme.colors.foreground}05`,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('admin.partners.descriptionLabel')}
                  </h3>
                  <p
                    className="text-sm whitespace-pre-wrap"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {selectedApplication.application.description}
                  </p>
                </div>

                {/* Admin Notes */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('admin.partners.adminNotes')}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={t('admin.partners.adminNotesPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                    style={{
                      background: `${theme.colors.foreground}05`,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.foreground,
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div
                  className="flex flex-wrap gap-3 pt-4"
                  style={{ borderTop: `1px solid ${theme.colors.border}` }}
                >
                  {selectedApplication.application.status !== 'reviewing' && (
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          applicationId: selectedApplication.application.id,
                          status: 'reviewing',
                          adminNotes,
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
                      style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#3b82f6',
                      }}
                    >
                      <Eye size={16} />
                      {t('admin.partners.markReviewing')}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      updateMutation.mutate({
                        applicationId: selectedApplication.application.id,
                        status: 'approved',
                        adminNotes,
                      })
                    }
                    disabled={updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#22c55e',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    {t('admin.partners.approve')}
                  </button>
                  <button
                    onClick={() =>
                      updateMutation.mutate({
                        applicationId: selectedApplication.application.id,
                        status: 'rejected',
                        adminNotes,
                      })
                    }
                    disabled={updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                    }}
                  >
                    <XCircle size={16} />
                    {t('admin.partners.reject')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
