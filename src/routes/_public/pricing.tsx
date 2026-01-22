import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import { CTASection } from '@/components/layout/CTASection'
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
    bg: 'rgba(107, 114, 128, 0.05)',
  },
  pro: {
    primary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    glow: '0 0 60px rgba(59, 130, 246, 0.4)',
    bg: 'rgba(59, 130, 246, 0.05)',
  },
  creator: {
    primary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    glow: '0 0 60px rgba(245, 158, 11, 0.4)',
    bg: 'rgba(245, 158, 11, 0.05)',
  },
  lifetime: {
    primary: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    glow: '0 0 60px rgba(236, 72, 153, 0.4)',
    bg: 'rgba(236, 72, 153, 0.05)',
  },
}

const TIER_ORDER: TierType[] = ['free', 'pro', 'creator', 'lifetime']

const FAQ_ITEMS = [
  {
    q: 'Can I switch plans anytime?',
    a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the end of your billing period.",
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay through our secure payment processor Stripe.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Our Free tier is completely free forever with no trial period needed. You can use all core features without any time limit.',
  },
  {
    q: 'What happens if I cancel?',
    a: "If you cancel, you'll keep access to your paid features until the end of your billing period. After that, your account will revert to the Free tier.",
  },
  {
    q: 'Is the Lifetime plan really forever?',
    a: 'Yes! The Lifetime plan is a one-time payment that gives you permanent access to all Creator features, including any future updates.',
  },
]

function PricingPage() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
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
        setCheckoutError('No checkout URL received from server')
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Failed to create checkout session'
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

      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
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
                Simple, transparent pricing
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
              Choose Your{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Perfect Plan
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg lg:text-xl max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Start free, upgrade when you need more. No hidden fees, cancel
              anytime.
            </motion.p>
          </motion.div>

          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-8 p-4 rounded-lg border border-red-500"
              style={{
                background: '#ef444415',
                color: '#ef4444',
              }}
            >
              <p className="font-medium">Checkout Error: {checkoutError}</p>
            </motion.div>
          )}

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
                Loading plans...
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {tiers &&
                TIER_ORDER.map((tier, index) => {
                  const config = tiers[tier]
                  const Icon = TIER_ICONS[tier]
                  const styles = TIER_STYLES[tier]
                  const isCurrentTier = currentUser && currentTier === tier
                  const isPopular = config.popular
                  const isLifetime = tier === 'lifetime'
                  const isLifetimeUser = currentTier === 'lifetime'

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
                            {isLifetime ? 'BEST VALUE' : 'MOST POPULAR'}
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
                        whileHover={{ scale: 1.03, y: -8 }}
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

                          <div className="relative flex items-center gap-3 mb-4">
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

                          <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                              <span
                                className="text-4xl font-bold"
                                style={{ color: styles.primary }}
                              >
                                €{config.price}
                              </span>
                              {config.price > 0 && (
                                <span
                                  className="text-sm"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {config.billingType === 'lifetime'
                                    ? ' one-time'
                                    : '/month'}
                                </span>
                              )}
                            </div>
                            <p
                              className="text-sm mt-2"
                              style={{ color: theme.colors.foregroundMuted }}
                            >
                              {config.description}
                            </p>
                          </div>

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
                              Current Plan
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
                              Lifetime Access
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
                                transition={{
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 25,
                                }}
                              >
                                Get Started Free
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
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                              }}
                            >
                              {checkoutMutation.isPending &&
                              selectedTier === tier ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <>
                                  {isLifetime ? 'Get Lifetime' : 'Upgrade Now'}
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

      <section
        className="py-24 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
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
              <ChevronDown size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                FAQ
              </span>
            </div>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              Frequently Asked{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                }}
              >
                Questions
              </span>
            </h2>
            <p
              className="text-lg"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Everything you need to know about our plans
            </p>
          </motion.div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
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

      <CTASection />
    </div>
  )
}
