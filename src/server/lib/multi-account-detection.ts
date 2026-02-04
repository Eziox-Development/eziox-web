import { db } from '@/server/db'
import {
  deviceFingerprints,
  loginHistory,
  multiAccountLinks,
  users,
} from '@/server/db/schema'
import { eq, and, ne, desc } from 'drizzle-orm'
import { logSecurityEventLegacy as logSecurityEvent } from './security-monitoring'
import crypto from 'crypto'

export interface FingerprintData {
  userAgent: string
  screenResolution?: string
  timezone?: string
  language?: string
  platform?: string
}

export interface LoginData {
  userId: string
  ipAddress: string
  userAgent?: string
  loginMethod: 'password' | 'otp' | 'passkey' | 'discord'
  success: boolean
  failureReason?: string
  country?: string
  city?: string
  fingerprintData?: FingerprintData
}

export interface MultiAccountMatch {
  linkedUserId: string
  linkedUsername: string
  linkType: 'ip_match' | 'fingerprint_match' | 'email_pattern'
  confidence: number
  evidence: Record<string, unknown>
}

/**
 * Generate a fingerprint hash from browser data
 */
export function generateFingerprintHash(data: FingerprintData): string {
  const components = [
    data.userAgent || '',
    data.screenResolution || '',
    data.timezone || '',
    data.language || '',
    data.platform || '',
  ].join('|')

  return crypto.createHash('sha256').update(components).digest('hex')
}

/**
 * Anonymize IP address for GDPR compliance
 */
export function anonymizeIp(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + process.env.AUTH_SECRET)
    .digest('hex')
}

/**
 * Record a login attempt
 */
export async function recordLogin(data: LoginData): Promise<void> {
  try {
    let fingerprintId: string | undefined

    // Store fingerprint if provided
    if (data.fingerprintData) {
      const hash = generateFingerprintHash(data.fingerprintData)

      // Check if fingerprint exists for this user
      const [existing] = await db
        .select({ id: deviceFingerprints.id })
        .from(deviceFingerprints)
        .where(
          and(
            eq(deviceFingerprints.fingerprintHash, hash),
            eq(deviceFingerprints.userId, data.userId),
          ),
        )
        .limit(1)

      if (existing) {
        fingerprintId = existing.id
        // Update last seen
        await db
          .update(deviceFingerprints)
          .set({ lastSeenAt: new Date() })
          .where(eq(deviceFingerprints.id, existing.id))
      } else {
        // Create new fingerprint
        const [newFp] = await db
          .insert(deviceFingerprints)
          .values({
            fingerprintHash: hash,
            userId: data.userId,
            userAgent: data.fingerprintData.userAgent,
            screenResolution: data.fingerprintData.screenResolution,
            timezone: data.fingerprintData.timezone,
            language: data.fingerprintData.language,
            platform: data.fingerprintData.platform,
          })
          .returning({ id: deviceFingerprints.id })

        fingerprintId = newFp?.id
      }
    }

    // Record login
    await db.insert(loginHistory).values({
      userId: data.userId,
      ipAddress: data.ipAddress,
      ipHash: anonymizeIp(data.ipAddress),
      userAgent: data.userAgent,
      fingerprintId,
      loginMethod: data.loginMethod,
      success: data.success,
      failureReason: data.failureReason,
      country: data.country,
      city: data.city,
    })

    // Check for multi-account indicators if login was successful
    if (data.success) {
      await detectMultiAccounts(data.userId, data.ipAddress, fingerprintId)
    }
  } catch {
    // Silently fail - don't block login for tracking failure
  }
}

/**
 * Detect potential multi-account usage
 */
async function detectMultiAccounts(
  userId: string,
  ipAddress: string,
  fingerprintId?: string,
): Promise<void> {
  const matches: MultiAccountMatch[] = []

  // Check for IP matches (same IP used by different accounts)
  const ipMatches = await db
    .select({
      userId: loginHistory.userId,
      username: users.username,
    })
    .from(loginHistory)
    .innerJoin(users, eq(loginHistory.userId, users.id))
    .where(
      and(
        eq(loginHistory.ipAddress, ipAddress),
        ne(loginHistory.userId, userId),
        eq(loginHistory.success, true),
      ),
    )
    .groupBy(loginHistory.userId, users.username)
    .limit(10)

  for (const match of ipMatches) {
    // Count how many times this IP was used by the other account
    const [countResult] = await db
      .select({ count: loginHistory.id })
      .from(loginHistory)
      .where(
        and(
          eq(loginHistory.ipAddress, ipAddress),
          eq(loginHistory.userId, match.userId),
        ),
      )

    const loginCount = countResult ? 1 : 0 // Simplified count
    const confidence = Math.min(30 + loginCount * 10, 80) // 30-80% based on frequency

    matches.push({
      linkedUserId: match.userId,
      linkedUsername: match.username,
      linkType: 'ip_match',
      confidence,
      evidence: {
        sharedIp: anonymizeIp(ipAddress), // Store anonymized
        loginCount,
      },
    })
  }

  // Check for fingerprint matches
  if (fingerprintId) {
    const [fingerprint] = await db
      .select({ hash: deviceFingerprints.fingerprintHash })
      .from(deviceFingerprints)
      .where(eq(deviceFingerprints.id, fingerprintId))
      .limit(1)

    if (fingerprint) {
      const fpMatches = await db
        .select({
          userId: deviceFingerprints.userId,
          username: users.username,
        })
        .from(deviceFingerprints)
        .innerJoin(users, eq(deviceFingerprints.userId, users.id))
        .where(
          and(
            eq(deviceFingerprints.fingerprintHash, fingerprint.hash),
            ne(deviceFingerprints.userId, userId),
          ),
        )
        .groupBy(deviceFingerprints.userId, users.username)
        .limit(10)

      for (const match of fpMatches) {
        // Fingerprint matches are higher confidence
        matches.push({
          linkedUserId: match.userId,
          linkedUsername: match.username,
          linkType: 'fingerprint_match',
          confidence: 85,
          evidence: {
            fingerprintHash: fingerprint.hash.substring(0, 16) + '...', // Partial for privacy
          },
        })
      }
    }
  }

  // Store detected links
  for (const match of matches) {
    // Check if link already exists
    const [existing] = await db
      .select({ id: multiAccountLinks.id })
      .from(multiAccountLinks)
      .where(
        and(
          eq(multiAccountLinks.primaryUserId, userId),
          eq(multiAccountLinks.linkedUserId, match.linkedUserId),
          eq(multiAccountLinks.linkType, match.linkType),
        ),
      )
      .limit(1)

    if (!existing) {
      await db.insert(multiAccountLinks).values({
        primaryUserId: userId,
        linkedUserId: match.linkedUserId,
        linkType: match.linkType,
        confidence: match.confidence,
        evidence: match.evidence,
        status: 'detected',
      })

      // Log security event for high confidence matches
      if (match.confidence >= 70) {
        logSecurityEvent('account.multi_account_detected', {
          userId,
          details: {
            linkedUserId: match.linkedUserId,
            linkType: match.linkType,
            confidence: match.confidence,
          },
        })
      }
    }
  }
}

/**
 * Get multi-account links for a user
 */
export async function getMultiAccountLinks(userId: string): Promise<{
  links: Array<{
    id: string
    linkedUserId: string
    linkedUsername: string
    linkType: string
    confidence: number
    status: string | null
    createdAt: Date
  }>
}> {
  try {
    const links = await db
      .select({
        id: multiAccountLinks.id,
        linkedUserId: multiAccountLinks.linkedUserId,
        linkedUsername: users.username,
        linkType: multiAccountLinks.linkType,
        confidence: multiAccountLinks.confidence,
        status: multiAccountLinks.status,
        createdAt: multiAccountLinks.createdAt,
      })
      .from(multiAccountLinks)
      .innerJoin(users, eq(multiAccountLinks.linkedUserId, users.id))
      .where(eq(multiAccountLinks.primaryUserId, userId))
      .orderBy(desc(multiAccountLinks.confidence))

    return { links }
  } catch {
    return { links: [] }
  }
}

/**
 * Update multi-account link status (for admin review)
 */
export async function updateMultiAccountStatus(
  linkId: string,
  reviewedBy: string,
  status: 'confirmed' | 'allowed' | 'false_positive',
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const [updated] = await db
      .update(multiAccountLinks)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes: notes,
      })
      .where(eq(multiAccountLinks.id, linkId))
      .returning()

    if (!updated) {
      return { success: false, error: 'Link not found' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update status' }
  }
}

/**
 * Get all detected multi-account links (for admin)
 */
export async function getAllMultiAccountLinks(status?: string): Promise<{
  links: Array<{
    id: string
    primaryUserId: string
    primaryUsername: string
    linkedUserId: string
    linkedUsername: string
    linkType: string
    confidence: number
    status: string | null
    createdAt: Date
  }>
}> {
  try {
    // This is a simplified query - in production you'd want proper joins
    const baseLinks = await db
      .select({
        id: multiAccountLinks.id,
        primaryUserId: multiAccountLinks.primaryUserId,
        linkedUserId: multiAccountLinks.linkedUserId,
        linkType: multiAccountLinks.linkType,
        confidence: multiAccountLinks.confidence,
        status: multiAccountLinks.status,
        createdAt: multiAccountLinks.createdAt,
      })
      .from(multiAccountLinks)
      .where(status ? eq(multiAccountLinks.status, status) : undefined)
      .orderBy(desc(multiAccountLinks.confidence))
      .limit(100)

    // Fetch usernames separately
    const userIds = [
      ...new Set([
        ...baseLinks.map((l) => l.primaryUserId),
        ...baseLinks.map((l) => l.linkedUserId),
      ]),
    ]

    const userMap = new Map<string, string>()
    if (userIds.length > 0) {
      // Fetch users one by one (simplified - would use inArray in production)
      for (const uid of userIds.slice(0, 20)) {
        const [userData] = await db
          .select({ id: users.id, username: users.username })
          .from(users)
          .where(eq(users.id, uid))
          .limit(1)
        if (userData) {
          userMap.set(userData.id, userData.username)
        }
      }
    }

    const links = baseLinks.map((link) => ({
      ...link,
      primaryUsername: userMap.get(link.primaryUserId) || 'Unknown',
      linkedUsername: userMap.get(link.linkedUserId) || 'Unknown',
    }))

    return { links }
  } catch {
    return { links: [] }
  }
}
