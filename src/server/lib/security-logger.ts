/**
 * Security Event Logger
 * Logs security-relevant events for monitoring and incident response
 */

export type SecurityEventType =
  | 'auth.login_success'
  | 'auth.login_failed'
  | 'auth.login_otp'
  | 'auth.login_passkey'
  | 'auth.logout'
  | 'auth.signup'
  | 'auth.password_reset_request'
  | 'auth.password_reset_complete'
  | 'auth.2fa_enabled'
  | 'auth.2fa_disabled'
  | 'auth.account_locked'
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
  | 'rate_limit.exceeded'
  | 'csrf.invalid_token'
  | 'csrf.invalid_origin'
  | 'upload.invalid_file'
  | 'upload.size_exceeded'
  | 'oauth.token_revoked'
  | 'admin.action'

interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  ip?: string
  userAgent?: string
  details?: Record<string, unknown>
  timestamp: Date
}

const securityEvents: SecurityEvent[] = []
const MAX_EVENTS = 10000

export function logSecurityEvent(
  type: SecurityEventType,
  options?: {
    userId?: string
    ip?: string
    userAgent?: string
    details?: Record<string, unknown>
  },
): void {
  const event: SecurityEvent = {
    type,
    userId: options?.userId,
    ip: options?.ip,
    userAgent: options?.userAgent,
    details: options?.details,
    timestamp: new Date(),
  }

  securityEvents.push(event)

  // Keep only last MAX_EVENTS
  if (securityEvents.length > MAX_EVENTS) {
    securityEvents.shift()
  }

  // Log to console in development, structured log in production
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Security] ${type}`, options?.details || '')
  } else {
    console.log(
      JSON.stringify({
        level: 'security',
        ...event,
        timestamp: event.timestamp.toISOString(),
      }),
    )
  }
}

export function getRecentSecurityEvents(limit = 100): SecurityEvent[] {
  return securityEvents.slice(-limit)
}

export function getSecurityEventsByUser(
  userId: string,
  limit = 50,
): SecurityEvent[] {
  return securityEvents.filter((e) => e.userId === userId).slice(-limit)
}

export function getSecurityEventsByType(
  type: SecurityEventType,
  limit = 100,
): SecurityEvent[] {
  return securityEvents.filter((e) => e.type === type).slice(-limit)
}
