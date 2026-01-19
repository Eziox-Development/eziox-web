import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { 
  users, 
  profiles, 
  communityTemplates, 
  templateLikes,
  type TemplateSettings,
} from '../db/schema'
import { eq, desc, and, sql, ilike, or } from 'drizzle-orm'
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

const TEMPLATE_CATEGORIES = [
  'vtuber',
  'gamer', 
  'developer',
  'minimal',
  'creative',
  'business',
  'music',
  'art',
  'anime',
  'other',
] as const

const getPublicTemplatesSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['popular', 'newest', 'likes']).optional(),
  limit: z.number().min(1).max(50).optional(),
  offset: z.number().min(0).optional(),
}).optional()

export const getPublicTemplatesFn = createServerFn({ method: 'GET' })
  .inputValidator(getPublicTemplatesSchema)
  .handler(async ({ data }: { data: z.infer<typeof getPublicTemplatesSchema> }) => {
    const { category, search, sort = 'popular', limit = 20, offset = 0 } = data || {}

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
        userName: users.name,
        userUsername: users.username,
      })
      .from(communityTemplates)
      .leftJoin(users, eq(communityTemplates.userId, users.id))
      .where(eq(communityTemplates.isPublic, true))
      .$dynamic()

    if (category) {
      query = query.where(eq(communityTemplates.category, category))
    }

    if (search) {
      query = query.where(
        or(
          ilike(communityTemplates.name, `%${search}%`),
          ilike(communityTemplates.description, `%${search}%`)
        )
      )
    }

    const orderBy = sort === 'newest' 
      ? desc(communityTemplates.createdAt)
      : sort === 'likes'
      ? desc(communityTemplates.likes)
      : desc(communityTemplates.uses)

    const templates = await query
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityTemplates)
      .where(eq(communityTemplates.isPublic, true))

    return {
      templates,
      total: countResult?.count || 0,
      categories: TEMPLATE_CATEGORIES,
    }
  })

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
      userName: users.name,
      userUsername: users.username,
    })
    .from(communityTemplates)
    .leftJoin(users, eq(communityTemplates.userId, users.id))
    .where(and(
      eq(communityTemplates.isPublic, true),
      eq(communityTemplates.isFeatured, true)
    ))
    .orderBy(desc(communityTemplates.uses))
    .limit(6)

  return templates
})

export const getMyTemplatesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()

  const templates = await db
    .select()
    .from(communityTemplates)
    .where(eq(communityTemplates.userId, user.id))
    .orderBy(desc(communityTemplates.createdAt))

  return templates
})

const templateIdSchema = z.object({ id: z.string().uuid() })

export const getTemplateByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(templateIdSchema)
  .handler(async ({ data }: { data: z.infer<typeof templateIdSchema> }) => {
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
        userName: users.name,
        userUsername: users.username,
        userAvatar: profiles.avatar,
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

    return template
  })

const publishTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(TEMPLATE_CATEGORIES),
  tags: z.array(z.string()).max(5).optional(),
  isPublic: z.boolean().optional(),
})

export const publishTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(publishTemplateSchema)
  .handler(async ({ data }: { data: z.infer<typeof publishTemplateSchema> }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!['creator', 'lifetime'].includes(tier)) {
      setResponseStatus(403)
      throw { message: 'Creator tier required to publish templates', status: 403 }
    }

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

    if (!profile) {
      setResponseStatus(400)
      throw { message: 'Profile not found', status: 400 }
    }

    const settings: TemplateSettings = {
      customBackground: profile.customBackground || undefined,
      layoutSettings: profile.layoutSettings || undefined,
      customCSS: profile.customCSS || undefined,
      customFonts: profile.customFonts || undefined,
      animatedProfile: profile.animatedProfile || undefined,
      accentColor: profile.accentColor || undefined,
      themeId: profile.themeId || undefined,
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
        isPublic: data.isPublic ?? true,
      })
      .returning()

    return template
  })

const updateTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  tags: z.array(z.string()).max(5).optional(),
  isPublic: z.boolean().optional(),
  syncSettings: z.boolean().optional(),
})

export const updateTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(updateTemplateSchema)
  .handler(async ({ data }: { data: z.infer<typeof updateTemplateSchema> }) => {
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

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.category) updateData.category = data.category
    if (data.tags) updateData.tags = data.tags
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic

    if (data.syncSettings) {
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

    await db
      .update(communityTemplates)
      .set(updateData)
      .where(eq(communityTemplates.id, data.id))

    return { success: true }
  })

const deleteTemplateSchema = z.object({ id: z.string().uuid() })

export const deleteTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteTemplateSchema)
  .handler(async ({ data }: { data: z.infer<typeof deleteTemplateSchema> }) => {
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

    await db
      .delete(communityTemplates)
      .where(eq(communityTemplates.id, data.id))

    return { success: true }
  })

const applyTemplateSchema = z.object({ templateId: z.string().uuid() })

export const applyTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(applyTemplateSchema)
  .handler(async ({ data }: { data: z.infer<typeof applyTemplateSchema> }) => {
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

    await db
      .update(profiles)
      .set({
        customBackground: settings.customBackground,
        layoutSettings: settings.layoutSettings,
        customCSS: settings.customCSS,
        customFonts: settings.customFonts,
        animatedProfile: settings.animatedProfile,
        accentColor: settings.accentColor,
        themeId: settings.themeId,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    await db
      .update(communityTemplates)
      .set({ uses: sql`${communityTemplates.uses} + 1` })
      .where(eq(communityTemplates.id, data.templateId))

    return { success: true }
  })

const likeTemplateSchema = z.object({ templateId: z.string().uuid() })

export const likeTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator(likeTemplateSchema)
  .handler(async ({ data }: { data: z.infer<typeof likeTemplateSchema> }) => {
    const user = await getAuthenticatedUser()

    const [existing] = await db
      .select()
      .from(templateLikes)
      .where(and(
        eq(templateLikes.templateId, data.templateId),
        eq(templateLikes.userId, user.id)
      ))
      .limit(1)

    if (existing) {
      await db
        .delete(templateLikes)
        .where(eq(templateLikes.id, existing.id))

      await db
        .update(communityTemplates)
        .set({ likes: sql`${communityTemplates.likes} - 1` })
        .where(eq(communityTemplates.id, data.templateId))

      return { liked: false }
    }

    await db
      .insert(templateLikes)
      .values({
        templateId: data.templateId,
        userId: user.id,
      })

    await db
      .update(communityTemplates)
      .set({ likes: sql`${communityTemplates.likes} + 1` })
      .where(eq(communityTemplates.id, data.templateId))

    return { liked: true }
  })

const checkTemplateLikeSchema = z.object({ templateId: z.string().uuid() })

export const checkTemplateLikeFn = createServerFn({ method: 'GET' })
  .inputValidator(checkTemplateLikeSchema)
  .handler(async ({ data }: { data: z.infer<typeof checkTemplateLikeSchema> }) => {
    const user = await getAuthenticatedUser()

    const [existing] = await db
      .select()
      .from(templateLikes)
      .where(and(
        eq(templateLikes.templateId, data.templateId),
        eq(templateLikes.userId, user.id)
      ))
      .limit(1)

    return { liked: !!existing }
  })
