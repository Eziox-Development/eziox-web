import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useNavigate, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { getAppUrl, getAppHostname } from '@/lib/utils'
import { updateProfileFn } from '@/server/functions/auth'
import { getMyLinksFn } from '@/server/functions/links'
import { getReferralStatsFn } from '@/server/functions/referrals'
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  MousePointerClick,
  Users,
  Gift,
  ChevronRight,
  Globe,
  BarChart3,
  TrendingUp,
  Palette,
  Paintbrush,
  Shield,
  Handshake,
  Crown,
  Copy,
  Check,
  QrCode,
  X,
  Download,
  Share2,
  ExternalLink,
  Save,
  Link2,
} from 'lucide-react'
import { DASHBOARD_TABS } from './constants'
import type { TabType, ProfileFormData, ProfileUser } from './types'
import { ProfileTab } from './tabs/ProfileTab'
import { LinksTab } from './tabs/LinksTab'
import { ShortenerTab } from './tabs/ShortenerTab'
import { WidgetsTab } from './tabs/WidgetsTab'
import { IntegrationsTab } from './tabs/IntegrationsTab'
import { MediaLibraryTab } from './tabs/MediaLibraryTab'
import { ReferralsTab } from './tabs/ReferralsTab'
import { BadgesTab } from './tabs/BadgesTab'
import { SubscriptionTab } from './tabs/SubscriptionTab'
import { ApiAccessTab } from './tabs/ApiAccessTab'
import { SettingsTab } from './tabs/SettingsTab'
import { PrivacyTab } from './tabs/PrivacyTab'
import { SecurityTab } from './tabs/SecurityTab'
import QRCode from 'qrcode'

interface ProfileDashboardProps {
  currentUser: ProfileUser
  initialTab?: TabType
}

export function ProfileDashboard({
  currentUser,
  initialTab,
}: ProfileDashboardProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const updateProfile = useServerFn(updateProfileFn)
  const getMyLinks = useServerFn(getMyLinksFn)
  const getReferralStats = useServerFn(getReferralStatsFn)

  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedBioUrl, setCopiedBioUrl] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [customPronouns, setCustomPronouns] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrColor, setQrColor] = useState('#ffffff')
  const [qrBgColor, setQrBgColor] = useState('#000000')

  const [avatar, setAvatar] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    username: '',
    bio: '',
    website: '',
    location: '',
    pronouns: '',
    birthday: '',
    creatorTypes: [],
    isPublic: true,
    showActivity: true,
    socials: {},
  })

  const bioUrl = `${getAppUrl()}/${currentUser.username}`

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  useEffect(() => {
    if (showQRModal) {
      void QRCode.toDataURL(bioUrl, {
        width: 400,
        margin: 2,
        color: { dark: qrColor, light: qrBgColor },
        errorCorrectionLevel: 'H',
      })
        .then(setQrDataUrl)
        .catch(console.error)
    }
  }, [showQRModal, bioUrl, qrColor, qrBgColor])

  const handleTabChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab)
      void navigate({ to: '/profile', search: { tab } })
    },
    [navigate],
  )

  const { data: links = [] } = useQuery({
    queryKey: ['my-links'],
    queryFn: () => getMyLinks(),
  })

  const { data: referralStats } = useQuery({
    queryKey: ['referralStats'],
    queryFn: () => getReferralStats(),
  })

  useEffect(() => {
    if (currentUser) {
      const p = currentUser.profile
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        bio: p?.bio || '',
        website: p?.website || '',
        location: p?.location || '',
        pronouns: p?.pronouns || '',
        birthday: p?.birthday ? (String(p.birthday).split('T')[0] ?? '') : '',
        creatorTypes: (p?.creatorTypes as string[]) || [],
        isPublic: p?.isPublic ?? true,
        showActivity: p?.showActivity ?? true,
        socials: (p?.socials as Record<string, string>) || {},
      })
      setAvatar(p?.avatar || null)
      setBanner(p?.banner || null)
    }
  }, [currentUser])

  const copyBioUrl = useCallback(async () => {
    await navigator.clipboard.writeText(bioUrl)
    setCopiedBioUrl(true)
    setTimeout(() => setCopiedBioUrl(false), 2000)
  }, [bioUrl])

  const updateField = useCallback(
    <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
      setHasChanges(true)
    },
    [],
  )

  const updateSocial = useCallback((key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [key]: value },
    }))
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const pronounsToSave =
        formData.pronouns === 'custom' ? customPronouns : formData.pronouns
      await updateProfile({
        data: {
          name: formData.name || undefined,
          username: formData.username || undefined,
          bio: formData.bio || undefined,
          website: formData.website || undefined,
          location: formData.location || undefined,
          pronouns: pronounsToSave || undefined,
          birthday: formData.birthday || undefined,
          creatorTypes:
            formData.creatorTypes.length > 0
              ? formData.creatorTypes
              : undefined,
          isPublic: formData.isPublic,
          showActivity: formData.showActivity,
          socials:
            Object.keys(formData.socials).length > 0
              ? formData.socials
              : undefined,
        },
      })
      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError(
        (error as { message?: string }).message || t('dashboard.saveFailed'),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setHasChanges(false)
    window.location.reload()
  }

  const downloadQRCode = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = `eziox-${currentUser.username}-qr.png`
    link.href = qrDataUrl
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentUser.name || currentUser.username} on Eziox`,
          url: bioUrl,
        })
      } catch {
        /* cancelled */
      }
    } else {
      await copyBioUrl()
    }
  }

  const stats = currentUser.stats || {
    profileViews: 0,
    totalLinkClicks: 0,
    followers: 0,
    following: 0,
  }
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
  const referralCount = referralStats?.referralCount || 0
  const userBadges = (currentUser.profile?.badges || []) as string[]

  // Card style classes based on theme
  const getCardStyle = () => {
    switch (theme.effects.cardStyle) {
      case 'glass':
        return 'backdrop-blur-xl bg-[var(--card)]/10 border border-[var(--border)]/20'
      case 'neon':
        return 'bg-[var(--card)]/5 border border-[var(--primary)]/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]'
      case 'gradient':
        return 'bg-gradient-to-br from-[var(--card)]/20 to-[var(--background-secondary)]/20 border border-[var(--border)]/20'
      case 'flat':
      default:
        return 'bg-[var(--card)] border border-[var(--border)]/30'
    }
  }
  const cardStyle = getCardStyle()

  const groupedTabs = {
    main: DASHBOARD_TABS.filter((t) => t.category === 'main'),
    premium: DASHBOARD_TABS.filter((t) => t.category === 'premium'),
    account: DASHBOARD_TABS.filter((t) => t.category === 'account'),
  }

  const getBadgeCount = (tabId: TabType): number | undefined => {
    if (tabId === 'links') return links.length
    if (tabId === 'referrals') return referralCount
    if (tabId === 'badges') return userBadges.length
    return undefined
  }

  return (
    <div className="min-h-screen pt-20 pb-16 transition-[background-color] duration-(--theme-transition) bg-background font-(--font-body)">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full blur-[150px] bg-linear-to-br from-primary to-accent opacity-(--glow-intensity)"
          animate={{ scale: [1, 1.1, 1], x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] bg-linear-to-br from-accent to-primary opacity-[calc(var(--glow-intensity)*0.75)]"
          animate={{ scale: [1.1, 1, 1.1], x: [0, 30, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Toast Notifications */}
      <AnimatePresence mode="wait">
        {saveSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 bg-green-500 shadow-lg shadow-green-500/25"
          >
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              {t('dashboard.saved')}
            </span>
          </motion.div>
        )}
        {saveError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 bg-red-500 shadow-lg shadow-red-500/25"
          >
            <AlertCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 shrink-0"
          >
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* User Card */}
              <div className={`overflow-hidden rounded-lg ${cardStyle}`}>
                {/* Banner */}
                <div
                  className="h-24 relative bg-linear-to-br from-primary to-accent"
                  style={{
                    background: banner
                      ? `url(${banner}) center/cover`
                      : undefined,
                  }}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
                </div>

                {/* Avatar & Info */}
                <div className="px-5 pb-5 -mt-10 relative">
                  <div className="flex items-end gap-4">
                    <div
                      className="w-20 h-20 overflow-hidden shrink-0 rounded-lg bg-linear-to-br from-primary to-accent shadow-[0_0_0_4px_var(--background)]"
                      style={{
                        background: avatar
                          ? `url(${avatar}) center/cover`
                          : undefined,
                      }}
                    >
                      {!avatar && (
                        <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary-foreground">
                          {(currentUser.name || 'U').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <h2
                        className="font-semibold text-lg truncate text-foreground"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {currentUser.name || 'Anonymous'}
                      </h2>
                      <p className="text-sm truncate text-foreground-muted">
                        @{currentUser.username}
                      </p>
                    </div>
                  </div>

                  {/* Bio Link */}
                  <div className="mt-4 p-3 rounded-[calc(var(--radius)*0.5)] bg-background-secondary/50 border border-border/20">
                    <p className="text-xs mb-2 text-foreground-muted">
                      {t('dashboard.sidebar.bioLink')}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 text-sm font-mono truncate rounded-[calc(var(--radius)*0.3)] bg-background-secondary/30 text-primary">
                        {getAppHostname()}/{currentUser.username}
                      </div>
                      <button
                        onClick={copyBioUrl}
                        className="p-2 transition-colors duration-(--animation-speed) rounded-[calc(var(--radius)*0.3)] bg-background-secondary/30 hover:bg-background-secondary/50"
                        title="Copy link"
                      >
                        {copiedBioUrl ? (
                          <Check size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} className="text-foreground-muted" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowQRModal(true)}
                        className="p-2 transition-colors duration-(--animation-speed) rounded-[calc(var(--radius)*0.3)] bg-background-secondary/30 hover:bg-background-secondary/50"
                        title="Show QR Code"
                      >
                        <QrCode size={16} className="text-foreground-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className={`overflow-hidden p-3 rounded-lg ${cardStyle}`}>
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {t('dashboard.sidebar.dashboard')}
                </p>
                {groupedTabs.main.map((tab) => (
                  <SidebarButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    badge={getBadgeCount(tab.id)}
                    t={t}
                  />
                ))}

                <div className="my-3 border-t border-border/20" />
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {t('dashboard.sidebar.premium')}
                </p>
                {groupedTabs.premium.map((tab) => (
                  <SidebarButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    t={t}
                  />
                ))}

                <div className="my-3 border-t border-border/20" />
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {t('dashboard.sidebar.account')}
                </p>
                {groupedTabs.account.map((tab) => (
                  <SidebarButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    t={t}
                  />
                ))}

                <div className="my-3 border-t border-border/20" />
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {t('dashboard.sidebar.quickLinks')}
                </p>
                <QuickLink
                  to="/$username"
                  params={{ username: currentUser.username }}
                  icon={Globe}
                  labelKey="dashboard.quickLinks.myBioPage"
                  external
                  t={t}
                />
                <QuickLink
                  to="/shortener"
                  icon={Link2}
                  labelKey="dashboard.quickLinks.shortener"
                  t={t}
                />
                <QuickLink
                  to="/analytics"
                  icon={BarChart3}
                  labelKey="dashboard.quickLinks.analytics"
                  t={t}
                />
                <QuickLink
                  to="/leaderboard"
                  icon={TrendingUp}
                  labelKey="dashboard.quickLinks.leaderboard"
                  t={t}
                />
                <QuickLink
                  to="/playground"
                  icon={Palette}
                  labelKey="dashboard.quickLinks.playground"
                  t={t}
                />
                <QuickLink
                  to="/theme-builder"
                  icon={Paintbrush}
                  labelKey="dashboard.quickLinks.themeBuilder"
                  premium
                  t={t}
                />

                <div className="my-3 border-t border-border/20" />
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {t('dashboard.sidebar.support')}
                </p>
                <QuickLink
                  to="/support/tickets"
                  icon={Shield}
                  labelKey="dashboard.quickLinks.myTickets"
                  t={t}
                />
                <QuickLink
                  to="/support"
                  icon={Globe}
                  labelKey="dashboard.quickLinks.helpCenter"
                  t={t}
                />
              </div>

              {/* Admin Section */}
              {(currentUser.role === 'admin' ||
                currentUser.role === 'owner') && (
                <div className="rounded-3xl overflow-hidden bg-white/[0.03] border border-red-500/20 backdrop-blur-xl p-3">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <Crown size={12} />
                    {t('dashboard.sidebar.admin')}
                  </p>
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500/20">
                      <Shield size={18} className="text-red-400" />
                    </div>
                    <span className="text-sm text-white">
                      {t('dashboard.sidebar.adminPanel')}
                    </span>
                    <ChevronRight size={14} className="ml-auto text-white/30" />
                  </Link>
                  <Link
                    to="/admin"
                    search={{ tab: 'partners' }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-teal-500/10 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-500/20">
                      <Handshake size={18} className="text-teal-400" />
                    </div>
                    <span className="text-sm text-white">
                      {t('dashboard.sidebar.partnerApps')}
                    </span>
                    <ChevronRight size={14} className="ml-auto text-white/30" />
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
            >
              <StatCard
                icon={Eye}
                label={t('dashboard.stats.profileViews')}
                value={stats.profileViews}
                gradient="from-blue-500 to-cyan-500"
                cardStyle={cardStyle}
              />
              <StatCard
                icon={MousePointerClick}
                label={t('dashboard.stats.linkClicks')}
                value={totalClicks}
                gradient="from-green-500 to-emerald-500"
                cardStyle={cardStyle}
              />
              <StatCard
                icon={Users}
                label={t('dashboard.stats.followers')}
                value={stats.followers}
                gradient="from-purple-500 to-pink-500"
                cardStyle={cardStyle}
              />
              <StatCard
                icon={Gift}
                label={t('dashboard.stats.referrals')}
                value={referralCount}
                gradient="from-amber-500 to-orange-500"
                cardStyle={cardStyle}
              />
            </motion.div>

            {/* Save Bar */}
            <AnimatePresence>
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-6"
                >
                  <div className="p-4 rounded-lg flex items-center justify-between gap-4 bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <p className="text-sm text-foreground-muted">
                      {t('dashboard.unsavedChanges')}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-secondary/30 transition-colors duration-(--animation-speed)"
                      >
                        {t('dashboard.cancel')}
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-primary-foreground bg-linear-to-r from-primary to-accent hover:opacity-90 transition-all duration-(--animation-speed) disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        {isSaving ? t('dashboard.saving') : t('dashboard.save')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <ProfileTab
                  key="profile"
                  formData={formData}
                  updateField={updateField}
                  updateSocial={updateSocial}
                  customPronouns={customPronouns}
                  setCustomPronouns={setCustomPronouns}
                  avatar={avatar}
                  banner={banner}
                  onAvatarChange={setAvatar}
                  onBannerChange={setBanner}
                />
              )}
              {activeTab === 'links' && <LinksTab key="links" />}
              {activeTab === 'shortener' && <ShortenerTab key="shortener" />}
              {activeTab === 'widgets' && <WidgetsTab key="widgets" />}
              {activeTab === 'integrations' && (
                <IntegrationsTab key="integrations" />
              )}
              {activeTab === 'media' && <MediaLibraryTab key="media" />}
              {activeTab === 'referrals' && <ReferralsTab key="referrals" />}
              {activeTab === 'badges' && (
                <BadgesTab
                  key="badges"
                  badges={userBadges}
                  referralCount={referralCount}
                  isEarlyAdopter={userBadges.includes('early_adopter')}
                  tier={currentUser.tier}
                  isPartner={currentUser.profile?.isFeatured ?? false}
                  isStaff={currentUser.role === 'admin'}
                />
              )}
              {activeTab === 'subscription' && (
                <SubscriptionTab key="subscription" />
              )}
              {activeTab === 'api' && <ApiAccessTab key="api" />}
              {activeTab === 'settings' && (
                <SettingsTab key="settings" currentUser={currentUser} />
              )}
              {activeTab === 'privacy' && (
                <PrivacyTab key="privacy" currentUser={currentUser} />
              )}
              {activeTab === 'security' && (
                <SecurityTab key="security" currentUser={currentUser} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-[#1a1a24] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  {t('dashboard.qrCode.title')}
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X size={18} className="text-white/50" />
                </button>
              </div>

              <div className="flex justify-center mb-4">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-48 h-48 rounded-xl"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-xl animate-pulse bg-white/10" />
                )}
              </div>

              <p className="text-center text-sm mb-4 font-mono text-purple-400">
                {getAppHostname()}/{currentUser.username}
              </p>

              <div className="mb-4">
                <p className="text-xs font-medium mb-2 text-white/50">
                  {t('dashboard.qrCode.style')}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    {
                      fg: '#ffffff',
                      bg: '#000000',
                      label: t('dashboard.qrCode.classic'),
                    },
                    {
                      fg: '#000000',
                      bg: '#ffffff',
                      label: t('dashboard.qrCode.light'),
                    },
                    {
                      fg: '#8b5cf6',
                      bg: '#1e1e2e',
                      label: t('dashboard.qrCode.accent'),
                    },
                    {
                      fg: '#ec4899',
                      bg: '#1e1e2e',
                      label: t('dashboard.qrCode.pink'),
                    },
                    {
                      fg: '#22c55e',
                      bg: '#0a0a0a',
                      label: t('dashboard.qrCode.green'),
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setQrColor(preset.fg)
                        setQrBgColor(preset.bg)
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{
                        background: preset.bg,
                        color: preset.fg,
                        border: `1px solid ${preset.fg}40`,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-white text-sm bg-gradient-to-r from-purple-500 to-cyan-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={16} />
                  {t('dashboard.qrCode.download')}
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-white/10 text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Sidebar Button Component
function SidebarButton({
  tab,
  isActive,
  onClick,
  badge,
  t,
}: {
  tab: (typeof DASHBOARD_TABS)[number]
  isActive: boolean
  onClick: () => void
  badge?: number
  t: (key: string) => string
}) {
  const Icon = tab.icon

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-(--animation-speed) ${
        isActive ? 'bg-primary/15' : 'hover:bg-background-secondary/30'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-(--animation-speed) ${
          isActive
            ? 'bg-linear-to-br from-primary to-accent'
            : 'bg-background-secondary/50'
        }`}
      >
        <Icon
          size={18}
          className={
            isActive ? 'text-primary-foreground' : 'text-foreground-muted'
          }
        />
      </div>
      <span
        className={`flex-1 text-left text-sm transition-colors duration-(--animation-speed) ${
          isActive ? 'text-foreground font-medium' : 'text-foreground-muted'
        }`}
      >
        {t(tab.labelKey)}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-background-secondary/50 text-foreground-muted">
          {badge}
        </span>
      )}
      <ChevronRight
        size={16}
        className={isActive ? 'text-primary' : 'text-transparent'}
      />
    </button>
  )
}

// Quick Link Component
function QuickLink({
  to,
  params,
  icon: Icon,
  labelKey,
  external,
  premium,
  t,
}: {
  to: string
  params?: Record<string, string>
  icon: typeof Globe
  labelKey: string
  external?: boolean
  premium?: boolean
  t: (key: string) => string
}) {
  return (
    <Link
      to={to}
      params={params}
      target={external ? '_blank' : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-(--animation-speed) hover:bg-background-secondary/30"
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          premium
            ? 'bg-linear-to-br from-primary to-accent'
            : 'bg-background-secondary/50'
        }`}
      >
        <Icon
          size={18}
          className={
            premium ? 'text-primary-foreground' : 'text-foreground-muted'
          }
        />
      </div>
      <span className="text-sm text-foreground">{t(labelKey)}</span>
      {external && <ExternalLink size={14} className="text-foreground-muted" />}
      {premium && <Crown size={12} className="text-amber-400" />}
    </Link>
  )
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  cardStyle,
}: {
  icon: typeof Eye
  label: string
  value: number
  gradient: string
  cardStyle: string
}) {
  return (
    <motion.div
      className={`p-4 rounded-lg ${cardStyle}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br ${gradient} mb-3`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <p
        className="text-2xl font-bold text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-foreground-muted">{label}</p>
    </motion.div>
  )
}

// Loader Component
export function ProfileDashboardLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 animate-spin border-border/20 border-t-primary" />
          <div className="absolute inset-0 w-16 h-16 rounded-full blur-xl bg-linear-to-br from-primary/30 to-accent/30" />
        </div>
        <p className="text-sm mt-6 font-medium text-foreground-muted">
          Loading...
        </p>
      </motion.div>
    </div>
  )
}
