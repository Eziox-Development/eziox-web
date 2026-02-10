import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getTicketsFn,
  getTicketStatsFn,
  getTicketFn,
  replyToTicketFn,
  updateTicketStatusFn,
  updateTicketPriorityFn,
  addInternalNoteFn,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '@/server/functions/tickets'
import {
  Ticket,
  Search,
  Clock,
  AlertTriangle,
  MessageSquare,
  Send,
  ChevronRight,
  RefreshCw,
  Loader2,
  Eye,
  X,
  Shield,
  Bug,
  CreditCard,
  HelpCircle,
  StickyNote,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  general: HelpCircle,
  technical: Bug,
  billing: CreditCard,
  account: Shield,
  abuse: AlertTriangle,
}

const CATEGORY_COLORS: Record<string, string> = {
  general: '#6366f1',
  technical: '#ef4444',
  billing: '#22c55e',
  account: '#8b5cf6',
  abuse: '#f59e0b',
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

export function TicketsTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({
    status: 'all' as string,
    category: 'all' as string,
    priority: 'all' as string,
    search: '',
  })
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [showInternalNoteInput, setShowInternalNoteInput] = useState(false)

  const getTickets = useServerFn(getTicketsFn)
  const getStats = useServerFn(getTicketStatsFn)
  const getTicket = useServerFn(getTicketFn)
  const replyToTicket = useServerFn(replyToTicketFn)
  const updateStatus = useServerFn(updateTicketStatusFn)
  const updatePriority = useServerFn(updateTicketPriorityFn)
  const addNote = useServerFn(addInternalNoteFn)

  // Queries
  const statsQuery = useQuery({
    queryKey: ['admin', 'tickets', 'stats'],
    queryFn: () => getStats(),
  })

  const ticketsQuery = useQuery({
    queryKey: ['admin', 'tickets', 'list', filters],
    queryFn: () =>
      getTickets({
        data: {
          status: filters.status === 'all' ? undefined : (filters.status as typeof TICKET_STATUSES[number]),
          category: filters.category === 'all' ? undefined : (filters.category as typeof TICKET_CATEGORIES[number]),
          priority: filters.priority === 'all' ? undefined : (filters.priority as typeof TICKET_PRIORITIES[number]),
          search: filters.search || undefined,
          limit: 50,
        },
      }),
  })

  const ticketDetailQuery = useQuery({
    queryKey: ['admin', 'tickets', 'detail', selectedTicketId],
    queryFn: () => (selectedTicketId ? getTicket({ data: { ticketId: selectedTicketId } }) : null),
    enabled: !!selectedTicketId,
  })

  // Mutations
  const replyMutation = useMutation({
    mutationFn: (ticketId: string) =>
      replyToTicket({ data: { ticketId, message: replyText } }),
    onSuccess: () => {
      toast.success(t('admin.tickets.replySent', 'Reply sent'))
      setReplyText('')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
    onError: () => toast.error('Failed to send reply'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      updateStatus({ data: { ticketId, status: status as typeof TICKET_STATUSES[number] } }),
    onSuccess: () => {
      toast.success(t('admin.tickets.statusUpdated', 'Status updated'))
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  const priorityMutation = useMutation({
    mutationFn: ({ ticketId, priority }: { ticketId: string; priority: string }) =>
      updatePriority({ data: { ticketId, priority: priority as typeof TICKET_PRIORITIES[number] } }),
    onSuccess: () => {
      toast.success(t('admin.tickets.priorityUpdated', 'Priority updated'))
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
    onError: () => toast.error('Failed to update priority'),
  })

  const noteMutation = useMutation({
    mutationFn: (ticketId: string) =>
      addNote({ data: { ticketId, note: internalNote } }),
    onSuccess: () => {
      toast.success(t('admin.tickets.noteAdded', 'Internal note added'))
      setInternalNote('')
      setShowInternalNoteInput(false)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
    onError: () => toast.error('Failed to add note'),
  })

  const stats = statsQuery.data as { open: number; inProgress: number; waitingAdmin: number; urgent: number; today: number } | undefined
  const tickets = (ticketsQuery.data as { tickets: Array<{ id: string; ticketNumber: string; userId: string | null; guestEmail: string | null; guestName: string | null; category: string; priority: string; subject: string; status: string; user?: { id: string; email: string; username: string; tier: string | null } | null }>; total: number } | undefined)?.tickets || []
  const ticketsTotal = (ticketsQuery.data as { tickets: unknown[]; total: number } | undefined)?.total || 0
  const selectedTicket = ticketDetailQuery.data as { ticket: { id: string; ticketNumber: string; userId: string | null; guestEmail: string | null; guestName: string | null; category: string; priority: string; subject: string; description: string; status: string }; messages: Array<{ id: string; senderId: string | null; senderType: string; senderName: string | null; message: string; isInternal: boolean | null; createdAt: Date }>; assignee?: { id: string; username: string } | null } | null | undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: theme.colors.foreground }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${theme.colors.primary}20` }}
            >
              <Ticket size={20} style={{ color: theme.colors.primary }} />
            </div>
            {t('admin.tickets.title', 'Support Tickets')}
          </h2>
          <p className="text-sm mt-1" style={{ color: theme.colors.foregroundMuted }}>
            {t('admin.tickets.description', 'Manage and respond to support requests')}
          </p>
        </div>
        <button
          onClick={() => void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
          style={{
            background: theme.colors.backgroundSecondary,
            color: theme.colors.foreground,
          }}
        >
          <RefreshCw size={16} />
          {t('admin.tickets.refresh', 'Refresh')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: t('admin.tickets.stats.open', 'Open'), value: stats?.open || 0, color: '#22c55e', icon: Ticket },
          { label: t('admin.tickets.stats.inProgress', 'In Progress'), value: stats?.inProgress || 0, color: '#3b82f6', icon: Clock },
          { label: t('admin.tickets.stats.waitingAdmin', 'Waiting Admin'), value: stats?.waitingAdmin || 0, color: '#8b5cf6', icon: MessageSquare },
          { label: t('admin.tickets.stats.urgent', 'Urgent'), value: stats?.urgent || 0, color: '#ef4444', icon: AlertTriangle },
          { label: t('admin.tickets.stats.today', 'Today'), value: stats?.today || 0, color: '#f59e0b', icon: Clock },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}20` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="p-4 rounded-xl flex flex-wrap gap-4"
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div className="flex-1 min-w-[200px]">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: theme.colors.backgroundSecondary }}
          >
            <Search size={16} style={{ color: theme.colors.foregroundMuted }} />
            <input
              type="text"
              placeholder={t('admin.tickets.search', 'Search tickets...')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: theme.colors.foreground }}
            />
          </div>
        </div>

        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('admin.tickets.filters.allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.tickets.filters.allStatus')}</SelectItem>
            {TICKET_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`admin.tickets.status.${s}`, s.replace('_', ' '))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('admin.tickets.filters.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.tickets.filters.allCategories')}</SelectItem>
            {TICKET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {t(`admin.tickets.category.${c}`, c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('admin.tickets.filters.allPriorities')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.tickets.filters.allPriorities')}</SelectItem>
            {TICKET_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {t(`admin.tickets.priority.${p}`, p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div
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
              {t('admin.tickets.list', 'Tickets')} ({ticketsTotal})
            </h3>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {ticketsQuery.isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin mx-auto mb-2" style={{ color: theme.colors.primary }} />
                <p style={{ color: theme.colors.foregroundMuted }}>Loading...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center">
                <Ticket size={40} className="mx-auto mb-2 opacity-30" />
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {t('admin.tickets.noTickets', 'No tickets found')}
                </p>
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
                      className="w-full p-4 text-left transition-colors"
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
                              {ticket.priority}
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
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                              {ticket.user?.username || ticket.guestEmail || 'Unknown'}
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
        </div>

        {/* Detail */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          {!selectedTicketId ? (
            <div className="p-8 text-center h-full flex flex-col items-center justify-center">
              <Eye size={40} className="mb-2 opacity-30" />
              <p style={{ color: theme.colors.foregroundMuted }}>
                {t('admin.tickets.selectTicket', 'Select a ticket to view details')}
              </p>
            </div>
          ) : ticketDetailQuery.isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto mb-2" style={{ color: theme.colors.primary }} />
            </div>
          ) : selectedTicket ? (
            <div className="flex flex-col h-full max-h-[700px]">
              {/* Header */}
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: theme.colors.border }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm" style={{ color: theme.colors.primary }}>
                      {selectedTicket.ticket.ticketNumber}
                    </span>
                    <button
                      onClick={() => setSelectedTicketId(null)}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <X size={14} style={{ color: theme.colors.foregroundMuted }} />
                    </button>
                  </div>
                  <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>
                    {selectedTicket.ticket.subject}
                  </h3>
                </div>
              </div>

              {/* Actions */}
              <div
                className="p-3 border-b flex flex-wrap gap-2"
                style={{ borderColor: theme.colors.border }}
              >
                <Select
                  value={selectedTicket.ticket.status}
                  onValueChange={(value) =>
                    statusMutation.mutate({
                      ticketId: selectedTicket.ticket.id,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="w-[140px] text-xs"
                    style={{
                      background: `${STATUS_COLORS[selectedTicket.ticket.status]}20`,
                      color: STATUS_COLORS[selectedTicket.ticket.status],
                      borderColor: `${STATUS_COLORS[selectedTicket.ticket.status]}40`,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`admin.tickets.status.${s}`, s.replace('_', ' '))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedTicket.ticket.priority}
                  onValueChange={(value) =>
                    priorityMutation.mutate({
                      ticketId: selectedTicket.ticket.id,
                      priority: value,
                    })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="w-[120px] text-xs"
                    style={{
                      background: `${PRIORITY_COLORS[selectedTicket.ticket.priority]}20`,
                      color: PRIORITY_COLORS[selectedTicket.ticket.priority],
                      borderColor: `${PRIORITY_COLORS[selectedTicket.ticket.priority]}40`,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {t(`admin.tickets.priority.${p}`, p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <button
                  onClick={() => setShowInternalNoteInput(!showInternalNoteInput)}
                  className="px-2 py-1 rounded text-xs flex items-center gap-1"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                  }}
                >
                  <StickyNote size={12} />
                  {t('admin.tickets.addNote', 'Note')}
                </button>
              </div>

              {/* Internal Note Input */}
              <AnimatePresence>
                {showInternalNoteInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b overflow-hidden"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <div className="p-3">
                      <textarea
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder={t('admin.tickets.internalNotePlaceholder', 'Internal note (not visible to user)...')}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                        style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fcd34d',
                        }}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setShowInternalNoteInput(false)}
                          className="px-3 py-1 text-xs rounded"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {t('admin.tickets.cancel', 'Cancel')}
                        </button>
                        <button
                          onClick={() => noteMutation.mutate(selectedTicket.ticket.id)}
                          disabled={!internalNote.trim() || noteMutation.isPending}
                          className="px-3 py-1 text-xs rounded text-white"
                          style={{ background: '#f59e0b' }}
                        >
                          {t('admin.tickets.addNote', 'Add Note')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'admin' || msg.senderType === 'system' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[80%] p-3 rounded-xl"
                      style={{
                        background:
                          msg.isInternal
                            ? '#fef3c7'
                            : msg.senderType === 'admin'
                              ? theme.colors.primary
                              : msg.senderType === 'system'
                                ? theme.colors.backgroundSecondary
                                : `${theme.colors.foreground}10`,
                        color:
                          msg.isInternal
                            ? '#92400e'
                            : msg.senderType === 'admin'
                              ? '#ffffff'
                              : theme.colors.foreground,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-70">
                          {msg.senderName}
                          {msg.isInternal && ' (Internal)'}
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
              <div
                className="p-4 border-t"
                style={{ borderColor: theme.colors.border }}
              >
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('admin.tickets.replyPlaceholder', 'Type your reply...')}
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
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
