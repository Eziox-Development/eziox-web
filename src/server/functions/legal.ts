/**
 * Legal Server Functions
 * DMCA/Takedown requests and Commercial Licensing inquiries
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { takedownRequests, licenseInquiries, users, userLinks } from '../db/schema'
import { eq, desc, and, like, sql } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import { sendEmail, generateEmailTemplate } from '../lib/email'

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
// PUBLIC: Submit Takedown Request
// =============================================================================

const takedownRequestSchema = z.object({
  // Requester info
  requesterName: z.string().min(2).max(255),
  requesterEmail: z.string().email(),
  requesterCompany: z.string().max(255).optional(),
  requesterAddress: z.string().max(1000).optional(),
  requesterPhone: z.string().max(50).optional(),
  // Content info
  contentType: z.enum(['profile', 'link', 'image', 'bio', 'username', 'other']),
  contentUrl: z.string().url(),
  reportedUsername: z.string().max(100).optional(),
  // Claim details
  claimType: z.enum(['copyright', 'trademark', 'defamation', 'privacy', 'other']),
  originalWorkUrl: z.string().url().optional(),
  description: z.string().min(50).max(5000),
  goodFaithStatement: z.boolean(),
  accuracyStatement: z.boolean(),
})

export const submitTakedownRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(takedownRequestSchema)
  .handler(async ({ data }) => {
    // Validate legal statements
    if (!data.goodFaithStatement || !data.accuracyStatement) {
      throw { message: 'You must confirm both legal statements', status: 400 }
    }

    // Try to find the reported user
    let reportedUserId: string | null = null
    if (data.reportedUsername) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, data.reportedUsername))
        .limit(1)
      reportedUserId = user?.id || null
    }

    // Create takedown request
    const [request] = await db
      .insert(takedownRequests)
      .values({
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        requesterCompany: data.requesterCompany,
        requesterAddress: data.requesterAddress,
        requesterPhone: data.requesterPhone,
        contentType: data.contentType,
        contentUrl: data.contentUrl,
        reportedUserId,
        reportedUsername: data.reportedUsername,
        claimType: data.claimType,
        originalWorkUrl: data.originalWorkUrl,
        description: data.description,
        goodFaithStatement: data.goodFaithStatement,
        accuracyStatement: data.accuracyStatement,
        status: 'pending',
        priority: data.claimType === 'copyright' ? 'high' : 'normal',
      })
      .returning({ id: takedownRequests.id })

    if (!request) {
      throw { message: 'Failed to create takedown request', status: 500 }
    }

    // Send confirmation email to requester
    await sendEmail({
      to: data.requesterEmail,
      subject: `Takedown Request Received - #${request.id.slice(0, 8)}`,
      html: generateEmailTemplate({
        title: 'Takedown Request Received',
        subtitle: `Dear ${data.requesterName}, we have received your request.`,
        content: `
          <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #8b5cf6; text-align: center;">
              📋 Request ID: <strong>#${request.id.slice(0, 8)}</strong>
            </p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Claim Type</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${data.claimType.charAt(0).toUpperCase() + data.claimType.slice(1)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Content URL</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff; word-break: break-all;">${data.contentUrl}</p>
              </td>
            </tr>
          </table>
          <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
            Our team will review your request within <strong>48-72 hours</strong>. You will receive an email notification once a decision has been made.
          </p>
        `,
        footer: 'If you have any questions, please contact us at <a href="mailto:legal@eziox.link" style="color: #8b5cf6;">legal@eziox.link</a> and reference your request ID.',
      }),
    })

    // Send notification to admin
    await sendEmail({
      to: 'legal@eziox.link',
      subject: `[TAKEDOWN] New ${data.claimType} request - ${data.reportedUsername || 'Unknown User'}`,
      html: generateEmailTemplate({
        title: '🚨 New Takedown Request',
        subtitle: `${data.claimType.toUpperCase()} claim from ${data.requesterName}`,
        content: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Claim Type</p>
                <p style="margin: 0; font-size: 14px; color: #ef4444; font-weight: 600;">${data.claimType.toUpperCase()}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Content URL</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff; word-break: break-all;">${data.contentUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Reported User</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${data.reportedUsername || 'Not specified'}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Requester</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${data.requesterName}</p>
                <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.6);">${data.requesterEmail}</p>
                ${data.requesterCompany ? `<p style="margin: 4px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.6);">${data.requesterCompany}</p>` : ''}
              </td>
            </tr>
          </table>
          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Description</p>
            <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); line-height: 1.6; white-space: pre-wrap;">${data.description}</p>
          </div>
        `,
        buttonText: 'Review in Admin Panel',
        buttonUrl: 'https://www.eziox.link/admin?tab=compliance',
      }),
    })

    return {
      success: true,
      requestId: request.id,
      message: 'Your takedown request has been submitted. You will receive a confirmation email shortly.',
    }
  })

// =============================================================================
// PUBLIC: Submit Commercial License Inquiry
// =============================================================================

const licenseInquirySchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  company: z.string().max(255).optional(),
  website: z.string().url().optional(),
  phone: z.string().max(50).optional(),
  licenseType: z.enum(['commercial', 'enterprise', 'saas', 'reseller', 'other']),
  useCase: z.string().min(50).max(5000),
  expectedUsers: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  budget: z.enum(['under_1k', '1k_5k', '5k_10k', '10k_plus', 'enterprise']).optional(),
  timeline: z.enum(['immediate', '1_month', '3_months', '6_months', 'exploring']).optional(),
  additionalNotes: z.string().max(2000).optional(),
})

export const submitLicenseInquiryFn = createServerFn({ method: 'POST' })
  .inputValidator(licenseInquirySchema)
  .handler(async ({ data }) => {
    // Create license inquiry
    const [inquiry] = await db
      .insert(licenseInquiries)
      .values({
        name: data.name,
        email: data.email,
        company: data.company,
        website: data.website,
        phone: data.phone,
        licenseType: data.licenseType,
        useCase: data.useCase,
        expectedUsers: data.expectedUsers,
        budget: data.budget,
        timeline: data.timeline,
        additionalNotes: data.additionalNotes,
        status: 'new',
      })
      .returning({ id: licenseInquiries.id })

    if (!inquiry) {
      throw { message: 'Failed to create license inquiry', status: 500 }
    }

    // Send confirmation email
    await sendEmail({
      to: data.email,
      subject: 'Commercial License Inquiry Received - Eziox',
      html: generateEmailTemplate({
        title: 'Thank You for Your Interest! 🎉',
        subtitle: `Dear ${data.name}, we have received your inquiry.`,
        content: `
          <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #22c55e; text-align: center;">
              ✓ Reference ID: <strong>#${inquiry.id.slice(0, 8)}</strong>
            </p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">License Type</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${data.licenseType.charAt(0).toUpperCase() + data.licenseType.slice(1)}</p>
              </td>
            </tr>
            ${data.company ? `
            <tr>
              <td style="padding: 16px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Company</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${data.company}</p>
              </td>
            </tr>
            ` : ''}
          </table>
          <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
            Our business team will review your inquiry and get back to you within <strong>1-2 business days</strong>.
          </p>
        `,
        footer: 'In the meantime, feel free to reply to this email if you have any additional questions.',
      }),
    })

    // Send notification to business team
    await sendEmail({
      to: 'business@eziox.link',
      subject: `[LICENSE] New ${data.licenseType} inquiry - ${data.company || data.name}`,
      html: generateEmailTemplate({
        title: '💼 New License Inquiry',
        subtitle: `${data.licenseType.toUpperCase()} license from ${data.company || data.name}`,
        content: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Contact</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${data.name}</p>
                <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.6);">${data.email}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Company</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${data.company || 'N/A'}</p>
                ${data.website ? `<p style="margin: 4px 0 0; font-size: 13px; color: #8b5cf6;">${data.website}</p>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">License Type</p>
                <p style="margin: 0; font-size: 14px; color: #22c55e; font-weight: 600;">${data.licenseType.toUpperCase()}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 33%;">
                      <p style="margin: 0 0 4px; font-size: 11px; color: rgba(255, 255, 255, 0.5);">Users</p>
                      <p style="margin: 0; font-size: 13px; color: #ffffff;">${data.expectedUsers || 'N/A'}</p>
                    </td>
                    <td style="width: 33%;">
                      <p style="margin: 0 0 4px; font-size: 11px; color: rgba(255, 255, 255, 0.5);">Budget</p>
                      <p style="margin: 0; font-size: 13px; color: #ffffff;">${data.budget || 'N/A'}</p>
                    </td>
                    <td style="width: 33%;">
                      <p style="margin: 0 0 4px; font-size: 11px; color: rgba(255, 255, 255, 0.5);">Timeline</p>
                      <p style="margin: 0; font-size: 13px; color: #ffffff;">${data.timeline || 'N/A'}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Use Case</p>
            <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); line-height: 1.6; white-space: pre-wrap;">${data.useCase}</p>
          </div>
          ${data.additionalNotes ? `
          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 16px;">
            <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Additional Notes</p>
            <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); line-height: 1.6; white-space: pre-wrap;">${data.additionalNotes}</p>
          </div>
          ` : ''}
        `,
        buttonText: 'View in Admin Panel',
        buttonUrl: 'https://www.eziox.link/admin?tab=compliance',
      }),
    })

    return {
      success: true,
      inquiryId: inquiry.id,
      message: 'Your inquiry has been submitted. Our team will contact you within 1-2 business days.',
    }
  })

// =============================================================================
// ADMIN: Get Takedown Requests
// =============================================================================

export const adminGetTakedownRequestsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      status: z.enum(['all', 'pending', 'reviewing', 'approved', 'rejected', 'counter_notice']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const offset = (data.page - 1) * data.limit
    const filterByStatus = data.status && data.status !== 'all'

    const requests = filterByStatus
      ? await db
          .select()
          .from(takedownRequests)
          .where(eq(takedownRequests.status, data.status!))
          .orderBy(desc(takedownRequests.createdAt))
          .limit(data.limit)
          .offset(offset)
      : await db
          .select()
          .from(takedownRequests)
          .orderBy(desc(takedownRequests.createdAt))
          .limit(data.limit)
          .offset(offset)

    // Get total count
    const [countResult] = filterByStatus
      ? await db.select({ count: sql<number>`count(*)` }).from(takedownRequests).where(eq(takedownRequests.status, data.status!))
      : await db.select({ count: sql<number>`count(*)` }).from(takedownRequests)
    
    const total = Number(countResult?.count ?? 0)

    return {
      requests,
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    }
  })

// =============================================================================
// ADMIN: Update Takedown Request Status
// =============================================================================

export const adminUpdateTakedownRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      requestId: z.string().uuid(),
      status: z.enum(['pending', 'reviewing', 'approved', 'rejected', 'counter_notice']),
      actionTaken: z.enum(['content_removed', 'user_warned', 'user_banned', 'no_action', 'counter_notice_sent']).optional(),
      reviewNotes: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    // Get the request
    const [request] = await db
      .select()
      .from(takedownRequests)
      .where(eq(takedownRequests.id, data.requestId))
      .limit(1)

    if (!request) {
      throw { message: 'Request not found', status: 404 }
    }

    // Update request
    await db
      .update(takedownRequests)
      .set({
        status: data.status,
        actionTaken: data.actionTaken,
        reviewNotes: data.reviewNotes,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(takedownRequests.id, data.requestId))

    // If approved and action is content_removed, actually remove the content
    if (data.status === 'approved' && data.actionTaken === 'content_removed' && request.reportedUserId) {
      // Remove links matching the URL
      if (request.contentType === 'link') {
        await db
          .delete(userLinks)
          .where(
            and(
              eq(userLinks.userId, request.reportedUserId),
              like(userLinks.url, `%${new URL(request.contentUrl).pathname}%`)
            )
          )
      }
    }

    // Send notification to requester
    const statusMessages: Record<string, string> = {
      approved: 'Your takedown request has been approved and the content has been removed.',
      rejected: 'After careful review, we have determined that the reported content does not violate our policies.',
      counter_notice: 'The content owner has submitted a counter-notice. We will provide further updates.',
    }

    if (statusMessages[data.status]) {
      const statusColors: Record<string, string> = {
        approved: '#22c55e',
        rejected: '#ef4444',
        counter_notice: '#f59e0b',
      }
      const statusIcons: Record<string, string> = {
        approved: '✓',
        rejected: '✗',
        counter_notice: '⚠️',
      }

      await sendEmail({
        to: request.requesterEmail,
        subject: `Takedown Request Update - #${request.id.slice(0, 8)}`,
        html: generateEmailTemplate({
          title: 'Takedown Request Update',
          subtitle: `Dear ${request.requesterName}, your request has been reviewed.`,
          content: `
            <div style="background: ${statusColors[data.status]}15; border: 1px solid ${statusColors[data.status]}50; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: ${statusColors[data.status]}; text-align: center;">
                ${statusIcons[data.status]} Status: <strong>${data.status.charAt(0).toUpperCase() + data.status.slice(1).replace('_', ' ')}</strong>
              </p>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
              <tr>
                <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Request ID</p>
                  <p style="margin: 0; font-size: 14px; color: #ffffff;">#${request.id.slice(0, 8)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px;">
                  <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Decision</p>
                  <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); line-height: 1.6;">${statusMessages[data.status]}</p>
                </td>
              </tr>
            </table>
            ${data.reviewNotes ? `
            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 16px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Additional Notes</p>
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); line-height: 1.6;">${data.reviewNotes}</p>
            </div>
            ` : ''}
          `,
          footer: 'If you have any questions, please contact us at <a href="mailto:legal@eziox.link" style="color: #8b5cf6;">legal@eziox.link</a>.',
        }),
      })
    }

    return { success: true, message: 'Request updated successfully' }
  })

// =============================================================================
// ADMIN: Get License Inquiries
// =============================================================================

export const adminGetLicenseInquiriesFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      status: z.enum(['all', 'new', 'contacted', 'negotiating', 'closed_won', 'closed_lost']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const offset = (data.page - 1) * data.limit
    const filterByStatus = data.status && data.status !== 'all'

    const inquiries = filterByStatus
      ? await db
          .select()
          .from(licenseInquiries)
          .where(eq(licenseInquiries.status, data.status!))
          .orderBy(desc(licenseInquiries.createdAt))
          .limit(data.limit)
          .offset(offset)
      : await db
          .select()
          .from(licenseInquiries)
          .orderBy(desc(licenseInquiries.createdAt))
          .limit(data.limit)
          .offset(offset)

    // Get total count
    const [countResult] = filterByStatus
      ? await db.select({ count: sql<number>`count(*)` }).from(licenseInquiries).where(eq(licenseInquiries.status, data.status!))
      : await db.select({ count: sql<number>`count(*)` }).from(licenseInquiries)
    
    const total = Number(countResult?.count ?? 0)

    return {
      inquiries,
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    }
  })

// =============================================================================
// ADMIN: Update License Inquiry Status
// =============================================================================

export const adminUpdateLicenseInquiryFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      inquiryId: z.string().uuid(),
      status: z.enum(['new', 'contacted', 'negotiating', 'closed_won', 'closed_lost']),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    await db
      .update(licenseInquiries)
      .set({
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(licenseInquiries.id, data.inquiryId))

    return { success: true, message: 'Inquiry status updated' }
  })
