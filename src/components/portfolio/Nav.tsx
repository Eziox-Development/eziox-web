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
  User,
  ChevronDown,
  Link as LinkIcon,
  Crown,
  ExternalLink,
  Home,
  Archive,
  Info,
  Users,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/changelog', label: 'Changelog', icon: Archive },
  { href: '/about', label: 'About', icon: Info },
  { href: '/leaderboard', label: 'Creators', icon: Users },
]

export function Nav() {
  const location = useLocation()
  const router = useRouter()
  const { currentUser, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isUserMenuOpen) return
    const handleClickOutside = () => setIsUserMenuOpen(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isUserMenuOpen])

  const handleSignOut = async () => {
    await signOut()
    await router.invalidate()
    setIsUserMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-3'
      }`}
      style={{
        backgroundColor: isScrolled
          ? 'rgba(var(--background-rgb, 0, 0, 0), 0.85)'
          : 'transparent',
        borderBottom: isScrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
      }}
    >
      {/* Gradient line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0, scaleX: isScrolled ? 1 : 0 }}
        style={{
          background: 'linear-gradient(90deg, var(--primary), var(--accent), var(--primary))',
          transformOrigin: 'center',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)' }}
            >
              <img
                src="/icon.png"
                alt={siteConfig.metadata.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                {siteConfig.metadata.title}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--primary)', color: 'white' }}>
                  BETA
                </span>
                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  Bio Link Platform
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <div
              className="flex items-center gap-1 px-2 py-1.5 rounded-full"
              style={{
                background: 'rgba(var(--background-rgb, 0, 0, 0), 0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
              }}
            >
              {navItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      color: isActive ? 'white' : 'var(--foreground-muted)',
                    }}
                  >
                    <item.icon size={16} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full -z-10"
                        style={{
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-2">
              {currentUser ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: isUserMenuOpen ? 'var(--primary)' : 'var(--background-secondary)',
                      border: '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                      color: isUserMenuOpen ? 'white' : 'var(--foreground)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden">
                      {currentUser.profile?.avatar ? (
                        <img 
                          src={currentUser.profile.avatar} 
                          alt={currentUser.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            color: 'white',
                          }}
                        >
                          {currentUser.name?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium max-w-[80px] truncate">
                      {currentUser.name || currentUser.email?.split('@')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden"
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        {/* User Info */}
                        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden">
                              {currentUser.profile?.avatar ? (
                                <img 
                                  src={currentUser.profile.avatar} 
                                  alt={currentUser.name || 'User'} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-lg font-bold"
                                  style={{
                                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                    color: 'white',
                                  }}
                                >
                                  {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                                {currentUser.name || 'User'}
                              </p>
                              <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>
                                {currentUser.email}
                              </p>
                            </div>
                          </div>
                          {/* Bio Link Preview */}
                          <div
                            className="mt-3 p-2 rounded-lg flex items-center justify-between"
                            style={{ background: 'var(--background-secondary)' }}
                          >
                            <span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>
                              eziox.link/{currentUser.username || 'username'}
                            </span>
                            <ExternalLink size={12} style={{ color: 'var(--foreground-muted)' }} />
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--background-secondary)]"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <User size={18} />
                            <span>Your Profile</span>
                          </Link>
                          <Link
                            to="/links"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--background-secondary)]"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <LinkIcon size={18} />
                            <span>Manage Links</span>
                          </Link>
                          <a
                            href={`/${currentUser.username || currentUser.email?.split('@')[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--background-secondary)]"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <ExternalLink size={18} />
                            <span>View Bio Page</span>
                          </a>
                        </div>

                        {/* Upgrade Banner */}
                        <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div
                            className="p-3 rounded-xl flex items-center gap-3"
                            style={{
                              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                              border: '1px solid rgba(99, 102, 241, 0.2)',
                            }}
                          >
                            <Crown size={20} style={{ color: 'var(--primary)' }} />
                            <div className="flex-1">
                              <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                                Upgrade to Premium
                              </p>
                              <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
                                Unlock all features
                              </p>
                            </div>
                            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                          </div>
                        </div>

                        {/* Sign Out */}
                        <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-500/10"
                            style={{ color: '#f87171' }}
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
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-[var(--background-secondary)]"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    <Sparkles size={14} />
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <ThemeSwitcher />

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl transition-all"
              style={{
                background: isMobileMenuOpen
                  ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                  : 'rgba(var(--background-rgb, 0, 0, 0), 0.4)',
                border: '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                color: isMobileMenuOpen ? 'white' : 'var(--foreground)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
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
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden"
            style={{
              background: 'var(--background)',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                          : 'var(--background-secondary)',
                        color: isActive ? 'white' : 'var(--foreground)',
                      }}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}

              {/* Mobile Auth */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.05 }}
                className="pt-4 mt-4 border-t space-y-2"
                style={{ borderColor: 'var(--border)' }}
              >
                {currentUser ? (
                  <>
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'var(--background-secondary)' }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                        style={{
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          color: 'white',
                        }}
                      >
                        {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                          {currentUser.name || 'User'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium"
                      style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
                    >
                      <User size={18} />
                      Your Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/sign-in"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium"
                      style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
                    >
                      <LogIn size={18} />
                      Sign In
                    </Link>
                    <Link
                      to="/sign-up"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        color: 'white',
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
