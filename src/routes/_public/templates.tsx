/**
 * Templates Page
 * Completely redesigned with Live Preview, ThemeProvider, and modern UI
 *
 * Features:
 * - Live preview of templates
 * - Category filtering
 * - Search functionality
 * - Grid/List view modes
 * - Apply templates to profile
 * - Like community templates
 */

import { useState, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  getTemplatesFn,
  applyTemplateFn,
  likeTemplateFn,
} from '@/server/functions/templates'
import {
  updateCustomBackgroundFn,
  updateLayoutSettingsFn,
} from '@/server/functions/profile-settings'
import { updateAnimatedProfileFn } from '@/server/functions/creator-features'
import {
  EZIOX_PRESET_TEMPLATES,
  getPresetTemplatesByCategory,
  searchPresetTemplates,
  getFeaturedPresetTemplates,
  type PresetTemplate,
  type TemplateCategory,
} from '@/lib/preset-templates'
import {
  Search,
  Heart,
  Download,
  Sparkles,
  Loader2,
  Eye,
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
  Grid3X3,
  LayoutList,
  BadgeCheck,
  TrendingUp,
  Clock,
  User,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_public/templates')({
  component: TemplatesPage,
  head: () => ({
    meta: [
      { title: 'Templates | Eziox' },
      {
        name: 'description',
        content: 'Browse and apply beautiful profile templates.',
      },
    ],
  }),
})

// ============================================================================
// TYPES
// ============================================================================

type SortOption = 'popular' | 'newest' | 'likes'
type ViewMode = 'grid' | 'list'

interface CategoryInfo {
  id: string
  label: string
  icon: React.ReactNode
  color: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: 'All', icon: <Layers className="w-4 h-4" />, color: 'from-gray-500 to-gray-600' },
  { id: 'minimal', label: 'Minimal', icon: <Monitor className="w-4 h-4" />, color: 'from-slate-500 to-slate-600' },
  { id: 'creative', label: 'Creative', icon: <Sparkles className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
  { id: 'gamer', label: 'Gamer', icon: <Gamepad2 className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' },
  { id: 'vtuber', label: 'VTuber', icon: <Star className="w-4 h-4" />, color: 'from-pink-500 to-rose-500' },
  { id: 'developer', label: 'Developer', icon: <Code2 className="w-4 h-4" />, color: 'from-cyan-500 to-blue-500' },
  { id: 'music', label: 'Music', icon: <Music4 className="w-4 h-4" />, color: 'from-orange-500 to-red-500' },
  { id: 'business', label: 'Business', icon: <Briefcase className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
  { id: 'art', label: 'Art', icon: <Paintbrush className="w-4 h-4" />, color: 'from-violet-500 to-purple-500' },
  { id: 'anime', label: 'Anime', icon: <Palette className="w-4 h-4" />, color: 'from-rose-500 to-pink-500' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function TemplatesPage() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()

  // State
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<SortOption>('popular')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedTemplate, setSelectedTemplate] = useState<PresetTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<PresetTemplate | null>(null)
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official')

  // Server functions
  const getTemplates = useServerFn(getTemplatesFn)
  const applyTemplate = useServerFn(applyTemplateFn)
  const likeTemplate = useServerFn(likeTemplateFn)
  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)
  const updateAnimated = useServerFn(updateAnimatedProfileFn)

  // Queries
  const { data: communityData, isLoading: communityLoading } = useQuery({
    queryKey: ['templates', category, search, sort],
    queryFn: () =>
      getTemplates({
        data: {
          category: category === 'all' ? undefined : (category as TemplateCategory),
          search: search || undefined,
          sort,
          limit: 30,
        },
      }),
  })

  // Mutations
  const applyMutation = useMutation({
    mutationFn: async (template: PresetTemplate) => {
      const { settings } = template
      
      // Apply background
      if (settings.customBackground) {
        await updateBackground({ data: settings.customBackground })
      }
      
      // Apply layout
      if (settings.layoutSettings) {
        await updateLayout({ data: settings.layoutSettings })
      }
      
      // Apply animations (if user has creator tier)
      if (settings.animatedProfile) {
        try {
          await updateAnimated({ data: settings.animatedProfile })
        } catch {
          // Silently fail if user doesn't have creator tier
        }
      }
    },
    onSuccess: () => {
      toast.success(t('templates.toast.applied'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      setSelectedTemplate(null)
    },
    onError: () => toast.error(t('templates.toast.failed')),
  })

  const likeMutation = useMutation({
    mutationFn: (templateId: string) => likeTemplate({ data: { templateId } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })

  // Filtered presets
  const filteredPresets = useMemo(() => {
    let presets = category === 'all'
      ? EZIOX_PRESET_TEMPLATES
      : getPresetTemplatesByCategory(category as TemplateCategory)

    if (search) {
      const results = searchPresetTemplates(search)
      presets = presets.filter((p) => results.some((r) => r.id === p.id))
    }

    // Sort
    if (sort === 'popular') {
      presets = [...presets].sort((a, b) => b.popularity - a.popularity)
    }

    return presets
  }, [category, search, sort])

  const featuredPresets = useMemo(() => getFeaturedPresetTemplates().slice(0, 6), [])

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Palette className="w-8 h-8 text-purple-400" />
                    {t('templates.title')}
                  </h1>
                  <p className="text-white/60 mt-1">{t('templates.subtitle')}</p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'h-8 w-8 p-0',
                      viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/60'
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'h-8 w-8 p-0',
                      viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/60'
                    )}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder={t('templates.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>

                {/* Sort */}
                <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                  <SelectTrigger className="w-[160px] h-11 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t('templates.sort.popular')}
                      </span>
                    </SelectItem>
                    <SelectItem value="newest">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('templates.sort.newest')}
                      </span>
                    </SelectItem>
                    <SelectItem value="likes">
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        {t('templates.sort.likes')}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={category === cat.id ? 'purple' : 'ghost'}
                      size="sm"
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        'rounded-full whitespace-nowrap',
                        category === cat.id && `bg-linear-to-r ${cat.color} hover:shadow-lg`
                      )}
                    >
                      {cat.icon}
                      <span className="ml-2">{cat.label}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'official' | 'community')} className="mb-8">
            <TabsList variant="pills" size="lg">
              <TabsTrigger variant="pills" value="official">
                <BadgeCheck className="w-4 h-4" />
                {t('templates.tabs.official')}
              </TabsTrigger>
              <TabsTrigger variant="pills" value="community">
                <User className="w-4 h-4" />
                {t('templates.tabs.community')}
              </TabsTrigger>
            </TabsList>

            {/* Official Templates */}
            <TabsContent value="official" className="mt-6">
              {/* Featured Section */}
              {category === 'all' && !search && (
                <section className="mb-12">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    {t('templates.featured')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredPresets.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={() => setSelectedTemplate(template)}
                        onPreview={() => setPreviewTemplate(template)}
                        featured
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All Templates */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {category === 'all' ? t('templates.all') : CATEGORIES.find((c) => c.id === category)?.label}
                  <span className="text-white/40 ml-2 text-base font-normal">
                    ({filteredPresets.length})
                  </span>
                </h2>

                {filteredPresets.length === 0 ? (
                  <EmptyState search={search} />
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPresets.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={() => setSelectedTemplate(template)}
                        onPreview={() => setPreviewTemplate(template)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPresets.map((template) => (
                      <TemplateListItem
                        key={template.id}
                        template={template}
                        onSelect={() => setSelectedTemplate(template)}
                        onPreview={() => setPreviewTemplate(template)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>

            {/* Community Templates */}
            <TabsContent value="community" className="mt-6">
              {communityLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TemplateCardSkeleton key={i} />
                  ))}
                </div>
              ) : communityData?.templates && communityData.templates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {communityData.templates.map((template) => (
                    <CommunityTemplateCard
                      key={template.id}
                      template={template}
                      onLike={() => likeMutation.mutate(template.id)}
                      onApply={() => {
                        if (!currentUser) {
                          toast.error(t('templates.toast.loginRequired'))
                          return
                        }
                        applyTemplate({ data: { templateId: template.id } })
                          .then(() => {
                            toast.success(t('templates.toast.applied'))
                            void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
                          })
                          .catch(() => toast.error(t('templates.toast.failed')))
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState community />
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Apply Template Dialog */}
      <AnimatePresence>
        {selectedTemplate && (
          <TemplateApplyDialog
            template={selectedTemplate}
            isOpen={!!selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onApply={() => applyMutation.mutate(selectedTemplate)}
            isApplying={applyMutation.isPending}
            isLoggedIn={!!currentUser}
          />
        )}
      </AnimatePresence>

      {/* Live Preview Dialog */}
      <AnimatePresence>
        {previewTemplate && (
          <LivePreviewDialog
            template={previewTemplate}
            isOpen={!!previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onApply={() => {
              setPreviewTemplate(null)
              setSelectedTemplate(previewTemplate)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// TEMPLATE CARD COMPONENT
// ============================================================================

interface TemplateCardProps {
  template: PresetTemplate
  onSelect: () => void
  onPreview: () => void
  featured?: boolean
}

function TemplateCard({ template, onSelect, onPreview, featured }: TemplateCardProps) {
  const { t } = useTranslation()
  const backgroundStyle = getBackgroundStyle(template.settings)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onPreview}
      className={cn(
        'group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer',
        featured && 'ring-2 ring-yellow-500/30'
      )}
    >
      {/* Preview Image */}
      <div className="aspect-4/3 relative overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
          style={backgroundStyle}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {template.isOfficial && (
            <Badge className="bg-purple-500/80 text-white border-0">
              <BadgeCheck className="w-3 h-3 mr-1" />
              Official
            </Badge>
          )}
          {featured && (
            <Badge className="bg-yellow-500/80 text-black border-0">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-0"
            onClick={(e) => {
              e.stopPropagation()
              onPreview()
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Template Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
          <p className="text-sm text-white/70 line-clamp-2">{template.description}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="ghost" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
        <Button
          variant="purple"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          <Download className="w-4 h-4 mr-1" />
          {t('templates.apply')}
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// TEMPLATE LIST ITEM COMPONENT
// ============================================================================

interface TemplateListItemProps {
  template: PresetTemplate
  onSelect: () => void
  onPreview: () => void
}

function TemplateListItem({ template, onSelect, onPreview }: TemplateListItemProps) {
  const { t } = useTranslation()
  const backgroundStyle = getBackgroundStyle(template.settings)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all"
    >
      {/* Preview */}
      <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <div className="w-full h-full" style={backgroundStyle} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">{template.name}</h3>
          {template.isOfficial && (
            <BadgeCheck className="w-4 h-4 text-purple-400" />
          )}
        </div>
        <p className="text-sm text-white/60 truncate">{template.description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onPreview}
          className="text-white/60 hover:text-white"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={onSelect}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          {t('templates.apply')}
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// COMMUNITY TEMPLATE CARD
// ============================================================================

interface CommunityTemplateCardProps {
  template: NonNullable<Awaited<ReturnType<typeof getTemplatesFn>>['templates']>[number]
  onLike: () => void
  onApply: () => void
}

function CommunityTemplateCard({ template, onLike, onApply }: CommunityTemplateCardProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all"
    >
      {/* Preview */}
      <div className="aspect-[4/3] relative bg-linear-to-br from-purple-500/20 to-cyan-500/20">
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
          <p className="text-sm text-white/70 line-clamp-2">{template.description}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <User className="w-4 h-4" />
            <span>{template.authorName || template.authorUsername}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {template.uses}
            </span>
            <button
              onClick={onLike}
              className="flex items-center gap-1 hover:text-pink-400 transition-colors"
            >
              <Heart className="w-4 h-4" />
              {template.likes}
            </button>
          </div>
        </div>
        <Button
          size="sm"
          onClick={onApply}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Download className="w-4 h-4 mr-1" />
          {t('templates.apply')}
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// TEMPLATE APPLY DIALOG
// ============================================================================

interface TemplateApplyDialogProps {
  template: PresetTemplate
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  isApplying: boolean
  isLoggedIn: boolean
}

function TemplateApplyDialog({
  template,
  isOpen,
  onClose,
  onApply,
  isApplying,
  isLoggedIn,
}: TemplateApplyDialogProps) {
  const { t } = useTranslation()
  const backgroundStyle = getBackgroundStyle(template.settings)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0f0f18] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {template.name}
            {template.isOfficial && (
              <BadgeCheck className="w-5 h-5 text-purple-400" />
            )}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {template.description}
          </DialogDescription>
        </DialogHeader>

        {/* Preview */}
        <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
          <div className="w-full h-full" style={backgroundStyle}>
            <div className="w-full h-full bg-black/40 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4"
                  style={{ borderColor: template.settings.accentColor || '#8b5cf6' }}
                />
                <div className="text-white font-semibold">Your Name</div>
                <div className="text-white/60 text-sm">@username</div>
                <div className="mt-6 space-y-3 w-64 mx-auto">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl"
                      style={{
                        backgroundColor: `${template.settings.accentColor || '#8b5cf6'}20`,
                        border: `1px solid ${template.settings.accentColor || '#8b5cf6'}40`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Preview */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-white/40 mb-1">{t('templates.preview.background')}</div>
            <div className="text-white capitalize">
              {template.settings.customBackground?.type || 'Solid'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-white/40 mb-1">{t('templates.preview.layout')}</div>
            <div className="text-white capitalize">
              {template.settings.layoutSettings?.profileLayout || 'Default'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-white/40 mb-1">{t('templates.preview.linkStyle')}</div>
            <div className="text-white capitalize">
              {template.settings.layoutSettings?.linkStyle || 'Default'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-white/40 mb-1">{t('templates.preview.animations')}</div>
            <div className="text-white">
              {template.settings.animatedProfile?.enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-white">
            {t('common.cancel')}
          </Button>
          {isLoggedIn ? (
            <Button
              onClick={onApply}
              disabled={isApplying}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('templates.applying')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('templates.applyTemplate')}
                </>
              )}
            </Button>
          ) : (
            <Button asChild className="flex-1 bg-purple-500 hover:bg-purple-600 text-white">
              <Link to="/sign-in">
                {t('templates.loginToApply')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// LIVE PREVIEW DIALOG
// ============================================================================

interface LivePreviewDialogProps {
  template: PresetTemplate
  isOpen: boolean
  onClose: () => void
  onApply: () => void
}

function LivePreviewDialog({ template, isOpen, onClose, onApply }: LivePreviewDialogProps) {
  const { t } = useTranslation()
  const backgroundStyle = getBackgroundStyle(template.settings)
  const { layoutSettings, animatedProfile, accentColor } = template.settings

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[85vh] bg-[#0a0a0f] border-white/10 p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>
        
        {/* Single Grid Layout: Left Info | Right Preview */}
        <div className="grid grid-cols-[320px_1fr] h-full">
          
          {/* LEFT SIDE - Template Info */}
          <div className="bg-[#0f0f18] border-r border-white/10 flex flex-col h-full overflow-hidden">
            {/* Header with Close */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white truncate">{template.name}</h2>
                  {template.isOfficial && <BadgeCheck className="w-5 h-5 text-purple-400 shrink-0" />}
                </div>
                <p className="text-white/60 text-sm line-clamp-2">{template.description}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tags */}
            <div className="px-5 py-3 border-b border-white/10">
              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="ghost" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Settings */}
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-4">
                <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">{t('templates.preview.settings')}</h3>
                
                {/* Background */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-9 h-9 rounded-md bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white/50">{t('templates.preview.background')}</div>
                    <div className="text-sm text-white font-medium capitalize truncate">{template.settings.customBackground?.type || 'Solid'}</div>
                  </div>
                </div>

                {/* Layout */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-9 h-9 rounded-md bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white/50">{t('templates.preview.layout')}</div>
                    <div className="text-sm text-white font-medium capitalize truncate">{layoutSettings?.profileLayout || 'Centered'}</div>
                  </div>
                </div>

                {/* Link Style */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-9 h-9 rounded-md bg-pink-500/20 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white/50">{t('templates.preview.linkStyle')}</div>
                    <div className="text-sm text-white font-medium capitalize truncate">{layoutSettings?.linkStyle || 'Default'}</div>
                  </div>
                </div>

                {/* Animations */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-9 h-9 rounded-md bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white/50">{t('templates.preview.animations')}</div>
                    <div className="text-sm text-white font-medium">{animatedProfile?.enabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div 
                    className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accentColor || '#8b5cf6'}25` }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: accentColor || '#8b5cf6' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white/50">{t('templates.preview.accentColor')}</div>
                    <div className="text-sm text-white font-medium font-mono">{accentColor || '#8b5cf6'}</div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Apply Button */}
            <div className="p-5 border-t border-white/10">
              <Button onClick={onApply} variant="purple" className="w-full h-11 font-medium">
                <Download className="w-4 h-4 mr-2" />
                {t('templates.applyTemplate')}
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE - Full Preview */}
          <div className="relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0" style={backgroundStyle} />
            
            {/* Profile Preview - Centered */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm"
              >
                <div
                  className="p-6 backdrop-blur-xl"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderRadius: `${layoutSettings?.cardBorderRadius || 16}px`,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      className="w-24 h-24 rounded-full bg-linear-to-br from-purple-500 to-pink-500 mb-4 border-4 flex items-center justify-center"
                      style={{ borderColor: accentColor || '#8b5cf6' }}
                      animate={
                        animatedProfile?.avatarAnimation === 'float'
                          ? { y: [0, -8, 0] }
                          : animatedProfile?.avatarAnimation === 'pulse'
                            ? { scale: [1, 1.05, 1] }
                            : animatedProfile?.avatarAnimation === 'glow'
                              ? { boxShadow: [`0 0 20px ${accentColor}40`, `0 0 35px ${accentColor}70`, `0 0 20px ${accentColor}40`] }
                              : {}
                      }
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <User className="w-10 h-10 text-white/80" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-white">Your Name</h2>
                    <p className="text-white/60">@username</p>
                  </div>

                  {/* Links */}
                  <div className="space-y-3">
                    {['My Website', 'Twitter', 'Discord', 'YouTube'].map((link, i) => (
                      <motion.div
                        key={i}
                        className="h-12 rounded-lg flex items-center justify-center text-white font-medium cursor-pointer"
                        style={{
                          backgroundColor: layoutSettings?.linkStyle === 'glass'
                            ? 'rgba(255,255,255,0.1)'
                            : layoutSettings?.linkStyle === 'neon'
                              ? 'transparent'
                              : `${accentColor || '#8b5cf6'}20`,
                          border: layoutSettings?.linkStyle === 'outline' || layoutSettings?.linkStyle === 'neon'
                            ? `2px solid ${accentColor || '#8b5cf6'}`
                            : `1px solid ${accentColor || '#8b5cf6'}30`,
                          borderRadius: `${layoutSettings?.cardBorderRadius || 12}px`,
                          boxShadow: layoutSettings?.linkStyle === 'neon'
                            ? `0 0 15px ${accentColor || '#8b5cf6'}40`
                            : 'none',
                        }}
                        whileHover={
                          animatedProfile?.linkHoverEffect === 'scale'
                            ? { scale: 1.03 }
                            : animatedProfile?.linkHoverEffect === 'glow'
                              ? { boxShadow: `0 0 25px ${accentColor || '#8b5cf6'}50` }
                              : animatedProfile?.linkHoverEffect === 'lift'
                                ? { y: -3 }
                                : {}
                        }
                        transition={{ duration: 0.2 }}
                      >
                        {link}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// SKELETON & EMPTY STATE
// ============================================================================

function TemplateCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <Skeleton className="aspect-[4/3] bg-white/10" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 bg-white/10 mb-2" />
        <Skeleton className="h-3 w-1/2 bg-white/10" />
      </div>
    </div>
  )
}

function EmptyState({ search, community }: { search?: string; community?: boolean }) {
  const { t } = useTranslation()

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
        <Palette className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        {search ? t('templates.noResults') : community ? t('templates.noCommunity') : t('templates.noTemplates')}
      </h3>
      <p className="text-white/60 max-w-md mx-auto">
        {search
          ? t('templates.noResultsDesc')
          : community
            ? t('templates.noCommunityDesc')
            : t('templates.noTemplatesDesc')}
      </p>
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getBackgroundStyle(settings: PresetTemplate['settings']): React.CSSProperties {
  const bg = settings.customBackground

  if (!bg) {
    return { background: `linear-gradient(135deg, ${settings.accentColor || '#8b5cf6'}, #06b6d4)` }
  }

  if (bg.type === 'image' && bg.imageUrl) {
    return {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: bg.imageBlur ? `blur(${bg.imageBlur}px)` : undefined,
      opacity: bg.imageOpacity || 1,
    }
  }

  if (bg.type === 'gradient' && bg.gradientColors && bg.gradientColors.length > 0) {
    return {
      background: `linear-gradient(${bg.gradientAngle || 135}deg, ${bg.gradientColors.join(', ')})`,
    }
  }

  if (bg.type === 'solid' && bg.value) {
    return { backgroundColor: bg.value }
  }

  return { background: `linear-gradient(135deg, ${settings.accentColor || '#8b5cf6'}, #06b6d4)` }
}
