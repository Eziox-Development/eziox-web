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
  Users,
  Crown,
  Rocket,
  Star,
  Code2,
  Headphones,
  Gift,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'Features', href: '/about', icon: Sparkles },
    { label: 'Templates', href: '/templates', icon: Gift },
    { label: 'Changelog', href: '/changelog', icon: Star },
    { label: 'Playground', href: '/playground', icon: Palette },
  ],
  community: [
    { label: 'Creators', href: '/creators', icon: Users },
    { label: 'Partners', href: '/partners', icon: Shield },
    { label: 'Leaderboard', href: '/leaderboard', icon: TrendingUp },
  ],
  resources: [
    { label: 'About', href: '/about', icon: Globe },
    { label: 'Blog', href: '/blog', icon: Code2 },
    { label: 'Support', href: 'https://discord.com/invite/KD84DmNA89', icon: Headphones, external: true },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Imprint', href: '/imprint' },
    { label: 'Security', href: 'mailto:security@eziox.link' },
  ],
}

const features = [
  { icon: LinkIcon, label: 'Bio Links', color: '#8b5cf6' },
  { icon: BarChart3, label: 'Analytics', color: '#22c55e' },
  { icon: Palette, label: '31 Themes', color: '#f59e0b' },
  { icon: Shield, label: 'Secure', color: '#ef4444' },
  { icon: Headphones, label: 'Spotify', color: '#1db954' },
]

const socialLinks = [
  { icon: SiGithub, href: 'https://github.com/XSaitoKungX', label: 'GitHub', color: '#ffffff' },
  { icon: SiDiscord, href: 'https://discord.com/invite/KD84DmNA89', label: 'Discord', color: '#5865f2' },
]

const stats = [
  { label: 'Uptime', value: '99.9%' },
  { label: 'Response', value: '<100ms' },
  { label: 'Regions', value: 'Global' },
]

export function Footer() {
  const { theme, themes } = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Top Gradient Line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, ${theme.colors.accent}, ${theme.colors.primary}, transparent)` }}
      />

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-10"
          style={{ background: theme.colors.primary }}
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10"
          style={{ background: theme.colors.accent }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
          transition={{ duration: 30, repeat: Infinity }}
        />
      </div>

      {/* Newsletter Section */}
      <div className="relative" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 rounded-3xl"
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`, border: `1px solid ${theme.colors.primary}30` }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 10px 40px ${theme.colors.primary}40` }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Rocket size={32} className="text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: theme.colors.foreground }}>Ready to Get Started?</h3>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Create your free bio link page in seconds</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/sign-up">
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 4px 20px ${theme.colors.primary}40` }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Your Page
                  <ArrowUpRight size={18} />
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                  <ChevronRight size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative" style={{ background: theme.colors.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-6">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <motion.div
                  className="w-14 h-14 rounded-xl overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  style={{ boxShadow: `0 0 30px ${theme.colors.primary}40` }}
                >
                  <img src="/icon.png" alt={siteConfig.metadata.title} className="w-full h-full object-cover" />
                </motion.div>
                <div>
                  <span className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>
                    {siteConfig.metadata.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                      v2.0.0
                    </span>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      {themes.length} Themes
                    </span>
                  </div>
                </div>
              </Link>

              <p className="text-sm leading-relaxed max-w-sm" style={{ color: theme.colors.foregroundMuted }}>
                The modern bio link platform for creators, streamers, and businesses.
                Share everything you create with a single, beautiful link.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <motion.div
                    key={feature.label}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                    style={{ background: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}25` }}
                    whileHover={{ scale: 1.05, y: -1 }}
                  >
                    <feature.icon size={12} />
                    {feature.label}
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-2 pt-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl transition-all group"
                    style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                    whileHover={{ scale: 1.1, y: -2, borderColor: social.color }}
                    aria-label={social.label}
                  >
                    <social.icon size={20} style={{ color: theme.colors.foregroundMuted }} className="group-hover:text-white transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Product */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                  <Sparkles size={14} style={{ color: theme.colors.primary }} />
                  Product
                </h4>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="flex items-center gap-2 text-sm transition-all group"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        <link.icon size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                  <Users size={14} style={{ color: theme.colors.primary }} />
                  Community
                </h4>
                <ul className="space-y-3">
                  {footerLinks.community.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="flex items-center gap-2 text-sm transition-all group"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        <link.icon size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                  <Globe size={14} style={{ color: theme.colors.primary }} />
                  Resources
                </h4>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm transition-all group"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          <link.icon size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                          <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                          <ExternalLink size={10} className="opacity-50" />
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="flex items-center gap-2 text-sm transition-all group"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          <link.icon size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                          <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column - Stats & Contact */}
            <div className="lg:col-span-3 space-y-6">
              {/* Status Card */}
              <motion.div
                className="p-5 rounded-2xl"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>All Systems Operational</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-lg font-bold" style={{ color: theme.colors.primary }}>{stat.value}</p>
                      <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Info */}
              <div className="space-y-3">
                <motion.a
                  href="mailto:contact@eziox.link"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                  whileHover={{ scale: 1.02, x: 2 }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                    <Mail size={18} style={{ color: theme.colors.primary }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Email</p>
                    <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>contact@eziox.link</p>
                  </div>
                </motion.a>

                <motion.a
                  href="https://eziox.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                  whileHover={{ scale: 1.02, x: 2 }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                    <Globe size={18} style={{ color: theme.colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Website</p>
                    <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>eziox.link</p>
                  </div>
                  <ExternalLink size={14} style={{ color: theme.colors.foregroundMuted }} />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="py-6" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-xs transition-colors flex items-center gap-1 group"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {link.label}
                  <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs" style={{ color: theme.colors.foregroundMuted }}>
              <span>© {currentYear} {siteConfig.metadata.title}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                Germany
              </span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })} CET
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.foregroundMuted }}>
              <span>Made with</span>
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
                <Heart size={12} fill={theme.colors.primary} style={{ color: theme.colors.primary }} />
              </motion.span>
              <span>by</span>
              <motion.a
                href="https://github.com/XSaitoKungX"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold flex items-center gap-1"
                style={{ color: theme.colors.foreground }}
                whileHover={{ color: theme.colors.primary }}
              >
                <Crown size={12} style={{ color: '#f59e0b' }} />
                Saito
              </motion.a>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                <Zap size={10} style={{ color: theme.colors.accent }} />
                React 19
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
