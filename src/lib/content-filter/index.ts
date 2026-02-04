import blockedWordsData from './blocked-words.json'

interface BlockedWordsConfig {
  version: string
  lastUpdated: string
  categories: Record<string, string[]>
  patterns: string[]
  settings: {
    maxCapsRatio: number
    minLengthForCapsCheck: number
    maxRepeatedChars: number
    autoHideReportThreshold: number
  }
}

const config = blockedWordsData as BlockedWordsConfig

// Flatten all blocked words from categories
const allBlockedWords: string[] = Object.values(config.categories).flat()

// Compile regex patterns
const compiledPatterns: RegExp[] = config.patterns.map(
  (pattern) => new RegExp(pattern, 'gi'),
)

export interface ContentFilterResult {
  isClean: boolean
  reason?: string
  category?: string
  matchedWord?: string
}

/**
 * Check if text contains profanity or blocked content
 */
export function checkContent(text: string): ContentFilterResult {
  const lowerText = text.toLowerCase()

  // Check exact words from all categories
  for (const [category, words] of Object.entries(config.categories)) {
    for (const word of words) {
      if (lowerText.includes(word.toLowerCase())) {
        return {
          isClean: false,
          reason: 'blocked_word',
          category,
          matchedWord: word,
        }
      }
    }
  }

  // Check regex patterns
  for (const pattern of compiledPatterns) {
    pattern.lastIndex = 0 // Reset regex state
    if (pattern.test(text)) {
      return {
        isClean: false,
        reason: 'blocked_pattern',
      }
    }
  }

  // Check for excessive caps (shouting)
  if (text.length >= config.settings.minLengthForCapsCheck) {
    const capsCount = (text.match(/[A-Z]/g) || []).length
    const capsRatio = capsCount / text.length
    if (capsRatio > config.settings.maxCapsRatio) {
      return {
        isClean: false,
        reason: 'excessive_caps',
      }
    }
  }

  // Check for spam patterns (repeated characters)
  const repeatedPattern = new RegExp(
    `(.)\\1{${config.settings.maxRepeatedChars},}`,
    'i',
  )
  if (repeatedPattern.test(text)) {
    return {
      isClean: false,
      reason: 'spam_pattern',
    }
  }

  return { isClean: true }
}

/**
 * Check if content is clean (simple boolean check)
 */
export function isContentClean(text: string): boolean {
  return checkContent(text).isClean
}

/**
 * Get the auto-hide threshold for reports
 */
export function getAutoHideThreshold(): number {
  return config.settings.autoHideReportThreshold
}

/**
 * Get all blocked words (for admin purposes)
 */
export function getAllBlockedWords(): string[] {
  return allBlockedWords
}

/**
 * Get config version
 */
export function getFilterVersion(): string {
  return config.version
}
