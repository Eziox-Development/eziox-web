import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Eziox <noreply@eziox.link>'
const APP_URL = process.env.APP_URL || 'https://eziox.link'

interface EmailResult {
  success: boolean
  error?: string
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  username: string
): Promise<EmailResult> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your Eziox password',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <img src="${APP_URL}/icon.png" alt="Eziox" width="48" height="48" style="border-radius: 12px; margin-bottom: 24px;">
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #ffffff;">Password Reset</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.6);">Hey @${username}, we received a request to reset your password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px;">
              <a href="${resetUrl}" style="display: block; padding: 16px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; border-radius: 12px;">
                Reset Password
              </a>
              <p style="margin: 24px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); text-align: center;">
                This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                © ${new Date().getFullYear()} Eziox. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error('[Email] Failed to send password reset:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending password reset:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendLoginNotificationEmail(
  to: string,
  username: string,
  ipAddress: string,
  userAgent: string,
  timestamp: Date
): Promise<EmailResult> {
  const deviceInfo = parseUserAgent(userAgent)
  const formattedTime = timestamp.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'New login to your Eziox account',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <img src="${APP_URL}/icon.png" alt="Eziox" width="48" height="48" style="border-radius: 12px; margin-bottom: 24px;">
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #ffffff;">New Login Detected</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.6);">Hey @${username}, we noticed a new login to your account.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Device</p>
                    <p style="margin: 0; font-size: 14px; color: #ffffff;">${deviceInfo}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">IP Address</p>
                    <p style="margin: 0; font-size: 14px; color: #ffffff;">${ipAddress}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Time</p>
                    <p style="margin: 0; font-size: 14px; color: #ffffff;">${formattedTime}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); text-align: center;">
                If this wasn't you, please <a href="${APP_URL}/forgot-password" style="color: #8b5cf6;">reset your password</a> immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                © ${new Date().getFullYear()} Eziox. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error('[Email] Failed to send login notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending login notification:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendWelcomeEmail(
  to: string,
  username: string
): Promise<EmailResult> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Eziox! 🎉',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <img src="${APP_URL}/icon.png" alt="Eziox" width="48" height="48" style="border-radius: 12px; margin-bottom: 24px;">
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #ffffff;">Welcome to Eziox! 🎉</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.6);">Hey @${username}, your bio link page is ready!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px;">
              <p style="margin: 0 0 24px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                You can now create your personalized bio link page and share it with your audience. Add your links, customize your profile, and start growing your online presence.
              </p>
              <a href="${APP_URL}/${username}" style="display: block; padding: 16px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; border-radius: 12px;">
                View Your Page
              </a>
              <p style="margin: 24px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); text-align: center;">
                Your page: <a href="${APP_URL}/${username}" style="color: #8b5cf6;">eziox.link/${username}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                © ${new Date().getFullYear()} Eziox. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error('[Email] Failed to send welcome email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending welcome email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

function parseUserAgent(ua: string): string {
  if (!ua) return 'Unknown device'

  let browser = 'Unknown browser'
  let os = 'Unknown OS'

  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'

  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return `${browser} on ${os}`
}
