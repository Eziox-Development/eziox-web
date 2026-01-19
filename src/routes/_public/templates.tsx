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
    <div className="h-screen overflow-hidden pt-16" style={{ background: theme.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-4 h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-4 shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            >
              <Palette size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Templates</h1>
              <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Discover & apply styles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-3 py-1.5 rounded-lg" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
              <p className="text-lg font-bold" style={{ color: theme.colors.foreground }}>{templatesData?.total || 0}</p>
              <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>Templates</p>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
              <p className="text-lg font-bold" style={{ color: theme.colors.primary }}>{featuredTemplates?.length || 0}</p>
              <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>Featured</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between mb-4 shrink-0 p-3 rounded-xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto scrollbar-hide">
            {CATEGORIES.slice(0, 8).map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => setCategory(id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                style={{
                  background: category === id ? theme.colors.primary : 'transparent',
                  color: category === id ? '#fff' : theme.colors.foregroundMuted,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={14} />
                {label}
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-48">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: theme.colors.foregroundMuted }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="px-3 py-2 rounded-lg text-xs"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
            >
              <option value="popular">Popular</option>
              <option value="likes">Liked</option>
              <option value="newest">New</option>
            </select>
            <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
              <button
                onClick={() => setViewMode('grid')}
                className="p-2"
                style={{ background: viewMode === 'grid' ? theme.colors.primary : theme.colors.backgroundSecondary, color: viewMode === 'grid' ? '#fff' : theme.colors.foregroundMuted }}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2"
                style={{ background: viewMode === 'list' ? theme.colors.primary : theme.colors.backgroundSecondary, color: viewMode === 'list' ? '#fff' : theme.colors.foregroundMuted }}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.colors.primary }} />
            </div>
          ) : templatesData?.templates && templatesData.templates.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
              : 'space-y-2'
            }>
              {templatesData.templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Layers size={40} className="mb-3 opacity-20" style={{ color: theme.colors.foregroundMuted }} />
              <h3 className="text-base font-medium mb-1" style={{ color: theme.colors.foreground }}>No templates found</h3>
              <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Try adjusting your filters or search terms</p>
              {!currentUser && (
                <Link
                  to="/sign-up"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
                >
                  <Crown size={14} />
                  Sign up to create
                </Link>
              )}
            </div>
          )}
        </div>
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
        className="flex items-center gap-3 p-2.5 rounded-lg group"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        whileHover={{ scale: 1.005 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="w-12 h-12 rounded-lg shrink-0" style={{ background: bgPreview }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" style={{ color: theme.colors.foreground }}>{template.name}</h3>
          <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: theme.colors.foregroundMuted }}>
            <span className="flex items-center gap-0.5"><User size={10} />{template.userUsername}</span>
            <span className="flex items-center gap-0.5"><Download size={10} />{template.uses || 0}</span>
            <span className="flex items-center gap-0.5"><Heart size={10} />{template.likes || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button onClick={onPreview} className="p-1.5 rounded-md" style={{ background: theme.colors.backgroundSecondary }} whileTap={{ scale: 0.95 }}>
            <Eye size={12} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
          <motion.button onClick={onLike} className="p-1.5 rounded-md" style={{ background: theme.colors.backgroundSecondary }} whileTap={{ scale: 0.95 }}>
            <Heart size={12} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
          <motion.button onClick={onApply} disabled={!canApply || isApplying} className="px-3 py-1.5 rounded-md font-medium text-xs disabled:opacity-50" style={{ background: theme.colors.primary, color: '#fff' }} whileTap={{ scale: 0.95 }}>
            Apply
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-lg overflow-hidden group cursor-pointer"
      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onPreview}
    >
      <div className="h-20 relative overflow-hidden" style={{ background: bgPreview }}>
        {featured && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 backdrop-blur-md" style={{ background: `${theme.colors.primary}cc`, color: '#fff' }}>
            <Sparkles size={8} />Featured
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
          <Eye size={16} className="text-white" />
        </div>
      </div>
      <div className="p-2">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h3 className="font-medium text-xs truncate" style={{ color: theme.colors.foreground }}>{template.name}</h3>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium capitalize shrink-0" style={{ background: `${accentColor}20`, color: accentColor }}>{template.category}</span>
        </div>
        <p className="text-[10px] truncate mb-1.5" style={{ color: theme.colors.foregroundMuted }}>{template.userUsername}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px]" style={{ color: theme.colors.foregroundMuted }}>
            <span className="flex items-center gap-0.5"><Download size={10} />{template.uses || 0}</span>
            <button onClick={(e) => { e.stopPropagation(); onLike() }} className="flex items-center gap-0.5 hover:text-red-500"><Heart size={10} />{template.likes || 0}</button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onApply() }}
            disabled={!canApply || isApplying}
            className="px-2 py-1 rounded text-[10px] font-medium disabled:opacity-50"
            style={{ background: theme.colors.primary, color: '#fff' }}
          >
            {isApplying ? <Loader2 size={10} className="animate-spin" /> : 'Apply'}
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
