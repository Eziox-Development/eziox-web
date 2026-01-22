import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useTheme } from './ThemeProvider'

const NotificationBell = lazy(() =>
  import('@/components/notifications/NotificationBell').then((m) => ({
    default: m.NotificationBell,
  })),
)
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
  FileText,
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
  Command,
  Paintbrush,
  Link2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import type { TierType } from '@/server/lib/stripe'

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

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/changelog', label: 'Updates', icon: FileText },
  { href: '/about', label: 'About', icon: Info },
] as const

const COMMUNITY_ITEMS = [
  {
    href: '/creators',
    label: 'Creators',
    icon: Sparkles,
    description: 'Discover amazing creators',
    color: '#8b5cf6',
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: Gift,
    description: 'Community style presets',
    color: '#ec4899',
  },
  {
    href: '/partners',
    label: 'Partners',
    icon: Handshake,
    description: 'Official platform partners',
    color: '#14b8a6',
  },
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    description: 'Top performing users',
    color: '#f59e0b',
  },
] as const

const QUICK_ACTIONS = [
  { to: '/profile', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'D' },
  { to: '/playground', icon: Palette, label: 'Playground', shortcut: 'P' },
  {
    to: '/theme-builder',
    icon: Paintbrush,
    label: 'Theme Builder',
    shortcut: 'T',
  },
  { to: '/shortener', icon: Link2, label: 'URL Shortener', shortcut: 'S' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', shortcut: 'A' },
]

export function Nav() {
  const location = useLocation()
  const router = useRouter()
  const { theme } = useTheme()
  const { currentUser, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false)

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
  const bioLink = `eziox.link/${currentUser?.username || 'you'}`
  const isCommunityActive = COMMUNITY_ITEMS.some(
    (i) => location.pathname === i.href,
  )

  const userTier = (currentUser?.tier || 'free') as TierType
  const tierConfig = TIER_CONFIG[userTier] || TIER_CONFIG.free
  const TierIcon = tierConfig.icon

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        padding: isScrolled ? '0.5rem 0' : '1rem 0',
      }}
    >
      {/* Glassmorphism Background */}
      <motion.div
        className="absolute inset-0 transition-all duration-500"
        initial={false}
        animate={{
          opacity: isScrolled ? 1 : 0,
          backdropFilter: isScrolled
            ? 'blur(20px) saturate(180%)'
            : 'blur(0px)',
        }}
        style={{
          background: isScrolled
            ? `${theme.colors.background}cc`
            : 'transparent',
          borderBottom: isScrolled
            ? `1px solid ${theme.colors.border}40`
            : 'none',
        }}
      />

      {/* Animated Top Line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: isScrolled ? 1 : 0, opacity: isScrolled ? 1 : 0 }}
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, ${theme.colors.accent}, ${theme.colors.primary}, transparent)`,
          transformOrigin: 'center',
        }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              className="relative w-11 h-11 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              style={{ boxShadow: `0 0 30px ${theme.colors.primary}50` }}
            >
              <img
                src="/icon.png"
                alt={siteConfig.metadata.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <motion.span
                className="text-xl font-bold tracking-tight block"
                style={{ color: theme.colors.foreground }}
                whileHover={{ color: theme.colors.primary }}
              >
                {siteConfig.metadata.title}
              </motion.span>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-medium"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Bio Links
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <motion.div
              className="flex items-center gap-1 p-1.5 rounded-2xl"
              style={{
                background: `${theme.colors.card}90`,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${theme.colors.border}50`,
                boxShadow: `0 4px 30px ${theme.colors.primary}10`,
              }}
            >
              {/* Home Link */}
              {NAV_ITEMS.slice(0, 1).map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? 'white' : theme.colors.foregroundMuted,
                    }}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-xl -z-10"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                          boxShadow: `0 4px 20px ${theme.colors.primary}60`,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                )
              })}

              {/* Community Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  onClick={() => setIsCommunityMenuOpen(!isCommunityMenuOpen)}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    color:
                      isCommunityMenuOpen || isCommunityActive
                        ? 'white'
                        : theme.colors.foregroundMuted,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Users size={16} />
                  <span>Community</span>
                  <motion.div
                    animate={{ rotate: isCommunityMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                  {(isCommunityMenuOpen || isCommunityActive) && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-xl -z-10"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        boxShadow: `0 4px 20px ${theme.colors.primary}60`,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>

                <AnimatePresence>
                  {isCommunityMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute left-0 top-full mt-3 w-80 rounded-2xl overflow-hidden"
                      style={{
                        background: theme.colors.card,
                        border: `1px solid ${theme.colors.border}`,
                        boxShadow: `0 25px 60px -12px rgba(0,0,0,0.5), 0 0 40px ${theme.colors.primary}15`,
                      }}
                    >
                      <div className="p-2">
                        <div className="px-3 py-2 mb-1">
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            Explore Community
                          </p>
                        </div>
                        {COMMUNITY_ITEMS.map((item, index) => {
                          const isActive = location.pathname === item.href
                          return (
                            <motion.div
                              key={item.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Link
                                to={item.href}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all group"
                                style={{
                                  background: isActive
                                    ? `${item.color}15`
                                    : 'transparent',
                                }}
                              >
                                <motion.div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                                  style={{
                                    background: `${item.color}20`,
                                    boxShadow: isActive
                                      ? `0 0 20px ${item.color}30`
                                      : 'none',
                                  }}
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  <item.icon
                                    size={20}
                                    style={{ color: item.color }}
                                  />
                                </motion.div>
                                <div className="flex-1">
                                  <p
                                    className="text-sm font-semibold"
                                    style={{
                                      color: isActive
                                        ? item.color
                                        : theme.colors.foreground,
                                    }}
                                  >
                                    {item.label}
                                  </p>
                                  <p
                                    className="text-xs"
                                    style={{
                                      color: theme.colors.foregroundMuted,
                                    }}
                                  >
                                    {item.description}
                                  </p>
                                </div>
                                <motion.div
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <ArrowRight
                                    size={14}
                                    style={{ color: item.color }}
                                  />
                                </motion.div>
                              </Link>
                            </motion.div>
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
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? 'white' : theme.colors.foregroundMuted,
                    }}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill-2"
                        className="absolute inset-0 rounded-xl -z-10"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                          boxShadow: `0 4px 20px ${theme.colors.primary}60`,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                )
              })}
            </motion.div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              {currentUser ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: isUserMenuOpen
                        ? tierConfig.gradient
                        : theme.colors.card,
                      border: `1px solid ${isUserMenuOpen ? 'transparent' : theme.colors.border}`,
                      color: isUserMenuOpen ? 'white' : theme.colors.foreground,
                      boxShadow: isUserMenuOpen ? tierConfig.glow : 'none',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
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
                      <motion.div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{
                          background: '#22c55e',
                          borderColor: theme.colors.card,
                        }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-semibold leading-tight max-w-[80px] truncate">
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
                    <motion.div
                      animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute right-0 top-full mt-3 w-80 rounded-2xl overflow-hidden"
                        style={{
                          background: theme.colors.card,
                          border: `1px solid ${theme.colors.border}`,
                          boxShadow: `0 25px 60px -12px rgba(0,0,0,0.5), 0 0 40px ${theme.colors.primary}15`,
                        }}
                      >
                        {/* User Header */}
                        <div
                          className="p-4"
                          style={{
                            background: `linear-gradient(135deg, ${tierConfig.color}10, transparent)`,
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <motion.div
                              className="relative w-16 h-16 rounded-xl overflow-hidden"
                              style={{ boxShadow: tierConfig.glow }}
                              whileHover={{ scale: 1.05 }}
                            >
                              {currentUser.profile?.avatar ? (
                                <img
                                  src={currentUser.profile.avatar}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                                  style={{ background: tierConfig.gradient }}
                                >
                                  {userInitial}
                                </div>
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-bold text-lg truncate"
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
                              <motion.div
                                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full"
                                style={{
                                  background: `${tierConfig.color}20`,
                                  boxShadow: `0 0 15px ${tierConfig.color}20`,
                                }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <TierIcon
                                  size={12}
                                  style={{ color: tierConfig.color }}
                                />
                                <span
                                  className="text-[11px] font-bold"
                                  style={{ color: tierConfig.color }}
                                >
                                  {tierConfig.name}
                                </span>
                              </motion.div>
                            </div>
                          </div>

                          {/* Bio Link */}
                          <motion.a
                            href={`https://${bioLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 p-3 rounded-xl flex items-center justify-between group"
                            style={{
                              background: theme.colors.backgroundSecondary,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                            whileHover={{
                              scale: 1.02,
                              borderColor: theme.colors.primary,
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
                              className="opacity-50 group-hover:opacity-100 transition-opacity"
                              style={{ color: theme.colors.foregroundMuted }}
                            />
                          </motion.a>
                        </div>

                        {/* Quick Actions */}
                        <div
                          className="p-2"
                          style={{
                            borderTop: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          <div className="px-3 py-2">
                            <p
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: theme.colors.foregroundMuted }}
                            >
                              Quick Actions
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 px-2">
                            {QUICK_ACTIONS.map((action, i) => (
                              <motion.div
                                key={action.to}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <Link
                                  to={action.to}
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-center group"
                                  style={{
                                    background:
                                      theme.colors.backgroundSecondary,
                                  }}
                                >
                                  <motion.div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{
                                      background: `${theme.colors.primary}20`,
                                    }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                  >
                                    <action.icon
                                      size={18}
                                      style={{ color: theme.colors.primary }}
                                    />
                                  </motion.div>
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: theme.colors.foreground }}
                                  >
                                    {action.label}
                                  </span>
                                  <span
                                    className="text-[9px] px-1.5 py-0.5 rounded"
                                    style={{
                                      background: theme.colors.card,
                                      color: theme.colors.foregroundMuted,
                                    }}
                                  >
                                    <Command
                                      size={8}
                                      className="inline mr-0.5"
                                    />
                                    {action.shortcut}
                                  </span>
                                </Link>
                              </motion.div>
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
                          {[
                            {
                              href: `https://${bioLink}`,
                              icon: Globe,
                              label: 'View Bio Page',
                              external: true,
                            },
                            ...(currentUser.role === 'owner' ||
                            currentUser.role === 'admin'
                              ? [
                                  {
                                    to: '/admin',
                                    icon: Shield,
                                    label: 'Admin Panel',
                                    color: '#ef4444',
                                  },
                                ]
                              : []),
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                            >
                              {'to' in item ? (
                                <Link
                                  to={item.to}
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
                                  style={{
                                    color:
                                      item.color || theme.colors.foreground,
                                  }}
                                >
                                  <item.icon
                                    size={18}
                                    style={{
                                      color:
                                        item.color ||
                                        theme.colors.foregroundMuted,
                                    }}
                                  />
                                  <span>{item.label}</span>
                                </Link>
                              ) : (
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  <item.icon
                                    size={18}
                                    style={{
                                      color: theme.colors.foregroundMuted,
                                    }}
                                  />
                                  <span>{item.label}</span>
                                  <ExternalLink
                                    size={12}
                                    className="ml-auto"
                                    style={{
                                      color: theme.colors.foregroundMuted,
                                    }}
                                  />
                                </a>
                              )}
                            </motion.div>
                          ))}
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
                            >
                              <motion.div
                                className="p-4 rounded-xl flex items-center gap-4"
                                style={{
                                  background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`,
                                  border: `1px solid ${theme.colors.primary}30`,
                                }}
                                whileHover={{
                                  scale: 1.02,
                                  background: `linear-gradient(135deg, ${theme.colors.primary}25, ${theme.colors.accent}25)`,
                                }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <motion.div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                                  style={{
                                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                                  }}
                                  whileHover={{ rotate: 10 }}
                                >
                                  <Rocket size={20} className="text-white" />
                                </motion.div>
                                <div className="flex-1">
                                  <p
                                    className="font-bold"
                                    style={{ color: theme.colors.foreground }}
                                  >
                                    Upgrade to Pro
                                  </p>
                                  <p
                                    className="text-xs"
                                    style={{
                                      color: theme.colors.foregroundMuted,
                                    }}
                                  >
                                    Unlock all premium features
                                  </p>
                                </div>
                                <ArrowRight
                                  size={16}
                                  style={{ color: theme.colors.primary }}
                                />
                              </motion.div>
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
                          <motion.button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                            style={{ color: '#ef4444' }}
                            whileHover={{
                              background: 'rgba(239, 68, 68, 0.1)',
                            }}
                          >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ color: theme.colors.foreground }}
                  >
                    <LogIn size={16} />
                    Sign In
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to="/sign-up"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        boxShadow: `0 4px 25px ${theme.colors.primary}50`,
                      }}
                    >
                      <Sparkles size={16} />
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            {currentUser && (
              <Suspense fallback={null}>
                <NotificationBell />
              </Suspense>
            )}

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl"
              style={{
                background: isMobileMenuOpen
                  ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                  : theme.colors.card,
                border: `1px solid ${isMobileMenuOpen ? 'transparent' : theme.colors.border}`,
                color: isMobileMenuOpen ? 'white' : theme.colors.foreground,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
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
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="lg:hidden overflow-hidden"
            style={{
              background: theme.colors.background,
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="px-4 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
              {/* Main Nav Items */}
              {NAV_ITEMS.slice(0, 1).map((item, i) => {
                const isActive = location.pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-4 rounded-xl font-medium"
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                          : theme.colors.card,
                        color: isActive ? 'white' : theme.colors.foreground,
                        boxShadow: isActive
                          ? `0 4px 20px ${theme.colors.primary}40`
                          : 'none',
                      }}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}

              {/* Community Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="pt-4"
              >
                <p
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Community
                </p>
                <div className="space-y-1">
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
                          color: isActive
                            ? item.color
                            : theme.colors.foreground,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: `${item.color}20` }}
                        >
                          <item.icon size={18} style={{ color: item.color }} />
                        </div>
                        <div>
                          <span className="block text-sm font-medium">
                            {item.label}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>

              {/* Other Nav Items */}
              {NAV_ITEMS.slice(1).map((item, i) => {
                const isActive = location.pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (i + COMMUNITY_ITEMS.length + 2) * 0.05,
                    }}
                  >
                    <Link
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-4 rounded-xl font-medium"
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                          : theme.colors.card,
                        color: isActive ? 'white' : theme.colors.foreground,
                        boxShadow: isActive
                          ? `0 4px 20px ${theme.colors.primary}40`
                          : 'none',
                      }}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}

              {/* User Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-6 mt-4 space-y-3"
                style={{ borderTop: `1px solid ${theme.colors.border}` }}
              >
                {currentUser ? (
                  <>
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: theme.colors.card }}
                    >
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
                      <div>
                        <p
                          className="font-bold"
                          style={{ color: theme.colors.foreground }}
                        >
                          {displayName}
                        </p>
                        <p
                          className="text-sm"
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

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-4 rounded-xl font-medium"
                      style={{
                        background: theme.colors.card,
                        color: theme.colors.foreground,
                      }}
                    >
                      <LayoutDashboard size={20} />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-medium"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                      }}
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/sign-in"
                      className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium"
                      style={{
                        background: theme.colors.card,
                        color: theme.colors.foreground,
                      }}
                    >
                      <LogIn size={18} />
                      Sign In
                    </Link>
                    <Link
                      to="/sign-up"
                      className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        boxShadow: `0 4px 20px ${theme.colors.primary}40`,
                      }}
                    >
                      <Sparkles size={18} />
                      Sign Up
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
