/**
 * Profile Widgets Management Functions
 * Manage customizable widgets for bio pages
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { profileWidgets } from '../db/schema'
import type { WidgetSettings } from '../db/schema'

export type ProfileWidget = {
  id: string
  userId: string
  type: string
  title: string | null
  isActive: boolean | null
  order: number | null
  settings: WidgetSettings | null
  config: { [key: string]: NonNullable<unknown> } | null
  createdAt: Date
  updatedAt: Date
}
import { eq, asc, and, sql } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

// ============================================================================
// Widget Type Definitions
// ============================================================================

export const WIDGET_TYPES = [
  {
    id: 'weather',
    name: 'Weather',
    description: 'Display weather for a location',
    icon: 'CloudSun',
    premium: true,
  },
  {
    id: 'countdown',
    name: 'Countdown',
    description: 'Count down to a special date',
    icon: 'Timer',
    premium: false,
  },
  {
    id: 'social_feed',
    name: 'Social Feed',
    description: 'Embed social media posts',
    icon: 'Smartphone',
    premium: true,
  },
  {
    id: 'youtube',
    name: 'YouTube Embed',
    description: 'Embed a YouTube video',
    icon: 'Youtube',
    premium: false,
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    description: 'Embed a SoundCloud track',
    icon: 'Headphones',
    premium: false,
  },
  {
    id: 'twitch',
    name: 'Twitch Status',
    description: 'Show your Twitch live status',
    icon: 'Twitch',
    premium: true,
  },
  {
    id: 'github',
    name: 'GitHub Stats',
    description: 'Display your GitHub activity',
    icon: 'Github',
    premium: true,
  },
] as const

export type WidgetType = (typeof WIDGET_TYPES)[number]['id']

// ============================================================================
// Validation Schemas
// ============================================================================

const widgetSettingsSchema = z.object({
  size: z.enum(['small', 'medium', 'large', 'full']).optional(),
  style: z.enum(['minimal', 'card', 'glass', 'neon']).optional(),
  showTitle: z.boolean().optional(),
  customCSS: z.string().max(2000).optional(),
})

const widgetConfigSchema = z.record(z.string(), z.unknown())

export type WidgetConfig = z.infer<typeof widgetConfigSchema>

const createWidgetSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().max(100).optional(),
  settings: widgetSettingsSchema.optional(),
  config: widgetConfigSchema.optional(),
})

const updateWidgetSchema = z.object({
  id: z.uuid(),
  title: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  settings: widgetSettingsSchema.optional(),
  config: widgetConfigSchema.optional(),
  order: z.number().int().min(0).optional(),
})

const deleteWidgetSchema = z.object({
  id: z.uuid(),
})

const reorderWidgetsSchema = z.object({
  widgets: z.array(
    z.object({
      id: z.uuid(),
      order: z.number().int().min(0),
    }),
  ),
})

// ============================================================================
// Get User's Widgets
// ============================================================================

export const getMyWidgetsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      return [] as ProfileWidget[]
    }

    const user = await validateSession(token)
    if (!user) {
      return [] as ProfileWidget[]
    }

    const widgets = await db
      .select()
      .from(profileWidgets)
      .where(eq(profileWidgets.userId, user.id))
      .orderBy(asc(profileWidgets.order))

    return widgets as ProfileWidget[]
  },
)

// ============================================================================
// Get Public Widgets (for bio page)
// ============================================================================

export const getPublicWidgetsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.uuid() }))
  .handler(async ({ data }): Promise<ProfileWidget[]> => {
    const widgets = await db
      .select()
      .from(profileWidgets)
      .where(
        and(
          eq(profileWidgets.userId, data.userId),
          eq(profileWidgets.isActive, true),
        ),
      )
      .orderBy(asc(profileWidgets.order))

    return widgets as ProfileWidget[]
  })

// ============================================================================
// Create Widget
// ============================================================================

export const createWidgetFn = createServerFn({ method: 'POST' })
  .inputValidator(createWidgetSchema)
  .handler(async ({ data }): Promise<ProfileWidget> => {
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

    // Check if widget type is valid
    const widgetType = WIDGET_TYPES.find((w) => w.id === data.type)
    if (!widgetType) {
      setResponseStatus(400)
      throw { message: 'Invalid widget type', status: 400 }
    }

    // Check premium requirement
    if (
      widgetType.premium &&
      !['pro', 'creator', 'lifetime'].includes(user.tier || 'free')
    ) {
      setResponseStatus(403)
      throw {
        message: 'This widget requires a premium subscription',
        status: 403,
      }
    }

    // Get current max order
    const [maxOrder] = await db
      .select({ max: sql<number>`COALESCE(MAX(${profileWidgets.order}), -1)` })
      .from(profileWidgets)
      .where(eq(profileWidgets.userId, user.id))

    const [widget] = await db
      .insert(profileWidgets)
      .values({
        userId: user.id,
        type: data.type,
        title: data.title || widgetType.name,
        isActive: true,
        order: (maxOrder?.max ?? -1) + 1,
        settings: data.settings as WidgetSettings,
        config: data.config,
      })
      .returning()

    return widget as ProfileWidget
  })

// ============================================================================
// Update Widget
// ============================================================================

export const updateWidgetFn = createServerFn({ method: 'POST' })
  .inputValidator(updateWidgetSchema)
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
    const [existingWidget] = await db
      .select()
      .from(profileWidgets)
      .where(eq(profileWidgets.id, data.id))
      .limit(1)

    if (!existingWidget || existingWidget.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    const { id, ...updateData } = data

    const setData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (updateData.title !== undefined) setData.title = updateData.title
    if (updateData.isActive !== undefined)
      setData.isActive = updateData.isActive
    if (updateData.order !== undefined) setData.order = updateData.order
    if (updateData.settings !== undefined)
      setData.settings = updateData.settings as WidgetSettings
    if (updateData.config !== undefined) setData.config = updateData.config

    const [updated] = await db
      .update(profileWidgets)
      .set(setData)
      .where(eq(profileWidgets.id, id))
      .returning()

    return updated as ProfileWidget
  })

// ============================================================================
// Delete Widget
// ============================================================================

export const deleteWidgetFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteWidgetSchema)
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
    const [existingWidget] = await db
      .select()
      .from(profileWidgets)
      .where(eq(profileWidgets.id, data.id))
      .limit(1)

    if (!existingWidget || existingWidget.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    await db.delete(profileWidgets).where(eq(profileWidgets.id, data.id))

    return { success: true }
  })

// ============================================================================
// Reorder Widgets
// ============================================================================

export const reorderWidgetsFn = createServerFn({ method: 'POST' })
  .inputValidator(reorderWidgetsSchema)
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

    // Update each widget's order
    for (const widget of data.widgets) {
      await db
        .update(profileWidgets)
        .set({ order: widget.order, updatedAt: new Date() })
        .where(
          and(
            eq(profileWidgets.id, widget.id),
            eq(profileWidgets.userId, user.id),
          ),
        )
    }

    return { success: true }
  })

// ============================================================================
// Get Available Widget Types
// ============================================================================

export const getWidgetTypesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    const user = token ? await validateSession(token) : null
    const userTier = user?.tier || 'free'
    const isPremium = ['pro', 'creator', 'lifetime'].includes(userTier)

    return WIDGET_TYPES.map((type) => ({
      ...type,
      available: !type.premium || isPremium,
    }))
  },
)

// ============================================================================
// Type Exports
// ============================================================================

export type CreateWidgetInput = z.infer<typeof createWidgetSchema>
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>
export type { WidgetSettings }
