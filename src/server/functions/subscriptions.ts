import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { users, subscriptions, profiles } from '../db/schema'
import { eq } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import { stripe, TIER_CONFIG, getTierFromPriceId, type TierType } from '../lib/stripe'

async function updateUserBadgesForTier(userId: string, tier: TierType) {
  const [profile] = await db
    .select({ badges: profiles.badges })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  if (!profile) return

  const currentBadges = (profile.badges || []) as string[]
  const premiumBadges = ['pro_subscriber', 'creator_subscriber']
  
  const newBadges = currentBadges.filter(b => !premiumBadges.includes(b))
  
  if (tier === 'pro') {
    newBadges.push('pro_subscriber')
  } else if (tier === 'creator') {
    newBadges.push('creator_subscriber')
  }

  await db
    .update(profiles)
    .set({ badges: newBadges, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))
}

async function getAuthenticatedUser() {
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
  return user
}

export const getTierConfigFn = createServerFn({ method: 'GET' }).handler(async () => {
  return {
    tiers: TIER_CONFIG,
    stripeEnabled: !!stripe,
  }
})

export const getCurrentSubscriptionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()

  const [userData] = await db
    .select({
      tier: users.tier,
      tierExpiresAt: users.tierExpiresAt,
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!userData) {
    return { tier: 'free' as TierType, subscription: null }
  }

  let subscription = null
  if (userData.stripeSubscriptionId) {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, userData.stripeSubscriptionId))
      .limit(1)
    subscription = sub || null
  }

  return {
    tier: (userData.tier || 'free') as TierType,
    tierExpiresAt: userData.tierExpiresAt,
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
  }
})

export const createCheckoutSessionFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ tier: z.enum(['pro', 'creator']) }))
  .handler(async ({ data }) => {
    if (!stripe) {
      throw { message: 'Stripe is not configured', status: 500 }
    }

    const user = await getAuthenticatedUser()

    const [userData] = await db
      .select({
        email: users.email,
        stripeCustomerId: users.stripeCustomerId,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!userData) {
      throw { message: 'User not found', status: 404 }
    }

    const tierConfig = TIER_CONFIG[data.tier]
    if (!tierConfig.priceId) {
      throw { message: 'Price not configured for this tier', status: 400 }
    }

    let customerId = userData.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: { userId: user.id },
      })
      customerId = customer.id

      await db
        .update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, user.id))
    }

    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/profile?tab=subscription&success=true`,
      cancel_url: `${baseUrl}/profile?tab=subscription&canceled=true`,
      metadata: {
        userId: user.id,
        tier: data.tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: data.tier,
        },
      },
    })

    return { url: session.url }
  })

export const createBillingPortalSessionFn = createServerFn({ method: 'POST' }).handler(async () => {
  if (!stripe) {
    throw { message: 'Stripe is not configured', status: 500 }
  }

  const user = await getAuthenticatedUser()

  const [userData] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!userData?.stripeCustomerId) {
    throw { message: 'No billing account found', status: 400 }
  }

  const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173'

  const session = await stripe.billingPortal.sessions.create({
    customer: userData.stripeCustomerId,
    return_url: `${baseUrl}/profile?tab=subscription`,
  })

  return { url: session.url }
})

export const cancelSubscriptionFn = createServerFn({ method: 'POST' }).handler(async () => {
  if (!stripe) {
    throw { message: 'Stripe is not configured', status: 500 }
  }

  const user = await getAuthenticatedUser()

  const [userData] = await db
    .select({ stripeSubscriptionId: users.stripeSubscriptionId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!userData?.stripeSubscriptionId) {
    throw { message: 'No active subscription found', status: 400 }
  }

  await stripe.subscriptions.update(userData.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, userData.stripeSubscriptionId))

  return { success: true }
})

export const resumeSubscriptionFn = createServerFn({ method: 'POST' }).handler(async () => {
  if (!stripe) {
    throw { message: 'Stripe is not configured', status: 500 }
  }

  const user = await getAuthenticatedUser()

  const [userData] = await db
    .select({ stripeSubscriptionId: users.stripeSubscriptionId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!userData?.stripeSubscriptionId) {
    throw { message: 'No subscription found', status: 400 }
  }

  await stripe.subscriptions.update(userData.stripeSubscriptionId, {
    cancel_at_period_end: false,
  })

  await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: false, updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, userData.stripeSubscriptionId))

  return { success: true }
})

export async function handleStripeWebhook(event: {
  type: string
  data: { object: Record<string, unknown> }
}) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as {
        subscription: string
        customer: string
        metadata: { userId: string; tier: string }
      }

      if (session.subscription && session.metadata?.userId) {
        await handleSubscriptionCreated(
          session.subscription,
          session.customer,
          session.metadata.userId,
          session.metadata.tier as TierType
        )
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as {
        id: string
        status: string
        current_period_start: number
        current_period_end: number
        cancel_at_period_end: boolean
        canceled_at: number | null
        items: { data: Array<{ price: { id: string } }> }
        metadata: { userId: string }
      }

      await handleSubscriptionUpdated(subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as {
        id: string
        metadata: { userId: string }
      }

      await handleSubscriptionDeleted(subscription.id, subscription.metadata?.userId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as {
        subscription: string
        customer: string
      }

      if (invoice.subscription) {
        await db
          .update(subscriptions)
          .set({ status: 'past_due', updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription))
      }
      break
    }
  }
}

async function handleSubscriptionCreated(
  subscriptionId: string,
  customerId: string,
  userId: string,
  tier: TierType
) {
  if (!stripe) return

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = stripeSubscription.items.data[0]?.price.id
  const actualTier = priceId ? getTierFromPriceId(priceId) : tier

  const periodStart = (stripeSubscription as unknown as { current_period_start: number }).current_period_start
  const periodEnd = (stripeSubscription as unknown as { current_period_end: number }).current_period_end
  const trialStartTs = (stripeSubscription as unknown as { trial_start: number | null }).trial_start
  const trialEndTs = (stripeSubscription as unknown as { trial_end: number | null }).trial_end

  await db.insert(subscriptions).values({
    userId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId || '',
    stripeCustomerId: customerId,
    tier: actualTier,
    status: stripeSubscription.status,
    currentPeriodStart: new Date(periodStart * 1000),
    currentPeriodEnd: new Date(periodEnd * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    trialStart: trialStartTs ? new Date(trialStartTs * 1000) : null,
    trialEnd: trialEndTs ? new Date(trialEndTs * 1000) : null,
  })

  await db
    .update(users)
    .set({
      tier: actualTier,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      tierExpiresAt: new Date(periodEnd * 1000),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  await updateUserBadgesForTier(userId, actualTier)
}

async function handleSubscriptionUpdated(subscription: {
  id: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  canceled_at: number | null
  items: { data: Array<{ price: { id: string } }> }
  metadata: { userId: string }
}) {
  const priceId = subscription.items.data[0]?.price.id
  const tier = priceId ? getTierFromPriceId(priceId) : 'free'

  await db
    .update(subscriptions)
    .set({
      status: subscription.status,
      tier,
      stripePriceId: priceId || '',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))

  if (subscription.metadata?.userId) {
    const isActive = ['active', 'trialing'].includes(subscription.status)
    const effectiveTier = isActive ? tier : 'free'

    await db
      .update(users)
      .set({
        tier: effectiveTier,
        tierExpiresAt: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      })
      .where(eq(users.id, subscription.metadata.userId))

    await updateUserBadgesForTier(subscription.metadata.userId, effectiveTier as TierType)
  }
}

async function handleSubscriptionDeleted(subscriptionId: string, userId?: string) {
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      endedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))

  if (userId) {
    await db
      .update(users)
      .set({
        tier: 'free',
        stripeSubscriptionId: null,
        tierExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    await updateUserBadgesForTier(userId, 'free')
  }
}
