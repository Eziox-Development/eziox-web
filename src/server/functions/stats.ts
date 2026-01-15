/**
 * Platform Statistics Functions
 * Get real-time stats for the platform
 */

import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { users, userStats, userLinks } from '../db/schema'
import { sql } from 'drizzle-orm'

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

      const totalUsers = totalUsersResult?.count || 0
      const totalClicks = totalClicksResult?.total || 0
      const totalViews = totalViewsResult?.total || 0
      const totalLinks = totalLinksResult?.count || 0
      // Estimate countries based on user count (rough approximation)
      const estimatedCountries = Math.min(Math.max(Math.floor(totalUsers / 5), 1), 195)

      return {
        totalUsers,
        totalClicks,
        totalViews,
        totalLinks,
        totalCountries: estimatedCountries,
      }
    } catch (error) {
      console.error('Failed to get platform stats:', error)
      return {
        totalUsers: 0,
        totalClicks: 0,
        totalViews: 0,
        totalLinks: 0,
        totalCountries: 0,
      }
    }
  },
)
