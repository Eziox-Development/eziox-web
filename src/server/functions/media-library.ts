import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { mediaLibrary } from '../db/schema'
import { eq, desc, and, like, sql } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

async function getAuthenticatedUser() {
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
  return user
}

// Get all media items for the authenticated user
export const getMediaLibraryFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      folder: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const { folder, search, limit = 50, offset = 0 } = data

    const conditions = [eq(mediaLibrary.userId, user.id)]

    if (folder) {
      conditions.push(eq(mediaLibrary.folder, folder))
    }

    if (search) {
      conditions.push(like(mediaLibrary.filename, `%${search}%`))
    }

    const items = await db
      .select()
      .from(mediaLibrary)
      .where(and(...conditions))
      .orderBy(desc(mediaLibrary.createdAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(mediaLibrary)
      .where(and(...conditions))

    return {
      items,
      total: countResult?.count ?? 0,
      hasMore: offset + items.length < (countResult?.count ?? 0),
    }
  })

// Get folders for the authenticated user
export const getMediaFoldersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getAuthenticatedUser()

    const folders = await db
      .selectDistinct({ folder: mediaLibrary.folder })
      .from(mediaLibrary)
      .where(eq(mediaLibrary.userId, user.id))

    return {
      folders: folders
        .map((f) => f.folder)
        .filter((f): f is string => f !== null),
    }
  },
)

// Add media item to library (after upload)
export const addMediaItemFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      filename: z.string().min(1).max(255),
      originalName: z.string().max(255).optional(),
      mimeType: z.string().max(100).optional(),
      size: z.number().optional(),
      url: z.string().url(),
      thumbnailUrl: z.string().url().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      folder: z.string().max(100).optional(),
      alt: z.string().max(255).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [item] = await db
      .insert(mediaLibrary)
      .values({
        userId: user.id,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        width: data.width,
        height: data.height,
        folder: data.folder,
        alt: data.alt,
      })
      .returning()

    return { success: true, item }
  })

// Update media item
export const updateMediaItemFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      folder: z.string().max(100).optional(),
      alt: z.string().max(255).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [existing] = await db
      .select({ id: mediaLibrary.id })
      .from(mediaLibrary)
      .where(
        and(eq(mediaLibrary.id, data.id), eq(mediaLibrary.userId, user.id)),
      )
      .limit(1)

    if (!existing) {
      setResponseStatus(404)
      throw { message: 'Media item not found', status: 404 }
    }

    const updates: Record<string, unknown> = {}
    if (data.folder !== undefined) updates.folder = data.folder
    if (data.alt !== undefined) updates.alt = data.alt

    const [updated] = await db
      .update(mediaLibrary)
      .set(updates)
      .where(eq(mediaLibrary.id, data.id))
      .returning()

    return { success: true, item: updated }
  })

// Delete media item
export const deleteMediaItemFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const result = await db
      .delete(mediaLibrary)
      .where(
        and(eq(mediaLibrary.id, data.id), eq(mediaLibrary.userId, user.id)),
      )
      .returning({ id: mediaLibrary.id })

    if (result.length === 0) {
      setResponseStatus(404)
      throw { message: 'Media item not found', status: 404 }
    }

    return { success: true }
  })

// Delete multiple media items
export const deleteMediaItemsFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ ids: z.array(z.string().uuid()).min(1).max(50) }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    let deletedCount = 0
    for (const id of data.ids) {
      const result = await db
        .delete(mediaLibrary)
        .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.userId, user.id)))
        .returning({ id: mediaLibrary.id })
      if (result.length > 0) deletedCount++
    }

    return { success: true, deletedCount }
  })

// Move items to folder
export const moveToFolderFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      ids: z.array(z.string().uuid()).min(1).max(50),
      folder: z.string().max(100).nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    let movedCount = 0
    for (const id of data.ids) {
      const result = await db
        .update(mediaLibrary)
        .set({ folder: data.folder })
        .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.userId, user.id)))
        .returning({ id: mediaLibrary.id })
      if (result.length > 0) movedCount++
    }

    return { success: true, movedCount }
  })

// Get media usage stats
export const getMediaStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getAuthenticatedUser()

    const [stats] = await db
      .select({
        totalItems: sql<number>`count(*)`,
        totalSize: sql<number>`COALESCE(sum(${mediaLibrary.size}), 0)`,
      })
      .from(mediaLibrary)
      .where(eq(mediaLibrary.userId, user.id))

    const byType = await db
      .select({
        mimeType: mediaLibrary.mimeType,
        count: sql<number>`count(*)`,
      })
      .from(mediaLibrary)
      .where(eq(mediaLibrary.userId, user.id))
      .groupBy(mediaLibrary.mimeType)

    return {
      totalItems: stats?.totalItems ?? 0,
      totalSize: stats?.totalSize ?? 0,
      byType: byType.map((t) => ({
        type: t.mimeType || 'unknown',
        count: t.count,
      })),
    }
  },
)
