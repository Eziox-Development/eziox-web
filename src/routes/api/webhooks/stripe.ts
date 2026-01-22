import { createFileRoute } from '@tanstack/react-router'
import { stripe } from '@/server/lib/stripe'
import { handleStripeWebhook } from '@/server/functions/subscriptions'

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!stripe) {
          return new Response(
            JSON.stringify({ error: 'Stripe not configured' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        const body = await request.text()
        const signature = request.headers.get('stripe-signature')

        if (!signature) {
          return new Response(JSON.stringify({ error: 'Missing signature' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (!webhookSecret) {
          console.error('STRIPE_WEBHOOK_SECRET is not set')
          return new Response(
            JSON.stringify({ error: 'Webhook secret not configured' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        let event
        try {
          event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
          console.error('Webhook signature verification failed:', err)
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        try {
          await handleStripeWebhook(
            event as unknown as {
              type: string
              data: { object: Record<string, unknown> }
            },
          )
        } catch (err) {
          console.error('Webhook handler error:', err)
          return new Response(
            JSON.stringify({ error: 'Webhook handler failed' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
