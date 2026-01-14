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
} from 'lucide-react'

export const Route = createFileRoute('/_protected/links')({
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Manage Links
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                Create and organize your bio links
              </p>
            </div>
            <motion.button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
              style={{
                background: isCreating ? 'var(--background-secondary)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: isCreating ? 'var(--foreground)' : 'white',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCreating ? <X size={18} /> : <Plus size={18} />}
              {isCreating ? 'Cancel' : 'Add Link'}
            </motion.button>
          </div>

          {/* Bio Link Preview */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <LinkIcon size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Your Bio Page
                </p>
                <p className="text-xs font-mono" style={{ color: 'var(--primary)' }}>
                  eziox.link/{currentUser?.username}
                </p>
              </div>
            </div>
            <a
              href={`/${currentUser?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--background-secondary)]"
              style={{ color: 'var(--foreground)' }}
            >
              Preview
              <ExternalLink size={14} />
            </a>
          </div>
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
