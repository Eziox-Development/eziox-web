import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { users, profiles, userLinks } from '../db/schema'
import type { CustomFont, AnimatedProfileSettings, OpenGraphSettings, LinkSchedule } from '../db/schema'
import { eq } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import type { TierType } from '../lib/stripe'

async function getAuthenticatedUser() {
  const token = getCookie('session-token')
  if (!token) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }
  const user = await validateSession(token)
  if (!user) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }
  return user
}

async function getUserTier(userId: string): Promise<TierType> {
  const [userData] = await db
    .select({ tier: users.tier })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  
  const tier = userData?.tier || 'free'
  return (tier === 'standard' || !tier ? 'free' : tier) as TierType
}

function isCreatorTier(tier: TierType): boolean {
  return ['creator', 'lifetime'].includes(tier)
}

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
      errors.push(`Forbidden CSS pattern detected: ${pattern.source}`)
      sanitized = sanitized.replace(pattern, '/* REMOVED */')
    }
  }

  if (sanitized.length > 10000) {
    errors.push('CSS exceeds maximum length of 10,000 characters')
    sanitized = sanitized.substring(0, 10000)
  }

  return { valid: errors.length === 0, sanitized, errors }
}

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
    customCSS: profile?.customCSS || '',
    customFonts: (profile?.customFonts || []) as CustomFont[],
    animatedProfile: profile?.animatedProfile as AnimatedProfileSettings | null,
    openGraphSettings: profile?.openGraphSettings as OpenGraphSettings | null,
  }
})

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
      .set({ 
        customCSS: sanitized,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true, sanitized, valid, errors }
  })

const customFontSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  url: z.string().url(),
  type: z.enum(['display', 'body']),
})

export const addCustomFontFn = createServerFn({ method: 'POST' })
  .inputValidator(customFontSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

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
      .set({ 
        customFonts: [...currentFonts, newFont],
        updatedAt: new Date(),
      })
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
    const filteredFonts = currentFonts.filter(f => f.id !== data.fontId)

    await db
      .update(profiles)
      .set({ 
        customFonts: filteredFonts,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })

const animatedProfileSchema = z.object({
  enabled: z.boolean(),
  avatarAnimation: z.enum(['none', 'pulse', 'glow', 'bounce', 'rotate', 'shake']),
  bannerAnimation: z.enum(['none', 'parallax', 'gradient-shift', 'particles']),
  linkHoverEffect: z.enum(['none', 'scale', 'glow', 'slide', 'shake', 'flip']),
  pageTransition: z.enum(['none', 'fade', 'slide', 'zoom']),
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

    await db
      .update(profiles)
      .set({ 
        animatedProfile: data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true, settings: data }
  })

const openGraphSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(300).optional(),
  image: z.string().url().optional().or(z.literal('')),
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
      .set({ 
        openGraphSettings: data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true, settings: data }
  })

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
      .set({ 
        schedule: data.schedule as LinkSchedule,
        updatedAt: new Date(),
      })
      .where(eq(userLinks.id, data.linkId))

    return { success: true }
  })

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

