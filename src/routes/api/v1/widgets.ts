/**
 * Public API: GET/POST /api/v1/widgets
 * Manage authenticated user's profile widgets
 * Requires API key with profile:read or profile:write permission
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { profileWidgets } from '@/server/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { validateApiKey, logApiRequest } from '@/server/functions/api-keys'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

const VALID_WIDGET_TYPES = [
  'weather',
  'countdown',
  'youtube',
  'soundcloud',
  'twitch',
  'github',
  'socialFeed',
]

export const Route = createFileRoute('/api/v1/widgets')({
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
            '/api/v1/widgets',
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
          const widgets = await db
            .select({
              id: profileWidgets.id,
              type: profileWidgets.type,
              title: profileWidgets.title,
              isActive: profileWidgets.isActive,
              order: profileWidgets.order,
              settings: profileWidgets.settings,
              config: profileWidgets.config,
              createdAt: profileWidgets.createdAt,
              updatedAt: profileWidgets.updatedAt,
            })
            .from(profileWidgets)
            .where(eq(profileWidgets.userId, validation.apiKey.userId))
            .orderBy(asc(profileWidgets.order))

          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/widgets',
            'GET',
            200,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              widgets: widgets.map((widget) => ({
                id: widget.id,
                type: widget.type,
                title: widget.title,
                isActive: widget.isActive,
                order: widget.order,
                settings: widget.settings,
                config: widget.config,
                createdAt: widget.createdAt,
                updatedAt: widget.updatedAt,
              })),
              total: widgets.length,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/widgets]:', error)
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/widgets',
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

      POST: async ({ request }) => {
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
            '/api/v1/widgets',
            'POST',
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

          if (!body.type || typeof body.type !== 'string') {
            await logApiRequest(
              validation.apiKey.id,
              '/api/v1/widgets',
              'POST',
              400,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({
                error: 'type is required',
                code: 'BAD_REQUEST',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          if (!VALID_WIDGET_TYPES.includes(body.type)) {
            await logApiRequest(
              validation.apiKey.id,
              '/api/v1/widgets',
              'POST',
              400,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({
                error: `Invalid widget type. Valid types: ${VALID_WIDGET_TYPES.join(', ')}`,
                code: 'BAD_REQUEST',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Get max order
          const [maxOrder] = await db
            .select({
              max: sql<number>`COALESCE(MAX(${profileWidgets.order}), -1)`,
            })
            .from(profileWidgets)
            .where(eq(profileWidgets.userId, validation.apiKey.userId))

          const [newWidget] = await db
            .insert(profileWidgets)
            .values({
              userId: validation.apiKey.userId,
              type: body.type,
              title:
                typeof body.title === 'string'
                  ? body.title.slice(0, 100)
                  : null,
              isActive:
                typeof body.isActive === 'boolean' ? body.isActive : true,
              order: (maxOrder?.max ?? -1) + 1,
              config:
                typeof body.config === 'object' && body.config !== null
                  ? (body.config as Record<string, unknown>)
                  : undefined,
            })
            .returning()

          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/widgets',
            'POST',
            201,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              success: true,
              widget: {
                id: newWidget?.id,
                type: newWidget?.type,
                title: newWidget?.title,
                isActive: newWidget?.isActive,
                order: newWidget?.order,
                config: newWidget?.config,
                createdAt: newWidget?.createdAt,
              },
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [POST /api/v1/widgets]:', error)
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/widgets',
            'POST',
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
