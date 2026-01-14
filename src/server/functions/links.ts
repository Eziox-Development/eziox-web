/**
 * User Links API
 * Linktree-style links management
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { userLinks, userStats } from '../db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

// ============================================================================
// Validation Schemas
// ============================================================================

const createLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  url: z.string().url('Invalid URL'),
  icon: z.string().max(50).optional(),
  description: z.string().max(255).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

const updateLinkSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  icon: z.string().max(50).optional(),
  description: z.string().max(255).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

const deleteLinkSchema = z.object({
  id: z.string().uuid(),
})

const reorderLinksSchema = z.object({
  links: z.array(z.object({
    id: z.string().uuid(),
    order: z.number().int().min(0),
  })),
})

// ============================================================================
// Get User Links
// ============================================================================

export const getUserLinksFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string().uuid() }))
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
  .inputValidator(z.object({ linkId: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      // Get link first to verify it exists and get userId
      const [link] = await db
        .select()
        .from(userLinks)
        .where(eq(userLinks.id, data.linkId))
        .limit(1)

      if (!link) {
        return { success: false, error: 'Link not found' }
      }

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
// Type Exports
// ============================================================================

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
