import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import {
  getAnalyticsOverviewFn,
  getDailyStatsFn,
  getTopLinksFn,
  getReferrersFn,
  exportAnalyticsFn,
} from '@/server/functions/analytics'
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
  Radio,
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

const TIME_RANGE_KEYS: Record<TimeRange, string> = {
  7: '7d',
  30: '30d',
  90: '90d',
  365: '1y',
}

function AnalyticsPage() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>(30)
  const [isExporting, setIsExporting] = useState(false)
  const [activeChart, setActiveChart] = useState<'views' | 'clicks'>('views')

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

  const chartData = useMemo(() => {
    if (!dailyStats?.length) return []
    const maxViews = Math.max(...dailyStats.map((d) => d.views), 1)
    const maxClicks = Math.max(...dailyStats.map((d) => d.clicks), 1)
    return dailyStats.slice(-Math.min(dailyStats.length, 60)).map((day) => ({
      ...day,
      viewsPercent: (day.views / maxViews) * 100,
      clicksPercent: (day.clicks / maxClicks) * 100,
    }))
  }, [dailyStats])

  const totalPeriodViews = dailyStats?.reduce((sum, d) => sum + d.views, 0) || 0
  const totalPeriodClicks =
    dailyStats?.reduce((sum, d) => sum + d.clicks, 0) || 0
  const avgDailyViews = dailyStats?.length
    ? Math.round(totalPeriodViews / dailyStats.length)
    : 0

  const ctr =
    overview && overview.totalViews > 0
      ? ((overview.totalClicks / overview.totalViews) * 100).toFixed(1)
      : '0'

  const engagementScore = overview
    ? Math.min(
        100,
        Math.round(
          ((overview.totalClicks + overview.totalFollowers * 5) /
            Math.max(overview.totalViews, 1)) *
            100,
        ),
      )
    : 0

  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#0a0a0f]">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #22c55e)' }}
          animate={{ scale: [1.1, 1, 1.1], x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <BarChart3 size={32} className="text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
              </motion.div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    {t('analytics.title')}
                  </h1>
                  {overview?.isRealtime && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30"
                    >
                      <Radio size={10} className="animate-pulse" />
                      {t('analytics.realtime.badge')}
                    </motion.div>
                  )}
                </div>
                <p className="text-white/50 mt-1">
                  {t('analytics.trackingFor', {
                    username: currentUser?.username,
                  })}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center rounded-2xl p-1.5 bg-white/5 border border-white/10 backdrop-blur-xl">
                {([7, 30, 90, 365] as TimeRange[]).map((days) => (
                  <motion.button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-all"
                    style={{
                      background:
                        timeRange === days
                          ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                          : 'transparent',
                      color:
                        timeRange === days ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                    whileHover={{ scale: timeRange === days ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t(`analytics.timeRange.${TIME_RANGE_KEYS[days]}`)}
                  </motion.button>
                ))}
              </div>

              {/* Refresh Button */}
              <motion.button
                onClick={handleRefreshAll}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={t('analytics.refresh')}
              >
                <RefreshCw size={18} />
              </motion.button>

              {/* Export Dropdown */}
              <div className="relative group">
                <motion.button
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {t('analytics.export')}
                </motion.button>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 bg-[#1a1a24] border border-white/10 shadow-2xl">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <FileSpreadsheet size={16} className="text-green-400" />
                    {t('analytics.exportCsv')}
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <FileJson size={16} className="text-amber-400" />
                    {t('analytics.exportJson')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delay Banner */}
        <AnimatePresence>
          {overview && !overview.isRealtime && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6"
            >
              <div className="p-4 rounded-2xl flex items-center justify-between gap-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/20">
                    <Clock size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {t('analytics.delayBanner.title', {
                        hours: overview.analyticsDelay,
                      })}
                    </p>
                    <p className="text-sm text-white/50">
                      {t('analytics.delayBanner.description')}
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  search={{ tab: 'subscription' }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
                >
                  <Crown size={16} />
                  {t('analytics.delayBanner.upgrade')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t('analytics.stats.totalViews')}
            value={overview?.totalViews || 0}
            change={overview?.viewsChange}
            icon={Eye}
            gradient="from-blue-500 to-cyan-500"
            loading={overviewLoading}
            delay={0}
          />
          <StatCard
            title={t('analytics.stats.linkClicks')}
            value={overview?.totalClicks || 0}
            change={overview?.clicksChange}
            icon={MousePointerClick}
            gradient="from-green-500 to-emerald-500"
            loading={overviewLoading}
            delay={0.05}
          />
          <StatCard
            title={t('analytics.stats.followers')}
            value={overview?.totalFollowers || 0}
            change={overview?.followersChange}
            icon={Users}
            gradient="from-purple-500 to-pink-500"
            loading={overviewLoading}
            delay={0.1}
          />
          <StatCard
            title={t('analytics.stats.avgDailyViews')}
            value={avgDailyViews}
            icon={Activity}
            gradient="from-amber-500 to-orange-500"
            loading={dailyLoading}
            delay={0.15}
            subtitle={t('analytics.stats.lastDays', { days: timeRange })}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 backdrop-blur-xl"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                    <Activity size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white">
                      {t('analytics.chart.title')}
                    </h2>
                    <p className="text-sm text-white/50">
                      {totalPeriodViews.toLocaleString()}{' '}
                      {t('analytics.chart.views').toLowerCase()},{' '}
                      {totalPeriodClicks.toLocaleString()}{' '}
                      {t('analytics.chart.clicks').toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5">
                  <button
                    onClick={() => setActiveChart('views')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeChart === 'views'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    {t('analytics.chart.views')}
                  </button>
                  <button
                    onClick={() => setActiveChart('clicks')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeChart === 'clicks'
                        ? 'bg-green-500/20 text-green-400'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {t('analytics.chart.clicks')}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {dailyLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="animate-spin text-purple-500" size={32} />
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-64 flex items-end gap-[2px]">
                  {chartData.map((day, i) => {
                    const height =
                      activeChart === 'views'
                        ? day.viewsPercent
                        : day.clicksPercent
                    const value =
                      activeChart === 'views' ? day.views : day.clicks
                    const color =
                      activeChart === 'views' ? '#8b5cf6' : '#22c55e'

                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col justify-end group relative min-w-[3px]"
                      >
                        <motion.div
                          className="rounded-t cursor-pointer transition-opacity hover:opacity-80"
                          style={{
                            background: `linear-gradient(to top, ${color}40, ${color})`,
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 2)}%` }}
                          transition={{
                            delay: i * 0.008,
                            duration: 0.4,
                            ease: 'easeOut',
                          }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 bg-[#1a1a24] border border-white/10 shadow-xl">
                          <p className="font-semibold text-white mb-1">
                            {new Date(day.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p style={{ color }}>
                            {value}{' '}
                            {activeChart === 'views'
                              ? t('analytics.chart.views').toLowerCase()
                              : t('analytics.chart.clicks').toLowerCase()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-white/40">{t('analytics.chart.noData')}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 backdrop-blur-xl"
          >
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20">
                  <Link2 size={20} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    {t('analytics.topLinks.title')}
                  </h3>
                  <p className="text-xs text-white/50">
                    {t('analytics.topLinks.subtitle')}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {topLinksData?.requiresUpgrade ? (
                <UpgradePrompt
                  icon={Crown}
                  title={t('analytics.topLinks.requiresUpgrade')}
                  description={t('analytics.topLinks.upgradeDescription')}
                  buttonText={t('analytics.upgrade.toPro')}
                  gradient="from-green-500 to-emerald-500"
                />
              ) : topLinksData?.links?.length ? (
                <div className="space-y-2">
                  {topLinksData.links.map((link, i) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background:
                            i === 0
                              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                              : i === 1
                                ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                                : i === 2
                                  ? 'linear-gradient(135deg, #d97706, #92400e)'
                                  : 'rgba(255,255,255,0.1)',
                          color: i < 3 ? '#fff' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {link.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${link.percentage}%` }}
                              transition={{
                                delay: 0.4 + i * 0.05,
                                duration: 0.5,
                              }}
                            />
                          </div>
                          <span className="text-xs text-white/50 w-10 text-right">
                            {link.percentage}%
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-400">
                        {link.clicks}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Link2}
                  title={t('analytics.topLinks.noData')}
                  action={{
                    label: t('analytics.topLinks.addFirst'),
                    to: '/profile',
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referrers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 backdrop-blur-xl"
          >
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20">
                  <Globe size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    {t('analytics.referrers.title')}
                  </h3>
                  <p className="text-xs text-white/50">
                    {t('analytics.referrers.subtitle')}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {referrersData?.requiresUpgrade ? (
                <UpgradePrompt
                  icon={Crown}
                  title={t('analytics.referrers.requiresUpgrade')}
                  description={t('analytics.referrers.upgradeDescription')}
                  buttonText={t('analytics.upgrade.toPro')}
                  gradient="from-purple-500 to-pink-500"
                />
              ) : referrersData?.referrers?.length ? (
                <div className="space-y-2">
                  {referrersData.referrers.slice(0, 6).map((ref, i) => (
                    <motion.div
                      key={ref.source}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                          <Globe size={14} className="text-white/60" />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {ref.source || t('analytics.referrers.direct')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden bg-white/10">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${ref.percentage}%` }}
                            transition={{
                              delay: 0.4 + i * 0.05,
                              duration: 0.5,
                            }}
                          />
                        </div>
                        <span className="text-xs text-white/50 w-16 text-right">
                          {ref.count} ({ref.percentage}%)
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Globe}
                  title={t('analytics.referrers.noData')}
                  subtitle={t('analytics.referrers.shareProfile')}
                />
              )}
            </div>
          </motion.div>

          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 border border-white/10 backdrop-blur-xl"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-cyan-500">
                  <Sparkles size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">
                    {t('analytics.insights.title')}
                  </h3>
                  <p className="text-sm text-white/50">
                    {t('analytics.insights.subtitle')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <InsightRow
                  icon={Target}
                  label={t('analytics.insights.ctr')}
                  value={`${ctr}%`}
                />
                <InsightRow
                  icon={TrendingUp}
                  label={t('analytics.insights.viewsTrend')}
                  value={`${overview?.viewsChange !== undefined ? (overview.viewsChange >= 0 ? '+' : '') + overview.viewsChange : 0}%`}
                  positive={
                    overview?.viewsChange !== undefined
                      ? overview.viewsChange >= 0
                      : true
                  }
                />
                <InsightRow
                  icon={Zap}
                  label={t('analytics.insights.engagementScore')}
                  value={`${engagementScore}/100`}
                />
                <InsightRow
                  icon={Calendar}
                  label={t('analytics.insights.period')}
                  value={t(`analytics.timeRange.${TIME_RANGE_KEYS[timeRange]}`)}
                />
              </div>

              <Link
                to="/profile"
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
              >
                <ArrowUpRight size={18} />
                {t('analytics.insights.optimizeProfile')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: number
  change?: number
  icon: React.ElementType
  gradient: string
  loading?: boolean
  delay?: number
  subtitle?: string
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  gradient,
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
      className="rounded-2xl p-5 relative overflow-hidden group bg-white/[0.03] border border-white/10 backdrop-blur-xl"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${gradient}`}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon size={24} className="text-white" />
          </motion.div>
          {change !== undefined && change !== 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                isPositive
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
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
        <p className="text-sm text-white/50 mb-1">{title}</p>
        {loading ? (
          <div className="h-9 w-24 rounded-lg animate-pulse bg-white/10" />
        ) : (
          <motion.p
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.1 }}
          >
            {value.toLocaleString()}
          </motion.p>
        )}
        {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

// Insight Row Component
interface InsightRowProps {
  icon: React.ElementType
  label: string
  value: string
  positive?: boolean
}

function InsightRow({ icon: Icon, label, value, positive }: InsightRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-white/50" />
        <span className="text-sm text-white/60">{label}</span>
      </div>
      <span
        className={`text-sm font-bold ${
          positive !== undefined
            ? positive
              ? 'text-green-400'
              : 'text-red-400'
            : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// Upgrade Prompt Component
interface UpgradePromptProps {
  icon: React.ElementType
  title: string
  description: string
  buttonText: string
  gradient: string
}

function UpgradePrompt({
  icon: Icon,
  title,
  description,
  buttonText,
  gradient,
}: UpgradePromptProps) {
  return (
    <div className="py-8 text-center">
      <Icon size={36} className="mx-auto mb-3 text-purple-400 opacity-50" />
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      <p className="text-xs text-white/50 mb-4">{description}</p>
      <Link
        to="/profile"
        search={{ tab: 'subscription' }}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${gradient} hover:opacity-90 transition-all shadow-lg`}
      >
        <Crown size={14} />
        {buttonText}
      </Link>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ElementType
  title: string
  subtitle?: string
  action?: { label: string; to: string }
}

function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="py-8 text-center">
      <Icon size={36} className="mx-auto mb-3 text-white/20" />
      <p className="text-sm text-white/50">{title}</p>
      {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1 text-xs mt-3 text-purple-400 hover:underline"
        >
          {action.label} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  )
}
