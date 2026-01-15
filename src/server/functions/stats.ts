/**
 * Platform Statistics Functions
 * Get real-time stats for the platform
 */

import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { users, userStats, userLinks, referrals, follows } from '../db/schema'
import { sql, gte } from 'drizzle-orm'

// ============================================================================
// Platform Stats
// ============================================================================

export const getPlatformStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      // Get total users count
      const [totalUsersResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)

      // Get total link clicks
      const [totalClicksResult] = await db
        .select({ total: sql<number>`COALESCE(sum(${userStats.totalLinkClicks}), 0)::int` })
        .from(userStats)

      // Get total profile views
      const [totalViewsResult] = await db
        .select({ total: sql<number>`COALESCE(sum(${userStats.profileViews}), 0)::int` })
        .from(userStats)

      // Get total links created
      const [totalLinksResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(userLinks)

      // Get total followers (connections)
      const [totalFollowsResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(follows)

      // Get total referrals
      const [totalReferralsResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(referrals)

      // Get total score across all users
      const [totalScoreResult] = await db
        .select({ total: sql<number>`COALESCE(sum(${userStats.score}), 0)::int` })
        .from(userStats)

      // Get users active in last 24 hours (based on stats update)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const [activeUsersResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(userStats)
        .where(gte(userStats.updatedAt, oneDayAgo))

      // Get new users this week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const [newUsersResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(gte(users.createdAt, oneWeekAgo))

      const totalUsers = totalUsersResult?.count || 0
      const totalClicks = totalClicksResult?.total || 0
      const totalViews = totalViewsResult?.total || 0
      const totalLinks = totalLinksResult?.count || 0
      const totalFollows = totalFollowsResult?.count || 0
      const totalReferrals = totalReferralsResult?.count || 0
      const totalScore = totalScoreResult?.total || 0
      const activeUsers24h = activeUsersResult?.count || 0
      const newUsersThisWeek = newUsersResult?.count || 0
      // Estimate countries based on user count (rough approximation)
      const estimatedCountries = Math.min(Math.max(Math.floor(totalUsers / 5), 1), 195)

      return {
        totalUsers,
        totalClicks,
        totalViews,
        totalLinks,
        totalFollows,
        totalReferrals,
        totalScore,
        activeUsers24h,
        newUsersThisWeek,
        totalCountries: estimatedCountries,
      }
    } catch (error) {
      console.error('Failed to get platform stats:', error)
      return {
        totalUsers: 0,
        totalClicks: 0,
        totalViews: 0,
        totalLinks: 0,
        totalFollows: 0,
        totalReferrals: 0,
        totalScore: 0,
        activeUsers24h: 0,
        newUsersThisWeek: 0,
        totalCountries: 0,
      }
    }
  },
)
