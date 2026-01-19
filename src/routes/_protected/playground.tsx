import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMyLinksFn } from '@/server/functions/links'
import { getProfileSettingsFn, updateCustomBackgroundFn, updateLayoutSettingsFn, updateThemeFn, createProfileBackupFn, restoreProfileBackupFn, deleteProfileBackupFn } from '@/server/functions/profile-settings'
import { getCreatorSettingsFn, updateCustomCSSFn, addCustomFontFn, removeCustomFontFn, updateAnimatedProfileFn, updateOpenGraphFn } from '@/server/functions/creator-features'
import { ANIMATED_PRESETS } from '@/components/backgrounds/AnimatedBackgrounds'
import type { CustomBackground, LayoutSettings, AnimatedProfileSettings, OpenGraphSettings, CustomFont } from '@/server/db/schema'
import {
  Palette, Sparkles, Monitor, Smartphone, Save, Undo2, ExternalLink, Loader2, Check,
  Wand2, Crown, Lock, Code, Type, Share2, ImageIcon, Sliders, Trash2, Info, RotateCcw,
  History, Upload, Plus, Clock,
} from 'lucide-react'
import { SiX, SiInstagram, SiYoutube, SiTwitch, SiGithub, SiTiktok, SiDiscord } from 'react-icons/si'

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

// Constants
const THEME_PRESETS = [
  { id: 'midnight', name: 'Midnight', bg: '#0a0a0f', card: '#12121a', accent: '#6366f1', text: '#ffffff' },
  { id: 'ocean', name: 'Ocean', bg: '#0c1929', card: '#132f4c', accent: '#0ea5e9', text: '#ffffff' },
  { id: 'forest', name: 'Forest', bg: '#0d1f0d', card: '#1a3a1a', accent: '#22c55e', text: '#ffffff' },
  { id: 'sunset', name: 'Sunset', bg: '#1a0a0a', card: '#2d1515', accent: '#f97316', text: '#ffffff' },
  { id: 'lavender', name: 'Lavender', bg: '#1a1625', card: '#2d2640', accent: '#a855f7', text: '#ffffff' },
  { id: 'rose', name: 'Rose', bg: '#1a0f14', card: '#2d1a24', accent: '#ec4899', text: '#ffffff' },
  { id: 'minimal', name: 'Minimal', bg: '#ffffff', card: '#f8f9fa', accent: '#171717', text: '#171717' },
  { id: 'cream', name: 'Cream', bg: '#faf8f5', card: '#f5f0e8', accent: '#8b7355', text: '#2d2a26' },
]

const ACCENT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6']

const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Default', desc: 'Balanced spacing' },
  { value: 'compact', label: 'Compact', desc: 'Tighter layout' },
  { value: 'expanded', label: 'Expanded', desc: 'More breathing room' },
]

const LINK_STYLE_OPTIONS = [
  { value: 'default', label: 'Default', desc: 'Classic look' },
  { value: 'minimal', label: 'Minimal', desc: 'Clean borders' },
  { value: 'bold', label: 'Bold', desc: 'Accent background' },
  { value: 'glass', label: 'Glass', desc: 'Frosted effect' },
]

const SHADOW_OPTIONS = [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Subtle' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Dramatic' }]

const AVATAR_ANIMATIONS = [{ value: 'none', label: 'None' }, { value: 'pulse', label: 'Pulse' }, { value: 'glow', label: 'Glow' }, { value: 'bounce', label: 'Bounce' }, { value: 'rotate', label: 'Rotate' }, { value: 'shake', label: 'Shake' }]
const BANNER_ANIMATIONS = [{ value: 'none', label: 'None' }, { value: 'parallax', label: 'Parallax' }, { value: 'gradient-shift', label: 'Gradient Shift' }, { value: 'particles', label: 'Particles' }]
const LINK_HOVER_EFFECTS = [{ value: 'none', label: 'None' }, { value: 'scale', label: 'Scale' }, { value: 'glow', label: 'Glow' }, { value: 'slide', label: 'Slide' }, { value: 'shake', label: 'Shake' }, { value: 'flip', label: 'Flip' }]
const PAGE_TRANSITIONS = [{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Slide' }, { value: 'zoom', label: 'Zoom' }]

const PRESET_FONTS = [
  { name: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', category: 'sans-serif' },
  { name: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap', category: 'sans-serif' },
  { name: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap', category: 'sans-serif' },
  { name: 'JetBrains Mono', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap', category: 'mono' },
  { name: 'Bebas Neue', url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap', category: 'display' },
  { name: 'Orbitron', url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap', category: 'display' },
]

const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  twitter: SiX, instagram: SiInstagram, youtube: SiYoutube, twitch: SiTwitch, github: SiGithub, tiktok: SiTiktok, discord: SiDiscord,
}

type TabId = 'theme' | 'background' | 'layout' | 'animations' | 'fonts' | 'css' | 'opengraph' | 'backups'
const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }>; tier: 'free' | 'pro' | 'creator' }[] = [
  { id: 'theme', label: 'Theme', icon: Palette, tier: 'free' },
  { id: 'background', label: 'Background', icon: ImageIcon, tier: 'pro' },
  { id: 'layout', label: 'Layout', icon: Sliders, tier: 'pro' },
  { id: 'backups', label: 'Backups', icon: History, tier: 'pro' },
  { id: 'animations', label: 'Animations', icon: Sparkles, tier: 'creator' },
  { id: 'fonts', label: 'Fonts', icon: Type, tier: 'creator' },
  { id: 'css', label: 'CSS', icon: Code, tier: 'creator' },
  { id: 'opengraph', label: 'Social', icon: Share2, tier: 'creator' },
]

const DEFAULT_LAYOUT: LayoutSettings = { cardSpacing: 12, cardBorderRadius: 16, cardShadow: 'md', cardPadding: 16, profileLayout: 'default', linkStyle: 'default' }
const DEFAULT_ANIMATED: AnimatedProfileSettings = { enabled: false, avatarAnimation: 'none', bannerAnimation: 'none', linkHoverEffect: 'none', pageTransition: 'none' }
const DEFAULT_OG: OpenGraphSettings = { useCustom: false, title: '', description: '', image: '' }

function PlaygroundPage() {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  
  const getMyLinks = useServerFn(getMyLinksFn)
  const getProfileSettings = useServerFn(getProfileSettingsFn)
  const getCreatorSettings = useServerFn(getCreatorSettingsFn)
  const updateTheme = useServerFn(updateThemeFn)
  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)
  const updateCSS = useServerFn(updateCustomCSSFn)
  const addFont = useServerFn(addCustomFontFn)
  const removeFont = useServerFn(removeCustomFontFn)
  const updateAnimated = useServerFn(updateAnimatedProfileFn)
  const updateOG = useServerFn(updateOpenGraphFn)
  const createBackup = useServerFn(createProfileBackupFn)
  const restoreBackup = useServerFn(restoreProfileBackupFn)
  const deleteBackup = useServerFn(deleteProfileBackupFn)
  
  const [activeTab, setActiveTab] = useState<TabId>('theme')
  const [backupName, setBackupName] = useState('')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [hasChanges, setHasChanges] = useState(false)
  const [themePreset, setThemePreset] = useState('midnight')
  const [accentColor, setAccentColor] = useState('#6366f1')
  const [localBackground, setLocalBackground] = useState<CustomBackground | null>(null)
  const [localLayout, setLocalLayout] = useState<LayoutSettings>(DEFAULT_LAYOUT)
  const [cssInput, setCssInput] = useState('')
  const [cssErrors, setCssErrors] = useState<string[]>([])
  const [localAnimated, setLocalAnimated] = useState<AnimatedProfileSettings>(DEFAULT_ANIMATED)
  const [localOG, setLocalOG] = useState<OpenGraphSettings>(DEFAULT_OG)
  
  const { data: links = [] } = useQuery({ queryKey: ['my-links'], queryFn: () => getMyLinks() })
  const { data: profileSettings, isLoading: loadingProfile } = useQuery({ queryKey: ['profile-settings'], queryFn: () => getProfileSettings() })
  const { data: creatorSettings, isLoading: loadingCreator } = useQuery({ queryKey: ['creatorSettings'], queryFn: () => getCreatorSettings() })
  
  useEffect(() => {
    if (profileSettings) {
      if (profileSettings.themeId) setThemePreset(profileSettings.themeId)
      if (profileSettings.accentColor) setAccentColor(profileSettings.accentColor)
      if (profileSettings.customBackground) setLocalBackground(profileSettings.customBackground)
      if (profileSettings.layoutSettings) setLocalLayout(profileSettings.layoutSettings)
    }
  }, [profileSettings])
  
  useEffect(() => {
    if (creatorSettings) {
      if (creatorSettings.customCSS) setCssInput(creatorSettings.customCSS)
      if (creatorSettings.animatedProfile) setLocalAnimated(creatorSettings.animatedProfile)
      if (creatorSettings.openGraphSettings) setLocalOG(creatorSettings.openGraphSettings)
    }
  }, [creatorSettings])
  
  const tier = profileSettings?.tier || 'free'
  const canPro = ['pro', 'creator', 'lifetime'].includes(tier)
  const canCreator = ['creator', 'lifetime'].includes(tier)
  
  const themeMutation = useMutation({
    mutationFn: () => updateTheme({ data: { themeId: themePreset, accentColor } }),
    onSuccess: () => { toast.success('Theme saved!'); setHasChanges(false); void queryClient.invalidateQueries({ queryKey: ['profile-settings'] }) },
    onError: () => toast.error('Failed to save theme'),
  })
  
  const backgroundMutation = useMutation({
    mutationFn: (bg: CustomBackground | null) => updateBackground({ data: bg }),
    onSuccess: () => { toast.success('Background saved!'); setHasChanges(false); void queryClient.invalidateQueries({ queryKey: ['profile-settings'] }) },
    onError: () => toast.error('Failed to save background'),
  })
  
  const layoutMutation = useMutation({
    mutationFn: (layout: Partial<LayoutSettings>) => updateLayout({ data: layout }),
    onSuccess: () => { toast.success('Layout saved!'); setHasChanges(false); void queryClient.invalidateQueries({ queryKey: ['profile-settings'] }) },
    onError: () => toast.error('Failed to save layout'),
  })
  
  const cssMutation = useMutation({
    mutationFn: (css: string) => updateCSS({ data: { css } }),
    onSuccess: (result) => {
      if (result.errors?.length) { setCssErrors(result.errors); toast.warning('CSS saved with warnings') }
      else { setCssErrors([]); toast.success('CSS saved!') }
      setHasChanges(false); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
    onError: () => toast.error('Failed to save CSS'),
  })
  
  const fontMutation = useMutation({
    mutationFn: (font: { name: string; url: string; type: 'display' | 'body' }) => addFont({ data: { id: crypto.randomUUID(), ...font } }),
    onSuccess: () => { toast.success('Font added!'); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] }) },
    onError: () => toast.error('Failed to add font'),
  })
  
  const removeFontMutation = useMutation({
    mutationFn: (fontId: string) => removeFont({ data: { fontId } }),
    onSuccess: () => { toast.success('Font removed'); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] }) },
    onError: () => toast.error('Failed to remove font'),
  })
  
  const animatedMutation = useMutation({
    mutationFn: (data: AnimatedProfileSettings) => updateAnimated({ data }),
    onSuccess: () => { toast.success('Animations saved!'); setHasChanges(false); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] }) },
    onError: () => toast.error('Failed to save animations'),
  })
  
  const ogMutation = useMutation({
    mutationFn: (data: OpenGraphSettings) => updateOG({ data }),
    onSuccess: () => { toast.success('Social preview saved!'); setHasChanges(false); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] }) },
    onError: () => toast.error('Failed to save'),
  })
  
  const backupMutation = useMutation({
    mutationFn: (name: string) => createBackup({ data: { name } }),
    onSuccess: () => { toast.success('Backup created!'); setBackupName(''); void queryClient.invalidateQueries({ queryKey: ['profile-settings'] }) },
    onError: () => toast.error('Failed to create backup'),
  })
  
  const restoreMutation = useMutation({
    mutationFn: (backupId: string) => restoreBackup({ data: { backupId } }),
    onSuccess: () => { toast.success('Backup restored!'); void queryClient.invalidateQueries({ queryKey: ['profile-settings'] }); void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] }) },
    onError: () => toast.error('Failed to restore backup'),
  })
  
  const deleteMutation = useMutation({
    mutationFn: (backupId: string) => deleteBackup({ data: { backupId } }),
    onSuccess: () => { toast.success('Backup deleted'); void queryClient.invalidateQueries({ queryKey: ['profile-settings'] }) },
    onError: () => toast.error('Failed to delete backup'),
  })
  
  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId)
    if (preset) { setThemePreset(presetId); setAccentColor(preset.accent); setHasChanges(true) }
  }
  
  const getColors = () => {
    const preset = THEME_PRESETS.find(p => p.id === themePreset)
    return {
      bg: localBackground?.type === 'solid' ? localBackground.value : preset?.bg || '#0a0a0f',
      card: preset?.card || '#12121a',
      text: preset?.text || '#ffffff',
      accent: accentColor,
    }
  }
  
  const colors = getColors()
  const profile = currentUser?.profile
  const socials = (profile?.socials as Record<string, string>) || {}
  const customFonts = (creatorSettings?.customFonts || []) as CustomFont[]
  const isLoading = loadingProfile || loadingCreator
  
  if (!currentUser || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} /></div>
  }

  const canAccessTab = (tabTier: 'free' | 'pro' | 'creator') => tabTier === 'free' || (tabTier === 'pro' && canPro) || (tabTier === 'creator' && canCreator)

  const handleSave = () => {
    if (activeTab === 'theme') themeMutation.mutate()
    else if (activeTab === 'background') backgroundMutation.mutate(localBackground)
    else if (activeTab === 'layout') layoutMutation.mutate(localLayout)
    else if (activeTab === 'css') cssMutation.mutate(cssInput)
    else if (activeTab === 'animations') animatedMutation.mutate(localAnimated)
    else if (activeTab === 'opengraph') ogMutation.mutate(localOG)
  }

  const isSaving = themeMutation.isPending || backgroundMutation.isPending || layoutMutation.isPending || cssMutation.isPending || animatedMutation.isPending || ogMutation.isPending

  return (
    <div className="min-h-screen pt-28 pb-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div className="absolute top-40 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: `${accentColor}10` }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `${accentColor}08` }} animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 15, repeat: Infinity }} />
      </div>
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}, var(--accent))`, boxShadow: `0 20px 40px ${accentColor}40` }}>
            <Wand2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Playground</h1>
          <p className="text-lg max-w-2xl mx-auto mb-6" style={{ color: 'var(--foreground-muted)' }}>
            Customize every aspect of your bio page with live preview. Change themes, backgrounds, layouts, animations, and more.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: tier === 'free' ? 'var(--background-secondary)' : tier === 'pro' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #ec4899, #f97316)', color: tier === 'free' ? 'var(--foreground-muted)' : '#fff' }}>
            <Crown size={16} />
            {tier === 'free' ? 'Free' : tier === 'pro' ? 'Pro' : tier === 'creator' ? 'Creator' : 'Lifetime'}
            {tier === 'free' && <Link to="/profile" search={{ tab: 'subscription' }} className="ml-2 underline">Upgrade</Link>}
          </div>
        </motion.div>
      </div>
      
      {/* Action Bar */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
            <button onClick={() => setPreviewMode('desktop')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: previewMode === 'desktop' ? 'var(--card)' : 'transparent', color: previewMode === 'desktop' ? 'var(--foreground)' : 'var(--foreground-muted)' }}>
              <Monitor size={16} />Desktop
            </button>
            <button onClick={() => setPreviewMode('mobile')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: previewMode === 'mobile' ? 'var(--card)' : 'transparent', color: previewMode === 'mobile' ? 'var(--foreground)' : 'var(--foreground-muted)' }}>
              <Smartphone size={16} />Mobile
            </button>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}>
                <Undo2 size={16} />Reset
              </motion.button>
            )}
            <motion.button onClick={handleSave} disabled={!hasChanges || isSaving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: hasChanges ? accentColor : 'var(--background-secondary)' }} whileHover={{ scale: hasChanges ? 1.02 : 1 }} whileTap={{ scale: hasChanges ? 0.98 : 1 }}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Save Changes
            </motion.button>
            <Link to="/$username" params={{ username: currentUser.username }} target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}>
              <ExternalLink size={16} />View Live
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-96 shrink-0">
            <div className="rounded-2xl overflow-hidden lg:sticky lg:top-24" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {/* Tabs */}
              <div className="flex flex-wrap border-b p-2 gap-1" style={{ borderColor: 'var(--border)' }}>
                {TABS.map((tab) => {
                  const accessible = canAccessTab(tab.tier)
                  return (
                    <button key={tab.id} onClick={() => accessible && setActiveTab(tab.id)} disabled={!accessible} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all" style={{ background: activeTab === tab.id ? accentColor : 'transparent', color: activeTab === tab.id ? '#fff' : 'var(--foreground-muted)', opacity: accessible ? 1 : 0.5 }}>
                      <tab.icon size={14} />{tab.label}{!accessible && <Lock size={10} />}
                    </button>
                  )
                })}
              </div>
              
              {/* Tab Content */}
              <div className="p-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Theme Tab */}
                  {activeTab === 'theme' && (
                    <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Theme Presets</label>
                        <div className="grid grid-cols-4 gap-2">
                          {THEME_PRESETS.map((preset) => (
                            <button key={preset.id} onClick={() => { applyPreset(preset.id); setHasChanges(true) }} className="relative aspect-square rounded-xl overflow-hidden transition-transform hover:scale-105" style={{ background: preset.bg, outline: themePreset === preset.id ? `2px solid ${accentColor}` : 'none', outlineOffset: '2px' }} title={preset.name}>
                              <div className="absolute bottom-1 left-1 right-1 h-2 rounded" style={{ background: preset.accent }} />
                              {themePreset === preset.id && <div className="absolute inset-0 flex items-center justify-center"><Check size={16} style={{ color: preset.accent }} /></div>}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Accent Color</label>
                        <div className="grid grid-cols-7 gap-2">
                          {ACCENT_COLORS.map((color) => (
                            <button key={color} onClick={() => { setAccentColor(color); setHasChanges(true) }} className="w-8 h-8 rounded-full transition-transform hover:scale-110" style={{ background: color, outline: accentColor === color ? `2px solid ${color}` : 'none', outlineOffset: '2px' }} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Background Tab */}
                  {activeTab === 'background' && canPro && (
                    <motion.div key="background" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Background Type</label>
                        <div className="grid grid-cols-5 gap-2">
                          {(['solid', 'gradient', 'image', 'video', 'animated'] as const).map((type) => (
                            <button key={type} onClick={() => { setLocalBackground({ type, value: type === 'solid' ? '#1a1a2e' : '', gradientColors: type === 'gradient' ? ['#667eea', '#764ba2'] : undefined, gradientAngle: type === 'gradient' ? 135 : undefined, animatedPreset: type === 'animated' ? 'particles' : undefined, animatedSpeed: type === 'animated' ? 'normal' : undefined, animatedIntensity: type === 'animated' ? 'normal' : undefined }); setHasChanges(true) }} className="p-2 rounded-lg text-center text-xs font-medium capitalize" style={{ background: localBackground?.type === type ? `${accentColor}20` : 'var(--background-secondary)', outline: localBackground?.type === type ? `2px solid ${accentColor}` : 'none' }}>
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      {localBackground?.type === 'solid' && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Color</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={localBackground.value || '#1a1a2e'} onChange={(e) => { setLocalBackground({ ...localBackground, value: e.target.value }); setHasChanges(true) }} className="w-12 h-12 rounded-xl cursor-pointer border-0" />
                            <input type="text" value={localBackground.value || '#1a1a2e'} onChange={(e) => { setLocalBackground({ ...localBackground, value: e.target.value }); setHasChanges(true) }} className="flex-1 px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} />
                          </div>
                        </div>
                      )}
                      {localBackground?.type === 'gradient' && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Gradient</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={localBackground.gradientColors?.[0] || '#667eea'} onChange={(e) => { const c = [e.target.value, localBackground.gradientColors?.[1] || '#764ba2']; setLocalBackground({ ...localBackground, gradientColors: c, value: `linear-gradient(${localBackground.gradientAngle || 135}deg, ${c[0]}, ${c[1]})` }); setHasChanges(true) }} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                            <input type="color" value={localBackground.gradientColors?.[1] || '#764ba2'} onChange={(e) => { const c = [localBackground.gradientColors?.[0] || '#667eea', e.target.value]; setLocalBackground({ ...localBackground, gradientColors: c, value: `linear-gradient(${localBackground.gradientAngle || 135}deg, ${c[0]}, ${c[1]})` }); setHasChanges(true) }} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                            <div className="flex-1">
                              <label className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Angle: {localBackground.gradientAngle || 135}°</label>
                              <input type="range" min="0" max="360" value={localBackground.gradientAngle || 135} onChange={(e) => { const a = parseInt(e.target.value); setLocalBackground({ ...localBackground, gradientAngle: a, value: `linear-gradient(${a}deg, ${localBackground.gradientColors?.[0] || '#667eea'}, ${localBackground.gradientColors?.[1] || '#764ba2'})` }); setHasChanges(true) }} className="w-full" />
                            </div>
                          </div>
                          <div className="h-16 rounded-xl" style={{ background: localBackground.value }} />
                        </div>
                      )}
                      {localBackground?.type === 'image' && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Image URL</label>
                          <div className="flex items-center gap-2">
                            <input type="url" value={localBackground.value || ''} onChange={(e) => { setLocalBackground({ ...localBackground, value: e.target.value }); setHasChanges(true) }} placeholder="https://example.com/image.jpg" className="flex-1 px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} />
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                            <Upload size={14} style={{ color: '#6366f1' }} />
                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Paste an image URL or use a CDN link</p>
                          </div>
                          {localBackground.value && (
                            <div className="h-24 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${localBackground.value})` }} />
                          )}
                        </div>
                      )}
                      {localBackground?.type === 'video' && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Video URL</label>
                          <input type="url" value={localBackground.value || ''} onChange={(e) => { setLocalBackground({ ...localBackground, value: e.target.value }); setHasChanges(true) }} placeholder="https://example.com/video.mp4" className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} />
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={localBackground.videoLoop ?? true} onChange={(e) => { setLocalBackground({ ...localBackground, videoLoop: e.target.checked }); setHasChanges(true) }} className="rounded" />
                              <span className="text-xs" style={{ color: 'var(--foreground)' }}>Loop</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={localBackground.videoMuted ?? true} onChange={(e) => { setLocalBackground({ ...localBackground, videoMuted: e.target.checked }); setHasChanges(true) }} className="rounded" />
                              <span className="text-xs" style={{ color: 'var(--foreground)' }}>Muted</span>
                            </label>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                            <Info size={14} style={{ color: '#eab308' }} />
                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Use short, optimized videos for best performance</p>
                          </div>
                        </div>
                      )}
                      {localBackground?.type === 'animated' && (
                        <div className="space-y-4">
                          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Animation Preset</label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            {ANIMATED_PRESETS.map((preset) => (
                              <button key={preset.id} onClick={() => { setLocalBackground({ ...localBackground, animatedPreset: preset.id, value: preset.id }); setHasChanges(true) }} className="p-2 rounded-lg text-left" style={{ background: localBackground.animatedPreset === preset.id ? `${accentColor}20` : 'var(--background-secondary)', outline: localBackground.animatedPreset === preset.id ? `1px solid ${accentColor}` : 'none' }}>
                                <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{preset.name}</div>
                                <div className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>{preset.category}</div>
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Speed</label>
                              <select value={localBackground.animatedSpeed || 'normal'} onChange={(e) => { setLocalBackground({ ...localBackground, animatedSpeed: e.target.value as 'slow' | 'normal' | 'fast' }); setHasChanges(true) }} className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                                <option value="slow">Slow</option>
                                <option value="normal">Normal</option>
                                <option value="fast">Fast</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Intensity</label>
                              <select value={localBackground.animatedIntensity || 'normal'} onChange={(e) => { setLocalBackground({ ...localBackground, animatedIntensity: e.target.value as 'subtle' | 'normal' | 'intense' }); setHasChanges(true) }} className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                                <option value="subtle">Subtle</option>
                                <option value="normal">Normal</option>
                                <option value="intense">Intense</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                      <button onClick={() => { setLocalBackground(null); setHasChanges(true) }} className="w-full py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}>
                        <RotateCcw size={14} className="inline mr-2" />Reset to Default
                      </button>
                    </motion.div>
                  )}
                  
                  {/* Layout Tab */}
                  {activeTab === 'layout' && canPro && (
                    <motion.div key="layout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Profile Layout</label>
                        <div className="space-y-2">
                          {LAYOUT_OPTIONS.map((opt) => (
                            <button key={opt.value} onClick={() => { setLocalLayout({ ...localLayout, profileLayout: opt.value as LayoutSettings['profileLayout'] }); setHasChanges(true) }} className="w-full p-3 rounded-xl text-left" style={{ background: localLayout.profileLayout === opt.value ? `${accentColor}20` : 'var(--background-secondary)', outline: localLayout.profileLayout === opt.value ? `2px solid ${accentColor}` : 'none' }}>
                              <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{opt.label}</p>
                              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Link Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          {LINK_STYLE_OPTIONS.map((opt) => (
                            <button key={opt.value} onClick={() => { setLocalLayout({ ...localLayout, linkStyle: opt.value as LayoutSettings['linkStyle'] }); setHasChanges(true) }} className="p-3 rounded-xl text-left" style={{ background: localLayout.linkStyle === opt.value ? `${accentColor}20` : 'var(--background-secondary)', outline: localLayout.linkStyle === opt.value ? `2px solid ${accentColor}` : 'none' }}>
                              <p className="font-medium text-xs" style={{ color: 'var(--foreground)' }}>{opt.label}</p>
                              <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2"><label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Card Spacing</label><span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{localLayout.cardSpacing}px</span></div>
                          <input type="range" min="0" max="32" value={localLayout.cardSpacing} onChange={(e) => { setLocalLayout({ ...localLayout, cardSpacing: parseInt(e.target.value) }); setHasChanges(true) }} className="w-full" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2"><label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Card Padding</label><span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{localLayout.cardPadding}px</span></div>
                          <input type="range" min="8" max="32" value={localLayout.cardPadding} onChange={(e) => { setLocalLayout({ ...localLayout, cardPadding: parseInt(e.target.value) }); setHasChanges(true) }} className="w-full" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2"><label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Border Radius</label><span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{localLayout.cardBorderRadius}px</span></div>
                          <input type="range" min="0" max="32" value={localLayout.cardBorderRadius} onChange={(e) => { setLocalLayout({ ...localLayout, cardBorderRadius: parseInt(e.target.value) }); setHasChanges(true) }} className="w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Shadow</label>
                          <div className="flex gap-1">
                            {SHADOW_OPTIONS.map((opt) => (
                              <button key={opt.value} onClick={() => { setLocalLayout({ ...localLayout, cardShadow: opt.value as LayoutSettings['cardShadow'] }); setHasChanges(true) }} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: localLayout.cardShadow === opt.value ? accentColor : 'var(--background-secondary)', color: localLayout.cardShadow === opt.value ? '#fff' : 'var(--foreground)' }}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Backups Tab */}
                  {activeTab === 'backups' && canPro && (
                    <motion.div key="backups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <History size={16} style={{ color: '#6366f1' }} />
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Create backups to save your current profile settings</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Create New Backup</label>
                        <div className="flex gap-2">
                          <input type="text" value={backupName} onChange={(e) => setBackupName(e.target.value)} placeholder="Backup name..." className="flex-1 px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} />
                          <button onClick={() => backupName.trim() && backupMutation.mutate(backupName.trim())} disabled={!backupName.trim() || backupMutation.isPending} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: accentColor }}>
                            {backupMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                          </button>
                        </div>
                      </div>
                      {profileSettings?.profileBackups && profileSettings.profileBackups.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Your Backups ({profileSettings.profileBackups.length}/5)</label>
                          <div className="space-y-2">
                            {profileSettings.profileBackups.map((backup) => (
                              <div key={backup.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                                <div>
                                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{backup.name}</p>
                                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--foreground-muted)' }}>
                                    <Clock size={10} />
                                    {new Date(backup.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => restoreMutation.mutate(backup.id)} disabled={restoreMutation.isPending} className="p-2 rounded-lg text-xs font-medium" style={{ background: `${accentColor}20`, color: accentColor }}>
                                    {restoreMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                                  </button>
                                  <button onClick={() => deleteMutation.mutate(backup.id)} disabled={deleteMutation.isPending} className="p-2 rounded-lg hover:bg-red-500/10">
                                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(!profileSettings?.profileBackups || profileSettings.profileBackups.length === 0) && (
                        <div className="text-center py-6">
                          <History size={32} className="mx-auto mb-3" style={{ color: 'var(--foreground-muted)' }} />
                          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>No backups yet</p>
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Create your first backup above</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Animations Tab */}
                  {activeTab === 'animations' && canCreator && (
                    <motion.div key="animations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Enable Animations</span>
                        <button onClick={() => { setLocalAnimated({ ...localAnimated, enabled: !localAnimated.enabled }); setHasChanges(true) }} className="w-12 h-6 rounded-full relative transition-colors" style={{ background: localAnimated.enabled ? accentColor : 'var(--border)' }}>
                          <motion.div className="absolute top-1 w-4 h-4 rounded-full bg-white" animate={{ left: localAnimated.enabled ? 28 : 4 }} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Avatar</label><select value={localAnimated.avatarAnimation} onChange={(e) => { setLocalAnimated({ ...localAnimated, avatarAnimation: e.target.value as AnimatedProfileSettings['avatarAnimation'] }); setHasChanges(true) }} className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>{AVATAR_ANIMATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                        <div><label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Banner</label><select value={localAnimated.bannerAnimation} onChange={(e) => { setLocalAnimated({ ...localAnimated, bannerAnimation: e.target.value as AnimatedProfileSettings['bannerAnimation'] }); setHasChanges(true) }} className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>{BANNER_ANIMATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                        <div><label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Link Hover</label><select value={localAnimated.linkHoverEffect} onChange={(e) => { setLocalAnimated({ ...localAnimated, linkHoverEffect: e.target.value as AnimatedProfileSettings['linkHoverEffect'] }); setHasChanges(true) }} className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>{LINK_HOVER_EFFECTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                        <div><label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Page Transition</label><select value={localAnimated.pageTransition} onChange={(e) => { setLocalAnimated({ ...localAnimated, pageTransition: e.target.value as AnimatedProfileSettings['pageTransition'] }); setHasChanges(true) }} className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>{PAGE_TRANSITIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Fonts Tab */}
                  {activeTab === 'fonts' && canCreator && (
                    <motion.div key="fonts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Preset Fonts</label>
                        <div className="grid grid-cols-2 gap-2">
                          {PRESET_FONTS.map((font) => {
                            const isAdded = customFonts.some(cf => cf.name === font.name)
                            return (
                              <button key={font.name} onClick={() => !isAdded && customFonts.length < 4 && fontMutation.mutate({ name: font.name, url: font.url, type: font.category === 'display' ? 'display' : 'body' })} disabled={isAdded || fontMutation.isPending || customFonts.length >= 4} className="p-2 rounded-lg text-left disabled:opacity-50" style={{ background: isAdded ? `${accentColor}20` : 'var(--background-secondary)', outline: isAdded ? `1px solid ${accentColor}` : 'none' }}>
                                <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{font.name}</p>
                                <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>{font.category}</p>
                                {isAdded && <Check size={12} className="mt-1" style={{ color: accentColor }} />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      {customFonts.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>Your Fonts ({customFonts.length}/4)</label>
                          <div className="space-y-2">
                            {customFonts.map((font) => (
                              <div key={font.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                                <div><p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{font.name}</p><p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{font.type}</p></div>
                                <button onClick={() => removeFontMutation.mutate(font.id)} disabled={removeFontMutation.isPending} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 size={14} style={{ color: '#ef4444' }} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* CSS Tab */}
                  {activeTab === 'css' && canCreator && (
                    <motion.div key="css" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <Info size={16} style={{ color: '#6366f1' }} />
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>CSS is sandboxed for security.</p>
                      </div>
                      <textarea value={cssInput} onChange={(e) => { setCssInput(e.target.value); setHasChanges(true) }} placeholder="/* Your custom CSS */" className="w-full h-48 px-4 py-3 rounded-xl text-sm font-mono resize-none" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} />
                      {cssErrors.length > 0 && <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>{cssErrors.map((e, i) => <p key={i}>• {e}</p>)}</div>}
                    </motion.div>
                  )}
                  
                  {/* Open Graph Tab */}
                  {activeTab === 'opengraph' && canCreator && (
                    <motion.div key="opengraph" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Use Custom OG</span>
                        <button onClick={() => { setLocalOG({ ...localOG, useCustom: !localOG.useCustom }); setHasChanges(true) }} className="w-12 h-6 rounded-full relative transition-colors" style={{ background: localOG.useCustom ? accentColor : 'var(--border)' }}>
                          <motion.div className="absolute top-1 w-4 h-4 rounded-full bg-white" animate={{ left: localOG.useCustom ? 28 : 4 }} />
                        </button>
                      </div>
                      <div><label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Title</label><input type="text" value={localOG.title || ''} onChange={(e) => { setLocalOG({ ...localOG, title: e.target.value }); setHasChanges(true) }} placeholder="Custom title for social shares" className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} /></div>
                      <div><label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Description</label><textarea value={localOG.description || ''} onChange={(e) => { setLocalOG({ ...localOG, description: e.target.value }); setHasChanges(true) }} placeholder="Custom description" className="w-full h-20 px-4 py-2.5 rounded-xl text-sm resize-none" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} /></div>
                      <div><label className="text-xs font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Image URL</label><input type="url" value={localOG.image || ''} onChange={(e) => { setLocalOG({ ...localOG, image: e.target.value }); setHasChanges(true) }} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} /></div>
                    </motion.div>
                  )}
                  
                  {/* Locked Tab Message */}
                  {!canAccessTab(TABS.find(t => t.id === activeTab)?.tier || 'free') && (
                    <motion.div key="locked" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                      <Lock size={32} className="mx-auto mb-3" style={{ color: 'var(--foreground-muted)' }} />
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Feature Locked</p>
                      <p className="text-xs mb-4" style={{ color: 'var(--foreground-muted)' }}>Upgrade to {TABS.find(t => t.id === activeTab)?.tier === 'pro' ? 'Pro' : 'Creator'} to unlock.</p>
                      <Link to="/profile" search={{ tab: 'subscription' }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: `linear-gradient(135deg, ${accentColor}, var(--accent))`, color: '#fff' }}>
                        <Crown size={14} />Upgrade
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          
          {/* Preview Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
                <div className="flex-1 mx-4 px-3 py-1.5 rounded-lg text-xs font-mono" style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}>eziox.link/{currentUser.username}</div>
              </div>
              
              {/* Preview Content */}
              <div className={`transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''}`}>
                <div className="min-h-[600px] p-8 relative overflow-hidden" style={{ background: colors.bg }}>
                  {/* Profile Content */}
                  <div className="relative z-10 max-w-md mx-auto text-center">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-24 h-24 mx-auto mb-4">
                      <div className="w-full h-full rounded-full" style={{ background: profile?.avatar ? `url(${profile.avatar}) center/cover` : `linear-gradient(135deg, ${accentColor}, ${colors.card})` }}>
                        {!profile?.avatar && <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: colors.text }}>{(currentUser.name || 'U').charAt(0)}</div>}
                      </div>
                    </motion.div>
                    <h2 className="text-xl font-bold mb-1" style={{ color: colors.text }}>{currentUser.name || 'Anonymous'}</h2>
                    <p className="text-sm mb-3" style={{ color: `${colors.text}80` }}>@{currentUser.username}</p>
                    {profile?.bio && <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: `${colors.text}90` }}>{profile.bio}</p>}
                    {Object.keys(socials).length > 0 && (
                      <div className="flex justify-center gap-3 mb-6">
                        {Object.entries(socials).map(([platform, handle]) => {
                          if (!handle) return null
                          const Icon = SOCIAL_ICONS[platform]
                          if (!Icon) return null
                          return <div key={platform} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: colors.card }}><Icon size={18} className="transition-colors" /></div>
                        })}
                      </div>
                    )}
                    <div className="space-y-3">
                      {links.length > 0 ? links.filter(l => l.isActive).slice(0, 5).map((link, i) => (
                        <motion.div key={link.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="w-full py-3 px-4 font-medium cursor-pointer" style={{ background: colors.card, color: colors.text, borderRadius: `${localLayout.cardBorderRadius}px`, border: `1px solid ${accentColor}40` }}>{link.title}</motion.div>
                      )) : ['My Website', 'YouTube', 'Discord'].map((title, i) => (
                        <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="w-full py-3 px-4 font-medium cursor-pointer" style={{ background: colors.card, color: colors.text, borderRadius: `${localLayout.cardBorderRadius}px`, border: `1px solid ${accentColor}40` }}>{title}</motion.div>
                      ))}
                    </div>
                    <div className="mt-8 pt-4 border-t" style={{ borderColor: `${colors.text}10` }}>
                      <p className="text-xs" style={{ color: `${colors.text}50` }}>Powered by <span style={{ color: accentColor }}>Eziox</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
