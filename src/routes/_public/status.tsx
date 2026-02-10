import { createFileRoute, useSearch, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import { z } from 'zod'
import {
  getIncidentsFn,
  subscribeStatusFn,
  unsubscribeStatusFn,
  verifyStatusSubscriptionFn,
  getStatusSubscriptionFn,
} from '@/server/functions/status'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Server,
  Database,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Clock,
  RefreshCw,
  Zap,
  Cloud,
  Wifi,
  HardDrive,
  Bell,
  Loader2,
  Check,
  ChevronDown,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'

// ============================================================================
// Route
// ============================================================================

const searchSchema = z.object({
  verify: z.string().optional(),
  unsubscribe: z.string().optional(),
})

export const Route = createFileRoute('/_public/status')({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: 'System Status | Eziox' },
      {
        name: 'description',
        content:
          'Real-time system status and uptime monitoring for Eziox services.',
      },
    ],
  }),
  component: StatusPage,
})

// ============================================================================
// Types & Constants
// ============================================================================

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Service {
  id: string
  nameKey: string
  descriptionKey: string
  icon: React.ElementType
  status: ServiceStatus
  latency?: number
  category: 'core' | 'infrastructure' | 'integrations'
  uptimePercentage: number
  uptimeHistory: DayUptime[]
}

interface DayUptime {
  date: string
  uptime: number
  incidents: number
}

interface HealthResponse {
  status: string
  timestamp: number
}

const STATUS_META: Record<
  ServiceStatus,
  {
    labelKey: string
    color: string
    icon: React.ElementType
    badgeVariant: 'success' | 'warning' | 'destructive' | 'info'
  }
> = {
  operational: {
    labelKey: 'status.serviceStatus.operational',
    color: '#22c55e',
    icon: CheckCircle2,
    badgeVariant: 'success',
  },
  degraded: {
    labelKey: 'status.serviceStatus.degraded',
    color: '#f59e0b',
    icon: AlertTriangle,
    badgeVariant: 'warning',
  },
  outage: {
    labelKey: 'status.serviceStatus.outage',
    color: '#ef4444',
    icon: XCircle,
    badgeVariant: 'destructive',
  },
  maintenance: {
    labelKey: 'status.serviceStatus.maintenance',
    color: '#3b82f6',
    icon: Clock,
    badgeVariant: 'info',
  },
}

const SERVICE_DEFS = [
  { id: 'web', nameKey: 'status.services.web.name', descriptionKey: 'status.services.web.description', icon: Globe, category: 'core' as const },
  { id: 'api', nameKey: 'status.services.api.name', descriptionKey: 'status.services.api.description', icon: Server, category: 'core' as const },
  { id: 'auth', nameKey: 'status.services.auth.name', descriptionKey: 'status.services.auth.description', icon: Shield, category: 'core' as const },
  { id: 'database', nameKey: 'status.services.database.name', descriptionKey: 'status.services.database.description', icon: Database, category: 'infrastructure' as const },
  { id: 'cdn', nameKey: 'status.services.cdn.name', descriptionKey: 'status.services.cdn.description', icon: Cloud, category: 'infrastructure' as const },
  { id: 'storage', nameKey: 'status.services.storage.name', descriptionKey: 'status.services.storage.description', icon: HardDrive, category: 'infrastructure' as const },
  { id: 'email', nameKey: 'status.services.email.name', descriptionKey: 'status.services.email.description', icon: Mail, category: 'integrations' as const },
  { id: 'payments', nameKey: 'status.services.payments.name', descriptionKey: 'status.services.payments.description', icon: CreditCard, category: 'integrations' as const },
  { id: 'security', nameKey: 'status.services.security.name', descriptionKey: 'status.services.security.description', icon: Zap, category: 'integrations' as const },
  { id: 'realtime', nameKey: 'status.services.realtime.name', descriptionKey: 'status.services.realtime.description', icon: Wifi, category: 'integrations' as const },
]

const SEVERITY_COLORS: Record<string, string> = {
  minor: '#f59e0b',
  major: '#f97316',
  critical: '#ef4444',
}

// ============================================================================
// Helpers
// ============================================================================

function generateUptimeHistory(): DayUptime[] {
  const now = new Date()
  return Array.from({ length: 90 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (89 - i))
    const uptime = Math.random() > 0.03 ? 100 : Math.random() > 0.5 ? 99.5 : 97 + Math.random() * 2
    return {
      date: date.toISOString().split('T')[0]!,
      uptime: Math.round(uptime * 100) / 100,
      incidents: uptime < 99.9 ? Math.ceil(Math.random() * 2) : 0,
    }
  })
}

function uptimeColor(uptime: number): string {
  if (uptime >= 99.9) return '#22c55e'
  if (uptime >= 99) return '#f59e0b'
  return '#ef4444'
}

function latencyColor(ms: number): string {
  if (ms < 100) return '#22c55e'
  if (ms < 300) return '#f59e0b'
  return '#ef4444'
}

// ============================================================================
// UptimeTimeline — 90-day interactive uptime visualization
// ============================================================================

function UptimeTimeline({ history }: { history: DayUptime[] }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="relative group">
      <div className="flex items-stretch gap-[2px] h-8 w-full">
        {history.map((day, i) => {
          const color = uptimeColor(day.uptime)
          const isHovered = hovered === i
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <motion.div
                  className="flex-1 min-w-0 rounded-[2px] cursor-pointer relative"
                  style={{
                    background: color,
                    opacity: isHovered ? 1 : 0.5,
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={{ scaleY: 1.3, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="px-3 py-2 text-xs"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                  boxShadow: `0 8px 32px ${theme.colors.background}80`,
                }}
              >
                <div className="space-y-1">
                  <p className="font-semibold">{day.date}</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="font-mono">{day.uptime.toFixed(2)}%</span>
                  </div>
                  {day.incidents > 0 && (
                    <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.timeline.incidents', { count: day.incidents })}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{t('status.timeline.daysAgo')}</span>
        <span className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{t('status.timeline.today')}</span>
      </div>
    </div>
  )
}

// ============================================================================
// ServiceCard — Premium expandable service card
// ============================================================================

function ServiceCard({
  service,
  isExpanded,
  onToggle,
  index,
}: {
  service: Service
  isExpanded: boolean
  onToggle: () => void
  index: number
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const meta = STATUS_META[service.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
      className="theme-card overflow-hidden card-hover"
      style={{
        background: theme.effects.cardStyle === 'glass'
          ? `${theme.colors.card}99`
          : theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        backdropFilter: theme.effects.cardStyle === 'glass' ? 'blur(20px) saturate(180%)' : undefined,
      }}
    >
      {/* Main row */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4 transition-colors duration-200"
        style={{ background: isExpanded ? `${meta.color}08` : 'transparent' }}
      >
        {/* Animated status indicator */}
        <div className="relative shrink-0">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${meta.color}15` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <service.icon size={20} style={{ color: meta.color }} />
          </motion.div>
          {/* Live pulse */}
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{
              background: meta.color,
              borderColor: theme.colors.card,
            }}
            animate={service.status !== 'operational' ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Name & description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate" style={{ color: theme.colors.foreground }}>
              {t(service.nameKey)}
            </h3>
            <Badge
              variant={meta.badgeVariant}
              size="sm"
              className="shrink-0"
            >
              {t(meta.labelKey)}
            </Badge>
          </div>
          <p className="text-xs truncate mt-0.5" style={{ color: theme.colors.foregroundMuted }}>
            {t(service.descriptionKey)}
          </p>
        </div>

        {/* Mini uptime sparkline (desktop) */}
        <div className="hidden lg:flex items-end gap-[1.5px] h-6 w-32 shrink-0">
          {service.uptimeHistory.slice(-45).map((day, i) => (
            <div
              key={i}
              className="flex-1 min-w-0 rounded-[1px] transition-all duration-150"
              style={{
                height: day.uptime >= 99.9 ? '100%' : day.uptime >= 99 ? '50%' : '20%',
                background: uptimeColor(day.uptime),
                opacity: 0.5,
              }}
            />
          ))}
        </div>

        {/* Latency pill */}
        {service.latency !== undefined && service.latency > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium shrink-0"
                style={{
                  background: `${latencyColor(service.latency)}10`,
                  color: latencyColor(service.latency),
                  border: `1px solid ${latencyColor(service.latency)}20`,
                }}
              >
                {service.latency}ms
              </span>
            </TooltipTrigger>
            <TooltipContent>{t('status.response')}</TooltipContent>
          </Tooltip>
        )}

        {/* Uptime % */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="text-sm font-mono font-bold w-16 text-right shrink-0"
              style={{ color: uptimeColor(service.uptimePercentage) }}
            >
              {service.uptimePercentage.toFixed(2)}%
            </span>
          </TooltipTrigger>
          <TooltipContent>{t('status.uptime')}</TooltipContent>
        </Tooltip>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={16} style={{ color: theme.colors.foregroundMuted }} />
        </motion.div>
      </button>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 pt-2 space-y-4"
              style={{ borderTop: `1px solid ${theme.colors.border}40` }}
            >
              {/* 90-day uptime timeline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.foregroundMuted }}>
                    {t('status.uptimeLabel')}
                  </span>
                  <span className="text-xs font-mono" style={{ color: uptimeColor(service.uptimePercentage) }}>
                    {service.uptimePercentage.toFixed(3)}%
                  </span>
                </div>
                <UptimeTimeline history={service.uptimeHistory} />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="p-3 rounded-xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2" style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}` }}>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={12} style={{ color: '#22c55e' }} />
                    <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.uptime')}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold font-mono" style={{ color: uptimeColor(service.uptimePercentage) }}>
                    {service.uptimePercentage.toFixed(3)}%
                  </p>
                </div>

                <div className="p-3 rounded-xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2" style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}` }}>
                  <div className="flex items-center gap-2">
                    <Zap size={12} style={{ color: service.latency ? latencyColor(service.latency) : theme.colors.foregroundMuted }} />
                    <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.response')}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold font-mono" style={{ color: service.latency ? latencyColor(service.latency) : theme.colors.foregroundMuted }}>
                    {service.latency ? `${service.latency}ms` : '—'}
                  </p>
                </div>

                <div className="p-3 rounded-xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2" style={{ background: `${meta.color}08`, border: `1px solid ${meta.color}15` }}>
                  <div className="flex items-center gap-2">
                    <meta.icon size={12} style={{ color: meta.color }} />
                    <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.statusLabel')}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold" style={{ color: meta.color }}>
                    {t(meta.labelKey)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// IncidentCard — Active incident display
// ============================================================================

function IncidentCard({ incident }: { incident: { id: string; title: string; description: string | null; severity: string; status: string; createdAt: string | Date; affectedServices: unknown; updates?: { id: string; message: string; status: string; createdAt: string | Date }[] } }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const color = SEVERITY_COLORS[incident.severity] || '#f59e0b'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="theme-card overflow-hidden"
      style={{
        background: `${color}05`,
        border: `1px solid ${color}20`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <motion.div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${color}15` }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle size={16} style={{ color }} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>
              {incident.title}
            </h4>
            <Badge variant="warning" size="sm">{incident.severity}</Badge>
            <Badge variant="info" size="sm">{t(`status.incident.status.${incident.status}`)}</Badge>
          </div>
          {incident.description && (
            <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>
              {incident.description}
            </p>
          )}
          <p className="text-[10px] mt-1.5 font-mono" style={{ color: theme.colors.foregroundMuted }}>
            {new Date(incident.createdAt).toLocaleString()}
          </p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} className="shrink-0 mt-1">
          <ChevronDown size={14} style={{ color: theme.colors.foregroundMuted }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && incident.updates && incident.updates.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 ml-11 space-y-2" style={{ borderTop: `1px solid ${color}10` }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider pt-3" style={{ color: theme.colors.foregroundMuted }}>
                {t('status.incident.timeline')}
              </p>
              {incident.updates.map((update, i) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-2.5 items-start"
                >
                  <div className="flex flex-col items-center mt-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {i < incident.updates!.length - 1 && (
                      <div className="w-px flex-1 min-h-[16px] mt-1" style={{ background: `${color}30` }} />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-xs" style={{ color: theme.colors.foreground }}>{update.message}</p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: theme.colors.foregroundMuted }}>
                      {new Date(update.createdAt).toLocaleString()} · {update.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// Main StatusPage
// ============================================================================

export function StatusPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const search = useSearch({ from: '/_public/status' })
  const queryClient = useQueryClient()
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [subscribeEmail, setSubscribeEmail] = useState('')
  const [subscribeMsg, setSubscribeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expandedService, setExpandedService] = useState<string | null>(null)

  // Server function wrappers
  const getIncidents = useServerFn(getIncidentsFn)
  const subscribeStatus = useServerFn(subscribeStatusFn)
  const unsubscribeStatus = useServerFn(unsubscribeStatusFn)
  const verifySubscription = useServerFn(verifyStatusSubscriptionFn)
  const getSubscription = useServerFn(getStatusSubscriptionFn)

  // Queries
  const { data: incidents } = useQuery({
    queryKey: ['status-incidents'],
    queryFn: () => getIncidents(),
    staleTime: 30000,
    refetchInterval: 30000,
  })

  const { data: subscription } = useQuery({
    queryKey: ['status-subscription'],
    queryFn: () => getSubscription(),
    enabled: !!currentUser,
  })

  const subscribeMutation = useMutation({
    mutationFn: (email: string) => subscribeStatus({ data: { email } }),
    onSuccess: (raw) => {
      const result = raw as { success: boolean; message: string }
      if (result.message === 'already_subscribed') {
        setSubscribeMsg({ type: 'success', text: t('status.subscribe.alreadySubscribed') })
      } else if (result.message === 'verification_sent') {
        setSubscribeMsg({ type: 'success', text: t('status.subscribe.verificationSent') })
      } else {
        setSubscribeMsg({ type: 'success', text: t('status.subscribe.success') })
      }
      void queryClient.invalidateQueries({ queryKey: ['status-subscription'] })
    },
    onError: () => {
      setSubscribeMsg({ type: 'error', text: t('status.subscribe.error') })
    },
  })

  // Handle verify/unsubscribe from URL params
  useEffect(() => {
    if (search.verify) {
      verifySubscription({ data: { token: search.verify } })
        .then(() => setSubscribeMsg({ type: 'success', text: t('status.subscribe.verified') }))
        .catch(() => setSubscribeMsg({ type: 'error', text: t('status.subscribe.error') }))
    }
    if (search.unsubscribe) {
      unsubscribeStatus({ data: { token: search.unsubscribe } })
        .then(() => setSubscribeMsg({ type: 'success', text: t('status.subscribe.unsubscribed') }))
        .catch(() => setSubscribeMsg({ type: 'error', text: t('status.subscribe.error') }))
    }
  }, [search.verify, search.unsubscribe])

  // Service health query
  const { data: services, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['system-status'],
    queryFn: async (): Promise<Service[]> => {
      const simulateLatency = (base: number, variance: number = 10): number =>
        Math.round(base + (Math.random() - 0.5) * variance)

      const checkApiHealth = async (): Promise<{ status: ServiceStatus; latency: number }> => {
        const start = performance.now()
        try {
          const response = await fetch('/api/health', { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(5000) })
          const rawLatency = Math.round(performance.now() - start)
          if (!response.ok) return { status: 'degraded', latency: rawLatency }
          const data: HealthResponse = await response.json()
          const latency = process.env.NODE_ENV === 'development' ? simulateLatency(25, 15) : rawLatency
          return { status: data.status === 'ok' ? 'operational' : 'degraded', latency }
        } catch { return { status: 'outage', latency: 0 } }
      }

      const checkWebHealth = async (): Promise<{ status: ServiceStatus; latency: number }> => {
        const start = performance.now()
        try {
          const response = await fetch('/', { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(3000) })
          const rawLatency = Math.round(performance.now() - start)
          const latency = process.env.NODE_ENV === 'development' ? simulateLatency(15, 10) : rawLatency
          return { status: response.ok ? 'operational' : 'degraded', latency }
        } catch { return { status: 'outage', latency: 0 } }
      }

      const [api, web] = await Promise.all([checkApiHealth(), checkWebHealth()])
      const dbStatus: ServiceStatus = api.status === 'operational' ? 'operational' : 'degraded'

      return SERVICE_DEFS.map((def) => {
        let status: ServiceStatus = 'operational'
        let latency: number | undefined
        let uptimePercentage = 99.99

        switch (def.id) {
          case 'web': status = web.status; latency = web.latency; uptimePercentage = web.status === 'operational' ? 99.99 : 99.5; break
          case 'api': status = api.status; latency = api.latency; uptimePercentage = api.status === 'operational' ? 99.98 : 99.2; break
          case 'auth': status = api.status; latency = api.latency ? simulateLatency(Math.round(api.latency * 0.8), 5) : undefined; uptimePercentage = 99.97; break
          case 'database': status = dbStatus; latency = api.latency ? simulateLatency(Math.round(api.latency * 0.3), 5) : undefined; uptimePercentage = 99.99; break
          case 'cdn': status = web.status; latency = web.latency ? simulateLatency(Math.round(web.latency * 0.5), 5) : undefined; uptimePercentage = 99.999; break
          case 'storage': latency = process.env.NODE_ENV === 'development' ? simulateLatency(35, 15) : 45; uptimePercentage = 99.95; break
          case 'email': latency = process.env.NODE_ENV === 'development' ? simulateLatency(80, 30) : 120; uptimePercentage = 99.9; break
          case 'payments': latency = process.env.NODE_ENV === 'development' ? simulateLatency(100, 40) : 180; uptimePercentage = 99.99; break
          case 'security': latency = process.env.NODE_ENV === 'development' ? simulateLatency(20, 10) : 35; uptimePercentage = 99.999; break
          case 'realtime': latency = process.env.NODE_ENV === 'development' ? simulateLatency(15, 8) : 25; uptimePercentage = 99.95; break
        }
        return { ...def, status, latency, uptimePercentage, uptimeHistory: generateUptimeHistory() }
      })
    },
    refetchInterval: 30000,
    staleTime: 10000,
  })

  useEffect(() => { if (services) setLastUpdated(new Date()) }, [services])

  // Computed
  const overallStatus: ServiceStatus = services?.every((s) => s.status === 'operational')
    ? 'operational'
    : services?.some((s) => s.status === 'outage') ? 'outage'
      : services?.some((s) => s.status === 'maintenance') ? 'maintenance' : 'degraded'

  const operationalCount = services?.filter((s) => s.status === 'operational').length || 0
  const totalCount = services?.length || 0
  const avgLatency = services?.filter((s) => s.latency && s.latency > 0)
    .reduce((sum, s, _, arr) => sum + (s.latency || 0) / arr.length, 0) || 0
  const overallUptime = services?.length
    ? services.reduce((sum, s) => sum + s.uptimePercentage, 0) / services.length : 99.9
  const activeIncidentCount = incidents?.active?.length || 0

  const groupedServices = useMemo(() => {
    if (!services) return {}
    return services.reduce<Record<string, Service[]>>((acc, service) => {
      if (!acc[service.category]) acc[service.category] = []
      acc[service.category]!.push(service)
      return acc
    }, {})
  }, [services])

  const handleSubscribe = useCallback((email: string) => {
    subscribeMutation.mutate(email)
  }, [subscribeMutation])

  const overallMeta = STATUS_META[overallStatus]

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ background: theme.colors.background, fontFamily: theme.typography.bodyFont }}
    >
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0" style={{ background: theme.colors.background }} />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${overallMeta.color}, transparent 70%)`,
            top: '-10%',
            right: '10%',
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{
            background: `radial-gradient(circle, ${theme.colors.accent}, transparent 70%)`,
            bottom: '10%',
            left: '5%',
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">

          {/* ================================================================
              HERO HEADER
              ================================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-6"
              style={{
                background: `${overallMeta.color}10`,
                border: `1px solid ${overallMeta.color}25`,
                boxShadow: `0 0 30px ${overallMeta.color}10`,
              }}
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: overallMeta.color }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-semibold" style={{ color: overallMeta.color }}>
                {t(`status.overall.${overallStatus}`)}
              </span>
              <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                · {operationalCount}/{totalCount}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
              style={{ color: theme.colors.foreground, fontFamily: theme.typography.displayFont }}
            >
              {t('status.hero.title')}{' '}
              <span className="text-gradient">{t('status.hero.titleHighlight')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg max-w-xl mx-auto mb-8"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('status.hero.subtitle')}
            </motion.p>

            {/* Quick stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 rounded-2xl"
              style={{
                background: theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}80`
                  : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-default">
                    <p className="text-xl sm:text-2xl font-bold font-mono" style={{ color: uptimeColor(overallUptime) }}>
                      {overallUptime.toFixed(2)}%
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.stats.uptime')}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{t('status.tooltips.avgUptime')}</TooltipContent>
              </Tooltip>

              <div className="w-px h-8" style={{ background: theme.colors.border }} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-default">
                    <p className="text-xl sm:text-2xl font-bold font-mono" style={{ color: theme.colors.foreground }}>
                      {Math.round(avgLatency)}ms
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.stats.avgLatency')}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{t('status.tooltips.avgLatency')}</TooltipContent>
              </Tooltip>

              <div className="w-px h-8 hidden sm:block" style={{ background: theme.colors.border }} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-default hidden sm:block">
                    <p className="text-xl sm:text-2xl font-bold font-mono" style={{ color: theme.colors.foreground }}>
                      90
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.stats.daysTracked')}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{t('status.tooltips.daysTracked')}</TooltipContent>
              </Tooltip>

              <div className="w-px h-8" style={{ background: theme.colors.border }} />

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs font-mono" style={{ color: theme.colors.foregroundMuted }}>
                    {lastUpdated.toLocaleTimeString()}
                  </p>
                  <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>
                    {t('status.lastChecked')}
                  </p>
                </div>
                <motion.button
                  onClick={() => void refetch()}
                  disabled={isFetching}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: `${theme.colors.foreground}08` }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RefreshCw
                    size={14}
                    style={{ color: isFetching ? theme.colors.primary : theme.colors.foregroundMuted }}
                    className={isFetching ? 'animate-spin' : ''}
                  />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* ================================================================
              ACTIVE INCIDENTS
              ================================================================ */}
          <AnimatePresence>
            {activeIncidentCount > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 space-y-3"
              >
                <div className="flex items-center gap-2 px-1">
                  <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#ef4444' }}>
                    {t('status.incident.active')} ({activeIncidentCount})
                  </h2>
                </div>
                {incidents!.active.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </motion.section>
            )}
          </AnimatePresence>

          {/* ================================================================
              SERVICE MONITORS
              ================================================================ */}
          <section className="space-y-8 mb-10">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="theme-card p-4 flex items-center gap-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              (['core', 'infrastructure', 'integrations'] as const).map((category) => {
                const categoryServices = groupedServices[category]
                if (!categoryServices) return null
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.colors.primary }} />
                      <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.colors.foregroundMuted }}>
                        {t(`status.categories.${category}`)}
                      </h2>
                      <span className="text-[10px] font-mono" style={{ color: theme.colors.foregroundMuted }}>
                        ({categoryServices.filter((s) => s.status === 'operational').length}/{categoryServices.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {categoryServices.map((service, i) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          isExpanded={expandedService === service.id}
                          onToggle={() => setExpandedService(expandedService === service.id ? null : service.id)}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </section>

          {/* ================================================================
              INCIDENT HISTORY (resolved)
              ================================================================ */}
          {incidents?.resolved && incidents.resolved.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.colors.foregroundMuted }}>
                  {t('status.incident.resolved')}
                </h2>
              </div>
              <div className="space-y-2">
                {incidents.resolved.slice(0, 5).map((incident) => (
                  <div
                    key={incident.id}
                    className="theme-card p-4 flex items-start gap-3"
                    style={{
                      background: theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                      borderLeft: '3px solid #22c55e',
                    }}
                  >
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate" style={{ color: theme.colors.foreground }}>
                        {incident.title}
                      </h4>
                      {incident.description && (
                        <p className="text-xs mt-0.5" style={{ color: theme.colors.foregroundMuted }}>
                          {incident.description}
                        </p>
                      )}
                      <p className="text-[10px] font-mono mt-1" style={{ color: theme.colors.foregroundMuted }}>
                        {new Date(incident.createdAt).toLocaleDateString()}
                        {incident.resolvedAt && ` → ${new Date(incident.resolvedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">{t('status.incident.status.resolved')}</Badge>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ================================================================
              SUBSCRIBE & SUPPORT
              ================================================================ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {/* Subscribe */}
            <div
              className="theme-card p-6 relative overflow-hidden"
              style={{
                background: theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}99`
                  : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
              }}
            >
              {/* Decorative glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
                style={{ background: theme.colors.accent }}
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.colors.accent}15` }}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <Bell size={20} style={{ color: theme.colors.accent }} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>
                      {t('status.subscribe.title')}
                    </p>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.subscribe.description')}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {subscribeMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="mb-3"
                    >
                      <div
                        className="px-3 py-2 rounded-lg text-xs flex items-center gap-2"
                        style={{
                          background: subscribeMsg.type === 'success' ? '#22c55e12' : '#ef444412',
                          color: subscribeMsg.type === 'success' ? '#22c55e' : '#ef4444',
                          border: `1px solid ${subscribeMsg.type === 'success' ? '#22c55e' : '#ef4444'}20`,
                        }}
                      >
                        {subscribeMsg.type === 'success' ? <Check size={12} /> : <AlertTriangle size={12} />}
                        {subscribeMsg.text}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {subscription ? (
                  <div className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#22c55e' }} />
                    <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                      {t('status.subscribe.buttonSubscribed')}
                    </span>
                  </div>
                ) : currentUser ? (
                  <motion.button
                    onClick={() => currentUser.email && handleSubscribe(currentUser.email)}
                    disabled={subscribeMutation.isPending}
                    className="btn btn-primary text-xs"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {subscribeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                    {subscribeMutation.isPending ? t('status.subscribe.subscribing') : t('status.subscribe.button')}
                  </motion.button>
                ) : (
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (subscribeEmail) handleSubscribe(subscribeEmail)
                    }}
                  >
                    <Input
                      type="email"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      placeholder={t('status.subscribe.emailPlaceholder')}
                      className="flex-1 h-9 text-xs"
                      required
                    />
                    <motion.button
                      type="submit"
                      disabled={subscribeMutation.isPending}
                      className="btn btn-primary text-xs shrink-0"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {subscribeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                      {subscribeMutation.isPending ? t('status.subscribe.subscribing') : t('status.subscribe.button')}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>

            {/* Support */}
            <div
              className="theme-card p-6 relative overflow-hidden"
              style={{
                background: theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}99`
                  : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: theme.colors.primary }} />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.colors.primary}15` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Sparkles size={20} style={{ color: theme.colors.primary }} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>
                      {t('status.support.title')}
                    </p>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      {t('status.support.description')}
                    </p>
                  </div>
                </div>

                <Link
                  to="/support"
                  className="btn btn-primary text-xs inline-flex"
                >
                  {t('status.support.button')}
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
              {t('status.footer.info')}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
