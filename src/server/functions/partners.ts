import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import { users, profiles, userStats, partnerApplications } from '../db/schema'
import { eq, desc, and, sql, or } from 'drizzle-orm'
import { getCurrentUser } from './auth'

export const getPartnersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const results = await db
      .select({
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          role: users.role,
          createdAt: users.createdAt,
        },
        profile: {
          bio: profiles.bio,
          avatar: profiles.avatar,
          banner: profiles.banner,
          badges: profiles.badges,
          accentColor: profiles.accentColor,
          creatorTypes: profiles.creatorTypes,
          isFeatured: profiles.isFeatured,
          socials: profiles.socials,
        },
        stats: {
          profileViews: userStats.profileViews,
          followers: userStats.followers,
        },
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .leftJoin(userStats, eq(userStats.userId, profiles.userId))
      .where(eq(profiles.isPublic, true))
      .orderBy(desc(profiles.isFeatured), desc(userStats.followers))

    const partners = results.filter(r => 
      r.profile.badges?.includes('partner') || r.profile.isFeatured
    )

    const officialPartners = partners.filter(p => p.profile.badges?.includes('partner'))
    const featuredPartners = partners.filter(p => p.profile.isFeatured && !p.profile.badges?.includes('partner'))

    return {
      partners,
      officialPartners,
      featuredPartners,
      stats: {
        total: partners.length,
        official: officialPartners.length,
        featured: featuredPartners.length,
        totalViews: partners.reduce((sum, p) => sum + (p.stats?.profileViews || 0), 0),
      },
    }
  })

export const getPartnerApplicationsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
      throw new Error('Unauthorized')
    }

    const results = await db
      .select({
        application: partnerApplications,
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
        },
        profile: {
          avatar: profiles.avatar,
          badges: profiles.badges,
        },
      })
      .from(partnerApplications)
      .innerJoin(users, eq(users.id, partnerApplications.userId))
      .leftJoin(profiles, eq(profiles.userId, partnerApplications.userId))
      .orderBy(desc(partnerApplications.createdAt))

    return results
  })

export const getMyApplicationFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return null
    }

    const [application] = await db
      .select()
      .from(partnerApplications)
      .where(eq(partnerApplications.userId, currentUser.id))
      .orderBy(desc(partnerApplications.createdAt))
      .limit(1)

    return application || null
  })

const categoryDataSchema = z.looseObject({
  platform: z.string().optional(),
  platformUrl: z.string().optional(),
  followerRange: z.string().optional(),
  contentTypes: z.array(z.string()).optional(),
  modelType: z.string().optional(),
  mainGamerTag: z.string().optional(),
  games: z.array(z.string()).optional(),
  gamePlatforms: z.record(z.string(), z.string()).optional(),
  developerType: z.string().optional(),
  languages: z.array(z.string()).optional(),
  gameEngine: z.string().optional(),
  artistType: z.string().optional(),
  portfolioUrl: z.string().optional(),
  musicianType: z.string().optional(),
  musicPlatforms: z.record(z.string(), z.string()).optional(),
  genres: z.array(z.string()).optional(),
})

export const submitPartnerApplicationFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      companyName: z.string().max(200).optional(),
      website: z.url().optional().or(z.literal('')),
      socialLinks: z.record(z.string(), z.string()).optional(),
      category: z.enum([
        'streamer', 'vtuber', 'content_creator', 'gamer', 
        'developer', 'game_creator', 'artist', 'musician', 
        'brand', 'agency', 'other'
      ]),
      subcategory: z.string().max(50).optional(),
      categoryData: categoryDataSchema.optional(),
      audienceSize: z.enum(['micro', 'small', 'medium', 'large', 'mega', 'celebrity']).optional(),
      description: z.string().min(50).max(2000),
      whyPartner: z.string().min(50).max(2000),
    })
  )
  .handler(async ({ data }) => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('Unauthorized')
    }

    const [existing] = await db
      .select()
      .from(partnerApplications)
      .where(
        and(
          eq(partnerApplications.userId, currentUser.id),
          or(
            eq(partnerApplications.status, 'pending'),
            eq(partnerApplications.status, 'reviewing')
          )
        )
      )
      .limit(1)

    if (existing) {
      throw new Error('You already have a pending application')
    }

    const [application] = await db
      .insert(partnerApplications)
      .values({
        userId: currentUser.id,
        companyName: data.companyName || null,
        website: data.website || null,
        socialLinks: (data.socialLinks || {}) as Record<string, string>,
        category: data.category,
        subcategory: data.subcategory || null,
        categoryData: (data.categoryData || {}) as Record<string, string | string[] | number | boolean | null>,
        audienceSize: data.audienceSize || null,
        description: data.description,
        whyPartner: data.whyPartner,
        status: 'pending',
      })
      .returning()

    return application
  })

export const updateApplicationStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      applicationId: z.uuid(),
      status: z.enum(['pending', 'reviewing', 'approved', 'rejected']),
      adminNotes: z.string().max(1000).optional(),
    })
  )
  .handler(async ({ data }) => {
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
      throw new Error('Unauthorized')
    }

    const [application] = await db
      .update(partnerApplications)
      .set({
        status: data.status,
        adminNotes: data.adminNotes || null,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(partnerApplications.id, data.applicationId))
      .returning()

    if (data.status === 'approved' && application) {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, application.userId))
        .limit(1)

      if (profile) {
        const currentBadges = (profile.badges as string[]) || []
        if (!currentBadges.includes('partner')) {
          await db
            .update(profiles)
            .set({
              badges: [...currentBadges, 'partner'],
              updatedAt: new Date(),
            })
            .where(eq(profiles.userId, application.userId))
        }
      }
    }

    return application
  })

export const getPartnerStatsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const [partnerCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(profiles)
      .where(sql`${profiles.badges}::jsonb ? 'partner'`)

    const [pendingApps] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(partnerApplications)
      .where(eq(partnerApplications.status, 'pending'))

    const [totalViews] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${userStats.profileViews}), 0)` })
      .from(profiles)
      .leftJoin(userStats, eq(userStats.userId, profiles.userId))
      .where(sql`${profiles.badges}::jsonb ? 'partner'`)

    return {
      totalPartners: partnerCount?.count || 0,
      pendingApplications: pendingApps?.count || 0,
      totalPartnerViews: totalViews?.sum || 0,
    }
  })

export type Partner = Awaited<ReturnType<typeof getPartnersFn>>['partners'][number]
export type PartnerApplicationWithUser = Awaited<ReturnType<typeof getPartnerApplicationsFn>>[number]
