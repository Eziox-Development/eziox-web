/**
 * URL Shortener API
 * Create and manage short links
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { shortLinks } from '../db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

// ============================================================================
// Validation Schemas
// ============================================================================

const createShortLinkSchema = z.object({
  targetUrl: z.url({ error: 'Invalid URL' }),
  title: z.string().max(100).optional(),
  customCode: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  expiresAt: z.string().datetime().optional(),
})

const updateShortLinkSchema = z.object({
  id: z.uuid(),
  targetUrl: z.url().optional(),
  title: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
})

// ============================================================================
// Helper: Generate Short Code
// ============================================================================

function generateShortCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ============================================================================
// Get My Short Links
// ============================================================================

export const getMyShortLinksFn = createServerFn({ method: 'GET' }).handler(
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
      .from(shortLinks)
      .where(eq(shortLinks.userId, user.id))
      .orderBy(desc(shortLinks.createdAt))

    return links
  },
)

// ============================================================================
// Create Short Link
// ============================================================================

export const createShortLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(createShortLinkSchema)
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

    // Generate or use custom code
    let code = data.customCode || generateShortCode()

    // Check if code already exists
    if (data.customCode) {
      const existing = await db
        .select()
        .from(shortLinks)
        .where(eq(shortLinks.code, code))
        .limit(1)

      if (existing.length > 0) {
        setResponseStatus(409)
        throw { message: 'This short code is already taken', status: 409 }
      }
    } else {
      // Generate unique code
      let attempts = 0
      while (attempts < 10) {
        const existing = await db
          .select()
          .from(shortLinks)
          .where(eq(shortLinks.code, code))
          .limit(1)

        if (existing.length === 0) break
        code = generateShortCode()
        attempts++
      }
    }

    const [link] = await db
      .insert(shortLinks)
      .values({
        userId: user.id,
        code,
        targetUrl: data.targetUrl,
        title: data.title,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      })
      .returning()

    return link
  })

// ============================================================================
// Update Short Link
// ============================================================================

export const updateShortLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(updateShortLinkSchema)
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
    const [existing] = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.id, data.id))
      .limit(1)

    if (!existing || existing.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    const { id, ...updateData } = data

    const [updated] = await db
      .update(shortLinks)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(shortLinks.id, id))
      .returning()

    return updated
  })

// ============================================================================
// Delete Short Link
// ============================================================================

export const deleteShortLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.uuid() }))
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
    const [existing] = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.id, data.id))
      .limit(1)

    if (!existing || existing.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    await db.delete(shortLinks).where(eq(shortLinks.id, data.id))

    return { success: true }
  })

// ============================================================================
// Resolve Short Link (Public - for redirects)
// ============================================================================

export const resolveShortLinkFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data }) => {
    const [link] = await db
      .select()
      .from(shortLinks)
      .where(and(eq(shortLinks.code, data.code), eq(shortLinks.isActive, true)))
      .limit(1)

    if (!link) {
      return null
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return null
    }

    // Increment clicks
    await db
      .update(shortLinks)
      .set({
        clicks: sql`${shortLinks.clicks} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(shortLinks.id, link.id))

    return { targetUrl: link.targetUrl }
  })

// ============================================================================
// Get Short Link Stats
// ============================================================================

export const getShortLinkStatsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.uuid() }))
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

    const [link] = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.id, data.id))
      .limit(1)

    if (!link || link.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    return {
      id: link.id,
      code: link.code,
      targetUrl: link.targetUrl,
      title: link.title,
      clicks: link.clicks,
      isActive: link.isActive,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
    }
  })

// ============================================================================
// Type Exports
// ============================================================================

export type CreateShortLinkInput = z.infer<typeof createShortLinkSchema>
export type UpdateShortLinkInput = z.infer<typeof updateShortLinkSchema>
