/**
 * Public API: GET/PATCH/DELETE /api/v1/groups/:id
 * Manage a specific link group
 * Requires API key with links:read, links:write, or links:delete permission
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { linkGroups } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { validateApiKey, logApiRequest } from '@/server/functions/api-keys'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

export const Route = createFileRoute('/api/v1/groups/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
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
        if (!permissions.links?.read) {
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
            'GET',
            403,
            Date.now() - startTime,
          )
          return new Response(
            JSON.stringify({
              error: 'API key lacks links:read permission',
              code: 'FORBIDDEN',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
          const [group] = await db
            .select()
            .from(linkGroups)
            .where(
              and(
                eq(linkGroups.id, params.id as string),
                eq(linkGroups.userId, validation.apiKey.userId),
              ),
            )
            .limit(1)

          if (!group) {
            await logApiRequest(
              validation.apiKey.id,
              `/api/v1/groups/${params.id}`,
              'GET',
              404,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({ error: 'Group not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
            'GET',
            200,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              id: group.id,
              name: group.name,
              icon: group.icon,
              color: group.color,
              isCollapsible: group.isCollapsible,
              isCollapsed: group.isCollapsed,
              order: group.order,
              createdAt: group.createdAt,
              updatedAt: group.updatedAt,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/groups/:id]:', error)
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
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

      PATCH: async ({ request, params }) => {
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
        if (!permissions.links?.write) {
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
            'PATCH',
            403,
            Date.now() - startTime,
          )
          return new Response(
            JSON.stringify({
              error: 'API key lacks links:write permission',
              code: 'FORBIDDEN',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
          const [existingGroup] = await db
            .select({ id: linkGroups.id })
            .from(linkGroups)
            .where(
              and(
                eq(linkGroups.id, params.id as string),
                eq(linkGroups.userId, validation.apiKey.userId),
              ),
            )
            .limit(1)

          if (!existingGroup) {
            await logApiRequest(
              validation.apiKey.id,
              `/api/v1/groups/${params.id}`,
              'PATCH',
              404,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({ error: 'Group not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const body = (await request.json()) as Record<string, unknown>
          const updates: Record<string, unknown> = { updatedAt: new Date() }

          if (typeof body.name === 'string')
            updates.name = body.name.slice(0, 50)
          if (typeof body.icon === 'string')
            updates.icon = body.icon.slice(0, 50)
          if (
            typeof body.color === 'string' &&
            /^#[0-9A-Fa-f]{6}$/.test(body.color)
          ) {
            updates.color = body.color
          }
          if (typeof body.isCollapsible === 'boolean')
            updates.isCollapsible = body.isCollapsible
          if (typeof body.isCollapsed === 'boolean')
            updates.isCollapsed = body.isCollapsed

          const [updatedGroup] = await db
            .update(linkGroups)
            .set(updates)
            .where(eq(linkGroups.id, params.id as string))
            .returning()

          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
            'PATCH',
            200,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              success: true,
              group: {
                id: updatedGroup?.id,
                name: updatedGroup?.name,
                icon: updatedGroup?.icon,
                color: updatedGroup?.color,
                isCollapsible: updatedGroup?.isCollapsible,
                isCollapsed: updatedGroup?.isCollapsed,
                order: updatedGroup?.order,
                updatedAt: updatedGroup?.updatedAt,
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [PATCH /api/v1/groups/:id]:', error)
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
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

      DELETE: async ({ request, params }) => {
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
        if (!permissions.links?.delete) {
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
            'DELETE',
            403,
            Date.now() - startTime,
          )
          return new Response(
            JSON.stringify({
              error: 'API key lacks links:delete permission',
              code: 'FORBIDDEN',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
          const result = await db
            .delete(linkGroups)
            .where(
              and(
                eq(linkGroups.id, params.id as string),
                eq(linkGroups.userId, validation.apiKey.userId),
              ),
            )
            .returning({ id: linkGroups.id })

          if (result.length === 0) {
            await logApiRequest(
              validation.apiKey.id,
              `/api/v1/groups/${params.id}`,
              'DELETE',
              404,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({ error: 'Group not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
            'DELETE',
            200,
            Date.now() - startTime,
          )

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('API Error [DELETE /api/v1/groups/:id]:', error)
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/groups/${params.id}`,
            'DELETE',
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
