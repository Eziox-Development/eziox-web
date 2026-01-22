import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  getNotificationsFn,
  getUnreadCountFn,
  markAsReadFn,
  markAllAsReadFn,
  deleteNotificationFn,
  clearAllNotificationsFn,
} from '@/server/functions/notifications'
import { Bell, Check, CheckCheck, Trash2, X, UserPlus, Trophy, Link as LinkIcon, Sparkles, Info } from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string | null
  isRead: boolean | null
  actionUrl: string | null
  createdAt: Date
}

const notificationIcons: Record<string, React.ElementType> = {
  new_follower: UserPlus,
  profile_milestone: Trophy,
  link_milestone: LinkIcon,
  badge_earned: Sparkles,
  system: Info,
}

const notificationColors: Record<string, string> = {
  new_follower: '#3b82f6',
  profile_milestone: '#f59e0b',
  link_milestone: '#22c55e',
  badge_earned: '#8b5cf6',
  system: '#6b7280',
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const getNotifications = useServerFn(getNotificationsFn)
  const getUnreadCount = useServerFn(getUnreadCountFn)
  const markAsRead = useServerFn(markAsReadFn)
  const markAllAsRead = useServerFn(markAllAsReadFn)
  const deleteNotification = useServerFn(deleteNotificationFn)
  const clearAllNotifications = useServerFn(clearAllNotificationsFn)

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notificationsUnreadCount'],
    queryFn: async () => {
      const result = await getUnreadCount()
      return result as number
    },
    refetchInterval: 30000,
  })

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const result = await getNotifications({ data: { limit: 10 } })
      return result as NotificationItem[]
    },
    enabled: isOpen,
  })

  const notifications = notificationsData || []

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markAsRead({ data: { notificationId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => deleteNotification({ data: { notificationId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] })
    },
  })

  const clearAllMutation = useMutation({
    mutationFn: () => clearAllNotifications(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] })
    },
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }
    if (notification.actionUrl) {
      setIsOpen(false)
      window.location.href = notification.actionUrl
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-all"
        style={{ background: isOpen ? theme.colors.backgroundSecondary : 'transparent' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} style={{ color: theme.colors.foreground }} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1"
              style={{ background: theme.colors.primary, color: '#fff' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.colors.border }}>
              <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="p-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: theme.colors.backgroundSecondary }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} style={{ color: theme.colors.foregroundMuted }} />
                  </motion.button>
                )}
                {notifications.length > 0 && (
                  <motion.button
                    onClick={() => clearAllMutation.mutate()}
                    className="p-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: theme.colors.backgroundSecondary }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Clear all"
                  >
                    <Trash2 size={14} style={{ color: theme.colors.foregroundMuted }} />
                  </motion.button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <motion.div
                    className="w-6 h-6 rounded-full border-2"
                    style={{ borderColor: theme.colors.border, borderTopColor: theme.colors.primary }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" style={{ color: theme.colors.foregroundMuted }} />
                  <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: theme.colors.border }}>
                  {notifications.map((notification: NotificationItem) => {
                    const Icon = notificationIcons[notification.type] || Info
                    const iconColor = notificationColors[notification.type] || theme.colors.foregroundMuted

                    return (
                      <motion.div
                        key={notification.id}
                        className="p-3 flex gap-3 transition-all cursor-pointer group relative"
                        style={{
                          background: notification.isRead ? 'transparent' : `${theme.colors.primary}08`,
                        }}
                        whileHover={{ background: theme.colors.backgroundSecondary }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${iconColor}20` }}
                        >
                          <Icon size={16} style={{ color: iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: theme.colors.foreground }}>
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs truncate mt-0.5" style={{ color: theme.colors.foregroundMuted }}>
                              {notification.message}
                            </p>
                          )}
                          <p className="text-[10px] mt-1" style={{ color: theme.colors.foregroundMuted }}>
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsReadMutation.mutate(notification.id)
                              }}
                              className="p-1 rounded-lg"
                              style={{ background: theme.colors.backgroundSecondary }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Mark as read"
                            >
                              <Check size={12} style={{ color: theme.colors.foregroundMuted }} />
                            </motion.button>
                          )}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotificationMutation.mutate(notification.id)
                            }}
                            className="p-1 rounded-lg"
                            style={{ background: theme.colors.backgroundSecondary }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete"
                          >
                            <X size={12} style={{ color: theme.colors.foregroundMuted }} />
                          </motion.button>
                        </div>
                        {!notification.isRead && (
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                            style={{ background: theme.colors.primary }}
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
