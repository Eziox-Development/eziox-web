import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe features will be disabled')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  : null

export type TierType = 'free' | 'pro' | 'creator' | 'lifetime'

export interface TierLimits {
  maxLinks: number
  // Analytics
  realtimeAnalytics: boolean
  analyticsRetentionDays: number
  perLinkAnalytics: boolean
  referrerTracking: boolean
  dateRangeFilters: boolean
  exportAnalytics: boolean
  // Customization - Basic (Free)
  basicThemes: boolean
  basicBackgrounds: boolean // solid, gradient
  layoutCustomization: boolean
  basicAnimations: boolean // simple hover effects
  presetFonts: boolean
  socialIcons: boolean
  accentColors: boolean
  // Customization - Advanced (Pro+)
  extendedThemes: boolean
  advancedBackgrounds: boolean
  customCSS: boolean
  customFonts: boolean
  advancedAnimations: boolean
  disableBranding: boolean
  profileBackups: boolean
  // Integrations
  spotifyIntegration: boolean
  soundcloudIntegration: boolean
  youtubeIntegration: boolean
  advancedEmbedControls: boolean
  // Link Features
  featuredLinks: boolean
  linkScheduling: boolean
  abTesting: boolean
  utmSupport: boolean
  // Other
  customOpenGraph: boolean
  priorityCDN: boolean
  prioritySupport: boolean
  featureVoting: boolean
  earlyAccess: boolean
  apiAccess: boolean
  premiumBadge: boolean
  lifetimeBadge: boolean
}

export interface TierConfig {
  name: string
  tagline: string
  description: string
  price: number
  priceId: string | null
  billingType: 'free' | 'monthly' | 'lifetime'
  popular?: boolean
  features: string[]
  limits: TierLimits
}

const DEFAULT_LIMITS: TierLimits = {
  maxLinks: -1,
  // Analytics - Basic for free
  realtimeAnalytics: false,
  analyticsRetentionDays: 30,
  perLinkAnalytics: false,
  referrerTracking: false,
  dateRangeFilters: false,
  exportAnalytics: false,
  // Customization - Basic enabled for ALL users
  basicThemes: true,
  basicBackgrounds: true,
  layoutCustomization: true,
  basicAnimations: true,
  presetFonts: true,
  socialIcons: true,
  accentColors: true,
  // Customization - Advanced (now available to ALL users)
  extendedThemes: true,
  advancedBackgrounds: true,
  customCSS: false,
  customFonts: false,
  advancedAnimations: true,
  disableBranding: false,
  profileBackups: false,
  // Integrations - Basic enabled for all
  spotifyIntegration: true,
  soundcloudIntegration: true,
  youtubeIntegration: true,
  advancedEmbedControls: false,
  // Link Features
  featuredLinks: false,
  linkScheduling: false,
  abTesting: false,
  utmSupport: false,
  // Other
  customOpenGraph: false,
  priorityCDN: false,
  prioritySupport: false,
  featureVoting: false,
  earlyAccess: false,
  apiAccess: false,
  premiumBadge: false,
  lifetimeBadge: false,
}

export const TIER_CONFIG: Record<TierType, TierConfig> = {
  free: {
    name: 'Eziox Core',
    tagline: 'Free Forever',
    description: 'Full creative freedom, no cost',
    price: 0,
    priceId: null,
    billingType: 'free',
    features: [
      'Unlimited links',
      'Profile picture, banner & bio',
      'All themes & accent colors',
      'All backgrounds (solid, gradient, image, video, animated)',
      'Layout customization',
      'All animations (avatar, banner, page, hover)',
      'Preset Google Fonts',
      'Social links integration',
      'Spotify, SoundCloud & YouTube embeds',
      'Basic analytics (30 days)',
      'Mobile-optimized design',
    ],
    limits: {
      ...DEFAULT_LIMITS,
    },
  },
  pro: {
    name: 'Pro',
    tagline: 'Enhanced Control',
    description: 'Advanced insights & customization',
    price: 4.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    billingType: 'monthly',
    popular: true,
    features: [
      'Everything in Free',
      'Remove Eziox branding',
      'Realtime analytics (no delay)',
      'Per-link click tracking',
      'Referrer & date filters',
      'Export analytics (CSV/JSON)',
      'Profile backups & history',
      'Priority CDN',
      'Pro badge',
    ],
    limits: {
      ...DEFAULT_LIMITS,
      realtimeAnalytics: true,
      analyticsRetentionDays: 365,
      perLinkAnalytics: true,
      referrerTracking: true,
      dateRangeFilters: true,
      exportAnalytics: true,
      extendedThemes: true,
      advancedBackgrounds: true,
      disableBranding: true,
      profileBackups: true,
      priorityCDN: true,
      premiumBadge: true,
    },
  },
  creator: {
    name: 'Creator',
    tagline: 'Full Creative Freedom',
    description: 'Complete customization & tools',
    price: 9.99,
    priceId: process.env.STRIPE_CREATOR_PRICE_ID || null,
    billingType: 'monthly',
    features: [
      'Everything in Pro',
      'Custom CSS (sandboxed)',
      'Custom font uploads',
      'Advanced profile animations',
      'Advanced embed controls',
      'Featured/highlighted links',
      'Link scheduling',
      'A/B testing for links',
      'UTM parameter support',
      'Custom Open Graph previews',
      'Priority support',
      'Feature voting access',
      'Early access to features',
      'API access',
      'Creator badge',
    ],
    limits: {
      ...DEFAULT_LIMITS,
      realtimeAnalytics: true,
      analyticsRetentionDays: -1,
      perLinkAnalytics: true,
      referrerTracking: true,
      dateRangeFilters: true,
      exportAnalytics: true,
      extendedThemes: true,
      advancedBackgrounds: true,
      customCSS: true,
      customFonts: true,
      advancedAnimations: true,
      disableBranding: true,
      advancedEmbedControls: true,
      featuredLinks: true,
      linkScheduling: true,
      abTesting: true,
      utmSupport: true,
      customOpenGraph: true,
      profileBackups: true,
      priorityCDN: true,
      prioritySupport: true,
      featureVoting: true,
      earlyAccess: true,
      apiAccess: true,
      premiumBadge: true,
    },
  },
  lifetime: {
    name: 'Lifetime',
    tagline: 'Forever Supporter',
    description: 'One payment, forever access',
    price: 30,
    priceId: process.env.STRIPE_LIFETIME_PRICE_ID || null,
    billingType: 'lifetime',
    features: [
      'Everything in Creator, permanently',
      'All future Creator features',
      'Exclusive Lifetime badge',
      'Internal supporter recognition',
      'Priority in feature requests',
      'No renewals ever',
    ],
    limits: {
      ...DEFAULT_LIMITS,
      realtimeAnalytics: true,
      analyticsRetentionDays: -1,
      perLinkAnalytics: true,
      referrerTracking: true,
      dateRangeFilters: true,
      exportAnalytics: true,
      extendedThemes: true,
      advancedBackgrounds: true,
      customCSS: true,
      customFonts: true,
      advancedAnimations: true,
      disableBranding: true,
      advancedEmbedControls: true,
      featuredLinks: true,
      linkScheduling: true,
      abTesting: true,
      utmSupport: true,
      customOpenGraph: true,
      profileBackups: true,
      priorityCDN: true,
      prioritySupport: true,
      featureVoting: true,
      earlyAccess: true,
      apiAccess: true,
      premiumBadge: true,
      lifetimeBadge: true,
    },
  },
}

export function getTierFromPriceId(priceId: string): TierType {
  if (priceId === process.env.STRIPE_LIFETIME_PRICE_ID) return 'lifetime'
  if (priceId === process.env.STRIPE_CREATOR_PRICE_ID) return 'creator'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'free'
}

export function canAccessFeature(tier: TierType, feature: keyof TierLimits): boolean {
  const config = TIER_CONFIG[tier]
  if (!config) return false
  
  const value = config.limits[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return false
}

export function getMaxLinks(tier: TierType): number {
  return TIER_CONFIG[tier]?.limits.maxLinks ?? -1
}

export function getAnalyticsRetention(tier: TierType): number {
  return TIER_CONFIG[tier]?.limits.analyticsRetentionDays ?? 7
}

export function isPremiumTier(tier: TierType): boolean {
  return tier === 'pro' || tier === 'creator' || tier === 'lifetime'
}

export function isLifetimeTier(tier: TierType): boolean {
  return tier === 'lifetime'
}

export function getTierLevel(tier: TierType): number {
  const levels: Record<TierType, number> = {
    free: 0,
    pro: 1,
    creator: 2,
    lifetime: 3,
  }
  return levels[tier] ?? 0
}

export function compareTiers(tierA: TierType, tierB: TierType): number {
  return getTierLevel(tierA) - getTierLevel(tierB)
}
