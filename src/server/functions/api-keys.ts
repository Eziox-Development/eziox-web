/**
 * API Key Management Functions
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import { apiKeys, apiRequestLogs } from '../db/schema'
import { eq, and, desc, sql, gte } from 'drizzle-orm'
import { getCurrentUser } from './auth'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export interface ApiKeyPermissions {
  profile: {
    read: boolean
    write: boolean
  }
  links: {
    read: boolean
    write: boolean
    delete: boolean
  }
  analytics: {
    read: boolean
  }
  templates: {
    read: boolean
    apply: boolean
  }
}

const DEFAULT_PERMISSIONS: ApiKeyPermissions = {
  profile: { read: true, write: false },
  links: { read: true, write: false, delete: false },
  analytics: { read: false },
  templates: { read: true, apply: false },
}

/**
 * Generate a secure API key
 */
function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomBytes = crypto.randomBytes(32)
  const key = `ezx_${randomBytes.toString('hex')}`
  const prefix = key.substring(0, 12)
  const hash = bcrypt.hashSync(key, 10)

  return { key, prefix, hash }
}

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z
    .object({
      profile: z.object({ read: z.boolean(), write: z.boolean() }).optional(),
      links: z
        .object({ read: z.boolean(), write: z.boolean(), delete: z.boolean() })
        .optional(),
      analytics: z.object({ read: z.boolean() }).optional(),
      templates: z.object({ read: z.boolean(), apply: z.boolean() }).optional(),
    })
    .optional(),
  rateLimit: z.number().optional(),
  expiresInDays: z.number().optional(),
})

const updateApiKeySchema = z.object({
  keyId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  permissions: z
    .object({
      profile: z.object({ read: z.boolean(), write: z.boolean() }).optional(),
      links: z
        .object({ read: z.boolean(), write: z.boolean(), delete: z.boolean() })
        .optional(),
      analytics: z.object({ read: z.boolean() }).optional(),
      templates: z.object({ read: z.boolean(), apply: z.boolean() }).optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
})

const deleteApiKeySchema = z.object({
  keyId: z.string().uuid(),
})

const getApiKeyStatsSchema = z.object({
  keyId: z.string().uuid(),
  days: z.number().optional(),
})

/**
 * Get user's API keys
 */
export const getApiKeysFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        permissions: apiKeys.permissions,
        rateLimit: apiKeys.rateLimit,
        rateLimitWindow: apiKeys.rateLimitWindow,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        isActive: apiKeys.isActive,
        requestCount: apiKeys.requestCount,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, user.id))
      .orderBy(desc(apiKeys.createdAt))

    return { keys: keys as ApiKeyResponse[] }
  },
)

interface ApiKeyResponse {
  id: string
  name: string
  keyPrefix: string
  permissions: ApiKeyPermissions
  rateLimit: number | null
  rateLimitWindow: number | null
  lastUsedAt: Date | null
  expiresAt: Date | null
  isActive: boolean
  requestCount: number | null
  createdAt: Date
}

/**
 * Create new API key
 */
export const createApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(createApiKeySchema)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Check tier limits
    const existingKeys = await db
      .select({ count: sql<number>`count(*)` })
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, user.id), eq(apiKeys.isActive, true)))

    const keyLimit =
      user.tier === 'lifetime' || user.tier === 'creator'
        ? 10
        : user.tier === 'pro'
          ? 5
          : 2

    if (Number(existingKeys[0]?.count || 0) >= keyLimit) {
      throw new Error(
        `API key limit reached. Your ${user.tier} tier allows ${keyLimit} active keys.`,
      )
    }

    // Generate API key
    const { key, prefix, hash } = generateApiKey()

    // Merge permissions with defaults
    const permissions: ApiKeyPermissions = {
      ...DEFAULT_PERMISSIONS,
      ...data.permissions,
    }

    // Calculate expiration
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : null

    // Set rate limit based on tier
    const rateLimit =
      data.rateLimit ||
      (user.tier === 'lifetime' || user.tier === 'creator'
        ? 10000
        : user.tier === 'pro'
          ? 5000
          : 1000)

    // Insert API key
    const [newKey] = await db
      .insert(apiKeys)
      .values({
        userId: user.id,
        name: data.name,
        keyHash: hash,
        keyPrefix: prefix,
        permissions: permissions as unknown as Record<string, unknown>,
        rateLimit,
        rateLimitWindow: 3600, // 1 hour
        expiresAt,
      })
      .returning()

    if (!newKey) {
      throw new Error('Failed to create API key')
    }

    return {
      apiKey: {
        id: newKey.id,
        name: newKey.name,
        key, // Only returned once!
        keyPrefix: newKey.keyPrefix,
        permissions: newKey.permissions as ApiKeyPermissions,
        rateLimit: newKey.rateLimit,
        expiresAt: newKey.expiresAt,
        createdAt: newKey.createdAt,
      },
    }
  })

/**
 * Update API key
 */
export const updateApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(updateApiKeySchema)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Verify ownership
    const [existingKey] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, data.keyId), eq(apiKeys.userId, user.id)))

    if (!existingKey) {
      throw new Error('API key not found')
    }

    // Update key
    const updates: Partial<typeof apiKeys.$inferInsert> = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.isActive !== undefined) updates.isActive = data.isActive
    if (data.permissions !== undefined) {
      updates.permissions = {
        ...(existingKey.permissions as ApiKeyPermissions),
        ...data.permissions,
      } as unknown as Record<string, unknown>
    }
    updates.updatedAt = new Date()

    const [updatedKey] = await db
      .update(apiKeys)
      .set(updates)
      .where(eq(apiKeys.id, data.keyId))
      .returning()

    return {
      apiKey: updatedKey
        ? {
            ...updatedKey,
            permissions: updatedKey.permissions as ApiKeyPermissions,
          }
        : undefined,
    }
  })

/**
 * Delete API key
 */
export const deleteApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteApiKeySchema)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Verify ownership and delete
    const result = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, data.keyId), eq(apiKeys.userId, user.id)))
      .returning()

    if (result.length === 0) {
      throw new Error('API key not found')
    }

    return { success: true }
  })

/**
 * Get API key usage statistics
 */
export const getApiKeyStatsFn = createServerFn({ method: 'POST' })
  .inputValidator(getApiKeyStatsSchema)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Verify ownership
    const [key] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, data.keyId), eq(apiKeys.userId, user.id)))

    if (!key) {
      throw new Error('API key not found')
    }

    const days = data.days || 7
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get request logs
    const logs = await db
      .select({
        endpoint: apiRequestLogs.endpoint,
        method: apiRequestLogs.method,
        statusCode: apiRequestLogs.statusCode,
        responseTime: apiRequestLogs.responseTime,
        createdAt: apiRequestLogs.createdAt,
      })
      .from(apiRequestLogs)
      .where(
        and(
          eq(apiRequestLogs.apiKeyId, data.keyId),
          gte(apiRequestLogs.createdAt, startDate),
        ),
      )
      .orderBy(desc(apiRequestLogs.createdAt))
      .limit(100)

    // Calculate statistics
    const totalRequests = logs.length
    const successfulRequests = logs.filter((l) => l.statusCode < 400).length
    const failedRequests = totalRequests - successfulRequests
    const avgResponseTime =
      logs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / totalRequests ||
      0

    // Group by endpoint
    const endpointStats = logs.reduce(
      (acc, log) => {
        const endpoint = log.endpoint
        if (!acc[endpoint]) {
          acc[endpoint] = { count: 0, errors: 0 }
        }
        acc[endpoint].count++
        if (log.statusCode >= 400) {
          acc[endpoint].errors++
        }
        return acc
      },
      {} as Record<string, { count: number; errors: number }>,
    )

    return {
      stats: {
        totalRequests,
        successfulRequests,
        failedRequests,
        avgResponseTime: Math.round(avgResponseTime),
        endpointStats,
        recentLogs: logs.slice(0, 20),
      },
    }
  })

/**
 * Validate API key (for middleware use)
 */
export async function validateApiKey(
  key: string,
): Promise<{
  valid: boolean
  apiKey?: typeof apiKeys.$inferSelect
  error?: string
}> {
  try {
    // Extract prefix
    const prefix = key.substring(0, 12)

    // Find keys with matching prefix
    const keys = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyPrefix, prefix), eq(apiKeys.isActive, true)))

    // Check each key (should only be one, but be safe)
    for (const apiKey of keys) {
      const isValid = bcrypt.compareSync(key, apiKey.keyHash)
      if (isValid) {
        // Check expiration
        if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
          return { valid: false, error: 'API key expired' }
        }

        // Check rate limit
        const windowStart = new Date(
          Date.now() - (apiKey.rateLimitWindow || 3600) * 1000,
        )
        const recentRequests = await db
          .select({ count: sql<number>`count(*)` })
          .from(apiRequestLogs)
          .where(
            and(
              eq(apiRequestLogs.apiKeyId, apiKey.id),
              gte(apiRequestLogs.createdAt, windowStart),
            ),
          )

        const requestCount = Number(recentRequests[0]?.count || 0)
        if (requestCount >= (apiKey.rateLimit || 1000)) {
          return { valid: false, error: 'Rate limit exceeded' }
        }

        // Update last used
        await db
          .update(apiKeys)
          .set({
            lastUsedAt: new Date(),
            requestCount: sql`${apiKeys.requestCount} + 1`,
          })
          .where(eq(apiKeys.id, apiKey.id))

        return { valid: true, apiKey }
      }
    }

    return { valid: false, error: 'Invalid API key' }
  } catch (error) {
    console.error('API key validation error:', error)
    return { valid: false, error: 'Validation failed' }
  }
}

/**
 * Log API request
 */
export async function logApiRequest(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string,
): Promise<void> {
  try {
    await db.insert(apiRequestLogs).values({
      apiKeyId,
      endpoint,
      method,
      statusCode,
      responseTime,
      ipAddress,
      userAgent,
      errorMessage,
    })
  } catch (error) {
    console.error('Failed to log API request:', error)
  }
}
