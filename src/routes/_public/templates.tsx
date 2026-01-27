import { useState, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  getPublicTemplatesFn,
  getFeaturedTemplatesFn,
  applyTemplateFn,
  likeTemplateFn,
} from '@/server/functions/templates'
import {
  updateCustomBackgroundFn,
  updateLayoutSettingsFn,
} from '@/server/functions/profile-settings'
import {
  updateAnimatedProfileFn,
  updateCustomCSSFn,
} from '@/server/functions/creator-features'
import {
  EZIOX_PRESET_TEMPLATES,
  getPresetTemplatesByCategory,
  searchPresetTemplates,
  getPresetTemplateStats,
  type PresetTemplate,
} from '@/lib/preset-templates'
import {
  Search,
  Heart,
  Download,
  Sparkles,
  LayoutGrid,
  List,
  Crown,
  Loader2,
  Eye,
  User,
  Palette,
  Code2,
  Gamepad2,
  Music4,
  Paintbrush,
  Briefcase,
  Monitor,
  Star,
  Layers,
  X,
  TrendingUp,
  Zap,
} from 'lucide-react'

export const Route = createFileRoute('/_public/templates')({
  component: TemplatesPage,
  head: () => ({
    meta: [
      { title: 'Community Templates | Eziox' },
      {
        name: 'description',
        content:
          'Browse and apply community-created profile templates. Find the perfect style for your bio page.',
      },
      { property: 'og:title', content: 'Community Templates | Eziox' },
      {
        property: 'og:description',
        content:
          'Discover stunning profile styles created by the community.',
      },
    ],
  }),
})

const CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid, color: '#6366f1' },
  { id: 'vtuber', label: 'VTuber', icon: Sparkles, color: '#ec4899' },
  { id: 'gamer', label: 'Gamer', icon: Gamepad2, color: '#22c55e' },
  { id: 'developer', label: 'Developer', icon: Code2, color: '#3b82f6' },
  { id: 'minimal', label: 'Minimal', icon: Monitor, color: '#6b7280' },
  { id: 'creative', label: 'Creative', icon: Paintbrush, color: '#f59e0b' },
  { id: 'business', label: 'Business', icon: Briefcase, color: '#14b8a6' },
  { id: 'music', label: 'Music', icon: Music4, color: '#8b5cf6' },
  { id: 'art', label: 'Art', icon: Palette, color: '#ef4444' },
  { id: 'anime', label: 'Anime', icon: Star, color: '#f472b6' },
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular', icon: TrendingUp },
  { value: 'likes', label: 'Liked', icon: Heart },
  { value: 'newest', label: 'New', icon: Zap },
]

function TemplatesPage() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<'popular' | 'newest' | 'likes'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedPresetTemplate, setSelectedPresetTemplate] = useState<PresetTemplate | null>(null)

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  const getTemplates = useServerFn(getPublicTemplatesFn)
  const getFeatured = useServerFn(getFeaturedTemplatesFn)
  const applyTemplate = useServerFn(applyTemplateFn)
  const likeTemplate = useServerFn(likeTemplateFn)

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['templates', category, search, sort],
    queryFn: () =>
      getTemplates({
        data: {
          category: category === 'all' ? undefined : category,
          search: search || undefined,
          sort,
          limit: 30,
        },
      }),
  })

  const { data: featuredTemplates } = useQuery({
    queryKey: ['featuredTemplates'],
    queryFn: () => getFeatured(),
  })

  const applyMutation = useMutation({
    mutationFn: (templateId: string) => applyTemplate({ data: { templateId } }),
    onSuccess: () => {
      toast.success('Template applied!', {
        description: 'Your profile has been updated with the new style.',
      })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
    onError: (error: { message?: string }) => {
      if (error.message?.includes('Pro tier')) {
        toast.error('Pro tier required', {
          description: 'Upgrade to apply community templates.',
        })
      } else {
        toast.error('Failed to apply template')
      }
    },
  })

  const likeMutation = useMutation({
    mutationFn: (templateId: string) => likeTemplate({ data: { templateId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  // Server functions for applying preset templates
  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)
  const updateAnimated = useServerFn(updateAnimatedProfileFn)
  const updateCSS = useServerFn(updateCustomCSSFn)

  const canApply = !!(
    currentUser &&
    ['pro', 'creator', 'lifetime'].includes(currentUser.tier || 'free')
  )

  // Handle applying preset templates
  const handleApplyPreset = async (template: PresetTemplate) => {
    if (!canApply) {
      toast.error('Pro tier required', { description: 'Upgrade to apply templates.' })
      return
    }
    try {
      if (template.settings.customBackground) {
        await updateBackground({ data: template.settings.customBackground as Parameters<typeof updateBackground>[0]['data'] })
      }
      if (template.settings.layoutSettings) {
        await updateLayout({ data: template.settings.layoutSettings as Parameters<typeof updateLayout>[0]['data'] })
      }
      if (template.settings.animatedProfile) {
        await updateAnimated({ data: template.settings.animatedProfile as Parameters<typeof updateAnimated>[0]['data'] })
      }
      if (template.settings.customCSS) {
        await updateCSS({ data: { css: template.settings.customCSS } })
      }
      toast.success('Template applied!', { description: `"${template.name}" has been applied.` })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    } catch {
      toast.error('Failed to apply template')
    }
  }

  // Get filtered preset templates
  const filteredPresetTemplates = useMemo(() => {
    let presets = category === 'all' ? EZIOX_PRESET_TEMPLATES : getPresetTemplatesByCategory(category)
    if (search) {
      const results = searchPresetTemplates(search)
      presets = presets.filter(p => results.some(r => r.id === p.id))
    }
    return presets
  }, [category, search])

  // Stats
  const presetStats = useMemo(() => getPresetTemplateStats(), [])
  const totalUses = templatesData?.templates?.reduce((acc, t) => acc + (t.uses || 0), 0) || 0
  const totalLikes = templatesData?.templates?.reduce((acc, t) => acc + (t.likes || 0), 0) || 0
  const totalTemplates = (templatesData?.total || 0) + presetStats.total
  const totalFeatured = (featuredTemplates?.length || 0) + presetStats.featured

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Palette size={18} style={{ color: theme.colors.primary }} />
              </motion.div>
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                Community Templates
              </span>
              <Sparkles size={14} style={{ color: theme.colors.accent }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Find Your Perfect{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Style
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg lg:text-xl max-w-2xl mx-auto mb-10"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Discover stunning profile templates created by the community.
              One click to transform your bio page.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {[
                {
                  value: totalTemplates,
                  label: 'Templates',
                  icon: Layers,
                  color: theme.colors.primary,
                },
                { value: totalUses, label: 'Uses', icon: Download, color: '#22c55e' },
                { value: totalLikes, label: 'Likes', icon: Heart, color: '#ef4444' },
                {
                  value: totalFeatured,
                  label: 'Featured',
                  icon: Star,
                  color: '#fbbf24',
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="px-5 py-3 text-center"
                  style={{
                    background:
                      theme.effects.cardStyle === 'glass'
                        ? `${theme.colors.card}90`
                        : theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: cardRadius,
                    backdropFilter:
                      theme.effects.cardStyle === 'glass'
                        ? 'blur(20px)'
                        : undefined,
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon size={16} style={{ color: stat.color }} />
                    <p
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters Section */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-5"
            style={{
              background:
                theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}90`
                  : theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
              backdropFilter:
                theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <input
                  type="text"
                  placeholder="Search templates by name, creator, or style..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: cardRadius,
                  }}
                />
              </div>

              {/* Sort & View Controls */}
              <div className="flex items-center gap-3">
                <div
                  className="hidden lg:flex items-center gap-1 p-1.5"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    borderRadius: cardRadius,
                  }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setSort(option.value as typeof sort)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium"
                      style={{
                        background:
                          sort === option.value
                            ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                            : 'transparent',
                        color:
                          sort === option.value
                            ? '#fff'
                            : theme.colors.foregroundMuted,
                        borderRadius: `calc(${cardRadius} - 6px)`,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <option.icon size={12} />
                      {option.label}
                    </motion.button>
                  ))}
                </div>

                <div
                  className="flex overflow-hidden"
                  style={{
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: cardRadius,
                  }}
                >
                  {[
                    { mode: 'grid' as const, icon: LayoutGrid },
                    { mode: 'list' as const, icon: List },
                  ].map(({ mode, icon: Icon }) => (
                    <motion.button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="p-3"
                      style={{
                        background:
                          viewMode === mode
                            ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                            : theme.colors.backgroundSecondary,
                        color:
                          viewMode === mode
                            ? '#fff'
                            : theme.colors.foregroundMuted,
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Icon size={16} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div
              className="mt-5 pt-5 flex flex-wrap gap-2"
              style={{ borderTop: `1px solid ${theme.colors.border}` }}
            >
              {CATEGORIES.map(({ id, label, icon: Icon, color }) => (
                <motion.button
                  key={id}
                  onClick={() => setCategory(id)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium"
                  style={{
                    background: category === id ? `${color}20` : 'transparent',
                    color:
                      category === id ? color : theme.colors.foregroundMuted,
                    border: `1px solid ${category === id ? `${color}50` : theme.colors.border}`,
                    borderRadius: cardRadius,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon
                    size={14}
                    style={{
                      color:
                        category === id ? color : theme.colors.foregroundMuted,
                    }}
                  />
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mb-4"
              >
                <Loader2 size={40} style={{ color: theme.colors.primary }} />
              </motion.div>
              <p style={{ color: theme.colors.foregroundMuted }}>
                Loading templates...
              </p>
            </div>
          ) : (filteredPresetTemplates.length > 0 || (templatesData?.templates && templatesData.templates.length > 0)) ? (
            <motion.div
              className="p-5 mt-4"
              style={{
                background: theme.effects.cardStyle === 'glass' ? `${theme.colors.card}90` : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
                backdropFilter: theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'
                    : 'space-y-4'
                }
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              >
                {/* Eziox Official Templates */}
                {filteredPresetTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <TemplateCard
                      template={{
                        id: template.id,
                        name: template.name,
                        description: template.description,
                        category: template.category,
                        settings: template.settings,
                        previewImage: template.previewImage,
                        uses: null,
                        likes: null,
                        userName: 'Eziox',
                        userUsername: 'eziox',
                      }}
                      theme={theme}
                      onApply={() => handleApplyPreset(template)}
                      onLike={() => {}}
                      onPreview={() => setSelectedPresetTemplate(template)}
                      canApply={canApply}
                      isApplying={applyMutation.isPending}
                      featured={template.featured}
                      listView={viewMode === 'list'}
                      cardRadius={cardRadius}
                      glowOpacity={glowOpacity}
                      isOfficial
                    />
                  </motion.div>
                ))}
                {/* Community Templates */}
                {templatesData?.templates?.map((template) => (
                  <motion.div
                    key={template.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <TemplateCard
                      template={template}
                      theme={theme}
                      onApply={() => applyMutation.mutate(template.id)}
                      onLike={() => likeMutation.mutate(template.id)}
                      onPreview={() => setSelectedTemplate(template.id)}
                      canApply={canApply}
                      isApplying={applyMutation.isPending}
                      listView={viewMode === 'list'}
                      cardRadius={cardRadius}
                      glowOpacity={glowOpacity}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
                backdropFilter:
                  theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
              }}
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${theme.colors.primary}15` }}
              >
                <Layers
                  size={48}
                  style={{ color: theme.colors.primary, opacity: 0.6 }}
                />
              </div>
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: theme.colors.foreground }}
              >
                No templates found
              </h3>
              <p
                className="text-sm mb-8 text-center max-w-md"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Try adjusting your filters or search terms to find what you're
                looking for
              </p>
              <div className="flex gap-4">
                <motion.button
                  onClick={() => {
                    setSearch('')
                    setCategory('all')
                  }}
                  className="px-6 py-3 font-medium text-sm"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    borderRadius: cardRadius,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Clear Filters
                </motion.button>
                {!currentUser && (
                  <Link to="/sign-up">
                    <motion.div
                      className="px-6 py-3 font-medium text-sm flex items-center gap-2 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        borderRadius: cardRadius,
                        boxShadow:
                          glowOpacity > 0
                            ? `0 10px 30px ${theme.colors.primary}40`
                            : undefined,
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Crown size={16} />
                      Sign up to create
                    </motion.div>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedTemplate && (
          <TemplatePreviewModal
            templateId={selectedTemplate}
            theme={theme}
            onClose={() => setSelectedTemplate(null)}
            onApply={() => {
              applyMutation.mutate(selectedTemplate)
              setSelectedTemplate(null)
            }}
            canApply={canApply}
          />
        )}
        {selectedPresetTemplate && (
          <PresetTemplatePreviewModal
            template={selectedPresetTemplate}
            theme={theme}
            onClose={() => setSelectedPresetTemplate(null)}
            onApply={() => {
              void handleApplyPreset(selectedPresetTemplate)
              setSelectedPresetTemplate(null)
            }}
            canApply={canApply}
            cardRadius={cardRadius}
            glowOpacity={glowOpacity}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface TemplateCardProps {
  template: {
    id: string
    name: string
    description?: string | null
    category: string
    settings: unknown
    previewImage?: string | null
    uses?: number | null
    likes?: number | null
    userName?: string | null
    userUsername?: string | null
  }
  theme: ReturnType<typeof useTheme>['theme']
  onApply: () => void
  onLike: () => void
  onPreview: () => void
  canApply: boolean
  isApplying: boolean
  featured?: boolean
  listView?: boolean
  cardRadius: string
  glowOpacity: number
  isOfficial?: boolean
}

function TemplateCard({
  template,
  theme,
  onApply,
  onLike,
  onPreview,
  canApply,
  isApplying,
  featured,
  listView,
  cardRadius,
  glowOpacity,
  isOfficial,
}: TemplateCardProps) {
  const settings = template.settings as {
    accentColor?: string
    customBackground?: { type: string; value?: string; imageUrl?: string }
    customCSS?: string
    animatedProfile?: { enabled?: boolean }
  }
  const accentColor = settings?.accentColor || theme.colors.primary
  const bgPreview =
    settings?.customBackground?.type === 'image' &&
    settings.customBackground.imageUrl
      ? `url(${settings.customBackground.imageUrl}) center/cover`
      : settings?.customBackground?.type === 'gradient'
        ? settings.customBackground.value
        : settings?.customBackground?.type === 'solid'
          ? settings.customBackground.value
          : `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`

  const hasCreatorFeatures = !!(
    settings?.customCSS || settings?.animatedProfile?.enabled
  )
  const requiredTier = isOfficial ? 'Official' : hasCreatorFeatures ? 'Creator' : 'Pro'
  const tierColor = isOfficial ? theme.colors.primary : hasCreatorFeatures ? '#f59e0b' : '#3b82f6'
  const categoryData = CATEGORIES.find((c) => c.id === template.category)

  if (listView) {
    return (
      <motion.div
        className="flex items-center gap-4 p-4 group cursor-pointer"
        style={{
          background:
            theme.effects.cardStyle === 'glass'
              ? `${theme.colors.card}90`
              : theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: cardRadius,
          backdropFilter:
            theme.effects.cardStyle === 'glass' ? 'blur(10px)' : undefined,
        }}
        whileHover={{ scale: 1.01, x: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onPreview}
      >
        <div
          className="w-20 h-20 shrink-0 relative overflow-hidden"
          style={{ background: bgPreview, borderRadius: `calc(${cardRadius} - 8px)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
            <Eye size={20} className="text-white" />
          </div>
          <div
            className="absolute top-1.5 left-1.5 px-2 py-0.5 text-[9px] font-bold flex items-center gap-1 backdrop-blur-md"
            style={{ background: `${tierColor}dd`, color: '#fff', borderRadius: '6px' }}
          >
            <Crown size={9} />
            {requiredTier[0]}
          </div>
          {featured && (
            <div className="absolute top-1.5 right-1.5">
              <Sparkles size={14} className="text-yellow-400 drop-shadow-lg" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3
              className="font-bold text-sm truncate"
              style={{ color: theme.colors.foreground }}
            >
              {template.name}
            </h3>
            {categoryData && (
              <span
                className="px-2 py-0.5 text-[10px] font-medium flex items-center gap-1"
                style={{
                  background: `${categoryData.color}15`,
                  color: categoryData.color,
                  borderRadius: '6px',
                }}
              >
                <categoryData.icon size={10} />
                {categoryData.label}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <span className="flex items-center gap-1.5">
              <User size={12} />
              {template.userUsername || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1.5">
              <Download size={12} />
              {template.uses || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart size={12} />
              {template.likes || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onLike()
            }}
            className="p-2.5"
            style={{ background: theme.colors.backgroundSecondary, borderRadius: cardRadius }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Heart size={18} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
            disabled={!canApply || isApplying}
            className="px-5 py-2.5 font-medium text-sm disabled:opacity-50 flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              color: '#fff',
              borderRadius: cardRadius,
              boxShadow:
                glowOpacity > 0 ? `0 8px 20px ${theme.colors.primary}30` : undefined,
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {isApplying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Apply
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="overflow-hidden group cursor-pointer relative"
      style={{
        background:
          theme.effects.cardStyle === 'glass'
            ? `${theme.colors.card}90`
            : theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: cardRadius,
        backdropFilter:
          theme.effects.cardStyle === 'glass' ? 'blur(10px)' : undefined,
      }}
      whileHover={{ scale: 1.03, y: -6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onPreview}
    >
      {/* Preview Image */}
      <div
        className="h-32 relative overflow-hidden"
        style={{ background: bgPreview }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <div
            className="px-2 py-1 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md"
            style={{ background: `${tierColor}dd`, color: '#fff', borderRadius: '8px' }}
          >
            <Crown size={10} />
            {requiredTier}+
          </div>
          {featured && (
            <div
              className="px-2 py-1 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md"
              style={{ background: 'rgba(251, 191, 36, 0.9)', color: '#fff', borderRadius: '8px' }}
            >
              <Sparkles size={10} />
              Featured
            </div>
          )}
        </div>

        {/* Hover Preview Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <motion.div
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Eye size={24} className="text-white" />
          </motion.div>
        </div>

        {/* Template Name */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <h3 className="font-bold text-sm text-white truncate drop-shadow-lg">
            {template.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <User size={12} style={{ color: theme.colors.foregroundMuted }} />
            <span
              className="text-xs truncate max-w-[80px]"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {template.userUsername || 'Anonymous'}
            </span>
          </div>
          {categoryData && (
            <span
              className="px-2 py-0.5 text-[9px] font-medium"
              style={{
                background: `${categoryData.color}15`,
                color: categoryData.color,
                borderRadius: '6px',
              }}
            >
              {categoryData.label}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <span className="flex items-center gap-1">
              <Download size={12} />
              {template.uses || 0}
            </span>
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                onLike()
              }}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Heart size={12} />
              {template.likes || 0}
            </motion.button>
          </div>
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
            disabled={!canApply || isApplying}
            className="px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              color: '#fff',
              borderRadius: `calc(${cardRadius} - 6px)`,
              boxShadow:
                glowOpacity > 0 ? `0 4px 12px ${theme.colors.primary}30` : undefined,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {isApplying ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              'Apply'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

interface TemplatePreviewModalProps {
  templateId: string
  theme: ReturnType<typeof useTheme>['theme']
  onClose: () => void
  onApply: () => void
  canApply: boolean
}

function TemplatePreviewModal({
  templateId,
  theme,
  onClose,
  onApply,
  canApply,
}: TemplatePreviewModalProps) {
  const getTemplate = useServerFn(getPublicTemplatesFn)

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  const { data, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => getTemplate({ data: { limit: 50 } }),
  })

  const template = data?.templates?.find((t) => t.id === templateId)

  const settings = template?.settings as
    | {
        accentColor?: string
        customBackground?: { type: string; value?: string; imageUrl?: string }
        layoutSettings?: { cardBorderRadius?: number; cardShadow?: string }
      }
    | undefined

  const bgPreview =
    settings?.customBackground?.type === 'image' &&
    settings.customBackground.imageUrl
      ? `url(${settings.customBackground.imageUrl}) center/cover`
      : settings?.customBackground?.value ||
        `linear-gradient(135deg, ${settings?.accentColor || theme.colors.primary}, ${theme.colors.accent})`

  const categoryData = CATEGORIES.find((c) => c.id === template?.category)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-lg overflow-hidden shadow-2xl"
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: cardRadius,
          boxShadow:
            glowOpacity > 0
              ? `0 25px 60px ${theme.colors.primary}30`
              : '0 25px 50px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !template ? (
          <div className="h-64 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={32} style={{ color: theme.colors.primary }} />
            </motion.div>
          </div>
        ) : (
          <>
            {/* Preview Header */}
            <div
              className="h-44 relative overflow-hidden"
              style={{ background: bgPreview }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.6)' }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <X size={18} className="text-white" />
              </motion.button>
              <div className="absolute bottom-4 left-5 right-5">
                <h2
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: theme.typography.displayFont }}
                >
                  {template.name}
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-white/80 text-sm flex items-center gap-1.5">
                    <User size={14} />
                    {template.userUsername || 'Anonymous'}
                  </p>
                  {categoryData && (
                    <span
                      className="px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 backdrop-blur-md"
                      style={{
                        background: `${categoryData.color}90`,
                        color: '#fff',
                        borderRadius: '8px',
                      }}
                    >
                      <categoryData.icon size={12} />
                      {categoryData.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {template.description && (
                <p
                  className="text-sm mb-5"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {template.description}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { value: template.uses || 0, label: 'Uses', icon: Download, color: '#22c55e' },
                  { value: template.likes || 0, label: 'Likes', icon: Heart, color: '#ef4444' },
                  { value: template.category, label: 'Category', icon: Layers, color: theme.colors.primary, capitalize: true },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-4"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      borderRadius: `calc(${cardRadius} - 6px)`,
                    }}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <stat.icon size={14} style={{ color: stat.color }} />
                      <p
                        className={`text-xl font-bold ${stat.capitalize ? 'capitalize' : ''}`}
                        style={{ color: theme.colors.foreground }}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  className="flex-1 py-3.5 font-medium text-sm"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    borderRadius: cardRadius,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onApply}
                  disabled={!canApply}
                  className="flex-1 py-3.5 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    color: '#fff',
                    borderRadius: cardRadius,
                    boxShadow:
                      glowOpacity > 0
                        ? `0 10px 30px ${theme.colors.primary}40`
                        : undefined,
                  }}
                  whileHover={{ scale: canApply ? 1.02 : 1 }}
                  whileTap={{ scale: canApply ? 0.98 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {canApply ? (
                    <>
                      <Download size={16} />
                      Apply Template
                    </>
                  ) : (
                    <>
                      <Crown size={16} />
                      Pro Required
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// Preview Modal for Preset Templates (no DB query needed)
interface PresetTemplatePreviewModalProps {
  template: PresetTemplate
  theme: ReturnType<typeof useTheme>['theme']
  onClose: () => void
  onApply: () => void
  canApply: boolean
  cardRadius: string
  glowOpacity: number
}

function PresetTemplatePreviewModal({
  template,
  theme,
  onClose,
  onApply,
  canApply,
  cardRadius,
  glowOpacity,
}: PresetTemplatePreviewModalProps) {
  const settings = template.settings
  const accentColor = settings?.accentColor || theme.colors.primary
  const bgPreview =
    settings?.customBackground?.type === 'image' && settings.customBackground.imageUrl
      ? `url(${settings.customBackground.imageUrl}) center/cover`
      : settings?.customBackground?.type === 'gradient' && settings.customBackground.gradientColors
        ? `linear-gradient(${settings.customBackground.gradientAngle || 135}deg, ${settings.customBackground.gradientColors.join(', ')})`
        : settings?.customBackground?.type === 'solid'
          ? settings.customBackground.value
          : `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`

  const categoryData = CATEGORIES.find((c) => c.id === template.category)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg overflow-hidden shadow-2xl"
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: cardRadius,
          boxShadow: glowOpacity > 0 ? `0 25px 60px ${theme.colors.primary}30` : '0 25px 50px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Header */}
        <div className="h-44 relative overflow-hidden" style={{ background: bgPreview }}>
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            <X size={18} className="text-white" />
          </motion.button>
          <div className="absolute top-4 left-4">
            <div
              className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md"
              style={{ background: `${theme.colors.primary}dd`, color: '#fff', borderRadius: '8px' }}
            >
              <Crown size={12} />
              Eziox Official
            </div>
          </div>
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: theme.typography.displayFont }}>
              {template.name}
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-white/80 text-sm flex items-center gap-1.5">
                <User size={14} />
                Eziox
              </p>
              {categoryData && (
                <span
                  className="px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 backdrop-blur-md"
                  style={{ background: `${categoryData.color}90`, color: '#fff', borderRadius: '8px' }}
                >
                  <categoryData.icon size={12} />
                  {categoryData.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-sm mb-5" style={{ color: theme.colors.foregroundMuted }}>
            {template.description}
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {template.settings.animatedProfile?.enabled && (
              <div
                className="text-center p-3"
                style={{ background: theme.colors.backgroundSecondary, borderRadius: `calc(${cardRadius} - 6px)` }}
              >
                <Sparkles size={16} className="mx-auto mb-1" style={{ color: theme.colors.primary }} />
                <p className="text-xs" style={{ color: theme.colors.foreground }}>Animations</p>
              </div>
            )}
            {template.settings.customCSS && (
              <div
                className="text-center p-3"
                style={{ background: theme.colors.backgroundSecondary, borderRadius: `calc(${cardRadius} - 6px)` }}
              >
                <Palette size={16} className="mx-auto mb-1" style={{ color: theme.colors.accent }} />
                <p className="text-xs" style={{ color: theme.colors.foreground }}>Custom CSS</p>
              </div>
            )}
            <div
              className="text-center p-3"
              style={{ background: theme.colors.backgroundSecondary, borderRadius: `calc(${cardRadius} - 6px)` }}
            >
              <Layers size={16} className="mx-auto mb-1" style={{ color: '#22c55e' }} />
              <p className="text-xs capitalize" style={{ color: theme.colors.foreground }}>{template.category}</p>
            </div>
            {template.featured && (
              <div
                className="text-center p-3"
                style={{ background: theme.colors.backgroundSecondary, borderRadius: `calc(${cardRadius} - 6px)` }}
              >
                <Star size={16} className="mx-auto mb-1" style={{ color: '#fbbf24' }} />
                <p className="text-xs" style={{ color: theme.colors.foreground }}>Featured</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onClose}
              className="flex-1 py-3.5 font-medium text-sm"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, borderRadius: cardRadius }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onApply}
              disabled={!canApply}
              className="flex-1 py-3.5 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                color: '#fff',
                borderRadius: cardRadius,
                boxShadow: glowOpacity > 0 ? `0 10px 30px ${theme.colors.primary}40` : undefined,
              }}
              whileHover={{ scale: canApply ? 1.02 : 1 }}
              whileTap={{ scale: canApply ? 0.98 : 1 }}
              transition={{ duration: 0.1 }}
            >
              {canApply ? (
                <>
                  <Download size={16} />
                  Apply Template
                </>
              ) : (
                <>
                  <Crown size={16} />
                  Pro Required
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
