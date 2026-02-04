import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import {
  getApiKeysFn,
  createApiKeyFn,
  deleteApiKeyFn,
} from '@/server/functions/api-keys'
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Shield,
  Clock,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

const EXPIRATION_OPTIONS = [
  { value: 30, label: '30' },
  { value: 90, label: '90' },
  { value: 180, label: '180' },
  { value: 365, label: '365' },
  { value: 0, label: 'never' },
] as const

const getTierLimits = (tier: string) => {
  switch (tier) {
    case 'lifetime':
    case 'creator':
      return { maxKeys: 10, rateLimit: 10000 }
    case 'pro':
      return { maxKeys: 5, rateLimit: 5000 }
    default:
      return { maxKeys: 2, rateLimit: 1000 }
  }
}

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
    profile: { read: true, write: false },
    links: { read: true, write: false, delete: false },
    analytics: { read: false },
    templates: { read: true, apply: false },
  })

  const tierLimits = getTierLimits(currentUser?.tier || 'free')

  const getApiKeys = useServerFn(getApiKeysFn)
  const createApiKey = useServerFn(createApiKeyFn)
  const deleteApiKey = useServerFn(deleteApiKeyFn)

  const { data: apiKeysData, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => getApiKeys(),
  })

  const apiKeys = apiKeysData?.keys || []
  const activeKeysCount = apiKeys.filter((k) => k.isActive).length

  const createMutation = useMutation({
    mutationFn: () =>
      createApiKey({
        data: {
          name: newKeyName || 'Unnamed Key',
          permissions,
          expiresInDays: expirationDays || undefined,
        },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setNewKey(data.apiKey.key)
      setNewKeyName('')
      setIsCreating(false)
      setPermissions({
        profile: { read: true, write: false },
        links: { read: true, write: false, delete: false },
        analytics: { read: false },
        templates: { read: true, apply: false },
      })
      setExpirationDays(0)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApiKey({ data: { keyId: id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleKeyExpanded = (id: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••'
    return key.slice(0, 4) + '••••••••' + key.slice(-4)
  }

  const getKeyStatus = (key: { isActive: boolean; expiresAt: Date | null }) => {
    if (!key.isActive) return 'inactive'
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) return 'expired'
    return 'active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20'
      case 'inactive':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'expired':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-foreground-muted bg-background-secondary'
    }
  }

  return (
    <motion.div
      key="api"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header with Tier Limits */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t('dashboard.api.title')}
          </h2>
          <p className="text-sm text-foreground-muted">
            {t('dashboard.api.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tier Limits Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background-secondary/50 border border-border">
            <Activity size={14} className="text-primary" />
            <span className="text-xs text-foreground-muted">
              {t('dashboard.api.tierLimits.keys', {
                current: activeKeysCount,
                max: tierLimits.maxKeys,
              })}
            </span>
            <span className="text-xs text-foreground-muted/50">•</span>
            <span className="text-xs text-foreground-muted">
              {t('dashboard.api.tierLimits.rate', {
                count: tierLimits.rateLimit,
              })}
            </span>
          </div>
          <a
            href="/docs/api"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors duration-(--animation-speed) bg-background-secondary/30 text-foreground-muted hover:bg-background-secondary/50"
          >
            {t('dashboard.api.documentation')}
            <ExternalLink size={14} />
          </a>
          <motion.button
            onClick={() => setIsCreating(true)}
            disabled={activeKeysCount >= tierLimits.maxKeys}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-linear-to-br from-primary to-accent text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{
              scale: activeKeysCount >= tierLimits.maxKeys ? 1 : 1.02,
            }}
            whileTap={{
              scale: activeKeysCount >= tierLimits.maxKeys ? 1 : 0.98,
            }}
          >
            <Plus size={18} />
            {t('dashboard.api.createKey')}
          </motion.button>
        </div>
      </div>

      {/* New Key Display */}
      <AnimatePresence>
        {newKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg overflow-hidden bg-green-500/10 border border-green-500/30 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Check size={18} className="text-green-400" />
              <p className="text-green-400 font-medium">
                {t('dashboard.api.keyCreated')}
              </p>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-yellow-400" />
              <p className="text-sm text-foreground-muted">
                {t('dashboard.api.keyCreatedWarning')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-xl bg-background-secondary/50 font-mono text-sm text-green-400 break-all">
                {newKey}
              </code>
              <button
                onClick={() => copyKey(newKey)}
                className="p-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 transition-colors duration-(--animation-speed)"
              >
                {copiedKey === newKey ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} className="text-green-400" />
                )}
              </button>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="mt-3 text-sm text-foreground-muted hover:text-foreground transition-colors duration-(--animation-speed)"
            >
              {t('dashboard.api.dismiss')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Key Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg overflow-hidden bg-card/50 border border-border p-5"
          >
            <h3 className="font-bold text-foreground mb-4">
              {t('dashboard.api.createKey')}
            </h3>
            <div className="space-y-5">
              {/* Key Name */}
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  {t('dashboard.api.keyName')}
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={t('dashboard.api.keyNamePlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  <Clock size={14} className="inline mr-1" />
                  {t('dashboard.api.expiration')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPIRATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setExpirationDays(option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-(--animation-speed) ${
                        expirationDays === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background-secondary text-foreground-muted hover:bg-background-secondary/80'
                      }`}
                    >
                      {t(`dashboard.api.expirationOptions.${option.label}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  <Shield size={14} className="inline mr-1" />
                  {t('dashboard.api.permissions')}
                </label>
                <p className="text-xs text-foreground-muted/70 mb-3">
                  {t('dashboard.api.permissionsDescription')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Profile Permissions */}
                  <div className="p-3 rounded-lg bg-background-secondary/50 border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">
                      {t('dashboard.api.profile')}
                    </p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.profile.read}
                          onChange={(e) =>
                            setPermissions({
                              ...permissions,
                              profile: {
                                ...permissions.profile,
                                read: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-border"
                        />
                        {t('dashboard.api.read')}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.profile.write}
                          onChange={(e) =>
                            setPermissions({
                              ...permissions,
                              profile: {
                                ...permissions.profile,
                                write: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-border"
                        />
                        {t('dashboard.api.write')}
                      </label>
                    </div>
                  </div>
                  {/* Links Permissions */}
                  <div className="p-3 rounded-lg bg-background-secondary/50 border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">
                      {t('dashboard.api.links')}
                    </p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.links.read}
                          onChange={(e) =>
                            setPermissions({
                              ...permissions,
                              links: {
                                ...permissions.links,
                                read: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-border"
                        />
                        {t('dashboard.api.read')}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.links.write}
                          onChange={(e) =>
                            setPermissions({
                              ...permissions,
                              links: {
                                ...permissions.links,
                                write: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-border"
                        />
                        {t('dashboard.api.write')}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.links.delete}
                          onChange={(e) =>
                            setPermissions({
                              ...permissions,
                              links: {
                                ...permissions.links,
                                delete: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-border"
                        />
                        {t('dashboard.api.delete')}
                      </label>
                    </div>
                  </div>
                  {/* Analytics Permissions */}
                  <div className="p-3 rounded-lg bg-background-secondary/50 border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">
                      {t('dashboard.api.analytics')}
                    </p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.analytics.read}
                          onChange={(e) =>
                            setPermissions({
                              ...permissions,
                              analytics: { read: e.target.checked },
                            })
                          }
                          className="rounded border-border"
                        />
                        {t('dashboard.api.read')}
                      </label>
                    </div>
                  </div>
                  {/* Templates Permissions */}
                  <div className="p-3 rounded-lg bg-background-secondary/50 border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">
                      {t('dashboard.api.templates')}
                    </p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.templates.read}
                          onChange={(e) =>
                            setPermissions({
                              ...permissions,
                              templates: {
                                ...permissions.templates,
                                read: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-border"
                        />
                        {t('dashboard.api.read')}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.templates.apply}
                          onChange={(e) =>
                            setPermissions({
                              ...permissions,
                              templates: {
                                ...permissions.templates,
                                apply: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-border"
                        />
                        {t('dashboard.api.apply')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-background-secondary hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
                >
                  {t('dashboard.cancel')}
                </button>
                <motion.button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {createMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {t('dashboard.api.createKey')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Keys List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Key size={32} className="text-primary/50" />
          </div>
          <p className="text-foreground font-medium mb-1">
            {t('dashboard.api.noKeys')}
          </p>
          <p className="text-sm text-foreground-muted">
            {t('dashboard.api.noKeysDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => {
            const status = getKeyStatus(key)
            const statusColor = getStatusColor(status)
            const isExpanded = expandedKeys.has(key.id)
            const keyPermissions = key.permissions as ApiKeyPermissions

            return (
              <motion.div
                key={key.id}
                className="rounded-lg overflow-hidden bg-card/50 border border-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Main Row */}
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20">
                    <Key size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{key.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {t(`dashboard.api.${status}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-foreground-muted font-mono">
                        {visibleKeys.has(key.id)
                          ? key.keyPrefix + '...'
                          : maskKey(key.keyPrefix || '')}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="text-foreground-muted/50 hover:text-foreground-muted transition-colors duration-(--animation-speed)"
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff size={12} />
                        ) : (
                          <Eye size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right text-xs text-foreground-muted">
                    <p>
                      {t('dashboard.api.lastUsed')}:{' '}
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleDateString()
                        : t('dashboard.api.never')}
                    </p>
                    <p>
                      {t('dashboard.api.created')}:{' '}
                      {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleKeyExpanded(key.id)}
                      className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-(--animation-speed)"
                    >
                      {isExpanded ? (
                        <ChevronUp
                          size={16}
                          className="text-foreground-muted"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-foreground-muted"
                        />
                      )}
                    </button>
                    <button
                      onClick={() => copyKey(key.keyPrefix || '')}
                      className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-(--animation-speed)"
                    >
                      {copiedKey === key.keyPrefix ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-foreground-muted" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(key.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors duration-(--animation-speed)"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border overflow-hidden"
                    >
                      <div className="p-4 bg-background-secondary/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Rate Limit */}
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">
                            {t('dashboard.api.rateLimit')}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {t('dashboard.api.rateLimitValue', {
                              count: key.rateLimit || 1000,
                            })}
                          </p>
                        </div>
                        {/* Requests */}
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">
                            {t('dashboard.api.requests')}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {key.requestCount || 0}
                          </p>
                        </div>
                        {/* Expires */}
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">
                            {t('dashboard.api.expires')}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {key.expiresAt
                              ? new Date(key.expiresAt).toLocaleDateString()
                              : t('dashboard.api.noExpiry')}
                          </p>
                        </div>
                        {/* Permissions Summary */}
                        <div>
                          <p className="text-xs text-foreground-muted mb-1">
                            {t('dashboard.api.permissions')}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {keyPermissions?.profile?.read && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                                Profile
                              </span>
                            )}
                            {keyPermissions?.links?.read && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                                Links
                              </span>
                            )}
                            {keyPermissions?.analytics?.read && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                                Analytics
                              </span>
                            )}
                            {keyPermissions?.templates?.read && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">
                                Templates
                              </span>
                            )}
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
