import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  getTierConfigFn,
  getCurrentSubscriptionFn,
  createCheckoutSessionFn,
  createBillingPortalSessionFn,
  cancelSubscriptionFn,
  resumeSubscriptionFn,
} from '@/server/functions/subscriptions'
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  X,
  CreditCard,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Star,
  Gem,
} from 'lucide-react'
import type { TierType, TierConfig } from '@/server/lib/stripe'

const TIER_ICONS: Record<TierType, React.ElementType> = {
  free: Zap,
  pro: Star,
  creator: Crown,
  lifetime: Gem,
}

const TIER_STYLES: Record<TierType, { primary: string; gradient: string; glow: string }> = {
  free: { 
    primary: '#6b7280', 
    gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
    glow: 'rgba(107, 114, 128, 0.3)'
  },
  pro: { 
    primary: '#3b82f6', 
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    glow: 'rgba(59, 130, 246, 0.3)'
  },
  creator: { 
    primary: '#f59e0b', 
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    glow: 'rgba(245, 158, 11, 0.3)'
  },
  lifetime: { 
    primary: '#ec4899', 
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    glow: 'rgba(236, 72, 153, 0.3)'
  },
}

const TIER_LEVELS: Record<string, number> = { free: 0, standard: 0, pro: 1, creator: 2, lifetime: 3 }

export function SubscriptionTab() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const getTierConfig = useServerFn(getTierConfigFn)
  const getCurrentSubscription = useServerFn(getCurrentSubscriptionFn)
  const createCheckout = useServerFn(createCheckoutSessionFn)
  const createBillingPortal = useServerFn(createBillingPortalSessionFn)
  const cancelSub = useServerFn(cancelSubscriptionFn)
  const resumeSub = useServerFn(resumeSubscriptionFn)

  const { data: tierData, isLoading: tiersLoading } = useQuery({
    queryKey: ['tierConfig'],
    queryFn: () => getTierConfig(),
  })

  const { data: subscriptionData, isLoading: subLoading } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: () => getCurrentSubscription(),
  })

  const checkoutMutation = useMutation({
    mutationFn: (tier: 'pro' | 'creator' | 'lifetime') => createCheckout({ data: { tier } }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
  })

  const billingPortalMutation = useMutation({
    mutationFn: () => createBillingPortal(),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelSub(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['currentSubscription'] })
      setShowCancelConfirm(false)
    },
  })

  const resumeMutation = useMutation({
    mutationFn: () => resumeSub(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['currentSubscription'] })
    },
  })

  const isLoading = tiersLoading || subLoading
  const currentTier = (subscriptionData?.tier || 'free') as TierType
  const subscription = subscriptionData?.subscription
  const tiers = tierData?.tiers as Record<TierType, TierConfig> | undefined

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.colors.primary }} />
      </motion.div>
    )
  }

  const currentStyles = TIER_STYLES[currentTier] || TIER_STYLES.free
  const CurrentIcon = TIER_ICONS[currentTier] || TIER_ICONS.free

  return (
    <motion.div
      key="subscription"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      >
        <div
          className="p-6"
          style={{ background: currentStyles.gradient }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CurrentIcon size={28} className="text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Current Plan</p>
              <h2 className="text-2xl font-bold text-white">
                {tiers?.[currentTier]?.name || currentTier}
              </h2>
            </div>
          </div>
        </div>

        {subscription && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: theme.colors.foregroundMuted }} />
                <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                  {subscription.cancelAtPeriodEnd ? 'Ends on' : 'Renews on'}
                </span>
              </div>
              <span className="font-medium" style={{ color: theme.colors.foreground }}>
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <AlertTriangle size={18} className="text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-500">Subscription ending</p>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    Your plan will downgrade to Free after this period
                  </p>
                </div>
                <button
                  onClick={() => resumeMutation.mutate()}
                  disabled={resumeMutation.isPending}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: theme.colors.primary, color: '#fff' }}
                >
                  {resumeMutation.isPending ? 'Resuming...' : 'Resume'}
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => billingPortalMutation.mutate()}
                disabled={billingPortalMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-90"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
              >
                <CreditCard size={16} />
                {billingPortalMutation.isPending ? 'Loading...' : 'Manage Billing'}
                <ExternalLink size={14} />
              </button>

              {!subscription.cancelAtPeriodEnd && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-red-500/20"
                  style={{ color: '#ef4444' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiers &&
          (['free', 'pro', 'creator', 'lifetime'] as TierType[]).map((tier) => {
            const config = tiers[tier]
            const Icon = TIER_ICONS[tier]
            const styles = TIER_STYLES[tier]
            const isCurrentTier = currentTier === tier || (tier === 'free' && !['pro', 'creator', 'lifetime'].includes(currentTier))
            const currentLevel = TIER_LEVELS[currentTier] ?? 0
            const targetLevel = TIER_LEVELS[tier] ?? 0
            const isUpgrade = targetLevel > currentLevel && tier !== 'free'
            const isDowngrade = targetLevel < currentLevel && targetLevel > 0
            const isLifetime = tier === 'lifetime'
            const isLifetimeUser = currentTier === 'lifetime'

            return (
              <motion.div
                key={tier}
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: theme.colors.card,
                  border: `2px solid ${isCurrentTier ? styles.primary : theme.colors.border}`,
                  boxShadow: isCurrentTier ? `0 0 20px ${styles.glow}` : 'none',
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {(config.popular || isLifetime) && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-0 right-0 px-3 py-1.5 text-[10px] font-bold text-white rounded-bl-xl tracking-wider"
                    style={{ background: styles.gradient }}
                  >
                    {isLifetime ? 'BEST VALUE' : 'POPULAR'}
                  </motion.div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${styles.primary}20` }}
                    >
                      <Icon size={20} style={{ color: styles.primary }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: theme.colors.foreground }}>
                        {config.name}
                      </h3>
                      <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                        {config.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold" style={{ color: theme.colors.foreground }}>
                      €{config.price}
                    </span>
                    {config.price > 0 && (
                      <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                        {config.billingType === 'lifetime' ? ' einmalig' : '/Monat'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs mb-4" style={{ color: theme.colors.foregroundMuted }}>
                    {config.description}
                  </p>

                  <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
                    {config.features.slice(0, 6).map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5 shrink-0" style={{ color: styles.primary }} />
                        <span className="text-sm" style={{ color: theme.colors.foreground }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                    {config.features.length > 6 && (
                      <p className="text-xs pl-5" style={{ color: theme.colors.foregroundMuted }}>
                        +{config.features.length - 6} more features
                      </p>
                    )}
                  </div>

                  {isCurrentTier ? (
                    <div
                      className="w-full py-2.5 rounded-xl text-center font-medium text-sm"
                      style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
                    >
                      Current Plan
                    </div>
                  ) : isLifetimeUser ? (
                    <div
                      className="w-full py-2.5 rounded-xl text-center font-medium text-sm"
                      style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
                    >
                      Lifetime Access
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => {
                        setSelectedTier(tier)
                        checkoutMutation.mutate(tier as 'pro' | 'creator' | 'lifetime')
                      }}
                      disabled={checkoutMutation.isPending}
                      className="w-full py-2.5 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                      style={{ background: styles.gradient }}
                    >
                      {checkoutMutation.isPending && selectedTier === tier ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {isLifetime ? 'Get Lifetime' : `Upgrade to ${config.name}`}
                    </button>
                  ) : isDowngrade ? (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-white/5"
                      style={{ color: theme.colors.foregroundMuted, border: `1px solid ${theme.colors.border}` }}
                    >
                      Downgrade
                    </button>
                  ) : tier === 'free' ? (
                    <div
                      className="w-full py-2.5 rounded-xl text-center font-medium text-sm"
                      style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
                    >
                      Free Forever
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedTier(tier)
                        checkoutMutation.mutate(tier as 'pro' | 'creator' | 'lifetime')
                      }}
                      disabled={checkoutMutation.isPending}
                      className="w-full py-2.5 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                      style={{ background: styles.gradient }}
                    >
                      {checkoutMutation.isPending && selectedTier === tier ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {isLifetime ? 'Get Lifetime' : `Upgrade to ${config.name}`}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      >
        <div className="p-5 border-b" style={{ borderColor: theme.colors.border }}>
          <h3 className="font-bold" style={{ color: theme.colors.foreground }}>
            Feature Comparison
          </h3>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3" style={{ color: theme.colors.foregroundMuted }}>
                    Feature
                  </th>
                  {(['free', 'pro', 'creator', 'lifetime'] as TierType[]).map((tier) => (
                    <th
                      key={tier}
                      className="text-center py-2 px-3 font-medium text-xs"
                      style={{ color: TIER_STYLES[tier].primary }}
                    >
                      {tiers?.[tier]?.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'maxLinks', label: 'Links', format: (v: number) => (v === -1 ? '∞' : v.toString()) },
                  { key: 'analyticsRetentionDays', label: 'Analytics History', format: (v: number) => (v === -1 ? '∞' : v === 7 ? '7 days' : `${v} days`) },
                  { key: 'realtimeAnalytics', label: 'Realtime Analytics' },
                  { key: 'perLinkAnalytics', label: 'Per-Link Tracking' },
                  { key: 'customBackgrounds', label: 'Custom Backgrounds' },
                  { key: 'disableBranding', label: 'Remove Branding' },
                  { key: 'customCSS', label: 'Custom CSS' },
                  { key: 'animatedProfiles', label: 'Animated Profiles' },
                  { key: 'linkScheduling', label: 'Link Scheduling' },
                  { key: 'prioritySupport', label: 'Priority Support' },
                  { key: 'apiAccess', label: 'API Access' },
                  { key: 'lifetimeBadge', label: 'Lifetime Badge' },
                ].map((feature) => (
                  <tr key={feature.key} className="border-t" style={{ borderColor: theme.colors.border }}>
                    <td className="py-3 px-3 text-sm" style={{ color: theme.colors.foreground }}>
                      {feature.label}
                    </td>
                    {(['free', 'pro', 'creator', 'lifetime'] as TierType[]).map((tier) => {
                      const value = tiers?.[tier]?.limits[feature.key as keyof TierConfig['limits']]
                      const displayValue = feature.format
                        ? feature.format(value as number)
                        : value
                          ? true
                          : false

                      return (
                        <td key={tier} className="text-center py-3 px-3">
                          {typeof displayValue === 'boolean' ? (
                            displayValue ? (
                              <Check size={18} className="mx-auto" style={{ color: '#22c55e' }} />
                            ) : (
                              <X size={18} className="mx-auto" style={{ color: theme.colors.foregroundMuted }} />
                            )
                          ) : (
                            <span className="text-xs font-medium" style={{ color: theme.colors.foreground }}>
                              {displayValue}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowCancelConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
            >
              <div
                className="rounded-2xl p-6"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: theme.colors.foreground }}>
                      Cancel Subscription?
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                      This action can be undone
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-6" style={{ color: theme.colors.foreground }}>
                  Your subscription will remain active until the end of your current billing period.
                  After that, you'll be downgraded to the Free plan.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all"
                    style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90"
                    style={{ background: '#ef4444' }}
                  >
                    {cancelMutation.isPending ? 'Canceling...' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
