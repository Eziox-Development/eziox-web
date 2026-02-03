/**
 * Public API: GET/PATCH/DELETE /api/v1/widgets/:id
 * Manage a specific profile widget
 * Requires API key with profile:read, profile:write permission
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { profileWidgets } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { validateApiKey, logApiRequest } from '@/server/functions/api-keys'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

export const Route = createFileRoute('/api/v1/widgets/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const startTime = Date.now()
        const authHeader = request.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const apiKey = authHeader.slice(7)
        const validation = await validateApiKey(apiKey)

        if (!validation.valid || !validation.apiKey) {
          return new Response(
            JSON.stringify({ error: validation.error || 'Invalid API key', code: 'INVALID_API_KEY' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const permissions = validation.apiKey.permissions as ApiKeyPermissions
        if (!permissions.profile?.read) {
          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'GET', 403, Date.now() - startTime)
          return new Response(
            JSON.stringify({ error: 'API key lacks profile:read permission', code: 'FORBIDDEN' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }

        try {
          const [widget] = await db
            .select()
            .from(profileWidgets)
            .where(and(eq(profileWidgets.id, params.id as string), eq(profileWidgets.userId, validation.apiKey.userId)))
            .limit(1)

          if (!widget) {
            await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'GET', 404, Date.now() - startTime)
            return new Response(
              JSON.stringify({ error: 'Widget not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
          }

          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'GET', 200, Date.now() - startTime)

          return new Response(
            JSON.stringify({
              id: widget.id,
              type: widget.type,
              title: widget.title,
              isActive: widget.isActive,
              order: widget.order,
              settings: widget.settings,
              config: widget.config,
              createdAt: widget.createdAt,
              updatedAt: widget.updatedAt,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/widgets/:id]:', error)
          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'GET', 500, Date.now() - startTime, undefined, undefined, String(error))
          return new Response(
            JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },

      PATCH: async ({ request, params }) => {
        const startTime = Date.now()
        const authHeader = request.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const apiKey = authHeader.slice(7)
        const validation = await validateApiKey(apiKey)

        if (!validation.valid || !validation.apiKey) {
          return new Response(
            JSON.stringify({ error: validation.error || 'Invalid API key', code: 'INVALID_API_KEY' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const permissions = validation.apiKey.permissions as ApiKeyPermissions
        if (!permissions.profile?.write) {
          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'PATCH', 403, Date.now() - startTime)
          return new Response(
            JSON.stringify({ error: 'API key lacks profile:write permission', code: 'FORBIDDEN' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }

        try {
          const [existingWidget] = await db
            .select({ id: profileWidgets.id })
            .from(profileWidgets)
            .where(and(eq(profileWidgets.id, params.id as string), eq(profileWidgets.userId, validation.apiKey.userId)))
            .limit(1)

          if (!existingWidget) {
            await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'PATCH', 404, Date.now() - startTime)
            return new Response(
              JSON.stringify({ error: 'Widget not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
          }

          const body = await request.json() as Record<string, unknown>
          const updates: Record<string, unknown> = { updatedAt: new Date() }

          if (typeof body.title === 'string') updates.title = body.title.slice(0, 100)
          if (typeof body.isActive === 'boolean') updates.isActive = body.isActive
          if (typeof body.config === 'object' && body.config !== null) updates.config = body.config

          const [updatedWidget] = await db
            .update(profileWidgets)
            .set(updates)
            .where(eq(profileWidgets.id, params.id as string))
            .returning()

          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'PATCH', 200, Date.now() - startTime)

          return new Response(
            JSON.stringify({
              success: true,
              widget: {
                id: updatedWidget?.id,
                type: updatedWidget?.type,
                title: updatedWidget?.title,
                isActive: updatedWidget?.isActive,
                order: updatedWidget?.order,
                config: updatedWidget?.config,
                updatedAt: updatedWidget?.updatedAt,
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('API Error [PATCH /api/v1/widgets/:id]:', error)
          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'PATCH', 500, Date.now() - startTime, undefined, undefined, String(error))
          return new Response(
            JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },

      DELETE: async ({ request, params }) => {
        const startTime = Date.now()
        const authHeader = request.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const apiKey = authHeader.slice(7)
        const validation = await validateApiKey(apiKey)

        if (!validation.valid || !validation.apiKey) {
          return new Response(
            JSON.stringify({ error: validation.error || 'Invalid API key', code: 'INVALID_API_KEY' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const permissions = validation.apiKey.permissions as ApiKeyPermissions
        if (!permissions.profile?.write) {
          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'DELETE', 403, Date.now() - startTime)
          return new Response(
            JSON.stringify({ error: 'API key lacks profile:write permission', code: 'FORBIDDEN' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }

        try {
          const result = await db
            .delete(profileWidgets)
            .where(and(eq(profileWidgets.id, params.id as string), eq(profileWidgets.userId, validation.apiKey.userId)))
            .returning({ id: profileWidgets.id })

          if (result.length === 0) {
            await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'DELETE', 404, Date.now() - startTime)
            return new Response(
              JSON.stringify({ error: 'Widget not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
          }

          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'DELETE', 200, Date.now() - startTime)

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('API Error [DELETE /api/v1/widgets/:id]:', error)
          await logApiRequest(validation.apiKey.id, `/api/v1/widgets/${params.id}`, 'DELETE', 500, Date.now() - startTime, undefined, undefined, String(error))
          return new Response(
            JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },
    },
  },
})
