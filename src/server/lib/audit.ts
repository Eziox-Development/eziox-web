/**
 * Admin Audit Log Utility
 * Tracks all admin actions for security and compliance
 */

import { db } from '../db'
import { adminAuditLog } from '../db/schema'

export type AuditAction =
  | 'user.ban'
  | 'user.unban'
  | 'user.delete'
  | 'user.role_change'
  | 'user.tier_change'
  | 'badge.assign'
  | 'badge.remove'
  | 'content.delete'
  | 'content.moderate'
  | 'settings.update'
  | 'referral.approve'
  | 'referral.reject'

export type AuditTargetType =
  | 'user'
  | 'profile'
  | 'link'
  | 'badge'
  | 'post'
  | 'project'
  | 'template'
  | 'referral'
  | 'settings'

interface AuditLogParams {
  adminId: string
  action: AuditAction
  targetType: AuditTargetType
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function logAdminAction(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(adminAuditLog).values({
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  } catch (error) {
    console.error('[Audit] Failed to log admin action:', error)
  }
}
