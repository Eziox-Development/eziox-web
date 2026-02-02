import { useState, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
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
  type CardLayout,
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
  Check,
  Wand2,
  Globe,
} from 'lucide-react'
import { SiX, SiYoutube, SiDiscord } from 'react-icons/si'

export const Route = createFileRoute('/_public/templates')({
  component: TemplatesPage,
  head: () => ({
    meta: [
      { title: 'Templates | Eziox' },
      {
        name: 'description',
        content: 'Browse and apply community-created profile templates.',
      },
    ],
  }),
})

const CATEGORIES = [
  {
    id: 'all',
    labelKey: 'templates.categories.all',
    icon: LayoutGrid,
    color: '#6366f1',
  },
  {
    id: 'vtuber',
    labelKey: 'templates.categories.vtuber',
    icon: Sparkles,
    color: '#ec4899',
  },
  {
    id: 'gamer',
    labelKey: 'templates.categories.gamer',
    icon: Gamepad2,
    color: '#22c55e',
  },
  {
    id: 'developer',
    labelKey: 'templates.categories.developer',
    icon: Code2,
    color: '#3b82f6',
  },
  {
    id: 'minimal',
    labelKey: 'templates.categories.minimal',
    icon: Monitor,
    color: '#6b7280',
  },
  {
    id: 'creative',
    labelKey: 'templates.categories.creative',
    icon: Paintbrush,
    color: '#f59e0b',
  },
  {
    id: 'business',
    labelKey: 'templates.categories.business',
    icon: Briefcase,
    color: '#14b8a6',
  },
  {
    id: 'music',
    labelKey: 'templates.categories.music',
    icon: Music4,
    color: '#8b5cf6',
  },
  {
    id: 'art',
    labelKey: 'templates.categories.art',
    icon: Palette,
    color: '#ef4444',
  },
  {
    id: 'anime',
    labelKey: 'templates.categories.anime',
    icon: Star,
    color: '#f472b6',
  },
]

const SORT_OPTIONS = [
  { value: 'popular', labelKey: 'templates.sort.popular', icon: TrendingUp },
  { value: 'likes', labelKey: 'templates.sort.likes', icon: Heart },
  { value: 'newest', labelKey: 'templates.sort.newest', icon: Zap },
]

export function TemplatesPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<'popular' | 'newest' | 'likes'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedPresetTemplate, setSelectedPresetTemplate] =
    useState<PresetTemplate | null>(null)

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
      toast.success(t('templates.toast.applied'), {
        description: t('templates.toast.appliedDescription'),
      })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
    onError: (error: { message?: string }) => {
      if (error.message?.includes('Pro tier')) {
        toast.error(t('templates.toast.proRequired'), {
          description: t('templates.toast.proRequiredDescription'),
        })
      } else {
        toast.error(t('templates.toast.failed'))
      }
    },
  })

  const likeMutation = useMutation({
    mutationFn: (templateId: string) => likeTemplate({ data: { templateId } }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })

  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)
  const updateAnimated = useServerFn(updateAnimatedProfileFn)
  const updateCSS = useServerFn(updateCustomCSSFn)

  const canApply = !!(
    currentUser &&
    ['pro', 'creator', 'lifetime'].includes(currentUser.tier || 'free')
  )

  const handleApplyPreset = async (template: PresetTemplate) => {
    if (!canApply) {
      toast.error(t('templates.toast.proRequired'), {
        description: t('templates.toast.proRequiredDescription'),
      })
      return
    }
    try {
      if (template.settings.customBackground)
        await updateBackground({
          data: template.settings.customBackground as Parameters<
            typeof updateBackground
          >[0]['data'],
        })
      if (template.settings.layoutSettings)
        await updateLayout({
          data: template.settings.layoutSettings as Parameters<
            typeof updateLayout
          >[0]['data'],
        })
      if (template.settings.animatedProfile)
        await updateAnimated({
          data: template.settings.animatedProfile as Parameters<
            typeof updateAnimated
          >[0]['data'],
        })
      if (template.settings.customCSS)
        await updateCSS({ data: { css: template.settings.customCSS } })
      toast.success(t('templates.toast.applied'), {
        description: t('templates.toast.appliedPreset', {
          name: template.name,
        }),
      })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    } catch {
      toast.error(t('templates.toast.failed'))
    }
  }

  const filteredPresetTemplates = useMemo(() => {
    let presets =
      category === 'all'
        ? EZIOX_PRESET_TEMPLATES
        : getPresetTemplatesByCategory(category)
    if (search) {
      const results = searchPresetTemplates(search)
      presets = presets.filter((p) => results.some((r) => r.id === p.id))
    }
    return presets
  }, [category, search])

  const presetStats = useMemo(() => getPresetTemplateStats(), [])
  const totalUses =
    (templatesData?.templates?.reduce(
      (acc, tmpl) => acc + (tmpl.uses || 0),
      0,
    ) || 0) + presetStats.totalPopularity
  const totalLikes =
    templatesData?.templates?.reduce(
      (acc, tmpl) => acc + (tmpl.likes || 0),
      0,
    ) || 0
  const totalTemplates = (templatesData?.total || 0) + presetStats.total
  const totalFeatured = (featuredTemplates?.length || 0) + presetStats.featured

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.2,
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
              <Wand2 size={18} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('templates.badge')}
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
              {t('templates.hero.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('templates.hero.titleHighlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg lg:text-xl max-w-2xl mx-auto mb-10"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('templates.hero.subtitle')}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                {
                  value: totalTemplates,
                  labelKey: 'templates.stats.templates',
                  icon: Layers,
                  color: theme.colors.primary,
                },
                {
                  value: totalUses,
                  labelKey: 'templates.stats.uses',
                  icon: Download,
                  color: '#22c55e',
                },
                {
                  value: totalLikes,
                  labelKey: 'templates.stats.likes',
                  icon: Heart,
                  color: '#ef4444',
                },
                {
                  value: totalFeatured,
                  labelKey: 'templates.stats.featured',
                  icon: Star,
                  color: '#fbbf24',
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.labelKey}
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
                    {t(stat.labelKey)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
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
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <input
                  type="text"
                  placeholder={t('templates.search.placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-sm outline-none"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: cardRadius,
                  }}
                />
              </div>
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
                    >
                      <option.icon size={12} />
                      {t(option.labelKey)}
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
                    >
                      <Icon size={16} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="mt-5 pt-5 flex flex-wrap gap-2"
              style={{ borderTop: `1px solid ${theme.colors.border}` }}
            >
              {CATEGORIES.map(({ id, labelKey, icon: Icon, color }) => (
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
                >
                  <Icon
                    size={14}
                    style={{
                      color:
                        category === id ? color : theme.colors.foregroundMuted,
                    }}
                  />
                  {t(labelKey)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Templates Grid */}
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
                {t('templates.loading')}
              </p>
            </div>
          ) : filteredPresetTemplates.length > 0 ||
            (templatesData?.templates && templatesData.templates.length > 0) ? (
            <motion.div
              className="p-5 mt-4"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
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
                variants={{
                  visible: { transition: { staggerChildren: 0.03 } },
                }}
              >
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
                      t={t}
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
                      t={t}
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
              className="flex flex-col items-center justify-center py-24 mt-4"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
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
                {t('templates.empty.title')}
              </h3>
              <p
                className="text-sm mb-8 text-center max-w-md"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('templates.empty.description')}
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
                >
                  {t('templates.empty.clearFilters')}
                </motion.button>
                {!currentUser && (
                  <Link to="/sign-up">
                    <motion.div
                      className="px-6 py-3 font-medium text-sm flex items-center gap-2 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        borderRadius: cardRadius,
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Crown size={16} />
                      {t('templates.empty.signUp')}
                    </motion.div>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {selectedTemplate && (
          <TemplatePreviewModal
            templateId={selectedTemplate}
            theme={theme}
            t={t}
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
            t={t}
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
  t: ReturnType<typeof useTranslation>['t']
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
  t,
  onApply,
  onLike,
  onPreview,
  canApply,
  isApplying,
  featured,
  listView,
  cardRadius,
  isOfficial,
}: TemplateCardProps) {
  const settings = template.settings as {
    accentColor?: string
    secondaryColor?: string
    textColor?: string
    customBackground?: {
      type: string
      value?: string
      imageUrl?: string
      gradientColors?: string[]
      gradientAngle?: number
    }
    layoutSettings?: {
      cardLayout?: CardLayout
      cardTiltDegree?: number
      cardBorderRadius?: number
    }
    customCSS?: string
    animatedProfile?: { enabled?: boolean }
  }
  const accentColor = settings?.accentColor || theme.colors.primary
  const secondaryColor =
    settings?.secondaryColor || settings?.accentColor || theme.colors.accent

  // Generate proper background preview
  let bgPreview = `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`
  if (settings?.customBackground) {
    const bg = settings.customBackground
    if (bg.type === 'image' && bg.imageUrl) {
      bgPreview = `url(${bg.imageUrl}) center/cover`
    } else if (
      bg.type === 'gradient' &&
      bg.gradientColors &&
      bg.gradientColors.length > 0
    ) {
      bgPreview = `linear-gradient(${bg.gradientAngle || 135}deg, ${bg.gradientColors.join(', ')})`
    } else if (bg.type === 'solid' && bg.value) {
      bgPreview = bg.value
    }
  }
  const hasCreatorFeatures = !!(
    settings?.customCSS || settings?.animatedProfile?.enabled
  )
  const requiredTier = isOfficial
    ? t('templates.tier.official')
    : hasCreatorFeatures
      ? t('templates.tier.creator')
      : t('templates.tier.pro')
  const tierColor = isOfficial
    ? theme.colors.primary
    : hasCreatorFeatures
      ? '#f59e0b'
      : '#3b82f6'
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
        }}
        whileHover={{ scale: 1.01, x: 4 }}
        onClick={onPreview}
      >
        <div
          className="w-20 h-20 shrink-0 relative overflow-hidden"
          style={{
            background: bgPreview,
            borderRadius: `calc(${cardRadius} - 8px)`,
          }}
        >
          {featured && (
            <div
              className="absolute top-1 left-1 p-1 rounded-md"
              style={{ background: '#fbbf24' }}
            >
              <Star size={10} className="text-white" />
            </div>
          )}
          {isOfficial && (
            <div
              className="absolute top-1 right-1 p-1 rounded-md"
              style={{ background: theme.colors.primary }}
            >
              <Check size={10} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="font-semibold truncate"
              style={{ color: theme.colors.foreground }}
            >
              {template.name}
            </h3>
            <span
              className="px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0"
              style={{ background: `${tierColor}20`, color: tierColor }}
            >
              {requiredTier}
            </span>
          </div>
          <p
            className="text-xs truncate mb-2"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {template.description || t('templates.card.noDescription')}
          </p>
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {categoryData && (
              <span className="flex items-center gap-1">
                <categoryData.icon
                  size={12}
                  style={{ color: categoryData.color }}
                />
                {t(categoryData.labelKey)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User size={12} />@{template.userUsername}
            </span>
            {template.likes !== null && (
              <span className="flex items-center gap-1">
                <Heart size={12} />
                {template.likes}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onLike()
            }}
            className="p-2 rounded-lg"
            style={{ background: theme.colors.backgroundSecondary }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={16} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
            disabled={!canApply || isApplying}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              opacity: canApply ? 1 : 0.5,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isApplying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              t('templates.card.apply')
            )}
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="group cursor-pointer"
      style={{
        background:
          theme.effects.cardStyle === 'glass'
            ? `${theme.colors.card}90`
            : theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: cardRadius,
        overflow: 'hidden',
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onPreview}
    >
      <div
        className="aspect-[4/3] relative overflow-hidden"
        style={{ background: bgPreview }}
      >
        {featured && (
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-medium text-white"
            style={{ background: '#fbbf24' }}
          >
            <Star size={10} />
            {t('templates.card.featured')}
          </div>
        )}
        {isOfficial && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-medium text-white"
            style={{ background: theme.colors.primary }}
          >
            <Check size={10} />
            {t('templates.card.official')}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <motion.button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye size={16} />
            {t('templates.card.preview')}
          </motion.button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: theme.colors.foreground }}
          >
            {template.name}
          </h3>
          <span
            className="px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0"
            style={{ background: `${tierColor}20`, color: tierColor }}
          >
            {requiredTier}
          </span>
        </div>
        <p
          className="text-xs truncate mb-3"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {template.description || t('templates.card.noDescription')}
        </p>
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <span className="flex items-center gap-1">
              <User size={12} />@{template.userUsername}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {template.likes !== null && (
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <Heart size={12} />
                {template.likes}
              </span>
            )}
            {template.uses !== null && (
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <Download size={12} />
                {template.uses}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface TemplatePreviewModalProps {
  templateId: string
  theme: ReturnType<typeof useTheme>['theme']
  t: ReturnType<typeof useTranslation>['t']
  onClose: () => void
  onApply: () => void
  canApply: boolean
}

function TemplatePreviewModal({
  theme,
  t,
  onClose,
  onApply,
  canApply,
}: TemplatePreviewModalProps) {
  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg p-6"
        style={{ background: theme.colors.card, borderRadius: cardRadius }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold"
            style={{ color: theme.colors.foreground }}
          >
            {t('templates.modal.title')}
          </h2>
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-2 rounded-lg"
            style={{ background: theme.colors.backgroundSecondary }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
        </div>
        <div
          className="aspect-video rounded-xl mb-6"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
          }}
        />
        <div className="flex gap-3">
          <motion.button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-medium"
            style={{
              background: theme.colors.backgroundSecondary,
              color: theme.colors.foreground,
              borderRadius: cardRadius,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('templates.modal.cancel')}
          </motion.button>
          <motion.button
            onClick={onApply}
            disabled={!canApply}
            className="flex-1 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              borderRadius: cardRadius,
              opacity: canApply ? 1 : 0.5,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Check size={18} />
            {t('templates.modal.apply')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface PresetTemplatePreviewModalProps {
  template: PresetTemplate
  theme: ReturnType<typeof useTheme>['theme']
  t: ReturnType<typeof useTranslation>['t']
  onClose: () => void
  onApply: () => void
  canApply: boolean
  cardRadius: string
  glowOpacity: number
}

function PresetTemplatePreviewModal({
  template,
  theme,
  t,
  onClose,
  onApply,
  canApply,
  cardRadius,
}: PresetTemplatePreviewModalProps) {
  const settings = template.settings
  const { layoutSettings, animatedProfile, customBackground } = settings

  // Generate background
  let bgStyle = `linear-gradient(135deg, ${settings.accentColor}, ${settings.secondaryColor || settings.accentColor})`
  if (customBackground) {
    if (customBackground.type === 'solid' && customBackground.value) {
      bgStyle = customBackground.value
    } else if (
      customBackground.type === 'gradient' &&
      customBackground.gradientColors &&
      customBackground.gradientColors.length > 0
    ) {
      bgStyle = `linear-gradient(${customBackground.gradientAngle || 135}deg, ${customBackground.gradientColors.join(', ')})`
    }
  }

  // Card layout styles
  const previewCardRadius = layoutSettings.cardBorderRadius || 12
  const cardTilt =
    layoutSettings.cardLayout === 'tilt'
      ? layoutSettings.cardTiltDegree || 2
      : 0
  const isStackLayout = layoutSettings.cardLayout === 'stack'
  const isGridLayout = layoutSettings.cardLayout === 'grid'
  const isTiltLayout = layoutSettings.cardLayout === 'tilt'

  // Sample links for preview
  const sampleLinks = [
    { name: 'YouTube', icon: <SiYoutube /> },
    { name: 'Twitter / X', icon: <SiX /> },
    { name: 'Discord', icon: <SiDiscord /> },
    { name: 'Website', icon: <Globe /> },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl overflow-hidden flex flex-col lg:flex-row"
        style={{ background: theme.colors.card, borderRadius: cardRadius }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Live Preview Section */}
        <div
          className="lg:w-1/2 p-6 relative overflow-hidden"
          style={{ background: bgStyle, minHeight: '400px' }}
        >
          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-4 right-4 p-3 rounded-full z-50 cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.9)' }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={20} className="text-white" />
          </motion.button>

          {/* Animated particles overlay for animated backgrounds */}
          {animatedProfile.bannerAnimation === 'particles' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background:
                      animatedProfile.particleColor || settings.accentColor,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{ y: [-20, -100], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}

          {/* Profile Preview */}
          <div className="relative z-10 flex flex-col items-center pt-8">
            {/* Avatar */}
            <motion.div
              className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${settings.accentColor}, ${settings.secondaryColor || settings.accentColor})`,
                color: '#fff',
                boxShadow:
                  animatedProfile.avatarAnimation === 'glow'
                    ? `0 0 30px ${animatedProfile.glowColor || settings.accentColor}`
                    : 'none',
              }}
              animate={
                animatedProfile.avatarAnimation === 'pulse'
                  ? { scale: [1, 1.05, 1] }
                  : animatedProfile.avatarAnimation === 'bounce'
                    ? { y: [0, -8, 0] }
                    : animatedProfile.avatarAnimation === 'float'
                      ? { y: [0, -6, 0] }
                      : animatedProfile.avatarAnimation === 'rotate'
                        ? { rotate: [0, 360] }
                        : {}
              }
              transition={{
                duration: animatedProfile.avatarAnimation === 'rotate' ? 8 : 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              E
            </motion.div>

            {/* Username */}
            <h3
              className="text-lg font-bold mb-1"
              style={{ color: settings.textColor || '#fff' }}
            >
              @username
            </h3>
            <p
              className="text-sm mb-6 opacity-80"
              style={{ color: settings.textColor || '#fff' }}
            >
              Bio description here
            </p>

            {/* Link Cards Preview */}
            <div
              className={`w-full max-w-xs space-y-${layoutSettings.cardSpacing > 12 ? '4' : '3'} ${isGridLayout ? 'grid grid-cols-2 gap-3 space-y-0' : ''}`}
            >
              {sampleLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  className="px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium"
                  style={{
                    background:
                      layoutSettings.linkStyle === 'glass'
                        ? 'rgba(255,255,255,0.1)'
                        : layoutSettings.linkStyle === 'outline'
                          ? 'transparent'
                          : layoutSettings.linkStyle === 'gradient'
                            ? `linear-gradient(135deg, ${settings.accentColor}40, ${settings.secondaryColor || settings.accentColor}40)`
                            : layoutSettings.linkStyle === 'neon'
                              ? 'rgba(0,0,0,0.3)'
                              : 'rgba(255,255,255,0.15)',
                    color: settings.textColor || '#fff',
                    borderRadius: `${previewCardRadius}px`,
                    border:
                      layoutSettings.linkStyle === 'outline'
                        ? `2px solid ${settings.accentColor}`
                        : layoutSettings.linkStyle === 'neon'
                          ? `1px solid ${settings.accentColor}`
                          : layoutSettings.linkStyle === 'glass'
                            ? '1px solid rgba(255,255,255,0.2)'
                            : 'none',
                    transform: isTiltLayout
                      ? `rotate(${i % 2 === 0 ? cardTilt : -cardTilt}deg)`
                      : isStackLayout
                        ? `translateX(${i * 4}px)`
                        : 'none',
                    boxShadow:
                      layoutSettings.linkStyle === 'neon'
                        ? `0 0 15px ${settings.accentColor}40`
                        : layoutSettings.cardShadow === 'glow'
                          ? `0 0 20px ${settings.accentColor}30`
                          : layoutSettings.cardShadow === 'lg'
                            ? '0 10px 30px rgba(0,0,0,0.3)'
                            : layoutSettings.cardShadow === 'md'
                              ? '0 4px 15px rgba(0,0,0,0.2)'
                              : 'none',
                    backdropFilter:
                      layoutSettings.linkStyle === 'glass'
                        ? 'blur(10px)'
                        : 'none',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={
                    animatedProfile.linkHoverEffect === 'scale'
                      ? { scale: 1.03 }
                      : animatedProfile.linkHoverEffect === 'lift'
                        ? { y: -4 }
                        : animatedProfile.linkHoverEffect === 'tilt'
                          ? { rotate: 2 }
                          : animatedProfile.linkHoverEffect === 'glow'
                            ? {
                                boxShadow: `0 0 25px ${settings.accentColor}60`,
                              }
                            : {}
                  }
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Layout badge */}
          <div
            className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg flex items-center gap-2"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <Check size={14} className="text-white" />
            <span className="text-xs font-medium text-white">
              {layoutSettings.cardLayout.toUpperCase()} Layout
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:w-1/2 p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.foreground }}
              >
                {template.name}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    background: `${theme.colors.primary}20`,
                    color: theme.colors.primary,
                  }}
                >
                  {t('templates.card.official')}
                </span>
                {template.featured && (
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{ background: '#fbbf2420', color: '#fbbf24' }}
                  >
                    {t('templates.card.featured')}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p
                className="text-2xl font-bold"
                style={{ color: theme.colors.foreground }}
              >
                {template.popularity.toLocaleString()}
              </p>
              <p
                className="text-xs"
                style={{ color: theme.colors.foregroundMuted }}
              >
                uses
              </p>
            </div>
          </div>

          <p
            className="text-sm mb-6"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {template.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className="px-3 py-1 text-xs font-medium rounded-full capitalize"
              style={{
                background: `${settings.accentColor}20`,
                color: settings.accentColor,
              }}
            >
              {template.category}
            </span>
            {template.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full"
                style={{
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.foregroundMuted,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div
              className="p-3 rounded-lg"
              style={{ background: theme.colors.backgroundSecondary }}
            >
              <p
                className="text-xs font-medium mb-1"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Layout
              </p>
              <p
                className="text-sm font-semibold capitalize"
                style={{ color: theme.colors.foreground }}
              >
                {layoutSettings.cardLayout}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ background: theme.colors.backgroundSecondary }}
            >
              <p
                className="text-xs font-medium mb-1"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Link Style
              </p>
              <p
                className="text-sm font-semibold capitalize"
                style={{ color: theme.colors.foreground }}
              >
                {layoutSettings.linkStyle}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ background: theme.colors.backgroundSecondary }}
            >
              <p
                className="text-xs font-medium mb-1"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Hover Effect
              </p>
              <p
                className="text-sm font-semibold capitalize"
                style={{ color: theme.colors.foreground }}
              >
                {animatedProfile.linkHoverEffect}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ background: theme.colors.backgroundSecondary }}
            >
              <p
                className="text-xs font-medium mb-1"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Animations
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {animatedProfile.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>

          {/* Accent Color */}
          <div
            className="flex items-center gap-3 mb-6 p-3 rounded-lg"
            style={{ background: theme.colors.backgroundSecondary }}
          >
            <div
              className="w-8 h-8 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${settings.accentColor}, ${settings.secondaryColor || settings.accentColor})`,
              }}
            />
            <div>
              <p
                className="text-xs font-medium"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Accent Color
              </p>
              <p
                className="text-sm font-mono"
                style={{ color: theme.colors.foreground }}
              >
                {settings.accentColor}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-3">
            <motion.button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-medium"
              style={{
                background: theme.colors.backgroundSecondary,
                color: theme.colors.foreground,
                borderRadius: cardRadius,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('templates.modal.cancel')}
            </motion.button>
            <motion.button
              onClick={onApply}
              disabled={!canApply}
              className="flex-1 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${settings.accentColor}, ${settings.secondaryColor || settings.accentColor})`,
                borderRadius: cardRadius,
                opacity: canApply ? 1 : 0.5,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Check size={18} />
              {t('templates.modal.apply')}
            </motion.button>
          </div>
          {!canApply && (
            <p
              className="text-center text-xs mt-4"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('templates.modal.proRequired')}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
