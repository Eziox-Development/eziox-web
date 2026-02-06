/**
 * Security Monitoring Server Functions
 * API endpoints for security monitoring dashboard
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getCookie,
  setResponseStatus,
  getRequestIP,
  getRequestHeader,
} from '@tanstack/react-start/server'
import { validateSession } from '@/server/lib/auth'
import { requireAdmin } from './auth-helpers'
import {
  logSecurityEvent,
  getSecurityAuditLog,
  resolveSecurityEvent,
  getSecurityStats,
  checkRateLimitWithLogging,
  detectLoginAnomaly,
  detectBruteForce,
  type SecurityEventType,
  type SecuritySeverity,
} from '@/server/lib/security-monitoring'

// ============================================================================
// SECURITY EVENT FUNCTIONS
// ============================================================================

/**
 * Get security events for admin dashboard
 */
export const getSecurityEventsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      eventType: z.string().optional(),
      userId: z.string().uuid().optional(),
      resolved: z.boolean().optional(),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const result = await getSecurityAuditLog({
      limit: data.limit || 50,
      offset: data.offset || 0,
      severity: data.severity as SecuritySeverity | undefined,
      eventType: data.eventType as SecurityEventType | undefined,
      userId: data.userId,
      resolved: data.resolved,
    })

    return {
      events: result.events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        severity: e.severity,
        userId: e.userId,
        ipAddress: e.ipAddress,
        createdAt: e.createdAt,
        resolved: e.resolved,
        details: e.details ? JSON.parse(JSON.stringify(e.details)) : undefined,
      })),
      total: result.total,
    }
  })

/**
 * Get security statistics for dashboard
 */
export const getSecurityStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()
    return await getSecurityStats()
  }
)

/**
 * Resolve a security event
 */
export const resolveSecurityEventFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      eventId: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    const success = await resolveSecurityEvent(data.eventId, admin.id)

    if (!success) {
      setResponseStatus(500)
      throw { message: 'Failed to resolve security event', status: 500 }
    }

    // Log admin action (fire and forget)
    logSecurityEvent({
      eventType: 'system.admin_action',
      severity: 'low',
      userId: admin.id,
      ipAddress: getRequestIP() || undefined,
      userAgent: getRequestHeader('user-agent') || undefined,
      details: {
        action: 'resolve_security_event',
        targetId: data.eventId,
      },
    }).catch(() => {})

    return { success: true }
  })

/**
 * Manually log a security event (for testing or manual reporting)
 */
export const logSecurityEventManualFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      eventType: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      userId: z.uuid().optional(),
      details: z.record(z.string(), z.unknown()).optional(),
    })
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    const eventId = await logSecurityEvent({
      eventType: data.eventType as SecurityEventType,
      severity: data.severity,
      userId: data.userId,
      ipAddress: getRequestIP() || undefined,
      userAgent: getRequestHeader('user-agent') || undefined,
      details: {
        ...data.details,
        reportedBy: admin.id,
        manual: true,
      },
    })

    return { success: true, eventId }
  })

// ============================================================================
// RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Check rate limit for an endpoint (used by other server functions)
 */
export const checkRateLimitFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      endpoint: z.enum([
        'auth.login',
        'auth.signup',
        'auth.password_reset',
        'auth.otp',
        'api.general',
        'api.upload',
        'api.shortener',
        'api.profile_update',
        'public.profile_view',
        'public.link_click',
      ]),
    })
  )
  .handler(async ({ data }) => {
    const ip = getRequestIP() || 'unknown'
    const userAgent = getRequestHeader('user-agent') || undefined

    // Try to get user if authenticated
    let userId: string | undefined
    try {
      const token = getCookie('session-token')
      if (token) {
        const user = await validateSession(token)
        userId = user?.id
      }
    } catch {
      // Not authenticated, continue with IP-based rate limiting
    }

    const result = await checkRateLimitWithLogging(ip, data.endpoint, {
      userId,
      ipAddress: ip,
      userAgent,
    })

    if (!result.allowed) {
      setResponseStatus(429)
      return {
        allowed: false,
        remaining: 0,
        retryAfter: result.retryAfter,
        message: 'Rate limit exceeded. Please try again later.',
      }
    }

    return {
      allowed: true,
      remaining: result.remaining,
      resetAt: result.resetAt,
    }
  })

// ============================================================================
// ANOMALY DETECTION FUNCTIONS
// ============================================================================

/**
 * Check for login anomalies (called during login)
 */
export const checkLoginAnomalyFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => {
    const ip = getRequestIP() || 'unknown'
    const userAgent = getRequestHeader('user-agent') || 'unknown'

    const anomaly = await detectLoginAnomaly(data.userId, ip, userAgent)

    if (anomaly.isAnomaly && anomaly.confidence > 0.5) {
      // Log the anomaly
      try {
        await logSecurityEvent({
          eventType:
            anomaly.anomalyType === 'impossible_travel'
              ? 'auth.impossible_travel'
              : 'auth.suspicious_login',
          severity: anomaly.confidence > 0.8 ? 'high' : 'medium',
          userId: data.userId,
          ipAddress: ip,
          userAgent,
          details: {
            anomalyType: anomaly.anomalyType,
            confidence: anomaly.confidence,
            ...anomaly.details,
          },
        })
      } catch {
        // Ignore logging errors
      }
    }

    return {
      isAnomaly: anomaly.isAnomaly,
      anomalyType: anomaly.anomalyType,
      confidence: anomaly.confidence,
      details: anomaly.details ? JSON.parse(JSON.stringify(anomaly.details)) : undefined,
    }
  })

/**
 * Check for brute force attacks (called during failed login)
 */
export const checkBruteForceFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const ip = getRequestIP() || 'unknown'
    const userAgent = getRequestHeader('user-agent') || undefined

    const result = await detectBruteForce(ip)

    if (result.isAnomaly) {
      try {
        await logSecurityEvent({
          eventType: 'auth.brute_force_detected',
          severity: result.confidence > 0.9 ? 'critical' : 'high',
          ipAddress: ip,
          userAgent,
          details: {
            anomalyType: result.anomalyType,
            confidence: result.confidence,
            ...result.details,
          },
        })
      } catch {
        // Ignore logging errors
      }
    }

    return {
      isAnomaly: result.isAnomaly,
      anomalyType: result.anomalyType,
      confidence: result.confidence,
      details: result.details ? JSON.parse(JSON.stringify(result.details)) : undefined,
    }
  }
)

// ============================================================================
// SECURITY LOGGING HELPERS (for use in other functions)
// ============================================================================

/**
 * Log a failed login attempt
 */
export async function logFailedLogin(
  email: string,
  ip: string,
  userAgent?: string,
  userId?: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'auth.login_failed',
    severity: 'low',
    userId,
    ipAddress: ip,
    userAgent,
    details: { email },
  })
}

/**
 * Log a successful login
 */
export async function logSuccessfulLogin(
  userId: string,
  ip: string,
  userAgent?: string,
  method?: 'password' | 'otp' | 'passkey' | 'oauth'
): Promise<void> {
  await logSecurityEvent({
    eventType: 'auth.login_success',
    severity: 'low',
    userId,
    ipAddress: ip,
    userAgent,
    details: { method },
  })
}

/**
 * Log account lockout
 */
export async function logAccountLocked(
  userId: string,
  ip: string,
  reason: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'auth.account_locked',
    severity: 'medium',
    userId,
    ipAddress: ip,
    details: { reason },
  })
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  userId: string | undefined,
  ip: string,
  activity: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logSecurityEvent({
    eventType: 'account.suspicious_activity',
    severity: 'medium',
    userId,
    ipAddress: ip,
    details: { activity, ...details },
  })
}

/**
 * Log API abuse
 */
export async function logApiAbuse(
  apiKeyId: string,
  endpoint: string,
  requestCount: number
): Promise<void> {
  await logSecurityEvent({
    eventType: 'api.key_abuse',
    severity: 'high',
    details: { apiKeyId, endpoint, requestCount },
  })
}

/**
 * Log content moderation event
 */
export async function logContentModeration(
  userId: string,
  contentType: string,
  contentId: string,
  reason: string,
  severity: SecuritySeverity = 'medium'
): Promise<void> {
  await logSecurityEvent({
    eventType: 'content.abuse_reported',
    severity,
    userId,
    details: { contentType, contentId, reason },
  })
}
