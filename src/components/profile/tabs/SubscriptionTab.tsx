import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { getCurrentSubscriptionFn, createBillingPortalSessionFn } from '@/server/functions/subscriptions'
import { Crown, Check, Zap, Sparkles, ExternalLink, ArrowRight, Shield, Loader2, Heart } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const PLAN_IDS = ['free', 'pro', 'creator', 'lifetime'] as const
type PlanId = (typeof PLAN_IDS)[number]

const PLAN_CONFIGS: Record<PlanId, { gradient: string; popular?: boolean; featureKeys: string[]; primary: string; badge?: string }> = {
  free: { gradient: 'from-gray-500 to-gray-600', primary: '#6b7280', featureKeys: ['links', 'analytics', 'support', 'themes'] },
  pro: { gradient: 'from-purple-500 to-pink-500', popular: true, primary: '#3b82f6', featureKeys: ['links', 'analytics', 'themes', 'support', 'api', 'customization'] },
  creator: { gradient: 'from-amber-500 to-orange-500', primary: '#f59e0b', featureKeys: ['everything', 'css', 'animated', 'video', 'whitelabel', 'support', 'advanced'] },
  lifetime: { gradient: 'from-emerald-500 to-teal-500', popular: true, primary: '#10b981', badge: 'BEST VALUE', featureKeys: ['everything', 'lifetime', 'updates', 'priority', 'exclusive'] },
}

export function SubscriptionTab() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const getSubscription = useServerFn(getCurrentSubscriptionFn)
  const createPortal = useServerFn(createBillingPortalSessionFn)

  const { data: subscription, isLoading } = useQuery({ queryKey: ['subscription'], queryFn: () => getSubscription() })
  const currentTier = currentUser?.tier || 'free'

  const handleManageBilling = async () => {
    try {
      const result = await createPortal()
      if (result.url) window.location.href = result.url
    } catch (error) { console.error('Portal error:', error) }
  }

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>

  return (
    <motion.div key="subscription" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t('dashboard.subscription.title')}</h2>
        <p className="text-sm text-foreground-muted">
          {t('dashboard.subscription.currentPlan')}: <span className="text-primary font-medium capitalize">{currentTier}</span>
        </p>
      </div>

      {subscription?.subscription?.status === 'active' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-primary/20 p-5">
          <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-accent/8 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-primary to-accent glow-primary">
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
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleManageBilling}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/40 backdrop-blur-sm border border-border/20 text-foreground hover:bg-card/60 theme-animation">
              {t('dashboard.subscription.manageBilling')}<ExternalLink size={14} />
            </motion.button>
          </div>
        </motion.div>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`relative rounded-2xl overflow-hidden backdrop-blur-xl border p-5 theme-animation ${
                config.popular ? 'border-primary/30 bg-card/40' : 'border-border/20 bg-card/25'
              }`}
            >
              {config.popular && (
                <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground glow-primary">
                  {config.badge || t('dashboard.subscription.popular')}
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />

              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br ${config.gradient} mb-4`}
                  style={{ boxShadow: `0 4px 20px ${config.primary}30` }}
                >
                  {planId === 'free' ? <Zap size={24} className="text-white" /> : planId === 'pro' ? <Sparkles size={24} className="text-white" /> : planId === 'creator' ? <Crown size={24} className="text-white" /> : <Heart size={24} className="text-white" />}
                </motion.div>

                <h3 className="text-xl font-bold text-foreground">{t(`dashboard.subscription.plans.${planId}.name`)}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-4">
                  <span className="text-3xl font-bold text-foreground">{t(`dashboard.subscription.plans.${planId}.price`)}</span>
                  <span className="text-foreground-muted">{planId === 'lifetime' ? t('pricing.billingType.oneTime') : t('dashboard.subscription.perMonth')}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {config.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-center gap-2 text-sm text-foreground-muted">
                      <Check size={16} className="text-emerald-400 shrink-0" />
                      {t(`dashboard.subscription.plans.${planId}.features.${featureKey}`)}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2 bg-card/50 backdrop-blur-sm border border-border/20" style={{ color: config.primary }}>
                    {planId === 'lifetime' ? <Heart size={16} /> : <Shield size={16} />}
                    {planId === 'lifetime' ? t('dashboard.subscription.lifetimeAccess') : t('dashboard.subscription.currentPlan')}
                  </div>
                ) : isUpgrade && planId !== 'lifetime' ? (
                  <Link to="/pricing">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 bg-linear-to-r ${config.gradient} hover:opacity-90 theme-animation`}
                      style={{ boxShadow: `0 4px 20px ${config.primary}25` }}>
                      {t('dashboard.subscription.upgrade')}<ArrowRight size={16} />
                    </motion.div>
                  </Link>
                ) : (
                  <Link to="/pricing">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl font-medium text-foreground-muted bg-card/40 backdrop-blur-sm border border-border/20 hover:bg-card/60 theme-animation flex items-center justify-center gap-2">
                      {t('dashboard.subscription.downgrade')}<ArrowRight size={16} />
                    </motion.div>
                  </Link>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
