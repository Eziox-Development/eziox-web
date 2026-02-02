import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { getCurrentSubscriptionFn, createBillingPortalSessionFn } from '@/server/functions/subscriptions'
import { Crown, Check, Zap, Sparkles, ExternalLink, ArrowRight, Shield, Loader2, Heart } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const PLAN_IDS = ['free', 'pro', 'creator', 'lifetime'] as const
type PlanId = typeof PLAN_IDS[number]

const PLAN_CONFIGS: Record<PlanId, { gradient: string; popular?: boolean; featureKeys: string[]; primary: string; badge?: string }> = {
  free: {
    gradient: 'from-gray-500 to-gray-600',
    primary: '#6b7280',
    featureKeys: ['links', 'analytics', 'support', 'themes'],
  },
  pro: {
    gradient: 'from-purple-500 to-pink-500',
    popular: true,
    primary: '#3b82f6',
    featureKeys: ['links', 'analytics', 'themes', 'support', 'api', 'customization'],
  },
  creator: {
    gradient: 'from-amber-500 to-orange-500',
    primary: '#f59e0b',
    featureKeys: ['everything', 'css', 'animated', 'video', 'whitelabel', 'support', 'advanced'],
  },
  lifetime: {
    gradient: 'from-emerald-500 to-teal-500',
    popular: true,
    primary: '#10b981',
    badge: 'BEST VALUE',
    featureKeys: ['everything', 'lifetime', 'updates', 'priority', 'exclusive'],
  },
}

export function SubscriptionTab() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const getSubscription = useServerFn(getCurrentSubscriptionFn)
  const createPortal = useServerFn(createBillingPortalSessionFn)

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => getSubscription(),
  })

  const currentTier = currentUser?.tier || 'free'


  const handleManageBilling = async () => {
    try {
      const result = await createPortal()
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Portal error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      key="subscription"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-foreground">{t('dashboard.subscription.title')}</h2>
        <p className="text-sm text-foreground-muted">
          {t('dashboard.subscription.currentPlan')}: <span className="text-primary font-medium capitalize">{currentTier}</span>
        </p>
      </div>

      {subscription?.subscription?.status === 'active' && (
        <div className="rounded-lg overflow-hidden bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-primary to-accent">
                <Crown size={24} className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground capitalize">{currentTier} Plan</p>
                <p className="text-sm text-foreground-muted">
                  {subscription.subscription?.currentPeriodEnd && (
                    <>{t('dashboard.subscription.nextBilling')}: {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleManageBilling}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background-secondary text-foreground hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
            >
              {t('dashboard.subscription.manageBilling')}
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_IDS.map((planId, index) => {
          const config = PLAN_CONFIGS[planId]
          const isCurrent = currentTier === planId
          const currentIndex = PLAN_IDS.indexOf(currentTier as PlanId)
          const isUpgrade = currentIndex < index

          return (
            <motion.div
              key={planId}
              className={`rounded-lg overflow-hidden border p-5 relative ${
                config.popular ? 'border-primary/50 bg-primary/5' : 'border-border bg-card/50'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              {config.popular && (
                <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                  {config.badge || t('dashboard.subscription.popular')}
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br ${config.gradient} mb-4`}>
                {planId === 'free' ? <Zap size={24} className="text-white" /> :
                 planId === 'pro' ? <Sparkles size={24} className="text-white" /> :
                 planId === 'creator' ? <Crown size={24} className="text-white" /> :
                 <Heart size={24} className="text-white" />}
              </div>

              <h3 className="text-xl font-bold text-foreground">
                {t(`dashboard.subscription.plans.${planId}.name`)}
              </h3>
              <div className="flex items-baseline gap-1 mt-2 mb-4">
                <span className="text-3xl font-bold text-foreground">
                  {t(`dashboard.subscription.plans.${planId}.price`)}
                </span>
                <span className="text-foreground-muted">
                  {planId === 'lifetime' ? t('pricing.billingType.oneTime') : t('dashboard.subscription.perMonth')}
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {config.featureKeys.map((featureKey) => (
                  <li key={featureKey} className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Check size={16} className="text-green-400 shrink-0" />
                    {t(`dashboard.subscription.plans.${planId}.features.${featureKey}`)}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2 bg-background-secondary border border-border" style={{ color: config.primary }}>
                  {planId === 'lifetime' ? <Heart size={16} /> : <Shield size={16} />}
                  {planId === 'lifetime' ? t('dashboard.subscription.lifetimeAccess') : t('dashboard.subscription.currentPlan')}
                </div>
              ) : isUpgrade && planId !== 'lifetime' ? (
                <Link to="/pricing">
                  <motion.div
                    className={`w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 bg-linear-to-r ${config.gradient} hover:opacity-90 transition-all duration-(--animation-speed)`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('dashboard.subscription.upgrade')}
                    <ArrowRight size={16} />
                  </motion.div>
                </Link>
              ) : (
                <Link to="/pricing">
                  <motion.div
                    className="w-full py-3 rounded-xl font-medium text-foreground-muted bg-background-secondary border border-border hover:bg-background-secondary/80 transition-all duration-(--animation-speed) flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('dashboard.subscription.downgrade')}
                    <ArrowRight size={16} />
                  </motion.div>
                </Link>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
