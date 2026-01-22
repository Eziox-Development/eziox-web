import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.warn(
    '[Encryption] ENCRYPTION_KEY not set or invalid length (needs 64 hex chars). Sensitive data encryption disabled.',
  )
}

function getKey(): Buffer {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  return Buffer.from(ENCRYPTION_KEY, 'hex')
}

export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    return text
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('[Encryption] Failed to encrypt:', error)
    throw new Error('Encryption failed')
  }
}

export function decrypt(encryptedText: string): string {
  if (!ENCRYPTION_KEY) {
    return encryptedText
  }

  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format')
    }

    const ivHex = parts[0]
    const authTagHex = parts[1]
    const encrypted = parts[2]

    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted format')
    }

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('[Encryption] Failed to decrypt:', error)
    throw new Error('Decryption failed')
  }
}

export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
