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
  // === FREE FOR EVERYONE ===
  // Links: unlimited
  // Short links: unlimited
  // All themes: yes
  // All backgrounds: yes
  // All animations: yes
  // All embeds (Spotify, YouTube, etc.): yes
  // Social icons: yes
  // Profile customization: yes

  // === PAID FEATURES (rare/complex) ===
  // Pro+
  customCSS: boolean
  customFonts: boolean
  profileBackups: boolean
  analyticsExport: boolean
  removeBranding: boolean

  // Creator+
  customDomain: boolean
  passwordProtectedLinks: boolean
  linkExpiration: boolean
  emailCollection: boolean
  customOpenGraph: boolean

  // Support & Badges
  prioritySupport: boolean
  earlyAccess: boolean
  proBadge: boolean
  creatorBadge: boolean
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

const FREE_LIMITS: TierLimits = {
  // Pro+ features
  customCSS: false,
  customFonts: false,
  profileBackups: false,
  analyticsExport: false,
  removeBranding: false,

  // Creator+ features
  customDomain: false,
  passwordProtectedLinks: false,
  linkExpiration: false,
  emailCollection: false,
  customOpenGraph: false,

  // Support & Badges
  prioritySupport: false,
  earlyAccess: false,
  proBadge: false,
  creatorBadge: false,
  lifetimeBadge: false,
}

export const TIER_CONFIG: Record<TierType, TierConfig> = {
  free: {
    name: 'Free',
    tagline: 'No Limits',
    description: 'Full bio page experience, completely free',
    price: 0,
    priceId: null,
    billingType: 'free',
    features: [
      'Unlimited links',
      'Unlimited short links',
      'All themes & colors',
      'All backgrounds (solid, gradient, image, video, animated)',
      'All animations & effects',
      'Spotify, SoundCloud & YouTube embeds',
      'Social media icons',
      'Profile picture & banner',
      'Full analytics dashboard',
      'Mobile-optimized design',
    ],
    limits: {
      ...FREE_LIMITS,
    },
  },
  pro: {
    name: 'Pro',
    tagline: 'Power User',
    description: 'Advanced customization & tools',
    price: 2.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    billingType: 'monthly',
    popular: true,
    features: [
      'Everything in Free',
      'Custom CSS styling',
      'Upload custom fonts',
      'Remove Eziox branding',
      'Profile backups & restore',
      'Export analytics (CSV/JSON)',
      'Pro badge on profile',
    ],
    limits: {
      ...FREE_LIMITS,
      customCSS: true,
      customFonts: true,
      profileBackups: true,
      analyticsExport: true,
      removeBranding: true,
      proBadge: true,
    },
  },
  creator: {
    name: 'Creator',
    tagline: 'Professional',
    description: 'Exclusive features for serious creators',
    price: 5.99,
    priceId: process.env.STRIPE_CREATOR_PRICE_ID || null,
    billingType: 'monthly',
    features: [
      'Everything in Pro',
      'Custom domain (yourdomain.com)',
      'Password protected links',
      'Link expiration dates',
      'Email collection from visitors',
      'Custom Open Graph previews',
      'Priority email support',
      'Early access to new features',
      'Creator badge on profile',
    ],
    limits: {
      ...FREE_LIMITS,
      customCSS: true,
      customFonts: true,
      profileBackups: true,
      analyticsExport: true,
      removeBranding: true,
      customDomain: true,
      passwordProtectedLinks: true,
      linkExpiration: true,
      emailCollection: true,
      customOpenGraph: true,
      prioritySupport: true,
      earlyAccess: true,
      creatorBadge: true,
    },
  },
  lifetime: {
    name: 'Lifetime',
    tagline: 'Forever',
    description: 'One payment, all features forever',
    price: 29,
    priceId: process.env.STRIPE_LIFETIME_PRICE_ID || null,
    billingType: 'lifetime',
    features: [
      'Everything in Creator',
      'One-time payment',
      'All future features included',
      'Exclusive Lifetime badge',
      'Priority support forever',
      'Never pay again',
    ],
    limits: {
      ...FREE_LIMITS,
      customCSS: true,
      customFonts: true,
      profileBackups: true,
      analyticsExport: true,
      removeBranding: true,
      customDomain: true,
      passwordProtectedLinks: true,
      linkExpiration: true,
      emailCollection: true,
      customOpenGraph: true,
      prioritySupport: true,
      earlyAccess: true,
      creatorBadge: true,
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

export function getMaxLinks(): number {
  return -1 // Unlimited for everyone
}

export function getMaxShortLinks(): number {
  return -1 // Unlimited for everyone
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
