import { Link } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'
import { motion } from 'motion/react'
import { useTheme } from './ThemeProvider'
import { SiGithub, SiDiscord } from 'react-icons/si'
import {
  Heart,
  Sparkles,
  ArrowUpRight,
  Link as LinkIcon,
  BarChart3,
  Palette,
  Shield,
  Zap,
  Globe,
  Mail,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'Changelog', href: '/changelog', icon: Sparkles },
    { label: 'Creators', href: '/creators', icon: Globe },
    { label: 'Partners', href: '/partners', icon: Shield },
    { label: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
  ],
  legal: [
    { label: 'About', href: '/about' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ],
}

const features = [
  { icon: LinkIcon, label: 'Bio Links', color: '#6366f1' },
  { icon: BarChart3, label: 'Analytics', color: '#22c55e' },
  { icon: Palette, label: 'Themes', color: '#f59e0b' },
  { icon: Shield, label: 'Secure', color: '#ef4444' },
]

const socialLinks = [
  { icon: SiGithub, href: 'https://github.com/XSaitoKungX', label: 'GitHub' },
  { icon: SiDiscord, href: 'https://discord.com/invite/KD84DmNA89', label: 'Discord' },
]

export function Footer() {
  const { theme, themes } = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto overflow-hidden" style={{ background: theme.colors.backgroundSecondary }}>
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, ${theme.colors.accent}, ${theme.colors.primary}, transparent)` }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10"
          style={{ background: theme.colors.primary }}
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
          style={{ background: theme.colors.accent }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 rounded-xl overflow-hidden"
                whileHover={{ scale: 1.05, rotate: 2 }}
                style={{ boxShadow: `0 0 25px ${theme.colors.primary}40` }}
              >
                <img src="/icon.png" alt={siteConfig.metadata.title} className="w-full h-full object-cover" />
              </motion.div>
              <div>
                <span className="text-xl font-bold" style={{ color: theme.colors.foreground }}>
                  {siteConfig.metadata.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                    v1.5.0
                  </span>
                  <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    {themes.length} Themes
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed max-w-md" style={{ color: theme.colors.foregroundMuted }}>
              Create your personalized bio link page and share everything you create with a single link.
              Free to start, powerful to grow.
            </p>

            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <motion.div
                  key={feature.label}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}30` }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <feature.icon size={12} />
                  {feature.label}
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl transition-all"
                  style={{ background: theme.colors.background, border: `1px solid ${theme.colors.border}`, color: theme.colors.foregroundMuted }}
                  whileHover={{ scale: 1.1, y: -2, color: theme.colors.primary }}
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold" style={{ color: theme.colors.foreground }}>Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="flex items-center gap-2 text-sm transition-all group"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      <link.icon size={14} className="transition-colors" style={{ color: theme.colors.foregroundMuted }} />
                      <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold" style={{ color: theme.colors.foreground }}>Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm transition-all inline-flex items-center gap-1 group"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <motion.div
              className="p-5 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`, border: `1px solid ${theme.colors.primary}30` }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm" style={{ color: theme.colors.foreground }}>Get Started Free</h4>
                  <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>No credit card required</p>
                </div>
              </div>
              <Link to="/sign-up">
                <motion.button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 4px 20px ${theme.colors.primary}40` }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Your Page
                  <ArrowUpRight size={16} />
                </motion.button>
              </Link>
            </motion.div>

            <div className="space-y-2">
              <motion.a
                href="mailto:contact@eziox.link"
                className="flex items-center gap-2 text-sm p-2 rounded-lg transition-all"
                style={{ color: theme.colors.foregroundMuted }}
                whileHover={{ x: 2 }}
              >
                <Mail size={14} style={{ color: theme.colors.primary }} />
                <span>contact@eziox.link</span>
              </motion.a>
              <motion.a
                href="https://eziox.link"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm p-2 rounded-lg transition-all"
                style={{ color: theme.colors.foregroundMuted }}
                whileHover={{ x: 2 }}
              >
                <Globe size={14} style={{ color: theme.colors.primary }} />
                <span>eziox.link</span>
                <ExternalLink size={10} />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs" style={{ color: theme.colors.foregroundMuted }}>
            <span>© {currentYear} {siteConfig.metadata.title}</span>
            <span className="hidden md:inline">•</span>
            <Link to="/privacy" className="transition-colors flex items-center gap-1 group">
              Privacy
              <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <span className="hidden md:inline">•</span>
            <Link to="/terms" className="transition-colors flex items-center gap-1 group">
              Terms
              <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <span className="hidden md:inline">•</span>
            <Link to="/cookies" className="transition-colors flex items-center gap-1 group">
              Cookies
              <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: theme.colors.foregroundMuted }}>
            <span>Made with</span>
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
              <Heart size={12} fill={theme.colors.primary} style={{ color: theme.colors.primary }} />
            </motion.span>
            <span>by</span>
            <motion.a
              href="https://github.com/XSaitoKungX"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-colors"
              style={{ color: theme.colors.foreground }}
              whileHover={{ color: theme.colors.primary }}
            >
              Saito
            </motion.a>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: theme.colors.background }}>
              <Zap size={10} style={{ color: theme.colors.accent }} />
              React 19
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
