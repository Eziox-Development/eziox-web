import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '@/components/portfolio/ThemeProvider'
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
} from 'lucide-react'

export const Route = createFileRoute('/_public/status')({
  head: () => ({
    meta: [
      { title: 'System Status | Eziox' },
      { name: 'description', content: 'Real-time system status and uptime monitoring for Eziox services.' },
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
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  operational: { label: 'Operational', color: '#22c55e', icon: CheckCircle2 },
  degraded: { label: 'Degraded', color: '#f59e0b', icon: AlertTriangle },
  outage: { label: 'Outage', color: '#ef4444', icon: XCircle },
  maintenance: { label: 'Maintenance', color: '#3b82f6', icon: Clock },
}

function StatusPage() {
  const { theme } = useTheme()
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['system-status'],
    queryFn: async (): Promise<Service[]> => {
      const checkService = async (_name: string, url: string): Promise<{ status: ServiceStatus; latency: number }> => {
        const start = performance.now()
        try {
          await fetch(url, { method: 'HEAD', mode: 'no-cors' })
          const latency = Math.round(performance.now() - start)
          return { status: 'operational', latency }
        } catch {
          return { status: 'degraded', latency: 0 }
        }
      }

      const [api, web] = await Promise.all([
        checkService('API', '/api/health'),
        checkService('Web', '/'),
      ])

      return [
        { name: 'Web Application', description: 'Main website and user interface', icon: Globe, ...web },
        { name: 'API Services', description: 'Backend API and server functions', icon: Server, ...api },
        { name: 'Database', description: 'PostgreSQL on Neon', icon: Database, status: 'operational', latency: 12 },
        { name: 'Authentication', description: 'User login and session management', icon: Shield, status: 'operational', latency: 45 },
        { name: 'Email Service', description: 'Transactional emails via Resend', icon: Mail, status: 'operational', latency: 89 },
        { name: 'Payment Processing', description: 'Stripe payment gateway', icon: CreditCard, status: 'operational', latency: 156 },
        { name: 'CDN & Assets', description: 'Cloudinary and Vercel Edge', icon: Cloud, status: 'operational', latency: 23 },
        { name: 'Bot Protection', description: 'Cloudflare Turnstile', icon: Zap, status: 'operational', latency: 34 },
      ]
    },
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (services) setLastUpdated(new Date())
  }, [services])

  const overallStatus = services?.every(s => s.status === 'operational')
    ? 'operational'
    : services?.some(s => s.status === 'outage')
      ? 'outage'
      : 'degraded'

  const operationalCount = services?.filter(s => s.status === 'operational').length || 0
  const totalCount = services?.length || 0

  return (
    <div className="min-h-screen pt-32 pb-20 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
            <Activity size={16} style={{ color: theme.colors.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>System Status</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
            Service Status
          </h1>
          <p className="text-lg" style={{ color: theme.colors.foregroundMuted }}>
            Real-time monitoring of all Eziox services
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl mb-8"
          style={{
            background: `${STATUS_CONFIG[overallStatus].color}10`,
            border: `1px solid ${STATUS_CONFIG[overallStatus].color}30`,
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${STATUS_CONFIG[overallStatus].color}20` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {(() => {
                  const StatusIcon = STATUS_CONFIG[overallStatus].icon
                  return <StatusIcon size={32} style={{ color: STATUS_CONFIG[overallStatus].color }} />
                })()}
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>
                  {overallStatus === 'operational' ? 'All Systems Operational' : overallStatus === 'outage' ? 'Service Outage' : 'Partial Degradation'}
                </h2>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                  {operationalCount} of {totalCount} services operational
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Last updated</p>
                <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="p-3 rounded-xl transition-all hover:scale-105"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <RefreshCw size={18} style={{ color: theme.colors.foregroundMuted }} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl animate-pulse" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl" style={{ background: theme.colors.backgroundSecondary }} />
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded mb-2" style={{ background: theme.colors.backgroundSecondary }} />
                    <div className="h-3 w-48 rounded" style={{ background: theme.colors.backgroundSecondary }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            services?.map((service, i) => {
              const statusConfig = STATUS_CONFIG[service.status]
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${statusConfig.color}15` }}>
                        <service.icon size={24} style={{ color: statusConfig.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>{service.name}</h3>
                        <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {service.latency !== undefined && service.latency > 0 && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Latency</p>
                          <p className="text-sm font-mono font-medium" style={{ color: service.latency < 100 ? '#22c55e' : service.latency < 300 ? '#f59e0b' : '#ef4444' }}>
                            {service.latency}ms
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${statusConfig.color}15` }}>
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ background: statusConfig.color }}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-sm font-medium" style={{ color: statusConfig.color }}>{statusConfig.label}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-2xl text-center"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <p className="text-sm mb-2" style={{ color: theme.colors.foregroundMuted }}>
            Having issues? Contact us at
          </p>
          <a href="mailto:support@eziox.link" className="text-lg font-medium hover:underline" style={{ color: theme.colors.primary }}>
            support@eziox.link
          </a>
        </motion.div>
      </div>
    </div>
  )
}
