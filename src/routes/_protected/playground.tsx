import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { toast } from 'sonner'
import {
  getProfileSettingsFn,
  updateCustomBackgroundFn,
  updateLayoutSettingsFn,
} from '@/server/functions/profile-settings'
import {
  getCreatorSettingsFn,
  updateCustomCSSFn,
  updateAnimatedProfileFn,
} from '@/server/functions/creator-features'
import {
  publishTemplateFn,
  getMyTemplatesFn,
  deleteTemplateFn,
} from '@/server/functions/templates'
import {
  Palette,
  LayoutGrid,
  Code,
  Sparkles,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Play,
  Loader2,
  Globe,
  Lock,
} from 'lucide-react'
import type { CustomBackground, LayoutSettings, AnimatedProfileSettings } from '@/server/db/schema'
import { AnimatedBackground, VideoBackground, ANIMATED_PRESETS } from '@/components/backgrounds/AnimatedBackgrounds'

export const Route = createFileRoute('/_protected/playground')({
  component: PlaygroundPage,
})

const TEMPLATE_CATEGORIES = [
  'vtuber', 'gamer', 'developer', 'minimal', 'creative', 'business', 'music', 'art', 'anime', 'other'
] as const

const DEFAULT_BACKGROUND: CustomBackground = {
  type: 'solid',
  value: '#1a1a2e',
}

const DEFAULT_LAYOUT: LayoutSettings = {
  cardSpacing: 12,
  cardBorderRadius: 16,
  cardShadow: 'md',
  cardPadding: 16,
  profileLayout: 'default',
  linkStyle: 'default',
}

const DEFAULT_ANIMATED: AnimatedProfileSettings = {
  enabled: false,
  avatarAnimation: 'none',
  bannerAnimation: 'none',
  linkHoverEffect: 'scale',
  pageTransition: 'fade',
}

function PlaygroundPage() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  
  // State
  const [activeTab, setActiveTab] = useState<'background' | 'layout' | 'css' | 'animations'>('background')
  const [showPreview, setShowPreview] = useState(true)
  const [presetName, setPresetName] = useState('')
  const [presetCategory, setPresetCategory] = useState<typeof TEMPLATE_CATEGORIES[number]>('creative')
  const [isPublic, setIsPublic] = useState(true)
  
  // Local state for editing
  const [isInitialized, setIsInitialized] = useState(false)
  const [localBackground, setLocalBackground] = useState<CustomBackground>(DEFAULT_BACKGROUND)
  const [localLayout, setLocalLayout] = useState<LayoutSettings>(DEFAULT_LAYOUT)
  const [localCSS, setLocalCSS] = useState('')
  const [localAnimated, setLocalAnimated] = useState<AnimatedProfileSettings>(DEFAULT_ANIMATED)
  
  // Server functions
  const getProfileSettings = useServerFn(getProfileSettingsFn)
  const getCreatorSettings = useServerFn(getCreatorSettingsFn)
  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)
  const updateCSS = useServerFn(updateCustomCSSFn)
  const updateAnimated = useServerFn(updateAnimatedProfileFn)
  const publishTemplate = useServerFn(publishTemplateFn)
  const getMyTemplates = useServerFn(getMyTemplatesFn)
  const deleteTemplate = useServerFn(deleteTemplateFn)
  
  // Queries
  const { data: profileSettings } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: () => getProfileSettings(),
  })
  
  const { data: creatorSettings } = useQuery({
    queryKey: ['creatorSettings'],
    queryFn: () => getCreatorSettings(),
  })
  
  const { data: myTemplates } = useQuery({
    queryKey: ['myTemplates'],
    queryFn: () => getMyTemplates(),
  })
  
  // Load current settings only once on initial load
  useEffect(() => {
    if (!isInitialized && profileSettings && creatorSettings) {
      if (profileSettings.customBackground) {
        setLocalBackground(profileSettings.customBackground)
      }
      if (profileSettings.layoutSettings) {
        setLocalLayout(profileSettings.layoutSettings)
      }
      if (creatorSettings.customCSS) {
        setLocalCSS(creatorSettings.customCSS)
      }
      if (creatorSettings.animatedProfile) {
        setLocalAnimated(creatorSettings.animatedProfile)
      }
      setIsInitialized(true)
    }
  }, [profileSettings, creatorSettings, isInitialized])
  
  // Mutations
  const applyAllMutation = useMutation({
    mutationFn: async () => {
      await updateBackground({ data: localBackground })
      await updateLayout({ data: localLayout })
      await updateCSS({ data: { css: localCSS } })
      await updateAnimated({ data: localAnimated })
    },
    onSuccess: () => {
      toast.success('All settings applied!', { description: 'Your profile has been updated.' })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to apply settings')
    },
  })
  
  const publishMutation = useMutation({
    mutationFn: () => publishTemplate({ 
      data: { 
        name: presetName, 
        category: presetCategory, 
        isPublic 
      } 
    }),
    onSuccess: () => {
      toast.success('Template published!', { description: 'Your preset is now available.' })
      setPresetName('')
      void queryClient.invalidateQueries({ queryKey: ['myTemplates'] })
    },
    onError: () => {
      toast.error('Failed to publish template')
    },
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate({ data: { id } }),
    onSuccess: () => {
      toast.success('Template deleted')
      void queryClient.invalidateQueries({ queryKey: ['myTemplates'] })
    },
  })
  
  const resetToDefaults = () => {
    setLocalBackground(DEFAULT_BACKGROUND)
    setLocalLayout(DEFAULT_LAYOUT)
    setLocalCSS('')
    setLocalAnimated(DEFAULT_ANIMATED)
    toast.info('Reset to defaults')
  }
  
  const loadFromProfile = () => {
    if (profileSettings?.customBackground) {
      setLocalBackground(profileSettings.customBackground)
    }
    if (profileSettings?.layoutSettings) {
      setLocalLayout(profileSettings.layoutSettings)
    }
    if (creatorSettings?.customCSS) {
      setLocalCSS(creatorSettings.customCSS)
    }
    if (creatorSettings?.animatedProfile) {
      setLocalAnimated(creatorSettings.animatedProfile)
    }
    toast.info('Loaded current profile settings')
  }
  
  // Render preview background
  const renderPreviewBackground = () => {
    if (localBackground.type === 'video' && localBackground.videoUrl) {
      return (
        <VideoBackground
          url={localBackground.videoUrl}
          loop={localBackground.videoLoop ?? true}
          muted={localBackground.videoMuted ?? true}
        />
      )
    }
    
    if (localBackground.type === 'animated' && localBackground.animatedPreset) {
      return (
        <AnimatedBackground
          preset={localBackground.animatedPreset}
          speed={localBackground.animatedSpeed}
          intensity={localBackground.animatedIntensity}
          colors={localBackground.animatedColors}
        />
      )
    }
    
    return null
  }
  
  const getPreviewBackgroundStyle = (): React.CSSProperties => {
    switch (localBackground.type) {
      case 'solid': return { background: localBackground.value || '#1a1a2e' }
      case 'gradient': return { background: localBackground.value || 'linear-gradient(135deg, #667eea, #764ba2)' }
      case 'image': return {
        background: `url(${localBackground.imageUrl}) center/cover`,
        ...(localBackground.imageBlur ? { filter: `blur(${localBackground.imageBlur}px)` } : {}),
      }
      default: return { background: '#1a1a2e' }
    }
  }

  return (
    <div className="min-h-screen" style={{ background: theme.colors.background }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: `${theme.colors.background}ee`, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
              >
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: theme.colors.foreground }}>Playground</h1>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Create & test presets</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'}</span>
              </motion.button>
              <motion.button
                onClick={loadFromProfile}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={16} />
                Load Current
              </motion.button>
              <motion.button
                onClick={resetToDefaults}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw size={16} />
                Reset
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div
              className="flex items-center rounded-xl p-1"
              style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}` }}
            >
              {[
                { id: 'background', label: 'Background', icon: Palette },
                { id: 'layout', label: 'Layout', icon: LayoutGrid },
                { id: 'css', label: 'CSS', icon: Code },
                { id: 'animations', label: 'Animations', icon: Sparkles },
              ].map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === id ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'transparent',
                    color: activeTab === id ? '#fff' : theme.colors.foregroundMuted,
                  }}
                  whileHover={{ scale: activeTab === id ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </motion.button>
              ))}
            </div>
            
            {/* Editor Content */}
            <div
              className="rounded-2xl p-5"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <AnimatePresence mode="wait">
                {activeTab === 'background' && (
                  <motion.div
                    key="background"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Background Settings</h3>
                    
                    {/* Type Selection */}
                    <div className="grid grid-cols-5 gap-2">
                      {(['solid', 'gradient', 'image', 'video', 'animated'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setLocalBackground({ 
                            ...localBackground,
                            type, 
                            value: type === 'solid' ? '#1a1a2e' : type === 'gradient' ? 'linear-gradient(135deg, #667eea, #764ba2)' : localBackground.value,
                            animatedPreset: type === 'animated' ? 'particles' : undefined,
                            animatedSpeed: type === 'animated' ? 'normal' : undefined,
                            animatedIntensity: type === 'animated' ? 'normal' : undefined,
                          })}
                          className="p-2 rounded-lg text-center transition-all"
                          style={{
                            background: localBackground.type === type ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary,
                            border: `2px solid ${localBackground.type === type ? theme.colors.primary : 'transparent'}`,
                          }}
                        >
                          <div className="text-xs font-medium capitalize" style={{ color: theme.colors.foreground }}>{type}</div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Type-specific controls */}
                    {localBackground.type === 'solid' && (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={localBackground.value || '#1a1a2e'}
                          onChange={(e) => setLocalBackground({ ...localBackground, value: e.target.value })}
                          className="w-12 h-12 rounded-xl cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localBackground.value || '#1a1a2e'}
                          onChange={(e) => setLocalBackground({ ...localBackground, value: e.target.value })}
                          className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                          style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                        />
                      </div>
                    )}
                    
                    {localBackground.type === 'gradient' && (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={localBackground.gradientColors?.[0] || '#667eea'}
                            onChange={(e) => {
                              const colors = [e.target.value, localBackground.gradientColors?.[1] || '#764ba2']
                              const angle = localBackground.gradientAngle ?? 135
                              setLocalBackground({
                                ...localBackground,
                                gradientColors: colors,
                                value: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`
                              })
                            }}
                            className="w-12 h-12 rounded-xl cursor-pointer border-0"
                          />
                          <input
                            type="color"
                            value={localBackground.gradientColors?.[1] || '#764ba2'}
                            onChange={(e) => {
                              const colors = [localBackground.gradientColors?.[0] || '#667eea', e.target.value]
                              const angle = localBackground.gradientAngle ?? 135
                              setLocalBackground({
                                ...localBackground,
                                gradientColors: colors,
                                value: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`
                              })
                            }}
                            className="w-12 h-12 rounded-xl cursor-pointer border-0"
                          />
                        </div>
                        <div>
                          <label className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Angle: {localBackground.gradientAngle ?? 135}°</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={localBackground.gradientAngle ?? 135}
                            onChange={(e) => {
                              const angle = parseInt(e.target.value)
                              const colors = localBackground.gradientColors || ['#667eea', '#764ba2']
                              setLocalBackground({
                                ...localBackground,
                                gradientAngle: angle,
                                value: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`
                              })
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                    
                    {localBackground.type === 'image' && (
                      <div className="space-y-3">
                        <input
                          type="url"
                          placeholder="Image URL"
                          value={localBackground.imageUrl || ''}
                          onChange={(e) => setLocalBackground({ ...localBackground, imageUrl: e.target.value, value: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm"
                          style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Opacity: {Math.round((localBackground.imageOpacity ?? 1) * 100)}%</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={(localBackground.imageOpacity ?? 1) * 100}
                              onChange={(e) => setLocalBackground({ ...localBackground, imageOpacity: parseInt(e.target.value) / 100 })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Blur: {localBackground.imageBlur ?? 0}px</label>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={localBackground.imageBlur ?? 0}
                              onChange={(e) => setLocalBackground({ ...localBackground, imageBlur: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {localBackground.type === 'video' && (
                      <div className="space-y-3">
                        <input
                          type="url"
                          placeholder="Video URL (MP4, WebM, MOV, etc.)"
                          value={localBackground.videoUrl || ''}
                          onChange={(e) => setLocalBackground({ ...localBackground, videoUrl: e.target.value, value: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm"
                          style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                        />
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={localBackground.videoLoop ?? true}
                              onChange={(e) => setLocalBackground({ ...localBackground, videoLoop: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm" style={{ color: theme.colors.foreground }}>Loop</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={localBackground.videoMuted ?? true}
                              onChange={(e) => setLocalBackground({ ...localBackground, videoMuted: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm" style={{ color: theme.colors.foreground }}>Muted</span>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {localBackground.type === 'animated' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {ANIMATED_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => setLocalBackground({ 
                                ...localBackground, 
                                animatedPreset: preset.id,
                                value: preset.id,
                              })}
                              className="p-2 rounded-lg text-left transition-all"
                              style={{
                                background: localBackground.animatedPreset === preset.id ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary,
                                border: `1px solid ${localBackground.animatedPreset === preset.id ? theme.colors.primary : theme.colors.border}`,
                              }}
                            >
                              <div className="text-xs font-medium" style={{ color: theme.colors.foreground }}>{preset.name}</div>
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Speed</label>
                            <div className="flex gap-1">
                              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => setLocalBackground({ ...localBackground, animatedSpeed: speed })}
                                  className="flex-1 py-1.5 rounded-lg text-xs font-medium capitalize"
                                  style={{
                                    background: localBackground.animatedSpeed === speed ? theme.colors.primary : theme.colors.backgroundSecondary,
                                    color: localBackground.animatedSpeed === speed ? '#fff' : theme.colors.foreground,
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
                                  onClick={() => setLocalBackground({ ...localBackground, animatedIntensity: intensity })}
                                  className="flex-1 py-1.5 rounded-lg text-xs font-medium capitalize"
                                  style={{
                                    background: localBackground.animatedIntensity === intensity ? theme.colors.primary : theme.colors.backgroundSecondary,
                                    color: localBackground.animatedIntensity === intensity ? '#fff' : theme.colors.foreground,
                                  }}
                                >
                                  {intensity}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={localBackground.animatedColors?.[0] || '#8b5cf6'}
                            onChange={(e) => setLocalBackground({ 
                              ...localBackground, 
                              animatedColors: [e.target.value, localBackground.animatedColors?.[1] || '#ec4899']
                            })}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0"
                          />
                          <input
                            type="color"
                            value={localBackground.animatedColors?.[1] || '#ec4899'}
                            onChange={(e) => setLocalBackground({ 
                              ...localBackground, 
                              animatedColors: [localBackground.animatedColors?.[0] || '#8b5cf6', e.target.value]
                            })}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0"
                          />
                          <span className="text-xs self-center" style={{ color: theme.colors.foregroundMuted }}>Colors</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'layout' && (
                  <motion.div
                    key="layout"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Layout Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Card Spacing: {localLayout.cardSpacing}px</label>
                        <input
                          type="range"
                          min="4"
                          max="32"
                          value={localLayout.cardSpacing}
                          onChange={(e) => setLocalLayout({ ...localLayout, cardSpacing: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Border Radius: {localLayout.cardBorderRadius}px</label>
                        <input
                          type="range"
                          min="0"
                          max="32"
                          value={localLayout.cardBorderRadius}
                          onChange={(e) => setLocalLayout({ ...localLayout, cardBorderRadius: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Card Padding: {localLayout.cardPadding}px</label>
                        <input
                          type="range"
                          min="8"
                          max="32"
                          value={localLayout.cardPadding}
                          onChange={(e) => setLocalLayout({ ...localLayout, cardPadding: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Shadow</label>
                        <div className="flex gap-2">
                          {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((shadow) => (
                            <button
                              key={shadow}
                              onClick={() => setLocalLayout({ ...localLayout, cardShadow: shadow })}
                              className="flex-1 py-2 rounded-lg text-xs font-medium capitalize"
                              style={{
                                background: localLayout.cardShadow === shadow ? theme.colors.primary : theme.colors.backgroundSecondary,
                                color: localLayout.cardShadow === shadow ? '#fff' : theme.colors.foreground,
                              }}
                            >
                              {shadow}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Link Style</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['default', 'minimal', 'bold', 'glass'] as const).map((style) => (
                            <button
                              key={style}
                              onClick={() => setLocalLayout({ ...localLayout, linkStyle: style })}
                              className="py-2 rounded-lg text-xs font-medium capitalize"
                              style={{
                                background: localLayout.linkStyle === style ? theme.colors.primary : theme.colors.backgroundSecondary,
                                color: localLayout.linkStyle === style ? '#fff' : theme.colors.foreground,
                              }}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'css' && (
                  <motion.div
                    key="css"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Custom CSS</h3>
                    <textarea
                      value={localCSS}
                      onChange={(e) => setLocalCSS(e.target.value)}
                      placeholder="/* Add your custom CSS here */
.bio-card {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}"
                      rows={12}
                      className="w-full px-4 py-3 rounded-xl text-sm font-mono resize-none"
                      style={{ 
                        background: theme.colors.backgroundSecondary, 
                        color: theme.colors.foreground, 
                        border: `1px solid ${theme.colors.border}` 
                      }}
                    />
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      CSS is sandboxed and scoped to your bio page only.
                    </p>
                  </motion.div>
                )}
                
                {activeTab === 'animations' && (
                  <motion.div
                    key="animations"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Profile Animations</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Avatar Animation</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['none', 'pulse', 'glow', 'bounce', 'rotate', 'shake'] as const).map((anim) => (
                            <button
                              key={anim}
                              onClick={() => setLocalAnimated({ ...localAnimated, avatarAnimation: anim })}
                              className="py-2 rounded-lg text-xs font-medium capitalize"
                              style={{
                                background: localAnimated.avatarAnimation === anim ? theme.colors.primary : theme.colors.backgroundSecondary,
                                color: localAnimated.avatarAnimation === anim ? '#fff' : theme.colors.foreground,
                              }}
                            >
                              {anim}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Banner Animation</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['none', 'parallax', 'gradient-shift', 'particles'] as const).map((anim) => (
                            <button
                              key={anim}
                              onClick={() => setLocalAnimated({ ...localAnimated, bannerAnimation: anim })}
                              className="py-2 rounded-lg text-xs font-medium capitalize"
                              style={{
                                background: localAnimated.bannerAnimation === anim ? theme.colors.primary : theme.colors.backgroundSecondary,
                                color: localAnimated.bannerAnimation === anim ? '#fff' : theme.colors.foreground,
                              }}
                            >
                              {anim}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Link Hover Effect</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['none', 'scale', 'glow', 'slide', 'shake', 'flip'] as const).map((effect) => (
                            <button
                              key={effect}
                              onClick={() => setLocalAnimated({ ...localAnimated, linkHoverEffect: effect })}
                              className="py-2 rounded-lg text-xs font-medium capitalize"
                              style={{
                                background: localAnimated.linkHoverEffect === effect ? theme.colors.primary : theme.colors.backgroundSecondary,
                                color: localAnimated.linkHoverEffect === effect ? '#fff' : theme.colors.foreground,
                              }}
                            >
                              {effect}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => applyAllMutation.mutate()}
                disabled={applyAllMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {applyAllMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                Apply to Profile
              </motion.button>
            </div>
            
            {/* Publish Section */}
            <div
              className="rounded-2xl p-5"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <h3 className="font-bold mb-4" style={{ color: theme.colors.foreground }}>Publish as Template</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Template name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                />
                <div className="grid grid-cols-5 gap-2">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPresetCategory(cat)}
                      className="py-1.5 rounded-lg text-xs font-medium capitalize"
                      style={{
                        background: presetCategory === cat ? theme.colors.primary : theme.colors.backgroundSecondary,
                        color: presetCategory === cat ? '#fff' : theme.colors.foregroundMuted,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="relative w-10 h-5 rounded-full transition-all"
                    style={{ background: isPublic ? '#22c55e' : theme.colors.backgroundSecondary }}
                    onClick={() => setIsPublic(!isPublic)}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: isPublic ? '22px' : '2px' }}
                    />
                  </div>
                  <span className="text-sm" style={{ color: theme.colors.foreground }}>
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </label>
                <motion.button
                  onClick={() => presetName && publishMutation.mutate()}
                  disabled={!presetName || publishMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff' }}
                  whileHover={{ scale: presetName ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {publishMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Publish Template
                </motion.button>
              </div>
            </div>
            
            {/* My Templates */}
            {myTemplates && myTemplates.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <h3 className="font-bold mb-4" style={{ color: theme.colors.foreground }}>My Templates</h3>
                <div className="space-y-2">
                  {myTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>{template.name}</p>
                          {template.isPublic ? <Globe size={12} style={{ color: '#22c55e' }} /> : <Lock size={12} style={{ color: theme.colors.foregroundMuted }} />}
                        </div>
                        <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                          {template.uses || 0} uses • {template.likes || 0} likes
                        </p>
                      </div>
                      <motion.button
                        onClick={() => deleteMutation.mutate(template.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 rounded-lg hover:bg-white/10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} style={{ color: '#ef4444' }} />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Preview Panel */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${theme.colors.border}` }}
              >
                <div className="p-3 flex items-center justify-between" style={{ background: theme.colors.backgroundSecondary }}>
                  <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Live Preview</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
                <div 
                  className="relative h-[500px] overflow-hidden"
                  style={getPreviewBackgroundStyle()}
                >
                  {renderPreviewBackground()}
                  
                  {/* Custom CSS Preview */}
                  {localCSS && (
                    <style dangerouslySetInnerHTML={{ __html: localCSS }} />
                  )}
                  
                  {/* Mock Profile Content */}
                  <div className="relative z-10 p-6 flex flex-col items-center">
                    <div 
                      className={`w-24 h-24 rounded-full bg-linear-to-br from-purple-500 to-pink-500 mb-4 ${
                        localAnimated.avatarAnimation === 'pulse' ? 'animate-pulse' : ''
                      }`}
                    />
                    <h2 className="text-xl font-bold text-white mb-1">Username</h2>
                    <p className="text-sm text-white/70 mb-6">Bio description here</p>
                    
                    <div className="w-full space-y-3" style={{ gap: `${localLayout.cardSpacing}px` }}>
                      {['Link 1', 'Link 2', 'Link 3'].map((link, i) => (
                        <div
                          key={i}
                          className="bio-card w-full py-3 px-4 text-center text-white font-medium transition-all hover:scale-105"
                          style={{
                            borderRadius: `${localLayout.cardBorderRadius}px`,
                            padding: `${localLayout.cardPadding}px`,
                            background: localLayout.linkStyle === 'glass' 
                              ? 'rgba(255,255,255,0.1)' 
                              : localLayout.linkStyle === 'bold'
                              ? theme.colors.primary
                              : 'rgba(255,255,255,0.05)',
                            backdropFilter: localLayout.linkStyle === 'glass' ? 'blur(10px)' : undefined,
                            border: localLayout.linkStyle === 'minimal' ? '1px solid rgba(255,255,255,0.2)' : undefined,
                            boxShadow: localLayout.cardShadow !== 'none' 
                              ? `0 ${localLayout.cardShadow === 'sm' ? '1' : localLayout.cardShadow === 'md' ? '4' : localLayout.cardShadow === 'lg' ? '10' : '20'}px ${localLayout.cardShadow === 'sm' ? '2' : localLayout.cardShadow === 'md' ? '6' : localLayout.cardShadow === 'lg' ? '15' : '25'}px rgba(0,0,0,0.1)`
                              : undefined,
                          }}
                        >
                          {link}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
