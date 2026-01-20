import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMyLinksFn } from '@/server/functions/links'
import {
  getProfileSettingsFn,
  updateCustomBackgroundFn,
  updateLayoutSettingsFn,
} from '@/server/functions/profile-settings'
import { ANIMATED_PRESETS } from '@/components/backgrounds/AnimatedBackgrounds'
import { AnimatedBackground, VideoBackground } from '@/components/backgrounds/AnimatedBackgrounds'
import type { CustomBackground, LayoutSettings } from '@/server/db/schema'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { BadgeDisplay } from '@/components/ui/badge-display'
import {
  Sparkles,
  Monitor,
  Smartphone,
  Save,
  ExternalLink,
  Loader2,
  ImageIcon,
  Sliders,
  Eye,
  MapPin,
  Link as LinkIcon,
  RotateCcw,
  Upload,
  ChevronRight,
} from 'lucide-react'
import { SiX, SiInstagram, SiYoutube, SiTwitch, SiGithub, SiTiktok, SiDiscord } from 'react-icons/si'
import type { ComponentType } from 'react'

export const Route = createFileRoute('/_protected/playground')({
  head: () => ({
    meta: [
      { title: 'Playground | Eziox' },
      { name: 'description', content: 'Customize your bio page with live preview' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: PlaygroundPage,
})

const socialIconMap: Record<string, ComponentType<{ size?: number }>> = {
  twitter: SiX,
  github: SiGithub,
  instagram: SiInstagram,
  youtube: SiYoutube,
  discord: SiDiscord,
  tiktok: SiTiktok,
  twitch: SiTwitch,
}

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Subtle' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Dramatic' },
] as const

const LINK_STYLE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'glass', label: 'Glass' },
] as const

function PlaygroundPage() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'background' | 'layout'>('background')

  // Server functions
  const getSettings = useServerFn(getProfileSettingsFn)
  const getLinks = useServerFn(getMyLinksFn)
  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)

  // Queries
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: () => getSettings(),
  })

  const { data: linksData } = useQuery({
    queryKey: ['myLinks'],
    queryFn: () => getLinks(),
  })

  // Local state for editing
  const [localBackground, setLocalBackground] = useState<CustomBackground | null>(null)
  const [localLayout, setLocalLayout] = useState<LayoutSettings | null>(null)

  // Sync from server
  useEffect(() => {
    if (settings?.customBackground) {
      setLocalBackground(settings.customBackground)
    }
    if (settings?.layoutSettings) {
      setLocalLayout(settings.layoutSettings)
    }
  }, [settings])

  // Mutations
  const backgroundMutation = useMutation({
    mutationFn: (bg: CustomBackground | null) => updateBackground({ data: bg }),
    onSuccess: () => {
      toast.success('Background saved!', { description: 'Your bio page has been updated.' })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => toast.error('Failed to save background'),
  })

  const layoutMutation = useMutation({
    mutationFn: (layout: Partial<LayoutSettings>) => updateLayout({ data: layout }),
    onSuccess: () => {
      toast.success('Layout saved!', { description: 'Your bio page has been updated.' })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => toast.error('Failed to save layout'),
  })

  const isSaving = backgroundMutation.isPending || layoutMutation.isPending

  if (settingsLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.colors.primary }} />
      </div>
    )
  }

  const profile = currentUser.profile
  const links = linksData || []
  const socials = (profile?.socials as Record<string, string>) || {}
  const badges = (profile?.badges as string[]) || []
  const accentColor = theme.colors.primary

  // Current values (local or from server)
  const currentBackground = localBackground ?? settings?.customBackground ?? null
  const currentLayout: LayoutSettings = localLayout ?? settings?.layoutSettings ?? {
    cardSpacing: 12,
    cardBorderRadius: 16,
    cardPadding: 16,
    cardShadow: 'md',
    linkStyle: 'default',
    profileLayout: 'default',
  }

  // Background style for preview
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!currentBackground) return { background: theme.colors.background }
    switch (currentBackground.type) {
      case 'solid': return { background: currentBackground.value || theme.colors.background }
      case 'gradient': return { background: currentBackground.value || theme.colors.background }
      case 'image': return { background: `url(${currentBackground.imageUrl}) center/cover` }
      default: return { background: theme.colors.background }
    }
  }

  // Shadow map
  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.15)',
    xl: '0 20px 25px rgba(0,0,0,0.2)',
  }

  // Link style
  const getLinkStyle = () => {
    switch (currentLayout.linkStyle) {
      case 'minimal': return { background: 'transparent', border: `1px solid ${accentColor}30` }
      case 'bold': return { background: `${accentColor}20`, border: 'none' }
      case 'glass': return { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }
      default: return { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }
    }
  }

  const handleSave = () => {
    if (activeTab === 'background') {
      backgroundMutation.mutate(currentBackground)
    } else {
      layoutMutation.mutate(currentLayout)
    }
  }

  const handleReset = () => {
    if (activeTab === 'background') {
      setLocalBackground(settings?.customBackground ?? null)
    } else {
      setLocalLayout(settings?.layoutSettings ?? null)
    }
    toast.info('Changes reverted')
  }

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ background: theme.colors.background }}>
      <div className="max-w-[1800px] mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            >
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>
                Playground
              </h1>
              <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                Customize your bio page with live preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: theme.colors.backgroundSecondary }}
            >
              <button
                onClick={() => setViewMode('desktop')}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: viewMode === 'desktop' ? theme.colors.primary : 'transparent',
                  color: viewMode === 'desktop' ? '#fff' : theme.colors.foregroundMuted,
                }}
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: viewMode === 'mobile' ? theme.colors.primary : 'transparent',
                  color: viewMode === 'mobile' ? '#fff' : theme.colors.foregroundMuted,
                }}
              >
                <Smartphone size={18} />
              </button>
            </div>

            {/* Actions */}
            <motion.button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw size={16} />
              Reset
            </motion.button>

            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 text-white"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </motion.button>

            <Link
              to="/$username"
              params={{ username: currentUser.username }}
              target="_blank"
              className="px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
            >
              <ExternalLink size={16} />
              View Live
            </Link>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Editor Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-4 space-y-4"
          >
            {/* Tab Navigation */}
            <div
              className="flex gap-2 p-1.5 rounded-2xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              {[
                { id: 'background', label: 'Background', icon: ImageIcon },
                { id: 'layout', label: 'Layout', icon: Sliders },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'background' | 'layout')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: activeTab === tab.id ? theme.colors.primary : 'transparent',
                    color: activeTab === tab.id ? '#fff' : theme.colors.foregroundMuted,
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Editor Content */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <AnimatePresence mode="wait">
                {activeTab === 'background' && (
                  <BackgroundEditor
                    key="background"
                    theme={theme}
                    currentBackground={currentBackground}
                    setLocalBackground={setLocalBackground}
                  />
                )}
                {activeTab === 'layout' && (
                  <LayoutEditor
                    key="layout"
                    theme={theme}
                    currentLayout={currentLayout}
                    setLocalLayout={setLocalLayout}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Preview Panel - Full Width Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8"
          >
            {/* Preview Header - Minimal */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-3">
                <Eye size={16} style={{ color: theme.colors.primary }} />
                <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>
                  Live Preview
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${theme.colors.primary}20`, color: theme.colors.primary }}
                >
                  {viewMode === 'desktop' ? 'Desktop' : 'Mobile'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Auto-updating
              </div>
            </div>

            {/* Preview Content */}
            <div
              className={`transition-all duration-300 overflow-hidden ${viewMode === 'mobile' ? 'max-w-[400px] mx-auto' : ''}`}
              style={{
                borderRadius: viewMode === 'mobile' ? '2.5rem' : '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
                border: viewMode === 'mobile' ? `8px solid ${theme.colors.card}` : `1px solid ${theme.colors.border}`,
                height: viewMode === 'mobile' ? 'calc(100vh - 200px)' : 'calc(100vh - 180px)',
              }}
            >
              {/* Bio Preview */}
              <BioPreview
                user={currentUser}
                profile={profile}
                links={links}
                socials={socials}
                badges={badges}
                accentColor={accentColor}
                background={currentBackground}
                layout={currentLayout}
                theme={theme}
                shadowMap={shadowMap}
                getLinkStyle={getLinkStyle}
                getBackgroundStyle={getBackgroundStyle}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Background Editor Component
function BackgroundEditor({
  theme,
  currentBackground,
  setLocalBackground,
}: {
  theme: ReturnType<typeof useTheme>['theme']
  currentBackground: CustomBackground | null
  setLocalBackground: (bg: CustomBackground | null) => void
}) {
  const bgTypes = ['solid', 'gradient', 'image', 'video', 'animated'] as const

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-5 space-y-5"
    >
      {/* Type Selection */}
      <div>
        <label className="text-sm font-medium mb-3 block" style={{ color: theme.colors.foreground }}>
          Background Type
        </label>
        <div className="grid grid-cols-5 gap-2">
          {bgTypes.map((type) => (
            <button
              key={type}
              onClick={() => setLocalBackground({
                type,
                value: type === 'solid' ? '#1a1a2e' : type === 'gradient' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '',
                gradientColors: type === 'gradient' ? ['#667eea', '#764ba2'] : undefined,
                gradientAngle: type === 'gradient' ? 135 : undefined,
                animatedPreset: type === 'animated' ? 'particles' : undefined,
                animatedSpeed: type === 'animated' ? 'normal' : undefined,
                animatedIntensity: type === 'animated' ? 'normal' : undefined,
              })}
              className="p-3 rounded-xl text-center transition-all"
              style={{
                background: currentBackground?.type === type ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary,
                border: `2px solid ${currentBackground?.type === type ? theme.colors.primary : 'transparent'}`,
              }}
            >
              <span className="text-xs font-medium capitalize" style={{ color: theme.colors.foreground }}>
                {type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Type-specific controls */}
      {currentBackground?.type === 'solid' && (
        <div className="space-y-3">
          <label className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentBackground.value || '#1a1a2e'}
              onChange={(e) => setLocalBackground({ ...currentBackground, value: e.target.value })}
              className="w-12 h-12 rounded-xl cursor-pointer border-0"
            />
            <input
              type="text"
              value={currentBackground.value || '#1a1a2e'}
              onChange={(e) => setLocalBackground({ ...currentBackground, value: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
            />
          </div>
        </div>
      )}

      {currentBackground?.type === 'gradient' && (
        <div className="space-y-3">
          <label className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Gradient Colors</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentBackground.gradientColors?.[0] || '#667eea'}
              onChange={(e) => setLocalBackground({
                ...currentBackground,
                gradientColors: [e.target.value, currentBackground.gradientColors?.[1] || '#764ba2'],
                value: `linear-gradient(${currentBackground.gradientAngle || 135}deg, ${e.target.value}, ${currentBackground.gradientColors?.[1] || '#764ba2'})`,
              })}
              className="w-12 h-12 rounded-xl cursor-pointer border-0"
            />
            <input
              type="color"
              value={currentBackground.gradientColors?.[1] || '#764ba2'}
              onChange={(e) => setLocalBackground({
                ...currentBackground,
                gradientColors: [currentBackground.gradientColors?.[0] || '#667eea', e.target.value],
                value: `linear-gradient(${currentBackground.gradientAngle || 135}deg, ${currentBackground.gradientColors?.[0] || '#667eea'}, ${e.target.value})`,
              })}
              className="w-12 h-12 rounded-xl cursor-pointer border-0"
            />
            <div className="flex-1">
              <label className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                Angle: {currentBackground.gradientAngle || 135}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={currentBackground.gradientAngle || 135}
                onChange={(e) => {
                  const angle = parseInt(e.target.value)
                  setLocalBackground({
                    ...currentBackground,
                    gradientAngle: angle,
                    value: `linear-gradient(${angle}deg, ${currentBackground.gradientColors?.[0] || '#667eea'}, ${currentBackground.gradientColors?.[1] || '#764ba2'})`,
                  })
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {currentBackground?.type === 'image' && (
        <div className="space-y-3">
          <label className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Image URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={currentBackground.imageUrl || ''}
              onChange={(e) => setLocalBackground({ ...currentBackground, imageUrl: e.target.value, value: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
            />
            <label
              className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2"
              style={{ background: theme.colors.primary, color: '#fff' }}
            >
              <Upload size={16} />
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const dataUrl = event.target?.result as string
                    setLocalBackground({ ...currentBackground, imageUrl: dataUrl, value: dataUrl })
                  }
                  reader.readAsDataURL(file)
                }
              }} />
            </label>
          </div>
        </div>
      )}

      {currentBackground?.type === 'video' && (
        <div className="space-y-3">
          <label className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Video URL</label>
          <input
            type="url"
            placeholder="https://example.com/video.mp4"
            value={currentBackground.videoUrl || ''}
            onChange={(e) => setLocalBackground({ ...currentBackground, videoUrl: e.target.value, value: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl text-sm"
            style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentBackground.videoLoop ?? true}
                onChange={(e) => setLocalBackground({ ...currentBackground, videoLoop: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm" style={{ color: theme.colors.foreground }}>Loop</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentBackground.videoMuted ?? true}
                onChange={(e) => setLocalBackground({ ...currentBackground, videoMuted: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm" style={{ color: theme.colors.foreground }}>Muted</span>
            </label>
          </div>
        </div>
      )}

      {currentBackground?.type === 'animated' && (
        <div className="space-y-4">
          <label className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Animation Preset</label>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {['vtuber', 'gamer', 'developer', 'nature', 'abstract'].map((category) => (
              <div key={category}>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: theme.colors.foregroundMuted }}>
                  {category === 'vtuber' ? 'VTuber / Anime' : category.charAt(0).toUpperCase() + category.slice(1)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ANIMATED_PRESETS.filter((p) => p.category === category).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setLocalBackground({
                        type: 'animated',
                        value: preset.id,
                        animatedPreset: preset.id,
                        animatedSpeed: currentBackground?.animatedSpeed || 'normal',
                        animatedIntensity: currentBackground?.animatedIntensity || 'normal',
                        animatedColors: currentBackground?.animatedColors,
                      })}
                      className="p-2.5 rounded-lg text-left transition-all"
                      style={{
                        background: currentBackground?.animatedPreset === preset.id ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary,
                        border: `1px solid ${currentBackground?.animatedPreset === preset.id ? theme.colors.primary : theme.colors.border}`,
                      }}
                    >
                      <div className="text-xs font-medium" style={{ color: theme.colors.foreground }}>{preset.name}</div>
                      <div className="text-[10px] truncate" style={{ color: theme.colors.foregroundMuted }}>{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Speed & Intensity */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Speed</label>
              <div className="flex gap-1">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setLocalBackground({ ...currentBackground!, animatedSpeed: speed })}
                    className="flex-1 py-2 rounded-lg text-xs font-medium capitalize"
                    style={{
                      background: currentBackground?.animatedSpeed === speed ? theme.colors.primary : theme.colors.backgroundSecondary,
                      color: currentBackground?.animatedSpeed === speed ? '#fff' : theme.colors.foreground,
                    }}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Intensity</label>
              <div className="flex gap-1">
                {(['subtle', 'normal', 'intense'] as const).map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => setLocalBackground({ ...currentBackground!, animatedIntensity: intensity })}
                    className="flex-1 py-2 rounded-lg text-xs font-medium capitalize"
                    style={{
                      background: currentBackground?.animatedIntensity === intensity ? theme.colors.primary : theme.colors.backgroundSecondary,
                      color: currentBackground?.animatedIntensity === intensity ? '#fff' : theme.colors.foreground,
                    }}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={() => setLocalBackground(null)}
        className="w-full py-2.5 rounded-xl text-sm font-medium"
        style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
      >
        Reset to Default
      </button>
    </motion.div>
  )
}

// Layout Editor Component
function LayoutEditor({
  theme,
  currentLayout,
  setLocalLayout,
}: {
  theme: ReturnType<typeof useTheme>['theme']
  currentLayout: LayoutSettings
  setLocalLayout: (layout: LayoutSettings | null) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-5 space-y-5"
    >
      {/* Card Spacing */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>
          Card Spacing: {currentLayout.cardSpacing}px
        </label>
        <input
          type="range"
          min="4"
          max="24"
          value={currentLayout.cardSpacing}
          onChange={(e) => setLocalLayout({ ...currentLayout, cardSpacing: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Border Radius */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>
          Border Radius: {currentLayout.cardBorderRadius}px
        </label>
        <input
          type="range"
          min="0"
          max="32"
          value={currentLayout.cardBorderRadius}
          onChange={(e) => setLocalLayout({ ...currentLayout, cardBorderRadius: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Card Padding */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>
          Card Padding: {currentLayout.cardPadding}px
        </label>
        <input
          type="range"
          min="8"
          max="32"
          value={currentLayout.cardPadding}
          onChange={(e) => setLocalLayout({ ...currentLayout, cardPadding: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Shadow */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Shadow</label>
        <div className="grid grid-cols-5 gap-2">
          {SHADOW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLocalLayout({ ...currentLayout, cardShadow: opt.value })}
              className="py-2 rounded-lg text-xs font-medium"
              style={{
                background: currentLayout.cardShadow === opt.value ? theme.colors.primary : theme.colors.backgroundSecondary,
                color: currentLayout.cardShadow === opt.value ? '#fff' : theme.colors.foreground,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Link Style */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Link Style</label>
        <div className="grid grid-cols-2 gap-2">
          {LINK_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLocalLayout({ ...currentLayout, linkStyle: opt.value })}
              className="py-3 rounded-xl text-sm font-medium"
              style={{
                background: currentLayout.linkStyle === opt.value ? theme.colors.primary : theme.colors.backgroundSecondary,
                color: currentLayout.linkStyle === opt.value ? '#fff' : theme.colors.foreground,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Bio Preview Component
function BioPreview({
  user,
  profile,
  links,
  socials,
  badges,
  accentColor,
  background,
  layout,
  theme,
  shadowMap,
  getLinkStyle,
  getBackgroundStyle,
}: {
  user: { id: string; username: string; name: string | null }
  profile: { avatar?: string | null; banner?: string | null; bio?: string | null; location?: string | null; pronouns?: string | null } | null
  links: Array<{ id: string; title: string; url: string; icon?: string | null }>
  socials: Record<string, string>
  badges: string[]
  accentColor: string
  background: CustomBackground | null
  layout: LayoutSettings
  theme: ReturnType<typeof useTheme>['theme']
  shadowMap: Record<string, string>
  getLinkStyle: () => React.CSSProperties
  getBackgroundStyle: () => React.CSSProperties
}) {
  const renderBackground = () => {
    if (!background) return null
    if (background.type === 'video' && background.videoUrl) {
      return <VideoBackground url={background.videoUrl} loop={background.videoLoop ?? true} muted={background.videoMuted ?? true} />
    }
    if (background.type === 'animated' && background.animatedPreset) {
      return <AnimatedBackground preset={background.animatedPreset} speed={background.animatedSpeed} intensity={background.animatedIntensity} colors={background.animatedColors} contained={true} />
    }
    return null
  }

  return (
    <div className="min-h-[600px] relative" style={getBackgroundStyle()}>
      {renderBackground()}

      <div className="relative z-10 p-6">
        {/* Banner */}
        <div
          className="h-32 rounded-2xl mb-4 overflow-hidden"
          style={{
            background: profile?.banner
              ? `url(${profile.banner}) center/cover`
              : `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
          }}
        />

        {/* Avatar & Info */}
        <div className="text-center -mt-16 mb-6">
          <div
            className="w-24 h-24 rounded-2xl mx-auto mb-3 overflow-hidden"
            style={{
              background: profile?.avatar
                ? `url(${profile.avatar}) center/cover`
                : `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`,
              border: '4px solid var(--background)',
              boxShadow: shadowMap[layout.cardShadow || 'md'],
            }}
          >
            {!profile?.avatar && (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold mb-1" style={{ color: theme.colors.foreground }}>
            {user.name || user.username}
          </h1>

          {badges.length > 0 && (
            <div className="flex justify-center mb-2">
              <BadgeDisplay badges={badges} size="sm" maxDisplay={4} />
            </div>
          )}

          <p className="text-sm mb-2" style={{ color: theme.colors.foregroundMuted }}>
            @{user.username}
            {profile?.pronouns && ` · ${profile.pronouns}`}
          </p>

          {profile?.location && (
            <p className="text-xs flex items-center justify-center gap-1 mb-3" style={{ color: theme.colors.foregroundMuted }}>
              <MapPin size={12} />
              {profile.location}
            </p>
          )}

          {profile?.bio && (
            <p className="text-sm max-w-xs mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Social Icons */}
        {Object.keys(socials).length > 0 && (
          <div className="flex justify-center gap-2 mb-6">
            {Object.entries(socials).map(([key, value]) => {
              if (!value) return null
              const Icon = socialIconMap[key]
              if (!Icon) return null
              return (
                <div
                  key={key}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${accentColor}20` }}
                >
                  <Icon size={18} />
                </div>
              )
            })}
          </div>
        )}

        {/* Links */}
        <div className="space-y-3" style={{ gap: layout.cardSpacing }}>
          {links.length > 0 ? (
            links.slice(0, 5).map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.02]"
                style={{
                  ...getLinkStyle(),
                  padding: layout.cardPadding,
                  borderRadius: layout.cardBorderRadius,
                  boxShadow: shadowMap[layout.cardShadow || 'md'],
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${accentColor}20` }}
                >
                  <LinkIcon size={18} style={{ color: accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: theme.colors.foreground }}>
                    {link.title}
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: theme.colors.foregroundMuted }} />
              </div>
            ))
          ) : (
            <div
              className="text-center py-8 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <LinkIcon size={24} className="mx-auto mb-2" style={{ color: theme.colors.foregroundMuted }} />
              <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>No links yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
