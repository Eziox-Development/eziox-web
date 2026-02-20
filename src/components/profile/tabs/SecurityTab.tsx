import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Shield, Lock, Fingerprint, KeyRound, AlertTriangle, ExternalLink,
} from 'lucide-react'
import type { ProfileUser } from '../types'

interface SecurityTabProps { currentUser: ProfileUser }

export function SecurityTab({ currentUser: _currentUser }: SecurityTabProps) {
  void _currentUser
  const { t } = useTranslation()

  const securityItems = [
    {
      icon: Lock,
      title: t('dashboard.security.password'),
      desc: t('dashboard.security.passwordDesc'),
      status: 'ok' as const,
      action: { label: t('dashboard.security.changePassword'), href: '/forgot-password' },
      color: 'primary',
    },
    {
      icon: Shield,
      title: t('dashboard.security.twoFactor'),
      desc: t('dashboard.security.twoFactorDesc'),
      status: 'warning' as 'ok' | 'warning',
      action: { label: t('dashboard.security.manage2FA'), href: '/profile?tab=settings' },
      color: 'amber',
    },
    {
      icon: Fingerprint,
      title: t('dashboard.security.sessions'),
      desc: t('dashboard.security.sessionsDesc'),
      status: 'ok' as const,
      action: { label: t('dashboard.security.manageSessions'), href: '/profile?tab=settings' },
      color: 'cyan',
    },
    {
      icon: KeyRound,
      title: t('dashboard.security.apiKeys'),
      desc: t('dashboard.security.apiKeysDesc'),
      status: 'ok' as const,
      action: { label: t('dashboard.security.manageKeys'), href: '/profile?tab=api' },
      color: 'purple',
    },
  ]

  return (
    <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-6"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl bg-primary/8 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="relative flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-linear-to-br from-primary/20 to-accent/10"
          >
            <Shield size={28} className="text-primary" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('dashboard.security.title')}</h2>
            <p className="text-sm text-foreground-muted">{t('dashboard.security.subtitle')}</p>
          </div>
        </div>

        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative mt-5 p-4 rounded-xl backdrop-blur-sm bg-background-secondary/20 border border-border/15"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{t('dashboard.security.securityScore')}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{t('dashboard.security.scoreDesc')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 rounded-full bg-background-secondary/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <span className="text-sm font-bold text-primary">
                75%
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Security Items */}
      <div className="space-y-3">
        {securityItems.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.005 }}
              className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5 theme-animation"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    item.color === 'primary' ? 'bg-primary/15' : item.color === 'emerald' ? 'bg-emerald-500/15' : item.color === 'amber' ? 'bg-amber-500/15' : item.color === 'cyan' ? 'bg-cyan-500/15' : 'bg-purple-500/15'
                  }`}>
                    <Icon size={22} className={
                      item.color === 'primary' ? 'text-primary' : item.color === 'emerald' ? 'text-emerald-400' : item.color === 'amber' ? 'text-amber-400' : item.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'
                    } />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      {item.status === 'warning' && (
                        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} />
                          {t('dashboard.security.recommended')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-muted">{item.desc}</p>
                  </div>
                </div>
                <a
                  href={item.action.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/40 backdrop-blur-sm border border-border/15 text-foreground-muted hover:bg-card/60 hover:text-foreground theme-animation text-sm font-medium"
                >
                  {item.action.label}
                  <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl backdrop-blur-xl bg-card/20 border border-border/15 p-5"
      >
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Shield size={16} className="text-primary" />
          {t('dashboard.security.tips')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['tip1', 'tip2', 'tip3', 'tip4'].map((tip, i) => (
            <motion.div
              key={tip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex items-start gap-2 p-3 rounded-xl bg-background-secondary/10 backdrop-blur-sm border border-border/10"
            >
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-xs text-foreground-muted">{t(`dashboard.security.${tip}`)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
