import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import { users, profiles, userStats } from '../db/schema'
import { eq, desc, and, isNotNull, sql } from 'drizzle-orm'

export const getCreatorsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      category: z.string().optional(),
      featured: z.boolean().optional(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }).optional()
  )
  .handler(async ({ data }) => {
    const limit = data?.limit || 50
    const offset = data?.offset || 0
    const category = data?.category
    const featured = data?.featured

    let whereConditions = and(
      isNotNull(profiles.creatorType),
      eq(profiles.isPublic, true)
    )

    if (category && category !== 'all') {
      whereConditions = and(whereConditions, eq(profiles.creatorType, category))
    }

    if (featured) {
      whereConditions = and(whereConditions, eq(profiles.isFeatured, true))
    }

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
          creatorType: profiles.creatorType,
          isFeatured: profiles.isFeatured,
          socials: profiles.socials,
          referredBy: profiles.referredBy,
        },
        stats: {
          profileViews: userStats.profileViews,
          followers: userStats.followers,
        },
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .leftJoin(userStats, eq(userStats.userId, profiles.userId))
      .where(whereConditions)
      .orderBy(desc(profiles.isFeatured), desc(userStats.followers))
      .limit(limit)
      .offset(offset)

    const creatorsWithReferrer = await Promise.all(
      results.map(async (creator) => {
        let referrer = null
        if (creator.profile.referredBy) {
          const [referrerData] = await db
            .select({
              username: users.username,
              name: users.name,
              avatar: profiles.avatar,
            })
            .from(users)
            .leftJoin(profiles, eq(profiles.userId, users.id))
            .where(eq(users.id, creator.profile.referredBy))
            .limit(1)
          referrer = referrerData || null
        }
        return { ...creator, referrer }
      })
    )

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .where(whereConditions)

    return {
      creators: creatorsWithReferrer,
      total: countResult?.count || 0,
      limit,
      offset,
    }
  })

export const getFeaturedCreatorsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(10).default(6),
    }).optional()
  )
  .handler(async ({ data }) => {
    const limit = data?.limit || 6

    const results = await db
      .select({
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          role: users.role,
        },
        profile: {
          bio: profiles.bio,
          avatar: profiles.avatar,
          banner: profiles.banner,
          badges: profiles.badges,
          accentColor: profiles.accentColor,
          creatorType: profiles.creatorType,
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
      .where(and(
        eq(profiles.isFeatured, true),
        eq(profiles.isPublic, true),
        isNotNull(profiles.creatorType)
      ))
      .orderBy(desc(userStats.followers))
      .limit(limit)

    return results
  })

export const getCreatorCategoriesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const results = await db
      .select({
        category: profiles.creatorType,
        count: sql<number>`COUNT(*)`,
      })
      .from(profiles)
      .where(and(
        isNotNull(profiles.creatorType),
        eq(profiles.isPublic, true)
      ))
      .groupBy(profiles.creatorType)
      .orderBy(desc(sql`COUNT(*)`))

    return results.filter(r => r.category !== null) as { category: string; count: number }[]
  })

export const getCreatorStatsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const [totalCreators] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(profiles)
      .where(and(
        isNotNull(profiles.creatorType),
        eq(profiles.isPublic, true)
      ))

    const [featuredCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(profiles)
      .where(and(
        eq(profiles.isFeatured, true),
        eq(profiles.isPublic, true)
      ))

    const categories = await db
      .select({
        category: profiles.creatorType,
      })
      .from(profiles)
      .where(and(
        isNotNull(profiles.creatorType),
        eq(profiles.isPublic, true)
      ))
      .groupBy(profiles.creatorType)

    const [referredCreators] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(profiles)
      .where(and(
        isNotNull(profiles.creatorType),
        isNotNull(profiles.referredBy),
        eq(profiles.isPublic, true)
      ))

    return {
      totalCreators: totalCreators?.count || 0,
      featuredCount: featuredCount?.count || 0,
      categoryCount: categories.length,
      referredCreators: referredCreators?.count || 0,
    }
  })

export type Creator = Awaited<ReturnType<typeof getCreatorsFn>>['creators'][number]
export type CreatorCategory = Awaited<ReturnType<typeof getCreatorCategoriesFn>>[number]
