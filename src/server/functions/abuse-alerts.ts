/**
 * Abuse Alerts API
 * Admin functions for Fair Use Policy monitoring
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { validateSession } from '../lib/auth'
import {
  getAbuseAlerts,
  getAbuseStats,
  updateAlertStatus,
} from '../lib/abuse-detection'

// =============================================================================
// Helper: Require Admin
// =============================================================================

async function requireAdmin() {
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

  if (user.role !== 'admin' && user.role !== 'owner') {
    setResponseStatus(403)
    throw { message: 'Admin access required', status: 403 }
  }

  return user
}

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
