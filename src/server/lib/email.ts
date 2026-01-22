import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Eziox <noreply@eziox.link>'
const APP_URL = process.env.APP_URL || 'https://eziox.link'

interface EmailResult {
  success: boolean
  error?: string
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  username: string,
): Promise<EmailResult> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  try {
    const { error } = await getResend().emails.send({
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
  timestamp: Date,
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
    const { error } = await getResend().emails.send({
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
  username: string,
): Promise<EmailResult> {
  try {
    const { error } = await getResend().emails.send({
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

export async function sendEmailVerificationEmail(
  to: string,
  username: string,
  token: string,
): Promise<EmailResult> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Verify your Eziox email address',
      html: generateEmailTemplate({
        title: 'Verify Your Email',
        subtitle: `Hey @${username}, please verify your email address to complete your registration.`,
        content: `
          <p style="margin: 0 0 24px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
            Click the button below to verify your email address and activate all features of your Eziox account.
          </p>
        `,
        buttonText: 'Verify Email',
        buttonUrl: verifyUrl,
        footer:
          "This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.",
      }),
    })

    if (error) {
      console.error('[Email] Failed to send verification email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending verification email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendPasswordChangedEmail(
  to: string,
  username: string,
  ipAddress: string,
  timestamp: Date,
): Promise<EmailResult> {
  const formattedTime = formatTimestamp(timestamp)

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Eziox password was changed',
      html: generateEmailTemplate({
        title: 'Password Changed',
        subtitle: `Hey @${username}, your password was successfully changed.`,
        content: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
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
        `,
        footer:
          'If you didn\'t make this change, please <a href="' +
          APP_URL +
          '/forgot-password" style="color: #8b5cf6;">reset your password</a> immediately and contact support.',
      }),
    })

    if (error) {
      console.error('[Email] Failed to send password changed email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending password changed email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendEmailChangedEmail(
  oldEmail: string,
  newEmail: string,
  username: string,
  timestamp: Date,
): Promise<EmailResult> {
  const formattedTime = formatTimestamp(timestamp)

  // Send to old email
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: oldEmail,
      subject: 'Your Eziox email address was changed',
      html: generateEmailTemplate({
        title: 'Email Address Changed',
        subtitle: `Hey @${username}, your email address was changed.`,
        content: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Old Email</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${oldEmail}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">New Email</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${newEmail}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Time</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">${formattedTime}</p>
              </td>
            </tr>
          </table>
        `,
        footer:
          'If you didn\'t make this change, please contact support immediately at <a href="mailto:support@eziox.link" style="color: #8b5cf6;">support@eziox.link</a>.',
      }),
    })

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending email changed notification:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendAccountDeletedEmail(
  to: string,
  username: string,
): Promise<EmailResult> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Eziox account has been deleted',
      html: generateEmailTemplate({
        title: 'Account Deleted',
        subtitle: `Goodbye @${username}, your account has been permanently deleted.`,
        content: `
          <p style="margin: 0 0 24px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
            All your data has been permanently removed from our servers, including:
          </p>
          <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.8;">
            <li>Your profile and bio page</li>
            <li>All your links and analytics data</li>
            <li>Connected accounts (Spotify, etc.)</li>
            <li>Session and activity history</li>
          </ul>
          <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
            We're sorry to see you go. If you ever want to come back, you're always welcome to create a new account.
          </p>
        `,
        footer:
          'Thank you for being part of Eziox. If you have any feedback, feel free to reach out at <a href="mailto:feedback@eziox.link" style="color: #8b5cf6;">feedback@eziox.link</a>.',
      }),
    })

    if (error) {
      console.error('[Email] Failed to send account deleted email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending account deleted email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function send2FAEnabledEmail(
  to: string,
  username: string,
  timestamp: Date,
): Promise<EmailResult> {
  const formattedTime = formatTimestamp(timestamp)

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Two-factor authentication enabled on your Eziox account',
      html: generateEmailTemplate({
        title: '2FA Enabled ✓',
        subtitle: `Hey @${username}, two-factor authentication is now active on your account.`,
        content: `
          <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #22c55e; text-align: center;">
              🔒 Your account is now more secure
            </p>
          </div>
          <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
            From now on, you'll need to enter a verification code from your authenticator app when signing in.
          </p>
          <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.5);">
            Enabled at: ${formattedTime}
          </p>
        `,
        footer:
          "Make sure to keep your recovery codes in a safe place. If you lose access to your authenticator app, you'll need them to sign in.",
      }),
    })

    if (error) {
      console.error('[Email] Failed to send 2FA enabled email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending 2FA enabled email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function send2FADisabledEmail(
  to: string,
  username: string,
  ipAddress: string,
  timestamp: Date,
): Promise<EmailResult> {
  const formattedTime = formatTimestamp(timestamp)

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: '⚠️ Two-factor authentication disabled on your Eziox account',
      html: generateEmailTemplate({
        title: '2FA Disabled',
        subtitle: `Hey @${username}, two-factor authentication was disabled on your account.`,
        content: `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #ef4444; text-align: center;">
              ⚠️ Your account security has been reduced
            </p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
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
        `,
        buttonText: 'Re-enable 2FA',
        buttonUrl: `${APP_URL}/profile/settings`,
        footer:
          "If you didn't make this change, please secure your account immediately by changing your password and re-enabling 2FA.",
      }),
    })

    if (error) {
      console.error('[Email] Failed to send 2FA disabled email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending 2FA disabled email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendSubscriptionEmail(
  to: string,
  username: string,
  tier: string,
  action: 'upgraded' | 'downgraded' | 'cancelled' | 'renewed',
): Promise<EmailResult> {
  const titles: Record<typeof action, string> = {
    upgraded: `Welcome to ${tier}! 🎉`,
    downgraded: 'Subscription Changed',
    cancelled: 'Subscription Cancelled',
    renewed: `${tier} Renewed ✓`,
  }

  const subtitles: Record<typeof action, string> = {
    upgraded: `Hey @${username}, you've been upgraded to ${tier}!`,
    downgraded: `Hey @${username}, your subscription has been changed.`,
    cancelled: `Hey @${username}, your subscription has been cancelled.`,
    renewed: `Hey @${username}, your ${tier} subscription has been renewed.`,
  }

  const contents: Record<typeof action, string> = {
    upgraded: `
      <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #8b5cf6; text-align: center;">
          ✨ Thank you for supporting Eziox!
        </p>
      </div>
      <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
        You now have access to all ${tier} features. Enjoy your enhanced experience!
      </p>
    `,
    downgraded: `
      <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
        Your subscription has been changed. Some features may no longer be available.
      </p>
    `,
    cancelled: `
      <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
        Your subscription has been cancelled. You'll continue to have access to your current features until the end of your billing period.
      </p>
      <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
        We'd love to have you back anytime. If you have feedback about why you cancelled, please let us know.
      </p>
    `,
    renewed: `
      <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
        Your ${tier} subscription has been renewed. Thank you for your continued support!
      </p>
    `,
  }

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: titles[action],
      html: generateEmailTemplate({
        title: titles[action],
        subtitle: subtitles[action],
        content: contents[action],
        buttonText:
          action === 'cancelled' ? 'Resubscribe' : 'View Your Account',
        buttonUrl:
          action === 'cancelled'
            ? `${APP_URL}/pricing`
            : `${APP_URL}/profile/settings`,
        footer:
          'Questions about your subscription? Contact us at <a href="mailto:billing@eziox.link" style="color: #8b5cf6;">billing@eziox.link</a>.',
      }),
    })

    if (error) {
      console.error('[Email] Failed to send subscription email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending subscription email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendWeeklyDigestEmail(
  to: string,
  username: string,
  stats: {
    profileViews: number
    linkClicks: number
    newFollowers: number
    topLink?: { title: string; clicks: number }
  },
): Promise<EmailResult> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your weekly Eziox stats 📊`,
      html: generateEmailTemplate({
        title: 'Weekly Stats',
        subtitle: `Hey @${username}, here's how your page performed this week.`,
        content: `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td style="padding: 16px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; text-align: center; width: 33%;">
                <p style="margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #8b5cf6;">${stats.profileViews}</p>
                <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Profile Views</p>
              </td>
              <td style="width: 8px;"></td>
              <td style="padding: 16px; background: rgba(34, 197, 94, 0.1); border-radius: 12px; text-align: center; width: 33%;">
                <p style="margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #22c55e;">${stats.linkClicks}</p>
                <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Link Clicks</p>
              </td>
              <td style="width: 8px;"></td>
              <td style="padding: 16px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; text-align: center; width: 33%;">
                <p style="margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #3b82f6;">${stats.newFollowers}</p>
                <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.5);">New Followers</p>
              </td>
            </tr>
          </table>
          ${
            stats.topLink
              ? `
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">🔥 Top Performing Link</p>
            <p style="margin: 0; font-size: 14px; color: #ffffff;">${stats.topLink.title} — <span style="color: #22c55e;">${stats.topLink.clicks} clicks</span></p>
          </div>
          `
              : ''
          }
        `,
        buttonText: 'View Full Analytics',
        buttonUrl: `${APP_URL}/profile/analytics`,
        footer:
          'You can manage your email preferences in your <a href="' +
          APP_URL +
          '/profile/settings" style="color: #8b5cf6;">account settings</a>.',
      }),
    })

    if (error) {
      console.error('[Email] Failed to send weekly digest:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[Email] Error sending weekly digest:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

// Helper function to generate consistent email templates
function generateEmailTemplate(options: {
  title: string
  subtitle: string
  content: string
  buttonText?: string
  buttonUrl?: string
  footer?: string
}): string {
  const { title, subtitle, content, buttonText, buttonUrl, footer } = options

  return `
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
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #ffffff;">${title}</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.6);">${subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px;">
              ${content}
              ${
                buttonText && buttonUrl
                  ? `
              <a href="${buttonUrl}" style="display: block; padding: 16px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; border-radius: 12px; margin-top: 24px;">
                ${buttonText}
              </a>
              `
                  : ''
              }
              ${
                footer
                  ? `
              <p style="margin: 24px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); text-align: center;">
                ${footer}
              </p>
              `
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                © ${new Date().getFullYear()} Eziox. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: rgba(255, 255, 255, 0.3);">
                <a href="${APP_URL}/privacy" style="color: rgba(255, 255, 255, 0.4); text-decoration: none;">Privacy</a> · 
                <a href="${APP_URL}/terms" style="color: rgba(255, 255, 255, 0.4); text-decoration: none;">Terms</a> · 
                <a href="${APP_URL}/profile/settings" style="color: rgba(255, 255, 255, 0.4); text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
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

// ============================================================================
// CONTACT FORM EMAILS
// ============================================================================

interface ContactNotificationData {
  category: string
  name: string
  email: string
  subject: string
  message: string
  messageId: string
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: 'General Inquiry', color: '#6366f1' },
  support: { label: 'Technical Support', color: '#ef4444' },
  partnership: { label: 'Partnership', color: '#22c55e' },
  feature: { label: 'Feature Request', color: '#f59e0b' },
  security: { label: 'Security', color: '#8b5cf6' },
}

export async function sendContactNotificationEmail(
  data: ContactNotificationData,
): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL || 'support@eziox.link'
  const categoryInfo = CATEGORY_LABELS[data.category] || {
    label: data.category,
    color: '#6b7280',
  }

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `[${categoryInfo.label}] ${data.subject}`,
      replyTo: data.email,
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 32px; text-align: left;">
              <div style="display: inline-block; padding: 6px 14px; background: ${categoryInfo.color}25; border: 1px solid ${categoryInfo.color}50; border-radius: 20px; margin-bottom: 20px;">
                <span style="color: ${categoryInfo.color}; font-size: 12px; font-weight: 600;">${categoryInfo.label}</span>
              </div>
              
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #ffffff;">
                New Contact Message
              </h1>
              <p style="margin: 0 0 24px; font-size: 14px; color: rgba(255, 255, 255, 0.6);">
                Message ID: ${data.messageId}
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                    <p style="margin: 0; font-size: 15px; color: #ffffff; font-weight: 500;">${data.name}</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7);">${data.email}</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                    <p style="margin: 0; font-size: 15px; color: #ffffff; font-weight: 500;">${data.subject}</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(0, 0, 0, 0.3); border-radius: 12px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                    <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5);">
                Reply directly to this email to respond to the sender.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                © ${new Date().getFullYear()} Eziox Contact System
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
      console.error('Failed to send contact notification email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send contact notification email:', error)
    return { success: false, error: 'Failed to send notification email' }
  }
}

export async function sendContactConfirmationEmail(
  to: string,
  name: string,
  subject: string,
  category: string,
): Promise<EmailResult> {
  const categoryInfo = CATEGORY_LABELS[category] || {
    label: category,
    color: '#6b7280',
  }

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'We received your message - Eziox',
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
              
              <div style="width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 28px;">✓</span>
              </div>
              
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #ffffff;">
                Message Received!
              </h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                Hi ${name}, thank you for reaching out to us. We've received your message and will get back to you soon.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; margin-bottom: 24px; text-align: left;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Category</p>
                    <p style="margin: 0 0 12px; font-size: 14px; color: ${categoryInfo.color}; font-weight: 500;">${categoryInfo.label}</p>
                    <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Subject</p>
                    <p style="margin: 0; font-size: 14px; color: #ffffff;">${subject}</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #6366f1;">Expected Response Time</p>
                    <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.8);">
                      ${category === 'security' ? 'Priority - Within 24 hours' : category === 'support' ? '12-24 hours' : '24-48 hours'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255, 255, 255, 0.6);">
                Need faster help? Join our Discord community!
              </p>
              <a href="https://discord.com/invite/KD84DmNA89" style="display: inline-block; padding: 10px 20px; background: #5865f2; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500;">
                Join Discord
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
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
      console.error('Failed to send contact confirmation email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send contact confirmation email:', error)
    return { success: false, error: 'Failed to send confirmation email' }
  }
}
