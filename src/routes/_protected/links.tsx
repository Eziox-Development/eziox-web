import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { getMyLinksFn, createLinkFn, updateLinkFn, deleteLinkFn } from '@/server/functions/links'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Link as LinkIcon,
  Trash2,
  Edit3,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  X,
  ExternalLink,
  Sparkles,
  MousePointerClick,
  Globe,
  Copy,
  Check,
  Zap,
  TrendingUp,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/links')({
  head: () => ({
    meta: [
      { title: 'Manage Links | Eziox' },
      { name: 'description', content: 'Create and manage your bio page links' },
      { property: 'og:title', content: 'Manage Links | Eziox' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: LinksPage,
})

const linkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  url: z.string().url('Invalid URL'),
  description: z.string().max(255).optional(),
  icon: z.string().max(50).optional(),
})

type LinkFormData = z.infer<typeof linkSchema>

function LinksPage() {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const getMyLinks = useServerFn(getMyLinksFn)
  const createLink = useServerFn(createLinkFn)
  const updateLink = useServerFn(updateLinkFn)
  const deleteLink = useServerFn(deleteLinkFn)

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: '',
      url: '',
      description: '',
      icon: '',
    },
  })

  // Fetch links
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['my-links'],
    queryFn: async () => await getMyLinks(),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: LinkFormData) => {
      return await createLink({ data })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
      setIsCreating(false)
      form.reset()
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LinkFormData> }) => {
      return await updateLink({ data: { id, ...data } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
      setEditingId(null)
      setIsCreating(false)
      form.reset()
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteLink({ data: { id } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
    },
  })

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await updateLink({ data: { id, isActive: !isActive } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  })

  const bioUrl = `https://eziox.link/${currentUser?.username}`
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
  const activeLinks = links.filter(link => link.isActive).length

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(bioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(99, 102, 241, 0.08))' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)'
            }}
          >
            <LinkIcon className="w-10 h-10 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#22c55e' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={14} className="text-white" />
            </motion.div>
          </motion.div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Link Manager
          </h1>
          <p className="text-lg max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Create and organize your bio links
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Links', value: links.length, icon: LinkIcon, gradient: 'from-indigo-500 to-purple-500' },
            { label: 'Active Links', value: activeLinks, icon: Eye, gradient: 'from-green-500 to-emerald-500' },
            { label: 'Total Clicks', value: totalClicks, icon: MousePointerClick, gradient: 'from-amber-500 to-orange-500' },
            { label: 'Avg. CTR', value: links.length > 0 ? `${Math.round((totalClicks / links.length) * 10) / 10}` : '0', icon: TrendingUp, gradient: 'from-pink-500 to-rose-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="relative group"
            >
              <div
                className="relative p-5 rounded-2xl text-center backdrop-blur-sm"
                style={{ 
                  background: 'rgba(var(--card-rgb, 30, 30, 30), 0.8)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                  {isLoading ? '-' : stat.value}
                </p>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bio Link Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          />
          <div
            className="relative p-6 rounded-3xl backdrop-blur-xl"
            style={{ 
              background: 'rgba(var(--card-rgb, 30, 30, 30), 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                >
                  <Globe size={28} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                    Your Bio Page
                  </p>
                  <p className="text-sm font-mono" style={{ color: 'var(--primary)' }}>
                    eziox.link/{currentUser?.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
                  style={{ 
                    background: 'var(--background-secondary)', 
                    color: copied ? '#22c55e' : 'var(--foreground)',
                    border: '1px solid var(--border)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </motion.button>
                <motion.a
                  href={`/${currentUser?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink size={18} />
                  Preview
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Link Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <motion.button
            onClick={() => {
              setIsCreating(!isCreating)
              if (isCreating) {
                setEditingId(null)
                form.reset()
              }
            }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold transition-all"
            style={{
              background: isCreating ? 'var(--background-secondary)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: isCreating ? 'var(--foreground)' : 'white',
              boxShadow: isCreating ? 'none' : '0 10px 30px rgba(99, 102, 241, 0.3)',
              border: isCreating ? '1px solid var(--border)' : 'none',
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isCreating ? <X size={20} /> : <Plus size={20} />}
            {isCreating ? 'Cancel' : 'Add New Link'}
          </motion.button>
        </motion.div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div
                className="p-6 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  {editingId ? 'Edit Link' : 'Create New Link'}
                </h3>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Title *
                    </label>
                    <input
                      {...form.register('title')}
                      placeholder="My Website"
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        background: 'var(--background-secondary)',
                        border: '2px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                    {form.formState.errors.title && (
                      <p className="text-xs text-red-400 mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      URL *
                    </label>
                    <input
                      {...form.register('url')}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        background: 'var(--background-secondary)',
                        border: '2px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                    {form.formState.errors.url && (
                      <p className="text-xs text-red-400 mt-1">{form.formState.errors.url.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Description (optional)
                    </label>
                    <input
                      {...form.register('description')}
                      placeholder="A short description"
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        background: 'var(--background-secondary)',
                        border: '2px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        color: 'white',
                      }}
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Sparkles size={18} />
                          </motion.div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          {editingId ? 'Update Link' : 'Create Link'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Links List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12" style={{ color: 'var(--foreground-muted)' }}>
              Loading links...
            </div>
          ) : links.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <LinkIcon size={48} className="mx-auto mb-4 opacity-50" style={{ color: 'var(--foreground-muted)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                No links yet
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
                Create your first bio link to get started
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'white',
                }}
              >
                <Plus size={18} />
                Create First Link
              </button>
            </motion.div>
          ) : (
            links.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  opacity: link.isActive ? 1 : 0.5,
                }}
              >
                <div className="flex items-center gap-4">
                  <GripVertical size={20} className="cursor-grab" style={{ color: 'var(--foreground-muted)' }} />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                      {link.title}
                    </h4>
                    <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>
                      {link.url}
                    </p>
                    {link.description && (
                      <p className="text-xs mt-1 truncate" style={{ color: 'var(--foreground-muted)' }}>
                        {link.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: link.id, isActive: link.isActive ?? true })}
                      className="p-2 rounded-lg transition-colors hover:bg-[var(--background-secondary)]"
                      style={{ color: link.isActive ? 'var(--primary)' : 'var(--foreground-muted)' }}
                      title={link.isActive ? 'Hide link' : 'Show link'}
                    >
                      {link.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingId(link.id)
                        setIsCreating(true)
                        form.reset({
                          title: link.title,
                          url: link.url,
                          description: link.description || '',
                          icon: link.icon || '',
                        })
                      }}
                      className="p-2 rounded-lg transition-colors hover:bg-[var(--background-secondary)]"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      <Edit3 size={18} />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this link?')) {
                          deleteMutation.mutate(link.id)
                        }
                      }}
                      className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
