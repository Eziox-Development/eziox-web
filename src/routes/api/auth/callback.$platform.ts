/**
 * OAuth Callback Handler
 * Handles callbacks from Discord (login/signup + social integration), Steam, Twitch, GitHub
 */

import { createFileRoute } from '@tanstack/react-router'
import {
  handleOAuthCallbackFn,
  SUPPORTED_PLATFORMS,
} from '@/server/functions/social-integrations'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { db } from '@/server/db'
import { users, profiles, userStats, sessions, socialIntegrations } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { parseUserAgent, formatUserAgent } from '@/server/lib/user-agent'
import { anonymizeIP } from '@/server/lib/ip-utils'
import { getRequestIP, getRequestHeader } from '@tanstack/react-start/server'
import { logSecurityEventLegacy as logSecurityEvent } from '@/server/lib/security-monitoring'
import { moderateUsername } from '@/server/lib/content-moderation'
import { checkBanStatus } from '@/server/lib/account-suspension'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateToken(length = 64): string {
  return crypto.randomBytes(length).toString('base64url')
}

async function deriveUsername(base: string): Promise<string> {
  const clean = base.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 28)
  const candidate = clean.length >= 3 ? clean : `user_${clean}`
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, candidate))
    .limit(1)
  if (!existing) return candidate
  const suffix = crypto.randomBytes(3).toString('hex')
  return `${candidate.slice(0, 22)}_${suffix}`
}

async function handleDiscordLogin(
  code: string,
  state: string,
  baseUrl: string,
): Promise<Response> {
  const redirect = (path: string) =>
    new Response(null, { status: 302, headers: { Location: `${baseUrl}${path}` } })

  const clientId = process.env.DISCORD_LOGIN_CLIENT_ID || process.env.DISCORD_CLIENT_ID || ''
  const clientSecret = process.env.DISCORD_LOGIN_CLIENT_SECRET || process.env.DISCORD_CLIENT_SECRET || ''
  const redirectUri =
    process.env.DISCORD_LOGIN_REDIRECT_URI ||
    `${baseUrl}/api/auth/callback/discord`

  if (!clientId || !clientSecret) {
    return redirect(`/sign-in?error=discord_not_configured`)
  }

  let mode: 'login' | 'signup' = 'login'
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString())
    mode = parsed.mode === 'signup' ? 'signup' : 'login'
  } catch { /* default login */ }

  // Exchange code for access token
  let accessToken: string
  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })
    if (!tokenRes.ok) {
      console.error('Discord token exchange failed:', await tokenRes.text())
      return redirect(`/sign-in?error=discord_token_failed`)
    }
    const tokenData = await tokenRes.json()
    accessToken = tokenData.access_token
  } catch (err) {
    console.error('Discord token exchange error:', err)
    return redirect(`/sign-in?error=discord_token_failed`)
  }

  // Fetch Discord user
  let discordUser: { id: string; username: string; email?: string; avatar?: string; global_name?: string }
  try {
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!userRes.ok) return redirect(`/sign-in?error=discord_user_failed`)
    discordUser = await userRes.json()
  } catch {
    return redirect(`/sign-in?error=discord_user_failed`)
  }

  const rawIP = getRequestIP() || 'unknown'
  const ip = anonymizeIP(rawIP)
  const userAgentRaw = getRequestHeader('User-Agent') || null
  const userAgentFormatted = formatUserAgent(parseUserAgent(userAgentRaw))

  try {
    // Check if Discord ID already linked
    const [existingIntegration] = await db
      .select({ userId: socialIntegrations.userId })
      .from(socialIntegrations)
      .where(
        and(
          eq(socialIntegrations.platform, 'discord'),
          eq(socialIntegrations.platformUserId, discordUser.id),
        ),
      )
      .limit(1)

    let userId: string

    if (existingIntegration) {
      userId = existingIntegration.userId
      const banStatus = await checkBanStatus(userId)
      if (banStatus.isBanned) return redirect(`/sign-in?error=account_suspended`)

      await db
        .update(socialIntegrations)
        .set({ platformUsername: discordUser.username, updatedAt: new Date() })
        .where(
          and(
            eq(socialIntegrations.userId, userId),
            eq(socialIntegrations.platform, 'discord'),
          ),
        )
      logSecurityEvent('auth.login_success', { userId, ip, userAgent: userAgentFormatted })
    } else {
      // Try to find by email
      const existingUser = discordUser.email
        ? await db
            .select()
            .from(users)
            .where(eq(users.email, discordUser.email.toLowerCase()))
            .limit(1)
            .then((r) => r[0] ?? null)
        : null

      if (existingUser) {
        userId = existingUser.id
        const banStatus = await checkBanStatus(userId)
        if (banStatus.isBanned) return redirect(`/sign-in?error=account_suspended`)
      } else {
        if (mode === 'login') {
          return redirect(`/sign-up?discord=no_account`)
        }

        const username = await deriveUsername(discordUser.global_name || discordUser.username)
        const usernameCheck = await moderateUsername(username)
        const safeUsername = usernameCheck.isAllowed
          ? username
          : await deriveUsername(`user_${discordUser.id.slice(-6)}`)

        const randomPassword = crypto.randomBytes(32).toString('hex')
        const passwordHash = await bcrypt.hash(randomPassword, 12)
        const email = discordUser.email?.toLowerCase() || `discord_${discordUser.id}@noemail.eziox.link`

        const [newUser] = await db
          .insert(users)
          .values({
            email,
            username: safeUsername,
            passwordHash,
            name: discordUser.global_name || discordUser.username,
            emailVerified: !!discordUser.email,
          })
          .returning()

        if (!newUser) return redirect(`/sign-up?error=discord_create_failed`)

        await db.insert(profiles).values({
          userId: newUser.id,
          avatar: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : undefined,
        })
        await db.insert(userStats).values({ userId: newUser.id })
        userId = newUser.id

        try {
          const { sendWelcomeEmail } = await import('@/server/lib/email')
          void sendWelcomeEmail(email, safeUsername)
        } catch { /* non-critical */ }

        logSecurityEvent('auth.signup', { userId, ip, userAgent: userAgentFormatted })
      }

      // Link Discord integration
      await db
        .insert(socialIntegrations)
        .values({
          userId,
          platform: 'discord',
          platformUserId: discordUser.id,
          platformUsername: discordUser.username,
          accessToken,
          showOnProfile: true,
          metadata: {
            globalName: discordUser.global_name,
            avatar: discordUser.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : undefined,
          },
        })
        .onConflictDoNothing()
    }

    // Create session
    const token = generateToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await db.insert(sessions).values({
      userId,
      token: tokenHash,
      expiresAt,
      userAgent: userAgentFormatted,
      ipAddress: ip,
      rememberMe: false,
    })

    setCookie('session-token', token, COOKIE_OPTIONS)
    return redirect(`/`)
  } catch (err) {
    console.error('Discord login callback error:', err)
    return redirect(`/sign-in?error=discord_callback_failed`)
  }
}

export const Route = createFileRoute('/api/auth/callback/$platform')({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request
        params: { platform: string }
      }) => {
        const { platform } = params
        const url = new URL(request.url)
        const baseUrl = process.env.APP_URL || 'https://eziox.link'

        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        const errorParam = url.searchParams.get('error')

        // Discord login/signup flow — detected via discord_login_state cookie
        if (platform === 'discord') {
          const loginState = getCookie('discord_login_state')
          if (loginState && state && loginState === state) {
            deleteCookie('discord_login_state')
            if (errorParam) {
              return new Response(null, {
                status: 302,
                headers: { Location: `${baseUrl}/sign-in?error=discord_denied` },
              })
            }
            if (!code || !state) {
              return new Response(null, {
                status: 302,
                headers: { Location: `${baseUrl}/sign-in?error=discord_missing_params` },
              })
            }
            return handleDiscordLogin(code, state, baseUrl)
          }
          // Fall through to social integration flow if no login state cookie
        }

        // Validate platform for social integration flow
        if (
          !SUPPORTED_PLATFORMS.includes(
            platform as (typeof SUPPORTED_PLATFORMS)[number],
          )
        ) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: `${baseUrl}/profile?tab=integrations&error=invalid_platform`,
            },
          })
        }

        // Steam uses OpenID, extract Steam ID from claimed_id
        let steamId: string | null = null
        if (platform === 'steam') {
          const claimedId = url.searchParams.get('openid.claimed_id')
          if (claimedId) {
            const match = claimedId.match(/\/id\/(\d+)$/)
            steamId = match && match[1] ? match[1] : null
          }
        }

        const authCode: string | null = platform === 'steam' ? steamId : code

        if (!authCode || !state) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: `${baseUrl}/profile?tab=integrations&error=missing_params`,
            },
          })
        }

        try {
          const result = await handleOAuthCallbackFn({
            data: {
              platform: platform as (typeof SUPPORTED_PLATFORMS)[number],
              code: authCode,
              state,
            },
          })

          if ('error' in result && result.error) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/profile?tab=integrations&error=${result.error}`,
              },
            })
          }

          return new Response(null, {
            status: 302,
            headers: {
              Location: `${baseUrl}/profile?tab=integrations&success=${platform}`,
            },
          })
        } catch (error) {
          console.error('OAuth callback error:', error)
          return new Response(null, {
            status: 302,
            headers: {
              Location: `${baseUrl}/profile?tab=integrations&error=callback_failed`,
            },
          })
        }
      },
    },
  },
})
