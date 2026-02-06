import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getRequestIP } from '@tanstack/react-start/server'
import { db } from '../db'
import { withdrawalRequests, users, subscriptions } from '../db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { getAuthenticatedUser, requireAdmin } from './auth-helpers'
import { stripe } from '../lib/stripe'
import {
  sendEmail,
  generateEmailTemplate,
  sendSubscriptionEmail,
} from '../lib/email'
import { logAdminAction } from '../lib/audit'

// ============================================================================
// USER FUNCTIONS
// ============================================================================

/**
 * Submit a withdrawal request (user-facing)
 */
export const submitWithdrawalRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      requestType: z.enum(['subscription_cancellation', 'refund', 'data_deletion']),
      reason: z.string().max(1000).optional(),
    })
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    // Get user's subscription info
    const [userData] = await db
      .select({
        email: users.email,
        username: users.username,
        stripeSubscriptionId: users.stripeSubscriptionId,
        tier: users.tier,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!userData) {
      throw { message: 'User not found', status: 404 }
    }

    // Get subscription details if exists
    let subscriptionRecord = null
    if (userData.stripeSubscriptionId) {
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, userData.stripeSubscriptionId))
        .limit(1)
      subscriptionRecord = sub
    }

    // Create withdrawal request
    const result = await db
      .insert(withdrawalRequests)
      .values({
        userId: user.id,
        requestType: data.requestType,
        reason: data.reason,
        subscriptionId: userData.stripeSubscriptionId || undefined,
        status: 'pending',
      })
      .returning()

    const newRequest = result[0]
    if (!newRequest) {
      throw { message: 'Failed to create request', status: 500 }
    }

    // Send confirmation email
    await sendWithdrawalConfirmationEmail(
      userData.email,
      userData.username || 'User',
      newRequest.id,
      data.requestType,
      subscriptionRecord?.tier
    )

    // Update confirmation sent timestamp
    await db
      .update(withdrawalRequests)
      .set({ confirmationSentAt: new Date() })
      .where(eq(withdrawalRequests.id, newRequest.id))

    return {
      success: true,
      requestId: newRequest.id,
      message: 'Withdrawal request submitted. You will receive a confirmation email shortly.',
    }
  })

/**
 * Get user's withdrawal requests
 */
export const getMyWithdrawalRequestsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getAuthenticatedUser()

    const requests = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, user.id))
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(20)

    return { requests }
  }
)

/**
 * Cancel a pending withdrawal request
 */
export const cancelWithdrawalRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      requestId: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    // Verify ownership and status
    const [request] = await db
      .select()
      .from(withdrawalRequests)
      .where(
        and(
          eq(withdrawalRequests.id, data.requestId),
          eq(withdrawalRequests.userId, user.id)
        )
      )
      .limit(1)

    if (!request) {
      throw { message: 'Request not found', status: 404 }
    }

    if (request.status !== 'pending') {
      throw { message: 'Only pending requests can be cancelled', status: 400 }
    }

    await db
      .update(withdrawalRequests)
      .set({
        status: 'rejected',
        processingNotes: 'Cancelled by user',
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, data.requestId))

    return { success: true }
  })

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Get all withdrawal requests (admin)
 */
export const getWithdrawalRequestsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      status: z.enum(['pending', 'processing', 'approved', 'rejected', 'completed', 'all']).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const conditions = []
    if (data.status && data.status !== 'all') {
      conditions.push(eq(withdrawalRequests.status, data.status))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [requests, [countResult]] = await Promise.all([
      db
        .select({
          request: withdrawalRequests,
          user: {
            id: users.id,
            email: users.email,
            username: users.username,
            tier: users.tier,
          },
        })
        .from(withdrawalRequests)
        .leftJoin(users, eq(withdrawalRequests.userId, users.id))
        .where(whereClause)
        .orderBy(desc(withdrawalRequests.createdAt))
        .limit(data.limit || 50)
        .offset(data.offset || 0),
      db
        .select({ count: count() })
        .from(withdrawalRequests)
        .where(whereClause),
    ])

    return {
      requests: requests.map((r) => ({
        ...r.request,
        user: r.user,
      })),
      total: countResult?.count || 0,
    }
  })

/**
 * Process a withdrawal request (admin)
 */
export const processWithdrawalRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      requestId: z.string().uuid(),
      action: z.enum(['approve', 'reject']),
      processingNotes: z.string().max(1000).optional(),
      refundType: z.enum(['full', 'partial', 'prorated', 'none']).optional(),
      refundAmountCents: z.number().min(0).optional(),
    })
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    // Get request with user info
    const [request] = await db
      .select({
        request: withdrawalRequests,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
          stripeSubscriptionId: users.stripeSubscriptionId,
          tier: users.tier,
        },
      })
      .from(withdrawalRequests)
      .leftJoin(users, eq(withdrawalRequests.userId, users.id))
      .where(eq(withdrawalRequests.id, data.requestId))
      .limit(1)

    if (!request) {
      throw { message: 'Request not found', status: 404 }
    }

    if (request.request.status !== 'pending' && request.request.status !== 'processing') {
      throw { message: 'Request has already been processed', status: 400 }
    }

    let refundAmount = 0
    let refundId: string | null = null

    // Process refund if approved and requested
    if (data.action === 'approve' && data.refundType && data.refundType !== 'none' && stripe) {
      const subscriptionId = request.request.subscriptionId || request.user?.stripeSubscriptionId

      if (subscriptionId) {
        // Get subscription record
        const [subRecord] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
          .limit(1)

        if (subRecord) {
          // Get latest invoice
          const invoices = await stripe.invoices.list({
            subscription: subscriptionId,
            limit: 1,
          })

          const latestInvoice = invoices.data[0] as { payment_intent?: string | { id: string }; amount_paid?: number } | undefined
          const paymentIntent = latestInvoice?.payment_intent

          if (paymentIntent) {
            const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent.id

            if (data.refundType === 'full') {
              const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                reason: 'requested_by_customer',
                metadata: {
                  withdrawalRequestId: data.requestId,
                  adminId: admin.id,
                  notes: data.processingNotes || '',
                },
              })
              refundAmount = refund.amount
              refundId = refund.id
            } else if (data.refundType === 'partial' && data.refundAmountCents) {
              const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: data.refundAmountCents,
                reason: 'requested_by_customer',
                metadata: {
                  withdrawalRequestId: data.requestId,
                  adminId: admin.id,
                  notes: data.processingNotes || '',
                },
              })
              refundAmount = refund.amount
              refundId = refund.id
            } else if (data.refundType === 'prorated' && subRecord.currentPeriodEnd && subRecord.currentPeriodStart) {
              // Calculate prorated amount
              const now = Date.now()
              const periodEnd = subRecord.currentPeriodEnd.getTime()
              const periodStart = subRecord.currentPeriodStart.getTime()
              const totalPeriod = periodEnd - periodStart
              const remainingPeriod = Math.max(0, periodEnd - now)
              const proratedRatio = remainingPeriod / totalPeriod
              const proratedAmount = Math.round((latestInvoice.amount_paid || 0) * proratedRatio)

              if (proratedAmount > 0) {
                const refund = await stripe.refunds.create({
                  payment_intent: paymentIntentId,
                  amount: proratedAmount,
                  reason: 'requested_by_customer',
                  metadata: {
                    withdrawalRequestId: data.requestId,
                    adminId: admin.id,
                    refundType: 'prorated',
                    notes: data.processingNotes || '',
                  },
                })
                refundAmount = refund.amount
                refundId = refund.id
              }
            }
          }

          // Cancel subscription if it's a cancellation request
          if (request.request.requestType === 'subscription_cancellation' || request.request.requestType === 'refund') {
            await stripe.subscriptions.cancel(subscriptionId)

            // Update subscription record
            await db
              .update(subscriptions)
              .set({
                status: 'canceled',
                canceledAt: new Date(),
                endedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))

            // Downgrade user
            await db
              .update(users)
              .set({
                tier: 'free',
                tierExpiresAt: null,
                stripeSubscriptionId: null,
                updatedAt: new Date(),
              })
              .where(eq(users.id, request.request.userId))
          }
        }
      }
    }

    // Update request status
    await db
      .update(withdrawalRequests)
      .set({
        status: data.action === 'approve' ? 'completed' : 'rejected',
        processedBy: admin.id,
        processedAt: new Date(),
        processingNotes: data.processingNotes,
        refundAmount: refundAmount || null,
        refundId: refundId,
        updatedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, data.requestId))

    // Send notification email
    if (request.user?.email) {
      if (data.action === 'approve' && refundAmount > 0) {
        await sendSubscriptionEmail(request.user.email, 'refunded', {
          username: request.user.username || 'User',
          tier: request.user.tier || 'subscription',
          refundAmount: `€${(refundAmount / 100).toFixed(2)}`,
          reason: 'Withdrawal request approved',
        })
      } else {
        await sendWithdrawalProcessedEmail(
          request.user.email,
          request.user.username || 'User',
          data.requestId,
          data.action,
          data.processingNotes
        )
      }
    }

    // Log admin action
    await logAdminAction({
      adminId: admin.id,
      action: 'referral.approve', // Using existing action type
      targetType: 'user',
      targetId: request.request.userId,
      details: {
        withdrawalRequestId: data.requestId,
        action: data.action,
        refundAmount,
        refundType: data.refundType,
      },
      ipAddress: getRequestIP() || undefined,
    })

    return {
      success: true,
      refundAmount,
      refundAmountFormatted: refundAmount ? `€${(refundAmount / 100).toFixed(2)}` : null,
    }
  })

/**
 * Get withdrawal statistics (admin)
 */
export const getWithdrawalStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()

    const [pendingResult, processingResult, completedResult, rejectedResult] = await Promise.all([
      db.select({ count: count() }).from(withdrawalRequests).where(eq(withdrawalRequests.status, 'pending')),
      db.select({ count: count() }).from(withdrawalRequests).where(eq(withdrawalRequests.status, 'processing')),
      db.select({ count: count() }).from(withdrawalRequests).where(eq(withdrawalRequests.status, 'completed')),
      db.select({ count: count() }).from(withdrawalRequests).where(eq(withdrawalRequests.status, 'rejected')),
    ])

    return {
      pending: pendingResult[0]?.count || 0,
      processing: processingResult[0]?.count || 0,
      completed: completedResult[0]?.count || 0,
      rejected: rejectedResult[0]?.count || 0,
    }
  }
)

// ============================================================================
// EMAIL HELPERS
// ============================================================================

async function sendWithdrawalConfirmationEmail(
  to: string,
  username: string,
  requestId: string,
  requestType: string,
  tier?: string
): Promise<void> {
  const requestTypeLabels: Record<string, string> = {
    subscription_cancellation: 'Subscription Cancellation',
    refund: 'Refund Request',
    data_deletion: 'Data Deletion Request',
  }

  const content = `
    <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #6366f1; text-align: center;">
        ✓ Your withdrawal request has been received
      </p>
    </div>
    
    <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
      We have received your <strong>${requestTypeLabels[requestType] || requestType}</strong> request and will process it within 14 days as required by EU consumer protection law.
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px;">Request ID</td>
        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; text-align: right; font-family: monospace;">${requestId.slice(0, 8)}...</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px;">Type</td>
        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; text-align: right;">${requestTypeLabels[requestType] || requestType}</td>
      </tr>
      ${tier ? `
      <tr>
        <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px;">Current Plan</td>
        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; text-align: right;">${tier}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px;">Status</td>
        <td style="padding: 8px 0; color: #f59e0b; font-size: 13px; text-align: right;">Pending Review</td>
      </tr>
    </table>
    
    <p style="margin: 16px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); line-height: 1.6;">
      You will receive another email once your request has been processed. If you have any questions, please contact us at <a href="mailto:legal@eziox.link" style="color: #8b5cf6;">legal@eziox.link</a>.
    </p>
  `

  await sendEmail({
    to,
    subject: `Withdrawal Request Received - ${requestTypeLabels[requestType] || requestType}`,
    html: generateEmailTemplate({
      title: 'Withdrawal Request Received',
      subtitle: `Hey @${username}, we've received your request`,
      content,
      buttonText: 'View Request Status',
      buttonUrl: `${process.env.VITE_APP_URL || 'https://eziox.link'}/profile?tab=settings`,
      footer: 'This is an automated confirmation. Please keep this email for your records.',
    }),
  })
}

async function sendWithdrawalProcessedEmail(
  to: string,
  username: string,
  _requestId: string,
  action: 'approve' | 'reject',
  notes?: string
): Promise<void> {
  const isApproved = action === 'approve'

  const content = `
    <div style="background: ${isApproved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 1px solid ${isApproved ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: ${isApproved ? '#22c55e' : '#ef4444'}; text-align: center;">
        ${isApproved ? '✓ Your withdrawal request has been approved' : '✗ Your withdrawal request has been declined'}
      </p>
    </div>
    
    <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
      ${isApproved 
        ? 'Your withdrawal request has been processed. Any applicable refunds will be credited to your original payment method within 5-10 business days.'
        : 'Unfortunately, we were unable to process your withdrawal request at this time.'
      }
    </p>
    
    ${notes ? `
    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; margin: 16px 0;">
      <p style="margin: 0 0 4px; font-size: 11px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase;">Notes</p>
      <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.8);">${notes}</p>
    </div>
    ` : ''}
    
    <p style="margin: 16px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); line-height: 1.6;">
      If you have any questions about this decision, please contact us at <a href="mailto:legal@eziox.link" style="color: #8b5cf6;">legal@eziox.link</a>.
    </p>
  `

  await sendEmail({
    to,
    subject: `Withdrawal Request ${isApproved ? 'Approved' : 'Declined'}`,
    html: generateEmailTemplate({
      title: `Request ${isApproved ? 'Approved' : 'Declined'}`,
      subtitle: `Hey @${username}, your withdrawal request has been reviewed`,
      content,
      buttonText: 'View Your Account',
      buttonUrl: `${process.env.VITE_APP_URL || 'https://eziox.link'}/profile?tab=settings`,
    }),
  })
}
