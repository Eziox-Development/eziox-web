/**
 * Support Ticket System
 * Comprehensive ticket management for all support categories
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getRequestIP,
} from '@tanstack/react-start/server'
import { db } from '../db'
import {
  supportTickets,
  ticketMessages,
  users,
  withdrawalRequests,
} from '../db/schema'
import { eq, desc, and, or, count, sql, ilike } from 'drizzle-orm'
import { getAuthenticatedUser, requireAdmin, getOptionalUser } from './auth-helpers'
import { sendEmail, generateEmailTemplate } from '../lib/email'
import { logAdminAction } from '../lib/audit'

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export const TICKET_CATEGORIES = [
  'general',
  'technical',
  'billing',
  'account',
  'abuse',
] as const

export const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

export const TICKET_STATUSES = [
  'open',
  'in_progress',
  'waiting_user',
  'waiting_admin',
  'resolved',
  'closed',
] as const

export type TicketCategory = (typeof TICKET_CATEGORIES)[number]
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]
export type TicketStatus = (typeof TICKET_STATUSES)[number]

// Auto-assign priority based on category
const CATEGORY_PRIORITY_MAP: Record<TicketCategory, TicketPriority> = {
  general: 'normal',
  technical: 'normal',
  billing: 'high',
  account: 'high',
  abuse: 'high',
}

// ============================================================================
// HELPERS
// ============================================================================

function generateTicketNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')
  return `TKT-${year}-${random}`
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

/**
 * Create a new support ticket
 */
export const createTicketFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      category: z.enum(TICKET_CATEGORIES),
      subject: z.string().min(5).max(255),
      description: z.string().min(20).max(5000),
      // Guest info (required if not logged in)
      guestEmail: z.email().optional(),
      guestName: z.string().min(2).max(100).optional(),
      // Optional metadata
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
  )
  .handler(async ({ data }) => {
    const user = await getOptionalUser()

    // Validate guest info if not logged in
    if (!user && (!data.guestEmail || !data.guestName)) {
      throw { message: 'Email and name required for guest tickets', status: 400 }
    }

    // SECURITY: Rate limiting for guests (stricter)
    if (!user) {
      // Check if guest email already has too many open tickets
      const [existingGuestTicketCount] = await db
        .select({ count: count() })
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.guestEmail, data.guestEmail!),
            eq(supportTickets.status, 'open')
          )
        )

      if ((existingGuestTicketCount?.count || 0) >= 1) {
        throw { 
          message: 'You already have an open ticket. Please wait for a response or check your email for updates.', 
          status: 429 
        }
      }

      // Check for duplicate guest tickets in last 24 hours
      const [duplicateGuestTicket] = await db
        .select()
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.guestEmail, data.guestEmail!),
            eq(supportTickets.category, data.category),
            eq(supportTickets.subject, data.subject),
            sql`${supportTickets.createdAt} > NOW() - INTERVAL '24 hours'`
          )
        )
        .limit(1)

      if (duplicateGuestTicket) {
        throw { 
          message: 'You already have a similar ticket from the last 24 hours. Please wait for a response or check your email for updates.', 
          status: 429 
        }
      }
    } else {
      // Rate limiting for authenticated users (more lenient)
      const [existingTicketCount] = await db
        .select({ count: count() })
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.userId, user.id),
            eq(supportTickets.status, 'open')
          )
        )

      if ((existingTicketCount?.count || 0) >= 3) {
        throw { 
          message: 'You have reached the maximum number of open tickets. Please wait for existing tickets to be resolved.', 
          status: 429 
        }
      }

      // Check for duplicate user tickets in last 24 hours
      const [duplicateTicket] = await db
        .select()
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.userId, user.id),
            eq(supportTickets.category, data.category),
            eq(supportTickets.subject, data.subject),
            sql`${supportTickets.createdAt} > NOW() - INTERVAL '24 hours'`
          )
        )
        .limit(1)

      if (duplicateTicket) {
        throw { 
          message: 'You already have a similar ticket from the last 24 hours. Please wait for a response or update your existing ticket.', 
          status: 429 
        }
      }
    }

    const ticketNumber = generateTicketNumber()
    const priority = CATEGORY_PRIORITY_MAP[data.category]

    // Get user tier if authenticated
    let userTier: 'free' | 'pro' | 'creator' | 'lifetime' = 'free'
    if (user) {
      const [userData] = await db
        .select({ tier: users.tier })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1)
      userTier = (userData?.tier as 'free' | 'pro' | 'creator' | 'lifetime') || 'free'
    }

    // Collect metadata
    const metadata = {
      ...data.metadata,
      ipAddress: getRequestIP(),
      userAgent: undefined, // Will be set from client
      submittedAt: new Date().toISOString(),
      userTier,
    }

    // Create ticket
    const [ticket] = await db
      .insert(supportTickets)
      .values({
        ticketNumber,
        userId: user?.id || null,
        guestEmail: user ? null : data.guestEmail,
        guestName: user ? null : data.guestName,
        category: data.category,
        priority,
        subject: data.subject,
        description: data.description,
        status: 'open',
        metadata,
      })
      .returning()

    if (!ticket) {
      throw { message: 'Failed to create ticket', status: 500 }
    }

    // Create initial message
    await db.insert(ticketMessages).values({
      ticketId: ticket.id,
      senderId: user?.id || null,
      senderType: 'user',
      senderName: user?.username || data.guestName || 'Guest',
      message: data.description,
    })

    // Send confirmation email
    const email = user?.email || data.guestEmail
    const name = user?.username || data.guestName || 'User'

    if (email) {
      await sendTicketConfirmationEmail(email, name, ticketNumber, data.category, data.subject)
    }

    return {
      success: true,
      ticketId: ticket.id,
      ticketNumber,
      message: `Ticket ${ticketNumber} created successfully`,
    }
  })

/**
 * Get user's tickets
 */
export const getMyTicketsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      status: z.enum([...TICKET_STATUSES, 'all']).optional(),
      limit: z.number().min(1).max(50).optional(),
      offset: z.number().min(0).optional(),
    })
  )
  // @ts-expect-error - TanStack Server Functions type inference issue with complex return types
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const conditions = [eq(supportTickets.userId, user.id)]
    if (data.status && data.status !== 'all') {
      conditions.push(eq(supportTickets.status, data.status))
    }

    const [tickets, [countResult]] = await Promise.all([
      db
        .select()
        .from(supportTickets)
        .where(and(...conditions))
        .orderBy(desc(supportTickets.lastActivityAt))
        .limit(data.limit || 20)
        .offset(data.offset || 0),
      db
        .select({ count: count() })
        .from(supportTickets)
        .where(and(...conditions)),
    ])

    return {
      tickets,
      total: countResult?.count || 0,
    }
  })

/**
 * Get guest tickets by email (for guest ticket tracking)
 */
export const getGuestTicketsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      email: z.string().email(),
      ticketNumber: z.string().optional(), // Optional: get specific ticket
      status: z.enum([...TICKET_STATUSES, 'all']).optional(),
      limit: z.number().min(1).max(50).optional(),
      offset: z.number().min(0).optional(),
    })
  )
  // @ts-expect-error - TanStack Server Functions type inference issue with complex return types
  .handler(async ({ data }) => {
    const conditions = [eq(supportTickets.guestEmail, data.email)]
    
    if (data.ticketNumber) {
      conditions.push(eq(supportTickets.ticketNumber, data.ticketNumber))
    }
    
    if (data.status && data.status !== 'all') {
      conditions.push(eq(supportTickets.status, data.status))
    }

    const [tickets, [countResult]] = await Promise.all([
      db
        .select()
        .from(supportTickets)
        .where(and(...conditions))
        .orderBy(desc(supportTickets.lastActivityAt))
        .limit(data.limit || 20)
        .offset(data.offset || 0),
      db
        .select({ count: count() })
        .from(supportTickets)
        .where(and(...conditions)),
    ])

    return {
      tickets,
      total: countResult?.count || 0,
    }
  })

/**
 * Get a specific ticket with messages
 */
export const getTicketFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      ticketId: z.string().uuid(),
      guestEmail: z.string().email().optional(), // For guest access
    })
  )
  // @ts-expect-error - TanStack Server Functions type inference issue with complex return types
  .handler(async ({ data }) => {
    const user = await getOptionalUser()

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, data.ticketId))
      .limit(1)

    if (!ticket) {
      throw { message: 'Ticket not found', status: 404 }
    }

    // Check access
    const isAdmin = user?.role === 'admin' || user?.role === 'owner'
    const isOwner = ticket.userId === user?.id
    const isGuest = !user && ticket.guestEmail === data.guestEmail

    if (!isAdmin && !isOwner && !isGuest) {
      throw { message: 'Access denied', status: 403 }
    }

    // Get messages (exclude internal notes for non-admins)
    const messages = await db
      .select()
      .from(ticketMessages)
      .where(
        and(
          eq(ticketMessages.ticketId, data.ticketId),
          isAdmin ? undefined : eq(ticketMessages.isInternal, false)
        )
      )
      .orderBy(ticketMessages.createdAt)

    // Get assignee info if assigned
    let assignee = null
    if (ticket.assignedTo) {
      const [assigneeData] = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(eq(users.id, ticket.assignedTo))
        .limit(1)
      assignee = assigneeData
    }

    return {
      ticket,
      messages,
      assignee,
    }
  })

/**
 * Reply to a ticket
 */
export const replyToTicketFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      ticketId: z.string().uuid(),
      message: z.string().min(1).max(5000),
    })
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    // Get ticket
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, data.ticketId))
      .limit(1)

    if (!ticket) {
      throw { message: 'Ticket not found', status: 404 }
    }

    // Check access
    const isAdmin = user.role === 'admin' || user.role === 'owner'
    const isOwner = ticket.userId === user.id

    if (!isAdmin && !isOwner) {
      throw { message: 'Access denied', status: 403 }
    }

    // Prevent replies to closed tickets
    if (ticket.status === 'closed') {
      throw { message: 'Cannot reply to closed tickets', status: 400 }
    }

    // Create message
    await db.insert(ticketMessages).values({
      ticketId: data.ticketId,
      senderId: user.id,
      senderType: isAdmin ? 'admin' : 'user',
      senderName: user.username || user.email,
      message: data.message,
    })

    // Update ticket status and activity
    const newStatus = isAdmin ? 'waiting_user' : 'waiting_admin'
    await db
      .update(supportTickets)
      .set({
        status: ticket.status === 'resolved' ? 'in_progress' : newStatus,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, data.ticketId))

    return { success: true }
  })

/**
 * Close a ticket (user can close their own tickets)
 */
export const closeTicketFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      ticketId: z.string().uuid(),
      satisfactionRating: z.number().min(1).max(5).optional(),
      satisfactionFeedback: z.string().max(500).optional(),
    })
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, data.ticketId))
      .limit(1)

    if (!ticket) {
      throw { message: 'Ticket not found', status: 404 }
    }

    const isAdmin = user.role === 'admin' || user.role === 'owner'
    const isOwner = ticket.userId === user.id

    if (!isAdmin && !isOwner) {
      throw { message: 'Access denied', status: 403 }
    }

    await db
      .update(supportTickets)
      .set({
        status: 'closed',
        resolvedAt: new Date(),
        resolvedBy: user.id,
        satisfactionRating: data.satisfactionRating,
        satisfactionFeedback: data.satisfactionFeedback,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, data.ticketId))

    // Add system message
    await db.insert(ticketMessages).values({
      ticketId: data.ticketId,
      senderId: user.id,
      senderType: 'system',
      senderName: 'System',
      message: `Ticket closed by ${isAdmin ? 'support team' : 'user'}${data.satisfactionRating ? ` with rating ${data.satisfactionRating}/5` : ''}`,
    })

    return { success: true }
  })

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Get all tickets (admin)
 */
export const getTicketsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      status: z.enum([...TICKET_STATUSES, 'all']).optional(),
      category: z.enum([...TICKET_CATEGORIES, 'all']).optional(),
      priority: z.enum([...TICKET_PRIORITIES, 'all']).optional(),
      assignedTo: z.string().uuid().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    })
  )
  // @ts-expect-error - TanStack Server Functions type inference issue with complex return types
  .handler(async ({ data }) => {
    await requireAdmin()

    const conditions = []

    if (data.status && data.status !== 'all') {
      conditions.push(eq(supportTickets.status, data.status))
    }
    if (data.category && data.category !== 'all') {
      conditions.push(eq(supportTickets.category, data.category))
    }
    if (data.priority && data.priority !== 'all') {
      conditions.push(eq(supportTickets.priority, data.priority))
    }
    if (data.assignedTo) {
      conditions.push(eq(supportTickets.assignedTo, data.assignedTo))
    }
    if (data.search) {
      conditions.push(
        or(
          ilike(supportTickets.subject, `%${data.search}%`),
          ilike(supportTickets.ticketNumber, `%${data.search}%`)
        )
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [tickets, [countResult]] = await Promise.all([
      db
        .select({
          ticket: supportTickets,
          user: {
            id: users.id,
            email: users.email,
            username: users.username,
            tier: users.tier,
          },
        })
        .from(supportTickets)
        .leftJoin(users, eq(supportTickets.userId, users.id))
        .where(whereClause)
        .orderBy(
          // Priority order: urgent > high > normal > low
          sql`CASE ${supportTickets.priority} 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'low' THEN 4 
          END`,
          desc(supportTickets.lastActivityAt)
        )
        .limit(data.limit || 50)
        .offset(data.offset || 0),
      db.select({ count: count() }).from(supportTickets).where(whereClause),
    ])

    return {
      tickets: tickets.map((t) => ({
        ...t.ticket,
        user: t.user,
      })),
      total: countResult?.count || 0,
    }
  })

/**
 * Get ticket statistics (admin)
 */
export const getTicketStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()

    const [
      openResult,
      inProgressResult,
      waitingResult,
      urgentResult,
      todayResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(supportTickets).where(eq(supportTickets.status, 'open')),
      db.select({ count: count() }).from(supportTickets).where(eq(supportTickets.status, 'in_progress')),
      db.select({ count: count() }).from(supportTickets).where(eq(supportTickets.status, 'waiting_admin')),
      db.select({ count: count() }).from(supportTickets).where(eq(supportTickets.priority, 'urgent')),
      db.select({ count: count() }).from(supportTickets).where(
        sql`${supportTickets.createdAt} > NOW() - INTERVAL '24 hours'`
      ),
    ])

    return {
      open: openResult[0]?.count || 0,
      inProgress: inProgressResult[0]?.count || 0,
      waitingAdmin: waitingResult[0]?.count || 0,
      urgent: urgentResult[0]?.count || 0,
      today: todayResult[0]?.count || 0,
    }
  }
)

/**
 * Assign ticket to admin
 */
export const assignTicketFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      ticketId: z.string().uuid(),
      assigneeId: z.string().uuid().nullable(),
    })
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    await db
      .update(supportTickets)
      .set({
        assignedTo: data.assigneeId,
        status: data.assigneeId ? 'in_progress' : 'open',
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, data.ticketId))

    // Log action
    await logAdminAction({
      adminId: admin.id,
      action: 'referral.approve', // Using existing action type
      targetType: 'user',
      targetId: data.ticketId,
      details: {
        action: 'assign_ticket',
        assigneeId: data.assigneeId,
      },
      ipAddress: getRequestIP() || undefined,
    })

    return { success: true }
  })

/**
 * Update ticket status (admin)
 */
export const updateTicketStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      ticketId: z.string().uuid(),
      status: z.enum(TICKET_STATUSES),
      resolution: z.string().max(1000).optional(),
    })
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    const updateData: Record<string, unknown> = {
      status: data.status,
      updatedAt: new Date(),
    }

    if (data.status === 'resolved' || data.status === 'closed') {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = admin.id
      if (data.resolution) {
        updateData.resolution = data.resolution
      }
    }

    await db
      .update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, data.ticketId))

    // Add system message
    await db.insert(ticketMessages).values({
      ticketId: data.ticketId,
      senderId: admin.id,
      senderType: 'system',
      senderName: 'System',
      message: `Status changed to "${data.status}"${data.resolution ? `: ${data.resolution}` : ''}`,
    })

    return { success: true }
  })

/**
 * Add internal note (admin only, not visible to user)
 */
export const addInternalNoteFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      ticketId: z.string().uuid(),
      note: z.string().min(1).max(2000),
    })
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    await db.insert(ticketMessages).values({
      ticketId: data.ticketId,
      senderId: admin.id,
      senderType: 'admin',
      senderName: admin.username || admin.email,
      message: data.note,
      isInternal: true,
    })

    return { success: true }
  })

/**
 * Update ticket priority (admin)
 */
export const updateTicketPriorityFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      ticketId: z.string().uuid(),
      priority: z.enum(TICKET_PRIORITIES),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    await db
      .update(supportTickets)
      .set({
        priority: data.priority,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, data.ticketId))

    return { success: true }
  })

/**
 * Link withdrawal request to ticket
 */
export const linkWithdrawalToTicketFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      ticketId: z.string().uuid(),
      withdrawalRequestId: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    // Verify withdrawal request exists
    const [withdrawal] = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, data.withdrawalRequestId))
      .limit(1)

    if (!withdrawal) {
      throw { message: 'Withdrawal request not found', status: 404 }
    }

    await db
      .update(supportTickets)
      .set({
        relatedType: 'withdrawal_request',
        relatedId: data.withdrawalRequestId,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, data.ticketId))

    return { success: true }
  })

// ============================================================================
// EMAIL HELPERS
// ============================================================================

async function sendTicketConfirmationEmail(
  to: string,
  name: string,
  ticketNumber: string,
  category: string,
  subject: string
): Promise<void> {
  const categoryLabels: Record<string, string> = {
    general: 'General Support',
    technical: 'Technical Support',
    billing: 'Billing & Payments',
    account: 'Account & Security',
    abuse: 'Report Abuse',
  }

  const content = `
    <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #6366f1; text-align: center;">
        ✓ Your support ticket has been created
      </p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px;">Ticket Number</td>
        <td style="padding: 8px 0; color: #6366f1; font-size: 13px; text-align: right; font-family: monospace; font-weight: bold;">${ticketNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px;">Category</td>
        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; text-align: right;">${categoryLabels[category] || category}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px;">Subject</td>
        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; text-align: right;">${subject}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px;">Status</td>
        <td style="padding: 8px 0; color: #22c55e; font-size: 13px; text-align: right;">Open</td>
      </tr>
    </table>
    
    <p style="margin: 16px 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
      Our support team will review your request and respond as soon as possible. You can track your ticket status and reply directly from your account.
    </p>
    
    <p style="margin: 16px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); line-height: 1.6;">
      Please save your ticket number for reference: <strong style="color: #6366f1;">${ticketNumber}</strong>
    </p>
  `

  await sendEmail({
    to,
    subject: `[${ticketNumber}] Ticket Created: ${subject}`,
    html: generateEmailTemplate({
      title: 'Support Ticket Created',
      subtitle: `Hey @${name}, we've received your request`,
      content,
      buttonText: 'View Ticket',
      buttonUrl: `${process.env.VITE_APP_URL || 'https://eziox.link'}/support/tickets`,
      footer: 'This is an automated confirmation. You can reply to this ticket from your account.',
    }),
  })
}

