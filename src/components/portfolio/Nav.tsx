import { useState, useEffect } from 'react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Menu, X, Sparkles, LogIn, LogOut, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  // Close user menu when clicking outside
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
      style={{
        backgroundColor: isScrolled
          ? 'rgba(var(--background-rgb, 0, 0, 0), 0.8)'
          : 'transparent',
        borderBottom: isScrolled
          ? '1px solid var(--border)'
          : '1px solid transparent',
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
      }}
    >
      {/* Top gradient line when scrolled */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--primary), var(--accent), var(--primary), transparent)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between">
          {/* Logo / Site Title */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              className="relative w-11 h-11 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400 }}
              style={{
                boxShadow:
                  '0 0 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
              }}
            >
              <img
                src="/saito.png"
                alt={siteConfig.owner.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Shine effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <span
                className="text-lg font-bold block leading-tight"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {siteConfig.metadata.title}
              </span>
              <span
                className="text-xs font-medium"
                style={{
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Creative Developer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div
            className="hidden md:flex items-center gap-1 p-1.5 rounded-2xl"
            style={{
              backgroundColor: 'rgba(var(--background-rgb, 0, 0, 0), 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {siteConfig.navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                  style={{
                    color: isActive
                      ? 'var(--primary-foreground)'
                      : 'var(--foreground-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl -z-10"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--primary), var(--accent))',
                        boxShadow:
                          '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
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
          </div>

          {/* Right side: Auth + Theme Switcher + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Auth Section - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {currentUser ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300"
                    style={{
                      background: isUserMenuOpen
                        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                        : 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      color: isUserMenuOpen ? 'var(--primary-foreground)' : 'var(--foreground)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      <User size={14} />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {currentUser.name || currentUser.email?.split('@')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </motion.button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden"
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            {currentUser.name || 'User'}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>
                            {currentUser.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-500/10 text-red-400"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/sign-in"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                  }}
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              )}
            </div>

            <ThemeSwitcher />

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl transition-all duration-300"
              style={{
                background: isMobileMenuOpen
                  ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                  : 'var(--background-secondary)',
                border: '1px solid var(--border)',
                color: isMobileMenuOpen
                  ? 'var(--primary-foreground)'
                  : 'var(--foreground)',
                boxShadow: isMobileMenuOpen
                  ? '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)'
                  : 'none',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
            style={{
              backgroundColor: 'var(--background)',
              borderTop: '1px solid var(--border)',
            }}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at top right, var(--primary), transparent 50%)',
              }}
            />

            <div className="relative px-4 py-6 space-y-2">
              {siteConfig.navigation.map((item, index) => {
                const isActive = location.pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.08,
                      type: 'spring',
                      stiffness: 300,
                    }}
                  >
                    <Link
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                          : 'var(--background-secondary)',
                        color: isActive
                          ? 'var(--primary-foreground)'
                          : 'var(--foreground)',
                        fontFamily: 'var(--font-body)',
                        boxShadow: isActive
                          ? '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)'
                          : 'none',
                      }}
                    >
                      {isActive && <Sparkles size={16} />}
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}

              {/* Mobile Auth Section */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: siteConfig.navigation.length * 0.08,
                  type: 'spring',
                  stiffness: 300,
                }}
                className="pt-4 mt-4 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                {currentUser ? (
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'var(--background-secondary)' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                      >
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          {currentUser.name || 'User'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/sign-in"
                    className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      color: 'white',
                      boxShadow: '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                    }}
                  >
                    <LogIn size={18} />
                    Sign In
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
