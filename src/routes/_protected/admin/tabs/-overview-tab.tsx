import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  Users2,
  Shield,
  AlertTriangle,
  ShieldCheck,
  Handshake,
  Construction,
} from 'lucide-react'
import { getAllUsersWithBadgesFn } from '@/server/functions/badges'
import { adminGetModerationStatsFn } from '@/server/functions/admin-moderation'

type AdminTabType =
  | 'overview'
  | 'user-manager'
  | 'moderation'
  | 'abuse'
  | 'partners'
  | 'settings'

export function OverviewTab({
  onTabChange,
}: {
  onTabChange: (tab: AdminTabType) => void
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const getAllUsers = useServerFn(getAllUsersWithBadgesFn)
  const getModerationStats = useServerFn(adminGetModerationStatsFn)

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers({ data: { limit: 100 } }),
  })

  const { data: modStats } = useQuery({
    queryKey: ['admin', 'moderation', 'stats'],
    queryFn: () => getModerationStats(),
  })

  const users = usersData?.users || []
  const stats = [
    {
      labelKey: 'admin.stats.totalUsers',
      value: users.length,
      icon: Users2,
      color: theme.colors.primary,
    },
    {
      labelKey: 'admin.stats.activeBans',
      value: modStats?.bans.active || 0,
      icon: Shield,
      color: '#ef4444',
    },
    {
      labelKey: 'admin.stats.pendingAppeals',
      value: modStats?.bans.pendingAppeals || 0,
      icon: AlertTriangle,
      color: '#f59e0b',
    },
    {
      labelKey: 'admin.stats.admins',
      value: users.filter((u) => u.role === 'admin' || u.role === 'owner')
        .length,
      icon: ShieldCheck,
      color: '#22c55e',
    },
  ]

  const quickActions: {
    labelKey: string
    tab?: AdminTabType
    icon: React.ElementType
    color: string
  }[] = [
    {
      labelKey: 'admin.overview.manageUsers',
      tab: 'user-manager',
      icon: Users2,
      color: '#3b82f6',
    },
    {
      labelKey: 'admin.overview.reviewBans',
      tab: 'moderation',
      icon: Shield,
      color: '#ef4444',
    },
    {
      labelKey: 'admin.overview.checkAlerts',
      tab: 'abuse',
      icon: AlertTriangle,
      color: '#f59e0b',
    },
    {
      labelKey: 'admin.overview.partnerApps',
      tab: 'partners',
      icon: Handshake,
      color: '#14b8a6',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}15, transparent)`,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: theme.colors.foreground }}
        >
          {t('admin.overview.welcome')}
        </h2>
        <p style={{ color: theme.colors.foregroundMuted }}>
          {t('admin.overview.welcomeDesc')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
            style={{
              background: `${theme.colors.card}80`,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${stat.color}15` }}
            >
              <stat.icon size={22} style={{ color: stat.color }} />
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: theme.colors.foreground }}
            >
              {stat.value}
            </p>
            <p
              className="text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t(stat.labelKey)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: theme.colors.foreground }}
        >
          {t('admin.overview.quickActions')}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.labelKey}
              onClick={() => action.tab && onTabChange(action.tab)}
              className="p-4 rounded-2xl flex flex-col items-center text-center hover:scale-[1.02] transition-all"
              style={{
                background: `${theme.colors.card}80`,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${action.color}15` }}
              >
                <action.icon size={24} style={{ color: action.color }} />
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t(action.labelKey)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: `${theme.colors.card}80`,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: theme.colors.foreground }}
        >
          {t('admin.overview.recentActivity')}
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl"
              style={{ background: `${theme.colors.foreground}05` }}
            >
              <div
                className="w-10 h-10 rounded-full animate-pulse"
                style={{ background: `${theme.colors.foreground}10` }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-4 w-3/4 rounded animate-pulse"
                  style={{ background: `${theme.colors.foreground}10` }}
                />
                <div
                  className="h-3 w-1/2 rounded animate-pulse"
                  style={{ background: `${theme.colors.foreground}05` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p
          className="text-xs text-center mt-4"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {t('admin.overview.activityComingSoon')}
        </p>
      </div>

      {/* Owner Settings Link */}
      {currentUser?.role === 'owner' && (
        <button
          onClick={() => onTabChange('settings')}
          className="w-full block p-4 rounded-2xl text-left transition-all hover:scale-[1.01]"
          style={{
            background: `linear-gradient(135deg, #f59e0b15, #ec489915)`,
            border: '1px solid #f59e0b30',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: '#f59e0b20' }}
            >
              <Construction size={24} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {t('admin.tabs.settings')}
              </p>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('admin.tabs.settingsDesc')}
              </p>
            </div>
          </div>
        </button>
      )}
    </motion.div>
  )
}
