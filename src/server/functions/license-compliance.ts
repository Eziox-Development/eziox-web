import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import {
  commercialLicenses,
  complianceViolations,
  licenseUsageLogs,
  licenseInquiries,
} from '../db/schema'
import { eq, desc, and, sql, gte } from 'drizzle-orm'
import { requireAdmin, requireOwner } from './auth-helpers'
import { sendEmail } from '../lib/email'
import crypto from 'crypto'

// =============================================================================
// Helper: Generate Secure License Key
// =============================================================================

function generateLicenseKey(): string {
  // Format: EZIOX-XXXX-XXXX-XXXX-XXXX (32 chars + dashes)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I, O, 0, 1 to avoid confusion
  const segments = []
  
  for (let s = 0; s < 4; s++) {
    let segment = ''
    for (let i = 0; i < 4; i++) {
      const randomIndex = crypto.randomInt(0, chars.length)
      segment += chars[randomIndex]
    }
    segments.push(segment)
  }
  
  return `EZIOX-${segments.join('-')}`
}

// =============================================================================
// Helper: Validate License Key Format
// =============================================================================

function isValidLicenseKeyFormat(key: string): boolean {
  // Must match: EZIOX-XXXX-XXXX-XXXX-XXXX
  const pattern = /^EZIOX-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/
  return pattern.test(key)
}

// =============================================================================
// OWNER: Create Commercial License
// =============================================================================

export const createCommercialLicenseFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      licenseeName: z.string().min(2).max(255),
      licenseeEmail: z.string().email(),
      licenseeCompany: z.string().max(255).optional(),
      licenseType: z.enum(['commercial', 'enterprise', 'saas', 'reseller']),
      maxDomains: z.number().min(1).max(100).default(1),
      maxUsers: z.number().min(1).optional(), // null = unlimited
      allowedDomains: z.array(z.string()).min(1),
      expiresAt: z.string().datetime().optional(), // ISO date string
      inquiryId: z.string().uuid().optional(),
      internalNotes: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const owner = await requireOwner()

    // Generate unique license key
    let licenseKey = generateLicenseKey()
    let attempts = 0
    
    // Ensure uniqueness
    while (attempts < 10) {
      const [existing] = await db
        .select({ id: commercialLicenses.id })
        .from(commercialLicenses)
        .where(eq(commercialLicenses.licenseKey, licenseKey))
        .limit(1)
      
      if (!existing) break
      licenseKey = generateLicenseKey()
      attempts++
    }

    if (attempts >= 10) {
      throw { message: 'Failed to generate unique license key', status: 500 }
    }

    // Create license
    const [license] = await db
      .insert(commercialLicenses)
      .values({
        licenseKey,
        licenseeName: data.licenseeName,
        licenseeEmail: data.licenseeEmail,
        licenseeCompany: data.licenseeCompany,
        licenseType: data.licenseType,
        maxDomains: data.maxDomains,
        maxUsers: data.maxUsers,
        allowedDomains: JSON.stringify(data.allowedDomains),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        inquiryId: data.inquiryId,
        issuedBy: owner.id,
        internalNotes: data.internalNotes,
        status: 'active',
      })
      .returning()

    if (!license) {
      throw { message: 'Failed to create license', status: 500 }
    }

    // Update inquiry status if linked
    if (data.inquiryId) {
      await db
        .update(licenseInquiries)
        .set({ status: 'closed_won', updatedAt: new Date() })
        .where(eq(licenseInquiries.id, data.inquiryId))
    }

    // Send license email to licensee
    await sendEmail({
      to: data.licenseeEmail,
      subject: 'Your Eziox Commercial License',
      html: `
        <h2>🎉 Your Commercial License is Ready!</h2>
        <p>Dear ${data.licenseeName},</p>
        <p>Thank you for licensing Eziox. Your commercial license has been issued.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">License Details</h3>
          <p><strong>License Key:</strong></p>
          <code style="background: #1f2937; color: #22c55e; padding: 10px 15px; border-radius: 4px; display: block; font-size: 16px; letter-spacing: 2px;">
            ${licenseKey}
          </code>
          <p style="margin-top: 15px;"><strong>Type:</strong> ${data.licenseType.charAt(0).toUpperCase() + data.licenseType.slice(1)}</p>
          <p><strong>Allowed Domains:</strong> ${data.allowedDomains.join(', ')}</p>
          <p><strong>Max Domains:</strong> ${data.maxDomains}</p>
          ${data.maxUsers ? `<p><strong>Max Users:</strong> ${data.maxUsers}</p>` : '<p><strong>Users:</strong> Unlimited</p>'}
          ${data.expiresAt ? `<p><strong>Expires:</strong> ${new Date(data.expiresAt).toLocaleDateString()}</p>` : '<p><strong>Validity:</strong> Perpetual</p>'}
        </div>
        
        <h3>Important Notes</h3>
        <ul>
          <li>Keep your license key secure and do not share it publicly</li>
          <li>The license is valid only for the specified domains</li>
          <li>Contact us to add additional domains or modify your license</li>
        </ul>
        
        <p>If you have any questions, please contact us at <a href="mailto:business@eziox.link">business@eziox.link</a>.</p>
        
        <p>Best regards,<br>Eziox Team</p>
      `,
    })

    return {
      success: true,
      license: {
        id: license.id,
        licenseKey,
        licenseType: license.licenseType,
        allowedDomains: data.allowedDomains,
        expiresAt: license.expiresAt,
      },
      message: `License ${licenseKey} created and sent to ${data.licenseeEmail}`,
    }
  })

// =============================================================================
// ADMIN: Get All Commercial Licenses
// =============================================================================

export const getCommercialLicensesFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      status: z.enum(['all', 'active', 'suspended', 'expired', 'revoked']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const offset = (data.page - 1) * data.limit
    const filterByStatus = data.status && data.status !== 'all'

    const licenses = filterByStatus
      ? await db
          .select()
          .from(commercialLicenses)
          .where(eq(commercialLicenses.status, data.status!))
          .orderBy(desc(commercialLicenses.createdAt))
          .limit(data.limit)
          .offset(offset)
      : await db
          .select()
          .from(commercialLicenses)
          .orderBy(desc(commercialLicenses.createdAt))
          .limit(data.limit)
          .offset(offset)

    // Parse allowedDomains JSON
    const licensesWithDomains = licenses.map((l) => ({
      ...l,
      allowedDomains: JSON.parse(l.allowedDomains) as string[],
    }))

    // Get total count
    const [countResult] = filterByStatus
      ? await db.select({ count: sql<number>`count(*)` }).from(commercialLicenses).where(eq(commercialLicenses.status, data.status!))
      : await db.select({ count: sql<number>`count(*)` }).from(commercialLicenses)

    const total = Number(countResult?.count ?? 0)

    return {
      licenses: licensesWithDomains,
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    }
  })

// =============================================================================
// OWNER: Update License Status
// =============================================================================

export const updateLicenseStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      licenseId: z.string().uuid(),
      status: z.enum(['active', 'suspended', 'revoked']),
      reason: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireOwner()

    const [license] = await db
      .select()
      .from(commercialLicenses)
      .where(eq(commercialLicenses.id, data.licenseId))
      .limit(1)

    if (!license) {
      throw { message: 'License not found', status: 404 }
    }

    await db
      .update(commercialLicenses)
      .set({
        status: data.status,
        internalNotes: data.reason
          ? `${license.internalNotes || ''}\n[${new Date().toISOString()}] Status changed to ${data.status}: ${data.reason}`
          : license.internalNotes,
        updatedAt: new Date(),
      })
      .where(eq(commercialLicenses.id, data.licenseId))

    // Notify licensee
    if (data.status === 'suspended' || data.status === 'revoked') {
      await sendEmail({
        to: license.licenseeEmail,
        subject: `Eziox License ${data.status === 'suspended' ? 'Suspended' : 'Revoked'}`,
        html: `
          <h2>⚠️ License ${data.status === 'suspended' ? 'Suspended' : 'Revoked'}</h2>
          <p>Dear ${license.licenseeName},</p>
          <p>Your Eziox commercial license has been ${data.status}.</p>
          <p><strong>License Key:</strong> ${license.licenseKey}</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
          <p>If you believe this is an error, please contact us at <a href="mailto:business@eziox.link">business@eziox.link</a>.</p>
          <p>Best regards,<br>Eziox Team</p>
        `,
      })
    }

    return { success: true, message: `License ${data.status}` }
  })

// =============================================================================
// PUBLIC: Validate License (API endpoint for external validation)
// =============================================================================

export const validateLicenseFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      licenseKey: z.string(),
      domain: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    // Validate format first
    if (!isValidLicenseKeyFormat(data.licenseKey)) {
      // Log invalid attempt
      await db.insert(licenseUsageLogs).values({
        domain: data.domain,
        isValid: false,
        validationError: 'invalid_format',
      })

      return {
        valid: false,
        error: 'invalid_license_format',
        message: 'Invalid license key format',
      }
    }

    // Find license
    const [license] = await db
      .select()
      .from(commercialLicenses)
      .where(eq(commercialLicenses.licenseKey, data.licenseKey))
      .limit(1)

    if (!license) {
      // Log invalid attempt
      await db.insert(licenseUsageLogs).values({
        domain: data.domain,
        isValid: false,
        validationError: 'license_not_found',
      })

      return {
        valid: false,
        error: 'license_not_found',
        message: 'License key not found',
      }
    }

    // Check status
    if (license.status !== 'active') {
      await db.insert(licenseUsageLogs).values({
        licenseId: license.id,
        domain: data.domain,
        isValid: false,
        validationError: `license_${license.status}`,
      })

      return {
        valid: false,
        error: `license_${license.status}`,
        message: `License is ${license.status}`,
      }
    }

    // Check expiration
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      // Auto-expire the license
      await db
        .update(commercialLicenses)
        .set({ status: 'expired', updatedAt: new Date() })
        .where(eq(commercialLicenses.id, license.id))

      await db.insert(licenseUsageLogs).values({
        licenseId: license.id,
        domain: data.domain,
        isValid: false,
        validationError: 'license_expired',
      })

      return {
        valid: false,
        error: 'license_expired',
        message: 'License has expired',
      }
    }

    // Check domain
    const allowedDomains = JSON.parse(license.allowedDomains) as string[]
    const domainMatch = allowedDomains.some(
      (allowed) =>
        data.domain === allowed ||
        data.domain.endsWith(`.${allowed}`) ||
        allowed === '*' // Wildcard for enterprise
    )

    if (!domainMatch) {
      await db.insert(licenseUsageLogs).values({
        licenseId: license.id,
        domain: data.domain,
        isValid: false,
        validationError: 'domain_not_allowed',
      })

      // Create compliance violation
      await db.insert(complianceViolations).values({
        detectedDomain: data.domain,
        violationType: 'domain_mismatch',
        severity: 'high',
        evidenceDescription: `License ${license.licenseKey} used on unauthorized domain ${data.domain}. Allowed: ${allowedDomains.join(', ')}`,
        detectionMethod: 'api_monitoring',
        licenseId: license.id,
        status: 'detected',
      })

      return {
        valid: false,
        error: 'domain_not_allowed',
        message: 'Domain not authorized for this license',
      }
    }

    // Valid! Log usage
    await db.insert(licenseUsageLogs).values({
      licenseId: license.id,
      domain: data.domain,
      isValid: true,
    })

    return {
      valid: true,
      license: {
        type: license.licenseType,
        expiresAt: license.expiresAt,
        maxUsers: license.maxUsers,
      },
    }
  })

// =============================================================================
// ADMIN: Get Compliance Violations
// =============================================================================

export const getComplianceViolationsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      status: z.enum(['all', 'detected', 'investigating', 'confirmed', 'resolved', 'false_positive', 'escalated']).optional(),
      severity: z.enum(['all', 'low', 'medium', 'high', 'critical']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const offset = (data.page - 1) * data.limit
    const conditions = []

    if (data.status && data.status !== 'all') {
      conditions.push(eq(complianceViolations.status, data.status))
    }
    if (data.severity && data.severity !== 'all') {
      conditions.push(eq(complianceViolations.severity, data.severity))
    }

    const violations = conditions.length > 0
      ? await db
          .select()
          .from(complianceViolations)
          .where(and(...conditions))
          .orderBy(desc(complianceViolations.createdAt))
          .limit(data.limit)
          .offset(offset)
      : await db
          .select()
          .from(complianceViolations)
          .orderBy(desc(complianceViolations.createdAt))
          .limit(data.limit)
          .offset(offset)

    // Get total count
    const [countResult] = conditions.length > 0
      ? await db.select({ count: sql<number>`count(*)` }).from(complianceViolations).where(and(...conditions))
      : await db.select({ count: sql<number>`count(*)` }).from(complianceViolations)

    const total = Number(countResult?.count ?? 0)

    return {
      violations,
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    }
  })

// =============================================================================
// ADMIN: Update Compliance Violation
// =============================================================================

export const updateComplianceViolationFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      violationId: z.string().uuid(),
      status: z.enum(['detected', 'investigating', 'confirmed', 'resolved', 'false_positive', 'escalated']),
      enforcementAction: z.enum(['warning_sent', 'license_suspended', 'legal_notice', 'dmca_filed', 'resolved_licensed']).optional(),
      enforcementNotes: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    const [violation] = await db
      .select()
      .from(complianceViolations)
      .where(eq(complianceViolations.id, data.violationId))
      .limit(1)

    if (!violation) {
      throw { message: 'Violation not found', status: 404 }
    }

    await db
      .update(complianceViolations)
      .set({
        status: data.status,
        enforcementAction: data.enforcementAction,
        enforcementDate: data.enforcementAction ? new Date() : undefined,
        enforcementNotes: data.enforcementNotes,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(complianceViolations.id, data.violationId))

    // If enforcement action is warning_sent, send email
    if (data.enforcementAction === 'warning_sent' && violation.contactEmail) {
      await sendEmail({
        to: violation.contactEmail,
        subject: '⚠️ Eziox License Compliance Notice',
        html: `
          <h2>License Compliance Notice</h2>
          <p>We have detected that the domain <strong>${violation.detectedDomain}</strong> is using Eziox without a valid commercial license.</p>
          <p>Eziox is licensed under the PolyForm Noncommercial License 1.0.0. Commercial use requires a separate license.</p>
          <h3>What You Need To Do</h3>
          <ul>
            <li>If this is a non-commercial project, please ensure you comply with the license terms</li>
            <li>If this is commercial use, please obtain a license at <a href="https://eziox.link/licensing">eziox.link/licensing</a></li>
          </ul>
          <p>Please respond within 14 days to avoid further action.</p>
          <p>Contact us at <a href="mailto:legal@eziox.link">legal@eziox.link</a> if you have questions.</p>
          <p>Best regards,<br>Eziox Legal Team</p>
        `,
      })

      // Update contact attempts
      await db
        .update(complianceViolations)
        .set({
          contactAttempts: (violation.contactAttempts || 0) + 1,
          lastContactAt: new Date(),
        })
        .where(eq(complianceViolations.id, data.violationId))
    }

    return { success: true, message: 'Violation updated' }
  })

// =============================================================================
// ADMIN: Report Compliance Violation (Manual)
// =============================================================================

export const reportComplianceViolationFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      detectedDomain: z.string().min(1).max(255),
      violationType: z.enum(['unlicensed_domain', 'expired_license', 'domain_mismatch', 'user_limit_exceeded', 'commercial_use', 'saas_offering']),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      evidenceUrl: z.string().url().optional(),
      evidenceDescription: z.string().max(2000),
      contactEmail: z.string().email().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const [violation] = await db
      .insert(complianceViolations)
      .values({
        detectedDomain: data.detectedDomain,
        violationType: data.violationType,
        severity: data.severity,
        evidenceUrl: data.evidenceUrl,
        evidenceDescription: data.evidenceDescription,
        detectionMethod: 'manual',
        contactEmail: data.contactEmail,
        status: 'detected',
      })
      .returning({ id: complianceViolations.id })

    if (!violation) {
      throw { message: 'Failed to create violation report', status: 500 }
    }

    return {
      success: true,
      violationId: violation.id,
      message: 'Violation reported successfully',
    }
  })

// =============================================================================
// ADMIN: Get License Usage Stats
// =============================================================================

export const getLicenseUsageStatsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      licenseId: z.string().uuid().optional(),
      days: z.number().min(1).max(90).default(30),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - data.days)

    const conditions = [gte(licenseUsageLogs.createdAt, startDate)]
    if (data.licenseId) {
      conditions.push(eq(licenseUsageLogs.licenseId, data.licenseId))
    }

    // Get usage stats
    const usageStats = await db
      .select({
        domain: licenseUsageLogs.domain,
        isValid: licenseUsageLogs.isValid,
        count: sql<number>`count(*)`,
      })
      .from(licenseUsageLogs)
      .where(and(...conditions))
      .groupBy(licenseUsageLogs.domain, licenseUsageLogs.isValid)

    // Get total counts
    const [totalValid] = await db
      .select({ count: sql<number>`count(*)` })
      .from(licenseUsageLogs)
      .where(and(...conditions, eq(licenseUsageLogs.isValid, true)))

    const [totalInvalid] = await db
      .select({ count: sql<number>`count(*)` })
      .from(licenseUsageLogs)
      .where(and(...conditions, eq(licenseUsageLogs.isValid, false)))

    // Get violation counts by type
    const violationsByType = await db
      .select({
        violationType: complianceViolations.violationType,
        count: sql<number>`count(*)`,
      })
      .from(complianceViolations)
      .where(gte(complianceViolations.createdAt, startDate))
      .groupBy(complianceViolations.violationType)

    return {
      period: { days: data.days, startDate, endDate: new Date() },
      usage: {
        validRequests: Number(totalValid?.count ?? 0),
        invalidRequests: Number(totalInvalid?.count ?? 0),
        byDomain: usageStats,
      },
      violations: {
        byType: violationsByType,
      },
    }
  })

// =============================================================================
// ADMIN: Get Compliance Dashboard Stats
// =============================================================================

export const getComplianceDashboardStatsFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    await requireAdmin()

    // Active licenses count
    const [activeLicenses] = await db
      .select({ count: sql<number>`count(*)` })
      .from(commercialLicenses)
      .where(eq(commercialLicenses.status, 'active'))

    // Pending violations count
    const [pendingViolations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(complianceViolations)
      .where(eq(complianceViolations.status, 'detected'))

    // Critical violations count
    const [criticalViolations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(complianceViolations)
      .where(and(
        eq(complianceViolations.severity, 'critical'),
        eq(complianceViolations.status, 'detected')
      ))

    // Recent violations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [recentViolations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(complianceViolations)
      .where(gte(complianceViolations.createdAt, sevenDaysAgo))

    // License inquiries pending
    const [pendingInquiries] = await db
      .select({ count: sql<number>`count(*)` })
      .from(licenseInquiries)
      .where(eq(licenseInquiries.status, 'new'))

    return {
      activeLicenses: Number(activeLicenses?.count ?? 0),
      pendingViolations: Number(pendingViolations?.count ?? 0),
      criticalViolations: Number(criticalViolations?.count ?? 0),
      recentViolations: Number(recentViolations?.count ?? 0),
      pendingInquiries: Number(pendingInquiries?.count ?? 0),
    }
  })
