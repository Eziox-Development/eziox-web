import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  Sparkles,
  Shield,
  Palette,
  Users,
  Globe,
  Rocket,
  Wrench,
  Star,
  Calendar,
  ChevronRight,
  Gamepad2,
  Code2,
  Brush,
  MonitorPlay,
  Cat,
  Minimize2,
  Lock,
  RotateCcw,
  Sliders,
  Grid3X3,
} from 'lucide-react'
import { useTheme } from '@/components/portfolio/ThemeProvider'

export const Route = createFileRoute('/_public/changelog')({
  head: () => ({
    meta: [
      { title: 'Changelog | Eziox' },
      { name: 'description', content: 'Stay updated with the latest features, improvements, and bug fixes on Eziox.' },
      { property: 'og:title', content: 'Changelog - Latest Updates | Eziox' },
      { property: 'og:description', content: 'Stay updated with the latest features, improvements, and bug fixes on Eziox.' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: ChangelogPage,
})

type ChangeType = 'feature' | 'improvement' | 'fix' | 'security' | 'breaking'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  icon: React.ElementType
  type: ChangeType
  highlights?: string[]
  changes: {
    type: ChangeType
    text: string
  }[]
}

const typeConfig: Record<ChangeType, { label: string; color: string; bgColor: string }> = {
  feature: { label: 'Feature', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
  improvement: { label: 'Improvement', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  fix: { label: 'Fix', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  security: { label: 'Security', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  breaking: { label: 'Breaking', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.5.0',
    date: 'January 16, 2026',
    title: 'Cloudflare-Style Bot Protection & UI Enhancements',
    description: 'Revolutionary security system overhaul with modern challenge types and improved theme experience.',
    icon: Shield,
    type: 'security',
    highlights: [
      'No more emoji-based challenges',
      'Professional Cloudflare-inspired verification',
      'Larger, more comfortable theme selector',
    ],
    changes: [
      { type: 'feature', text: 'Slider Challenge: Drag to precise percentage position for verification' },
      { type: 'feature', text: 'Rotate Challenge: Click to rotate dial to target angle' },
      { type: 'feature', text: 'Pattern Challenge: Click cells in correct sequence order' },
      { type: 'security', text: 'Random challenge selection for each verification attempt' },
      { type: 'security', text: 'Maintained honeypot, timing, and interaction tracking' },
      { type: 'fix', text: 'Fixed homepage gradient covering "Identity" text on various themes' },
      { type: 'improvement', text: 'ThemeSwitcher width increased from 420px to 520px' },
      { type: 'improvement', text: 'Theme grid max-height increased to 400px for better browsing' },
      { type: 'fix', text: 'Fixed TypeScript TS7030 errors in useEffect hooks' },
    ],
  },
  {
    version: '1.4.2',
    date: 'January 16, 2026',
    title: 'Comprehensive Theme System',
    description: 'Massive expansion of the theme library with 8 categories and 25+ unique themes.',
    icon: Palette,
    type: 'feature',
    highlights: [
      '8 theme categories for every creator type',
      'Custom typography per theme',
      'Dynamic visual effects system',
    ],
    changes: [
      { type: 'feature', text: 'Gamer themes: Neon Arcade, RGB Gaming, Cyberpunk Night' },
      { type: 'feature', text: 'VTuber themes: Kawaii Pink, Virtual Idol, Neon Vtuber' },
      { type: 'feature', text: 'Anime themes: Shonen Fire, Slice of Life, Mecha Chrome' },
      { type: 'feature', text: 'Developer themes: Terminal Green, VS Code Dark, GitHub Dark' },
      { type: 'feature', text: 'Streamer themes: Twitch Purple, Live Stream, Broadcast' },
      { type: 'feature', text: 'Artist themes: Watercolor, Canvas, Gallery' },
      { type: 'feature', text: 'Minimal themes: Clean White, Pure Dark, Monochrome' },
      { type: 'improvement', text: 'Theme effects: glowIntensity, borderRadius, cardStyle, animationSpeed' },
      { type: 'improvement', text: 'Custom Google Fonts per theme (display + body)' },
      { type: 'improvement', text: 'CSS variables for dynamic theme switching' },
    ],
  },
  {
    version: '1.4.1',
    date: 'January 16, 2026',
    title: 'TypeScript 6.0+ & Icon Migration',
    description: 'Future-proof TypeScript configuration and modern brand icon implementation.',
    icon: Wrench,
    type: 'improvement',
    changes: [
      { type: 'improvement', text: 'TypeScript 6.0+ compatibility: Removed deprecated baseUrl' },
      { type: 'improvement', text: 'Migrated to explicit path mappings with full relative paths' },
      { type: 'improvement', text: 'Replaced deprecated Lucide brand icons with react-icons/si' },
      { type: 'improvement', text: 'Created centralized social-icons.tsx for icon management' },
      { type: 'fix', text: 'Fixed Vite build warnings: Removed NODE_ENV from .env' },
      { type: 'fix', text: 'Removed conflicting esbuild config (oxc is now default minifier)' },
    ],
  },
  {
    version: '1.4.0',
    date: 'January 16, 2026',
    title: 'Enhanced Partner Application System',
    description: 'Professional multi-category partner program with dynamic forms.',
    icon: Users,
    type: 'feature',
    changes: [
      { type: 'feature', text: 'Multi-category partner applications (Content Creator, Developer, Brand, etc.)' },
      { type: 'feature', text: 'Dynamic form fields based on selected category' },
      { type: 'feature', text: 'Comprehensive data collection for better partner matching' },
      { type: 'improvement', text: 'Improved admin review interface' },
    ],
  },
  {
    version: '1.3.0',
    date: 'January 15, 2026',
    title: 'Homepage Redesign & Live Stats',
    description: 'Complete homepage overhaul with real-time data and modern UI/UX.',
    icon: Rocket,
    type: 'feature',
    highlights: [
      'Dynamic hero with theme-aware gradients',
      'Live platform statistics',
      'Top creators leaderboard',
    ],
    changes: [
      { type: 'feature', text: 'Theme-aware gradient backgrounds that adapt to selected theme' },
      { type: 'feature', text: 'Real-time platform statistics (users, clicks, uptime)' },
      { type: 'feature', text: 'Top creators leaderboard with avatar rings and medals' },
      { type: 'feature', text: 'Theme category showcase with live counts' },
      { type: 'improvement', text: 'Motion animations throughout the page' },
      { type: 'improvement', text: 'Responsive design for all screen sizes' },
    ],
  },
  {
    version: '1.2.0',
    date: 'January 14, 2026',
    title: 'Cookie Consent & Legal Pages',
    description: 'GDPR-compliant cookie management and comprehensive legal documentation.',
    icon: Lock,
    type: 'feature',
    changes: [
      { type: 'feature', text: 'Cookie consent banner with granular controls' },
      { type: 'feature', text: 'Privacy Policy page with markdown rendering' },
      { type: 'feature', text: 'Terms of Service page' },
      { type: 'feature', text: 'Cookie Policy page' },
      { type: 'security', text: 'GDPR and CCPA compliance measures' },
    ],
  },
  {
    version: '1.1.0',
    date: 'January 13, 2026',
    title: 'Authentication Redesign',
    description: 'Modern sign-in and sign-up pages with enhanced security.',
    icon: Shield,
    type: 'improvement',
    changes: [
      { type: 'improvement', text: 'Split-screen layout with branding panel' },
      { type: 'improvement', text: 'Password strength indicator with requirements' },
      { type: 'feature', text: 'Terms and Privacy checkbox requirement' },
      { type: 'improvement', text: 'Mobile-optimized responsive design' },
      { type: 'security', text: 'Bot protection integration' },
    ],
  },
  {
    version: '1.0.0',
    date: 'January 10, 2026',
    title: 'Initial Release',
    description: 'Eziox launches with core bio link functionality.',
    icon: Star,
    type: 'feature',
    highlights: [
      'Create your unique bio link page',
      'Customize with themes',
      'Track analytics',
    ],
    changes: [
      { type: 'feature', text: 'User registration and authentication' },
      { type: 'feature', text: 'Customizable bio link pages' },
      { type: 'feature', text: 'Link management with drag-and-drop' },
      { type: 'feature', text: 'Basic analytics (views, clicks)' },
      { type: 'feature', text: 'Theme selection' },
      { type: 'feature', text: 'Social media link integration' },
    ],
  },
]

const categoryIcons = [
  { icon: Gamepad2, label: 'Gamer', color: '#00ff00' },
  { icon: Cat, label: 'VTuber', color: '#ff6b9d' },
  { icon: Sparkles, label: 'Anime', color: '#ff4500' },
  { icon: Code2, label: 'Developer', color: '#58a6ff' },
  { icon: MonitorPlay, label: 'Streamer', color: '#9146ff' },
  { icon: Brush, label: 'Artist', color: '#e8a87c' },
  { icon: Minimize2, label: 'Minimal', color: '#888888' },
]

const challengeTypes = [
  { icon: Sliders, label: 'Slider', desc: 'Drag to position' },
  { icon: RotateCcw, label: 'Rotate', desc: 'Click to rotate' },
  { icon: Grid3X3, label: 'Pattern', desc: 'Sequence input' },
]

function ChangelogPage() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{ background: theme.colors.primary }}
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{ background: theme.colors.accent }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}
          >
            <Sparkles size={16} style={{ color: theme.colors.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>
              {changelog.length} Releases
            </span>
          </motion.div>

          <h1
            className="text-4xl lg:text-6xl font-bold mb-4"
            style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}
          >
            What's{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            >
              New
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
            Stay updated with the latest features, improvements, and fixes. We're constantly evolving to give you the best experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 p-6 rounded-3xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            >
              <Palette size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Theme Categories</h3>
              <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>25+ themes across 8 categories</p>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {categoryIcons.map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-105"
                style={{ background: theme.colors.backgroundSecondary }}
              >
                <cat.icon size={20} style={{ color: cat.color }} />
                <span className="text-[10px] font-medium" style={{ color: theme.colors.foregroundMuted }}>{cat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12 p-6 rounded-3xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: theme.colors.foreground }}>New Bot Protection</h3>
              <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Cloudflare-inspired security challenges</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {challengeTypes.map((ch) => (
              <div
                key={ch.label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl"
                style={{ background: theme.colors.backgroundSecondary }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99, 102, 241, 0.15)' }}
                >
                  <ch.icon size={24} style={{ color: '#6366f1' }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>{ch.label}</span>
                <span className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>{ch.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative">
          <div
            className="absolute left-8 top-0 bottom-0 w-px"
            style={{ background: `linear-gradient(to bottom, ${theme.colors.primary}50, ${theme.colors.border}, transparent)` }}
          />

          <div className="space-y-8">
            {changelog.map((entry, index) => (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="relative pl-20"
              >
                <div
                  className="absolute left-4 w-8 h-8 rounded-xl flex items-center justify-center z-10"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                >
                  <entry.icon size={16} className="text-white" />
                </div>

                <div
                  className="p-6 rounded-2xl transition-all hover:scale-[1.01]"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: 'white' }}
                    >
                      v{entry.version}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: typeConfig[entry.type].bgColor, color: typeConfig[entry.type].color }}
                    >
                      {typeConfig[entry.type].label}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      <Calendar size={12} />
                      {entry.date}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.foreground }}>
                    {entry.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: theme.colors.foregroundMuted }}>
                    {entry.description}
                  </p>

                  {entry.highlights && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                        >
                          <Star size={10} style={{ color: theme.colors.primary }} />
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {entry.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0"
                          style={{ background: typeConfig[change.type].bgColor, color: typeConfig[change.type].color }}
                        >
                          {change.type}
                        </span>
                        <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                          {change.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <Globe size={18} style={{ color: theme.colors.primary }} />
            <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              More updates coming soon
            </span>
            <ChevronRight size={16} style={{ color: theme.colors.foregroundMuted }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
