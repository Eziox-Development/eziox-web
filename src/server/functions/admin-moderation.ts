import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus, getCookie } from '@tanstack/react-start/server'
import { db } from '../db'
import {
  users,
  userBans,
  multiAccountLinks,
  contentModerationLog,
  loginHistory,
  profiles,
} from '../db/schema'
import { eq, desc, or, like, sql } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import {
  banUser,
  unbanUser,
  checkBanStatus,
  getBanHistory,
  getPendingAppeals,
  reviewBanAppeal,
  type BanDuration,
  type BanType,
} from '../lib/account-suspension'
import {
  getMultiAccountLinks,
  updateMultiAccountStatus,
  getAllMultiAccountLinks,
} from '../lib/multi-account-detection'

// Helper to check admin/owner role
async function requireAdmin() {
  const token = getCookie('session-token')
  if (!token) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }

  const currentUser = await validateSession(token)
  if (!currentUser) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }
  if (currentUser.role !== 'admin' && currentUser.role !== 'owner') {
    setResponseStatus(403)
    throw { message: 'Admin access required', status: 403 }
  }
  return currentUser
}

// ============================================================================
// USER SEARCH & MANAGEMENT
// ============================================================================

const searchUsersSchema = z.object({
  query: z.string().max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export const adminSearchUsersFn = createServerFn({ method: 'POST' })
  .inputValidator(searchUsersSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const offset = (data.page - 1) * data.limit
    const query = data.query?.trim()

    // Build query - if no search query, return all users
    let searchResults
    let totalCount: number

    if (query && query.length >= 1) {
      // Search with query
      searchResults = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
          tier: users.tier,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
          avatar: profiles.avatar,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(
          or(
            like(users.username, `%${query}%`),
            like(users.email, `%${query}%`),
            like(users.name, `%${query}%`),
          ),
        )
        .orderBy(desc(users.createdAt))
        .limit(data.limit)
        .offset(offset)

      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          or(
            like(users.username, `%${query}%`),
            like(users.email, `%${query}%`),
            like(users.name, `%${query}%`),
          ),
        )
      totalCount = Number(countResult[0]?.count ?? 0)
    } else {
      // No query - return all users
      searchResults = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
          tier: users.tier,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
          avatar: profiles.avatar,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .orderBy(desc(users.createdAt))
        .limit(data.limit)
        .offset(offset)

      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
      totalCount = Number(countResult[0]?.count ?? 0)
    }

    // Get ban status for each user
    const usersWithBanStatus = await Promise.all(
      searchResults.map(async (user) => {
        const banStatus = await checkBanStatus(user.id)
        return {
          ...user,
          isBanned: banStatus.isBanned,
          banType: banStatus.banType,
          banReason: banStatus.reason,
          banExpiresAt: banStatus.expiresAt,
        }
      }),
    )

    return { 
      users: usersWithBanStatus,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / data.limit),
      }
    }
  })

// ============================================================================
// BAN MANAGEMENT
// ============================================================================

const banUserSchema = z.object({
  userId: z.string().uuid(),
  banType: z.enum(['temporary', 'permanent', 'shadow']),
  reason: z.string().min(1).max(500),
  internalNotes: z.string().max(1000).optional(),
  duration: z
    .object({
      type: z.enum(['hours', 'days', 'weeks', 'months', 'years', 'permanent']),
      value: z.number().min(1).max(100).optional(),
    })
    .optional(),
})

export const adminBanUserFn = createServerFn({ method: 'POST' })
  .inputValidator(banUserSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    // Prevent banning admins/owners
    const [targetUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1)

    if (!targetUser) {
      setResponseStatus(404)
      throw { message: 'User not found', status: 404 }
    }

    if (targetUser.role === 'admin' || targetUser.role === 'owner') {
      setResponseStatus(403)
      throw { message: 'Cannot ban admin or owner accounts', status: 403 }
    }

    const duration: BanDuration | undefined = data.duration
      ? data.duration.type === 'permanent'
        ? { type: 'permanent' }
        : {
            type: data.duration.type as
              | 'hours'
              | 'days'
              | 'weeks'
              | 'months'
              | 'years',
            value: data.duration.value || 1,
          }
      : undefined

    const result = await banUser({
      userId: data.userId,
      bannedBy: admin.id,
      banType: data.banType as BanType,
      reason: data.reason,
      internalNotes: data.internalNotes,
      duration,
    })

    if (!result.success) {
      setResponseStatus(500)
      throw { message: result.error || 'Failed to ban user', status: 500 }
    }

    return { success: true, banId: result.banId }
  })

const unbanUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().max(500).optional(),
})

export const adminUnbanUserFn = createServerFn({ method: 'POST' })
  .inputValidator(unbanUserSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    const result = await unbanUser(data.userId, admin.id, data.reason)

    if (!result.success) {
      setResponseStatus(500)
      throw { message: result.error || 'Failed to unban user', status: 500 }
    }

    return { success: true }
  })

const getUserBanHistorySchema = z.object({
  userId: z.string().uuid(),
})

export const adminGetUserBanHistoryFn = createServerFn({ method: 'POST' })
  .inputValidator(getUserBanHistorySchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const history = await getBanHistory(data.userId)
    return history
  })

// ============================================================================
// APPEAL MANAGEMENT
// ============================================================================

export const adminGetPendingAppealsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requireAdmin()

  const appeals = await getPendingAppeals()
  return appeals
})

const reviewAppealSchema = z.object({
  banId: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  response: z.string().min(1).max(1000),
})

export const adminReviewAppealFn = createServerFn({ method: 'POST' })
  .inputValidator(reviewAppealSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    const result = await reviewBanAppeal(
      data.banId,
      admin.id,
      data.decision,
      data.response,
    )

    if (!result.success) {
      setResponseStatus(500)
      throw { message: result.error || 'Failed to review appeal', status: 500 }
    }

    return { success: true }
  })

// ============================================================================
// MULTI-ACCOUNT DETECTION
// ============================================================================

const getMultiAccountLinksSchema = z.object({
  userId: z.string().uuid().optional(),
  status: z
    .enum(['detected', 'confirmed', 'allowed', 'false_positive'])
    .optional(),
})

export const adminGetMultiAccountLinksFn = createServerFn({ method: 'POST' })
  .inputValidator(getMultiAccountLinksSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    if (data.userId) {
      const links = await getMultiAccountLinks(data.userId)
      return links
    }

    const links = await getAllMultiAccountLinks(data.status)
    return links
  })

const updateMultiAccountStatusSchema = z.object({
  linkId: z.string().uuid(),
  status: z.enum(['confirmed', 'allowed', 'false_positive']),
  notes: z.string().max(500).optional(),
})

export const adminUpdateMultiAccountStatusFn = createServerFn({
  method: 'POST',
})
  .inputValidator(updateMultiAccountStatusSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    const result = await updateMultiAccountStatus(
      data.linkId,
      admin.id,
      data.status,
      data.notes,
    )

    if (!result.success) {
      setResponseStatus(500)
      throw { message: result.error || 'Failed to update status', status: 500 }
    }

    return { success: true }
  })

// ============================================================================
// CONTENT MODERATION LOG
// ============================================================================

const getModerationLogSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  action: z
    .enum(['blocked', 'flagged', 'auto_removed', 'manual_review'])
    .optional(),
})

export const adminGetModerationLogFn = createServerFn({ method: 'POST' })
  .inputValidator(getModerationLogSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const offset = (data.page - 1) * data.limit

    let query = db
      .select({
        id: contentModerationLog.id,
        userId: contentModerationLog.userId,
        contentType: contentModerationLog.contentType,
        contentValue: contentModerationLog.contentValue,
        action: contentModerationLog.action,
        reason: contentModerationLog.reason,
        matchedPattern: contentModerationLog.matchedPattern,
        severity: contentModerationLog.severity,
        createdAt: contentModerationLog.createdAt,
      })
      .from(contentModerationLog)
      .orderBy(desc(contentModerationLog.createdAt))
      .limit(data.limit)
      .offset(offset)

    if (data.action) {
      query = query.where(
        eq(contentModerationLog.action, data.action),
      ) as typeof query
    }

    const logs = await query

    return { logs }
  })

// ============================================================================
// LOGIN HISTORY (with anonymized IPs)
// ============================================================================

const getLoginHistorySchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
})

export const adminGetLoginHistoryFn = createServerFn({ method: 'POST' })
  .inputValidator(getLoginHistorySchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const history = await db
      .select({
        id: loginHistory.id,
        // Show only anonymized IP hash, not actual IP
        ipHash: loginHistory.ipHash,
        loginMethod: loginHistory.loginMethod,
        success: loginHistory.success,
        failureReason: loginHistory.failureReason,
        country: loginHistory.country,
        city: loginHistory.city,
        createdAt: loginHistory.createdAt,
      })
      .from(loginHistory)
      .where(eq(loginHistory.userId, data.userId))
      .orderBy(desc(loginHistory.createdAt))
      .limit(data.limit)

    return { history }
  })

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export const adminGetModerationStatsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requireAdmin()

  // Get counts
  const [banStats] = await db
    .select({
      activeBans: sql<number>`count(*) filter (where ${userBans.isActive} = true)`,
      totalBans: sql<number>`count(*)`,
      pendingAppeals: sql<number>`count(*) filter (where ${userBans.appealStatus} = 'pending')`,
    })
    .from(userBans)

  const [multiAccountStats] = await db
    .select({
      detected: sql<number>`count(*) filter (where ${multiAccountLinks.status} = 'detected')`,
      confirmed: sql<number>`count(*) filter (where ${multiAccountLinks.status} = 'confirmed')`,
      total: sql<number>`count(*)`,
    })
    .from(multiAccountLinks)

  const [moderationStats] = await db
    .select({
      blocked: sql<number>`count(*) filter (where ${contentModerationLog.action} = 'blocked')`,
      flagged: sql<number>`count(*) filter (where ${contentModerationLog.action} = 'flagged')`,
      total: sql<number>`count(*)`,
    })
    .from(contentModerationLog)

  return {
    bans: {
      active: Number(banStats?.activeBans || 0),
      total: Number(banStats?.totalBans || 0),
      pendingAppeals: Number(banStats?.pendingAppeals || 0),
    },
    multiAccount: {
      detected: Number(multiAccountStats?.detected || 0),
      confirmed: Number(multiAccountStats?.confirmed || 0),
      total: Number(multiAccountStats?.total || 0),
    },
    moderation: {
      blocked: Number(moderationStats?.blocked || 0),
      flagged: Number(moderationStats?.flagged || 0),
      total: Number(moderationStats?.total || 0),
    },
  }
})
