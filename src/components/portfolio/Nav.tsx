import { useState, useEffect } from 'react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'
import { ThemeSwitcher } from './ThemeSwitcher'
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
  Trophy,
  LayoutDashboard,
  Globe,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/leaderboard', label: 'Creators', icon: Trophy },
  { href: '/changelog', label: 'Updates', icon: FileText },
  { href: '/about', label: 'About', icon: Info },
] as const

export function Nav() {
  const location = useLocation()
  const router = useRouter()
  const { currentUser, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isUserMenuOpen) return
    const close = () => setIsUserMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [isUserMenuOpen])

  const handleSignOut = async () => {
    await signOut()
    await router.invalidate()
    setIsUserMenuOpen(false)
  }

  const userInitial = currentUser?.name?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U'
  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User'
  const bioLink = `eziox.link/${currentUser?.username || 'you'}`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`}
      style={{
        backgroundColor: isScrolled ? 'rgba(var(--background-rgb), 0.8)' : 'transparent',
        borderBottom: isScrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
      }}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isScrolled ? 1 : 0 }}
        style={{ background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)', transformOrigin: 'center' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14">
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              style={{ boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)' }}
            >
              <img src="/icon.png" alt={siteConfig.metadata.title} className="w-full h-full object-cover" loading="eager" />
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)' }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                {siteConfig.metadata.title}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white' }}>
                  BETA
                </span>
                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Bio Links</span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center">
            <div
              className="flex items-center gap-0.5 p-1.5 rounded-2xl"
              style={{ background: 'rgba(var(--background-rgb), 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(var(--border-rgb), 0.1)' }}
            >
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: isActive ? 'white' : 'var(--foreground-muted)' }}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl -z-10"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.4)' }}
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
                      background: isUserMenuOpen ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      color: isUserMenuOpen ? 'white' : 'var(--foreground)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden">
                      {currentUser.profile?.avatar ? (
                        <img src={currentUser.profile.avatar} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white' }}>
                          {userInitial}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                      >
                        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)' }}>
                              {currentUser.profile?.avatar ? (
                                <img src={currentUser.profile.avatar} alt={displayName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white' }}>
                                  {userInitial}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>{displayName}</p>
                              <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>@{currentUser.username}</p>
                            </div>
                          </div>
                          <a
                            href={`https://${bioLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 p-2.5 rounded-xl flex items-center justify-between group hover:scale-[1.02] transition-transform"
                            style={{ background: 'var(--background-secondary)' }}
                          >
                            <span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>{bioLink}</span>
                            <ExternalLink size={12} className="opacity-50 group-hover:opacity-100" style={{ color: 'var(--foreground-muted)' }} />
                          </a>
                        </div>

                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--background-secondary)]"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <LayoutDashboard size={18} style={{ color: 'var(--foreground-muted)' }} />
                            <span>Dashboard</span>
                          </Link>
                          <a
                            href={`https://${bioLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--background-secondary)]"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <Globe size={18} style={{ color: 'var(--foreground-muted)' }} />
                            <span>View Bio Page</span>
                            <ExternalLink size={12} className="ml-auto" style={{ color: 'var(--foreground-muted)' }} />
                          </a>
                        </div>

                        <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <div
                            className="p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform"
                            style={{ background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--accent-rgb), 0.1))', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}
                          >
                            <Crown size={18} style={{ color: 'var(--primary)' }} />
                            <div className="flex-1">
                              <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Go Premium</p>
                              <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>Unlock all features</p>
                            </div>
                            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                          </div>
                        </div>

                        <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-500/10"
                            style={{ color: '#ef4444' }}
                          >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-[var(--background-secondary)]"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/sign-up"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', boxShadow: '0 4px 20px rgba(var(--primary-rgb), 0.4)' }}
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
                background: isMobileMenuOpen ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--background-secondary)',
                border: '1px solid var(--border)',
                color: isMobileMenuOpen ? 'white' : 'var(--foreground)',
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
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden"
            style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}
          >
            <div className="px-4 py-5 space-y-2">
              {NAV_ITEMS.map((item, i) => {
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
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium"
                      style={{
                        background: isActive ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--background-secondary)',
                        color: isActive ? 'white' : 'var(--foreground)',
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
                transition={{ delay: NAV_ITEMS.length * 0.05 }}
                className="pt-4 mt-4 space-y-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden">
                        {currentUser.profile?.avatar ? (
                          <img src={currentUser.profile.avatar} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white' }}>
                            {userInitial}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{displayName}</p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>@{currentUser.username}</p>
                      </div>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}>
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/sign-in" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}>
                      <LogIn size={18} />
                      Sign In
                    </Link>
                    <Link to="/sign-up" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white' }}>
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
