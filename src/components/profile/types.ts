import type { LucideIcon } from 'lucide-react'
import type { IconType } from 'react-icons'

// ─── Tab System ──────────────────────────────────────────────────────────────

export type TabType =
  | 'overview'
  | 'profile'
  | 'links'
  | 'shortener'
  | 'widgets'
  | 'integrations'
  | 'media'
  | 'referrals'
  | 'badges'
  | 'subscription'
  | 'api'
  | 'settings'
  | 'privacy'
  | 'security'

export type TabCategory = 'main' | 'premium' | 'account'

export interface DashboardTab {
  readonly id: TabType
  readonly labelKey: string
  readonly descKey: string
  readonly icon: LucideIcon
  readonly category: TabCategory
}

// ─── Social Platforms ────────────────────────────────────────────────────────

export interface SocialPlatformConfig {
  readonly key: string
  readonly label: string
  readonly icon: IconType
  readonly placeholder: string
  readonly color: string
  readonly bgColor: string
}

// ─── Profile Form ────────────────────────────────────────────────────────────

export interface ProfileFormData {
  name: string
  username: string
  bio: string
  website: string
  location: string
  pronouns: string
  birthday: string
  creatorTypes: string[]
  isPublic: boolean
  showActivity: boolean
  socials: Record<string, string>
}

export type UpdateFieldFn = (key: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => void

// ─── User Data ───────────────────────────────────────────────────────────────

export interface UserStats {
  profileViews: number
  totalLinkClicks: number
  followers: number
  following: number
}

export interface UserProfile {
  bio?: string | null
  website?: string | null
  location?: string | null
  pronouns?: string | null
  birthday?: string | null
  creatorTypes?: string[] | null
  isPublic?: boolean | null
  showActivity?: boolean | null
  socials?: Record<string, string> | null
  avatar?: string | null
  banner?: string | null
  badges?: string[] | null
  isFeatured?: boolean | null
  referralCode?: string | null
}

export interface ProfileUser {
  id: string
  name: string | null
  username: string
  email: string
  emailVerified?: boolean
  role: 'user' | 'admin' | 'owner'
  tier: string
  createdAt: string
  profile?: UserProfile | null
  stats?: UserStats | null
}

// ─── Links ───────────────────────────────────────────────────────────────────

export interface UserLink {
  id: string
  title: string
  url: string
  description?: string | null
  icon?: string | null
  thumbnail?: string | null
  clicks: number
  isActive: boolean
  position: number
  backgroundColor?: string | null
  textColor?: string | null
  createdAt: string
  updatedAt: string
}

// ─── Select Options ──────────────────────────────────────────────────────────

export interface SelectOption {
  readonly value: string
  readonly label: string
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

export interface StatCardConfig {
  readonly icon: LucideIcon
  readonly labelKey: string
  readonly gradient: string
  getValue: (ctx: DashboardContext) => number
}

// ─── Dashboard Context (passed to sub-components) ────────────────────────────

export interface DashboardContext {
  stats: UserStats
  totalClicks: number
  referralCount: number
  badgeCount: number
}

// ─── QR Preset ───────────────────────────────────────────────────────────────

export interface QrPreset {
  readonly fg: string
  readonly bg: string
  readonly labelKey: string
}
