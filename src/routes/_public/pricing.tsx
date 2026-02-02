import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import {
  getTierConfigFn,
  getCurrentSubscriptionFn,
  createCheckoutSessionFn,
} from '@/server/functions/subscriptions'
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  Star,
  Gem,
  Loader2,
  ArrowRight,
  Shield,
  Rocket,
  Heart,
  Infinity as InfinityIcon,
  ChevronDown,
  CreditCard,
  Lock,
  RefreshCw,
  HelpCircle,
} from 'lucide-react'
import type { TierType, TierConfig } from '@/server/lib/stripe'

export const Route = createFileRoute('/_public/pricing')({
  head: () => ({
    meta: [
      { title: 'Pricing | Eziox' },
      {
        name: 'description',
        content:
          'Choose the perfect plan for your bio link page. From free to lifetime access.',
      },
      { property: 'og:title', content: 'Pricing | Eziox' },
      {
        property: 'og:description',
        content:
          'Simple, transparent pricing. Start free, upgrade when you need more.',
      },
    ],
  }),
  component: PricingPage,
})

const TIER_ICONS: Record<TierType, React.ElementType> = {
  free: Zap,
  pro: Star,
  creator: Crown,
  lifetime: Gem,
}

const TIER_STYLES: Record<
  TierType,
  { primary: string; gradient: string; glow: string; bg: string }
> = {
  free: {
    primary: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
    glow: '0 0 60px rgba(107, 114, 128, 0.3)',
    bg: 'rgba(107, 114, 128, 0.08)',
  },
  pro: {
    primary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    glow: '0 0 60px rgba(59, 130, 246, 0.4)',
    bg: 'rgba(59, 130, 246, 0.08)',
  },
  creator: {
    primary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    glow: '0 0 60px rgba(245, 158, 11, 0.4)',
    bg: 'rgba(245, 158, 11, 0.08)',
  },
  lifetime: {
    primary: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    glow: '0 0 60px rgba(236, 72, 153, 0.4)',
    bg: 'rgba(236, 72, 153, 0.08)',
  },
}

const TIER_ORDER: TierType[] = ['free', 'pro', 'creator', 'lifetime']

export function PricingPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly',
  )
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

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

  const getTierConfig = useServerFn(getTierConfigFn)
  const getCurrentSubscription = useServerFn(getCurrentSubscriptionFn)
  const createCheckout = useServerFn(createCheckoutSessionFn)

  const { data: tierData, isLoading: tiersLoading } = useQuery({
    queryKey: ['tierConfig'],
    queryFn: () => getTierConfig(),
    staleTime: 300000,
    gcTime: 600000,
  })

  const { data: subscriptionData } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: () => getCurrentSubscription(),
    enabled: !!currentUser,
  })

  const checkoutMutation = useMutation({
    mutationFn: (tier: 'pro' | 'creator' | 'lifetime') =>
      createCheckout({ data: { tier } }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError(t('pricing.errors.noCheckoutUrl'))
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : t('pricing.errors.checkoutFailed')
      setCheckoutError(errorMessage)
    },
  })

  const tiers = tierData?.tiers as Record<TierType, TierConfig> | undefined
  const currentTier = (subscriptionData?.tier || 'free') as TierType

  const handleSelectPlan = (tier: TierType) => {
    if (!currentUser) {
      window.location.href = '/sign-up'
      return
    }
    if (tier === 'free') return
    setCheckoutError(null)
    setSelectedTier(tier)
    checkoutMutation.mutate(tier as 'pro' | 'creator' | 'lifetime')
  }

  const faqItems = [
    {
      q: t('pricing.faq.items.switch.question'),
      a: t('pricing.faq.items.switch.answer'),
    },
    {
      q: t('pricing.faq.items.payment.question'),
      a: t('pricing.faq.items.payment.answer'),
    },
    {
      q: t('pricing.faq.items.trial.question'),
      a: t('pricing.faq.items.trial.answer'),
    },
    {
      q: t('pricing.faq.items.cancel.question'),
      a: t('pricing.faq.items.cancel.answer'),
    },
    {
      q: t('pricing.faq.items.lifetime.question'),
      a: t('pricing.faq.items.lifetime.answer'),
    },
  ]

  const trustFeatures = [
    { icon: Lock, label: t('pricing.trust.secure') },
    { icon: RefreshCw, label: t('pricing.trust.cancel') },
    { icon: CreditCard, label: t('pricing.trust.payment') },
    { icon: Shield, label: t('pricing.trust.guarantee') },
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
            className="text-center mb-12"
          >
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
                <Sparkles size={18} style={{ color: theme.colors.primary }} />
              </motion.div>
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('pricing.badge')}
              </span>
            </motion.div>

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
              {t('pricing.hero.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('pricing.hero.titleHighlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg lg:text-xl max-w-2xl mx-auto mb-10"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('pricing.hero.subtitle')}
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-4 p-1.5 rounded-xl"
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
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly' ? 'text-white' : ''
                }`}
                style={{
                  background:
                    billingCycle === 'monthly'
                      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                      : 'transparent',
                  color:
                    billingCycle === 'monthly'
                      ? 'white'
                      : theme.colors.foregroundMuted,
                }}
              >
                {t('pricing.billing.monthly')}
              </button>
              <button
                disabled
                className="px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 opacity-60 cursor-not-allowed"
                style={{
                  background: 'transparent',
                  color: theme.colors.foregroundMuted,
                }}
              >
                {t('pricing.billing.yearly')}
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: `${theme.colors.primary}20`,
                    color: theme.colors.primary,
                  }}
                >
                  {t('pricing.billing.comingSoon')}
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Error Message */}
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-8 p-4 rounded-xl border border-red-500/30"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <p className="text-red-500 font-medium text-center">
                {checkoutError}
              </p>
            </motion.div>
          )}

          {/* Pricing Cards */}
          {tiersLoading ? (
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
                {t('pricing.loading')}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {tiers &&
                TIER_ORDER.map((tier, index) => {
                  const config = tiers[tier]
                  const Icon = TIER_ICONS[tier]
                  const styles = TIER_STYLES[tier]
                  const isCurrentTier = currentUser && currentTier === tier
                  const isPopular = config.popular
                  const isLifetime = tier === 'lifetime'
                  const isLifetimeUser = currentTier === 'lifetime'

                  const displayPrice =
                    billingCycle === 'yearly' && config.price > 0 && !isLifetime
                      ? Math.round(config.price * 0.8)
                      : config.price

                  return (
                    <motion.div
                      key={tier}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="relative group"
                    >
                      {/* Popular/Best Value Badge */}
                      {(isPopular || isLifetime) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                        >
                          <div
                            className="px-4 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5"
                            style={{
                              background: styles.gradient,
                              boxShadow: styles.glow,
                            }}
                          >
                            {isLifetime ? (
                              <InfinityIcon size={12} />
                            ) : (
                              <Rocket size={12} />
                            )}
                            {isLifetime
                              ? t('pricing.badges.bestValue')
                              : t('pricing.badges.popular')}
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        className="h-full p-[2px] overflow-hidden"
                        style={{
                          background:
                            isPopular || isLifetime
                              ? styles.gradient
                              : theme.colors.border,
                          borderRadius: cardRadius,
                        }}
                        whileHover={{ scale: 1.02, y: -8 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <div
                          className="h-full p-6 flex flex-col relative overflow-hidden"
                          style={{
                            background:
                              theme.effects.cardStyle === 'glass'
                                ? `${theme.colors.card}95`
                                : theme.colors.card,
                            borderRadius: `calc(${cardRadius} - 2px)`,
                            backdropFilter:
                              theme.effects.cardStyle === 'glass'
                                ? 'blur(20px)'
                                : undefined,
                          }}
                        >
                          {/* Glow effect on hover */}
                          <div
                            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                            style={{ background: styles.primary }}
                          />

                          {/* Header */}
                          <div className="relative flex items-center gap-3 mb-6">
                            <motion.div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center"
                              style={{ background: styles.bg }}
                              whileHover={{ rotate: 10, scale: 1.1 }}
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                              }}
                            >
                              <Icon
                                size={26}
                                style={{ color: styles.primary }}
                              />
                            </motion.div>
                            <div>
                              <h3
                                className="text-xl font-bold"
                                style={{ color: theme.colors.foreground }}
                              >
                                {config.name}
                              </h3>
                              <p
                                className="text-xs"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {config.tagline}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                              <span
                                className="text-4xl font-bold"
                                style={{ color: styles.primary }}
                              >
                                €{displayPrice}
                              </span>
                              {config.price > 0 && (
                                <span
                                  className="text-sm"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {config.billingType === 'lifetime'
                                    ? t('pricing.billingType.oneTime')
                                    : billingCycle === 'yearly'
                                      ? t('pricing.billingType.perYear')
                                      : t('pricing.billingType.perMonth')}
                                </span>
                              )}
                            </div>
                            {billingCycle === 'yearly' &&
                              config.price > 0 &&
                              !isLifetime && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: theme.colors.primary }}
                                >
                                  {t('pricing.savings', {
                                    amount: Math.round(config.price * 12 * 0.2),
                                  })}
                                </p>
                              )}
                            <p
                              className="text-sm mt-2"
                              style={{ color: theme.colors.foregroundMuted }}
                            >
                              {config.description}
                            </p>
                          </div>

                          {/* Features */}
                          <div className="flex-1 space-y-3 mb-6">
                            {config.features.map((feature, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + i * 0.03 }}
                                className="flex items-start gap-2.5"
                              >
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                  style={{ background: `${styles.primary}20` }}
                                >
                                  <Check
                                    size={12}
                                    style={{ color: styles.primary }}
                                  />
                                </div>
                                <span
                                  className="text-sm"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  {feature}
                                </span>
                              </motion.div>
                            ))}
                          </div>

                          {/* CTA Button */}
                          {isCurrentTier ? (
                            <div
                              className="w-full py-3.5 rounded-xl text-center font-medium flex items-center justify-center gap-2"
                              style={{
                                background: `${styles.primary}15`,
                                color: styles.primary,
                                border: `1px solid ${styles.primary}30`,
                              }}
                            >
                              <Shield size={16} />
                              {t('pricing.buttons.currentPlan')}
                            </div>
                          ) : isLifetimeUser ? (
                            <div
                              className="w-full py-3.5 rounded-xl text-center font-medium flex items-center justify-center gap-2"
                              style={{
                                background: `${TIER_STYLES.lifetime.primary}15`,
                                color: TIER_STYLES.lifetime.primary,
                                border: `1px solid ${TIER_STYLES.lifetime.primary}30`,
                              }}
                            >
                              <Heart size={16} />
                              {t('pricing.buttons.lifetimeAccess')}
                            </div>
                          ) : tier === 'free' ? (
                            <Link to="/sign-up">
                              <motion.div
                                className="w-full py-3.5 rounded-xl text-center font-medium flex items-center justify-center gap-2"
                                style={{
                                  background: theme.colors.backgroundSecondary,
                                  color: theme.colors.foreground,
                                  border: `1px solid ${theme.colors.border}`,
                                }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {t('pricing.buttons.getStartedFree')}
                                <ArrowRight size={16} />
                              </motion.div>
                            </Link>
                          ) : (
                            <motion.button
                              onClick={() => handleSelectPlan(tier)}
                              disabled={checkoutMutation.isPending}
                              className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                              style={{
                                background: styles.gradient,
                                boxShadow:
                                  glowOpacity > 0
                                    ? `0 10px 30px ${styles.primary}40`
                                    : `0 4px 15px ${styles.primary}30`,
                              }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {checkoutMutation.isPending &&
                              selectedTier === tier ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <>
                                  {isLifetime
                                    ? t('pricing.buttons.getLifetime')
                                    : t('pricing.buttons.upgradeNow')}
                                  <ArrowRight size={16} />
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6"
          >
            {trustFeatures.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <feature.icon
                  size={16}
                  style={{ color: theme.colors.primary }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
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
              <HelpCircle size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('pricing.faq.badge')}
              </span>
            </div>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('pricing.faq.title')}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                {t('pricing.faq.titleHighlight')}
              </span>
            </h2>
            <p
              className="text-lg"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('pricing.faq.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}90`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
                }}
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span
                    className="font-medium pr-4"
                    style={{ color: theme.colors.foreground }}
                  >
                    {item.q}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        expandedFaq === index
                          ? `${theme.colors.primary}20`
                          : theme.colors.backgroundSecondary,
                    }}
                  >
                    <ChevronDown
                      size={18}
                      style={{
                        color:
                          expandedFaq === index
                            ? theme.colors.primary
                            : theme.colors.foregroundMuted,
                      }}
                    />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <p
                        className="px-5 pb-5"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
