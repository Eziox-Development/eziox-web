import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { motion, AnimatePresence } from 'motion/react'
import {
  Scale,
  FileWarning,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Mail,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  adminGetTakedownRequestsFn,
  adminUpdateTakedownRequestFn,
  adminGetLicenseInquiriesFn,
  adminUpdateLicenseInquiryFn,
} from '@/server/functions/legal'

type LegalSubTab = 'takedowns' | 'licensing'

export function LegalTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [subTab, setSubTab] = useState<LegalSubTab>('takedowns')

  const subTabs = [
    { id: 'takedowns' as const, label: t('admin.legal.takedowns'), icon: FileWarning, color: '#ef4444' },
    { id: 'licensing' as const, label: t('admin.legal.licensing'), icon: Building2, color: '#8b5cf6' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl" style={{ background: `${theme.colors.primary}20` }}>
          <Scale size={24} style={{ color: theme.colors.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>
            {t('admin.legal.title')}
          </h2>
          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            {t('admin.legal.description')}
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            style={{
              background: subTab === tab.id ? `${tab.color}20` : `${theme.colors.foreground}05`,
              border: `2px solid ${subTab === tab.id ? tab.color : 'transparent'}`,
              color: subTab === tab.id ? tab.color : theme.colors.foreground,
            }}
          >
            <tab.icon size={18} />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {subTab === 'takedowns' && <TakedownsSection />}
          {subTab === 'licensing' && <LicensingSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TakedownsSection() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getTakedowns = useServerFn(adminGetTakedownRequestsFn)
  const updateTakedown = useServerFn(adminUpdateTakedownRequestFn)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-takedowns', statusFilter],
    queryFn: () => getTakedowns({ data: { status: statusFilter as 'all' | 'pending' | 'reviewing' | 'approved' | 'rejected', page: 1, limit: 50 } }),
  })

  const updateMutation = useMutation({
    mutationFn: (params: { requestId: string; status: 'pending' | 'reviewing' | 'approved' | 'rejected'; actionTaken?: 'content_removed' | 'user_warned' | 'no_action'; reviewNotes?: string }) =>
      updateTakedown({ data: params }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-takedowns'] })
    },
  })

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    reviewing: '#3b82f6',
    approved: '#22c55e',
    rejected: '#ef4444',
    counter_notice: '#8b5cf6',
  }

  const statusFilters = ['all', 'pending', 'reviewing', 'approved', 'rejected']

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: statusFilter === status ? theme.colors.primary : `${theme.colors.foreground}10`,
                color: statusFilter === status ? '#fff' : theme.colors.foreground,
              }}
            >
              {t(`admin.legal.status.${status}`)}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw size={14} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={24} style={{ color: theme.colors.primary }} />
        </div>
      ) : data?.requests.length === 0 ? (
        <div className="text-center py-12" style={{ color: theme.colors.foregroundMuted }}>
          {t('admin.legal.noRequests')}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.requests.map((request) => (
            <div
              key={request.id}
              className="p-4 rounded-xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${statusColors[request.status]}20`, color: statusColors[request.status] }}
                    >
                      {request.status}
                    </span>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      {request.claimType}
                    </span>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      #{request.id.slice(0, 8)}
                    </span>
                  </div>
                  <p className="font-medium mb-1" style={{ color: theme.colors.foreground }}>
                    {request.requesterName} ({request.requesterEmail})
                  </p>
                  <p className="text-sm mb-2" style={{ color: theme.colors.foregroundMuted }}>
                    {request.description.slice(0, 150)}...
                  </p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    <span className="flex items-center gap-1">
                      <ExternalLink size={12} />
                      <a href={request.contentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {request.contentUrl.slice(0, 40)}...
                      </a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMutation.mutate({ requestId: request.id, status: 'reviewing' })}
                        disabled={updateMutation.isPending}
                      >
                        <Eye size={14} className="mr-1" />
                        Review
                      </Button>
                    </>
                  )}
                  {request.status === 'reviewing' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateMutation.mutate({ requestId: request.id, status: 'approved', actionTaken: 'content_removed' })}
                        disabled={updateMutation.isPending}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateMutation.mutate({ requestId: request.id, status: 'rejected', actionTaken: 'no_action' })}
                        disabled={updateMutation.isPending}
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LicensingSection() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getInquiries = useServerFn(adminGetLicenseInquiriesFn)
  const updateInquiry = useServerFn(adminUpdateLicenseInquiryFn)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-licensing', statusFilter],
    queryFn: () => getInquiries({ data: { status: statusFilter as 'all' | 'new' | 'contacted' | 'negotiating' | 'closed_won' | 'closed_lost', page: 1, limit: 50 } }),
  })

  const updateMutation = useMutation({
    mutationFn: (params: { inquiryId: string; status: 'new' | 'contacted' | 'negotiating' | 'closed_won' | 'closed_lost' }) =>
      updateInquiry({ data: params }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-licensing'] })
    },
  })

  const statusColors: Record<string, string> = {
    new: '#3b82f6',
    contacted: '#f59e0b',
    negotiating: '#8b5cf6',
    closed_won: '#22c55e',
    closed_lost: '#6b7280',
  }

  const statusFilters = ['all', 'new', 'contacted', 'negotiating', 'closed_won', 'closed_lost']

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: statusFilter === status ? theme.colors.primary : `${theme.colors.foreground}10`,
                color: statusFilter === status ? '#fff' : theme.colors.foreground,
              }}
            >
              {t(`admin.legal.licenseStatus.${status}`)}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw size={14} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={24} style={{ color: theme.colors.primary }} />
        </div>
      ) : data?.inquiries.length === 0 ? (
        <div className="text-center py-12" style={{ color: theme.colors.foregroundMuted }}>
          {t('admin.legal.noInquiries')}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="p-4 rounded-xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${statusColors[inquiry.status]}20`, color: statusColors[inquiry.status] }}
                    >
                      {inquiry.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      {inquiry.licenseType}
                    </span>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      #{inquiry.id.slice(0, 8)}
                    </span>
                  </div>
                  <p className="font-medium mb-1" style={{ color: theme.colors.foreground }}>
                    {inquiry.name} {inquiry.company && `(${inquiry.company})`}
                  </p>
                  <p className="text-sm mb-2" style={{ color: theme.colors.foregroundMuted }}>
                    {inquiry.useCase.slice(0, 150)}...
                  </p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    <span className="flex items-center gap-1">
                      <Mail size={12} />
                      {inquiry.email}
                    </span>
                    {inquiry.expectedUsers && <span>Users: {inquiry.expectedUsers}</span>}
                    {inquiry.budget && <span>Budget: {inquiry.budget}</span>}
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Select
                    value={inquiry.status}
                    onValueChange={(value) => updateMutation.mutate({ inquiryId: inquiry.id, status: value as 'new' | 'contacted' | 'negotiating' | 'closed_won' | 'closed_lost' })}
                    disabled={updateMutation.isPending}
                  >
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t('admin.legal.licenseStatus.new')}</SelectItem>
                      <SelectItem value="contacted">{t('admin.legal.licenseStatus.contacted')}</SelectItem>
                      <SelectItem value="negotiating">{t('admin.legal.licenseStatus.negotiating')}</SelectItem>
                      <SelectItem value="closed_won">{t('admin.legal.licenseStatus.closed_won')}</SelectItem>
                      <SelectItem value="closed_lost">{t('admin.legal.licenseStatus.closed_lost')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ background: `${theme.colors.primary}20`, color: theme.colors.primary }}
                  >
                    <Mail size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
