/**
 * Public API: GET/PATCH /api/v1/me
 * Returns/updates authenticated user's profile
 * Requires API key with profile:read or profile:write permission
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { users, profiles, userStats } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { validateApiKey, logApiRequest } from '@/server/functions/api-keys'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

export const Route = createFileRoute('/api/v1/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const startTime = Date.now()
        const authHeader = request.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({
              error: 'Missing or invalid Authorization header',
              code: 'UNAUTHORIZED',
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const apiKey = authHeader.slice(7)
        const validation = await validateApiKey(apiKey)

        if (!validation.valid || !validation.apiKey) {
          return new Response(
            JSON.stringify({
              error: validation.error || 'Invalid API key',
              code: 'INVALID_API_KEY',
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const permissions = validation.apiKey.permissions as ApiKeyPermissions
        if (!permissions.profile?.read) {
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/me',
            'GET',
            403,
            Date.now() - startTime,
          )
          return new Response(
            JSON.stringify({
              error: 'API key lacks profile:read permission',
              code: 'FORBIDDEN',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
          const [result] = await db
            .select({
              user: {
                id: users.id,
                username: users.username,
                email: users.email,
                name: users.name,
                tier: users.tier,
                createdAt: users.createdAt,
              },
              profile: profiles,
              stats: userStats,
            })
            .from(users)
            .leftJoin(profiles, eq(profiles.userId, users.id))
            .leftJoin(userStats, eq(userStats.userId, users.id))
            .where(eq(users.id, validation.apiKey.userId))
            .limit(1)

          if (!result) {
            await logApiRequest(
              validation.apiKey.id,
              '/api/v1/me',
              'GET',
              404,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({
                error: 'User not found',
                code: 'USER_NOT_FOUND',
              }),
              { status: 404, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/me',
            'GET',
            200,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              id: result.user.id,
              username: result.user.username,
              email: result.user.email,
              name: result.user.name,
              tier: result.user.tier,
              profile: result.profile
                ? {
                    bio: result.profile.bio,
                    avatar: result.profile.avatar,
                    banner: result.profile.banner,
                    location: result.profile.location,
                    pronouns: result.profile.pronouns,
                    website: result.profile.website,
                    socials: result.profile.socials,
                    badges: result.profile.badges,
                    isPublic: result.profile.isPublic,
                    showActivity: result.profile.showActivity,
                  }
                : null,
              stats: result.stats
                ? {
                    profileViews: result.stats.profileViews,
                    totalLinkClicks: result.stats.totalLinkClicks,
                    followers: result.stats.followers,
                    following: result.stats.following,
                    score: result.stats.score,
                  }
                : null,
              createdAt: result.user.createdAt,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/me]:', error)
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/me',
            'GET',
            500,
            Date.now() - startTime,
            undefined,
            undefined,
            String(error),
          )
          return new Response(
            JSON.stringify({
              error: 'Internal server error',
              code: 'INTERNAL_ERROR',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },

      PATCH: async ({ request }) => {
        const startTime = Date.now()
        const authHeader = request.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({
              error: 'Missing or invalid Authorization header',
              code: 'UNAUTHORIZED',
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const apiKey = authHeader.slice(7)
        const validation = await validateApiKey(apiKey)

        if (!validation.valid || !validation.apiKey) {
          return new Response(
            JSON.stringify({
              error: validation.error || 'Invalid API key',
              code: 'INVALID_API_KEY',
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const permissions = validation.apiKey.permissions as ApiKeyPermissions
        if (!permissions.profile?.write) {
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/me',
            'PATCH',
            403,
            Date.now() - startTime,
          )
          return new Response(
            JSON.stringify({
              error: 'API key lacks profile:write permission',
              code: 'FORBIDDEN',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
          const body = (await request.json()) as Record<string, unknown>
          const allowedFields = [
            'name',
            'bio',
            'location',
            'website',
            'pronouns',
          ]
          const updates: Record<string, unknown> = {}

          for (const field of allowedFields) {
            if (field in body && typeof body[field] === 'string') {
              updates[field] = body[field]
            }
          }

          if (Object.keys(updates).length === 0) {
            await logApiRequest(
              validation.apiKey.id,
              '/api/v1/me',
              'PATCH',
              400,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({
                error: 'No valid fields to update',
                code: 'BAD_REQUEST',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Update user name if provided
          if ('name' in updates) {
            await db
              .update(users)
              .set({ name: updates.name as string, updatedAt: new Date() })
              .where(eq(users.id, validation.apiKey.userId))
          }

          // Update profile fields
          const profileUpdates: Record<string, unknown> = {}
          for (const field of ['bio', 'location', 'website', 'pronouns']) {
            if (field in updates) {
              profileUpdates[field] = updates[field]
            }
          }

          if (Object.keys(profileUpdates).length > 0) {
            profileUpdates.updatedAt = new Date()
            await db
              .update(profiles)
              .set(profileUpdates)
              .where(eq(profiles.userId, validation.apiKey.userId))
          }

          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/me',
            'PATCH',
            200,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({ success: true, updated: Object.keys(updates) }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [PATCH /api/v1/me]:', error)
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/me',
            'PATCH',
            500,
            Date.now() - startTime,
            undefined,
            undefined,
            String(error),
          )
          return new Response(
            JSON.stringify({
              error: 'Internal server error',
              code: 'INTERNAL_ERROR',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
