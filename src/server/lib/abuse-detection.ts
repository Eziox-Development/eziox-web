/**
 * Abuse Detection System
 * Fair Use Policy enforcement and monitoring
 */

import { db } from '../db'
import { abuseAlerts, users, userLinks } from '../db/schema'
import { eq, sql, and, gte, desc } from 'drizzle-orm'
import { sendAbuseAlertEmail } from './email'

// =============================================================================
// Configuration: Tier-based limits (Fair Use Policy)
// =============================================================================

export const FAIR_USE_LIMITS = {
  links: {
    free: 500,
    pro: 500,
    creator: 1000,
    lifetime: 1000,
    hardCap: 2000, // Absolute maximum, requires admin approval to exceed
  },
  socials: {
    all: 30, // Max social links per user
  },
  customThemes: {
    all: 10, // Max custom themes per user
  },
  profileBackups: {
    all: 10, // Max profile backups
  },
  customFonts: {
    all: 4, // Max custom fonts
  },
} as const

export type AlertType =
  | 'link_spam'
  | 'rate_limit_exceeded'
  | 'large_data'
  | 'suspicious_activity'
  | 'rapid_creation'
  | 'limit_approaching'

export type AlertSeverity = 'info' | 'warning' | 'critical'

interface CreateAlertParams {
  userId: string
  alertType: AlertType
  severity: AlertSeverity
  title: string
  description: string
  metadata?: Record<string, unknown>
}

// =============================================================================
// Create Abuse Alert
// =============================================================================

export async function createAbuseAlert(
  params: CreateAlertParams,
): Promise<void> {
  const { userId, alertType, severity, title, description, metadata } = params

  // Check if similar alert already exists in last 24 hours (avoid duplicates)
  const existingAlert = await db
    .select({ id: abuseAlerts.id })
    .from(abuseAlerts)
    .where(
      and(
        eq(abuseAlerts.userId, userId),
        eq(abuseAlerts.alertType, alertType),
        eq(abuseAlerts.status, 'new'),
        gte(abuseAlerts.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      ),
    )
    .limit(1)

  if (existingAlert.length > 0) {
    // Update existing alert instead of creating duplicate
    await db
      .update(abuseAlerts)
      .set({
        description: description,
        metadata: metadata,
        updatedAt: new Date(),
      })
      .where(eq(abuseAlerts.id, existingAlert[0]!.id))
    return
  }

  // Create new alert
  await db.insert(abuseAlerts).values({
    userId,
    alertType,
    severity,
    title,
    description,
    metadata,
    status: 'new',
    emailSent: false,
  })

  // Send email notification for warning and critical alerts
  if (severity === 'warning' || severity === 'critical') {
    console.log(
      `[ABUSE ALERT] ${severity.toUpperCase()}: ${title} - User: ${userId}`,
    )

    try {
      // Get user info for email
      const [user] = await db
        .select({ username: users.username, email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      if (user) {
        await sendAbuseAlertEmail({
          alertType,
          severity,
          title,
          description,
          username: user.username,
          userEmail: user.email,
          metadata,
        })

        // Mark email as sent
        await db
          .update(abuseAlerts)
          .set({ emailSent: true, updatedAt: new Date() })
          .where(
            and(
              eq(abuseAlerts.userId, userId),
              eq(abuseAlerts.alertType, alertType),
              eq(abuseAlerts.status, 'new'),
            ),
          )
      }
    } catch (error) {
      console.error('Failed to send abuse alert email:', error)
    }
  }
}

// =============================================================================
// Check Link Limit (Fair Use)
// =============================================================================

export async function checkLinkLimit(
  userId: string,
  tier: string,
): Promise<{
  allowed: boolean
  current: number
  limit: number
  message?: string
}> {
  const [linkCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userLinks)
    .where(eq(userLinks.userId, userId))

  const current = linkCount?.count ?? 0
  const tierKey = tier as keyof typeof FAIR_USE_LIMITS.links
  const limit = FAIR_USE_LIMITS.links[tierKey] || FAIR_USE_LIMITS.links.free
  const hardCap = FAIR_USE_LIMITS.links.hardCap

  // Hard cap reached - block completely
  if (current >= hardCap) {
    await createAbuseAlert({
      userId,
      alertType: 'link_spam',
      severity: 'critical',
      title: 'Hard cap reached - Link creation blocked',
      description: `User has reached the absolute maximum of ${hardCap} links. This requires admin review.`,
      metadata: { currentLinks: current, hardCap },
    })

    return {
      allowed: false,
      current,
      limit: hardCap,
      message: `Maximum link limit reached (${hardCap}). Please contact support if you need more links.`,
    }
  }

  // Soft limit reached - warn but allow
  if (current >= limit) {
    await createAbuseAlert({
      userId,
      alertType: 'limit_approaching',
      severity: 'warning',
      title: 'Fair Use limit exceeded',
      description: `User has exceeded the Fair Use limit of ${limit} links (current: ${current}).`,
      metadata: { currentLinks: current, softLimit: limit, tier },
    })

    // Still allow up to hard cap
    return { allowed: true, current, limit: hardCap }
  }

  // Approaching limit (80%) - info alert
  if (current >= limit * 0.8) {
    await createAbuseAlert({
      userId,
      alertType: 'limit_approaching',
      severity: 'info',
      title: 'Approaching Fair Use limit',
      description: `User is approaching the Fair Use limit (${current}/${limit} links).`,
      metadata: { currentLinks: current, softLimit: limit, tier },
    })
  }

  return { allowed: true, current, limit }
}

// =============================================================================
// Detect Rapid Creation (Spam Detection)
// =============================================================================

export async function detectRapidCreation(
  userId: string,
  resourceType: 'link' | 'theme' | 'backup',
  windowMinutes: number = 5,
  threshold: number = 20,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

  let count = 0

  if (resourceType === 'link') {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userLinks)
      .where(
        and(
          eq(userLinks.userId, userId),
          gte(userLinks.createdAt, windowStart),
        ),
      )
    count = result?.count ?? 0
  }

  if (count >= threshold) {
    await createAbuseAlert({
      userId,
      alertType: 'rapid_creation',
      severity: 'warning',
      title: `Rapid ${resourceType} creation detected`,
      description: `User created ${count} ${resourceType}s in ${windowMinutes} minutes (threshold: ${threshold}).`,
      metadata: { count, windowMinutes, threshold, resourceType },
    })
    return true
  }

  return false
}

// =============================================================================
// Get Abuse Alerts (for Admin Panel)
// =============================================================================

export async function getAbuseAlerts(options: {
  status?: string
  severity?: string
  limit?: number
  offset?: number
}) {
  const { status, severity, limit = 50, offset = 0 } = options

  const conditions = []
  if (status) conditions.push(eq(abuseAlerts.status, status))
  if (severity) conditions.push(eq(abuseAlerts.severity, severity))

  const alerts = await db
    .select({
      id: abuseAlerts.id,
      userId: abuseAlerts.userId,
      alertType: abuseAlerts.alertType,
      severity: abuseAlerts.severity,
      title: abuseAlerts.title,
      description: abuseAlerts.description,
      metadata: sql<Record<string, unknown>>`${abuseAlerts.metadata}`,
      status: abuseAlerts.status,
      reviewedBy: abuseAlerts.reviewedBy,
      reviewedAt: abuseAlerts.reviewedAt,
      reviewNotes: abuseAlerts.reviewNotes,
      emailSent: abuseAlerts.emailSent,
      createdAt: abuseAlerts.createdAt,
      username: users.username,
      userEmail: users.email,
    })
    .from(abuseAlerts)
    .leftJoin(users, eq(abuseAlerts.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(abuseAlerts.createdAt))
    .limit(limit)
    .offset(offset)

  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(abuseAlerts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  return {
    alerts,
    total: countResult?.count ?? 0,
    hasMore: offset + alerts.length < (countResult?.count ?? 0),
  }
}

// =============================================================================
// Get Abuse Stats (for Dashboard)
// =============================================================================

export async function getAbuseStats() {
  const [newAlerts] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(abuseAlerts)
    .where(eq(abuseAlerts.status, 'new'))

  const [criticalAlerts] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(abuseAlerts)
    .where(
      and(eq(abuseAlerts.status, 'new'), eq(abuseAlerts.severity, 'critical')),
    )

  const [warningAlerts] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(abuseAlerts)
    .where(
      and(eq(abuseAlerts.status, 'new'), eq(abuseAlerts.severity, 'warning')),
    )

  const [last24h] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(abuseAlerts)
    .where(
      gte(abuseAlerts.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
    )

  return {
    newAlerts: newAlerts?.count ?? 0,
    criticalAlerts: criticalAlerts?.count ?? 0,
    warningAlerts: warningAlerts?.count ?? 0,
    last24h: last24h?.count ?? 0,
  }
}

// =============================================================================
// Update Alert Status (Admin Action)
// =============================================================================

export async function updateAlertStatus(
  alertId: string,
  status: 'reviewed' | 'resolved' | 'false_positive',
  reviewerId: string,
  notes?: string,
) {
  await db
    .update(abuseAlerts)
    .set({
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNotes: notes,
      updatedAt: new Date(),
    })
    .where(eq(abuseAlerts.id, alertId))
}
