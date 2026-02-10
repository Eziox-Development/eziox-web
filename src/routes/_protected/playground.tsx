import { useState, useEffect, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ImageIcon,
  LayoutGrid,
  Type,
  Sparkles,
  Save,
  Loader2,
  Code2,
  History,
  Trash2,
  Plus,
  Crown,
  Lock,
  Layers,
  Grid3X3,
  Rows3,
  Minimize2,
  Move3D,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Image,
  Video,
  RotateCw,
  ExternalLink,
  Palette,
  ChevronRight,
  Eye,
  Wand2,
  Monitor,
  Music,
  DoorOpen,
} from 'lucide-react'
import type {
  CustomBackground,
  LayoutSettings,
  AnimatedProfileSettings,
  CustomFont,
  IntroGateSettings,
  ProfileMusicSettings,
} from '@/server/db/schema'
import {
  getProfileSettingsFn,
  updateCustomBackgroundFn,
  updateLayoutSettingsFn,
  createProfileBackupFn,
  restoreProfileBackupFn,
  deleteProfileBackupFn,
  updateIntroGateFn,
  updateProfileMusicFn,
  getIntroGateAndMusicFn,
} from '@/server/functions/profile-settings'
import {
  getCreatorSettingsFn,
  updateCustomCSSFn,
  addCustomFontFn,
  removeCustomFontFn,
  updateAnimatedProfileFn,
} from '@/server/functions/creator-features'
import { ANIMATED_PRESETS } from '@/components/backgrounds/AnimatedBackgrounds'

export const Route = createFileRoute('/_protected/playground')({
  component: PlaygroundPage,
  head: () => ({
    meta: [
      { title: 'Playground | Eziox' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})

const CARD_LAYOUTS = [
  {
    id: 'default',
    label: 'Default',
    icon: Rows3,
    description: 'Classic vertical list',
  },
  {
    id: 'tilt',
    label: 'Tilt 3D',
    icon: Move3D,
    description: 'Interactive 3D effect',
  },
  { id: 'grid', label: 'Grid', icon: Grid3X3, description: 'Two-column grid' },
  { id: 'stack', label: 'Bento', icon: Layers, description: 'Bento box style' },
  {
    id: 'minimal',
    label: 'Minimal',
    icon: Minimize2,
    description: 'Clean and simple',
  },
] as const

const LINK_STYLES = [
  { id: 'default', label: 'Default' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'glass', label: 'Glass' },
  { id: 'outline', label: 'Outline' },
  { id: 'neon', label: 'Neon' },
] as const

const SHADOW_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'sm', label: 'Subtle' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' },
  { id: 'xl', label: 'Dramatic' },
  { id: 'glow', label: 'Glow' },
] as const

const AVATAR_ANIMATIONS = [
  { id: 'none', label: 'None', icon: Pause },
  { id: 'pulse', label: 'Pulse', icon: Zap },
  { id: 'glow', label: 'Glow', icon: Sparkles },
  { id: 'bounce', label: 'Bounce', icon: Play },
  { id: 'rotate', label: 'Rotate', icon: RotateCcw },
  { id: 'shake', label: 'Shake', icon: Move3D },
] as const

const LINK_HOVER_EFFECTS = [
  { id: 'none', label: 'None' },
  { id: 'scale', label: 'Scale' },
  { id: 'glow', label: 'Glow' },
  { id: 'slide', label: 'Slide' },
  { id: 'tilt', label: 'Tilt' },
  { id: 'lift', label: 'Lift' },
] as const

const BACKGROUND_TYPES = [
  {
    id: 'solid',
    label: 'Solid',
    icon: Palette,
    premium: false,
    description: 'Single color',
  },
  {
    id: 'gradient',
    label: 'Gradient',
    icon: Layers,
    premium: false,
    description: 'Color blend',
  },
  {
    id: 'image',
    label: 'Image',
    icon: Image,
    premium: false,
    description: 'Custom image',
  },
  {
    id: 'video',
    label: 'Video',
    icon: Video,
    premium: true,
    description: 'Video background',
  },
  {
    id: 'animated',
    label: 'Animated',
    icon: Sparkles,
    premium: true,
    description: 'Dynamic effects',
  },
] as const

const ANIMATED_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'vtuber', label: 'VTuber' },
  { id: 'gamer', label: 'Gamer' },
  { id: 'developer', label: 'Developer' },
  { id: 'nature', label: 'Nature' },
  { id: 'abstract', label: 'Abstract' },
] as const

const DEFAULT_LAYOUT: LayoutSettings = {
  cardLayout: 'default',
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

type TabType =
  | 'background'
  | 'layout'
  | 'animations'
  | 'fonts'
  | 'css'
  | 'intro-gate'
  | 'music'
  | 'backups'

const TABS: {
  id: TabType
  label: string
  icon: typeof ImageIcon
  premium?: boolean
  description: string
}[] = [
  {
    id: 'background',
    label: 'Background',
    icon: ImageIcon,
    description: 'Customize your page background',
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: LayoutGrid,
    description: 'Arrange your links and cards',
  },
  {
    id: 'animations',
    label: 'Animations',
    icon: Sparkles,
    premium: true,
    description: 'Add motion effects',
  },
  {
    id: 'fonts',
    label: 'Fonts',
    icon: Type,
    premium: true,
    description: 'Custom typography',
  },
  {
    id: 'css',
    label: 'CSS',
    icon: Code2,
    premium: true,
    description: 'Advanced styling',
  },
  {
    id: 'intro-gate',
    label: 'Intro Gate',
    icon: DoorOpen,
    description: 'Click-to-enter screen',
  },
  {
    id: 'music',
    label: 'Music',
    icon: Music,
    description: 'Background audio',
  },
  {
    id: 'backups',
    label: 'Backups',
    icon: History,
    description: 'Save and restore',
  },
]

const PRESET_FONTS = [
  {
    name: 'Inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    name: 'Space Grotesk',
    url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    name: 'Plus Jakarta Sans',
    url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    name: 'Outfit',
    url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    name: 'Sora',
    url: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    name: 'Manrope',
    url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    name: 'DM Sans',
    url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    name: 'Orbitron',
    url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap',
    category: 'display',
  },
  {
    name: 'Chakra Petch',
    url: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap',
    category: 'display',
  },
  {
    name: 'Audiowide',
    url: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap',
    category: 'display',
  },
  {
    name: 'Bebas Neue',
    url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    category: 'display',
  },
  {
    name: 'Playfair Display',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    category: 'serif',
  },
  {
    name: 'Lora',
    url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    category: 'serif',
  },
  {
    name: 'Caveat',
    url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap',
    category: 'handwriting',
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
]

function PlaygroundPage() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('background')
  const [backupName, setBackupName] = useState('')
  const [animatedCategory, setAnimatedCategory] = useState<string>('all')
  const [fontCategory, setFontCategory] = useState<string>('all')

  const getSettings = useServerFn(getProfileSettingsFn)
  const getCreatorSettings = useServerFn(getCreatorSettingsFn)
  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)
  const updateCSS = useServerFn(updateCustomCSSFn)
  const addFont = useServerFn(addCustomFontFn)
  const removeFont = useServerFn(removeCustomFontFn)
  const updateAnimated = useServerFn(updateAnimatedProfileFn)
  const createBackup = useServerFn(createProfileBackupFn)
  const restoreBackup = useServerFn(restoreProfileBackupFn)
  const deleteBackup = useServerFn(deleteProfileBackupFn)
  const updateIntroGate = useServerFn(updateIntroGateFn)
  const updateProfileMusic = useServerFn(updateProfileMusicFn)
  const getIntroGateAndMusic = useServerFn(getIntroGateAndMusicFn)

  const { data: settings } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: () => getSettings(),
  })
  const { data: creatorSettings } = useQuery({
    queryKey: ['creatorSettings'],
    queryFn: () => getCreatorSettings(),
  })
  const { data: gateAndMusic } = useQuery({
    queryKey: ['introGateAndMusic'],
    queryFn: () => getIntroGateAndMusic(),
  })

  const [localBackground, setLocalBackground] =
    useState<CustomBackground | null>(null)
  const [localLayout, setLocalLayout] = useState<LayoutSettings>(DEFAULT_LAYOUT)
  const [localAnimated, setLocalAnimated] =
    useState<AnimatedProfileSettings>(DEFAULT_ANIMATED)
  const [cssInput, setCssInput] = useState('')
  const [newFontName, setNewFontName] = useState('')
  const [newFontUrl, setNewFontUrl] = useState('')
  const [newFontType, setNewFontType] = useState<'display' | 'body'>('display')
  const [localIntroGate, setLocalIntroGate] = useState<IntroGateSettings>({
    enabled: false,
    text: '',
    buttonText: 'Enter',
    style: 'blur',
    showAvatar: true,
  })
  const [localMusic, setLocalMusic] = useState<ProfileMusicSettings>({
    enabled: false,
    url: '',
    autoplay: false,
    volume: 0.5,
    loop: true,
    showPlayer: true,
    playerPosition: 'bottom-right',
  })

  useEffect(() => {
    if (settings?.customBackground)
      setLocalBackground(settings.customBackground)
    if (settings?.layoutSettings) setLocalLayout(settings.layoutSettings)
  }, [settings])

  useEffect(() => {
    if (creatorSettings?.customCSS) setCssInput(creatorSettings.customCSS)
    if (creatorSettings?.animatedProfile)
      setLocalAnimated(creatorSettings.animatedProfile)
  }, [creatorSettings])

  useEffect(() => {
    if (gateAndMusic?.introGate) setLocalIntroGate(gateAndMusic.introGate)
    if (gateAndMusic?.profileMusic) setLocalMusic(gateAndMusic.profileMusic)
  }, [gateAndMusic])

  const userTier = (currentUser?.tier || 'free') as string
  const isPremium = ['pro', 'creator', 'lifetime'].includes(userTier)
  const isCreator =
    creatorSettings?.isCreator || ['creator', 'lifetime'].includes(userTier)

  const filteredAnimatedPresets = useMemo(() => {
    if (animatedCategory === 'all') return ANIMATED_PRESETS
    return ANIMATED_PRESETS.filter((p) => p.category === animatedCategory)
  }, [animatedCategory])

  const filteredFonts = useMemo(() => {
    if (fontCategory === 'all') return PRESET_FONTS
    return PRESET_FONTS.filter((f) => f.category === fontCategory)
  }, [fontCategory])

  const bgMutation = useMutation({
    mutationFn: (bg: CustomBackground | null) => updateBackground({ data: bg }),
    onSuccess: () => {
      toast.success(t('playground.saved'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  const layoutMutation = useMutation({
    mutationFn: (l: Partial<LayoutSettings>) => updateLayout({ data: l }),
    onSuccess: () => {
      toast.success(t('playground.saved'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  const animMutation = useMutation({
    mutationFn: (a: AnimatedProfileSettings) => updateAnimated({ data: a }),
    onSuccess: () => {
      toast.success(t('playground.saved'))
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
  })

  const cssMutation = useMutation({
    mutationFn: (css: string) => updateCSS({ data: { css } }),
    onSuccess: () => {
      toast.success(t('playground.saved'))
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
  })

  const fontMutation = useMutation({
    mutationFn: (f: { name: string; url: string; type: 'display' | 'body' }) =>
      addFont({ data: { ...f, id: crypto.randomUUID() } }),
    onSuccess: () => {
      toast.success(t('playground.fontAdded'))
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      setNewFontName('')
      setNewFontUrl('')
    },
  })

  const removeFontMutation = useMutation({
    mutationFn: (id: string) => removeFont({ data: { fontId: id } }),
    onSuccess: () => {
      toast.success(t('playground.fontRemoved'))
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
  })

  const backupMutation = useMutation({
    mutationFn: (name: string) => createBackup({ data: { name } }),
    onSuccess: () => {
      toast.success(t('playground.backupCreated'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      setBackupName('')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreBackup({ data: { backupId: id } }),
    onSuccess: () => {
      toast.success(t('playground.backupRestored'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBackup({ data: { backupId: id } }),
    onSuccess: () => {
      toast.success(t('playground.backupDeleted'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  const introGateMutation = useMutation({
    mutationFn: (gate: IntroGateSettings) => updateIntroGate({ data: gate }),
    onSuccess: () => {
      toast.success(t('playground.saved'))
      void queryClient.invalidateQueries({ queryKey: ['introGateAndMusic'] })
    },
  })

  const musicMutation = useMutation({
    mutationFn: (music: ProfileMusicSettings) => updateProfileMusic({ data: music }),
    onSuccess: () => {
      toast.success(t('playground.saved'))
      void queryClient.invalidateQueries({ queryKey: ['introGateAndMusic'] })
    },
  })

  const handleResetToDefault = () => {
    setLocalBackground(null)
    setLocalLayout(DEFAULT_LAYOUT)
    setLocalAnimated(DEFAULT_ANIMATED)
    setCssInput('')
    toast.success(t('playground.resetSuccess'))
  }

  const activeTabData = TABS.find((tab) => tab.id === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
      {/* Sidebar + Content Layout */}
      <div className="flex min-h-screen pt-16">
        {/* Sidebar Navigation */}
        <aside className="w-72 border-r border-border/50 bg-background/80 backdrop-blur-xl fixed left-0 top-16 bottom-0 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Wand2 size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    {t('playground.title')}
                  </h1>
                  <p className="text-xs text-foreground-muted">
                    {t('playground.subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const isLocked = tab.premium && !isCreator
                const isActive = activeTab === tab.id
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => !isLocked && setActiveTab(tab.id)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                        : 'hover:bg-background-secondary text-foreground-muted hover:text-foreground'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    whileHover={!isLocked ? { x: 4 } : {}}
                    whileTap={!isLocked ? { scale: 0.98 } : {}}
                  >
                    <tab.icon size={18} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div
                        className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-foreground-muted'}`}
                      >
                        {tab.description}
                      </div>
                    </div>
                    {isLocked ? (
                      <Lock size={14} />
                    ) : (
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isActive ? 'rotate-90' : ''}`}
                      />
                    )}
                    {tab.premium && !isLocked && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        PRO
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-border/50 space-y-2">
              <a
                href={`/${currentUser?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-foreground hover:border-primary/40 transition-colors"
              >
                <Eye size={18} className="text-primary" />
                <span className="font-medium text-sm">
                  {t('playground.preview')}
                </span>
                <ExternalLink
                  size={14}
                  className="ml-auto text-foreground-muted"
                />
              </a>
              <button
                onClick={handleResetToDefault}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <RotateCw size={18} />
                <span className="font-medium text-sm">
                  {t('playground.reset')}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-72 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Content Header */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-2">
                {activeTabData && (
                  <activeTabData.icon size={28} className="text-primary" />
                )}
                <h2 className="text-2xl font-bold text-foreground">
                  {activeTabData?.label}
                </h2>
              </div>
              <p className="text-foreground-muted">
                {activeTabData?.description}
              </p>
            </motion.div>

            {/* Content Panels */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Background Tab */}
                {activeTab === 'background' && (
                  <div className="space-y-8">
                    {/* Background Type Selection */}
                    <div className="grid grid-cols-5 gap-4">
                      {BACKGROUND_TYPES.map((type) => {
                        const isLocked = type.premium && !isPremium
                        const isActive = localBackground?.type === type.id
                        return (
                          <motion.button
                            key={type.id}
                            onClick={() =>
                              !isLocked &&
                              setLocalBackground({
                                ...localBackground,
                                type: type.id,
                              } as CustomBackground)
                            }
                            disabled={isLocked}
                            className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                              isActive
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                : 'border-border bg-card hover:border-primary/50'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
                            whileTap={!isLocked ? { scale: 0.98 } : {}}
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background-secondary text-foreground-muted'
                              }`}
                            >
                              <type.icon size={24} />
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-sm text-foreground">
                                {type.label}
                              </div>
                              <div className="text-xs text-foreground-muted">
                                {type.description}
                              </div>
                            </div>
                            {isLocked && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background-secondary flex items-center justify-center">
                                <Lock
                                  size={12}
                                  className="text-foreground-muted"
                                />
                              </div>
                            )}
                            {type.premium && !isLocked && (
                              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                PRO
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Background Options */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      {localBackground?.type === 'solid' && (
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-foreground">
                            Color
                          </label>
                          <div className="flex gap-4">
                            <input
                              type="color"
                              value={localBackground.value || '#000000'}
                              onChange={(e) =>
                                setLocalBackground({
                                  ...localBackground,
                                  value: e.target.value,
                                })
                              }
                              className="w-16 h-16 rounded-xl cursor-pointer border-2 border-border"
                            />
                            <input
                              type="text"
                              value={localBackground.value || ''}
                              onChange={(e) =>
                                setLocalBackground({
                                  ...localBackground,
                                  value: e.target.value,
                                })
                              }
                              placeholder="#000000"
                              className="flex-1 px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {localBackground?.type === 'gradient' && (
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-foreground">
                            Gradient Colors
                          </label>
                          <div className="flex gap-4 items-center">
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
                                      '#06b6d4',
                                  ],
                                  value: `linear-gradient(135deg, ${e.target.value}, ${localBackground.gradientColors?.[1] || '#06b6d4'})`,
                                })
                              }
                              className="w-16 h-16 rounded-xl cursor-pointer border-2 border-border"
                            />
                            <div
                              className="flex-1 h-16 rounded-xl"
                              style={{
                                background:
                                  localBackground.value ||
                                  'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                              }}
                            />
                            <input
                              type="color"
                              value={
                                localBackground.gradientColors?.[1] || '#06b6d4'
                              }
                              onChange={(e) =>
                                setLocalBackground({
                                  ...localBackground,
                                  gradientColors: [
                                    localBackground.gradientColors?.[0] ||
                                      '#8b5cf6',
                                    e.target.value,
                                  ],
                                  value: `linear-gradient(135deg, ${localBackground.gradientColors?.[0] || '#8b5cf6'}, ${e.target.value})`,
                                })
                              }
                              className="w-16 h-16 rounded-xl cursor-pointer border-2 border-border"
                            />
                          </div>
                        </div>
                      )}

                      {localBackground?.type === 'image' && (
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-foreground">
                            {t('playground.imageUrl')}
                          </label>
                          <input
                            type="url"
                            value={localBackground.imageUrl || ''}
                            onChange={(e) =>
                              setLocalBackground({
                                ...localBackground,
                                imageUrl: e.target.value,
                              })
                            }
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground"
                          />
                          {localBackground.imageUrl && (
                            <div className="aspect-video rounded-xl overflow-hidden border border-border">
                              <img
                                src={localBackground.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {localBackground?.type === 'video' && isPremium && (
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-foreground">
                            {t('playground.videoUrl')}
                          </label>
                          <input
                            type="url"
                            value={localBackground.videoUrl || ''}
                            onChange={(e) =>
                              setLocalBackground({
                                ...localBackground,
                                videoUrl: e.target.value,
                              })
                            }
                            placeholder="https://example.com/video.mp4"
                            className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground"
                          />
                          <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localBackground.videoLoop ?? true}
                                onChange={(e) =>
                                  setLocalBackground({
                                    ...localBackground,
                                    videoLoop: e.target.checked,
                                  })
                                }
                                className="w-5 h-5 accent-primary rounded"
                              />
                              <span className="text-sm text-foreground">
                                {t('playground.videoLoop')}
                              </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localBackground.videoMuted ?? true}
                                onChange={(e) =>
                                  setLocalBackground({
                                    ...localBackground,
                                    videoMuted: e.target.checked,
                                  })
                                }
                                className="w-5 h-5 accent-primary rounded"
                              />
                              <span className="text-sm text-foreground">
                                {t('playground.videoMuted')}
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      {localBackground?.type === 'animated' && isPremium && (
                        <div className="space-y-6">
                          {/* Category Filter */}
                          <div className="flex gap-2 flex-wrap">
                            {ANIMATED_CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => setAnimatedCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                  animatedCategory === cat.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background-secondary text-foreground-muted hover:text-foreground'
                                }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>

                          {/* Presets Grid */}
                          <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                            {filteredAnimatedPresets.map((preset) => (
                              <motion.button
                                key={preset.id}
                                onClick={() =>
                                  setLocalBackground({
                                    ...localBackground,
                                    animatedPreset: preset.id,
                                  })
                                }
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                  localBackground.animatedPreset === preset.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-background-secondary hover:border-primary/50'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="font-medium text-sm text-foreground">
                                  {preset.name}
                                </div>
                                <div className="text-xs text-foreground-muted mt-1">
                                  {preset.description}
                                </div>
                                <div className="text-[10px] text-primary mt-2 uppercase font-bold">
                                  {preset.category}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      {!localBackground?.type && (
                        <div className="text-center py-12 text-foreground-muted">
                          <Monitor
                            size={48}
                            className="mx-auto mb-4 opacity-50"
                          />
                          <p>Select a background type above to get started</p>
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <motion.button
                      onClick={() => bgMutation.mutate(localBackground)}
                      disabled={bgMutation.isPending}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {bgMutation.isPending ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      {t('common.save')}
                    </motion.button>
                  </div>
                )}

                {/* Layout Tab */}
                {activeTab === 'layout' && (
                  <div className="space-y-8">
                    {/* Card Layout */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        {t('playground.cardLayout')}
                      </h3>
                      <div className="grid grid-cols-5 gap-4">
                        {CARD_LAYOUTS.map((layout) => (
                          <motion.button
                            key={layout.id}
                            onClick={() =>
                              setLocalLayout({
                                ...localLayout,
                                cardLayout: layout.id,
                              })
                            }
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                              localLayout.cardLayout === layout.id
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                : 'border-border bg-card hover:border-primary/50'
                            }`}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                localLayout.cardLayout === layout.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background-secondary text-foreground-muted'
                              }`}
                            >
                              <layout.icon size={24} />
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-sm text-foreground">
                                {layout.label}
                              </div>
                              <div className="text-xs text-foreground-muted">
                                {layout.description}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Link Style */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Link Style
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {LINK_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() =>
                              setLocalLayout({
                                ...localLayout,
                                linkStyle: style.id,
                              })
                            }
                            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                              localLayout.linkStyle === style.id
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                : 'bg-background-secondary text-foreground-muted hover:text-foreground'
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spacing & Radius */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">
                            Spacing
                          </h3>
                          <span className="text-sm text-primary font-mono">
                            {localLayout.cardSpacing}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="4"
                          max="32"
                          value={localLayout.cardSpacing}
                          onChange={(e) =>
                            setLocalLayout({
                              ...localLayout,
                              cardSpacing: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-primary h-2 rounded-full"
                        />
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">
                            Border Radius
                          </h3>
                          <span className="text-sm text-primary font-mono">
                            {localLayout.cardBorderRadius}px
                          </span>
                        </div>
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
                          className="w-full accent-primary h-2 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Shadow */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Shadow
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {SHADOW_OPTIONS.map((shadow) => (
                          <button
                            key={shadow.id}
                            onClick={() =>
                              setLocalLayout({
                                ...localLayout,
                                cardShadow: shadow.id,
                              })
                            }
                            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                              localLayout.cardShadow === shadow.id
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                : 'bg-background-secondary text-foreground-muted hover:text-foreground'
                            }`}
                          >
                            {shadow.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <motion.button
                      onClick={() => layoutMutation.mutate(localLayout)}
                      disabled={layoutMutation.isPending}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {layoutMutation.isPending ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      {t('common.save')}
                    </motion.button>
                  </div>
                )}

                {/* Animations Tab */}
                {activeTab === 'animations' &&
                  (isCreator ? (
                    <div className="space-y-8">
                      {/* Enable Toggle */}
                      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Enable Animations
                          </h3>
                          <p className="text-sm text-foreground-muted">
                            Add motion effects to your profile
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setLocalAnimated({
                              ...localAnimated,
                              enabled: !localAnimated.enabled,
                            })
                          }
                          className={`w-14 h-8 rounded-full transition-colors relative ${
                            localAnimated.enabled ? 'bg-primary' : 'bg-border'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform absolute top-1 ${
                              localAnimated.enabled
                                ? 'translate-x-7'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {localAnimated.enabled && (
                        <>
                          {/* Avatar Animation */}
                          <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                              Avatar Animation
                            </h3>
                            <div className="grid grid-cols-6 gap-3">
                              {AVATAR_ANIMATIONS.map((anim) => (
                                <motion.button
                                  key={anim.id}
                                  onClick={() =>
                                    setLocalAnimated({
                                      ...localAnimated,
                                      avatarAnimation: anim.id,
                                    })
                                  }
                                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                    localAnimated.avatarAnimation === anim.id
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border bg-background-secondary hover:border-primary/50'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <anim.icon
                                    size={20}
                                    className={
                                      localAnimated.avatarAnimation === anim.id
                                        ? 'text-primary'
                                        : 'text-foreground-muted'
                                    }
                                  />
                                  <span className="text-xs font-medium">
                                    {anim.label}
                                  </span>
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Link Hover Effect */}
                          <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                              Link Hover Effect
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {LINK_HOVER_EFFECTS.map((effect) => (
                                <button
                                  key={effect.id}
                                  onClick={() =>
                                    setLocalAnimated({
                                      ...localAnimated,
                                      linkHoverEffect: effect.id,
                                    })
                                  }
                                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                                    localAnimated.linkHoverEffect === effect.id
                                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                      : 'bg-background-secondary text-foreground-muted hover:text-foreground'
                                  }`}
                                >
                                  {effect.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Save Button */}
                      <motion.button
                        onClick={() => animMutation.mutate(localAnimated)}
                        disabled={animMutation.isPending}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {animMutation.isPending ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        {t('common.save')}
                      </motion.button>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                      <Lock
                        size={48}
                        className="mx-auto mb-4 text-foreground-muted"
                      />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t('playground.creatorOnly')}
                      </h3>
                      <p className="text-foreground-muted mb-6">
                        {t('playground.upgradeToCreator')}
                      </p>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold"
                      >
                        <Crown size={20} />
                        {t('playground.upgradePlan')}
                      </Link>
                    </div>
                  ))}

                {/* Fonts Tab */}
                {activeTab === 'fonts' &&
                  (isCreator ? (
                    <div className="space-y-8">
                      {/* Current Fonts */}
                      {(creatorSettings?.customFonts?.length ?? 0) > 0 && (
                        <div className="bg-card border border-border rounded-2xl p-6">
                          <h3 className="text-lg font-semibold text-foreground mb-4">
                            Current Fonts
                          </h3>
                          <div className="space-y-3">
                            {creatorSettings?.customFonts?.map(
                              (font: CustomFont) => (
                                <div
                                  key={font.id}
                                  className="flex items-center justify-between p-4 rounded-xl bg-background-secondary border border-border"
                                >
                                  <div>
                                    <span className="font-medium text-foreground">
                                      {font.name}
                                    </span>
                                    <span className="text-xs text-foreground-muted ml-2">
                                      ({font.type})
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      removeFontMutation.mutate(font.id)
                                    }
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Font Category Filter */}
                      <div className="flex gap-2 flex-wrap">
                        {[
                          'all',
                          'sans',
                          'display',
                          'serif',
                          'handwriting',
                          'mono',
                        ].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setFontCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                              fontCategory === cat
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background-secondary text-foreground-muted hover:text-foreground'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Preset Fonts */}
                      <div className="grid grid-cols-4 gap-3">
                        {filteredFonts.map((font) => (
                          <motion.button
                            key={font.name}
                            onClick={() => {
                              setNewFontName(font.name)
                              setNewFontUrl(font.url)
                            }}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              newFontName === font.name
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card hover:border-primary/50'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="font-medium text-sm text-foreground">
                              {font.name}
                            </div>
                            <div className="text-xs text-foreground-muted capitalize">
                              {font.category}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Add Font Form */}
                      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                        <h3 className="font-semibold text-foreground">
                          Add Font
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={newFontName}
                            onChange={(e) => setNewFontName(e.target.value)}
                            placeholder="Font name"
                            className="px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground"
                          />
                          <Select
                            value={newFontType}
                            onValueChange={(value) =>
                              setNewFontType(value as 'display' | 'body')
                            }
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="display">Display</SelectItem>
                              <SelectItem value="body">Body</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <input
                          type="url"
                          value={newFontUrl}
                          onChange={(e) => setNewFontUrl(e.target.value)}
                          placeholder="Font URL (Google Fonts)"
                          className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground"
                        />
                        <motion.button
                          onClick={() =>
                            fontMutation.mutate({
                              name: newFontName,
                              url: newFontUrl,
                              type: newFontType,
                            })
                          }
                          disabled={
                            !newFontName ||
                            !newFontUrl ||
                            fontMutation.isPending
                          }
                          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                          whileTap={{ scale: 0.99 }}
                        >
                          {fontMutation.isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Plus size={18} />
                          )}
                          Add Font
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                      <Lock
                        size={48}
                        className="mx-auto mb-4 text-foreground-muted"
                      />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t('playground.creatorOnly')}
                      </h3>
                      <p className="text-foreground-muted mb-6">
                        {t('playground.upgradeToCreator')}
                      </p>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold"
                      >
                        <Crown size={20} />
                        {t('playground.upgradePlan')}
                      </Link>
                    </div>
                  ))}

                {/* CSS Tab */}
                {activeTab === 'css' &&
                  (isCreator ? (
                    <div className="space-y-6">
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">
                            Custom CSS
                          </h3>
                          <span className="text-xs text-foreground-muted font-mono">
                            {cssInput.length}/10000
                          </span>
                        </div>
                        <textarea
                          value={cssInput}
                          onChange={(e) => setCssInput(e.target.value)}
                          placeholder="/* Your custom CSS */&#10;.profile-card {&#10;  background: rgba(0, 0, 0, 0.5);&#10;}"
                          className="w-full h-80 px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground font-mono text-sm resize-none"
                          maxLength={10000}
                        />
                      </div>

                      <motion.button
                        onClick={() => cssMutation.mutate(cssInput)}
                        disabled={cssMutation.isPending}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {cssMutation.isPending ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        {t('common.save')}
                      </motion.button>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                      <Lock
                        size={48}
                        className="mx-auto mb-4 text-foreground-muted"
                      />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t('playground.creatorOnly')}
                      </h3>
                      <p className="text-foreground-muted mb-6">
                        {t('playground.upgradeToCreator')}
                      </p>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold"
                      >
                        <Crown size={20} />
                        {t('playground.upgradePlan')}
                      </Link>
                    </div>
                  ))}

                {/* Intro Gate Tab */}
                {activeTab === 'intro-gate' && (
                  <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-semibold text-foreground">Click-to-Enter Screen</h3>
                          <p className="text-sm text-foreground-muted mt-1">
                            Visitors must click to enter your profile. Great for music autoplay.
                          </p>
                        </div>
                        <button
                          onClick={() => setLocalIntroGate({ ...localIntroGate, enabled: !localIntroGate.enabled })}
                          className={`relative w-12 h-7 rounded-full transition-colors ${localIntroGate.enabled ? 'bg-primary' : 'bg-background-secondary border border-border'}`}
                        >
                          <motion.div
                            className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                            animate={{ left: localIntroGate.enabled ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      {localIntroGate.enabled && (
                        <div className="space-y-4 pt-4 border-t border-border">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Welcome Text</label>
                            <input
                              type="text"
                              value={localIntroGate.text}
                              onChange={(e) => setLocalIntroGate({ ...localIntroGate, text: e.target.value })}
                              placeholder="Welcome to my page..."
                              maxLength={200}
                              className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Button Text</label>
                            <input
                              type="text"
                              value={localIntroGate.buttonText}
                              onChange={(e) => setLocalIntroGate({ ...localIntroGate, buttonText: e.target.value })}
                              placeholder="Enter"
                              maxLength={50}
                              className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Style</label>
                            <div className="grid grid-cols-4 gap-3">
                              {(['minimal', 'blur', 'overlay', 'cinematic'] as const).map((style) => (
                                <button
                                  key={style}
                                  onClick={() => setLocalIntroGate({ ...localIntroGate, style })}
                                  className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                                    localIntroGate.style === style
                                      ? 'border-primary bg-primary/10 text-primary'
                                      : 'border-border bg-card text-foreground-muted hover:border-primary/50'
                                  }`}
                                >
                                  {style}
                                </button>
                              ))}
                            </div>
                          </div>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={localIntroGate.showAvatar}
                              onChange={(e) => setLocalIntroGate({ ...localIntroGate, showAvatar: e.target.checked })}
                              className="w-5 h-5 rounded-md border-border accent-primary"
                            />
                            <span className="text-sm text-foreground">Show avatar on intro screen</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <motion.button
                      onClick={() => introGateMutation.mutate(localIntroGate)}
                      disabled={introGateMutation.isPending}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {introGateMutation.isPending ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      {t('common.save')}
                    </motion.button>
                  </div>
                )}

                {/* Music Tab */}
                {activeTab === 'music' && (
                  <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-semibold text-foreground">Background Music</h3>
                          <p className="text-sm text-foreground-muted mt-1">
                            Play audio in the background when visitors view your profile.
                          </p>
                        </div>
                        <button
                          onClick={() => setLocalMusic({ ...localMusic, enabled: !localMusic.enabled })}
                          className={`relative w-12 h-7 rounded-full transition-colors ${localMusic.enabled ? 'bg-primary' : 'bg-background-secondary border border-border'}`}
                        >
                          <motion.div
                            className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                            animate={{ left: localMusic.enabled ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      {localMusic.enabled && (
                        <div className="space-y-4 pt-4 border-t border-border">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Audio / YouTube / Spotify URL</label>
                            <input
                              type="url"
                              placeholder="https://open.spotify.com/track/... or YouTube/direct audio URL"
                              value={localMusic.url}
                              onChange={(e) => setLocalMusic({ ...localMusic, url: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground"
                            />
                            <p className="text-xs text-foreground-muted mt-1">
                              Supports YouTube, Spotify (track/playlist/album), .mp3, .wav, .ogg, .m4a
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Volume: {Math.round(localMusic.volume * 100)}%
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={localMusic.volume}
                              onChange={(e) => setLocalMusic({ ...localMusic, volume: parseFloat(e.target.value) })}
                              className="w-full accent-primary"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-background-secondary border border-border">
                              <input
                                type="checkbox"
                                checked={localMusic.autoplay}
                                onChange={(e) => setLocalMusic({ ...localMusic, autoplay: e.target.checked })}
                                className="w-5 h-5 rounded-md border-border accent-primary"
                              />
                              <div>
                                <span className="text-sm font-medium text-foreground block">Autoplay</span>
                                <span className="text-xs text-foreground-muted">Requires intro gate</span>
                              </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-background-secondary border border-border">
                              <input
                                type="checkbox"
                                checked={localMusic.loop}
                                onChange={(e) => setLocalMusic({ ...localMusic, loop: e.target.checked })}
                                className="w-5 h-5 rounded-md border-border accent-primary"
                              />
                              <div>
                                <span className="text-sm font-medium text-foreground block">Loop</span>
                                <span className="text-xs text-foreground-muted">Repeat when done</span>
                              </div>
                            </label>
                          </div>

                          <p className="text-xs text-foreground-muted">
                            Music plays in the background when visitors open your profile. No visible player is shown.
                          </p>
                        </div>
                      )}
                    </div>

                    <motion.button
                      onClick={() => musicMutation.mutate(localMusic)}
                      disabled={musicMutation.isPending}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {musicMutation.isPending ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      {t('common.save')}
                    </motion.button>
                  </div>
                )}

                {/* Backups Tab */}
                {activeTab === 'backups' && (
                  <div className="space-y-8">
                    {/* Create Backup */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-4">
                        Create Backup
                      </h3>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={backupName}
                          onChange={(e) => setBackupName(e.target.value)}
                          placeholder="Backup name"
                          className="flex-1 px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground"
                        />
                        <motion.button
                          onClick={() => backupMutation.mutate(backupName)}
                          disabled={!backupName || backupMutation.isPending}
                          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2 disabled:opacity-50"
                          whileTap={{ scale: 0.99 }}
                        >
                          {backupMutation.isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Plus size={18} />
                          )}
                          Create
                        </motion.button>
                      </div>
                    </div>

                    {/* Backup List */}
                    {(settings?.profileBackups?.length ?? 0) > 0 && (
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-semibold text-foreground mb-4">
                          Your Backups
                        </h3>
                        <div className="space-y-3">
                          {settings?.profileBackups?.map(
                            (backup: {
                              id: string
                              name: string
                              createdAt: string
                            }) => (
                              <div
                                key={backup.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-background-secondary border border-border"
                              >
                                <div>
                                  <span className="font-medium text-foreground">
                                    {backup.name}
                                  </span>
                                  <span className="text-xs text-foreground-muted ml-3">
                                    {new Date(
                                      backup.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      restoreMutation.mutate(backup.id)
                                    }
                                    disabled={restoreMutation.isPending}
                                    className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                                  >
                                    Restore
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteMutation.mutate(backup.id)
                                    }
                                    disabled={deleteMutation.isPending}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
