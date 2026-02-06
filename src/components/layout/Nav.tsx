import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
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
  Link2,
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

export function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const router = useRouter()
  const { theme } = useTheme()
  const { currentUser, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false)

  const NAV_ITEMS = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/docs', label: t('nav.docs'), icon: BookOpen },
    { href: '/pricing', label: t('nav.pricing'), icon: CreditCard },
    { href: '/about', label: t('nav.about'), icon: Info },
  ]

  const COMMUNITY_ITEMS = [
    {
      href: '/creators',
      label: t('nav.community.creators'),
      icon: Sparkles,
      description: t('nav.community.creatorsDesc'),
      color: '#8b5cf6',
    },
    {
      href: '/templates',
      label: t('nav.community.templates'),
      icon: Gift,
      description: t('nav.community.templatesDesc'),
      color: '#ec4899',
    },
    {
      href: '/partners',
      label: t('nav.community.partners'),
      icon: Handshake,
      description: t('nav.community.partnersDesc'),
      color: '#14b8a6',
    },
    {
      href: '/leaderboard',
      label: t('nav.community.leaderboard'),
      icon: Trophy,
      description: t('nav.community.leaderboardDesc'),
      color: '#f59e0b',
    },
  ]

  const QUICK_ACTIONS = [
    { to: '/profile', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/playground', icon: Palette, label: t('nav.playground') },
    { to: '/theme-builder', icon: Paintbrush, label: t('nav.themeBuilder') },
    { to: '/shortener', icon: Link2, label: t('nav.urlShortener') },
    { to: '/analytics', icon: BarChart3, label: t('nav.analytics') },
  ]

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
    setIsCommunityMenuOpen(false)
  }, [location.pathname])

  const closeMenus = useCallback(() => {
    setIsUserMenuOpen(false)
    setIsCommunityMenuOpen(false)
  }, [])

  useEffect(() => {
    if (!isUserMenuOpen && !isCommunityMenuOpen) return
    document.addEventListener('click', closeMenus)
    return () => document.removeEventListener('click', closeMenus)
  }, [isUserMenuOpen, isCommunityMenuOpen, closeMenus])

  const handleSignOut = async () => {
    await signOut()
    await router.invalidate()
    setIsUserMenuOpen(false)
  }

  const userInitial =
    currentUser?.name?.charAt(0).toUpperCase() ||
    currentUser?.email?.charAt(0).toUpperCase() ||
    'U'
  const displayName =
    currentUser?.name || currentUser?.email?.split('@')[0] || 'User'
  const bioLink = `${getAppHostname()}/${currentUser?.username || 'you'}`
  const isCommunityActive = COMMUNITY_ITEMS.some(
    (i) => location.pathname === i.href,
  )

  const userTier = (currentUser?.tier || 'free') as TierType
  const tierConfig = TIER_CONFIG[userTier] || TIER_CONFIG.free
  const TierIcon = tierConfig.icon

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Background with aurora-tinted glass */}
      <motion.div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: isScrolled
            ? `linear-gradient(180deg, ${theme.colors.background}f5, ${theme.colors.background}e8)`
            : 'transparent',
          backdropFilter: isScrolled ? 'blur(24px) saturate(200%)' : 'none',
          borderBottom: isScrolled
            ? `1px solid ${theme.colors.border}20`
            : 'none',
        }}
      />

      {/* Aurora gradient line */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 h-1px"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${theme.colors.primary}60, ${theme.colors.accent}60, #ec489940, transparent 95%)`,
              transformOrigin: 'center',
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center justify-between transition-all duration-300"
          style={{ height: isScrolled ? '64px' : '72px' }}
        >
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: `0 4px 24px ${theme.colors.primary}35, 0 0 48px ${theme.colors.primary}15`,
              }}
            >
              <img
                src="/icon.png"
                alt={siteConfig.metadata.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Subtle glow ring */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: `inset 0 0 12px ${theme.colors.primary}40`,
                }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <span
                className="text-lg font-extrabold block bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.foreground}, ${theme.colors.primary})`,
                }}
              >
                {siteConfig.metadata.title}
              </span>
              <span
                className="text-[10px] font-medium tracking-wider uppercase"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('nav.bioLinks')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Main Nav Items */}
            <div
              className="flex items-center gap-1 px-2 py-1.5 rounded-full"
              style={{
                background: `${theme.colors.card}80`,
                border: `1px solid ${theme.colors.border}40`,
              }}
            >
              {NAV_ITEMS.slice(0, 1).map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? 'white' : theme.colors.foregroundMuted,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <item.icon size={16} />
                      {item.label}
                    </span>
                  </Link>
                )
              })}

              {/* Community Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsCommunityMenuOpen(!isCommunityMenuOpen)}
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                  style={{
                    color:
                      isCommunityMenuOpen || isCommunityActive
                        ? 'white'
                        : theme.colors.foregroundMuted,
                  }}
                >
                  {(isCommunityMenuOpen || isCommunityActive) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Users size={16} />
                    {t('nav.community.title')}
                    <motion.span
                      animate={{ rotate: isCommunityMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} />
                    </motion.span>
                  </span>
                </button>

                <AnimatePresence>
                  {isCommunityMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 w-72 rounded-2xl overflow-hidden"
                      style={{
                        background: theme.colors.card,
                        border: `1px solid ${theme.colors.border}`,
                        boxShadow: `0 20px 50px -10px rgba(0,0,0,0.4)`,
                      }}
                    >
                      <div className="p-2">
                        <p
                          className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {t('nav.community.explore')}
                        </p>
                        {COMMUNITY_ITEMS.map((item) => {
                          const isActive = location.pathname === item.href
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                              style={{
                                background: isActive
                                  ? `${item.color}15`
                                  : 'transparent',
                              }}
                            >
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ background: `${item.color}20` }}
                              >
                                <item.icon
                                  size={18}
                                  style={{ color: item.color }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium"
                                  style={{
                                    color: isActive
                                      ? item.color
                                      : theme.colors.foreground,
                                  }}
                                >
                                  {item.label}
                                </p>
                                <p
                                  className="text-xs truncate"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {item.description}
                                </p>
                              </div>
                              <ArrowRight
                                size={14}
                                className="opacity-0 group-hover:opacity-100"
                                style={{ color: item.color }}
                              />
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other Nav Items */}
              {NAV_ITEMS.slice(1).map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? 'white' : theme.colors.foregroundMuted,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill-2"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <item.icon size={16} />
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center gap-2">
              {currentUser ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
                    style={{
                      background: isUserMenuOpen
                        ? tierConfig.gradient
                        : theme.colors.card,
                      border: `1px solid ${isUserMenuOpen ? 'transparent' : theme.colors.border}`,
                      color: isUserMenuOpen ? 'white' : theme.colors.foreground,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden">
                      {currentUser.profile?.avatar ? (
                        <img
                          src={currentUser.profile.avatar}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: tierConfig.gradient }}
                        >
                          {userInitial}
                        </div>
                      )}
                    </div>
                    <div className="hidden xl:block text-left max-w-[100px]">
                      <p className="text-sm font-medium truncate leading-tight">
                        {displayName}
                      </p>
                      <p
                        className="text-[10px] leading-tight"
                        style={{
                          color: isUserMenuOpen
                            ? 'rgba(255,255,255,0.7)'
                            : theme.colors.foregroundMuted,
                        }}
                      >
                        {tierConfig.name}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className="transition-transform"
                      style={{
                        transform: isUserMenuOpen
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden"
                        style={{
                          background: theme.colors.card,
                          border: `1px solid ${theme.colors.border}`,
                          boxShadow: `0 20px 50px -10px rgba(0,0,0,0.4)`,
                        }}
                      >
                        {/* User Header */}
                        <div
                          className="p-4"
                          style={{
                            background: `linear-gradient(135deg, ${tierConfig.color}10, transparent)`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-14 h-14 rounded-xl overflow-hidden"
                              style={{ boxShadow: tierConfig.glow }}
                            >
                              {currentUser.profile?.avatar ? (
                                <img
                                  src={currentUser.profile.avatar}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                                  style={{ background: tierConfig.gradient }}
                                >
                                  {userInitial}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-bold truncate"
                                style={{ color: theme.colors.foreground }}
                              >
                                {displayName}
                              </p>
                              <p
                                className="text-sm truncate"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                @{currentUser.username}
                              </p>
                              <div
                                className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full"
                                style={{ background: `${tierConfig.color}20` }}
                              >
                                <TierIcon
                                  size={10}
                                  style={{ color: tierConfig.color }}
                                />
                                <span
                                  className="text-[10px] font-bold"
                                  style={{ color: tierConfig.color }}
                                >
                                  {tierConfig.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bio Link */}
                          <a
                            href={`https://${bioLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 p-2.5 rounded-lg flex items-center justify-between group"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Globe
                                size={14}
                                style={{ color: theme.colors.primary }}
                              />
                              <span
                                className="text-sm font-mono"
                                style={{ color: theme.colors.foreground }}
                              >
                                {bioLink}
                              </span>
                            </div>
                            <ExternalLink
                              size={12}
                              className="opacity-50 group-hover:opacity-100"
                              style={{ color: theme.colors.foregroundMuted }}
                            />
                          </a>
                        </div>

                        {/* Quick Actions */}
                        <div
                          className="p-3"
                          style={{
                            borderTop: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          <p
                            className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {t('nav.user.quickActions')}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {QUICK_ACTIONS.slice(0, 3).map((action) => (
                              <Link
                                key={action.to}
                                to={action.to}
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-colors"
                                style={{
                                  background: theme.colors.backgroundSecondary,
                                }}
                              >
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{
                                    background: `${theme.colors.primary}20`,
                                  }}
                                >
                                  <action.icon
                                    size={16}
                                    style={{ color: theme.colors.primary }}
                                  />
                                </div>
                                <span
                                  className="text-[11px] font-medium"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  {action.label}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Additional Links */}
                        <div
                          className="p-2"
                          style={{
                            borderTop: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          <a
                            href={`https://${bioLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                            style={{ color: theme.colors.foreground }}
                          >
                            <Globe
                              size={16}
                              style={{ color: theme.colors.foregroundMuted }}
                            />
                            <span>{t('nav.user.viewBioPage')}</span>
                            <ExternalLink
                              size={12}
                              className="ml-auto"
                              style={{ color: theme.colors.foregroundMuted }}
                            />
                          </a>
                          {(currentUser.role === 'owner' ||
                            currentUser.role === 'admin') && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                              style={{ color: '#ef4444' }}
                            >
                              <Shield size={16} />
                              <span>{t('nav.user.adminPanel')}</span>
                            </Link>
                          )}
                        </div>

                        {/* Upgrade CTA */}
                        {userTier !== 'lifetime' && userTier !== 'creator' && (
                          <div
                            className="p-3"
                            style={{
                              borderTop: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <Link
                              to="/pricing"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`,
                                border: `1px solid ${theme.colors.primary}30`,
                              }}
                            >
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                                }}
                              >
                                <Rocket size={18} className="text-white" />
                              </div>
                              <div className="flex-1">
                                <p
                                  className="text-sm font-bold"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  {t('nav.user.upgradeToPro')}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {t('nav.user.unlockFeatures')}
                                </p>
                              </div>
                              <ArrowRight
                                size={16}
                                style={{ color: theme.colors.primary }}
                              />
                            </Link>
                          </div>
                        )}

                        {/* Sign Out */}
                        <div
                          className="p-2"
                          style={{
                            borderTop: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-500/10"
                            style={{ color: '#ef4444' }}
                          >
                            <LogOut size={16} />
                            <span>{t('nav.signOut')}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/sign-in"
                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('nav.signIn')}
                  </Link>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/sign-up"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        boxShadow: `0 4px 24px ${theme.colors.primary}40, 0 0 48px ${theme.colors.primary}15`,
                      }}
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
            <LanguageSwitcher />
            <ThemeSwitcher />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{
                background: isMobileMenuOpen
                  ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                  : theme.colors.card,
                border: `1px solid ${isMobileMenuOpen ? 'transparent' : theme.colors.border}`,
                color: isMobileMenuOpen ? 'white' : theme.colors.foreground,
              }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden"
            style={{
              background: theme.colors.background,
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="px-4 py-4 space-y-2 max-h-[75vh] overflow-y-auto">
              {/* Main Nav */}
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                        : theme.colors.card,
                      color: isActive ? 'white' : theme.colors.foreground,
                    }}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                )
              })}

              {/* Community */}
              <div className="pt-2">
                <p
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {t('nav.community.title')}
                </p>
                {COMMUNITY_ITEMS.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: isActive
                          ? `${item.color}15`
                          : theme.colors.card,
                        color: isActive ? item.color : theme.colors.foreground,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${item.color}20` }}
                      >
                        <item.icon size={16} style={{ color: item.color }} />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* User Section */}
              <div
                className="pt-4 mt-2 space-y-2"
                style={{ borderTop: `1px solid ${theme.colors.border}` }}
              >
                {currentUser ? (
                  <>
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: theme.colors.card }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden"
                        style={{ boxShadow: tierConfig.glow }}
                      >
                        {currentUser.profile?.avatar ? (
                          <img
                            src={currentUser.profile.avatar}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-lg font-bold text-white"
                            style={{ background: tierConfig.gradient }}
                          >
                            {userInitial}
                          </div>
                        )}
                      </div>
                      <div>
                        <p
                          className="font-bold"
                          style={{ color: theme.colors.foreground }}
                        >
                          {displayName}
                        </p>
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                          style={{ background: `${tierConfig.color}20` }}
                        >
                          <TierIcon
                            size={10}
                            style={{ color: tierConfig.color }}
                          />
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: tierConfig.color }}
                          >
                            {tierConfig.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium"
                      style={{
                        background: theme.colors.card,
                        color: theme.colors.foreground,
                      }}
                    >
                      <LayoutDashboard size={18} />
                      {t('nav.dashboard')}
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                      }}
                    >
                      <LogOut size={18} />
                      {t('nav.signOut')}
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/sign-in"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium"
                      style={{
                        background: theme.colors.card,
                        color: theme.colors.foreground,
                      }}
                    >
                      <LogIn size={16} />
                      {t('nav.signIn')}
                    </Link>
                    <Link
                      to="/sign-up"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      }}
                    >
                      <Sparkles size={16} />
                      {t('nav.signUp')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
