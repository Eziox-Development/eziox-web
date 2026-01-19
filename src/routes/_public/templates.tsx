import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
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
  ArrowRight,
  Layers,
  X,
} from 'lucide-react'

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
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'vtuber', label: 'VTuber', icon: Sparkles },
  { id: 'gamer', label: 'Gamer', icon: Gamepad2 },
  { id: 'developer', label: 'Developer', icon: Code2 },
  { id: 'minimal', label: 'Minimal', icon: Monitor },
  { id: 'creative', label: 'Creative', icon: Paintbrush },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'music', label: 'Music', icon: Music4 },
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center mb-8 py-8 px-6 rounded-2xl overflow-hidden"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-10" style={{ background: theme.colors.primary }} />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full opacity-10" style={{ background: theme.colors.accent }} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
              >
                <Palette size={28} className="text-white" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: theme.colors.foreground }}>
                  Community Templates
                </h1>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                  Discover and apply beautiful profile styles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                <p className="text-xl font-bold" style={{ color: theme.colors.foreground }}>{templatesData?.total || 0}</p>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Templates</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                <p className="text-xl font-bold" style={{ color: theme.colors.foreground }}>{featuredTemplates?.length || 0}</p>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Featured</p>
              </div>
            </div>
          </div>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setCategory(id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                  style={{
                    background: category === id ? theme.colors.primary : 'transparent',
                    color: category === id ? '#fff' : theme.colors.foregroundMuted,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={16} />
                  {label}
                </motion.button>
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
                  <LayoutGrid size={18} />
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
            <Layers size={48} className="mx-auto mb-4 opacity-20" style={{ color: theme.colors.foregroundMuted }} />
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
              to="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
            >
              Get Started
              <ArrowRight size={16} />
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
  const settings = template.settings as { accentColor?: string; customBackground?: { type: string; value?: string; imageUrl?: string } }
  const accentColor = settings?.accentColor || theme.colors.primary
  const bgPreview = settings?.customBackground?.type === 'image' && settings.customBackground.imageUrl
    ? `url(${settings.customBackground.imageUrl}) center/cover`
    : settings?.customBackground?.type === 'gradient' 
    ? settings.customBackground.value 
    : settings?.customBackground?.type === 'solid'
    ? settings.customBackground.value
    : `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`

  if (listView) {
    return (
      <motion.div
        className="flex items-center gap-4 p-4 rounded-xl group"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        whileHover={{ scale: 1.005, y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div
          className="w-16 h-16 rounded-lg shrink-0 shadow-lg"
          style={{ background: bgPreview }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate" style={{ color: theme.colors.foreground }}>{template.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: theme.colors.foregroundMuted }}>
            <span className="flex items-center gap-1">
              <User size={12} />
              {template.userUsername}
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
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={onPreview}
            className="p-2 rounded-lg"
            style={{ background: theme.colors.backgroundSecondary }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye size={16} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
          <motion.button
            onClick={onLike}
            className="p-2 rounded-lg"
            style={{ background: theme.colors.backgroundSecondary }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart size={16} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
          <motion.button
            onClick={onApply}
            disabled={!canApply || isApplying}
            className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
            style={{ background: theme.colors.primary, color: '#fff' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-xl overflow-hidden group cursor-pointer"
      style={{ 
        background: theme.colors.card, 
        border: `1px solid ${theme.colors.border}`,
        boxShadow: featured ? `0 0 0 2px ${theme.colors.primary}` : undefined,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onPreview}
    >
      <div className="h-28 relative overflow-hidden" style={{ background: bgPreview }}>
        {featured && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 backdrop-blur-md"
            style={{ background: `${theme.colors.primary}cc`, color: '#fff' }}
          >
            <Sparkles size={10} />
            Featured
          </motion.div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Eye size={20} className="text-white" />
            <span className="text-white text-sm font-medium">Preview</span>
          </motion.div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate" style={{ color: theme.colors.foreground }}>{template.name}</h3>
            <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>
              {template.userUsername}
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

function TemplatePreviewModal({ templateId, theme, onClose, onApply, canApply }: TemplatePreviewModalProps) {
  const getTemplate = useServerFn(getPublicTemplatesFn)
  
  const { data, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => getTemplate({ data: { limit: 50 } }),
  })

  const template = data?.templates?.find(t => t.id === templateId)

  const settings = template?.settings as { 
    accentColor?: string
    customBackground?: { type: string; value?: string; imageUrl?: string }
    layoutSettings?: { cardBorderRadius?: number; cardShadow?: string }
  } | undefined

  const bgPreview = settings?.customBackground?.type === 'image' && settings.customBackground.imageUrl
    ? `url(${settings.customBackground.imageUrl}) center/cover`
    : settings?.customBackground?.value 
    || `linear-gradient(135deg, ${settings?.accentColor || theme.colors.primary}, ${theme.colors.accent})`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !template ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.colors.primary }} />
          </div>
        ) : (
          <>
            <div className="h-40 relative overflow-hidden" style={{ background: bgPreview }}>
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <motion.button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md"
                style={{ background: 'rgba(0,0,0,0.3)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} className="text-white" />
              </motion.button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-bold text-white">{template.name}</h2>
                <p className="text-white/70 text-sm flex items-center gap-1">
                  <User size={12} />
                  {template.userUsername}
                </p>
              </div>
            </div>
            <div className="p-5">
              {template.description && (
                <p className="text-sm mb-4" style={{ color: theme.colors.foregroundMuted }}>
                  {template.description}
                </p>
              )}
              
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                  <p className="text-lg font-bold" style={{ color: theme.colors.foreground }}>{template.uses || 0}</p>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Uses</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                  <p className="text-lg font-bold" style={{ color: theme.colors.foreground }}>{template.likes || 0}</p>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Likes</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                  <p className="text-lg font-bold capitalize" style={{ color: theme.colors.foreground }}>{template.category}</p>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Category</p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-medium text-sm"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onApply}
                  disabled={!canApply}
                  className="flex-1 py-3 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
                  whileHover={{ scale: canApply ? 1.02 : 1 }}
                  whileTap={{ scale: canApply ? 0.98 : 1 }}
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
