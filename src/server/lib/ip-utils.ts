/**
 * IP Address Utilities
 * GDPR-compliant IP handling with anonymization options
 *
 * GDPR Compliance Notes:
 * - IP addresses are considered personal data under GDPR
 * - We anonymize IPs by zeroing the last octet (IPv4) or last 80 bits (IPv6)
 * - This makes the IP non-identifiable while preserving geographic usefulness
 * - For sessions, we store a hash for security purposes (detecting session hijacking)
 * - Full IPs are never stored long-term
 */

import { createHash } from 'crypto'

/**
 * Anonymize an IPv4 address by zeroing the last octet
 * e.g., "192.168.1.100" -> "192.168.1.0"
 * This preserves /24 subnet info (useful for geo) while anonymizing the user
 */
export function anonymizeIPv4(ip: string): string {
  const parts = ip.split('.')
  if (parts.length !== 4) return ip
  parts[3] = '0'
  return parts.join('.')
}

/**
 * Anonymize an IPv6 address by zeroing the last 80 bits (last 5 groups)
 * e.g., "2001:0db8:85a3:0000:0000:8a2e:0370:7334" -> "2001:0db8:85a3::"
 * This follows Google Analytics' approach for GDPR compliance
 */
export function anonymizeIPv6(ip: string): string {
  // Handle IPv4-mapped IPv6 addresses (::ffff:192.168.1.1)
  if (ip.includes('::ffff:')) {
    const ipv4Part = ip.split('::ffff:')[1]
    if (ipv4Part) {
      return '::ffff:' + anonymizeIPv4(ipv4Part)
    }
  }

  // Expand abbreviated IPv6 and zero last 5 groups
  const parts = ip.split(':')
  if (parts.length < 3) return ip

  // Keep first 3 groups, zero the rest
  const anonymized = parts.slice(0, 3).join(':') + '::'
  return anonymized
}

/**
 * Detect if an IP is IPv4 or IPv6 and anonymize accordingly
 */
export function anonymizeIP(ip: string | null | undefined): string {
  if (!ip || ip === 'unknown') return 'unknown'

  // Clean the IP
  const cleanIP = ip.trim()

  // Check for localhost/loopback
  if (cleanIP === '127.0.0.1' || cleanIP === '::1' || cleanIP === 'localhost') {
    return 'localhost'
  }

  // IPv6
  if (cleanIP.includes(':')) {
    return anonymizeIPv6(cleanIP)
  }

  // IPv4
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanIP)) {
    return anonymizeIPv4(cleanIP)
  }

  return 'unknown'
}

/**
 * Create a secure hash of the IP for session security purposes
 * This allows detecting session hijacking without storing the actual IP
 * Uses SHA-256 with a salt for security
 */
export function hashIP(ip: string | null | undefined, salt?: string): string {
  if (!ip || ip === 'unknown') return 'unknown'

  const effectiveSalt = salt || process.env.ENCRYPTION_KEY || 'eziox-ip-salt'
  const hash = createHash('sha256')
    .update(ip + effectiveSalt)
    .digest('hex')

  // Return first 16 chars for a shorter but still secure hash
  return hash.substring(0, 16)
}

/**
 * Extract the real client IP from various proxy headers
 * Handles Cloudflare, Vercel, nginx, and standard proxies
 */
export function extractClientIP(headers: {
  'cf-connecting-ip'?: string
  'x-real-ip'?: string
  'x-forwarded-for'?: string
  'x-vercel-forwarded-for'?: string
  [key: string]: string | undefined
}): string {
  // Cloudflare (most reliable when using CF)
  if (headers['cf-connecting-ip']) {
    return headers['cf-connecting-ip']
  }

  // Vercel
  if (headers['x-vercel-forwarded-for']) {
    const ips = headers['x-vercel-forwarded-for'].split(',')
    return ips[0]?.trim() || 'unknown'
  }

  // Standard proxy header
  if (headers['x-forwarded-for']) {
    const ips = headers['x-forwarded-for'].split(',')
    return ips[0]?.trim() || 'unknown'
  }

  // nginx real IP
  if (headers['x-real-ip']) {
    return headers['x-real-ip']
  }

  return 'unknown'
}

/**
 * Check if an IP is a known private/internal IP
 */
export function isPrivateIP(ip: string): boolean {
  if (!ip || ip === 'unknown') return false

  // IPv4 private ranges
  const privateRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // 127.0.0.0/8 (loopback)
    /^169\.254\./, // 169.254.0.0/16 (link-local)
  ]

  // IPv6 private/special ranges
  const ipv6Private = [
    /^::1$/, // Loopback
    /^fe80:/i, // Link-local
    /^fc00:/i, // Unique local
    /^fd00:/i, // Unique local
  ]

  if (ip.includes(':')) {
    return ipv6Private.some((pattern) => pattern.test(ip))
  }

  return privateRanges.some((pattern) => pattern.test(ip))
}

/**
 * Get a display-safe version of the IP
 * Shows partial IP for user display (e.g., "192.168.x.x")
 */
export function maskIP(ip: string | null | undefined): string {
  if (!ip || ip === 'unknown') return 'Unknown'
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1')
    return 'Localhost'

  // IPv4: show first two octets
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    const parts = ip.split('.')
    return `${parts[0]}.${parts[1]}.x.x`
  }

  // IPv6: show first group
  if (ip.includes(':')) {
    const parts = ip.split(':')
    return `${parts[0]}:****`
  }

  return 'Unknown'
}

export interface IPInfo {
  raw: string
  anonymized: string
  hash: string
  masked: string
  isPrivate: boolean
}

/**
 * Get comprehensive IP info with all formats
 */
export function getIPInfo(ip: string | null | undefined): IPInfo {
  const rawIP = ip || 'unknown'
  return {
    raw: rawIP,
    anonymized: anonymizeIP(rawIP),
    hash: hashIP(rawIP),
    masked: maskIP(rawIP),
    isPrivate: isPrivateIP(rawIP),
  }
}
