import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { getBadgeConfigs, sortBadgesByRarity, type BadgeConfig } from '@/lib/badges'
import * as LucideIcons from 'lucide-react'

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
        <MoreBadgesButton badgeConfigs={badgeConfigs.slice(maxDisplay)} size={size} remainingCount={remainingCount} />
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
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 })

  const show = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!showTooltip) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top })
  }

  const hide = () => {
    if (!showTooltip) return
    setTooltip((prev) => ({ ...prev, visible: false }))
  }

  const IconComponent = LucideIcons[badge.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: 'spring', stiffness: 300 }}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center cursor-default`}
        style={{ background: badge.bgColor, border: `1px solid ${badge.color}30` }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={(event) => show(event as unknown as React.MouseEvent<HTMLDivElement>)}
        onBlur={hide}
        tabIndex={showTooltip ? 0 : -1}
      >
        {IconComponent ? <IconComponent size={iconSize} style={{ color: badge.color }} /> : null}
      </motion.div>

      {showTooltip && (
        <FloatingTooltip visible={tooltip.visible} x={tooltip.x} y={tooltip.y}>
          <div
            className="px-3 py-2 rounded-xl text-xs whitespace-nowrap"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div className="font-semibold" style={{ color: badge.color }}>{badge.name}</div>
            <div style={{ color: 'var(--foreground-muted)' }}>{badge.description}</div>
          </div>
        </FloatingTooltip>
      )}
    </>
  )
}

function MoreBadgesButton({ badgeConfigs, size, remainingCount }: { badgeConfigs: BadgeConfig[]; size: 'sm' | 'md' | 'lg'; remainingCount: number }) {
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 })

  const show = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top })
  }

  const hide = () => setTooltip((prev) => ({ ...prev, visible: false }))

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium cursor-default`}
        style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={(event) => show(event as unknown as React.MouseEvent<HTMLDivElement>)}
        onBlur={hide}
        tabIndex={0}
      >
        +{remainingCount}
      </motion.div>

      <FloatingTooltip visible={tooltip.visible} x={tooltip.x} y={tooltip.y}>
        <div
          className="px-3 py-2 rounded-xl text-xs min-w-max"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>More Badges</div>
          <div className="flex flex-col gap-1.5">
            {badgeConfigs.map((badge) => {
              const IconComponent = LucideIcons[badge.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; style?: React.CSSProperties }>
              return (
                <div key={badge.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: badge.bgColor }}>
                    {IconComponent && <IconComponent size={10} style={{ color: badge.color }} />}
                  </div>
                  <span style={{ color: badge.color }}>{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </FloatingTooltip>
    </>
  )
}

function FloatingTooltip({ visible, x, y, children }: { visible: boolean; x: number; y: number; children: React.ReactNode }) {
  if (!visible || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed z-10000 pointer-events-none"
      style={{ top: y - 8, left: x, transform: 'translate(-50%, -100%)' }}
    >
      {children}
    </div>,
    document.body
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
          {(() => {
            const IconComponent = LucideIcons[badge.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; style?: React.CSSProperties }>
            return IconComponent ? <IconComponent size={16} style={{ color: badge.color }} /> : null
          })()}
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
