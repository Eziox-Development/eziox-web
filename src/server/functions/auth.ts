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
  isAccountLocked,
  recordFailedLogin,
  recordSuccessfulLogin,
  refreshSession,
  generatePasswordResetToken,
  validatePasswordResetToken,
  resetPassword,
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  enableTwoFactor,
  disableTwoFactor,
  isTwoFactorEnabled,
} from '../lib/auth'
import { checkRateLimit, RATE_LIMITS, sanitizeText, sanitizeURL, isValidReferralCode, generateCSRFToken, validateCSRFToken } from '@/lib/security'
import { getRequestIP } from '@tanstack/react-start/server'
import { sendPasswordResetEmail, sendLoginNotificationEmail, sendWelcomeEmail, sendAccountDeletedEmail, send2FAEnabledEmail, send2FADisabledEmail, sendPasswordChangedEmail } from '../lib/email'
import { verifyTurnstileToken } from '../lib/turnstile'
import { logSecurityEvent } from '../lib/security-logger'

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
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens',
  )

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
  turnstileToken: z.string().min(1, 'Bot verification required'),
})

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  turnstileToken: z.string().min(1, 'Bot verification required'),
})

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

export const getSessionTokenFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    return token || null
  },
)

export const signUpFn = createServerFn({ method: 'POST' })
  .inputValidator(signUpSchema)
  .handler(async ({ data }) => {
    const { email, password, username, name, referralCode, turnstileToken } = data

    const ip = getRequestIP() || 'unknown'
    
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken, ip)
    if (!isTurnstileValid) {
      setResponseStatus(403)
      throw {
        message: 'Bot verification failed. Please try again.',
        status: 403,
      }
    }

    const rateLimit = checkRateLimit(
      `signup:${ip}`,
      RATE_LIMITS.AUTH_SIGNUP.maxRequests,
      RATE_LIMITS.AUTH_SIGNUP.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many signup attempts. Please try again later.',
        status: 429,
      }
    }

    try {
      const existingEmail = await findUserByEmail(email)
      if (existingEmail) {
        setResponseStatus(409)
        throw {
          message: 'An account with this email already exists',
          status: 409,
        }
      }

      const existingUsername = await findUserByUsername(username)
      if (existingUsername) {
        setResponseStatus(409)
        throw { message: 'This username is already taken', status: 409 }
      }

      const user = await createUser({ email, password, username, name })

      if (referralCode && isValidReferralCode(referralCode)) {
        try {
          const { processReferralFn } = await import('./referrals')
          await processReferralFn({
            data: { newUserId: user.id, referralCode },
          })
        } catch {
          console.error('Failed to process referral')
        }
      }

      try {
        const { checkAndAwardBadgesFn } = await import('./badges')
        await checkAndAwardBadgesFn({ data: { userId: user.id } })
      } catch {
        console.error('Failed to check badges')
      }

      const session = await createSession(user.id)

      if (!session) {
        throw { message: 'Failed to create session', status: 500 }
      }
      setCookie('session-token', session.token, COOKIE_OPTIONS)

      void sendWelcomeEmail(user.email, user.username)

      logSecurityEvent('auth.signup', { userId: user.id, ip })

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

const signInSchemaExtended = signInSchema.extend({
  rememberMe: z.boolean().optional().default(false),
})

export const signInFn = createServerFn({ method: 'POST' })
  .inputValidator(signInSchemaExtended)
  .handler(async ({ data }) => {
    const { email, password, rememberMe, turnstileToken } = data

    const ip = getRequestIP() || 'unknown'
    
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken, ip)
    if (!isTurnstileValid) {
      setResponseStatus(403)
      throw {
        message: 'Bot verification failed. Please try again.',
        status: 403,
      }
    }

    const rateLimit = checkRateLimit(
      `login:${ip}`,
      RATE_LIMITS.AUTH_LOGIN.maxRequests,
      RATE_LIMITS.AUTH_LOGIN.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many login attempts. Please try again in 15 minutes.',
        status: 429,
      }
    }

    try {
      const user = await findUserByEmail(email)
      if (!user) {
        setResponseStatus(401)
        throw { message: 'Invalid email or password', status: 401 }
      }

      const locked = await isAccountLocked(user.id)
      if (locked) {
        setResponseStatus(423)
        throw {
          message: 'Account temporarily locked due to too many failed attempts. Please try again later.',
          status: 423,
        }
      }

      const valid = await verifyPassword(password, user.passwordHash)
      if (!valid) {
        const lockResult = await recordFailedLogin(user.id)
        setResponseStatus(401)
        if (lockResult.locked) {
          throw {
            message: 'Account locked due to too many failed attempts. Please try again in 30 minutes.',
            status: 401,
          }
        }
        throw {
          message: `Invalid email or password. ${lockResult.attemptsRemaining} attempts remaining.`,
          status: 401,
        }
      }

      const session = await createSession(user.id, undefined, ip, rememberMe)

      if (!session) {
        throw { message: 'Failed to create session', status: 500 }
      }

      const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
      setCookie('session-token', session.token, { ...COOKIE_OPTIONS, maxAge: cookieMaxAge })

      await recordSuccessfulLogin(user.id, ip)
      await updateLastActive(user.id)

      void sendLoginNotificationEmail(
        user.email,
        user.username,
        ip,
        '', // userAgent not available in this context
        new Date()
      )

      logSecurityEvent('auth.login_success', { userId: user.id, ip })

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

export const signOutFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const token = getCookie('session-token')

      if (token) {
        const user = await validateSession(token)
        if (user) {
          logSecurityEvent('auth.logout', { userId: user.id })
        }
        await deleteSession(token)
      }

      deleteCookie('session-token')

      return { success: true, message: 'Signed out successfully' }
    } catch {
      deleteCookie('session-token')
      return { success: true, message: 'Signed out' }
    }
  },
)

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
        tier: userData.user.tier || 'free',
        emailVerified: userData.user.emailVerified,
        createdAt: userData.user.createdAt.toISOString(),
        profile: userData.profile
          ? {
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
            }
          : null,
        stats: userData.stats
          ? {
              profileViews: userData.stats.profileViews,
              totalLinkClicks: userData.stats.totalLinkClicks,
              followers: userData.stats.followers,
              following: userData.stats.following,
              score: userData.stats.score,
            }
          : null,
      }
    } catch {
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

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: nameSchema,
      username: usernameSchema.optional(),
      bio: z.string().max(500).optional(),
      location: z.string().max(100).optional(),
      website: z.url().optional().or(z.literal('')),
      pronouns: z.string().max(50).optional(),
      accentColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      isPublic: z.boolean().optional(),
      showActivity: z.boolean().optional(),
      birthday: z.string().optional(), // ISO date string
      creatorType: z.string().max(50).optional(),
      socials: z.record(z.string(), z.string()).optional(), // { twitter: "@handle", instagram: "handle", etc. }
    }),
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
      const sanitizedSocials = data.socials
        ? Object.fromEntries(
            Object.entries(data.socials)
              .map(([key, value]) => [sanitizeText(key, 50), sanitizeText(value, 100)])
              .filter(([, value]) => value)
          )
        : undefined

      await updateProfile(user.id, {
        bio: data.bio ? sanitizeText(data.bio, 500) : undefined,
        location: data.location ? sanitizeText(data.location, 100) : undefined,
        website: data.website ? sanitizeURL(data.website) || undefined : undefined,
        pronouns: data.pronouns ? sanitizeText(data.pronouns, 50) : undefined,
        accentColor: data.accentColor,
        isPublic: data.isPublic,
        showActivity: data.showActivity,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
        creatorType: data.creatorType ? sanitizeText(data.creatorType, 50) : undefined,
        socials: sanitizedSocials,
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

export const requestPasswordResetFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ 
    email: emailSchema,
    turnstileToken: z.string().min(1, 'Bot verification required'),
  }))
  .handler(async ({ data }) => {
    const ip = getRequestIP() || 'unknown'
    
    const isTurnstileValid = await verifyTurnstileToken(data.turnstileToken, ip)
    if (!isTurnstileValid) {
      setResponseStatus(403)
      throw {
        message: 'Bot verification failed. Please try again.',
        status: 403,
      }
    }

    const rateLimit = checkRateLimit(
      `password-reset:${ip}`,
      RATE_LIMITS.AUTH_PASSWORD_RESET.maxRequests,
      RATE_LIMITS.AUTH_PASSWORD_RESET.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many password reset requests. Please try again later.',
        status: 429,
      }
    }

    const user = await findUserByEmail(data.email)
    if (!user) {
      return { success: true, message: 'If an account exists, a reset link has been sent.' }
    }

    const token = await generatePasswordResetToken(user.id)

    const emailResult = await sendPasswordResetEmail(user.email, token, user.username)
    if (!emailResult.success) {
      console.error(`[Auth] Failed to send password reset email to ${user.email}`)
    }

    return { success: true, message: 'If an account exists, a reset link has been sent.' }
  })

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      password: passwordSchema,
    }),
  )
  .handler(async ({ data }) => {
    const user = await validatePasswordResetToken(data.token)
    if (!user) {
      setResponseStatus(400)
      throw { message: 'Invalid or expired reset token', status: 400 }
    }

    await resetPassword(user.id, data.password)

    // Send password changed notification email
    if (user.email) {
      const ip = getRequestIP() || 'Unknown'
      const username = user.username ?? user.email.split('@')[0]
      void sendPasswordChangedEmail(user.email, username, ip, new Date())
    }

    return { success: true, message: 'Password reset successfully. Please sign in.' }
  })

export const refreshSessionFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'No session found', status: 401 }
    }

    const newSession = await refreshSession(token)
    if (!newSession) {
      deleteCookie('session-token')
      setResponseStatus(401)
      throw { message: 'Session expired', status: 401 }
    }

    const cookieMaxAge = newSession.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
    setCookie('session-token', newSession.token, { ...COOKIE_OPTIONS, maxAge: cookieMaxAge })

    return { success: true, message: 'Session refreshed' }
  },
)

export const setupTwoFactorFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(token)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Invalid session', status: 401 }
    }

    const result = await generateTwoFactorSecret(user.id)
    return { success: true, secret: result.secret, qrCodeUrl: result.qrCodeUrl }
  },
)

export const enableTwoFactorFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(6) }))
  .handler(async ({ data }) => {
    const sessionToken = getCookie('session-token')
    if (!sessionToken) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(sessionToken)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Invalid session', status: 401 }
    }

    const success = await enableTwoFactor(user.id, data.token)
    if (!success) {
      setResponseStatus(400)
      throw { message: 'Invalid verification code', status: 400 }
    }

    // Send 2FA enabled notification email
    if (user.email) {
      const username = user.username ?? user.email.split('@')[0]
      void send2FAEnabledEmail(user.email, username, new Date())
    }

    return { success: true, message: '2FA enabled successfully' }
  })

export const disableTwoFactorFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(6) }))
  .handler(async ({ data }) => {
    const sessionToken = getCookie('session-token')
    if (!sessionToken) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(sessionToken)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Invalid session', status: 401 }
    }

    const valid = await verifyTwoFactorToken(user.id, data.token)
    if (!valid) {
      setResponseStatus(400)
      throw { message: 'Invalid verification code', status: 400 }
    }

    await disableTwoFactor(user.id)

    // Send 2FA disabled security alert email
    if (user.email) {
      const ip = getRequestIP() || 'Unknown'
      const username = user.username ?? user.email.split('@')[0]
      void send2FADisabledEmail(user.email, username, ip, new Date())
    }

    return { success: true, message: '2FA disabled successfully' }
  })

export const verifyTwoFactorFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ userId: z.string().uuid(), token: z.string().length(6) }))
  .handler(async ({ data }) => {
    const valid = await verifyTwoFactorToken(data.userId, data.token)
    if (!valid) {
      setResponseStatus(400)
      throw { message: 'Invalid verification code', status: 400 }
    }
    return { success: true }
  })

export const getTwoFactorStatusFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      return { enabled: false }
    }

    const user = await validateSession(token)
    if (!user) {
      return { enabled: false }
    }

    const enabled = await isTwoFactorEnabled(user.id)
    return { enabled }
  },
)

export const getCsrfTokenFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      return { csrfToken: null }
    }

    const user = await validateSession(token)
    if (!user) {
      return { csrfToken: null }
    }

    const csrfToken = generateCSRFToken(user.id)
    return { csrfToken }
  },
)

export const validateCsrfTokenFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ csrfToken: z.string() }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      return { valid: false }
    }

    const user = await validateSession(token)
    if (!user) {
      return { valid: false }
    }

    const valid = validateCSRFToken(user.id, data.csrfToken)
    return { valid }
  })

export const deleteAccountFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ password: z.string().min(1, 'Password required') }))
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

    const fullUser = await findUserByEmail(user.email)
    if (!fullUser) {
      setResponseStatus(404)
      throw { message: 'User not found', status: 404 }
    }

    const validPassword = await verifyPassword(data.password, fullUser.passwordHash)
    if (!validPassword) {
      setResponseStatus(401)
      throw { message: 'Invalid password', status: 401 }
    }

    const { db } = await import('../db')
    const { spotifyConnections, sessions, users } = await import('../db/schema')
    const { eq } = await import('drizzle-orm')

    // Revoke all OAuth tokens (Spotify)
    await db.delete(spotifyConnections).where(eq(spotifyConnections.userId, user.id))

    // Delete all sessions
    await db.delete(sessions).where(eq(sessions.userId, user.id))

    // Delete user (cascades to profile, links, stats, etc.)
    await db.delete(users).where(eq(users.id, user.id))

    logSecurityEvent('auth.account_deleted', { userId: user.id })

    // Send account deletion confirmation email
    if (user.email) {
      const username = user.username ?? user.email.split('@')[0]
      void sendAccountDeletedEmail(user.email, username)
    }

    deleteCookie('session-token')

    return { success: true, message: 'Account deleted successfully' }
  })

export const exportUserDataFn = createServerFn({ method: 'GET' }).handler(
  async () => {
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

    const { db } = await import('../db')
    const { users, profiles, userLinks, userStats, sessions, activityLog, referrals, spotifyConnections } = await import('../db/schema')
    const { eq } = await import('drizzle-orm')

    const [userData] = await db.select().from(users).where(eq(users.id, user.id))
    const [profileData] = await db.select().from(profiles).where(eq(profiles.userId, user.id))
    const linksData = await db.select().from(userLinks).where(eq(userLinks.userId, user.id))
    const [statsData] = await db.select().from(userStats).where(eq(userStats.userId, user.id))
    const sessionsData = await db.select({
      id: sessions.id,
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
      lastActivityAt: sessions.lastActivityAt,
      ipAddress: sessions.ipAddress,
    }).from(sessions).where(eq(sessions.userId, user.id))
    const activityData = await db.select({
      id: activityLog.id,
      type: activityLog.type,
      targetId: activityLog.targetId,
      createdAt: activityLog.createdAt,
    }).from(activityLog).where(eq(activityLog.userId, user.id))
    const referralsData = await db.select().from(referrals).where(eq(referrals.referrerId, user.id))
    const [spotifyData] = await db.select({
      connected: spotifyConnections.showOnProfile,
      createdAt: spotifyConnections.createdAt,
    }).from(spotifyConnections).where(eq(spotifyConnections.userId, user.id))

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userData ? {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        role: userData.role,
        tier: userData.tier,
        emailVerified: userData.emailVerified,
        twoFactorEnabled: userData.twoFactorEnabled,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastLoginAt: userData.lastLoginAt,
      } : null,
      profile: profileData ? {
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        pronouns: profileData.pronouns,
        creatorType: profileData.creatorType,
        avatar: profileData.avatar,
        banner: profileData.banner,
        accentColor: profileData.accentColor,
        themeId: profileData.themeId,
        socials: profileData.socials,
        badges: profileData.badges,
        isPublic: profileData.isPublic,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      } : null,
      links: linksData.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        icon: link.icon,
        description: link.description,
        isActive: link.isActive,
        clicks: link.clicks,
        createdAt: link.createdAt,
      })),
      stats: statsData ? {
        profileViews: statsData.profileViews,
        totalLinkClicks: statsData.totalLinkClicks,
        followers: statsData.followers,
        following: statsData.following,
      } : null,
      sessions: sessionsData,
      activityLog: activityData,
      referrals: referralsData.map(r => ({
        id: r.id,
        referredId: r.referredId,
        code: r.code,
        createdAt: r.createdAt,
      })),
      spotifyConnection: spotifyData || null,
    }

    return exportData
  },
)

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>
