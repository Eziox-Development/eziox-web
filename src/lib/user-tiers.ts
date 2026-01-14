/**
 * User Tier System
 * Defines features available for Standard vs Premium users
 */

export type UserTier = 'standard' | 'premium'

export interface TierFeatures {
  maxLinks: number
  maxShortLinks: number
  customThemes: boolean
  customFonts: boolean
  customCSS: boolean
  analytics: 'basic' | 'advanced'
  removeBranding: boolean
  customDomain: boolean
  prioritySupport: boolean
  scheduledLinks: boolean
  linkAnimations: boolean
  socialIcons: boolean
  customBackgrounds: boolean
}

export const TIER_FEATURES: Record<UserTier, TierFeatures> = {
  standard: {
    maxLinks: 10,
    maxShortLinks: 5,
    customThemes: false,
    customFonts: false,
    customCSS: false,
    analytics: 'basic',
    removeBranding: false,
    customDomain: false,
    prioritySupport: false,
    scheduledLinks: false,
    linkAnimations: false,
    socialIcons: true,
    customBackgrounds: false,
  },
  premium: {
    maxLinks: -1, // Unlimited
    maxShortLinks: -1, // Unlimited
    customThemes: true,
    customFonts: true,
    customCSS: true,
    analytics: 'advanced',
    removeBranding: true,
    customDomain: true,
    prioritySupport: true,
    scheduledLinks: true,
    linkAnimations: true,
    socialIcons: true,
    customBackgrounds: true,
  },
}

/**
 * Get features for a user tier
 */
export function getTierFeatures(tier: UserTier): TierFeatures {
  return TIER_FEATURES[tier] || TIER_FEATURES.standard
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeature(
  tier: UserTier,
  feature: keyof TierFeatures
): boolean {
  const features = getTierFeatures(tier)
  const value = features[feature]
  
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  return true
}

/**
 * Check if user can add more links
 */
export function canAddLink(tier: UserTier, currentCount: number): boolean {
  const features = getTierFeatures(tier)
  if (features.maxLinks === -1) return true
  return currentCount < features.maxLinks
}

/**
 * Check if user can create more short links
 */
export function canCreateShortLink(tier: UserTier, currentCount: number): boolean {
  const features = getTierFeatures(tier)
  if (features.maxShortLinks === -1) return true
  return currentCount < features.maxShortLinks
}

/**
 * Check if premium tier is still active
 */
export function isPremiumActive(
  tier: UserTier,
  tierExpiresAt: Date | null
): boolean {
  if (tier !== 'premium') return false
  if (!tierExpiresAt) return true // Never expires
  return new Date(tierExpiresAt) > new Date()
}

/**
 * Get effective tier (checks expiration)
 */
export function getEffectiveTier(
  tier: UserTier,
  tierExpiresAt: Date | null
): UserTier {
  if (tier === 'premium' && !isPremiumActive(tier, tierExpiresAt)) {
    return 'standard'
  }
  return tier
}
