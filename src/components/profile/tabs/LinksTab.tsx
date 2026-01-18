import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getMyLinksFn, createLinkFn, updateLinkFn, deleteLinkFn } from '@/server/functions/links'
import { Link as LinkIcon, Eye, EyeOff, MousePointerClick, TrendingUp, Plus, X, Save, Loader2, Edit3, Trash2, GripVertical, Settings2, Star } from 'lucide-react'
import { LinkAdvancedSettings } from '@/components/profile/LinkAdvancedSettings'
import { useAuth } from '@/hooks/use-auth'

const linkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  url: z.string().url('Invalid URL'),
  description: z.string().max(255).optional(),
})

type LinkFormData = z.infer<typeof linkSchema>

interface LinksTabProps {
  accentColor: string
}

export function LinksTab({ accentColor }: LinksTabProps) {
  const queryClient = useQueryClient()
  const getMyLinks = useServerFn(getMyLinksFn)
  const createLink = useServerFn(createLinkFn)
  const updateLink = useServerFn(updateLinkFn)
  const deleteLink = useServerFn(deleteLinkFn)

  const { currentUser } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [advancedSettingsLink, setAdvancedSettingsLink] = useState<typeof links[0] | null>(null)

  const userTier = (currentUser?.tier || 'free') as string
  const isCreator = ['creator', 'lifetime'].includes(userTier)

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: { title: '', url: '', description: '' },
  })

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['my-links'],
    queryFn: () => getMyLinks(),
  })

  const createMutation = useMutation({
    mutationFn: (data: LinkFormData) => createLink({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
      setIsCreating(false)
      form.reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LinkFormData> }) => updateLink({ data: { id, ...data } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
      setEditingId(null)
      setIsCreating(false)
      form.reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLink({ data: { id } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateLink({ data: { id, isActive: !isActive } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['my-links'] }),
  })

  const onSubmit = form.handleSubmit((data) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  })

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
  const activeLinks = links.filter(link => link.isActive).length

  return (
    <motion.div key="links" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Links', value: links.length, icon: LinkIcon, gradient: 'from-indigo-500 to-purple-500' },
          { label: 'Active', value: activeLinks, icon: Eye, gradient: 'from-green-500 to-emerald-500' },
          { label: 'Clicks', value: totalClicks, icon: MousePointerClick, gradient: 'from-amber-500 to-orange-500' },
          { label: 'Avg CTR', value: links.length > 0 ? Math.round(totalClicks / links.length) : 0, icon: TrendingUp, gradient: 'from-pink-500 to-rose-500' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{isLoading ? '-' : stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Add Link Button */}
      <motion.button
        onClick={() => { setIsCreating(!isCreating); if (isCreating) { setEditingId(null); form.reset() } }}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold"
        style={{ background: isCreating ? 'var(--background-secondary)' : `linear-gradient(135deg, ${accentColor}, var(--accent))`, color: isCreating ? 'var(--foreground)' : 'white', border: isCreating ? '1px solid var(--border)' : 'none' }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
      >
        {isCreating ? <X size={20} /> : <Plus size={20} />}
        {isCreating ? 'Cancel' : 'Add New Link'}
      </motion.button>

      {/* Form */}
      <AnimatePresence mode="wait">
        {isCreating && (
          <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>{editingId ? 'Edit Link' : 'Create New Link'}</h3>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Title *</label>
                  <input {...form.register('title')} placeholder="My Website" className="w-full px-4 py-3 rounded-xl outline-none" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  {form.formState.errors.title && <p className="text-xs text-red-400 mt-1">{form.formState.errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>URL *</label>
                  <input {...form.register('url')} placeholder="https://example.com" className="w-full px-4 py-3 rounded-xl outline-none" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  {form.formState.errors.url && <p className="text-xs text-red-400 mt-1">{form.formState.errors.url.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Description</label>
                  <input {...form.register('description')} placeholder="A short description" className="w-full px-4 py-3 rounded-xl outline-none" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                </div>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${accentColor}, var(--accent))` }}>
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingId ? 'Update Link' : 'Create Link'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12" style={{ color: 'var(--foreground-muted)' }}>Loading links...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-12">
            <LinkIcon size={48} className="mx-auto mb-4 opacity-50" style={{ color: 'var(--foreground-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No links yet</h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Create your first bio link</p>
          </div>
        ) : (
          links.map((link) => (
            <motion.div key={link.id} className="p-4 rounded-xl relative" style={{ background: 'var(--card)', border: link.isFeatured ? `2px solid ${accentColor}` : '1px solid var(--border)', opacity: link.isActive ? 1 : 0.5 }}>
              {link.isFeatured && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, #ec4899, #8b5cf6)` }}>
                  <Star size={12} className="text-white" />
                </div>
              )}
              <div className="flex items-center gap-4">
                <GripVertical size={20} className="cursor-grab" style={{ color: 'var(--foreground-muted)' }} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>{link.title}</h4>
                  <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>{link.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(link.clicks ?? 0) > 0 && <span className="text-xs" style={{ color: accentColor }}>{link.clicks} clicks</span>}
                    {link.schedule?.enabled && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>Scheduled</span>}
                    {link.abTestEnabled && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>A/B</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setAdvancedSettingsLink(link)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--foreground-muted)' }} title="Advanced Settings">
                    <Settings2 size={18} />
                  </button>
                  <button onClick={() => toggleMutation.mutate({ id: link.id, isActive: link.isActive ?? true })} className="p-2 rounded-lg hover:bg-white/5" style={{ color: link.isActive ? accentColor : 'var(--foreground-muted)' }}>
                    {link.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button onClick={() => { setEditingId(link.id); setIsCreating(true); form.reset({ title: link.title, url: link.url, description: link.description || '' }) }} className="p-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--foreground-muted)' }}>
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => { if (confirm('Delete this link?')) deleteMutation.mutate(link.id) }} className="p-2 rounded-lg hover:bg-red-500/10" style={{ color: '#ef4444' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {advancedSettingsLink && (
          <LinkAdvancedSettings
            link={advancedSettingsLink}
            isCreator={isCreator}
            onClose={() => setAdvancedSettingsLink(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
