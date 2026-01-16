/**
 * New Authentication Server Functions
 * Replaces Appwrite auth with Neon PostgreSQL + custom sessions
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getCookie,
  setCookie,
  deleteCookie,
  setResponseStatus,
} from '@tanstack/react-start/server'
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  verifyPassword,
  createSession,
  validateSession,
  deleteSession,
  getUserWithProfile,
  updateUser,
  updateProfile,
  updateLastActive,
} from '../lib/auth'

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

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username is too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .optional()

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  name: nameSchema,
  referralCode: z.string().max(20).optional(),
})

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// ============================================================================
// Cookie Options
// ============================================================================

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

// ============================================================================
// Session Functions
// ============================================================================

export const getSessionTokenFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    return token || null
  },
)

// ============================================================================
// Sign Up
// ============================================================================

export const signUpFn = createServerFn({ method: 'POST' })
  .inputValidator(signUpSchema)
  .handler(async ({ data }) => {
    const { email, password, username, name, referralCode } = data

    try {
      // Check if email already exists
      const existingEmail = await findUserByEmail(email)
      if (existingEmail) {
        setResponseStatus(409)
        throw { message: 'An account with this email already exists', status: 409 }
      }

      // Check if username already exists
      const existingUsername = await findUserByUsername(username)
      if (existingUsername) {
        setResponseStatus(409)
        throw { message: 'This username is already taken', status: 409 }
      }

      // Create user
      const user = await createUser({ email, password, username, name })

      // Process referral if code provided
      if (referralCode) {
        try {
          const { processReferralFn } = await import('./referrals')
          await processReferralFn({ data: { newUserId: user.id, referralCode } })
        } catch {
          console.error('Failed to process referral')
        }
      }

      // Auto-award badges (early_adopter, etc.)
      try {
        const { checkAndAwardBadgesFn } = await import('./badges')
        await checkAndAwardBadgesFn({ data: { userId: user.id } })
      } catch {
        console.error('Failed to check badges')
      }

      // Create session
      const session = await createSession(user.id)

      // Set cookie
      if (!session) {
        throw { message: 'Failed to create session', status: 500 }
      }
      setCookie('session-token', session.token, COOKIE_OPTIONS)

      return { success: true, message: 'Account created successfully' }
    } catch (error) {
      const err = error as { message?: string; status?: number }
      if (err.status) {
        throw error
      }
      setResponseStatus(500)
      throw { message: err.message || 'Failed to create account', status: 500 }
    }
  })

// ============================================================================
// Sign In
// ============================================================================

export const signInFn = createServerFn({ method: 'POST' })
  .inputValidator(signInSchema)
  .handler(async ({ data }) => {
    const { email, password } = data

    try {
      // Find user
      const user = await findUserByEmail(email)
      if (!user) {
        setResponseStatus(401)
        throw { message: 'Invalid email or password', status: 401 }
      }

      // Verify password
      const valid = await verifyPassword(password, user.passwordHash)
      if (!valid) {
        setResponseStatus(401)
        throw { message: 'Invalid email or password', status: 401 }
      }

      // Create session
      const session = await createSession(user.id)

      // Set cookie
      if (!session) {
        throw { message: 'Failed to create session', status: 500 }
      }
      setCookie('session-token', session.token, COOKIE_OPTIONS)

      // Update last active
      await updateLastActive(user.id)

      return { success: true, message: 'Signed in successfully' }
    } catch (error) {
      const err = error as { message?: string; status?: number }
      if (err.status) {
        throw error
      }
      setResponseStatus(500)
      throw { message: err.message || 'Failed to sign in', status: 500 }
    }
  })

// ============================================================================
// Sign Out
// ============================================================================

export const signOutFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const token = getCookie('session-token')

    if (token) {
      await deleteSession(token)
    }

    deleteCookie('session-token')

    return { success: true, message: 'Signed out successfully' }
  } catch {
    deleteCookie('session-token')
    return { success: true, message: 'Signed out' }
  }
})

// ============================================================================
// Get Current User
// ============================================================================

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const token = getCookie('session-token')

      if (!token) {
        return null
      }

      const user = await validateSession(token)
      if (!user) {
        deleteCookie('session-token')
        return null
      }

      // Get full profile
      const userData = await getUserWithProfile(user.id)
      if (!userData) {
        return null
      }

      // Update last active
      await updateLastActive(user.id)

      return {
        id: userData.user.id,
        email: userData.user.email,
        username: userData.user.username,
        name: userData.user.name,
        role: userData.user.role,
        emailVerified: userData.user.emailVerified,
        createdAt: userData.user.createdAt.toISOString(),
        profile: userData.profile ? {
          bio: userData.profile.bio,
          avatar: userData.profile.avatar,
          banner: userData.profile.banner,
          location: userData.profile.location,
          website: userData.profile.website,
          pronouns: userData.profile.pronouns,
          accentColor: userData.profile.accentColor,
          badges: userData.profile.badges,
          socials: userData.profile.socials,
          isPublic: userData.profile.isPublic,
          showActivity: userData.profile.showActivity,
          birthday: userData.profile.birthday?.toISOString() || null,
          creatorType: userData.profile.creatorType,
          referralCode: userData.profile.referralCode,
        } : null,
        stats: userData.stats ? {
          profileViews: userData.stats.profileViews,
          totalLinkClicks: userData.stats.totalLinkClicks,
          followers: userData.stats.followers,
          following: userData.stats.following,
          score: userData.stats.score,
        } : null,
      }
    } catch {
      return null
    }
  },
)

// ============================================================================
// Auth Middleware
// ============================================================================

export const authMiddleware = createServerFn({ method: 'GET' }).handler(
  async () => {
    const currentUser = await getCurrentUser()
    return { currentUser }
  },
)

// ============================================================================
// Update Profile
// ============================================================================

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: nameSchema,
      username: usernameSchema.optional(),
      bio: z.string().max(500).optional(),
      location: z.string().max(100).optional(),
      website: z.url().optional().or(z.literal('')),
      pronouns: z.string().max(50).optional(),
      accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      isPublic: z.boolean().optional(),
      showActivity: z.boolean().optional(),
      birthday: z.string().optional(), // ISO date string
      creatorType: z.string().max(50).optional(),
      socials: z.record(z.string(), z.string()).optional(), // { twitter: "@handle", instagram: "handle", etc. }
    })
  )
  .handler(async ({ data }) => {
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

    try {
      // Update user fields
      if (data.name || data.username) {
        // Check if username is taken
        if (data.username && data.username !== user.username) {
          const existing = await findUserByUsername(data.username)
          if (existing) {
            setResponseStatus(409)
            throw { message: 'Username is already taken', status: 409 }
          }
        }

        await updateUser(user.id, {
          name: data.name,
          username: data.username,
        })
      }

      // Update profile fields
      await updateProfile(user.id, {
        bio: data.bio,
        location: data.location,
        website: data.website || undefined,
        pronouns: data.pronouns,
        accentColor: data.accentColor,
        isPublic: data.isPublic,
        showActivity: data.showActivity,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
        creatorType: data.creatorType,
        socials: data.socials,
      })

      return { success: true, message: 'Profile updated successfully' }
    } catch (error) {
      const err = error as { message?: string; status?: number }
      if (err.status) {
        throw error
      }
      setResponseStatus(500)
      throw { message: err.message || 'Failed to update profile', status: 500 }
    }
  })

// ============================================================================
// Type Exports
// ============================================================================

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>
