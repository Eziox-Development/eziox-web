import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
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
  Sparkles,
  MousePointerClick,
  ToggleLeft,
  ToggleRight,
  X,
  AlertCircle,
  Calendar,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/shortener')({
  head: () => ({
    meta: [
      { title: 'URL Shortener | Eziox' },
      {
        name: 'description',
        content: 'Create and manage short links with click tracking.',
      },
    ],
  }),
  component: ShortenerPage,
})

function ShortenerPage() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  const getMyShortLinks = useServerFn(getMyShortLinksFn)
  const updateShortLink = useServerFn(updateShortLinkFn)
  const deleteShortLink = useServerFn(deleteShortLinkFn)

  const { data: links, isLoading } = useQuery({
    queryKey: ['my-short-links'],
    queryFn: () => getMyShortLinks(),
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
      setDeleteConfirm(null)
    },
  })

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(`https://eziox.link/s/${code}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const totalClicks =
    links?.reduce((sum, link) => sum + (link.clicks || 0), 0) || 0
  const activeLinks = links?.filter((link) => link.isActive).length || 0

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Link2 size={18} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                URL Shortener
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Shorten Your{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Links
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg max-w-xl mx-auto mb-8"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Create short, memorable links and track their performance with
              detailed analytics.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                boxShadow:
                  glowOpacity > 0
                    ? `0 15px 40px ${theme.colors.primary}40`
                    : `0 8px 25px rgba(0,0,0,0.2)`,
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              Create Short Link
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12"
          >
            {[
              {
                icon: Link2,
                label: 'Total Links',
                value: links?.length || 0,
                color: theme.colors.primary,
              },
              {
                icon: ToggleRight,
                label: 'Active',
                value: activeLinks,
                color: '#22c55e',
              },
              {
                icon: MousePointerClick,
                label: 'Total Clicks',
                value: totalClicks,
                color: theme.colors.accent,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="p-4 text-center"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}90`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(20px)'
                      : undefined,
                }}
              >
                <stat.icon
                  size={24}
                  className="mx-auto mb-2"
                  style={{ color: stat.color }}
                />
                <div
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.foreground }}
                >
                  {stat.value.toLocaleString()}
                </div>
                <div
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Links List */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mb-6 rounded-full flex items-center justify-center"
                style={{ background: `${theme.colors.primary}20` }}
              >
                <Loader2 size={32} style={{ color: theme.colors.primary }} />
              </motion.div>
              <p style={{ color: theme.colors.foregroundMuted }}>
                Loading your links...
              </p>
            </div>
          ) : !links || links.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: `${theme.colors.primary}15` }}
              >
                <Link2
                  size={48}
                  style={{ color: theme.colors.primary, opacity: 0.5 }}
                />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: theme.colors.foreground }}
              >
                No Short Links Yet
              </h3>
              <p
                className="mb-8 max-w-md mx-auto"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Create your first short link to start tracking clicks and
                sharing memorable URLs.
              </p>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                Create Your First Link
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {links.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative p-5 group"
                  style={{
                    background:
                      theme.effects.cardStyle === 'glass'
                        ? `${theme.colors.card}90`
                        : theme.colors.card,
                    border: `1px solid ${link.isActive ? theme.colors.border : `${theme.colors.foregroundMuted}30`}`,
                    borderRadius: cardRadius,
                    backdropFilter:
                      theme.effects.cardStyle === 'glass'
                        ? 'blur(20px)'
                        : undefined,
                    opacity: link.isActive ? 1 : 0.7,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Link Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {link.title && (
                          <span
                            className="font-semibold truncate"
                            style={{ color: theme.colors.foreground }}
                          >
                            {link.title}
                          </span>
                        )}
                        {!link.isActive && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: `${theme.colors.foregroundMuted}20`,
                              color: theme.colors.foregroundMuted,
                            }}
                          >
                            Inactive
                          </span>
                        )}
                        {link.expiresAt &&
                          new Date(link.expiresAt) < new Date() && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{
                                background: '#ef444420',
                                color: '#ef4444',
                              }}
                            >
                              Expired
                            </span>
                          )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <code
                          className="text-sm font-mono px-2 py-1 rounded-lg"
                          style={{
                            background: theme.colors.backgroundSecondary,
                            color: theme.colors.primary,
                          }}
                        >
                          eziox.link/s/{link.code}
                        </code>
                        <motion.button
                          onClick={() => copyToClipboard(link.code, link.id)}
                          className="p-1.5 rounded-lg"
                          style={{
                            background: theme.colors.backgroundSecondary,
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copiedId === link.id ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy
                              size={14}
                              style={{ color: theme.colors.foregroundMuted }}
                            />
                          )}
                        </motion.button>
                      </div>

                      <p
                        className="text-sm truncate"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        → {link.targetUrl}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center">
                          <MousePointerClick
                            size={16}
                            style={{ color: theme.colors.accent }}
                          />
                          <span
                            className="font-bold text-lg"
                            style={{ color: theme.colors.foreground }}
                          >
                            {link.clicks || 0}
                          </span>
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          clicks
                        </span>
                      </div>

                      {link.expiresAt && (
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            <Calendar
                              size={16}
                              style={{ color: theme.colors.foregroundMuted }}
                            />
                            <span
                              className="text-sm"
                              style={{ color: theme.colors.foreground }}
                            >
                              {new Date(link.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            expires
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() =>
                          toggleMutation.mutate({
                            id: link.id,
                            isActive: !link.isActive,
                          })
                        }
                        className="p-2 rounded-lg"
                        style={{ background: theme.colors.backgroundSecondary }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={link.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {link.isActive ? (
                          <ToggleRight size={20} className="text-green-500" />
                        ) : (
                          <ToggleLeft
                            size={20}
                            style={{ color: theme.colors.foregroundMuted }}
                          />
                        )}
                      </motion.button>

                      <a
                        href={link.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg"
                        style={{ background: theme.colors.backgroundSecondary }}
                      >
                        <ExternalLink
                          size={20}
                          style={{ color: theme.colors.foregroundMuted }}
                        />
                      </a>

                      <motion.button
                        onClick={() => setDeleteConfirm(link.id)}
                        className="p-2 rounded-lg"
                        style={{ background: theme.colors.backgroundSecondary }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={20} className="text-red-500" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  <AnimatePresence>
                    {deleteConfirm === link.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 flex items-center justify-between"
                        style={{
                          borderTop: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        <p
                          className="text-sm flex items-center gap-2"
                          style={{ color: '#ef4444' }}
                        >
                          <AlertCircle size={16} />
                          Delete this link permanently?
                        </p>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              color: theme.colors.foreground,
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            onClick={() => deleteMutation.mutate(link.id)}
                            disabled={deleteMutation.isPending}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                            style={{ background: '#ef4444' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              'Delete'
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateLinkModal
            onClose={() => setShowCreateModal(false)}
            theme={theme}
            cardRadius={cardRadius}
            glowOpacity={glowOpacity}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Create Link Modal Component
function CreateLinkModal({
  onClose,
  theme,
  cardRadius,
  glowOpacity,
}: {
  onClose: () => void
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  glowOpacity: number
}) {
  const queryClient = useQueryClient()
  const createShortLink = useServerFn(createShortLinkFn)

  const [targetUrl, setTargetUrl] = useState('')
  const [title, setTitle] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () =>
      createShortLink({
        data: {
          targetUrl,
          title: title || undefined,
          customCode: customCode || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-short-links'] })
      onClose()
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to create short link'
      setError(message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!targetUrl) {
      setError('Please enter a URL')
      return
    }

    try {
      new URL(targetUrl)
    } catch {
      setError('Please enter a valid URL (including https://)')
      return
    }

    createMutation.mutate()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-lg p-6"
        style={{
          background: theme.colors.card,
          borderRadius: cardRadius,
          border: `1px solid ${theme.colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
              }}
            >
              <Link2 size={24} style={{ color: theme.colors.primary }} />
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: theme.colors.foreground }}
              >
                Create Short Link
              </h2>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Shorten any URL
              </p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ background: theme.colors.backgroundSecondary }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} style={{ color: theme.colors.foregroundMuted }} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target URL */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foreground }}
            >
              Destination URL *
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.foreground,
              }}
              required
            />
          </div>

          {/* Title */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foreground }}
            >
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome link"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.foreground,
              }}
            />
          </div>

          {/* Custom Code */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foreground }}
            >
              Custom Code (optional)
            </label>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-3 rounded-l-xl text-sm"
                style={{
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRight: 'none',
                  color: theme.colors.foregroundMuted,
                }}
              >
                eziox.link/s/
              </span>
              <input
                type="text"
                value={customCode}
                onChange={(e) =>
                  setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))
                }
                placeholder="my-link"
                minLength={3}
                maxLength={20}
                className="flex-1 px-4 py-3 rounded-r-xl outline-none transition-all"
                style={{
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                }}
              />
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Leave empty for auto-generated code. 3-20 characters, letters,
              numbers, - and _ only.
            </p>
          </div>

          {/* Expiration */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foreground }}
            >
              Expiration Date (optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.foreground,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg flex items-center gap-2"
              style={{ background: '#ef444415', border: '1px solid #ef444430' }}
            >
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-500">{error}</span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              boxShadow:
                glowOpacity > 0
                  ? `0 10px 30px ${theme.colors.primary}40`
                  : undefined,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {createMutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Sparkles size={20} />
                Create Short Link
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
