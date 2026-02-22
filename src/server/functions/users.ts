import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getRequestIP } from '@tanstack/react-start/server'
import { db } from '../db'
import { users, profiles, userStats, userLinks, linkGroups } from '../db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'

export const getPublicProfileFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      username: z.string(),
      sessionId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const [result] = await db
      .select({
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          role: users.role,
          tier: users.tier,
          createdAt: users.createdAt,
        },
        profile: profiles,
        stats: userStats,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .leftJoin(userStats, eq(userStats.userId, users.id))
      .where(eq(users.username, data.username.toLowerCase()))
      .limit(1)

    if (!result) {
      return null
    }

    // Check if profile is public
    if (result.profile && !result.profile.isPublic) {
      return {
        user: result.user,
        profile: { isPublic: false },
        stats: null,
        links: [],
      }
    }

    // Get user's links
    const links = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.userId, result.user.id))
      .orderBy(asc(userLinks.order))

    // Get user's link groups
    const groups = await db
      .select()
      .from(linkGroups)
      .where(eq(linkGroups.userId, result.user.id))
      .orderBy(asc(linkGroups.order))

    return {
      user: result.user,
      profile: result.profile,
      stats: result.stats,
      links: links.filter((l) => l.isActive),
      linkGroups: groups,
    }
  })

export const trackProfileViewFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.uuid(),
      sessionId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(
      `profile-view:${data.userId}:${ip}`,
      RATE_LIMITS.PROFILE_VIEW.maxRequests,
      RATE_LIMITS.PROFILE_VIEW.windowMs,
    )
    if (!rateLimit.allowed) {
      return { success: false }
    }

    try {
      await db
        .update(userStats)
        .set({
          profileViews: sql`COALESCE(${userStats.profileViews}, 0) + 1`,
          score: sql`COALESCE(${userStats.score}, 0) + 1`,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, data.userId))

      return { success: true }
    } catch {
      return { success: false }
    }
  })

export const getLeaderboardFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        sortBy: z
          .enum(['score', 'profileViews', 'totalLinkClicks', 'followers'])
          .default('score'),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const sortBy = data?.sortBy || 'score'
    const limit = data?.limit || 20
    const offset = data?.offset || 0

    const sortColumn = {
      score: userStats.score,
      profileViews: userStats.profileViews,
      totalLinkClicks: userStats.totalLinkClicks,
      followers: userStats.followers,
    }[sortBy]

    const results = await db
      .select({
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${sortColumn} DESC)`.as(
          'rank',
        ),
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          role: users.role,
        },
        profile: {
          avatar: profiles.avatar,
          badges: profiles.badges,
          accentColor: profiles.accentColor,
          bio: profiles.bio,
        },
        stats: {
          score: userStats.score,
          profileViews: userStats.profileViews,
          totalLinkClicks: userStats.totalLinkClicks,
          followers: userStats.followers,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .leftJoin(userStats, eq(userStats.userId, users.id))
      .orderBy(desc(sortColumn))
      .limit(limit)
      .offset(offset)

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(users)

    return {
      users: results,
      total: countResult?.count || 0,
      limit,
      offset,
    }
  })

export const searchUsersFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      query: z.string().min(1).max(50),
      limit: z.number().int().min(1).max(20).default(10),
    }),
  )
  .handler(async ({ data }) => {
    // Escape special ILIKE characters to prevent pattern injection
    const escaped = data.query.replace(/[%_\\]/g, (c) => `\\${c}`)
    const pattern = `%${escaped}%`

    const results = await db
      .select({
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          role: users.role,
        },
        profile: {
          avatar: profiles.avatar,
          badges: profiles.badges,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(
        sql`${users.username} ILIKE ${pattern} OR ${users.name} ILIKE ${pattern}`,
      )
      .limit(data.limit)

    return results
  })

export const getTopUsersFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        limit: z.number().int().min(1).max(100).default(5),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const limit = data?.limit || 5

    const results = await db
      .select({
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          role: users.role,
        },
        profile: {
          avatar: profiles.avatar,
          badges: profiles.badges,
          accentColor: profiles.accentColor,
          bio: profiles.bio,
        },
        stats: {
          score: userStats.score,
          profileViews: userStats.profileViews,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .leftJoin(userStats, eq(userStats.userId, users.id))
      .orderBy(desc(userStats.score))
      .limit(limit)

    return results
  })

export type PublicProfile = Awaited<ReturnType<typeof getPublicProfileFn>>
export type LeaderboardResult = Awaited<ReturnType<typeof getLeaderboardFn>>
