import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '../../layout/ThemeProvider'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  getApiKeysFn,
  createApiKeyFn,
  updateApiKeyFn,
  deleteApiKeyFn,
  getApiKeyStatsFn,
  type ApiKeyPermissions,
} from '../../../server/functions/api-keys'
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Activity,
  AlertCircle,
  TrendingUp,
  Zap,
  Lock,
  Unlock,
  Shield,
  Clock,
  BarChart3,
  Code2,
  ExternalLink,
  Sparkles,
  X,
  User,
  Link2,
  Palette,
} from 'lucide-react'

const PERMISSION_CATEGORIES = [
  {
    key: 'profile',
    label: 'Profile',
    icon: User,
    color: '#8b5cf6',
    permissions: ['read', 'write'],
  },
  {
    key: 'links',
    label: 'Links',
    icon: Link2,
    color: '#3b82f6',
    permissions: ['read', 'write', 'delete'],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    color: '#22c55e',
    permissions: ['read'],
  },
  {
    key: 'templates',
    label: 'Templates',
    icon: Palette,
    color: '#f59e0b',
    permissions: ['read', 'apply'],
  },
]

export function ApiAccessTab() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'

  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  const getApiKeys = useServerFn(getApiKeysFn)
  const createApiKey = useServerFn(createApiKeyFn)
  const updateApiKey = useServerFn(updateApiKeyFn)
  const deleteApiKey = useServerFn(deleteApiKeyFn)
  const getApiKeyStats = useServerFn(getApiKeyStatsFn)

  const { data, isLoading } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => getApiKeys(),
  })

  const createMutation = useMutation({
    mutationFn: (input: {
      name: string
      permissions?: Partial<ApiKeyPermissions>
      expiresInDays?: number
    }) => createApiKey({ data: input }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
      if (result && typeof result === 'object' && 'apiKey' in result) {
        const apiKeyResult = result as { apiKey: { key: string } }
        setNewlyCreatedKey(apiKeyResult.apiKey.key)
        toast.success('API Key created successfully!', {
          description: 'Make sure to copy your key now.',
        })
      }
      setShowCreateModal(false)
    },
    onError: (error: Error) => {
      toast.error('Failed to create API key', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: { keyId: string; isActive?: boolean; name?: string }) =>
      updateApiKey({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
      toast.success('API Key updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (input: { keyId: string }) => deleteApiKey({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
      toast.success('API Key deleted')
    },
  })

  const copyToClipboard = (text: string, keyId: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedKey(keyId)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const totalRequests =
    data?.keys?.reduce((acc, k) => acc + (k.requestCount || 0), 0) || 0
  const activeKeys = data?.keys?.filter((k) => k.isActive).length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Key size={16} style={{ color: theme.colors.primary }} />
            </motion.div>
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.foreground }}
            >
              API Access
            </span>
            <Sparkles size={12} style={{ color: theme.colors.accent }} />
          </motion.div>

          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            Manage Your{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              }}
            >
              API Keys
            </span>
          </h2>
          <p style={{ color: theme.colors.foregroundMuted }}>
            Create and manage API keys for programmatic access to Eziox
          </p>
        </div>

        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 font-semibold text-sm flex items-center gap-2 self-start lg:self-auto"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            color: '#fff',
            borderRadius: cardRadius,
            boxShadow:
              glowOpacity > 0
                ? `0 8px 32px ${theme.colors.primary}40`
                : undefined,
          }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Plus size={18} />
          Create API Key
        </motion.button>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Total Keys',
            value: data?.keys?.length || 0,
            icon: Key,
            color: theme.colors.primary,
          },
          {
            label: 'Active',
            value: activeKeys,
            icon: Shield,
            color: '#22c55e',
          },
          {
            label: 'Total Requests',
            value: totalRequests.toLocaleString(),
            icon: TrendingUp,
            color: '#3b82f6',
          },
          {
            label: 'Rate Limit',
            value: '1k-10k/hr',
            icon: Zap,
            color: '#f59e0b',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="p-4 text-center"
            style={{
              background:
                theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}90`
                  : theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
              backdropFilter:
                theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <stat.icon size={18} style={{ color: stat.color }} />
              <span
                className="text-2xl font-bold"
                style={{ color: theme.colors.foreground }}
              >
                {stat.value}
              </span>
            </div>
            <p
              className="text-xs"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Newly Created Key Alert */}
      <AnimatePresence>
        {newlyCreatedKey && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-5 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10)`,
              border: `1px solid ${theme.colors.primary}40`,
              borderRadius: cardRadius,
            }}
          >
            {/* Animated glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${theme.colors.primary}20, transparent 70%)`,
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="relative flex items-start gap-4">
              <motion.div
                className="p-3 rounded-xl"
                style={{ background: `${theme.colors.primary}20` }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <AlertCircle
                  size={24}
                  style={{ color: theme.colors.primary }}
                />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-lg mb-1"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  🎉 API Key Created Successfully!
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  This is the only time you'll see this key. Copy it now and
                  store it securely.
                </p>

                <div className="flex items-center gap-3">
                  <code
                    className="flex-1 px-4 py-3 text-sm font-mono overflow-x-auto"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.primary,
                      borderRadius: `calc(${cardRadius} - 4px)`,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {newlyCreatedKey}
                  </code>
                  <motion.button
                    onClick={() => copyToClipboard(newlyCreatedKey, 'new')}
                    className="px-4 py-3 font-medium flex items-center gap-2"
                    style={{
                      background: theme.colors.primary,
                      color: '#fff',
                      borderRadius: `calc(${cardRadius} - 4px)`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copiedKey === 'new' ? (
                      <Check size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                    {copiedKey === 'new' ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>
              </div>

              <motion.button
                onClick={() => setNewlyCreatedKey(null)}
                className="p-2 rounded-lg"
                style={{ color: theme.colors.foregroundMuted }}
                whileHover={{
                  scale: 1.1,
                  background: `${theme.colors.foregroundMuted}20`,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        <Link to="/api-docs">
          <motion.div
            className="px-4 py-2.5 flex items-center gap-2 cursor-pointer"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
            whileHover={{ scale: 1.02, borderColor: theme.colors.primary }}
            whileTap={{ scale: 0.98 }}
          >
            <Code2 size={16} style={{ color: theme.colors.primary }} />
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.foreground }}
            >
              API Documentation
            </span>
            <ExternalLink
              size={14}
              style={{ color: theme.colors.foregroundMuted }}
            />
          </motion.div>
        </Link>
      </motion.div>

      {/* API Keys List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-semibold"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            Your API Keys
          </h3>
          {data?.keys && data.keys.length > 0 && (
            <span
              className="text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {data.keys.length} key{data.keys.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              className="p-4 rounded-full"
              style={{ background: `${theme.colors.primary}15` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Key size={32} style={{ color: theme.colors.primary }} />
            </motion.div>
          </div>
        ) : data?.keys && data.keys.length > 0 ? (
          <div className="space-y-3">
            {data.keys.map((key, index) => (
              <ApiKeyCard
                key={key.id}
                apiKey={key}
                theme={theme}
                cardRadius={cardRadius}
                glowOpacity={glowOpacity}
                index={index}
                onToggleActive={(isActive) =>
                  updateMutation.mutate({ keyId: key.id, isActive })
                }
                onDelete={() => deleteMutation.mutate({ keyId: key.id })}
                onViewStats={() => {
                  setSelectedKeyId(key.id)
                  setShowStatsModal(true)
                }}
                copiedKey={copiedKey}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 relative overflow-hidden"
            style={{
              background:
                theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}90`
                  : theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
              backdropFilter:
                theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
            }}
          >
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl"
                style={{ background: theme.colors.primary }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            <div className="relative">
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                  border: `1px solid ${theme.colors.primary}30`,
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <Key size={36} style={{ color: theme.colors.primary }} />
              </motion.div>

              <h3
                className="text-xl font-bold mb-2"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                No API Keys Yet
              </h3>
              <p
                className="text-sm mb-6 max-w-sm mx-auto"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Create your first API key to start building integrations with
                Eziox
              </p>

              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 font-semibold text-sm inline-flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  color: '#fff',
                  borderRadius: cardRadius,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                Create Your First Key
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateApiKeyModal
            theme={theme}
            cardRadius={cardRadius}
            glowOpacity={glowOpacity}
            onClose={() => setShowCreateModal(false)}
            onCreate={(data) => createMutation.mutate(data)}
            isCreating={createMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStatsModal && selectedKeyId && (
          <ApiKeyStatsModal
            theme={theme}
            cardRadius={cardRadius}
            glowOpacity={glowOpacity}
            keyId={selectedKeyId}
            onClose={() => {
              setShowStatsModal(false)
              setSelectedKeyId(null)
            }}
            getStats={getApiKeyStats}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface ApiKeyCardProps {
  apiKey: {
    id: string
    name: string
    keyPrefix: string
    isActive: boolean
    rateLimit: number | null
    requestCount: number | null
    lastUsedAt: Date | null
    expiresAt: Date | null
  }
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  glowOpacity: number
  index: number
  onToggleActive: (isActive: boolean) => void
  onDelete: () => void
  onViewStats: () => void
  copiedKey: string | null
  onCopy: (text: string, keyId: string) => void
}

function ApiKeyCard({
  apiKey,
  theme,
  cardRadius,
  glowOpacity,
  index,
  onToggleActive,
  onDelete,
  onViewStats,
  copiedKey,
  onCopy,
}: ApiKeyCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 relative overflow-hidden group"
      style={{
        background:
          theme.effects.cardStyle === 'glass'
            ? `${theme.colors.card}90`
            : theme.colors.card,
        border: `1px solid ${apiKey.isActive ? theme.colors.border : `${theme.colors.foregroundMuted}30`}`,
        borderRadius: cardRadius,
        backdropFilter:
          theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
      }}
      whileHover={{
        scale: 1.01,
        borderColor: theme.colors.primary,
        boxShadow:
          glowOpacity > 0 ? `0 8px 32px ${theme.colors.primary}20` : undefined,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        delay: index * 0.05,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Status indicator line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: apiKey.isActive
            ? `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`
            : theme.colors.foregroundMuted,
          opacity: apiKey.isActive ? 1 : 0.3,
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="p-2 rounded-lg"
              style={{
                background: apiKey.isActive
                  ? `${theme.colors.primary}15`
                  : `${theme.colors.foregroundMuted}15`,
              }}
            >
              <Key
                size={18}
                style={{
                  color: apiKey.isActive
                    ? theme.colors.primary
                    : theme.colors.foregroundMuted,
                }}
              />
            </motion.div>

            <div>
              <h3
                className="font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {apiKey.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    background: apiKey.isActive
                      ? `${theme.colors.primary}20`
                      : `${theme.colors.foregroundMuted}20`,
                    color: apiKey.isActive
                      ? theme.colors.primary
                      : theme.colors.foregroundMuted,
                  }}
                >
                  {apiKey.isActive ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <code
              className="text-sm font-mono px-3 py-1.5"
              style={{
                background: theme.colors.backgroundSecondary,
                color: theme.colors.foregroundMuted,
                borderRadius: '8px',
              }}
            >
              {apiKey.keyPrefix}••••••••
            </code>
            <motion.button
              onClick={() => onCopy(apiKey.keyPrefix, apiKey.id)}
              className="p-1.5 rounded-lg"
              style={{
                background: theme.colors.backgroundSecondary,
                color: theme.colors.foregroundMuted,
              }}
              whileHover={{ scale: 1.1, color: theme.colors.primary }}
              whileTap={{ scale: 0.9 }}
            >
              {copiedKey === apiKey.id ? (
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}
            </motion.button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              {
                label: 'Rate Limit',
                value: `${(apiKey.rateLimit || 1000).toLocaleString()}/hr`,
                icon: Zap,
              },
              {
                label: 'Requests',
                value: (apiKey.requestCount || 0).toLocaleString(),
                icon: TrendingUp,
              },
              {
                label: 'Last Used',
                value: apiKey.lastUsedAt
                  ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                  : 'Never',
                icon: Clock,
              },
              {
                label: 'Expires',
                value: apiKey.expiresAt
                  ? new Date(apiKey.expiresAt).toLocaleDateString()
                  : 'Never',
                icon: Shield,
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon
                    size={12}
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {item.label}
                  </p>
                </div>
                <p
                  className="font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-2"
            >
              <motion.button
                onClick={onViewStats}
                className="p-2.5 rounded-xl"
                style={{
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.foreground,
                }}
                whileHover={{
                  scale: 1.1,
                  background: `${theme.colors.primary}20`,
                }}
                whileTap={{ scale: 0.9 }}
                title="View Statistics"
              >
                <Activity size={16} />
              </motion.button>
              <motion.button
                onClick={() => onToggleActive(!apiKey.isActive)}
                className="p-2.5 rounded-xl"
                style={{
                  background: theme.colors.backgroundSecondary,
                  color: apiKey.isActive
                    ? theme.colors.primary
                    : theme.colors.foregroundMuted,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={apiKey.isActive ? 'Deactivate' : 'Activate'}
              >
                {apiKey.isActive ? <Lock size={16} /> : <Unlock size={16} />}
              </motion.button>
              <motion.button
                onClick={onDelete}
                className="p-2.5 rounded-xl"
                style={{
                  background: '#ef444420',
                  color: '#ef4444',
                }}
                whileHover={{ scale: 1.1, background: '#ef444430' }}
                whileTap={{ scale: 0.9 }}
                title="Delete"
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

interface CreateApiKeyModalProps {
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  glowOpacity: number
  onClose: () => void
  onCreate: (data: {
    name: string
    permissions?: Partial<ApiKeyPermissions>
    expiresInDays?: number
  }) => void
  isCreating: boolean
}

function CreateApiKeyModal({
  theme,
  cardRadius,
  glowOpacity,
  onClose,
  onCreate,
  isCreating,
}: CreateApiKeyModalProps) {
  const [name, setName] = useState('')
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(
    undefined,
  )
  const [permissions, setPermissions] = useState<Partial<ApiKeyPermissions>>({
    profile: { read: true, write: false },
    links: { read: true, write: false, delete: false },
    analytics: { read: false },
    templates: { read: true, apply: false },
  })

  const handleSubmit = () => {
    if (!name.trim()) return
    onCreate({ name, permissions, expiresInDays })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-lg overflow-hidden relative"
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: cardRadius,
          boxShadow:
            glowOpacity > 0
              ? `0 24px 64px ${theme.colors.primary}30`
              : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`,
          }}
        />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Key size={24} style={{ color: theme.colors.primary }} />
            </motion.div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                Create API Key
              </h2>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Configure your new API key
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.foreground }}
              >
                Key Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production API Key"
                className="w-full px-4 py-3 outline-none transition-all"
                style={{
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.foreground,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = theme.colors.primary)
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = theme.colors.border)
                }
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.foreground }}
              >
                Expiration
              </label>
              <select
                value={expiresInDays || ''}
                onChange={(e) =>
                  setExpiresInDays(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-full px-4 py-3 outline-none"
                style={{
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.foreground,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <option value="">Never expires</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: theme.colors.foreground }}
              >
                Permissions
              </label>
              <div className="space-y-3">
                {PERMISSION_CATEGORIES.map((category) => (
                  <motion.div
                    key={category.key}
                    className="p-4"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      borderRadius: `calc(${cardRadius} - 4px)`,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                    whileHover={{ borderColor: category.color }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <category.icon
                        size={16}
                        style={{ color: category.color }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: theme.colors.foreground }}
                      >
                        {category.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {category.permissions.map((perm) => {
                        const categoryPerms = permissions[
                          category.key as keyof ApiKeyPermissions
                        ] as Record<string, boolean> | undefined
                        const isChecked = categoryPerms?.[perm] || false

                        return (
                          <label
                            key={perm}
                            className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg transition-all"
                            style={{
                              background: isChecked
                                ? `${category.color}20`
                                : 'transparent',
                              border: `1px solid ${isChecked ? category.color : theme.colors.border}`,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setPermissions({
                                  ...permissions,
                                  [category.key]: {
                                    ...(permissions[
                                      category.key as keyof ApiKeyPermissions
                                    ] as Record<string, boolean>),
                                    [perm]: e.target.checked,
                                  },
                                })
                              }
                              className="sr-only"
                            />
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center"
                              style={{
                                background: isChecked
                                  ? category.color
                                  : 'transparent',
                                border: `2px solid ${isChecked ? category.color : theme.colors.foregroundMuted}`,
                              }}
                            >
                              {isChecked && <Check size={10} color="#fff" />}
                            </div>
                            <span
                              className="text-xs capitalize"
                              style={{
                                color: isChecked
                                  ? theme.colors.foreground
                                  : theme.colors.foregroundMuted,
                              }}
                            >
                              {perm}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              onClick={onClose}
              className="flex-1 py-3 font-medium"
              style={{
                background: theme.colors.backgroundSecondary,
                color: theme.colors.foreground,
                borderRadius: cardRadius,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={!name.trim() || isCreating}
              className="flex-1 py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                color: '#fff',
                borderRadius: cardRadius,
              }}
              whileHover={{ scale: !name.trim() || isCreating ? 1 : 1.02 }}
              whileTap={{ scale: !name.trim() || isCreating ? 1 : 0.98 }}
            >
              {isCreating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Key size={16} />
                  </motion.div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Key
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface ApiKeyStatsModalProps {
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  glowOpacity: number
  keyId: string
  onClose: () => void
  getStats: (params: { data: { keyId: string; days?: number } }) => Promise<{
    stats?: {
      totalRequests: number
      successfulRequests: number
      failedRequests: number
      avgResponseTime: number
      endpointStats: Record<string, { count: number; errors: number }>
    }
  }>
}

function ApiKeyStatsModal({
  theme,
  cardRadius,
  glowOpacity,
  keyId,
  onClose,
  getStats,
}: ApiKeyStatsModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['apiKeyStats', keyId],
    queryFn: () => getStats({ data: { keyId, days: 7 } }),
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-2xl overflow-hidden max-h-[85vh] overflow-y-auto relative"
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: cardRadius,
          boxShadow:
            glowOpacity > 0
              ? `0 24px 64px ${theme.colors.primary}30`
              : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`,
          }}
        />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
              }}
            >
              <BarChart3 size={24} style={{ color: theme.colors.primary }} />
            </motion.div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                API Key Statistics
              </h2>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Last 7 days of activity
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <motion.div
                className="p-4 rounded-full"
                style={{ background: `${theme.colors.primary}15` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Activity size={32} style={{ color: theme.colors.primary }} />
              </motion.div>
            </div>
          ) : data?.stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Requests',
                    value: data.stats.totalRequests,
                    icon: TrendingUp,
                    color: '#3b82f6',
                  },
                  {
                    label: 'Successful',
                    value: data.stats.successfulRequests,
                    icon: Check,
                    color: '#22c55e',
                  },
                  {
                    label: 'Failed',
                    value: data.stats.failedRequests,
                    icon: AlertCircle,
                    color: '#ef4444',
                  },
                  {
                    label: 'Avg Response',
                    value: `${data.stats.avgResponseTime}ms`,
                    icon: Zap,
                    color: '#f59e0b',
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 text-center"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      borderRadius: `calc(${cardRadius} - 4px)`,
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <stat.icon size={18} style={{ color: stat.color }} />
                      <span
                        className="text-2xl font-bold"
                        style={{ color: theme.colors.foreground }}
                      >
                        {stat.value}
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {data.stats.endpointStats &&
                Object.keys(data.stats.endpointStats).length > 0 && (
                  <div>
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{
                        color: theme.colors.foreground,
                        fontFamily: theme.typography.displayFont,
                      }}
                    >
                      Endpoint Usage
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(data.stats.endpointStats).map(
                        ([endpoint, stats]) => (
                          <motion.div
                            key={endpoint}
                            className="p-4 flex items-center justify-between"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              borderRadius: `calc(${cardRadius} - 4px)`,
                            }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <code
                              className="text-sm font-mono"
                              style={{ color: theme.colors.foreground }}
                            >
                              {endpoint}
                            </code>
                            <div className="flex items-center gap-4 text-sm">
                              <span
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {stats.count} requests
                              </span>
                              {stats.errors > 0 && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs"
                                  style={{
                                    background: '#ef444420',
                                    color: '#ef4444',
                                  }}
                                >
                                  {stats.errors} errors
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity
                size={48}
                style={{ color: theme.colors.foregroundMuted }}
                className="mx-auto mb-4 opacity-50"
              />
              <p style={{ color: theme.colors.foregroundMuted }}>
                No statistics available yet
              </p>
            </div>
          )}

          <motion.button
            onClick={onClose}
            className="w-full py-3 font-medium mt-6"
            style={{
              background: theme.colors.backgroundSecondary,
              color: theme.colors.foreground,
              borderRadius: cardRadius,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
