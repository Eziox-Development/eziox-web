import { useState, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
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
  addCustomFontFn,
  removeCustomFontFn,
  updateOpenGraphFn,
} from '@/server/functions/creator-features'
import {
  publishTemplateFn,
  getMyTemplatesFn,
  deleteTemplateFn,
} from '@/server/functions/templates'
import {
  Palette,
  LayoutGrid,
  Code2,
  Sparkles,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Play,
  Loader2,
  Globe,
  Lock,
  Image as ImageIcon,
  Video,
  Wand2,
  Layers,
  Monitor,
  Smartphone,
  FileUp,
  X,
  Type,
  Share2,
  Plus,
} from 'lucide-react'
import type { CustomBackground, LayoutSettings, AnimatedProfileSettings, CustomFont, OpenGraphSettings } from '@/server/db/schema'
import { AnimatedBackground, VideoBackground, ANIMATED_PRESETS } from '@/components/backgrounds/AnimatedBackgrounds'
import { TIER_CONFIG, canAccessFeature, type TierType } from '@/server/lib/stripe'
import { Crown } from 'lucide-react'

export const Route = createFileRoute('/_protected/playground')({
  component: PlaygroundPage,
})

const CATEGORIES = [
  { id: 'vtuber', label: 'VTuber' },
  { id: 'gamer', label: 'Gamer' },
  { id: 'developer', label: 'Developer' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'creative', label: 'Creative' },
  { id: 'business', label: 'Business' },
  { id: 'music', label: 'Music' },
  { id: 'art', label: 'Art' },
  { id: 'anime', label: 'Anime' },
  { id: 'other', label: 'Other' },
] as const

const BG_TYPES = [
  { id: 'solid', label: 'Solid', icon: Palette },
  { id: 'gradient', label: 'Gradient', icon: Layers },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'animated', label: 'Animated', icon: Wand2 },
] as const

function PlaygroundPage() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const userTier = (currentUser?.tier || 'free') as TierType
  const canCustomBg = canAccessFeature(userTier, 'customBackgrounds')
  const canLayout = canAccessFeature(userTier, 'layoutCustomization')
  const canCSS = canAccessFeature(userTier, 'customCSS')
  const canAnimations = canAccessFeature(userTier, 'animatedProfiles')
  const canFonts = canAccessFeature(userTier, 'customFonts')
  const canOG = canAccessFeature(userTier, 'customOpenGraph')
  
  const [activeTab, setActiveTab] = useState<'background' | 'layout' | 'css' | 'animations' | 'fonts' | 'opengraph'>('background')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  
  const [publishName, setPublishName] = useState('')
  const [publishCategory, setPublishCategory] = useState<string>('creative')
  const [publishPublic, setPublishPublic] = useState(true)
  const [showPublish, setShowPublish] = useState(false)
  
  const [bg, setBg] = useState<CustomBackground>({ type: 'solid', value: '#1a1a2e' })
  const [layout, setLayout] = useState<LayoutSettings>({
    cardSpacing: 12, cardBorderRadius: 16, cardShadow: 'md', cardPadding: 16, profileLayout: 'default', linkStyle: 'default',
  })
  const [css, setCss] = useState('')
  const [anim, setAnim] = useState<AnimatedProfileSettings>({
    enabled: false, avatarAnimation: 'none', bannerAnimation: 'none', linkHoverEffect: 'scale', pageTransition: 'fade',
  })
  const [fonts, setFonts] = useState<CustomFont[]>([])
  const [newFontName, setNewFontName] = useState('')
  const [newFontUrl, setNewFontUrl] = useState('')
  const [newFontType, setNewFontType] = useState<'display' | 'body'>('display')
  const [og, setOg] = useState<OpenGraphSettings>({
    useCustom: false, title: '', description: '', image: '',
  })
  
  const getProfile = useServerFn(getProfileSettingsFn)
  const getCreator = useServerFn(getCreatorSettingsFn)
  const updateBg = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)
  const updateCss = useServerFn(updateCustomCSSFn)
  const updateAnim = useServerFn(updateAnimatedProfileFn)
  const addFont = useServerFn(addCustomFontFn)
  const removeFont = useServerFn(removeCustomFontFn)
  const updateOG = useServerFn(updateOpenGraphFn)
  const publish = useServerFn(publishTemplateFn)
  const getTemplates = useServerFn(getMyTemplatesFn)
  const deleteTemplate = useServerFn(deleteTemplateFn)
  
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: () => getProfile(),
  })
  
  const { data: creatorData, isLoading: creatorLoading } = useQuery({
    queryKey: ['creatorSettings'],
    queryFn: () => getCreator(),
  })
  
  const { data: myTemplates } = useQuery({
    queryKey: ['myTemplates'],
    queryFn: () => getTemplates(),
  })
  
  useEffect(() => {
    if (!isInitialized && !profileLoading && !creatorLoading && profileData && creatorData) {
      if (profileData.customBackground) setBg(profileData.customBackground)
      if (profileData.layoutSettings) setLayout(profileData.layoutSettings)
      if (creatorData.customCSS) setCss(creatorData.customCSS)
      if (creatorData.animatedProfile) setAnim(creatorData.animatedProfile)
      if (creatorData.customFonts) setFonts(creatorData.customFonts)
      if (creatorData.openGraphSettings) setOg(creatorData.openGraphSettings)
      setIsInitialized(true)
    }
  }, [profileData, creatorData, profileLoading, creatorLoading, isInitialized])
  
  const applyMutation = useMutation({
    mutationFn: async () => {
      await updateBg({ data: bg })
      await updateLayout({ data: layout })
      await updateCss({ data: { css } })
      await updateAnim({ data: anim })
    },
    onSuccess: () => {
      toast.success('Applied to profile!')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
    onError: () => toast.error('Failed to apply'),
  })
  
  const publishMutation = useMutation({
    mutationFn: () => publish({ 
      data: { 
        name: publishName,
        category: publishCategory as typeof CATEGORIES[number]['id'],
        isPublic: publishPublic,
      } 
    }),
    onSuccess: () => {
      toast.success('Template published!')
      setPublishName('')
      setShowPublish(false)
      void queryClient.invalidateQueries({ queryKey: ['myTemplates'] })
    },
    onError: () => toast.error('Failed to publish'),
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate({ data: { id } }),
    onSuccess: () => {
      toast.success('Deleted')
      void queryClient.invalidateQueries({ queryKey: ['myTemplates'] })
    },
  })
  
  const reset = () => {
    setBg({ type: 'solid', value: '#1a1a2e' })
    setLayout({ cardSpacing: 12, cardBorderRadius: 16, cardShadow: 'md', cardPadding: 16, profileLayout: 'default', linkStyle: 'default' })
    setCss('')
    setAnim({ enabled: false, avatarAnimation: 'none', bannerAnimation: 'none', linkHoverEffect: 'scale', pageTransition: 'fade' })
    toast.info('Reset')
  }
  
  const loadCurrent = () => {
    if (profileData?.customBackground) setBg(profileData.customBackground)
    if (profileData?.layoutSettings) setLayout(profileData.layoutSettings)
    if (creatorData?.customCSS) setCss(creatorData.customCSS)
    if (creatorData?.animatedProfile) setAnim(creatorData.animatedProfile)
    toast.info('Loaded')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setBg({ ...bg, imageUrl: ev.target?.result as string, value: ev.target?.result as string })
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setBg({ ...bg, videoUrl: url, value: url })
    }
  }
  
  const renderBgPreview = () => {
    if (bg.type === 'video' && bg.videoUrl) {
      return <VideoBackground url={bg.videoUrl} loop={bg.videoLoop ?? true} muted={bg.videoMuted ?? true} />
    }
    if (bg.type === 'animated' && bg.animatedPreset) {
      return <AnimatedBackground preset={bg.animatedPreset} speed={bg.animatedSpeed} intensity={bg.animatedIntensity} colors={bg.animatedColors} />
    }
    return null
  }
  
  const getBgStyle = (): React.CSSProperties => {
    switch (bg.type) {
      case 'solid': return { background: bg.value || '#1a1a2e' }
      case 'gradient': return { background: bg.value || 'linear-gradient(135deg, #667eea, #764ba2)' }
      case 'image': return { background: bg.imageUrl ? `url(${bg.imageUrl}) center/cover` : '#1a1a2e' }
      default: return { background: '#0a0a0f' }
    }
  }

  const isLoading = profileLoading || creatorLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.colors.primary }} />
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden pt-22" style={{ background: theme.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-4 h-full flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Playground</h1>
              <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Create & test presets</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'}</span>
            </motion.button>
            <motion.button
              onClick={loadCurrent}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Load</span>
            </motion.button>
            <motion.button
              onClick={reset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </motion.button>
            <motion.button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: '#22c55e' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {applyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Apply
            </motion.button>
            <motion.button
              onClick={() => setShowPublish(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={16} />
              Publish
            </motion.button>
          </div>
        </motion.div>
        
        <div className={`grid gap-4 flex-1 min-h-0 ${showPreview ? 'lg:grid-cols-[1fr,360px]' : 'grid-cols-1'}`}>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 overflow-y-auto pr-1">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
              {[
                { id: 'background', label: 'Background', icon: Palette, tier: 'pro' as TierType, canAccess: canCustomBg },
                { id: 'layout', label: 'Layout', icon: LayoutGrid, tier: 'pro' as TierType, canAccess: canLayout },
                { id: 'css', label: 'CSS', icon: Code2, tier: 'creator' as TierType, canAccess: canCSS },
                { id: 'animations', label: 'Animations', icon: Sparkles, tier: 'creator' as TierType, canAccess: canAnimations },
                { id: 'fonts', label: 'Fonts', icon: Type, tier: 'creator' as TierType, canAccess: canFonts },
                { id: 'opengraph', label: 'OG', icon: Share2, tier: 'creator' as TierType, canAccess: canOG },
              ].map(({ id, label, icon: Icon, tier, canAccess }) => (
                <motion.button
                  key={id}
                  onClick={() => canAccess && setActiveTab(id as typeof activeTab)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium relative"
                  style={{
                    background: activeTab === id ? theme.colors.primary : 'transparent',
                    color: activeTab === id ? '#fff' : canAccess ? theme.colors.foregroundMuted : theme.colors.foregroundMuted + '60',
                    opacity: canAccess ? 1 : 0.6,
                    cursor: canAccess ? 'pointer' : 'not-allowed',
                  }}
                  whileHover={{ scale: canAccess && activeTab !== id ? 1.02 : 1 }}
                  whileTap={{ scale: canAccess ? 0.98 : 1 }}
                  title={!canAccess ? `${TIER_CONFIG[tier].name} required` : undefined}
                >
                  {!canAccess && <Lock size={10} className="absolute top-1 right-1" style={{ color: theme.colors.foregroundMuted }} />}
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                  {!canAccess && <Crown size={12} style={{ color: '#fbbf24' }} />}
                </motion.button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              {activeTab === 'background' && (
                <motion.div key="bg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Type</p>
                    <div className="grid grid-cols-5 gap-2">
                      {BG_TYPES.map(({ id, label, icon: Icon }) => (
                        <motion.button
                          key={id}
                          onClick={() => setBg({ ...bg, type: id as CustomBackground['type'], animatedPreset: id === 'animated' ? 'particles' : undefined })}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg text-xs"
                          style={{
                            background: bg.type === id ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary,
                            border: `2px solid ${bg.type === id ? theme.colors.primary : 'transparent'}`,
                            color: bg.type === id ? theme.colors.primary : theme.colors.foregroundMuted,
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon size={18} />
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    {bg.type === 'solid' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input type="color" value={bg.value || '#1a1a2e'} onChange={(e) => setBg({ ...bg, value: e.target.value })} className="w-12 h-12 rounded-lg cursor-pointer border-0" />
                          <input type="text" value={bg.value || '#1a1a2e'} onChange={(e) => setBg({ ...bg, value: e.target.value })} className="flex-1 px-3 py-2 rounded-lg text-sm font-mono" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {['#1a1a2e', '#0f172a', '#18181b', '#1e1b4b', '#0c0a09', '#0a0a0a'].map((c) => (
                            <button key={c} onClick={() => setBg({ ...bg, value: c })} className="aspect-square rounded-lg" style={{ background: c, border: bg.value === c ? `2px solid ${theme.colors.primary}` : '2px solid transparent' }} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {bg.type === 'gradient' && (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <p className="text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}>Color 1</p>
                            <input type="color" value={bg.gradientColors?.[0] || '#667eea'} onChange={(e) => {
                              const colors = [e.target.value, bg.gradientColors?.[1] || '#764ba2']
                              setBg({ ...bg, gradientColors: colors, value: `linear-gradient(${bg.gradientAngle ?? 135}deg, ${colors[0]}, ${colors[1]})` })
                            }} className="w-full h-10 rounded-lg cursor-pointer border-0" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}>Color 2</p>
                            <input type="color" value={bg.gradientColors?.[1] || '#764ba2'} onChange={(e) => {
                              const colors = [bg.gradientColors?.[0] || '#667eea', e.target.value]
                              setBg({ ...bg, gradientColors: colors, value: `linear-gradient(${bg.gradientAngle ?? 135}deg, ${colors[0]}, ${colors[1]})` })
                            }} className="w-full h-10 rounded-lg cursor-pointer border-0" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}>
                            <span>Angle</span><span>{bg.gradientAngle ?? 135}°</span>
                          </div>
                          <input type="range" min="0" max="360" value={bg.gradientAngle ?? 135} onChange={(e) => {
                            const angle = parseInt(e.target.value)
                            const colors = bg.gradientColors || ['#667eea', '#764ba2']
                            setBg({ ...bg, gradientAngle: angle, value: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})` })
                          }} className="w-full" style={{ accentColor: theme.colors.primary }} />
                        </div>
                        <div className="h-16 rounded-lg" style={{ background: bg.value }} />
                      </div>
                    )}
                    
                    {bg.type === 'image' && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input type="url" placeholder="https://..." value={bg.imageUrl || ''} onChange={(e) => setBg({ ...bg, imageUrl: e.target.value, value: e.target.value })} className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                          <motion.button onClick={() => imageInputRef.current?.click()} className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: theme.colors.primary, color: '#fff' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <FileUp size={16} />
                          </motion.button>
                          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}><span>Opacity</span><span>{Math.round((bg.imageOpacity ?? 1) * 100)}%</span></div>
                            <input type="range" min="0" max="100" value={(bg.imageOpacity ?? 1) * 100} onChange={(e) => setBg({ ...bg, imageOpacity: parseInt(e.target.value) / 100 })} className="w-full" style={{ accentColor: theme.colors.primary }} />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}><span>Blur</span><span>{bg.imageBlur ?? 0}px</span></div>
                            <input type="range" min="0" max="20" value={bg.imageBlur ?? 0} onChange={(e) => setBg({ ...bg, imageBlur: parseInt(e.target.value) })} className="w-full" style={{ accentColor: theme.colors.primary }} />
                          </div>
                        </div>
                        {bg.imageUrl && <div className="h-24 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${bg.imageUrl})`, opacity: bg.imageOpacity ?? 1, filter: bg.imageBlur ? `blur(${bg.imageBlur}px)` : undefined }} />}
                      </div>
                    )}
                    
                    {bg.type === 'video' && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input type="url" placeholder="https://..." value={bg.videoUrl || ''} onChange={(e) => setBg({ ...bg, videoUrl: e.target.value, value: e.target.value })} className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                          <motion.button onClick={() => videoInputRef.current?.click()} className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: theme.colors.primary, color: '#fff' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <FileUp size={16} />
                          </motion.button>
                          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: theme.colors.foreground }}>
                            <input type="checkbox" checked={bg.videoLoop ?? true} onChange={(e) => setBg({ ...bg, videoLoop: e.target.checked })} className="rounded" style={{ accentColor: theme.colors.primary }} /> Loop
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: theme.colors.foreground }}>
                            <input type="checkbox" checked={bg.videoMuted ?? true} onChange={(e) => setBg({ ...bg, videoMuted: e.target.checked })} className="rounded" style={{ accentColor: theme.colors.primary }} /> Muted
                          </label>
                        </div>
                        <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>MP4, WebM, MOV supported</p>
                      </div>
                    )}
                    
                    {bg.type === 'animated' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {ANIMATED_PRESETS.map((p) => (
                            <motion.button key={p.id} onClick={() => setBg({ ...bg, animatedPreset: p.id, value: p.id })} className="p-2.5 rounded-lg text-left text-xs" style={{ background: bg.animatedPreset === p.id ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary, border: `2px solid ${bg.animatedPreset === p.id ? theme.colors.primary : 'transparent'}` }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <p className="font-medium" style={{ color: theme.colors.foreground }}>{p.name}</p>
                              <p className="truncate" style={{ color: theme.colors.foregroundMuted }}>{p.description}</p>
                            </motion.button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs mb-1.5" style={{ color: theme.colors.foregroundMuted }}>Speed</p>
                            <div className="flex gap-1">
                              {(['slow', 'normal', 'fast'] as const).map((s) => (
                                <button key={s} onClick={() => setBg({ ...bg, animatedSpeed: s })} className="flex-1 py-1.5 rounded text-xs capitalize" style={{ background: bg.animatedSpeed === s ? theme.colors.primary : theme.colors.backgroundSecondary, color: bg.animatedSpeed === s ? '#fff' : theme.colors.foreground }}>{s}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs mb-1.5" style={{ color: theme.colors.foregroundMuted }}>Intensity</p>
                            <div className="flex gap-1">
                              {(['subtle', 'normal', 'intense'] as const).map((i) => (
                                <button key={i} onClick={() => setBg({ ...bg, animatedIntensity: i })} className="flex-1 py-1.5 rounded text-xs capitalize" style={{ background: bg.animatedIntensity === i ? theme.colors.primary : theme.colors.backgroundSecondary, color: bg.animatedIntensity === i ? '#fff' : theme.colors.foreground }}>{i}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'layout' && (
                <motion.div key="layout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Card</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}><span>Spacing</span><span>{layout.cardSpacing}px</span></div>
                        <input type="range" min="4" max="32" value={layout.cardSpacing} onChange={(e) => setLayout({ ...layout, cardSpacing: parseInt(e.target.value) })} className="w-full" style={{ accentColor: theme.colors.primary }} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}><span>Radius</span><span>{layout.cardBorderRadius}px</span></div>
                        <input type="range" min="0" max="32" value={layout.cardBorderRadius} onChange={(e) => setLayout({ ...layout, cardBorderRadius: parseInt(e.target.value) })} className="w-full" style={{ accentColor: theme.colors.primary }} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1" style={{ color: theme.colors.foregroundMuted }}><span>Padding</span><span>{layout.cardPadding}px</span></div>
                        <input type="range" min="8" max="32" value={layout.cardPadding} onChange={(e) => setLayout({ ...layout, cardPadding: parseInt(e.target.value) })} className="w-full" style={{ accentColor: theme.colors.primary }} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Shadow</p>
                    <div className="grid grid-cols-5 gap-2">
                      {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
                        <button key={s} onClick={() => setLayout({ ...layout, cardShadow: s })} className="py-2 rounded-lg text-xs capitalize" style={{ background: layout.cardShadow === s ? theme.colors.primary : theme.colors.backgroundSecondary, color: layout.cardShadow === s ? '#fff' : theme.colors.foreground }}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Link Style</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(['default', 'minimal', 'bold', 'glass'] as const).map((s) => (
                        <button key={s} onClick={() => setLayout({ ...layout, linkStyle: s })} className="py-2 rounded-lg text-xs capitalize" style={{ background: layout.linkStyle === s ? theme.colors.primary : theme.colors.backgroundSecondary, color: layout.linkStyle === s ? '#fff' : theme.colors.foreground }}>{s}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'css' && (
                <motion.div key="css" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Custom CSS</p>
                    <textarea value={css} onChange={(e) => setCss(e.target.value)} placeholder=".bio-card { ... }" rows={12} className="w-full px-3 py-2 rounded-lg text-sm font-mono resize-none" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'animations' && (
                <motion.div key="anim" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Enable</p>
                      <button onClick={() => setAnim({ ...anim, enabled: !anim.enabled })} className="w-10 h-5 rounded-full relative" style={{ background: anim.enabled ? '#22c55e' : theme.colors.backgroundSecondary }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: anim.enabled ? '22px' : '2px' }} />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, opacity: anim.enabled ? 1 : 0.5 }}>
                    <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Avatar</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['none', 'pulse', 'glow', 'bounce', 'rotate', 'shake'] as const).map((a) => (
                        <button key={a} onClick={() => setAnim({ ...anim, avatarAnimation: a })} disabled={!anim.enabled} className="py-2 rounded-lg text-xs capitalize disabled:cursor-not-allowed" style={{ background: anim.avatarAnimation === a ? theme.colors.primary : theme.colors.backgroundSecondary, color: anim.avatarAnimation === a ? '#fff' : theme.colors.foreground }}>{a}</button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, opacity: anim.enabled ? 1 : 0.5 }}>
                    <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Link Hover</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['none', 'scale', 'glow', 'slide', 'shake', 'flip'] as const).map((e) => (
                        <button key={e} onClick={() => setAnim({ ...anim, linkHoverEffect: e })} disabled={!anim.enabled} className="py-2 rounded-lg text-xs capitalize disabled:cursor-not-allowed" style={{ background: anim.linkHoverEffect === e ? theme.colors.primary : theme.colors.backgroundSecondary, color: anim.linkHoverEffect === e ? '#fff' : theme.colors.foreground }}>{e}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'fonts' && (
                <motion.div key="fonts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Add Custom Font</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <input type="text" placeholder="Font name" value={newFontName} onChange={(e) => setNewFontName(e.target.value)} className="px-3 py-2 rounded-lg text-xs" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                      <input type="url" placeholder="Google Fonts URL" value={newFontUrl} onChange={(e) => setNewFontUrl(e.target.value)} className="px-3 py-2 rounded-lg text-xs" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                      <select value={newFontType} onChange={(e) => setNewFontType(e.target.value as 'display' | 'body')} className="px-3 py-2 rounded-lg text-xs" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}>
                        <option value="display">Display</option>
                        <option value="body">Body</option>
                      </select>
                    </div>
                    <motion.button onClick={() => { if (newFontName && newFontUrl) { addFont({ data: { id: crypto.randomUUID(), name: newFontName, url: newFontUrl, type: newFontType } }).then(() => { setNewFontName(''); setNewFontUrl(''); toast.success('Font added!'); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] }) }).catch(() => toast.error('Failed to add font')) }}} disabled={!newFontName || !newFontUrl || fonts.length >= 4} className="w-full py-2 rounded-lg text-xs font-medium disabled:opacity-50" style={{ background: theme.colors.primary, color: '#fff' }} whileHover={{ scale: newFontName && newFontUrl && fonts.length < 4 ? 1.02 : 1 }} whileTap={{ scale: 0.98 }}>
                      <Plus size={14} className="inline mr-1" />Add Font ({fonts.length}/4)
                    </motion.button>
                  </div>
                  {fonts.length > 0 && (
                    <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                      <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>Your Fonts</p>
                      <div className="space-y-2">
                        {fonts.map((font) => (
                          <div key={font.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: theme.colors.backgroundSecondary }}>
                            <div>
                              <p className="text-xs font-medium" style={{ color: theme.colors.foreground }}>{font.name}</p>
                              <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{font.type}</p>
                            </div>
                            <motion.button onClick={() => removeFont({ data: { fontId: font.id } }).then(() => { toast.success('Font removed'); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] }) }).catch(() => toast.error('Failed'))} className="p-1 rounded" style={{ color: '#ef4444' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Trash2 size={12} />
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'opengraph' && (
                <motion.div key="og" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Custom Open Graph</p>
                      <button onClick={() => setOg({ ...og, useCustom: !og.useCustom })} className="w-10 h-5 rounded-full relative" style={{ background: og.useCustom ? '#3b82f6' : theme.colors.backgroundSecondary }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: og.useCustom ? '22px' : '2px' }} />
                      </button>
                    </div>
                    <div className="space-y-3" style={{ opacity: og.useCustom ? 1 : 0.5 }}>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Title</label>
                        <input type="text" placeholder="Custom title" value={og.title || ''} onChange={(e) => setOg({ ...og, title: e.target.value })} disabled={!og.useCustom} className="w-full px-3 py-2 rounded-lg text-xs" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Description</label>
                        <textarea placeholder="Custom description" value={og.description || ''} onChange={(e) => setOg({ ...og, description: e.target.value })} disabled={!og.useCustom} rows={2} className="w-full px-3 py-2 rounded-lg text-xs resize-none" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: theme.colors.foregroundMuted }}>Image URL</label>
                        <input type="url" placeholder="https://..." value={og.image || ''} onChange={(e) => setOg({ ...og, image: e.target.value })} disabled={!og.useCustom} className="w-full px-3 py-2 rounded-lg text-xs" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                      </div>
                      {og.image && <img src={og.image} alt="OG Preview" className="w-full h-20 object-cover rounded-lg" />}
                    </div>
                    <motion.button onClick={() => updateOG({ data: og }).then(() => { toast.success('Open Graph saved!'); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] }) }).catch(() => toast.error('Failed'))} className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: '#3b82f6', color: '#fff' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Save Open Graph
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {myTemplates && myTemplates.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                <p className="text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>My Templates</p>
                <div className="space-y-2">
                  {myTemplates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: theme.colors.backgroundSecondary }}>
                      <div className="flex items-center gap-2">
                        {t.isPublic ? <Globe size={14} style={{ color: '#22c55e' }} /> : <Lock size={14} style={{ color: theme.colors.foregroundMuted }} />}
                        <span className="text-sm" style={{ color: theme.colors.foreground }}>{t.name}</span>
                        <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{t.uses || 0} uses</span>
                      </div>
                      <motion.button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 rounded" style={{ color: '#ef4444' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
          
          {showPreview && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
              <div className="rounded-xl overflow-hidden flex-1 flex flex-col" style={{ border: `1px solid ${theme.colors.border}` }}>
                <div className="flex items-center justify-between p-2 shrink-0" style={{ background: theme.colors.card }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Preview</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setPreviewDevice('desktop')} className="p-1 rounded" style={{ background: previewDevice === 'desktop' ? theme.colors.primary : 'transparent' }}>
                      <Monitor size={12} style={{ color: previewDevice === 'desktop' ? '#fff' : theme.colors.foregroundMuted }} />
                    </button>
                    <button onClick={() => setPreviewDevice('mobile')} className="p-1 rounded" style={{ background: previewDevice === 'mobile' ? theme.colors.primary : 'transparent' }}>
                      <Smartphone size={12} style={{ color: previewDevice === 'mobile' ? '#fff' : theme.colors.foregroundMuted }} />
                    </button>
                  </div>
                </div>
                <div className={`relative overflow-hidden flex-1 ${previewDevice === 'mobile' ? 'max-w-[280px] mx-auto' : ''}`} style={{ ...getBgStyle() }}>
                  {renderBgPreview()}
                  {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
                  <div className="relative z-10 p-5 flex flex-col items-center">
                    <motion.div className={`w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-pink-500 mb-3 ${anim.enabled && anim.avatarAnimation === 'pulse' ? 'animate-pulse' : ''}`} animate={anim.enabled && anim.avatarAnimation === 'bounce' ? { y: [0, -8, 0] } : {}} transition={{ repeat: Infinity, duration: 1 }} />
                    <h2 className="text-lg font-bold text-white mb-0.5">{currentUser?.name || currentUser?.username || 'Username'}</h2>
                    <p className="text-xs text-white/60 mb-5">{currentUser?.profile?.bio || 'Bio description'}</p>
                    <div className="w-full space-y-2">
                      {['Link 1', 'Link 2', 'Link 3'].map((linkTitle, i) => (
                        <motion.div key={i} className="bio-card w-full py-2.5 px-3 text-center text-white text-sm font-medium" style={{ borderRadius: `${layout.cardBorderRadius}px`, padding: `${layout.cardPadding}px`, background: layout.linkStyle === 'glass' ? 'rgba(255,255,255,0.1)' : layout.linkStyle === 'bold' ? theme.colors.primary : 'rgba(255,255,255,0.05)', backdropFilter: layout.linkStyle === 'glass' ? 'blur(10px)' : undefined, border: layout.linkStyle === 'minimal' ? '1px solid rgba(255,255,255,0.2)' : undefined, boxShadow: layout.cardShadow !== 'none' ? `0 ${layout.cardShadow === 'sm' ? '1' : layout.cardShadow === 'md' ? '4' : layout.cardShadow === 'lg' ? '10' : '20'}px ${layout.cardShadow === 'sm' ? '2' : layout.cardShadow === 'md' ? '6' : layout.cardShadow === 'lg' ? '15' : '25'}px rgba(0,0,0,0.15)` : undefined, marginBottom: `${layout.cardSpacing}px` }} whileHover={anim.enabled ? { scale: anim.linkHoverEffect === 'scale' ? 1.03 : 1, x: anim.linkHoverEffect === 'slide' ? 8 : 0 } : {}}>
                          {linkTitle}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showPublish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowPublish(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-md rounded-xl p-5" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: theme.colors.foreground }}>Publish Template</h2>
                <motion.button onClick={() => setShowPublish(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><X size={20} style={{ color: theme.colors.foregroundMuted }} /></motion.button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1.5" style={{ color: theme.colors.foreground }}>Name</p>
                  <input type="text" value={publishName} onChange={(e) => setPublishName(e.target.value)} placeholder="My Template" className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }} />
                </div>
                <div>
                  <p className="text-sm mb-1.5" style={{ color: theme.colors.foreground }}>Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => setPublishCategory(c.id)} className="px-2.5 py-1 rounded text-xs" style={{ background: publishCategory === c.id ? theme.colors.primary : theme.colors.backgroundSecondary, color: publishCategory === c.id ? '#fff' : theme.colors.foreground }}>{c.label}</button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={publishPublic} onChange={(e) => setPublishPublic(e.target.checked)} className="rounded" style={{ accentColor: theme.colors.primary }} />
                  <span className="text-sm" style={{ color: theme.colors.foreground }}>Public</span>
                </label>
                <motion.button onClick={() => publishMutation.mutate()} disabled={!publishName || publishMutation.isPending} className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  {publishMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Publish
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
