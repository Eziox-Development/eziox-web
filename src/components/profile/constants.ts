import {
  SiX,
  SiInstagram,
  SiYoutube,
  SiTwitch,
  SiGithub,
  SiTiktok,
  SiDiscord,
  SiLinkedin,
  SiSpotify,
  SiPatreon,
  SiKofi,
  SiReddit,
  SiPinterest,
  SiSnapchat,
  SiTelegram,
  SiBluesky,
  SiThreads,
  SiSteam,
  SiSoundcloud,
  SiFacebook,
  SiWhatsapp,
  SiKick,
} from 'react-icons/si'
import {
  User,
  Link as LinkIcon,
  Scissors,
  LayoutGrid,
  Plug,
  ImageIcon,
  Gift,
  Award,
  Sparkles,
  Code2,
  Cog,
  ShieldCheck,
  Fingerprint,
  Globe,
  Eye,
  MousePointerClick,
  Users,
  BarChart3,
} from 'lucide-react'
import type {
  DashboardTab,
  SocialPlatformConfig,
  SelectOption,
  StatCardConfig,
  QrPreset,
} from './types'

// ─── Dashboard Tabs ──────────────────────────────────────────────────────────

export const DASHBOARD_TABS: readonly DashboardTab[] = [
  {
    id: 'overview',
    labelKey: 'dashboard.tabs.overview',
    descKey: 'dashboard.tabs.overviewDesc',
    icon: BarChart3,
    category: 'main',
  },
  {
    id: 'profile',
    labelKey: 'dashboard.tabs.profile',
    descKey: 'dashboard.tabs.profileDesc',
    icon: User,
    category: 'main',
  },
  {
    id: 'links',
    labelKey: 'dashboard.tabs.links',
    descKey: 'dashboard.tabs.linksDesc',
    icon: LinkIcon,
    category: 'main',
  },
  {
    id: 'shortener',
    labelKey: 'dashboard.tabs.shortener',
    descKey: 'dashboard.tabs.shortenerDesc',
    icon: Scissors,
    category: 'main',
  },
  {
    id: 'widgets',
    labelKey: 'dashboard.tabs.widgets',
    descKey: 'dashboard.tabs.widgetsDesc',
    icon: LayoutGrid,
    category: 'main',
  },
  {
    id: 'integrations',
    labelKey: 'dashboard.tabs.integrations',
    descKey: 'dashboard.tabs.integrationsDesc',
    icon: Plug,
    category: 'main',
  },
  {
    id: 'media',
    labelKey: 'dashboard.tabs.media',
    descKey: 'dashboard.tabs.mediaDesc',
    icon: ImageIcon,
    category: 'main',
  },
  {
    id: 'referrals',
    labelKey: 'dashboard.tabs.referrals',
    descKey: 'dashboard.tabs.referralsDesc',
    icon: Gift,
    category: 'main',
  },
  {
    id: 'badges',
    labelKey: 'dashboard.tabs.badges',
    descKey: 'dashboard.tabs.badgesDesc',
    icon: Award,
    category: 'main',
  },
  {
    id: 'subscription',
    labelKey: 'dashboard.tabs.subscription',
    descKey: 'dashboard.tabs.subscriptionDesc',
    icon: Sparkles,
    category: 'premium',
  },
  {
    id: 'api',
    labelKey: 'dashboard.tabs.api',
    descKey: 'dashboard.tabs.apiDesc',
    icon: Code2,
    category: 'premium',
  },
  {
    id: 'settings',
    labelKey: 'dashboard.tabs.settings',
    descKey: 'dashboard.tabs.settingsDesc',
    icon: Cog,
    category: 'account',
  },
  {
    id: 'privacy',
    labelKey: 'dashboard.tabs.privacy',
    descKey: 'dashboard.tabs.privacyDesc',
    icon: ShieldCheck,
    category: 'account',
  },
  {
    id: 'security',
    labelKey: 'dashboard.tabs.security',
    descKey: 'dashboard.tabs.securityDesc',
    icon: Fingerprint,
    category: 'account',
  },
] as const

// ─── Social Platforms ────────────────────────────────────────────────────────

export const SOCIAL_PLATFORMS: readonly SocialPlatformConfig[] = [
  { key: 'twitter', label: 'X (Twitter)', icon: SiX, placeholder: 'username', color: '#FFFFFF', bgColor: '#000000' },
  { key: 'instagram', label: 'Instagram', icon: SiInstagram, placeholder: 'username', color: '#FFFFFF', bgColor: '#E4405F' },
  { key: 'youtube', label: 'YouTube', icon: SiYoutube, placeholder: '@channel', color: '#FFFFFF', bgColor: '#FF0000' },
  { key: 'twitch', label: 'Twitch', icon: SiTwitch, placeholder: 'username', color: '#FFFFFF', bgColor: '#9146FF' },
  { key: 'tiktok', label: 'TikTok', icon: SiTiktok, placeholder: '@username', color: '#FFFFFF', bgColor: '#000000' },
  { key: 'discord', label: 'Discord', icon: SiDiscord, placeholder: 'User ID', color: '#FFFFFF', bgColor: '#5865F2' },
  { key: 'github', label: 'GitHub', icon: SiGithub, placeholder: 'username', color: '#FFFFFF', bgColor: '#181717' },
] as const

export const ADDITIONAL_PLATFORMS: readonly SocialPlatformConfig[] = [
  { key: 'bluesky', label: 'Bluesky', icon: SiBluesky, placeholder: 'handle.bsky.social', color: '#FFFFFF', bgColor: '#0085FF' },
  { key: 'threads', label: 'Threads', icon: SiThreads, placeholder: 'username', color: '#FFFFFF', bgColor: '#000000' },
  { key: 'kick', label: 'Kick', icon: SiKick, placeholder: 'username', color: '#53FC18', bgColor: '#0D0E0F' },
  { key: 'linkedin', label: 'LinkedIn', icon: SiLinkedin, placeholder: 'username', color: '#FFFFFF', bgColor: '#0A66C2' },
  { key: 'facebook', label: 'Facebook', icon: SiFacebook, placeholder: 'username', color: '#FFFFFF', bgColor: '#1877F2' },
  { key: 'reddit', label: 'Reddit', icon: SiReddit, placeholder: 'u/username', color: '#FFFFFF', bgColor: '#FF4500' },
  { key: 'pinterest', label: 'Pinterest', icon: SiPinterest, placeholder: 'username', color: '#FFFFFF', bgColor: '#BD081C' },
  { key: 'snapchat', label: 'Snapchat', icon: SiSnapchat, placeholder: 'username', color: '#000000', bgColor: '#FFFC00' },
  { key: 'telegram', label: 'Telegram', icon: SiTelegram, placeholder: 'username', color: '#FFFFFF', bgColor: '#26A5E4' },
  { key: 'whatsapp', label: 'WhatsApp', icon: SiWhatsapp, placeholder: 'phone number', color: '#FFFFFF', bgColor: '#25D366' },
  { key: 'spotify', label: 'Spotify', icon: SiSpotify, placeholder: 'username', color: '#FFFFFF', bgColor: '#1DB954' },
  { key: 'soundcloud', label: 'SoundCloud', icon: SiSoundcloud, placeholder: 'username', color: '#FFFFFF', bgColor: '#FF5500' },
  { key: 'steam', label: 'Steam', icon: SiSteam, placeholder: 'profile ID', color: '#FFFFFF', bgColor: '#171A21' },
  { key: 'patreon', label: 'Patreon', icon: SiPatreon, placeholder: 'username', color: '#FFFFFF', bgColor: '#FF424D' },
  { key: 'kofi', label: 'Ko-fi', icon: SiKofi, placeholder: 'username', color: '#FFFFFF', bgColor: '#FF5E5B' },
] as const

export const ALL_SOCIAL_PLATFORMS: readonly SocialPlatformConfig[] = [
  ...SOCIAL_PLATFORMS,
  ...ADDITIONAL_PLATFORMS,
]

export function getPlatformByKey(key: string): SocialPlatformConfig {
  return (
    ALL_SOCIAL_PLATFORMS.find((p) => p.key === key) ?? {
      key,
      label: key,
      icon: SiX,
      placeholder: 'username',
      color: '#6366f1',
      bgColor: '#6366f1',
    }
  )
}

// ─── Creator Types ───────────────────────────────────────────────────────────

export const CREATOR_TYPES: readonly SelectOption[] = [
  { value: '', label: 'Select type...' },
  { value: 'vtuber', label: 'VTuber' },
  { value: 'screentuber', label: 'ScreenTuber' },
  { value: 'streamer', label: 'Streamer' },
  { value: 'artist', label: 'Artist' },
  { value: 'musician', label: 'Musician' },
  { value: 'developer', label: 'Developer' },
  { value: 'content_creator', label: 'Content Creator' },
  { value: 'gamer', label: 'Gamer' },
  { value: 'other', label: 'Other' },
] as const

// ─── Pronouns ────────────────────────────────────────────────────────────────

export const PRONOUNS_OPTIONS: readonly SelectOption[] = [
  { value: 'none', label: 'Select...' },
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'any', label: 'Any' },
  { value: 'custom', label: 'Custom' },
] as const

// ─── Stat Cards ──────────────────────────────────────────────────────────────

export const STAT_CARDS: readonly StatCardConfig[] = [
  {
    icon: Eye,
    labelKey: 'dashboard.stats.profileViews',
    gradient: 'from-blue-500 to-cyan-400',
    getValue: (ctx) => ctx.stats.profileViews,
  },
  {
    icon: MousePointerClick,
    labelKey: 'dashboard.stats.linkClicks',
    gradient: 'from-emerald-500 to-teal-400',
    getValue: (ctx) => ctx.totalClicks,
  },
  {
    icon: Users,
    labelKey: 'dashboard.stats.followers',
    gradient: 'from-violet-500 to-fuchsia-400',
    getValue: (ctx) => ctx.stats.followers,
  },
  {
    icon: Gift,
    labelKey: 'dashboard.stats.referrals',
    gradient: 'from-amber-500 to-orange-400',
    getValue: (ctx) => ctx.referralCount,
  },
] as const

// ─── QR Presets ──────────────────────────────────────────────────────────────

export const QR_PRESETS: readonly QrPreset[] = [
  { fg: '#ffffff', bg: '#000000', labelKey: 'dashboard.qrCode.classic' },
  { fg: '#000000', bg: '#ffffff', labelKey: 'dashboard.qrCode.light' },
  { fg: '#8b5cf6', bg: '#111114', labelKey: 'dashboard.qrCode.accent' },
  { fg: '#ec4899', bg: '#111114', labelKey: 'dashboard.qrCode.pink' },
  { fg: '#22c55e', bg: '#0a0a0a', labelKey: 'dashboard.qrCode.green' },
] as const

// ─── Quick Links ─────────────────────────────────────────────────────────────

export interface QuickLinkConfig {
  readonly to: string
  readonly params?: Record<string, string>
  readonly icon: typeof Globe
  readonly labelKey: string
  readonly external?: boolean
  readonly premium?: boolean
}

export function getQuickLinks(username: string): readonly QuickLinkConfig[] {
  return [
    { to: '/$username', params: { username }, icon: Globe, labelKey: 'dashboard.quickLinks.myBioPage', external: true },
  ] as const
}
