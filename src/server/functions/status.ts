/**
 * Status Page Server Functions
 * Handles incidents, status subscriptions, and email notifications.
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import {
  statusIncidents,
  statusIncidentUpdates,
  statusSubscriptions,
} from '../db/schema'
import { eq, desc, and, isNull, isNotNull, inArray } from 'drizzle-orm'
import { requireAdmin, getOptionalUser } from './auth-helpers'
import { sendEmail, generateEmailTemplate } from '../lib/email'
import { randomBytes } from 'crypto'

// ============================================================================
// PUBLIC: Get incidents (active + recent resolved)
// ============================================================================

export const getIncidentsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const activeIncidents = await db
      .select()
      .from(statusIncidents)
      .where(isNull(statusIncidents.resolvedAt))
      .orderBy(desc(statusIncidents.createdAt))
      .limit(20)

    const resolvedIncidents = await db
      .select()
      .from(statusIncidents)
      .where(isNotNull(statusIncidents.resolvedAt))
      .orderBy(desc(statusIncidents.resolvedAt))
      .limit(20)

    // Fetch updates for all incidents
    const allIncidentIds = [
      ...activeIncidents.map((i) => i.id),
      ...resolvedIncidents.map((i) => i.id),
    ]

    const allUpdates =
      allIncidentIds.length > 0
        ? await db
            .select()
            .from(statusIncidentUpdates)
            .where(inArray(statusIncidentUpdates.incidentId, allIncidentIds))
            .orderBy(desc(statusIncidentUpdates.createdAt))
        : []

    // Group updates by incident
    const updatesByIncident = allUpdates.reduce<
      Record<string, typeof allUpdates>
    >((acc, update) => {
      if (!acc[update.incidentId]) acc[update.incidentId] = []
      acc[update.incidentId]!.push(update)
      return acc
    }, {})

    return {
      active: activeIncidents.map((incident) => ({
        ...incident,
        updates: updatesByIncident[incident.id] || [],
      })),
      resolved: resolvedIncidents.map((incident) => ({
        ...incident,
        updates: updatesByIncident[incident.id] || [],
      })),
    }
  },
)

// ============================================================================
// ADMIN: Create incident
// ============================================================================

export const createIncidentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      title: z.string().min(1).max(255),
      description: z.string().min(1),
      severity: z.enum(['minor', 'major', 'critical']),
      affectedServices: z.array(z.string()).default([]),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    const [incident] = await db
      .insert(statusIncidents)
      .values({
        title: data.title,
        description: data.description,
        severity: data.severity,
        affectedServices: data.affectedServices,
      })
      .returning()

    if (!incident) throw new Error('Failed to create incident')

    // Add initial update
    await db.insert(statusIncidentUpdates).values({
      incidentId: incident.id,
      message: data.description,
      status: 'investigating',
      createdBy: admin.id,
    })

    // Send notifications to subscribers
    await notifyStatusSubscribers(incident)

    return incident
  })

// ============================================================================
// ADMIN: Update incident
// ============================================================================

export const updateIncidentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      incidentId: z.string().uuid(),
      message: z.string().min(1),
      status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    // Add update
    await db.insert(statusIncidentUpdates).values({
      incidentId: data.incidentId,
      message: data.message,
      status: data.status,
      createdBy: admin.id,
    })

    // Update incident status
    const updateData: Record<string, unknown> = {
      status: data.status,
      updatedAt: new Date(),
    }

    if (data.status === 'resolved') {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = admin.id
    }

    const [updated] = await db
      .update(statusIncidents)
      .set(updateData)
      .where(eq(statusIncidents.id, data.incidentId))
      .returning()

    // Notify subscribers about the update
    if (updated) {
      await notifyStatusSubscribers(updated, data.message)
    }

    return updated
  })

// ============================================================================
// PUBLIC: Subscribe to status notifications
// ============================================================================

export const subscribeStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      email: z.string().email(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getOptionalUser()

    // Check if already subscribed
    const existing = await db
      .select()
      .from(statusSubscriptions)
      .where(eq(statusSubscriptions.email, data.email))
      .limit(1)

    if (existing.length > 0 && existing[0] && !existing[0].unsubscribedAt) {
      return { success: true, message: 'already_subscribed' }
    }

    const unsubscribeToken = randomBytes(32).toString('hex')
    const verificationToken = user ? null : randomBytes(32).toString('hex')

    if (existing.length > 0 && existing[0]) {
      // Re-subscribe
      await db
        .update(statusSubscriptions)
        .set({
          unsubscribedAt: null,
          unsubscribeToken,
          verified: !!user,
          verificationToken,
          userId: user?.id || null,
        })
        .where(eq(statusSubscriptions.id, existing[0].id))
    } else {
      await db.insert(statusSubscriptions).values({
        email: data.email,
        userId: user?.id || null,
        unsubscribeToken,
        verified: !!user,
        verificationToken,
      })
    }

    // If not logged in, send verification email
    if (!user && verificationToken) {
      const APP_URL = process.env.APP_URL || 'https://eziox.link'
      await sendEmail({
        to: data.email,
        subject: 'Verify your Eziox status subscription',
        html: generateEmailTemplate({
          title: 'Verify Subscription',
          subtitle: 'Confirm your email to receive Eziox status notifications.',
          content: `
            <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
              You requested to receive email notifications when Eziox services experience issues or maintenance.
            </p>
          `,
          buttonText: 'Verify Subscription',
          buttonUrl: `${APP_URL}/status?verify=${verificationToken}`,
          footer:
            'If you did not request this, you can safely ignore this email.',
        }),
      })
    }

    return {
      success: true,
      message: user ? 'subscribed' : 'verification_sent',
    }
  })

// ============================================================================
// PUBLIC: Verify status subscription
// ============================================================================

export const verifyStatusSubscriptionFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const [sub] = await db
      .select()
      .from(statusSubscriptions)
      .where(eq(statusSubscriptions.verificationToken, data.token))
      .limit(1)

    if (!sub) {
      setResponseStatus(404)
      throw { message: 'Invalid or expired verification token', status: 404 }
    }

    await db
      .update(statusSubscriptions)
      .set({ verified: true, verificationToken: null })
      .where(eq(statusSubscriptions.id, sub.id))

    return { success: true }
  })

// ============================================================================
// PUBLIC: Unsubscribe from status notifications
// ============================================================================

export const unsubscribeStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const [sub] = await db
      .select()
      .from(statusSubscriptions)
      .where(eq(statusSubscriptions.unsubscribeToken, data.token))
      .limit(1)

    if (!sub) {
      setResponseStatus(404)
      throw { message: 'Invalid unsubscribe token', status: 404 }
    }

    await db
      .update(statusSubscriptions)
      .set({ unsubscribedAt: new Date() })
      .where(eq(statusSubscriptions.id, sub.id))

    return { success: true }
  })

// ============================================================================
// PUBLIC: Get current user's subscription status
// ============================================================================

export const getStatusSubscriptionFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const user = await getOptionalUser()
  if (!user) return null

  const [sub] = await db
    .select()
    .from(statusSubscriptions)
    .where(
      and(
        eq(statusSubscriptions.userId, user.id),
        isNull(statusSubscriptions.unsubscribedAt),
      ),
    )
    .limit(1)

  return sub || null
})

// ============================================================================
// HELPER: Notify all verified subscribers about an incident
// ============================================================================

async function notifyStatusSubscribers(
  incident: typeof statusIncidents.$inferSelect,
  updateMessage?: string,
) {
  const subscribers = await db
    .select()
    .from(statusSubscriptions)
    .where(
      and(
        eq(statusSubscriptions.verified, true),
        isNull(statusSubscriptions.unsubscribedAt),
      ),
    )

  if (subscribers.length === 0) return

  const APP_URL = process.env.APP_URL || 'https://eziox.link'

  const severityColors: Record<string, string> = {
    minor: '#f59e0b',
    major: '#f97316',
    critical: '#ef4444',
  }

  const severityEmoji: Record<string, string> = {
    minor: '⚠️',
    major: '🔶',
    critical: '🔴',
  }

  const statusLabels: Record<string, string> = {
    investigating: 'Investigating',
    identified: 'Identified',
    monitoring: 'Monitoring',
    resolved: '✅ Resolved',
  }

  const isResolved = incident.status === 'resolved'
  const color = isResolved ? '#22c55e' : (severityColors[incident.severity] || '#f59e0b')
  const emoji = isResolved ? '✅' : (severityEmoji[incident.severity] || '⚠️')

  const subject = isResolved
    ? `${emoji} Resolved: ${incident.title}`
    : updateMessage
      ? `${emoji} Update: ${incident.title}`
      : `${emoji} [${incident.severity.toUpperCase()}] ${incident.title}`

  for (const sub of subscribers) {
    // Check notification preferences
    if (!sub.notifyAll) {
      if (incident.severity === 'major' && !sub.notifyMajor) continue
      if (incident.severity === 'critical' && !sub.notifyCritical) continue
      if (isResolved && !sub.notifyResolved) continue
    }

    const unsubscribeUrl = `${APP_URL}/status?unsubscribe=${sub.unsubscribeToken}`

    await sendEmail({
      to: sub.email,
      subject,
      html: generateEmailTemplate({
        title: isResolved ? 'Incident Resolved' : 'Service Incident',
        subtitle: incident.title,
        content: `
          <div style="background: ${color}15; border: 1px solid ${color}40; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 600; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px;">
                ${statusLabels[incident.status] || incident.status}
              </span>
            </div>
            <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
              ${updateMessage || incident.description}
            </p>
          </div>
          ${
            incident.affectedServices && (incident.affectedServices as string[]).length > 0
              ? `
          <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">Affected Services</p>
          <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7);">
            ${(incident.affectedServices as string[]).join(', ')}
          </p>
          `
              : ''
          }
        `,
        buttonText: 'View Status Page',
        buttonUrl: `${APP_URL}/status`,
        footer: `<a href="${unsubscribeUrl}" style="color: rgba(255, 255, 255, 0.4); text-decoration: underline;">Unsubscribe from status notifications</a>`,
      }),
    })
  }

  // Mark notification as sent
  if (!updateMessage) {
    await db
      .update(statusIncidents)
      .set({ notificationSent: true })
      .where(eq(statusIncidents.id, incident.id))
  }
}
