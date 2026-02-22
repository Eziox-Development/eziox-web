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
    { icon: Users, label: t('footer.stats.creators'), value: stats?.totalUsers ?? 0, color: theme.colors.primary },
    { icon: MousePointerClick, label: t('footer.stats.clicks'), value: stats?.totalClicks ?? 0, color: theme.colors.accent },
    { icon: Eye, label: t('footer.stats.views'), value: stats?.totalViews ?? 0, color: '#22c55e' },
    { icon: LinkIcon, label: t('footer.stats.links'), value: stats?.totalLinks ?? 0, color: '#f59e0b' },
  ]

  const socialLinks = [
    { href: 'https://discord.com/invite/KD84DmNA89', icon: SiDiscord, color: '#5865f2', label: 'Discord' },
    { href: 'https://github.com/Eziox-Development/eziox-web', icon: SiGithub, color: theme.colors.foreground, label: 'GitHub' },
  ]

  return (
    <footer className="relative mt-auto">
      {/* Gradient Divider */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary}50, ${theme.colors.accent}50, transparent)` }} />

      <div className="relative" style={{ background: theme.colors.background }}>
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-[400px] h-[400px] rounded-full blur-[160px] opacity-[0.06]" style={{ background: theme.colors.primary }} />
          <div className="absolute -bottom-32 right-1/4 w-[350px] h-[350px] rounded-full blur-[140px] opacity-[0.04]" style={{ background: theme.colors.accent }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Stats Banner ──────────────────────────────────────── */}
          <div className="py-8 sm:py-10" style={{ borderBottom: `1px solid ${theme.colors.border}25` }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {liveStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: `${theme.colors.card}60`, border: `1px solid ${theme.colors.border}25` }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `rgba(${hexToRgb(stat.color)}, 0.12)` }}>
                    <stat.icon size={16} style={{ color: stat.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-extrabold tracking-tight leading-tight" style={{ color: theme.colors.foreground }}>
                      {formatNumber(stat.value)}
                    </p>
                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate" style={{ color: theme.colors.foregroundMuted }}>
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Main Content ──────────────────────────────────────── */}
          <div className="py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-6">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <motion.div
                  className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0"
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  style={{ boxShadow: `0 4px 24px rgba(${hexToRgb(theme.colors.primary)}, 0.25)` }}
                >
                  <img src="/icon.png" alt={siteConfig.metadata.title} className="w-full h-full object-cover" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.foreground}, ${theme.colors.primary})` }}>
                    {siteConfig.metadata.title}
                  </h3>
                  <p className="text-xs flex items-center gap-1" style={{ color: theme.colors.foregroundMuted }}>
                    <Sparkles size={11} style={{ color: theme.colors.accent }} />
                    {t('footer.themesAvailable', { count: themes.length })}
                  </p>
                </div>
              </Link>

              <p className="text-sm leading-relaxed max-w-sm" style={{ color: theme.colors.foregroundMuted }}>
                {t('footer.description')}
              </p>

              {/* Contact */}
              <div className="space-y-2">
                <a
                  href="mailto:contact@eziox.link"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:translate-x-0.5"
                  style={{ background: `${theme.colors.card}60`, border: `1px solid ${theme.colors.border}25` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${theme.colors.primary}15` }}>
                    <Mail size={15} style={{ color: theme.colors.primary }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium" style={{ color: theme.colors.foreground }}>{t('footer.contact.email')}</p>
                    <p className="text-[11px] truncate" style={{ color: theme.colors.foregroundMuted }}>contact@eziox.link</p>
                  </div>
                </a>

                <a
                  href="https://discord.com/invite/KD84DmNA89"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:translate-x-0.5"
                  style={{ background: `${theme.colors.card}60`, border: `1px solid ${theme.colors.border}25` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(88,101,242,0.15)' }}>
                    <SiDiscord size={15} style={{ color: '#5865f2' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: theme.colors.foreground }}>{t('footer.contact.discord')}</p>
                    <p className="text-[11px] truncate" style={{ color: theme.colors.foregroundMuted }}>discord.gg/KD84DmNA89</p>
                  </div>
                  <ExternalLink size={12} className="flex-shrink-0" style={{ color: theme.colors.foregroundMuted }} />
                </a>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-2">
                {socialLinks.map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}30` }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <s.icon size={16} style={{ color: s.color }} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-8">
              {/* Mobile: 2-col accordion-style, Desktop: 4-col */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                {footerSections.map((section) => (
                  <div key={section.key} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: theme.colors.foreground }}>
                      <section.icon size={14} style={{ color: theme.colors.primary }} />
                      {section.title}
                    </h4>
                    <ul className="space-y-2">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            className="group flex items-center gap-1.5 text-sm transition-all duration-200 hover:translate-x-0.5"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            <span>{link.label}</span>
                            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.colors.primary }} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom Bar ────────────────────────────────────────── */}
          <div className="py-6" style={{ borderTop: `1px solid ${theme.colors.border}25` }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                <span>{t('footer.copyright', { year: currentYear })}</span>
                <span className="hidden sm:inline opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {t('footer.madeIn')}
                </span>
              </div>

              {/* Right */}
              <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                <span>{t('footer.craftedBy')}</span>
                <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                  <Heart size={13} fill={theme.colors.primary} style={{ color: theme.colors.primary }} />
                </motion.span>
                <span>{t('footer.by')}</span>
                <span
                  className="font-bold flex items-center gap-1 px-2 py-1 rounded-md"
                  style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}30`, color: theme.colors.foreground }}
                >
                  <Crown size={12} style={{ color: '#f59e0b' }} />
                  Saito
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
