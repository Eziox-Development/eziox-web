/**
 * Followers System API
 * Professional, real-time follow/unfollow functionality
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie } from '@tanstack/react-start/server'
import { db } from '../db'
import { follows, users, profiles, userStats } from '../db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import { createFollowerNotification } from './notifications'

// ============================================================================
// Check if Following
// ============================================================================

export const isFollowingFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ targetUserId: z.uuid() }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      return { isFollowing: false, isAuthenticated: false }
    }

    const user = await validateSession(token)
    if (!user) {
      return { isFollowing: false, isAuthenticated: false }
    }

    // Can't follow yourself
    if (user.id === data.targetUserId) {
      return { isFollowing: false, isAuthenticated: true, isSelf: true }
    }

    const [existing] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, data.targetUserId)
        )
      )
      .limit(1)

    return { 
      isFollowing: !!existing, 
      isAuthenticated: true,
      isSelf: false,
      currentUserId: user.id,
    }
  })

// ============================================================================
// Follow User
// ============================================================================

export const followUserFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ targetUserId: z.uuid() }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const user = await validateSession(token)
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Can't follow yourself
    if (user.id === data.targetUserId) {
      return { success: false, error: 'Cannot follow yourself' }
    }

    // Check if already following
    const [existing] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, data.targetUserId)
        )
      )
      .limit(1)

    if (existing) {
      return { success: false, error: 'Already following' }
    }

    // Create follow relationship
    await db.insert(follows).values({
      followerId: user.id,
      followingId: data.targetUserId,
    })

    // Update follower count for target user
    await db
      .update(userStats)
      .set({
        followers: sql`COALESCE(${userStats.followers}, 0) + 1`,
        score: sql`COALESCE(${userStats.score}, 0) + 2`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, data.targetUserId))

    // Update following count for current user
    await db
      .update(userStats)
      .set({
        following: sql`COALESCE(${userStats.following}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, user.id))

    // Get updated follower count
    const [targetStats] = await db
      .select({ followers: userStats.followers })
      .from(userStats)
      .where(eq(userStats.userId, data.targetUserId))
      .limit(1)

    // Create notification for the followed user
    await createFollowerNotification(user.id, data.targetUserId)

    return { 
      success: true, 
      isFollowing: true,
      newFollowerCount: targetStats?.followers || 0,
    }
  })

// ============================================================================
// Unfollow User
// ============================================================================

export const unfollowUserFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ targetUserId: z.uuid() }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const user = await validateSession(token)
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Delete follow relationship
    const result = await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, data.targetUserId)
        )
      )
      .returning()

    if (result.length === 0) {
      return { success: false, error: 'Not following' }
    }

    // Update follower count for target user
    await db
      .update(userStats)
      .set({
        followers: sql`GREATEST(COALESCE(${userStats.followers}, 0) - 1, 0)`,
        score: sql`GREATEST(COALESCE(${userStats.score}, 0) - 2, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, data.targetUserId))

    // Update following count for current user
    await db
      .update(userStats)
      .set({
        following: sql`GREATEST(COALESCE(${userStats.following}, 0) - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, user.id))

    // Get updated follower count
    const [targetStats] = await db
      .select({ followers: userStats.followers })
      .from(userStats)
      .where(eq(userStats.userId, data.targetUserId))
      .limit(1)

    return { 
      success: true, 
      isFollowing: false,
      newFollowerCount: targetStats?.followers || 0,
    }
  })

// ============================================================================
// Get Followers List
// ============================================================================

export const getFollowersFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ 
    userId: z.uuid(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    const currentUser = token ? await validateSession(token) : null

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
          bio: profiles.bio,
        },
        followedAt: follows.createdAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(follows.followingId, data.userId))
      .orderBy(desc(follows.createdAt))
      .limit(data.limit)
      .offset(data.offset)

    // Check if current user follows each follower
    const followersWithStatus = await Promise.all(
      results.map(async (result) => {
        let isFollowing = false
        if (currentUser && currentUser.id !== result.user.id) {
          const [existing] = await db
            .select()
            .from(follows)
            .where(
              and(
                eq(follows.followerId, currentUser.id),
                eq(follows.followingId, result.user.id)
              )
            )
            .limit(1)
          isFollowing = !!existing
        }
        return {
          ...result,
          isFollowing,
          isSelf: currentUser?.id === result.user.id,
        }
      })
    )

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followingId, data.userId))

    return {
      followers: followersWithStatus,
      total: countResult?.count || 0,
      hasMore: (data.offset + data.limit) < (countResult?.count || 0),
    }
  })

// ============================================================================
// Get Following List
// ============================================================================

export const getFollowingFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ 
    userId: z.uuid(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    const currentUser = token ? await validateSession(token) : null

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
          bio: profiles.bio,
        },
        followedAt: follows.createdAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(follows.followerId, data.userId))
      .orderBy(desc(follows.createdAt))
      .limit(data.limit)
      .offset(data.offset)

    // Check if current user follows each user
    const followingWithStatus = await Promise.all(
      results.map(async (result) => {
        let isFollowing = false
        if (currentUser && currentUser.id !== result.user.id) {
          const [existing] = await db
            .select()
            .from(follows)
            .where(
              and(
                eq(follows.followerId, currentUser.id),
                eq(follows.followingId, result.user.id)
              )
            )
            .limit(1)
          isFollowing = !!existing
        }
        return {
          ...result,
          isFollowing: currentUser?.id === result.user.id ? false : isFollowing,
          isSelf: currentUser?.id === result.user.id,
        }
      })
    )

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followerId, data.userId))

    return {
      following: followingWithStatus,
      total: countResult?.count || 0,
      hasMore: (data.offset + data.limit) < (countResult?.count || 0),
    }
  })

// ============================================================================
// Get Follow Stats
// ============================================================================

export const getFollowStatsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.uuid() }))
  .handler(async ({ data }) => {
    const [stats] = await db
      .select({
        followers: userStats.followers,
        following: userStats.following,
      })
      .from(userStats)
      .where(eq(userStats.userId, data.userId))
      .limit(1)

    return {
      followers: stats?.followers || 0,
      following: stats?.following || 0,
    }
  })
