/**
 * Badge Server Functions
 * Manage user badges - assign, remove, check auto-awards
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '@/server/db'
import { profiles, users, userStats } from '@/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import { validateSession } from '@/server/lib/auth'
import { BADGES, BADGE_IDS, type BadgeId } from '@/lib/badges'

async function requireAuth() {
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

async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'admin' && user.role !== 'owner') {
    setResponseStatus(403)
    throw { message: 'Admin access required', status: 403 }
  }
  return user
}

export const assignBadgeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.uuid(),
      badgeId: z.enum(BADGE_IDS as [BadgeId, ...BadgeId[]]),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const badge = BADGES[data.badgeId]
    if (!badge) {
      setResponseStatus(400)
      throw { message: 'Invalid badge ID', status: 400 }
    }

    const [profile] = await db
      .select({ badges: profiles.badges })
      .from(profiles)
      .where(eq(profiles.userId, data.userId))
      .limit(1)

    if (!profile) {
      setResponseStatus(404)
      throw { message: 'User profile not found', status: 404 }
    }

    const currentBadges = (profile.badges || []) as string[]
    if (currentBadges.includes(data.badgeId)) {
      return { success: true, message: 'User already has this badge', badges: currentBadges }
    }

    const newBadges = [...currentBadges, data.badgeId]

    await db
      .update(profiles)
      .set({ badges: newBadges, updatedAt: new Date() })
      .where(eq(profiles.userId, data.userId))

    return { success: true, message: `Badge "${badge.name}" assigned`, badges: newBadges }
  })

export const removeBadgeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.uuid(),
      badgeId: z.enum(BADGE_IDS as [BadgeId, ...BadgeId[]]),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const [profile] = await db
      .select({ badges: profiles.badges })
      .from(profiles)
      .where(eq(profiles.userId, data.userId))
      .limit(1)

    if (!profile) {
      setResponseStatus(404)
      throw { message: 'User profile not found', status: 404 }
    }

    const currentBadges = (profile.badges || []) as string[]
    const newBadges = currentBadges.filter((b) => b !== data.badgeId)

    if (newBadges.length === currentBadges.length) {
      return { success: true, message: 'User does not have this badge', badges: currentBadges }
    }

    await db
      .update(profiles)
      .set({ badges: newBadges, updatedAt: new Date() })
      .where(eq(profiles.userId, data.userId))

    return { success: true, message: 'Badge removed', badges: newBadges }
  })

export const getUserBadgesFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.uuid() }))
  .handler(async ({ data }) => {
    const [profile] = await db
      .select({ badges: profiles.badges })
      .from(profiles)
      .where(eq(profiles.userId, data.userId))
      .limit(1)

    return { badges: (profile?.badges || []) as string[] }
  })

export const checkAndAwardBadgesFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ userId: z.uuid() }).optional())
  .handler(async ({ data }) => {
    const currentUser = await requireAuth()
    const targetUserId = data?.userId || currentUser.id

    if (data?.userId && data.userId !== currentUser.id) {
      if (currentUser.role !== 'admin' && currentUser.role !== 'owner') {
        setResponseStatus(403)
        throw { message: 'Cannot check badges for other users', status: 403 }
      }
    }

    const [userData] = await db
      .select({
        user: { id: users.id, role: users.role, tier: users.tier, createdAt: users.createdAt },
        profile: { badges: profiles.badges },
        stats: { referralCount: userStats.referralCount },
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .leftJoin(userStats, eq(userStats.userId, users.id))
      .where(eq(users.id, targetUserId))
      .limit(1)

    if (!userData) {
      setResponseStatus(404)
      throw { message: 'User not found', status: 404 }
    }

    const currentBadges = (userData.profile?.badges || []) as string[]
    const newBadges = [...currentBadges]
    const awarded: string[] = []

    if (userData.user.role === 'owner' && !newBadges.includes('owner')) {
      newBadges.push('owner')
      awarded.push('owner')
    }

    if (userData.user.role === 'admin' && !newBadges.includes('admin')) {
      newBadges.push('admin')
      awarded.push('admin')
    }

    const userTier = userData.user.tier || 'free'
    
    if (userTier === 'lifetime' && !newBadges.includes('lifetime_subscriber')) {
      newBadges.push('lifetime_subscriber')
      awarded.push('lifetime_subscriber')
    } else if (userTier === 'creator' && !newBadges.includes('creator_subscriber')) {
      newBadges.push('creator_subscriber')
      awarded.push('creator_subscriber')
    } else if (userTier === 'pro' && !newBadges.includes('pro_subscriber')) {
      newBadges.push('pro_subscriber')
      awarded.push('pro_subscriber')
    }
    
    if ((userTier === 'premium' || userData.user.role === 'owner') && !newBadges.includes('premium')) {
      newBadges.push('premium')
      awarded.push('premium')
    }

    const [userCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(sql`${users.createdAt} <= ${userData.user.createdAt}`)

    if (userCount && userCount.count <= 100 && !newBadges.includes('early_adopter')) {
      newBadges.push('early_adopter')
      awarded.push('early_adopter')
    }

    const referralCount = userData.stats?.referralCount || 0
    if (referralCount >= 10 && !newBadges.includes('referral_master')) {
      newBadges.push('referral_master')
      awarded.push('referral_master')
    }

    if (awarded.length > 0) {
      await db
        .update(profiles)
        .set({ badges: newBadges, updatedAt: new Date() })
        .where(eq(profiles.userId, targetUserId))
    }

    return {
      success: true,
      badges: newBadges,
      awarded,
      message: awarded.length > 0 ? `Awarded ${awarded.length} badge(s)` : 'No new badges to award',
    }
  })

export const getAllUsersWithBadgesFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }).optional()
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const limit = data?.limit || 50
    const offset = data?.offset || 0

    const results = await db
      .select({
        user: { id: users.id, username: users.username, name: users.name, role: users.role },
        profile: { avatar: profiles.avatar, badges: profiles.badges },
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset)

    const [countResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(users)

    return {
      users: results.map((r) => ({
        ...r.user,
        avatar: r.profile?.avatar,
        badges: (r.profile?.badges || []) as string[],
      })),
      total: countResult?.count || 0,
      limit,
      offset,
    }
  })

export const bulkAwardBadgeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userIds: z.array(z.uuid()).min(1).max(100),
      badgeId: z.enum(BADGE_IDS as [BadgeId, ...BadgeId[]]),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const badge = BADGES[data.badgeId]
    if (!badge) {
      setResponseStatus(400)
      throw { message: 'Invalid badge ID', status: 400 }
    }

    let awarded = 0
    for (const userId of data.userIds) {
      const [profile] = await db
        .select({ badges: profiles.badges })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1)

      if (profile) {
        const currentBadges = (profile.badges || []) as string[]
        if (!currentBadges.includes(data.badgeId)) {
          await db
            .update(profiles)
            .set({ badges: [...currentBadges, data.badgeId], updatedAt: new Date() })
            .where(eq(profiles.userId, userId))
          awarded++
        }
      }
    }

    return { success: true, message: `Badge awarded to ${awarded} user(s)`, awarded }
  })
