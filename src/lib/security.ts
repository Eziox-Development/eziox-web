/**
 * Security Utilities
 * CSS sanitization, input validation, rate limiting helpers
 */

const DANGEROUS_PROPERTIES = [
  'behavior',
  'expression',
  '-moz-binding',
  'javascript:',
  'vbscript:',
  'data:',
  '@import',
  '@charset',
  '@namespace',
]

const DANGEROUS_PATTERNS = [
  /expression\s*\(/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /-moz-binding\s*:/gi,
  /behavior\s*:/gi,
  /url\s*\(\s*["']?\s*data:/gi,
  /url\s*\(\s*["']?\s*javascript:/gi,
  /@import/gi,
  /@charset/gi,
  /\\[0-9a-f]{1,6}/gi,
  /<\s*style/gi,
  /<\s*script/gi,
  /<\s*\/\s*style/gi,
  /\/\*/g,
]

const ALLOWED_PROPERTIES = new Set([
  // Colors & Backgrounds
  'color',
  'background',
  'background-color',
  'background-image',
  'background-size',
  'background-position',
  'background-repeat',
  'background-attachment',
  'opacity',
  'filter',

  // Typography
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-align',
  'text-decoration',
  'text-transform',
  'text-indent',
  'text-shadow',
  'white-space',
  'word-wrap',
  'word-break',
  'overflow-wrap',

  // Box Model
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'box-shadow',
  'box-sizing',

  // Layout
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'overflow',
  'overflow-x',
  'overflow-y',
  'visibility',
  'z-index',
  'flex',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'justify-content',
  'align-items',
  'align-content',
  'align-self',
  'order',
  'gap',
  'row-gap',
  'column-gap',
  'grid',
  'grid-template',
  'grid-template-columns',
  'grid-template-rows',
  'grid-column',
  'grid-row',
  'grid-area',
  'grid-gap',

  // Transforms & Animations
  'transform',
  'transform-origin',
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  'animation',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',

  // Other
  'cursor',
  'outline',
  'outline-width',
  'outline-style',
  'outline-color',
  'list-style',
  'list-style-type',
  'list-style-position',
  'list-style-image',
  'table-layout',
  'border-collapse',
  'border-spacing',
  'vertical-align',
  'clip-path',
  'object-fit',
  'object-position',
  'backdrop-filter',
  'mix-blend-mode',
  'isolation',

  // CSS Variables (custom properties)
  '--background',
  '--foreground',
  '--primary',
  '--accent',
  '--border',
  '--card',
])

/**
 * Sanitize CSS to prevent XSS attacks
 * Uses both blacklist (dangerous patterns) and whitelist (allowed properties)
 */
export function sanitizeCSS(css: string): string {
  if (!css || typeof css !== 'string') return ''

  // Remove null bytes and other control characters
  let sanitized = css.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      console.warn(
        '[Security] Dangerous CSS pattern detected and removed:',
        pattern,
      )
      sanitized = sanitized.replace(pattern, '/* blocked */')
    }
  }

  // Check for dangerous properties
  for (const prop of DANGEROUS_PROPERTIES) {
    const regex = new RegExp(prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    if (regex.test(sanitized)) {
      console.warn('[Security] Dangerous CSS property detected:', prop)
      sanitized = sanitized.replace(regex, '/* blocked */')
    }
  }

  const MAX_CSS_LENGTH = 50000
  if (sanitized.length > MAX_CSS_LENGTH) {
    console.warn('[Security] CSS too long, truncating')
    sanitized = sanitized.substring(0, MAX_CSS_LENGTH)
  }

  return sanitized
}

/**
 * Strict CSS sanitization using whitelist approach
 * Only allows known-safe properties
 */
export function sanitizeCSSStrict(css: string): string {
  if (!css || typeof css !== 'string') return ''

  const sanitized = sanitizeCSS(css)

  // Parse and rebuild CSS with only allowed properties
  const lines = sanitized.split(/[;\n]/)
  const safeParts: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('/*')) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const property = trimmed.substring(0, colonIndex).trim().toLowerCase()
    const value = trimmed.substring(colonIndex + 1).trim()

    // Check if property is allowed or is a CSS variable
    if (ALLOWED_PROPERTIES.has(property) || property.startsWith('--')) {
      if (!DANGEROUS_PATTERNS.some((p) => p.test(value))) {
        safeParts.push(`${property}: ${value}`)
      }
    }
  }

  return safeParts.join(';\n')
}

const ALLOWED_URL_PROTOCOLS = ['http:', 'https:']
const ALLOWED_FONT_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'use.typekit.net',
  'fonts.bunny.net',
]

/**
 * Validate and sanitize URLs
 */
export function sanitizeURL(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  try {
    const parsed = new URL(url)

    // Only allow http/https
    if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
      console.warn('[Security] Invalid URL protocol:', parsed.protocol)
      return null
    }

    return parsed.href
  } catch {
    return null
  }
}

/**
 * Validate font URLs (allow trusted font providers and local /assets/fonts/ paths)
 */
export function sanitizeFontURL(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  // Allow local self-hosted font paths
  if (/^\/assets\/fonts\/[a-zA-Z0-9_\-/,. ()]+\.(ttf|woff2?|otf)$/.test(url)) {
    return url
  }

  const sanitized = sanitizeURL(url)
  if (!sanitized) return null

  try {
    const parsed = new URL(sanitized)
    if (!ALLOWED_FONT_DOMAINS.includes(parsed.hostname)) {
      console.warn(
        '[Security] Font URL from untrusted domain:',
        parsed.hostname,
      )
      return null
    }
    return sanitized
  } catch {
    return null
  }
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/
const RGB_COLOR_REGEX =
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+))?\s*\)$/
const HSL_COLOR_REGEX =
  /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*(0|1|0?\.\d+))?\s*\)$/

/**
 * Validate color values
 */
export function isValidColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false
  const trimmed = color.trim().toLowerCase()
  return (
    HEX_COLOR_REGEX.test(trimmed) ||
    RGB_COLOR_REGEX.test(trimmed) ||
    HSL_COLOR_REGEX.test(trimmed)
  )
}

/**
 * Sanitize hex color (ensure it's a valid hex)
 */
export function sanitizeHexColor(color: string, fallback = '#000000'): string {
  if (!color || typeof color !== 'string') return fallback
  const trimmed = color.trim()
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed : fallback
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHTML(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitize text for display (remove control characters, limit length)
 */
export function sanitizeText(text: string, maxLength = 10000): string {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .substring(0, maxLength)
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

export const RATE_LIMITS = {
  AUTH_LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  AUTH_SIGNUP: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  AUTH_PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 },
  API_UPLOAD: { maxRequests: 10, windowMs: 60 * 1000 },
  API_SPOTIFY: { maxRequests: 30, windowMs: 60 * 1000 },
  PROFILE_VIEW: { maxRequests: 1000, windowMs: 60 * 1000 },
}

interface BackoffEntry {
  failures: number
  nextRetryAt: number
}

const backoffStore = new Map<string, BackoffEntry>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of backoffStore.entries()) {
    if (entry.nextRetryAt < now && entry.failures === 0) {
      backoffStore.delete(key)
    }
  }
}, 60000)

export function checkExponentialBackoff(key: string): {
  allowed: boolean
  retryAfterMs: number
} {
  const now = Date.now()
  const entry = backoffStore.get(key)

  if (!entry) {
    return { allowed: true, retryAfterMs: 0 }
  }

  if (now < entry.nextRetryAt) {
    return { allowed: false, retryAfterMs: entry.nextRetryAt - now }
  }

  return { allowed: true, retryAfterMs: 0 }
}

export function recordFailure(
  key: string,
  baseDelayMs = 1000,
  maxDelayMs = 60 * 60 * 1000,
): void {
  const entry = backoffStore.get(key) || { failures: 0, nextRetryAt: 0 }
  entry.failures++
  const delay = Math.min(
    baseDelayMs * Math.pow(2, entry.failures - 1),
    maxDelayMs,
  )
  entry.nextRetryAt = Date.now() + delay
  backoffStore.set(key, entry)
}

export function resetBackoff(key: string): void {
  backoffStore.delete(key)
}

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://*.neon.tech wss://*.neon.tech https://challenges.cloudflare.com",
    'frame-src https://js.stripe.com https://challenges.cloudflare.com https://www.youtube.com https://open.spotify.com',
    "media-src 'self' https: blob:",
  ].join('; '),
}

// Validate username format
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username)
}

// Validate email format
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255
}

// Generate a secure random string
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => chars[byte % chars.length]).join('')
}

// ============================================================================
// CSRF Protection
// ============================================================================

const ALLOWED_ORIGINS = [
  process.env.APP_URL || 'https://eziox.link',
  process.env.APP_URL?.replace('https://', 'https://www.') ||
    'https://www.eziox.link',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
]

export function verifyOrigin(
  origin: string | null,
  referer: string | null,
): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  if (origin) {
    return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))
  }

  if (referer) {
    return ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed))
  }

  return false
}

const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of csrfTokenStore.entries()) {
    if (entry.expiresAt < now) {
      csrfTokenStore.delete(key)
    }
  }
}, 60000)

export function generateCSRFToken(sessionId: string): string {
  const token = generateSecureToken(32)
  const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour
  csrfTokenStore.set(sessionId, { token, expiresAt })
  return token
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const entry = csrfTokenStore.get(sessionId)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    csrfTokenStore.delete(sessionId)
    return false
  }
  return entry.token === token
}

// ============================================================================
// Authorization Helpers
// ============================================================================

export type UserRole = 'user' | 'admin' | 'owner'

export function canPerformAdminAction(
  role: string | null | undefined,
): boolean {
  return role === 'admin' || role === 'owner'
}

export function canPerformOwnerAction(
  role: string | null | undefined,
): boolean {
  return role === 'owner'
}

export function validateResourceOwnership(
  resourceOwnerId: string,
  requesterId: string,
  requesterRole: string | null | undefined,
): boolean {
  if (resourceOwnerId === requesterId) return true
  if (requesterRole === 'admin' || requesterRole === 'owner') return true
  return false
}

export function isValidReferralCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false
  return /^[A-Z0-9]{4,10}$/.test(code.toUpperCase())
}
