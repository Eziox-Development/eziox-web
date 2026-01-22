import { createFileRoute, Link } from '@tanstack/react-router'
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
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import {
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  Link2,
  Globe,
  Loader2,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Activity,
  Target,
  Zap,
  ChevronRight,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  Clock,
  Crown,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/analytics')({
  head: () => ({
    meta: [
      { title: 'Analytics | Eziox' },
      {
        name: 'description',
        content: 'Track your profile performance and engagement metrics.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AnalyticsPage,
})

type TimeRange = 7 | 30 | 90 | 365

const timeRangeLabels: Record<TimeRange, string> = {
  7: '7 Days',
  30: '30 Days',
  90: '90 Days',
  365: '1 Year',
}

function AnalyticsPage() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>(30)
  const [isExporting, setIsExporting] = useState(false)

  const getOverview = useServerFn(getAnalyticsOverviewFn)
  const getDailyStats = useServerFn(getDailyStatsFn)
  const getTopLinks = useServerFn(getTopLinksFn)
  const getReferrers = useServerFn(getReferrersFn)
  const exportAnalytics = useServerFn(exportAnalyticsFn)

  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery({
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
        isRealtime: boolean
        analyticsDelay: number
      }
    },
    refetchInterval: 60000,
  })

  const {
    data: dailyStats,
    isLoading: dailyLoading,
    refetch: refetchDaily,
  } = useQuery({
    queryKey: ['dailyStats', timeRange],
    queryFn: async () => {
      const result = await getDailyStats({ data: { days: timeRange } })
      return result as Array<{
        date: string
        views: number
        clicks: number
        followers: number
      }>
    },
    refetchInterval: 60000,
  })

  const { data: topLinksData, refetch: refetchLinks } = useQuery({
    queryKey: ['topLinks'],
    queryFn: async () => {
      const result = await getTopLinks({ data: { limit: 5 } })
      return result as {
        links: Array<{
          id: string
          title: string
          url: string
          clicks: number
          percentage: number
        }>
        requiresUpgrade: boolean
        message?: string
      }
    },
    refetchInterval: 60000,
  })

  const { data: referrersData, refetch: refetchReferrers } = useQuery({
    queryKey: ['referrers', timeRange],
    queryFn: async () => {
      const result = await getReferrers({ data: { days: timeRange } })
      return result as {
        referrers: Array<{ source: string; count: number; percentage: number }>
        requiresUpgrade: boolean
        message?: string
      }
    },
    refetchInterval: 60000,
  })

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true)
    try {
      const result = await exportAnalytics({
        data: { days: timeRange, format },
      })
      const exportData = result as { data: string | unknown[]; format: string }
      const blob = new Blob(
        [
          typeof exportData.data === 'string'
            ? exportData.data
            : JSON.stringify(exportData.data, null, 2),
        ],
        { type: format === 'csv' ? 'text/csv' : 'application/json' },
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `eziox-analytics-${timeRange}days.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefreshAll = () => {
    void refetchOverview()
    void refetchDaily()
    void refetchLinks()
    void refetchReferrers()
  }

  const maxValue = Math.max(
    ...(dailyStats?.map((d) => d.views + d.clicks) || [1]),
    1,
  )
  const totalPeriodViews = dailyStats?.reduce((sum, d) => sum + d.views, 0) || 0
  const totalPeriodClicks =
    dailyStats?.reduce((sum, d) => sum + d.clicks, 0) || 0
  const avgDailyViews = dailyStats?.length
    ? Math.round(totalPeriodViews / dailyStats.length)
    : 0

  return (
    <div
      className="min-h-screen pt-20 pb-16"
      style={{ background: 'var(--background)' }}
    >
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{
            background: `radial-gradient(circle, ${theme.colors.primary}, transparent)`,
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-15"
          style={{
            background: `radial-gradient(circle, ${theme.colors.accent}, transparent)`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <BarChart3 size={28} className="text-white" />
              </motion.div>
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ color: theme.colors.foreground }}
                >
                  Analytics
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Track your profile performance • @{currentUser?.username}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center rounded-xl p-1"
                style={{
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                {([7, 30, 90, 365] as TimeRange[]).map((days) => (
                  <motion.button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                    style={{
                      background:
                        timeRange === days
                          ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                          : 'transparent',
                      color:
                        timeRange === days
                          ? '#fff'
                          : theme.colors.foregroundMuted,
                    }}
                    whileHover={{ scale: timeRange === days ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {days === 365 ? '1Y' : `${days}D`}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={handleRefreshAll}
                className="p-2.5 rounded-xl transition-all"
                style={{
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Refresh data"
              >
                <RefreshCw
                  size={18}
                  style={{ color: theme.colors.foregroundMuted }}
                />
              </motion.button>

              <div className="relative group">
                <motion.button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Export
                </motion.button>
                <div
                  className="absolute right-0 top-full mt-2 w-40 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: theme.colors.foreground }}
                  >
                    <FileSpreadsheet size={16} style={{ color: '#22c55e' }} />
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: theme.colors.foreground }}
                  >
                    <FileJson size={16} style={{ color: '#f59e0b' }} />
                    Export JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {overview && !overview.isRealtime && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl flex items-center justify-between gap-4"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10)`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${theme.colors.primary}20` }}
              >
                <Clock size={20} style={{ color: theme.colors.primary }} />
              </div>
              <div>
                <p
                  className="font-medium text-sm"
                  style={{ color: theme.colors.foreground }}
                >
                  Analytics delayed by {overview.analyticsDelay}h
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Upgrade to Pro for realtime analytics
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              search={{ tab: 'subscription' }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                color: '#fff',
              }}
            >
              <Crown size={16} />
              Upgrade
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Views"
            value={overview?.totalViews || 0}
            change={overview?.viewsChange || 0}
            icon={Eye}
            iconColor="#3b82f6"
            theme={theme}
            loading={overviewLoading}
            delay={0}
          />
          <StatCard
            title="Link Clicks"
            value={overview?.totalClicks || 0}
            change={overview?.clicksChange || 0}
            icon={MousePointerClick}
            iconColor="#22c55e"
            theme={theme}
            loading={overviewLoading}
            delay={0.05}
          />
          <StatCard
            title="Followers"
            value={overview?.totalFollowers || 0}
            change={overview?.followersChange || 0}
            icon={Users}
            iconColor="#8b5cf6"
            theme={theme}
            loading={overviewLoading}
            delay={0.1}
          />
          <StatCard
            title="Avg. Daily Views"
            value={avgDailyViews}
            icon={Activity}
            iconColor="#f59e0b"
            theme={theme}
            loading={dailyLoading}
            delay={0.15}
            subtitle={`Last ${timeRangeLabels[timeRange]}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.colors.primary}20` }}
                  >
                    <Activity
                      size={20}
                      style={{ color: theme.colors.primary }}
                    />
                  </div>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      Activity Overview
                    </h2>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {timeRangeLabels[timeRange]} •{' '}
                      {totalPeriodViews.toLocaleString()} views,{' '}
                      {totalPeriodClicks.toLocaleString()} clicks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: theme.colors.primary }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Views
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: '#22c55e' }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Clicks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {dailyLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2
                    className="animate-spin"
                    size={32}
                    style={{ color: theme.colors.primary }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-end gap-[2px]">
                  {dailyStats
                    ?.slice(-Math.min(dailyStats.length, 60))
                    .map((day, i) => {
                      const viewHeight =
                        maxValue > 0 ? (day.views / maxValue) * 100 : 0
                      const clickHeight =
                        maxValue > 0 ? (day.clicks / maxValue) * 100 : 0

                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col justify-end gap-px group relative min-w-[4px]"
                        >
                          <motion.div
                            className="rounded-t-sm cursor-pointer"
                            style={{ background: theme.colors.primary }}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(viewHeight, 2)}%` }}
                            transition={{
                              delay: i * 0.01,
                              duration: 0.4,
                              ease: 'easeOut',
                            }}
                            whileHover={{ opacity: 0.8 }}
                          />
                          <motion.div
                            className="rounded-t-sm cursor-pointer"
                            style={{ background: '#22c55e' }}
                            initial={{ height: 0 }}
                            animate={{
                              height: `${Math.max(clickHeight * 0.5, 1)}%`,
                            }}
                            transition={{
                              delay: i * 0.01 + 0.1,
                              duration: 0.4,
                              ease: 'easeOut',
                            }}
                            whileHover={{ opacity: 0.8 }}
                          />
                          <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20"
                            style={{
                              background: theme.colors.card,
                              border: `1px solid ${theme.colors.border}`,
                              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            }}
                          >
                            <p
                              className="font-medium mb-1"
                              style={{ color: theme.colors.foreground }}
                            >
                              {new Date(day.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p style={{ color: theme.colors.primary }}>
                              {day.views} views
                            </p>
                            <p style={{ color: '#22c55e' }}>
                              {day.clicks} clicks
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-5 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                >
                  <Link2 size={20} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    Top Links
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    By total clicks
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {topLinksData?.requiresUpgrade ? (
                <div className="py-8 text-center">
                  <Crown
                    size={32}
                    className="mx-auto mb-3 opacity-50"
                    style={{ color: theme.colors.primary }}
                  />
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: theme.colors.foreground }}
                  >
                    Per-Link Analytics
                  </p>
                  <p
                    className="text-xs mb-4"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Track clicks on individual links
                  </p>
                  <Link
                    to="/profile"
                    search={{ tab: 'subscription' }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      color: '#fff',
                    }}
                  >
                    <Crown size={14} />
                    Upgrade to Pro
                  </Link>
                </div>
              ) : topLinksData?.links?.length ? (
                <div className="space-y-3">
                  {topLinksData.links.map((link, i) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background:
                            i === 0
                              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                              : i === 1
                                ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                                : i === 2
                                  ? 'linear-gradient(135deg, #d97706, #92400e)'
                                  : theme.colors.backgroundSecondary,
                          color: i < 3 ? '#fff' : theme.colors.foregroundMuted,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: theme.colors.foreground }}
                        >
                          {link.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{
                              background: theme.colors.backgroundSecondary,
                            }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: '#22c55e' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${link.percentage}%` }}
                              transition={{
                                delay: 0.4 + i * 0.05,
                                duration: 0.5,
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-medium"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {link.percentage}%
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: '#22c55e' }}
                      >
                        {link.clicks}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Link2
                    size={32}
                    className="mx-auto mb-3 opacity-30"
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    No link data yet
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1 text-xs mt-2 hover:underline"
                    style={{ color: theme.colors.primary }}
                  >
                    Add your first link <ChevronRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-5 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                >
                  <Globe size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    Traffic Sources
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Where your visitors come from
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {referrersData?.requiresUpgrade ? (
                <div className="py-8 text-center">
                  <Crown
                    size={32}
                    className="mx-auto mb-3 opacity-50"
                    style={{ color: '#8b5cf6' }}
                  />
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: theme.colors.foreground }}
                  >
                    Referrer Tracking
                  </p>
                  <p
                    className="text-xs mb-4"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    See where your visitors come from
                  </p>
                  <Link
                    to="/profile"
                    search={{ tab: 'subscription' }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      color: '#fff',
                    }}
                  >
                    <Crown size={14} />
                    Upgrade to Pro
                  </Link>
                </div>
              ) : referrersData?.referrers?.length ? (
                <div className="space-y-3">
                  {referrersData.referrers.slice(0, 6).map((ref, i) => (
                    <motion.div
                      key={ref.source}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: theme.colors.backgroundSecondary,
                          }}
                        >
                          <Globe
                            size={14}
                            style={{ color: theme.colors.foregroundMuted }}
                          />
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme.colors.foreground }}
                        >
                          {ref.source || 'Direct'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-24 h-1.5 rounded-full overflow-hidden"
                          style={{
                            background: theme.colors.backgroundSecondary,
                          }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: '#8b5cf6' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${ref.percentage}%` }}
                            transition={{
                              delay: 0.4 + i * 0.05,
                              duration: 0.5,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium w-16 text-right"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {ref.count} ({ref.percentage}%)
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Globe
                    size={32}
                    className="mx-auto mb-3 opacity-30"
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    No referrer data yet
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Share your profile to see traffic sources
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: theme.colors.foreground }}
                  >
                    Quick Insights
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Performance summary
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <InsightItem
                  icon={Target}
                  label="Click-through Rate"
                  value={
                    overview && overview.totalViews > 0
                      ? `${((overview.totalClicks / overview.totalViews) * 100).toFixed(1)}%`
                      : '0%'
                  }
                  theme={theme}
                />
                <InsightItem
                  icon={TrendingUp}
                  label="Views Trend"
                  value={
                    overview?.viewsChange !== undefined
                      ? `${overview.viewsChange >= 0 ? '+' : ''}${overview.viewsChange}%`
                      : '0%'
                  }
                  positive={
                    overview?.viewsChange !== undefined
                      ? overview.viewsChange >= 0
                      : true
                  }
                  theme={theme}
                />
                <InsightItem
                  icon={Zap}
                  label="Engagement Score"
                  value={
                    overview
                      ? Math.min(
                          100,
                          Math.round(
                            ((overview.totalClicks +
                              overview.totalFollowers * 5) /
                              Math.max(overview.totalViews, 1)) *
                              100,
                          ),
                        ).toString()
                      : '0'
                  }
                  suffix="/100"
                  theme={theme}
                />
                <InsightItem
                  icon={Calendar}
                  label="Period"
                  value={timeRangeLabels[timeRange]}
                  theme={theme}
                />
              </div>

              <Link
                to="/profile"
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  color: '#fff',
                }}
              >
                <ArrowUpRight size={16} />
                Optimize Profile
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  change?: number
  icon: React.ElementType
  iconColor: string
  theme: ReturnType<typeof useTheme>['theme']
  loading?: boolean
  delay?: number
  subtitle?: string
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  theme,
  loading,
  delay = 0,
  subtitle,
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-5 relative overflow-hidden group"
      style={{
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: iconColor }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${iconColor}20` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon size={24} style={{ color: iconColor }} />
          </motion.div>
          {change !== undefined && change !== 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{
                background: isPositive
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                color: isPositive ? '#22c55e' : '#ef4444',
              }}
            >
              {isPositive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {Math.abs(change)}%
            </motion.div>
          )}
        </div>
        <p
          className="text-sm mb-1"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {title}
        </p>
        {loading ? (
          <div
            className="h-9 w-24 rounded-lg animate-pulse"
            style={{ background: theme.colors.backgroundSecondary }}
          />
        ) : (
          <motion.p
            className="text-3xl font-bold"
            style={{ color: theme.colors.foreground }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.1 }}
          >
            {value.toLocaleString()}
          </motion.p>
        )}
        {subtitle && (
          <p
            className="text-xs mt-1"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}

interface InsightItemProps {
  icon: React.ElementType
  label: string
  value: string
  suffix?: string
  positive?: boolean
  theme: ReturnType<typeof useTheme>['theme']
}

function InsightItem({
  icon: Icon,
  label,
  value,
  suffix,
  positive,
  theme,
}: InsightItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} style={{ color: theme.colors.foregroundMuted }} />
        <span
          className="text-sm"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {label}
        </span>
      </div>
      <span
        className="text-sm font-bold"
        style={{
          color:
            positive !== undefined
              ? positive
                ? '#22c55e'
                : '#ef4444'
              : theme.colors.foreground,
        }}
      >
        {value}
        {suffix}
      </span>
    </div>
  )
}
