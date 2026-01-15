/**
 * BadgesTab - Display and manage user badges
 * Shows earned badges and progress toward auto-awarded badges
 */

import { motion } from 'motion/react'
import { useServerFn } from '@tanstack/react-start'
import { checkAndAwardBadgesFn } from '@/server/functions/badges'
import { BADGE_LIST, getBadgeConfigs, sortBadgesByRarity, type BadgeConfig } from '@/lib/badges'
import { Award, Sparkles, Lock, CheckCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface BadgesTabProps {
  badges: string[]
  accentColor: string
  referralCount: number
  isEarlyAdopter: boolean
}

export function BadgesTab({ badges, accentColor, referralCount, isEarlyAdopter }: BadgesTabProps) {
  const checkBadges = useServerFn(checkAndAwardBadgesFn)
  const [isChecking, setIsChecking] = useState(false)
  const [newBadges, setNewBadges] = useState<string[]>([])

  const earnedBadges = sortBadgesByRarity(getBadgeConfigs(badges))
  const allBadges = BADGE_LIST.filter(b => !b.adminOnly || badges.includes(b.id))

  const handleCheckBadges = async () => {
    setIsChecking(true)
    try {
      const result = await checkBadges({ data: undefined })
      if (result.awarded.length > 0) {
        setNewBadges(result.awarded)
        setTimeout(() => setNewBadges([]), 5000)
      }
    } catch (e) {
      console.error('Failed to check badges:', e)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accentColor}, var(--accent))` }}
          >
            <Award size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Your Badges</h2>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''} earned
            </p>
          </div>
        </div>
        <motion.button
          onClick={handleCheckBadges}
          disabled={isChecking}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isChecking ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Check for new badges
        </motion.button>
      </div>

      {newBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-500" />
            <span className="font-semibold text-green-500">New badges earned!</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getBadgeConfigs(newBadges).map(badge => (
              <span
                key={badge.id}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: badge.bgColor, color: badge.color }}
              >
                {badge.icon} {badge.name}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Earned Badges</h3>
        </div>
        <div className="p-4">
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {earnedBadges.map((badge, index) => (
                <BadgeCard key={badge.id} badge={badge} earned={true} delay={index * 0.05} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
              <p style={{ color: 'var(--foreground-muted)' }}>No badges earned yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                Complete achievements to earn badges!
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Available Badges</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Badges you can earn through achievements
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressBadge
              badge={BADGE_LIST.find(b => b.id === 'early_adopter')!}
              earned={badges.includes('early_adopter')}
              description="Be one of the first 100 users"
              progress={isEarlyAdopter ? 100 : 0}
              locked={!isEarlyAdopter && !badges.includes('early_adopter')}
            />
            <ProgressBadge
              badge={BADGE_LIST.find(b => b.id === 'referral_master')!}
              earned={badges.includes('referral_master')}
              description="Refer 10 or more users"
              progress={Math.min(100, (referralCount / 10) * 100)}
              progressText={`${referralCount}/10 referrals`}
            />
            <ProgressBadge
              badge={BADGE_LIST.find(b => b.id === 'premium')!}
              earned={badges.includes('premium')}
              description="Subscribe to Premium"
              progress={badges.includes('premium') ? 100 : 0}
            />
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Special Badges</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Awarded by admins for special achievements
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allBadges.filter(b => b.adminOnly && !['owner', 'admin'].includes(b.id)).map((badge, index) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={badges.includes(badge.id)}
                delay={index * 0.05}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface BadgeCardProps {
  badge: BadgeConfig
  earned: boolean
  delay?: number
}

function BadgeCard({ badge, earned, delay = 0 }: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-4 rounded-xl text-center transition-all ${earned ? '' : 'opacity-40 grayscale'}`}
      style={{
        background: earned ? badge.bgColor : 'var(--background-secondary)',
        border: `1px solid ${earned ? badge.color + '30' : 'var(--border)'}`,
      }}
    >
      <div className="text-3xl mb-2">{badge.icon}</div>
      <p className="font-semibold text-sm" style={{ color: earned ? badge.color : 'var(--foreground-muted)' }}>
        {badge.name}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
        {badge.description}
      </p>
      {!earned && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <Lock size={12} style={{ color: 'var(--foreground-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Locked</span>
        </div>
      )}
    </motion.div>
  )
}

interface ProgressBadgeProps {
  badge: BadgeConfig
  earned: boolean
  description: string
  progress: number
  progressText?: string
  locked?: boolean
}

function ProgressBadge({ badge, earned, description, progress, progressText, locked }: ProgressBadgeProps) {
  return (
    <div
      className={`p-4 rounded-xl ${locked ? 'opacity-50' : ''}`}
      style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${earned ? '' : 'grayscale opacity-60'}`}
          style={{ background: badge.bgColor }}
        >
          {badge.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color: earned ? badge.color : 'var(--foreground)' }}>
              {badge.name}
            </span>
            {earned && <CheckCircle size={14} className="text-green-500" />}
            {locked && <Lock size={14} style={{ color: 'var(--foreground-muted)' }} />}
          </div>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{description}</p>
          {!earned && !locked && (
            <div className="mt-2">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: badge.color, width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
              {progressText && (
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>{progressText}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
