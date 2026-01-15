/**
 * Changelog Page
 * Modern timeline design showing platform updates and new features
 */

import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles,
  Zap,
  Gift,
  Users,
  Palette,
  Rocket,
  Bell,
  CheckCircle,
} from 'lucide-react'

export const Route = createFileRoute('/_public/changelog')({
  component: ChangelogPage,
})

interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  icon: React.ElementType
  type: 'feature' | 'improvement' | 'fix' | 'announcement'
  items: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: 'January 15, 2026',
    title: 'Complete UI Redesign',
    description: 'Modern glassmorphism design across all public and protected pages.',
    icon: Palette,
    type: 'improvement',
    items: [
      'Redesigned Homepage with live stats',
      'New Profile page with real-time data',
      'Redesigned Links manager',
      'Updated Referrals dashboard',
      'New About, Changelog, Leaderboard pages',
      'Animated background effects',
    ],
  },
  {
    version: '1.2.0',
    date: 'January 14, 2026',
    title: 'Referral System',
    description: 'Invite friends and earn rewards with our new referral program.',
    icon: Gift,
    type: 'feature',
    items: [
      'Personal referral codes for every user',
      'Referral join page at /join/{code}',
      'Earn +5 points for each successful referral',
      'Track your referrals in the dashboard',
      'Owner-only special code "EZIOX"',
    ],
  },
  {
    version: '1.1.0',
    date: 'January 14, 2026',
    title: 'Followers System',
    description: 'Connect with other creators and build your community.',
    icon: Users,
    type: 'feature',
    items: [
      'Follow/Unfollow button on all bio pages',
      'Followers and following list pages',
      'Real-time follower count updates',
      'Score system: +2 for each follower gained',
      'Clickable stats linking to lists',
    ],
  },
  {
    version: '1.0.1',
    date: 'January 14, 2026',
    title: 'Bug Fixes & Improvements',
    description: 'Various fixes and UI improvements.',
    icon: Zap,
    type: 'fix',
    items: [
      'Session-based view tracking deduplication',
      'Fixed link click tracking with null safety',
      'Session persistence with 7-day expiry',
      'Bio page glassmorphism effects',
      'Spring animations for smoother interactions',
    ],
  },
  {
    version: '1.0.0',
    date: 'January 14, 2026',
    title: 'Platform Launch',
    description: 'Eziox is officially live! Create your bio link page today.',
    icon: Rocket,
    type: 'announcement',
    items: [
      'User authentication with secure sessions',
      'Bio page creation and customization',
      'Link management with click tracking',
      'Profile customization (avatar, banner, bio)',
      'Theme customization with accent colors',
      'User stats tracking (views, clicks, followers)',
    ],
  },
]

const typeConfig = {
  feature: { label: 'New Feature', color: 'bg-green-500', textColor: 'text-green-500' },
  improvement: { label: 'Improvement', color: 'bg-blue-500', textColor: 'text-blue-500' },
  fix: { label: 'Bug Fix', color: 'bg-orange-500', textColor: 'text-orange-500' },
  announcement: { label: 'Announcement', color: 'bg-purple-500', textColor: 'text-purple-500' },
}

function ChangelogPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(99, 102, 241, 0.08))' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#22c55e' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={14} className="text-white" />
            </motion.div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Changelog
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Stay up to date with the latest features, improvements, and updates to Eziox.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div 
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 transform md:-translate-x-1/2"
            style={{ background: 'var(--border)' }}
          />

          {/* Entries */}
          <div className="space-y-12">
            {changelog.map((entry, index) => {
              const config = typeConfig[entry.type]
              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-start gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Timeline Dot */}
                  <div 
                    className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 z-10"
                    style={{ background: 'var(--primary)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}
                  />

                  {/* Content */}
                  <div className={`flex-1 ml-16 md:ml-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <Card className="overflow-hidden hover:scale-[1.02] transition-transform">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className={`flex items-center gap-3 mb-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                          <div 
                            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                              entry.type === 'feature' ? 'from-green-500 to-emerald-500' :
                              entry.type === 'improvement' ? 'from-blue-500 to-cyan-500' :
                              entry.type === 'fix' ? 'from-orange-500 to-amber-500' :
                              'from-purple-500 to-violet-500'
                            }`}
                          >
                            <entry.icon size={24} className="text-white" />
                          </div>
                          <div className={isEven ? 'md:text-right' : ''}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={config.textColor}>
                                {config.label}
                              </Badge>
                              <Badge variant="secondary">v{entry.version}</Badge>
                            </div>
                            <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                              {entry.date}
                            </p>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                          {entry.title}
                        </h3>
                        <p className="mb-4" style={{ color: 'var(--foreground-muted)' }}>
                          {entry.description}
                        </p>

                        {/* Items */}
                        <ul className={`space-y-2 ${isEven ? 'md:text-left' : ''}`}>
                          {entry.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Subscribe Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--background-secondary)' }}
              >
                <Bell size={32} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Stay Updated
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                Follow us on social media to get notified about new features and updates.
              </p>
              <div className="flex items-center justify-center gap-4">
                <motion.a
                  href="https://twitter.com/eziox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-semibold text-white"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Follow @eziox
                </motion.a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
