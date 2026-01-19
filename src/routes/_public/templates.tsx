import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  getPublicTemplatesFn,
  getFeaturedTemplatesFn,
  applyTemplateFn,
  likeTemplateFn,
} from '@/server/functions/templates'
import {
  Search,
  Heart,
  Download,
  Sparkles,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Crown,
  Loader2,
  Eye,
  User,
  Palette,
  Code,
  Gamepad2,
  Music,
  Brush,
  Briefcase,
  Monitor,
  Star,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/templates')({
  component: TemplatesPage,
  head: () => ({
    meta: [
      { title: 'Community Templates | Eziox' },
      { name: 'description', content: 'Browse and apply community-created profile templates. Find the perfect style for your bio page.' },
    ],
  }),
})

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Grid3X3 },
  { id: 'vtuber', label: 'VTuber', icon: Sparkles },
  { id: 'gamer', label: 'Gamer', icon: Gamepad2 },
  { id: 'developer', label: 'Developer', icon: Code },
  { id: 'minimal', label: 'Minimal', icon: Monitor },
  { id: 'creative', label: 'Creative', icon: Brush },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'anime', label: 'Anime', icon: Star },
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

  const getTemplates = useServerFn(getPublicTemplatesFn)
  const getFeatured = useServerFn(getFeaturedTemplatesFn)
  const applyTemplate = useServerFn(applyTemplateFn)
  const likeTemplate = useServerFn(likeTemplateFn)

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['templates', category, search, sort],
    queryFn: () => getTemplates({ 
      data: { 
        category: category === 'all' ? undefined : category,
        search: search || undefined,
        sort,
        limit: 30,
      } 
    }),
  })

  const { data: featuredTemplates } = useQuery({
    queryKey: ['featuredTemplates'],
    queryFn: () => getFeatured(),
  })

  const applyMutation = useMutation({
    mutationFn: (templateId: string) => applyTemplate({ data: { templateId } }),
    onSuccess: () => {
      toast.success('Template applied!', { description: 'Your profile has been updated with the new style.' })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
    onError: (error: { message?: string }) => {
      if (error.message?.includes('Pro tier')) {
        toast.error('Pro tier required', { description: 'Upgrade to apply community templates.' })
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

  const canApply = !!(currentUser && ['pro', 'creator', 'lifetime'].includes(currentUser.tier || 'free'))

  return (
    <div className="min-h-screen" style={{ background: theme.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}20)` }}
          >
            <Palette size={32} style={{ color: theme.colors.primary }} />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: theme.colors.foreground }}>
            Community Templates
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
            Discover beautiful profile styles created by our community. Apply them to your bio page with one click.
          </p>
        </motion.div>

        {featuredTemplates && featuredTemplates.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={20} style={{ color: theme.colors.primary }} />
              <h2 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Featured Templates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  theme={theme}
                  onApply={() => applyMutation.mutate(template.id)}
                  onLike={() => likeMutation.mutate(template.id)}
                  onPreview={() => setSelectedTemplate(template.id)}
                  canApply={canApply}
                  isApplying={applyMutation.isPending}
                  featured
                />
              ))}
            </div>
          </motion.section>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    background: category === id ? theme.colors.primary : theme.colors.backgroundSecondary,
                    color: category === id ? '#fff' : theme.colors.foregroundMuted,
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.colors.foregroundMuted }} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  style={{ 
                    background: theme.colors.backgroundSecondary, 
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ 
                  background: theme.colors.backgroundSecondary, 
                  color: theme.colors.foreground,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <option value="popular">Most Used</option>
                <option value="likes">Most Liked</option>
                <option value="newest">Newest</option>
              </select>

              <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-2.5"
                  style={{ 
                    background: viewMode === 'grid' ? theme.colors.primary : theme.colors.backgroundSecondary,
                    color: viewMode === 'grid' ? '#fff' : theme.colors.foregroundMuted,
                  }}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2.5"
                  style={{ 
                    background: viewMode === 'list' ? theme.colors.primary : theme.colors.backgroundSecondary,
                    color: viewMode === 'list' ? '#fff' : theme.colors.foregroundMuted,
                  }}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.colors.primary }} />
          </div>
        ) : templatesData?.templates && templatesData.templates.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
            }
          >
            {templatesData.templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
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
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Filter size={48} className="mx-auto mb-4 opacity-20" style={{ color: theme.colors.foregroundMuted }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: theme.colors.foreground }}>No templates found</h3>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        )}

        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center p-8 rounded-2xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <Crown size={40} className="mx-auto mb-4" style={{ color: theme.colors.primary }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.foreground }}>
              Want to apply templates?
            </h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.foregroundMuted }}>
              Sign up and upgrade to Pro to apply community templates to your profile.
            </p>
            <Link
              to="/join"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
            >
              Get Started
              <ChevronRight size={16} />
            </Link>
          </motion.div>
        )}
      </div>

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
}

function TemplateCard({ template, theme, onApply, onLike, onPreview, canApply, isApplying, featured, listView }: TemplateCardProps) {
  const settings = template.settings as { accentColor?: string; customBackground?: { type: string; value?: string } }
  const accentColor = settings?.accentColor || theme.colors.primary
  const bgPreview = settings?.customBackground?.type === 'gradient' 
    ? settings.customBackground.value 
    : settings?.customBackground?.type === 'solid'
    ? settings.customBackground.value
    : `linear-gradient(135deg, ${accentColor}40, ${theme.colors.accent}40)`

  if (listView) {
    return (
      <div
        className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      >
        <div
          className="w-20 h-20 rounded-xl flex-shrink-0"
          style={{ background: bgPreview }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate" style={{ color: theme.colors.foreground }}>{template.name}</h3>
          <p className="text-sm truncate" style={{ color: theme.colors.foregroundMuted }}>
            {template.description || `A ${template.category} style template`}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: theme.colors.foregroundMuted }}>
            <span className="flex items-center gap-1">
              <User size={12} />
              @{template.userUsername}
            </span>
            <span className="flex items-center gap-1">
              <Download size={12} />
              {template.uses || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} />
              {template.likes || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{ background: theme.colors.backgroundSecondary }}
          >
            <Eye size={18} style={{ color: theme.colors.foregroundMuted }} />
          </button>
          <button
            onClick={onLike}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{ background: theme.colors.backgroundSecondary }}
          >
            <Heart size={18} style={{ color: theme.colors.foregroundMuted }} />
          </button>
          <button
            onClick={onApply}
            disabled={!canApply || isApplying}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: theme.colors.primary, color: '#fff' }}
          >
            Apply
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all hover:scale-[1.02] ${featured ? 'ring-2' : ''}`}
      style={{ 
        background: theme.colors.card, 
        border: `1px solid ${theme.colors.border}`,
        ...(featured ? { ringColor: theme.colors.primary } : {}),
      }}
    >
      <div
        className="h-32 relative"
        style={{ background: bgPreview }}
      >
        {featured && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            <Sparkles size={12} />
            Featured
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
          <button
            onClick={onPreview}
            className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}
          >
            <Eye size={16} />
            Preview
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <h3 className="font-bold truncate" style={{ color: theme.colors.foreground }}>{template.name}</h3>
            <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>
              by @{template.userUsername}
            </p>
          </div>
          <span
            className="px-2 py-0.5 rounded-md text-xs font-medium capitalize"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {template.category}
          </span>
        </div>
        <p className="text-sm line-clamp-2 mb-3" style={{ color: theme.colors.foregroundMuted }}>
          {template.description || `A beautiful ${template.category} style template`}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.foregroundMuted }}>
            <span className="flex items-center gap-1">
              <Download size={12} />
              {template.uses || 0}
            </span>
            <button onClick={onLike} className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Heart size={12} />
              {template.likes || 0}
            </button>
          </div>
          <button
            onClick={onApply}
            disabled={!canApply || isApplying}
            className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: theme.colors.primary, color: '#fff' }}
          >
            {isApplying ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface TemplatePreviewModalProps {
  templateId: string
  theme: ReturnType<typeof useTheme>['theme']
  onClose: () => void
  onApply: () => void
  canApply: boolean
}

function TemplatePreviewModal({ templateId, theme, onClose, onApply, canApply }: TemplatePreviewModalProps) {
  const getTemplate = useServerFn(getPublicTemplatesFn)
  
  const { data } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => getTemplate({ data: { limit: 1 } }),
  })

  const template = data?.templates?.find(t => t.id === templateId)

  if (!template) return null

  const settings = template.settings as { 
    accentColor?: string
    customBackground?: { type: string; value?: string }
    layoutSettings?: { cardBorderRadius?: number; cardShadow?: string }
  }

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
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: theme.colors.card }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-48 relative"
          style={{ 
            background: settings?.customBackground?.value || `linear-gradient(135deg, ${settings?.accentColor || theme.colors.primary}40, ${theme.colors.accent}40)` 
          }}
        >
          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{template.name}</h2>
            <p className="text-white/80 text-sm">by @{template.userUsername}</p>
          </div>
        </div>
        <div className="p-6">
          <p className="mb-4" style={{ color: theme.colors.foregroundMuted }}>
            {template.description || `A beautiful ${template.category} style template for your bio page.`}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
              <p className="text-xs font-medium mb-1" style={{ color: theme.colors.foregroundMuted }}>Category</p>
              <p className="font-medium capitalize" style={{ color: theme.colors.foreground }}>{template.category}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
              <p className="text-xs font-medium mb-1" style={{ color: theme.colors.foregroundMuted }}>Used by</p>
              <p className="font-medium" style={{ color: theme.colors.foreground }}>{template.uses || 0} users</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium transition-all"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
            >
              Close
            </button>
            <button
              onClick={onApply}
              disabled={!canApply}
              className="flex-1 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
            >
              {canApply ? 'Apply Template' : 'Pro Required'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
