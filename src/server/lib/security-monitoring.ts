/**
 * Security Monitoring System
 * Comprehensive security monitoring with automatic admin notifications,
 * rate limiting, audit trails, and anomaly detection
 */

import { db } from '../db'
import { securityEvents, users } from '../db/schema'
import { eq, desc, and, gte, sql, count } from 'drizzle-orm'
import { sendEmail, generateEmailTemplate } from './email'

// ============================================================================
// TYPES
// ============================================================================

export type SecurityEventType =
  // Authentication Events
  | 'auth.login_failed'
  | 'auth.login_success'
  | 'auth.login_otp'
  | 'auth.login_passkey'
  | 'auth.logout'
  | 'auth.signup'
  | 'auth.brute_force_detected'
  | 'auth.account_locked'
  | 'auth.password_reset_request'
  | 'auth.password_reset_complete'
  | 'auth.password_reset_abuse'
  | 'auth.suspicious_login'
  | 'auth.new_device_login'
  | 'auth.impossible_travel'
  | 'auth.2fa_enabled'
  | 'auth.2fa_disabled'
  | 'auth.account_deleted'
  | 'auth.recovery_codes_regenerated'
  | 'auth.recovery_code_used'
  | 'auth.email_verified'
  | 'auth.email_verification_sent'
  | 'auth.email_change_requested'
  | 'auth.email_changed'
  | 'auth.otp_requested'
  | 'auth.passkey_registered'
  | 'auth.passkey_removed'
  // Rate Limiting Events
  | 'rate_limit.exceeded'
  | 'rate_limit.api_abuse'
  | 'rate_limit.ddos_suspected'
  // Account Events
  | 'account.banned'
  | 'account.unbanned'
  | 'account.ban_appeal_submitted'
  | 'account.ban_appeal_reviewed'
  | 'account.multi_account_detected'
  | 'account.ban_evasion'
  | 'account.suspicious_activity'
  | 'account.mass_creation'
  // Content Events
  | 'content.spam_detected'
  | 'content.malware_link'
  | 'content.phishing_detected'
  | 'content.abuse_reported'
  // API Events
  | 'api.invalid_key'
  | 'api.key_abuse'
  | 'api.unauthorized_access'
  // Upload Events
  | 'upload.invalid_file'
  | 'upload.size_exceeded'
  // OAuth Events
  | 'oauth.token_revoked'
  // CSRF Events
  | 'csrf.invalid_token'
  | 'csrf.invalid_origin'
  // System Events
  | 'system.config_change'
  | 'system.admin_action'
  | 'system.database_anomaly'

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'

export interface SecurityEventDetails {
  message?: string
  endpoint?: string
  method?: string
  requestCount?: number
  threshold?: number
  previousIp?: string
  currentIp?: string
  timeDifference?: number
  distance?: number
  fingerprint?: string
  linkedAccounts?: string[]
  contentType?: string
  contentId?: string
  url?: string
  apiKeyId?: string
  adminId?: string
  action?: string
  targetId?: string
  [key: string]: unknown
}

interface CreateSecurityEventParams {
  eventType: SecurityEventType
  severity: SecuritySeverity
  userId?: string
  ipAddress?: string
  userAgent?: string
  details?: SecurityEventDetails
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const ADMIN_NOTIFICATION_THRESHOLDS: Record<SecuritySeverity, boolean> = {
  low: false,
  medium: false,
  high: true,
  critical: true,
}

// Rate limit configurations for different endpoints
export const API_RATE_LIMITS = {
  // Auth endpoints
  'auth.login': { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  'auth.signup': { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  'auth.password_reset': { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  'auth.otp': { maxRequests: 5, windowMs: 5 * 60 * 1000 },
  // API endpoints
  'api.general': { maxRequests: 100, windowMs: 60 * 1000 },
  'api.upload': { maxRequests: 10, windowMs: 60 * 1000 },
  'api.shortener': { maxRequests: 20, windowMs: 60 * 1000 },
  'api.profile_update': { maxRequests: 30, windowMs: 60 * 1000 },
  // Public endpoints
  'public.profile_view': { maxRequests: 1000, windowMs: 60 * 1000 },
  'public.link_click': { maxRequests: 500, windowMs: 60 * 1000 },
} as const

// In-memory rate limit store (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Log a security event to the database
 */
export async function logSecurityEvent(
  params: CreateSecurityEventParams
): Promise<string> {
  try {
    const result = await db
      .insert(securityEvents)
      .values({
        eventType: params.eventType,
        severity: params.severity,
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        details: params.details,
      })
      .returning({ id: securityEvents.id })

    const eventId = result[0]?.id || 'unknown'

    // Check if admin notification is needed
    if (ADMIN_NOTIFICATION_THRESHOLDS[params.severity]) {
      await notifyAdmins(params)
    }

    // Log to console for monitoring
    console.log(
      JSON.stringify({
        level: 'security',
        eventType: params.eventType,
        severity: params.severity,
        userId: params.userId,
        ip: params.ipAddress,
        timestamp: new Date().toISOString(),
        details: params.details,
      })
    )

    return eventId
  } catch (error) {
    console.error('[Security] Failed to log security event:', error)
    throw error
  }
}

/**
 * Legacy-compatible wrapper for logSecurityEvent
 * Matches the signature from security-logger.ts for easy migration
 */
export function logSecurityEventLegacy(
  type: SecurityEventType,
  options?: {
    userId?: string
    ip?: string
    userAgent?: string
    details?: Record<string, unknown>
  }
): void {
  // Fire and forget - don't await, just log
  logSecurityEvent({
    eventType: type,
    severity: getSeverityForEventType(type),
    userId: options?.userId,
    ipAddress: options?.ip,
    userAgent: options?.userAgent,
    details: options?.details as SecurityEventDetails,
  }).catch((err) => {
    console.error('[Security] Failed to log event:', err)
  })
}

/**
 * Determine severity based on event type
 */
function getSeverityForEventType(type: SecurityEventType): SecuritySeverity {
  // Critical events
  if (type.includes('brute_force') || type.includes('ban_evasion') || type.includes('malware') || type.includes('phishing')) {
    return 'critical'
  }
  // High severity events
  if (type.includes('account_locked') || type.includes('impossible_travel') || type.includes('multi_account') || type.includes('abuse')) {
    return 'high'
  }
  // Medium severity events
  if (type.includes('failed') || type.includes('suspicious') || type.includes('rate_limit') || type.includes('invalid')) {
    return 'medium'
  }
  // Low severity (informational)
  return 'low'
}

/**
 * Send notification to admins for critical security events
 */
async function notifyAdmins(params: CreateSecurityEventParams): Promise<void> {
  try {
    // Get admin emails
    const admins = await db
      .select({ email: users.email, username: users.username })
      .from(users)
      .where(sql`${users.role} IN ('admin', 'owner')`)
      .limit(10)

    if (admins.length === 0) return

    const severityColors: Record<SecuritySeverity, string> = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626',
    }

    const severityEmoji: Record<SecuritySeverity, string> = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔴',
      critical: '🚨',
    }

    // Build content using consistent styling
    const contentHtml = `
      <div style="background: ${severityColors[params.severity]}15; border-left: 4px solid ${severityColors[params.severity]}; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: ${severityColors[params.severity]}; font-weight: 600; margin: 0; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">
          ${severityEmoji[params.severity]} ${params.severity} Severity
        </p>
        <p style="color: #ffffff; font-size: 16px; margin: 8px 0 0 0; font-weight: 500;">
          ${params.eventType.replace(/\./g, ' → ').replace(/_/g, ' ')}
        </p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="color: rgba(255,255,255,0.6); padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px;">Event Type</td>
          <td style="color: #ffffff; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-size: 14px;">${params.eventType}</td>
        </tr>
        ${params.userId ? `
        <tr>
          <td style="color: rgba(255,255,255,0.6); padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px;">User ID</td>
          <td style="color: #ffffff; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-family: monospace; font-size: 13px;">${params.userId}</td>
        </tr>
        ` : ''}
        ${params.ipAddress ? `
        <tr>
          <td style="color: rgba(255,255,255,0.6); padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px;">IP Address</td>
          <td style="color: #ffffff; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-family: monospace; font-size: 13px;">${params.ipAddress}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="color: rgba(255,255,255,0.6); padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px;">Timestamp</td>
          <td style="color: #ffffff; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-size: 14px;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
      
      ${params.details ? `
      <div style="margin-top: 16px;">
        <p style="color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px;">Details</p>
        <pre style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; color: rgba(255,255,255,0.8); font-size: 12px; overflow-x: auto; white-space: pre-wrap; margin: 0; border: 1px solid rgba(255,255,255,0.1);">${JSON.stringify(params.details, null, 2)}</pre>
      </div>
      ` : ''}
    `

    const emailContent = generateEmailTemplate({
      title: 'Security Alert',
      subtitle: 'Automatic notification from Security Monitoring',
      content: contentHtml,
      buttonText: 'View in Admin Panel',
      buttonUrl: `${process.env.APP_URL || 'https://eziox.link'}/admin?tab=security`,
      footer: 'This is an automated security notification. Please review immediately if severity is high or critical.',
    })

    // Send to all admins
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `[${params.severity.toUpperCase()}] Security Alert: ${params.eventType}`,
        html: emailContent,
      })
    }

    // Mark notification as sent
    // This would be done in the database update if we had the event ID
  } catch (error) {
    console.error('[Security] Failed to notify admins:', error)
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

/**
 * Check rate limit for a specific key and endpoint
 */
export function checkRateLimit(
  key: string,
  endpoint: keyof typeof API_RATE_LIMITS
): RateLimitResult {
  const config = API_RATE_LIMITS[endpoint]
  const now = Date.now()
  const cacheKey = `${endpoint}:${key}`
  const entry = rateLimitStore.get(cacheKey)

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs
    rateLimitStore.set(cacheKey, { count: 1, resetAt })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt }
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Check rate limit and log security event if exceeded
 */
export async function checkRateLimitWithLogging(
  key: string,
  endpoint: keyof typeof API_RATE_LIMITS,
  options?: {
    userId?: string
    ipAddress?: string
    userAgent?: string
  }
): Promise<RateLimitResult> {
  const result = checkRateLimit(key, endpoint)

  if (!result.allowed) {
    await logSecurityEvent({
      eventType: 'rate_limit.exceeded',
      severity: 'medium',
      userId: options?.userId,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      details: {
        endpoint,
        key,
        threshold: API_RATE_LIMITS[endpoint].maxRequests,
        windowMs: API_RATE_LIMITS[endpoint].windowMs,
      },
    })
  }

  return result
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

interface AnomalyDetectionResult {
  isAnomaly: boolean
  anomalyType?: string
  confidence: number
  details?: Record<string, unknown>
}

/**
 * Detect suspicious login patterns
 */
export async function detectLoginAnomaly(
  userId: string,
  currentIp: string,
  currentUserAgent: string
): Promise<AnomalyDetectionResult> {
  try {
    // Get recent login history
    const recentLogins = await db
      .select()
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.userId, userId),
          eq(securityEvents.eventType, 'auth.login_success'),
          gte(securityEvents.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .orderBy(desc(securityEvents.createdAt))
      .limit(10)

    if (recentLogins.length === 0) {
      // First login - flag as new device
      return {
        isAnomaly: true,
        anomalyType: 'new_device',
        confidence: 0.3,
        details: { reason: 'First login detected' },
      }
    }

    // Check for impossible travel
    const lastLogin = recentLogins[0]
    if (lastLogin && lastLogin.ipAddress && lastLogin.ipAddress !== currentIp) {
      const timeDiff = Date.now() - new Date(lastLogin.createdAt).getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      // If IP changed within 1 hour, flag as suspicious
      if (hoursDiff < 1) {
        return {
          isAnomaly: true,
          anomalyType: 'impossible_travel',
          confidence: 0.8,
          details: {
            previousIp: lastLogin.ipAddress,
            currentIp,
            timeDifferenceHours: hoursDiff,
          },
        }
      }
    }

    // Check for unusual user agent
    const knownUserAgents = new Set(
      recentLogins
        .filter((l) => l.userAgent)
        .map((l) => l.userAgent?.substring(0, 50))
    )
    if (knownUserAgents.size > 0 && !knownUserAgents.has(currentUserAgent?.substring(0, 50))) {
      return {
        isAnomaly: true,
        anomalyType: 'new_device',
        confidence: 0.5,
        details: { reason: 'New user agent detected' },
      }
    }

    return { isAnomaly: false, confidence: 0 }
  } catch (error) {
    console.error('[Security] Anomaly detection failed:', error)
    return { isAnomaly: false, confidence: 0 }
  }
}

/**
 * Detect brute force attacks
 */
export async function detectBruteForce(
  ipAddress: string,
  windowMinutes: number = 15
): Promise<AnomalyDetectionResult> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

    const [result] = await db
      .select({ count: count() })
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.ipAddress, ipAddress),
          eq(securityEvents.eventType, 'auth.login_failed'),
          gte(securityEvents.createdAt, windowStart)
        )
      )

    const failedAttempts = result?.count || 0

    if (failedAttempts >= 10) {
      return {
        isAnomaly: true,
        anomalyType: 'brute_force',
        confidence: 0.95,
        details: { failedAttempts, windowMinutes },
      }
    }

    if (failedAttempts >= 5) {
      return {
        isAnomaly: true,
        anomalyType: 'brute_force_suspected',
        confidence: 0.7,
        details: { failedAttempts, windowMinutes },
      }
    }

    return { isAnomaly: false, confidence: 0 }
  } catch (error) {
    console.error('[Security] Brute force detection failed:', error)
    return { isAnomaly: false, confidence: 0 }
  }
}

/**
 * Detect mass account creation (bot activity)
 */
export async function detectMassAccountCreation(
  ipAddress: string,
  windowMinutes: number = 60
): Promise<AnomalyDetectionResult> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

    const [result] = await db
      .select({ count: count() })
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.ipAddress, ipAddress),
          eq(securityEvents.eventType, 'auth.login_success'),
          gte(securityEvents.createdAt, windowStart)
        )
      )

    const signupCount = result?.count || 0

    if (signupCount >= 5) {
      return {
        isAnomaly: true,
        anomalyType: 'mass_account_creation',
        confidence: 0.9,
        details: { signupCount, windowMinutes },
      }
    }

    return { isAnomaly: false, confidence: 0 }
  } catch (error) {
    console.error('[Security] Mass account detection failed:', error)
    return { isAnomaly: false, confidence: 0 }
  }
}

/**
 * Detect API abuse patterns
 */
export async function detectApiAbuse(
  key: string,
  endpoint: string
): Promise<AnomalyDetectionResult> {
  const cacheKey = `api:${endpoint}:${key}`
  const entry = rateLimitStore.get(cacheKey)

  if (!entry) {
    return { isAnomaly: false, confidence: 0 }
  }

  // Check if consistently hitting rate limits
  const config = API_RATE_LIMITS[endpoint as keyof typeof API_RATE_LIMITS]
  if (config && entry.count >= config.maxRequests * 0.9) {
    return {
      isAnomaly: true,
      anomalyType: 'api_abuse',
      confidence: 0.8,
      details: {
        endpoint,
        requestCount: entry.count,
        threshold: config.maxRequests,
      },
    }
  }

  return { isAnomaly: false, confidence: 0 }
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

export interface AuditLogEntry {
  id: string
  eventType: string
  severity: string
  userId?: string
  ipAddress?: string
  details?: Record<string, unknown>
  createdAt: Date
  resolved: boolean
}

/**
 * Get security events for audit trail
 */
export async function getSecurityAuditLog(options: {
  limit?: number
  offset?: number
  severity?: SecuritySeverity
  eventType?: SecurityEventType
  userId?: string
  startDate?: Date
  endDate?: Date
  resolved?: boolean
}): Promise<{ events: AuditLogEntry[]; total: number }> {
  try {
    const conditions = []

    if (options.severity) {
      conditions.push(eq(securityEvents.severity, options.severity))
    }
    if (options.eventType) {
      conditions.push(eq(securityEvents.eventType, options.eventType))
    }
    if (options.userId) {
      conditions.push(eq(securityEvents.userId, options.userId))
    }
    if (options.startDate) {
      conditions.push(gte(securityEvents.createdAt, options.startDate))
    }
    if (options.resolved !== undefined) {
      conditions.push(eq(securityEvents.resolved, options.resolved))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [events, [countResult]] = await Promise.all([
      db
        .select()
        .from(securityEvents)
        .where(whereClause)
        .orderBy(desc(securityEvents.createdAt))
        .limit(options.limit || 50)
        .offset(options.offset || 0),
      db
        .select({ count: count() })
        .from(securityEvents)
        .where(whereClause),
    ])

    return {
      events: events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        severity: e.severity,
        userId: e.userId || undefined,
        ipAddress: e.ipAddress || undefined,
        details: e.details as Record<string, unknown> | undefined,
        createdAt: e.createdAt,
        resolved: e.resolved || false,
      })),
      total: countResult?.count || 0,
    }
  } catch (error) {
    console.error('[Security] Failed to get audit log:', error)
    return { events: [], total: 0 }
  }
}

/**
 * Mark a security event as resolved
 */
export async function resolveSecurityEvent(
  eventId: string,
  resolvedBy: string
): Promise<boolean> {
  try {
    await db
      .update(securityEvents)
      .set({
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      })
      .where(eq(securityEvents.id, eventId))

    return true
  } catch (error) {
    console.error('[Security] Failed to resolve event:', error)
    return false
  }
}

/**
 * Get security statistics for dashboard
 */
export async function getSecurityStats(): Promise<{
  totalEvents: number
  unresolvedEvents: number
  criticalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  recentTrend: 'increasing' | 'decreasing' | 'stable'
}> {
  try {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last48h = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    const [
      totalResult,
      unresolvedResult,
      criticalResult,
      last24hResult,
      prev24hResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(securityEvents),
      db
        .select({ count: count() })
        .from(securityEvents)
        .where(eq(securityEvents.resolved, false)),
      db
        .select({ count: count() })
        .from(securityEvents)
        .where(
          and(
            eq(securityEvents.severity, 'critical'),
            eq(securityEvents.resolved, false)
          )
        ),
      db
        .select({ count: count() })
        .from(securityEvents)
        .where(gte(securityEvents.createdAt, last24h)),
      db
        .select({ count: count() })
        .from(securityEvents)
        .where(
          and(
            gte(securityEvents.createdAt, last48h),
            sql`${securityEvents.createdAt} < ${last24h}`
          )
        ),
    ])

    // Determine trend
    const last24hCount = last24hResult[0]?.count || 0
    const prev24hCount = prev24hResult[0]?.count || 0
    let recentTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (last24hCount > prev24hCount * 1.2) {
      recentTrend = 'increasing'
    } else if (last24hCount < prev24hCount * 0.8) {
      recentTrend = 'decreasing'
    }

    return {
      totalEvents: totalResult[0]?.count || 0,
      unresolvedEvents: unresolvedResult[0]?.count || 0,
      criticalEvents: criticalResult[0]?.count || 0,
      eventsByType: {}, // Would need aggregation query
      eventsBySeverity: {}, // Would need aggregation query
      recentTrend,
    }
  } catch (error) {
    console.error('[Security] Failed to get stats:', error)
    return {
      totalEvents: 0,
      unresolvedEvents: 0,
      criticalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      recentTrend: 'stable',
    }
  }
}
