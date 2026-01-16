import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { spotifyConnections } from '../db/schema'
import { eq } from 'drizzle-orm'
import { validateSession } from '../lib/auth'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!

const SPOTIFY_SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-read-recently-played',
].join(' ')

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string; id: string }[]
  album: {
    name: string
    images: { url: string; width: number; height: number }[]
  }
  external_urls: { spotify: string }
  duration_ms: number
  preview_url: string | null
}

export interface SpotifyPlaybackState {
  is_playing: boolean
  progress_ms: number
  item: SpotifyTrack | null
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
}

export interface NowPlayingData {
  isPlaying: boolean
  track: {
    id: string
    name: string
    artist: string
    artists: string[]
    album: string
    albumArt: string
    spotifyUrl: string
    duration: number
    progress: number
    previewUrl: string | null
  } | null
}

async function refreshAccessToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      console.error('Failed to refresh Spotify token:', await response.text())
      return null
    }

    const data = await response.json()
    const expiresAt = new Date(Date.now() + data.expires_in * 1000)

    await db
      .update(spotifyConnections)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(spotifyConnections.userId, userId))

    return data.access_token
  } catch (error) {
    console.error('Error refreshing Spotify token:', error)
    return null
  }
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const connection = await db.query.spotifyConnections.findFirst({
    where: eq(spotifyConnections.userId, userId),
  })

  if (!connection) return null

  if (new Date() >= connection.expiresAt) {
    return refreshAccessToken(userId, connection.refreshToken)
  }

  return connection.accessToken
}

export const getSpotifyAuthUrlFn = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie('session-token')
  if (!token) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }

  const user = await validateSession(token)
  if (!user) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    setResponseStatus(500)
    throw { message: 'Spotify integration not configured', status: 500 }
  }

  const state = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString('base64')

  setCookie('spotify-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  })

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: 'true',
  })

  return { url: `${SPOTIFY_AUTH_URL}?${params.toString()}` }
})

export const handleSpotifyCallbackFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ code: z.string(), state: z.string() }))
  .handler(async ({ data }) => {
    const { code, state } = data

    const savedState = getCookie('spotify-state')
    if (!savedState || savedState !== state) {
      setResponseStatus(400)
      throw { message: 'Invalid state parameter', status: 400 }
    }

    let stateData: { userId: string; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      setResponseStatus(400)
      throw { message: 'Invalid state format', status: 400 }
    }

    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      setResponseStatus(400)
      throw { message: 'State expired', status: 400 }
    }

    const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Spotify token error:', error)
      setResponseStatus(400)
      throw { message: 'Failed to exchange code for token', status: 400 }
    }

    const tokenData = await tokenResponse.json()
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    const existing = await db.query.spotifyConnections.findFirst({
      where: eq(spotifyConnections.userId, stateData.userId),
    })

    if (existing) {
      await db
        .update(spotifyConnections)
        .set({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt,
          scope: tokenData.scope,
          updatedAt: new Date(),
        })
        .where(eq(spotifyConnections.userId, stateData.userId))
    } else {
      await db.insert(spotifyConnections).values({
        userId: stateData.userId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        scope: tokenData.scope,
      })
    }

    return { success: true }
  })

export const getSpotifyConnectionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie('session-token')
  if (!token) return null

  const user = await validateSession(token)
  if (!user) return null

  const connection = await db.query.spotifyConnections.findFirst({
    where: eq(spotifyConnections.userId, user.id),
  })

  if (!connection) return null

  return {
    connected: true,
    showOnProfile: connection.showOnProfile,
    connectedAt: connection.createdAt.toISOString(),
  }
})

export const disconnectSpotifyFn = createServerFn({ method: 'POST' }).handler(async () => {
  const token = getCookie('session-token')
  if (!token) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }

  const user = await validateSession(token)
  if (!user) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }

  await db.delete(spotifyConnections).where(eq(spotifyConnections.userId, user.id))

  return { success: true }
})

export const updateSpotifySettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ showOnProfile: z.boolean() }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(token)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    await db
      .update(spotifyConnections)
      .set({ showOnProfile: data.showOnProfile, updatedAt: new Date() })
      .where(eq(spotifyConnections.userId, user.id))

    return { success: true }
  })

export const getNowPlayingFn = createServerFn({ method: 'GET' }).handler(async (): Promise<NowPlayingData> => {
  const token = getCookie('session-token')
  if (!token) return { isPlaying: false, track: null }

  const user = await validateSession(token)
  if (!user) return { isPlaying: false, track: null }

  const accessToken = await getValidAccessToken(user.id)
  if (!accessToken) return { isPlaying: false, track: null }

  try {
    const response = await fetch(`${SPOTIFY_API_URL}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (response.status === 204) {
      return { isPlaying: false, track: null }
    }

    if (!response.ok) {
      console.error('Spotify API error:', response.status)
      return { isPlaying: false, track: null }
    }

    const data: SpotifyPlaybackState = await response.json()

    if (!data.item || data.currently_playing_type !== 'track') {
      return { isPlaying: false, track: null }
    }

    return {
      isPlaying: data.is_playing,
      track: {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists.map((a) => a.name).join(', '),
        artists: data.item.artists.map((a) => a.name),
        album: data.item.album.name,
        albumArt: data.item.album.images[0]?.url || '',
        spotifyUrl: data.item.external_urls.spotify,
        duration: data.item.duration_ms,
        progress: data.progress_ms,
        previewUrl: data.item.preview_url,
      },
    }
  } catch (error) {
    console.error('Error fetching now playing:', error)
    return { isPlaying: false, track: null }
  }
})

export const getUserNowPlayingFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data }): Promise<NowPlayingData> => {
    const connection = await db.query.spotifyConnections.findFirst({
      where: eq(spotifyConnections.userId, data.userId),
    })

    if (!connection || !connection.showOnProfile) {
      return { isPlaying: false, track: null }
    }

    const accessToken = await getValidAccessToken(data.userId)
    if (!accessToken) return { isPlaying: false, track: null }

    try {
      const response = await fetch(`${SPOTIFY_API_URL}/me/player/currently-playing`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (response.status === 204) {
        return { isPlaying: false, track: null }
      }

      if (!response.ok) {
        return { isPlaying: false, track: null }
      }

      const playbackData: SpotifyPlaybackState = await response.json()

      if (!playbackData.item || playbackData.currently_playing_type !== 'track') {
        return { isPlaying: false, track: null }
      }

      return {
        isPlaying: playbackData.is_playing,
        track: {
          id: playbackData.item.id,
          name: playbackData.item.name,
          artist: playbackData.item.artists.map((a) => a.name).join(', '),
          artists: playbackData.item.artists.map((a) => a.name),
          album: playbackData.item.album.name,
          albumArt: playbackData.item.album.images[0]?.url || '',
          spotifyUrl: playbackData.item.external_urls.spotify,
          duration: playbackData.item.duration_ms,
          progress: playbackData.progress_ms,
          previewUrl: playbackData.item.preview_url,
        },
      }
    } catch (error) {
      console.error('Error fetching user now playing:', error)
      return { isPlaying: false, track: null }
    }
  })

export const getRecentlyPlayedFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string().uuid().optional(), limit: z.number().min(1).max(50).default(5) }))
  .handler(async ({ data }) => {
    let targetUserId: string

    if (data.userId) {
      const connection = await db.query.spotifyConnections.findFirst({
        where: eq(spotifyConnections.userId, data.userId),
      })
      if (!connection || !connection.showOnProfile) return { tracks: [] }
      targetUserId = data.userId
    } else {
      const token = getCookie('session-token')
      if (!token) return { tracks: [] }
      const user = await validateSession(token)
      if (!user) return { tracks: [] }
      targetUserId = user.id
    }

    const accessToken = await getValidAccessToken(targetUserId)
    if (!accessToken) return { tracks: [] }

    try {
      const response = await fetch(`${SPOTIFY_API_URL}/me/player/recently-played?limit=${data.limit}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) return { tracks: [] }

      const recentData = await response.json()

      return {
        tracks: recentData.items.map((item: { track: SpotifyTrack; played_at: string }) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists.map((a) => a.name).join(', '),
          album: item.track.album.name,
          albumArt: item.track.album.images[0]?.url || '',
          spotifyUrl: item.track.external_urls.spotify,
          playedAt: item.played_at,
        })),
      }
    } catch (error) {
      console.error('Error fetching recently played:', error)
      return { tracks: [] }
    }
  })

export const checkSpotifyConnectionFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const connection = await db.query.spotifyConnections.findFirst({
      where: eq(spotifyConnections.userId, data.userId),
    })

    return {
      connected: !!connection,
      showOnProfile: connection?.showOnProfile ?? false,
    }
  })
