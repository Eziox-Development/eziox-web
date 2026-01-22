import { useState, useMemo, useRef, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  Shield,
  Palette,
  Users,
  Rocket,
  Wrench,
  Star,
  Calendar,
  ChevronRight,
  ChevronLeft,
  MonitorPlay,
  Lock,
  BarChart3,
  Sliders,
  Crown,
  Search,
  X,
  Tag,
  Clock,
  ArrowUp,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'

export const Route = createFileRoute('/_public/changelog')({
  head: () => ({
    meta: [
      { title: 'Changelog | Eziox' },
      {
        name: 'description',
        content:
          'Stay updated with the latest features, improvements, and bug fixes on Eziox.',
      },
      { property: 'og:title', content: 'Changelog - Latest Updates | Eziox' },
      {
        property: 'og:description',
        content:
          'Stay updated with the latest features, improvements, and bug fixes on Eziox.',
      },
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

const typeConfig: Record<
  ChangeType,
  { label: string; color: string; bgColor: string }
> = {
  feature: {
    label: 'Feature',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
  },
  improvement: {
    label: 'Improvement',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  fix: { label: 'Fix', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  security: {
    label: 'Security',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  breaking: {
    label: 'Breaking',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.5.0',
    date: 'January 21, 2026',
    title: 'Email Verification & Schema Modernization',
    description:
      'Complete email verification system, modern bio page schema with media embeds, link groups, widgets, and social integrations. Cleaned up deprecated features.',
    icon: Shield,
    type: 'feature',
    highlights: [
      'Email verification on signup',
      'Media embeds (Spotify, YouTube, etc.)',
      'Link groups for organization',
      'Profile widgets system',
      'Schema cleanup & optimization',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Email verification system with /verify-email route',
      },
      {
        type: 'feature',
        text: 'Media embeds - Spotify, SoundCloud, YouTube, Twitch, TikTok, Apple Music',
      },
      {
        type: 'feature',
        text: 'Link groups - Organize links into collapsible sections',
      },
      {
        type: 'feature',
        text: 'Profile widgets - Spotify, Weather, Countdown, Social Feed',
      },
      {
        type: 'feature',
        text: 'Social integrations - Connect YouTube, Twitch, TikTok accounts',
      },
      { type: 'feature', text: 'Media library for uploaded files' },
      { type: 'feature', text: 'Custom domains table for Creator tier' },
      { type: 'feature', text: 'Email subscribers for creators' },
      {
        type: 'improvement',
        text: 'Updated Privacy Policy with IP anonymization details',
      },
      { type: 'improvement', text: 'Updated legal pages dates' },
      { type: 'fix', text: 'Removed deprecated blog and projects tables' },
      { type: 'fix', text: 'Removed A/B testing and UTM tracking fields' },
      { type: 'fix', text: 'Added missing schema relations and type exports' },
    ],
  },
  {
    version: '2.4.0',
    date: 'January 20, 2026',
    title: 'Tier System Simplification & Profile Refactor',
    description:
      'Complete overhaul of subscription tiers with expanded free tier and fair pricing. Modular profile architecture with better code organization. Redesigned public pages with "no paywalls" philosophy.',
    icon: Crown,
    type: 'improvement',
    highlights: [
      'Free tier now includes unlimited everything',
      'Pro tier reduced to $2.99/month',
      'Creator tier $5.99 with professional features',
      'Modular profile architecture',
      'Redesigned About & Homepage',
    ],
    changes: [
      {
        type: 'improvement',
        text: 'Free tier expanded - unlimited links, all themes, all backgrounds, full analytics',
      },
      {
        type: 'improvement',
        text: 'Pro tier $2.99 - Custom CSS, fonts, backups, remove branding',
      },
      {
        type: 'improvement',
        text: 'Creator tier $5.99 - Custom domain, password links, email collection',
      },
      {
        type: 'improvement',
        text: 'Lifetime tier $29 - One payment, all features forever',
      },
      {
        type: 'improvement',
        text: 'Modular profile system - ProfileDashboard, Sidebar, Header, Stats',
      },
      {
        type: 'improvement',
        text: 'Profile route optimized from 461 to 22 lines',
      },
      {
        type: 'improvement',
        text: 'Centralized constants and types for better maintainability',
      },
      {
        type: 'improvement',
        text: 'About page redesigned with "no paywalls" messaging',
      },
      { type: 'improvement', text: 'Homepage performance optimizations' },
      {
        type: 'fix',
        text: 'Removed artificial limits on links, themes, and analytics',
      },
      { type: 'fix', text: 'Fixed TypeScript errors in CustomizationTab' },
      {
        type: 'fix',
        text: 'Cleaned up LinkAdvancedSettings (removed A/B testing, UTM, embed controls)',
      },
    ],
  },
  {
    version: '2.3.0',
    date: 'January 20, 2026',
    title: 'Playground & Theme Refactor',
    description:
      'Completely redesigned Playground with live preview, animated backgrounds, and unified theme system. Removed redundant Appearance settings in favor of ThemeSwitcher.',
    icon: Sliders,
    type: 'feature',
    highlights: [
      'New modern Playground with live preview',
      'Animated background presets',
      'Unified theme system via ThemeSwitcher',
      'Removed redundant Appearance settings',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Completely redesigned Playground with live data preview',
      },
      { type: 'feature', text: 'Desktop/Mobile preview toggle in Playground' },
      {
        type: 'feature',
        text: 'Animated background presets (30+ presets in 5 categories)',
      },
      {
        type: 'feature',
        text: 'Contained animation mode for preview containers',
      },
      {
        type: 'improvement',
        text: 'Unified theme system - ThemeSwitcher now controls all colors',
      },
      {
        type: 'improvement',
        text: 'Removed Appearance section from Settings (redundant with ThemeSwitcher)',
      },
      {
        type: 'improvement',
        text: 'Live Preview now larger and more prominent',
      },
      {
        type: 'fix',
        text: 'Fixed Vite HMR warning for ANIMATED_PRESETS export',
      },
      {
        type: 'fix',
        text: 'Fixed animated backgrounds not showing on Bio Page',
      },
      {
        type: 'fix',
        text: 'Fixed TypeScript error for non-existent /archive route',
      },
    ],
  },
  {
    version: '2.2.0',
    date: 'January 20, 2026',
    title: 'Link Analytics & Scheduling',
    description:
      'Comprehensive link analytics system with per-click tracking, geographic data, device stats, and click heatmaps. Plus advanced link scheduling with countdown timers.',
    icon: BarChart3,
    type: 'feature',
    highlights: [
      'Per-link click analytics',
      'Geographic & device tracking',
      'Click heatmap by hour',
      'Link scheduling with countdown',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Per-link click analytics with detailed tracking',
      },
      {
        type: 'feature',
        text: 'Geographic data: country, city, region tracking',
      },
      { type: 'feature', text: 'Device/browser/OS statistics' },
      { type: 'feature', text: 'Click heatmap visualization by hour (0-23)' },
      { type: 'feature', text: 'Link scheduling with start/end dates' },
      {
        type: 'feature',
        text: 'Countdown timer display (minimal, detailed, badge styles)',
      },
      { type: 'feature', text: 'Analytics tab in Link Advanced Settings' },
      {
        type: 'fix',
        text: 'Fixed Cloudflare Turnstile infinite verification loop',
      },
      {
        type: 'improvement',
        text: 'Enhanced OG, SEO, and social sharing metadata',
      },
      { type: 'improvement', text: 'Footer now uses full viewport width' },
      {
        type: 'improvement',
        text: 'Links management consolidated in profile tabs',
      },
      { type: 'improvement', text: 'Updated PWA manifest with Eziox branding' },
    ],
  },
  {
    version: '2.1.0',
    date: 'January 19, 2026',
    title: 'Security & Privacy Features',
    description:
      'Comprehensive security overhaul with Cloudflare Turnstile, OAuth encryption, GDPR compliance, admin audit logging, and self-service data management.',
    icon: Shield,
    type: 'security',
    highlights: [
      'Cloudflare Turnstile bot protection',
      'OAuth token encryption (AES-256-GCM)',
      'GDPR data export & account deletion',
      'Admin audit logging system',
    ],
    changes: [
      {
        type: 'security',
        text: 'Cloudflare Turnstile integration on sign-up, sign-in, and forgot-password',
      },
      {
        type: 'security',
        text: 'CSRF protection with token generation and validation',
      },
      {
        type: 'security',
        text: 'OAuth tokens encrypted at rest with AES-256-GCM',
      },
      { type: 'security', text: 'Magic bytes validation for file uploads' },
      {
        type: 'security',
        text: 'Security event logging system for audit trails',
      },
      {
        type: 'feature',
        text: 'Admin audit log table for tracking admin actions',
      },
      {
        type: 'feature',
        text: 'Authorization helpers for role-based access control',
      },
      { type: 'feature', text: 'Self-service data export (GDPR compliance)' },
      { type: 'feature', text: 'Account deletion with complete data purge' },
      { type: 'feature', text: 'HSTS headers for HTTPS enforcement' },
      {
        type: 'improvement',
        text: 'Enhanced security headers (CSP, X-Frame-Options, etc.)',
      },
      {
        type: 'improvement',
        text: 'Updated Privacy Policy with self-service options',
      },
      {
        type: 'improvement',
        text: 'Updated Cookie Policy with Turnstile information',
      },
      { type: 'improvement', text: 'Added Security contact to footer' },
      { type: 'fix', text: 'Removed old custom bot protection system' },
      { type: 'fix', text: 'Improved session validation and error handling' },
    ],
  },
  {
    version: '2.0.0',
    date: 'January 19, 2026',
    title: 'Theme System Modernization',
    description:
      'Complete overhaul of the theme system with 31 modernized themes, Tailwind CSS color palettes, and cleaned up configuration.',
    icon: Palette,
    type: 'feature',
    highlights: [
      '31 themes completely modernized',
      'New eziox-default signature theme',
      'Tailwind CSS color alignment',
    ],
    changes: [
      {
        type: 'feature',
        text: 'New eziox-default theme with deep black (#030305) and violet (#8b5cf6) accents',
      },
      {
        type: 'feature',
        text: 'All 31 themes updated with modern color palettes',
      },
      {
        type: 'improvement',
        text: 'General themes: eziox-default, obsidian, midnight, ember',
      },
      {
        type: 'improvement',
        text: 'Gamer themes: neon-green, rgb-fusion, cyberpunk with vibrant neon colors',
      },
      {
        type: 'improvement',
        text: 'VTuber themes: kawaii-pink, pastel-dream, anime-night with soft aesthetics',
      },
      {
        type: 'improvement',
        text: 'Developer themes: terminal, github-dark, vscode with authentic colors',
      },
      {
        type: 'improvement',
        text: 'Streamer themes: twitch, youtube, kick with official brand colors',
      },
      {
        type: 'improvement',
        text: 'Artist themes: canvas, watercolor, gallery with elegant palettes',
      },
      {
        type: 'improvement',
        text: 'Premium themes: ocean-depths, forest-night, neon-tokyo, sakura-bloom, monochrome-pro',
      },
      {
        type: 'improvement',
        text: 'Modern typography: Inter, Plus Jakarta Sans, Outfit, Space Grotesk, JetBrains Mono',
      },
      {
        type: 'improvement',
        text: 'Deeper, richer background colors for better contrast',
      },
      {
        type: 'fix',
        text: 'Fixed duplicate pastel-dream theme (renamed to sakura-bloom)',
      },
      {
        type: 'fix',
        text: 'Removed unused site-config properties: owner details, header, navigation, footerLinks',
      },
      {
        type: 'fix',
        text: 'Updated CSS variables to match new eziox-default theme',
      },
    ],
  },
  {
    version: '1.9.0',
    date: 'January 19, 2026',
    title: 'UI Modernization - Templates & Playground',
    description:
      'Complete redesign of Templates and Playground pages with modern UI/UX, motion animations, and improved user experience.',
    icon: Palette,
    type: 'feature',
    highlights: [
      'Templates page completely redesigned',
      'Playground rebuilt from scratch',
      'Live preview with device toggle',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Templates page with compact hero, modern cards, and spring animations',
      },
      {
        type: 'feature',
        text: 'Playground rebuilt with tab-based interface and live preview',
      },
      { type: 'feature', text: 'Desktop/mobile preview toggle in Playground' },
      {
        type: 'feature',
        text: 'File upload support for images and videos in backgrounds',
      },
      {
        type: 'feature',
        text: 'Gradient editor with color pickers and angle control',
      },
      {
        type: 'feature',
        text: 'Link style presets: default, minimal, bold, glass',
      },
      {
        type: 'improvement',
        text: 'Spring-based motion animations throughout',
      },
      {
        type: 'improvement',
        text: 'Consistent theme system usage across all components',
      },
      {
        type: 'improvement',
        text: 'Modern Lucide icons (Code2, Wand2, LayoutGrid, etc.)',
      },
      { type: 'fix', text: 'Fixed nav overlap issue in Playground page' },
      { type: 'fix', text: 'Fixed deprecated Tailwind classes' },
    ],
  },
  {
    version: '1.8.0',
    date: 'January 18, 2026',
    title: 'Creator Tier Features - Full Creative Freedom',
    description:
      'Complete implementation of Creator tier with custom CSS, fonts, animations, advanced link features, and Pro tier enhancements.',
    icon: Palette,
    type: 'feature',
    highlights: [
      'Custom CSS editor with security validation',
      'Advanced link features: Featured, Scheduling, A/B Testing, UTM',
      '6 new premium themes for Pro tier',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Custom CSS Editor with sandboxed validation and forbidden pattern detection',
      },
      {
        type: 'feature',
        text: 'Custom Font Uploads - up to 4 fonts with Google Fonts support',
      },
      {
        type: 'feature',
        text: 'Animated Profiles - avatar, banner, link hover, and page transition effects',
      },
      {
        type: 'feature',
        text: 'Custom Open Graph previews for social sharing',
      },
      {
        type: 'feature',
        text: 'Featured Links with 5 special styles (glow, gradient, outline, neon)',
      },
      {
        type: 'feature',
        text: 'Link Scheduling with start/end dates and timezone support',
      },
      {
        type: 'feature',
        text: 'A/B Testing for links - compare up to 4 variants with click tracking',
      },
      {
        type: 'feature',
        text: 'UTM Parameters for marketing campaign tracking',
      },
      {
        type: 'feature',
        text: 'Advanced Embed Controls for Spotify, YouTube, SoundCloud',
      },
      {
        type: 'feature',
        text: '6 Premium Themes: Ocean Depths, Forest Night, Neon Tokyo, Pastel Dream, Monochrome Pro, Aurora',
      },
      {
        type: 'feature',
        text: 'Custom Backgrounds (solid, gradient, image) for Pro tier',
      },
      {
        type: 'feature',
        text: 'Layout Fine-Tuning with spacing, border-radius, and shadow controls',
      },
      { type: 'feature', text: 'Profile Backups & Restore functionality' },
      {
        type: 'improvement',
        text: 'Theme switcher now shows premium badges and tier-locks',
      },
      {
        type: 'improvement',
        text: 'LinksTab enhanced with advanced settings modal',
      },
      {
        type: 'improvement',
        text: 'Creator tab integrated in profile dashboard',
      },
      {
        type: 'security',
        text: 'CSS sanitization with forbidden pattern detection',
      },
      {
        type: 'security',
        text: 'Tier-based access control on all Creator features',
      },
    ],
  },
  {
    version: '1.7.0',
    date: 'January 18, 2026',
    title: 'Premium Tiers & Stripe Integration',
    description:
      'Complete subscription system with 4 tiers, Stripe payments, and automatic badge rewards.',
    icon: Crown,
    type: 'feature',
    highlights: [
      '4 Premium Tiers: Free, Pro, Creator, Lifetime',
      'Stripe checkout & billing portal',
      'Automatic premium badges',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Premium tier system with Free, Pro (€4.99/mo), Creator (€9.99/mo), and Lifetime (€30)',
      },
      {
        type: 'feature',
        text: 'Stripe Checkout integration for secure payments',
      },
      { type: 'feature', text: 'Billing portal for subscription management' },
      {
        type: 'feature',
        text: 'Automatic badge awards: Pro, Creator, and Lifetime badges',
      },
      { type: 'feature', text: 'Tier-based feature limits and access control' },
      { type: 'feature', text: 'Subscription tab in profile settings' },
      {
        type: 'feature',
        text: 'Feature comparison table with all tier benefits',
      },
      { type: 'improvement', text: 'Modern pricing cards with glow effects' },
      { type: 'improvement', text: 'Real-time subscription status display' },
      {
        type: 'security',
        text: 'Stripe webhook verification for secure events',
      },
    ],
  },
  {
    version: '1.6.0',
    date: 'January 17, 2026',
    title: 'Analytics Dashboard & Notifications System',
    description:
      'Comprehensive profile analytics and real-time notification center for enhanced user engagement.',
    icon: BarChart3,
    type: 'feature',
    highlights: [
      'Full analytics dashboard with charts and exports',
      'Real-time notification system in navbar',
      'Track profile performance over time',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Analytics Dashboard with overview stats, daily charts, and top links',
      },
      {
        type: 'feature',
        text: 'Time range selector (7D, 30D, 90D, 1Y) for analytics',
      },
      {
        type: 'feature',
        text: 'CSV and JSON export functionality for analytics data',
      },
      {
        type: 'feature',
        text: 'NotificationBell component with unread count badge',
      },
      {
        type: 'feature',
        text: 'Multiple notification types: followers, milestones, badges, system',
      },
      {
        type: 'feature',
        text: 'Mark as read and delete notifications (individual and bulk)',
      },
      {
        type: 'improvement',
        text: 'New database tables for notifications and daily analytics',
      },
      {
        type: 'improvement',
        text: 'Theme-aware components with smooth animations',
      },
    ],
  },
  {
    version: '1.5.0',
    date: 'January 16, 2026',
    title: 'Spotify Integration - Real-Time Music Playback',
    description:
      'Complete Spotify OAuth integration with live playback display on bio pages.',
    icon: MonitorPlay,
    type: 'feature',
    highlights: [
      'OAuth 2.0 authentication with automatic token refresh',
      'Real-time "Now Playing" widget on bio pages',
      'Privacy controls to show/hide activity',
    ],
    changes: [
      {
        type: 'feature',
        text: 'SpotifyConnect component in profile settings for account linking',
      },
      {
        type: 'feature',
        text: 'NowPlaying widget with album art, progress bar, and live updates',
      },
      { type: 'feature', text: 'Sound bars animation when music is playing' },
      {
        type: 'feature',
        text: 'Offline/Not listening state with breathing animation',
      },
      { type: 'feature', text: 'Direct link to Spotify track for easy access' },
      {
        type: 'feature',
        text: 'Privacy toggle to control visibility on profile',
      },
      {
        type: 'security',
        text: 'Secure token storage with automatic refresh handling',
      },
      {
        type: 'fix',
        text: 'Fixed API route structure for production deployment',
      },
      {
        type: 'improvement',
        text: 'Theme-aware styling across all Spotify components',
      },
    ],
  },
  {
    version: '1.4.2',
    date: 'January 16, 2026',
    title: 'Cloudflare-Style Bot Protection & UI Enhancements',
    description:
      'Revolutionary security system overhaul with modern challenge types and improved theme experience.',
    icon: Shield,
    type: 'security',
    highlights: [
      'No more emoji-based challenges',
      'Professional Cloudflare-inspired verification',
      'Larger, more comfortable theme selector',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Slider Challenge: Drag to precise percentage position for verification',
      },
      {
        type: 'feature',
        text: 'Rotate Challenge: Click to rotate dial to target angle',
      },
      {
        type: 'feature',
        text: 'Pattern Challenge: Click cells in correct sequence order',
      },
      {
        type: 'security',
        text: 'Random challenge selection for each verification attempt',
      },
      {
        type: 'security',
        text: 'Maintained honeypot, timing, and interaction tracking',
      },
      {
        type: 'fix',
        text: 'Fixed homepage gradient covering "Identity" text on various themes',
      },
      {
        type: 'improvement',
        text: 'ThemeSwitcher width increased from 420px to 520px',
      },
      {
        type: 'improvement',
        text: 'Theme grid max-height increased to 400px for better browsing',
      },
      {
        type: 'fix',
        text: 'Fixed TypeScript TS7030 errors in useEffect hooks',
      },
    ],
  },
  {
    version: '1.4.2',
    date: 'January 16, 2026',
    title: 'Comprehensive Theme System',
    description:
      'Massive expansion of the theme library with 8 categories and 25+ unique themes.',
    icon: Palette,
    type: 'feature',
    highlights: [
      '8 theme categories for every creator type',
      'Custom typography per theme',
      'Dynamic visual effects system',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Gamer themes: Neon Arcade, RGB Gaming, Cyberpunk Night',
      },
      {
        type: 'feature',
        text: 'VTuber themes: Kawaii Pink, Virtual Idol, Neon Vtuber',
      },
      {
        type: 'feature',
        text: 'Anime themes: Shonen Fire, Slice of Life, Mecha Chrome',
      },
      {
        type: 'feature',
        text: 'Developer themes: Terminal Green, VS Code Dark, GitHub Dark',
      },
      {
        type: 'feature',
        text: 'Streamer themes: Twitch Purple, Live Stream, Broadcast',
      },
      { type: 'feature', text: 'Artist themes: Watercolor, Canvas, Gallery' },
      {
        type: 'feature',
        text: 'Minimal themes: Clean White, Pure Dark, Monochrome',
      },
      {
        type: 'improvement',
        text: 'Theme effects: glowIntensity, borderRadius, cardStyle, animationSpeed',
      },
      {
        type: 'improvement',
        text: 'Custom Google Fonts per theme (display + body)',
      },
      {
        type: 'improvement',
        text: 'CSS variables for dynamic theme switching',
      },
    ],
  },
  {
    version: '1.4.1',
    date: 'January 16, 2026',
    title: 'TypeScript 6.0+ & Icon Migration',
    description:
      'Future-proof TypeScript configuration and modern brand icon implementation.',
    icon: Wrench,
    type: 'improvement',
    changes: [
      {
        type: 'improvement',
        text: 'TypeScript 6.0+ compatibility: Removed deprecated baseUrl',
      },
      {
        type: 'improvement',
        text: 'Migrated to explicit path mappings with full relative paths',
      },
      {
        type: 'improvement',
        text: 'Replaced deprecated Lucide brand icons with react-icons/si',
      },
      {
        type: 'improvement',
        text: 'Created centralized social-icons.tsx for icon management',
      },
      {
        type: 'fix',
        text: 'Fixed Vite build warnings: Removed NODE_ENV from .env',
      },
      {
        type: 'fix',
        text: 'Removed conflicting esbuild config (oxc is now default minifier)',
      },
    ],
  },
  {
    version: '1.4.0',
    date: 'January 16, 2026',
    title: 'Enhanced Partner Application System',
    description:
      'Professional multi-category partner program with dynamic forms.',
    icon: Users,
    type: 'feature',
    changes: [
      {
        type: 'feature',
        text: 'Multi-category partner applications (Content Creator, Developer, Brand, etc.)',
      },
      {
        type: 'feature',
        text: 'Dynamic form fields based on selected category',
      },
      {
        type: 'feature',
        text: 'Comprehensive data collection for better partner matching',
      },
      { type: 'improvement', text: 'Improved admin review interface' },
    ],
  },
  {
    version: '1.3.0',
    date: 'January 15, 2026',
    title: 'Homepage Redesign & Live Stats',
    description:
      'Complete homepage overhaul with real-time data and modern UI/UX.',
    icon: Rocket,
    type: 'feature',
    highlights: [
      'Dynamic hero with theme-aware gradients',
      'Live platform statistics',
      'Top creators leaderboard',
    ],
    changes: [
      {
        type: 'feature',
        text: 'Theme-aware gradient backgrounds that adapt to selected theme',
      },
      {
        type: 'feature',
        text: 'Real-time platform statistics (users, clicks, uptime)',
      },
      {
        type: 'feature',
        text: 'Top creators leaderboard with avatar rings and medals',
      },
      { type: 'feature', text: 'Theme category showcase with live counts' },
      { type: 'improvement', text: 'Motion animations throughout the page' },
      { type: 'improvement', text: 'Responsive design for all screen sizes' },
    ],
  },
  {
    version: '1.2.0',
    date: 'January 14, 2026',
    title: 'Cookie Consent & Legal Pages',
    description:
      'GDPR-compliant cookie management and comprehensive legal documentation.',
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
      {
        type: 'improvement',
        text: 'Password strength indicator with requirements',
      },
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

const ITEMS_PER_PAGE = 5

function ChangelogPage() {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ChangeType | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const borderRadius =
    theme.effects.borderRadius === 'pill'
      ? '9999px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.4
      : theme.effects.glowIntensity === 'medium'
        ? 0.25
        : theme.effects.glowIntensity === 'subtle'
          ? 0.15
          : 0

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dateGroups = useMemo(() => {
    const groups: Record<string, ChangelogEntry[]> = {}
    changelog.forEach((entry) => {
      const month = entry.date.split(' ').slice(0, 2).join(' ')
      if (!groups[month]) groups[month] = []
      groups[month].push(entry)
    })
    return groups
  }, [])

  const filteredChangelog = useMemo(() => {
    let filtered = changelog

    if (selectedVersion) {
      filtered = filtered.filter((e) => e.version === selectedVersion)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(
        (e) =>
          e.type === selectedType ||
          e.changes.some((c) => c.type === selectedType),
      )
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.version.includes(query) ||
          e.changes.some((c) => c.text.toLowerCase().includes(query)),
      )
    }

    return filtered
  }, [searchQuery, selectedType, selectedVersion])

  const totalPages = Math.ceil(filteredChangelog.length / ITEMS_PER_PAGE)
  const paginatedChangelog = filteredChangelog.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleVersionClick = (version: string) => {
    setSelectedVersion(selectedVersion === version ? null : version)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedVersion(null)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchQuery || selectedType !== 'all' || selectedVersion

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.5,
          }}
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.4,
          }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-6"
            style={{
              background: `${theme.colors.primary}15`,
              border: `1px solid ${theme.colors.primary}30`,
              borderRadius,
            }}
          >
            <Sparkles size={16} style={{ color: theme.colors.primary }} />
            <span
              className="text-sm font-semibold"
              style={{ color: theme.colors.foreground }}
            >
              {changelog.length} Releases
            </span>
          </motion.div>

          <h1
            className="text-4xl lg:text-6xl font-bold mb-4"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            What's{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                textShadow:
                  glowOpacity > 0
                    ? `0 0 40px ${theme.colors.primary}40`
                    : undefined,
              }}
            >
              New
            </span>
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Stay updated with the latest features, improvements, and fixes.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search releases, features, fixes..."
                className="w-full pl-12 pr-10 py-3 outline-none"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  color: theme.colors.foreground,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
                >
                  <X
                    size={16}
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelectedType('all')
                  setCurrentPage(1)
                }}
                className="px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  background:
                    selectedType === 'all'
                      ? theme.colors.primary
                      : theme.colors.card,
                  border: `1px solid ${selectedType === 'all' ? theme.colors.primary : theme.colors.border}`,
                  borderRadius,
                  color:
                    selectedType === 'all' ? '#fff' : theme.colors.foreground,
                }}
              >
                All
              </button>
              {Object.entries(typeConfig).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type as ChangeType)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background:
                      selectedType === type
                        ? config.bgColor
                        : theme.colors.card,
                    border: `1px solid ${selectedType === type ? config.color : theme.colors.border}`,
                    borderRadius,
                    color:
                      selectedType === type
                        ? config.color
                        : theme.colors.foregroundMuted,
                  }}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4">
              <span
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {filteredChangelog.length} result
                {filteredChangelog.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-all hover:scale-105"
                style={{
                  background: `${theme.colors.primary}15`,
                  borderRadius,
                  color: theme.colors.primary,
                }}
              >
                <X size={14} /> Clear filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Sidebar - Version Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="hidden lg:block w-64 shrink-0"
          >
            <div
              className="sticky top-24 p-4 max-h-[calc(100vh-120px)] overflow-y-auto"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <div
                className="flex items-center gap-2 mb-4 pb-3"
                style={{ borderBottom: `1px solid ${theme.colors.border}` }}
              >
                <Tag size={16} style={{ color: theme.colors.primary }} />
                <span
                  className="font-semibold text-sm"
                  style={{ color: theme.colors.foreground }}
                >
                  Versions
                </span>
              </div>

              {Object.entries(dateGroups).map(([month, entries]) => (
                <div key={month} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock
                      size={12}
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                    <span
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {month}
                    </span>
                  </div>
                  <div className="space-y-1 pl-4">
                    {entries.map((entry) => (
                      <button
                        key={entry.version}
                        onClick={() => handleVersionClick(entry.version)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:scale-[1.02]"
                        style={{
                          background:
                            selectedVersion === entry.version
                              ? `${theme.colors.primary}15`
                              : 'transparent',
                          borderRadius: '8px',
                          borderLeft:
                            selectedVersion === entry.version
                              ? `3px solid ${theme.colors.primary}`
                              : '3px solid transparent',
                        }}
                      >
                        <span
                          className="text-xs font-bold px-2 py-0.5"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                            borderRadius: '6px',
                            color: '#fff',
                          }}
                        >
                          v{entry.version}
                        </span>
                        <span
                          className="text-xs truncate flex-1"
                          style={{
                            color:
                              selectedVersion === entry.version
                                ? theme.colors.foreground
                                : theme.colors.foregroundMuted,
                          }}
                        >
                          {entry.title.split(' ').slice(0, 2).join(' ')}...
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>

          {/* Changelog Entries */}
          <div className="flex-1 min-w-0" ref={contentRef}>
            <AnimatePresence mode="wait">
              {paginatedChangelog.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20"
                >
                  <Search
                    size={48}
                    className="mx-auto mb-4"
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    No results found
                  </h3>
                  <p style={{ color: theme.colors.foregroundMuted }}>
                    Try adjusting your search or filters
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`page-${currentPage}-${selectedType}-${selectedVersion}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {paginatedChangelog.map((entry, index) => (
                    <motion.div
                      key={entry.version}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                      style={{
                        background:
                          theme.effects.cardStyle === 'glass'
                            ? `${theme.colors.card}80`
                            : theme.colors.card,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: cardRadius,
                        backdropFilter:
                          theme.effects.cardStyle === 'glass'
                            ? 'blur(10px)'
                            : undefined,
                      }}
                    >
                      {/* Entry Header */}
                      <div
                        className="p-6 pb-4"
                        style={{
                          borderBottom: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                              borderRadius: '12px',
                            }}
                          >
                            <entry.icon size={20} className="text-white" />
                          </div>
                          <span
                            className="px-3 py-1 text-sm font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                              borderRadius,
                              color: 'white',
                            }}
                          >
                            v{entry.version}
                          </span>
                          <span
                            className="px-2.5 py-1 text-xs font-medium"
                            style={{
                              background: typeConfig[entry.type].bgColor,
                              color: typeConfig[entry.type].color,
                              borderRadius,
                            }}
                          >
                            {typeConfig[entry.type].label}
                          </span>
                          <div
                            className="flex items-center gap-1.5 text-xs ml-auto"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            <Calendar size={14} />
                            {entry.date}
                          </div>
                        </div>

                        <h3
                          className="text-xl font-bold mb-2"
                          style={{
                            color: theme.colors.foreground,
                            fontFamily: theme.typography.displayFont,
                          }}
                        >
                          {entry.title}
                        </h3>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {entry.description}
                        </p>
                      </div>

                      {/* Highlights */}
                      {entry.highlights && (
                        <div
                          className="px-6 py-4"
                          style={{
                            background: theme.colors.backgroundSecondary,
                          }}
                        >
                          <div className="flex flex-wrap gap-2">
                            {entry.highlights.map((h, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                style={{
                                  background: theme.colors.card,
                                  border: `1px solid ${theme.colors.border}`,
                                  borderRadius,
                                  color: theme.colors.foreground,
                                }}
                              >
                                <Star
                                  size={12}
                                  style={{ color: theme.colors.primary }}
                                />
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Changes */}
                      <div className="p-6 pt-4">
                        <div className="space-y-2">
                          {entry.changes.map((change, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span
                                className="mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase shrink-0"
                                style={{
                                  background: typeConfig[change.type].bgColor,
                                  color: typeConfig[change.type].color,
                                  borderRadius: '4px',
                                }}
                              >
                                {change.type}
                              </span>
                              <span
                                className="text-sm"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {change.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mt-10"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-40"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius,
                    color: theme.colors.foreground,
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 text-sm font-medium transition-all"
                        style={{
                          background:
                            currentPage === page
                              ? theme.colors.primary
                              : theme.colors.card,
                          border: `1px solid ${currentPage === page ? theme.colors.primary : theme.colors.border}`,
                          borderRadius: '10px',
                          color:
                            currentPage === page
                              ? '#fff'
                              : theme.colors.foreground,
                        }}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-40"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius,
                    color: theme.colors.foreground,
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-4"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            <Sparkles size={20} style={{ color: theme.colors.primary }} />
            <span style={{ color: theme.colors.foregroundMuted }}>
              More updates coming soon
            </span>
            <ChevronRight
              size={18}
              style={{ color: theme.colors.foregroundMuted }}
            />
          </div>
        </motion.div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 flex items-center justify-center z-50"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              borderRadius: '50%',
              boxShadow: `0 4px 20px ${theme.colors.primary}40`,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={20} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
