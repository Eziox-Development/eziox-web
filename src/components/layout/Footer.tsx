import { Link } from '@tanstack/react-router'
import { hexToRgb } from '@/lib/utils'
import { siteConfig } from '@/lib/site-config'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './ThemeProvider'
import { SiDiscord, SiGithub } from 'react-icons/si'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPlatformStatsFn } from '@/server/functions/stats'
import {
  Heart,
  Link as LinkIcon,
  Mail,
  ExternalLink,
  Users,
  Crown,
  Rocket,
  BookOpen,
  Scale,
  MapPin,
  ArrowRight,
  MousePointerClick,
  Eye,
  Sparkles,
} from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()
  const { theme, themes } = useTheme()
  const currentYear = new Date().getFullYear()
  const getStats = useServerFn(getPlatformStatsFn)

  const { data: stats } = useQuery({
    queryKey: ['footer-stats'],
    queryFn: () => getStats(),
    staleTime: 60000,
    refetchInterval: 60000,
  })

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const footerSections = [
    {
      key: 'platform',
      title: t('footer.platform.title'),
      icon: Rocket,
      links: [
        { label: t('footer.platform.features'), href: '/about' },
        { label: t('footer.platform.templates'), href: '/templates' },
        { label: t('footer.platform.pricing'), href: '/pricing' },
        { label: t('footer.platform.playground'), href: '/playground' },
      ],
    },
    {
      key: 'community',
      title: t('footer.community.title'),
      icon: Users,
      links: [
        { label: t('footer.community.creators'), href: '/creators' },
        { label: t('footer.community.partners'), href: '/partners' },
        { label: t('footer.community.leaderboard'), href: '/leaderboard' },
      ],
    },
    {
      key: 'resources',
      title: t('footer.resources.title'),
      icon: BookOpen,
      links: [
        { label: t('footer.resources.docs'), href: '/docs' },
        { label: t('footer.resources.helpCenter'), href: '/support' },
        { label: t('footer.resources.status'), href: '/status' },
      ],
    },
    {
      key: 'legal',
      title: t('footer.legal.title'),
      icon: Scale,
      links: [
        { label: t('footer.legal.privacy'), href: '/privacy' },
        { label: t('footer.legal.terms'), href: '/terms' },
        { label: t('footer.legal.cancellation'), href: '/widerruf' },
        { label: t('footer.legal.imprint'), href: '/imprint' },
        { label: t('footer.legal.takedown'), href: '/takedown' },
        { label: t('footer.legal.licensing'), href: '/licensing' },
      ],
    },
  ]

  const liveStats = [
    {
      icon: Users,
      label: t('footer.stats.creators'),
      value: stats?.totalUsers ?? 0,
      color: theme.colors.primary,
    },
    {
      icon: MousePointerClick,
      label: t('footer.stats.clicks'),
      value: stats?.totalClicks ?? 0,
      color: theme.colors.accent,
    },
    {
      icon: Eye,
      label: t('footer.stats.views'),
      value: stats?.totalViews ?? 0,
      color: '#22c55e',
    },
    {
      icon: LinkIcon,
      label: t('footer.stats.links'),
      value: stats?.totalLinks ?? 0,
      color: '#f59e0b',
    },
  ]

  return (
    <footer className="relative mt-auto">
      {/* Aurora Gradient Divider */}
      <div className="h-1px w-full">
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(90deg, transparent 5%, ${theme.colors.primary}60, ${theme.colors.accent}60, #ec489940, transparent 95%)`,
          }}
        />
      </div>

      {/* Main Footer */}
      <div className="relative" style={{ background: theme.colors.background }}>
        {/* Aurora Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.08]"
            style={{ background: theme.colors.primary }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.06]"
            style={{ background: theme.colors.accent }}
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Top Section - Stats Banner */}
          <div
            className="py-10 border-b"
            style={{ borderColor: `${theme.colors.border}60` }}
          >
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10">
              {liveStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 px-5 py-3 rounded-2xl"
                  style={{
                    background: `${theme.colors.card}80`,
                    border: `1px solid ${theme.colors.border}40`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: `rgba(${hexToRgb(stat.color)}, 0.15)`,
                      boxShadow: `0 0 20px rgba(${hexToRgb(stat.color)}, 0.1)`,
                    }}
                  >
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p
                      className="text-2xl font-extrabold tracking-tight"
                      style={{ color: theme.colors.foreground }}
                    >
                      {formatNumber(stat.value)}
                    </p>
                    <p
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Middle Section - Main Content */}
          <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Logo & Name */}
              <Link to="/" className="inline-flex items-center gap-4 group">
                <motion.div
                  className="relative w-14 h-14 rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  style={{
                    boxShadow: `0 4px 30px rgba(${hexToRgb(theme.colors.primary)}, 0.3), 0 0 60px rgba(${hexToRgb(theme.colors.primary)}, 0.1)`,
                  }}
                >
                  <img
                    src="/icon.png"
                    alt={siteConfig.metadata.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div>
                  <h3
                    className="text-2xl font-extrabold bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${theme.colors.foreground}, ${theme.colors.primary})`,
                    }}
                  >
                    {siteConfig.metadata.title}
                  </h3>
                  <p
                    className="text-sm flex items-center gap-1.5"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    <Sparkles
                      size={12}
                      style={{ color: theme.colors.accent }}
                    />
                    {t('footer.themesAvailable', { count: themes.length })}
                  </p>
                </div>
              </Link>

              {/* Description */}
              <p
                className="text-base leading-relaxed"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('footer.description')}
              </p>

              {/* Contact Cards */}
              <div className="space-y-3">
                <motion.a
                  href="mailto:contact@eziox.link"
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  whileHover={{ scale: 1.02, x: 4 }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.colors.primary}20` }}
                  >
                    <Mail size={18} style={{ color: theme.colors.primary }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: theme.colors.foreground }}
                    >
                      {t('footer.contact.email')}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      contact@eziox.link
                    </p>
                  </div>
                </motion.a>

                <motion.a
                  href="https://discord.com/invite/KD84DmNA89"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  whileHover={{ scale: 1.02, x: 4 }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(88, 101, 242, 0.2)' }}
                  >
                    <SiDiscord size={18} style={{ color: '#5865f2' }} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: theme.colors.foreground }}
                    >
                      {t('footer.contact.discord')}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      discord.gg/KD84DmNA89
                    </p>
                  </div>
                  <ExternalLink
                    size={14}
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                </motion.a>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <motion.a
                  href="https://discord.com/invite/KD84DmNA89"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: `${theme.colors.card}cc`,
                    border: `1px solid ${theme.colors.border}60`,
                    backdropFilter: 'blur(8px)',
                  }}
                  whileHover={{ scale: 1.1, y: -3, boxShadow: '0 8px 24px rgba(88, 101, 242, 0.25)' }}
                >
                  <SiDiscord size={18} style={{ color: '#5865f2' }} />
                </motion.a>
                <motion.a
                  href="https://github.com/Eziox-Development/eziox-web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: `${theme.colors.card}cc`,
                    border: `1px solid ${theme.colors.border}60`,
                    backdropFilter: 'blur(8px)',
                  }}
                  whileHover={{ scale: 1.1, y: -3, boxShadow: `0 8px 24px ${theme.colors.primary}25` }}
                >
                  <SiGithub
                    size={18}
                    style={{ color: theme.colors.foreground }}
                  />
                </motion.a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
              {footerSections.map((section) => (
                <div key={section.key} className="space-y-5">
                  <h4
                    className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    <section.icon
                      size={16}
                      style={{ color: theme.colors.primary }}
                    />
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="group flex items-center gap-2 text-sm transition-all duration-200"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          <span className="group-hover:translate-x-1 transition-transform">
                            {link.label}
                          </span>
                          <ArrowRight
                            size={12}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: theme.colors.primary }}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="py-8 border-t"
            style={{ borderColor: `${theme.colors.border}60` }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left - Copyright & Location */}
              <div
                className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <span>{t('footer.copyright', { year: currentYear })}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {t('footer.madeIn')}
                </span>
              </div>

              {/* Right - Crafted By */}
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <span>{t('footer.craftedBy')}</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart
                    size={16}
                    fill={theme.colors.primary}
                    style={{ color: theme.colors.primary }}
                  />
                </motion.span>
                <span>{t('footer.by')}</span>
                <motion.span
                  className="font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown size={14} style={{ color: '#f59e0b' }} />
                  Saito
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
