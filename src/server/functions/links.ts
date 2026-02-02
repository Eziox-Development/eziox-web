/**
 * User Links API
 * Linktree-style links management
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { userLinks, userStats, linkClickAnalytics } from '../db/schema'
import { eq, asc, sql, desc, and, gte } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { checkLinkLimit, detectRapidCreation } from '../lib/abuse-detection'

// ============================================================================
// Validation Schemas
// ============================================================================

const createLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  url: z
    .url({ error: 'Invalid URL' })
    .max(2048, 'URL is too long (max 2048 characters)'),
  icon: z.string().max(50).optional(),
  description: z.string().max(255).optional(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  textColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
})

const linkScheduleSchema = z
  .object({
    enabled: z.boolean(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    timezone: z.string().optional(),
    showCountdown: z.boolean().optional(),
    countdownStyle: z.enum(['minimal', 'detailed', 'badge']).optional(),
    hideWhenExpired: z.boolean().optional(),
  })
  .optional()

const updateLinkSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(100).optional(),
  url: z.url().max(2048, 'URL is too long').optional(),
  icon: z.string().max(50).optional(),
  description: z.string().max(255).optional(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  textColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  schedule: linkScheduleSchema,
})

const deleteLinkSchema = z.object({
  id: z.uuid(),
})

const reorderLinksSchema = z.object({
  links: z.array(
    z.object({
      id: z.uuid(),
      order: z.number().int().min(0),
    }),
  ),
})

// ============================================================================
// Get User Links
// ============================================================================

export const getUserLinksFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.uuid() }))
  .handler(async ({ data }) => {
    const links = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.userId, data.userId))
      .orderBy(asc(userLinks.order))

    return links
  })

// ============================================================================
// Get My Links
// ============================================================================

export const getMyLinksFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      return []
    }

    const user = await validateSession(token)
    if (!user) {
      return []
    }

    const links = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.userId, user.id))
      .orderBy(asc(userLinks.order))

    return links
  },
)

// ============================================================================
// Create Link
// ============================================================================

export const createLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(createLinkSchema)
  .handler(async ({ data }) => {
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

    // Rate limit link creation (30 per minute per user)
    const rateLimitResult = checkRateLimit(
      `link-create:${user.id}`,
      RATE_LIMITS.API_SPOTIFY.maxRequests, // 30 per minute
      RATE_LIMITS.API_SPOTIFY.windowMs,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many requests. Please wait before creating more links.',
        status: 429,
        code: 'RATE_LIMITED',
      }
    }

    // Fair Use Policy: Check link limit (tier-based soft limits with hard cap)
    const linkLimitResult = await checkLinkLimit(user.id, user.tier || 'free')
    if (!linkLimitResult.allowed) {
      setResponseStatus(400)
      throw {
        message:
          linkLimitResult.message ||
          'Link limit reached. Please contact support.',
        status: 400,
        code: 'LINK_LIMIT_REACHED',
      }
    }

    // Detect rapid creation (spam detection)
    const isSpamming = await detectRapidCreation(user.id, 'link', 5, 20)
    if (isSpamming) {
      setResponseStatus(429)
      throw {
        message: 'Too many links created in a short time. Please slow down.',
        status: 429,
        code: 'RAPID_CREATION_DETECTED',
      }
    }

    // Get current max order
    const [maxOrder] = await db
      .select({ max: sql<number>`COALESCE(MAX(${userLinks.order}), -1)` })
      .from(userLinks)
      .where(eq(userLinks.userId, user.id))

    const [link] = await db
      .insert(userLinks)
      .values({
        userId: user.id,
        title: data.title,
        url: data.url,
        icon: data.icon,
        description: data.description,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        order: (maxOrder?.max ?? -1) + 1,
      })
      .returning()

    return link
  })

// ============================================================================
// Update Link
// ============================================================================

export const updateLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(updateLinkSchema)
  .handler(async ({ data }) => {
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

    // Verify ownership
    const [existingLink] = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.id, data.id))
      .limit(1)

    if (!existingLink || existingLink.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    const { id, ...updateData } = data

    const [updated] = await db
      .update(userLinks)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(userLinks.id, id))
      .returning()

    return updated
  })

// ============================================================================
// Delete Link
// ============================================================================

export const deleteLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteLinkSchema)
  .handler(async ({ data }) => {
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

    // Verify ownership
    const [existingLink] = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.id, data.id))
      .limit(1)

    if (!existingLink || existingLink.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    await db.delete(userLinks).where(eq(userLinks.id, data.id))

    return { success: true }
  })

// ============================================================================
// Reorder Links
// ============================================================================

export const reorderLinksFn = createServerFn({ method: 'POST' })
  .inputValidator(reorderLinksSchema)
  .handler(async ({ data }) => {
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

    // Update each link's order
    for (const link of data.links) {
      await db
        .update(userLinks)
        .set({ order: link.order, updatedAt: new Date() })
        .where(eq(userLinks.id, link.id))
    }

    return { success: true }
  })

// ============================================================================
// Track Link Click
// ============================================================================

export const trackLinkClickFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      linkId: z.uuid(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const [link] = await db
        .select()
        .from(userLinks)
        .where(eq(userLinks.id, data.linkId))
        .limit(1)

      if (!link) {
        return { success: false, error: 'Link not found' }
      }

      // Parse user agent for device/browser/os info
      const ua = data.userAgent || ''
      const device = /Mobile|Android|iPhone|iPad/i.test(ua)
        ? 'mobile'
        : /Tablet/i.test(ua)
          ? 'tablet'
          : 'desktop'
      const browser = /Chrome/i.test(ua)
        ? 'Chrome'
        : /Firefox/i.test(ua)
          ? 'Firefox'
          : /Safari/i.test(ua)
            ? 'Safari'
            : /Edge/i.test(ua)
              ? 'Edge'
              : 'Other'
      const os = /Windows/i.test(ua)
        ? 'Windows'
        : /Mac/i.test(ua)
          ? 'macOS'
          : /Linux/i.test(ua)
            ? 'Linux'
            : /Android/i.test(ua)
              ? 'Android'
              : /iOS|iPhone|iPad/i.test(ua)
                ? 'iOS'
                : 'Other'

      // Store detailed click analytics
      await db.insert(linkClickAnalytics).values({
        linkId: data.linkId,
        userId: link.userId,
        device,
        browser,
        os,
        referrer: data.referrer || null,
        userAgent: ua || null,
      })

      // Increment link clicks
      const [updatedLink] = await db
        .update(userLinks)
        .set({
          clicks: sql`COALESCE(${userLinks.clicks}, 0) + 1`,
          updatedAt: new Date(),
        })
        .where(eq(userLinks.id, data.linkId))
        .returning()

      // Increment user's total link clicks in stats
      await db
        .update(userStats)
        .set({
          totalLinkClicks: sql`COALESCE(${userStats.totalLinkClicks}, 0) + 1`,
          score: sql`COALESCE(${userStats.score}, 0) + 1`,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, link.userId))

      return { success: true, clicks: updatedLink?.clicks }
    } catch {
      return { success: false, error: 'Failed to track click' }
    }
  })

// ============================================================================
// Get Link Analytics
// ============================================================================

export const getLinkAnalyticsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      linkId: z.uuid(),
      days: z.number().min(1).max(365).default(30),
    }),
  )
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(token)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Invalid session', status: 401 }
    }

    // Verify link ownership
    const [link] = await db
      .select()
      .from(userLinks)
      .where(and(eq(userLinks.id, data.linkId), eq(userLinks.userId, user.id)))
      .limit(1)

    if (!link) {
      setResponseStatus(404)
      throw { message: 'Link not found', status: 404 }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - data.days)

    // Get all clicks for this link in the time period
    const clicks = await db
      .select()
      .from(linkClickAnalytics)
      .where(
        and(
          eq(linkClickAnalytics.linkId, data.linkId),
          gte(linkClickAnalytics.clickedAt, startDate),
        ),
      )
      .orderBy(desc(linkClickAnalytics.clickedAt))

    // Aggregate by device
    const deviceStats = clicks.reduce(
      (acc, click) => {
        const device = click.device || 'unknown'
        acc[device] = (acc[device] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Aggregate by browser
    const browserStats = clicks.reduce(
      (acc, click) => {
        const browser = click.browser || 'unknown'
        acc[browser] = (acc[browser] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Aggregate by OS
    const osStats = clicks.reduce(
      (acc, click) => {
        const os = click.os || 'unknown'
        acc[os] = (acc[os] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Aggregate by country
    const countryStats = clicks.reduce(
      (acc, click) => {
        const country = click.country || 'unknown'
        acc[country] = (acc[country] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Aggregate by referrer
    const referrerStats = clicks.reduce(
      (acc, click) => {
        const referrer = click.referrer
          ? new URL(click.referrer).hostname
          : 'direct'
        acc[referrer] = (acc[referrer] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Aggregate by day
    const dailyClicks = clicks.reduce(
      (acc, click) => {
        const dateParts = click.clickedAt.toISOString().split('T')
        const date = dateParts[0] ?? 'unknown'
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Aggregate by hour (for heatmap)
    const hourlyClicks = clicks.reduce(
      (acc, click) => {
        const hour = click.clickedAt.getHours()
        const day = click.clickedAt.getDay()
        const key = `${day}-${hour}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      link: {
        id: link.id,
        title: link.title,
        url: link.url,
        totalClicks: link.clicks || 0,
      },
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days: data.days,
      },
      totalClicks: clicks.length,
      deviceStats,
      browserStats,
      osStats,
      countryStats,
      referrerStats,
      dailyClicks,
      hourlyClicks,
    }
  })

// ============================================================================
// Get All Links Analytics Summary
// ============================================================================

export const getAllLinksAnalyticsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      days: z.number().min(1).max(365).default(30),
    }),
  )
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(token)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Invalid session', status: 401 }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - data.days)

    // Get all user's links with their analytics
    const links = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.userId, user.id))
      .orderBy(desc(userLinks.clicks))

    // Get all clicks for user's links
    const clicks = await db
      .select()
      .from(linkClickAnalytics)
      .where(
        and(
          eq(linkClickAnalytics.userId, user.id),
          gte(linkClickAnalytics.clickedAt, startDate),
        ),
      )

    // Aggregate per-link stats
    const linkStats = links.map((link) => {
      const linkClicks = clicks.filter((c) => c.linkId === link.id)
      return {
        id: link.id,
        title: link.title,
        url: link.url,
        totalClicks: link.clicks || 0,
        periodClicks: linkClicks.length,
        devices: linkClicks.reduce(
          (acc, c) => {
            acc[c.device || 'unknown'] = (acc[c.device || 'unknown'] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      }
    })

    // Overall device stats
    const deviceStats = clicks.reduce(
      (acc, click) => {
        const device = click.device || 'unknown'
        acc[device] = (acc[device] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Overall browser stats
    const browserStats = clicks.reduce(
      (acc, click) => {
        const browser = click.browser || 'unknown'
        acc[browser] = (acc[browser] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days: data.days,
      },
      totalClicks: clicks.length,
      linkStats,
      deviceStats,
      browserStats,
    }
  })

// ============================================================================
// Type Exports
// ============================================================================

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
