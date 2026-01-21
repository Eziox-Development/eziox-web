import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { users, subscriptions, profiles } from '../db/schema'
import { eq } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import { stripe, TIER_CONFIG, getTierFromPriceId, type TierType } from '../lib/stripe'
import { createSubscriptionNotification, createBadgeNotification } from './notifications'
import { BADGES } from '@/lib/badges'
import { sendSubscriptionEmail } from '../lib/email'

async function updateUserBadgesForTier(userId: string, tier: TierType, sendNotification = true) {
  const [profile] = await db
    .select({ badges: profiles.badges })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  if (!profile) return

  const currentBadges = (profile.badges || []) as string[]
  const premiumBadges = ['pro_subscriber', 'creator_subscriber', 'lifetime_subscriber']
  
  const newBadges = currentBadges.filter(b => !premiumBadges.includes(b))
  let awardedBadge: string | null = null
  
  if (tier === 'lifetime' && !currentBadges.includes('lifetime_subscriber')) {
    newBadges.push('lifetime_subscriber')
    awardedBadge = 'lifetime_subscriber'
  } else if (tier === 'creator' && !currentBadges.includes('creator_subscriber')) {
    newBadges.push('creator_subscriber')
    awardedBadge = 'creator_subscriber'
  } else if (tier === 'pro' && !currentBadges.includes('pro_subscriber')) {
    newBadges.push('pro_subscriber')
    awardedBadge = 'pro_subscriber'
  }

  await db
    .update(profiles)
    .set({ badges: newBadges, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))

  if (awardedBadge && sendNotification) {
    const badge = BADGES[awardedBadge as keyof typeof BADGES]
    if (badge) {
      await createBadgeNotification(userId, badge.name, badge.icon)
    }
  }
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

  const normalizedTier = (userData.tier === 'standard' || !userData.tier) ? 'free' : userData.tier
  
  return {
    tier: normalizedTier as TierType,
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
  .inputValidator(z.object({ tier: z.enum(['pro', 'creator', 'lifetime']) }))
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

    // Only create new customer if none exists
    if (!customerId) {
      // First check if customer already exists in Stripe by email
      const existingCustomers = await stripe.customers.list({
        email: userData.email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0 && existingCustomers.data[0]) {
        customerId = existingCustomers.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email: userData.email,
          metadata: { userId: user.id },
        })
        customerId = customer.id
      }

      await db
        .update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, user.id))
    }

    const baseUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'https://www.eziox.link'
    const isLifetime = data.tier === 'lifetime'

    const session = isLifetime
      ? await stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'payment',
          payment_method_types: ['card', 'paypal'],
          allow_promotion_codes: true,
          line_items: [{ price: tierConfig.priceId, quantity: 1 }],
          success_url: `${baseUrl}/profile?tab=subscription&success=true`,
          cancel_url: `${baseUrl}/profile?tab=subscription&canceled=true`,
          metadata: { userId: user.id, tier: data.tier },
          // Customer balance is automatically applied by Stripe
          customer_update: {
            address: 'auto',
            name: 'auto',
          },
          billing_address_collection: 'auto',
          invoice_creation: {
            enabled: true,
            invoice_data: {
              metadata: { userId: user.id, tier: data.tier },
            },
          },
        })
      : await stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'subscription',
          payment_method_types: ['card', 'paypal'],
          allow_promotion_codes: true,
          line_items: [{ price: tierConfig.priceId, quantity: 1 }],
          success_url: `${baseUrl}/profile?tab=subscription&success=true`,
          cancel_url: `${baseUrl}/profile?tab=subscription&canceled=true`,
          metadata: { userId: user.id, tier: data.tier },
          subscription_data: {
            metadata: { userId: user.id, tier: data.tier },
          },
          customer_update: {
            address: 'auto',
            name: 'auto',
          },
          billing_address_collection: 'auto',
        })

    if (!session.url) {
      throw { message: 'Failed to create checkout session', status: 500 }
    }

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

  const baseUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'https://www.eziox.link'

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
        id: string
        mode: 'payment' | 'subscription' | 'setup'
        subscription: string | null
        payment_intent: string | null
        customer: string
        metadata: { userId: string; tier: string }
        amount_total: number | null
        currency: string | null
      }

      if (!session.metadata?.userId || !session.metadata?.tier) {
        break
      }

      // Handle subscription-based payments (Pro, Creator monthly)
      if (session.mode === 'subscription' && session.subscription) {
        await handleSubscriptionCreated(
          session.subscription,
          session.customer,
          session.metadata.userId,
          session.metadata.tier as TierType
        )
      }
      // Handle one-time payments (Lifetime)
      else if (session.mode === 'payment') {
        await handleOneTimePayment(
          session.customer,
          session.metadata.userId,
          session.metadata.tier as TierType,
          session.payment_intent
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

  await createSubscriptionNotification(userId, 'upgraded', {
    tier: actualTier,
    expiresAt: new Date(periodEnd * 1000),
  })

  // Send subscription email
  const [user] = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  
  if (user?.email) {
    const tierName = TIER_CONFIG[actualTier]?.name || actualTier
    void sendSubscriptionEmail(user.email, user.username || 'User', tierName, 'upgraded')
  }
}

// Handle one-time payments (Lifetime tier)
async function handleOneTimePayment(
  customerId: string,
  userId: string,
  tier: TierType,
  paymentIntentId: string | null
) {
  // For lifetime, there's no expiration
  const tierExpiresAt = tier === 'lifetime' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  
  // Update user with new tier
  await db
    .update(users)
    .set({
      tier,
      stripeCustomerId: customerId,
      stripeSubscriptionId: null, // No subscription for one-time payments
      tierExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  // Create a record in subscriptions table for tracking
  await db.insert(subscriptions).values({
    userId,
    stripeSubscriptionId: paymentIntentId || `lifetime_${userId}_${Date.now()}`,
    stripePriceId: process.env.STRIPE_LIFETIME_PRICE_ID || '',
    stripeCustomerId: customerId,
    tier,
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: tierExpiresAt || new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years for lifetime
    cancelAtPeriodEnd: false,
  })

  // Update badges
  await updateUserBadgesForTier(userId, tier)

  // Create notification
  await createSubscriptionNotification(userId, 'upgraded', {
    tier,
    expiresAt: tierExpiresAt,
  })

  // Send confirmation email
  const [user] = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (user?.email) {
    const tierName = TIER_CONFIG[tier]?.name || tier
    void sendSubscriptionEmail(user.email, user.username || 'User', tierName, 'upgraded')
  }
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

    if (subscription.cancel_at_period_end) {
      await createSubscriptionNotification(subscription.metadata.userId, 'canceled', {
        tier: effectiveTier,
        expiresAt: new Date(subscription.current_period_end * 1000),
      })

      // Send cancellation email
      const [user] = await db
        .select({ email: users.email, username: users.username })
        .from(users)
        .where(eq(users.id, subscription.metadata.userId))
        .limit(1)
      
      if (user?.email) {
        const tierName = TIER_CONFIG[effectiveTier as TierType]?.name || effectiveTier
        void sendSubscriptionEmail(user.email, user.username || 'User', tierName, 'cancelled')
      }
    }
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

    await createSubscriptionNotification(userId, 'tier_expired', {
      tier: 'free',
      previousTier: 'unknown',
    })
  }
}

async function requireAdmin() {
  const user = await getAuthenticatedUser()
  if (user.role !== 'admin' && user.role !== 'owner') {
    setResponseStatus(403)
    throw { message: 'Admin access required', status: 403 }
  }
  return user
}

export const adminSetUserTierFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
      tier: z.enum(['free', 'pro', 'creator', 'lifetime']),
      expiresAt: z.string().datetime().optional().nullable(),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const [targetUser] = await db
      .select({ id: users.id, username: users.username, tier: users.tier })
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1)

    if (!targetUser) {
      setResponseStatus(404)
      throw { message: 'User not found', status: 404 }
    }

    const previousTier = targetUser.tier || 'free'
    const newTier = data.tier as TierType

    let tierExpiresAt: Date | null = null
    if (data.expiresAt) {
      tierExpiresAt = new Date(data.expiresAt)
    } else if (newTier === 'lifetime') {
      tierExpiresAt = null
    } else if (newTier !== 'free') {
      tierExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }

    await db
      .update(users)
      .set({
        tier: newTier,
        tierExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, data.userId))

    await updateUserBadgesForTier(data.userId, newTier)

    const tierLevel: Record<string, number> = { free: 0, standard: 0, pro: 1, creator: 2, lifetime: 3 }
    const isUpgrade = (tierLevel[newTier] ?? 0) > (tierLevel[previousTier] ?? 0)
    
    await createSubscriptionNotification(data.userId, isUpgrade ? 'tier_granted' : 'downgraded', {
      tier: newTier,
      previousTier,
      expiresAt: tierExpiresAt,
      adminGranted: true,
    })

    return {
      success: true,
      message: `Tier updated: ${previousTier} → ${newTier}`,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        previousTier,
        newTier,
        expiresAt: tierExpiresAt,
      },
    }
  })

export const adminGetAllUsersTiersFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(200).default(100),
      offset: z.number().int().min(0).default(0),
      tierFilter: z.enum(['all', 'free', 'pro', 'creator', 'lifetime']).default('all'),
    }).optional()
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    const limit = data?.limit || 100
    const offset = data?.offset || 0
    const tierFilter = data?.tierFilter || 'all'

    const query = db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        tier: users.tier,
        tierExpiresAt: users.tierExpiresAt,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
        createdAt: users.createdAt,
        avatar: profiles.avatar,
        badges: profiles.badges,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset)

    const results = await query

    const filteredResults = tierFilter === 'all' 
      ? results 
      : results.filter(u => {
          const normalizedTier = (u.tier === 'standard' || !u.tier) ? 'free' : u.tier
          return normalizedTier === tierFilter
        })

    return {
      users: filteredResults.map(u => ({
        ...u,
        tier: (u.tier === 'standard' || !u.tier) ? 'free' : u.tier,
        badges: (u.badges || []) as string[],
      })),
      total: filteredResults.length,
      limit,
      offset,
    }
  })

// Get customer credit balance
export const getCustomerBalanceFn = createServerFn({ method: 'GET' }).handler(async () => {
  if (!stripe) {
    return { balance: 0, formattedBalance: '€0.00' }
  }

  const user = await getAuthenticatedUser()

  const [userData] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!userData?.stripeCustomerId) {
    return { balance: 0, formattedBalance: '€0.00' }
  }

  try {
    const customer = await stripe.customers.retrieve(userData.stripeCustomerId)
    if (customer && !customer.deleted && 'balance' in customer) {
      // Stripe stores balance in cents, negative = credit
      const balanceCents = customer.balance || 0
      const creditCents = balanceCents < 0 ? Math.abs(balanceCents) : 0
      return {
        balance: creditCents,
        formattedBalance: `€${(creditCents / 100).toFixed(2)}`,
        hasCredit: creditCents > 0,
      }
    }
  } catch {
    // Silently handle balance retrieval errors
  }

  return { balance: 0, formattedBalance: '€0.00', hasCredit: false }
})

// Admin: Add credit to customer balance
export const adminAddCustomerCreditFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
      amountCents: z.number().int().min(1).max(100000), // Max €1000
      description: z.string().max(500).optional(),
    })
  )
  .handler(async ({ data }) => {
    await requireAdmin()

    if (!stripe) {
      throw { message: 'Stripe is not configured', status: 500 }
    }

    const [targetUser] = await db
      .select({ 
        stripeCustomerId: users.stripeCustomerId,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1)

    if (!targetUser) {
      throw { message: 'User not found', status: 404 }
    }

    let customerId = targetUser.stripeCustomerId

    // Create Stripe customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: targetUser.email,
        metadata: { userId: data.userId },
      })
      customerId = customer.id

      await db
        .update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, data.userId))
    }

    // Add credit using balance transaction (negative = credit in Stripe)
    await stripe.customers.createBalanceTransaction(customerId, {
      amount: -data.amountCents, // Negative = credit
      currency: 'eur',
      description: data.description || `Credit added by admin`,
    })

    return {
      success: true,
      message: `Added €${(data.amountCents / 100).toFixed(2)} credit to ${targetUser.username || targetUser.email}`,
    }
  })
