import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { toast } from 'sonner'
import {
  getMyTicketsFn,
  getTicketFn,
  replyToTicketFn,
  closeTicketFn,
  TICKET_STATUSES,
} from '@/server/functions/tickets'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Ticket,
  AlertTriangle,
  Send,
  ChevronRight,
  RefreshCw,
  Loader2,
  Eye,
  X,
  Shield,
  Bug,
  CreditCard,
  UserCog,
  Sparkles,
  Scale,
  Handshake,
  FileText,
  Undo2,
  Trash2,
  HelpCircle,
  Plus,
  CheckCircle2,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/support/tickets')({
  head: () => ({
    meta: [
      { title: 'My Tickets | Eziox' },
      {
        name: 'description',
        content: 'View and manage your support tickets',
      },
    ],
  }),
  component: MyTicketsPage,
})

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  general: HelpCircle,
  technical: Bug,
  billing: CreditCard,
  account: UserCog,
  security: Shield,
  abuse: AlertTriangle,
  legal: Scale,
  partnership: Handshake,
  feature: Sparkles,
  withdrawal: Undo2,
  dmca: FileText,
  gdpr: Trash2,
}

const CATEGORY_COLORS: Record<string, string> = {
  general: '#6366f1',
  technical: '#ef4444',
  billing: '#22c55e',
  account: '#06b6d4',
  security: '#8b5cf6',
  abuse: '#f59e0b',
  legal: '#64748b',
  partnership: '#14b8a6',
  feature: '#f97316',
  withdrawal: '#dc2626',
  dmca: '#7c3aed',
  gdpr: '#0ea5e9',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#64748b',
  normal: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
}

const STATUS_COLORS: Record<string, string> = {
  open: '#22c55e',
  in_progress: '#3b82f6',
  waiting_user: '#f59e0b',
  waiting_admin: '#8b5cf6',
  resolved: '#6366f1',
  closed: '#64748b',
}

function MyTicketsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const getMyTickets = useServerFn(getMyTicketsFn)
  const getTicket = useServerFn(getTicketFn)
  const replyToTicket = useServerFn(replyToTicketFn)
  const closeTicket = useServerFn(closeTicketFn)

  const ticketsQuery = useQuery({
    queryKey: ['my-tickets', statusFilter],
    queryFn: () =>
      getMyTickets({
        data: {
          status: statusFilter === 'all' ? undefined : (statusFilter as typeof TICKET_STATUSES[number]),
          limit: 50,
        },
      }),
  })

  const ticketDetailQuery = useQuery({
    queryKey: ['my-tickets', 'detail', selectedTicketId],
    queryFn: () => (selectedTicketId ? getTicket({ data: { ticketId: selectedTicketId } }) : null),
    enabled: !!selectedTicketId,
  })

  const replyMutation = useMutation({
    mutationFn: (ticketId: string) =>
      replyToTicket({ data: { ticketId, message: replyText } }),
    onSuccess: () => {
      toast.success(t('support.tickets.replySent', 'Reply sent'))
      setReplyText('')
      void queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
    },
    onError: () => toast.error(t('support.tickets.replyError', 'Failed to send reply')),
  })

  const closeMutation = useMutation({
    mutationFn: (ticketId: string) => closeTicket({ data: { ticketId } }),
    onSuccess: () => {
      toast.success(t('support.tickets.ticketClosed', 'Ticket closed'))
      void queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
    },
    onError: () => toast.error(t('support.tickets.closeError', 'Failed to close ticket')),
  })

  const tickets = (ticketsQuery.data as { tickets: Array<{ id: string; ticketNumber: string; category: string; priority: string; subject: string; status: string; lastActivityAt: Date; createdAt: Date }>; total: number } | undefined)?.tickets || []
  const selectedTicket = ticketDetailQuery.data as { ticket: { id: string; ticketNumber: string; category: string; priority: string; subject: string; description: string; status: string }; messages: Array<{ id: string; senderId: string | null; senderType: string; senderName: string | null; message: string; isInternal: boolean | null; createdAt: Date }> } | null | undefined

  return (
    <div
      className="min-h-screen pt-20 pb-16"
      style={{ background: theme.colors.background }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10)`,
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1
                className="text-3xl font-bold flex items-center gap-3"
                style={{ color: theme.colors.foreground }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}20` }}
                >
                  <Ticket size={24} style={{ color: theme.colors.primary }} />
                </div>
                {t('support.tickets.title', 'My Tickets')}
              </h1>
              <p className="text-sm mt-2" style={{ color: theme.colors.foregroundMuted }}>
                {t('support.tickets.description', 'View and manage your support requests')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void queryClient.invalidateQueries({ queryKey: ['my-tickets'] })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
                style={{
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.foreground,
                }}
              >
                <RefreshCw size={16} />
                {t('support.tickets.refresh', 'Refresh')}
              </button>
              <Link
                to="/support"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-colors"
                style={{ background: theme.colors.primary }}
              >
                <Plus size={16} />
                {t('support.tickets.newTicket', 'New Ticket')}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div
            className="p-4 rounded-xl flex items-center gap-4"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <span style={{ color: theme.colors.foregroundMuted }}>
              {t('support.tickets.filterByStatus', 'Filter by status:')}
            </span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('support.tickets.allStatus', 'All Status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('support.tickets.allStatus', 'All Status')}</SelectItem>
                {TICKET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`support.tickets.status.${s}`, s.replace('_', ' '))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tickets List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-4 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>
                {t('support.tickets.yourTickets', 'Your Tickets')} ({tickets.length})
              </h3>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {ticketsQuery.isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="animate-spin mx-auto mb-2" style={{ color: theme.colors.primary }} />
                  <p style={{ color: theme.colors.foregroundMuted }}>
                    {t('support.tickets.loading', 'Loading...')}
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center">
                  <Ticket size={40} className="mx-auto mb-2 opacity-30" />
                  <p style={{ color: theme.colors.foregroundMuted }}>
                    {t('support.tickets.noTickets', 'No tickets found')}
                  </p>
                  <Link
                    to="/support"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-white"
                    style={{ background: theme.colors.primary }}
                  >
                    <Plus size={16} />
                    {t('support.tickets.createFirst', 'Create your first ticket')}
                  </Link>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: theme.colors.border }}>
                  {tickets.map((ticket) => {
                    const CategoryIcon = CATEGORY_ICONS[ticket.category] || HelpCircle
                    const isSelected = selectedTicketId === ticket.id

                    return (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className="w-full p-4 text-left transition-colors hover:bg-white/5"
                        style={{
                          background: isSelected ? `${theme.colors.primary}10` : 'transparent',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${CATEGORY_COLORS[ticket.category]}20` }}
                          >
                            <CategoryIcon size={18} style={{ color: CATEGORY_COLORS[ticket.category] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-xs font-mono"
                                style={{ color: theme.colors.primary }}
                              >
                                {ticket.ticketNumber}
                              </span>
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  background: `${PRIORITY_COLORS[ticket.priority]}20`,
                                  color: PRIORITY_COLORS[ticket.priority],
                                }}
                              >
                                {t(`support.tickets.priority.${ticket.priority}`, ticket.priority)}
                              </span>
                            </div>
                            <p
                              className="font-medium text-sm truncate"
                              style={{ color: theme.colors.foreground }}
                            >
                              {ticket.subject}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  background: `${STATUS_COLORS[ticket.status]}20`,
                                  color: STATUS_COLORS[ticket.status],
                                }}
                              >
                                {t(`support.tickets.status.${ticket.status}`, ticket.status.replace('_', ' '))}
                              </span>
                              <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                                {new Date(ticket.lastActivityAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={16} style={{ color: theme.colors.foregroundMuted }} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Ticket Detail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {!selectedTicketId ? (
              <div className="p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <Eye size={40} className="mb-2 opacity-30" />
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {t('support.tickets.selectTicket', 'Select a ticket to view details')}
                </p>
              </div>
            ) : ticketDetailQuery.isLoading ? (
              <div className="p-8 text-center min-h-[400px] flex items-center justify-center">
                <Loader2 className="animate-spin" style={{ color: theme.colors.primary }} />
              </div>
            ) : selectedTicket ? (
              <div className="flex flex-col h-full max-h-[700px]">
                {/* Header */}
                <div
                  className="p-4 border-b"
                  style={{ borderColor: theme.colors.border }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm" style={{ color: theme.colors.primary }}>
                          {selectedTicket.ticket.ticketNumber}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: `${STATUS_COLORS[selectedTicket.ticket.status]}20`,
                            color: STATUS_COLORS[selectedTicket.ticket.status],
                          }}
                        >
                          {t(`support.tickets.status.${selectedTicket.ticket.status}`, selectedTicket.ticket.status.replace('_', ' '))}
                        </span>
                      </div>
                      <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>
                        {selectedTicket.ticket.subject}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedTicketId(null)}
                      className="p-2 rounded-lg hover:bg-white/10"
                    >
                      <X size={16} style={{ color: theme.colors.foregroundMuted }} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                {selectedTicket.ticket.status !== 'closed' && selectedTicket.ticket.status !== 'resolved' && (
                  <div
                    className="p-3 border-b flex items-center gap-2"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <button
                      onClick={() => closeMutation.mutate(selectedTicket.ticket.id)}
                      disabled={closeMutation.isPending}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        color: theme.colors.foreground,
                      }}
                    >
                      <CheckCircle2 size={14} />
                      {t('support.tickets.closeTicket', 'Close Ticket')}
                    </button>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Original Description */}
                  <div
                    className="p-3 rounded-xl"
                    style={{ background: `${theme.colors.foreground}10` }}
                  >
                    <p className="text-xs font-medium mb-2" style={{ color: theme.colors.foregroundMuted }}>
                      {t('support.tickets.originalRequest', 'Original Request')}
                    </p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: theme.colors.foreground }}>
                      {selectedTicket.ticket.description}
                    </p>
                  </div>

                  {/* Messages */}
                  {selectedTicket.messages
                    .filter((msg) => !msg.isInternal)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'admin' || msg.senderType === 'system' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className="max-w-[80%] p-3 rounded-xl"
                          style={{
                            background:
                              msg.senderType === 'user'
                                ? theme.colors.primary
                                : msg.senderType === 'system'
                                  ? theme.colors.backgroundSecondary
                                  : `${theme.colors.foreground}10`,
                            color:
                              msg.senderType === 'user'
                                ? '#ffffff'
                                : theme.colors.foreground,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium opacity-70">
                              {msg.senderType === 'admin' ? t('support.tickets.supportTeam', 'Support Team') : msg.senderName || t('support.tickets.you', 'You')}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Reply */}
                {selectedTicket.ticket.status !== 'closed' && (
                  <div
                    className="p-4 border-t"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <div className="flex gap-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t('support.tickets.replyPlaceholder', 'Type your reply...')}
                        rows={2}
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          color: theme.colors.foreground,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      />
                      <button
                        onClick={() => replyMutation.mutate(selectedTicket.ticket.id)}
                        disabled={!replyText.trim() || replyMutation.isPending}
                        className="px-4 rounded-lg text-white disabled:opacity-50"
                        style={{ background: theme.colors.primary }}
                      >
                        {replyMutation.isPending ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
