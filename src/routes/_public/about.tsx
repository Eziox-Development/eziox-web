import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  ArrowRight,
  Users,
  Link2,
  Palette,
  Shield,
  BarChart3,
  Heart,
  Sparkles,
  Lock,
  Eye,
  Music,
  Calendar,
  CheckCircle,
  Star,
  QrCode,
  Rocket,
} from 'lucide-react'
import {
  SiGithub,
  SiDiscord,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiPostgresql,
  SiStripe,
  SiCloudflare,
  SiVercel,
} from 'react-icons/si'

export const Route = createFileRoute('/_public/about')({
  head: () => ({
    meta: [
      { title: 'About | Eziox' },
      {
        name: 'description',
        content:
          'Eziox is a free bio link platform for creators. Unlimited links, 30+ themes, real analytics — no paywalls.',
      },
    ],
  }),
  component: AboutPage,
})

export function AboutPage() {
  const { t } = useTranslation()
  const { theme, themes } = useTheme()
  const getPlatformStats = useServerFn(getPlatformStatsFn)

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => getPlatformStats(),
    staleTime: 60000,
  })

  const cardRadius = useMemo(
    () =>
      theme.effects.borderRadius === 'pill'
        ? '24px'
        : theme.effects.borderRadius === 'sharp'
          ? '8px'
          : '16px',
    [theme.effects.borderRadius],
  )

  const glowOpacity = useMemo(
    () =>
      theme.effects.glowIntensity === 'strong'
        ? 0.4
        : theme.effects.glowIntensity === 'medium'
          ? 0.25
          : theme.effects.glowIntensity === 'subtle'
            ? 0.15
            : 0,
    [theme.effects.glowIntensity],
  )

  const coreFeatures = useMemo(
    () => [
      {
        icon: Link2,
        title: t('about.features.unlimited.title'),
        desc: t('about.features.unlimited.description'),
        color: theme.colors.primary,
      },
      {
        icon: Palette,
        title: t('about.features.themes.title', { count: themes.length }),
        desc: t('about.features.themes.description'),
        color: '#ec4899',
      },
      {
        icon: BarChart3,
        title: t('about.features.analytics.title'),
        desc: t('about.features.analytics.description'),
        color: '#22c55e',
      },
      {
        icon: Music,
        title: t('about.features.spotify.title'),
        desc: t('about.features.spotify.description'),
        color: '#1db954',
      },
      {
        icon: Calendar,
        title: t('about.features.scheduling.title'),
        desc: t('about.features.scheduling.description'),
        color: '#f59e0b',
      },
      {
        icon: QrCode,
        title: t('about.features.qrCode.title'),
        desc: t('about.features.qrCode.description'),
        color: '#6366f1',
      },
    ],
    [t, theme.colors.primary, themes.length],
  )

  const premiumFeatures = useMemo(
    () => [
      {
        title: t('about.premium.features.customCss.title'),
        desc: t('about.premium.features.customCss.description'),
        tier: 'Pro',
      },
      {
        title: t('about.premium.features.customFonts.title'),
        desc: t('about.premium.features.customFonts.description'),
        tier: 'Pro',
      },
      {
        title: t('about.premium.features.removeBranding.title'),
        desc: t('about.premium.features.removeBranding.description'),
        tier: 'Pro',
      },
      {
        title: t('about.premium.features.analyticsExport.title'),
        desc: t('about.premium.features.analyticsExport.description'),
        tier: 'Pro',
      },
      {
        title: t('about.premium.features.customDomain.title'),
        desc: t('about.premium.features.customDomain.description'),
        tier: 'Creator',
      },
      {
        title: t('about.premium.features.linkPasswords.title'),
        desc: t('about.premium.features.linkPasswords.description'),
        tier: 'Creator',
      },
    ],
    [t],
  )

  const techStack = useMemo(
    () => [
      { icon: SiReact, name: 'React 19', color: '#61dafb' },
      { icon: SiTypescript, name: 'TypeScript', color: '#3178c6' },
      { icon: SiTailwindcss, name: 'Tailwind', color: '#06b6d4' },
      { icon: SiPostgresql, name: 'PostgreSQL', color: '#336791' },
      { icon: SiStripe, name: 'Stripe', color: '#635bff' },
      { icon: SiCloudflare, name: 'Cloudflare', color: '#f38020' },
      { icon: SiVercel, name: 'Vercel', color: '#ffffff' },
    ],
    [],
  )

  const heroStats = useMemo(
    () => [
      {
        value: stats?.totalUsers?.toLocaleString() || '—',
        label: t('about.stats.creators'),
        icon: Users,
        color: theme.colors.primary,
      },
      {
        value: stats?.totalLinks?.toLocaleString() || '—',
        label: t('about.stats.links'),
        icon: Link2,
        color: '#ec4899',
      },
      {
        value: themes.length.toString(),
        label: t('about.stats.themes'),
        icon: Palette,
        color: '#06b6d4',
      },
      {
        value: stats?.totalViews?.toLocaleString() || '—',
        label: t('about.stats.views'),
        icon: Eye,
        color: '#22c55e',
      },
    ],
    [stats, themes.length, theme.colors.primary, t],
  )

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.2,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-8"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
                borderRadius: cardRadius,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {t('about.badge')}
              </span>
            </motion.div>

            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('about.hero.title')} <br className="hidden md:block" />
              <span
                style={{
                  color: theme.colors.primary,
                  textShadow:
                    glowOpacity > 0
                      ? `0 0 40px ${theme.colors.primary}60`
                      : undefined,
                }}
              >
                {t('about.hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('about.hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/sign-up">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    borderRadius: cardRadius,
                    boxShadow:
                      glowOpacity > 0
                        ? `0 15px 40px ${theme.colors.primary}40`
                        : undefined,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('about.cta.start')} <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link to="/playground">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 font-semibold"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: cardRadius,
                    color: theme.colors.foreground,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye size={20} /> {t('about.cta.playground')}
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {heroStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="relative p-6 text-center overflow-hidden group"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div
                  className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                >
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
                <p
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section
        className="py-20 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Star size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('about.features.badge')}
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('about.features.title')}{' '}
              <span style={{ color: theme.colors.primary }}>
                {t('about.features.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('about.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="p-6 group"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <motion.div
                  className="w-14 h-14 mb-4 flex items-center justify-center rounded-2xl"
                  style={{ background: `${feature.color}15` }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon size={28} style={{ color: feature.color }} />
                </motion.div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: theme.colors.foregroundMuted }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Eziox & Privacy */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Why Eziox */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  <Heart size={28} className="text-white" />
                </div>
                <h3
                  className="text-2xl font-bold"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  {t('about.why.title')}
                </h3>
              </div>
              <div
                className="space-y-4"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <p className="leading-relaxed">{t('about.why.p1')}</p>
                <p className="leading-relaxed">
                  <strong style={{ color: theme.colors.foreground }}>
                    {t('about.why.p2')}
                  </strong>{' '}
                  {t('about.why.p3', { count: themes.length })}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    t('about.why.badges.noWatermarks'),
                    t('about.why.badges.noLimits'),
                    t('about.why.badges.noRestrictions'),
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full"
                      style={{
                        background: `${theme.colors.primary}15`,
                        color: theme.colors.primary,
                      }}
                    >
                      <CheckCircle size={14} /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Privacy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  }}
                >
                  <Shield size={28} className="text-white" />
                </div>
                <h3
                  className="text-2xl font-bold"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  {t('about.privacy.title')}
                </h3>
              </div>
              <div
                className="space-y-4"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <p className="leading-relaxed">{t('about.privacy.p1')}</p>
                <p className="leading-relaxed">
                  <strong style={{ color: theme.colors.foreground }}>
                    {t('about.privacy.p2')}
                  </strong>{' '}
                  {t('about.privacy.p3')}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    t('about.privacy.badges.gdpr'),
                    t('about.privacy.badges.noTracking'),
                    t('about.privacy.badges.dataExport'),
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full"
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                      }}
                    >
                      <Lock size={14} /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section
        className="py-20 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              <span style={{ color: theme.colors.primary }}>
                {themes.length}
              </span>{' '}
              {t('about.themes.title', { count: themes.length }).replace(
                `${themes.length} `,
                '',
              )}
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('about.themes.subtitle')}
            </p>
          </motion.div>

          {/* Theme Preview Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 md:p-8"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {themes.slice(0, 20).map((themeItem, i) => (
                <motion.div
                  key={themeItem.id}
                  className="aspect-square relative group cursor-pointer overflow-hidden"
                  style={{
                    background: themeItem.colors.background,
                    border: `2px solid ${themeItem.colors.primary}`,
                    borderRadius:
                      themeItem.effects.borderRadius === 'pill'
                        ? '14px'
                        : themeItem.effects.borderRadius === 'sharp'
                          ? '4px'
                          : '10px',
                  }}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  title={themeItem.name}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: themeItem.colors.primary }}
                    />
                  </div>
                  {themeItem.isPremium && (
                    <div className="absolute top-1 right-1">
                      <Star
                        size={8}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Link to="/playground">
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    borderRadius: cardRadius,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Palette size={20} /> {t('about.themes.browseAll')}{' '}
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('about.premium.title')}{' '}
              <span style={{ color: theme.colors.primary }}>
                {t('about.premium.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('about.premium.subtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-5 flex items-start gap-4"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <div
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl"
                  style={{
                    background:
                      feature.tier === 'Creator'
                        ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                        : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className="font-semibold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {feature.title}
                    </h4>
                    <span
                      className="text-xs px-2 py-0.5 font-medium rounded-full"
                      style={{
                        background:
                          feature.tier === 'Creator'
                            ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                            : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        color: '#fff',
                      }}
                    >
                      {feature.tier}
                    </span>
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link to="/pricing">
              <motion.button
                className="flex items-center gap-2 px-8 py-4 font-semibold"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  color: theme.colors.foreground,
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('about.premium.viewPricing')} <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section
        className="py-20 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Sparkles size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('about.techStack.badge')}
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('about.techStack.title')}{' '}
              <span style={{ color: theme.colors.primary }}>
                {t('about.techStack.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('about.techStack.subtitle')}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex items-center gap-3 px-5 py-3"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <tech.icon size={24} style={{ color: tech.color }} />
                <span
                  className="font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Users size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('about.community.badge')}
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('about.community.title')}{' '}
              <span style={{ color: theme.colors.primary }}>
                {t('about.community.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto mb-10"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('about.community.subtitle')}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://discord.gg/eziox"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  className="flex items-center gap-3 px-8 py-4 font-semibold text-white"
                  style={{
                    background: '#5865f2',
                    borderRadius: cardRadius,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SiDiscord size={22} /> {t('about.community.discord')}
                </motion.button>
              </a>
              <a
                href="https://github.com/eziox"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  className="flex items-center gap-3 px-8 py-4 font-semibold"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: cardRadius,
                    color: theme.colors.foreground,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SiGithub size={22} /> {t('about.community.github')}
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-24 px-4 relative overflow-hidden"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${theme.colors.primary}15 0%, transparent 60%)`,
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                boxShadow: `0 20px 50px ${theme.colors.primary}40`,
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Rocket size={40} className="text-white" />
            </motion.div>

            <h2
              className="text-4xl lg:text-6xl font-bold mb-6"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('about.finalCta.title')}
            </h2>
            <p
              className="text-xl mb-10 max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('about.finalCta.subtitle', { count: stats?.totalUsers || 0 })}
            </p>

            <Link to="/sign-up">
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-10 py-5 mx-auto rounded-2xl font-bold text-lg text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow: `0 20px 50px ${theme.colors.primary}50`,
                }}
              >
                <Rocket size={24} />
                {t('about.finalCta.button')}
                <ArrowRight size={24} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
