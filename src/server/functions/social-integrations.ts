import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getCookie,
  setCookie,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { db } from '../db'
import { socialIntegrations } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import { encrypt } from '../lib/encryption'

async function getAuthenticatedUser() {
  const token = getCookie('session-token')
  if (!token) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }
  const user = await validateSession(token)
  if (!user) {
    setResponseStatus(401)
    throw { message: 'Invalid session', status: 401 }
  }
  return user
}

// Supported platforms with easy OAuth APIs
export const SUPPORTED_PLATFORMS = [
  'discord',
  'steam',
  'twitch',
  'github',
] as const
export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number]

// Platform configurations
const PLATFORM_CONFIG: Record<
  SupportedPlatform,
  {
    name: string
    authUrl: string
    tokenUrl: string
    apiUrl: string
    scopes: string[]
    color: string
    icon: string
  }
> = {
  discord: {
    name: 'Discord',
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    apiUrl: 'https://discord.com/api/v10',
    scopes: ['identify'],
    color: '#5865F2',
    icon: 'discord',
  },
  steam: {
    name: 'Steam',
    authUrl: 'https://steamcommunity.com/openid/login',
    tokenUrl: '',
    apiUrl: 'https://api.steampowered.com',
    scopes: [],
    color: '#1b2838',
    icon: 'steam',
  },
  twitch: {
    name: 'Twitch',
    authUrl: 'https://id.twitch.tv/oauth2/authorize',
    tokenUrl: 'https://id.twitch.tv/oauth2/token',
    apiUrl: 'https://api.twitch.tv/helix',
    scopes: ['user:read:email'],
    color: '#9146FF',
    icon: 'twitch',
  },
  github: {
    name: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    apiUrl: 'https://api.github.com',
    scopes: ['read:user'],
    color: '#333333',
    icon: 'github',
  },
}

const getClientCredentials = (platform: SupportedPlatform) => {
  const envPrefix = platform.toUpperCase()
  const baseUrl = process.env.APP_URL || 'https://eziox.link'
  return {
    clientId: process.env[`${envPrefix}_CLIENT_ID`] || '',
    clientSecret: process.env[`${envPrefix}_CLIENT_SECRET`] || '',
    redirectUri:
      process.env[`${envPrefix}_REDIRECT_URI`] ||
      `${baseUrl}/api/auth/callback/${platform}`,
  }
}

// Get OAuth URL for a platform
export const getOAuthUrlFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ platform: z.enum(SUPPORTED_PLATFORMS) }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const { platform } = data
    const config = PLATFORM_CONFIG[platform]
    const credentials = getClientCredentials(platform)

    if (!credentials.clientId) {
      return { error: `${config.name} integration not configured` }
    }

    const state = Buffer.from(
      JSON.stringify({ userId: user.id, platform, timestamp: Date.now() }),
    ).toString('base64')

    setCookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    if (platform === 'steam') {
      const params = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': `${credentials.redirectUri}?state=${state}`,
        'openid.realm': process.env.APP_URL || 'https://eziox.link',
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id':
          'http://specs.openid.net/auth/2.0/identifier_select',
      })
      return { url: `${config.authUrl}?${params.toString()}` }
    }

    const params = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: credentials.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
    })

    return { url: `${config.authUrl}?${params.toString()}` }
  })

async function exchangeCodeForTokens(
  platform: SupportedPlatform,
  code: string,
): Promise<{
  accessToken: string
  refreshToken?: string
  expiresIn?: number
} | null> {
  const config = PLATFORM_CONFIG[platform]
  const credentials = getClientCredentials(platform)

  if (platform === 'steam') {
    return { accessToken: code }
  }

  const body = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: credentials.redirectUri,
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  if (platform === 'github') {
    headers['Accept'] = 'application/json'
  }

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers,
      body,
    })

    if (!response.ok) {
      console.error(
        `Failed to exchange ${platform} code:`,
        await response.text(),
      )
      return null
    }

    const responseData = await response.json()
    return {
      accessToken: responseData.access_token,
      refreshToken: responseData.refresh_token,
      expiresIn: responseData.expires_in,
    }
  } catch (error) {
    console.error(`Error exchanging ${platform} code:`, error)
    return null
  }
}

async function fetchPlatformUser(
  platform: SupportedPlatform,
  accessToken: string,
): Promise<{
  id: string
  username: string
  avatar?: string
  metadata?: Record<string, unknown>
} | null> {
  const config = PLATFORM_CONFIG[platform]
  const credentials = getClientCredentials(platform)

  try {
    if (platform === 'discord') {
      const response = await fetch(`${config.apiUrl}/users/@me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!response.ok) return null
      const responseData = await response.json()
      return {
        id: responseData.id,
        username: responseData.username,
        avatar: responseData.avatar
          ? `https://cdn.discordapp.com/avatars/${responseData.id}/${responseData.avatar}.png`
          : undefined,
        metadata: {
          discriminator: responseData.discriminator,
          globalName: responseData.global_name,
        },
      }
    }

    if (platform === 'steam') {
      const steamId = accessToken
      const response = await fetch(
        `${config.apiUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${credentials.clientSecret}&steamids=${steamId}`,
      )
      if (!response.ok) return null
      const responseData = await response.json()
      const player = responseData.response?.players?.[0]
      if (!player) return null
      return {
        id: steamId,
        username: player.personaname,
        avatar: player.avatarfull,
        metadata: {
          profileUrl: player.profileurl,
          personaState: player.personastate,
        },
      }
    }

    if (platform === 'twitch') {
      const response = await fetch(`${config.apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-Id': credentials.clientId,
        },
      })
      if (!response.ok) return null
      const responseData = await response.json()
      const twitchUser = responseData.data?.[0]
      if (!twitchUser) return null
      return {
        id: twitchUser.id,
        username: twitchUser.login,
        avatar: twitchUser.profile_image_url,
        metadata: {
          displayName: twitchUser.display_name,
          broadcasterType: twitchUser.broadcaster_type,
        },
      }
    }

    if (platform === 'github') {
      const response = await fetch(`${config.apiUrl}/user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!response.ok) return null
      const responseData = await response.json()
      return {
        id: String(responseData.id),
        username: responseData.login,
        avatar: responseData.avatar_url,
        metadata: {
          name: responseData.name,
          bio: responseData.bio,
          publicRepos: responseData.public_repos,
        },
      }
    }

    return null
  } catch (error) {
    console.error(`Error fetching ${platform} user:`, error)
    return null
  }
}

// Handle OAuth callback
export const handleOAuthCallbackFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      platform: z.enum(SUPPORTED_PLATFORMS),
      code: z.string(),
      state: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const storedState = getCookie('oauth_state')
    if (!storedState || storedState !== data.state) {
      return { error: 'Invalid state parameter' }
    }

    const { platform, code } = data

    const tokens = await exchangeCodeForTokens(platform, code)
    if (!tokens) {
      return { error: 'Failed to authenticate with platform' }
    }

    const platformUser = await fetchPlatformUser(platform, tokens.accessToken)
    if (!platformUser) {
      return { error: 'Failed to fetch user info from platform' }
    }

    const existing = await db
      .select()
      .from(socialIntegrations)
      .where(
        and(
          eq(socialIntegrations.userId, user.id),
          eq(socialIntegrations.platform, platform),
        ),
      )
      .limit(1)

    const expiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000)
      : null

    if (existing.length > 0) {
      await db
        .update(socialIntegrations)
        .set({
          platformUserId: platformUser.id,
          platformUsername: platformUser.username,
          accessToken: encrypt(tokens.accessToken),
          refreshToken: tokens.refreshToken
            ? encrypt(tokens.refreshToken)
            : null,
          expiresAt,
          metadata: platformUser.metadata,
          updatedAt: new Date(),
        })
        .where(eq(socialIntegrations.id, existing[0]!.id))
    } else {
      await db.insert(socialIntegrations).values({
        userId: user.id,
        platform,
        platformUserId: platformUser.id,
        platformUsername: platformUser.username,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
        expiresAt,
        metadata: platformUser.metadata,
        showOnProfile: true,
      })
    }

    return {
      success: true,
      platform,
      username: platformUser.username,
      avatar: platformUser.avatar,
    }
  })

// Get user's connected platforms
export const getConnectedPlatformsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const user = await getAuthenticatedUser()

  const integrations = await db
    .select({
      id: socialIntegrations.id,
      platform: socialIntegrations.platform,
      platformUsername: socialIntegrations.platformUsername,
      showOnProfile: socialIntegrations.showOnProfile,
      metadata: socialIntegrations.metadata,
      createdAt: socialIntegrations.createdAt,
    })
    .from(socialIntegrations)
    .where(eq(socialIntegrations.userId, user.id))

  return {
    integrations: integrations.map((i) => ({
      ...i,
      metadata: i.metadata as Record<string, string | number | boolean> | null,
      config: PLATFORM_CONFIG[i.platform as SupportedPlatform],
    })),
  }
})

// Disconnect a platform
export const disconnectPlatformFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ platform: z.enum(SUPPORTED_PLATFORMS) }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    await db
      .delete(socialIntegrations)
      .where(
        and(
          eq(socialIntegrations.userId, user.id),
          eq(socialIntegrations.platform, data.platform),
        ),
      )

    return { success: true }
  })

// Toggle show on profile
export const toggleShowOnProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({ platform: z.enum(SUPPORTED_PLATFORMS), show: z.boolean() }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    await db
      .update(socialIntegrations)
      .set({ showOnProfile: data.show, updatedAt: new Date() })
      .where(
        and(
          eq(socialIntegrations.userId, user.id),
          eq(socialIntegrations.platform, data.platform),
        ),
      )

    return { success: true }
  })

// Get available platforms (with configuration status)
export const getAvailablePlatformsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  return {
    platforms: SUPPORTED_PLATFORMS.map((platform) => {
      const credentials = getClientCredentials(platform)
      const config = PLATFORM_CONFIG[platform]
      return {
        id: platform,
        name: config.name,
        color: config.color,
        icon: config.icon,
        configured: !!credentials.clientId,
      }
    }),
  }
})

// Get public integrations for a user (for bio page)
export const getPublicIntegrationsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const integrations = await db
      .select({
        platform: socialIntegrations.platform,
        platformUsername: socialIntegrations.platformUsername,
        metadata: socialIntegrations.metadata,
      })
      .from(socialIntegrations)
      .where(
        and(
          eq(socialIntegrations.userId, data.userId),
          eq(socialIntegrations.showOnProfile, true),
        ),
      )

    return {
      integrations: integrations.map((i) => ({
        ...i,
        metadata: i.metadata as Record<
          string,
          string | number | boolean
        > | null,
        config: PLATFORM_CONFIG[i.platform as SupportedPlatform],
      })),
    }
  })
