import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { motion, AnimatePresence } from 'motion/react'
import {
  Shield,
  Key,
  AlertTriangle,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Loader2,
  RefreshCw,
  Plus,
  Copy,
  Building2,
  Globe,
  Users,
  Calendar,
  Send,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { useAuth } from '@/hooks/use-auth'
import {
  getCommercialLicensesFn,
  createCommercialLicenseFn,
  updateLicenseStatusFn,
  getComplianceViolationsFn,
  updateComplianceViolationFn,
  reportComplianceViolationFn,
  getComplianceDashboardStatsFn,
} from '@/server/functions/license-compliance'

type ComplianceSubTab = 'overview' | 'licenses' | 'violations' | 'create'

export function ComplianceTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const [subTab, setSubTab] = useState<ComplianceSubTab>('overview')
  const isOwner = currentUser?.role === 'owner'

  const subTabs = [
    { id: 'overview' as const, label: t('admin.compliance.overview'), icon: BarChart3, color: theme.colors.primary },
    { id: 'licenses' as const, label: t('admin.compliance.licenses'), icon: Key, color: '#22c55e' },
    { id: 'violations' as const, label: t('admin.compliance.violations'), icon: AlertTriangle, color: '#ef4444' },
    ...(isOwner ? [{ id: 'create' as const, label: t('admin.compliance.createLicense'), icon: Plus, color: '#8b5cf6' }] : []),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl" style={{ background: `${theme.colors.primary}20` }}>
          <Shield size={24} style={{ color: theme.colors.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>
            {t('admin.compliance.title')}
          </h2>
          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            {t('admin.compliance.description')}
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
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
          {subTab === 'overview' && <OverviewSection />}
          {subTab === 'licenses' && <LicensesSection />}
          {subTab === 'violations' && <ViolationsSection />}
          {subTab === 'create' && isOwner && <CreateLicenseSection onSuccess={() => setSubTab('licenses')} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function OverviewSection() {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const getStats = useServerFn(getComplianceDashboardStatsFn)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['compliance-stats'],
    queryFn: () => getStats({}),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} style={{ color: theme.colors.primary }} />
      </div>
    )
  }

  const statCards = [
    { label: t('admin.compliance.stats.activeLicenses'), value: stats?.activeLicenses ?? 0, icon: Key, color: '#22c55e' },
    { label: t('admin.compliance.stats.pendingViolations'), value: stats?.pendingViolations ?? 0, icon: AlertTriangle, color: '#f59e0b' },
    { label: t('admin.compliance.stats.criticalViolations'), value: stats?.criticalViolations ?? 0, icon: XCircle, color: '#ef4444' },
    { label: t('admin.compliance.stats.recentViolations'), value: stats?.recentViolations ?? 0, icon: Clock, color: '#3b82f6' },
    { label: t('admin.compliance.stats.pendingInquiries'), value: stats?.pendingInquiries ?? 0, icon: Mail, color: '#8b5cf6' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ background: `${stat.color}20` }}>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>
            {stat.value}
          </p>
          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}

function LicensesSection() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const isOwner = currentUser?.role === 'owner'

  const getLicenses = useServerFn(getCommercialLicensesFn)
  const updateStatus = useServerFn(updateLicenseStatusFn)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['commercial-licenses', statusFilter],
    queryFn: () => getLicenses({ data: { status: statusFilter as 'all' | 'active' | 'suspended' | 'expired' | 'revoked', page: 1, limit: 50 } }),
  })

  const updateMutation = useMutation({
    mutationFn: (params: { licenseId: string; status: 'active' | 'suspended' | 'revoked'; reason?: string }) =>
      updateStatus({ data: params }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['commercial-licenses'] })
    },
  })

  const statusColors: Record<string, string> = {
    active: '#22c55e',
    suspended: '#f59e0b',
    expired: '#6b7280',
    revoked: '#ef4444',
  }

  const statusFilters = ['all', 'active', 'suspended', 'expired', 'revoked']

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
              {t(`admin.compliance.licenseStatus.${status}`)}
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
      ) : data?.licenses.length === 0 ? (
        <div className="text-center py-12" style={{ color: theme.colors.foregroundMuted }}>
          {t('admin.compliance.noLicenses')}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.licenses.map((license) => (
            <div
              key={license.id}
              className="p-4 rounded-xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${statusColors[license.status]}20`, color: statusColors[license.status] }}
                    >
                      {license.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${theme.colors.foreground}10`, color: theme.colors.foreground }}>
                      {license.licenseType}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <code
                      className="text-sm font-mono px-2 py-1 rounded cursor-pointer hover:opacity-80"
                      style={{ background: `${theme.colors.foreground}10`, color: theme.colors.primary }}
                      onClick={() => copyToClipboard(license.licenseKey)}
                      title="Click to copy"
                    >
                      {license.licenseKey}
                    </code>
                    <button onClick={() => copyToClipboard(license.licenseKey)} className="p-1 hover:opacity-70">
                      <Copy size={14} style={{ color: theme.colors.foregroundMuted }} />
                    </button>
                  </div>

                  <p className="font-medium flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                    <Building2 size={14} />
                    {license.licenseeName} {license.licenseeCompany && `(${license.licenseeCompany})`}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs flex-wrap" style={{ color: theme.colors.foregroundMuted }}>
                    <span className="flex items-center gap-1">
                      <Globe size={12} />
                      {license.allowedDomains.join(', ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {license.maxUsers ? `${license.maxUsers} users` : 'Unlimited'}
                    </span>
                    {license.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Expires: {new Date(license.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {isOwner && license.status === 'active' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ licenseId: license.id, status: 'suspended', reason: 'Suspended by admin' })}
                      disabled={updateMutation.isPending}
                    >
                      Suspend
                    </Button>
                  </div>
                )}
                {isOwner && license.status === 'suspended' && (
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ licenseId: license.id, status: 'active' })}
                    disabled={updateMutation.isPending}
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ViolationsSection() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showReportForm, setShowReportForm] = useState(false)

  const getViolations = useServerFn(getComplianceViolationsFn)
  const updateViolation = useServerFn(updateComplianceViolationFn)
  const reportViolation = useServerFn(reportComplianceViolationFn)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['compliance-violations', statusFilter],
    queryFn: () => getViolations({ data: { status: statusFilter as 'all' | 'detected' | 'investigating' | 'confirmed' | 'resolved' | 'false_positive' | 'escalated', page: 1, limit: 50 } }),
  })

  const updateMutation = useMutation({
    mutationFn: (params: { violationId: string; status: 'detected' | 'investigating' | 'confirmed' | 'resolved' | 'false_positive' | 'escalated'; enforcementAction?: 'warning_sent' | 'license_suspended' | 'legal_notice' | 'dmca_filed' | 'resolved_licensed' }) =>
      updateViolation({ data: params }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['compliance-violations'] })
    },
  })

  const [reportForm, setReportForm] = useState({
    detectedDomain: '',
    violationType: 'commercial_use' as const,
    severity: 'medium' as const,
    evidenceDescription: '',
    contactEmail: '',
  })

  const reportMutation = useMutation({
    mutationFn: () => reportViolation({ data: reportForm }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['compliance-violations'] })
      setShowReportForm(false)
      setReportForm({ detectedDomain: '', violationType: 'commercial_use', severity: 'medium', evidenceDescription: '', contactEmail: '' })
    },
  })

  const statusColors: Record<string, string> = {
    detected: '#f59e0b',
    investigating: '#3b82f6',
    confirmed: '#ef4444',
    resolved: '#22c55e',
    false_positive: '#6b7280',
    escalated: '#8b5cf6',
  }

  const severityColors: Record<string, string> = {
    low: '#6b7280',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  }

  const statusFilters = ['all', 'detected', 'investigating', 'confirmed', 'resolved', 'false_positive']

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowReportForm(!showReportForm)} className="gap-2">
            <Plus size={14} />
            Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw size={14} />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <h3 className="font-semibold mb-4" style={{ color: theme.colors.foreground }}>
            Report Violation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: theme.colors.foregroundMuted }}>Domain *</label>
              <Input
                value={reportForm.detectedDomain}
                onChange={(e) => setReportForm({ ...reportForm, detectedDomain: e.target.value })}
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: theme.colors.foregroundMuted }}>Contact Email</label>
              <Input
                type="email"
                value={reportForm.contactEmail}
                onChange={(e) => setReportForm({ ...reportForm, contactEmail: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: theme.colors.foregroundMuted }}>Type</label>
              <Select
                value={reportForm.violationType}
                onValueChange={(value) => setReportForm({ ...reportForm, violationType: value as typeof reportForm.violationType })}
              >
                <SelectTrigger
                  className="w-full h-10 rounded-xl border-0 backdrop-blur-sm transition-all"
                  style={{ 
                    background: `${theme.colors.foreground}08`,
                    color: theme.colors.foreground,
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border-0 backdrop-blur-xl shadow-2xl"
                  style={{ 
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <SelectItem value="commercial_use" className="rounded-lg cursor-pointer">Commercial Use</SelectItem>
                  <SelectItem value="saas_offering" className="rounded-lg cursor-pointer">SaaS Offering</SelectItem>
                  <SelectItem value="unlicensed_domain" className="rounded-lg cursor-pointer">Unlicensed Domain</SelectItem>
                  <SelectItem value="domain_mismatch" className="rounded-lg cursor-pointer">Domain Mismatch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: theme.colors.foregroundMuted }}>Severity</label>
              <Select
                value={reportForm.severity}
                onValueChange={(value) => setReportForm({ ...reportForm, severity: value as typeof reportForm.severity })}
              >
                <SelectTrigger
                  className="w-full h-10 rounded-xl border-0 backdrop-blur-sm transition-all"
                  style={{ 
                    background: `${theme.colors.foreground}08`,
                    color: theme.colors.foreground,
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border-0 backdrop-blur-xl shadow-2xl"
                  style={{ 
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <SelectItem value="low" className="rounded-lg cursor-pointer">Low</SelectItem>
                  <SelectItem value="medium" className="rounded-lg cursor-pointer">Medium</SelectItem>
                  <SelectItem value="high" className="rounded-lg cursor-pointer">High</SelectItem>
                  <SelectItem value="critical" className="rounded-lg cursor-pointer">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1" style={{ color: theme.colors.foregroundMuted }}>Evidence Description *</label>
              <textarea
                value={reportForm.evidenceDescription}
                onChange={(e) => setReportForm({ ...reportForm, evidenceDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-lg resize-none"
                rows={3}
                style={{ background: `${theme.colors.foreground}10`, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowReportForm(false)}>Cancel</Button>
            <Button
              onClick={() => reportMutation.mutate()}
              disabled={!reportForm.detectedDomain || !reportForm.evidenceDescription || reportMutation.isPending}
            >
              {reportMutation.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Submit Report
            </Button>
          </div>
        </motion.div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={24} style={{ color: theme.colors.primary }} />
        </div>
      ) : data?.violations.length === 0 ? (
        <div className="text-center py-12" style={{ color: theme.colors.foregroundMuted }}>
          {t('admin.compliance.noViolations')}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.violations.map((violation) => (
            <div
              key={violation.id}
              className="p-4 rounded-xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${statusColors[violation.status]}20`, color: statusColors[violation.status] }}
                    >
                      {violation.status.replace('_', ' ')}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${severityColors[violation.severity]}20`, color: severityColors[violation.severity] }}
                    >
                      {violation.severity}
                    </span>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      {violation.violationType.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="font-medium flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                    <Globe size={14} />
                    {violation.detectedDomain}
                  </p>
                  
                  <p className="text-sm mt-1" style={{ color: theme.colors.foregroundMuted }}>
                    {violation.evidenceDescription?.slice(0, 150)}...
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    <span>{violation.detectionMethod}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(violation.createdAt).toLocaleDateString()}
                    </span>
                    {violation.contactAttempts && violation.contactAttempts > 0 && (
                      <span>{violation.contactAttempts} contact attempts</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {violation.status === 'detected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ violationId: violation.id, status: 'investigating' })}
                      disabled={updateMutation.isPending}
                    >
                      <Eye size={14} className="mr-1" />
                      Investigate
                    </Button>
                  )}
                  {violation.status === 'investigating' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMutation.mutate({ violationId: violation.id, status: 'confirmed', enforcementAction: 'warning_sent' })}
                        disabled={updateMutation.isPending}
                      >
                        <Send size={14} className="mr-1" />
                        Send Warning
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMutation.mutate({ violationId: violation.id, status: 'false_positive' })}
                        disabled={updateMutation.isPending}
                      >
                        False Positive
                      </Button>
                    </>
                  )}
                  {violation.status === 'confirmed' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateMutation.mutate({ violationId: violation.id, status: 'resolved', enforcementAction: 'resolved_licensed' })}
                      disabled={updateMutation.isPending}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Resolved
                    </Button>
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

function CreateLicenseSection({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const createLicense = useServerFn(createCommercialLicenseFn)

  const [formData, setFormData] = useState({
    licenseeName: '',
    licenseeEmail: '',
    licenseeCompany: '',
    licenseType: 'commercial' as const,
    maxDomains: 1,
    maxUsers: undefined as number | undefined,
    allowedDomains: [''],
    expiresAt: '',
    internalNotes: '',
  })

  const createMutation = useMutation({
    mutationFn: () => createLicense({
      data: {
        ...formData,
        licenseeCompany: formData.licenseeCompany || undefined,
        allowedDomains: formData.allowedDomains.filter(Boolean),
        expiresAt: formData.expiresAt || undefined,
        internalNotes: formData.internalNotes || undefined,
      },
    }),
    onSuccess: () => {
      onSuccess()
    },
  })

  const addDomain = () => {
    setFormData({ ...formData, allowedDomains: [...formData.allowedDomains, ''] })
  }

  const updateDomain = (index: number, value: string) => {
    const newDomains = [...formData.allowedDomains]
    newDomains[index] = value
    setFormData({ ...formData, allowedDomains: newDomains })
  }

  const removeDomain = (index: number) => {
    if (formData.allowedDomains.length > 1) {
      setFormData({ ...formData, allowedDomains: formData.allowedDomains.filter((_, i) => i !== index) })
    }
  }

  const canSubmit = formData.licenseeName && formData.licenseeEmail && formData.allowedDomains.some(Boolean)

  return (
    <div className="p-6 rounded-xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
      <h3 className="text-lg font-semibold mb-6" style={{ color: theme.colors.foreground }}>
        {t('admin.compliance.createLicenseTitle')}
      </h3>

      <div className="space-y-6">
        {/* Licensee Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
              Licensee Name *
            </label>
            <Input
              value={formData.licenseeName}
              onChange={(e) => setFormData({ ...formData, licenseeName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
              Licensee Email *
            </label>
            <Input
              type="email"
              value={formData.licenseeEmail}
              onChange={(e) => setFormData({ ...formData, licenseeEmail: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
              Company
            </label>
            <Input
              value={formData.licenseeCompany}
              onChange={(e) => setFormData({ ...formData, licenseeCompany: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
              License Type *
            </label>
            <Select
              value={formData.licenseType}
              onValueChange={(value) => setFormData({ ...formData, licenseType: value as typeof formData.licenseType })}
            >
              <SelectTrigger
                className="w-full h-10 rounded-xl border-0 backdrop-blur-sm transition-all"
                style={{ 
                  background: `${theme.colors.foreground}08`,
                  color: theme.colors.foreground,
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="rounded-xl border-0 backdrop-blur-xl shadow-2xl"
                style={{ 
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <SelectItem value="commercial" className="rounded-lg cursor-pointer">Commercial</SelectItem>
                <SelectItem value="enterprise" className="rounded-lg cursor-pointer">Enterprise</SelectItem>
                <SelectItem value="saas" className="rounded-lg cursor-pointer">SaaS</SelectItem>
                <SelectItem value="reseller" className="rounded-lg cursor-pointer">Reseller</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Domains */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
            Allowed Domains *
          </label>
          <div className="space-y-2">
            {formData.allowedDomains.map((domain, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={domain}
                  onChange={(e) => updateDomain(index, e.target.value)}
                  placeholder="example.com"
                />
                {formData.allowedDomains.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => removeDomain(index)}>
                    <XCircle size={14} />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addDomain} className="gap-2">
              <Plus size={14} />
              Add Domain
            </Button>
          </div>
        </div>

        {/* Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
              Max Domains
            </label>
            <Input
              type="number"
              min={1}
              value={formData.maxDomains}
              onChange={(e) => setFormData({ ...formData, maxDomains: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
              Max Users (empty = unlimited)
            </label>
            <Input
              type="number"
              min={1}
              value={formData.maxUsers || ''}
              onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
              Expires At (empty = perpetual)
            </label>
            <DatePicker
              value={formData.expiresAt}
              onChange={(value) => setFormData({ ...formData, expiresAt: value })}
              placeholder="Select expiration date"
              fromYear={new Date().getFullYear()}
              toYear={new Date().getFullYear() + 10}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
            Internal Notes
          </label>
          <textarea
            value={formData.internalNotes}
            onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
            className="w-full px-3 py-2 rounded-lg resize-none"
            rows={3}
            style={{ background: `${theme.colors.foreground}10`, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canSubmit || createMutation.isPending}
            className="gap-2"
          >
            {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            Create License
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-sm text-red-500 text-center">
            Failed to create license. Please try again.
          </p>
        )}
      </div>
    </div>
  )
}
