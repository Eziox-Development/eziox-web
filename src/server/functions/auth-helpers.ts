/**
 * Shared authentication helpers for server functions.
 * This file must NOT contain any createServerFn definitions
 * to avoid TanStack Start virtual module resolution issues (see #5709).
 */

import {
  getCookie,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { validateSession } from '../lib/auth'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { type TierType } from '../lib/stripe'

/**
 * Shared authentication helper for server functions.
 * Validates session cookie and returns the authenticated user.
 * Throws 401 if not authenticated.
 */
export async function getAuthenticatedUser() {
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

/**
 * Shared helper to require admin or owner role.
 * Throws 403 if user is not an admin/owner.
 */
export async function requireAdmin() {
  const user = await getAuthenticatedUser()
  if (user.role !== 'admin' && user.role !== 'owner') {
    setResponseStatus(403)
    throw { message: 'Admin access required', status: 403 }
  }
  return user
}

/**
 * Shared helper to require owner role.
 * Throws 403 if user is not an owner.
 */
export async function requireOwner() {
  const user = await getAuthenticatedUser()
  if (user.role !== 'owner') {
    setResponseStatus(403)
    throw { message: 'Owner access required', status: 403 }
  }
  return user
}

/**
 * Optional authentication helper.
 * Returns the user if authenticated, null otherwise. Does not throw.
 */
export async function getOptionalUser() {
  const token = getCookie('session-token')
  if (!token) return null
  return validateSession(token)
}

/**
 * Shared helper to get a user's subscription tier.
 * Normalizes legacy 'standard' tier to 'free'.
 */
export async function getUserTier(userId: string): Promise<TierType> {
  const [userData] = await db
    .select({ tier: users.tier })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const tier = userData?.tier || 'free'
  return (tier === 'standard' || !tier ? 'free' : tier) as TierType
}
