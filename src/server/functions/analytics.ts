import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { analyticsDaily, userStats, userLinks } from '../db/schema'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'
import { getAuthenticatedUser, getUserTier } from './auth-helpers'
import type { TierType } from '../lib/stripe'

const ANALYTICS_DELAY_HOURS = 24

function hasRealtimeAnalytics(tier: TierType): boolean {
  return ['pro', 'creator', 'lifetime'].includes(tier)
}

function getAnalyticsCutoffDate(tier: TierType): Date {
  const now = new Date()
  if (hasRealtimeAnalytics(tier)) {
    return now
  }
  return new Date(now.getTime() - ANALYTICS_DELAY_HOURS * 60 * 60 * 1000)
}

export interface AnalyticsOverview {
  totalViews: number
  totalClicks: number
  totalFollowers: number
  viewsChange: number
  clicksChange: number
  followersChange: number
  isRealtime: boolean
  analyticsDelay: number
}

export interface DailyStats {
  date: string
  views: number
  clicks: number
  followers: number
}

export interface TopLink {
  id: string
  title: string
  url: string
  clicks: number
  percentage: number
}

export interface ReferrerData {
  source: string
  count: number
  percentage: number
}

export const getAnalyticsOverviewFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)
    const cutoffDate = getAnalyticsCutoffDate(tier)
    const isRealtime = hasRealtimeAnalytics(tier)

    const stats = await db.query.userStats.findFirst({
      where: eq(userStats.userId, user.id),
    })

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const currentPeriod = await db
      .select({
        views: sql<number>`COALESCE(SUM(${analyticsDaily.profileViews}), 0)`,
        clicks: sql<number>`COALESCE(SUM(${analyticsDaily.linkClicks}), 0)`,
        followers: sql<number>`COALESCE(SUM(${analyticsDaily.newFollowers}), 0)`,
      })
      .from(analyticsDaily)
      .where(
        and(
          eq(analyticsDaily.userId, user.id),
          gte(analyticsDaily.date, thirtyDaysAgo),
          lte(analyticsDaily.date, cutoffDate),
        ),
      )

    const previousPeriod = await db
      .select({
        views: sql<number>`COALESCE(SUM(${analyticsDaily.profileViews}), 0)`,
        clicks: sql<number>`COALESCE(SUM(${analyticsDaily.linkClicks}), 0)`,
        followers: sql<number>`COALESCE(SUM(${analyticsDaily.newFollowers}), 0)`,
      })
      .from(analyticsDaily)
      .where(
        and(
          eq(analyticsDaily.userId, user.id),
          gte(analyticsDaily.date, sixtyDaysAgo),
          lte(analyticsDaily.date, thirtyDaysAgo),
        ),
      )

    const current = currentPeriod[0] || { views: 0, clicks: 0, followers: 0 }
    const previous = previousPeriod[0] || { views: 0, clicks: 0, followers: 0 }

    const calculateChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }

    return {
      totalViews: stats?.profileViews || 0,
      totalClicks: stats?.totalLinkClicks || 0,
      totalFollowers: stats?.followers || 0,
      viewsChange: calculateChange(
        Number(current.views),
        Number(previous.views),
      ),
      clicksChange: calculateChange(
        Number(current.clicks),
        Number(previous.clicks),
      ),
      followersChange: calculateChange(
        Number(current.followers),
        Number(previous.followers),
      ),
      isRealtime,
      analyticsDelay: isRealtime ? 0 : ANALYTICS_DELAY_HOURS,
    } as AnalyticsOverview
  },
)

export const getDailyStatsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ days: z.number().min(7).max(365).optional() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)
    const cutoffDate = getAnalyticsCutoffDate(tier)
    const { days = 30 } = data

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const dailyData = await db
      .select()
      .from(analyticsDaily)
      .where(
        and(
          eq(analyticsDaily.userId, user.id),
          gte(analyticsDaily.date, startDate),
          lte(analyticsDaily.date, cutoffDate),
        ),
      )
      .orderBy(analyticsDaily.date)

    const dateMap = new Map<string, DailyStats>()
    const effectiveDays = hasRealtimeAnalytics(tier) ? days : days - 1

    for (let i = 0; i < effectiveDays; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0] ?? ''
      dateMap.set(dateStr, { date: dateStr, views: 0, clicks: 0, followers: 0 })
    }

    for (const row of dailyData) {
      const dateStr = row.date.toISOString().split('T')[0] ?? ''
      if (dateStr && dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          views: row.profileViews || 0,
          clicks: row.linkClicks || 0,
          followers: row.newFollowers || 0,
        })
      }
    }

    return Array.from(dateMap.values())
  })

export const getTopLinksFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().min(1).max(20).optional() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)
    const { limit = 10 } = data

    if (!hasRealtimeAnalytics(tier)) {
      return {
        links: [] as TopLink[],
        requiresUpgrade: true,
        message: 'Per-link analytics requires Pro tier or higher',
      }
    }

    const links = await db
      .select({
        id: userLinks.id,
        title: userLinks.title,
        url: userLinks.url,
        clicks: userLinks.clicks,
      })
      .from(userLinks)
      .where(eq(userLinks.userId, user.id))
      .orderBy(desc(userLinks.clicks))
      .limit(limit)

    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)

    return {
      links: links.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        clicks: link.clicks || 0,
        percentage:
          totalClicks > 0
            ? Math.round(((link.clicks || 0) / totalClicks) * 100)
            : 0,
      })) as TopLink[],
      requiresUpgrade: false,
    }
  })

export const getReferrersFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ days: z.number().min(7).max(365).optional() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)
    const { days = 30 } = data

    if (!hasRealtimeAnalytics(tier)) {
      return {
        referrers: [] as ReferrerData[],
        requiresUpgrade: true,
        message: 'Referrer tracking requires Pro tier or higher',
      }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const dailyData = await db
      .select({ referrers: analyticsDaily.referrers })
      .from(analyticsDaily)
      .where(
        and(
          eq(analyticsDaily.userId, user.id),
          gte(analyticsDaily.date, startDate),
        ),
      )

    const referrerMap = new Map<string, number>()

    for (const row of dailyData) {
      const referrers = row.referrers as
        | { source: string; count: number }[]
        | null
      if (referrers) {
        for (const ref of referrers) {
          referrerMap.set(
            ref.source,
            (referrerMap.get(ref.source) || 0) + ref.count,
          )
        }
      }
    }

    const totalCount = Array.from(referrerMap.values()).reduce(
      (sum, count) => sum + count,
      0,
    )

    const result: ReferrerData[] = Array.from(referrerMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return { referrers: result, requiresUpgrade: false }
  })

export const exportAnalyticsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      days: z.number().min(7).max(365).optional(),
      format: z.enum(['json', 'csv']).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)
    const { days = 30, format = 'json' } = data

    if (!hasRealtimeAnalytics(tier)) {
      setResponseStatus(403)
      throw {
        message: 'Export analytics requires Pro tier or higher',
        status: 403,
        code: 'TIER_REQUIRED',
      }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const dailyData = await db
      .select()
      .from(analyticsDaily)
      .where(
        and(
          eq(analyticsDaily.userId, user.id),
          gte(analyticsDaily.date, startDate),
        ),
      )
      .orderBy(analyticsDaily.date)

    if (format === 'csv') {
      const headers = [
        'Date',
        'Profile Views',
        'Link Clicks',
        'New Followers',
        'Unique Visitors',
      ]
      const rows = dailyData.map((row) => [
        row.date.toISOString().split('T')[0],
        row.profileViews || 0,
        row.linkClicks || 0,
        row.newFollowers || 0,
        row.uniqueVisitors || 0,
      ])
      return {
        data: [headers, ...rows].map((row) => row.join(',')).join('\n'),
        format: 'csv',
      }
    }

    return {
      data: dailyData.map((row) => ({
        date: row.date.toISOString().split('T')[0],
        profileViews: row.profileViews || 0,
        linkClicks: row.linkClicks || 0,
        newFollowers: row.newFollowers || 0,
        uniqueVisitors: row.uniqueVisitors || 0,
      })),
      format: 'json',
    }
  })

export async function recordDailyAnalytics(
  userId: string,
  type: 'view' | 'click' | 'follower',
  referrer?: string,
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await db.query.analyticsDaily.findFirst({
    where: and(
      eq(analyticsDaily.userId, userId),
      eq(analyticsDaily.date, today),
    ),
  })

  if (existing) {
    const updates: Record<string, unknown> = { updatedAt: new Date() }

    if (type === 'view') {
      updates.profileViews = (existing.profileViews || 0) + 1
    } else if (type === 'click') {
      updates.linkClicks = (existing.linkClicks || 0) + 1
    } else if (type === 'follower') {
      updates.newFollowers = (existing.newFollowers || 0) + 1
    }

    if (referrer && type === 'view') {
      const currentReferrers =
        (existing.referrers as { source: string; count: number }[]) || []
      const existingRef = currentReferrers.find((r) => r.source === referrer)
      if (existingRef) {
        existingRef.count++
      } else {
        currentReferrers.push({ source: referrer, count: 1 })
      }
      updates.referrers = currentReferrers
    }

    await db
      .update(analyticsDaily)
      .set(updates)
      .where(eq(analyticsDaily.id, existing.id))
  } else {
    const newRecord: Record<string, unknown> = {
      userId,
      date: today,
      profileViews: type === 'view' ? 1 : 0,
      linkClicks: type === 'click' ? 1 : 0,
      newFollowers: type === 'follower' ? 1 : 0,
      uniqueVisitors: type === 'view' ? 1 : 0,
      referrers: referrer ? [{ source: referrer, count: 1 }] : [],
    }

    await db
      .insert(analyticsDaily)
      .values(newRecord as typeof analyticsDaily.$inferInsert)
  }
}
