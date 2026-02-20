import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { getReferralStatsFn } from '@/server/functions/referrals'
import { Gift, Copy, Check, Users, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getAppUrl } from '@/lib/utils'

export function ReferralsTab() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const getReferralStats = useServerFn(getReferralStatsFn)

  const { data: stats } = useQuery({
    queryKey: ['referralStats'],
    queryFn: () => getReferralStats(),
  })

  const referralCode = currentUser?.profile?.referralCode || 'LOADING'
  const referralLink = `${getAppUrl()}/sign-up?ref=${referralCode}`

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <motion.div key="referrals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-6"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-accent/8 pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl bg-primary/10 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="relative flex items-center gap-4 mb-6">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-linear-to-br from-primary to-accent glow-primary"
          >
            <Gift size={28} className="text-primary-foreground" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('dashboard.referrals.title')}</h2>
            <p className="text-sm text-foreground-muted">{t('dashboard.referrals.howItWorks')}</p>
          </div>
        </div>

        {/* Animated Stat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring' as const, stiffness: 260, damping: 24 }}
          className="relative p-5 rounded-xl backdrop-blur-sm bg-background-secondary/20 border border-border/15 text-center mb-6"
        >
          <Users size={24} className="mx-auto mb-2 text-primary" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-foreground tabular-nums"
          >
            {stats?.referralCount || 0}
          </motion.p>
          <p className="text-xs text-foreground-muted mt-1">{t('dashboard.referrals.totalReferrals')}</p>
        </motion.div>

        {/* Referral Code & Link */}
        <div className="relative space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-muted">{t('dashboard.referrals.yourCode')}</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl font-mono text-lg backdrop-blur-sm bg-background-secondary/30 border border-border/20 text-primary">
                {referralCode}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(referralCode, 'code')}
                className="p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/15 hover:bg-card/60 theme-animation"
              >
                {copied === 'code' ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} className="text-foreground-muted" />}
              </motion.button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.referrals.yourLink')}</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl backdrop-blur-sm bg-background-secondary/30 border border-border/20 font-mono text-sm text-accent truncate">
                {referralLink}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(referralLink, 'link')}
                className="p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/15 hover:bg-card/60 theme-animation"
              >
                {copied === 'link' ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} className="text-foreground-muted" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-6"
      >
        <h3 className="font-bold text-foreground mb-4">{t('dashboard.referrals.howItWorks')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: 1, text: t('dashboard.referrals.step1'), color: 'primary' },
            { step: 2, text: t('dashboard.referrals.step2'), color: 'accent' },
            { step: 3, text: t('dashboard.referrals.step3'), color: 'green' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-sm bg-background-secondary/20 border border-border/15"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                item.color === 'primary' ? 'bg-primary/15 text-primary' : item.color === 'accent' ? 'bg-accent/15 text-accent' : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                {item.step}
              </div>
              <p className="text-sm text-foreground-muted">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Referrals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 overflow-hidden"
      >
        <div className="p-5 border-b border-border/15">
          <h3 className="font-bold text-foreground">{t('dashboard.referrals.recentReferrals')}</h3>
        </div>
        <div className="p-5">
          {stats?.referredUsers?.length ? (
            <div className="space-y-3">
              {stats.referredUsers.map((ref, i) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm bg-background-secondary/20 border border-border/10"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    {ref.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">@{ref.username}</p>
                    <p className="text-xs text-foreground-muted">{new Date(ref.joinedAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles size={32} className="mx-auto mb-3 text-foreground-muted/30" />
              <p className="text-foreground-muted">{t('dashboard.referrals.noReferrals')}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
