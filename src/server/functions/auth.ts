/**
 * Modern Authentication System
 * Secure, type-safe authentication with Appwrite
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAdminClient, createSessionClient } from '../lib/appwrite'
import { AppwriteException, ID } from 'node-appwrite'
import {
  deleteCookie,
  getCookie,
  setCookie,
  setResponseStatus,
} from '@tanstack/react-start/server'

// ============================================================================
// Validation Schemas
// ============================================================================

const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .optional()

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  redirect: z.string().optional(),
})

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  redirect: z.string().optional(),
})

// ============================================================================
// Session Management
// ============================================================================

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export const getAppwriteSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = getCookie('appwrite-session-secret')
    return session || null
  },
)

export const setAppwriteSessionCookiesFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string(), secret: z.string() }))
  .handler(async ({ data }) => {
    const { id, secret } = data

    setCookie('appwrite-session-secret', secret, COOKIE_OPTIONS)
    setCookie('appwrite-session-id', id, COOKIE_OPTIONS)
  })

const clearSessionCookies = () => {
  deleteCookie('appwrite-session-secret')
  deleteCookie('appwrite-session-id')
}

// ============================================================================
// Authentication Functions
// ============================================================================

export const signUpFn = createServerFn({ method: 'POST' })
  .inputValidator(signUpSchema)
  .handler(async ({ data }) => {
    const { email, password, name } = data
    const { account } = createAdminClient()

    try {
      // Create user account
      await account.create({
        userId: ID.unique(),
        email,
        password,
        name: name || email.split('@')[0],
      })

      // Create session
      const session = await account.createEmailPasswordSession({
        email,
        password,
      })

      // Set session cookies
      await setAppwriteSessionCookiesFn({
        data: { id: session.$id, secret: session.secret },
      })

      return { success: true, message: 'Account created successfully' }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code || 500)

      // User-friendly error messages
      const errorMessages: Record<number, string> = {
        409: 'An account with this email already exists',
        400: 'Invalid email or password format',
        429: 'Too many attempts. Please try again later',
      }

      throw {
        message: errorMessages[error.code] || error.message || 'Failed to create account',
        status: error.code || 500,
        code: error.type,
      }
    }
  })

export const signInFn = createServerFn({ method: 'POST' })
  .inputValidator(signInSchema)
  .handler(async ({ data }) => {
    const { email, password } = data
    const { account } = createAdminClient()

    try {
      const session = await account.createEmailPasswordSession({
        email,
        password,
      })

      await setAppwriteSessionCookiesFn({
        data: { id: session.$id, secret: session.secret },
      })

      return { success: true, message: 'Signed in successfully' }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code || 500)

      // User-friendly error messages
      const errorMessages: Record<number, string> = {
        401: 'Invalid email or password',
        404: 'No account found with this email',
        429: 'Too many attempts. Please try again later',
      }

      throw {
        message: errorMessages[error.code] || error.message || 'Failed to sign in',
        status: error.code || 500,
        code: error.type,
      }
    }
  })

export const signOutFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const session = await getAppwriteSessionFn()

    if (session) {
      // Try to delete session from Appwrite
      try {
        const client = await createSessionClient(session)
        await client.account.deleteSession('current')
      } catch {
        // Session might already be invalid, continue with cookie cleanup
      }
    }

    // Always clear cookies
    clearSessionCookies()

    return { success: true, message: 'Signed out successfully' }
  } catch {
    // Clear cookies even if there's an error
    clearSessionCookies()
    return { success: true, message: 'Signed out' }
  }
})

// ============================================================================
// User & Session Functions
// ============================================================================

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const session = await getAppwriteSessionFn()

      if (!session) {
        return null
      }

      const client = await createSessionClient(session)
      const user = await client.account.get()

      return {
        $id: user.$id,
        $createdAt: user.$createdAt,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification,
        prefs: user.prefs,
        labels: user.labels,
        registration: user.$createdAt,
      }
    } catch (error) {
      // Only clear cookies for specific auth errors, not network issues
      const appwriteError = error as AppwriteException
      if (appwriteError.code === 401 || appwriteError.type === 'user_unauthorized') {
        clearSessionCookies()
      }
      return null
    }
  },
)

export const authMiddleware = createServerFn({ method: 'GET' }).handler(
  async () => {
    const currentUser = await getCurrentUser()
    return { currentUser }
  },
)

// ============================================================================
// Profile Management
// ============================================================================

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ name: nameSchema }))
  .handler(async ({ data }) => {
    const session = await getAppwriteSessionFn()

    if (!session) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    try {
      const client = await createSessionClient(session)

      if (data.name) {
        await client.account.updateName(data.name)
      }

      return { success: true, message: 'Profile updated successfully' }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Failed to update profile',
        status: error.code || 500,
      }
    }
  })

// ============================================================================
// Type Exports
// ============================================================================

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>
