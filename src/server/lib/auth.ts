import bcrypt from 'bcryptjs'
import { db } from '../db'
import { users, profiles, userStats, sessions } from '../db/schema'
import { eq, and, gt, lt } from 'drizzle-orm'
import crypto from 'crypto'
import {
  generateSecret as otpGenerateSecret,
  verify as otpVerify,
  generateURI,
} from 'otplib'
import QRCode from 'qrcode'
import { encrypt, decrypt } from './encryption'

const SESSION_EXPIRY_DAYS = 7
const SESSION_EXPIRY_DAYS_REMEMBER = 30
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 30
const APP_NAME = 'Eziox'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

function generateToken(length = 64): string {
  return crypto.randomBytes(length).toString('base64url')
}

export async function createUser(data: {
  email: string
  password: string
  username: string
  name?: string
}) {
  const passwordHash = await hashPassword(data.password)

  const [user] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      passwordHash,
      name: data.name || data.username,
      role:
        data.email.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase()
          ? 'owner'
          : 'user',
    })
    .returning()

  if (!user) {
    throw new Error('Failed to create user')
  }

  // Create empty profile
  await db.insert(profiles).values({
    userId: user.id,
  })

  // Create stats entry
  await db.insert(userStats).values({
    userId: user.id,
  })

  return user
}

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  return user || null
}

export async function findUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1)

  return user || null
}

export async function findUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

  return user || null
}

export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string,
  rememberMe = false,
) {
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setDate(
    expiresAt.getDate() +
      (rememberMe ? SESSION_EXPIRY_DAYS_REMEMBER : SESSION_EXPIRY_DAYS),
  )

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      token,
      expiresAt,
      userAgent,
      ipAddress,
      rememberMe,
    })
    .returning()

  return session
}

export async function validateSession(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1)

  if (!session) {
    return null
  }

  const user = await findUserById(session.userId)
  return user
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token))
}

export async function deleteAllUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId))
}

export async function refreshSession(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1)

  if (!session) return null

  const newToken = generateToken()
  const expiresAt = new Date()
  expiresAt.setDate(
    expiresAt.getDate() +
      (session.rememberMe ? SESSION_EXPIRY_DAYS_REMEMBER : SESSION_EXPIRY_DAYS),
  )

  await db.delete(sessions).where(eq(sessions.id, session.id))

  const [newSession] = await db
    .insert(sessions)
    .values({
      userId: session.userId,
      token: newToken,
      expiresAt,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      rememberMe: session.rememberMe,
    })
    .returning()

  return newSession
}

export async function updateSessionActivity(token: string) {
  await db
    .update(sessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(sessions.token, token))
}

export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await findUserById(userId)
  if (!user) return false
  if (!user.lockedUntil) return false
  return user.lockedUntil > new Date()
}

export async function recordFailedLogin(
  userId: string,
): Promise<{ locked: boolean; attemptsRemaining: number }> {
  const user = await findUserById(userId)
  if (!user) return { locked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS }

  const attempts = (user.failedLoginAttempts || 0) + 1

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date()
    lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES)

    await db
      .update(users)
      .set({
        failedLoginAttempts: attempts,
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return { locked: true, attemptsRemaining: 0 }
  }

  await db
    .update(users)
    .set({
      failedLoginAttempts: attempts,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return { locked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS - attempts }
}

export async function resetFailedLoginAttempts(userId: string) {
  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

export async function recordSuccessfulLogin(
  userId: string,
  ipAddress?: string,
) {
  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

export async function generatePasswordResetToken(
  userId: string,
): Promise<string> {
  const token = generateToken(32)
  const expires = new Date()
  expires.setHours(expires.getHours() + 1)

  await db
    .update(users)
    .set({
      passwordResetToken: token,
      passwordResetExpires: expires,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return token
}

export async function generateEmailVerificationToken(
  userId: string,
): Promise<string> {
  const token = generateToken(32)
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)

  await db
    .update(users)
    .set({
      emailVerificationToken: token,
      emailVerificationExpires: expires,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return token
}

export async function validateEmailVerificationToken(token: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.emailVerificationToken, token),
        gt(users.emailVerificationExpires, new Date()),
      ),
    )
    .limit(1)

  return user || null
}

export async function verifyUserEmail(userId: string) {
  await db
    .update(users)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

export async function validatePasswordResetToken(token: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.passwordResetToken, token),
        gt(users.passwordResetExpires, new Date()),
      ),
    )
    .limit(1)

  return user || null
}

export async function resetPassword(userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword)

  await db
    .update(users)
    .set({
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  await deleteAllUserSessions(userId)
}

export async function cleanupExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()))
}

export async function generateTwoFactorSecret(
  userId: string,
): Promise<{ secret: string; qrCodeUrl: string }> {
  const user = await findUserById(userId)
  if (!user) throw new Error('User not found')

  const secret = otpGenerateSecret()
  const encryptedSecret = encrypt(secret)

  await db
    .update(users)
    .set({
      twoFactorSecret: encryptedSecret,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  const otpauth = generateURI({
    issuer: APP_NAME,
    label: user.email,
    secret,
  })
  const qrCodeUrl = await QRCode.toDataURL(otpauth)

  return { secret, qrCodeUrl }
}

export async function verifyTwoFactorToken(
  userId: string,
  token: string,
): Promise<boolean> {
  const user = await findUserById(userId)
  if (!user || !user.twoFactorSecret) return false

  const decryptedSecret = decrypt(user.twoFactorSecret)
  const result = await otpVerify({ secret: decryptedSecret, token })
  return result.valid
}

export async function enableTwoFactor(
  userId: string,
  token: string,
): Promise<{ success: boolean; recoveryCodes?: string[] }> {
  const isValid = await verifyTwoFactorToken(userId, token)
  if (!isValid) return { success: false }

  // Generate recovery codes
  const recoveryCodes = generateRecoveryCodes()
  await saveRecoveryCodes(userId, recoveryCodes)

  await db
    .update(users)
    .set({
      twoFactorEnabled: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return { success: true, recoveryCodes }
}

export async function disableTwoFactor(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorRecoveryCodes: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

// Generate 10 recovery codes for 2FA backup
export function generateRecoveryCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric codes in format XXXX-XXXX
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase()
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase()
    codes.push(`${part1}-${part2}`)
  }
  return codes
}

// Save recovery codes (encrypted) - called when 2FA is enabled
export async function saveRecoveryCodes(
  userId: string,
  codes: string[],
): Promise<void> {
  // Hash each code before storing (so we can verify without exposing them)
  const hashedCodes = await Promise.all(
    codes.map(async (code) => {
      const hash = crypto.createHash('sha256').update(code).digest('hex')
      return hash
    }),
  )

  const encryptedCodes = encrypt(JSON.stringify(hashedCodes))

  await db
    .update(users)
    .set({
      twoFactorRecoveryCodes: encryptedCodes,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

// Verify and use a recovery code (one-time use)
export async function verifyRecoveryCode(
  userId: string,
  code: string,
): Promise<boolean> {
  const user = await findUserById(userId)
  if (!user || !user.twoFactorRecoveryCodes) return false

  try {
    const decryptedCodes = decrypt(user.twoFactorRecoveryCodes)
    const hashedCodes: string[] = JSON.parse(decryptedCodes)

    // Hash the provided code
    const providedHash = crypto
      .createHash('sha256')
      .update(code.toUpperCase())
      .digest('hex')

    // Find and remove the used code
    const codeIndex = hashedCodes.findIndex((hash) => hash === providedHash)
    if (codeIndex === -1) return false

    // Remove the used code
    hashedCodes.splice(codeIndex, 1)

    // Save remaining codes
    const encryptedCodes = encrypt(JSON.stringify(hashedCodes))
    await db
      .update(users)
      .set({
        twoFactorRecoveryCodes: encryptedCodes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return true
  } catch {
    return false
  }
}

// Get remaining recovery codes count
export async function getRecoveryCodesCount(userId: string): Promise<number> {
  const user = await findUserById(userId)
  if (!user || !user.twoFactorRecoveryCodes) return 0

  try {
    const decryptedCodes = decrypt(user.twoFactorRecoveryCodes)
    const hashedCodes: string[] = JSON.parse(decryptedCodes)
    return hashedCodes.length
  } catch {
    return 0
  }
}

// Regenerate recovery codes (user can request new ones)
export async function regenerateRecoveryCodes(
  userId: string,
): Promise<string[]> {
  const codes = generateRecoveryCodes()
  await saveRecoveryCodes(userId, codes)
  return codes
}

export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const user = await findUserById(userId)
  return user?.twoFactorEnabled ?? false
}

export async function getUserWithProfile(userId: string) {
  const [result] = await db
    .select({
      user: users,
      profile: profiles,
      stats: userStats,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(userStats, eq(userStats.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  return result || null
}

export async function getUserByUsername(username: string) {
  const [result] = await db
    .select({
      user: users,
      profile: profiles,
      stats: userStats,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(userStats, eq(userStats.userId, users.id))
    .where(eq(users.username, username.toLowerCase()))
    .limit(1)

  return result || null
}

export async function updateProfile(
  userId: string,
  data: Partial<{
    bio: string
    avatar: string
    banner: string
    location: string
    website: string
    pronouns: string
    accentColor: string
    isPublic: boolean
    showActivity: boolean
    birthday: Date
    creatorTypes: string[]
    socials: Record<string, string>
  }>,
) {
  const [updated] = await db
    .update(profiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId))
    .returning()

  return updated
}

export async function updateUser(
  userId: string,
  data: Partial<{
    name: string
    username: string
  }>,
) {
  const [updated] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  return updated
}

export async function incrementProfileViews(userId: string) {
  await db
    .update(userStats)
    .set({
      profileViews: userStats.profileViews,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId))
}

export async function updateLastActive(userId: string) {
  await db
    .update(userStats)
    .set({
      lastActive: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId))
}
