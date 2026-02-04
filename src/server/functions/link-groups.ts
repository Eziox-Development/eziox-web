/**
 * Link Groups Management Functions
 * Organize links into collapsible sections
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { linkGroups, userLinks } from '../db/schema'
import { eq, asc, and, sql } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

// ============================================================================
// Validation Schemas
// ============================================================================

const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  isCollapsible: z.boolean().optional(),
  isCollapsed: z.boolean().optional(),
})

const updateGroupSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  isCollapsible: z.boolean().optional(),
  isCollapsed: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

const deleteGroupSchema = z.object({
  id: z.uuid(),
  moveLinksToUngrouped: z.boolean().optional(),
})

const reorderGroupsSchema = z.object({
  groups: z.array(
    z.object({
      id: z.uuid(),
      order: z.number().int().min(0),
    }),
  ),
})

const assignLinkToGroupSchema = z.object({
  linkId: z.uuid(),
  groupId: z.uuid().nullable(),
})

// ============================================================================
// Get User's Link Groups
// ============================================================================

export const getMyLinkGroupsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      return []
    }

    const user = await validateSession(token)
    if (!user) {
      return []
    }

    const groups = await db
      .select()
      .from(linkGroups)
      .where(eq(linkGroups.userId, user.id))
      .orderBy(asc(linkGroups.order))

    return groups
  },
)

// ============================================================================
// Get Link Groups with Links
// ============================================================================

export const getLinkGroupsWithLinksFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const token = getCookie('session-token')
  if (!token) {
    return { groups: [], ungroupedLinks: [] }
  }

  const user = await validateSession(token)
  if (!user) {
    return { groups: [], ungroupedLinks: [] }
  }

  // Get all groups
  const groups = await db
    .select()
    .from(linkGroups)
    .where(eq(linkGroups.userId, user.id))
    .orderBy(asc(linkGroups.order))

  // Get all links
  const links = await db
    .select()
    .from(userLinks)
    .where(eq(userLinks.userId, user.id))
    .orderBy(asc(userLinks.order))

  // Organize links by group
  const groupedLinks = groups.map((group) => ({
    ...group,
    links: links.filter((link) => link.groupId === group.id),
  }))

  // Get ungrouped links
  const ungroupedLinks = links.filter((link) => !link.groupId)

  return { groups: groupedLinks, ungroupedLinks }
})

// ============================================================================
// Get Public Link Groups (for bio page)
// ============================================================================

export const getPublicLinkGroupsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.uuid() }))
  .handler(async ({ data }) => {
    // Get all groups for user
    const groups = await db
      .select()
      .from(linkGroups)
      .where(eq(linkGroups.userId, data.userId))
      .orderBy(asc(linkGroups.order))

    // Get all active links
    const links = await db
      .select()
      .from(userLinks)
      .where(
        and(eq(userLinks.userId, data.userId), eq(userLinks.isActive, true)),
      )
      .orderBy(asc(userLinks.order))

    // Organize links by group
    const groupedLinks = groups.map((group) => ({
      id: group.id,
      name: group.name,
      icon: group.icon,
      color: group.color,
      isCollapsible: group.isCollapsible,
      isCollapsed: group.isCollapsed,
      links: links.filter((link) => link.groupId === group.id),
    }))

    // Get ungrouped links
    const ungroupedLinks = links.filter((link) => !link.groupId)

    return { groups: groupedLinks, ungroupedLinks }
  })

// ============================================================================
// Create Link Group
// ============================================================================

export const createLinkGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(createGroupSchema)
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
      .select({ max: sql<number>`COALESCE(MAX(${linkGroups.order}), -1)` })
      .from(linkGroups)
      .where(eq(linkGroups.userId, user.id))

    const [group] = await db
      .insert(linkGroups)
      .values({
        userId: user.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        isCollapsible: data.isCollapsible ?? false,
        isCollapsed: data.isCollapsed ?? false,
        order: (maxOrder?.max ?? -1) + 1,
      })
      .returning()

    return group
  })

// ============================================================================
// Update Link Group
// ============================================================================

export const updateLinkGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(updateGroupSchema)
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
    const [existingGroup] = await db
      .select()
      .from(linkGroups)
      .where(eq(linkGroups.id, data.id))
      .limit(1)

    if (!existingGroup || existingGroup.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    const { id, ...updateData } = data

    const [updated] = await db
      .update(linkGroups)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(linkGroups.id, id))
      .returning()

    return updated
  })

// ============================================================================
// Delete Link Group
// ============================================================================

export const deleteLinkGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteGroupSchema)
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
    const [existingGroup] = await db
      .select()
      .from(linkGroups)
      .where(eq(linkGroups.id, data.id))
      .limit(1)

    if (!existingGroup || existingGroup.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Not authorized', status: 403 }
    }

    // Move links to ungrouped (set groupId to null)
    if (data.moveLinksToUngrouped !== false) {
      await db
        .update(userLinks)
        .set({ groupId: null, updatedAt: new Date() })
        .where(eq(userLinks.groupId, data.id))
    }

    // Delete the group
    await db.delete(linkGroups).where(eq(linkGroups.id, data.id))

    return { success: true }
  })

// ============================================================================
// Reorder Link Groups
// ============================================================================

export const reorderLinkGroupsFn = createServerFn({ method: 'POST' })
  .inputValidator(reorderGroupsSchema)
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

    // Update each group's order
    for (const group of data.groups) {
      await db
        .update(linkGroups)
        .set({ order: group.order, updatedAt: new Date() })
        .where(and(eq(linkGroups.id, group.id), eq(linkGroups.userId, user.id)))
    }

    return { success: true }
  })

// ============================================================================
// Assign Link to Group
// ============================================================================

export const assignLinkToGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(assignLinkToGroupSchema)
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

    // Verify link ownership
    const [existingLink] = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.id, data.linkId))
      .limit(1)

    if (!existingLink || existingLink.userId !== user.id) {
      setResponseStatus(403)
      throw { message: 'Link not found or not authorized', status: 403 }
    }

    // If groupId is provided, verify group ownership
    if (data.groupId) {
      const [existingGroup] = await db
        .select()
        .from(linkGroups)
        .where(eq(linkGroups.id, data.groupId))
        .limit(1)

      if (!existingGroup || existingGroup.userId !== user.id) {
        setResponseStatus(403)
        throw { message: 'Group not found or not authorized', status: 403 }
      }
    }

    // Update link's group
    const [updated] = await db
      .update(userLinks)
      .set({ groupId: data.groupId, updatedAt: new Date() })
      .where(eq(userLinks.id, data.linkId))
      .returning()

    return updated
  })

// ============================================================================
// Type Exports
// ============================================================================

export type CreateLinkGroupInput = z.infer<typeof createGroupSchema>
export type UpdateLinkGroupInput = z.infer<typeof updateGroupSchema>
