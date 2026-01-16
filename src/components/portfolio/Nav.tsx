import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useTheme } from './ThemeProvider'
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
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/changelog', label: 'Updates', icon: FileText },
  { href: '/about', label: 'About', icon: Info },
] as const

const COMMUNITY_ITEMS = [
  { href: '/creators', label: 'Creators', icon: Sparkles, description: 'Discover amazing creators', color: '#8b5cf6' },
  { href: '/partners', label: 'Partners', icon: Handshake, description: 'Official platform partners', color: '#14b8a6' },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Top performing users', color: '#f59e0b' },
] as const

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

  const userInitial = currentUser?.name?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U'
  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User'
  const bioLink = `eziox.link/${currentUser?.username || 'you'}`
  const isCommunityActive = COMMUNITY_ITEMS.some(i => location.pathname === i.href)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        padding: isScrolled ? '0.5rem 0' : '0.75rem 0',
        backgroundColor: isScrolled ? `${theme.colors.background}e6` : 'transparent',
        borderBottom: isScrolled ? `1px solid ${theme.colors.border}` : '1px solid transparent',
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
      }}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isScrolled ? 1 : 0 }}
        style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, ${theme.colors.accent}, transparent)`, transformOrigin: 'center' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14">
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              style={{ boxShadow: `0 0 20px ${theme.colors.primary}40` }}
            >
              <img src="/icon.png" alt={siteConfig.metadata.title} className="w-full h-full object-cover" loading="eager" />
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)' }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight" style={{ color: theme.colors.foreground }}>
                {siteConfig.metadata.title}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                  BETA
                </span>
                <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Bio Links</span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center">
            <div
              className="flex items-center gap-0.5 p-1.5 rounded-2xl"
              style={{ background: `${theme.colors.background}80`, backdropFilter: 'blur(10px)', border: `1px solid ${theme.colors.border}20` }}
            >
              {NAV_ITEMS.slice(0, 1).map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: isActive ? 'white' : theme.colors.foregroundMuted }}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl -z-10"
                        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 4px 15px ${theme.colors.primary}50` }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                )
              })}

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  onClick={() => setIsCommunityMenuOpen(!isCommunityMenuOpen)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: isCommunityMenuOpen || isCommunityActive ? 'white' : theme.colors.foregroundMuted }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Users size={16} />
                  <span>Community</span>
                  <motion.div animate={{ rotate: isCommunityMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} />
                  </motion.div>
                  {(isCommunityMenuOpen || isCommunityActive) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl -z-10"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 4px 15px ${theme.colors.primary}50` }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
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
                      className="absolute left-0 top-full mt-3 w-72 rounded-2xl overflow-hidden"
                      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}
                    >
                      <div className="p-2">
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
                                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                                style={{ background: isActive ? `${item.color}15` : 'transparent' }}
                              >
                                <motion.div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                                  style={{ background: `${item.color}20` }}
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  <item.icon size={20} style={{ color: item.color }} />
                                </motion.div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold" style={{ color: isActive ? item.color : theme.colors.foreground }}>{item.label}</p>
                                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{item.description}</p>
                                </div>
                                <ChevronDown size={14} className="-rotate-90" style={{ color: theme.colors.foregroundMuted }} />
                              </Link>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {NAV_ITEMS.slice(1).map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: isActive ? 'white' : theme.colors.foregroundMuted }}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill-2"
                        className="absolute inset-0 rounded-xl -z-10"
                        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 4px 15px ${theme.colors.primary}50` }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              {currentUser ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
                    style={{
                      background: isUserMenuOpen ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      color: isUserMenuOpen ? 'white' : theme.colors.foreground,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden">
                      {currentUser.profile?.avatar ? (
                        <img src={currentUser.profile.avatar} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                          {userInitial}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">{displayName}</span>
                    <motion.div animate={{ rotate: isUserMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
                        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}
                      >
                        <div className="p-4" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                          <div className="flex items-center gap-3">
                            <motion.div
                              className="w-14 h-14 rounded-xl overflow-hidden"
                              style={{ boxShadow: `0 4px 12px ${theme.colors.primary}30` }}
                              whileHover={{ scale: 1.05 }}
                            >
                              {currentUser.profile?.avatar ? (
                                <img src={currentUser.profile.avatar} alt={displayName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                                  {userInitial}
                                </div>
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate" style={{ color: theme.colors.foreground }}>{displayName}</p>
                              <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>@{currentUser.username}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Zap size={10} style={{ color: theme.colors.primary }} />
                                <span className="text-[10px] font-medium" style={{ color: theme.colors.primary }}>Free Plan</span>
                              </div>
                            </div>
                          </div>
                          <motion.a
                            href={`https://${bioLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 p-3 rounded-xl flex items-center justify-between"
                            style={{ background: theme.colors.backgroundSecondary }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-xs font-mono" style={{ color: theme.colors.primary }}>{bioLink}</span>
                            <ExternalLink size={12} style={{ color: theme.colors.foregroundMuted }} />
                          </motion.a>
                        </div>

                        <div className="p-2">
                          {[
                            { to: '/profile', icon: LayoutDashboard, label: 'Dashboard', color: theme.colors.foregroundMuted },
                            { href: `https://${bioLink}`, icon: Globe, label: 'View Bio Page', external: true, color: theme.colors.foregroundMuted },
                            ...(currentUser.role === 'owner' || currentUser.role === 'admin' ? [{ to: '/admin', icon: Shield, label: 'Admin Panel', color: '#ef4444' }] : []),
                          ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                              {item.to ? (
                                <Link
                                  to={item.to}
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  <item.icon size={18} style={{ color: item.color }} />
                                  <span>{item.label}</span>
                                </Link>
                              ) : (
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  <item.icon size={18} style={{ color: item.color }} />
                                  <span>{item.label}</span>
                                  {item.external && <ExternalLink size={12} className="ml-auto" style={{ color: theme.colors.foregroundMuted }} />}
                                </a>
                              )}
                            </motion.div>
                          ))}
                        </div>

                        <div className="p-2" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                          <motion.div
                            className="p-3 rounded-xl flex items-center gap-3 cursor-pointer"
                            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`, border: `1px solid ${theme.colors.primary}30` }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <Crown size={18} style={{ color: theme.colors.primary }} />
                            <div className="flex-1">
                              <p className="text-xs font-bold" style={{ color: theme.colors.foreground }}>Upgrade to Pro</p>
                              <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>Unlock all features</p>
                            </div>
                            <Sparkles size={14} style={{ color: theme.colors.accent }} />
                          </motion.div>
                        </div>

                        <div className="p-2" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                          <motion.button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                            style={{ color: '#ef4444' }}
                            whileHover={{ background: 'rgba(239, 68, 68, 0.1)' }}
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
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{ color: theme.colors.foreground }}
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/sign-up"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 4px 20px ${theme.colors.primary}50` }}
                    >
                      <Sparkles size={14} />
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            <ThemeSwitcher />

            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl"
              style={{
                background: isMobileMenuOpen ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="lg:hidden overflow-hidden"
            style={{ background: theme.colors.background, borderTop: `1px solid ${theme.colors.border}` }}
          >
            <div className="px-4 py-5 space-y-2">
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
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium"
                      style={{
                        background: isActive ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : theme.colors.backgroundSecondary,
                        color: isActive ? 'white' : theme.colors.foreground,
                      }}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-1 pt-2"
              >
                <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.colors.foregroundMuted }}>Community</p>
                {COMMUNITY_ITEMS.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium"
                      style={{
                        background: isActive ? `${item.color}20` : theme.colors.backgroundSecondary,
                        color: isActive ? item.color : theme.colors.foreground,
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20` }}>
                        <item.icon size={18} style={{ color: item.color }} />
                      </div>
                      <div>
                        <span className="block text-sm">{item.label}</span>
                        <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{item.description}</span>
                      </div>
                    </Link>
                  )
                })}
              </motion.div>

              {NAV_ITEMS.slice(1).map((item, i) => {
                const isActive = location.pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (i + COMMUNITY_ITEMS.length + 1) * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium"
                      style={{
                        background: isActive ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : theme.colors.backgroundSecondary,
                        color: isActive ? 'white' : theme.colors.foreground,
                      }}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (NAV_ITEMS.length + COMMUNITY_ITEMS.length) * 0.05 }}
                className="pt-4 mt-4 space-y-2"
                style={{ borderTop: `1px solid ${theme.colors.border}` }}
              >
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden">
                        {currentUser.profile?.avatar ? (
                          <img src={currentUser.profile.avatar} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                            {userInitial}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: theme.colors.foreground }}>{displayName}</p>
                        <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>@{currentUser.username}</p>
                      </div>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}>
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/sign-in" className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}>
                      <LogIn size={18} />
                      Sign In
                    </Link>
                    <Link to="/sign-up" className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
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
