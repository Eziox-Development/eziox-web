import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { notifications, users, profiles } from '../db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

export type NotificationType =
  | 'new_follower'
  | 'profile_milestone'
  | 'link_milestone'
  | 'system'
  | 'badge_earned'
  | 'subscription'

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
  .inputValidator(
    z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      unreadOnly: z.boolean().optional(),
    }),
  )
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

export const getUnreadCountFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) return 0

    const user = await validateSession(token)
    if (!user) return 0

    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, user.id), eq(notifications.isRead, false)),
      )

    return result[0]?.count || 0
  },
)

export const markAsReadFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, data.notificationId),
          eq(notifications.userId, user.id),
        ),
      )

    return { success: true }
  })

export const markAllAsReadFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const user = await getAuthenticatedUser()

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(eq(notifications.userId, user.id), eq(notifications.isRead, false)),
      )

    return { success: true }
  },
)

export const deleteNotificationFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, data.notificationId),
          eq(notifications.userId, user.id),
        ),
      )

    return { success: true }
  })

export const clearAllNotificationsFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  const user = await getAuthenticatedUser()

  await db.delete(notifications).where(eq(notifications.userId, user.id))

  return { success: true }
})

export async function createFollowerNotification(
  followerId: string,
  followedUserId: string,
) {
  const [targetProfile] = await db
    .select({ notifyNewFollower: profiles.notifyNewFollower })
    .from(profiles)
    .where(eq(profiles.userId, followedUserId))
    .limit(1)

  if (targetProfile?.notifyNewFollower === false) return

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
  linkTitle?: string,
) {
  const [userProfile] = await db
    .select({ notifyMilestones: profiles.notifyMilestones })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  if (userProfile?.notifyMilestones === false) return

  const title =
    type === 'profile_milestone' ? 'Profile Milestone!' : 'Link Milestone!'

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

export async function createBadgeNotification(
  userId: string,
  badgeName: string,
  badgeIcon: string,
) {
  await db.insert(notifications).values({
    userId,
    type: 'badge_earned',
    title: 'Badge Earned!',
    message: `You earned the "${badgeName}" badge`,
    data: { badgeName, badgeIcon },
    actionUrl: '/profile?tab=badges',
  })
}

export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string,
) {
  await db.insert(notifications).values({
    userId,
    type: 'system',
    title,
    message,
    data: {},
    actionUrl: actionUrl || null,
  })
}

export type SubscriptionEvent =
  | 'upgraded'
  | 'downgraded'
  | 'canceled'
  | 'renewed'
  | 'payment_failed'
  | 'trial_ending'
  | 'tier_granted'
  | 'tier_expired'
  | 'suspended'
  | 'refunded'

const TIER_NAMES: Record<string, string> = {
  free: 'Eziox Core',
  pro: 'Pro',
  creator: 'Creator',
  lifetime: 'Lifetime',
}

export async function createSubscriptionNotification(
  userId: string,
  event: SubscriptionEvent,
  data: {
    tier?: string
    previousTier?: string
    expiresAt?: Date | null
    adminGranted?: boolean
    reason?: string
    failedCount?: number
    maxAttempts?: number
    refundAmount?: string
  } = {},
) {
  const tierName = data.tier ? TIER_NAMES[data.tier] || data.tier : ''
  const previousTierName = data.previousTier
    ? TIER_NAMES[data.previousTier] || data.previousTier
    : ''

  let title = ''
  let message = ''
  const actionUrl = '/profile?tab=subscription'

  switch (event) {
    case 'upgraded':
      title = 'Upgrade Successful'
      message = `Welcome to ${tierName}! Your new features are now active.`
      break
    case 'downgraded':
      title = 'Plan Changed'
      message = `Your plan has been changed to ${tierName}.`
      break
    case 'canceled':
      title = 'Subscription Canceled'
      message = `Your ${tierName} subscription has been canceled. You'll keep access until the end of your billing period.`
      break
    case 'renewed':
      title = 'Subscription Renewed'
      message = `Your ${tierName} subscription has been renewed. Thank you for your support!`
      break
    case 'payment_failed':
      title = 'Payment Failed'
      message = data.failedCount && data.maxAttempts
        ? `Payment attempt ${data.failedCount} of ${data.maxAttempts} failed. Please update your payment method.`
        : "We couldn't process your payment. Please update your payment method to keep your subscription active."
      break
    case 'trial_ending':
      title = 'Trial Ending Soon'
      message = `Your ${tierName} trial ends soon. Upgrade now to keep your premium features.`
      break
    case 'tier_granted':
      title = 'Tier Granted'
      message = data.adminGranted
        ? `You've been granted ${tierName} access by an admin. Enjoy your new features!`
        : `You now have ${tierName} access!`
      break
    case 'tier_expired':
      title = 'Subscription Expired'
      message = `Your ${previousTierName} subscription has expired. You've been moved to ${tierName}.`
      break
    case 'suspended':
      title = 'Subscription Suspended'
      message = data.reason === 'payment_failed'
        ? `Your subscription has been suspended after ${data.failedCount || 3} failed payment attempts. Please update your payment method and resubscribe.`
        : 'Your subscription has been suspended. Please contact support for assistance.'
      break
    case 'refunded':
      title = 'Refund Processed'
      message = data.refundAmount
        ? `A refund of ${data.refundAmount} has been processed. It should appear in your account within 5-10 business days.`
        : 'Your refund has been processed. It should appear in your account within 5-10 business days.'
      break
    default:
      title = 'Subscription Update'
      message = 'Your subscription status has changed.'
  }

  await db.insert(notifications).values({
    userId,
    type: 'subscription',
    title,
    message,
    data: {
      event,
      tier: data.tier,
      previousTier: data.previousTier,
      expiresAt: data.expiresAt,
    },
    actionUrl,
  })
}

const MILESTONES = [
  10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000,
]

export async function checkAndCreateMilestoneNotifications(
  userId: string,
  currentViews: number,
  previousViews: number,
) {
  for (const milestone of MILESTONES) {
    if (currentViews >= milestone && previousViews < milestone) {
      await createMilestoneNotification(userId, 'profile_milestone', milestone)
      break
    }
  }
}

export async function checkLinkMilestone(
  userId: string,
  linkTitle: string,
  currentClicks: number,
  previousClicks: number,
) {
  for (const milestone of MILESTONES) {
    if (currentClicks >= milestone && previousClicks < milestone) {
      await createMilestoneNotification(
        userId,
        'link_milestone',
        milestone,
        linkTitle,
      )
      break
    }
  }
}

export const getNotificationSettingsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const user = await getAuthenticatedUser()

  const [profile] = await db
    .select({
      notifyNewFollower: profiles.notifyNewFollower,
      notifyMilestones: profiles.notifyMilestones,
      notifySystemUpdates: profiles.notifySystemUpdates,
      emailLoginAlerts: profiles.emailLoginAlerts,
      emailSecurityAlerts: profiles.emailSecurityAlerts,
      emailWeeklyDigest: profiles.emailWeeklyDigest,
      emailProductUpdates: profiles.emailProductUpdates,
      lastSeenChangelog: profiles.lastSeenChangelog,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return {
    notifyNewFollower: profile?.notifyNewFollower ?? true,
    notifyMilestones: profile?.notifyMilestones ?? true,
    notifySystemUpdates: profile?.notifySystemUpdates ?? true,
    emailLoginAlerts: profile?.emailLoginAlerts ?? true,
    emailSecurityAlerts: profile?.emailSecurityAlerts ?? true,
    emailWeeklyDigest: profile?.emailWeeklyDigest ?? true,
    emailProductUpdates: profile?.emailProductUpdates ?? true,
    lastSeenChangelog: profile?.lastSeenChangelog || null,
  }
})

export const updateNotificationSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      notifyNewFollower: z.boolean().optional(),
      notifyMilestones: z.boolean().optional(),
      notifySystemUpdates: z.boolean().optional(),
      emailLoginAlerts: z.boolean().optional(),
      emailSecurityAlerts: z.boolean().optional(),
      emailWeeklyDigest: z.boolean().optional(),
      emailProductUpdates: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })

export const updateLastSeenChangelogFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ version: z.string() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    await db
      .update(profiles)
      .set({
        lastSeenChangelog: data.version,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })
