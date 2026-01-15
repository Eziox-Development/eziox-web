/**
 * BadgeDisplay Component
 * Renders user badges with tooltips and animations
 */

import { motion } from 'motion/react'
import { getBadgeConfigs, sortBadgesByRarity, type BadgeConfig } from '@/lib/badges'

interface BadgeDisplayProps {
  badges: string[]
  size?: 'sm' | 'md' | 'lg'
  maxDisplay?: number
  showTooltip?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-5 h-5 text-xs',
  md: 'w-6 h-6 text-sm',
  lg: 'w-8 h-8 text-base',
}

const gapClasses = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
}

export function BadgeDisplay({
  badges,
  size = 'md',
  maxDisplay = 5,
  showTooltip = true,
  className = '',
}: BadgeDisplayProps) {
  if (!badges || badges.length === 0) return null

  const badgeConfigs = sortBadgesByRarity(getBadgeConfigs(badges))
  const displayBadges = badgeConfigs.slice(0, maxDisplay)
  const remainingCount = badgeConfigs.length - maxDisplay

  return (
    <div className={`flex items-center ${gapClasses[size]} ${className}`}>
      {displayBadges.map((badge, index) => (
        <BadgeIcon
          key={badge.id}
          badge={badge}
          size={size}
          showTooltip={showTooltip}
          delay={index * 0.05}
        />
      ))}
      {remainingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium`}
          style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
        >
          +{remainingCount}
        </motion.div>
      )}
    </div>
  )
}

interface BadgeIconProps {
  badge: BadgeConfig
  size: 'sm' | 'md' | 'lg'
  showTooltip: boolean
  delay?: number
}

function BadgeIcon({ badge, size, showTooltip, delay = 0 }: BadgeIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center cursor-default relative group`}
      style={{ background: badge.bgColor, border: `1px solid ${badge.color}30` }}
      title={showTooltip ? `${badge.name}: ${badge.description}` : undefined}
    >
      <span style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{badge.icon}</span>
      
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div className="font-semibold" style={{ color: badge.color }}>{badge.name}</div>
          <div style={{ color: 'var(--foreground-muted)' }}>{badge.description}</div>
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 -mt-1"
            style={{ background: 'var(--card)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
          />
        </div>
      )}
    </motion.div>
  )
}

interface BadgeListProps {
  badges: string[]
  className?: string
}

export function BadgeList({ badges, className = '' }: BadgeListProps) {
  if (!badges || badges.length === 0) return null

  const badgeConfigs = sortBadgesByRarity(getBadgeConfigs(badges))

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badgeConfigs.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: badge.bgColor, border: `1px solid ${badge.color}30` }}
        >
          <span>{badge.icon}</span>
          <span className="text-sm font-medium" style={{ color: badge.color }}>{badge.name}</span>
        </motion.div>
      ))}
    </div>
  )
}

interface SingleBadgeProps {
  badgeId: string
  size?: 'sm' | 'md' | 'lg'
}

export function SingleBadge({ badgeId, size = 'md' }: SingleBadgeProps) {
  const configs = getBadgeConfigs([badgeId])
  const badge = configs[0]
  if (!badge) return null

  return <BadgeIcon badge={badge} size={size} showTooltip={true} />
}
