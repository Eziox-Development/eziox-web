/**
 * Creator Features Server Functions
 * Completely redesigned for Eziox
 *
 * Handles Creator-tier exclusive features:
 * - Custom CSS
 * - Custom Fonts
 * - Animated Profile Settings
 * - Open Graph Settings
 * - Link Scheduling
 * - Featured Links
 *
 * Tier Requirements:
 * - Creator or Lifetime tier required for all features
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { profiles, userLinks } from '../db/schema'
import type {
  CustomFont,
  AnimatedProfileSettings,
  OpenGraphSettings,
  LinkSchedule,
} from '../db/schema'
import { eq } from 'drizzle-orm'
import { getAuthenticatedUser, getUserTier } from './auth-helpers'
import { type TierType, canAccessFeature } from '../lib/stripe'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'

function isCreatorTier(tier: TierType): boolean {
  return ['creator', 'lifetime'].includes(tier)
}

// ============================================================================
// CSS SANITIZATION
// ============================================================================

const FORBIDDEN_CSS_PATTERNS = [
  /position\s*:\s*fixed/gi,
  /position\s*:\s*absolute/gi,
  /z-index\s*:\s*\d{4,}/gi,
  /@import/gi,
  /javascript:/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*["']?data:/gi,
  /-moz-binding/gi,
  /behavior\s*:/gi,
]

function sanitizeCSS(css: string): { valid: boolean; sanitized: string; errors: string[] } {
  const errors: string[] = []
  let sanitized = css

  for (const pattern of FORBIDDEN_CSS_PATTERNS) {
    if (pattern.test(css)) {
      errors.push(`Forbidden CSS pattern: ${pattern.source}`)
      sanitized = sanitized.replace(pattern, '/* REMOVED */')
    }
  }

  if (sanitized.length > 10000) {
    errors.push('CSS exceeds maximum length of 10,000 characters')
    sanitized = sanitized.substring(0, 10000)
  }

  return { valid: errors.length === 0, sanitized, errors }
}

// ============================================================================
// GET CREATOR SETTINGS
// ============================================================================

export const getCreatorSettingsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()
  const tier = await getUserTier(user.id)

  const [profile] = await db
    .select({
      customCSS: profiles.customCSS,
      customFonts: profiles.customFonts,
      animatedProfile: profiles.animatedProfile,
      openGraphSettings: profiles.openGraphSettings,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return {
    tier,
    isCreator: isCreatorTier(tier),
    features: {
      customCSS: canAccessFeature(tier, 'customCSS'),
      customFonts: canAccessFeature(tier, 'customFonts'),
      customOpenGraph: canAccessFeature(tier, 'customOpenGraph'),
      linkExpiration: canAccessFeature(tier, 'linkExpiration'),
    },
    customCSS: profile?.customCSS || '',
    customFonts: (profile?.customFonts || []) as CustomFont[],
    animatedProfile: profile?.animatedProfile as AnimatedProfileSettings | null,
    openGraphSettings: profile?.openGraphSettings as OpenGraphSettings | null,
  }
})

// ============================================================================
// CUSTOM CSS
// ============================================================================

export const updateCustomCSSFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ css: z.string().max(10000) }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!isCreatorTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Custom CSS requires Creator tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const { valid, sanitized, errors } = sanitizeCSS(data.css)

    await db
      .update(profiles)
      .set({ customCSS: sanitized, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, sanitized, valid, errors }
  })

// ============================================================================
// CUSTOM FONTS
// ============================================================================

const customFontSchema = z.object({
  id: z.string().max(50).optional(),
  name: z.string().min(1).max(100),
  url: z.string().max(2048),
  type: z.enum(['display', 'body']),
})

export const addCustomFontFn = createServerFn({ method: 'POST' })
  .inputValidator(customFontSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    // Rate limit
    const rateLimitResult = checkRateLimit(
      `creator:${user.id}`,
      RATE_LIMITS.API_SPOTIFY.maxRequests,
      RATE_LIMITS.API_SPOTIFY.windowMs,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw { message: 'Rate limited. Please wait.', status: 429, code: 'RATE_LIMITED' }
    }

    if (!isCreatorTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Custom fonts require Creator tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const [profile] = await db
      .select({ customFonts: profiles.customFonts })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const currentFonts = (profile?.customFonts || []) as CustomFont[]

    if (currentFonts.length >= 4) {
      setResponseStatus(400)
      throw { message: 'Maximum 4 custom fonts allowed', status: 400 }
    }

    const newFont: CustomFont = {
      id: data.id || crypto.randomUUID(),
      name: data.name,
      url: data.url,
      type: data.type,
    }

    await db
      .update(profiles)
      .set({ customFonts: [...currentFonts, newFont], updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, font: newFont }
  })

export const removeCustomFontFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ fontId: z.string() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [profile] = await db
      .select({ customFonts: profiles.customFonts })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const currentFonts = (profile?.customFonts || []) as CustomFont[]
    const filteredFonts = currentFonts.filter((f) => f.id !== data.fontId)

    await db
      .update(profiles)
      .set({ customFonts: filteredFonts, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })

// ============================================================================
// ANIMATED PROFILE
// ============================================================================

const animatedProfileSchema = z.object({
  enabled: z.boolean(),
  avatarAnimation: z.enum(['none', 'pulse', 'glow', 'bounce', 'rotate', 'shake', 'float']),
  bannerAnimation: z.enum(['none', 'parallax', 'gradient-shift', 'particles', 'wave', 'aurora']),
  linkHoverEffect: z.enum(['none', 'scale', 'glow', 'slide', 'shake', 'flip', 'tilt', 'lift']),
  pageTransition: z.enum(['none', 'fade', 'slide', 'zoom', 'blur']),
  particleColor: z.string().max(20).optional(),
  glowColor: z.string().max(20).optional(),
})

export const updateAnimatedProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(animatedProfileSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!isCreatorTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Animated profiles require Creator tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    // Map to the schema type
    const animatedSettings: AnimatedProfileSettings = {
      enabled: data.enabled,
      avatarAnimation: data.avatarAnimation,
      bannerAnimation: data.bannerAnimation,
      linkHoverEffect: data.linkHoverEffect,
      pageTransition: data.pageTransition,
      particleColor: data.particleColor,
      glowColor: data.glowColor,
    }

    await db
      .update(profiles)
      .set({ animatedProfile: animatedSettings, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, settings: animatedSettings }
  })

// ============================================================================
// OPEN GRAPH SETTINGS
// ============================================================================

const openGraphSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(300).optional(),
  image: z.string().max(2048).optional(),
  useCustom: z.boolean(),
})

export const updateOpenGraphFn = createServerFn({ method: 'POST' })
  .inputValidator(openGraphSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!isCreatorTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Custom Open Graph requires Creator tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    await db
      .update(profiles)
      .set({ openGraphSettings: data, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, settings: data }
  })

// ============================================================================
// LINK SCHEDULING
// ============================================================================

const linkScheduleSchema = z.object({
  linkId: z.string().uuid(),
  schedule: z.object({
    enabled: z.boolean(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    timezone: z.string().optional(),
  }),
})

export const updateLinkScheduleFn = createServerFn({ method: 'POST' })
  .inputValidator(linkScheduleSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!isCreatorTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Link scheduling requires Creator tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const [link] = await db
      .select({ userId: userLinks.userId })
      .from(userLinks)
      .where(eq(userLinks.id, data.linkId))
      .limit(1)

    if (!link || link.userId !== user.id) {
      setResponseStatus(404)
      throw { message: 'Link not found', status: 404 }
    }

    await db
      .update(userLinks)
      .set({ schedule: data.schedule as LinkSchedule, updatedAt: new Date() })
      .where(eq(userLinks.id, data.linkId))

    return { success: true }
  })

// ============================================================================
// FEATURED LINKS
// ============================================================================

const featuredLinkSchema = z.object({
  linkId: z.string().uuid(),
  isFeatured: z.boolean(),
  featuredStyle: z.enum(['default', 'glow', 'gradient', 'outline', 'neon']).optional(),
})

export const updateFeaturedLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(featuredLinkSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!isCreatorTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Featured links require Creator tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const [link] = await db
      .select({ userId: userLinks.userId })
      .from(userLinks)
      .where(eq(userLinks.id, data.linkId))
      .limit(1)

    if (!link || link.userId !== user.id) {
      setResponseStatus(404)
      throw { message: 'Link not found', status: 404 }
    }

    await db
      .update(userLinks)
      .set({
        isFeatured: data.isFeatured,
        featuredStyle: data.featuredStyle || null,
        updatedAt: new Date(),
      })
      .where(eq(userLinks.id, data.linkId))

    return { success: true }
  })

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { CustomFont, AnimatedProfileSettings, OpenGraphSettings, LinkSchedule }
