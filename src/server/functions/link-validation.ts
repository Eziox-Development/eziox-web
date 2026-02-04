/**
 * Link Validation Server Functions
 * API endpoints for URL validation, reachability checks, and link previews
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { validateSession } from '../lib/auth'
import { checkRateLimit } from '@/lib/security'
import {
  normalizeUrl,
  isValidUrlFormat,
  checkReachability,
  checkGoogleSafeBrowsing,
  generateLinkPreview,
  validateLinkComprehensive,
  type ComprehensiveValidationResult,
  type LinkPreview,
  type ReachabilityResult,
  type SafeBrowsingResult,
} from '../lib/link-validation'

// ============================================================================
// Validate URL Format
// ============================================================================

export const validateUrlFormatFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      url: z.string().min(1).max(2048),
    }),
  )
  .handler(async ({ data }) => {
    const normalized = normalizeUrl(data.url)
    const formatValidation = isValidUrlFormat(data.url)

    return {
      original: data.url,
      normalized: normalized.normalized,
      isValid: formatValidation.valid,
      error: formatValidation.error,
      details: {
        protocol: normalized.protocol,
        hostname: normalized.hostname,
        pathname: normalized.pathname,
      },
    }
  })

// ============================================================================
// Check URL Reachability (Authenticated)
// ============================================================================

export const checkUrlReachabilityFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      url: z.string().min(1).max(2048),
      timeout: z.number().min(1000).max(30000).optional(),
    }),
  )
  .handler(async ({ data }): Promise<ReachabilityResult & { url: string }> => {
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

    // Rate limit: 20 checks per minute
    const rateLimitResult = checkRateLimit(
      `reachability-check:${user.id}`,
      20,
      60000,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many requests. Please wait before checking more URLs.',
        status: 429,
      }
    }

    const result = await checkReachability(data.url, {
      timeout: data.timeout || 10000,
    })

    return {
      url: data.url,
      ...result,
    }
  })

// ============================================================================
// Check URL Safety (Malware Scan) - Authenticated
// ============================================================================

export const checkUrlSafetyFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      url: z.string().min(1).max(2048),
    }),
  )
  .handler(async ({ data }): Promise<SafeBrowsingResult & { url: string }> => {
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

    // Rate limit: 30 checks per minute
    const rateLimitResult = checkRateLimit(
      `safety-check:${user.id}`,
      30,
      60000,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many requests. Please wait before checking more URLs.',
        status: 429,
      }
    }

    const result = await checkGoogleSafeBrowsing(data.url)

    return {
      url: data.url,
      ...result,
    }
  })

// ============================================================================
// Generate Link Preview - Authenticated
// ============================================================================

export const generateLinkPreviewFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      url: z.string().min(1).max(2048),
      timeout: z.number().min(1000).max(30000).optional(),
    }),
  )
  .handler(async ({ data }): Promise<LinkPreview> => {
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

    // Rate limit: 15 previews per minute (more expensive operation)
    const rateLimitResult = checkRateLimit(
      `link-preview:${user.id}`,
      15,
      60000,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many requests. Please wait before generating more previews.',
        status: 429,
      }
    }

    const result = await generateLinkPreview(data.url, {
      timeout: data.timeout || 10000,
    })

    return result
  })

// ============================================================================
// Comprehensive Link Validation - Authenticated
// ============================================================================

export const validateLinkComprehensiveFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      url: z.string().min(1).max(2048),
      checkReachability: z.boolean().optional(),
      checkSafeBrowsing: z.boolean().optional(),
      generatePreview: z.boolean().optional(),
      timeout: z.number().min(1000).max(30000).optional(),
    }),
  )
  .handler(async ({ data }): Promise<ComprehensiveValidationResult> => {
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

    // Rate limit: 10 comprehensive checks per minute
    const rateLimitResult = checkRateLimit(
      `comprehensive-validation:${user.id}`,
      10,
      60000,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many requests. Please wait before validating more URLs.',
        status: 429,
      }
    }

    const result = await validateLinkComprehensive(data.url, {
      checkReachability: data.checkReachability ?? true,
      checkSafeBrowsing: data.checkSafeBrowsing ?? true,
      generatePreview: data.generatePreview ?? false,
      timeout: data.timeout || 10000,
    })

    return result
  })

// ============================================================================
// Batch URL Validation - Authenticated (Premium Feature)
// ============================================================================

export const validateUrlsBatchFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      urls: z.array(z.string().min(1).max(2048)).min(1).max(10),
      checkReachability: z.boolean().optional(),
      checkSafeBrowsing: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ results: ComprehensiveValidationResult[] }> => {
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

    // Only premium users can batch validate
    if (user.tier === 'free') {
      setResponseStatus(403)
      throw {
        message: 'Batch validation is a premium feature. Please upgrade your plan.',
        status: 403,
      }
    }

    // Rate limit: 5 batch requests per minute
    const rateLimitResult = checkRateLimit(
      `batch-validation:${user.id}`,
      5,
      60000,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many requests. Please wait before validating more URLs.',
        status: 429,
      }
    }

    // Validate all URLs in parallel
    const results = await Promise.all(
      data.urls.map((url) =>
        validateLinkComprehensive(url, {
          checkReachability: data.checkReachability ?? true,
          checkSafeBrowsing: data.checkSafeBrowsing ?? true,
          generatePreview: false,
          timeout: 8000, // Shorter timeout for batch
        })
      )
    )

    return { results }
  })

// ============================================================================
// Quick URL Check (Public - for form validation)
// ============================================================================

export const quickUrlCheckFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      url: z.string().min(1).max(2048),
    }),
  )
  .handler(async ({ data }) => {
    // Basic rate limiting by IP would be ideal here
    // For now, just do format validation and local blocklist check

    const normalized = normalizeUrl(data.url)
    const formatValidation = isValidUrlFormat(data.url)

    if (!formatValidation.valid) {
      return {
        valid: false,
        error: formatValidation.error,
        normalized: null,
      }
    }

    // Quick local blocklist check (no external API calls)
    const { checkLocalBlocklist } = await import('../lib/link-validation')
    const safetyCheck = checkLocalBlocklist(data.url)

    if (!safetyCheck.safe) {
      return {
        valid: false,
        error: 'URL flagged as potentially unsafe',
        threats: safetyCheck.threats,
        normalized: null,
      }
    }

    return {
      valid: true,
      normalized: normalized.normalized,
      hostname: normalized.hostname,
    }
  })
