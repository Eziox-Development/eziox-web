import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Award,
  Star,
  Zap,
  Crown,
  Gift,
  Users,
  Code,
  Sparkles,
  Heart,
  Bug,
  Trophy,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface BadgesTabProps {
  badges: string[]
  referralCount: number
  isEarlyAdopter: boolean
  tier?: string
  hasApiKeys?: boolean
  isPartner?: boolean
  isStaff?: boolean
}

interface BadgeConfig {
  id: string
  icon: LucideIcon
  color: string
  gradient: string
}

const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  early_adopter: {
    id: 'early_adopter',
    icon: Star,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
  },
  verified: {
    id: 'verified',
    icon: Shield,
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-500',
  },
  premium: {
    id: 'premium',
    icon: Crown,
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-pink-500',
  },
  creator: {
    id: 'creator',
    icon: Sparkles,
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-500',
  },
  lifetime: {
    id: 'lifetime',
    icon: Crown,
    color: '#fbbf24',
    gradient: 'from-yellow-400 to-amber-500',
  },
  referrer_bronze: {
    id: 'referrer_bronze',
    icon: Gift,
    color: '#cd7f32',
    gradient: 'from-amber-600 to-amber-800',
  },
  referrer_silver: {
    id: 'referrer_silver',
    icon: Gift,
    color: '#c0c0c0',
    gradient: 'from-gray-300 to-gray-500',
  },
  referrer_gold: {
    id: 'referrer_gold',
    icon: Gift,
    color: '#ffd700',
    gradient: 'from-yellow-400 to-amber-500',
  },
  community: {
    id: 'community',
    icon: Users,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
  },
  developer: {
    id: 'developer',
    icon: Code,
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-500',
  },
  supporter: {
    id: 'supporter',
    icon: Heart,
    color: '#ef4444',
    gradient: 'from-red-500 to-pink-500',
  },
  partner: {
    id: 'partner',
    icon: UserCheck,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
  },
  staff: {
    id: 'staff',
    icon: Zap,
    color: '#a855f7',
    gradient: 'from-violet-500 to-purple-500',
  },
  bug_hunter: {
    id: 'bug_hunter',
    icon: Bug,
    color: '#f97316',
    gradient: 'from-orange-500 to-red-500',
  },
  top_creator: {
    id: 'top_creator',
    icon: Trophy,
    color: '#eab308',
    gradient: 'from-yellow-500 to-orange-500',
  },
}

const DEFAULT_CONFIG: BadgeConfig = {
  id: 'unknown',
  icon: Shield,
  color: '#6366f1',
  gradient: 'from-purple-500 to-cyan-500',
}

export function BadgesTab({
  badges,
  referralCount,
  isEarlyAdopter,
  tier = 'free',
  hasApiKeys = false,
  isPartner = false,
  isStaff = false,
}: BadgesTabProps) {
  const { t } = useTranslation()

  // Build the list of all possible badges with their earned status
  const allBadges = [
    // Account badges
    {
      id: 'early_adopter',
      earned: isEarlyAdopter || badges.includes('early_adopter'),
    },
    { id: 'verified', earned: badges.includes('verified') },

    // Subscription badges
    {
      id: 'premium',
      earned:
        tier === 'pro' ||
        tier === 'creator' ||
        tier === 'lifetime' ||
        badges.includes('premium'),
    },
    {
      id: 'creator',
      earned:
        tier === 'creator' || tier === 'lifetime' || badges.includes('creator'),
    },
    {
      id: 'lifetime',
      earned: tier === 'lifetime' || badges.includes('lifetime'),
    },

    // Referral badges
    { id: 'referrer_bronze', earned: referralCount >= 5 },
    { id: 'referrer_silver', earned: referralCount >= 25 },
    { id: 'referrer_gold', earned: referralCount >= 100 },

    // Activity badges
    { id: 'community', earned: badges.includes('community') },
    { id: 'developer', earned: hasApiKeys || badges.includes('developer') },
    { id: 'supporter', earned: badges.includes('supporter') },

    // Special badges
    { id: 'partner', earned: isPartner || badges.includes('partner') },
    { id: 'staff', earned: isStaff || badges.includes('staff') },
    { id: 'bug_hunter', earned: badges.includes('bug_hunter') },
    { id: 'top_creator', earned: badges.includes('top_creator') },
  ]

  const earnedBadges = allBadges.filter((b) => b.earned)
  const lockedBadges = allBadges.filter((b) => !b.earned)

  const getBadgeConfig = (id: string): BadgeConfig => {
    return BADGE_CONFIGS[id] || { ...DEFAULT_CONFIG, id }
  }

  return (
    <motion.div
      key="badges"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {t('dashboard.badges.title')}
        </h2>
        <p className="text-sm text-foreground-muted">
          {earnedBadges.length} {t('dashboard.badges.earned')}
        </p>
      </div>

      {earnedBadges.length > 0 && (
        <div className="overflow-hidden p-5 rounded-lg bg-card/10 border border-border/20">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground">
            <Award size={18} className="text-amber-400" />
            {t('dashboard.badges.earned')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge, i) => {
              const config = getBadgeConfig(badge.id)
              const Icon = config.icon
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg bg-background-secondary/30 text-center group hover:bg-background-secondary/50 transition-colors duration-(--animation-speed)"
                >
                  <div
                    className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center bg-linear-to-br ${config.gradient}`}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                  <p className="font-medium text-foreground text-sm">
                    {t(`dashboard.badges.items.${badge.id}.name`, {
                      defaultValue: badge.id,
                    })}
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">
                    {t(`dashboard.badges.items.${badge.id}.description`, {
                      defaultValue: '',
                    })}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {lockedBadges.length > 0 && (
        <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
          <h3 className="font-bold text-foreground-muted mb-4 flex items-center gap-2">
            <Shield size={18} />
            {t('dashboard.badges.locked')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedBadges.map((badge) => {
              const config = getBadgeConfig(badge.id)
              const Icon = config.icon
              return (
                <div
                  key={badge.id}
                  className="p-4 rounded-lg bg-background-secondary/20 text-center opacity-40"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center bg-background-secondary/50">
                    <Icon size={28} className="text-foreground-muted" />
                  </div>
                  <p className="font-medium text-foreground-muted text-sm">
                    {t(`dashboard.badges.items.${badge.id}.name`, {
                      defaultValue: badge.id,
                    })}
                  </p>
                  <p className="text-xs text-foreground-muted/50 mt-1">
                    {t(`dashboard.badges.items.${badge.id}.description`, {
                      defaultValue: '',
                    })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && (
        <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-12 text-center">
          <Shield size={48} className="mx-auto mb-4 text-foreground-muted/30" />
          <p className="text-foreground-muted mb-2">
            {t('dashboard.badges.noBadges')}
          </p>
          <p className="text-sm text-foreground-muted/50">
            {t('dashboard.badges.keepGoing')}
          </p>
        </div>
      )}
    </motion.div>
  )
}
