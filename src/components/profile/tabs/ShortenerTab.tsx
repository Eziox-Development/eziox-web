import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { getAppUrl } from '@/lib/utils'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import {
  getMyShortLinksFn, createShortLinkFn, updateShortLinkFn, deleteShortLinkFn,
} from '@/server/functions/shortener'
import {
  Link2, Plus, Copy, Check, Trash2, ExternalLink, Loader2, MousePointerClick,
  X, Calendar, Search, ToggleLeft, ToggleRight, LinkIcon, Clock, TrendingUp, Sparkles,
} from 'lucide-react'

type FilterType = 'all' | 'active' | 'inactive'
type SortType = 'newest' | 'oldest' | 'mostClicks' | 'leastClicks'

export function ShortenerTab() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('newest')
  const [createForm, setCreateForm] = useState({ targetUrl: '', title: '', customCode: '', expiresAt: '' })
  const [createError, setCreateError] = useState<string | null>(null)

  const getMyShortLinks = useServerFn(getMyShortLinksFn)
  const createShortLink = useServerFn(createShortLinkFn)
  const updateShortLink = useServerFn(updateShortLinkFn)
  const deleteShortLink = useServerFn(deleteShortLinkFn)

  const { data: links = [], isLoading } = useQuery({ queryKey: ['my-short-links'], queryFn: () => getMyShortLinks() })

  const createMutation = useMutation({
    mutationFn: (data: { targetUrl: string; title?: string; customCode?: string; expiresAt?: string }) => createShortLink({ data }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['my-short-links'] }); setShowCreateModal(false); setCreateForm({ targetUrl: '', title: '', customCode: '', expiresAt: '' }); setCreateError(null) },
    onError: (error: Error & { message?: string }) => { setCreateError(error.message || t('shortener.create.error')) },
  })
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateShortLink({ data: { id, isActive } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['my-short-links'] }) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShortLink({ data: { id } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['my-short-links'] }); setDeleteConfirmId(null) },
  })

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(`${getAppUrl()}/s/${code}`)
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000)
  }
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setCreateError(null)
    createMutation.mutate({ targetUrl: createForm.targetUrl, title: createForm.title || undefined, customCode: createForm.customCode || undefined, expiresAt: createForm.expiresAt || undefined })
  }

  const filteredAndSortedLinks = useMemo(() => {
    let result = [...links]
    if (filter === 'active') result = result.filter((l) => l.isActive)
    else if (filter === 'inactive') result = result.filter((l) => !l.isActive)
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter((l) => l.title?.toLowerCase().includes(q) || l.code.toLowerCase().includes(q) || l.targetUrl.toLowerCase().includes(q)) }
    switch (sort) {
      case 'oldest': result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break
      case 'mostClicks': result.sort((a, b) => (b.clicks || 0) - (a.clicks || 0)); break
      case 'leastClicks': result.sort((a, b) => (a.clicks || 0) - (b.clicks || 0)); break
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return result
  }, [links, filter, searchQuery, sort])

  const stats = useMemo(() => ({
    totalLinks: links.length,
    activeLinks: links.filter((l) => l.isActive).length,
    totalClicks: links.reduce((sum, l) => sum + (l.clicks || 0), 0),
    avgClicks: links.length > 0 ? Math.round(links.reduce((sum, l) => sum + (l.clicks || 0), 0) / links.length) : 0,
  }), [links])

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 theme-animation'

  return (
    <div className="space-y-6">
      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'totalLinks', value: stats.totalLinks, icon: LinkIcon, color: 'primary' },
          { key: 'activeLinks', value: stats.activeLinks, icon: ToggleRight, color: 'emerald' },
          { key: 'totalClicks', value: stats.totalClicks, icon: MousePointerClick, color: 'accent' },
          { key: 'avgClicks', value: stats.avgClicks, icon: TrendingUp, color: 'amber' },
        ].map((stat, i) => (
          <motion.div key={stat.key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="relative overflow-hidden p-4 rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20">
            <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'primary' ? 'bg-primary/15 text-primary' : stat.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : stat.color === 'accent' ? 'bg-accent/15 text-accent' : 'bg-amber-500/15 text-amber-400'
              }`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-foreground-muted">{t(`shortener.stats.${stat.key}`)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Actions Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('shortener.search.placeholder')} className={`${inputCls} pl-10`} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-card/30 backdrop-blur-sm border border-border/15">
            {(['all', 'active', 'inactive'] as FilterType[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium theme-animation ${filter === f ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:text-foreground'}`}>
                {t(`shortener.filters.${f}`)}
              </button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
            <SelectTrigger className="w-[150px] h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('shortener.sort.newest')}</SelectItem>
              <SelectItem value="oldest">{t('shortener.sort.oldest')}</SelectItem>
              <SelectItem value="mostClicks">{t('shortener.sort.mostClicks')}</SelectItem>
              <SelectItem value="leastClicks">{t('shortener.sort.leastClicks')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent glow-primary">
          <Plus size={18} />{t('shortener.empty.cta')}
        </motion.button>
      </motion.div>

      {/* Links List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
        ) : filteredAndSortedLinks.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-6 rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-primary/15"><Sparkles size={32} className="text-primary" /></div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('shortener.empty.title')}</h3>
            <p className="text-foreground-muted mb-6 max-w-sm mx-auto">{t('shortener.empty.description')}</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent glow-primary">
              <Plus size={18} />{t('shortener.empty.cta')}
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAndSortedLinks.map((link, index) => (
              <motion.div key={link.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.03 }}
                className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5 hover:border-border/40 theme-animation">
                <div className="absolute inset-0 bg-linear-to-br from-primary/2 via-transparent to-accent/2 pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{link.title || link.code}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${link.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-destructive/15 text-destructive'}`}>
                        {link.isActive ? t('shortener.link.active') : t('shortener.link.inactive')}
                      </span>
                    </div>
                    <p className="text-sm text-primary font-medium mb-1">{t('shortener.baseUrl')}{link.code}</p>
                    <p className="text-xs text-foreground-muted truncate">→ {link.targetUrl}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-foreground-muted"><MousePointerClick size={14} /><span className="font-medium text-foreground">{link.clicks || 0}</span></div>
                    <div className="flex items-center gap-1.5 text-foreground-muted"><Clock size={14} /><span>{new Date(link.createdAt).toLocaleDateString()}</span></div>
                    {link.expiresAt && <div className="flex items-center gap-1.5 text-foreground-muted"><Calendar size={14} /><span>{new Date(link.expiresAt).toLocaleDateString()}</span></div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleMutation.mutate({ id: link.id, isActive: !link.isActive })} disabled={toggleMutation.isPending} className="p-2 rounded-lg hover:bg-card/50 theme-animation" title={t('shortener.link.toggle')}>
                      {link.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} className="text-foreground-muted" />}
                    </button>
                    <button onClick={() => copyToClipboard(link.code, link.id)} className="p-2 rounded-lg hover:bg-card/50 theme-animation" title={t('shortener.link.copy')}>
                      {copiedId === link.id ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-foreground-muted" />}
                    </button>
                    <a href={`${getAppUrl()}/s/${link.code}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-card/50 theme-animation" title={t('shortener.link.visit')}>
                      <ExternalLink size={18} className="text-foreground-muted" />
                    </a>
                    <button onClick={() => setDeleteConfirmId(link.id)} className="p-2 rounded-lg hover:bg-destructive/15 theme-animation" title={t('shortener.link.delete')}>
                      <Trash2 size={18} className="text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-2xl backdrop-blur-xl bg-card/80 border border-border/30">
              <div className="flex items-center justify-between p-5 border-b border-border/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15"><Link2 size={20} className="text-primary" /></div>
                  <h2 className="text-lg font-semibold text-foreground">{t('shortener.create.title')}</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-card/50 theme-animation"><X size={20} className="text-foreground-muted" /></button>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                {createError && <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/25 text-destructive text-sm">{createError}</div>}
                <div><label className="block text-sm font-medium text-foreground mb-1.5">{t('shortener.create.targetUrl')}</label><input type="url" required value={createForm.targetUrl} onChange={(e) => setCreateForm((p) => ({ ...p, targetUrl: e.target.value }))} placeholder={t('shortener.create.targetUrlPlaceholder')} className={inputCls} /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">{t('shortener.create.title_field')}</label><input type="text" value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} placeholder={t('shortener.create.titlePlaceholder')} className={inputCls} /></div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('shortener.create.customCode')}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground-muted">{t('shortener.baseUrl')}</span>
                    <input type="text" value={createForm.customCode} onChange={(e) => setCreateForm((p) => ({ ...p, customCode: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') }))} placeholder={t('shortener.create.customCodePlaceholder')} className={`flex-1 ${inputCls}`} />
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">{t('shortener.create.customCodeHint')}</p>
                </div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">{t('shortener.create.expiresAt')}</label><DateTimePicker value={createForm.expiresAt} onChange={(v) => setCreateForm((p) => ({ ...p, expiresAt: v }))} placeholder={t('shortener.create.expiresAtPlaceholder', 'Select expiration date')} /></div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={createMutation.isPending || !createForm.targetUrl}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 glow-primary">
                  {createMutation.isPending ? <><Loader2 size={18} className="animate-spin" />{t('shortener.create.creating')}</> : <><Plus size={18} />{t('shortener.create.submit')}</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-sm p-6 rounded-2xl backdrop-blur-xl bg-card/80 border border-border/30">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-destructive/15 flex items-center justify-center"><Trash2 size={24} className="text-destructive" /></div>
              <h3 className="text-lg font-semibold text-foreground text-center mb-2">{t('shortener.delete.title')}</h3>
              <p className="text-sm text-foreground-muted text-center mb-2">{t('shortener.delete.confirm')}</p>
              <p className="text-xs text-destructive text-center mb-6">{t('shortener.delete.warning')}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/20 text-foreground font-medium hover:bg-card/70 theme-animation">{t('shortener.delete.cancel')}</button>
                <button onClick={() => deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-white font-medium hover:bg-destructive/90 theme-animation disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleteMutation.isPending ? <><Loader2 size={16} className="animate-spin" />{t('shortener.delete.deleting')}</> : t('shortener.delete.delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
