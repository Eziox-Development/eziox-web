/**
 * URL Shortener Page
 * Modern design with full i18n, theme system, and real data
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  getMyShortLinksFn,
  createShortLinkFn,
  updateShortLinkFn,
  deleteShortLinkFn,
} from '@/server/functions/shortener'
import {
  Link2,
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
  MousePointerClick,
  X,
  Calendar,
  Search,
  ToggleLeft,
  ToggleRight,
  LinkIcon,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/shortener')({
  head: () => ({
    meta: [
      { title: 'URL Shortener | Eziox' },
      { name: 'description', content: 'Create and manage short links with click tracking.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ShortenerPage,
})

type FilterType = 'all' | 'active' | 'inactive'
type SortType = 'newest' | 'oldest' | 'mostClicks' | 'leastClicks'

function ShortenerPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  // State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('newest')

  // Create form state
  const [createForm, setCreateForm] = useState({
    targetUrl: '',
    title: '',
    customCode: '',
    expiresAt: '',
  })
  const [createError, setCreateError] = useState<string | null>(null)

  // Theme-based styling
  const cardRadius = theme.effects.borderRadius === 'pill' ? '24px' 
    : theme.effects.borderRadius === 'sharp' ? '8px' : '16px'
  const glowOpacity = theme.effects.glowIntensity === 'strong' ? 0.5
    : theme.effects.glowIntensity === 'medium' ? 0.35
    : theme.effects.glowIntensity === 'subtle' ? 0.2 : 0

  // Server functions
  const getMyShortLinks = useServerFn(getMyShortLinksFn)
  const createShortLink = useServerFn(createShortLinkFn)
  const updateShortLink = useServerFn(updateShortLinkFn)
  const deleteShortLink = useServerFn(deleteShortLinkFn)

  // Query
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['my-short-links'],
    queryFn: () => getMyShortLinks(),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { targetUrl: string; title?: string; customCode?: string; expiresAt?: string }) =>
      createShortLink({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-short-links'] })
      setShowCreateModal(false)
      setCreateForm({ targetUrl: '', title: '', customCode: '', expiresAt: '' })
      setCreateError(null)
    },
    onError: (error: Error & { message?: string }) => {
      setCreateError(error.message || t('shortener.create.error'))
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateShortLink({ data: { id, isActive } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-short-links'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShortLink({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-short-links'] })
      setDeleteConfirmId(null)
    },
  })

  // Handlers
  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(`https://eziox.link/s/${code}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    createMutation.mutate({
      targetUrl: createForm.targetUrl,
      title: createForm.title || undefined,
      customCode: createForm.customCode || undefined,
      expiresAt: createForm.expiresAt || undefined,
    })
  }

  // Computed values
  const filteredAndSortedLinks = useMemo(() => {
    let result = [...links]

    // Filter
    if (filter === 'active') {
      result = result.filter(link => link.isActive)
    } else if (filter === 'inactive') {
      result = result.filter(link => !link.isActive)
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(link =>
        link.title?.toLowerCase().includes(query) ||
        link.code.toLowerCase().includes(query) ||
        link.targetUrl.toLowerCase().includes(query)
      )
    }

    // Sort
    switch (sort) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'mostClicks':
        result.sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        break
      case 'leastClicks':
        result.sort((a, b) => (a.clicks || 0) - (b.clicks || 0))
        break
      default: // newest
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [links, filter, searchQuery, sort])

  const stats = useMemo(() => ({
    totalLinks: links.length,
    activeLinks: links.filter(l => l.isActive).length,
    totalClicks: links.reduce((sum, l) => sum + (l.clicks || 0), 0),
    avgClicks: links.length > 0 ? Math.round(links.reduce((sum, l) => sum + (l.clicks || 0), 0) / links.length) : 0,
  }), [links])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                boxShadow: glowOpacity > 0 ? `0 0 30px ${theme.colors.primary}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}` : undefined,
              }}
            >
              <Link2 size={24} className="text-white" />
            </div>
            <div>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  background: `${theme.colors.primary}20`,
                  color: theme.colors.primary,
                }}
              >
                {t('shortener.badge')}
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('shortener.title')}</h1>
          <p className="text-foreground-muted">{t('shortener.subtitle')}</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { key: 'totalLinks', value: stats.totalLinks, icon: LinkIcon, color: theme.colors.primary },
            { key: 'activeLinks', value: stats.activeLinks, icon: ToggleRight, color: '#22c55e' },
            { key: 'totalClicks', value: stats.totalClicks, icon: MousePointerClick, color: theme.colors.accent },
            { key: 'avgClicks', value: stats.avgClicks, icon: TrendingUp, color: '#f59e0b' },
          ].map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="relative overflow-hidden p-5 backdrop-blur-xl border border-border/50"
              style={{
                borderRadius: cardRadius,
                background: `linear-gradient(135deg, ${theme.colors.card}ee, ${theme.colors.card}cc)`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 opacity-10"
                style={{
                  background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)`,
                }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-foreground-muted">{t(`shortener.stats.${stat.key}`)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('shortener.search.placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-foreground-muted"
              style={{ borderRadius: cardRadius }}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-background-secondary border border-border">
              {(['all', 'active', 'inactive'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {t(`shortener.filters.${f}`)}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="px-3 py-2.5 rounded-xl bg-background-secondary border border-border text-foreground text-sm outline-none focus:border-primary cursor-pointer"
              style={{ borderRadius: cardRadius }}
            >
              <option value="newest">{t('shortener.sort.newest')}</option>
              <option value="oldest">{t('shortener.sort.oldest')}</option>
              <option value="mostClicks">{t('shortener.sort.mostClicks')}</option>
              <option value="leastClicks">{t('shortener.sort.leastClicks')}</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              boxShadow: glowOpacity > 0 ? `0 4px 20px ${theme.colors.primary}${Math.round(glowOpacity * 200).toString(16).padStart(2, '0')}` : undefined,
              borderRadius: cardRadius,
            }}
          >
            <Plus size={18} />
            {t('shortener.empty.cta')}
          </button>
        </motion.div>

        {/* Links List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : filteredAndSortedLinks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6 backdrop-blur-xl border border-border/50"
              style={{
                borderRadius: cardRadius,
                background: `linear-gradient(135deg, ${theme.colors.card}ee, ${theme.colors.card}cc)`,
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: `${theme.colors.primary}20` }}
              >
                <Sparkles size={32} style={{ color: theme.colors.primary }} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('shortener.empty.title')}</h3>
              <p className="text-foreground-muted mb-6 max-w-sm mx-auto">{t('shortener.empty.description')}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  borderRadius: cardRadius,
                }}
              >
                <Plus size={18} />
                {t('shortener.empty.cta')}
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredAndSortedLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative overflow-hidden backdrop-blur-xl border border-border/50 p-5"
                  style={{
                    borderRadius: cardRadius,
                    background: `linear-gradient(135deg, ${theme.colors.card}ee, ${theme.colors.card}cc)`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Link Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {link.title || link.code}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            link.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {link.isActive ? t('shortener.link.active') : t('shortener.link.inactive')}
                        </span>
                      </div>
                      <p className="text-sm text-primary font-medium mb-1">
                        {t('shortener.baseUrl')}{link.code}
                      </p>
                      <p className="text-xs text-foreground-muted truncate">
                        → {link.targetUrl}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-foreground-muted">
                        <MousePointerClick size={14} />
                        <span className="font-medium text-foreground">{link.clicks || 0}</span>
                        <span>{(link.clicks || 0) === 1 ? t('shortener.link.click') : t('shortener.link.clicks')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground-muted">
                        <Clock size={14} />
                        <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                      </div>
                      {link.expiresAt && (
                        <div className="flex items-center gap-1.5 text-foreground-muted">
                          <Calendar size={14} />
                          <span>{new Date(link.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleMutation.mutate({ id: link.id, isActive: !link.isActive })}
                        disabled={toggleMutation.isPending}
                        className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                        title={t('shortener.link.toggle')}
                      >
                        {link.isActive ? (
                          <ToggleRight size={20} className="text-green-400" />
                        ) : (
                          <ToggleLeft size={20} className="text-foreground-muted" />
                        )}
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => copyToClipboard(link.code, link.id)}
                        className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                        title={t('shortener.link.copy')}
                      >
                        {copiedId === link.id ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <Copy size={18} className="text-foreground-muted" />
                        )}
                      </button>

                      {/* Visit */}
                      <a
                        href={`https://eziox.link/s/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                        title={t('shortener.link.visit')}
                      >
                        <ExternalLink size={18} className="text-foreground-muted" />
                      </a>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(link.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        title={t('shortener.link.delete')}
                      >
                        <Trash2 size={18} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden border border-border"
              style={{
                borderRadius: cardRadius,
                background: theme.colors.card,
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.colors.primary}20` }}
                  >
                    <Link2 size={20} style={{ color: theme.colors.primary }} />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{t('shortener.create.title')}</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                >
                  <X size={20} className="text-foreground-muted" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                {createError && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    {createError}
                  </div>
                )}

                {/* Target URL */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t('shortener.create.targetUrl')}
                  </label>
                  <input
                    type="url"
                    required
                    value={createForm.targetUrl}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                    placeholder={t('shortener.create.targetUrlPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl bg-background-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-foreground-muted"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t('shortener.create.title_field')}
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('shortener.create.titlePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl bg-background-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-foreground-muted"
                  />
                </div>

                {/* Custom Code */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t('shortener.create.customCode')}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground-muted">{t('shortener.baseUrl')}</span>
                    <input
                      type="text"
                      value={createForm.customCode}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, customCode: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') }))}
                      placeholder={t('shortener.create.customCodePlaceholder')}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-background-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-foreground-muted"
                    />
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">{t('shortener.create.customCodeHint')}</p>
                </div>

                {/* Expiration */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t('shortener.create.expiresAt')}
                  </label>
                  <input
                    type="datetime-local"
                    value={createForm.expiresAt}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={createMutation.isPending || !createForm.targetUrl}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t('shortener.create.creating')}
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      {t('shortener.create.submit')}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-6 border border-border"
              style={{
                borderRadius: cardRadius,
                background: theme.colors.card,
              }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground text-center mb-2">
                {t('shortener.delete.title')}
              </h3>
              <p className="text-sm text-foreground-muted text-center mb-2">
                {t('shortener.delete.confirm')}
              </p>
              <p className="text-xs text-red-400 text-center mb-6">
                {t('shortener.delete.warning')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background-secondary border border-border text-foreground font-medium hover:bg-background-secondary/80 transition-colors"
                >
                  {t('shortener.delete.cancel')}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t('shortener.delete.deleting')}
                    </>
                  ) : (
                    t('shortener.delete.delete')
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
