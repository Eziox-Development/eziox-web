/**
 * Public API: GET /api/v1/analytics
 * Returns analytics data for authenticated user
 * Requires API key with analytics:read permission
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { userStats, userLinks, linkClickAnalytics, profileViewAnalytics } from '@/server/db/schema'
import { eq, gte, desc, and } from 'drizzle-orm'
import { validateApiKey, logApiRequest } from '@/server/functions/api-keys'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

export const Route = createFileRoute('/api/v1/analytics')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const startTime = Date.now()
        const authHeader = request.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const apiKey = authHeader.slice(7)
        const validation = await validateApiKey(apiKey)

        if (!validation.valid || !validation.apiKey) {
          return new Response(
            JSON.stringify({ error: validation.error || 'Invalid API key', code: 'INVALID_API_KEY' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const permissions = validation.apiKey.permissions as ApiKeyPermissions
        if (!permissions.analytics?.read) {
          await logApiRequest(validation.apiKey.id, '/api/v1/analytics', 'GET', 403, Date.now() - startTime)
          return new Response(
            JSON.stringify({ error: 'API key lacks analytics:read permission', code: 'FORBIDDEN' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }

        try {
          const url = new URL(request.url)
          const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '30', 10), 1), 365)
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - days)

          // Get user stats
          const [stats] = await db
            .select()
            .from(userStats)
            .where(eq(userStats.userId, validation.apiKey.userId))
            .limit(1)

          // Get top links
          const topLinks = await db
            .select({
              id: userLinks.id,
              title: userLinks.title,
              url: userLinks.url,
              clicks: userLinks.clicks,
            })
            .from(userLinks)
            .where(eq(userLinks.userId, validation.apiKey.userId))
            .orderBy(desc(userLinks.clicks))
            .limit(10)

          // Get link clicks in period
          const linkClicks = await db
            .select()
            .from(linkClickAnalytics)
            .where(
              and(
                eq(linkClickAnalytics.userId, validation.apiKey.userId),
                gte(linkClickAnalytics.clickedAt, startDate)
              )
            )

          // Get profile views in period
          const profileViews = await db
            .select()
            .from(profileViewAnalytics)
            .where(
              and(
                eq(profileViewAnalytics.profileUserId, validation.apiKey.userId),
                gte(profileViewAnalytics.viewedAt, startDate)
              )
            )

          // Aggregate daily stats
          const dailyStats: Record<string, { views: number; clicks: number }> = {}
          
          for (let i = 0; i < days; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0] ?? ''
            dailyStats[dateStr] = { views: 0, clicks: 0 }
          }

          profileViews.forEach((view) => {
            const dateStr = view.viewedAt.toISOString().split('T')[0] ?? ''
            if (dailyStats[dateStr]) {
              dailyStats[dateStr].views++
            }
          })

          linkClicks.forEach((click) => {
            const dateStr = click.clickedAt.toISOString().split('T')[0] ?? ''
            if (dailyStats[dateStr]) {
              dailyStats[dateStr].clicks++
            }
          })

          // Aggregate device stats
          const deviceStats = linkClicks.reduce((acc, click) => {
            const device = click.device || 'unknown'
            acc[device] = (acc[device] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          // Aggregate browser stats
          const browserStats = linkClicks.reduce((acc, click) => {
            const browser = click.browser || 'unknown'
            acc[browser] = (acc[browser] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          // Aggregate referrer stats
          const referrerStats = linkClicks.reduce((acc, click) => {
            let referrer = 'direct'
            if (click.referrer) {
              try {
                referrer = new URL(click.referrer).hostname
              } catch {
                referrer = click.referrer
              }
            }
            acc[referrer] = (acc[referrer] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          await logApiRequest(validation.apiKey.id, '/api/v1/analytics', 'GET', 200, Date.now() - startTime)

          return new Response(
            JSON.stringify({
              period: {
                days,
                start: startDate.toISOString(),
                end: new Date().toISOString(),
              },
              totals: {
                profileViews: stats?.profileViews || 0,
                totalLinkClicks: stats?.totalLinkClicks || 0,
                followers: stats?.followers || 0,
                following: stats?.following || 0,
                score: stats?.score || 0,
              },
              periodStats: {
                profileViews: profileViews.length,
                linkClicks: linkClicks.length,
              },
              topLinks: topLinks.map((link) => ({
                id: link.id,
                title: link.title,
                url: link.url,
                clicks: link.clicks || 0,
              })),
              dailyStats: Object.entries(dailyStats)
                .map(([date, data]) => ({ date, ...data }))
                .sort((a, b) => a.date.localeCompare(b.date)),
              deviceStats,
              browserStats,
              referrerStats,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/analytics]:', error)
          await logApiRequest(validation.apiKey.id, '/api/v1/analytics', 'GET', 500, Date.now() - startTime, undefined, undefined, String(error))
          return new Response(
            JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },
    },
  },
})
