import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  getTierConfigFn,
  getCurrentSubscriptionFn,
  createBillingPortalSessionFn,
  cancelSubscriptionFn,
  resumeSubscriptionFn,
} from '@/server/functions/subscriptions'
import {
  Crown,
  Zap,
  Check,
  CreditCard,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Star,
  Gem,
  ArrowUpRight,
  Shield,
  Sparkles,
  Clock,
  RefreshCw,
} from 'lucide-react'
import type { TierType, TierConfig } from '@/server/lib/stripe'

const TIER_ICONS: Record<TierType, React.ElementType> = {
  free: Zap,
  pro: Star,
  creator: Crown,
  lifetime: Gem,
}

const TIER_STYLES: Record<TierType, { primary: string; gradient: string; glow: string }> = {
  free: { primary: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', glow: 'rgba(107, 114, 128, 0.3)' },
  pro: { primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', glow: 'rgba(59, 130, 246, 0.3)' },
  creator: { primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', glow: 'rgba(245, 158, 11, 0.3)' },
  lifetime: { primary: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', glow: 'rgba(236, 72, 153, 0.3)' },
}

export function SubscriptionTab() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const getTierConfig = useServerFn(getTierConfigFn)
  const getCurrentSubscription = useServerFn(getCurrentSubscriptionFn)
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

  const billingPortalMutation = useMutation({
    mutationFn: () => createBillingPortal(),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url
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
  const currentConfig = tiers?.[currentTier]
  const currentStyles = TIER_STYLES[currentTier]
  const CurrentIcon = TIER_ICONS[currentTier]

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.colors.primary }} />
      </motion.div>
    )
  }

  return (
    <motion.div key="subscription" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, boxShadow: `0 0 40px ${currentStyles.glow}` }}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="p-6 relative overflow-hidden" style={{ background: currentStyles.gradient }}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl bg-white" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl bg-white" />
          </div>
          <div className="relative flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <CurrentIcon size={32} className="text-white" />
            </motion.div>
            <div>
              <p className="text-white/70 text-sm font-medium">Current Plan</p>
              <h2 className="text-3xl font-bold text-white">{currentConfig?.name || currentTier}</h2>
              <p className="text-white/60 text-sm">{currentConfig?.tagline}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {subscription ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} style={{ color: theme.colors.foregroundMuted }} />
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      {subscription.cancelAtPeriodEnd ? 'Ends on' : 'Next billing'}
                    </span>
                  </div>
                  <p className="font-semibold" style={{ color: theme.colors.foreground }}>{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={14} style={{ color: theme.colors.foregroundMuted }} />
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Amount</span>
                  </div>
                  <p className="font-semibold" style={{ color: theme.colors.foreground }}>
                    €{currentConfig?.price || 0}{currentConfig?.billingType === 'monthly' ? '/mo' : ''}
                  </p>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                  <AlertTriangle size={20} className="text-red-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-500">Subscription ending</p>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      Your plan will downgrade to Free after {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => resumeMutation.mutate()}
                    disabled={resumeMutation.isPending}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                    style={{ background: '#22c55e' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {resumeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    Resume
                  </motion.button>
                </motion.div>
              )}

              <div className="flex gap-3">
                <motion.button
                  onClick={() => billingPortalMutation.mutate()}
                  disabled={billingPortalMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {billingPortalMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  Manage Billing
                  <ExternalLink size={14} />
                </motion.button>

                {!subscription.cancelAtPeriodEnd && (
                  <motion.button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-5 py-3 rounded-xl font-medium text-sm transition-all"
                    style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                    whileHover={{ background: 'rgba(239, 68, 68, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${theme.colors.primary}15` }}>
                <Shield size={24} style={{ color: theme.colors.primary }} />
              </div>
              <p className="font-medium mb-1" style={{ color: theme.colors.foreground }}>Free Plan Active</p>
              <p className="text-sm mb-4" style={{ color: theme.colors.foregroundMuted }}>Upgrade to unlock premium features</p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
              >
                <Sparkles size={16} />
                View Plans
                <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      <div className="rounded-2xl overflow-hidden" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
          <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Your Features</h3>
          <Link to="/pricing" className="text-sm font-medium flex items-center gap-1" style={{ color: theme.colors.primary }}>
            Compare Plans <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currentConfig?.features.slice(0, 9).map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 p-3 rounded-xl"
                style={{ background: theme.colors.backgroundSecondary }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${currentStyles.primary}20` }}>
                  <Check size={12} style={{ color: currentStyles.primary }} />
                </div>
                <span className="text-sm" style={{ color: theme.colors.foreground }}>{feature}</span>
              </motion.div>
            ))}
          </div>
          {currentConfig && currentConfig.features.length > 9 && (
            <p className="text-center text-sm mt-4" style={{ color: theme.colors.foregroundMuted }}>
              +{currentConfig.features.length - 9} more features included
            </p>
          )}
        </div>
      </div>

      {currentTier !== 'lifetime' && currentTier !== 'creator' && (
        <motion.div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}15)`, border: `1px solid ${theme.colors.primary}30` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
              <Crown size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{ color: theme.colors.foreground }}>Upgrade Your Experience</h3>
              <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                Unlock custom CSS, fonts, custom domains, and more
              </p>
            </div>
            <Link
              to="/pricing"
              className="px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            >
              <Sparkles size={16} />
              Upgrade
            </Link>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowCancelConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4">
              <div className="rounded-2xl p-6" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Cancel Subscription?</h3>
                    <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>This action can be undone</p>
                  </div>
                </div>
                <p className="text-sm mb-6" style={{ color: theme.colors.foreground }}>
                  Your subscription will remain active until the end of your current billing period. After that, you'll be downgraded to the Free plan.
                </p>
                <div className="flex gap-3">
                  <motion.button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 rounded-xl font-medium text-sm" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Keep Subscription
                  </motion.button>
                  <motion.button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="flex-1 py-3 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2" style={{ background: '#ef4444' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {cancelMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                    {cancelMutation.isPending ? 'Canceling...' : 'Cancel'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
