import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { notifications, users, profiles } from '../db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

export type NotificationType = 'new_follower' | 'profile_milestone' | 'link_milestone' | 'system' | 'badge_earned'

export interface NotificationData {
  id: string
  type: NotificationType
  title: string
  message: string | null
  data: { [key: string]: unknown }
  isRead: boolean
  actionUrl: string | null
  createdAt: Date
}

async function getAuthenticatedUser() {
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
  return user
}

export const getNotificationsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().optional(), offset: z.number().optional(), unreadOnly: z.boolean().optional() }))
  // @ts-expect-error - Drizzle JSONB type incompatibility with Record<string, unknown>
  .handler(async ({ data }): Promise<NotificationData[]> => {
    const user = await getAuthenticatedUser()

    const { limit = 20, offset = 0, unreadOnly = false } = data

    const conditions = [eq(notifications.userId, user.id)]
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false))
    }

    const result = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset)

    return result.map((n) => ({
      id: n.id,
      type: n.type as NotificationType,
      title: n.title,
      message: n.message,
      data: (n.data || {}) as { [key: string]: NonNullable<unknown> },
      isRead: n.isRead ?? false,
      actionUrl: n.actionUrl,
      createdAt: n.createdAt,
    }))
  })

export const getUnreadCountFn = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie('session-token')
  if (!token) return 0

  const user = await validateSession(token)
  if (!user) return 0

  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))

  return result[0]?.count || 0
})

export const markAsReadFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, data.notificationId), eq(notifications.userId, user.id)))

    return { success: true }
  })

export const markAllAsReadFn = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await getAuthenticatedUser()

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))

  return { success: true }
})

export const deleteNotificationFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    await db
      .delete(notifications)
      .where(and(eq(notifications.id, data.notificationId), eq(notifications.userId, user.id)))

    return { success: true }
  })

export const clearAllNotificationsFn = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await getAuthenticatedUser()

  await db.delete(notifications).where(eq(notifications.userId, user.id))

  return { success: true }
})

export async function createFollowerNotification(followerId: string, followedUserId: string) {
  const follower = await db
    .select({
      username: users.username,
      name: users.name,
      avatar: profiles.avatar,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, followerId))
    .limit(1)

  if (!follower[0]) return

  await db.insert(notifications).values({
    userId: followedUserId,
    type: 'new_follower',
    title: 'New Follower',
    message: `${follower[0].name || follower[0].username} started following you`,
    data: {
      followerId,
      followerUsername: follower[0].username,
      followerName: follower[0].name,
      followerAvatar: follower[0].avatar,
    },
    actionUrl: `/${follower[0].username}`,
  })
}

export async function createMilestoneNotification(
  userId: string,
  type: 'profile_milestone' | 'link_milestone',
  milestone: number,
  linkTitle?: string
) {
  const title = type === 'profile_milestone' ? 'Profile Milestone!' : 'Link Milestone!'

  const message =
    type === 'profile_milestone'
      ? `Your profile reached ${milestone.toLocaleString()} views!`
      : `Your link "${linkTitle}" reached ${milestone.toLocaleString()} clicks!`

  await db.insert(notifications).values({
    userId,
    type,
    title,
    message,
    data: { milestone, linkTitle },
    actionUrl: type === 'profile_milestone' ? '/analytics' : '/links',
  })
}

export async function createBadgeNotification(userId: string, badgeName: string, badgeIcon: string) {
  await db.insert(notifications).values({
    userId,
    type: 'badge_earned',
    title: 'Badge Earned!',
    message: `You earned the "${badgeName}" badge`,
    data: { badgeName, badgeIcon },
    actionUrl: '/profile?tab=badges',
  })
}

export async function createSystemNotification(userId: string, title: string, message: string, actionUrl?: string) {
  await db.insert(notifications).values({
    userId,
    type: 'system',
    title,
    message,
    data: {},
    actionUrl: actionUrl || null,
  })
}

const MILESTONES = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]

export async function checkAndCreateMilestoneNotifications(userId: string, currentViews: number, previousViews: number) {
  for (const milestone of MILESTONES) {
    if (currentViews >= milestone && previousViews < milestone) {
      await createMilestoneNotification(userId, 'profile_milestone', milestone)
      break
    }
  }
}

export async function checkLinkMilestone(userId: string, linkTitle: string, currentClicks: number, previousClicks: number) {
  for (const milestone of MILESTONES) {
    if (currentClicks >= milestone && previousClicks < milestone) {
      await createMilestoneNotification(userId, 'link_milestone', milestone, linkTitle)
      break
    }
  }
}
