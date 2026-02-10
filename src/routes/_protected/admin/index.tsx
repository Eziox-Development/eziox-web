import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  Users2,
  Crown,
  AlertTriangle,
  Handshake,
  Construction,
  Shield,
  BarChart3,
  Loader2,
  Scale,
  Ticket,
} from 'lucide-react'

// Import Tab Components
import { OverviewTab } from './tabs/-overview-tab'
import { UserManagerTab } from './tabs/-usermanager-tab'
import { ModerationTab } from './tabs/-moderation-tab'
import { AbuseTab } from './tabs/-abuse-tab'
import { PartnersTab } from './tabs/-partners-tab'
import { SettingsTab } from './tabs/-settings-tab'
import { LegalTab } from './tabs/-legal-tab'
import { ComplianceTab } from './tabs/-compliance-tab'
import { SecurityTab } from './tabs/-security-tab'
import { TicketsTab } from './tabs/-tickets-tab'
import { IncidentsTab } from './tabs/-incidents-tab'
import { NewsletterTab } from './tabs/-newsletter-tab'

export type AdminTabType =
  | 'overview'
  | 'user-manager'
  | 'moderation'
  | 'abuse'
  | 'security'
  | 'tickets'
  | 'incidents'
  | 'newsletter'
  | 'partners'
  | 'legal'
  | 'compliance'
  | 'settings'

export const Route = createFileRoute('/_protected/admin/')({
  validateSearch: (search: Record<string, unknown>): { tab?: AdminTabType } => {
    const tab = search.tab as string | undefined
    const validTabs: AdminTabType[] = [
      'overview',
      'user-manager',
      'moderation',
      'abuse',
      'security',
      'tickets',
      'incidents',
      'newsletter',
      'partners',
      'legal',
      'compliance',
      'settings',
    ]
    return {
      tab:
        tab && validTabs.includes(tab as AdminTabType)
          ? (tab as AdminTabType)
          : undefined,
    }
  },
  head: () => ({
    meta: [
      { title: 'Admin Panel | Eziox' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminPage,
})

function AdminPage() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { tab: initialTab } = Route.useSearch()
  const [activeTab, setActiveTab] = useState<AdminTabType>(
    initialTab || 'overview',
  )
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner'

  useEffect(() => {
    if (currentUser && !isAdmin) void navigate({ to: '/profile' })
  }, [currentUser, isAdmin, navigate])

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) setActiveTab(initialTab)
  }, [initialTab, activeTab])

  const handleTabChange = (tab: AdminTabType) => {
    setActiveTab(tab)
    void navigate({ to: '/admin', search: { tab } })
  }

  if (!currentUser) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.colors.background }}
      >
        <Loader2
          className="w-10 h-10 animate-spin"
          style={{ color: theme.colors.primary }}
        />
      </div>
    )
  }

  if (!isAdmin) {
    return <AccessDenied currentUser={currentUser} />
  }

  const tabs: {
    id: AdminTabType
    labelKey: string
    descKey: string
    icon: React.ElementType
    color: string
    ownerOnly?: boolean
  }[] = [
    {
      id: 'overview',
      labelKey: 'admin.tabs.overview',
      descKey: 'admin.tabs.overviewDesc',
      icon: BarChart3,
      color: theme.colors.primary,
    },
    {
      id: 'user-manager',
      labelKey: 'admin.tabs.userManager',
      descKey: 'admin.tabs.userManagerDesc',
      icon: Users2,
      color: '#3b82f6',
    },
    {
      id: 'moderation',
      labelKey: 'admin.tabs.moderation',
      descKey: 'admin.tabs.moderationDesc',
      icon: Shield,
      color: '#ef4444',
    },
    {
      id: 'abuse',
      labelKey: 'admin.tabs.abuse',
      descKey: 'admin.tabs.abuseDesc',
      icon: AlertTriangle,
      color: '#f59e0b',
    },
    {
      id: 'security',
      labelKey: 'admin.tabs.security',
      descKey: 'admin.tabs.securityDesc',
      icon: ShieldCheck,
      color: '#dc2626',
    },
    {
      id: 'tickets',
      labelKey: 'admin.tabs.tickets',
      descKey: 'admin.tabs.ticketsDesc',
      icon: Ticket,
      color: '#6366f1',
    },
    {
      id: 'incidents',
      labelKey: 'admin.tabs.incidents',
      descKey: 'admin.tabs.incidentsDesc',
      icon: AlertTriangle,
      color: '#f59e0b',
    },
    {
      id: 'newsletter',
      labelKey: 'admin.tabs.newsletter',
      descKey: 'admin.tabs.newsletterDesc',
      icon: BarChart3,
      color: '#6366f1',
    },
    {
      id: 'partners',
      labelKey: 'admin.tabs.partners',
      descKey: 'admin.tabs.partnersDesc',
      icon: Handshake,
      color: '#14b8a6',
    },
    {
      id: 'legal',
      labelKey: 'admin.tabs.legal',
      descKey: 'admin.tabs.legalDesc',
      icon: Scale,
      color: '#6366f1',
    },
    {
      id: 'compliance',
      labelKey: 'admin.tabs.compliance',
      descKey: 'admin.tabs.complianceDesc',
      icon: ShieldCheck,
      color: '#22c55e',
    },
    {
      id: 'settings',
      labelKey: 'admin.tabs.settings',
      descKey: 'admin.tabs.settingsDesc',
      icon: Construction,
      color: '#8b5cf6',
      ownerOnly: true,
    },
  ]

  const visibleTabs = tabs.filter(
    (tab) => !tab.ownerOnly || currentUser.role === 'owner',
  )

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
            background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}10)`,
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <AdminSidebar
            tabs={visibleTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            currentUser={currentUser}
          />

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-w-0"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <OverviewTab key="overview" onTabChange={handleTabChange} />
              )}
              {activeTab === 'user-manager' && (
                <UserManagerTab key="user-manager" />
              )}
              {activeTab === 'moderation' && <ModerationTab key="moderation" />}
              {activeTab === 'abuse' && <AbuseTab key="abuse" />}
              {activeTab === 'security' && <SecurityTab key="security" />}
              {activeTab === 'tickets' && <TicketsTab key="tickets" />}
              {activeTab === 'incidents' && <IncidentsTab key="incidents" />}
              {activeTab === 'newsletter' && <NewsletterTab key="newsletter" />}
              {activeTab === 'partners' && <PartnersTab key="partners" />}
              {activeTab === 'legal' && <LegalTab key="legal" />}
              {activeTab === 'compliance' && <ComplianceTab key="compliance" />}
              {activeTab === 'settings' && <SettingsTab key="settings" />}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </div>
  )
}

function AccessDenied({
  currentUser,
}: {
  currentUser: { role: string | null }
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4"
      style={{ background: theme.colors.background }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center"
      >
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
          style={{ background: `${theme.colors.primary}20` }}
        >
          <ShieldCheck size={40} style={{ color: theme.colors.primary }} />
        </div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: theme.colors.foreground }}
        >
          {t('admin.accessRestricted')}
        </h1>
        <p
          className="text-lg mb-6"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {t('admin.accessRestrictedDesc')}
        </p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: `${theme.colors.foreground}10`,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <span style={{ color: theme.colors.foregroundMuted }}>
            {t('admin.currentRole')}:
          </span>
          <span
            className="font-mono font-semibold"
            style={{ color: theme.colors.primary }}
          >
            {currentUser.role || 'user'}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

function AdminSidebar({
  tabs,
  activeTab,
  onTabChange,
  currentUser,
}: {
  tabs: {
    id: AdminTabType
    labelKey: string
    descKey: string
    icon: React.ElementType
    color: string
  }[]
  activeTab: AdminTabType
  onTabChange: (tab: AdminTabType) => void
  currentUser: { role: string | null }
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:w-72 shrink-0"
    >
      <div className="lg:sticky lg:top-24 space-y-4">
        {/* Header Card */}
        <div
          className="p-5 rounded-2xl backdrop-blur-sm"
          style={{
            background: `${theme.colors.card}80`,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              }}
            >
              <Crown size={28} className="text-white" />
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: theme.colors.foreground }}
              >
                {t('admin.title')}
              </h1>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {currentUser.role === 'owner'
                  ? t('admin.ownerAccess')
                  : t('admin.adminAccess')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="p-2 rounded-2xl backdrop-blur-sm"
          style={{
            background: `${theme.colors.card}80`,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative text-left"
                style={{
                  background: isActive
                    ? `${theme.colors.foreground}10`
                    : 'transparent',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-tab-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ background: tab.color }}
                  />
                )}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: isActive
                      ? `${tab.color}20`
                      : `${theme.colors.foreground}08`,
                  }}
                >
                  <tab.icon
                    size={20}
                    style={{
                      color: isActive
                        ? tab.color
                        : theme.colors.foregroundMuted,
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm"
                    style={{
                      color: isActive ? tab.color : theme.colors.foreground,
                    }}
                  >
                    {t(tab.labelKey)}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t(tab.descKey)}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Admin Mode Indicator */}
        <div
          className="p-4 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}08)`,
            border: `1px solid ${theme.colors.primary}30`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} style={{ color: theme.colors.primary }} />
            <span
              className="text-xs font-medium"
              style={{ color: theme.colors.primary }}
            >
              {t('admin.adminModeActive')}
            </span>
          </div>
          <p
            className="text-xs"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('admin.actionsLogged')}
          </p>
        </div>
      </div>
    </motion.aside>
  )
}
