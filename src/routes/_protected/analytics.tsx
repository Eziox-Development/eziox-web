import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  getAnalyticsOverviewFn,
  getDailyStatsFn,
  getTopLinksFn,
  getReferrersFn,
  exportAnalyticsFn,
} from '@/server/functions/analytics'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  Link as LinkIcon,
  Globe,
  Loader2,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/analytics')({
  head: () => ({
    meta: [
      { title: 'Analytics | Eziox' },
      { name: 'description', content: 'View your profile analytics and performance metrics.' },
    ],
  }),
  component: AnalyticsPage,
})

type TimeRange = 7 | 30 | 90 | 365

function AnalyticsPage() {
  const { theme } = useTheme()
  const [timeRange, setTimeRange] = useState<TimeRange>(30)

  const getOverview = useServerFn(getAnalyticsOverviewFn)
  const getDailyStats = useServerFn(getDailyStatsFn)
  const getTopLinks = useServerFn(getTopLinksFn)
  const getReferrers = useServerFn(getReferrersFn)
  const exportAnalytics = useServerFn(exportAnalyticsFn)

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: async () => {
      const result = await getOverview()
      return result as {
        totalViews: number
        totalClicks: number
        totalFollowers: number
        viewsChange: number
        clicksChange: number
        followersChange: number
      }
    },
  })

  const { data: dailyStats, isLoading: dailyLoading } = useQuery({
    queryKey: ['dailyStats', timeRange],
    queryFn: async () => {
      const result = await getDailyStats({ data: { days: timeRange } })
      return result as Array<{ date: string; views: number; clicks: number; followers: number }>
    },
  })

  const { data: topLinks } = useQuery({
    queryKey: ['topLinks'],
    queryFn: async () => {
      const result = await getTopLinks({ data: { limit: 5 } })
      return result as Array<{ id: string; title: string; url: string; clicks: number; percentage: number }>
    },
  })

  const { data: referrers } = useQuery({
    queryKey: ['referrers', timeRange],
    queryFn: async () => {
      const result = await getReferrers({ data: { days: timeRange } })
      return result as Array<{ source: string; count: number; percentage: number }>
    },
  })

  const handleExport = async (format: 'json' | 'csv') => {
    const result = await exportAnalytics({ data: { days: timeRange, format } })
    const exportData = result as { data: string | unknown[]; format: string }

    const blob = new Blob(
      [typeof exportData.data === 'string' ? exportData.data : JSON.stringify(exportData.data, null, 2)],
      { type: format === 'csv' ? 'text/csv' : 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}days.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const maxViews = Math.max(...(dailyStats?.map((d) => d.views) || [1]))
  const maxClicks = Math.max(...(dailyStats?.map((d) => d.clicks) || [1]))

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.foreground }}>
                Analytics
              </h1>
              <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                Track your profile performance and engagement
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl overflow-hidden" style={{ background: theme.colors.backgroundSecondary }}>
                {([7, 30, 90, 365] as TimeRange[]).map((days) => (
                  <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className="px-3 py-2 text-sm font-medium transition-all"
                    style={{
                      background: timeRange === days ? theme.colors.primary : 'transparent',
                      color: timeRange === days ? '#fff' : theme.colors.foregroundMuted,
                    }}
                  >
                    {days === 365 ? '1Y' : `${days}D`}
                  </button>
                ))}
              </div>
              <motion.button
                onClick={() => handleExport('csv')}
                className="p-2 rounded-xl"
                style={{ background: theme.colors.backgroundSecondary }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Export CSV"
              >
                <Download size={18} style={{ color: theme.colors.foregroundMuted }} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Views"
            value={overview?.totalViews || 0}
            change={overview?.viewsChange || 0}
            icon={Eye}
            theme={theme}
            loading={overviewLoading}
          />
          <StatCard
            title="Link Clicks"
            value={overview?.totalClicks || 0}
            change={overview?.clicksChange || 0}
            icon={MousePointerClick}
            theme={theme}
            loading={overviewLoading}
          />
          <StatCard
            title="Followers"
            value={overview?.totalFollowers || 0}
            change={overview?.followersChange || 0}
            icon={Users}
            theme={theme}
            loading={overviewLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={20} style={{ color: theme.colors.primary }} />
              <h2 className="font-bold" style={{ color: theme.colors.foreground }}>
                Activity Overview
              </h2>
            </div>

            {dailyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin" size={24} style={{ color: theme.colors.primary }} />
              </div>
            ) : (
              <div className="h-64 flex items-end gap-1">
                {dailyStats?.slice(-30).map((day, i) => (
                  <div key={day.date} className="flex-1 flex flex-col gap-1 group relative">
                    <motion.div
                      className="rounded-t"
                      style={{ background: theme.colors.primary, opacity: 0.8 }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.views / maxViews) * 100}%` }}
                      transition={{ delay: i * 0.02 }}
                    />
                    <motion.div
                      className="rounded-t"
                      style={{ background: '#22c55e', opacity: 0.8 }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.clicks / (maxClicks || 1)) * 20}%` }}
                      transition={{ delay: i * 0.02 }}
                    />
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                    >
                      <p style={{ color: theme.colors.foreground }}>{new Date(day.date).toLocaleDateString()}</p>
                      <p style={{ color: theme.colors.primary }}>{day.views} views</p>
                      <p style={{ color: '#22c55e' }}>{day.clicks} clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: theme.colors.primary }} />
                <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: '#22c55e' }} />
                <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Clicks</span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon size={18} style={{ color: theme.colors.primary }} />
                <h3 className="font-bold text-sm" style={{ color: theme.colors.foreground }}>Top Links</h3>
              </div>
              <div className="space-y-3">
                {topLinks?.length ? (
                  topLinks.map((link, i) => (
                    <div key={link.id} className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: `${theme.colors.primary}20`, color: theme.colors.primary }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: theme.colors.foreground }}>{link.title}</p>
                        <div className="h-1 rounded-full mt-1" style={{ background: theme.colors.backgroundSecondary }}>
                          <div
                            className="h-full rounded-full"
                            style={{ background: theme.colors.primary, width: `${link.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>
                        {link.clicks}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: theme.colors.foregroundMuted }}>
                    No link data yet
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-5"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Globe size={18} style={{ color: theme.colors.primary }} />
                <h3 className="font-bold text-sm" style={{ color: theme.colors.foreground }}>Top Referrers</h3>
              </div>
              <div className="space-y-3">
                {referrers?.length ? (
                  referrers.slice(0, 5).map((ref) => (
                    <div key={ref.source} className="flex items-center justify-between">
                      <span className="text-sm truncate" style={{ color: theme.colors.foreground }}>
                        {ref.source || 'Direct'}
                      </span>
                      <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>
                        {ref.count} ({ref.percentage}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: theme.colors.foregroundMuted }}>
                    No referrer data yet
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  change: number
  icon: React.ElementType
  theme: ReturnType<typeof useTheme>['theme']
  loading?: boolean
}

function StatCard({ title, value, change, icon: Icon, theme, loading }: StatCardProps) {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${theme.colors.primary}20` }}
        >
          <Icon size={20} style={{ color: theme.colors.primary }} />
        </div>
        {change !== 0 && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              background: isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isPositive ? '#22c55e' : '#ef4444',
            }}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-sm mb-1" style={{ color: theme.colors.foregroundMuted }}>{title}</p>
      {loading ? (
        <div className="h-8 w-20 rounded animate-pulse" style={{ background: theme.colors.backgroundSecondary }} />
      ) : (
        <p className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>
          {value.toLocaleString()}
        </p>
      )}
    </motion.div>
  )
}
