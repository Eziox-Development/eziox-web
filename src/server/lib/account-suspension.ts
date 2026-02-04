import { db } from '@/server/db'
import { userBans, users } from '@/server/db/schema'
import { eq, and, or, gt, isNull, lt } from 'drizzle-orm'
import { logSecurityEventLegacy as logSecurityEvent } from './security-monitoring'

export type BanType = 'temporary' | 'permanent' | 'shadow'
export type BanDuration =
  | { type: 'hours'; value: number }
  | { type: 'days'; value: number }
  | { type: 'weeks'; value: number }
  | { type: 'months'; value: number }
  | { type: 'years'; value: number }
  | { type: 'permanent' }

export interface BanOptions {
  userId: string
  bannedBy: string
  banType: BanType
  reason: string
  internalNotes?: string
  duration?: BanDuration
}

export interface BanInfo {
  isBanned: boolean
  banType?: BanType
  reason?: string
  expiresAt?: Date | null
  canAppeal: boolean
  appealStatus?: string
}

/**
 * Calculate expiration date from duration
 */
function calculateExpiresAt(duration?: BanDuration): Date | null {
  if (!duration || duration.type === 'permanent') {
    return null
  }

  const now = new Date()

  switch (duration.type) {
    case 'hours':
      return new Date(now.getTime() + duration.value * 60 * 60 * 1000)
    case 'days':
      return new Date(now.getTime() + duration.value * 24 * 60 * 60 * 1000)
    case 'weeks':
      return new Date(now.getTime() + duration.value * 7 * 24 * 60 * 60 * 1000)
    case 'months':
      now.setMonth(now.getMonth() + duration.value)
      return now
    case 'years':
      now.setFullYear(now.getFullYear() + duration.value)
      return now
    default:
      return null
  }
}

/**
 * Ban a user
 */
export async function banUser(
  options: BanOptions,
): Promise<{ success: boolean; banId?: string; error?: string }> {
  const { userId, bannedBy, banType, reason, internalNotes, duration } = options

  try {
    // Check if user exists
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Deactivate any existing active bans
    await db
      .update(userBans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(userBans.userId, userId), eq(userBans.isActive, true)))

    // Create new ban
    const expiresAt = calculateExpiresAt(duration)

    const [newBan] = await db
      .insert(userBans)
      .values({
        userId,
        bannedBy,
        banType,
        reason,
        internalNotes,
        expiresAt,
        isActive: true,
      })
      .returning()

    // Log security event
    logSecurityEvent('account.banned', {
      userId,
      details: {
        bannedBy,
        banType,
        reason,
        expiresAt: expiresAt?.toISOString() || 'permanent',
      },
    })

    return { success: true, banId: newBan?.id }
  } catch {
    return { success: false, error: 'Failed to ban user' }
  }
}

/**
 * Unban a user
 */
export async function unbanUser(
  userId: string,
  unbannedBy: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const [updated] = await db
      .update(userBans)
      .set({
        isActive: false,
        updatedAt: new Date(),
        appealStatus: 'approved',
        appealReviewedBy: unbannedBy,
        appealReviewedAt: new Date(),
        appealResponse: reason || 'Ban lifted by admin',
      })
      .where(and(eq(userBans.userId, userId), eq(userBans.isActive, true)))
      .returning()

    if (!updated) {
      return { success: false, error: 'No active ban found' }
    }

    logSecurityEvent('account.unbanned', {
      userId,
      details: {
        unbannedBy,
        reason,
      },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to unban user' }
  }
}

/**
 * Check if a user is currently banned
 */
export async function checkBanStatus(userId: string): Promise<BanInfo> {
  try {
    const [activeBan] = await db
      .select()
      .from(userBans)
      .where(
        and(
          eq(userBans.userId, userId),
          eq(userBans.isActive, true),
          or(isNull(userBans.expiresAt), gt(userBans.expiresAt, new Date())),
        ),
      )
      .limit(1)

    if (!activeBan) {
      // Check for expired bans and deactivate them
      await db
        .update(userBans)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(userBans.userId, userId),
            eq(userBans.isActive, true),
            lt(userBans.expiresAt, new Date()),
          ),
        )

      return { isBanned: false, canAppeal: false }
    }

    return {
      isBanned: true,
      banType: activeBan.banType as BanType,
      reason: activeBan.reason,
      expiresAt: activeBan.expiresAt,
      canAppeal: activeBan.appealStatus === 'none',
      appealStatus: activeBan.appealStatus || undefined,
    }
  } catch {
    // On error, assume not banned to avoid blocking legitimate users
    return { isBanned: false, canAppeal: false }
  }
}

/**
 * Submit an appeal for a ban
 */
export async function submitBanAppeal(
  userId: string,
  appealMessage: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const [updated] = await db
      .update(userBans)
      .set({
        appealStatus: 'pending',
        appealMessage,
        appealedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userBans.userId, userId),
          eq(userBans.isActive, true),
          eq(userBans.appealStatus, 'none'),
        ),
      )
      .returning()

    if (!updated) {
      return { success: false, error: 'No appealable ban found' }
    }

    logSecurityEvent('account.ban_appeal_submitted', {
      userId,
      details: {
        banId: updated.id,
      },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to submit appeal' }
  }
}

/**
 * Review a ban appeal
 */
export async function reviewBanAppeal(
  banId: string,
  reviewedBy: string,
  decision: 'approved' | 'rejected',
  response: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Record<string, unknown> = {
      appealStatus: decision,
      appealReviewedBy: reviewedBy,
      appealReviewedAt: new Date(),
      appealResponse: response,
      updatedAt: new Date(),
    }

    // If approved, also deactivate the ban
    if (decision === 'approved') {
      updates.isActive = false
    }

    const [updated] = await db
      .update(userBans)
      .set(updates)
      .where(and(eq(userBans.id, banId), eq(userBans.appealStatus, 'pending')))
      .returning()

    if (!updated) {
      return { success: false, error: 'Appeal not found or already reviewed' }
    }

    logSecurityEvent('account.ban_appeal_reviewed', {
      userId: updated.userId,
      details: {
        banId,
        reviewedBy,
        decision,
      },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to review appeal' }
  }
}

/**
 * Get ban history for a user
 */
export async function getBanHistory(userId: string): Promise<{
  bans: Array<{
    id: string
    banType: string
    reason: string
    expiresAt: Date | null
    isActive: boolean | null
    appealStatus: string | null
    createdAt: Date
  }>
}> {
  try {
    const bans = await db
      .select({
        id: userBans.id,
        banType: userBans.banType,
        reason: userBans.reason,
        expiresAt: userBans.expiresAt,
        isActive: userBans.isActive,
        appealStatus: userBans.appealStatus,
        createdAt: userBans.createdAt,
      })
      .from(userBans)
      .where(eq(userBans.userId, userId))
      .orderBy(userBans.createdAt)

    return { bans }
  } catch {
    return { bans: [] }
  }
}

/**
 * Get all pending appeals (for admin)
 */
export async function getPendingAppeals(): Promise<{
  appeals: Array<{
    banId: string
    userId: string
    username: string
    banType: string
    reason: string
    appealMessage: string | null
    appealedAt: Date | null
    createdAt: Date
  }>
}> {
  try {
    const appeals = await db
      .select({
        banId: userBans.id,
        userId: userBans.userId,
        username: users.username,
        banType: userBans.banType,
        reason: userBans.reason,
        appealMessage: userBans.appealMessage,
        appealedAt: userBans.appealedAt,
        createdAt: userBans.createdAt,
      })
      .from(userBans)
      .innerJoin(users, eq(userBans.userId, users.id))
      .where(eq(userBans.appealStatus, 'pending'))
      .orderBy(userBans.appealedAt)

    return { appeals }
  } catch {
    return { appeals: [] }
  }
}
