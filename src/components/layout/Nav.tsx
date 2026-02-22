import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { siteConfig } from '@/lib/site-config'
import { getAppHostname } from '@/lib/utils'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useTheme } from './ThemeProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { EmailVerificationIndicator } from '@/components/auth/EmailVerificationIndicator'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import type { TierType } from '@/server/lib/stripe'
import {
  Menu,
  X,
  Sparkles,
  LogIn,
  LogOut,
  ChevronDown,
  ChevronRight,
  Crown,
  ExternalLink,
  Home,
  Info,
  LayoutDashboard,
  Globe,
  Shield,
  Users,
  Handshake,
  Trophy,
  Zap,
  BarChart3,
  Star,
  Gem,
  CreditCard,
  Rocket,
  Gift,
  Palette,
  ArrowRight,
  Paintbrush,
  BookOpen,
} from 'lucide-react'

const NotificationBell = lazy(() =>
  import('@/components/notifications/NotificationBell').then((m) => ({
    default: m.NotificationBell,
  })),
)

const TIER_CONFIG: Record<
  TierType,
  {
    icon: React.ElementType
    color: string
    gradient: string
    name: string
    glow: string
  }
> = {
  free: {
    icon: Zap,
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
    name: 'Core',
    glow: '0 0 20px rgba(107, 114, 128, 0.3)',
  },
  pro: {
    icon: Star,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    name: 'Pro',
    glow: '0 0 20px rgba(59, 130, 246, 0.4)',
  },
  creator: {
    icon: Crown,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    name: 'Creator',
    glow: '0 0 20px rgba(245, 158, 11, 0.4)',
  },
  lifetime: {
    icon: Gem,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    name: 'Lifetime',
    glow: '0 0 20px rgba(236, 72, 153, 0.4)',
  },
}

// ─── Avatar Component ──────────────────────────────────────────────────────────

function UserAvatar({ src, fallback, size = 32, gradient }: { src?: string | null; fallback: string; size?: number; gradient: string }) {
  return (
    <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-white" style={{ background: gradient, fontSize: size * 0.35 }}>
          {fallback}
        </div>
      )}
    </div>
  )
}

// ─── Nav Component ─────────────────────────────────────────────────────────────

export function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const router = useRouter()
  const { theme } = useTheme()
  const { currentUser, signOut } = useAuth()

  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const communityRef = useRef<HTMLDivElement>(null)

  // ─── Data ──────────────────────────────────────────────────────────────────

  const NAV_ITEMS = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/docs', label: t('nav.docs'), icon: BookOpen },
    { href: '/pricing', label: t('nav.pricing'), icon: CreditCard },
    { href: '/about', label: t('nav.about'), icon: Info },
  ]

  const COMMUNITY_ITEMS = [
    { href: '/creators', label: t('nav.community.creators'), icon: Sparkles, description: t('nav.community.creatorsDesc'), color: '#8b5cf6' },
    { href: '/templates', label: t('nav.community.templates'), icon: Gift, description: t('nav.community.templatesDesc'), color: '#ec4899' },
    { href: '/partners', label: t('nav.community.partners'), icon: Handshake, description: t('nav.community.partnersDesc'), color: '#14b8a6' },
    { href: '/leaderboard', label: t('nav.community.leaderboard'), icon: Trophy, description: t('nav.community.leaderboardDesc'), color: '#f59e0b' },
  ]

  const QUICK_ACTIONS = [
    { href: '/profile', icon: LayoutDashboard, label: t('nav.dashboard'), color: '#6366f1' },
    { href: '/playground', icon: Palette, label: t('nav.playground'), color: '#ec4899' },
    { href: '/profile?tab=overview', icon: BarChart3, label: t('nav.analytics'), color: '#10b981' },
    { href: '/theme-builder', icon: Paintbrush, label: t('nav.themeBuilder'), color: '#f59e0b' },
  ]

  // ─── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setCommunityOpen(false)
  }, [location.pathname])

  // Click-outside for desktop dropdowns
  const closeDropdowns = useCallback((e: MouseEvent) => {
    if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    if (communityRef.current && !communityRef.current.contains(e.target as Node)) setCommunityOpen(false)
  }, [])

  useEffect(() => {
    if (!userMenuOpen && !communityOpen) return
    document.addEventListener('mousedown', closeDropdowns)
    return () => document.removeEventListener('mousedown', closeDropdowns)
  }, [userMenuOpen, communityOpen, closeDropdowns])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    await signOut()
    await router.invalidate()
    setUserMenuOpen(false)
    setMobileOpen(false)
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const userInitial = currentUser?.name?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U'
  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User'
  const bioLink = `${getAppHostname()}/${currentUser?.username || 'you'}`
  const isCommunityActive = COMMUNITY_ITEMS.some((i) => location.pathname === i.href)
  const userTier = (currentUser?.tier || 'free') as TierType
  const tierConfig = TIER_CONFIG[userTier] || TIER_CONFIG.free
  const TierIcon = tierConfig.icon

  const isActive = (href: string) => location.pathname === href

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Glass background */}
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: isScrolled
              ? `linear-gradient(180deg, ${theme.colors.background}f0, ${theme.colors.background}e0)`
              : 'transparent',
            backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
          }}
        />

        {/* Bottom gradient line */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.colors.primary}50, ${theme.colors.accent}50, transparent)`,
                transformOrigin: 'center',
              }}
            />
          )}
        </AnimatePresence>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* ── Logo ──────────────────────────────────────────────── */}
            <Link to="/" className="group flex items-center gap-2.5 flex-shrink-0">
              <motion.div
                className="relative w-9 h-9 rounded-xl overflow-hidden"
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                style={{ boxShadow: `0 4px 20px ${theme.colors.primary}30` }}
              >
                <img src="/icon.png" alt={siteConfig.metadata.title} className="w-full h-full object-cover" loading="eager" />
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-base font-extrabold bg-clip-text text-transparent leading-tight block" style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.foreground}, ${theme.colors.primary})` }}>
                  {siteConfig.metadata.title}
                </span>
                <span className="text-[9px] font-semibold tracking-widest uppercase block" style={{ color: theme.colors.foregroundMuted }}>
                  {t('nav.bioLinks')}
                </span>
              </div>
            </Link>

            {/* ── Desktop Center Nav ────────────────────────────────── */}
            <div className="hidden lg:flex items-center">
              <div
                className="flex items-center gap-0.5 px-1.5 py-1 rounded-full"
                style={{ background: `${theme.colors.card}60`, border: `1px solid ${theme.colors.border}30` }}
              >
                {/* Home */}
                {NAV_ITEMS.slice(0, 1).map((item) => (
                  <Link key={item.href} to={item.href} className="relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors" style={{ color: isActive(item.href) ? 'white' : theme.colors.foregroundMuted }}>
                    {isActive(item.href) && (
                      <motion.div layoutId="nav-active" className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} transition={{ type: 'spring' as const, stiffness: 500, damping: 35 }} />
                    )}
                    <span className="relative flex items-center gap-1.5"><item.icon size={15} />{item.label}</span>
                  </Link>
                ))}

                {/* Community Dropdown */}
                <div ref={communityRef} className="relative">
                  <button
                    onClick={() => setCommunityOpen(!communityOpen)}
                    className="relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5"
                    style={{ color: communityOpen || isCommunityActive ? 'white' : theme.colors.foregroundMuted }}
                  >
                    {(communityOpen || isCommunityActive) && (
                      <motion.div layoutId="nav-active" className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} transition={{ type: 'spring' as const, stiffness: 500, damping: 35 }} />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <Users size={15} />
                      {t('nav.community.title')}
                      <motion.span animate={{ rotate: communityOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={13} />
                      </motion.span>
                    </span>
                  </button>

                  <AnimatePresence>
                    {communityOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[340px] rounded-2xl overflow-hidden"
                        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.35)' }}
                      >
                        <div className="p-2">
                          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.foregroundMuted }}>
                            {t('nav.community.explore')}
                          </p>
                          {COMMUNITY_ITEMS.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:translate-x-0.5"
                              style={{ background: isActive(item.href) ? `${item.color}12` : 'transparent' }}
                            >
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${item.color}18` }}>
                                <item.icon size={17} style={{ color: item.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ color: isActive(item.href) ? item.color : theme.colors.foreground }}>{item.label}</p>
                                <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>{item.description}</p>
                              </div>
                              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: item.color }} />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Remaining Nav Items */}
                {NAV_ITEMS.slice(1).map((item) => (
                  <Link key={item.href} to={item.href} className="relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors" style={{ color: isActive(item.href) ? 'white' : theme.colors.foregroundMuted }}>
                    {isActive(item.href) && (
                      <motion.div layoutId="nav-active" className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} transition={{ type: 'spring' as const, stiffness: 500, damping: 35 }} />
                    )}
                    <span className="relative flex items-center gap-1.5"><item.icon size={15} />{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Right Side ────────────────────────────────────────── */}
            <div className="flex items-center gap-1.5">
              {/* Desktop Auth */}
              <div className="hidden lg:flex items-center gap-1.5">
                {currentUser ? (
                  <div ref={userMenuRef} className="relative">
                    {/* ── Trigger Button ── */}
                    <motion.button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all"
                      style={{
                        background: userMenuOpen ? tierConfig.gradient : `${theme.colors.card}90`,
                        border: `1px solid ${userMenuOpen ? 'transparent' : theme.colors.border}40`,
                        color: userMenuOpen ? 'white' : theme.colors.foreground,
                        boxShadow: userMenuOpen ? tierConfig.glow : 'none',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Avatar with tier ring */}
                      <div className="relative">
                        <UserAvatar src={currentUser.profile?.avatar} fallback={userInitial} size={30} gradient={tierConfig.gradient} />
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                          style={{ background: tierConfig.gradient, boxShadow: `0 0 0 2px ${userMenuOpen ? 'transparent' : theme.colors.card}` }}
                        >
                          <TierIcon size={8} className="text-white" />
                        </div>
                      </div>
                      <span className="hidden xl:block text-sm font-semibold truncate max-w-[90px]">{displayName}</span>
                      <motion.span animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={13} />
                      </motion.span>
                    </motion.button>

                    {/* ── Dropdown Panel ── */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.94 }}
                          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute right-0 top-full mt-3 w-[340px] rounded-2xl overflow-hidden"
                          style={{
                            background: theme.colors.card,
                            border: `1px solid ${theme.colors.border}`,
                            boxShadow: `0 32px 64px -16px rgba(0,0,0,0.4), 0 0 0 1px ${theme.colors.border}20`,
                          }}
                        >
                          {/* ── Banner + Avatar Header ── */}
                          <div className="relative">
                            {/* Banner */}
                            <div
                              className="h-[72px] w-full"
                              style={{
                                background: currentUser.profile?.banner
                                  ? `url(${currentUser.profile.banner}) center/cover no-repeat`
                                  : `linear-gradient(135deg, ${tierConfig.color}30, ${theme.colors.accent}20, ${theme.colors.primary}25)`,
                              }}
                            />
                            {/* Overlay fade */}
                            <div className="absolute inset-0 h-[72px]" style={{ background: `linear-gradient(to bottom, transparent 40%, ${theme.colors.card}cc)` }} />

                            {/* Avatar + close button row */}
                            <div className="absolute top-3 right-3">
                              <button
                                onClick={() => setUserMenuOpen(false)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-black/20"
                                style={{ color: 'rgba(255,255,255,0.7)' }}
                              >
                                <X size={13} />
                              </button>
                            </div>

                            {/* Avatar */}
                            <div className="absolute left-4" style={{ bottom: '-20px' }}>
                              <div
                                className="rounded-2xl overflow-hidden"
                                style={{
                                  width: 52,
                                  height: 52,
                                  boxShadow: `0 0 0 3px ${theme.colors.card}, ${tierConfig.glow}`,
                                }}
                              >
                                <UserAvatar src={currentUser.profile?.avatar} fallback={userInitial} size={52} gradient={tierConfig.gradient} />
                              </div>
                            </div>

                            {/* Tier badge top-right of avatar area */}
                            <div className="absolute right-4" style={{ bottom: '-16px' }}>
                              <div
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white"
                                style={{ background: tierConfig.gradient, boxShadow: tierConfig.glow, fontSize: 10, fontWeight: 700 }}
                              >
                                <TierIcon size={10} className="text-white" />
                                {tierConfig.name}
                              </div>
                            </div>
                          </div>

                          {/* ── Identity ── */}
                          <div className="px-4 pt-8 pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-extrabold text-base truncate leading-tight" style={{ color: theme.colors.foreground }}>{displayName}</p>
                                <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>@{currentUser.username}</p>
                              </div>
                            </div>

                            {/* Bio link pill */}
                            <a
                              href={`https://${bioLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg group transition-all hover:translate-x-0.5 w-fit max-w-full"
                              style={{ background: `${theme.colors.primary}10`, border: `1px solid ${theme.colors.primary}20` }}
                            >
                              <Globe size={12} style={{ color: theme.colors.primary }} />
                              <span className="text-[11px] font-mono truncate" style={{ color: theme.colors.primary }}>{bioLink}</span>
                              <ExternalLink size={10} className="opacity-50 group-hover:opacity-100 shrink-0" style={{ color: theme.colors.primary }} />
                            </a>
                          </div>

                          {/* ── Quick Actions Grid ── */}
                          <div className="px-3 pb-3" style={{ borderTop: `1px solid ${theme.colors.border}20` }}>
                            <p className="px-1 pt-2.5 pb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.foregroundMuted }}>
                              {t('nav.user.quickActions')}
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {QUICK_ACTIONS.map((action) => (
                                <a
                                  key={action.href}
                                  href={action.href}
                                  onClick={() => setUserMenuOpen(false)}
                                  className="group flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all hover:scale-[1.04] active:scale-95"
                                  style={{ background: `${action.color}12`, border: `1px solid ${action.color}20` }}
                                >
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{ background: `${action.color}20` }}
                                  >
                                    <action.icon size={20} style={{ color: action.color }} />
                                  </div>
                                  <span className="text-[10px] font-semibold leading-tight" style={{ color: theme.colors.foreground }}>{action.label}</span>
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* ── Menu Links ── */}
                          <div className="px-2 py-1" style={{ borderTop: `1px solid ${theme.colors.border}20` }}>
                            <a
                              href={`https://${bioLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all group hover:bg-white/5"
                            >
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${theme.colors.primary}12` }}>
                                <Globe size={14} style={{ color: theme.colors.primary }} />
                              </div>
                              <span className="text-sm flex-1" style={{ color: theme.colors.foreground }}>{t('nav.user.viewBioPage')}</span>
                              <ExternalLink size={12} className="opacity-30 group-hover:opacity-70" style={{ color: theme.colors.foregroundMuted }} />
                            </a>

                            {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
                              <Link
                                to="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all hover:bg-red-500/8"
                              >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.12)' }}>
                                  <Shield size={14} style={{ color: '#ef4444' }} />
                                </div>
                                <span className="text-sm" style={{ color: '#ef4444' }}>{t('nav.user.adminPanel')}</span>
                              </Link>
                            )}
                          </div>

                          {/* ── Upgrade CTA ── */}
                          {userTier !== 'lifetime' && userTier !== 'creator' && (
                            <div className="px-3 pb-3" style={{ borderTop: `1px solid ${theme.colors.border}20` }}>
                              <Link
                                to="/pricing"
                                onClick={() => setUserMenuOpen(false)}
                                className="mt-2 flex items-center gap-3 p-3 rounded-xl transition-all hover:brightness-110 active:scale-[0.99]"
                                style={{
                                  background: `linear-gradient(135deg, ${theme.colors.primary}18, ${theme.colors.accent}18)`,
                                  border: `1px solid ${theme.colors.primary}30`,
                                }}
                              >
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 4px 12px ${theme.colors.primary}40` }}
                                >
                                  <Rocket size={16} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold" style={{ color: theme.colors.foreground }}>{t('nav.user.upgradeToPro')}</p>
                                  <p className="text-[11px]" style={{ color: theme.colors.foregroundMuted }}>{t('nav.user.unlockFeatures')}</p>
                                </div>
                                <ArrowRight size={15} style={{ color: theme.colors.primary }} />
                              </Link>
                            </div>
                          )}

                          {/* ── Sign Out ── */}
                          <div className="px-2 py-2" style={{ borderTop: `1px solid ${theme.colors.border}20` }}>
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-500/8 active:scale-[0.99] group"
                              style={{ color: '#ef4444' }}
                            >
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-red-500/15" style={{ background: 'rgba(239,68,68,0.08)' }}>
                                <LogOut size={14} />
                              </div>
                              <span>{t('nav.signOut')}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Link to="/sign-in" className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-80" style={{ color: theme.colors.foreground }}>
                      {t('nav.signIn')}
                    </Link>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to="/sign-up"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 4px 20px ${theme.colors.primary}35` }}
                      >
                        <Sparkles size={14} />
                        {t('nav.getStarted')}
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Email Verification */}
              {currentUser && <EmailVerificationIndicator />}

              {/* Notifications */}
              {currentUser && (
                <Suspense fallback={null}>
                  <NotificationBell />
                </Suspense>
              )}

              {/* Language & Theme */}
              <div className="hidden sm:flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl"
                style={{
                  background: mobileOpen ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : `${theme.colors.card}90`,
                  border: `1px solid ${mobileOpen ? 'transparent' : theme.colors.border}40`,
                  color: mobileOpen ? 'white' : theme.colors.foreground,
                }}
                whileTap={{ scale: 0.92 }}
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[min(85vw,360px)] lg:hidden flex flex-col"
              style={{ background: theme.colors.background }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${theme.colors.border}30` }}>
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <img src="/icon.png" alt={siteConfig.metadata.title} className="w-8 h-8 rounded-lg" />
                  <span className="font-bold text-sm" style={{ color: theme.colors.foreground }}>{siteConfig.metadata.title}</span>
                </Link>
                <div className="flex items-center gap-1.5">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                  <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg" style={{ color: theme.colors.foregroundMuted }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-1">
                {/* User Card (if logged in) */}
                {currentUser && (
                  <div className="mb-4 p-3.5 rounded-2xl" style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}30` }}>
                    <div className="flex items-center gap-3">
                      <UserAvatar src={currentUser.profile?.avatar} fallback={userInitial} size={44} gradient={tierConfig.gradient} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: theme.colors.foreground }}>{displayName}</p>
                        <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>@{currentUser.username}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0" style={{ background: `${tierConfig.color}15` }}>
                        <TierIcon size={11} style={{ color: tierConfig.color }} />
                        <span className="text-[10px] font-bold" style={{ color: tierConfig.color }}>{tierConfig.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.foregroundMuted }}>
                  {t('nav.home')}
                </p>
                {NAV_ITEMS.map((item, i) => (
                  <motion.div key={item.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all active:scale-[0.98]"
                      style={{
                        background: isActive(item.href) ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : 'transparent',
                        color: isActive(item.href) ? 'white' : theme.colors.foreground,
                      }}
                    >
                      <item.icon size={18} />
                      {item.label}
                      {isActive(item.href) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
                    </Link>
                  </motion.div>
                ))}

                {/* Community */}
                <p className="px-2 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.foregroundMuted }}>
                  {t('nav.community.title')}
                </p>
                {COMMUNITY_ITEMS.map((item, i) => (
                  <motion.div key={item.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (NAV_ITEMS.length + i) * 0.04 }}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                      style={{ background: isActive(item.href) ? `${item.color}12` : 'transparent' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18` }}>
                        <item.icon size={16} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block" style={{ color: isActive(item.href) ? item.color : theme.colors.foreground }}>{item.label}</span>
                        <span className="text-[11px] truncate block" style={{ color: theme.colors.foregroundMuted }}>{item.description}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {/* Quick Actions (logged in) */}
                {currentUser && (
                  <>
                    <p className="px-2 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.foregroundMuted }}>
                      {t('nav.user.quickActions')}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <a
                          key={action.href}
                          href={action.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all active:scale-95"
                          style={{ background: `${action.color}12`, border: `1px solid ${action.color}20` }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${action.color}20` }}>
                            <action.icon size={19} style={{ color: action.color }} />
                          </div>
                          <span className="text-[10px] font-semibold leading-tight" style={{ color: theme.colors.foreground }}>{action.label}</span>
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="px-4 py-4 space-y-2" style={{ borderTop: `1px solid ${theme.colors.border}30` }}>
                {currentUser ? (
                  <>
                    {/* Upgrade CTA */}
                    {userTier !== 'lifetime' && userTier !== 'creator' && (
                      <Link
                        to="/pricing"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98]"
                        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}12, ${theme.colors.accent}12)`, border: `1px solid ${theme.colors.primary}25` }}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                          <Rocket size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{ color: theme.colors.foreground }}>{t('nav.user.upgradeToPro')}</p>
                          <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{t('nav.user.unlockFeatures')}</p>
                        </div>
                        <ArrowRight size={14} style={{ color: theme.colors.primary }} />
                      </Link>
                    )}

                    {/* Admin */}
                    {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors"
                        style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                      >
                        <Shield size={16} />
                        {t('nav.user.adminPanel')}
                      </Link>
                    )}

                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors active:scale-[0.98]"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
                    >
                      <LogOut size={16} />
                      {t('nav.signOut')}
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm active:scale-[0.98]"
                      style={{ background: `${theme.colors.card}80`, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}30` }}
                    >
                      <LogIn size={15} />
                      {t('nav.signIn')}
                    </Link>
                    <Link
                      to="/sign-up"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white active:scale-[0.98]"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                    >
                      <Sparkles size={15} />
                      {t('nav.signUp')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
