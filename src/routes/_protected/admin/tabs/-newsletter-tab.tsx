import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { toast } from 'sonner'
import {
  getNewslettersFn,
  createNewsletterFn,
  sendNewsletterFn,
  deleteNewsletterFn,
  getNewsletterStatsFn,
} from '@/server/functions/newsletter'
import {
  Mail,
  Plus,
  Send,
  Loader2,
  X,
  Trash2,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react'

const AUDIENCE_LABELS: Record<string, { label: string; color: string }> = {
  all: { label: 'All Users & Subscribers', color: '#3b82f6' },
  subscribers: { label: 'Email Subscribers Only', color: '#22c55e' },
  pro: { label: 'Pro Users', color: '#f59e0b' },
  creator: { label: 'Creator Users', color: '#ec4899' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#6b7280' },
  sending: { label: 'Sending...', color: '#f59e0b' },
  sent: { label: 'Sent', color: '#22c55e' },
  failed: { label: 'Failed', color: '#ef4444' },
}

export function NewsletterTab() {
  useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    subject: '',
    content: '',
    audience: 'all' as 'all' | 'subscribers' | 'pro' | 'creator',
  })

  const getNewsletters = useServerFn(getNewslettersFn)
  const createNewsletter = useServerFn(createNewsletterFn)
  const sendNewsletter = useServerFn(sendNewsletterFn)
  const deleteNewsletter = useServerFn(deleteNewsletterFn)
  const getStats = useServerFn(getNewsletterStatsFn)

  const { data: newslettersData, isLoading } = useQuery({
    queryKey: ['admin', 'newsletters'],
    queryFn: () => getNewsletters(),
  })

  const { data: stats } = useQuery({
    queryKey: ['admin', 'newsletter-stats'],
    queryFn: () => getStats(),
  })

  const createMutation = useMutation({
    mutationFn: () => createNewsletter({ data: createForm }),
    onSuccess: () => {
      toast.success('Newsletter draft created')
      setShowCreateForm(false)
      setCreateForm({ subject: '', content: '', audience: 'all' })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'newsletters'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'newsletter-stats'] })
    },
    onError: () => toast.error('Failed to create newsletter'),
  })

  const sendMutation = useMutation({
    mutationFn: (id: string) => sendNewsletter({ data: { id } }),
    onSuccess: (result) => {
      const res = result as { success: boolean; recipientCount: number }
      toast.success(`Newsletter sent to ${res.recipientCount} recipients`)
      setConfirmSendId(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'newsletters'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'newsletter-stats'] })
    },
    onError: () => toast.error('Failed to send newsletter'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNewsletter({ data: { id } }),
    onSuccess: () => {
      toast.success('Newsletter deleted')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'newsletters'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'newsletter-stats'] })
    },
    onError: () => toast.error('Failed to delete newsletter'),
  })

  const newsletters = newslettersData?.newsletters || []
  const drafts = newsletters.filter((n) => n.status === 'draft')
  const sent = newsletters.filter((n) => n.status === 'sent')

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#6366f115' }}>
            <Mail size={24} style={{ color: '#6366f1' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>Newsletter</h1>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              Create and send newsletters to your audience
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
        >
          <Plus size={16} />
          New Newsletter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Drafts', value: stats?.drafts || 0, icon: FileText, color: '#6b7280' },
          { label: 'Sent', value: stats?.sent || 0, icon: CheckCircle2, color: '#22c55e' },
          { label: 'Subscribers', value: stats?.subscriberCount || 0, icon: Users, color: '#3b82f6' },
          { label: 'Opted-in Users', value: stats?.optedInUserCount || 0, icon: Mail, color: '#6366f1' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl"
            style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: theme.colors.foreground }}>{stat.value}</p>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drafts */}
      {drafts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: theme.colors.foregroundMuted }}>
            <FileText size={14} style={{ color: '#6b7280' }} />
            Drafts
          </h2>
          <div className="space-y-2">
            {drafts.map((nl) => (
              <div
                key={nl.id}
                className="p-4 rounded-xl flex items-start justify-between gap-3"
                style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}` }}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold truncate" style={{ color: theme.colors.foreground }}>{nl.subject}</h3>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: theme.colors.foregroundMuted }}>{nl.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${AUDIENCE_LABELS[nl.audience]?.color || '#3b82f6'}15`, color: AUDIENCE_LABELS[nl.audience]?.color || '#3b82f6' }}>
                      {AUDIENCE_LABELS[nl.audience]?.label || nl.audience}
                    </span>
                    <span className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>
                      {new Date(nl.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewId(previewId === nl.id ? null : nl.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5"
                    title="Preview"
                  >
                    <Eye size={14} style={{ color: theme.colors.foregroundMuted }} />
                  </button>
                  <button
                    onClick={() => setConfirmSendId(nl.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5"
                    title="Send"
                  >
                    <Send size={14} style={{ color: '#22c55e' }} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(nl.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5"
                    title="Delete"
                  >
                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Newsletters */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: theme.colors.foregroundMuted }}>
          <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
          Sent
          {sent.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: '#22c55e15', color: '#22c55e' }}>
              {sent.length}
            </span>
          )}
        </h2>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 mx-auto animate-spin" style={{ color: theme.colors.primary }} />
          </div>
        ) : sent.length === 0 ? (
          <div
            className="p-8 text-center rounded-xl"
            style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}` }}
          >
            <Mail size={32} className="mx-auto mb-2" style={{ color: theme.colors.foregroundMuted, opacity: 0.3 }} />
            <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>No newsletters sent yet</p>
            <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>Create your first newsletter above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sent.map((nl) => {
              const sc = STATUS_CONFIG[nl.status] ?? STATUS_CONFIG.sent!
              return (
                <div
                  key={nl.id}
                  className="p-4 rounded-xl flex items-start justify-between gap-3"
                  style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}` }}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold truncate" style={{ color: theme.colors.foreground }}>{nl.subject}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${sc.color}15`, color: sc.color }}>
                        {sc.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${AUDIENCE_LABELS[nl.audience]?.color || '#3b82f6'}15`, color: AUDIENCE_LABELS[nl.audience]?.color || '#3b82f6' }}>
                        {AUDIENCE_LABELS[nl.audience]?.label || nl.audience}
                      </span>
                      {nl.recipientCount !== null && (
                        <span className="text-[10px] flex items-center gap-1" style={{ color: theme.colors.foregroundMuted }}>
                          <Users size={10} /> {nl.recipientCount} recipients
                        </span>
                      )}
                      {nl.sentAt && (
                        <span className="text-[10px] flex items-center gap-1" style={{ color: theme.colors.foregroundMuted }}>
                          <Clock size={10} /> {new Date(nl.sentAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewId(previewId === nl.id ? null : nl.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5 shrink-0"
                  >
                    <Eye size={14} style={{ color: theme.colors.foregroundMuted }} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <AnimatePresence>
        {previewId && (() => {
          const nl = newsletters.find((n) => n.id === previewId)
          if (!nl) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="p-5 rounded-xl"
              style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>Preview</h3>
                <button onClick={() => setPreviewId(null)} className="p-1 rounded hover:bg-white/5">
                  <X size={14} style={{ color: theme.colors.foregroundMuted }} />
                </button>
              </div>
              <div className="p-4 rounded-lg" style={{ background: `${theme.colors.foreground}03`, border: `1px solid ${theme.colors.border}40` }}>
                <h4 className="text-base font-bold mb-3" style={{ color: theme.colors.foreground }}>{nl.subject}</h4>
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: theme.colors.foregroundMuted }}>
                  {nl.content}
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Create Newsletter Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#6366f115' }}>
                    <Mail size={20} style={{ color: '#6366f1' }} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: theme.colors.foreground }}>New Newsletter</h2>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="p-2 rounded-lg hover:bg-white/5">
                  <X size={18} style={{ color: theme.colors.foregroundMuted }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.colors.foregroundMuted }}>Subject</label>
                  <input
                    value={createForm.subject}
                    onChange={(e) => setCreateForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="Newsletter subject line..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: `${theme.colors.foreground}05`, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.colors.foregroundMuted }}>Content</label>
                  <textarea
                    value={createForm.content}
                    onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Write your newsletter content here..."
                    rows={8}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: `${theme.colors.foreground}05`, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.colors.foregroundMuted }}>Audience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(AUDIENCE_LABELS) as [string, { label: string; color: string }][]).map(([key, { label, color }]) => {
                      const isActive = createForm.audience === key
                      return (
                        <button
                          key={key}
                          onClick={() => setCreateForm((f) => ({ ...f, audience: key as typeof f.audience }))}
                          className="py-2 px-3 rounded-xl text-xs font-medium transition-all text-left"
                          style={{
                            background: isActive ? `${color}15` : `${theme.colors.foreground}05`,
                            border: `1px solid ${isActive ? color : theme.colors.border}`,
                            color: isActive ? color : theme.colors.foregroundMuted,
                          }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createMutation.mutate()}
                    disabled={!createForm.subject || !createForm.content || createMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                  >
                    {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    Save Draft
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Send Modal */}
      <AnimatePresence>
        {confirmSendId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setConfirmSendId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#22c55e15' }}>
                  <Send size={28} style={{ color: '#22c55e' }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: theme.colors.foreground }}>Send Newsletter?</h2>
                <p className="text-sm mt-1" style={{ color: theme.colors.foregroundMuted }}>
                  This will send the newsletter to all matching recipients. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSendId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: `${theme.colors.foreground}08`, color: theme.colors.foregroundMuted }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendMutation.mutate(confirmSendId)}
                  disabled={sendMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: '#22c55e' }}
                >
                  {sendMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
