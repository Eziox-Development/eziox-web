import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { validateSession } from '../lib/auth'
import { requireAdmin } from './auth-helpers'
import {
  getAbuseAlerts,
  getAbuseStats,
  updateAlertStatus,
} from '../lib/abuse-detection'
import { banUser, type BanDuration, type BanType } from '../lib/account-suspension'
import { db } from '../db'
import { userLinks, abuseAlerts } from '../db/schema'
import { eq, and } from 'drizzle-orm'

// =============================================================================
// Get Abuse Alerts (Admin)
// =============================================================================

export const getAbuseAlertsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        status: z.string().optional(),
        severity: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
      .optional(),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    await requireAdmin()

    return await getAbuseAlerts({
      status: data?.status,
      severity: data?.severity,
      limit: data?.limit ?? 50,
      offset: data?.offset ?? 0,
    })
  })

// =============================================================================
// Get Abuse Stats (Admin Dashboard)
// =============================================================================

export const getAbuseStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()
    return await getAbuseStats()
  },
)

// =============================================================================
// Update Alert Status (Admin Action)
// =============================================================================

export const updateAlertStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      alertId: z.string().uuid(),
      status: z.enum(['reviewed', 'resolved', 'false_positive']),
      notes: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    await updateAlertStatus(data.alertId, data.status, admin.id, data.notes)

    return { success: true }
  })

// =============================================================================
// Get New Alerts Count (for Nav Badge)
// =============================================================================

export const getNewAlertsCountFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) return { count: 0 }

    const user = await validateSession(token)
    if (!user || (user.role !== 'admin' && user.role !== 'owner'))
      return { count: 0 }

    const stats = await getAbuseStats()
    return {
      count: stats.newAlerts,
      critical: stats.criticalAlerts,
      warning: stats.warningAlerts,
    }
  },
)

// =============================================================================
// Ban User from Alert (Admin Action)
// =============================================================================

export const banUserFromAlertFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      alertId: z.uuid(),
      userId: z.uuid(),
      duration: z.number().min(1),
      unit: z.enum(['hours', 'days', 'weeks', 'months', 'years', 'permanent']),
      type: z.enum(['temporary', 'permanent', 'shadow']),
      reason: z.string().min(1).max(500),
      notes: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    // Ban the user
    const banDuration: BanDuration | undefined = data.unit === 'permanent' 
      ? { type: 'permanent' }
      : { type: data.unit as 'hours' | 'days' | 'weeks' | 'months' | 'years', value: data.duration }
    
    await banUser({
      userId: data.userId,
      bannedBy: admin.id,
      banType: data.type as BanType,
      reason: data.reason,
      internalNotes: data.notes,
      duration: banDuration,
    })

    // Update alert status
    await updateAlertStatus(data.alertId, 'resolved', admin.id, `User banned: ${data.reason}`)

    return { success: true }
  })

// =============================================================================
// Delete User Link from Alert (Admin Action)
// =============================================================================

export const deleteLinkFromAlertFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      alertId: z.uuid(),
      userId: z.uuid(),
      linkUrl: z.url().optional(),
      notes: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    // Get alert to find link metadata
    const alert = await db.query.abuseAlerts.findFirst({
      where: eq(abuseAlerts.id, data.alertId),
    })

    if (!alert) {
      setResponseStatus(404)
      throw { message: 'Alert not found', status: 404 }
    }

    // Extract URL from metadata or use provided URL
    const metadata = alert.metadata as Record<string, unknown> | null
    const urlToDelete = data.linkUrl || (metadata?.url as string)

    if (urlToDelete) {
      // Delete all links with this URL for this user
      await db
        .delete(userLinks)
        .where(and(eq(userLinks.userId, data.userId), eq(userLinks.url, urlToDelete)))
    }

    // Update alert status
    await updateAlertStatus(
      data.alertId,
      'resolved',
      admin.id,
      data.notes || `Link deleted: ${urlToDelete}`,
    )

    return { success: true, deletedUrl: urlToDelete }
  })
