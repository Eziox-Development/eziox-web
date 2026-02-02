import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
  ArrowLeft,
  Activity,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  getAbuseAlertsFn,
  getAbuseStatsFn,
  updateAlertStatusFn,
} from '@/server/functions/abuse-alerts'

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '99, 102, 241'
  const h = hex.slice(1)
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}

// Custom Dropdown Component with Theme Support
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
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
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
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
      >
        <span className="flex-1 text-left">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--foreground-muted)' }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 min-w-full z-[100] rounded-xl overflow-hidden shadow-xl"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
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
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors"
                style={{
                  background:
                    value === option.value ? 'var(--primary)' : 'transparent',
                  color:
                    value === option.value
                      ? 'var(--primary-foreground)'
                      : 'var(--foreground)',
                }}
                onMouseEnter={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.background =
                      'var(--background-secondary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.background = 'transparent'
                  }
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

// Alert Type Definition
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

export const Route = createFileRoute('/_protected/admin/abuse-alerts')({
  head: () => ({
    meta: [
      { title: 'Abuse Alerts | Admin | Eziox' },
      { name: 'description', content: 'Monitor and manage abuse alerts' },
    ],
  }),
  component: AbuseAlertsPage,
})

function AbuseAlertsPage() {
  const { currentUser } = useAuth()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const getAlerts = useServerFn(getAbuseAlertsFn)
  const getStats = useServerFn(getAbuseStatsFn)
  const updateStatus = useServerFn(updateAlertStatusFn)

  // Theme-aware styles
  const { colors, effects } = theme
  const glowOpacity =
    effects.glowIntensity === 'none'
      ? 0
      : effects.glowIntensity === 'subtle'
        ? 0.06
        : effects.glowIntensity === 'medium'
          ? 0.1
          : 0.15
  const animationDuration =
    effects.animationSpeed === 'slow'
      ? 0.4
      : effects.animationSpeed === 'fast'
        ? 0.15
        : 0.25
  const cardBg =
    effects.cardStyle === 'glass'
      ? `rgba(${hexToRgb(colors.card)}, 0.8)`
      : effects.cardStyle === 'gradient'
        ? `linear-gradient(135deg, ${colors.card}, ${colors.backgroundSecondary})`
        : colors.card
  const [statusFilter, setStatusFilter] = useState<string>('new')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionResult, setActionResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Check admin access
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'owner') {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-3xl"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(239, 68, 68, 0.4)',
                '0 0 0 20px rgba(239, 68, 68, 0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldAlert size={40} style={{ color: '#ef4444' }} />
          </motion.div>
          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Access Restricted
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
            This area requires admin privileges.
          </p>
        </motion.div>
      </div>
    )
  }

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
        message: 'Alert status updated successfully',
      })
      setTimeout(() => setActionResult(null), 3000)
    },
    onError: () => {
      setActionResult({
        type: 'error',
        message: 'Failed to update alert status',
      })
      setTimeout(() => setActionResult(null), 3000)
    },
  })

  const handleUpdateStatus = (
    status: 'reviewed' | 'resolved' | 'false_positive',
  ) => {
    if (!selectedAlert) return
    updateStatusMutation.mutate({
      data: {
        alertId: selectedAlert.id,
        status,
        notes: reviewNotes,
      },
    })
  }

  const statCards = [
    {
      title: 'New Alerts',
      value: stats?.newAlerts ?? 0,
      subtitle: 'Awaiting review',
      icon: AlertCircle,
      color: '#3b82f6',
      bgGradient:
        'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
    },
    {
      title: 'Critical',
      value: stats?.criticalAlerts ?? 0,
      subtitle: 'Require immediate action',
      icon: AlertTriangle,
      color: '#ef4444',
      bgGradient:
        'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
      pulse: (stats?.criticalAlerts ?? 0) > 0,
    },
    {
      title: 'Warnings',
      value: stats?.warningAlerts ?? 0,
      subtitle: 'Should be reviewed',
      icon: AlertCircle,
      color: '#f59e0b',
      bgGradient:
        'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))',
    },
    {
      title: 'Last 24h',
      value: stats?.last24h ?? 0,
      subtitle: 'Total alerts today',
      icon: Activity,
      color: '#10b981',
      bgGradient:
        'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
    },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background Effects - Theme-aware glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: `rgba(239, 68, 68, ${glowOpacity})` }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20 / animationDuration, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background: `rgba(${hexToRgb(colors.primary)}, ${glowOpacity})`,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15 / animationDuration, repeat: Infinity }}
        />
      </div>

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
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-80"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))',
                }}
                whileHover={{ scale: 1.05 }}
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
              </motion.div>
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Abuse Alerts
                </h1>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  Fair Use Policy monitoring and enforcement
                </p>
              </div>
            </div>

            <motion.button
              onClick={() => void refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
              style={{
                background: 'var(--background-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw
                size={16}
                className={alertsLoading ? 'animate-spin' : ''}
              />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + index * 0.05,
                duration: animationDuration,
              }}
              className="p-5 relative overflow-hidden"
              style={{
                background: cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 'var(--radius)',
                backdropFilter:
                  effects.cardStyle === 'glass' ? 'blur(12px)' : undefined,
              }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.bgGradient }}
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
                    card.value > 0 && card.title === 'Critical'
                      ? card.color
                      : 'var(--foreground)',
                }}
              >
                {statsLoading ? (
                  <Loader2
                    size={24}
                    className="animate-spin"
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                ) : (
                  card.value
                )}
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {card.title}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {card.subtitle}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: animationDuration }}
          className="mb-6 p-4 flex flex-wrap gap-4 relative z-20"
          style={{
            background: cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 'var(--radius)',
            backdropFilter:
              effects.cardStyle === 'glass' ? 'blur(12px)' : undefined,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Status:
            </span>
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Select Status"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'new', label: 'New' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'false_positive', label: 'False Positive' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Severity:
            </span>
            <CustomDropdown
              value={severityFilter}
              onChange={setSeverityFilter}
              placeholder="Select Severity"
              options={[
                { value: 'all', label: 'All Severity' },
                { value: 'critical', label: 'Critical' },
                { value: 'warning', label: 'Warning' },
                { value: 'info', label: 'Info' },
              ]}
            />
          </div>
        </motion.div>

        {/* Alerts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: animationDuration }}
          className="overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 'var(--radius)',
            backdropFilter:
              effects.cardStyle === 'glass' ? 'blur(12px)' : undefined,
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: colors.border }}>
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Alerts ({alertsData?.total ?? 0})
            </h2>
          </div>

          {alertsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: 'var(--foreground-muted)' }}
              />
            </div>
          ) : alertsData?.alerts?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle size={40} style={{ color: '#22c55e' }} />
              </motion.div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                All Clear!
              </h3>
              <p style={{ color: 'var(--foreground-muted)' }}>
                No abuse alerts match your current filters.
              </p>
            </motion.div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              {alertsData?.alerts?.map((alert: AlertType, index: number) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex items-start justify-between gap-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
                          style={{ color: 'var(--foreground)' }}
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
                                    : 'rgba(255, 255, 255, 0.1)',
                            color:
                              alert.status === 'new'
                                ? '#3b82f6'
                                : alert.status === 'reviewed'
                                  ? '#8b5cf6'
                                  : alert.status === 'resolved'
                                    ? '#22c55e'
                                    : 'var(--foreground-muted)',
                          }}
                        >
                          {alert.status}
                        </span>
                        {alert.emailSent && (
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--foreground-muted)',
                            }}
                          >
                            <Mail size={10} />
                            Sent
                          </span>
                        )}
                      </div>

                      <p
                        className="text-sm mb-2 line-clamp-2"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        {alert.description}
                      </p>

                      <div
                        className="flex flex-wrap items-center gap-3 text-xs"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        <span className="flex items-center gap-1">
                          <User size={12} />@{alert.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(alert.createdAt).toLocaleString('de-DE')}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded font-mono"
                          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                        >
                          {alert.alertType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setSelectedAlert(alert)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye size={14} />
                    Review
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
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
                background: 'var(--background)',
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
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
                      style={{ color: 'var(--foreground)' }}
                    >
                      {selectedAlert.title}
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      Review and take action
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 rounded-xl transition-colors hover:bg-white/10"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Alert Details */}
              <div
                className="rounded-2xl p-4 mb-6 space-y-4"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      User
                    </p>
                    <p
                      className="font-mono"
                      style={{ color: 'var(--foreground)' }}
                    >
                      @{selectedAlert.username}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      Email
                    </p>
                    <p
                      className="font-mono text-sm"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {selectedAlert.userEmail}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      Alert Type
                    </p>
                    <p
                      className="font-mono"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {selectedAlert.alertType}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      Created
                    </p>
                    <p style={{ color: 'var(--foreground)' }}>
                      {new Date(selectedAlert.createdAt).toLocaleString(
                        'de-DE',
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Description
                  </p>
                  <p style={{ color: 'var(--foreground)' }}>
                    {selectedAlert.description}
                  </p>
                </div>

                {selectedAlert.metadata &&
                  Object.keys(selectedAlert.metadata).length > 0 && (
                    <div>
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        Metadata
                      </p>
                      <pre
                        className="text-xs p-3 rounded-xl overflow-x-auto"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: 'var(--foreground)',
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
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      Previous Notes
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {selectedAlert.reviewNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Review Notes */}
              <div className="mb-6">
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  <MessageSquare size={14} />
                  Review Notes
                </label>
                <textarea
                  placeholder="Add notes about this alert..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all"
                  style={{
                    background: 'var(--background-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={() => handleUpdateStatus('false_positive')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                  style={{
                    background: 'var(--background-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <XCircle size={16} />
                  False Positive
                </motion.button>

                <motion.button
                  onClick={() => handleUpdateStatus('reviewed')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#8b5cf6',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye size={16} />
                  Mark Reviewed
                </motion.button>

                <motion.button
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))',
                    color: 'white',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Resolve
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
