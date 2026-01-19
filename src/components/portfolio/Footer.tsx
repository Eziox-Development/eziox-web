import { Link } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'
import { motion } from 'motion/react'
import { useTheme } from './ThemeProvider'
import { SiGithub, SiDiscord } from 'react-icons/si'
import {
  Heart,
  Sparkles,
  Link as LinkIcon,
  BarChart3,
  Palette,
  Shield,
  Zap,
  Mail,
  ExternalLink,
  Users,
  Crown,
  Headphones,
  Rocket,
  BookOpen,
  Award,
  MapPin,
  Send,
  ArrowRight,
} from 'lucide-react'

interface FooterLink {
  label: string
  href: string
  description?: string
  external?: boolean
}

interface FooterSection {
  title: string
  icon: React.ElementType
  links: FooterLink[]
}

const footerSections: Record<string, FooterSection> = {
  platform: {
    title: 'Platform',
    icon: Rocket,
    links: [
      { label: 'Features', href: '/about', description: 'Explore all features' },
      { label: 'Templates', href: '/templates', description: 'Browse 31+ themes' },
      { label: 'Pricing', href: '/pricing', description: 'Plans for everyone' },
      { label: 'Changelog', href: '/changelog', description: 'Latest updates' },
      { label: 'Playground', href: '/playground', description: 'Try before signup' },
    ],
  },
  community: {
    title: 'Community',
    icon: Users,
    links: [
      { label: 'Creators', href: '/creators', description: 'Featured profiles' },
      { label: 'Partners', href: '/partners', description: 'Our partners' },
      { label: 'Leaderboard', href: '/leaderboard', description: 'Top creators' },
    ],
  },
  resources: {
    title: 'Resources',
    icon: BookOpen,
    links: [
      { label: 'Blog', href: '/blog', description: 'Tips & tutorials' },
      { label: 'Help Center', href: '/contact', description: 'Get support' },
      { label: 'Status', href: '/status', description: 'System status' },
    ],
  },
  company: {
    title: 'Company',
    icon: Award,
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Imprint', href: '/imprint' },
      { label: 'Security', href: 'mailto:security@eziox.link', external: true },
    ],
  },
}

const highlights = [
  { icon: LinkIcon, label: 'Bio Links', value: 'Unlimited', color: '#8b5cf6' },
  { icon: BarChart3, label: 'Analytics', value: 'Real-time', color: '#22c55e' },
  { icon: Palette, label: 'Themes', value: '31+', color: '#f59e0b' },
  { icon: Shield, label: 'Security', value: '2FA + SSL', color: '#ef4444' },
  { icon: Headphones, label: 'Spotify', value: 'Integration', color: '#1db954' },
  { icon: Zap, label: 'Performance', value: 'Optimized', color: '#3b82f6' },
]

const socialLinks = [
  { icon: SiGithub, href: 'https://github.com/XSaitoKungX', label: 'GitHub', color: '#ffffff' },
  { icon: SiDiscord, href: 'https://discord.com/invite/KD84DmNA89', label: 'Discord', color: '#5865f2' },
]

export function Footer() {
  const { theme, themes } = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Animated Top Border */}
      <div className="relative h-1 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent}, ${theme.colors.primary})`, backgroundSize: '200% 100%' }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${theme.colors.background}, ${theme.colors.card}20)` }} />
        <motion.div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[200px] opacity-20"
          style={{ background: theme.colors.primary }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 40, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full blur-[180px] opacity-15"
          style={{ background: theme.colors.accent }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 30, repeat: Infinity }}
        />
      </div>

      <div className="relative" style={{ background: theme.colors.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Highlights Bar */}
          <div className="py-8 overflow-hidden" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    <item.icon size={18} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: theme.colors.foreground }}>{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-6">
              <Link to="/" className="inline-flex items-center gap-4 group">
                <motion.div
                  className="relative w-16 h-16 rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  style={{ boxShadow: `0 0 40px ${theme.colors.primary}50` }}
                >
                  <img src="/icon.png" alt={siteConfig.metadata.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight" style={{ color: theme.colors.foreground }}>
                    {siteConfig.metadata.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                      v2.1.0
                    </span>
                    <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>
                      {themes.length} Themes
                    </span>
                  </div>
                </div>
              </Link>

              <p className="text-sm leading-relaxed" style={{ color: theme.colors.foregroundMuted }}>
                The next-generation bio link platform built for creators, streamers, and businesses. 
                Share your entire online presence with one beautiful, customizable link.
              </p>

              {/* Newsletter */}
              <div className="p-4 rounded-2xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                <p className="text-sm font-semibold mb-3" style={{ color: theme.colors.foreground }}>Stay Updated</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: theme.colors.background, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  />
                  <motion.button
                    className="px-4 py-2.5 rounded-xl font-medium text-white"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl group"
                    style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                    whileHover={{ scale: 1.05, y: -2, borderColor: social.color }}
                  >
                    <social.icon size={18} style={{ color: theme.colors.foregroundMuted }} className="group-hover:text-white transition-colors" />
                    <span className="text-xs font-medium hidden sm:inline" style={{ color: theme.colors.foregroundMuted }}>{social.label}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(footerSections).map(([key, section]) => (
                <div key={key} className="space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: theme.colors.foreground }}>
                    <section.icon size={14} style={{ color: theme.colors.primary }} />
                    {section.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm transition-all group"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <Link
                            to={link.href}
                            className="flex items-center gap-1 text-sm transition-all group"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                            <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Status & Contact */}
            <div className="lg:col-span-3 space-y-4">
              {/* Status Card */}
              <motion.div
                className="p-5 rounded-2xl"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                  </div>
                  <span className="text-sm font-bold" style={{ color: theme.colors.foreground }}>All Systems Operational</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg" style={{ background: theme.colors.background }}>
                    <p className="text-lg font-black" style={{ color: theme.colors.primary }}>✓</p>
                    <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>Secure</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: theme.colors.background }}>
                    <p className="text-lg font-black" style={{ color: theme.colors.accent }}>✓</p>
                    <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>Fast</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: theme.colors.background }}>
                    <p className="text-lg font-black" style={{ color: '#22c55e' }}>✓</p>
                    <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>Reliable</p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Cards */}
              <motion.a
                href="mailto:contact@eziox.link"
                className="flex items-center gap-3 p-4 rounded-xl group"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.02, x: 4 }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.accent}30)` }}>
                  <Mail size={20} style={{ color: theme.colors.primary }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: theme.colors.foregroundMuted }}>Contact</p>
                  <p className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>contact@eziox.link</p>
                </div>
              </motion.a>

              <motion.a
                href="https://discord.com/invite/KD84DmNA89"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl group"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ scale: 1.02, x: 4 }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(88, 101, 242, 0.2)' }}>
                  <SiDiscord size={20} style={{ color: '#5865f2' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: theme.colors.foregroundMuted }}>Support</p>
                  <p className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>Join Discord</p>
                </div>
                <ExternalLink size={14} style={{ color: theme.colors.foregroundMuted }} />
              </motion.a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-8" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                <span className="font-medium">© {currentYear} {siteConfig.metadata.title}. All rights reserved.</span>
                <span className="hidden lg:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  Made in Germany
                </span>
              </div>

              {/* Center - Made with love */}
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                <span>Crafted with</span>
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Heart size={14} fill={theme.colors.primary} style={{ color: theme.colors.primary }} />
                </motion.span>
                <span>by</span>
                <motion.a
                  href="https://github.com/XSaitoKungX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold flex items-center gap-1.5 px-2 py-1 rounded-lg"
                  style={{ background: theme.colors.card, color: theme.colors.foreground }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown size={12} style={{ color: '#f59e0b' }} />
                  Saito
                </motion.a>
              </div>

              {/* Right - Tech Stack */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Powered by</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                  <Zap size={12} style={{ color: '#61dafb' }} />
                  <span className="text-xs font-bold" style={{ color: theme.colors.foreground }}>React 19</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                  <Sparkles size={12} style={{ color: theme.colors.accent }} />
                  <span className="text-xs font-bold" style={{ color: theme.colors.foreground }}>TanStack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
