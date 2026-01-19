const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || ''
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn('[Turnstile] Secret key not configured, skipping verification')
    return true
  }

  if (!token) {
    return false
  }

  try {
    const formData = new URLSearchParams()
    formData.append('secret', TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    if (ip) {
      formData.append('remoteip', ip)
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      console.error('[Turnstile] Verification request failed:', response.status)
      return false
    }

    const data: TurnstileResponse = await response.json()

    if (!data.success) {
      console.warn('[Turnstile] Verification failed:', data['error-codes'])
      return false
    }

    return true
  } catch (error) {
    console.error('[Turnstile] Verification error:', error)
    return false
  }
}
