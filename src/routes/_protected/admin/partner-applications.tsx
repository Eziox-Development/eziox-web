import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useAuth } from '@/hooks/use-auth'
import {
  getPartnerApplicationsFn,
  updateApplicationStatusFn,
  type PartnerApplicationWithUser,
} from '@/server/functions/partners'
import { CATEGORIES } from '@/lib/partner-categories'
import { getSocialUrl } from '@/lib/social-links'
import {
  Handshake,
  Search,
  Filter,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Mail,
  Globe,
  Calendar,
  MessageSquare,
  FileText,
  Loader2,
  ArrowLeft,
  Save,
  X,
  Tv,
  Gamepad2,
  Code,
  Palette,
  Music,
  Building2,
  Users,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/admin/partner-applications')({
  head: () => ({
    meta: [{ title: 'Partner Applications | Admin | Eziox' }],
  }),
  component: PartnerApplicationsPage,
})

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    icon: Clock,
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  reviewing: {
    label: 'Reviewing',
    color: '#3b82f6',
    icon: Eye,
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  approved: {
    label: 'Approved',
    color: '#10b981',
    icon: CheckCircle2,
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    icon: XCircle,
    bg: 'rgba(239, 68, 68, 0.1)',
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

function PartnerApplicationsPage() {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const getApplications = useServerFn(getPartnerApplicationsFn)
  const updateStatus = useServerFn(updateApplicationStatusFn)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] =
    useState<PartnerApplicationWithUser | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const {
    data: applications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['partner-applications'],
    queryFn: () => getApplications(),
    enabled: currentUser?.role === 'admin' || currentUser?.role === 'owner',
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

  if (
    !currentUser ||
    (currentUser.role !== 'admin' && currentUser.role !== 'owner')
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div className="text-center">
          <XCircle
            size={48}
            className="mx-auto mb-4"
            style={{ color: '#ef4444' }}
          />
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Access Denied
          </h1>
          <p style={{ color: 'var(--foreground-muted)' }}>
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    )
  }

  const filteredApplications =
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
        categoryFilter === 'all' || app.application.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    }) || []

  const stats = {
    total: applications?.length || 0,
    pending:
      applications?.filter((a) => a.application.status === 'pending').length ||
      0,
    reviewing:
      applications?.filter((a) => a.application.status === 'reviewing')
        .length || 0,
    approved:
      applications?.filter((a) => a.application.status === 'approved').length ||
      0,
    rejected:
      applications?.filter((a) => a.application.status === 'rejected').length ||
      0,
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryLabel = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId
  }

  const renderCategoryData = (data: Record<string, unknown> | null) => {
    if (!data || Object.keys(data).length === 0) return null

    return (
      <div className="space-y-2">
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
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {label}:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {value.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: '#8b5cf6',
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
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {label}:
                </span>
                <div className="space-y-1 mt-1">
                  {Object.entries(value as Record<string, string>).map(
                    ([k, v]) => {
                      if (!v) return null

                      // Convert platform name and username to full URL
                      const platformKey = k.toLowerCase().replace(/\s+/g, '')
                      const fullUrl = v.startsWith('http')
                        ? v
                        : getSocialUrl(platformKey, v)

                      return (
                        <div key={k} className="flex items-center gap-2">
                          <span
                            className="text-xs"
                            style={{ color: 'var(--foreground-muted)' }}
                          >
                            {k}:
                          </span>
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline hover:text-blue-400 transition-colors"
                            style={{ color: '#3b82f6' }}
                          >
                            {v}
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
                style={{ color: 'var(--foreground-muted)' }}
              >
                {label}:
              </span>
              <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                {String(value)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)',
              }}
            >
              <Handshake size={28} className="text-white" />
            </div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Partner Applications
              </h1>
              <p style={{ color: 'var(--foreground-muted)' }}>
                Review and manage partner applications
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total', value: stats.total, color: '#6b7280' },
              { label: 'Pending', value: stats.pending, color: '#f59e0b' },
              { label: 'Reviewing', value: stats.reviewing, color: '#3b82f6' },
              { label: 'Approved', value: stats.approved, color: '#10b981' },
              { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--foreground-muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, email, or company..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--foreground)',
              }}
            >
              <Filter size={18} />
              Filters
              <ChevronDown
                size={16}
                className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'all',
                        'pending',
                        'reviewing',
                        'approved',
                        'rejected',
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background:
                              statusFilter === status
                                ? 'rgba(139, 92, 246, 0.2)'
                                : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${statusFilter === status ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                            color:
                              statusFilter === status
                                ? '#8b5cf6'
                                : 'var(--foreground-muted)',
                          }}
                        >
                          {status === 'all'
                            ? 'All'
                            : STATUS_CONFIG[
                                status as keyof typeof STATUS_CONFIG
                              ]?.label || status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCategoryFilter('all')}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background:
                            categoryFilter === 'all'
                              ? 'rgba(139, 92, 246, 0.2)'
                              : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${categoryFilter === 'all' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                          color:
                            categoryFilter === 'all'
                              ? '#8b5cf6'
                              : 'var(--foreground-muted)',
                        }}
                      >
                        All
                      </button>
                      {CATEGORIES.slice(0, 6).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategoryFilter(cat.id)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background:
                              categoryFilter === cat.id
                                ? `${cat.color}20`
                                : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${categoryFilter === cat.id ? cat.color : 'rgba(255, 255, 255, 0.08)'}`,
                            color:
                              categoryFilter === cat.id
                                ? cat.color
                                : 'var(--foreground-muted)',
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Applications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: '#14b8a6' }}
            />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <XCircle
              size={48}
              className="mx-auto mb-4"
              style={{ color: '#ef4444' }}
            />
            <p style={{ color: 'var(--foreground-muted)' }}>
              Failed to load applications
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-20">
            <FileText
              size={48}
              className="mx-auto mb-4"
              style={{ color: 'var(--foreground-muted)' }}
            />
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              No Applications Found
            </h3>
            <p style={{ color: 'var(--foreground-muted)' }}>
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No partner applications have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onClick={() => {
                    setSelectedApplication(app)
                    setAdminNotes(app.application.adminNotes || '')
                  }}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        app.profile?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.user.username}`
                      }
                      alt={app.user.name || app.user.username}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className="font-semibold"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {app.user.name || app.user.username}
                        </h3>
                        <span
                          className="text-sm"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          @{app.user.username}
                        </span>
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: status.bg, color: status.color }}
                        >
                          <status.icon size={12} />
                          {status.label}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <span
                          className="flex items-center gap-1 text-sm"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          <CategoryIcon size={14} />
                          {getCategoryLabel(app.application.category)}
                        </span>
                        {app.application.companyName && (
                          <span
                            className="flex items-center gap-1 text-sm"
                            style={{ color: 'var(--foreground-muted)' }}
                          >
                            <Building2 size={14} />
                            {app.application.companyName}
                          </span>
                        )}
                        <span
                          className="flex items-center gap-1 text-sm"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          <Calendar size={14} />
                          {formatDate(app.application.createdAt)}
                        </span>
                      </div>
                      <p
                        className="text-sm mt-2 line-clamp-2"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        {app.application.description}
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      style={{ color: 'var(--foreground-muted)' }}
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
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  className="sticky top-0 z-10 p-6 pb-4"
                  style={{
                    background: 'var(--card)',
                    borderBottom: '1px solid var(--border)',
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
                          style={{ color: 'var(--foreground-muted)' }}
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
                            style={{ color: 'var(--foreground)' }}
                          >
                            {selectedApplication.user.name ||
                              selectedApplication.user.username}
                          </h2>
                          <p
                            className="text-sm"
                            style={{ color: 'var(--foreground-muted)' }}
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
                        style={{ color: 'var(--foreground-muted)' }}
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
                          style={{ background: status.bg, color: status.color }}
                        >
                          <status.icon size={16} />
                          {status.label}
                        </div>
                      )
                    })()}
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: '#8b5cf6',
                      }}
                    >
                      {(() => {
                        const CategoryIcon =
                          CATEGORY_ICONS[
                            selectedApplication.application.category
                          ] || MessageSquare
                        return <CategoryIcon size={16} />
                      })()}
                      {getCategoryLabel(
                        selectedApplication.application.category,
                      )}
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      Applied{' '}
                      {formatDate(selectedApplication.application.createdAt)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Mail
                        size={18}
                        style={{ color: 'var(--foreground-muted)' }}
                      />
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          Email
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {selectedApplication.user.email}
                        </p>
                      </div>
                    </div>
                    {selectedApplication.application.website && (
                      <div className="flex items-center gap-3">
                        <Globe
                          size={18}
                          style={{ color: 'var(--foreground-muted)' }}
                        />
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--foreground-muted)' }}
                          >
                            Website
                          </p>
                          <a
                            href={selectedApplication.application.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium underline"
                            style={{ color: '#3b82f6' }}
                          >
                            {selectedApplication.application.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedApplication.application.companyName && (
                      <div className="flex items-center gap-3">
                        <Building2
                          size={18}
                          style={{ color: 'var(--foreground-muted)' }}
                        />
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--foreground-muted)' }}
                          >
                            Company
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--foreground)' }}
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
                          style={{ color: 'var(--foreground-muted)' }}
                        />
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--foreground-muted)' }}
                          >
                            Audience Size
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--foreground)' }}
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
                          background: 'rgba(139, 92, 246, 0.05)',
                          border: '1px solid rgba(139, 92, 246, 0.1)',
                        }}
                      >
                        <h3
                          className="text-sm font-semibold mb-3"
                          style={{ color: '#8b5cf6' }}
                        >
                          Category Details
                        </h3>
                        {renderCategoryData(
                          selectedApplication.application
                            .categoryData as Record<string, unknown>,
                        )}
                      </div>
                    )}

                  {/* Description */}
                  <div>
                    <h3
                      className="text-sm font-semibold mb-2"
                      style={{ color: 'var(--foreground)' }}
                    >
                      About
                    </h3>
                    <p
                      className="text-sm whitespace-pre-wrap"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {selectedApplication.application.description}
                    </p>
                  </div>

                  {/* Why Partner */}
                  <div>
                    <h3
                      className="text-sm font-semibold mb-2"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Why Partner With Us?
                    </h3>
                    <p
                      className="text-sm whitespace-pre-wrap"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {selectedApplication.application.whyPartner}
                    </p>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <h3
                      className="text-sm font-semibold mb-2"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Admin Notes
                    </h3>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this application..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex flex-wrap gap-3 pt-4"
                    style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
                  >
                    {selectedApplication.application.status !== 'reviewing' && (
                      <motion.button
                        onClick={() =>
                          updateMutation.mutate({
                            applicationId: selectedApplication.application.id,
                            status: 'reviewing',
                            adminNotes: adminNotes || undefined,
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye size={16} />
                        Mark as Reviewing
                      </motion.button>
                    )}
                    {selectedApplication.application.status !== 'approved' && (
                      <motion.button
                        onClick={() =>
                          updateMutation.mutate({
                            applicationId: selectedApplication.application.id,
                            status: 'approved',
                            adminNotes: adminNotes || undefined,
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                        style={{
                          background:
                            'linear-gradient(135deg, #10b981, #14b8a6)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </motion.button>
                    )}
                    {selectedApplication.application.status !== 'rejected' && (
                      <motion.button
                        onClick={() =>
                          updateMutation.mutate({
                            applicationId: selectedApplication.application.id,
                            status: 'rejected',
                            adminNotes: adminNotes || undefined,
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <XCircle size={16} />
                        Reject
                      </motion.button>
                    )}
                    {adminNotes !==
                      (selectedApplication.application.adminNotes || '') && (
                      <motion.button
                        onClick={() =>
                          updateMutation.mutate({
                            applicationId: selectedApplication.application.id,
                            status: selectedApplication.application.status as
                              | 'pending'
                              | 'reviewing'
                              | 'approved'
                              | 'rejected',
                            adminNotes: adminNotes || undefined,
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'var(--foreground)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Save size={16} />
                        Save Notes
                      </motion.button>
                    )}
                    {updateMutation.isPending && (
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        <Loader2 size={16} className="animate-spin" />
                        Updating...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
