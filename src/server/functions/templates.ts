/**
 * Templates Server Functions
 * Completely redesigned template system for Eziox
 *
 * Features:
 * - Community templates (user-created)
 * - Official preset templates
 * - Live preview support
 * - Full compatibility with profile schema
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import {
  users,
  profiles,
  communityTemplates,
  templateLikes,
  type TemplateSettings,
  type CustomBackground,
  type LayoutSettings,
  type AnimatedProfileSettings,
  type CustomFont,
} from '../db/schema'
import { eq, desc, and, sql, ilike, or } from 'drizzle-orm'
import { getAuthenticatedUser, getUserTier, getOptionalUser } from './auth-helpers'

// ============================================================================
// CONSTANTS
// ============================================================================

export const TEMPLATE_CATEGORIES = [
  'minimal',
  'creative',
  'gamer',
  'vtuber',
  'developer',
  'music',
  'business',
  'art',
  'anime',
  'other',
] as const

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]

// ============================================================================
// SCHEMAS
// ============================================================================

const customBackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'image', 'video', 'animated']),
  value: z.string(),
  gradientAngle: z.number().optional(),
  gradientColors: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  blur: z.number().optional(),
  opacity: z.number().optional(),
  overlay: z.string().optional(),
  overlayOpacity: z.number().optional(),
  animatedColors: z.array(z.string()).optional(),
})

const layoutSettingsSchema = z.object({
  cardLayout: z.enum(['default', 'tilt', 'stack', 'grid', 'minimal']).optional(),
  cardSpacing: z.number().optional(),
  cardBorderRadius: z.number().optional(),
  cardTiltDegree: z.number().optional(),
  linkStyle: z.enum(['default', 'outline', 'filled', 'minimal', 'gradient', 'glass', 'neon']).optional(),
  linkBorderRadius: z.number().optional(),
  linkSpacing: z.number().optional(),
  showLinkIcons: z.boolean().optional(),
  linkIconPosition: z.enum(['left', 'right', 'none']).optional(),
  avatarSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  avatarShape: z.enum(['circle', 'rounded', 'square']).optional(),
  avatarBorder: z.boolean().optional(),
  avatarGlow: z.boolean().optional(),
  headerLayout: z.enum(['centered', 'left', 'right', 'split']).optional(),
  showBio: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showStats: z.boolean().optional(),
  contentMaxWidth: z.number().optional(),
  sectionSpacing: z.number().optional(),
})

const animatedProfileSchema = z.object({
  enabled: z.boolean(),
  avatarAnimation: z.enum(['none', 'pulse', 'bounce', 'shake', 'glow', 'rotate', 'float']).optional(),
  backgroundAnimation: z.enum(['none', 'gradient-shift', 'particles', 'waves', 'aurora', 'matrix', 'stars']).optional(),
  linkHoverEffect: z.enum(['none', 'scale', 'glow', 'slide', 'shake', 'pulse']).optional(),
  pageTransition: z.enum(['none', 'fade', 'slide', 'zoom']).optional(),
  cursorEffect: z.enum(['none', 'trail', 'glow', 'sparkle']).optional(),
  scrollEffect: z.enum(['none', 'parallax', 'fade-in', 'slide-up']).optional(),
})

const customFontSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.enum(['display', 'body']),
})

const templateSettingsSchema = z.object({
  customBackground: customBackgroundSchema.optional(),
  layoutSettings: layoutSettingsSchema.optional(),
  customCSS: z.string().optional(),
  customFonts: z.array(customFontSchema).optional(),
  animatedProfile: animatedProfileSchema.optional(),
  accentColor: z.string().optional(),
  themeId: z.string().optional(),
})

// ============================================================================
// GET TEMPLATES
// ============================================================================

const getTemplatesSchema = z.object({
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  search: z.string().optional(),
  sort: z.enum(['popular', 'newest', 'likes']).default('popular'),
  limit: z.number().min(1).max(100).default(24),
  offset: z.number().min(0).default(0),
  featured: z.boolean().optional(),
}).optional()

export const getTemplatesFn = createServerFn({ method: 'GET' })
  .inputValidator(getTemplatesSchema)
  .handler(async ({ data }) => {
    const { category, search, sort = 'popular', limit = 24, offset = 0, featured } = data || {}

    let query = db
      .select({
        id: communityTemplates.id,
        name: communityTemplates.name,
        description: communityTemplates.description,
        category: communityTemplates.category,
        tags: communityTemplates.tags,
        settings: communityTemplates.settings,
        previewImage: communityTemplates.previewImage,
        isFeatured: communityTemplates.isFeatured,
        uses: communityTemplates.uses,
        likes: communityTemplates.likes,
        createdAt: communityTemplates.createdAt,
        userId: communityTemplates.userId,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: profiles.avatar,
      })
      .from(communityTemplates)
      .leftJoin(users, eq(communityTemplates.userId, users.id))
      .leftJoin(profiles, eq(communityTemplates.userId, profiles.userId))
      .where(eq(communityTemplates.isPublic, true))
      .$dynamic()

    if (category) {
      query = query.where(eq(communityTemplates.category, category))
    }

    if (featured) {
      query = query.where(eq(communityTemplates.isFeatured, true))
    }

    if (search) {
      query = query.where(
        or(
          ilike(communityTemplates.name, `%${search}%`),
          ilike(communityTemplates.description, `%${search}%`),
        ),
      )
    }

    const orderBy =
      sort === 'newest'
        ? desc(communityTemplates.createdAt)
        : sort === 'likes'
          ? desc(communityTemplates.likes)
          : desc(communityTemplates.uses)

    const templates = await query.orderBy(orderBy).limit(limit).offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityTemplates)
      .where(eq(communityTemplates.isPublic, true))

    return {
      templates,
      total: Number(countResult?.count || 0),
      hasMore: offset + templates.length < Number(countResult?.count || 0),
    }
  })

// Alias for backwards compatibility
export const getPublicTemplatesFn = getTemplatesFn

// ============================================================================
// GET FEATURED TEMPLATES
// ============================================================================

export const getFeaturedTemplatesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const templates = await db
    .select({
      id: communityTemplates.id,
      name: communityTemplates.name,
      description: communityTemplates.description,
      category: communityTemplates.category,
      settings: communityTemplates.settings,
      previewImage: communityTemplates.previewImage,
      uses: communityTemplates.uses,
      likes: communityTemplates.likes,
      authorName: users.name,
      authorUsername: users.username,
    })
    .from(communityTemplates)
    .leftJoin(users, eq(communityTemplates.userId, users.id))
    .where(and(eq(communityTemplates.isPublic, true), eq(communityTemplates.isFeatured, true)))
    .orderBy(desc(communityTemplates.uses))
    .limit(8)

  return templates
})

// ============================================================================
// GET TEMPLATE BY ID
// ============================================================================

const getTemplateByIdSchema = z.object({ id: z.string().uuid() })

export const getTemplateByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getTemplateByIdSchema)
  .handler(async ({ data }) => {
    const user = await getOptionalUser()

    const [template] = await db
      .select({
        id: communityTemplates.id,
        name: communityTemplates.name,
        description: communityTemplates.description,
        category: communityTemplates.category,
        tags: communityTemplates.tags,
        settings: communityTemplates.settings,
        previewImage: communityTemplates.previewImage,
        isPublic: communityTemplates.isPublic,
        isFeatured: communityTemplates.isFeatured,
        uses: communityTemplates.uses,
        likes: communityTemplates.likes,
        createdAt: communityTemplates.createdAt,
        userId: communityTemplates.userId,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: profiles.avatar,
      })
      .from(communityTemplates)
      .leftJoin(users, eq(communityTemplates.userId, users.id))
      .leftJoin(profiles, eq(communityTemplates.userId, profiles.userId))
      .where(eq(communityTemplates.id, data.id))
      .limit(1)

    if (!template) {
      setResponseStatus(404)
      throw { message: 'Template not found', status: 404 }
    }

    // Check if user has liked this template
    let isLiked = false
    if (user) {
      const [like] = await db
        .select()
        .from(templateLikes)
        .where(and(eq(templateLikes.templateId, data.id), eq(templateLikes.userId, user.id)))
        .limit(1)
      isLiked = !!like
    }

    return { ...template, isLiked, isOwner: user?.id === template.userId }
  })

// ============================================================================
// GET MY TEMPLATES
// ============================================================================

export const getMyTemplatesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()

  const templates = await db
    .select({
      id: communityTemplates.id,
      name: communityTemplates.name,
      description: communityTemplates.description,
      category: communityTemplates.category,
      tags: communityTemplates.tags,
      settings: communityTemplates.settings,
      previewImage: communityTemplates.previewImage,
      isPublic: communityTemplates.isPublic,
      isFeatured: communityTemplates.isFeatured,
      uses: communityTemplates.uses,
      likes: communityTemplates.likes,
      createdAt: communityTemplates.createdAt,
      updatedAt: communityTemplates.updatedAt,
    })
    .from(communityTemplates)
    .where(eq(communityTemplates.userId, user.id))
    .orderBy(desc(communityTemplates.createdAt))

  return templates
})

// ============================================================================
// CREATE TEMPLATE
// ============================================================================

const createTemplateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(TEMPLATE_CATEGORIES),
  tags: z.array(z.string().max(30)).max(10).optional(),
  settings: templateSettingsSchema.optional(),
  isPublic: z.boolean().default(true),
  fromCurrentProfile: z.boolean().default(true),
})

export const createTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(createTemplateSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!['creator', 'lifetime'].includes(tier)) {
      setResponseStatus(403)
      throw { message: 'Creator tier required to publish templates', status: 403 }
    }

    let settings: TemplateSettings = (data.settings as TemplateSettings) || {}

    // If fromCurrentProfile is true, get settings from user's profile
    if (data.fromCurrentProfile) {
      const [profile] = await db
        .select({
          customBackground: profiles.customBackground,
          layoutSettings: profiles.layoutSettings,
          customCSS: profiles.customCSS,
          customFonts: profiles.customFonts,
          animatedProfile: profiles.animatedProfile,
          accentColor: profiles.accentColor,
          themeId: profiles.themeId,
        })
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1)

      if (profile) {
        settings = {
          customBackground: profile.customBackground || undefined,
          layoutSettings: profile.layoutSettings || undefined,
          customCSS: profile.customCSS || undefined,
          customFonts: profile.customFonts || undefined,
          animatedProfile: profile.animatedProfile || undefined,
          accentColor: profile.accentColor || undefined,
          themeId: profile.themeId || undefined,
        }
      }
    }

    const [template] = await db
      .insert(communityTemplates)
      .values({
        userId: user.id,
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags || [],
        settings,
        isPublic: data.isPublic,
      })
      .returning()

    return template
  })

// Alias for backwards compatibility
export const publishTemplateFn = createTemplateFn

// ============================================================================
// UPDATE TEMPLATE
// ============================================================================

const updateTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  settings: templateSettingsSchema.optional(),
  isPublic: z.boolean().optional(),
  syncFromProfile: z.boolean().optional(),
})

export const updateTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(updateTemplateSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [existing] = await db
      .select({ userId: communityTemplates.userId })
      .from(communityTemplates)
      .where(eq(communityTemplates.id, data.id))
      .limit(1)

    if (!existing || existing.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.category) updateData.category = data.category
    if (data.tags) updateData.tags = data.tags
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic
    if (data.settings) updateData.settings = data.settings

    // Sync settings from current profile
    if (data.syncFromProfile) {
      const [profile] = await db
        .select({
          customBackground: profiles.customBackground,
          layoutSettings: profiles.layoutSettings,
          customCSS: profiles.customCSS,
          customFonts: profiles.customFonts,
          animatedProfile: profiles.animatedProfile,
          accentColor: profiles.accentColor,
          themeId: profiles.themeId,
        })
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1)

      if (profile) {
        updateData.settings = {
          customBackground: profile.customBackground || undefined,
          layoutSettings: profile.layoutSettings || undefined,
          customCSS: profile.customCSS || undefined,
          customFonts: profile.customFonts || undefined,
          animatedProfile: profile.animatedProfile || undefined,
          accentColor: profile.accentColor || undefined,
          themeId: profile.themeId || undefined,
        }
      }
    }

    const [updated] = await db
      .update(communityTemplates)
      .set(updateData)
      .where(eq(communityTemplates.id, data.id))
      .returning()

    return updated
  })

// ============================================================================
// DELETE TEMPLATE
// ============================================================================

const deleteTemplateSchema = z.object({ id: z.string().uuid() })

export const deleteTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteTemplateSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [existing] = await db
      .select({ userId: communityTemplates.userId })
      .from(communityTemplates)
      .where(eq(communityTemplates.id, data.id))
      .limit(1)

    if (!existing || existing.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    // Delete likes first
    await db.delete(templateLikes).where(eq(templateLikes.templateId, data.id))

    // Delete template
    await db.delete(communityTemplates).where(eq(communityTemplates.id, data.id))

    return { success: true }
  })

// ============================================================================
// APPLY TEMPLATE
// ============================================================================

const applyTemplateSchema = z.object({
  templateId: z.string().uuid(),
  // Allow partial application
  applyBackground: z.boolean().default(true),
  applyLayout: z.boolean().default(true),
  applyCSS: z.boolean().default(true),
  applyFonts: z.boolean().default(true),
  applyAnimations: z.boolean().default(true),
  applyTheme: z.boolean().default(true),
})

export const applyTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(applyTemplateSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!['pro', 'creator', 'lifetime'].includes(tier)) {
      setResponseStatus(403)
      throw { message: 'Pro tier or higher required to apply templates', status: 403 }
    }

    const [template] = await db
      .select({ settings: communityTemplates.settings })
      .from(communityTemplates)
      .where(eq(communityTemplates.id, data.templateId))
      .limit(1)

    if (!template) {
      setResponseStatus(404)
      throw { message: 'Template not found', status: 404 }
    }

    const settings = template.settings
    const profileUpdate: Record<string, unknown> = { updatedAt: new Date() }

    if (data.applyBackground && settings.customBackground) {
      profileUpdate.customBackground = settings.customBackground
    }
    if (data.applyLayout && settings.layoutSettings) {
      profileUpdate.layoutSettings = settings.layoutSettings
    }
    if (data.applyCSS && settings.customCSS) {
      profileUpdate.customCSS = settings.customCSS
    }
    if (data.applyFonts && settings.customFonts) {
      profileUpdate.customFonts = settings.customFonts
    }
    if (data.applyAnimations && settings.animatedProfile) {
      profileUpdate.animatedProfile = settings.animatedProfile
    }
    if (data.applyTheme) {
      if (settings.accentColor) profileUpdate.accentColor = settings.accentColor
      if (settings.themeId) profileUpdate.themeId = settings.themeId
    }

    await db.update(profiles).set(profileUpdate).where(eq(profiles.userId, user.id))

    // Increment uses count
    await db
      .update(communityTemplates)
      .set({ uses: sql`${communityTemplates.uses} + 1` })
      .where(eq(communityTemplates.id, data.templateId))

    return { success: true, appliedSettings: Object.keys(profileUpdate).filter((k) => k !== 'updatedAt') }
  })

// ============================================================================
// LIKE/UNLIKE TEMPLATE
// ============================================================================

const likeTemplateSchema = z.object({ templateId: z.string().uuid() })

export const likeTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(likeTemplateSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [existing] = await db
      .select({ id: templateLikes.id })
      .from(templateLikes)
      .where(and(eq(templateLikes.templateId, data.templateId), eq(templateLikes.userId, user.id)))
      .limit(1)

    if (existing) {
      // Unlike
      await db.delete(templateLikes).where(eq(templateLikes.id, existing.id))
      await db
        .update(communityTemplates)
        .set({ likes: sql`GREATEST(${communityTemplates.likes} - 1, 0)` })
        .where(eq(communityTemplates.id, data.templateId))

      return { liked: false }
    }

    // Like
    await db.insert(templateLikes).values({
      templateId: data.templateId,
      userId: user.id,
    })

    await db
      .update(communityTemplates)
      .set({ likes: sql`${communityTemplates.likes} + 1` })
      .where(eq(communityTemplates.id, data.templateId))

    return { liked: true }
  })

// ============================================================================
// CHECK TEMPLATE LIKE STATUS
// ============================================================================

const checkTemplateLikeSchema = z.object({ templateId: z.string().uuid() })

export const checkTemplateLikeFn = createServerFn({ method: 'GET' })
  .inputValidator(checkTemplateLikeSchema)
  .handler(async ({ data }) => {
    const user = await getOptionalUser()
    if (!user) return { liked: false }

    const [existing] = await db
      .select({ id: templateLikes.id })
      .from(templateLikes)
      .where(and(eq(templateLikes.templateId, data.templateId), eq(templateLikes.userId, user.id)))
      .limit(1)

    return { liked: !!existing }
  })

// ============================================================================
// GET CURRENT USER PROFILE SETTINGS (for preview)
// ============================================================================

export const getCurrentProfileSettingsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()

  const [profile] = await db
    .select({
      customBackground: profiles.customBackground,
      layoutSettings: profiles.layoutSettings,
      customCSS: profiles.customCSS,
      customFonts: profiles.customFonts,
      animatedProfile: profiles.animatedProfile,
      accentColor: profiles.accentColor,
      themeId: profiles.themeId,
      avatar: profiles.avatar,
      bio: profiles.bio,
      name: users.name,
      username: users.username,
    })
    .from(profiles)
    .leftJoin(users, eq(profiles.userId, users.id))
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return profile
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { TemplateSettings, CustomBackground, LayoutSettings, AnimatedProfileSettings, CustomFont }
