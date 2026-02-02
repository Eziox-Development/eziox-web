import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { getPartnersFn, getMyApplicationFn } from '@/server/functions/partners'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { PartnerApplicationForm } from '@/components/partner/PartnerApplicationForm'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/layout/ThemeProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Handshake,
  Star,
  Loader2,
  Users2,
  Eye,
  Heart,
  ArrowRight,
  Crown,
  Sparkles,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  Gift,
  Megaphone,
  Users,
  ChevronRight,
  Zap,
  Target,
} from 'lucide-react'

export const Route = createFileRoute('/_public/partners')({
  head: () => ({
    meta: [
      { title: 'Partners | Eziox' },
      {
        name: 'description',
        content:
          'Official Eziox partners and collaborators. Join our partner program for exclusive benefits.',
      },
      { property: 'og:title', content: 'Partner Program | Eziox' },
      {
        property: 'og:description',
        content: 'Collaborate with Eziox and unlock exclusive benefits',
      },
    ],
  }),
  component: PartnersPage,
})

export function PartnersPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'official' | 'featured'>(
    'official',
  )

  const getPartners = useServerFn(getPartnersFn)
  const getMyApplication = useServerFn(getMyApplicationFn)

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'

  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  const { data: partnersData, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => getPartners(),
    refetchInterval: 60000,
    staleTime: 300000,
    gcTime: 600000,
  })

  const { data: myApplication, refetch: refetchMyApplication } = useQuery({
    queryKey: ['my-partner-application'],
    queryFn: () => getMyApplication(),
    enabled: !!currentUser,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          label: t('partners.status.pending'),
        }
      case 'reviewing':
        return {
          icon: Eye,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.15)',
          label: t('partners.status.reviewing'),
        }
      case 'approved':
        return {
          icon: CheckCircle2,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          label: t('partners.status.approved'),
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          label: t('partners.status.rejected'),
        }
      default:
        return {
          icon: Clock,
          color: '#6b7280',
          bg: 'rgba(107, 114, 128, 0.15)',
          label: status,
        }
    }
  }

  const benefits = [
    {
      icon: Award,
      title: t('partners.benefits.badge.title'),
      description: t('partners.benefits.badge.description'),
      color: '#fbbf24',
    },
    {
      icon: Megaphone,
      title: t('partners.benefits.featured.title'),
      description: t('partners.benefits.featured.description'),
      color: '#ec4899',
    },
    {
      icon: Gift,
      title: t('partners.benefits.premium.title'),
      description: t('partners.benefits.premium.description'),
      color: '#8b5cf6',
    },
    {
      icon: Users,
      title: t('partners.benefits.community.title'),
      description: t('partners.benefits.community.description'),
      color: '#22c55e',
    },
  ]

  const requirements = [
    {
      icon: Users2,
      title: t('partners.requirements.followers.title'),
      description: t('partners.requirements.followers.description'),
    },
    {
      icon: Target,
      title: t('partners.requirements.quality.title'),
      description: t('partners.requirements.quality.description'),
    },
    {
      icon: Zap,
      title: t('partners.requirements.active.title'),
      description: t('partners.requirements.active.description'),
    },
  ]

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Handshake size={18} style={{ color: theme.colors.primary }} />
              </motion.div>
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('partners.badge')}
              </span>
              <Sparkles size={14} style={{ color: theme.colors.accent }} />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('partners.hero.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('partners.hero.titleHighlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg lg:text-xl max-w-2xl mx-auto mb-10"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('partners.hero.subtitle')}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {currentUser ? (
                myApplication ? (
                  <motion.div
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl"
                    style={{
                      background: getStatusBadge(myApplication.status).bg,
                      border: `2px solid ${getStatusBadge(myApplication.status).color}40`,
                    }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    {(() => {
                      const status = getStatusBadge(myApplication.status)
                      return (
                        <>
                          <status.icon
                            size={24}
                            style={{ color: status.color }}
                          />
                          <div className="text-left">
                            <p
                              className="text-sm"
                              style={{ color: theme.colors.foregroundMuted }}
                            >
                              {t('partners.yourApplication')}
                            </p>
                            <p
                              className="font-bold"
                              style={{ color: status.color }}
                            >
                              {status.label}
                            </p>
                          </div>
                        </>
                      )
                    })()}
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setShowApplicationForm(true)}
                    className="px-10 py-5 rounded-2xl font-bold text-lg text-white flex items-center gap-3"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      boxShadow:
                        glowOpacity > 0
                          ? `0 20px 50px ${theme.colors.primary}40`
                          : `0 10px 30px rgba(0,0,0,0.2)`,
                    }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles size={24} />
                    {t('partners.applyNow')}
                    <ArrowRight size={22} />
                  </motion.button>
                )
              ) : (
                <Link to="/sign-in">
                  <motion.button
                    className="px-10 py-5 rounded-2xl font-bold text-lg text-white flex items-center gap-3"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      boxShadow:
                        glowOpacity > 0
                          ? `0 20px 50px ${theme.colors.primary}40`
                          : `0 10px 30px rgba(0,0,0,0.2)`,
                    }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('partners.signInToApply')}
                    <ArrowRight size={22} />
                  </motion.button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        className="py-16 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Gift size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('partners.benefits.title')}
              </span>
            </div>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Partner{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Benefits
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('partners.benefits.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative p-6 overflow-hidden group"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}90`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(20px)'
                      : undefined,
                }}
              >
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ background: benefit.color }}
                />
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{ background: `${benefit.color}20` }}
                >
                  <benefit.icon size={28} style={{ color: benefit.color }} />
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  {benefit.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Target size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('partners.requirements.title')}
              </span>
            </div>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              What We{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Look For
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('partners.requirements.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requirements.map((req, i) => (
              <motion.div
                key={req.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 text-center"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <div
                  className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}15` }}
                >
                  <req.icon size={28} style={{ color: theme.colors.primary }} />
                </div>
                <h3
                  className="font-bold text-lg mb-1"
                  style={{ color: theme.colors.foreground }}
                >
                  {req.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {req.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Showcase Section */}
      <section
        className="py-16 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Shield size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('partners.showcase.badge')}
              </span>
            </div>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('partners.showcase.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('partners.showcase.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('partners.showcase.subtitle')}
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex p-1 rounded-xl"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter:
                  theme.effects.cardStyle === 'glass'
                    ? 'blur(20px)'
                    : undefined,
              }}
            >
              <motion.button
                onClick={() => setActiveTab('official')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'official' ? 'text-white' : ''
                }`}
                style={{
                  background:
                    activeTab === 'official'
                      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                      : 'transparent',
                }}
              >
                <Shield size={18} className="inline mr-2" />
                {t('partners.tabs.official')}
                {partnersData?.officialPartners && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">
                    {partnersData.officialPartners.length}
                  </span>
                )}
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('featured')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'featured' ? 'text-white' : ''
                }`}
                style={{
                  background:
                    activeTab === 'featured'
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : 'transparent',
                }}
              >
                <Star size={18} className="inline mr-2" />
                {t('partners.tabs.featured')}
                {partnersData?.featuredPartners && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">
                    {partnersData.featuredPartners.length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Partners Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mb-6 rounded-full flex items-center justify-center"
                style={{ background: `${theme.colors.primary}20` }}
              >
                <Loader2 size={32} style={{ color: theme.colors.primary }} />
              </motion.div>
              <p style={{ color: theme.colors.foregroundMuted }}>
                {t('partners.loading')}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'official' && (
                <motion.div
                  key="official"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {partnersData?.officialPartners &&
                  partnersData.officialPartners.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {partnersData.officialPartners.map((partner, i) => (
                        <motion.div
                          key={partner.user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link
                            to="/$username"
                            params={{ username: partner.user.username }}
                          >
                            <motion.div
                              whileHover={{ y: -8, scale: 1.02 }}
                              className="relative p-6 overflow-hidden group"
                              style={{
                                background:
                                  theme.effects.cardStyle === 'glass'
                                    ? `${theme.colors.card}90`
                                    : theme.colors.card,
                                border: `2px solid ${theme.colors.primary}30`,
                                borderRadius: cardRadius,
                                backdropFilter:
                                  theme.effects.cardStyle === 'glass'
                                    ? 'blur(20px)'
                                    : undefined,
                              }}
                            >
                              <div
                                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-300"
                                style={{ background: theme.colors.primary }}
                              />

                              <div className="relative flex items-start gap-4 mb-4">
                                <div className="relative">
                                  <Avatar
                                    className="w-16 h-16 ring-2"
                                    style={
                                      {
                                        '--tw-ring-color': theme.colors.primary,
                                      } as React.CSSProperties
                                    }
                                  >
                                    <AvatarImage
                                      src={partner.profile?.avatar || undefined}
                                    />
                                    <AvatarFallback
                                      className="text-xl font-bold"
                                      style={{
                                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                                        color: 'white',
                                      }}
                                    >
                                      {(
                                        partner.user.name ||
                                        partner.user.username
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                                    style={{
                                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                                      boxShadow: `0 2px 10px ${theme.colors.primary}50`,
                                    }}
                                  >
                                    <Handshake
                                      size={14}
                                      className="text-white"
                                    />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3
                                      className="font-bold text-lg truncate"
                                      style={{ color: theme.colors.foreground }}
                                    >
                                      {partner.user.name ||
                                        partner.user.username}
                                    </h3>
                                    {partner.user.role === 'admin' && (
                                      <Crown
                                        size={16}
                                        className="text-amber-500 shrink-0"
                                      />
                                    )}
                                  </div>
                                  <p
                                    className="text-sm truncate"
                                    style={{
                                      color: theme.colors.foregroundMuted,
                                    }}
                                  >
                                    @{partner.user.username}
                                  </p>
                                </div>
                              </div>

                              {partner.profile?.badges &&
                                partner.profile.badges.length > 0 && (
                                  <div className="mb-3">
                                    <BadgeDisplay
                                      badges={
                                        partner.profile.badges as string[]
                                      }
                                      maxDisplay={4}
                                      size="sm"
                                    />
                                  </div>
                                )}

                              {partner.profile?.bio && (
                                <p
                                  className="text-sm mb-4 line-clamp-2"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {partner.profile.bio}
                                </p>
                              )}

                              <div
                                className="flex items-center justify-between pt-4"
                                style={{
                                  borderTop: `1px solid ${theme.colors.border}`,
                                }}
                              >
                                <div
                                  className="flex items-center gap-4 text-sm"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Eye size={14} />
                                    {(
                                      partner.stats?.profileViews || 0
                                    ).toLocaleString()}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Heart size={14} />
                                    {(
                                      partner.stats?.followers || 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <motion.div
                                  className="flex items-center gap-1 text-sm font-medium"
                                  style={{ color: theme.colors.primary }}
                                  whileHover={{ x: 4 }}
                                >
                                  View
                                  <ChevronRight size={16} />
                                </motion.div>
                              </div>
                            </motion.div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div
                        className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{ background: `${theme.colors.primary}15` }}
                      >
                        <Handshake
                          size={48}
                          style={{ color: theme.colors.primary, opacity: 0.5 }}
                        />
                      </div>
                      <h3
                        className="text-2xl font-bold mb-2"
                        style={{ color: theme.colors.foreground }}
                      >
                        {t('partners.empty.title')}
                      </h3>
                      <p
                        className="mb-8 max-w-md mx-auto"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {t('partners.empty.subtitle')}
                      </p>
                      {currentUser && !myApplication && (
                        <motion.button
                          onClick={() => setShowApplicationForm(true)}
                          className="px-8 py-4 rounded-xl font-semibold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                            boxShadow:
                              glowOpacity > 0
                                ? `0 15px 40px ${theme.colors.primary}40`
                                : undefined,
                          }}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Sparkles size={20} className="inline mr-2" />
                          {t('partners.applyNow')}
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'featured' && (
                <motion.div
                  key="featured"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {partnersData?.featuredPartners &&
                  partnersData.featuredPartners.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {partnersData.featuredPartners.map((partner, i) => (
                        <motion.div
                          key={partner.user.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <Link
                            to="/$username"
                            params={{ username: partner.user.username }}
                          >
                            <motion.div
                              whileHover={{ y: -6, scale: 1.03 }}
                              className="p-5 text-center"
                              style={{
                                background:
                                  theme.effects.cardStyle === 'glass'
                                    ? `${theme.colors.card}90`
                                    : theme.colors.card,
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: cardRadius,
                                backdropFilter:
                                  theme.effects.cardStyle === 'glass'
                                    ? 'blur(20px)'
                                    : undefined,
                              }}
                            >
                              <div className="relative inline-block mb-3">
                                <Avatar
                                  className="w-16 h-16 ring-2"
                                  style={
                                    {
                                      '--tw-ring-color': '#fbbf24',
                                    } as React.CSSProperties
                                  }
                                >
                                  <AvatarImage
                                    src={partner.profile?.avatar || undefined}
                                  />
                                  <AvatarFallback
                                    className="text-xl font-bold"
                                    style={{
                                      background:
                                        'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                      color: 'white',
                                    }}
                                  >
                                    {(
                                      partner.user.name || partner.user.username
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{
                                    background:
                                      'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                    boxShadow:
                                      '0 2px 8px rgba(251, 191, 36, 0.5)',
                                  }}
                                >
                                  <Star size={12} className="text-white" />
                                </div>
                              </div>
                              <h3
                                className="font-semibold truncate"
                                style={{ color: theme.colors.foreground }}
                              >
                                {partner.user.name || partner.user.username}
                              </h3>
                              <p
                                className="text-xs truncate"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                @{partner.user.username}
                              </p>
                            </motion.div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div
                        className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{ background: '#fbbf2415' }}
                      >
                        <Star
                          size={48}
                          style={{ color: '#fbbf24', opacity: 0.5 }}
                        />
                      </div>
                      <h3
                        className="text-2xl font-bold mb-2"
                        style={{ color: theme.colors.foreground }}
                      >
                        {t('partners.empty.featuredTitle')}
                      </h3>
                      <p
                        className="max-w-md mx-auto"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {t('partners.empty.featuredSubtitle')}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showApplicationForm && (
          <PartnerApplicationForm
            onClose={() => setShowApplicationForm(false)}
            onSuccess={() => {
              setShowApplicationForm(false)
              void refetchMyApplication()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
