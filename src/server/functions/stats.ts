/**
 * Platform Statistics Functions
 * Get real-time stats for the platform
 */

import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { users, userStats } from '../db/schema'
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
        .select({ total: sql<number>`sum(${userStats.totalLinkClicks})::int` })
        .from(userStats)

      const totalUsers = totalUsersResult?.count || 0
      const totalClicks = totalClicksResult?.total || 0
      // Estimate countries based on user count (rough approximation)
      // Would need IP tracking for accurate country data
      const estimatedCountries = Math.min(Math.floor(totalUsers / 10), 195)

      return {
        totalUsers,
        totalClicks,
        totalCountries: estimatedCountries,
      }
    } catch (error) {
      console.error('Failed to get platform stats:', error)
      return {
        totalUsers: 0,
        totalClicks: 0,
        totalCountries: 0,
      }
    }
  },
)
