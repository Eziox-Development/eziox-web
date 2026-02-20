import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { getApiKeysFn, createApiKeyFn, deleteApiKeyFn } from '@/server/functions/api-keys'
import {
  Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Loader2, ExternalLink, Shield,
  Clock, Activity, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

const EXPIRATION_OPTIONS = [
  { value: 30, label: '30' }, { value: 90, label: '90' }, { value: 180, label: '180' },
  { value: 365, label: '365' }, { value: 0, label: 'never' },
] as const

const getTierLimits = (tier: string) => {
  switch (tier) {
    case 'lifetime': case 'creator': return { maxKeys: 10, rateLimit: 10000 }
    case 'pro': return { maxKeys: 5, rateLimit: 5000 }
    default: return { maxKeys: 2, rateLimit: 1000 }
  }
}

const inputCls = 'w-full px-4 py-3 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 theme-animation'

export function ApiAccessTab() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [expirationDays, setExpirationDays] = useState<number>(0)
  const [permissions, setPermissions] = useState<ApiKeyPermissions>({
    profile: { read: true, write: false }, links: { read: true, write: false, delete: false },
    analytics: { read: false }, templates: { read: true, apply: false },
  })

  const tierLimits = getTierLimits(currentUser?.tier || 'free')
  const getApiKeys = useServerFn(getApiKeysFn)
  const createApiKey = useServerFn(createApiKeyFn)
  const deleteApiKey = useServerFn(deleteApiKeyFn)

  const { data: apiKeysData, isLoading } = useQuery({ queryKey: ['api-keys'], queryFn: () => getApiKeys() })
  const apiKeys = apiKeysData?.keys || []
  const activeKeysCount = apiKeys.filter((k) => k.isActive).length

  const createMutation = useMutation({
    mutationFn: () => createApiKey({ data: { name: newKeyName || 'Unnamed Key', permissions, expiresInDays: expirationDays || undefined } }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] }); setNewKey(data.apiKey.key); setNewKeyName(''); setIsCreating(false)
      setPermissions({ profile: { read: true, write: false }, links: { read: true, write: false, delete: false }, analytics: { read: false }, templates: { read: true, apply: false } }); setExpirationDays(0)
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApiKey({ data: { keyId: id } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['api-keys'] }) },
  })

  const copyKey = async (key: string) => { await navigator.clipboard.writeText(key); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000) }
  const toggleKeyVisibility = (id: string) => { setVisibleKeys((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  const toggleKeyExpanded = (id: string) => { setExpandedKeys((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  const maskKey = (key: string) => key.length <= 8 ? '••••••••' : key.slice(0, 4) + '••••••••' + key.slice(-4)
  const getKeyStatus = (key: { isActive: boolean; expiresAt: Date | null }) => { if (!key.isActive) return 'inactive'; if (key.expiresAt && new Date(key.expiresAt) < new Date()) return 'expired'; return 'active' }
  const getStatusColor = (status: string) => { switch (status) { case 'active': return 'text-emerald-400 bg-emerald-500/15'; case 'inactive': return 'text-amber-400 bg-amber-500/15'; case 'expired': return 'text-destructive bg-destructive/15'; default: return 'text-foreground-muted bg-background-secondary' } }

  return (
    <motion.div key="api" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('dashboard.api.title')}</h2>
          <p className="text-sm text-foreground-muted">{t('dashboard.api.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/30 backdrop-blur-sm border border-border/20">
            <Activity size={14} className="text-primary" />
            <span className="text-xs text-foreground-muted">{t('dashboard.api.tierLimits.keys', { current: activeKeysCount, max: tierLimits.maxKeys })}</span>
            <span className="text-xs text-foreground-muted/50">•</span>
            <span className="text-xs text-foreground-muted">{t('dashboard.api.tierLimits.rate', { count: tierLimits.rateLimit })}</span>
          </div>
          <a href="/docs/api" target="_blank" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/30 backdrop-blur-sm border border-border/20 text-foreground-muted hover:bg-card/50 theme-animation">
            {t('dashboard.api.documentation')}<ExternalLink size={14} />
          </a>
          <motion.button whileHover={{ scale: activeKeysCount >= tierLimits.maxKeys ? 1 : 1.03 }} whileTap={{ scale: activeKeysCount >= tierLimits.maxKeys ? 1 : 0.97 }}
            onClick={() => setIsCreating(true)} disabled={activeKeysCount >= tierLimits.maxKeys}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-linear-to-br from-primary to-accent text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed glow-primary">
            <Plus size={18} />{t('dashboard.api.createKey')}
          </motion.button>
        </div>
      </div>

      {/* New Key Display */}
      <AnimatePresence>
        {newKey && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl overflow-hidden backdrop-blur-xl bg-emerald-500/8 border border-emerald-500/25 p-5">
            <div className="flex items-center gap-2 mb-2"><Check size={18} className="text-emerald-400" /><p className="text-emerald-400 font-medium">{t('dashboard.api.keyCreated')}</p></div>
            <div className="flex items-center gap-2 mb-3"><AlertCircle size={14} className="text-amber-400" /><p className="text-sm text-foreground-muted">{t('dashboard.api.keyCreatedWarning')}</p></div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-xl bg-background-secondary/30 backdrop-blur-sm font-mono text-sm text-emerald-400 break-all">{newKey}</code>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => copyKey(newKey)} className="p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 theme-animation">
                {copiedKey === newKey ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-emerald-400" />}
              </motion.button>
            </div>
            <button onClick={() => setNewKey(null)} className="mt-3 text-sm text-foreground-muted hover:text-foreground theme-animation">{t('dashboard.api.dismiss')}</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Key Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl overflow-hidden backdrop-blur-xl bg-card/30 border border-border/20 p-5">
            <h3 className="font-bold text-foreground mb-4">{t('dashboard.api.createKey')}</h3>
            <div className="space-y-5">
              <div><label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.api.keyName')}</label><input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder={t('dashboard.api.keyNamePlaceholder')} className={inputCls} /></div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2"><Clock size={14} className="inline mr-1" />{t('dashboard.api.expiration')}</label>
                <div className="flex flex-wrap gap-2">
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <motion.button key={opt.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setExpirationDays(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium theme-animation ${expirationDays === opt.value ? 'bg-primary text-primary-foreground' : 'bg-background-secondary/30 text-foreground-muted hover:bg-background-secondary/50 border border-border/15'}`}>
                      {t(`dashboard.api.expirationOptions.${opt.label}`)}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2"><Shield size={14} className="inline mr-1" />{t('dashboard.api.permissions')}</label>
                <p className="text-xs text-foreground-muted/70 mb-3">{t('dashboard.api.permissionsDescription')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'profile', perms: ['read', 'write'] },
                    { key: 'links', perms: ['read', 'write', 'delete'] },
                    { key: 'analytics', perms: ['read'] },
                    { key: 'templates', perms: ['read', 'apply'] },
                  ].map((section) => (
                    <div key={section.key} className="p-3 rounded-lg bg-background-secondary/20 backdrop-blur-sm border border-border/15">
                      <p className="text-sm font-medium text-foreground mb-2">{t(`dashboard.api.${section.key}`)}</p>
                      <div className="flex gap-2">
                        {section.perms.map((perm) => (
                          <label key={perm} className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                            <input type="checkbox" checked={(permissions as unknown as Record<string, Record<string, boolean>>)[section.key]?.[perm] ?? false}
                              onChange={(e) => setPermissions({ ...permissions, [section.key]: { ...(permissions as unknown as Record<string, Record<string, boolean>>)[section.key], [perm]: e.target.checked } })}
                              className="rounded border-border accent-primary" />
                            {t(`dashboard.api.${perm}`)}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsCreating(false)} className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-card/40 backdrop-blur-sm border border-border/20 hover:bg-card/60 theme-animation">{t('dashboard.cancel')}</button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2 glow-primary">
                  {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}{t('dashboard.api.createKey')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Keys List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : apiKeys.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Key size={32} className="text-primary/50" /></div>
          <p className="text-foreground font-medium mb-1">{t('dashboard.api.noKeys')}</p>
          <p className="text-sm text-foreground-muted">{t('dashboard.api.noKeysDescription')}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key, index) => {
            const status = getKeyStatus(key); const statusColor = getStatusColor(status)
            const isExpanded = expandedKeys.has(key.id); const keyPermissions = key.permissions as ApiKeyPermissions
            return (
              <motion.div key={key.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="rounded-2xl overflow-hidden backdrop-blur-xl bg-card/30 border border-border/20 hover:border-border/40 theme-animation">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15"><Key size={20} className="text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{key.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{t(`dashboard.api.${status}`)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-foreground-muted font-mono">{visibleKeys.has(key.id) ? key.keyPrefix + '...' : maskKey(key.keyPrefix || '')}</code>
                      <button onClick={() => toggleKeyVisibility(key.id)} className="text-foreground-muted/50 hover:text-foreground-muted theme-animation">
                        {visibleKeys.has(key.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right text-xs text-foreground-muted">
                    <p>{t('dashboard.api.lastUsed')}: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : t('dashboard.api.never')}</p>
                    <p>{t('dashboard.api.created')}: {new Date(key.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleKeyExpanded(key.id)} className="p-2 rounded-lg hover:bg-card/50 theme-animation">
                      {isExpanded ? <ChevronUp size={16} className="text-foreground-muted" /> : <ChevronDown size={16} className="text-foreground-muted" />}
                    </button>
                    <button onClick={() => copyKey(key.keyPrefix || '')} className="p-2 rounded-lg hover:bg-card/50 theme-animation">
                      {copiedKey === key.keyPrefix ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-foreground-muted" />}
                    </button>
                    <button onClick={() => deleteMutation.mutate(key.id)} disabled={deleteMutation.isPending} className="p-2 rounded-lg hover:bg-destructive/15 theme-animation"><Trash2 size={16} className="text-destructive" /></button>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/15 overflow-hidden">
                      <div className="p-4 bg-background-secondary/10 backdrop-blur-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div><p className="text-xs text-foreground-muted mb-1">{t('dashboard.api.rateLimit')}</p><p className="text-sm font-medium text-foreground">{t('dashboard.api.rateLimitValue', { count: key.rateLimit || 1000 })}</p></div>
                        <div><p className="text-xs text-foreground-muted mb-1">{t('dashboard.api.requests')}</p><p className="text-sm font-medium text-foreground">{key.requestCount || 0}</p></div>
                        <div><p className="text-xs text-foreground-muted mb-1">{t('dashboard.api.expires')}</p><p className="text-sm font-medium text-foreground">{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : t('dashboard.api.noExpiry')}</p></div>
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">{t('dashboard.api.permissions')}</p>
                          <div className="flex flex-wrap gap-1">
                            {keyPermissions?.profile?.read && <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/15 text-blue-400">Profile</span>}
                            {keyPermissions?.links?.read && <span className="px-1.5 py-0.5 rounded text-xs bg-emerald-500/15 text-emerald-400">Links</span>}
                            {keyPermissions?.analytics?.read && <span className="px-1.5 py-0.5 rounded text-xs bg-purple-500/15 text-purple-400">Analytics</span>}
                            {keyPermissions?.templates?.read && <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/15 text-amber-400">Templates</span>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
