/**
 * Playground - Live Bio Page Customization
 * Real-time preview with actual user data
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMyLinksFn } from '@/server/functions/links'
import { getProfileSettingsFn, updateThemeFn, updateLayoutSettingsFn } from '@/server/functions/profile-settings'
import {
  Palette, Layout, Sparkles, Monitor, Smartphone, Eye, 
  Save, Undo2, ExternalLink, Loader2, Check, Layers, Wand2,
} from 'lucide-react'
import {
  SiX, SiInstagram, SiYoutube, SiTwitch, SiGithub, SiTiktok, SiDiscord,
} from 'react-icons/si'

export const Route = createFileRoute('/_protected/playground')({
  head: () => ({
    meta: [
      { title: 'Playground | Eziox' },
      { name: 'description', content: 'Customize your bio page in real-time' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: PlaygroundPage,
})

// Theme presets
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

// Accent colors
const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
]

// Layout styles
const LAYOUT_STYLES = [
  { id: 'classic', name: 'Classic', description: 'Traditional centered layout' },
  { id: 'modern', name: 'Modern', description: 'Card-based with shadows' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
  { id: 'bold', name: 'Bold', description: 'Large text, strong presence' },
]

// Button styles
const BUTTON_STYLES = [
  { id: 'rounded', name: 'Rounded', radius: '9999px' },
  { id: 'soft', name: 'Soft', radius: '12px' },
  { id: 'square', name: 'Square', radius: '4px' },
  { id: 'pill', name: 'Pill', radius: '24px' },
]

// Social platform icons
const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  twitter: SiX,
  instagram: SiInstagram,
  youtube: SiYoutube,
  twitch: SiTwitch,
  github: SiGithub,
  tiktok: SiTiktok,
  discord: SiDiscord,
}

// Tab configuration
type TabId = 'theme' | 'layout' | 'buttons' | 'effects'
const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'buttons', label: 'Buttons', icon: Layers },
  { id: 'effects', label: 'Effects', icon: Sparkles },
]

interface PlaygroundSettings {
  themePreset: string
  accentColor: string
  layoutStyle: string
  buttonStyle: string
  buttonRadius: string
  showSocials: boolean
  showBio: boolean
  showAvatar: boolean
  glowEffect: boolean
  animatedBg: boolean
  customBg: string
  customCard: string
  customText: string
}

const DEFAULT_SETTINGS: PlaygroundSettings = {
  themePreset: 'midnight',
  accentColor: '#6366f1',
  layoutStyle: 'classic',
  buttonStyle: 'rounded',
  buttonRadius: '9999px',
  showSocials: true,
  showBio: true,
  showAvatar: true,
  glowEffect: true,
  animatedBg: false,
  customBg: '',
  customCard: '',
  customText: '',
}

function PlaygroundPage() {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const getMyLinks = useServerFn(getMyLinksFn)
  const getProfileSettings = useServerFn(getProfileSettingsFn)
  const updateTheme = useServerFn(updateThemeFn)
  // updateLayoutSettings available for future use
  void updateLayoutSettingsFn
  
  const [activeTab, setActiveTab] = useState<TabId>('theme')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [settings, setSettings] = useState<PlaygroundSettings>(DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Fetch user links
  const { data: links = [] } = useQuery({
    queryKey: ['my-links'],
    queryFn: () => getMyLinks(),
  })
  
  // Fetch profile settings
  const { data: profileSettings } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: () => getProfileSettings(),
  })
  
  // Load saved settings from profile
  useEffect(() => {
    if (profileSettings) {
      setSettings(prev => ({
        ...prev,
        accentColor: profileSettings.accentColor || prev.accentColor,
        themePreset: profileSettings.themeId || prev.themePreset,
      }))
    }
  }, [profileSettings])
  
  // Update setting helper
  const updateSetting = <K extends keyof PlaygroundSettings>(key: K, value: PlaygroundSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }
  
  // Apply theme preset
  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setSettings(prev => ({
        ...prev,
        themePreset: presetId,
        accentColor: preset.accent,
        customBg: preset.bg,
        customCard: preset.card,
        customText: preset.text,
      }))
      setHasChanges(true)
    }
  }
  
  // Save settings
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateTheme({ 
        data: { 
          themeId: settings.themePreset,
          accentColor: settings.accentColor,
        } 
      })
      toast.success('Settings saved!')
      setHasChanges(false)
      void queryClient.invalidateQueries({ queryKey: ['profile-settings'] })
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Reset to defaults
  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasChanges(true)
  }
  
  // Get current theme colors
  const getColors = () => {
    const preset = THEME_PRESETS.find(p => p.id === settings.themePreset)
    return {
      bg: settings.customBg || preset?.bg || '#0a0a0f',
      card: settings.customCard || preset?.card || '#12121a',
      text: settings.customText || preset?.text || '#ffffff',
      accent: settings.accentColor,
    }
  }
  
  const colors = getColors()
  const profile = currentUser?.profile
  const socials = (profile?.socials as Record<string, string>) || {}
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `${settings.accentColor}15` }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${settings.accentColor}, var(--accent))` }}
              >
                <Wand2 size={20} className="text-white" />
              </div>
              Playground
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
              Customize your bio page in real-time
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
              >
                <Undo2 size={16} />
                Reset
              </motion.button>
            )}
            <motion.button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: hasChanges ? settings.accentColor : 'var(--background-secondary)' }}
              whileHover={{ scale: hasChanges ? 1.02 : 1 }}
              whileTap={{ scale: hasChanges ? 0.98 : 1 }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </motion.button>
            <Link
              to="/$username"
              params={{ username: currentUser.username }}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
            >
              <ExternalLink size={16} />
              View Live
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 shrink-0"
          >
            <div 
              className="rounded-2xl overflow-hidden lg:sticky lg:top-24"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {/* Tabs */}
              <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                      activeTab === tab.id ? 'border-b-2' : ''
                    }`}
                    style={{
                      color: activeTab === tab.id ? settings.accentColor : 'var(--foreground-muted)',
                      borderColor: activeTab === tab.id ? settings.accentColor : 'transparent',
                    }}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'theme' && (
                    <motion.div
                      key="theme"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      {/* Theme Presets */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>
                          Theme Presets
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {THEME_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => applyPreset(preset.id)}
                              className={`relative aspect-square rounded-xl overflow-hidden transition-transform hover:scale-105 ${
                                settings.themePreset === preset.id ? 'ring-2' : ''
                              }`}
                              style={{ 
                                background: preset.bg,
                                outlineColor: settings.themePreset === preset.id ? settings.accentColor : 'transparent',
                                outlineWidth: settings.themePreset === preset.id ? '2px' : '0',
                                outlineStyle: 'solid',
                              }}
                              title={preset.name}
                            >
                              <div 
                                className="absolute bottom-1 left-1 right-1 h-2 rounded"
                                style={{ background: preset.accent }}
                              />
                              {settings.themePreset === preset.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Check size={16} style={{ color: preset.accent }} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Accent Color */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>
                          Accent Color
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {ACCENT_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateSetting('accentColor', color)}
                              className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                              style={{ 
                                background: color,
                                outline: settings.accentColor === color ? `2px solid ${color}` : 'none',
                                outlineOffset: settings.accentColor === color ? '2px' : '0',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'layout' && (
                    <motion.div
                      key="layout"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      {/* Layout Styles */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>
                          Layout Style
                        </label>
                        <div className="space-y-2">
                          {LAYOUT_STYLES.map((layout) => (
                            <button
                              key={layout.id}
                              onClick={() => updateSetting('layoutStyle', layout.id)}
                              className="w-full p-3 rounded-xl text-left transition-all"
                              style={{
                                background: settings.layoutStyle === layout.id ? `${settings.accentColor}20` : 'var(--background-secondary)',
                                outline: settings.layoutStyle === layout.id ? `2px solid ${settings.accentColor}` : 'none',
                              }}
                            >
                              <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{layout.name}</p>
                              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{layout.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Visibility Toggles */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>
                          Show/Hide Elements
                        </label>
                        <div className="space-y-2">
                          {[
                            { key: 'showAvatar' as const, label: 'Avatar' },
                            { key: 'showBio' as const, label: 'Bio' },
                            { key: 'showSocials' as const, label: 'Social Links' },
                          ].map((item) => (
                            <button
                              key={item.key}
                              onClick={() => updateSetting(item.key, !settings[item.key])}
                              className="w-full flex items-center justify-between p-3 rounded-xl"
                              style={{ background: 'var(--background-secondary)' }}
                            >
                              <span className="text-sm" style={{ color: 'var(--foreground)' }}>{item.label}</span>
                              <div 
                                className={`w-10 h-6 rounded-full relative transition-colors ${settings[item.key] ? '' : 'opacity-50'}`}
                                style={{ background: settings[item.key] ? settings.accentColor : 'var(--border)' }}
                              >
                                <motion.div
                                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                                  animate={{ left: settings[item.key] ? 20 : 4 }}
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'buttons' && (
                    <motion.div
                      key="buttons"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      {/* Button Styles */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>
                          Button Style
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {BUTTON_STYLES.map((style) => (
                            <button
                              key={style.id}
                              onClick={() => {
                                updateSetting('buttonStyle', style.id)
                                updateSetting('buttonRadius', style.radius)
                              }}
                              className="p-3 text-center transition-all"
                              style={{
                                background: 'var(--background-secondary)',
                                borderRadius: style.radius,
                                outline: settings.buttonStyle === style.id ? `2px solid ${settings.accentColor}` : 'none',
                              }}
                            >
                              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{style.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Preview Button */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>
                          Preview
                        </label>
                        <div 
                          className="p-4 rounded-xl"
                          style={{ background: colors.bg }}
                        >
                          <button
                            className="w-full py-3 px-4 font-medium transition-all hover:scale-[1.02]"
                            style={{
                              background: colors.card,
                              color: colors.text,
                              borderRadius: settings.buttonRadius,
                              border: `1px solid ${settings.accentColor}40`,
                            }}
                          >
                            Example Link
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'effects' && (
                    <motion.div
                      key="effects"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      {/* Effect Toggles */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--foreground-muted)' }}>
                          Visual Effects
                        </label>
                        <div className="space-y-2">
                          {[
                            { key: 'glowEffect' as const, label: 'Glow Effect', desc: 'Add subtle glow to buttons' },
                            { key: 'animatedBg' as const, label: 'Animated Background', desc: 'Floating gradient orbs' },
                          ].map((item) => (
                            <button
                              key={item.key}
                              onClick={() => updateSetting(item.key, !settings[item.key])}
                              className="w-full flex items-center justify-between p-3 rounded-xl"
                              style={{ background: 'var(--background-secondary)' }}
                            >
                              <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{item.desc}</p>
                              </div>
                              <div 
                                className={`w-10 h-6 rounded-full relative transition-colors ${settings[item.key] ? '' : 'opacity-50'}`}
                                style={{ background: settings[item.key] ? settings.accentColor : 'var(--border)' }}
                              >
                                <motion.div
                                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                                  animate={{ left: settings[item.key] ? 20 : 4 }}
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          
          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            {/* Preview Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                  style={{
                    background: previewMode === 'desktop' ? 'var(--card)' : 'transparent',
                    color: previewMode === 'desktop' ? 'var(--foreground)' : 'var(--foreground-muted)',
                  }}
                >
                  <Monitor size={16} />
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                  style={{
                    background: previewMode === 'mobile' ? 'var(--card)' : 'transparent',
                    color: previewMode === 'mobile' ? 'var(--foreground)' : 'var(--foreground-muted)',
                  }}
                >
                  <Smartphone size={16} />
                  Mobile
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                <Eye size={14} />
                Live Preview
              </div>
            </div>
            
            {/* Preview Frame */}
            <div 
              className="rounded-2xl overflow-hidden"
              style={{ 
                background: 'var(--card)', 
                border: '1px solid var(--border)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div 
                  className="flex-1 mx-4 px-3 py-1.5 rounded-lg text-xs font-mono"
                  style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
                >
                  eziox.link/{currentUser.username}
                </div>
              </div>
              
              {/* Preview Content */}
              <div 
                className={`transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''}`}
              >
                <div 
                  className="min-h-[600px] p-8 relative overflow-hidden"
                  style={{ background: colors.bg }}
                >
                  {/* Animated Background */}
                  {settings.animatedBg && (
                    <>
                      <motion.div
                        className="absolute top-20 right-10 w-64 h-64 rounded-full blur-3xl opacity-30"
                        style={{ background: settings.accentColor }}
                        animate={{ scale: [1, 1.3, 1], x: [0, 30, 0] }}
                        transition={{ duration: 8, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute bottom-20 left-10 w-48 h-48 rounded-full blur-3xl opacity-20"
                        style={{ background: settings.accentColor }}
                        animate={{ scale: [1.2, 1, 1.2], y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                      />
                    </>
                  )}
                  
                  {/* Profile Content */}
                  <div className="relative z-10 max-w-md mx-auto text-center">
                    {/* Avatar */}
                    {settings.showAvatar && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-24 h-24 mx-auto mb-4"
                      >
                        <div 
                          className="w-full h-full rounded-full"
                          style={{
                            background: profile?.avatar 
                              ? `url(${profile.avatar}) center/cover`
                              : `linear-gradient(135deg, ${settings.accentColor}, ${colors.card})`,
                            boxShadow: settings.glowEffect ? `0 0 40px ${settings.accentColor}40` : 'none',
                          }}
                        >
                          {!profile?.avatar && (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: colors.text }}>
                              {(currentUser.name || 'U').charAt(0)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Name & Username */}
                    <h2 
                      className={`font-bold mb-1 ${settings.layoutStyle === 'bold' ? 'text-3xl' : 'text-xl'}`}
                      style={{ color: colors.text }}
                    >
                      {currentUser.name || 'Anonymous'}
                    </h2>
                    <p 
                      className="text-sm mb-3"
                      style={{ color: `${colors.text}80` }}
                    >
                      @{currentUser.username}
                    </p>
                    
                    {/* Bio */}
                    {settings.showBio && profile?.bio && (
                      <p 
                        className="text-sm mb-6 max-w-xs mx-auto"
                        style={{ color: `${colors.text}90` }}
                      >
                        {profile.bio}
                      </p>
                    )}
                    
                    {/* Social Links */}
                    {settings.showSocials && Object.keys(socials).length > 0 && (
                      <div className="flex justify-center gap-3 mb-6">
                        {Object.entries(socials).map(([platform, handle]) => {
                          if (!handle) return null
                          const Icon = SOCIAL_ICONS[platform]
                          if (!Icon) return null
                          return (
                            <div
                              key={platform}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                              style={{ 
                                background: colors.card,
                                boxShadow: settings.glowEffect ? `0 0 20px ${settings.accentColor}30` : 'none',
                              }}
                            >
                              <Icon size={18} className="transition-colors" />
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* Links */}
                    <div className="space-y-3">
                      {links.length > 0 ? (
                        links.filter(l => l.isActive).slice(0, 5).map((link, index) => (
                          <motion.div
                            key={link.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="w-full py-3 px-4 font-medium transition-all hover:scale-[1.02] cursor-pointer"
                            style={{
                              background: settings.layoutStyle === 'modern' 
                                ? colors.card 
                                : 'transparent',
                              color: colors.text,
                              borderRadius: settings.buttonRadius,
                              border: `1px solid ${settings.accentColor}40`,
                              boxShadow: settings.glowEffect && settings.layoutStyle === 'modern'
                                ? `0 4px 20px ${settings.accentColor}20`
                                : 'none',
                            }}
                          >
                            {link.title}
                          </motion.div>
                        ))
                      ) : (
                        // Placeholder links
                        ['My Website', 'YouTube Channel', 'Discord Server'].map((title, index) => (
                          <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="w-full py-3 px-4 font-medium transition-all hover:scale-[1.02] cursor-pointer"
                            style={{
                              background: settings.layoutStyle === 'modern' 
                                ? colors.card 
                                : 'transparent',
                              color: colors.text,
                              borderRadius: settings.buttonRadius,
                              border: `1px solid ${settings.accentColor}40`,
                              boxShadow: settings.glowEffect && settings.layoutStyle === 'modern'
                                ? `0 4px 20px ${settings.accentColor}20`
                                : 'none',
                            }}
                          >
                            {title}
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t" style={{ borderColor: `${colors.text}10` }}>
                      <p className="text-xs" style={{ color: `${colors.text}50` }}>
                        Powered by <span style={{ color: settings.accentColor }}>Eziox</span>
                      </p>
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
