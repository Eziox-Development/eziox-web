import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Link } from '@tanstack/react-router'
import { useTheme } from '@/components/layout/ThemeProvider'
import { toast } from 'sonner'
import {
  getCreatorSettingsFn,
  updateCustomCSSFn,
  addCustomFontFn,
  removeCustomFontFn,
  updateAnimatedProfileFn,
  updateOpenGraphFn,
} from '@/server/functions/creator-features'
import {
  Code,
  Type,
  Sparkles,
  Share2,
  Crown,
  Loader2,
  Save,
  Trash2,
  Plus,
  AlertCircle,
  ChevronRight,
  Wand2,
  Upload,
  Eye,
  Check,
  Globe,
} from 'lucide-react'
import {
  publishTemplateFn,
  getMyTemplatesFn,
  deleteTemplateFn,
} from '@/server/functions/templates'
import type {
  AnimatedProfileSettings,
  OpenGraphSettings,
} from '@/server/db/schema'

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
    name: 'Lato',
    url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
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
    name: 'Source Serif Pro',
    url: 'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap',
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
    name: 'Permanent Marker',
    url: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap',
    category: 'display',
  },
  {
    name: 'Orbitron',
    url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap',
    category: 'display',
  },
] as const

const TEMPLATE_CATEGORIES = [
  'vtuber',
  'gamer',
  'developer',
  'minimal',
  'creative',
  'business',
  'music',
  'art',
  'anime',
  'other',
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
  { value: 'gradient-shift', label: 'Gradient Shift' },
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

const DEFAULT_ANIMATED_SETTINGS: AnimatedProfileSettings = {
  enabled: false,
  avatarAnimation: 'none',
  bannerAnimation: 'none',
  linkHoverEffect: 'none',
  pageTransition: 'none',
}

const DEFAULT_OG_SETTINGS: OpenGraphSettings = {
  useCustom: false,
  title: '',
  description: '',
  image: '',
}

export function CreatorTab() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<
    'css' | 'fonts' | 'animations' | 'opengraph' | 'publish'
  >('css')
  const [showPresetFonts, setShowPresetFonts] = useState(true)
  const [previewFont, setPreviewFont] = useState<string | null>(null)
  const [publishName, setPublishName] = useState('')
  const [publishDesc, setPublishDesc] = useState('')
  const [publishCategory, setPublishCategory] =
    useState<(typeof TEMPLATE_CATEGORIES)[number]>('creative')
  const [publishPublic, setPublishPublic] = useState(true)
  const [cssInput, setCssInput] = useState('')
  const [cssErrors, setCssErrors] = useState<string[]>([])
  const [newFontName, setNewFontName] = useState('')
  const [newFontUrl, setNewFontUrl] = useState('')
  const [newFontType, setNewFontType] = useState<'display' | 'body'>('display')

  const getSettings = useServerFn(getCreatorSettingsFn)
  const updateCSS = useServerFn(updateCustomCSSFn)
  const addFont = useServerFn(addCustomFontFn)
  const removeFont = useServerFn(removeCustomFontFn)
  const updateAnimated = useServerFn(updateAnimatedProfileFn)
  const updateOG = useServerFn(updateOpenGraphFn)
  const publishTemplate = useServerFn(publishTemplateFn)
  const getMyTemplates = useServerFn(getMyTemplatesFn)
  const deleteTemplate = useServerFn(deleteTemplateFn)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['creatorSettings'],
    queryFn: () => getSettings(),
  })

  const [localAnimated, setLocalAnimated] = useState<AnimatedProfileSettings>(
    DEFAULT_ANIMATED_SETTINGS,
  )
  const [localOG, setLocalOG] = useState<OpenGraphSettings>(DEFAULT_OG_SETTINGS)

  useEffect(() => {
    if (settings?.customCSS) setCssInput(settings.customCSS)
    if (settings?.animatedProfile) setLocalAnimated(settings.animatedProfile)
    if (settings?.openGraphSettings) setLocalOG(settings.openGraphSettings)
  }, [settings])

  const cssMutation = useMutation({
    mutationFn: (css: string) => updateCSS({ data: { css } }),
    onSuccess: (result) => {
      if (result.errors && result.errors.length > 0) {
        setCssErrors(result.errors)
        toast.warning('CSS saved with warnings', {
          description: 'Some patterns were removed for security.',
        })
      } else {
        setCssErrors([])
        toast.success('Custom CSS saved!', {
          description: 'Your bio page has been updated.',
        })
      }
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to save CSS', { description: 'Please try again.' })
    },
  })

  const fontMutation = useMutation({
    mutationFn: (font: {
      name: string
      url: string
      type: 'display' | 'body'
    }) => addFont({ data: { id: crypto.randomUUID(), ...font } }),
    onSuccess: () => {
      toast.success('Font added!', {
        description: `"${newFontName}" is now available.`,
      })
      setNewFontName('')
      setNewFontUrl('')
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to add font', {
        description: 'Please check the URL and try again.',
      })
    },
  })

  const removeFontMutation = useMutation({
    mutationFn: (fontId: string) => removeFont({ data: { fontId } }),
    onSuccess: () => {
      toast.success('Font removed')
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to remove font')
    },
  })

  const animatedMutation = useMutation({
    mutationFn: (data: AnimatedProfileSettings) => updateAnimated({ data }),
    onSuccess: () => {
      toast.success('Animation settings saved!', {
        description: 'Your bio page has been updated.',
      })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to save', { description: 'Please try again.' })
    },
  })

  const ogMutation = useMutation({
    mutationFn: (data: OpenGraphSettings) => updateOG({ data }),
    onSuccess: () => {
      toast.success('Open Graph settings saved!', {
        description: 'Social previews have been updated.',
      })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to save', { description: 'Please try again.' })
    },
  })

  const { data: myTemplates } = useQuery({
    queryKey: ['myTemplates'],
    queryFn: () => getMyTemplates(),
    enabled: settings?.isCreator,
  })

  const publishMutation = useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      category: (typeof TEMPLATE_CATEGORIES)[number]
      isPublic: boolean
    }) => publishTemplate({ data }),
    onSuccess: () => {
      toast.success('Template published!', {
        description: 'Your style is now available in the community.',
      })
      setPublishName('')
      setPublishDesc('')
      void queryClient.invalidateQueries({ queryKey: ['myTemplates'] })
    },
    onError: () => {
      toast.error('Failed to publish', { description: 'Please try again.' })
    },
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate({ data: { id } }),
    onSuccess: () => {
      toast.success('Template deleted')
      void queryClient.invalidateQueries({ queryKey: ['myTemplates'] })
    },
    onError: () => {
      toast.error('Failed to delete')
    },
  })

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: theme.colors.primary }}
        />
      </motion.div>
    )
  }

  if (!settings?.isCreator) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #ec489920, #8b5cf620)',
          }}
        >
          <Wand2 size={40} style={{ color: '#ec4899' }} />
        </div>
        <h2
          className="text-2xl font-bold mb-3"
          style={{ color: theme.colors.foreground }}
        >
          Unlock Creator Features
        </h2>
        <p
          className="text-sm mb-6 max-w-md mx-auto"
          style={{ color: theme.colors.foregroundMuted }}
        >
          Custom CSS, fonts, animations, and advanced controls are available
          with Creator tier.
        </p>
        <Link
          to="/profile"
          search={{ tab: 'subscription' }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            color: '#fff',
          }}
        >
          <Crown size={18} />
          Upgrade to Creator
          <ChevronRight size={16} />
        </Link>
      </motion.div>
    )
  }

  const currentCSS = cssInput || settings?.customCSS || ''
  const currentAnimated = localAnimated.enabled
    ? localAnimated
    : settings?.animatedProfile || DEFAULT_ANIMATED_SETTINGS
  const currentOG = localOG.useCustom
    ? localOG
    : settings?.openGraphSettings || DEFAULT_OG_SETTINGS

  return (
    <motion.div
      key="creator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div
        className="flex items-center rounded-xl p-1"
        style={{
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {[
          { id: 'css', label: 'CSS', icon: Code },
          { id: 'fonts', label: 'Fonts', icon: Type },
          { id: 'animations', label: 'Animations', icon: Sparkles },
          { id: 'opengraph', label: 'OG', icon: Share2 },
          { id: 'publish', label: 'Publish', icon: Upload },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveSection(id as typeof activeSection)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                activeSection === id
                  ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                  : 'transparent',
              color:
                activeSection === id ? '#fff' : theme.colors.foregroundMuted,
            }}
            whileHover={{ scale: activeSection === id ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'css' && (
          <motion.div
            key="css"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-5 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(236, 72, 153, 0.15)' }}
                >
                  <Code size={20} style={{ color: '#ec4899' }} />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    Custom CSS
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Add custom styles to your profile (sandboxed)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative">
                <textarea
                  value={currentCSS}
                  onChange={(e) => setCssInput(e.target.value)}
                  placeholder={`/* Your custom CSS here */\n.profile-card {\n  border-radius: 20px;\n}`}
                  className="w-full h-64 px-4 py-3 rounded-xl text-sm font-mono resize-none"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
                <div
                  className="absolute bottom-3 right-3 text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {currentCSS.length}/10000
                </div>
              </div>

              {cssErrors.length > 0 && (
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} style={{ color: '#ef4444' }} />
                    <span
                      className="text-sm font-medium"
                      style={{ color: '#ef4444' }}
                    >
                      CSS Validation Warnings
                    </span>
                  </div>
                  <ul
                    className="text-xs space-y-1"
                    style={{ color: '#fca5a5' }}
                  >
                    {cssErrors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  onClick={() => cssMutation.mutate(currentCSS)}
                  disabled={cssMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    color: '#fff',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cssMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save CSS
                </motion.button>
                <motion.button
                  onClick={() => {
                    setCssInput('')
                    cssMutation.mutate('')
                  }}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foregroundMuted,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'fonts' && (
          <motion.div
            key="fonts"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-5 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                >
                  <Type size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    Custom Fonts
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Add Google Fonts or custom font URLs
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowPresetFonts(true)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: showPresetFonts
                      ? theme.colors.primary
                      : theme.colors.backgroundSecondary,
                    color: showPresetFonts
                      ? '#fff'
                      : theme.colors.foregroundMuted,
                  }}
                >
                  Preset Fonts
                </button>
                <button
                  onClick={() => setShowPresetFonts(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: !showPresetFonts
                      ? theme.colors.primary
                      : theme.colors.backgroundSecondary,
                    color: !showPresetFonts
                      ? '#fff'
                      : theme.colors.foregroundMuted,
                  }}
                >
                  Custom URL
                </button>
              </div>

              {showPresetFonts ? (
                <div className="space-y-3">
                  {previewFont && (
                    <link
                      rel="stylesheet"
                      href={
                        PRESET_FONTS.find((f) => f.name === previewFont)?.url
                      }
                    />
                  )}
                  {['sans-serif', 'serif', 'mono', 'display'].map(
                    (category) => (
                      <div key={category}>
                        <p
                          className="text-xs font-medium uppercase tracking-wider mb-2"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {category === 'sans-serif'
                            ? 'Sans Serif'
                            : category === 'mono'
                              ? 'Monospace'
                              : category.charAt(0).toUpperCase() +
                                category.slice(1)}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {PRESET_FONTS.filter(
                            (f) => f.category === category,
                          ).map((font) => {
                            const isAdded = settings?.customFonts?.some(
                              (cf) => cf.name === font.name,
                            )
                            return (
                              <button
                                key={font.name}
                                onMouseEnter={() => setPreviewFont(font.name)}
                                onMouseLeave={() => setPreviewFont(null)}
                                onClick={() =>
                                  !isAdded &&
                                  fontMutation.mutate({
                                    name: font.name,
                                    url: font.url,
                                    type:
                                      category === 'display'
                                        ? 'display'
                                        : 'body',
                                  })
                                }
                                disabled={
                                  isAdded ||
                                  fontMutation.isPending ||
                                  (settings?.customFonts?.length || 0) >= 4
                                }
                                className="p-3 rounded-xl text-left transition-all disabled:opacity-50"
                                style={{
                                  background: isAdded
                                    ? `${theme.colors.primary}20`
                                    : theme.colors.backgroundSecondary,
                                  border: `1px solid ${isAdded ? theme.colors.primary : theme.colors.border}`,
                                  fontFamily:
                                    previewFont === font.name
                                      ? `'${font.name}', ${category}`
                                      : 'inherit',
                                }}
                              >
                                <p
                                  className="text-sm font-medium truncate"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  {font.name}
                                </p>
                                {isAdded && (
                                  <Check
                                    size={12}
                                    className="mt-1"
                                    style={{ color: theme.colors.primary }}
                                  />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Font name"
                    value={newFontName}
                    onChange={(e) => setNewFontName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  />
                  <input
                    type="url"
                    placeholder="Google Fonts URL"
                    value={newFontUrl}
                    onChange={(e) => setNewFontUrl(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  />
                  <div className="flex gap-2">
                    <select
                      value={newFontType}
                      onChange={(e) =>
                        setNewFontType(e.target.value as 'display' | 'body')
                      }
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        color: theme.colors.foreground,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <option value="display">Display</option>
                      <option value="body">Body</option>
                    </select>
                    <motion.button
                      onClick={() =>
                        newFontName &&
                        newFontUrl &&
                        fontMutation.mutate({
                          name: newFontName,
                          url: newFontUrl,
                          type: newFontType,
                        })
                      }
                      disabled={
                        !newFontName || !newFontUrl || fontMutation.isPending
                      }
                      className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: '#fff',
                      }}
                      whileHover={{
                        scale: newFontName && newFontUrl ? 1.02 : 1,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {fontMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {settings?.customFonts && settings.customFonts.length > 0 && (
                <div
                  className="pt-4 border-t"
                  style={{ borderColor: theme.colors.border }}
                >
                  <p
                    className="text-xs font-medium mb-3"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Your Fonts ({settings.customFonts.length}/4)
                  </p>
                  <div className="space-y-2">
                    {settings.customFonts.map((font) => (
                      <div
                        key={font.id}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: theme.colors.backgroundSecondary }}
                      >
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: theme.colors.foreground }}
                          >
                            {font.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {font.type} font
                          </p>
                        </div>
                        <motion.button
                          onClick={() => removeFontMutation.mutate(font.id)}
                          disabled={removeFontMutation.isPending}
                          className="p-2 rounded-lg transition-all hover:bg-white/10"
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
            </div>
          </motion.div>
        )}

        {activeSection === 'animations' && (
          <motion.div
            key="animations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-5 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Sparkles size={20} style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <h3
                      className="font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      Animated Profile
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Add micro-interactions and effects
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Enable
                  </span>
                  <div
                    className="relative w-12 h-6 rounded-full transition-all cursor-pointer"
                    style={{
                      background: currentAnimated.enabled
                        ? '#22c55e'
                        : theme.colors.backgroundSecondary,
                    }}
                    onClick={() =>
                      setLocalAnimated({
                        ...currentAnimated,
                        enabled: !currentAnimated.enabled,
                      })
                    }
                  >
                    <div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: currentAnimated.enabled ? '28px' : '4px' }}
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Avatar Animation
                  </label>
                  <select
                    value={currentAnimated.avatarAnimation}
                    onChange={(e) =>
                      setLocalAnimated({
                        ...currentAnimated,
                        avatarAnimation: e.target
                          .value as AnimatedProfileSettings['avatarAnimation'],
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {AVATAR_ANIMATIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Banner Animation
                  </label>
                  <select
                    value={currentAnimated.bannerAnimation}
                    onChange={(e) =>
                      setLocalAnimated({
                        ...currentAnimated,
                        bannerAnimation: e.target
                          .value as AnimatedProfileSettings['bannerAnimation'],
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {BANNER_ANIMATIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Link Hover Effect
                  </label>
                  <select
                    value={currentAnimated.linkHoverEffect}
                    onChange={(e) =>
                      setLocalAnimated({
                        ...currentAnimated,
                        linkHoverEffect: e.target
                          .value as AnimatedProfileSettings['linkHoverEffect'],
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {LINK_HOVER_EFFECTS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Page Transition
                  </label>
                  <select
                    value={currentAnimated.pageTransition}
                    onChange={(e) =>
                      setLocalAnimated({
                        ...currentAnimated,
                        pageTransition: e.target
                          .value as AnimatedProfileSettings['pageTransition'],
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {PAGE_TRANSITIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <motion.button
                onClick={() => animatedMutation.mutate(currentAnimated)}
                disabled={animatedMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {animatedMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Animation Settings
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeSection === 'opengraph' && (
          <motion.div
            key="opengraph"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-5 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(59, 130, 246, 0.15)' }}
                  >
                    <Share2 size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <h3
                      className="font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      Custom Open Graph
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Control how your profile appears when shared
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Custom
                  </span>
                  <div
                    className="relative w-12 h-6 rounded-full transition-all cursor-pointer"
                    style={{
                      background: currentOG.useCustom
                        ? '#3b82f6'
                        : theme.colors.backgroundSecondary,
                    }}
                    onClick={() =>
                      setLocalOG({
                        ...currentOG,
                        useCustom: !currentOG.useCustom,
                      })
                    }
                  >
                    <div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: currentOG.useCustom ? '28px' : '4px' }}
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label
                  className="text-sm font-medium mb-2 block"
                  style={{ color: theme.colors.foreground }}
                >
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Custom title for social sharing"
                  value={currentOG.title || ''}
                  onChange={(e) =>
                    setLocalOG({ ...currentOG, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
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
                  placeholder="Custom description for social sharing"
                  value={currentOG.description || ''}
                  onChange={(e) =>
                    setLocalOG({ ...currentOG, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm resize-none"
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
                  type="url"
                  placeholder="https://example.com/og-image.jpg"
                  value={currentOG.image || ''}
                  onChange={(e) =>
                    setLocalOG({ ...currentOG, image: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              </div>

              {currentOG.image && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${theme.colors.border}` }}
                >
                  <div
                    className="p-3"
                    style={{ background: theme.colors.backgroundSecondary }}
                  >
                    <p
                      className="text-xs font-medium"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Preview
                    </p>
                  </div>
                  <img
                    src={currentOG.image}
                    alt="OG Preview"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              <motion.button
                onClick={() => ogMutation.mutate(currentOG)}
                disabled={ogMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {ogMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Open Graph Settings
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeSection === 'publish' && (
          <motion.div
            key="publish"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                className="p-5 border-b"
                style={{ borderColor: theme.colors.border }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(249, 115, 22, 0.15)' }}
                  >
                    <Globe size={20} style={{ color: '#f97316' }} />
                  </div>
                  <div>
                    <h3
                      className="font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      Publish Template
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Share your style with the community
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Template Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Awesome Style"
                    value={publishName}
                    onChange={(e) => setPublishName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
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
                    placeholder="Describe your template style..."
                    value={publishDesc}
                    onChange={(e) => setPublishDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl text-sm resize-none"
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
                    Category
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setPublishCategory(cat)}
                        className="py-2 rounded-lg text-xs font-medium capitalize transition-all"
                        style={{
                          background:
                            publishCategory === cat
                              ? theme.colors.primary
                              : theme.colors.backgroundSecondary,
                          color:
                            publishCategory === cat
                              ? '#fff'
                              : theme.colors.foregroundMuted,
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="relative w-12 h-6 rounded-full transition-all"
                    style={{
                      background: publishPublic
                        ? '#22c55e'
                        : theme.colors.backgroundSecondary,
                    }}
                    onClick={() => setPublishPublic(!publishPublic)}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: publishPublic ? '28px' : '4px' }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: theme.colors.foreground }}
                    >
                      Public Template
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Allow others to use your style
                    </p>
                  </div>
                </label>

                <motion.button
                  onClick={() =>
                    publishName &&
                    publishMutation.mutate({
                      name: publishName,
                      description: publishDesc || undefined,
                      category: publishCategory,
                      isPublic: publishPublic,
                    })
                  }
                  disabled={!publishName || publishMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#fff',
                  }}
                  whileHover={{ scale: publishName ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {publishMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Publish Template
                </motion.button>
              </div>
            </div>

            {myTemplates && myTemplates.length > 0 && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  className="p-5 border-b"
                  style={{ borderColor: theme.colors.border }}
                >
                  <h3
                    className="font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    Your Published Templates
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {myTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="font-medium text-sm truncate"
                            style={{ color: theme.colors.foreground }}
                          >
                            {template.name}
                          </p>
                          {template.isPublic ? (
                            <Globe size={12} style={{ color: '#22c55e' }} />
                          ) : (
                            <Eye
                              size={12}
                              style={{ color: theme.colors.foregroundMuted }}
                            />
                          )}
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {template.uses || 0} uses • {template.likes || 0}{' '}
                          likes • {template.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/templates"
                          className="p-2 rounded-lg transition-all hover:bg-white/10"
                        >
                          <Eye
                            size={16}
                            style={{ color: theme.colors.foregroundMuted }}
                          />
                        </Link>
                        <motion.button
                          onClick={() =>
                            deleteTemplateMutation.mutate(template.id)
                          }
                          disabled={deleteTemplateMutation.isPending}
                          className="p-2 rounded-lg transition-all hover:bg-white/10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} style={{ color: '#ef4444' }} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="p-4 rounded-xl"
              style={{
                background: `${theme.colors.primary}10`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <p className="text-sm" style={{ color: theme.colors.foreground }}>
                <strong>Tip:</strong> Publishing a template saves your current
                background, layout, CSS, fonts, and animation settings. Other
                users can apply your style to their profiles with one click!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
