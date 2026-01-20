import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  updateLinkScheduleFn,
  updateFeaturedLinkFn,
} from '@/server/functions/creator-features'
import { getLinkAnalyticsFn } from '@/server/functions/links'
import {
  X,
  Star,
  Clock,
  Loader2,
  Save,
  Crown,
  BarChart3,
  Monitor,
  Smartphone,
  Globe,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface LinkAdvancedSettingsProps {
  link: {
    id: string
    title: string
    url: string
    isFeatured?: boolean | null
    featuredStyle?: string | null
    schedule?: {
      enabled: boolean
      startDate?: string
      endDate?: string
      timezone?: string
    } | null
  }
  isCreator: boolean
  onClose: () => void
}

const FEATURED_STYLES = [
  { value: 'default', label: 'Default', preview: 'border-2 border-primary' },
  { value: 'glow', label: 'Glow', preview: 'shadow-lg shadow-primary/50' },
  { value: 'gradient', label: 'Gradient', preview: 'bg-gradient-to-r from-primary to-accent' },
  { value: 'outline', label: 'Outline', preview: 'border-2 border-dashed' },
  { value: 'neon', label: 'Neon', preview: 'ring-2 ring-primary ring-offset-2' },
]

export function LinkAdvancedSettings({ link, isCreator, onClose }: LinkAdvancedSettingsProps) {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'analytics' | 'featured' | 'schedule'>('analytics')

  const updateSchedule = useServerFn(updateLinkScheduleFn)
  const updateFeatured = useServerFn(updateFeaturedLinkFn)
  const getLinkAnalytics = useServerFn(getLinkAnalyticsFn)

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['link-analytics', link.id],
    queryFn: () => getLinkAnalytics({ data: { linkId: link.id, days: 30 } }),
    enabled: isCreator,
  })

  const [localFeatured, setLocalFeatured] = useState({
    isFeatured: link.isFeatured || false,
    featuredStyle: link.featuredStyle || 'default',
  })

  const [localSchedule, setLocalSchedule] = useState({
    enabled: link.schedule?.enabled || false,
    startDate: link.schedule?.startDate || '',
    endDate: link.schedule?.endDate || '',
    timezone: link.schedule?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const featuredMutation = useMutation({
    mutationFn: () => updateFeatured({ data: { linkId: link.id, isFeatured: localFeatured.isFeatured, featuredStyle: localFeatured.featuredStyle as 'default' | 'glow' | 'gradient' | 'outline' | 'neon' } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  const scheduleMutation = useMutation({
    mutationFn: () => updateSchedule({ data: { linkId: link.id, schedule: localSchedule } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  if (!isCreator) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ec489920, #8b5cf620)' }}
          >
            <Crown size={32} style={{ color: '#ec4899' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.foreground }}>
            Creator Feature
          </h3>
          <p className="text-sm mb-6" style={{ color: theme.colors.foregroundMuted }}>
            Advanced link settings require Creator tier or higher.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
            >
              Close
            </button>
            <Link
              to="/profile"
              search={{ tab: 'subscription' }}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm text-center"
              style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff' }}
            >
              Upgrade
            </Link>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.colors.border }}>
          <div>
            <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Advanced Settings</h3>
            <p className="text-xs truncate max-w-xs" style={{ color: theme.colors.foregroundMuted }}>{link.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} style={{ color: theme.colors.foregroundMuted }} />
          </button>
        </div>

        <div className="p-3 border-b flex gap-1 overflow-x-auto" style={{ borderColor: theme.colors.border }}>
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'featured', label: 'Featured', icon: Star },
            { id: 'schedule', label: 'Schedule', icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === id ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'transparent',
                color: activeTab === id ? '#fff' : theme.colors.foregroundMuted,
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" style={{ color: theme.colors.primary }} />
                    <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Loading analytics...</p>
                  </div>
                ) : analyticsData ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                        <p className="text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}>Total Clicks</p>
                        <p className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>{analyticsData.totalClicks}</p>
                      </div>
                      <div className="p-4 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                        <p className="text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}>Period</p>
                        <p className="text-lg font-semibold" style={{ color: theme.colors.foreground }}>Last 30 days</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                        <Monitor size={14} /> Devices
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(analyticsData.deviceStats || {}).map(([device, count]) => (
                          <span key={device} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}>
                            {device === 'mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
                            {device}: {count as number}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                        <Globe size={14} /> Browsers
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(analyticsData.browserStats || {}).map(([browser, count]) => (
                          <span key={browser} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}>
                            {browser}: {count as number}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                        <Clock size={14} /> Click Heatmap (by hour)
                      </h4>
                      <div className="grid grid-cols-12 gap-1">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const totalForHour = Object.entries(analyticsData.hourlyClicks || {})
                            .filter(([key]) => key.endsWith(`-${hour}`))
                            .reduce((sum, [, count]) => sum + (count as number), 0)
                          const maxClicks = Math.max(...Object.values(analyticsData.hourlyClicks || {}).map(v => v as number), 1)
                          const intensity = totalForHour / maxClicks
                          return (
                            <div
                              key={hour}
                              className="aspect-square rounded text-xs flex items-center justify-center"
                              style={{
                                background: `rgba(139, 92, 246, ${0.1 + intensity * 0.8})`,
                                color: intensity > 0.5 ? 'white' : theme.colors.foregroundMuted,
                              }}
                              title={`${hour}:00 - ${totalForHour} clicks`}
                            >
                              {hour}
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>Hours (0-23)</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" style={{ color: theme.colors.foregroundMuted }} />
                    <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>No analytics data yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'featured' && (
              <motion.div key="featured" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm" style={{ color: theme.colors.foreground }}>Featured Link</p>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Highlight this link with special styling</p>
                  </div>
                  <div
                    className="relative w-12 h-6 rounded-full transition-all cursor-pointer"
                    style={{ background: localFeatured.isFeatured ? '#ec4899' : theme.colors.backgroundSecondary }}
                    onClick={() => setLocalFeatured({ ...localFeatured, isFeatured: !localFeatured.isFeatured })}
                  >
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: localFeatured.isFeatured ? '28px' : '4px' }} />
                  </div>
                </div>

                {localFeatured.isFeatured && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FEATURED_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setLocalFeatured({ ...localFeatured, featuredStyle: style.value })}
                        className="p-3 rounded-xl text-center transition-all"
                        style={{
                          background: localFeatured.featuredStyle === style.value ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary,
                          border: `2px solid ${localFeatured.featuredStyle === style.value ? theme.colors.primary : 'transparent'}`,
                        }}
                      >
                        <span className="text-sm" style={{ color: theme.colors.foreground }}>{style.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => featuredMutation.mutate()}
                  disabled={featuredMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff' }}
                >
                  {featuredMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm" style={{ color: theme.colors.foreground }}>Link Scheduling</p>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Show/hide link at specific times</p>
                  </div>
                  <div
                    className="relative w-12 h-6 rounded-full transition-all cursor-pointer"
                    style={{ background: localSchedule.enabled ? '#22c55e' : theme.colors.backgroundSecondary }}
                    onClick={() => setLocalSchedule({ ...localSchedule, enabled: !localSchedule.enabled })}
                  >
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: localSchedule.enabled ? '28px' : '4px' }} />
                  </div>
                </div>

                {localSchedule.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Start Date</label>
                      <input
                        type="datetime-local"
                        value={localSchedule.startDate}
                        onChange={(e) => setLocalSchedule({ ...localSchedule, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: theme.colors.foregroundMuted }}>End Date</label>
                      <input
                        type="datetime-local"
                        value={localSchedule.endDate}
                        onChange={(e) => setLocalSchedule({ ...localSchedule, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => scheduleMutation.mutate()}
                  disabled={scheduleMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}
                >
                  {scheduleMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
