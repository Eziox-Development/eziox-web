import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import {
  getMyLinksFn,
  createLinkFn,
  updateLinkFn,
  deleteLinkFn,
  reorderLinksFn,
} from '@/server/functions/links'
import {
  Link as LinkIcon,
  Plus,
  GripVertical,
  ExternalLink,
  Trash2,
  Edit3,
  X,
  Loader2,
  MousePointerClick,
} from 'lucide-react'

type LinkItem = {
  id: string
  title: string
  url: string
  description?: string | null
  clicks?: number | null
}

export function LinksTab() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' })

  const getMyLinks = useServerFn(getMyLinksFn)
  const createLink = useServerFn(createLinkFn)
  const updateLink = useServerFn(updateLinkFn)
  const deleteLink = useServerFn(deleteLinkFn)
  const reorderLinks = useServerFn(reorderLinksFn)

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['my-links'],
    queryFn: () => getMyLinks(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { title: string; url: string; description?: string }) =>
      createLink({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
      setIsAddingLink(false)
      setNewLink({ title: '', url: '', description: '' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; url?: string; description?: string }) =>
      updateLink({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
      setEditingLink(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLink({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (reorderData: { id: string; order: number }[]) =>
      reorderLinks({ data: { links: reorderData } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
    },
  })

  const handleReorder = (newOrder: typeof links) => {
    reorderMutation.mutate(newOrder.map((l, i) => ({ id: l.id, order: i })))
  }

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) return
    createMutation.mutate({
      title: newLink.title,
      url: newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`,
      description: newLink.description || undefined,
    })
  }

  const handleUpdateLink = () => {
    if (!editingLink) return
    updateMutation.mutate({
      id: editingLink.id,
      title: editingLink.title,
      url: editingLink.url,
      description: editingLink.description || undefined,
    })
  }

  return (
    <motion.div
      key="links"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('dashboard.links.title')}</h2>
          <p className="text-sm text-foreground-muted">{t('dashboard.links.dragToReorder')}</p>
        </div>
        <motion.button
          onClick={() => setIsAddingLink(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-linear-to-br from-primary to-accent text-primary-foreground"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          {t('dashboard.links.addLink')}
        </motion.button>
      </div>

      <AnimatePresence>
        {isAddingLink && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg bg-card/10 border border-border/20"
          >
            <div className="p-5 flex items-center justify-between border-b border-border/20">
              <h3 className="font-bold text-foreground">{t('dashboard.links.addLink')}</h3>
              <button onClick={() => setIsAddingLink(false)} className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-(--animation-speed)">
                <X size={18} className="text-foreground-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.linkTitle')}</label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  placeholder="My Website"
                  className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.linkUrl')}</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.linkDescription')}</label>
                <input
                  type="text"
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                />
              </div>
              <button
                onClick={handleAddLink}
                disabled={!newLink.title || !newLink.url || createMutation.isPending}
                className="w-full py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {t('dashboard.links.addLink')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : links.length === 0 ? (
        <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-12 text-center">
          <LinkIcon size={48} className="mx-auto mb-4 text-foreground-muted/30" />
          <p className="text-foreground-muted mb-2">{t('dashboard.links.noLinks')}</p>
          <p className="text-sm text-foreground-muted/50">{t('dashboard.links.addFirst')}</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={links} onReorder={handleReorder} className="space-y-3">
          {links.map((link) => (
            <Reorder.Item
              key={link.id}
              value={link}
              className="rounded-lg overflow-hidden bg-card/50 border border-border cursor-grab active:cursor-grabbing"
            >
              <div className="p-4 flex items-center gap-4">
                <GripVertical size={20} className="text-foreground-muted/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{link.title}</p>
                  <p className="text-sm text-foreground-muted truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <MousePointerClick size={14} />
                  <span className="text-sm">{link.clicks || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-(--animation-speed)"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} className="text-foreground-muted" />
                  </a>
                  <button
                    onClick={() => setEditingLink(link)}
                    className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-(--animation-speed)"
                  >
                    <Edit3 size={16} className="text-foreground-muted" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(link.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors duration-(--animation-speed)"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <AnimatePresence>
        {editingLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingLink(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-lg bg-card border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">{t('dashboard.links.editLink')}</h3>
                <button onClick={() => setEditingLink(null)} className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-(--animation-speed)">
                  <X size={18} className="text-foreground-muted" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.linkTitle')}</label>
                  <input
                    type="text"
                    value={editingLink.title}
                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.linkUrl')}</label>
                  <input
                    type="url"
                    value={editingLink.url}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.linkDescription')}</label>
                  <input
                    type="text"
                    value={editingLink.description || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                  />
                </div>
                <button
                  onClick={handleUpdateLink}
                  disabled={updateMutation.isPending}
                  className="w-full py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
                  {t('dashboard.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
