const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || ''
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstileToken(
  token: string,
  ip?: string,
): Promise<{ success: boolean; error?: string }> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn('[Turnstile] Secret key not configured, skipping verification')
    return { success: true }
  }

  if (!token) {
    return { success: false, error: 'Token is required' }
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
      return { success: false, error: 'Verification service unavailable' }
    }

    const data: TurnstileResponse = await response.json()

    if (!data.success) {
      const errorCodes = data['error-codes'] || []
      console.warn('[Turnstile] Verification failed:', errorCodes)

      // Handle specific error cases
      if (errorCodes.includes('timeout-or-duplicate')) {
        return {
          success: false,
          error:
            'Token expired or already used. Please refresh the page and try again.',
        }
      }
      if (errorCodes.includes('invalid-input-response')) {
        return {
          success: false,
          error:
            'Invalid verification token. Please refresh the page and try again.',
        }
      }
      if (errorCodes.includes('missing-input-response')) {
        return {
          success: false,
          error: 'Verification required. Please complete the bot check.',
        }
      }

      return {
        success: false,
        error:
          'Bot verification failed. Please refresh the page and try again.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[Turnstile] Verification error:', error)
    return { success: false, error: 'Verification service error' }
  }
}
