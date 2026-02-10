/**
 * Newsletter Server Functions
 * Handles creating, sending, and managing newsletters.
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import {
  newsletters,
  emailSubscribers,
  users,
  profiles,
} from '../db/schema'
import { eq, desc, and, isNull } from 'drizzle-orm'
import { requireAdmin } from './auth-helpers'
import { sendEmail, generateEmailTemplate } from '../lib/email'

// ============================================================================
// ADMIN: Get all newsletters
// ============================================================================

export const getNewslettersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()

    const result = await db
      .select()
      .from(newsletters)
      .orderBy(desc(newsletters.createdAt))
      .limit(50)

    return { newsletters: result }
  },
)

// ============================================================================
// ADMIN: Create newsletter draft
// ============================================================================

export const createNewsletterFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      subject: z.string().min(1).max(255),
      content: z.string().min(1),
      audience: z.enum(['all', 'subscribers', 'pro', 'creator']).default('all'),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const [newsletter] = await db
      .insert(newsletters)
      .values({
        subject: data.subject,
        content: data.content,
        audience: data.audience,
        status: 'draft',
      })
      .returning()

    if (!newsletter) throw new Error('Failed to create newsletter')

    return newsletter
  })

// ============================================================================
// ADMIN: Update newsletter draft
// ============================================================================

export const updateNewsletterFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      subject: z.string().min(1).max(255).optional(),
      content: z.string().min(1).optional(),
      audience: z.enum(['all', 'subscribers', 'pro', 'creator']).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const { id, ...updateData } = data

    const [updated] = await db
      .update(newsletters)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(newsletters.id, id), eq(newsletters.status, 'draft')))
      .returning()

    if (!updated) throw new Error('Newsletter not found or already sent')

    return updated
  })

// ============================================================================
// ADMIN: Send newsletter
// ============================================================================

export const sendNewsletterFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    // Get the newsletter
    const [newsletter] = await db
      .select()
      .from(newsletters)
      .where(eq(newsletters.id, data.id))
      .limit(1)

    if (!newsletter) throw new Error('Newsletter not found')
    if (newsletter.status !== 'draft') throw new Error('Newsletter already sent')

    // Mark as sending
    await db
      .update(newsletters)
      .set({ status: 'sending', sentBy: admin.id, sentAt: new Date() })
      .where(eq(newsletters.id, data.id))

    try {
      // Get recipients based on audience
      let recipients: { email: string }[] = []

      if (newsletter.audience === 'all' || newsletter.audience === 'subscribers') {
        // Get all email subscribers who opted in for product updates
        const subscribers = await db
          .select({ email: emailSubscribers.email })
          .from(emailSubscribers)
          .where(isNull(emailSubscribers.unsubscribedAt))

        recipients.push(...subscribers)
      }

      if (newsletter.audience === 'all' || newsletter.audience === 'pro' || newsletter.audience === 'creator') {
        // Get users who opted in for product updates
        const userEmails = await db
          .select({ email: users.email })
          .from(users)
          .innerJoin(profiles, eq(profiles.userId, users.id))
          .where(eq(profiles.emailProductUpdates, true))

        recipients.push(...userEmails.filter((u): u is { email: string } => u.email !== null))
      }

      // Deduplicate
      const uniqueEmails = [...new Set(recipients.map((r) => r.email))]

      const APP_URL = process.env.APP_URL || 'https://eziox.link'

      // Send emails
      let sentCount = 0
      for (const email of uniqueEmails) {
        try {
          await sendEmail({
            to: email,
            subject: newsletter.subject,
            html: generateEmailTemplate({
              title: newsletter.subject,
              subtitle: 'Eziox Newsletter',
              content: newsletter.content
                .split('\n')
                .map((line) =>
                  line.trim()
                    ? `<p style="margin: 0 0 12px; font-size: 14px; color: rgba(255, 255, 255, 0.8); line-height: 1.7;">${line}</p>`
                    : '',
                )
                .join(''),
              buttonText: 'Visit Eziox',
              buttonUrl: APP_URL,
              footer: `You received this because you subscribed to Eziox updates. <a href="${APP_URL}/profile?tab=settings" style="color: rgba(255, 255, 255, 0.4); text-decoration: underline;">Manage preferences</a>`,
            }),
          })
          sentCount++
        } catch {
          // Continue sending to other recipients
        }
      }

      // Mark as sent
      await db
        .update(newsletters)
        .set({
          status: 'sent',
          recipientCount: sentCount,
          updatedAt: new Date(),
        })
        .where(eq(newsletters.id, data.id))

      return { success: true, recipientCount: sentCount }
    } catch (error) {
      // Mark as failed
      await db
        .update(newsletters)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(newsletters.id, data.id))

      throw error
    }
  })

// ============================================================================
// ADMIN: Delete newsletter draft
// ============================================================================

export const deleteNewsletterFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdmin()

    const [deleted] = await db
      .delete(newsletters)
      .where(and(eq(newsletters.id, data.id), eq(newsletters.status, 'draft')))
      .returning()

    if (!deleted) throw new Error('Newsletter not found or already sent')

    return { success: true }
  })

// ============================================================================
// ADMIN: Get newsletter stats
// ============================================================================

export const getNewsletterStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()

    const allNewsletters = await db
      .select()
      .from(newsletters)
      .orderBy(desc(newsletters.createdAt))

    const subscriberCount = await db
      .select({ email: emailSubscribers.email })
      .from(emailSubscribers)
      .where(isNull(emailSubscribers.unsubscribedAt))

    const optedInUsers = await db
      .select({ id: users.id })
      .from(users)
      .innerJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(profiles.emailProductUpdates, true))

    return {
      totalNewsletters: allNewsletters.length,
      drafts: allNewsletters.filter((n) => n.status === 'draft').length,
      sent: allNewsletters.filter((n) => n.status === 'sent').length,
      totalRecipients: allNewsletters
        .filter((n) => n.status === 'sent')
        .reduce((sum, n) => sum + (n.recipientCount || 0), 0),
      subscriberCount: subscriberCount.length,
      optedInUserCount: optedInUsers.length,
    }
  },
)
