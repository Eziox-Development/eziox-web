import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { getReferralStatsFn } from '@/server/functions/referrals'
import { Gift, Copy, Check, Users } from 'lucide-react'
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
    <motion.div
      key="referrals"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="overflow-hidden backdrop-blur-xl p-6 rounded-lg bg-linear-to-br from-primary/10 via-transparent to-accent/10 border border-border/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-linear-to-br from-primary to-accent">
            <Gift size={28} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t('dashboard.referrals.title')}
            </h2>
            <p className="text-sm text-foreground-muted">
              {t('dashboard.referrals.howItWorks')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="p-4 rounded-lg text-center bg-background-secondary/30">
            <Users size={24} className="mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {stats?.referralCount || 0}
            </p>
            <p className="text-xs text-foreground-muted">
              {t('dashboard.referrals.totalReferrals')}
            </p>
          </div>
        </div>

        {/* Referral Code */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-muted">
              {t('dashboard.referrals.yourCode')}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl font-mono text-lg bg-background-secondary/30 border border-border/20 text-primary">
                {referralCode}
              </div>
              <button
                onClick={() => copyToClipboard(referralCode, 'code')}
                className="p-3 rounded-xl bg-background-secondary/50 hover:bg-background-secondary transition-colors duration-(--animation-speed)"
              >
                {copied === 'code' ? (
                  <Check size={20} className="text-green-400" />
                ) : (
                  <Copy size={20} className="text-foreground-muted" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              {t('dashboard.referrals.yourLink')}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl bg-background-secondary/30 border border-border/20 font-mono text-sm text-accent truncate">
                {referralLink}
              </div>
              <button
                onClick={() => copyToClipboard(referralLink, 'link')}
                className="p-3 rounded-xl bg-background-secondary/50 hover:bg-background-secondary transition-colors duration-(--animation-speed)"
              >
                {copied === 'link' ? (
                  <Check size={20} className="text-green-400" />
                ) : (
                  <Copy size={20} className="text-foreground-muted" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-lg overflow-hidden bg-card/50 border border-border backdrop-blur-xl p-6">
        <h3 className="font-bold text-foreground mb-4">
          {t('dashboard.referrals.howItWorks')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: 1, text: t('dashboard.referrals.step1'), color: 'primary' },
            { step: 2, text: t('dashboard.referrals.step2'), color: 'accent' },
            { step: 3, text: t('dashboard.referrals.step3'), color: 'green' },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-center gap-3 p-4 rounded-xl bg-background-secondary/30"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  item.color === 'primary'
                    ? 'bg-primary/20 text-primary'
                    : item.color === 'accent'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-green-500/20 text-green-400'
                }`}
              >
                {item.step}
              </div>
              <p className="text-sm text-foreground-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="rounded-lg overflow-hidden bg-card/50 border border-border backdrop-blur-xl">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-foreground">
            {t('dashboard.referrals.recentReferrals')}
          </h3>
        </div>
        <div className="p-5">
          {stats?.referredUsers?.length ? (
            <div className="space-y-3">
              {stats.referredUsers.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary/30"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    {ref.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      @{ref.username}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(ref.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users
                size={32}
                className="mx-auto mb-3 text-foreground-muted/30"
              />
              <p className="text-foreground-muted">
                {t('dashboard.referrals.noReferrals')}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
