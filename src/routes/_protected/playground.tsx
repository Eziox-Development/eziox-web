import { useState, useEffect, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  ImageIcon,
  LayoutGrid,
  Type,
  Sparkles,
  Save,
  Loader2,
  Wand2,
  Code2,
  Share2,
  History,
  Trash2,
  Plus,
  Crown,
  Lock,
  Smartphone,
  ExternalLink,
  Monitor,
  Laptop,
  Tablet,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type {
  CustomBackground,
  LayoutSettings,
  AnimatedProfileSettings,
  CustomFont,
  OpenGraphSettings,
} from '@/server/db/schema'
import {
  getProfileSettingsFn,
  updateCustomBackgroundFn,
  updateLayoutSettingsFn,
  createProfileBackupFn,
  restoreProfileBackupFn,
  deleteProfileBackupFn,
} from '@/server/functions/profile-settings'
import {
  getCreatorSettingsFn,
  updateCustomCSSFn,
  addCustomFontFn,
  removeCustomFontFn,
  updateAnimatedProfileFn,
  updateOpenGraphFn,
} from '@/server/functions/creator-features'
import { ANIMATED_PRESETS } from '@/components/backgrounds/AnimatedBackgrounds'

export const Route = createFileRoute('/_protected/playground')({
  component: PlaygroundPage,
})

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
const AVATAR_ANIMATIONS = [
  { value: 'none', label: 'None' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'glow', label: 'Glow' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'shake', label: 'Shake' },
] as const
const BANNER_ANIMATIONS = [
  { value: 'none', label: 'None' },
  { value: 'parallax', label: 'Parallax' },
  { value: 'gradient-shift', label: 'Gradient' },
  { value: 'particles', label: 'Particles' },
] as const
const LINK_HOVER_EFFECTS = [
  { value: 'none', label: 'None' },
  { value: 'scale', label: 'Scale' },
  { value: 'glow', label: 'Glow' },
  { value: 'slide', label: 'Slide' },
  { value: 'shake', label: 'Shake' },
  { value: 'flip', label: 'Flip' },
] as const
const PAGE_TRANSITIONS = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
] as const

const PRESET_FONTS = [
  {
    name: 'Inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    category: 'sans-serif',
  },
  {
    name: 'Poppins',
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
    category: 'sans-serif',
  },
  {
    name: 'Montserrat',
    url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
    category: 'sans-serif',
  },
  {
    name: 'Roboto',
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    category: 'sans-serif',
  },
  {
    name: 'Open Sans',
    url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap',
    category: 'sans-serif',
  },
  {
    name: 'Nunito',
    url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap',
    category: 'sans-serif',
  },
  {
    name: 'Raleway',
    url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
    category: 'sans-serif',
  },
  {
    name: 'Space Grotesk',
    url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
    category: 'sans-serif',
  },
  {
    name: 'Playfair Display',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    category: 'serif',
  },
  {
    name: 'Merriweather',
    url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    category: 'serif',
  },
  {
    name: 'Lora',
    url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    category: 'serif',
  },
  {
    name: 'JetBrains Mono',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    category: 'mono',
  },
  {
    name: 'Fira Code',
    url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap',
    category: 'mono',
  },
  {
    name: 'Space Mono',
    url: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
    category: 'mono',
  },
  {
    name: 'Bebas Neue',
    url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    category: 'display',
  },
  {
    name: 'Righteous',
    url: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
    category: 'display',
  },
  {
    name: 'Pacifico',
    url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
    category: 'display',
  },
  {
    name: 'Orbitron',
    url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap',
    category: 'display',
  },
]

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
  pageTransition: 'none',
}
const DEFAULT_OG: OpenGraphSettings = {
  useCustom: false,
  title: '',
  description: '',
  image: '',
}

type TabType =
  | 'background'
  | 'layout'
  | 'animations'
  | 'fonts'
  | 'css'
  | 'opengraph'
  | 'backups'
const TABS: {
  id: TabType
  label: string
  icon: typeof ImageIcon
  creatorOnly?: boolean
}[] = [
  { id: 'background', label: 'Background', icon: ImageIcon },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'animations', label: 'Animations', icon: Sparkles, creatorOnly: true },
  { id: 'fonts', label: 'Fonts', icon: Type, creatorOnly: true },
  { id: 'css', label: 'CSS', icon: Code2, creatorOnly: true },
  { id: 'opengraph', label: 'OG', icon: Share2, creatorOnly: true },
  { id: 'backups', label: 'Backups', icon: History },
]

function PlaygroundPage() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('background')
  const [backupName, setBackupName] = useState('')

  const getSettings = useServerFn(getProfileSettingsFn)
  const getCreatorSettings = useServerFn(getCreatorSettingsFn)
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

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: () => getSettings(),
  })
  const { data: creatorSettings, isLoading: creatorLoading } = useQuery({
    queryKey: ['creatorSettings'],
    queryFn: () => getCreatorSettings(),
  })

  const [localBackground, setLocalBackground] =
    useState<CustomBackground | null>(null)
  const [localLayout, setLocalLayout] = useState<LayoutSettings>(DEFAULT_LAYOUT)
  const [localAnimated, setLocalAnimated] =
    useState<AnimatedProfileSettings>(DEFAULT_ANIMATED)
  const [localOG, setLocalOG] = useState<OpenGraphSettings>(DEFAULT_OG)
  const [cssInput, setCssInput] = useState('')
  const [cssErrors, setCssErrors] = useState<string[]>([])
  const [newFontName, setNewFontName] = useState('')
  const [newFontUrl, setNewFontUrl] = useState('')
  const [newFontType, setNewFontType] = useState<'display' | 'body'>('display')
  const [fontCategory, setFontCategory] = useState<string>('all')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop')
  const [previewFont, setPreviewFont] = useState<string | null>(null)

  // Auto-detect screen size and set preview device accordingly
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      if (width >= 1536) setPreviewDevice('desktop')
      else if (width >= 1280) setPreviewDevice('laptop')
      else if (width >= 768) setPreviewDevice('tablet')
      else setPreviewDevice('mobile')
    }
    detectDevice()
    window.addEventListener('resize', detectDevice)
    return () => window.removeEventListener('resize', detectDevice)
  }, [])

  useEffect(() => {
    if (settings?.customBackground)
      setLocalBackground(settings.customBackground)
    if (settings?.layoutSettings) setLocalLayout(settings.layoutSettings)
  }, [settings])

  useEffect(() => {
    if (creatorSettings?.customCSS) setCssInput(creatorSettings.customCSS)
    if (creatorSettings?.animatedProfile)
      setLocalAnimated(creatorSettings.animatedProfile)
    if (creatorSettings?.openGraphSettings)
      setLocalOG(creatorSettings.openGraphSettings)
  }, [creatorSettings])

  const userTier = (currentUser?.tier || 'free') as string
  const isCreator =
    creatorSettings?.isCreator || ['creator', 'lifetime'].includes(userTier)
  const filteredFonts = useMemo(
    () =>
      fontCategory === 'all'
        ? PRESET_FONTS
        : PRESET_FONTS.filter((f) => f.category === fontCategory),
    [fontCategory],
  )

  const backgroundMutation = useMutation({
    mutationFn: (bg: CustomBackground | null) => updateBackground({ data: bg }),
    onSuccess: () => {
      toast.success('Background saved!')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => toast.error('Failed to save'),
  })
  const layoutMutation = useMutation({
    mutationFn: (layout: Partial<LayoutSettings>) =>
      updateLayout({ data: layout }),
    onSuccess: () => {
      toast.success('Layout saved!')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => toast.error('Failed to save'),
  })
  const cssMutation = useMutation({
    mutationFn: (css: string) => updateCSS({ data: { css } }),
    onSuccess: (result: {
      success: boolean
      sanitized: string
      valid: boolean
      errors: string[]
    }) => {
      if (result.errors?.length) {
        setCssErrors(result.errors)
        toast.warning('CSS saved with warnings')
      } else {
        setCssErrors([])
        toast.success('CSS saved!')
      }
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => toast.error('Failed to save'),
  })
  const fontMutation = useMutation({
    mutationFn: (font: {
      name: string
      url: string
      type: 'display' | 'body'
    }) => addFont({ data: { id: crypto.randomUUID(), ...font } }),
    onSuccess: () => {
      toast.success('Font added!')
      setNewFontName('')
      setNewFontUrl('')
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
    onError: () => toast.error('Failed to add font'),
  })
  const removeFontMutation = useMutation({
    mutationFn: (fontId: string) => removeFont({ data: { fontId } }),
    onSuccess: () => {
      toast.success('Font removed')
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
    onError: () => toast.error('Failed to remove'),
  })
  const animatedMutation = useMutation({
    mutationFn: (data: AnimatedProfileSettings) => updateAnimated({ data }),
    onSuccess: () => {
      toast.success('Animations saved!')
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => toast.error('Failed to save'),
  })
  const ogMutation = useMutation({
    mutationFn: (data: OpenGraphSettings) => updateOG({ data }),
    onSuccess: () => {
      toast.success('Open Graph saved!')
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
    onError: () => toast.error('Failed to save'),
  })
  const backupMutation = useMutation({
    mutationFn: (name: string) => createBackup({ data: { name } }),
    onSuccess: () => {
      toast.success('Backup created!')
      setBackupName('')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
    onError: () => toast.error('Failed to create backup'),
  })
  const restoreMutation = useMutation({
    mutationFn: (backupId: string) => restoreBackup({ data: { backupId } }),
    onSuccess: () => {
      toast.success('Backup restored!')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => toast.error('Failed to restore'),
  })
  const deleteMutation = useMutation({
    mutationFn: (backupId: string) => deleteBackup({ data: { backupId } }),
    onSuccess: () => {
      toast.success('Backup deleted')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  if (settingsLoading || creatorLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-10 h-10 animate-spin"
          style={{ color: theme.colors.primary }}
        />
      </div>
    )

  const getPreviewBg = () => {
    if (!localBackground) return { background: theme.colors.background }
    if (localBackground.type === 'solid')
      return { background: localBackground.value || theme.colors.background }
    if (localBackground.type === 'gradient') {
      const c = localBackground.gradientColors || ['#8b5cf6', '#ec4899']
      return {
        background: `linear-gradient(${localBackground.gradientAngle || 135}deg, ${c[0]}, ${c[1]})`,
      }
    }
    if (localBackground.type === 'image')
      return {
        backgroundImage: `url(${localBackground.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    return { background: theme.colors.background }
  }

  return (
    <div
      className="min-h-screen pt-20 pb-8"
      style={{ background: theme.colors.background }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: theme.colors.foreground }}
            >
              Playground
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Customize and preview your bio page in real-time
            </p>
          </div>
          <a
            href={`/${currentUser?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
            style={{ background: theme.colors.primary, color: '#fff' }}
          >
            <ExternalLink size={16} />
            View Live
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 order-2 lg:order-1"
          >
            <div
              className="flex gap-1 p-1.5 rounded-xl overflow-x-auto"
              style={{ background: theme.colors.backgroundSecondary }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id,
                  isLocked = tab.creatorOnly && !isCreator,
                  Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isLocked && setActiveTab(tab.id)}
                    disabled={isLocked}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                    style={{
                      background: isActive
                        ? theme.colors.primary
                        : 'transparent',
                      color: isActive
                        ? '#fff'
                        : isLocked
                          ? theme.colors.foregroundMuted
                          : theme.colors.foreground,
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    {isLocked ? <Lock size={14} /> : <Icon size={14} />}
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div
              className="rounded-xl p-6"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <AnimatePresence mode="wait">
                {activeTab === 'background' && (
                  <motion.div
                    key="background"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: theme.colors.foreground }}
                      >
                        Background Type
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {(
                          ['solid', 'gradient', 'image', 'animated'] as const
                        ).map((type) => (
                          <button
                            key={type}
                            onClick={() =>
                              setLocalBackground({
                                ...localBackground,
                                type,
                                value: localBackground?.value || '',
                              } as CustomBackground)
                            }
                            className="px-4 py-3 rounded-lg text-sm font-medium transition-all capitalize"
                            style={{
                              background:
                                localBackground?.type === type
                                  ? theme.colors.primary
                                  : theme.colors.backgroundSecondary,
                              color:
                                localBackground?.type === type
                                  ? '#fff'
                                  : theme.colors.foreground,
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    {localBackground?.type === 'solid' && (
                      <div>
                        <label
                          className="text-sm font-medium mb-2 block"
                          style={{ color: theme.colors.foreground }}
                        >
                          Color
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={localBackground.value || '#000000'}
                            onChange={(e) =>
                              setLocalBackground({
                                ...localBackground,
                                value: e.target.value,
                              })
                            }
                            className="w-14 h-12 rounded-lg cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={localBackground.value || '#000000'}
                            onChange={(e) =>
                              setLocalBackground({
                                ...localBackground,
                                value: e.target.value,
                              })
                            }
                            className="flex-1 px-4 py-2 rounded-lg text-sm"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              color: theme.colors.foreground,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {localBackground?.type === 'gradient' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              className="text-sm font-medium mb-2 block"
                              style={{ color: theme.colors.foreground }}
                            >
                              Start
                            </label>
                            <input
                              type="color"
                              value={
                                localBackground.gradientColors?.[0] || '#8b5cf6'
                              }
                              onChange={(e) =>
                                setLocalBackground({
                                  ...localBackground,
                                  gradientColors: [
                                    e.target.value,
                                    localBackground.gradientColors?.[1] ||
                                      '#ec4899',
                                  ],
                                })
                              }
                              className="w-full h-12 rounded-lg cursor-pointer border-0"
                            />
                          </div>
                          <div>
                            <label
                              className="text-sm font-medium mb-2 block"
                              style={{ color: theme.colors.foreground }}
                            >
                              End
                            </label>
                            <input
                              type="color"
                              value={
                                localBackground.gradientColors?.[1] || '#ec4899'
                              }
                              onChange={(e) =>
                                setLocalBackground({
                                  ...localBackground,
                                  gradientColors: [
                                    localBackground.gradientColors?.[0] ||
                                      '#8b5cf6',
                                    e.target.value,
                                  ],
                                })
                              }
                              className="w-full h-12 rounded-lg cursor-pointer border-0"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium mb-2 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Angle: {localBackground.gradientAngle || 135}°
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={localBackground.gradientAngle || 135}
                            onChange={(e) =>
                              setLocalBackground({
                                ...localBackground,
                                gradientAngle: parseInt(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                    {localBackground?.type === 'image' && (
                      <div className="space-y-4">
                        <div>
                          <label
                            className="text-sm font-medium mb-2 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={localBackground.imageUrl || ''}
                            onChange={(e) =>
                              setLocalBackground({
                                ...localBackground,
                                imageUrl: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="w-full px-4 py-3 rounded-lg text-sm"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              color: theme.colors.foreground,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium mb-2 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Opacity:{' '}
                            {Math.round(
                              (localBackground.imageOpacity ?? 0.5) * 100,
                            )}
                            %
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(localBackground.imageOpacity ?? 0.5) * 100}
                            onChange={(e) =>
                              setLocalBackground({
                                ...localBackground,
                                imageOpacity: parseInt(e.target.value) / 100,
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                    {localBackground?.type === 'animated' && (
                      <div>
                        <label
                          className="text-sm font-medium mb-3 block"
                          style={{ color: theme.colors.foreground }}
                        >
                          Preset
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ANIMATED_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() =>
                                setLocalBackground({
                                  ...localBackground,
                                  animatedPreset: preset.id,
                                })
                              }
                              className="px-4 py-3 rounded-lg text-sm font-medium transition-all text-left"
                              style={{
                                background:
                                  localBackground.animatedPreset === preset.id
                                    ? theme.colors.primary
                                    : theme.colors.backgroundSecondary,
                                color:
                                  localBackground.animatedPreset === preset.id
                                    ? '#fff'
                                    : theme.colors.foreground,
                              }}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => backgroundMutation.mutate(localBackground)}
                      disabled={backgroundMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium"
                      style={{
                        background: theme.colors.primary,
                        color: '#fff',
                      }}
                    >
                      {backgroundMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Save Background
                    </button>
                  </motion.div>
                )}

                {activeTab === 'layout' && (
                  <motion.div
                    key="layout"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"
                        style={{ color: theme.colors.foreground }}
                      >
                        Card Spacing: {localLayout.cardSpacing}px
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="24"
                        value={localLayout.cardSpacing}
                        onChange={(e) =>
                          setLocalLayout({
                            ...localLayout,
                            cardSpacing: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"
                        style={{ color: theme.colors.foreground }}
                      >
                        Border Radius: {localLayout.cardBorderRadius}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        value={localLayout.cardBorderRadius}
                        onChange={(e) =>
                          setLocalLayout({
                            ...localLayout,
                            cardBorderRadius: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"
                        style={{ color: theme.colors.foreground }}
                      >
                        Card Padding: {localLayout.cardPadding}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="32"
                        value={localLayout.cardPadding}
                        onChange={(e) =>
                          setLocalLayout({
                            ...localLayout,
                            cardPadding: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-3 block"
                        style={{ color: theme.colors.foreground }}
                      >
                        Shadow
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {SHADOW_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() =>
                              setLocalLayout({
                                ...localLayout,
                                cardShadow: opt.value,
                              })
                            }
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background:
                                localLayout.cardShadow === opt.value
                                  ? theme.colors.primary
                                  : theme.colors.backgroundSecondary,
                              color:
                                localLayout.cardShadow === opt.value
                                  ? '#fff'
                                  : theme.colors.foreground,
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-3 block"
                        style={{ color: theme.colors.foreground }}
                      >
                        Link Style
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {LINK_STYLE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() =>
                              setLocalLayout({
                                ...localLayout,
                                linkStyle: opt.value,
                              })
                            }
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background:
                                localLayout.linkStyle === opt.value
                                  ? theme.colors.primary
                                  : theme.colors.backgroundSecondary,
                              color:
                                localLayout.linkStyle === opt.value
                                  ? '#fff'
                                  : theme.colors.foreground,
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => layoutMutation.mutate(localLayout)}
                      disabled={layoutMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium"
                      style={{
                        background: theme.colors.primary,
                        color: '#fff',
                      }}
                    >
                      {layoutMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Save Layout
                    </button>
                  </motion.div>
                )}

                {activeTab === 'animations' && isCreator && (
                  <motion.div
                    key="animations"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <label
                        className="text-sm font-medium"
                        style={{ color: theme.colors.foreground }}
                      >
                        Enable Animations
                      </label>
                      <button
                        onClick={() =>
                          setLocalAnimated({
                            ...localAnimated,
                            enabled: !localAnimated.enabled,
                          })
                        }
                        className="w-12 h-6 rounded-full transition-all relative"
                        style={{
                          background: localAnimated.enabled
                            ? theme.colors.primary
                            : theme.colors.backgroundSecondary,
                        }}
                      >
                        <div
                          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                          style={{
                            left: localAnimated.enabled ? '26px' : '4px',
                          }}
                        />
                      </button>
                    </div>
                    {localAnimated.enabled && (
                      <>
                        <div>
                          <label
                            className="text-sm font-medium mb-3 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Avatar Animation
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {AVATAR_ANIMATIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  setLocalAnimated({
                                    ...localAnimated,
                                    avatarAnimation: opt.value,
                                  })
                                }
                                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                style={{
                                  background:
                                    localAnimated.avatarAnimation === opt.value
                                      ? theme.colors.primary
                                      : theme.colors.backgroundSecondary,
                                  color:
                                    localAnimated.avatarAnimation === opt.value
                                      ? '#fff'
                                      : theme.colors.foreground,
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium mb-3 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Banner Animation
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {BANNER_ANIMATIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  setLocalAnimated({
                                    ...localAnimated,
                                    bannerAnimation: opt.value,
                                  })
                                }
                                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                style={{
                                  background:
                                    localAnimated.bannerAnimation === opt.value
                                      ? theme.colors.primary
                                      : theme.colors.backgroundSecondary,
                                  color:
                                    localAnimated.bannerAnimation === opt.value
                                      ? '#fff'
                                      : theme.colors.foreground,
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium mb-3 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Link Hover Effect
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {LINK_HOVER_EFFECTS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  setLocalAnimated({
                                    ...localAnimated,
                                    linkHoverEffect: opt.value,
                                  })
                                }
                                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                style={{
                                  background:
                                    localAnimated.linkHoverEffect === opt.value
                                      ? theme.colors.primary
                                      : theme.colors.backgroundSecondary,
                                  color:
                                    localAnimated.linkHoverEffect === opt.value
                                      ? '#fff'
                                      : theme.colors.foreground,
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium mb-3 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Page Transition
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {PAGE_TRANSITIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  setLocalAnimated({
                                    ...localAnimated,
                                    pageTransition: opt.value,
                                  })
                                }
                                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                style={{
                                  background:
                                    localAnimated.pageTransition === opt.value
                                      ? theme.colors.primary
                                      : theme.colors.backgroundSecondary,
                                  color:
                                    localAnimated.pageTransition === opt.value
                                      ? '#fff'
                                      : theme.colors.foreground,
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    <button
                      onClick={() => animatedMutation.mutate(localAnimated)}
                      disabled={animatedMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium"
                      style={{
                        background: theme.colors.primary,
                        color: '#fff',
                      }}
                    >
                      {animatedMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Save Animations
                    </button>
                  </motion.div>
                )}

                {activeTab === 'fonts' && isCreator && (
                  <motion.div
                    key="fonts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: theme.colors.foreground }}
                        >
                          Preset Fonts
                        </h3>
                        <select
                          value={fontCategory}
                          onChange={(e) => setFontCategory(e.target.value)}
                          className="px-3 py-1.5 rounded-lg text-sm"
                          style={{
                            background: theme.colors.backgroundSecondary,
                            color: theme.colors.foreground,
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          <option value="all">All</option>
                          <option value="sans-serif">Sans Serif</option>
                          <option value="serif">Serif</option>
                          <option value="mono">Monospace</option>
                          <option value="display">Display</option>
                        </select>
                      </div>
                      {/* Load all preset fonts for live preview */}
                      {filteredFonts.map((font) => (
                        <link key={font.name} href={font.url} rel="stylesheet" />
                      ))}
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {filteredFonts.map((font) => (
                          <button
                            key={font.name}
                            onClick={() => {
                              setNewFontName(font.name)
                              setNewFontUrl(font.url)
                              setPreviewFont(font.name)
                            }}
                            onMouseEnter={() => setPreviewFont(font.name)}
                            className="px-3 py-3 rounded-lg transition-all text-left group"
                            style={{
                              background:
                                newFontName === font.name
                                  ? theme.colors.primary
                                  : theme.colors.backgroundSecondary,
                              color:
                                newFontName === font.name
                                  ? '#fff'
                                  : theme.colors.foreground,
                            }}
                          >
                            <span 
                              className="block text-base truncate"
                              style={{ fontFamily: `'${font.name}', ${font.category}` }}
                            >
                              {font.name}
                            </span>
                            <span 
                              className="block text-xs mt-1 opacity-60"
                              style={{ fontFamily: `'${font.name}', ${font.category}` }}
                            >
                              Aa Bb Cc 123
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div
                      className="space-y-3 pt-4 border-t"
                      style={{ borderColor: theme.colors.border }}
                    >
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: theme.colors.foreground }}
                      >
                        Add Custom Font
                      </h3>
                      <input
                        type="text"
                        value={newFontName}
                        onChange={(e) => setNewFontName(e.target.value)}
                        placeholder="Font Name"
                        className="w-full px-4 py-2.5 rounded-lg text-sm"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          color: theme.colors.foreground,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      />
                      <input
                        type="text"
                        value={newFontUrl}
                        onChange={(e) => setNewFontUrl(e.target.value)}
                        placeholder="Google Fonts URL"
                        className="w-full px-4 py-2.5 rounded-lg text-sm"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          color: theme.colors.foreground,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNewFontType('display')}
                          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background:
                              newFontType === 'display'
                                ? theme.colors.primary
                                : theme.colors.backgroundSecondary,
                            color:
                              newFontType === 'display'
                                ? '#fff'
                                : theme.colors.foreground,
                          }}
                        >
                          Display
                        </button>
                        <button
                          onClick={() => setNewFontType('body')}
                          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background:
                              newFontType === 'body'
                                ? theme.colors.primary
                                : theme.colors.backgroundSecondary,
                            color:
                              newFontType === 'body'
                                ? '#fff'
                                : theme.colors.foreground,
                          }}
                        >
                          Body
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          fontMutation.mutate({
                            name: newFontName,
                            url: newFontUrl,
                            type: newFontType,
                          })
                        }
                        disabled={
                          !newFontName || !newFontUrl || fontMutation.isPending
                        }
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
                        style={{
                          background: theme.colors.primary,
                          color: '#fff',
                        }}
                      >
                        {fontMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                        Add Font
                      </button>
                    </div>
                    {creatorSettings?.customFonts &&
                      creatorSettings.customFonts.length > 0 && (
                        <div
                          className="pt-4 border-t"
                          style={{ borderColor: theme.colors.border }}
                        >
                          <h3
                            className="text-sm font-semibold mb-3"
                            style={{ color: theme.colors.foreground }}
                          >
                            Your Fonts
                          </h3>
                          <div className="space-y-2">
                            {creatorSettings.customFonts.map(
                              (font: CustomFont) => (
                                <div
                                  key={font.id}
                                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                                  style={{
                                    background:
                                      theme.colors.backgroundSecondary,
                                  }}
                                >
                                  <div>
                                    <p
                                      className="text-sm font-medium"
                                      style={{ color: theme.colors.foreground }}
                                    >
                                      {font.name}
                                    </p>
                                    <p
                                      className="text-xs"
                                      style={{
                                        color: theme.colors.foregroundMuted,
                                      }}
                                    >
                                      {font.type}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      removeFontMutation.mutate(font.id)
                                    }
                                    className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
                                    style={{ color: '#ef4444' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </motion.div>
                )}

                {activeTab === 'css' && isCreator && (
                  <motion.div
                    key="css"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: theme.colors.foreground }}
                      >
                        Custom CSS
                      </h3>
                      <p
                        className="text-xs mb-4"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        Add custom styles. Some patterns are restricted for
                        security.
                      </p>
                      <textarea
                        value={cssInput}
                        onChange={(e) => setCssInput(e.target.value)}
                        placeholder=".my-class { color: red; }"
                        rows={12}
                        className="w-full px-4 py-3 rounded-lg text-sm font-mono resize-none"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          color: theme.colors.foreground,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      />
                      {cssErrors.length > 0 && (
                        <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                          <p className="text-xs font-medium text-red-400 mb-1">
                            Warnings:
                          </p>
                          {cssErrors.map((err, i) => (
                            <p key={i} className="text-xs text-red-300">
                              {err}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => cssMutation.mutate(cssInput)}
                      disabled={cssMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium"
                      style={{
                        background: theme.colors.primary,
                        color: '#fff',
                      }}
                    >
                      {cssMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Save CSS
                    </button>
                  </motion.div>
                )}

                {activeTab === 'opengraph' && isCreator && (
                  <motion.div
                    key="opengraph"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: theme.colors.foreground }}
                        >
                          Custom Open Graph
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          Customize how your page appears when shared
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setLocalOG({
                            ...localOG,
                            useCustom: !localOG.useCustom,
                          })
                        }
                        className="w-12 h-6 rounded-full transition-all relative"
                        style={{
                          background: localOG.useCustom
                            ? theme.colors.primary
                            : theme.colors.backgroundSecondary,
                        }}
                      >
                        <div
                          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                          style={{ left: localOG.useCustom ? '26px' : '4px' }}
                        />
                      </button>
                    </div>
                    {localOG.useCustom && (
                      <div className="space-y-4">
                        <div>
                          <label
                            className="text-sm font-medium mb-2 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Title
                          </label>
                          <input
                            type="text"
                            value={localOG.title || ''}
                            onChange={(e) =>
                              setLocalOG({ ...localOG, title: e.target.value })
                            }
                            placeholder="My Bio Page"
                            className="w-full px-4 py-2.5 rounded-lg text-sm"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              color: theme.colors.foreground,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium mb-2 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Description
                          </label>
                          <textarea
                            value={localOG.description || ''}
                            onChange={(e) =>
                              setLocalOG({
                                ...localOG,
                                description: e.target.value,
                              })
                            }
                            placeholder="Check out my links..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg text-sm resize-none"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              color: theme.colors.foreground,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium mb-2 block"
                            style={{ color: theme.colors.foreground }}
                          >
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={localOG.image || ''}
                            onChange={(e) =>
                              setLocalOG({ ...localOG, image: e.target.value })
                            }
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 rounded-lg text-sm"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              color: theme.colors.foreground,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => ogMutation.mutate(localOG)}
                      disabled={ogMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium"
                      style={{
                        background: theme.colors.primary,
                        color: '#fff',
                      }}
                    >
                      {ogMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Save Open Graph
                    </button>
                  </motion.div>
                )}

                {activeTab === 'backups' && (
                  <motion.div
                    key="backups"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: theme.colors.foreground }}
                      >
                        Create Backup
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={backupName}
                          onChange={(e) => setBackupName(e.target.value)}
                          placeholder="Backup name..."
                          className="flex-1 px-4 py-2.5 rounded-lg text-sm"
                          style={{
                            background: theme.colors.backgroundSecondary,
                            color: theme.colors.foreground,
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        />
                        <button
                          onClick={() => backupMutation.mutate(backupName)}
                          disabled={!backupName || backupMutation.isPending}
                          className="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
                          style={{
                            background: theme.colors.primary,
                            color: '#fff',
                          }}
                        >
                          {backupMutation.isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Plus size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    {settings?.profileBackups &&
                      settings.profileBackups.length > 0 && (
                        <div>
                          <h3
                            className="text-sm font-semibold mb-3"
                            style={{ color: theme.colors.foreground }}
                          >
                            Your Backups
                          </h3>
                          <div className="space-y-2">
                            {settings.profileBackups.map(
                              (backup: {
                                id: string
                                name: string
                                createdAt: string
                              }) => (
                                <div
                                  key={backup.id}
                                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                                  style={{
                                    background:
                                      theme.colors.backgroundSecondary,
                                  }}
                                >
                                  <div>
                                    <p
                                      className="text-sm font-medium"
                                      style={{ color: theme.colors.foreground }}
                                    >
                                      {backup.name}
                                    </p>
                                    <p
                                      className="text-xs"
                                      style={{
                                        color: theme.colors.foregroundMuted,
                                      }}
                                    >
                                      {new Date(
                                        backup.createdAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        restoreMutation.mutate(backup.id)
                                      }
                                      disabled={restoreMutation.isPending}
                                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                      style={{
                                        background: theme.colors.primary,
                                        color: '#fff',
                                      }}
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteMutation.mutate(backup.id)
                                      }
                                      disabled={deleteMutation.isPending}
                                      className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
                                      style={{ color: '#ef4444' }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </motion.div>
                )}

                {!isCreator &&
                  ['animations', 'fonts', 'css', 'opengraph'].includes(
                    activeTab,
                  ) && (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center py-12"
                    >
                      <div
                        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: `${theme.colors.primary}20` }}
                      >
                        <Wand2
                          size={32}
                          style={{ color: theme.colors.primary }}
                        />
                      </div>
                      <h2
                        className="text-xl font-bold mb-2"
                        style={{ color: theme.colors.foreground }}
                      >
                        Creator Feature
                      </h2>
                      <p
                        className="text-sm mb-6 max-w-sm mx-auto"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        Unlock custom CSS, fonts, animations, and more with
                        Creator tier.
                      </p>
                      <Link
                        to="/profile"
                        search={{ tab: 'subscription' }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all hover:scale-105"
                        style={{
                          background: theme.colors.primary,
                          color: '#fff',
                        }}
                      >
                        <Crown size={16} />
                        Upgrade
                      </Link>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Live Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-1 lg:order-2"
          >
            {/* Load preview font if selected */}
            {previewFont && (
              <link
                href={PRESET_FONTS.find(f => f.name === previewFont)?.url}
                rel="stylesheet"
              />
            )}
            {/* Load user's custom fonts for preview */}
            {creatorSettings?.customFonts?.map((font: CustomFont) => (
              <link key={font.id} href={font.url} rel="stylesheet" />
            ))}
            
            <div
              className="sticky top-24 rounded-xl overflow-hidden"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: theme.colors.border }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  Live Preview
                </span>
                <div className="flex items-center gap-1">
                  {([
                    { id: 'desktop', icon: Monitor, label: 'Desktop' },
                    { id: 'laptop', icon: Laptop, label: 'Laptop' },
                    { id: 'tablet', icon: Tablet, label: 'Tablet' },
                    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                  ] as const).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setPreviewDevice(id)}
                      title={label}
                      className="p-1.5 rounded-md transition-all"
                      style={{
                        background: previewDevice === id ? theme.colors.primary : 'transparent',
                        color: previewDevice === id ? '#fff' : theme.colors.foregroundMuted,
                      }}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 flex justify-center">
                <div
                  className="rounded-lg overflow-hidden transition-all duration-300"
                  style={{
                    ...getPreviewBg(),
                    width: previewDevice === 'desktop' ? '100%' : previewDevice === 'laptop' ? '320px' : previewDevice === 'tablet' ? '280px' : '200px',
                    height: previewDevice === 'desktop' ? '400px' : previewDevice === 'laptop' ? '450px' : previewDevice === 'tablet' ? '500px' : '420px',
                    fontFamily: previewFont || (creatorSettings?.customFonts?.[0] as CustomFont | undefined)?.name || 'inherit',
                  }}
                >
                  <div 
                    className="h-full flex flex-col items-center justify-start overflow-y-auto"
                    style={{ 
                      paddingLeft: previewDevice === 'desktop' ? '24px' : previewDevice === 'laptop' ? '20px' : '16px',
                      paddingRight: previewDevice === 'desktop' ? '24px' : previewDevice === 'laptop' ? '20px' : '16px',
                      paddingBottom: previewDevice === 'desktop' ? '24px' : previewDevice === 'laptop' ? '20px' : '16px',
                      paddingTop: previewDevice === 'desktop' ? '32px' : '24px',
                    }}
                  >
                    {/* Avatar with animation preview */}
                    <motion.div
                      className="rounded-full mb-3 flex items-center justify-center font-bold"
                      style={{
                        background: theme.colors.primary,
                        color: '#fff',
                        width: previewDevice === 'desktop' ? '80px' : previewDevice === 'laptop' ? '72px' : '64px',
                        height: previewDevice === 'desktop' ? '80px' : previewDevice === 'laptop' ? '72px' : '64px',
                        fontSize: previewDevice === 'desktop' ? '28px' : previewDevice === 'laptop' ? '24px' : '20px',
                      }}
                      animate={
                        localAnimated.enabled && localAnimated.avatarAnimation === 'pulse'
                          ? { scale: [1, 1.05, 1] }
                          : localAnimated.enabled && localAnimated.avatarAnimation === 'bounce'
                          ? { y: [0, -8, 0] }
                          : localAnimated.enabled && localAnimated.avatarAnimation === 'rotate'
                          ? { rotate: [0, 5, -5, 0] }
                          : localAnimated.enabled && localAnimated.avatarAnimation === 'shake'
                          ? { x: [0, -3, 3, -3, 0] }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {currentUser?.name?.[0] || 'U'}
                    </motion.div>
                    
                    {/* Name */}
                    <p
                      className="font-bold mb-0.5 text-center"
                      style={{ 
                        color: '#fff',
                        fontSize: previewDevice === 'desktop' ? '18px' : previewDevice === 'laptop' ? '16px' : '14px',
                      }}
                    >
                      {currentUser?.name || 'Username'}
                    </p>
                    
                    {/* Username */}
                    <p
                      className="opacity-70 mb-4 text-center"
                      style={{ 
                        color: '#fff',
                        fontSize: previewDevice === 'desktop' ? '14px' : '12px',
                      }}
                    >
                      @{currentUser?.username}
                    </p>
                    
                    {/* Links with layout settings and hover effects */}
                    <div
                      className="w-full flex flex-col"
                      style={{ gap: `${localLayout.cardSpacing}px` }}
                    >
                      {['Portfolio', 'Twitter', 'GitHub'].map((link, i) => (
                        <motion.div
                          key={i}
                          className="w-full text-center font-medium cursor-pointer"
                          style={{
                            background: localLayout.linkStyle === 'glass' 
                              ? 'rgba(255,255,255,0.15)' 
                              : localLayout.linkStyle === 'minimal'
                              ? 'transparent'
                              : localLayout.linkStyle === 'bold'
                              ? theme.colors.primary
                              : 'rgba(255,255,255,0.1)',
                            borderRadius: `${localLayout.cardBorderRadius}px`,
                            padding: `${localLayout.cardPadding}px`,
                            color: '#fff',
                            fontSize: previewDevice === 'desktop' ? '14px' : '12px',
                            border: localLayout.linkStyle === 'minimal' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                            backdropFilter: localLayout.linkStyle === 'glass' ? 'blur(10px)' : 'none',
                            boxShadow: localLayout.cardShadow === 'none' ? 'none'
                              : localLayout.cardShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.1)'
                              : localLayout.cardShadow === 'md' ? '0 4px 6px rgba(0,0,0,0.1)'
                              : localLayout.cardShadow === 'lg' ? '0 10px 15px rgba(0,0,0,0.1)'
                              : '0 20px 25px rgba(0,0,0,0.15)',
                          }}
                          whileHover={
                            localAnimated.enabled && localAnimated.linkHoverEffect === 'scale'
                              ? { scale: 1.03 }
                              : localAnimated.enabled && localAnimated.linkHoverEffect === 'glow'
                              ? { boxShadow: '0 0 20px rgba(255,255,255,0.3)' }
                              : localAnimated.enabled && localAnimated.linkHoverEffect === 'slide'
                              ? { x: 4 }
                              : localAnimated.enabled && localAnimated.linkHoverEffect === 'shake'
                              ? { x: [0, -2, 2, -2, 0] }
                              : {}
                          }
                          transition={{ duration: 0.2 }}
                        >
                          {link}
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* CSS Preview indicator */}
                    {cssInput && (
                      <div 
                        className="mt-4 px-2 py-1 rounded text-center"
                        style={{ 
                          background: 'rgba(255,255,255,0.1)',
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        + Custom CSS active
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Preview info */}
              <div 
                className="px-4 py-2 border-t flex items-center justify-between"
                style={{ borderColor: theme.colors.border }}
              >
                <span 
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {previewDevice === 'desktop' ? '1920×1080' : previewDevice === 'laptop' ? '1366×768' : previewDevice === 'tablet' ? '768×1024' : '375×812'}
                </span>
                <a
                  href={`/${currentUser?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 hover:underline"
                  style={{ color: theme.colors.primary }}
                >
                  <ExternalLink size={12} />
                  Open Live
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
