/**
 * Badge System Configuration
 * Centralized badge definitions with icons, colors, and metadata
 */

export type BadgeId =
  | 'owner'
  | 'admin'
  | 'verified'
  | 'premium'
  | 'pro_subscriber'
  | 'creator_subscriber'
  | 'lifetime_subscriber'
  | 'early_adopter'
  | 'referral_master'
  | 'creator'
  | 'vtuber'
  | 'streamer'
  | 'artist'
  | 'developer'
  | 'musician'
  | 'gamer'
  | 'other'
  | 'partner'

export interface BadgeConfig {
  id: BadgeId
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  autoAwarded: boolean
  adminOnly: boolean
}

export const BADGES: Record<BadgeId, BadgeConfig> = {
  owner: {
    id: 'owner',
    name: 'Owner',
    description: 'Platform owner',
    icon: 'Crown',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.15)',
    rarity: 'legendary',
    autoAwarded: false,
    adminOnly: true,
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Platform administrator',
    icon: 'Shield',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    rarity: 'legendary',
    autoAwarded: false,
    adminOnly: true,
  },
  verified: {
    id: 'verified',
    name: 'Verified',
    description: 'Verified creator',
    icon: 'BadgeCheck',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    rarity: 'rare',
    autoAwarded: false,
    adminOnly: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Premium subscriber',
    icon: 'Star',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    rarity: 'rare',
    autoAwarded: true,
    adminOnly: false,
  },
  pro_subscriber: {
    id: 'pro_subscriber',
    name: 'Pro',
    description: 'Pro tier subscriber',
    icon: 'Star',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    rarity: 'rare',
    autoAwarded: true,
    adminOnly: false,
  },
  creator_subscriber: {
    id: 'creator_subscriber',
    name: 'Creator',
    description: 'Creator tier subscriber',
    icon: 'Crown',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    rarity: 'epic',
    autoAwarded: true,
    adminOnly: false,
  },
  lifetime_subscriber: {
    id: 'lifetime_subscriber',
    name: 'Lifetime',
    description: 'Lifetime supporter',
    icon: 'Gem',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    rarity: 'legendary',
    autoAwarded: true,
    adminOnly: false,
  },
  early_adopter: {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users',
    icon: 'Sparkles',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    rarity: 'epic',
    autoAwarded: true,
    adminOnly: false,
  },
  referral_master: {
    id: 'referral_master',
    name: 'Referral Master',
    description: 'Referred 10+ users',
    icon: 'Users',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    rarity: 'epic',
    autoAwarded: true,
    adminOnly: false,
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    description: 'Content creator',
    icon: 'Palette',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    rarity: 'common',
    autoAwarded: false,
    adminOnly: true,
  },
  vtuber: {
    id: 'vtuber',
    name: 'VTuber',
    description: 'Virtual YouTuber',
    icon: 'Video',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    rarity: 'rare',
    autoAwarded: false,
    adminOnly: true,
  },
  streamer: {
    id: 'streamer',
    name: 'Streamer',
    description: 'Live streamer',
    icon: 'Radio',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    rarity: 'rare',
    autoAwarded: false,
    adminOnly: true,
  },
  artist: {
    id: 'artist',
    name: 'Artist',
    description: 'Digital artist',
    icon: 'Brush',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    rarity: 'rare',
    autoAwarded: false,
    adminOnly: true,
  },
  developer: {
    id: 'developer',
    name: 'Developer',
    description: 'Software developer',
    icon: 'Code2',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    rarity: 'rare',
    autoAwarded: false,
    adminOnly: true,
  },
  musician: {
    id: 'musician',
    name: 'Musician',
    description: 'Music creator',
    icon: 'Music',
    color: '#f472b6',
    bgColor: 'rgba(244, 114, 182, 0.15)',
    rarity: 'rare',
    autoAwarded: false,
    adminOnly: true,
  },
  gamer: {
    id: 'gamer',
    name: 'Gamer',
    description: 'Gaming enthusiast',
    icon: 'Gamepad2',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    rarity: 'common',
    autoAwarded: false,
    adminOnly: true,
  },
  other: {
    id: 'other',
    name: 'Other',
    description: 'Other content type',
    icon: 'Wand2',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    rarity: 'common',
    autoAwarded: false,
    adminOnly: true,
  },
  partner: {
    id: 'partner',
    name: 'Partner',
    description: 'Official partner',
    icon: 'Handshake',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    rarity: 'legendary',
    autoAwarded: false,
    adminOnly: true,
  },
}

export const BADGE_LIST = Object.values(BADGES)

export const BADGE_IDS = Object.keys(BADGES) as BadgeId[]

export function getBadgeConfig(badgeId: string): BadgeConfig | null {
  return BADGES[badgeId as BadgeId] || null
}

export function getBadgeConfigs(badgeIds: string[]): BadgeConfig[] {
  return badgeIds
    .map((id) => getBadgeConfig(id))
    .filter((b): b is BadgeConfig => b !== null)
}

export function sortBadgesByRarity(badges: BadgeConfig[]): BadgeConfig[] {
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 }
  return [...badges].sort(
    (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity],
  )
}

export function getAutoAwardableBadges(): BadgeConfig[] {
  return BADGE_LIST.filter((b) => b.autoAwarded)
}

export function getAdminOnlyBadges(): BadgeConfig[] {
  return BADGE_LIST.filter((b) => b.adminOnly)
}

export function getPublicBadges(): BadgeConfig[] {
  return BADGE_LIST.filter((b) => !b.adminOnly)
}
