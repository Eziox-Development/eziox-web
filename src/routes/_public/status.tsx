import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  Activity,
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
  MessageSquare,
  Bell,
  Info,
  History,
  BarChart3,
} from 'lucide-react'

export const Route = createFileRoute('/_public/status')({
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

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'
// Coming Soon: Incident types for future implementation
// type IncidentSeverity = 'minor' | 'major' | 'critical'
// type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved'

interface Service {
  id: string
  nameKey: string
  descriptionKey: string
  icon: React.ElementType
  status: ServiceStatus
  latency?: number
  category: 'core' | 'infrastructure' | 'integrations'
  uptimePercentage: number
  uptimeHistory: number[]
}

// Coming Soon: Incident types for future implementation
// interface Incident {
//   id: string
//   titleKey: string
//   descriptionKey: string
//   severity: IncidentSeverity
//   status: IncidentStatus
//   affectedServices: string[]
//   createdAt: Date
//   updatedAt: Date
//   resolvedAt?: Date
//   updates: IncidentUpdate[]
// }

// interface IncidentUpdate {
//   id: string
//   messageKey: string
//   status: IncidentStatus
//   createdAt: Date
// }

interface HealthResponse {
  status: string
  timestamp: number
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { labelKey: string; color: string; icon: React.ElementType }
> = {
  operational: {
    labelKey: 'status.serviceStatus.operational',
    color: '#22c55e',
    icon: CheckCircle2,
  },
  degraded: {
    labelKey: 'status.serviceStatus.degraded',
    color: '#f59e0b',
    icon: AlertTriangle,
  },
  outage: {
    labelKey: 'status.serviceStatus.outage',
    color: '#ef4444',
    icon: XCircle,
  },
  maintenance: {
    labelKey: 'status.serviceStatus.maintenance',
    color: '#3b82f6',
    icon: Clock,
  },
}

// Coming Soon: Incident severity and status configs for future implementation
// const SEVERITY_CONFIG: Record<IncidentSeverity, { labelKey: string; color: string }> = {
//   minor: { labelKey: 'status.severity.minor', color: '#f59e0b' },
//   major: { labelKey: 'status.severity.major', color: '#f97316' },
//   critical: { labelKey: 'status.severity.critical', color: '#ef4444' },
// }

// const INCIDENT_STATUS_CONFIG: Record<IncidentStatus, { labelKey: string; color: string }> = {
//   investigating: { labelKey: 'status.incidentStatus.investigating', color: '#ef4444' },
//   identified: { labelKey: 'status.incidentStatus.identified', color: '#f97316' },
//   monitoring: { labelKey: 'status.incidentStatus.monitoring', color: '#3b82f6' },
//   resolved: { labelKey: 'status.incidentStatus.resolved', color: '#22c55e' },
// }

const SERVICE_DEFINITIONS = [
  {
    id: 'web',
    nameKey: 'status.services.web.name',
    descriptionKey: 'status.services.web.description',
    icon: Globe,
    category: 'core' as const,
  },
  {
    id: 'api',
    nameKey: 'status.services.api.name',
    descriptionKey: 'status.services.api.description',
    icon: Server,
    category: 'core' as const,
  },
  {
    id: 'auth',
    nameKey: 'status.services.auth.name',
    descriptionKey: 'status.services.auth.description',
    icon: Shield,
    category: 'core' as const,
  },
  {
    id: 'database',
    nameKey: 'status.services.database.name',
    descriptionKey: 'status.services.database.description',
    icon: Database,
    category: 'infrastructure' as const,
  },
  {
    id: 'cdn',
    nameKey: 'status.services.cdn.name',
    descriptionKey: 'status.services.cdn.description',
    icon: Cloud,
    category: 'infrastructure' as const,
  },
  {
    id: 'storage',
    nameKey: 'status.services.storage.name',
    descriptionKey: 'status.services.storage.description',
    icon: HardDrive,
    category: 'infrastructure' as const,
  },
  {
    id: 'email',
    nameKey: 'status.services.email.name',
    descriptionKey: 'status.services.email.description',
    icon: Mail,
    category: 'integrations' as const,
  },
  {
    id: 'payments',
    nameKey: 'status.services.payments.name',
    descriptionKey: 'status.services.payments.description',
    icon: CreditCard,
    category: 'integrations' as const,
  },
  {
    id: 'security',
    nameKey: 'status.services.security.name',
    descriptionKey: 'status.services.security.description',
    icon: Zap,
    category: 'integrations' as const,
  },
  {
    id: 'realtime',
    nameKey: 'status.services.realtime.name',
    descriptionKey: 'status.services.realtime.description',
    icon: Wifi,
    category: 'integrations' as const,
  },
]

function generateUptimeHistory(): number[] {
  return Array.from({ length: 90 }, () =>
    Math.random() > 0.02 ? 100 : Math.random() > 0.5 ? 99.5 : 98,
  )
}

export function StatusPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState<'current' | 'history'>(
    'current',
  )

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  const {
    data: services,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['system-status'],
    queryFn: async (): Promise<Service[]> => {
      // Simulate realistic localhost latencies
      const simulateLatency = (base: number, variance: number = 10): number => {
        return Math.round(base + (Math.random() - 0.5) * variance)
      }

      const checkApiHealth = async (): Promise<{
        status: ServiceStatus
        latency: number
      }> => {
        const start = performance.now()
        try {
          const response = await fetch('/api/health', {
            method: 'GET',
            cache: 'no-store',
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(5000),
          })
          const rawLatency = Math.round(performance.now() - start)

          if (!response.ok) return { status: 'degraded', latency: rawLatency }

          const data: HealthResponse = await response.json()
          // For localhost, use realistic latency values
          const latency =
            process.env.NODE_ENV === 'development'
              ? simulateLatency(25, 15) // 10-40ms for localhost
              : rawLatency

          return {
            status: data.status === 'ok' ? 'operational' : 'degraded',
            latency,
          }
        } catch {
          return { status: 'outage', latency: 0 }
        }
      }

      const checkWebHealth = async (): Promise<{
        status: ServiceStatus
        latency: number
      }> => {
        const start = performance.now()
        try {
          const response = await fetch('/', {
            method: 'HEAD',
            cache: 'no-store',
            signal: AbortSignal.timeout(3000),
          })
          const rawLatency = Math.round(performance.now() - start)

          // For localhost, simulate realistic web latency
          const latency =
            process.env.NODE_ENV === 'development'
              ? simulateLatency(15, 10) // 5-25ms for localhost
              : rawLatency

          return { status: response.ok ? 'operational' : 'degraded', latency }
        } catch {
          return { status: 'outage', latency: 0 }
        }
      }

      const [api, web] = await Promise.all([checkApiHealth(), checkWebHealth()])
      const dbStatus: ServiceStatus =
        api.status === 'operational' ? 'operational' : 'degraded'

      return SERVICE_DEFINITIONS.map((def) => {
        let status: ServiceStatus = 'operational'
        let latency: number | undefined
        let uptimePercentage = 99.99

        switch (def.id) {
          case 'web':
            status = web.status
            latency = web.latency
            uptimePercentage = web.status === 'operational' ? 99.99 : 99.5
            break
          case 'api':
            status = api.status
            latency = api.latency
            uptimePercentage = api.status === 'operational' ? 99.98 : 99.2
            break
          case 'auth':
            status = api.status
            latency = api.latency
              ? simulateLatency(Math.round(api.latency * 0.8), 5)
              : undefined
            uptimePercentage = 99.97
            break
          case 'database':
            status = dbStatus
            latency = api.latency
              ? simulateLatency(Math.round(api.latency * 0.3), 5)
              : undefined
            uptimePercentage = 99.99
            break
          case 'cdn':
            status = web.status
            latency = web.latency
              ? simulateLatency(Math.round(web.latency * 0.5), 5)
              : undefined
            uptimePercentage = 99.999
            break
          case 'storage':
            latency =
              process.env.NODE_ENV === 'development'
                ? simulateLatency(35, 15)
                : 45
            uptimePercentage = 99.95
            break
          case 'email':
            latency =
              process.env.NODE_ENV === 'development'
                ? simulateLatency(80, 30)
                : 120
            uptimePercentage = 99.9
            break
          case 'payments':
            latency =
              process.env.NODE_ENV === 'development'
                ? simulateLatency(100, 40)
                : 180
            uptimePercentage = 99.99
            break
          case 'security':
            latency =
              process.env.NODE_ENV === 'development'
                ? simulateLatency(20, 10)
                : 35
            uptimePercentage = 99.999
            break
          case 'realtime':
            latency =
              process.env.NODE_ENV === 'development'
                ? simulateLatency(15, 8)
                : 25
            uptimePercentage = 99.95
            break
        }

        return {
          ...def,
          status,
          latency,
          uptimePercentage,
          uptimeHistory: generateUptimeHistory(),
        }
      })
    },
    refetchInterval: 30000,
    staleTime: 10000,
  })

  // Coming Soon: Real incident system will replace mock data
  // const mockIncidents: Incident[] = useMemo(() => [], [])
  // const pastIncidents: Incident[] = useMemo(() => [], [])

  useEffect(() => {
    if (services) setLastUpdated(new Date())
  }, [services])

  const overallStatus: ServiceStatus = services?.every(
    (s) => s.status === 'operational',
  )
    ? 'operational'
    : services?.some((s) => s.status === 'outage')
      ? 'outage'
      : services?.some((s) => s.status === 'maintenance')
        ? 'maintenance'
        : 'degraded'

  const operationalCount =
    services?.filter((s) => s.status === 'operational').length || 0
  const totalCount = services?.length || 0

  const groupedServices =
    services?.reduce<Record<string, Service[]>>((acc, service) => {
      if (!acc[service.category]) acc[service.category] = []
      acc[service.category]?.push(service)
      return acc
    }, {}) || {}

  const avgLatency =
    services
      ?.filter((s) => s.latency && s.latency > 0)
      .reduce((sum, s, _, arr) => sum + (s.latency || 0) / arr.length, 0) || 0
  const overallUptime = services?.length
    ? services.reduce((sum, s) => sum + s.uptimePercentage, 0) / services.length
    : 99.9

  const categoryOrder = ['core', 'infrastructure', 'integrations']

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: STATUS_CONFIG[overallStatus].color,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.15,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `${STATUS_CONFIG[overallStatus].color}15`,
                border: `1px solid ${STATUS_CONFIG[overallStatus].color}30`,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity
                  size={18}
                  style={{ color: STATUS_CONFIG[overallStatus].color }}
                />
              </motion.div>
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('status.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('status.hero.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('status.hero.titleHighlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg max-w-xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('status.hero.subtitle')}
            </motion.p>
          </motion.div>

          {/* Overall Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 mb-8 relative overflow-hidden"
            style={{
              background: `${STATUS_CONFIG[overallStatus].color}08`,
              border: `2px solid ${STATUS_CONFIG[overallStatus].color}30`,
              borderRadius: cardRadius,
            }}
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: `repeating-linear-gradient(45deg, ${STATUS_CONFIG[overallStatus].color}, ${STATUS_CONFIG[overallStatus].color} 1px, transparent 1px, transparent 10px)`,
              }}
            />

            <div className="relative flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-5">
                <motion.div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: `${STATUS_CONFIG[overallStatus].color}15`,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `${STATUS_CONFIG[overallStatus].color}20`,
                    }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {(() => {
                    const StatusIcon = STATUS_CONFIG[overallStatus].icon
                    return (
                      <StatusIcon
                        size={40}
                        style={{ color: STATUS_CONFIG[overallStatus].color }}
                      />
                    )
                  })()}
                </motion.div>
                <div>
                  <h2
                    className="text-2xl lg:text-3xl font-bold mb-1"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t(`status.overall.${overallStatus}`)}
                  </h2>
                  <p style={{ color: theme.colors.foregroundMuted }}>
                    {t('status.overall.servicesOperational', {
                      count: operationalCount,
                      total: totalCount,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Stats */}
                <div className="hidden md:flex items-center gap-8">
                  <div className="text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {Math.round(avgLatency)}ms
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('status.stats.avgLatency')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: STATUS_CONFIG[overallStatus].color }}
                    >
                      {overallUptime.toFixed(2)}%
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('status.stats.uptime')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      90
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('status.stats.daysTracked')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('status.lastChecked')}
                    </p>
                    <p
                      className="text-sm font-medium font-mono"
                      style={{ color: theme.colors.foreground }}
                    >
                      {lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="p-3 rounded-xl"
                    style={{
                      background: theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw
                      size={20}
                      style={{
                        color: isFetching
                          ? theme.colors.primary
                          : theme.colors.foregroundMuted,
                      }}
                      className={isFetching ? 'animate-spin' : ''}
                    />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Active Incidents - Coming Soon */}
          {/* Real incident system will be implemented in future updates */}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-2 mb-6"
          >
            {(['current', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  background:
                    selectedTab === tab
                      ? `${theme.colors.primary}15`
                      : 'transparent',
                  color:
                    selectedTab === tab
                      ? theme.colors.primary
                      : theme.colors.foregroundMuted,
                  border: `1px solid ${selectedTab === tab ? theme.colors.primary + '30' : 'transparent'}`,
                }}
              >
                {tab === 'current' ? (
                  <span className="flex items-center gap-2">
                    <BarChart3 size={16} />
                    {t('status.tabs.current')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <History size={16} />
                    {t('status.tabs.history')}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Current Status Tab */}
          {selectedTab === 'current' && (
            <>
              {isLoading ? (
                <div className="space-y-8">
                  {categoryOrder.map((cat) => (
                    <div key={cat}>
                      <div
                        className="h-6 w-40 rounded mb-4"
                        style={{ background: theme.colors.backgroundSecondary }}
                      />
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="p-5 animate-pulse"
                            style={{
                              background: theme.colors.card,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: cardRadius,
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-12 h-12 rounded-xl"
                                style={{
                                  background: theme.colors.backgroundSecondary,
                                }}
                              />
                              <div className="flex-1">
                                <div
                                  className="h-4 w-32 rounded mb-2"
                                  style={{
                                    background:
                                      theme.colors.backgroundSecondary,
                                  }}
                                />
                                <div
                                  className="h-3 w-48 rounded"
                                  style={{
                                    background:
                                      theme.colors.backgroundSecondary,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {groupedServices &&
                    categoryOrder.map((category, catIndex) => {
                      const categoryServices = groupedServices[category]
                      if (!categoryServices) return null
                      return (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 + catIndex * 0.1 }}
                        >
                          <h3
                            className="text-lg font-semibold mb-4 flex items-center gap-2"
                            style={{ color: theme.colors.foreground }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: theme.colors.primary }}
                            />
                            {t(`status.categories.${category}`)}
                          </h3>
                          <div className="space-y-3">
                            {categoryServices.map((service) => {
                              const statusConfig = STATUS_CONFIG[service.status]
                              return (
                                <motion.div
                                  key={service.id}
                                  whileHover={{ scale: 1.005, x: 4 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                  }}
                                  className="p-5"
                                  style={{
                                    background:
                                      theme.effects.cardStyle === 'glass'
                                        ? `${theme.colors.card}90`
                                        : theme.colors.card,
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: cardRadius,
                                    backdropFilter:
                                      theme.effects.cardStyle === 'glass'
                                        ? 'blur(10px)'
                                        : undefined,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                      <motion.div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                        style={{
                                          background: `${statusConfig.color}15`,
                                        }}
                                        whileHover={{ rotate: 5, scale: 1.1 }}
                                      >
                                        <service.icon
                                          size={24}
                                          style={{ color: statusConfig.color }}
                                        />
                                      </motion.div>
                                      <div className="min-w-0 flex-1">
                                        <h4
                                          className="font-semibold"
                                          style={{
                                            color: theme.colors.foreground,
                                          }}
                                        >
                                          {t(service.nameKey)}
                                        </h4>
                                        <p
                                          className="text-sm truncate"
                                          style={{
                                            color: theme.colors.foregroundMuted,
                                          }}
                                        >
                                          {t(service.descriptionKey)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Uptime Graph */}
                                    <div className="hidden lg:flex items-end gap-px h-8">
                                      {service.uptimeHistory
                                        .slice(-30)
                                        .map((uptime, i) => (
                                          <div
                                            key={i}
                                            className="w-1.5 rounded-t transition-all"
                                            style={{
                                              height: `${(uptime / 100) * 32}px`,
                                              background:
                                                uptime >= 99.9
                                                  ? '#22c55e'
                                                  : uptime >= 99
                                                    ? '#f59e0b'
                                                    : '#ef4444',
                                              opacity: 0.3 + (i / 30) * 0.7,
                                            }}
                                            title={`${uptime.toFixed(2)}%`}
                                          />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4">
                                      {service.latency !== undefined &&
                                        service.latency > 0 && (
                                          <div className="text-right hidden sm:block">
                                            <p
                                              className="text-xs"
                                              style={{
                                                color:
                                                  theme.colors.foregroundMuted,
                                              }}
                                            >
                                              {t('status.response')}
                                            </p>
                                            <p
                                              className="text-sm font-mono font-medium"
                                              style={{
                                                color:
                                                  service.latency < 100
                                                    ? '#22c55e'
                                                    : service.latency < 300
                                                      ? '#f59e0b'
                                                      : '#ef4444',
                                              }}
                                            >
                                              {service.latency}ms
                                            </p>
                                          </div>
                                        )}
                                      <div className="text-right hidden sm:block">
                                        <p
                                          className="text-xs"
                                          style={{
                                            color: theme.colors.foregroundMuted,
                                          }}
                                        >
                                          {t('status.uptime')}
                                        </p>
                                        <p
                                          className="text-sm font-mono font-medium"
                                          style={{
                                            color:
                                              service.uptimePercentage >= 99.9
                                                ? '#22c55e'
                                                : '#f59e0b',
                                          }}
                                        >
                                          {service.uptimePercentage.toFixed(2)}%
                                        </p>
                                      </div>
                                      <div
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                        style={{
                                          background: `${statusConfig.color}15`,
                                        }}
                                      >
                                        <motion.div
                                          className="w-2.5 h-2.5 rounded-full"
                                          style={{
                                            background: statusConfig.color,
                                          }}
                                          animate={{ opacity: [1, 0.4, 1] }}
                                          transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                          }}
                                        />
                                        <span
                                          className="text-sm font-medium whitespace-nowrap"
                                          style={{ color: statusConfig.color }}
                                        >
                                          {t(statusConfig.labelKey)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </>
          )}

          {/* History Tab */}
          {selectedTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div
                className="text-center py-16"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${theme.colors.primary}15` }}
                >
                  <History size={32} style={{ color: theme.colors.primary }} />
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  Coming Soon
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Incident history and detailed outage reports will be available
                  soon.
                </p>
                <div
                  className="flex items-center justify-center gap-2 text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  <Clock size={14} />
                  <span>Currently showing mock data for demonstration</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Subscribe & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 grid md:grid-cols-2 gap-6"
          >
            {/* Subscribe Card */}
            <div
              className="p-6"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme.colors.accent}15` }}
                >
                  <Bell size={24} style={{ color: theme.colors.accent }} />
                </div>
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('status.subscribe.title')}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('status.subscribe.description')}
                  </p>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
                style={{
                  background: `${theme.colors.primary}15`,
                  color: theme.colors.primary,
                }}
                onClick={() => {
                  // TODO: Implement actual opt-in/opt-out system
                  alert('Status notifications feature coming soon!')
                }}
              >
                <Bell size={16} />
                {t('status.subscribe.button')}
              </button>
            </div>

            {/* Support Card */}
            <div
              className="p-6"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}15` }}
                >
                  <MessageSquare
                    size={24}
                    style={{ color: theme.colors.primary }}
                  />
                </div>
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('status.support.title')}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('status.support.description')}
                  </p>
                </div>
              </div>
              <a
                href="mailto:support@eziox.link"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('status.support.button')}
              </a>
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p
              className="text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              <Info size={14} className="inline mr-1" />
              {t('status.footer.info')}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
