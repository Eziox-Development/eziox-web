import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/server/db'
import { contactMessages } from '@/server/db/schema'
import {
  sendContactNotificationEmail,
  sendContactConfirmationEmail,
} from '@/server/lib/email'

const contactFormSchema = z.object({
  category: z.enum([
    'general',
    'support',
    'billing',
    'account',
    'feature',
    'security',
  ]),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000),
})

export const submitContactFormFn = createServerFn({ method: 'POST' })
  .inputValidator(contactFormSchema)
  .handler(async ({ data }) => {
    const { category, name, email, subject, message } = data

    try {
      // Save to database
      const result = await db
        .insert(contactMessages)
        .values({
          category,
          name,
          email,
          subject,
          message,
          status: 'new',
          createdAt: new Date(),
        })
        .returning()

      const contactMessage = result[0]
      if (!contactMessage) {
        throw new Error('Failed to save message')
      }

      // Send notification email to admin
      await sendContactNotificationEmail({
        category,
        name,
        email,
        subject,
        message,
        messageId: contactMessage.id,
      })

      // Send confirmation email to user
      await sendContactConfirmationEmail(email, name, subject, category)

      return { success: true, messageId: contactMessage.id }
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      throw new Error('Failed to send message. Please try again later.')
    }
  })
