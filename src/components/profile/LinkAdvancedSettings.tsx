import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  updateLinkScheduleFn,
  updateFeaturedLinkFn,
  updateABTestFn,
  updateLinkUTMFn,
  updateEmbedSettingsFn,
} from '@/server/functions/creator-features'
import {
  X,
  Star,
  Clock,
  FlaskConical,
  Link2,
  Settings2,
  Loader2,
  Save,
  Plus,
  Trash2,
  Crown,
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
    abTestEnabled?: boolean | null
    abTestVariants?: Array<{ id: string; title: string; url: string; clicks: number }> | null
    utmSource?: string | null
    utmMedium?: string | null
    utmCampaign?: string | null
    embedSettings?: {
      type: string
      autoplay?: boolean
      loop?: boolean
      showControls?: boolean
      width?: number
      height?: number
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
  const [activeTab, setActiveTab] = useState<'featured' | 'schedule' | 'abtest' | 'utm' | 'embed'>('featured')

  const updateSchedule = useServerFn(updateLinkScheduleFn)
  const updateFeatured = useServerFn(updateFeaturedLinkFn)
  const updateABTest = useServerFn(updateABTestFn)
  const updateUTM = useServerFn(updateLinkUTMFn)
  const updateEmbed = useServerFn(updateEmbedSettingsFn)

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

  const [localABTest, setLocalABTest] = useState({
    enabled: link.abTestEnabled || false,
    variants: link.abTestVariants || [],
  })

  const [localUTM, setLocalUTM] = useState({
    utmSource: link.utmSource || '',
    utmMedium: link.utmMedium || '',
    utmCampaign: link.utmCampaign || '',
  })

  const [localEmbed, setLocalEmbed] = useState({
    type: link.embedSettings?.type || 'default',
    autoplay: link.embedSettings?.autoplay || false,
    loop: link.embedSettings?.loop || false,
    showControls: link.embedSettings?.showControls ?? true,
    width: link.embedSettings?.width || 400,
    height: link.embedSettings?.height || 300,
  })

  const featuredMutation = useMutation({
    mutationFn: () => updateFeatured({ data: { linkId: link.id, isFeatured: localFeatured.isFeatured, featuredStyle: localFeatured.featuredStyle as 'default' | 'glow' | 'gradient' | 'outline' | 'neon' } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  const scheduleMutation = useMutation({
    mutationFn: () => updateSchedule({ data: { linkId: link.id, schedule: localSchedule } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  const abTestMutation = useMutation({
    mutationFn: () => updateABTest({ data: { linkId: link.id, enabled: localABTest.enabled, variants: localABTest.variants } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  const utmMutation = useMutation({
    mutationFn: () => updateUTM({ data: { linkId: link.id, ...localUTM } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  const embedMutation = useMutation({
    mutationFn: () => updateEmbed({ data: { linkId: link.id, settings: localEmbed as { type: 'default' | 'spotify' | 'youtube' | 'soundcloud'; autoplay?: boolean; loop?: boolean; showControls?: boolean; width?: number; height?: number } } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  const addVariant = () => {
    if (localABTest.variants.length < 4) {
      setLocalABTest({
        ...localABTest,
        variants: [...localABTest.variants, { id: crypto.randomUUID(), title: '', url: '', clicks: 0 }],
      })
    }
  }

  const removeVariant = (id: string) => {
    setLocalABTest({
      ...localABTest,
      variants: localABTest.variants.filter(v => v.id !== id),
    })
  }

  const updateVariant = (id: string, field: 'title' | 'url', value: string) => {
    setLocalABTest({
      ...localABTest,
      variants: localABTest.variants.map(v => v.id === id ? { ...v, [field]: value } : v),
    })
  }

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
            { id: 'featured', label: 'Featured', icon: Star },
            { id: 'schedule', label: 'Schedule', icon: Clock },
            { id: 'abtest', label: 'A/B Test', icon: FlaskConical },
            { id: 'utm', label: 'UTM', icon: Link2 },
            { id: 'embed', label: 'Embed', icon: Settings2 },
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

            {activeTab === 'abtest' && (
              <motion.div key="abtest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm" style={{ color: theme.colors.foreground }}>A/B Testing</p>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Compare different versions of this link</p>
                  </div>
                  <div
                    className="relative w-12 h-6 rounded-full transition-all cursor-pointer"
                    style={{ background: localABTest.enabled ? '#8b5cf6' : theme.colors.backgroundSecondary }}
                    onClick={() => setLocalABTest({ ...localABTest, enabled: !localABTest.enabled })}
                  >
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: localABTest.enabled ? '28px' : '4px' }} />
                  </div>
                </div>

                {localABTest.enabled && (
                  <>
                    <div className="space-y-2">
                      {localABTest.variants.map((variant, i) => (
                        <div key={variant.id} className="flex gap-2 items-start p-3 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                          <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: theme.colors.primary, color: '#fff' }}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              placeholder="Variant title"
                              value={variant.title}
                              onChange={(e) => updateVariant(variant.id, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg text-sm"
                              style={{ background: theme.colors.card, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                            />
                            <input
                              type="url"
                              placeholder="Variant URL"
                              value={variant.url}
                              onChange={(e) => updateVariant(variant.id, 'url', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg text-sm"
                              style={{ background: theme.colors.card, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{variant.clicks} clicks</span>
                              <button onClick={() => removeVariant(variant.id)} className="p-1 rounded hover:bg-white/10">
                                <Trash2 size={14} style={{ color: '#ef4444' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {localABTest.variants.length < 4 && (
                      <button
                        onClick={addVariant}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm"
                        style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted, border: `1px dashed ${theme.colors.border}` }}
                      >
                        <Plus size={14} />
                        Add Variant
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => abTestMutation.mutate()}
                  disabled={abTestMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}
                >
                  {abTestMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </motion.div>
            )}

            {activeTab === 'utm' && (
              <motion.div key="utm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                  UTM parameters help track marketing campaigns. They will be appended to your link URL.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Source</label>
                    <input
                      type="text"
                      placeholder="e.g., twitter, instagram"
                      value={localUTM.utmSource}
                      onChange={(e) => setLocalUTM({ ...localUTM, utmSource: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Medium</label>
                    <input
                      type="text"
                      placeholder="e.g., social, email, cpc"
                      value={localUTM.utmMedium}
                      onChange={(e) => setLocalUTM({ ...localUTM, utmMedium: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Campaign</label>
                    <input
                      type="text"
                      placeholder="e.g., summer_sale, launch"
                      value={localUTM.utmCampaign}
                      onChange={(e) => setLocalUTM({ ...localUTM, utmCampaign: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => utmMutation.mutate()}
                  disabled={utmMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}
                >
                  {utmMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </motion.div>
            )}

            {activeTab === 'embed' && (
              <motion.div key="embed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Embed Type</label>
                  <select
                    value={localEmbed.type}
                    onChange={(e) => setLocalEmbed({ ...localEmbed, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                  >
                    <option value="default">Default Link</option>
                    <option value="spotify">Spotify</option>
                    <option value="youtube">YouTube</option>
                    <option value="soundcloud">SoundCloud</option>
                  </select>
                </div>

                {localEmbed.type !== 'default' && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localEmbed.autoplay}
                          onChange={(e) => setLocalEmbed({ ...localEmbed, autoplay: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm" style={{ color: theme.colors.foreground }}>Autoplay</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localEmbed.loop}
                          onChange={(e) => setLocalEmbed({ ...localEmbed, loop: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm" style={{ color: theme.colors.foreground }}>Loop</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localEmbed.showControls}
                          onChange={(e) => setLocalEmbed({ ...localEmbed, showControls: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm" style={{ color: theme.colors.foreground }}>Controls</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Width</label>
                        <input
                          type="number"
                          min={200}
                          max={800}
                          value={localEmbed.width}
                          onChange={(e) => setLocalEmbed({ ...localEmbed, width: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Height</label>
                        <input
                          type="number"
                          min={100}
                          max={600}
                          value={localEmbed.height}
                          onChange={(e) => setLocalEmbed({ ...localEmbed, height: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={() => embedMutation.mutate()}
                  disabled={embedMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
                >
                  {embedMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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
