/**
 * Authentication Library
 * JWT-based auth with bcrypt password hashing
 */

import bcrypt from 'bcryptjs'
import { db } from '../db'
import { users, profiles, userStats, sessions } from '../db/schema'
import { eq, and, gt } from 'drizzle-orm'

const SESSION_EXPIRY_DAYS = 7

// ============================================================================
// Password Hashing
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================================================
// Session Token Generation
// ============================================================================

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// ============================================================================
// User Management
// ============================================================================

export async function createUser(data: {
  email: string
  password: string
  username: string
  name?: string
}) {
  const passwordHash = await hashPassword(data.password)

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      passwordHash,
      name: data.name || data.username,
      role: data.email.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase() ? 'owner' : 'user',
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
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  return user || null
}

// ============================================================================
// Session Management
// ============================================================================

export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
) {
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    })
    .returning()

  return session
}

export async function validateSession(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      )
    )
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

// ============================================================================
// Profile Management
// ============================================================================

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
  }>
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
  }>
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

// ============================================================================
// Stats Management
// ============================================================================

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
