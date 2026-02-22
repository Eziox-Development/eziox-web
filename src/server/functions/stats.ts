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
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // Run all queries in parallel (3 queries instead of 8)
      const [statsAgg, countResults, timeResults] = await Promise.all([
        // 1. Aggregate all userStats sums in a single query
        db
          .select({
            totalClicks: sql<number>`COALESCE(sum(${userStats.totalLinkClicks}), 0)::int`,
            totalViews: sql<number>`COALESCE(sum(${userStats.profileViews}), 0)::int`,
            totalScore: sql<number>`COALESCE(sum(${userStats.score}), 0)::int`,
          })
          .from(userStats),
        // 2. Count queries in parallel
        Promise.all([
          db.select({ count: sql<number>`count(*)::int` }).from(users),
          db.select({ count: sql<number>`count(*)::int` }).from(userLinks),
          db.select({ count: sql<number>`count(*)::int` }).from(follows),
          db.select({ count: sql<number>`count(*)::int` }).from(referrals),
        ]),
        // 3. Time-based queries in parallel
        Promise.all([
          db.select({ count: sql<number>`count(*)::int` }).from(userStats).where(gte(userStats.updatedAt, oneDayAgo)),
          db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, oneWeekAgo)),
        ]),
      ])

      const totalUsers = countResults[0]?.[0]?.count || 0
      const totalLinks = countResults[1]?.[0]?.count || 0
      const totalFollows = countResults[2]?.[0]?.count || 0
      const totalReferrals = countResults[3]?.[0]?.count || 0
      const activeUsers24h = timeResults[0]?.[0]?.count || 0
      const newUsersThisWeek = timeResults[1]?.[0]?.count || 0

      const estimatedCountries = Math.min(
        Math.max(Math.floor(totalUsers / 5), 1),
        195,
      )

      return {
        totalUsers,
        totalClicks: statsAgg[0]?.totalClicks || 0,
        totalViews: statsAgg[0]?.totalViews || 0,
        totalLinks,
        totalFollows,
        totalReferrals,
        totalScore: statsAgg[0]?.totalScore || 0,
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
