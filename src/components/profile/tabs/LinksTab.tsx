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
  getMyLinkGroupsFn,
  createLinkGroupFn,
  updateLinkGroupFn,
  deleteLinkGroupFn,
  reorderLinkGroupsFn,
  assignLinkToGroupFn,
} from '@/server/functions/link-groups'
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
  FolderPlus,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

type LinkItem = {
  id: string
  title: string
  url: string
  description?: string | null
  clicks?: number | null
  groupId?: string | null
}

type LinkGroup = {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  isCollapsible: boolean | null
  isCollapsed: boolean | null
  order: number | null
}

export function LinksTab() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [isAddingGroup, setIsAddingGroup] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [editingGroup, setEditingGroup] = useState<LinkGroup | null>(null)
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '', groupId: '' })
  const [newGroup, setNewGroup] = useState({ name: '', color: '#8b5cf6', isCollapsible: true })
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [activeView, setActiveView] = useState<'all' | 'groups'>('all')

  const getMyLinks = useServerFn(getMyLinksFn)
  const createLink = useServerFn(createLinkFn)
  const updateLink = useServerFn(updateLinkFn)
  const deleteLink = useServerFn(deleteLinkFn)
  const reorderLinks = useServerFn(reorderLinksFn)

  const getMyGroups = useServerFn(getMyLinkGroupsFn)
  const createGroup = useServerFn(createLinkGroupFn)
  const updateGroup = useServerFn(updateLinkGroupFn)
  const deleteGroup = useServerFn(deleteLinkGroupFn)
  const reorderGroups = useServerFn(reorderLinkGroupsFn)
  const assignToGroup = useServerFn(assignLinkToGroupFn)

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['my-links'],
    queryFn: () => getMyLinks(),
  })

  const { data: groups = [] } = useQuery({
    queryKey: ['my-link-groups'],
    queryFn: () => getMyGroups(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { title: string; url: string; description?: string }) =>
      createLink({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
      setIsAddingLink(false)
      setNewLink({ title: '', url: '', description: '', groupId: '' })
    },
  })

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; color?: string; isCollapsible?: boolean }) =>
      createGroup({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-link-groups'] })
      setIsAddingGroup(false)
      setNewGroup({ name: '', color: '#8b5cf6', isCollapsible: true })
    },
  })

  const updateGroupMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; color?: string; isCollapsible?: boolean }) =>
      updateGroup({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-link-groups'] })
      setEditingGroup(null)
    },
  })

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => deleteGroup({ data: { id, moveLinksToUngrouped: true } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-link-groups'] })
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
    },
  })

  const assignToGroupMutation = useMutation({
    mutationFn: (data: { linkId: string; groupId: string | null }) =>
      assignToGroup({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-links'] })
    },
  })

  const reorderGroupsMutation = useMutation({
    mutationFn: (data: { id: string; order: number }[]) =>
      reorderGroups({ data: { groups: data } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-link-groups'] })
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

  const handleAddGroup = () => {
    if (!newGroup.name) return
    createGroupMutation.mutate({
      name: newGroup.name,
      color: newGroup.color,
      isCollapsible: newGroup.isCollapsible,
    })
  }

  const handleUpdateGroup = () => {
    if (!editingGroup) return
    updateGroupMutation.mutate({
      id: editingGroup.id,
      name: editingGroup.name,
      color: editingGroup.color || undefined,
      isCollapsible: editingGroup.isCollapsible ?? true,
    })
  }

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const handleGroupReorder = (newOrder: typeof groups) => {
    reorderGroupsMutation.mutate(newOrder.map((g, i) => ({ id: g.id, order: i })))
  }

  // Organize links by group
  const ungroupedLinks = links.filter((l) => !l.groupId)
  const getLinksForGroup = (groupId: string) => links.filter((l) => l.groupId === groupId)

  return (
    <motion.div
      key="links"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('dashboard.links.title')}</h2>
          <p className="text-sm text-foreground-muted">{t('dashboard.links.dragToReorder')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-background-secondary/50 p-1">
            <button
              onClick={() => setActiveView('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeView === 'all' ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:text-foreground'}`}
            >
              {t('dashboard.links.views.allLinks', 'All Links')}
            </button>
            <button
              onClick={() => setActiveView('groups')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeView === 'groups' ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:text-foreground'}`}
            >
              <Folder size={14} className="inline mr-1" />
              {t('dashboard.links.views.groups', 'Groups')}
            </button>
          </div>
          <motion.button
            onClick={() => setIsAddingGroup(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium bg-background-secondary/50 border border-border text-foreground hover:bg-background-secondary transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FolderPlus size={18} />
            {t('dashboard.links.groups.addGroup', 'Add Group')}
          </motion.button>
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

      {/* Add Group Form */}
      <AnimatePresence>
        {isAddingGroup && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg bg-card/10 border border-border/20"
          >
            <div className="p-5 flex items-center justify-between border-b border-border/20">
              <h3 className="font-bold text-foreground">{t('dashboard.links.groups.addGroup', 'Add Group')}</h3>
              <button onClick={() => setIsAddingGroup(false)} className="p-2 rounded-lg hover:bg-background-secondary transition-colors">
                <X size={18} className="text-foreground-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.groups.groupName', 'Group Name')}</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Social Links"
                  className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.groups.groupColor', 'Color')}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newGroup.color}
                    onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <div className="flex gap-2">
                    {['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewGroup({ ...newGroup, color })}
                        className={`w-8 h-8 rounded-lg transition-transform ${newGroup.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isCollapsible"
                  checked={newGroup.isCollapsible}
                  onChange={(e) => setNewGroup({ ...newGroup, isCollapsible: e.target.checked })}
                  className="w-5 h-5 rounded border-border accent-primary"
                />
                <label htmlFor="isCollapsible" className="text-sm text-foreground-muted">
                  {t('dashboard.links.groups.collapsible', 'Allow visitors to collapse this group')}
                </label>
              </div>
              <button
                onClick={handleAddGroup}
                disabled={!newGroup.name || createGroupMutation.isPending}
                className="w-full py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createGroupMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <FolderPlus size={18} />}
                {t('dashboard.links.groups.addGroup', 'Add Group')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : links.length === 0 && groups.length === 0 ? (
        <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-12 text-center">
          <LinkIcon size={48} className="mx-auto mb-4 text-foreground-muted/30" />
          <p className="text-foreground-muted mb-2">{t('dashboard.links.noLinks')}</p>
          <p className="text-sm text-foreground-muted/50">{t('dashboard.links.addFirst')}</p>
        </div>
      ) : activeView === 'groups' ? (
        /* Groups View */
        <div className="space-y-4">
          {/* Groups List */}
          {groups.length > 0 && (
            <Reorder.Group axis="y" values={groups} onReorder={handleGroupReorder} className="space-y-3">
              {groups.map((group) => {
                const groupLinks = getLinksForGroup(group.id)
                const isExpanded = expandedGroups.has(group.id)
                return (
                  <Reorder.Item
                    key={group.id}
                    value={group}
                    className="rounded-lg overflow-hidden border border-border"
                    style={{ borderLeftColor: group.color || undefined, borderLeftWidth: group.color ? 4 : 1 }}
                  >
                    <div
                      className="p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing bg-card/50"
                      onClick={() => toggleGroupExpanded(group.id)}
                    >
                      <GripVertical size={20} className="text-foreground-muted/50 shrink-0" />
                      <button className="p-1">
                        {isExpanded ? <ChevronDown size={18} className="text-foreground-muted" /> : <ChevronRight size={18} className="text-foreground-muted" />}
                      </button>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${group.color}20` }}>
                        <FolderOpen size={16} style={{ color: group.color || undefined }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{group.name}</p>
                        <p className="text-xs text-foreground-muted">{groupLinks.length} {t('dashboard.links.groups.linksInGroup', { count: groupLinks.length })}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingGroup(group) }}
                          className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                        >
                          <Edit3 size={16} className="text-foreground-muted" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteGroupMutation.mutate(group.id) }}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && groupLinks.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border/50 bg-background-secondary/20"
                        >
                          {groupLinks.map((link) => (
                            <div key={link.id} className="p-3 pl-16 flex items-center gap-3 border-b border-border/20 last:border-0">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                                <p className="text-xs text-foreground-muted truncate">{link.url}</p>
                              </div>
                              <span className="text-xs text-foreground-muted">{link.clicks || 0} clicks</span>
                              <button
                                onClick={() => assignToGroupMutation.mutate({ linkId: link.id, groupId: null })}
                                className="p-1.5 rounded hover:bg-background-secondary text-foreground-muted text-xs"
                                title={t('dashboard.links.groups.removeFromGroup', 'Remove from group')}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>
          )}

          {/* Ungrouped Links */}
          {ungroupedLinks.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-foreground-muted mb-3 flex items-center gap-2">
                <LinkIcon size={14} />
                {t('dashboard.links.groups.ungrouped', 'Ungrouped Links')} ({ungroupedLinks.length})
              </h4>
              <div className="space-y-2">
                {ungroupedLinks.map((link) => (
                  <div key={link.id} className="p-3 rounded-lg bg-card/30 border border-border/50 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                    </div>
                    {groups.length > 0 && (
                      <select
                        className="px-2 py-1 text-xs rounded bg-background-secondary border border-border text-foreground"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            assignToGroupMutation.mutate({ linkId: link.id, groupId: e.target.value })
                          }
                        }}
                      >
                        <option value="">{t('dashboard.links.groups.assignToGroup', 'Add to group...')}</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* All Links View */
        <Reorder.Group axis="y" values={links} onReorder={handleReorder} className="space-y-3">
          {links.map((link) => {
            const linkGroup = groups.find((g) => g.id === link.groupId)
            return (
              <Reorder.Item
                key={link.id}
                value={link}
                className="rounded-lg overflow-hidden bg-card/50 border border-border cursor-grab active:cursor-grabbing"
              >
                <div className="p-4 flex items-center gap-4">
                  <GripVertical size={20} className="text-foreground-muted/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{link.title}</p>
                      {linkGroup && (
                        <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${linkGroup.color}20`, color: linkGroup.color || undefined }}>
                          {linkGroup.name}
                        </span>
                      )}
                    </div>
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
            )
          })}
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

      {/* Edit Group Modal */}
      <AnimatePresence>
        {editingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingGroup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-lg bg-card border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">{t('dashboard.links.editGroup', 'Edit Group')}</h3>
                <button onClick={() => setEditingGroup(null)} className="p-2 rounded-lg hover:bg-background-secondary transition-colors">
                  <X size={18} className="text-foreground-muted" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.groups.groupName', 'Group Name')}</label>
                  <input
                    type="text"
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.links.groups.groupColor', 'Color')}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingGroup.color || '#8b5cf6'}
                      onChange={(e) => setEditingGroup({ ...editingGroup, color: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border-0"
                    />
                    <div className="flex gap-2">
                      {['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditingGroup({ ...editingGroup, color })}
                          className={`w-8 h-8 rounded-lg transition-transform ${editingGroup.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="editIsCollapsible"
                    checked={editingGroup.isCollapsible ?? true}
                    onChange={(e) => setEditingGroup({ ...editingGroup, isCollapsible: e.target.checked })}
                    className="w-5 h-5 rounded border-border accent-primary"
                  />
                  <label htmlFor="editIsCollapsible" className="text-sm text-foreground-muted">
                    {t('dashboard.links.groups.collapsible', 'Allow visitors to collapse this group')}
                  </label>
                </div>
                <button
                  onClick={handleUpdateGroup}
                  disabled={updateGroupMutation.isPending}
                  className="w-full py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateGroupMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
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
