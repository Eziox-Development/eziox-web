import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { motion, AnimatePresence } from 'motion/react'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Check,
  Loader2,
  RefreshCw,
  Filter,
  User,
  Globe,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  getSecurityEventsFn,
  getSecurityStatsFn,
  resolveSecurityEventFn,
} from '@/server/functions/security-monitoring'

type FilterType = 'all' | 'unresolved' | 'critical'

export function SecurityTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<FilterType>('unresolved')
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const getSecurityEvents = useServerFn(getSecurityEventsFn)
  const getSecurityStats = useServerFn(getSecurityStatsFn)
  const resolveEvent = useServerFn(resolveSecurityEventFn)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['security-stats'],
    queryFn: () => getSecurityStats({ data: undefined }),
    refetchInterval: 30000,
  })

  const { data: eventsData, isLoading: eventsLoading, refetch } = useQuery({
    queryKey: ['security-events', filter],
    queryFn: () =>
      getSecurityEvents({
        data: {
          limit: 50,
          resolved: filter === 'unresolved' ? false : undefined,
          severity: filter === 'critical' ? 'critical' : undefined,
        },
      }),
    refetchInterval: 30000,
  })

  const resolveMutation = useMutation({
    mutationFn: (eventId: string) => resolveEvent({ data: { eventId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['security-events'] })
      void queryClient.invalidateQueries({ queryKey: ['security-stats'] })
    },
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626'
      case 'high':
        return '#ef4444'
      case 'medium':
        return '#f59e0b'
      default:
        return '#3b82f6'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'rgba(220, 38, 38, 0.15)'
      case 'high':
        return 'rgba(239, 68, 68, 0.15)'
      case 'medium':
        return 'rgba(245, 158, 11, 0.15)'
      default:
        return 'rgba(59, 130, 246, 0.15)'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp size={16} className="text-red-500" />
      case 'decreasing':
        return <TrendingDown size={16} className="text-green-500" />
      default:
        return <Minus size={16} className="text-gray-500" />
    }
  }

  const formatEventType = (type: string) => {
    return type
      .replace(/\./g, ' → ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: theme.colors.foreground }}
          >
            {t('admin.security.title')}
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('admin.security.description')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw size={14} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t('admin.security.stats.totalEvents'),
            value: stats?.totalEvents || 0,
            icon: Shield,
            color: theme.colors.primary,
          },
          {
            label: t('admin.security.stats.unresolvedEvents'),
            value: stats?.unresolvedEvents || 0,
            icon: AlertTriangle,
            color: '#f59e0b',
          },
          {
            label: t('admin.security.stats.criticalEvents'),
            value: stats?.criticalEvents || 0,
            icon: AlertTriangle,
            color: '#dc2626',
          },
          {
            label: t('admin.security.stats.trend'),
            value: stats?.recentTrend || 'stable',
            icon: TrendingUp,
            color: '#22c55e',
            isTrend: true,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl"
            style={{
              background: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: `${stat.color}20` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {stat.label}
                </p>
                {stat.isTrend ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    {getTrendIcon(stat.value as string)}
                    <span
                      className="text-sm font-medium capitalize"
                      style={{ color: theme.colors.foreground }}
                    >
                      {t(`admin.security.trend.${stat.value}`)}
                    </span>
                  </div>
                ) : (
                  <p
                    className="text-xl font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {statsLoading ? '...' : stat.value}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={16} style={{ color: theme.colors.foregroundMuted }} />
        {(['all', 'unresolved', 'critical'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                filter === f
                  ? `${theme.colors.primary}20`
                  : theme.colors.backgroundSecondary,
              color:
                filter === f
                  ? theme.colors.primary
                  : theme.colors.foregroundMuted,
              border: `1px solid ${filter === f ? theme.colors.primary : theme.colors.border}`,
            }}
          >
            {t(`admin.security.filters.${f}`)}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="animate-spin"
              size={24}
              style={{ color: theme.colors.primary }}
            />
          </div>
        ) : !eventsData?.events?.length ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle
              size={48}
              className="mb-3"
              style={{ color: '#22c55e' }}
            />
            <p style={{ color: theme.colors.foreground }}>
              {t('admin.security.noEvents')}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.colors.border }}>
            {eventsData.events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: getSeverityBg(event.severity),
                          color: getSeverityColor(event.severity),
                        }}
                      >
                        {t(`admin.security.severity.${event.severity}`)}
                      </span>
                      {event.resolved && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-500">
                          {t('admin.security.resolved')}
                        </span>
                      )}
                    </div>
                    <p
                      className="font-medium"
                      style={{ color: theme.colors.foreground }}
                    >
                      {formatEventType(event.eventType)}
                    </p>
                    <div
                      className="flex items-center gap-4 mt-2 text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {event.userId && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {event.userId.slice(0, 8)}...
                        </span>
                      )}
                      {event.ipAddress && (
                        <span className="flex items-center gap-1">
                          <Globe size={12} />
                          {event.ipAddress}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(event.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedEvent(
                          selectedEvent === event.id ? null : event.id
                        )
                      }
                    >
                      <Eye size={14} />
                    </Button>
                    {!event.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveMutation.mutate(event.id)}
                        disabled={resolveMutation.isPending}
                      >
                        {resolveMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedEvent === event.id && event.details && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <pre
                        className="mt-3 p-3 rounded-lg text-xs overflow-x-auto"
                        style={{
                          background: theme.colors.background,
                          color: theme.colors.foregroundMuted,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {eventsData && eventsData.total > 0 && (
        <p
          className="text-sm text-center"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {t('common.showing')} {eventsData.events.length} {t('common.of')}{' '}
          {eventsData.total} {t('common.events', 'events')}
        </p>
      )}
    </div>
  )
}
