import { useState, useRef, useEffect } from 'react'
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
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  RefreshCw,
  Eye,
  MessageSquare,
  ShieldAlert,
  Activity,
  ChevronDown,
  Loader2,
  Check,
  Search,
  Shield,
  AlertTriangle as WarningIcon,
  Trash2,
  Ban,
} from 'lucide-react'
import {
  getAbuseAlertsFn,
  getAbuseStatsFn,
  updateAlertStatusFn,
  banUserFromAlertFn,
  deleteLinkFromAlertFn,
} from '@/server/functions/abuse-alerts'
import {
  scanUrlWithVirusTotalFn,
} from '@/server/functions/virustotal'

type AlertType = {
  id: string
  userId: string
  alertType: string
  severity: string
  title: string
  description: string
  metadata: Record<string, unknown> | null
  status: string
  reviewedBy: string | null
  reviewedAt: Date | null
  reviewNotes: string | null
  emailSent: boolean | null
  createdAt: Date
  username: string | null
  userEmail: string | null
}

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all min-w-[140px]"
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.foreground,
        }}
      >
        <span className="flex-1 text-left">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: theme.colors.foregroundMuted }}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 min-w-full z-100 rounded-xl overflow-hidden shadow-xl"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/5"
                style={{
                  background:
                    value === option.value
                      ? theme.colors.primary
                      : 'transparent',
                  color:
                    value === option.value ? 'white' : theme.colors.foreground,
                }}
              >
                <span className="flex-1">{option.label}</span>
                {value === option.value && <Check size={14} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// VirusTotal URL Scanner Component
function VirusTotalScanner() {
  const { theme } = useTheme()
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    url?: string
    threatLevel?: string
    detectionRatio?: string
    categories?: string[]
    engines?: { name: string; result: string }[]
    lastAnalysisDate?: string
    error?: string
  } | null>(null)
  const [showResult, setShowResult] = useState(false)

  const scanUrlMutation = useMutation({
    mutationFn: async (urlToScan: string) => {
      const result = await scanUrlWithVirusTotalFn({ data: { url: urlToScan } })
      return result
    },
    onSuccess: (result) => {
      setScanResult(result)
      setShowResult(true)
      setIsScanning(false)
    },
    onError: (error) => {
      console.error('Scan failed:', error)
      setScanResult({
        success: false,
        error: 'Scan failed. Please check your API key configuration.',
      })
      setShowResult(true)
      setIsScanning(false)
    },
  })

  const handleScan = () => {
    if (!url.trim()) return
    setIsScanning(true)
    setShowResult(false)
    scanUrlMutation.mutate(url.trim())
  }

  const getThreatColor = (threatLevel: string) => {
    switch (threatLevel) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#f59e0b'
      case 'low': return '#3b82f6'
      default: return '#22c55e'
    }
  }

  const getThreatIcon = (threatLevel: string) => {
    switch (threatLevel) {
      case 'critical':
      case 'high':
        return <XCircle size={16} />
      case 'medium':
        return <WarningIcon size={16} />
      case 'low':
        return <AlertCircle size={16} />
      default:
        return <CheckCircle size={16} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl"
      style={{
        background: `${theme.colors.card}80`,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(34, 197, 94, 0.2)' }}
        >
          <Shield size={20} style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: theme.colors.foreground }}
          >
            VirusTotal URL Scanner
          </h3>
          <p
            className="text-sm"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Scan URLs for malware and phishing threats
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="url"
          placeholder="Enter URL to scan (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleScan()}
          className="flex-1 px-4 py-3 rounded-xl text-sm transition-all"
          style={{
            background: `${theme.colors.foreground}05`,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.foreground,
          }}
        />
        <button
          onClick={handleScan}
          disabled={!url.trim() || isScanning}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22c55e',
          }}
        >
          {isScanning ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {isScanning ? 'Scanning...' : 'Scan URL'}
        </button>
      </div>

      <AnimatePresence>
        {showResult && scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl"
            style={{
              background: scanResult.success 
                ? `${getThreatColor(scanResult.threatLevel || 'safe')}15`
                : 'rgba(239, 68, 68, 0.15)',
              border: scanResult.success
                ? `1px solid ${getThreatColor(scanResult.threatLevel || 'safe')}30`
                : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            {scanResult.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getThreatIcon(scanResult.threatLevel || 'safe')}
                  <span
                    className="font-medium capitalize"
                    style={{ color: getThreatColor(scanResult.threatLevel || 'safe') }}
                  >
                    Threat Level: {scanResult.threatLevel || 'safe'}
                  </span>
                  <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                    ({scanResult.detectionRatio})
                  </span>
                </div>

                <div className="text-sm" style={{ color: theme.colors.foreground }}>
                  <p className="mb-2">
                    <strong>URL:</strong> {scanResult.url}
                  </p>
                  {scanResult.categories && scanResult.categories.length > 0 && (
                    <p className="mb-2">
                      <strong>Categories:</strong> {scanResult.categories.join(', ')}
                    </p>
                  )}
                  {scanResult.engines && scanResult.engines.length > 0 && (
                    <div>
                      <strong className="block mb-1">Detected by:</strong>
                      <div className="space-y-1">
                        {scanResult.engines.slice(0, 5).map((engine: { name: string; result: string }, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <span style={{ color: theme.colors.foregroundMuted }}>
                              {engine.name}:
                            </span>
                            <span style={{ color: getThreatColor(scanResult.threatLevel || 'safe') }}>
                              {engine.result}
                            </span>
                          </div>
                        ))}
                        {scanResult.engines.length > 5 && (
                          <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                            ...and {scanResult.engines.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {scanResult.lastAnalysisDate && (
                    <p className="text-xs mt-2" style={{ color: theme.colors.foregroundMuted }}>
                      Last analyzed: {new Date(scanResult.lastAnalysisDate).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle size={16} style={{ color: '#ef4444' }} />
                <span style={{ color: '#ef4444' }}>
                  {scanResult.error || 'Scan failed'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function AbuseTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const getAlerts = useServerFn(getAbuseAlertsFn)
  const getStats = useServerFn(getAbuseStatsFn)
  const updateStatus = useServerFn(updateAlertStatusFn)
  const banUserFromAlert = useServerFn(banUserFromAlertFn)
  const deleteLinkFromAlert = useServerFn(deleteLinkFromAlertFn)

  const [statusFilter, setStatusFilter] = useState<string>('new')
  const [showBanModal, setShowBanModal] = useState(false)
  const [banDuration, setBanDuration] = useState(7)
  const [banUnit, setBanUnit] = useState<'hours' | 'days' | 'weeks' | 'months' | 'years' | 'permanent'>('days')
  const [banReason, setBanReason] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionResult, setActionResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['abuse-stats'],
    queryFn: () => getStats(),
    refetchInterval: 30000,
  })

  const {
    data: alertsData,
    isLoading: alertsLoading,
    refetch,
  } = useQuery({
    queryKey: ['abuse-alerts', statusFilter, severityFilter],
    queryFn: () =>
      getAlerts({
        data: {
          status:
            statusFilter === 'all' ? undefined : statusFilter || undefined,
          severity:
            severityFilter === 'all' ? undefined : severityFilter || undefined,
          limit: 50,
          offset: 0,
        },
      }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['abuse-alerts'] })
      void queryClient.invalidateQueries({ queryKey: ['abuse-stats'] })
      setSelectedAlert(null)
      setReviewNotes('')
      setActionResult({
        type: 'success',
        message: t('admin.abuse.statusUpdated'),
      })
      setTimeout(() => setActionResult(null), 3000)
    },
    onError: () => {
      setActionResult({
        type: 'error',
        message: t('admin.abuse.statusUpdateFailed'),
      })
      setTimeout(() => setActionResult(null), 3000)
    },
  })

  const handleUpdateStatus = (
    status: 'reviewed' | 'resolved' | 'false_positive',
  ) => {
    if (!selectedAlert) return
    updateStatusMutation.mutate({
      data: { alertId: selectedAlert.id, status, notes: reviewNotes },
    })
  }

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: banUserFromAlert,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['abuse-alerts'] })
      void queryClient.invalidateQueries({ queryKey: ['abuse-stats'] })
      setSelectedAlert(null)
      setShowBanModal(false)
      setBanReason('')
      setActionResult({ type: 'success', message: t('admin.abuse.userBanned') })
      setTimeout(() => setActionResult(null), 3000)
    },
    onError: () => {
      setActionResult({ type: 'error', message: t('admin.abuse.banFailed') })
      setTimeout(() => setActionResult(null), 3000)
    },
  })

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: deleteLinkFromAlert,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['abuse-alerts'] })
      void queryClient.invalidateQueries({ queryKey: ['abuse-stats'] })
      setSelectedAlert(null)
      setActionResult({ type: 'success', message: t('admin.abuse.linkDeleted') })
      setTimeout(() => setActionResult(null), 3000)
    },
    onError: () => {
      setActionResult({ type: 'error', message: t('admin.abuse.deleteFailed') })
      setTimeout(() => setActionResult(null), 3000)
    },
  })

  const handleBanUser = () => {
    if (!selectedAlert || !banReason.trim()) return
    banUserMutation.mutate({
      data: {
        alertId: selectedAlert.id,
        userId: selectedAlert.userId,
        duration: banDuration,
        unit: banUnit,
        type: 'temporary',
        reason: banReason,
        notes: reviewNotes,
      },
    })
  }

  const handleDeleteLink = () => {
    if (!selectedAlert) return
    const metadata = selectedAlert.metadata as Record<string, unknown> | null
    deleteLinkMutation.mutate({
      data: {
        alertId: selectedAlert.id,
        userId: selectedAlert.userId,
        linkUrl: metadata?.url as string | undefined,
        notes: reviewNotes,
      },
    })
  }

  const statCards = [
    {
      titleKey: 'admin.abuse.newAlerts',
      value: stats?.newAlerts ?? 0,
      subtitleKey: 'admin.abuse.awaitingReview',
      icon: AlertCircle,
      color: '#3b82f6',
    },
    {
      titleKey: 'admin.abuse.critical',
      value: stats?.criticalAlerts ?? 0,
      subtitleKey: 'admin.abuse.immediateAction',
      icon: AlertTriangle,
      color: '#ef4444',
      pulse: (stats?.criticalAlerts ?? 0) > 0,
    },
    {
      titleKey: 'admin.abuse.warnings',
      value: stats?.warningAlerts ?? 0,
      subtitleKey: 'admin.abuse.shouldReview',
      icon: AlertCircle,
      color: '#f59e0b',
    },
    {
      titleKey: 'admin.abuse.last24h',
      value: stats?.last24h ?? 0,
      subtitleKey: 'admin.abuse.totalToday',
      icon: Activity,
      color: '#10b981',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {actionResult && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl flex items-center gap-3"
            style={{
              background:
                actionResult.type === 'success'
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
              backdropFilter: 'blur(20px)',
            }}
          >
            {actionResult.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <span className="text-white font-medium">
              {actionResult.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
            style={{
              background:
                'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))',
            }}
          >
            <ShieldAlert size={28} style={{ color: '#ef4444' }} />
            {(stats?.criticalAlerts ?? 0) > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#ef4444', color: 'white' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {stats?.criticalAlerts}
              </motion.div>
            )}
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: theme.colors.foreground }}
            >
              {t('admin.abuse.title')}
            </h1>
            <p style={{ color: theme.colors.foregroundMuted }}>
              {t('admin.abuse.description')}
            </p>
          </div>
        </div>
        <button
          onClick={() => void refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02]"
          style={{
            background: `${theme.colors.foreground}08`,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.foreground,
          }}
        >
          <RefreshCw
            size={16}
            className={alertsLoading ? 'animate-spin' : ''}
          />
          {t('common.refresh')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.titleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 rounded-2xl relative overflow-hidden"
            style={{
              background: `${theme.colors.card}80`,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}20` }}
              >
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              {card.pulse && (
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ background: card.color }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <div
              className="text-3xl font-bold mb-1"
              style={{
                color:
                  card.value > 0 && card.titleKey === 'admin.abuse.critical'
                    ? card.color
                    : theme.colors.foreground,
              }}
            >
              {statsLoading ? (
                <Loader2
                  size={24}
                  className="animate-spin"
                  style={{ color: theme.colors.foregroundMuted }}
                />
              ) : (
                card.value
              )}
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: theme.colors.foreground }}
            >
              {t(card.titleKey)}
            </p>
            <p
              className="text-xs"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t(card.subtitleKey)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* VirusTotal URL Scanner */}
      <VirusTotalScanner />

      {/* Filters */}
      <div
        className="p-4 flex flex-wrap gap-4 rounded-2xl relative z-20"
        style={{
          background: `${theme.colors.card}80`,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('admin.abuse.status')}:
          </span>
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder={t('admin.abuse.selectStatus')}
            options={[
              { value: 'all', label: t('admin.abuse.allStatus') },
              { value: 'new', label: t('admin.abuse.new') },
              { value: 'reviewed', label: t('admin.abuse.reviewed') },
              { value: 'resolved', label: t('admin.abuse.resolved') },
              {
                value: 'false_positive',
                label: t('admin.abuse.falsePositive'),
              },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('admin.abuse.severity')}:
          </span>
          <CustomDropdown
            value={severityFilter}
            onChange={setSeverityFilter}
            placeholder={t('admin.abuse.selectSeverity')}
            options={[
              { value: 'all', label: t('admin.abuse.allSeverity') },
              { value: 'critical', label: t('admin.abuse.critical') },
              { value: 'warning', label: t('admin.abuse.warning') },
              { value: 'info', label: t('admin.abuse.info') },
            ]}
          />
        </div>
      </div>

      {/* Alerts List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: `${theme.colors.card}80`,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          className="p-4"
          style={{ borderBottom: `1px solid ${theme.colors.border}` }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: theme.colors.foreground }}
          >
            {t('admin.abuse.alerts')} ({alertsData?.total ?? 0})
          </h2>
        </div>

        {alertsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: theme.colors.foregroundMuted }}
            />
          </div>
        ) : alertsData?.alerts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <CheckCircle size={40} style={{ color: '#22c55e' }} />
            </div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: theme.colors.foreground }}
            >
              {t('admin.abuse.allClear')}
            </h3>
            <p style={{ color: theme.colors.foregroundMuted }}>
              {t('admin.abuse.noAlerts')}
            </p>
          </div>
        ) : (
          <div>
            {alertsData?.alerts?.map((alert: AlertType, index: number) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex items-start justify-between gap-4 transition-colors hover:bg-white/2"
                style={{ borderBottom: `1px solid ${theme.colors.border}30` }}
              >
                <div className="flex gap-4 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        alert.severity === 'critical'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : alert.severity === 'warning'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    {alert.severity === 'critical' ? (
                      <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                    ) : alert.severity === 'warning' ? (
                      <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                    ) : (
                      <Info size={20} style={{ color: '#3b82f6' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className="font-semibold"
                        style={{ color: theme.colors.foreground }}
                      >
                        {alert.title}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background:
                            alert.severity === 'critical'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : alert.severity === 'warning'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(59, 130, 246, 0.15)',
                          color:
                            alert.severity === 'critical'
                              ? '#ef4444'
                              : alert.severity === 'warning'
                                ? '#f59e0b'
                                : '#3b82f6',
                        }}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background:
                            alert.status === 'new'
                              ? 'rgba(59, 130, 246, 0.15)'
                              : alert.status === 'reviewed'
                                ? 'rgba(139, 92, 246, 0.15)'
                                : alert.status === 'resolved'
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : `${theme.colors.foreground}10`,
                          color:
                            alert.status === 'new'
                              ? '#3b82f6'
                              : alert.status === 'reviewed'
                                ? '#8b5cf6'
                                : alert.status === 'resolved'
                                  ? '#22c55e'
                                  : theme.colors.foregroundMuted,
                        }}
                      >
                        {alert.status}
                      </span>
                      {alert.emailSent && (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                          style={{
                            background: `${theme.colors.foreground}05`,
                            color: theme.colors.foregroundMuted,
                          }}
                        >
                          <Mail size={10} />
                          {t('admin.abuse.sent')}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm mb-2 line-clamp-2"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {alert.description}
                    </p>
                    <div
                      className="flex flex-wrap items-center gap-3 text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      <span className="flex items-center gap-1">
                        <User size={12} />@{alert.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded font-mono"
                        style={{ background: `${theme.colors.foreground}05` }}
                      >
                        {alert.alertType}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(alert)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0 hover:scale-[1.02]"
                  style={{
                    background: `${theme.colors.foreground}08`,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                >
                  <Eye size={14} />
                  {t('admin.abuse.review')}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6"
              style={{
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        selectedAlert.severity === 'critical'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : selectedAlert.severity === 'warning'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    {selectedAlert.severity === 'critical' ? (
                      <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                    ) : selectedAlert.severity === 'warning' ? (
                      <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                    ) : (
                      <Info size={24} style={{ color: '#3b82f6' }} />
                    )}
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {selectedAlert.title}
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('admin.abuse.reviewAndAction')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 rounded-xl transition-colors hover:bg-white/10"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div
                className="rounded-2xl p-4 mb-6 space-y-4"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('admin.abuse.user')}
                    </p>
                    <p
                      className="font-mono"
                      style={{ color: theme.colors.foreground }}
                    >
                      @{selectedAlert.username}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('admin.abuse.email')}
                    </p>
                    <p
                      className="font-mono text-sm"
                      style={{ color: theme.colors.foreground }}
                    >
                      {selectedAlert.userEmail}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('admin.abuse.alertType')}
                    </p>
                    <p
                      className="font-mono"
                      style={{ color: theme.colors.foreground }}
                    >
                      {selectedAlert.alertType}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('admin.abuse.created')}
                    </p>
                    <p style={{ color: theme.colors.foreground }}>
                      {new Date(selectedAlert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('admin.abuse.descriptionLabel')}
                  </p>
                  <p style={{ color: theme.colors.foreground }}>
                    {selectedAlert.description}
                  </p>
                </div>
                {selectedAlert.metadata &&
                  Object.keys(selectedAlert.metadata).length > 0 && (
                    <div>
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {t('admin.abuse.metadata')}
                      </p>
                      <pre
                        className="text-xs p-3 rounded-xl overflow-x-auto"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: theme.colors.foreground,
                        }}
                      >
                        {JSON.stringify(selectedAlert.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                {selectedAlert.reviewNotes && (
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('admin.abuse.previousNotes')}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foreground }}
                    >
                      {selectedAlert.reviewNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  <MessageSquare size={14} />
                  {t('admin.abuse.reviewNotes')}
                </label>
                <textarea
                  placeholder={t('admin.abuse.addNotes')}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all"
                  style={{
                    background: `${theme.colors.foreground}05`,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleUpdateStatus('false_positive')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
                  style={{
                    background: `${theme.colors.foreground}08`,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                >
                  <XCircle size={16} />
                  {t('admin.abuse.falsePositive')}
                </button>
                <button
                  onClick={() => handleUpdateStatus('reviewed')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#8b5cf6',
                  }}
                >
                  <Eye size={16} />
                  {t('admin.abuse.markReviewed')}
                </button>
                <button
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#22c55e',
                  }}
                >
                  <CheckCircle size={16} />
                  {t('admin.abuse.markResolved')}
                </button>
              </div>

              {/* Delete & Ban Actions */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: `${theme.colors.border}50` }}>
                <p className="text-xs font-medium mb-3" style={{ color: theme.colors.foregroundMuted }}>
                  {t('admin.abuse.dangerZone')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {/* Delete Link Button - only show for link-related alerts */}
                  {(selectedAlert.alertType === 'malicious_link' || 
                    selectedAlert.alertType === 'spam_link' ||
                    !!(selectedAlert.metadata as Record<string, unknown> | null)?.url) && (
                    <button
                      onClick={handleDeleteLink}
                      disabled={deleteLinkMutation.isPending || banUserMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
                      style={{
                        background: 'rgba(249, 115, 22, 0.15)',
                        border: '1px solid rgba(249, 115, 22, 0.3)',
                        color: '#f97316',
                      }}
                    >
                      {deleteLinkMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {t('admin.abuse.deleteLink')}
                    </button>
                  )}

                  {/* Ban User Button */}
                  <button
                    onClick={() => setShowBanModal(true)}
                    disabled={deleteLinkMutation.isPending || banUserMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                    }}
                  >
                    <Ban size={16} />
                    {t('admin.abuse.banUser')}
                  </button>
                </div>
              </div>

              {/* Ban Modal */}
              <AnimatePresence>
                {showBanModal && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-4 rounded-xl"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <p className="text-sm font-medium mb-3" style={{ color: '#ef4444' }}>
                      {t('admin.abuse.banUserConfirm')}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={banDuration}
                          onChange={(e) => setBanDuration(Number(e.target.value))}
                          className="w-20 px-3 py-2 rounded-lg text-sm"
                          style={{
                            background: `${theme.colors.foreground}05`,
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.foreground,
                          }}
                        />
                        <Select
                          value={banUnit}
                          onValueChange={(value) => setBanUnit(value as typeof banUnit)}
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
                            <SelectItem value="permanent">{t('admin.moderation.permanent')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <input
                        type="text"
                        placeholder={t('admin.abuse.banReasonPlaceholder')}
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: `${theme.colors.foreground}05`,
                          border: `1px solid ${theme.colors.border}`,
                          color: theme.colors.foreground,
                        }}
                      />
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowBanModal(false)}
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                          style={{
                            background: `${theme.colors.foreground}08`,
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.foreground,
                          }}
                        >
                          {t('common.cancel')}
                        </button>
                        <button
                          onClick={handleBanUser}
                          disabled={!banReason.trim() || banUserMutation.isPending}
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                          }}
                        >
                          {banUserMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin mx-auto" />
                          ) : (
                            t('admin.abuse.confirmBan')
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
