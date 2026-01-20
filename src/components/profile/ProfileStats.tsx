import { motion } from 'motion/react'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { Eye, MousePointerClick, Heart, Users } from 'lucide-react'

interface ProfileStatsProps {
  profileViews: number
  linkClicks: number
  followers: number
  referrals: number
}

const STATS_CONFIG = [
  { key: 'views', label: 'Profile Views', icon: Eye, color: '#8b5cf6' },
  { key: 'clicks', label: 'Link Clicks', icon: MousePointerClick, color: '#f97316' },
  { key: 'followers', label: 'Followers', icon: Heart, color: '#ec4899' },
  { key: 'referrals', label: 'Referrals', icon: Users, color: '#10b981' },
] as const

export function ProfileStats({ profileViews, linkClicks, followers, referrals }: ProfileStatsProps) {
  const { theme } = useTheme()
  
  const values = {
    views: profileViews,
    clicks: linkClicks,
    followers,
    referrals,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {STATS_CONFIG.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15 + index * 0.05, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.03, y: -2 }}
          className="relative p-5 rounded-2xl text-center overflow-hidden group cursor-default"
          style={{
            background: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }}
        >
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15, transparent 70%)` }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)` }}
          />
          <motion.div
            className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center relative"
            style={{ background: `${stat.color}15` }}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
          >
            <stat.icon size={22} style={{ color: stat.color }} />
          </motion.div>
          <motion.p
            className="text-3xl font-bold mb-1"
            style={{ color: theme.colors.foreground }}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            {(values[stat.key] || 0).toLocaleString()}
          </motion.p>
          <p className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}
