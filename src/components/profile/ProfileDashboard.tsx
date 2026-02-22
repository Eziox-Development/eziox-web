import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useNavigate, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getAppUrl, getAppHostname } from '@/lib/utils'
import { updateProfileFn } from '@/server/functions/auth'
import { getMyLinksFn } from '@/server/functions/links'
import { getReferralStatsFn } from '@/server/functions/referrals'
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Globe,
  BarChart3,
  TrendingUp,
  Palette,
  Paintbrush,
  Shield,
  Crown,
  Copy,
  Check,
  QrCode,
  X,
  Download,
  Share2,
  ExternalLink,
  Save,
  PanelLeft,
  Home,
  ArrowUpRight,
} from 'lucide-react'
import QRCode from 'qrcode'
import { DASHBOARD_TABS, STAT_CARDS, QR_PRESETS } from './constants'
import type {
  TabType,
  ProfileFormData,
  ProfileUser,
  DashboardTab,
  DashboardContext,
  UserStats,
  UpdateFieldFn,
} from './types'
import { OverviewTab } from './tabs/OverviewTab'
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

// ─── Design Tokens (theme-aware via CSS variables) ──────────────────────────

const DT = {
  bg: 'bg-background',
  sidebar: 'bg-sidebar',
  surface: 'bg-card/60 backdrop-blur-sm',
  surfaceHover: 'hover:bg-card/80',
  border: 'border-border',
  borderHover: 'hover:border-primary/30',
  textPrimary: 'text-foreground',
  textSecondary: 'text-foreground-muted',
  textMuted: 'text-muted-foreground',
  textGhost: 'text-muted-foreground/50',
  accent: 'from-primary to-accent',
  accentSolid: 'bg-primary',
  radius: 'rounded-xl',
  radiusSm: 'rounded-lg',
  radiusXs: 'rounded-md',
  sidebarWidth: 280,
  sidebarCollapsed: 72,
  headerHeight: 56,
} as const

// ─── Sidebar Nav Item ────────────────────────────────────────────────────────

function NavItem({
  tab,
  active,
  collapsed,
  badge,
  onClick,
  t,
}: {
  tab: DashboardTab
  active: boolean
  collapsed: boolean
  badge?: number
  onClick: () => void
  t: (k: string) => string
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      title={collapsed ? t(tab.labelKey) : undefined}
      className={`group relative w-full flex items-center gap-3 theme-animation ${
        collapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
      } ${DT.radiusSm} ${
        active
          ? 'bg-primary/12 text-foreground shadow-sm shadow-primary/5'
          : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
      }`}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 ${DT.radiusXs} bg-linear-to-b ${DT.accent}`}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <div
        className={`w-8 h-8 ${DT.radiusSm} flex items-center justify-center shrink-0 theme-animation ${
          active ? `bg-linear-to-br ${DT.accent} glow-primary` : 'bg-card/60'
        }`}
      >
        <Icon size={16} className={active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} />
      </div>
      {!collapsed && (
        <>
          <span className={`flex-1 text-left text-sm leading-tight truncate ${active ? 'font-semibold' : 'font-medium'}`}>
            {t(tab.labelKey)}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="min-w-[22px] text-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary tabular-nums">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  )
}

// ─── Sidebar Section Label ───────────────────────────────────────────────────

function SectionLabel({ labelKey, collapsed, t }: { labelKey: string; collapsed: boolean; t: (k: string) => string }) {
  if (collapsed) return <div className="my-2 mx-3 border-t border-border/40" />
  return (
    <div className="px-3 pt-4 pb-1.5 flex items-center gap-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 select-none">
        {t(labelKey)}
      </p>
      <div className="flex-1 h-px bg-border/30" />
    </div>
  )
}

// ─── Sidebar Quick Link ──────────────────────────────────────────────────────

function SidebarLink({
  to,
  params,
  icon: Icon,
  labelKey,
  external,
  premium,
  collapsed,
  t,
}: {
  to: string
  params?: Record<string, string>
  icon: typeof Globe
  labelKey: string
  external?: boolean
  premium?: boolean
  collapsed: boolean
  t: (k: string) => string
}) {
  return (
    <Link
      to={to}
      params={params}
      target={external ? '_blank' : undefined}
      title={collapsed ? t(labelKey) : undefined}
      className={`group flex items-center gap-2.5 theme-animation border border-transparent hover:border-border/60 hover:bg-background-secondary/80 ${DT.radiusSm} ${
        collapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
      } ${
        external
          ? 'text-accent/70 hover:text-accent'
          : 'text-muted-foreground/70 hover:text-foreground-muted'
      }`}
    >
      <div className={`w-7 h-7 ${DT.radiusXs} flex items-center justify-center shrink-0 ${
        external ? 'bg-accent/8' : 'bg-card/40'
      } group-hover:bg-card/80 theme-animation`}>
        <Icon size={14} className="shrink-0" />
      </div>
      {!collapsed && (
        <>
          <span className="text-[12.5px] font-medium flex-1 truncate">{t(labelKey)}</span>
          {external && (
            <ArrowUpRight size={12} className="text-accent/40 group-hover:text-accent/80 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 theme-animation" />
          )}
          {premium && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400/70 text-[9px] font-bold uppercase tracking-wider">
              <Crown size={8} />
              Pro
            </span>
          )}
        </>
      )}
    </Link>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, gradient }: { icon: typeof Globe; label: string; value: number; gradient: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group p-4 ${DT.radius} glass border ${DT.border} ${DT.borderHover} theme-animation hover:glow-primary`}
    >
      <div className={`w-8 h-8 ${DT.radiusSm} flex items-center justify-center bg-linear-to-br ${gradient} mb-3 shadow-lg`}>
        <Icon size={14} className="text-primary-foreground" />
      </div>
      <p className="text-xl font-bold text-foreground tabular-nums leading-none">{value.toLocaleString()}</p>
      <p className={`text-[11px] ${DT.textMuted} mt-1`}>{label}</p>
    </motion.div>
  )
}

// ─── QR Code Modal ───────────────────────────────────────────────────────────

function QrModal({
  open,
  onClose,
  bioUrl,
  username,
  t,
}: {
  open: boolean
  onClose: () => void
  bioUrl: string
  username: string
  t: (k: string) => string
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [fg, setFg] = useState('#ffffff')
  const [bg, setBg] = useState('#000000')

  useEffect(() => {
    if (!open) return
    void QRCode.toDataURL(bioUrl, {
      width: 400,
      margin: 2,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: 'H',
    })
      .then(setDataUrl)
      .catch(console.error)
  }, [open, bioUrl, fg, bg])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.download = `eziox-${username}-qr.png`
    a.href = dataUrl
    a.click()
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${username} on Eziox`, url: bioUrl })
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(bioUrl)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`w-full max-w-sm p-6 ${DT.radius} glass-strong border ${DT.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground">{t('dashboard.qrCode.title')}</h3>
              <button onClick={onClose} className={`p-1.5 ${DT.radiusSm} hover:bg-card/80 theme-animation`}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex justify-center mb-4">
              {dataUrl ? (
                <img src={dataUrl} alt="QR Code" className={`w-44 h-44 ${DT.radius}`} />
              ) : (
                <div className={`w-44 h-44 ${DT.radius} animate-pulse bg-card`} />
              )}
            </div>

            <p className="text-center text-xs mb-4 font-mono text-primary/80">
              {getAppHostname()}/{username}
            </p>

            <div className="mb-5">
              <p className={`text-[11px] font-medium mb-2 ${DT.textMuted}`}>{t('dashboard.qrCode.style')}</p>
              <div className="flex gap-1.5 flex-wrap">
                {QR_PRESETS.map((preset) => (
                  <button
                    key={preset.labelKey}
                    onClick={() => { setFg(preset.fg); setBg(preset.bg) }}
                    className={`px-2.5 py-1 ${DT.radiusSm} text-[11px] font-medium transition-all hover:scale-105`}
                    style={{ background: preset.bg, color: preset.fg, border: `1px solid ${preset.fg}30` }}
                  >
                    {t(preset.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={download}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 ${DT.radius} font-medium text-primary-foreground text-sm bg-linear-to-r ${DT.accent} glow-primary`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={14} />
                {t('dashboard.qrCode.download')}
              </motion.button>
              <motion.button
                onClick={share}
                className={`flex items-center justify-center px-4 py-2.5 ${DT.radius} text-sm bg-card text-foreground border ${DT.border}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 size={14} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ type, message }: { type: 'success' | 'error'; message: string }) {
  const Icon = type === 'success' ? CheckCircle : AlertCircle
  const color = type === 'success' ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-destructive shadow-destructive/25'
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-4 left-1/2 z-60 px-5 py-2.5 ${DT.radius} flex items-center gap-2.5 ${color} shadow-lg backdrop-blur-sm`}
    >
      <Icon size={16} className="text-primary-foreground shrink-0" />
      <span className="text-sm font-medium text-primary-foreground">{message}</span>
    </motion.div>
  )
}

// ─── Save Bar ────────────────────────────────────────────────────────────────

function SaveBar({
  visible,
  saving,
  onSave,
  onCancel,
  t,
}: {
  visible: boolean
  saving: boolean
  onSave: () => void
  onCancel: () => void
  t: (k: string) => string
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
        >
          <div className={`p-3.5 ${DT.radius} flex items-center justify-between gap-4 bg-primary/8 border border-primary/20 backdrop-blur-sm`}>
            <p className={`text-sm ${DT.textSecondary}`}>{t('dashboard.unsavedChanges')}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className={`px-4 py-1.5 ${DT.radiusSm} text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/50 theme-animation`}
              >
                {t('dashboard.cancel')}
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-1.5 ${DT.radiusSm} text-sm font-semibold text-primary-foreground bg-linear-to-r ${DT.accent} hover:opacity-90 theme-animation disabled:opacity-50 glow-primary`}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? t('dashboard.saving') : t('dashboard.save')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Tab Renderer ────────────────────────────────────────────────────────────

function TabContent({
  activeTab,
  formData,
  updateField,
  updateSocial,
  customPronouns,
  setCustomPronouns,
  avatar,
  banner,
  setAvatar,
  setBanner,
  currentUser,
  userBadges,
  referralCount,
}: {
  activeTab: TabType
  formData: ProfileFormData
  updateField: UpdateFieldFn
  updateSocial: (key: string, value: string) => void
  customPronouns: string
  setCustomPronouns: (v: string) => void
  avatar: string | null
  banner: string | null
  setAvatar: (v: string | null) => void
  setBanner: (v: string | null) => void
  currentUser: ProfileUser
  userBadges: string[]
  referralCount: number
}) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === 'overview' && <OverviewTab key="overview" />}
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
      {activeTab === 'integrations' && <IntegrationsTab key="integrations" />}
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
      {activeTab === 'subscription' && <SubscriptionTab key="subscription" />}
      {activeTab === 'api' && <ApiAccessTab key="api" />}
      {activeTab === 'settings' && <SettingsTab key="settings" currentUser={currentUser} />}
      {activeTab === 'privacy' && <PrivacyTab key="privacy" currentUser={currentUser} />}
      {activeTab === 'security' && <SecurityTab key="security" currentUser={currentUser} />}
    </AnimatePresence>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

interface ProfileDashboardProps {
  currentUser: ProfileUser
  initialTab?: TabType
}

export function ProfileDashboard({ currentUser, initialTab }: ProfileDashboardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const updateProfile = useServerFn(updateProfileFn)
  const getMyLinks = useServerFn(getMyLinksFn)
  const getReferralStats = useServerFn(getReferralStatsFn)

  // ── State ──
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'overview')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedBioUrl, setCopiedBioUrl] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [customPronouns, setCustomPronouns] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '', username: '', bio: '', website: '', location: '',
    pronouns: '', birthday: '', creatorTypes: [], isPublic: true,
    showActivity: true, socials: {},
  })

  const bioUrl = `${getAppUrl()}/${currentUser.username}`

  // ── Sync initial tab ──
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) setActiveTab(initialTab)
  }, [initialTab])

  // ── Sync user data ──
  useEffect(() => {
    if (!currentUser) return
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
  }, [currentUser])

  // ── Queries ──
  const { data: links = [] } = useQuery({ queryKey: ['my-links'], queryFn: () => getMyLinks() })
  const { data: referralStats } = useQuery({ queryKey: ['referralStats'], queryFn: () => getReferralStats() })

  // ── Derived data ──
  const stats: UserStats = currentUser.stats || { profileViews: 0, totalLinkClicks: 0, followers: 0, following: 0 }
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0)
  const referralCount = referralStats?.referralCount || 0
  const userBadges = (currentUser.profile?.badges || []) as string[]

  const dashCtx: DashboardContext = useMemo(
    () => ({ stats, totalClicks, referralCount, badgeCount: userBadges.length }),
    [stats, totalClicks, referralCount, userBadges.length],
  )

  const groupedTabs = useMemo(() => ({
    main: DASHBOARD_TABS.filter((t) => t.category === 'main'),
    premium: DASHBOARD_TABS.filter((t) => t.category === 'premium'),
    account: DASHBOARD_TABS.filter((t) => t.category === 'account'),
  }), [])

  const activeTabConfig = DASHBOARD_TABS.find((t) => t.id === activeTab)

  const getBadge = (id: TabType): number | undefined => {
    if (id === 'links') return links.length
    if (id === 'referrals') return referralCount
    if (id === 'badges') return userBadges.length
    return undefined
  }

  // ── Handlers ──
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
    setMobileOpen(false)
    void navigate({ to: '/profile', search: { tab } })
  }, [navigate])

  const copyBioUrl = useCallback(async () => {
    await navigator.clipboard.writeText(bioUrl)
    setCopiedBioUrl(true)
    setTimeout(() => setCopiedBioUrl(false), 2000)
  }, [bioUrl])

  const updateField: UpdateFieldFn = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }, [])

  const updateSocial = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, socials: { ...prev.socials, [key]: value } }))
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const pronounsToSave = formData.pronouns === 'custom' ? customPronouns : formData.pronouns
      await updateProfile({
        data: {
          name: formData.name || undefined,
          username: formData.username || undefined,
          bio: formData.bio || undefined,
          website: formData.website || undefined,
          location: formData.location || undefined,
          pronouns: pronounsToSave || undefined,
          birthday: formData.birthday || undefined,
          creatorTypes: formData.creatorTypes.length > 0 ? formData.creatorTypes : undefined,
          isPublic: formData.isPublic,
          showActivity: formData.showActivity,
          socials: Object.keys(formData.socials).length > 0 ? formData.socials : undefined,
        },
      })
      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError((error as { message?: string }).message || t('dashboard.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => { setHasChanges(false); window.location.reload() }

  // ── Sidebar content (shared desktop + mobile) ──
  const sidebarInner = (
    <>
      {/* User Card */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl shrink-0 bg-linear-to-br ${DT.accent} overflow-hidden ring-2 ring-primary/20`}
            style={{ background: avatar ? `url(${avatar}) center/cover` : undefined }}
          >
            {!avatar && (
              <div className="w-full h-full flex items-center justify-center font-bold text-base text-primary-foreground">
                {(currentUser.name || 'U').charAt(0)}
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {currentUser.name || 'Anonymous'}
              </p>
              <p className="text-xs text-muted-foreground truncate">@{currentUser.username}</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className={`flex-1 px-2.5 py-1.5 text-[11px] font-mono truncate ${DT.radiusXs} bg-background-secondary text-primary/80 border border-border/60`}>
              {getAppHostname()}/{currentUser.username}
            </div>
            <button onClick={copyBioUrl} className={`p-1.5 ${DT.radiusXs} bg-background-secondary hover:bg-card border border-border/40 theme-animation`}>
              {copiedBioUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-muted-foreground" />}
            </button>
            <button onClick={() => setShowQR(true)} className={`p-1.5 ${DT.radiusXs} bg-background-secondary hover:bg-card border border-border/40 theme-animation`}>
              <QrCode size={12} className="text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-px">
        <SectionLabel labelKey="dashboard.sidebar.dashboard" collapsed={collapsed} t={t} />
        {groupedTabs.main.map((tab) => (
          <NavItem key={tab.id} tab={tab} active={activeTab === tab.id} collapsed={collapsed} badge={getBadge(tab.id)} onClick={() => handleTabChange(tab.id)} t={t} />
        ))}

        <SectionLabel labelKey="dashboard.sidebar.premium" collapsed={collapsed} t={t} />
        {groupedTabs.premium.map((tab) => (
          <NavItem key={tab.id} tab={tab} active={activeTab === tab.id} collapsed={collapsed} onClick={() => handleTabChange(tab.id)} t={t} />
        ))}

        <SectionLabel labelKey="dashboard.sidebar.account" collapsed={collapsed} t={t} />
        {groupedTabs.account.map((tab) => (
          <NavItem key={tab.id} tab={tab} active={activeTab === tab.id} collapsed={collapsed} onClick={() => handleTabChange(tab.id)} t={t} />
        ))}

        {/* Quick Links — visually separated */}
        {!collapsed && <div className="mx-3 my-2 border-t border-border/30" />}
        <SectionLabel labelKey="dashboard.sidebar.quickLinks" collapsed={collapsed} t={t} />
        <div className={`${collapsed ? '' : 'mx-2 p-1.5 rounded-xl bg-background-secondary/50 border border-border/20 space-y-0.5'}`}>
          <SidebarLink to="/$username" params={{ username: currentUser.username }} icon={Globe} labelKey="dashboard.quickLinks.myBioPage" external collapsed={collapsed} t={t} />
          <SidebarLink to="/analytics" icon={BarChart3} labelKey="dashboard.quickLinks.analytics" collapsed={collapsed} t={t} />
          <SidebarLink to="/leaderboard" icon={TrendingUp} labelKey="dashboard.quickLinks.leaderboard" collapsed={collapsed} t={t} />
          <SidebarLink to="/playground" icon={Palette} labelKey="dashboard.quickLinks.playground" collapsed={collapsed} t={t} />
          <SidebarLink to="/theme-builder" icon={Paintbrush} labelKey="dashboard.quickLinks.themeBuilder" premium collapsed={collapsed} t={t} />
        </div>

        {(currentUser.role === 'admin' || currentUser.role === 'owner') && (
          <>
            {collapsed ? <div className="my-1.5 mx-2 border-t border-destructive/15" /> : (
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-destructive/50 flex items-center gap-1 select-none">
                <Crown size={9} />
                {t('dashboard.sidebar.admin')}
              </p>
            )}
            <Link
              to="/admin"
              className={`flex items-center gap-2.5 ${DT.radiusSm} theme-animation text-destructive/60 hover:text-destructive hover:bg-destructive/8 ${collapsed ? 'p-2 justify-center' : 'px-3 py-[7px]'}`}
            >
              <Shield size={14} className="shrink-0" />
              {!collapsed && <span className="text-[12px]">{t('dashboard.sidebar.adminPanel')}</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="hidden lg:flex p-3 border-t border-border/40">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center justify-center gap-2 py-2 ${DT.radiusSm} hover:bg-card/50 border border-transparent hover:border-border/30 theme-animation`}
        >
          {collapsed ? (
            <PanelLeft size={15} className="text-muted-foreground/50" />
          ) : (
            <>
              <ChevronLeft size={15} className="text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground/50 font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  )

  // ── Logo ──
  const logo = (compact: boolean) => (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className={`w-8 h-8 ${DT.radiusSm} overflow-hidden shrink-0 group-hover:glow-primary theme-animation`}>
        <img src="/icon.png" alt="Eziox" className="w-full h-full object-cover" loading="eager" />
      </div>
      {!compact && <span className="text-[15px] font-bold text-foreground tracking-tight">Eziox</span>}
    </Link>
  )

  // ── Render ──
  return (
    <div className={`h-screen flex ${DT.bg} overflow-hidden`}>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? DT.sidebarCollapsed : DT.sidebarWidth }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className={`hidden lg:flex flex-col shrink-0 border-r border-border/60 ${DT.sidebar}`}
      >
        <div className={`flex items-center h-14 border-b border-border/40 shrink-0 ${collapsed ? 'justify-center px-3' : 'px-4'}`}>
          {logo(collapsed)}
        </div>
        {sidebarInner}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -DT.sidebarWidth }}
              animate={{ x: 0 }}
              exit={{ x: -DT.sidebarWidth }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`fixed inset-y-0 left-0 z-50 flex flex-col ${DT.sidebar} border-r border-border/60 lg:hidden`}
              style={{ width: DT.sidebarWidth }}
            >
              <div className={`flex items-center justify-between h-14 px-4 border-b border-border/40 shrink-0`}>
                {logo(false)}
                <button onClick={() => setMobileOpen(false)} className={`p-1.5 ${DT.radiusSm} hover:bg-card/50 theme-animation`}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              {sidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className={`h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b ${DT.border} glass-strong`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className={`p-2 ${DT.radiusSm} hover:bg-card/50 theme-animation lg:hidden`}>
              <PanelLeft size={16} className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Home size={13} />
              <ChevronRight size={11} />
              <span className="text-[12px] font-medium text-foreground-muted">
                {activeTabConfig ? t(activeTabConfig.labelKey) : 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/$username"
              params={{ username: currentUser.username }}
              target="_blank"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 ${DT.radiusSm} text-[11px] font-medium text-muted-foreground hover:text-foreground-muted hover:bg-card/50 theme-animation`}
            >
              <ExternalLink size={11} />
              {t('dashboard.quickLinks.myBioPage')}
            </Link>
            <Link to="/" className={`p-2 ${DT.radiusSm} hover:bg-card/50 theme-animation`} title="Home">
              <Home size={14} className="text-muted-foreground/60" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-6 py-6 space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
              {STAT_CARDS.map((card) => (
                <StatCard
                  key={card.labelKey}
                  icon={card.icon}
                  label={t(card.labelKey)}
                  value={card.getValue(dashCtx)}
                  gradient={card.gradient}
                />
              ))}
            </motion.div>

            {/* Save Bar */}
            <SaveBar visible={hasChanges} saving={isSaving} onSave={handleSave} onCancel={handleCancel} t={t} />

            {/* Toasts */}
            <AnimatePresence mode="wait">
              {saveSuccess && <Toast key="success" type="success" message={t('dashboard.saved')} />}
              {saveError && <Toast key="error" type="error" message={saveError} />}
            </AnimatePresence>

            {/* Tab Content */}
            <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5 lg:p-6">
              <TabContent
                activeTab={activeTab}
                formData={formData}
                updateField={updateField}
                updateSocial={updateSocial}
                customPronouns={customPronouns}
                setCustomPronouns={setCustomPronouns}
                avatar={avatar}
                banner={banner}
                setAvatar={setAvatar}
                setBanner={setBanner}
                currentUser={currentUser}
                userBadges={userBadges}
                referralCount={referralCount}
              />
            </div>
          </div>
        </main>
      </div>

      {/* QR Modal */}
      <QrModal open={showQR} onClose={() => setShowQR(false)} bioUrl={bioUrl} username={currentUser.username} t={t} />
    </div>
  )
}

// ─── Loader ──────────────────────────────────────────────────────────────────

export function ProfileDashboardLoader() {
  return (
    <div className={`h-screen flex items-center justify-center ${DT.bg}`}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-10 h-10 rounded-full border-2 animate-spin border-border border-t-primary" />
        <p className={`text-[11px] mt-4 font-medium ${DT.textMuted}`}>Loading...</p>
      </motion.div>
    </div>
  )
}
