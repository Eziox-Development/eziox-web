import { useState } from 'react'
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
      { name: 'description', content: 'Browse and apply community-created profile templates. Find the perfect style for your bio page.' },
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
  const totalUses = templatesData?.templates?.reduce((acc, t) => acc + (t.uses || 0), 0) || 0
  const totalLikes = templatesData?.templates?.reduce((acc, t) => acc + (t.likes || 0), 0) || 0

  return (
    <div className="min-h-screen pt-24" style={{ background: theme.colors.background }}>
      <section className="relative py-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: theme.colors.primary }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: theme.colors.accent }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Palette size={28} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: theme.colors.foreground }}>Community Templates</h1>
                <p className="text-sm mt-0.5" style={{ color: theme.colors.foregroundMuted }}>Discover stunning profile styles created by the community</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: templatesData?.total || 0, label: 'Templates', icon: Layers },
                { value: totalUses, label: 'Uses', icon: Download },
                { value: totalLikes, label: 'Likes', icon: Heart },
                { value: featuredTemplates?.length || 0, label: 'Featured', icon: Star },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-center px-3 py-2 rounded-xl"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <stat.icon size={12} style={{ color: theme.colors.primary }} />
                    <p className="text-lg font-bold" style={{ color: theme.colors.foreground }}>{stat.value}</p>
                  </div>
                  <p className="text-[9px] font-medium" style={{ color: theme.colors.foregroundMuted }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-6"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: theme.colors.foregroundMuted }} />
                <input
                  type="text"
                  placeholder="Search templates by name, creator, or style..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                  {SORT_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setSort(option.value as typeof sort)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                      style={{
                        background: sort === option.value ? theme.colors.primary : 'transparent',
                        color: sort === option.value ? '#fff' : theme.colors.foregroundMuted,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <option.icon size={12} />
                      {option.label}
                    </motion.button>
                  ))}
                </div>

                <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                  {[
                    { mode: 'grid' as const, icon: LayoutGrid },
                    { mode: 'list' as const, icon: List },
                  ].map(({ mode, icon: Icon }) => (
                    <motion.button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="p-2.5"
                      style={{
                        background: viewMode === mode ? theme.colors.primary : theme.colors.backgroundSecondary,
                        color: viewMode === mode ? '#fff' : theme.colors.foregroundMuted,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={16} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
              {CATEGORIES.map(({ id, label, icon: Icon, color }) => (
                <motion.button
                  key={id}
                  onClick={() => setCategory(id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: category === id ? `${color}15` : 'transparent',
                    color: category === id ? color : theme.colors.foregroundMuted,
                    border: `1px solid ${category === id ? color : theme.colors.border}`,
                  }}
                  whileHover={{ scale: 1.02, borderColor: color }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={14} style={{ color: category === id ? color : theme.colors.foregroundMuted }} />
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 className="w-10 h-10" style={{ color: theme.colors.primary }} />
              </motion.div>
              <p className="mt-4 text-sm" style={{ color: theme.colors.foregroundMuted }}>Loading templates...</p>
            </div>
          ) : templatesData?.templates && templatesData.templates.length > 0 ? (
            <motion.div
              className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'space-y-3'
              }
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            >
              {templatesData.templates.map((template) => (
                <motion.div
                  key={template.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
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
              className="flex flex-col items-center justify-center py-20 rounded-2xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${theme.colors.primary}10` }}>
                <Layers size={40} style={{ color: theme.colors.primary }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.foreground }}>No templates found</h3>
              <p className="text-sm mb-6 text-center max-w-md" style={{ color: theme.colors.foregroundMuted }}>
                Try adjusting your filters or search terms to find what you're looking for
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => { setSearch(''); setCategory('all') }}
                  className="px-6 py-3 rounded-xl font-medium text-sm"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear Filters
                </motion.button>
                {!currentUser && (
                  <Link
                    to="/sign-up"
                    className="px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 text-white"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                  >
                    <Crown size={16} />
                    Sign up to create
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
  const settings = template.settings as { 
    accentColor?: string
    customBackground?: { type: string; value?: string; imageUrl?: string }
    customCSS?: string
    animatedProfile?: { enabled?: boolean }
  }
  const accentColor = settings?.accentColor || theme.colors.primary
  const bgPreview = settings?.customBackground?.type === 'image' && settings.customBackground.imageUrl
    ? `url(${settings.customBackground.imageUrl}) center/cover`
    : settings?.customBackground?.type === 'gradient' 
    ? settings.customBackground.value 
    : settings?.customBackground?.type === 'solid'
    ? settings.customBackground.value
    : `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`
  
  const hasCreatorFeatures = !!(settings?.customCSS || settings?.animatedProfile?.enabled)
  const requiredTier = hasCreatorFeatures ? 'Creator' : 'Pro'
  const tierColor = hasCreatorFeatures ? '#f59e0b' : '#3b82f6'
  const categoryData = CATEGORIES.find(c => c.id === template.category)

  if (listView) {
    return (
      <motion.div
        className="flex items-center gap-4 p-3 rounded-xl group cursor-pointer"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        whileHover={{ scale: 1.005, borderColor: theme.colors.primary }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onPreview}
      >
        <div className="w-16 h-16 rounded-xl shrink-0 relative overflow-hidden" style={{ background: bgPreview }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
            <Eye size={18} className="text-white" />
          </div>
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold flex items-center gap-0.5 backdrop-blur-md" style={{ background: `${tierColor}dd`, color: '#fff' }}>
            <Crown size={8} />{requiredTier[0]}
          </div>
          {featured && (
            <div className="absolute top-1 right-1">
              <Sparkles size={12} className="text-yellow-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate" style={{ color: theme.colors.foreground }}>{template.name}</h3>
            {categoryData && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-medium flex items-center gap-1" style={{ background: `${categoryData.color}15`, color: categoryData.color }}>
                <categoryData.icon size={10} />
                {categoryData.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.foregroundMuted }}>
            <span className="flex items-center gap-1"><User size={12} />{template.userUsername || 'Anonymous'}</span>
            <span className="flex items-center gap-1"><Download size={12} />{template.uses || 0}</span>
            <span className="flex items-center gap-1"><Heart size={12} />{template.likes || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button 
            onClick={(e) => { e.stopPropagation(); onLike() }} 
            className="p-2 rounded-lg" 
            style={{ background: theme.colors.backgroundSecondary }} 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart size={16} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
          <motion.button 
            onClick={(e) => { e.stopPropagation(); onApply() }} 
            disabled={!canApply || isApplying} 
            className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2" 
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isApplying ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Apply
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-2xl overflow-hidden group cursor-pointer relative"
      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onPreview}
    >
      <div className="h-28 relative overflow-hidden" style={{ background: bgPreview }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div className="px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md" style={{ background: `${tierColor}dd`, color: '#fff' }}>
            <Crown size={10} />{requiredTier}+
          </div>
          {featured && (
            <div className="px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md" style={{ background: 'rgba(234, 179, 8, 0.9)', color: '#fff' }}>
              <Sparkles size={10} />Featured
            </div>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <motion.div 
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          >
            <Eye size={20} className="text-white" />
          </motion.div>
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-bold text-sm text-white truncate drop-shadow-lg">{template.name}</h3>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <User size={12} style={{ color: theme.colors.foregroundMuted }} />
            <span className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>{template.userUsername || 'Anonymous'}</span>
          </div>
          {categoryData && (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-medium" style={{ background: `${categoryData.color}15`, color: categoryData.color }}>
              {categoryData.label}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.foregroundMuted }}>
            <span className="flex items-center gap-1"><Download size={12} />{template.uses || 0}</span>
            <motion.button 
              onClick={(e) => { e.stopPropagation(); onLike() }} 
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Heart size={12} />{template.likes || 0}
            </motion.button>
          </div>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onApply() }}
            disabled={!canApply || isApplying}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isApplying ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
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
