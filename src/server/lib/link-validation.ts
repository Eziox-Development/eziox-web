/**
 * Link Validation Module
 * Provides URL validation, normalization, reachability checks, and link previews
 */

// ============================================================================
// URL NORMALIZATION
// ============================================================================

export interface NormalizedUrl {
  original: string
  normalized: string
  protocol: string
  hostname: string
  pathname: string
  search: string
  hash: string
  isValid: boolean
  error?: string
}

/**
 * Normalize a URL to a consistent format
 */
export function normalizeUrl(url: string): NormalizedUrl {
  const original = url.trim()
  
  try {
    // Add protocol if missing
    let urlWithProtocol = original
    if (!urlWithProtocol.match(/^https?:\/\//i)) {
      urlWithProtocol = 'https://' + urlWithProtocol
    }
    
    const parsed = new URL(urlWithProtocol)
    
    // Normalize hostname (lowercase)
    const hostname = parsed.hostname.toLowerCase()
    
    // Remove www. prefix for consistency (optional, keep for display)
    // const hostnameWithoutWww = hostname.replace(/^www\./, '')
    
    // Normalize pathname (remove trailing slash except for root)
    let pathname = parsed.pathname
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }
    
    // Remove default ports
    let port = parsed.port
    if ((parsed.protocol === 'https:' && port === '443') ||
        (parsed.protocol === 'http:' && port === '80')) {
      port = ''
    }
    
    // Reconstruct normalized URL
    const normalized = `${parsed.protocol}//${hostname}${port ? ':' + port : ''}${pathname}${parsed.search}${parsed.hash}`
    
    return {
      original,
      normalized,
      protocol: parsed.protocol,
      hostname,
      pathname,
      search: parsed.search,
      hash: parsed.hash,
      isValid: true,
    }
  } catch {
    return {
      original,
      normalized: original,
      protocol: '',
      hostname: '',
      pathname: '',
      search: '',
      hash: '',
      isValid: false,
      error: 'Invalid URL format',
    }
  }
}

/**
 * Validate URL format strictly
 */
export function isValidUrlFormat(url: string): { valid: boolean; error?: string } {
  try {
    const normalized = normalizeUrl(url)
    if (!normalized.isValid) {
      return { valid: false, error: normalized.error }
    }
    
    const parsed = new URL(normalized.normalized)
    
    // Must be http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' }
    }
    
    // Hostname must have at least one dot (except localhost)
    if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
      return { valid: false, error: 'Invalid hostname' }
    }
    
    // Check for valid TLD (basic check)
    const parts = parsed.hostname.split('.')
    const tld = parts[parts.length - 1]
    if (tld && tld.length < 2) {
      return { valid: false, error: 'Invalid top-level domain' }
    }
    
    // Check URL length
    if (normalized.normalized.length > 2048) {
      return { valid: false, error: 'URL is too long (max 2048 characters)' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

// ============================================================================
// REACHABILITY CHECK
// ============================================================================

export interface ReachabilityResult {
  reachable: boolean
  statusCode?: number
  statusText?: string
  responseTime?: number
  redirectUrl?: string
  redirectCount?: number
  error?: string
  contentType?: string
  serverInfo?: string
}

/**
 * Check if a URL is reachable (with timeout and redirect following)
 */
export async function checkReachability(
  url: string,
  options: { timeout?: number; followRedirects?: boolean } = {}
): Promise<ReachabilityResult> {
  const { timeout = 10000, followRedirects = true } = options
  
  const normalized = normalizeUrl(url)
  if (!normalized.isValid) {
    return { reachable: false, error: normalized.error }
  }
  
  const startTime = Date.now()
  const currentUrl = normalized.normalized
  let redirectCount = 0
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(currentUrl, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: followRedirects ? 'follow' : 'manual',
      headers: {
        'User-Agent': 'Eziox-LinkValidator/1.0 (+https://eziox.link)',
        'Accept': '*/*',
      },
    })
    
    clearTimeout(timeoutId)
    
    const responseTime = Date.now() - startTime
    
    // Check for redirects
    if (response.redirected && response.url !== currentUrl) {
      redirectCount = 1 // fetch doesn't expose redirect count, estimate
    }
    
    return {
      reachable: response.ok || response.status < 400,
      statusCode: response.status,
      statusText: response.statusText,
      responseTime,
      redirectUrl: response.redirected ? response.url : undefined,
      redirectCount,
      contentType: response.headers.get('content-type') || undefined,
      serverInfo: response.headers.get('server') || undefined,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { reachable: false, error: 'Request timed out', responseTime }
      }
      return { reachable: false, error: error.message, responseTime }
    }
    
    return { reachable: false, error: 'Unknown error', responseTime }
  }
}

// ============================================================================
// MALWARE / SAFE BROWSING CHECK
// ============================================================================

export interface SafeBrowsingResult {
  safe: boolean
  threats: string[]
  checkedAt: Date
  source: 'google_safe_browsing' | 'local_blocklist' | 'unchecked'
  error?: string
}

// Extended local blocklist for known malicious patterns
const MALWARE_PATTERNS = [
  // Phishing patterns
  /paypa[l1].*\.(com|net|org)/i,
  /amaz[o0]n.*\.(com|net|org)/i,
  /g[o0]{2}gle.*\.(com|net|org)/i,
  /faceb[o0]{2}k.*\.(com|net|org)/i,
  /micr[o0]s[o0]ft.*\.(com|net|org)/i,
  /app[l1]e.*\.(com|net|org)/i,
  /netf[l1]ix.*\.(com|net|org)/i,
  /steam(community|powered).*\.(com|net|org)/i,
  
  // Scam patterns
  /free.*nitro/i,
  /free.*robux/i,
  /free.*v-?bucks/i,
  /claim.*prize/i,
  /winner.*claim/i,
  /lottery.*winner/i,
  
  // Malware distribution
  /\.(exe|msi|bat|cmd|ps1|vbs|scr|pif)(\?|$)/i,
  
  // Crypto scams
  /crypto.*giveaway/i,
  /bitcoin.*double/i,
  /eth.*giveaway/i,
]

const MALWARE_DOMAINS = [
  'malware.com',
  'phishing.com',
  'scam-site.com',
  'virus-download.net',
  'trojan-horse.org',
  'ransomware.link',
  'keylogger.site',
  'spyware.download',
]

/**
 * Check URL against local blocklist and patterns
 */
export function checkLocalBlocklist(url: string): SafeBrowsingResult {
  const normalized = normalizeUrl(url)
  
  if (!normalized.isValid) {
    return {
      safe: false,
      threats: ['invalid_url'],
      checkedAt: new Date(),
      source: 'local_blocklist',
    }
  }
  
  const threats: string[] = []
  
  // Check domain blocklist
  for (const domain of MALWARE_DOMAINS) {
    if (normalized.hostname.includes(domain)) {
      threats.push(`Known malware domain: ${domain}`)
    }
  }
  
  // Check patterns
  for (const pattern of MALWARE_PATTERNS) {
    if (pattern.test(url)) {
      threats.push(`Matches malware pattern: ${pattern.source}`)
    }
  }
  
  return {
    safe: threats.length === 0,
    threats,
    checkedAt: new Date(),
    source: 'local_blocklist',
  }
}

/**
 * Check URL against Google Safe Browsing API
 * Requires GOOGLE_SAFE_BROWSING_API_KEY environment variable
 */
export async function checkGoogleSafeBrowsing(url: string): Promise<SafeBrowsingResult> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  
  if (!apiKey) {
    // Fall back to local blocklist if no API key
    return checkLocalBlocklist(url)
  }
  
  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            clientId: 'eziox-link-validator',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    )
    
    if (!response.ok) {
      // Fall back to local blocklist on API error
      const localResult = checkLocalBlocklist(url)
      localResult.error = `Safe Browsing API error: ${response.status}`
      return localResult
    }
    
    const data = await response.json() as { matches?: Array<{ threatType: string }> }
    
    if (data.matches && data.matches.length > 0) {
      return {
        safe: false,
        threats: data.matches.map((m) => m.threatType),
        checkedAt: new Date(),
        source: 'google_safe_browsing',
      }
    }
    
    // Also check local blocklist
    const localResult = checkLocalBlocklist(url)
    if (!localResult.safe) {
      return localResult
    }
    
    return {
      safe: true,
      threats: [],
      checkedAt: new Date(),
      source: 'google_safe_browsing',
    }
  } catch (error) {
    // Fall back to local blocklist on error
    const localResult = checkLocalBlocklist(url)
    localResult.error = error instanceof Error ? error.message : 'Unknown error'
    return localResult
  }
}

// ============================================================================
// LINK PREVIEW GENERATION
// ============================================================================

export interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  siteName?: string
  type?: string
  author?: string
  publishedTime?: string
  error?: string
  fetchedAt: Date
}

/**
 * Fetch and parse Open Graph / meta tags for link preview
 */
export async function generateLinkPreview(
  url: string,
  options: { timeout?: number } = {}
): Promise<LinkPreview> {
  const { timeout = 10000 } = options
  
  const normalized = normalizeUrl(url)
  if (!normalized.isValid) {
    return {
      url,
      error: normalized.error,
      fetchedAt: new Date(),
    }
  }
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(normalized.normalized, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Eziox-LinkPreview/1.0 (+https://eziox.link)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      return {
        url: normalized.normalized,
        error: `HTTP ${response.status}: ${response.statusText}`,
        fetchedAt: new Date(),
      }
    }
    
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return {
        url: normalized.normalized,
        error: 'Not an HTML page',
        fetchedAt: new Date(),
      }
    }
    
    const html = await response.text()
    
    // Parse meta tags
    const preview = parseMetaTags(html, normalized.normalized)
    
    // Try to get favicon if not found in meta tags
    if (!preview.favicon) {
      preview.favicon = `${normalized.protocol}//${normalized.hostname}/favicon.ico`
    }
    
    return {
      ...preview,
      url: normalized.normalized,
      fetchedAt: new Date(),
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        url: normalized.normalized,
        error: 'Request timed out',
        fetchedAt: new Date(),
      }
    }
    
    return {
      url: normalized.normalized,
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt: new Date(),
    }
  }
}

/**
 * Parse HTML for Open Graph and meta tags
 */
function parseMetaTags(html: string, baseUrl: string): Partial<LinkPreview> {
  const result: Partial<LinkPreview> = {}
  
  // Helper to extract meta content
  const getMetaContent = (nameOrProperty: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProperty}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${nameOrProperty}["']`, 'i'),
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match?.[1]) {
        return decodeHtmlEntities(match[1])
      }
    }
    return undefined
  }
  
  // Open Graph tags
  result.title = getMetaContent('og:title')
  result.description = getMetaContent('og:description')
  result.image = getMetaContent('og:image')
  result.siteName = getMetaContent('og:site_name')
  result.type = getMetaContent('og:type')
  
  // Twitter Card fallbacks
  if (!result.title) result.title = getMetaContent('twitter:title')
  if (!result.description) result.description = getMetaContent('twitter:description')
  if (!result.image) result.image = getMetaContent('twitter:image')
  
  // Standard meta fallbacks
  if (!result.description) result.description = getMetaContent('description')
  result.author = getMetaContent('author')
  result.publishedTime = getMetaContent('article:published_time')
  
  // Title tag fallback
  if (!result.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch?.[1]) {
      result.title = decodeHtmlEntities(titleMatch[1].trim())
    }
  }
  
  // Favicon
  const faviconPatterns = [
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
  ]
  
  for (const pattern of faviconPatterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      result.favicon = resolveUrl(match[1], baseUrl)
      break
    }
  }
  
  // Resolve relative URLs for image
  if (result.image && !result.image.startsWith('http')) {
    result.image = resolveUrl(result.image, baseUrl)
  }
  
  return result
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * Resolve relative URL to absolute
 */
function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).href
  } catch {
    return relative
  }
}

// ============================================================================
// COMPREHENSIVE LINK VALIDATION
// ============================================================================

export interface ComprehensiveValidationResult {
  url: string
  normalizedUrl: string
  isValid: boolean
  formatValidation: { valid: boolean; error?: string }
  reachability?: ReachabilityResult
  safeBrowsing?: SafeBrowsingResult
  preview?: LinkPreview
  overallScore: number // 0-100
  warnings: string[]
  errors: string[]
}

/**
 * Perform comprehensive link validation
 */
export async function validateLinkComprehensive(
  url: string,
  options: {
    checkReachability?: boolean
    checkSafeBrowsing?: boolean
    generatePreview?: boolean
    timeout?: number
  } = {}
): Promise<ComprehensiveValidationResult> {
  const {
    checkReachability: doReachability = true,
    checkSafeBrowsing: doSafeBrowsing = true,
    generatePreview: doPreview = false,
    timeout = 10000,
  } = options
  
  const warnings: string[] = []
  const errors: string[] = []
  let score = 100
  
  // Normalize URL
  const normalized = normalizeUrl(url)
  
  // Format validation
  const formatValidation = isValidUrlFormat(url)
  if (!formatValidation.valid) {
    errors.push(formatValidation.error || 'Invalid URL format')
    score = 0
  }
  
  const result: ComprehensiveValidationResult = {
    url,
    normalizedUrl: normalized.normalized,
    isValid: formatValidation.valid,
    formatValidation,
    overallScore: score,
    warnings,
    errors,
  }
  
  if (!formatValidation.valid) {
    return result
  }
  
  // Parallel checks
  const checks: Promise<void>[] = []
  
  // Reachability check
  if (doReachability) {
    checks.push(
      checkReachability(normalized.normalized, { timeout }).then((reachability) => {
        result.reachability = reachability
        if (!reachability.reachable) {
          warnings.push(`URL not reachable: ${reachability.error || reachability.statusCode}`)
          score -= 30
        } else if (reachability.statusCode && reachability.statusCode >= 300 && reachability.statusCode < 400) {
          warnings.push('URL redirects to another location')
          score -= 5
        }
        if (reachability.responseTime && reachability.responseTime > 5000) {
          warnings.push('Slow response time')
          score -= 10
        }
      })
    )
  }
  
  // Safe browsing check
  if (doSafeBrowsing) {
    checks.push(
      checkGoogleSafeBrowsing(normalized.normalized).then((safeBrowsing) => {
        result.safeBrowsing = safeBrowsing
        if (!safeBrowsing.safe) {
          errors.push(`Security threat detected: ${safeBrowsing.threats.join(', ')}`)
          score = 0
          result.isValid = false
        }
      })
    )
  }
  
  // Link preview
  if (doPreview) {
    checks.push(
      generateLinkPreview(normalized.normalized, { timeout }).then((preview) => {
        result.preview = preview
        if (preview.error) {
          warnings.push(`Preview generation failed: ${preview.error}`)
        }
      })
    )
  }
  
  await Promise.all(checks)
  
  result.overallScore = Math.max(0, score)
  result.warnings = warnings
  result.errors = errors
  
  return result
}
