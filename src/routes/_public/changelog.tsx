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
  head: () => ({
    meta: [
      { title: 'Changelog - Latest Updates | Eziox' },
      { name: 'description', content: 'Stay updated with the latest features, improvements, and bug fixes on Eziox.' },
      { property: 'og:title', content: 'Changelog - Latest Updates | Eziox' },
      { property: 'og:description', content: 'Stay updated with the latest features, improvements, and bug fixes on Eziox.' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
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
    version: '1.4.0',
    date: 'January 16, 2026',
    title: 'Enhanced Partner Application System',
    description: 'Professional multi-category partner program with dynamic forms and comprehensive data collection.',
    icon: Sparkles,
    type: 'feature',
    items: [
      '11 specialized partner categories: Streamer, VTuber, Content Creator, Gamer, Developer, Game Creator, Artist, Musician, Brand, Agency, Other',
      '3-step application wizard with category selection, details, and about sections',
      'Dynamic form fields that adapt based on selected category',
      'Streamers/Content Creators: Platform selection (TikTok, Twitch, YouTube), follower ranges, content types',
      'Gamers: Main gamer tag, top 50 games selection, gaming platform profiles',
      'Developers: Developer types (Fullstack, Backend, Frontend), programming languages, portfolio links',
      'Game Creators: Game engine selection (Unity, Unreal, Godot), languages',
      'Artists & Musicians: Type classifications, portfolio/platform integrations',
      'Comprehensive constants library: 50+ games, 15+ programming languages, streaming platforms with brand colors',
      'JSONB storage for flexible category-specific data with extended database schema',
      'Modern glassmorphism UI with gradient accents and real-time Zod validation',
    ],
  },
  {
    version: '1.3.0',
    date: 'January 15, 2026',
    title: 'Modern Modal System & Complete UI Overhaul',
    description: 'New FollowModal component, dynamic page titles, and comprehensive UI redesign.',
    icon: Palette,
    type: 'improvement',
    items: [
      'New FollowModal component for followers/following with glass-morphism design',
      'Tab-based navigation with real-time search and auto-refresh',
      'Dynamic page titles and SEO metadata across all pages',
      'Profile page redesigned to 2-column layout with sidebar',
      'Leaderboard enhanced with podium display and placeholders',
      'Complete redesign of all public pages (Home, About, Changelog)',
      'Fixed React Hydration Error #300 in production',
      'Avatar display fix in profile sidebar',
      'ESLint errors resolved for better code quality',
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
      'Referral tracking in database',
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
      'Sign-in prompt for non-authenticated users',
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
      'Removed debug console.log statements',
    ],
  },
  {
    version: '1.0.0',
    date: 'January 14, 2026',
    title: 'Eziox Platform Launch',
    description: 'Complete platform migration and public launch.',
    icon: Rocket,
    type: 'announcement',
    items: [
      'Migrated to Neon PostgreSQL with Drizzle ORM',
      'Bio link pages for all users (eziox.link/{username})',
      'Link management with click tracking',
      'Profile customization (avatar, banner, bio)',
      'Theme customization with accent colors',
      'User stats tracking (views, clicks, followers)',
      'Cloudinary image upload integration',
      'Creator leaderboard with score system',
    ],
  },
  {
    version: '0.9.0',
    date: 'January 13, 2026',
    title: 'Major Platform Overhaul',
    description: 'Complete redesign of authentication and navigation.',
    icon: Palette,
    type: 'improvement',
    items: [
      'Complete Sign In/Sign Up page redesign',
      'Modern Navbar with user dropdown',
      'Redesigned Footer with social links',
      'ProfileCard component redesign',
      'Removed unused Blog components',
      'Fixed Nav menu links',
    ],
  },
  {
    version: '0.8.0',
    date: 'January 12, 2026',
    title: 'Bio Pages & Cleanup',
    description: 'Bio page system and codebase modernization.',
    icon: Users,
    type: 'feature',
    items: [
      'Bio pages at eziox.link/{username}',
      'Links page overlap fix',
      'Homepage auth-aware CTA buttons',
      'Leaderboard redesign',
      'Codebase cleanup and modernization',
    ],
  },
  {
    version: '0.7.0',
    date: 'January 11, 2026',
    title: 'Cloudinary Integration',
    description: 'Image upload system with Cloudinary.',
    icon: Zap,
    type: 'feature',
    items: [
      'Cloudinary ImageUpload component',
      'Avatar upload on profile page',
      'Banner upload support',
      'Image optimization and CDN delivery',
    ],
  },
  {
    version: '0.6.0',
    date: 'January 10, 2026',
    title: 'Discord-Style Profile',
    description: 'Complete profile page redesign inspired by Discord.',
    icon: Palette,
    type: 'improvement',
    items: [
      'Discord-style profile page design',
      'Real user data integration',
      'Profile page positioning fixes',
      'Enhanced profile system',
    ],
  },
  {
    version: '0.5.0',
    date: 'January 9, 2026',
    title: 'Auth UX Improvements',
    description: 'Better authentication experience.',
    icon: Zap,
    type: 'improvement',
    items: [
      'Improved auth UX and homepage layout',
      'Fixed sign-in input fields clickability',
      'Enhanced profile card with owner config',
      'Modernized auth experience',
    ],
  },
  {
    version: '0.4.0',
    date: 'January 8, 2026',
    title: 'Documentation Update',
    description: 'Complete documentation overhaul.',
    icon: Rocket,
    type: 'improvement',
    items: [
      'Translated all German text to English',
      'Updated architecture overview',
      'Documentation for Vercel + Appwrite architecture',
      'ESLint configuration updates',
    ],
  },
  {
    version: '0.3.0',
    date: 'January 7, 2026',
    title: 'Vercel Deployment',
    description: 'Production-ready deployment configuration.',
    icon: Rocket,
    type: 'feature',
    items: [
      'TanStack Start configured for Vercel',
      'Production deployment configuration',
      'Environment variable management',
      'Removed .env.production file',
    ],
  },
  {
    version: '0.2.0',
    date: 'January 6, 2026',
    title: 'Name Change: Portfolio → Eziox',
    description: 'Rebranding from personal portfolio to Eziox platform.',
    icon: Sparkles,
    type: 'announcement',
    items: [
      'Renamed project from Portfolio to Eziox',
      'New domain: eziox.link',
      'Updated branding throughout',
      'New logo and icon',
    ],
  },
  {
    version: '0.1.0',
    date: 'January 5, 2026',
    title: 'Initial Project Setup',
    description: 'Project foundation with core features.',
    icon: Rocket,
    type: 'announcement',
    items: [
      'Initial project setup with TanStack Start',
      'UI components with shadcn/ui',
      'Blog system (later removed)',
      'Scripts and tooling setup',
      'Originally for private/portfolio use',
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
