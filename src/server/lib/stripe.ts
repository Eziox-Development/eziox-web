import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe features will be disabled')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  : null

export type TierType = 'free' | 'pro' | 'creator'

export interface TierConfig {
  name: string
  description: string
  price: number
  priceId: string | null
  features: string[]
  limits: {
    maxLinks: number
    analytics: boolean
    customThemes: boolean
    spotifyIntegration: boolean
    prioritySupport: boolean
    premiumBadge: boolean
    apiAccess: boolean
  }
}

export const TIER_CONFIG: Record<TierType, TierConfig> = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    priceId: null,
    features: [
      'Up to 10 links',
      'Basic profile customization',
      'Public profile page',
      'Basic analytics (7 days)',
    ],
    limits: {
      maxLinks: 10,
      analytics: false,
      customThemes: false,
      spotifyIntegration: false,
      prioritySupport: false,
      premiumBadge: false,
      apiAccess: false,
    },
  },
  pro: {
    name: 'Pro',
    description: 'For serious creators',
    price: 4.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    features: [
      'Unlimited links',
      'Full analytics dashboard',
      'Custom accent colors',
      'Priority in search',
      'Pro badge on profile',
      'Export analytics data',
    ],
    limits: {
      maxLinks: -1,
      analytics: true,
      customThemes: true,
      spotifyIntegration: false,
      prioritySupport: false,
      premiumBadge: true,
      apiAccess: false,
    },
  },
  creator: {
    name: 'Creator',
    description: 'The ultimate creator toolkit',
    price: 9.99,
    priceId: process.env.STRIPE_CREATOR_PRICE_ID || null,
    features: [
      'Everything in Pro',
      'Spotify integration',
      'Priority support',
      'Creator badge on profile',
      'API access',
      'Custom themes',
      'Early access to features',
    ],
    limits: {
      maxLinks: -1,
      analytics: true,
      customThemes: true,
      spotifyIntegration: true,
      prioritySupport: true,
      premiumBadge: true,
      apiAccess: true,
    },
  },
}

export function getTierFromPriceId(priceId: string): TierType {
  if (priceId === process.env.STRIPE_CREATOR_PRICE_ID) return 'creator'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'free'
}

export function canAccessFeature(tier: TierType, feature: keyof TierConfig['limits']): boolean {
  const config = TIER_CONFIG[tier]
  if (!config) return false
  
  if (feature === 'maxLinks') {
    return true
  }
  
  return config.limits[feature] as boolean
}

export function getMaxLinks(tier: TierType): number {
  return TIER_CONFIG[tier]?.limits.maxLinks ?? 10
}

export function isPremiumTier(tier: TierType): boolean {
  return tier === 'pro' || tier === 'creator'
}
