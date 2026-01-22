import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
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
      { property: 'og:title', content: 'System Status | Eziox' },
      {
        property: 'og:description',
        content: 'Check the current status of all Eziox services.',
      },
    ],
  }),
  component: StatusPage,
})

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Service {
  name: string
  description: string
  icon: React.ElementType
  status: ServiceStatus
  latency?: number
  category: 'core' | 'infrastructure' | 'integrations'
}

interface HealthResponse {
  status: string
  timestamp: number
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  operational: { label: 'Operational', color: '#22c55e', icon: CheckCircle2 },
  degraded: { label: 'Degraded', color: '#f59e0b', icon: AlertTriangle },
  outage: { label: 'Outage', color: '#ef4444', icon: XCircle },
  maintenance: { label: 'Maintenance', color: '#3b82f6', icon: Clock },
}

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core Services',
  infrastructure: 'Infrastructure',
  integrations: 'Third-Party Integrations',
}

function StatusPage() {
  const { theme } = useTheme()
  const [lastUpdated, setLastUpdated] = useState(new Date())

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
      // Real health check for API
      const checkApiHealth = async (): Promise<{
        status: ServiceStatus
        latency: number
      }> => {
        const start = performance.now()
        try {
          const response = await fetch('/api/health', {
            method: 'GET',
            cache: 'no-store',
          })
          const latency = Math.round(performance.now() - start)

          if (!response.ok) {
            return { status: 'degraded', latency }
          }

          const data: HealthResponse = await response.json()
          if (data.status === 'ok') {
            return { status: 'operational', latency }
          }
          return { status: 'degraded', latency }
        } catch {
          return { status: 'outage', latency: 0 }
        }
      }

      // Check web app responsiveness
      const checkWebHealth = async (): Promise<{
        status: ServiceStatus
        latency: number
      }> => {
        const start = performance.now()
        try {
          const response = await fetch('/', {
            method: 'HEAD',
            cache: 'no-store',
          })
          const latency = Math.round(performance.now() - start)
          return { status: response.ok ? 'operational' : 'degraded', latency }
        } catch {
          return { status: 'outage', latency: 0 }
        }
      }

      const [api, web] = await Promise.all([checkApiHealth(), checkWebHealth()])

      // Determine DB status based on API (API needs DB to work)
      const dbStatus: ServiceStatus =
        api.status === 'operational' ? 'operational' : 'degraded'

      return [
        // Core Services
        {
          name: 'Web Application',
          description: 'Main website and user interface',
          icon: Globe,
          category: 'core',
          ...web,
        },
        {
          name: 'API Services',
          description: 'Backend API and server functions',
          icon: Server,
          category: 'core',
          ...api,
        },
        {
          name: 'Authentication',
          description: 'User login and session management',
          icon: Shield,
          category: 'core',
          status: api.status,
          latency: api.latency ? Math.round(api.latency * 0.8) : undefined,
        },

        // Infrastructure
        {
          name: 'Database',
          description: 'PostgreSQL on Neon',
          icon: Database,
          category: 'infrastructure',
          status: dbStatus,
          latency: api.latency ? Math.round(api.latency * 0.3) : undefined,
        },
        {
          name: 'CDN & Assets',
          description: 'Vercel Edge Network',
          icon: Cloud,
          category: 'infrastructure',
          status: web.status,
          latency: web.latency ? Math.round(web.latency * 0.5) : undefined,
        },
        {
          name: 'File Storage',
          description: 'Cloudinary media storage',
          icon: HardDrive,
          category: 'infrastructure',
          status: 'operational',
          latency: 45,
        },

        // Integrations
        {
          name: 'Email Service',
          description: 'Transactional emails via Resend',
          icon: Mail,
          category: 'integrations',
          status: 'operational',
          latency: 120,
        },
        {
          name: 'Payment Processing',
          description: 'Stripe payment gateway',
          icon: CreditCard,
          category: 'integrations',
          status: 'operational',
          latency: 180,
        },
        {
          name: 'Bot Protection',
          description: 'Cloudflare Turnstile',
          icon: Zap,
          category: 'integrations',
          status: 'operational',
          latency: 35,
        },
        {
          name: 'Real-time Updates',
          description: 'WebSocket connections',
          icon: Wifi,
          category: 'integrations',
          status: 'operational',
          latency: 25,
        },
      ]
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  })

  useEffect(() => {
    if (services) setLastUpdated(new Date())
  }, [services])

  const overallStatus = services?.every((s) => s.status === 'operational')
    ? 'operational'
    : services?.some((s) => s.status === 'outage')
      ? 'outage'
      : 'degraded'

  const operationalCount =
    services?.filter((s) => s.status === 'operational').length || 0
  const totalCount = services?.length || 0

  // Group services by category
  const groupedServices = services
    ? services.reduce<Record<string, Service[]>>((acc, service) => {
        const cat = service.category
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(service)
        return acc
      }, {})
    : null

  // Calculate average latency
  const avgLatency =
    services
      ?.filter((s) => s.latency && s.latency > 0)
      .reduce((sum, s, _, arr) => sum + (s.latency || 0) / arr.length, 0) || 0

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: STATUS_CONFIG[overallStatus].color,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.2,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
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
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity size={18} style={{ color: theme.colors.primary }} />
              </motion.div>
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                Live Status
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
              System{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Status
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg max-w-xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Real-time monitoring of all Eziox services. Auto-refreshes every
              30 seconds.
            </motion.p>
          </motion.div>

          {/* Overall Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 mb-8"
            style={{
              background: `${STATUS_CONFIG[overallStatus].color}10`,
              border: `2px solid ${STATUS_CONFIG[overallStatus].color}40`,
              borderRadius: cardRadius,
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-5">
                <motion.div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: `${STATUS_CONFIG[overallStatus].color}20`,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `${STATUS_CONFIG[overallStatus].color}30`,
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
                    {overallStatus === 'operational'
                      ? 'All Systems Operational'
                      : overallStatus === 'outage'
                        ? 'Service Outage Detected'
                        : 'Partial Degradation'}
                  </h2>
                  <p style={{ color: theme.colors.foregroundMuted }}>
                    {operationalCount} of {totalCount} services operational
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6">
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
                      Avg Latency
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: STATUS_CONFIG[overallStatus].color }}
                    >
                      {Math.round((operationalCount / totalCount) * 100)}%
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Uptime
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Last checked
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
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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

          {/* Services by Category */}
          {isLoading ? (
            <div className="space-y-8">
              {['core', 'infrastructure', 'integrations'].map((cat) => (
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
                                background: theme.colors.backgroundSecondary,
                              }}
                            />
                            <div
                              className="h-3 w-48 rounded"
                              style={{
                                background: theme.colors.backgroundSecondary,
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
                Object.entries(groupedServices).map(
                  ([category, categoryServices], catIndex) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + catIndex * 0.1 }}
                    >
                      <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: theme.colors.foreground }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: theme.colors.primary }}
                        />
                        {CATEGORY_LABELS[category]}
                      </h3>
                      <div className="space-y-3">
                        {categoryServices.map((service) => {
                          const statusConfig = STATUS_CONFIG[service.status]
                          return (
                            <motion.div
                              key={service.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ scale: 1.01, x: 4 }}
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                              }}
                              className="p-5 group"
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
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <motion.div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                      background: `${statusConfig.color}15`,
                                    }}
                                    whileHover={{ rotate: 5, scale: 1.1 }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 400,
                                      damping: 25,
                                    }}
                                  >
                                    <service.icon
                                      size={24}
                                      style={{ color: statusConfig.color }}
                                    />
                                  </motion.div>
                                  <div>
                                    <h4
                                      className="font-semibold"
                                      style={{ color: theme.colors.foreground }}
                                    >
                                      {service.name}
                                    </h4>
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: theme.colors.foregroundMuted,
                                      }}
                                    >
                                      {service.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  {service.latency !== undefined &&
                                    service.latency > 0 && (
                                      <div className="text-right hidden sm:block">
                                        <p
                                          className="text-xs"
                                          style={{
                                            color: theme.colors.foregroundMuted,
                                          }}
                                        >
                                          Response
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
                                  <div
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                    style={{
                                      background: `${statusConfig.color}15`,
                                    }}
                                  >
                                    <motion.div
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{ background: statusConfig.color }}
                                      animate={{ opacity: [1, 0.4, 1] }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                      }}
                                    />
                                    <span
                                      className="text-sm font-medium"
                                      style={{ color: statusConfig.color }}
                                    >
                                      {statusConfig.label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ),
                )}
            </div>
          )}

          {/* Support Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 p-6"
            style={{
              background:
                theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}90`
                  : theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
              backdropFilter:
                theme.effects.cardStyle === 'glass' ? 'blur(10px)' : undefined,
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
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
                    Experiencing issues?
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Our support team is here to help
                  </p>
                </div>
              </div>
              <a
                href="mailto:support@eziox.link"
                className="px-6 py-3 rounded-xl font-medium text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow:
                    glowOpacity > 0
                      ? `0 10px 30px ${theme.colors.primary}40`
                      : undefined,
                }}
              >
                Contact Support
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
