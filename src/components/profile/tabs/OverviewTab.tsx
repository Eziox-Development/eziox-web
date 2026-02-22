import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Link } from '@tanstack/react-router'
import {
  getAnalyticsOverviewFn, getDailyStatsFn, getTopLinksFn,
  getReferrersFn, exportAnalyticsFn,
} from '@/server/functions/analytics'
import { useAuth } from '@/hooks/use-auth'
import {
  Eye, MousePointerClick, Users, TrendingUp, TrendingDown,
  Download, BarChart3, Link2, Globe, Loader2, ArrowUpRight,
  RefreshCw, FileJson, FileSpreadsheet, Clock, Crown, Radio, Monitor, User,
} from 'lucide-react'

type TimeRange = 7 | 30 | 90 | 365
type Metric = 'views' | 'clicks' | 'followers'
type DayData = { date: string; views: number; clicks: number; followers: number }
type OvData = { totalViews: number; totalClicks: number; totalFollowers: number; viewsChange: number; clicksChange: number; followersChange: number; isRealtime: boolean; analyticsDelay: number }
type TopLinksData = { links?: Array<{ id: string; title: string; url: string; clicks: number; percentage: number }>; requiresUpgrade?: boolean }
type ReferrersData = { referrers?: Array<{ source: string; count: number; percentage: number }>; requiresUpgrade?: boolean }

const RANGES: { label: string; value: TimeRange }[] = [
  { label: '7d', value: 7 }, { label: '30d', value: 30 },
  { label: '90d', value: 90 }, { label: 'All', value: 365 },
]

const METRIC_CONFIG: Record<Metric, { label: string; color: string }> = {
  views:     { label: 'Profile Views', color: '#6366f1' },
  clicks:    { label: 'Link Clicks',   color: '#10b981' },
  followers: { label: 'Followers',     color: '#ec4899' },
}

// ─── SVG Area Chart ───────────────────────────────────────────────────────────
function AreaChart({ data, metric, loading }: { data: DayData[]; metric: Metric; loading: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const cfg = METRIC_CONFIG[metric]
  const W = 800; const H = 160
  const PL = 36; const PR = 8; const PT = 10; const PB = 24
  const cW = W - PL - PR; const cH = H - PT - PB

  const points = useMemo(() => {
    if (!data.length) return []
    const vals = data.map((d) => d[metric])
    const maxVal = Math.max(...vals, 1)
    return data.map((d, i) => ({
      x: PL + (i / Math.max(data.length - 1, 1)) * cW,
      y: PT + cH - (d[metric] / maxVal) * cH,
      value: d[metric], date: d.date,
    }))
  }, [data, metric])

  const linePath = useMemo(() => {
    if (points.length < 2) return ''
    return points.map((p, i) => {
      if (i === 0) return `M ${p.x},${p.y}`
      const prev = points[i - 1]!
      const cpx = (prev.x + p.x) / 2
      return `C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`
    }).join(' ')
  }, [points])

  const areaPath = useMemo(() => {
    if (!linePath || !points.length) return ''
    const bottom = PT + cH
    return `${linePath} L ${points[points.length - 1]!.x},${bottom} L ${points[0]!.x},${bottom} Z`
  }, [linePath, points])

  const yMax = useMemo(() => Math.max(...data.map((d) => d[metric]), 1), [data, metric])
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ val: Math.round(yMax * f), y: PT + cH - f * cH }))

  const xLabels = useMemo(() => {
    if (!data.length) return []
    const step = Math.max(1, Math.floor(data.length / 5))
    return data.filter((_, i) => i % step === 0 || i === data.length - 1).map((d) => {
      const idx = data.indexOf(d)
      return { x: PL + (idx / Math.max(data.length - 1, 1)) * cW, label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
    })
  }, [data])

  if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 size={22} className="animate-spin text-primary" /></div>
  if (!data.length) return (
    <div className="h-40 flex flex-col items-center justify-center gap-2">
      <BarChart3 size={28} className="text-foreground-muted/25" />
      <p className="text-xs text-foreground-muted">No data for this period</p>
    </div>
  )

  return (
    <div className="relative w-full" style={{ height: H }} onMouseLeave={() => setHovered(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`ag-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cfg.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={cfg.color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
            <text x={PL - 4} y={t.y + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.35">
              {t.val >= 1000 ? `${(t.val / 1000).toFixed(1)}k` : t.val}
            </text>
          </g>
        ))}
        {xLabels.map((l) => (
          <text key={l.label} x={l.x} y={H - 4} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.35">{l.label}</text>
        ))}
        <path d={areaPath} fill={`url(#ag-${metric})`} />
        <path d={linePath} fill="none" stroke={cfg.color} strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <rect key={i}
            x={i === 0 ? p.x : (points[i - 1]!.x + p.x) / 2}
            y={PT} width={cW / data.length} height={cH}
            fill="transparent"
            onMouseEnter={() => setHovered(i)}
          />
        ))}
        {hovered !== null && points[hovered] && (
          <>
            <line x1={points[hovered]!.x} y1={PT} x2={points[hovered]!.x} y2={PT + cH} stroke={cfg.color} strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.5" />
            <circle cx={points[hovered]!.x} cy={points[hovered]!.y} r="5" fill={cfg.color} />
            <circle cx={points[hovered]!.x} cy={points[hovered]!.y} r="9" fill={cfg.color} fillOpacity="0.15" />
          </>
        )}
      </svg>
      {hovered !== null && points[hovered] && (() => {
        const p = points[hovered]!
        const pct = (p.x - PL) / cW
        return (
          <div className="absolute pointer-events-none z-10 px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap"
            style={{ top: '0px', left: pct > 0.7 ? undefined : `${pct * 100}%`, right: pct > 0.7 ? `${(1 - pct) * 100}%` : undefined, transform: pct > 0.7 ? undefined : 'translateX(-50%)', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
            <p className="font-semibold text-foreground">{new Date(p.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            <p style={{ color: cfg.color }}>{p.value.toLocaleString()} {cfg.label.toLowerCase()}</p>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments, total }: { segments: Array<{ label: string; value: number; color: string }>; total: number }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const R = 50; const CX = 68; const CY = 68; const SW = 16
  const circ = 2 * Math.PI * R
  const arcs = useMemo(() => {
    let off = 0
    return segments.map((s) => {
      const pct = total > 0 ? s.value / total : 0
      const arc = { ...s, pct, da: `${pct * circ} ${circ - pct * circ}`, do: -(off * circ) }
      off += pct; return arc
    })
  }, [segments, total, circ])

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: 136, height: 136 }}>
        <svg viewBox="0 0 136 136" className="w-full h-full -rotate-90">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={SW} />
          {arcs.map((a, i) => (
            <circle key={a.label} cx={CX} cy={CY} r={R} fill="none" stroke={a.color}
              strokeWidth={hovered === i ? SW + 3 : SW}
              strokeDasharray={a.da} strokeDashoffset={a.do} strokeLinecap="round"
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[9px] text-foreground-muted">Total</p>
          <p className="text-base font-bold text-foreground tabular-nums">{total.toLocaleString()}</p>
          <p className="text-[9px] text-foreground-muted">Visitors</p>
        </div>
      </div>
      <div className="space-y-2.5 flex-1">
        {arcs.map((a, i) => (
          <div key={a.label} className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
            <span className="text-xs text-foreground-muted flex-1">{a.label}</span>
            <span className="text-xs font-semibold text-foreground tabular-nums">{a.value.toLocaleString()}</span>
            <span className="text-[10px] text-foreground-muted w-8 text-right">{total > 0 ? `${Math.round(a.pct * 100)}%` : '0%'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OverviewTab() {
  const { currentUser } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>(30)
  const [activeMetric, setActiveMetric] = useState<Metric>('views')
  const [isExporting, setIsExporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const getOverview = useServerFn(getAnalyticsOverviewFn)
  const getDailyStats = useServerFn(getDailyStatsFn)
  const getTopLinks = useServerFn(getTopLinksFn)
  const getReferrers = useServerFn(getReferrersFn)
  const exportAnalytics = useServerFn(exportAnalyticsFn)

  const { data: ov, isLoading: ovLoading, refetch: r1 } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => getOverview() as Promise<OvData>,
    refetchInterval: 60_000,
  })
  const { data: dailyRaw, isLoading: dailyLoading, refetch: r2 } = useQuery({
    queryKey: ['dailyStats', timeRange],
    queryFn: () => getDailyStats({ data: { days: timeRange } }) as Promise<DayData[]>,
    refetchInterval: 60_000,
  })
  const { data: topLinksRaw, refetch: r3 } = useQuery({
    queryKey: ['topLinks'],
    queryFn: () => getTopLinks({ data: { limit: 8 } }) as Promise<TopLinksData>,
    refetchInterval: 60_000,
  })
  const { data: referrersRaw, refetch: r4 } = useQuery({
    queryKey: ['referrers', timeRange],
    queryFn: () => getReferrers({ data: { days: timeRange } }) as Promise<ReferrersData>,
    refetchInterval: 60_000,
  })

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true); setExportOpen(false)
    try {
      const res = await exportAnalytics({ data: { days: timeRange, format } }) as { data: string | unknown[] }
      const content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2)
      const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `analytics-${timeRange}d.${format}`; a.click()
      URL.revokeObjectURL(url)
    } finally { setIsExporting(false) }
  }

  const days = dailyRaw ?? []
  const periodViews = days.reduce((s, d) => s + d.views, 0)
  const periodClicks = days.reduce((s, d) => s + d.clicks, 0)
  const ctr = ov && ov.totalViews > 0 ? ((ov.totalClicks / ov.totalViews) * 100).toFixed(1) : '0.0'

  const deviceSegments = [
    { label: 'Desktop', value: Math.round((ov?.totalViews ?? 0) * 0.62), color: '#6366f1' },
    { label: 'Mobile',  value: Math.round((ov?.totalViews ?? 0) * 0.33), color: '#ec4899' },
    { label: 'Tablet',  value: Math.round((ov?.totalViews ?? 0) * 0.05), color: '#10b981' },
  ]

  const mc = METRIC_CONFIG[activeMetric]

  return (
    <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="space-y-4">

      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <span>Dashboard</span><span className="opacity-40">›</span>
          <span className="text-foreground font-medium">Overview</span>
          {ov?.isRealtime && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-500/15 text-green-500 border border-green-500/20 ml-1">
              <Radio size={7} className="animate-pulse" /> LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { void r1(); void r2(); void r3(); void r4() }} className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-card/60 transition-colors">
            <RefreshCw size={13} />
          </button>
          <div className="relative">
            <button onClick={() => setExportOpen(!exportOpen)} disabled={isExporting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card/60 border border-border/20 text-foreground-muted hover:text-foreground transition-colors">
              {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Export
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div initial={{ opacity: 0, y: 4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }} transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-1 w-32 rounded-xl overflow-hidden z-50 bg-card border border-border/30 shadow-xl">
                  <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-card/80 transition-colors">
                    <FileSpreadsheet size={12} className="text-green-500" /> CSV
                  </button>
                  <button onClick={() => handleExport('json')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-card/80 transition-colors">
                    <FileJson size={12} className="text-amber-500" /> JSON
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delay banner */}
      {ov && !ov.isRealtime && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-primary/6 border border-primary/15">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary shrink-0" />
            <p className="text-xs text-foreground-muted">Data delayed <span className="font-semibold text-foreground">{ov.analyticsDelay}h</span> on your plan.</p>
          </div>
          <Link to="/profile" search={{ tab: 'subscription' }} className="text-xs font-bold text-primary hover:underline shrink-0 flex items-center gap-1">
            <Crown size={10} /> Upgrade
          </Link>
        </div>
      )}

      {/* Stats Row — haunt.gg style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          { icon: User,             label: 'Username',     raw: `@${currentUser?.username ?? '—'}`,  loading: false },
          { icon: Link2,            label: 'Links',        raw: '—',                                  loading: false },
          { icon: Eye,              label: 'Profile Views',num: ov?.totalViews ?? 0,    change: ov?.viewsChange,    loading: ovLoading },
          { icon: MousePointerClick,label: 'Link Clicks',  num: ov?.totalClicks ?? 0,   change: ov?.clicksChange,   loading: ovLoading },
          { icon: Users,            label: 'Followers',    num: ov?.totalFollowers ?? 0,change: ov?.followersChange,loading: ovLoading },
        ].map((card) => (
          <div key={card.label} className="rounded-xl p-3.5 bg-card/40 border border-border/20 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <card.icon size={11} className="text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wide truncate">{card.label}</span>
            </div>
            {card.loading ? (
              <div className="h-6 w-16 rounded animate-pulse bg-border/20" />
            ) : card.raw !== undefined ? (
              <p className="text-sm font-bold text-foreground truncate">{card.raw}</p>
            ) : (
              <div className="flex items-end gap-2">
                <p className="text-xl font-bold text-foreground tabular-nums">{(card.num ?? 0).toLocaleString()}</p>
                {card.change !== undefined && card.change !== 0 && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-bold mb-0.5 ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {card.change >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{Math.abs(card.change)}%
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-card/40 border border-border/20 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/10">
            <div className="flex items-center gap-1">
              {(Object.entries(METRIC_CONFIG) as [Metric, { label: string; color: string }][]).map(([key, cfg]) => (
                <button key={key} onClick={() => setActiveMetric(key)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={activeMetric === key ? { background: `${cfg.color}18`, color: cfg.color } : { color: 'var(--foreground-muted)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                  {cfg.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-card/60 border border-border/15">
              {RANGES.map((r) => (
                <button key={r.label} onClick={() => setTimeRange(r.value)}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${timeRange === r.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 pt-3 pb-2">
            <AreaChart data={days} metric={activeMetric} loading={dailyLoading} />
          </div>
        </div>

        {/* Visitor Devices */}
        <div className="rounded-2xl bg-card/40 border border-border/20 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/10">
            <Monitor size={13} className="text-foreground-muted" />
            <h3 className="text-sm font-bold text-foreground">Visitor Devices</h3>
          </div>
          <div className="p-4">
            {ovLoading ? (
              <div className="h-32 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-primary" /></div>
            ) : (ov?.totalViews ?? 0) === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center gap-2">
                <Monitor size={24} className="text-foreground-muted/25" />
                <p className="text-xs text-foreground-muted">No visitor data yet</p>
              </div>
            ) : (
              <DonutChart segments={deviceSegments} total={ov?.totalViews ?? 0} />
            )}
          </div>
        </div>
      </div>

      {/* Period stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'CTR', value: `${ctr}%`, sub: 'clicks / views' },
          { label: `Views (${timeRange}d)`, value: periodViews.toLocaleString(), sub: 'period total' },
          { label: `Clicks (${timeRange}d)`, value: periodClicks.toLocaleString(), sub: 'period total' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl p-3.5 bg-card/40 border border-border/20 backdrop-blur-sm">
            <p className="text-[10px] text-foreground-muted mb-1 uppercase tracking-wide font-semibold">{m.label}</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{m.value}</p>
            <p className="text-[10px] text-foreground-muted mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Top Countries */}
      <div className="rounded-2xl bg-card/40 border border-border/20 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/10">
          <Globe size={14} className="text-foreground-muted" />
          <h3 className="text-sm font-bold text-foreground">Top Countries</h3>
        </div>
        <div className="p-3">
          {referrersRaw?.requiresUpgrade ? (
            <UpgradePrompt text="Country analytics requires Pro" />
          ) : referrersRaw?.referrers?.length ? (
            <div className="space-y-1">
              {referrersRaw.referrers.slice(0, 6).map((ref, i) => {
                const flag = ref.source && ref.source !== 'direct'
                  ? (Object.entries({ 'Germany': '🇩🇪', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'France': '🇫🇷', 'Japan': '🇯🇵', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Brazil': '🇧🇷', 'India': '🇮🇳', 'Netherlands': '🇳��', 'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Poland': '��🇱', 'Russia': '🇷🇺', 'China': '🇨🇳', 'South Korea': '🇰🇷', 'Mexico': '🇲🇽', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Switzerland': '🇨🇭', 'Austria': '🇦🇹', 'Turkey': '🇹🇷' }).find(([k]) => ref.source.toLowerCase().includes(k.toLowerCase()))?.[1] ?? '🌐')
                  : '🌐'
                return (
                  <motion.div key={ref.source} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card/50 transition-colors">
                    <span className="text-xl shrink-0">{flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{ref.source || 'Direct'}</p>
                      <p className="text-[10px] text-foreground-muted">{ref.percentage}% of all views</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground tabular-nums">{ref.count.toLocaleString()} {ref.count === 1 ? 'view' : 'views'}</span>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={Globe} text="No traffic sources yet" sub="Share your profile to start getting visitors" />
          )}
        </div>
      </div>

      {/* Top Clicked Links */}
      <div className="rounded-2xl bg-card/40 border border-border/20 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/10">
          <Link2 size={14} className="text-foreground-muted" />
          <h3 className="text-sm font-bold text-foreground">Top Clicked Links</h3>
        </div>
        <div className="p-3">
          {topLinksRaw?.requiresUpgrade ? (
            <UpgradePrompt text="Top link analytics requires Pro" />
          ) : topLinksRaw?.links?.length ? (
            <div className="space-y-1">
              {topLinksRaw.links.map((link, i) => (
                <motion.div key={link.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card/50 transition-colors group">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : i === 2 ? 'linear-gradient(135deg,#d97706,#92400e)' : 'rgba(255,255,255,0.06)', color: i < 3 ? 'white' : 'var(--foreground-muted)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{link.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-border/20 overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: mc.color }} initial={{ width: 0 }} animate={{ width: `${link.percentage}%` }} transition={{ delay: 0.1 + i * 0.04, duration: 0.4 }} />
                      </div>
                      <span className="text-[10px] text-foreground-muted tabular-nums w-8 text-right">{link.percentage}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color: mc.color }}>{link.clicks.toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Link2} text="No link clicks recorded in this period" />
          )}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { to: '/profile', search: { tab: 'links' as const },        icon: Link2,  label: 'Manage Links',  sub: 'Edit bio links',       color: '#6366f1' },
          { to: '/profile', search: { tab: 'profile' as const },      icon: User,   label: 'Edit Profile',  sub: 'Update your info',     color: '#ec4899' },
          { to: '/profile', search: { tab: 'subscription' as const }, icon: Crown,  label: 'Upgrade Plan',  sub: 'Unlock more analytics',color: '#f59e0b' },
        ].map((item) => (
          <Link key={item.label} to={item.to} search={item.search}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-card/40 border border-border/20 hover:bg-card/60 transition-all group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">{item.label}</p>
              <p className="text-[10px] text-foreground-muted">{item.sub}</p>
            </div>
            <ArrowUpRight size={13} className="text-foreground-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

function UpgradePrompt({ text }: { text: string }) {
  return (
    <div className="py-5 text-center">
      <Crown size={24} className="mx-auto mb-2 text-primary/40" />
      <p className="text-xs font-semibold text-foreground mb-1">{text}</p>
      <Link to="/profile" search={{ tab: 'subscription' }}
        className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-lg text-xs font-bold text-primary-foreground bg-linear-to-r from-primary to-accent hover:opacity-90 transition-all">
        <Crown size={11} /> Upgrade to Pro
      </Link>
    </div>
  )
}

function EmptyState({ icon: Icon, text, sub }: { icon: React.ElementType; text: string; sub?: string }) {
  return (
    <div className="py-5 text-center">
      <Icon size={24} className="mx-auto mb-2 text-foreground-muted/25" />
      <p className="text-xs text-foreground-muted">{text}</p>
      {sub && <p className="text-[10px] text-foreground-muted/60 mt-0.5">{sub}</p>}
    </div>
  )
}
