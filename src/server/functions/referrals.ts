/**
 * Referral System Server Functions
 * Complete referral management with code generation, tracking, and stats
 */

import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { db } from '../db'
import { profiles, referrals, userStats, users } from '../db/schema'
import { eq, sql, desc } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique referral code
 * Format: 6-8 alphanumeric characters
 */
function generateReferralCode(username: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars (0, O, 1, I)
  const randomPart = Array.from({ length: 4 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('')

  // Use first 2-3 chars of username + random
  const prefix = username
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, 'X')
  return `${prefix}${randomPart}`
}

/**
 * Generate owner's special referral code
 */
function generateOwnerCode(): string {
  return 'EZIOX' // Special owner-only code
}

// ============================================================================
// SERVER FUNCTIONS
// ============================================================================

/**
 * Get or create referral code for current user
 */
export const getReferralCodeFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      throw new Error('Not authenticated')
    }

    const user = await validateSession(token)
    if (!user) {
      throw new Error('Invalid session')
    }

    const userId = user.id

    // Get user's profile with referral code
    const [profile] = await db
      .select({
        referralCode: profiles.referralCode,
        username: users.username,
        role: users.role,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.userId, userId))

    if (!profile) {
      throw new Error('Profile not found')
    }

    // If user already has a code, return it
    if (profile.referralCode) {
      return {
        code: profile.referralCode,
        link: `https://eziox.link/join/${profile.referralCode}`,
        isOwner: profile.role === 'owner',
      }
    }

    // Generate new code
    const isOwner = profile.role === 'owner'
    let newCode = isOwner
      ? generateOwnerCode()
      : generateReferralCode(profile.username)

    // Ensure code is unique (retry if needed)
    let attempts = 0
    while (attempts < 5) {
      const [existing] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.referralCode, newCode))

      if (!existing) break

      // Generate new code if collision
      newCode = generateReferralCode(profile.username + attempts)
      attempts++
    }

    // Save the code
    await db
      .update(profiles)
      .set({ referralCode: newCode, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))

    return {
      code: newCode,
      link: `https://eziox.link/join/${newCode}`,
      isOwner,
    }
  },
)

/**
 * Validate a referral code and get referrer info
 */
export const validateReferralCodeFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ code: z.string().min(1).max(20) }))
  .handler(async ({ data }) => {
    const { code } = data

    // Find the referrer by code
    const [referrer] = await db
      .select({
        userId: profiles.userId,
        username: users.username,
        name: users.name,
        avatar: profiles.avatar,
        role: users.role,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.referralCode, code.toUpperCase()))

    if (!referrer) {
      return { valid: false, referrer: null }
    }

    return {
      valid: true,
      referrer: {
        id: referrer.userId,
        username: referrer.username,
        name: referrer.name,
        avatar: referrer.avatar,
        isOwner: referrer.role === 'owner',
      },
    }
  })

/**
 * Process referral after user registration
 * Called internally after successful signup
 */
export const processReferralFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      newUserId: z.uuid(),
      referralCode: z.string().min(1).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const { newUserId, referralCode } = data

    // Find the referrer
    const [referrer] = await db
      .select({
        userId: profiles.userId,
        referralCode: profiles.referralCode,
      })
      .from(profiles)
      .where(eq(profiles.referralCode, referralCode.toUpperCase()))

    if (!referrer) {
      return { success: false, error: 'Invalid referral code' }
    }

    // Check if user was already referred
    const [existingReferral] = await db
      .select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.referredId, newUserId))

    if (existingReferral) {
      return { success: false, error: 'User already has a referrer' }
    }

    // Create referral record
    await db.insert(referrals).values({
      referrerId: referrer.userId,
      referredId: newUserId,
      code: referralCode.toUpperCase(),
    })

    // Update referrer's profile with referred_by
    await db
      .update(profiles)
      .set({ referredBy: referrer.userId, updatedAt: new Date() })
      .where(eq(profiles.userId, newUserId))

    // Increment referrer's referral count and score
    await db
      .update(userStats)
      .set({
        referralCount: sql`COALESCE(${userStats.referralCount}, 0) + 1`,
        score: sql`COALESCE(${userStats.score}, 0) + 5`, // +5 score per referral
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, referrer.userId))

    return { success: true, referrerId: referrer.userId }
  })

/**
 * Get referral stats for current user
 */
export const getReferralStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      throw new Error('Not authenticated')
    }

    const user = await validateSession(token)
    if (!user) {
      throw new Error('Invalid session')
    }

    const userId = user.id

    // Get referral count from stats
    const [stats] = await db
      .select({
        referralCount: userStats.referralCount,
      })
      .from(userStats)
      .where(eq(userStats.userId, userId))

    // Get list of referred users
    const referredUsers = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: profiles.avatar,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referredId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt))
      .limit(50)

    // Get who referred this user (if anyone)
    const [referredBy] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: profiles.avatar,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.referredBy, users.id))
      .where(eq(profiles.userId, userId))

    return {
      referralCount: stats?.referralCount || 0,
      referredUsers: referredUsers.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        avatar: u.avatar,
        joinedAt: u.createdAt,
      })),
      referredBy: referredBy
        ? {
            id: referredBy.id,
            username: referredBy.username,
            name: referredBy.name,
            avatar: referredBy.avatar,
          }
        : null,
    }
  },
)

/**
 * Get referral leaderboard
 */
export const getReferralLeaderboardFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().min(1).max(100).default(10) }))
  .handler(async ({ data }) => {
    const { limit } = data

    const leaderboard = await db
      .select({
        userId: userStats.userId,
        username: users.username,
        name: users.name,
        avatar: profiles.avatar,
        referralCount: userStats.referralCount,
        role: users.role,
      })
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(sql`COALESCE(${userStats.referralCount}, 0) > 0`)
      .orderBy(desc(userStats.referralCount))
      .limit(limit)

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      name: entry.name,
      avatar: entry.avatar,
      referralCount: entry.referralCount || 0,
      isOwner: entry.role === 'owner',
    }))
  })

/**
 * Regenerate referral code (premium feature or admin)
 */
export const regenerateReferralCodeFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  const token = getCookie('session-token')
  if (!token) {
    throw new Error('Not authenticated')
  }

  const currentUser = await validateSession(token)
  if (!currentUser) {
    throw new Error('Invalid session')
  }

  const userId = currentUser.id

  // Get user info
  const [user] = await db
    .select({
      username: users.username,
      role: users.role,
      tier: users.tier,
    })
    .from(users)
    .where(eq(users.id, userId))

  if (!user) {
    throw new Error('User not found')
  }

  // Only premium users or admins can regenerate
  if (
    user.tier !== 'premium' &&
    user.role !== 'admin' &&
    user.role !== 'owner'
  ) {
    throw new Error('Premium feature only')
  }

  // Owner keeps their special code
  if (user.role === 'owner') {
    return {
      code: generateOwnerCode(),
      link: `https://eziox.link/join/${generateOwnerCode()}`,
    }
  }

  // Generate new unique code
  let newCode = generateReferralCode(user.username)
  let attempts = 0
  while (attempts < 5) {
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.referralCode, newCode))

    if (!existing) break
    newCode = generateReferralCode(user.username + attempts)
    attempts++
  }

  // Update profile
  await db
    .update(profiles)
    .set({ referralCode: newCode, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))

  return {
    code: newCode,
    link: `https://eziox.link/join/${newCode}`,
  }
})
