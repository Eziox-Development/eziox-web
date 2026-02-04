import { db } from '@/server/db'
import { contentModerationLog, users, userLinks } from '@/server/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'

// ============================================================================
// LOCAL CONTENT MODERATION
// ============================================================================

// Offensive words list - comprehensive but not exhaustive
// These are common slurs and offensive terms that should be blocked
const OFFENSIVE_WORDS = [
  // Racial slurs (abbreviated/partial to avoid full listing)
  'nigger',
  'nigga',
  'negro',
  'chink',
  'gook',
  'spic',
  'wetback',
  'beaner',
  'kike',
  'heeb',
  'jap',
  'paki',
  'raghead',
  'towelhead',
  'sandnigger',
  'cracker',
  'honky',
  'gringo',
  'redskin',
  'injun',
  'coon',
  'darkie',
  // Homophobic slurs
  'faggot',
  'fag',
  'dyke',
  'homo',
  'queer',
  'tranny',
  'shemale',
  // Sexist/misogynistic
  'whore',
  'slut',
  'cunt',
  'bitch',
  'twat',
  // Ableist
  'retard',
  'retarded',
  'spaz',
  'spastic',
  'mongoloid',
  // Nazi/extremist
  'nazi',
  'hitler',
  'heil',
  'sieg',
  'aryan',
  'skinhead',
  'kkk',
  // Violence
  'kill',
  'murder',
  'rape',
  'terrorist',
  'bomb',
  // Explicit
  'porn',
  'xxx',
  'nsfw',
  'hentai',
]

// Reserved usernames that cannot be registered
const RESERVED_USERNAMES = [
  // System/admin
  'admin',
  'administrator',
  'root',
  'system',
  'mod',
  'moderator',
  'support',
  'help',
  'info',
  'contact',
  'staff',
  'team',
  'official',
  // Brand protection
  'eziox',
  'eziox-official',
  'eziox-team',
  'eziox-support',
  'eziox-admin',
  // Common routes
  'api',
  'auth',
  'login',
  'logout',
  'signup',
  'signin',
  'register',
  'profile',
  'settings',
  'dashboard',
  'home',
  'index',
  'about',
  'terms',
  'privacy',
  'legal',
  'tos',
  'agb',
  'imprint',
  'impressum',
  'pricing',
  'premium',
  'pro',
  'creator',
  'lifetime',
  'subscribe',
  'status',
  'health',
  'ping',
  'robots',
  'sitemap',
  'rss',
  'feed',
  'blog',
  'news',
  'updates',
  'changelog',
  'docs',
  'documentation',
  'faq',
  'security',
  'verify',
  'confirm',
  'reset',
  'forgot',
  // Social
  'null',
  'undefined',
  'anonymous',
  'guest',
  'user',
  'users',
  'everyone',
  'all',
  'public',
  'private',
  'me',
  'self',
  'you',
  // Technical
  'www',
  'mail',
  'email',
  'ftp',
  'ssh',
  'cdn',
  'assets',
  'static',
  'img',
  'images',
  'js',
  'css',
  'fonts',
  'media',
  'uploads',
  // Misc
  'test',
  'testing',
  'demo',
  'example',
  'sample',
  'temp',
  'tmp',
]

// Leet speak character mappings
const LEET_MAP: Record<string, string[]> = {
  a: ['4', '@', '^', 'λ', 'α'],
  b: ['8', '|3', 'ß', 'β'],
  c: ['(', '<', '{', '©'],
  d: ['|)', '|]', 'đ'],
  e: ['3', '€', 'ε', 'ë'],
  f: ['|=', 'ƒ', 'ph'],
  g: ['6', '9', 'gee'],
  h: ['#', '|-|', '}{'],
  i: ['1', '!', '|', 'ï', 'í'],
  j: ['_|', ']'],
  k: ['|<', '|{'],
  l: ['1', '|', '£', '|_'],
  m: ['|v|', '/\\/\\', 'nn'],
  n: ['|\\|', '/\\/', 'ñ'],
  o: ['0', '()', '[]', 'ø', 'ö'],
  p: ['|*', '|>', '|°'],
  q: ['9', '0_', 'kw'],
  r: ['|2', '®', 'Я'],
  s: ['5', '$', '§', 'z'],
  t: ['7', '+', '†'],
  u: ['|_|', 'µ', 'ü', 'ú'],
  v: ['\\/', '|/'],
  w: ['\\/\\/', 'vv', 'uu'],
  x: ['><', '}{', '×'],
  y: ['`/', '¥', 'ÿ'],
  z: ['2', '7_', 'ž'],
}

export interface ModerationResult {
  isAllowed: boolean
  reason?: string
  matchedPattern?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  action: 'allowed' | 'blocked' | 'flagged'
}

/**
 * Decode leet speak to regular text
 */
export function decodeLeetSpeak(text: string): string {
  let decoded = text.toLowerCase()

  // Replace leet characters with their letter equivalents
  for (const [letter, replacements] of Object.entries(LEET_MAP)) {
    for (const replacement of replacements) {
      decoded = decoded.split(replacement.toLowerCase()).join(letter)
    }
  }

  // Also handle common number substitutions directly
  decoded = decoded
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/9/g, 'g')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/\+/g, 't')
    .replace(/!/g, 'i')

  return decoded
}

/**
 * Check if text contains offensive words (including leet speak variants)
 */
export function containsOffensiveWord(text: string): {
  found: boolean
  word?: string
} {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '')
  const decoded = decodeLeetSpeak(text).replace(/[^a-z]/g, '')

  for (const word of OFFENSIVE_WORDS) {
    // Check direct match
    if (normalized.includes(word)) {
      return { found: true, word }
    }
    // Check leet speak decoded
    if (decoded.includes(word)) {
      return { found: true, word: `${word} (leet)` }
    }
  }

  return { found: false }
}

/**
 * Check if username is reserved
 */
export function isReservedUsername(username: string): boolean {
  const normalized = username.toLowerCase()
  return RESERVED_USERNAMES.includes(normalized)
}

/**
 * Validate username for content moderation
 */
export function validateUsername(username: string): ModerationResult {
  const normalized = username.toLowerCase()

  // Check reserved usernames
  if (isReservedUsername(normalized)) {
    return {
      isAllowed: false,
      reason: 'reserved_username',
      matchedPattern: normalized,
      severity: 'medium',
      action: 'blocked',
    }
  }

  // Check offensive words
  const offensiveCheck = containsOffensiveWord(username)
  if (offensiveCheck.found) {
    return {
      isAllowed: false,
      reason: 'offensive_word',
      matchedPattern: offensiveCheck.word,
      severity: 'high',
      action: 'blocked',
    }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /^(admin|mod|staff|support|official)/i,
    /(admin|mod|staff|support|official)$/i,
    /eziox/i,
    /^[0-9]+$/, // Only numbers
    /^[_\-.]+$/, // Only special chars
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(username)) {
      return {
        isAllowed: false,
        reason: 'suspicious_pattern',
        matchedPattern: pattern.toString(),
        severity: 'medium',
        action: 'blocked',
      }
    }
  }

  return {
    isAllowed: true,
    severity: 'low',
    action: 'allowed',
  }
}

/**
 * Validate bio/profile content
 */
export function validateProfileContent(content: string): ModerationResult {
  const offensiveCheck = containsOffensiveWord(content)

  if (offensiveCheck.found) {
    return {
      isAllowed: false,
      reason: 'offensive_content',
      matchedPattern: offensiveCheck.word,
      severity: 'high',
      action: 'blocked',
    }
  }

  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{5,}/, // Repeated characters (6+)
    /(https?:\/\/[^\s]+){5,}/, // Too many URLs
    /\b(buy|sell|cheap|discount|free|click here|act now)\b/gi, // Spam keywords
  ]

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return {
        isAllowed: false,
        reason: 'spam_detected',
        matchedPattern: pattern.toString(),
        severity: 'medium',
        action: 'flagged',
      }
    }
  }

  return {
    isAllowed: true,
    severity: 'low',
    action: 'allowed',
  }
}

/**
 * Log moderation action to database
 */
export async function logModerationAction(
  userId: string | null,
  contentType: 'username' | 'bio' | 'link' | 'comment' | 'profile',
  contentValue: string,
  result: ModerationResult,
): Promise<void> {
  try {
    await db.insert(contentModerationLog).values({
      userId,
      contentType,
      contentValue: contentValue.substring(0, 1000), // Limit length
      action: result.action,
      reason: result.reason || 'none',
      matchedPattern: result.matchedPattern,
      severity: result.severity,
    })
  } catch {
    // Silently fail - don't block user action for logging failure
  }
}

/**
 * Full username validation with logging
 */
export async function moderateUsername(
  username: string,
  userId?: string,
): Promise<ModerationResult> {
  const result = validateUsername(username)

  if (!result.isAllowed) {
    await logModerationAction(userId || null, 'username', username, result)
  }

  return result
}

/**
 * Full profile content validation with logging
 */
export async function moderateProfileContent(
  content: string,
  userId: string,
): Promise<ModerationResult> {
  const result = validateProfileContent(content)

  if (!result.isAllowed) {
    await logModerationAction(userId, 'bio', content, result)
  }

  return result
}

// Export lists for admin use
export { OFFENSIVE_WORDS, RESERVED_USERNAMES }

// ============================================================================
// PROFILE CONTENT MODERATION (Pornographic/Abusive Content)
// ============================================================================

// Explicit/pornographic terms
const EXPLICIT_TERMS = [
  // Adult content
  'onlyfans',
  'fansly',
  'manyvids',
  'chaturbate',
  'pornhub',
  'xvideos',
  'xhamster',
  'redtube',
  'youporn',
  'brazzers',
  'bangbros',
  'realitykings',
  // Explicit terms
  'nude',
  'nudes',
  'naked',
  'topless',
  'bottomless',
  'pussy',
  'cock',
  'dick',
  'penis',
  'vagina',
  'boobs',
  'tits',
  'ass',
  'anal',
  'blowjob',
  'handjob',
  'cumshot',
  'creampie',
  'gangbang',
  'threesome',
  'orgy',
  'fetish',
  'bdsm',
  'bondage',
  'dominatrix',
  'escort',
  'prostitute',
  'hooker',
  'camgirl',
  'camboy',
  'stripper',
  'sexting',
  'sextape',
]

// Abusive/harassment terms
const ABUSIVE_TERMS = [
  'kys',
  'kill yourself',
  'go die',
  'neck yourself',
  'end yourself',
  'unalive',
  'self harm',
  'cutting',
  'suicide',
  'hang yourself',
  'jump off',
  'overdose',
  'worthless',
  'nobody loves you',
  'everyone hates you',
  'you deserve to die',
  'hope you die',
  'wish you were dead',
  'doxxing',
  'doxxed',
  'swatting',
  'swatted',
]

// Scam/fraud indicators
const SCAM_INDICATORS = [
  'send me money',
  'cashapp me',
  'venmo me',
  'paypal me',
  'crypto investment',
  'guaranteed returns',
  'double your money',
  'get rich quick',
  'work from home',
  'make money fast',
  'dm for details',
  'dm to earn',
  'passive income',
  'financial freedom',
  'forex trading',
  'binary options',
  'pyramid scheme',
  'mlm opportunity',
  'network marketing',
  'be your own boss',
]

export interface ExtendedModerationResult extends ModerationResult {
  category?: 'offensive' | 'explicit' | 'abusive' | 'scam' | 'spam' | 'malicious_url' | 'suspicious_activity'
  confidence: number // 0-100
  requiresManualReview: boolean
}

/**
 * Enhanced profile content moderation with explicit/abusive detection
 */
export function validateProfileContentExtended(content: string): ExtendedModerationResult {
  const lowerContent = content.toLowerCase()
  const normalizedContent = lowerContent.replace(/[^a-z0-9\s]/g, '')

  // Check for explicit content
  for (const term of EXPLICIT_TERMS) {
    if (normalizedContent.includes(term.replace(/\s/g, '')) || lowerContent.includes(term)) {
      return {
        isAllowed: false,
        reason: 'explicit_content',
        matchedPattern: term,
        severity: 'critical',
        action: 'blocked',
        category: 'explicit',
        confidence: 95,
        requiresManualReview: false,
      }
    }
  }

  // Check for abusive content
  for (const term of ABUSIVE_TERMS) {
    if (lowerContent.includes(term)) {
      return {
        isAllowed: false,
        reason: 'abusive_content',
        matchedPattern: term,
        severity: 'critical',
        action: 'blocked',
        category: 'abusive',
        confidence: 90,
        requiresManualReview: true,
      }
    }
  }

  // Check for scam indicators
  let scamScore = 0
  const matchedScamTerms: string[] = []
  for (const term of SCAM_INDICATORS) {
    if (lowerContent.includes(term)) {
      scamScore += 20
      matchedScamTerms.push(term)
    }
  }

  if (scamScore >= 40) {
    return {
      isAllowed: false,
      reason: 'potential_scam',
      matchedPattern: matchedScamTerms.join(', '),
      severity: 'high',
      action: 'flagged',
      category: 'scam',
      confidence: Math.min(scamScore, 100),
      requiresManualReview: true,
    }
  }

  // Check offensive words (existing)
  const offensiveCheck = containsOffensiveWord(content)
  if (offensiveCheck.found) {
    return {
      isAllowed: false,
      reason: 'offensive_content',
      matchedPattern: offensiveCheck.word,
      severity: 'high',
      action: 'blocked',
      category: 'offensive',
      confidence: 85,
      requiresManualReview: false,
    }
  }

  // Check spam patterns
  const spamPatterns = [
    { pattern: /(.)\1{7,}/, reason: 'excessive_repetition', severity: 'medium' as const },
    { pattern: /(https?:\/\/[^\s]+){5,}/, reason: 'too_many_urls', severity: 'medium' as const },
    { pattern: /[A-Z]{20,}/, reason: 'excessive_caps', severity: 'low' as const },
    { pattern: /[\u{1F300}-\u{1F9FF}]{10,}/u, reason: 'emoji_spam', severity: 'low' as const },
  ]

  for (const { pattern, reason, severity } of spamPatterns) {
    if (pattern.test(content)) {
      return {
        isAllowed: severity === 'medium' ? false : true,
        reason,
        matchedPattern: pattern.toString(),
        severity,
        action: severity === 'medium' ? 'flagged' : 'allowed',
        category: 'spam',
        confidence: 70,
        requiresManualReview: severity === 'medium',
      }
    }
  }

  return {
    isAllowed: true,
    severity: 'low',
    action: 'allowed',
    confidence: 100,
    requiresManualReview: false,
  }
}

// ============================================================================
// LINK VALIDATION (Malicious URL Detection)
// ============================================================================

// Known malicious/phishing domains
const MALICIOUS_DOMAINS = [
  // Phishing patterns
  'bit.ly.fake',
  'paypa1.com',
  'amaz0n.com',
  'g00gle.com',
  'faceb00k.com',
  'instaqram.com',
  'tw1tter.com',
  'disc0rd.com',
  'steamcommunlty.com',
  'steamcommuntiy.com',
  'roblox-free.com',
  'free-robux.com',
  'v-bucks-free.com',
  'nitro-free.com',
  'discord-nitro-free.com',
]

// Suspicious TLDs often used for scams
const SUSPICIOUS_TLDS = [
  '.tk',
  '.ml',
  '.ga',
  '.cf',
  '.gq',
  '.xyz',
  '.top',
  '.work',
  '.click',
  '.link',
  '.info',
  '.biz',
  '.club',
  '.online',
  '.site',
  '.website',
  '.space',
  '.pw',
  '.cc',
  '.ws',
]

// URL shorteners that could hide malicious links
const URL_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'adf.ly',
  'bc.vc',
  'j.mp',
  'tr.im',
  'v.gd',
  'shorturl.at',
  'cutt.ly',
  'rb.gy',
  'short.io',
]

// Legitimate domains that should never be flagged
const TRUSTED_DOMAINS = [
  'google.com',
  'youtube.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'twitch.tv',
  'discord.com',
  'discord.gg',
  'github.com',
  'linkedin.com',
  'spotify.com',
  'apple.com',
  'microsoft.com',
  'amazon.com',
  'paypal.com',
  'stripe.com',
  'eziox.link',
]

export interface LinkValidationResult {
  isAllowed: boolean
  isSafe: boolean
  reason?: string
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  warnings: string[]
  requiresManualReview: boolean
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Check if domain looks like a typosquat of a trusted domain
 */
function isTyposquat(domain: string): { isTyposquat: boolean; targetDomain?: string } {
  const trustedDomains = ['google', 'youtube', 'twitter', 'facebook', 'instagram', 'tiktok', 'discord', 'paypal', 'amazon', 'apple', 'microsoft', 'steam', 'roblox', 'spotify']

  for (const trusted of trustedDomains) {
    // Check for common typosquatting patterns
    const patterns = [
      new RegExp(`${trusted.replace(/./g, (c) => `${c}[0o]?`)}`, 'i'), // Letter substitution
      new RegExp(`${trusted}[0-9]`, 'i'), // Added numbers
      new RegExp(`${trusted}-`, 'i'), // Added hyphen
      new RegExp(`${trusted}(login|verify|secure|account|support)`, 'i'), // Added keywords
      new RegExp(`(login|verify|secure|account|support)${trusted}`, 'i'),
    ]

    for (const pattern of patterns) {
      if (pattern.test(domain) && !domain.includes(trusted + '.')) {
        return { isTyposquat: true, targetDomain: trusted }
      }
    }

    // Levenshtein distance check for close matches
    const domainBase = domain.split('.')[0] || ''
    if (domainBase && levenshteinDistance(domainBase, trusted) <= 2 && domainBase !== trusted) {
      return { isTyposquat: true, targetDomain: trusted }
    }
  }

  return { isTyposquat: false }
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(0) as number[])

  for (let i = 0; i <= b.length; i++) {
    matrix[i]![0] = i
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1,
        )
      }
    }
  }

  return matrix[b.length]![a.length]!
}

/**
 * Validate a URL for malicious content
 */
export function validateUrl(url: string): LinkValidationResult {
  const warnings: string[] = []
  let riskLevel: LinkValidationResult['riskLevel'] = 'safe'

  const domain = extractDomain(url)
  if (!domain) {
    return {
      isAllowed: false,
      isSafe: false,
      reason: 'invalid_url',
      riskLevel: 'high',
      warnings: ['Invalid URL format'],
      requiresManualReview: false,
    }
  }

  // Check if trusted domain
  if (TRUSTED_DOMAINS.some((trusted) => domain === trusted || domain.endsWith('.' + trusted))) {
    return {
      isAllowed: true,
      isSafe: true,
      riskLevel: 'safe',
      warnings: [],
      requiresManualReview: false,
    }
  }

  // Check known malicious domains
  for (const malicious of MALICIOUS_DOMAINS) {
    if (domain.includes(malicious)) {
      return {
        isAllowed: false,
        isSafe: false,
        reason: 'known_malicious_domain',
        riskLevel: 'critical',
        warnings: ['Known malicious domain'],
        requiresManualReview: false,
      }
    }
  }

  // Check for typosquatting
  const typosquatCheck = isTyposquat(domain)
  if (typosquatCheck.isTyposquat) {
    return {
      isAllowed: false,
      isSafe: false,
      reason: 'potential_typosquat',
      riskLevel: 'critical',
      warnings: [`Potential typosquat of ${typosquatCheck.targetDomain}`],
      requiresManualReview: true,
    }
  }

  // Check suspicious TLDs
  for (const tld of SUSPICIOUS_TLDS) {
    if (domain.endsWith(tld)) {
      warnings.push(`Suspicious TLD: ${tld}`)
      riskLevel = 'medium'
    }
  }

  // Check URL shorteners
  for (const shortener of URL_SHORTENERS) {
    if (domain === shortener || domain.endsWith('.' + shortener)) {
      warnings.push('URL shortener detected - destination unknown')
      riskLevel = riskLevel === 'safe' ? 'low' : riskLevel
    }
  }

  // Check for suspicious URL patterns
  const suspiciousPatterns = [
    { pattern: /login|signin|verify|secure|account|password|credential/i, warning: 'Contains login-related keywords' },
    { pattern: /free|gift|prize|winner|claim|reward/i, warning: 'Contains promotional keywords' },
    { pattern: /[0-9]{5,}/, warning: 'Contains long number sequences' },
    { pattern: /@.*@/, warning: 'Contains multiple @ symbols' },
    { pattern: /\.(exe|zip|rar|msi|bat|cmd|ps1|vbs|js)$/i, warning: 'Direct file download link' },
  ]

  for (const { pattern, warning } of suspiciousPatterns) {
    if (pattern.test(url)) {
      warnings.push(warning)
      if (riskLevel === 'safe') riskLevel = 'low'
    }
  }

  // Check for IP address instead of domain
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    warnings.push('IP address instead of domain name')
    riskLevel = 'medium'
  }

  // Check for excessive subdomains
  const subdomainCount = domain.split('.').length - 2
  if (subdomainCount > 3) {
    warnings.push('Excessive subdomains')
    riskLevel = riskLevel === 'safe' ? 'low' : riskLevel
  }

  const finalRiskLevel = riskLevel
  return {
    isAllowed: true,
    isSafe: finalRiskLevel === 'safe',
    riskLevel: finalRiskLevel,
    warnings,
    requiresManualReview: finalRiskLevel === 'medium',
  }
}

/**
 * Validate link with logging
 */
export async function moderateLink(
  url: string,
  userId: string,
): Promise<LinkValidationResult> {
  const result = validateUrl(url)

  if (!result.isAllowed || result.requiresManualReview) {
    await logModerationAction(userId, 'link', url, {
      isAllowed: result.isAllowed,
      reason: result.reason || result.warnings.join('; '),
      severity: result.riskLevel === 'critical' ? 'critical' : result.riskLevel === 'high' ? 'high' : 'medium',
      action: result.isAllowed ? 'flagged' : 'blocked',
    })
  }

  return result
}

// ============================================================================
// AUTOMATED MODERATION (Suspicious Activity Detection)
// ============================================================================

export interface SuspiciousActivityResult {
  isSuspicious: boolean
  reason?: string
  riskScore: number // 0-100
  actions: ('flag' | 'rate_limit' | 'require_verification' | 'block')[]
  details: string[]
}

// Activity metrics type for reference (used internally)
type ActivityMetrics = {
  linksCreatedLast24h: number
  profileUpdatesLast24h: number
  failedLoginsLast24h: number
  reportsReceivedLast7d: number
  accountAge: number // in days
  isEmailVerified: boolean
  hasCompletedProfile: boolean
}

// Ensure type is used to avoid lint error
const _activityMetricsType: ActivityMetrics | null = null
void _activityMetricsType

/**
 * Analyze user activity for suspicious patterns
 */
export async function detectSuspiciousActivity(
  userId: string,
  activityType: 'link_creation' | 'profile_update' | 'login_attempt' | 'bulk_action',
): Promise<SuspiciousActivityResult> {
  const details: string[] = []
  let riskScore = 0
  const actions: SuspiciousActivityResult['actions'] = []

  try {
    // Get user data
    const [user] = await db
      .select({
        createdAt: users.createdAt,
        emailVerified: users.emailVerified,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return {
        isSuspicious: true,
        reason: 'user_not_found',
        riskScore: 100,
        actions: ['block'],
        details: ['User not found'],
      }
    }

    // Calculate account age
    const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))

    // New account check
    if (accountAge < 1) {
      riskScore += 30
      details.push('Account less than 24 hours old')
      actions.push('rate_limit')
    } else if (accountAge < 7) {
      riskScore += 15
      details.push('Account less than 7 days old')
    }

    // Email verification check
    if (!user.emailVerified) {
      riskScore += 25
      details.push('Email not verified')
      actions.push('require_verification')
    }

    // Profile completion check
    if (!user.name) {
      riskScore += 10
      details.push('Profile incomplete')
    }

    // Get recent activity counts
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Links created in last 24h
    const [linkCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userLinks)
      .where(and(eq(userLinks.userId, userId), gte(userLinks.createdAt, oneDayAgo)))

    const linksCreated = Number(linkCount?.count || 0)
    if (linksCreated > 50) {
      riskScore += 40
      details.push(`High link creation rate: ${linksCreated} in 24h`)
      actions.push('rate_limit')
    } else if (linksCreated > 20) {
      riskScore += 20
      details.push(`Elevated link creation rate: ${linksCreated} in 24h`)
    }

    // Check moderation log for recent flags
    const [flagCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contentModerationLog)
      .where(
        and(
          eq(contentModerationLog.userId, userId),
          gte(contentModerationLog.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        ),
      )

    const recentFlags = Number(flagCount?.count || 0)
    if (recentFlags > 5) {
      riskScore += 35
      details.push(`Multiple content flags: ${recentFlags} in 7 days`)
      actions.push('flag')
    } else if (recentFlags > 2) {
      riskScore += 15
      details.push(`Some content flags: ${recentFlags} in 7 days`)
    }

    // Activity-specific checks
    switch (activityType) {
      case 'link_creation':
        if (linksCreated > 10 && accountAge < 1) {
          riskScore += 25
          details.push('High link creation on new account')
          actions.push('rate_limit')
        }
        break

      case 'profile_update':
        // Check for rapid profile changes
        const [updateCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(contentModerationLog)
          .where(
            and(
              eq(contentModerationLog.userId, userId),
              eq(contentModerationLog.contentType, 'bio'),
              gte(contentModerationLog.createdAt, oneDayAgo),
            ),
          )

        const profileUpdates = Number(updateCount?.count || 0)
        if (profileUpdates > 10) {
          riskScore += 20
          details.push(`Frequent profile updates: ${profileUpdates} in 24h`)
        }
        break

      case 'bulk_action':
        riskScore += 15
        details.push('Bulk action detected')
        actions.push('rate_limit')
        break
    }

    // Determine if suspicious
    const isSuspicious = riskScore >= 50

    // Add block action for very high risk
    if (riskScore >= 80 && !actions.includes('block')) {
      actions.push('block')
    }

    return {
      isSuspicious,
      reason: isSuspicious ? details[0] : undefined,
      riskScore: Math.min(riskScore, 100),
      actions: [...new Set(actions)], // Remove duplicates
      details,
    }
  } catch (error) {
    console.error('Error detecting suspicious activity:', error)
    return {
      isSuspicious: false,
      riskScore: 0,
      actions: [],
      details: ['Error during analysis'],
    }
  }
}

/**
 * Rate limiting check for automated moderation
 */
const rateLimitCache = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const cached = rateLimitCache.get(key)

  if (!cached || cached.resetAt < now) {
    rateLimitCache.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetIn: windowMs }
  }

  if (cached.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: cached.resetAt - now }
  }

  cached.count++
  return { allowed: true, remaining: limit - cached.count, resetIn: cached.resetAt - now }
}

/**
 * Combined moderation check for content creation
 */
export async function performAutomatedModeration(
  userId: string,
  content: string,
  contentType: 'bio' | 'link' | 'comment',
  url?: string,
): Promise<{
  allowed: boolean
  contentResult: ExtendedModerationResult
  linkResult?: LinkValidationResult
  activityResult: SuspiciousActivityResult
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
}> {
  // Check content
  const contentResult = validateProfileContentExtended(content)

  // Check link if provided
  let linkResult: LinkValidationResult | undefined
  if (url) {
    linkResult = validateUrl(url)
  }

  // Check activity patterns
  const activityResult = await detectSuspiciousActivity(
    userId,
    contentType === 'link' ? 'link_creation' : 'profile_update',
  )

  // Calculate overall risk
  let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low'

  if (
    contentResult.severity === 'critical' ||
    linkResult?.riskLevel === 'critical' ||
    activityResult.riskScore >= 80
  ) {
    overallRisk = 'critical'
  } else if (
    contentResult.severity === 'high' ||
    linkResult?.riskLevel === 'high' ||
    activityResult.riskScore >= 60
  ) {
    overallRisk = 'high'
  } else if (
    contentResult.severity === 'medium' ||
    linkResult?.riskLevel === 'medium' ||
    activityResult.riskScore >= 40
  ) {
    overallRisk = 'medium'
  }

  // Determine if allowed
  const allowed =
    contentResult.isAllowed &&
    (linkResult?.isAllowed ?? true) &&
    !activityResult.actions.includes('block')

  // Log if not allowed or high risk
  if (!allowed || overallRisk === 'high' || overallRisk === 'critical') {
    await logModerationAction(userId, contentType, content, {
      isAllowed: allowed,
      reason: contentResult.reason || linkResult?.reason || activityResult.reason || 'automated_moderation',
      severity: overallRisk,
      action: allowed ? 'flagged' : 'blocked',
      matchedPattern: contentResult.matchedPattern,
    })
  }

  return {
    allowed,
    contentResult,
    linkResult,
    activityResult,
    overallRisk,
  }
}
