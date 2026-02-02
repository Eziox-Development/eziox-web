import crypto from 'crypto'

// Common passwords list (top 1000 most common)
const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty',
  'qwerty123',
  'abc123',
  'monkey',
  'letmein',
  'dragon',
  'master',
  'login',
  'admin',
  'welcome',
  'shadow',
  'sunshine',
  'princess',
  'football',
  'baseball',
  'iloveyou',
  'trustno1',
  'superman',
  'batman',
  'starwars',
  'hello',
  'charlie',
  'donald',
  'password1!',
  'passw0rd',
  'p@ssword',
  'p@ssw0rd',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  '1q2w3e4r',
  '1qaz2wsx',
  'qazwsx',
  'test123',
  'test1234',
  'testing',
  'access',
  'secret',
  'god',
  'love',
  'sex',
  'money',
  'freedom',
  'ninja',
  'azerty',
  'solo',
  'whatever',
  'donald',
  'michael',
  'jennifer',
  'jordan',
  'hunter',
  'buster',
  'soccer',
  'hockey',
  'ranger',
  'harley',
  'andrew',
  'tigger',
  'joshua',
  'pepper',
  'summer',
  'winter',
  'spring',
  'autumn',
  'thomas',
  'robert',
  'daniel',
  'matthew',
  'anthony',
  'william',
  'joseph',
  'david',
  'richard',
  'charles',
  'christopher',
  'george',
  'edward',
  'brian',
  'ronald',
  'timothy',
  'jason',
  'jeffrey',
  'ryan',
  'jacob',
  'gary',
  'nicholas',
  'eric',
  'jonathan',
  'stephen',
  'larry',
  'justin',
  'scott',
  'brandon',
  'benjamin',
  'samuel',
  'raymond',
  'gregory',
  'frank',
  'alexander',
  'patrick',
  'jack',
  'dennis',
  'jerry',
  'tyler',
  'aaron',
  'jose',
  'adam',
  'nathan',
  'henry',
  'douglas',
  'zachary',
  'peter',
  'kyle',
  'noah',
  'ethan',
  'jeremy',
  'walter',
  'christian',
  'keith',
  'roger',
  'terry',
  'austin',
  'sean',
  'gerald',
  'carl',
  'harold',
  'dylan',
  'arthur',
  'lawrence',
  'jordan',
  'jesse',
  'bryan',
  'billy',
  'bruce',
  'gabriel',
  'joe',
  'logan',
  'albert',
  'willie',
  'alan',
  'eugene',
  'russell',
  'vincent',
  'philip',
  'bobby',
  'johnny',
  'bradley',
  '123123',
  '111111',
  '000000',
  '654321',
  '666666',
  '696969',
  '121212',
  '112233',
  '123321',
  '159753',
  '147258',
  '987654',
  '7777777',
  '555555',
  'fuckyou',
  'fuck',
  'asshole',
  'pussy',
  'killer',
  'letmein!',
  'changeme',
  'default',
  'temp',
  'temporary',
  'guest',
  'user',
  'demo',
  'sample',
])

// Keyboard patterns to detect
const KEYBOARD_PATTERNS = [
  'qwerty',
  'qwertz',
  'azerty',
  'asdf',
  'zxcv',
  '1234',
  '0987',
  'qazwsx',
  'wsxedc',
  'rfvtgb',
  'yhnujm',
  'plokij',
  'mnbvcx',
  '!@#$%',
  '!@#$%^',
  '!@#$%^&',
  '!@#$%^&*',
  'poiuy',
  'lkjhg',
]

// Sequential patterns
const SEQUENTIAL_PATTERNS = [
  'abcdef',
  'bcdefg',
  'cdefgh',
  'defghi',
  'efghij',
  'fghijk',
  'ghijkl',
  'hijklm',
  'ijklmn',
  'jklmno',
  'klmnop',
  'lmnopq',
  'mnopqr',
  'nopqrs',
  'opqrst',
  'pqrstu',
  'qrstuv',
  'rstuvw',
  'stuvwx',
  'tuvwxy',
  'uvwxyz',
]

export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-100
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface PasswordStrengthDetails {
  length: number
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumbers: boolean
  hasSpecialChars: boolean
  hasCommonPattern: boolean
  hasKeyboardPattern: boolean
  hasSequentialChars: boolean
  hasRepeatedChars: boolean
  isCommonPassword: boolean
  entropy: number
}

function calculateEntropy(password: string): number {
  const charsetSize = getCharsetSize(password)
  return Math.floor(password.length * Math.log2(charsetSize))
}

function getCharsetSize(password: string): number {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/[0-9]/.test(password)) size += 10
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) size += 32
  if (/[^\x00-\x7F]/.test(password)) size += 100 // Unicode
  return size || 1
}

function hasKeyboardPattern(password: string): boolean {
  const lower = password.toLowerCase()
  return KEYBOARD_PATTERNS.some(
    (pattern) =>
      lower.includes(pattern) ||
      lower.includes(pattern.split('').reverse().join('')),
  )
}

function hasSequentialChars(password: string): boolean {
  const lower = password.toLowerCase()

  // Check alphabetic sequences
  if (SEQUENTIAL_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return true
  }

  // Check numeric sequences
  for (let i = 0; i < password.length - 2; i++) {
    const c1 = password.charCodeAt(i)
    const c2 = password.charCodeAt(i + 1)
    const c3 = password.charCodeAt(i + 2)

    if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
      return true
    }
  }

  return false
}

function hasRepeatedChars(password: string): boolean {
  // Check for 3+ same characters in a row
  if (/(.)\1{2,}/.test(password)) {
    return true
  }

  // Check if any character appears more than 30% of the time
  const charCount: Record<string, number> = {}
  for (const char of password.toLowerCase()) {
    charCount[char] = (charCount[char] || 0) + 1
  }

  const maxCount = Math.max(...Object.values(charCount))
  return maxCount / password.length > 0.3
}

function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase()

  // Direct match
  if (COMMON_PASSWORDS.has(lower)) {
    return true
  }

  // Check without numbers at end
  const withoutTrailingNumbers = lower.replace(/\d+$/, '')
  if (COMMON_PASSWORDS.has(withoutTrailingNumbers)) {
    return true
  }

  // Check without special chars at end
  const withoutTrailingSpecial = lower.replace(/[!@#$%^&*]+$/, '')
  if (COMMON_PASSWORDS.has(withoutTrailingSpecial)) {
    return true
  }

  // Check leet speak variations
  const leetDecoded = decodeLeetSpeak(lower)
  if (COMMON_PASSWORDS.has(leetDecoded)) {
    return true
  }

  return false
}

function decodeLeetSpeak(text: string): string {
  return text
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i')
}

export function containsUserInfo(
  password: string,
  userInfo: {
    email?: string
    username?: string
    name?: string
  },
): boolean {
  const lower = password.toLowerCase()

  if (userInfo.email) {
    const emailParts = userInfo.email.toLowerCase().split('@')
    if (emailParts[0] && lower.includes(emailParts[0])) {
      return true
    }
  }

  if (userInfo.username && lower.includes(userInfo.username.toLowerCase())) {
    return true
  }

  if (userInfo.name) {
    const nameParts = userInfo.name.toLowerCase().split(/\s+/)
    if (nameParts.some((part) => part.length > 2 && lower.includes(part))) {
      return true
    }
  }

  return false
}

export function analyzePasswordStrength(
  password: string,
): PasswordStrengthDetails {
  return {
    length: password.length,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
    hasCommonPattern: isCommonPassword(password),
    hasKeyboardPattern: hasKeyboardPattern(password),
    hasSequentialChars: hasSequentialChars(password),
    hasRepeatedChars: hasRepeatedChars(password),
    isCommonPassword: isCommonPassword(password),
    entropy: calculateEntropy(password),
  }
}

export function validatePassword(
  password: string,
  options: {
    minLength?: number
    maxLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
    checkCommonPasswords?: boolean
    checkKeyboardPatterns?: boolean
    checkSequentialChars?: boolean
    checkRepeatedChars?: boolean
    minEntropy?: number
    userInfo?: {
      email?: string
      username?: string
      name?: string
    }
  } = {},
): PasswordValidationResult {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
    checkCommonPasswords = true,
    checkKeyboardPatterns = true,
    checkSequentialChars = true,
    checkRepeatedChars = true,
    minEntropy = 40,
    userInfo,
  } = options

  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  let score = 100

  // Length checks
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`)
    score -= 30
  }
  if (password.length > maxLength) {
    errors.push(`Password must be at most ${maxLength} characters`)
    score -= 10
  }

  // Character type checks
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
    score -= 15
  }
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
    score -= 15
  }
  if (requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
    score -= 15
  }
  if (
    requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)
  ) {
    errors.push('Password must contain at least one special character')
    score -= 15
  }

  // Common password check
  if (checkCommonPasswords && isCommonPassword(password)) {
    errors.push('This password is too common and easily guessable')
    score -= 40
  }

  // Keyboard pattern check
  if (checkKeyboardPatterns && hasKeyboardPattern(password)) {
    warnings.push('Password contains keyboard patterns')
    suggestions.push('Avoid keyboard patterns like "qwerty" or "asdf"')
    score -= 15
  }

  // Sequential characters check
  if (checkSequentialChars && hasSequentialChars(password)) {
    warnings.push('Password contains sequential characters')
    suggestions.push('Avoid sequences like "abc" or "123"')
    score -= 10
  }

  // Repeated characters check
  if (checkRepeatedChars && hasRepeatedChars(password)) {
    warnings.push('Password contains too many repeated characters')
    suggestions.push('Avoid repeating the same character multiple times')
    score -= 10
  }

  // User info check
  if (userInfo && containsUserInfo(password, userInfo)) {
    errors.push('Password should not contain your personal information')
    score -= 25
  }

  // Entropy check
  const entropy = calculateEntropy(password)
  if (entropy < minEntropy) {
    warnings.push('Password could be stronger')
    suggestions.push(
      'Use a mix of different character types for better security',
    )
    score -= 15
  }

  // Bonus points
  if (password.length >= 12) score += 5
  if (password.length >= 16) score += 5
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score += 5
  if (entropy >= 60) score += 5

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    suggestions,
  }
}

export async function checkPasswordBreach(password: string): Promise<{
  breached: boolean
  count: number
}> {
  try {
    // Create SHA-1 hash of password
    const hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase()
    const prefix = hash.substring(0, 5)
    const suffix = hash.substring(5)

    // Query HaveIBeenPwned API with k-anonymity
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'Eziox-Password-Check',
        },
      },
    )

    if (!response.ok) {
      // If API fails, don't block the user
      console.warn('HaveIBeenPwned API unavailable')
      return { breached: false, count: 0 }
    }

    const text = await response.text()
    const lines = text.split('\n')

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':')
      if (hashSuffix?.trim() === suffix) {
        return {
          breached: true,
          count: parseInt(countStr?.trim() || '0', 10),
        }
      }
    }

    return { breached: false, count: 0 }
  } catch (error) {
    console.error('Password breach check failed:', error)
    return { breached: false, count: 0 }
  }
}

export function generateSecurePassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-='
  const all = lowercase + uppercase + numbers + special

  let password = ''

  // Ensure at least one of each type
  password += lowercase[crypto.randomInt(lowercase.length)]
  password += uppercase[crypto.randomInt(uppercase.length)]
  password += numbers[crypto.randomInt(numbers.length)]
  password += special[crypto.randomInt(special.length)]

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(all.length)]
  }

  // Shuffle the password
  const array = password.split('')
  for (let i = array.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    ;[array[i], array[j]] = [array[j]!, array[i]!]
  }

  return array.join('')
}
