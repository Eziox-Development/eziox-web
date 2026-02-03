/**
 * Public API: GET/POST /api/v1/groups
 * Manage authenticated user's link groups
 * Requires API key with links:read or links:write permission
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { linkGroups } from '@/server/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { validateApiKey, logApiRequest } from '@/server/functions/api-keys'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

export const Route = createFileRoute('/api/v1/groups')({
  server: {
    handlers: {
      GET: async ({ request }) => {
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
        if (!permissions.links?.read) {
          await logApiRequest(validation.apiKey.id, '/api/v1/groups', 'GET', 403, Date.now() - startTime)
          return new Response(
            JSON.stringify({ error: 'API key lacks links:read permission', code: 'FORBIDDEN' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }

        try {
          const groups = await db
            .select({
              id: linkGroups.id,
              name: linkGroups.name,
              icon: linkGroups.icon,
              color: linkGroups.color,
              isCollapsible: linkGroups.isCollapsible,
              isCollapsed: linkGroups.isCollapsed,
              order: linkGroups.order,
              createdAt: linkGroups.createdAt,
              updatedAt: linkGroups.updatedAt,
            })
            .from(linkGroups)
            .where(eq(linkGroups.userId, validation.apiKey.userId))
            .orderBy(asc(linkGroups.order))

          await logApiRequest(validation.apiKey.id, '/api/v1/groups', 'GET', 200, Date.now() - startTime)

          return new Response(
            JSON.stringify({
              groups: groups.map((group) => ({
                id: group.id,
                name: group.name,
                icon: group.icon,
                color: group.color,
                isCollapsible: group.isCollapsible,
                isCollapsed: group.isCollapsed,
                order: group.order,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt,
              })),
              total: groups.length,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/groups]:', error)
          await logApiRequest(validation.apiKey.id, '/api/v1/groups', 'GET', 500, Date.now() - startTime, undefined, undefined, String(error))
          return new Response(
            JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },

      POST: async ({ request }) => {
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
        if (!permissions.links?.write) {
          await logApiRequest(validation.apiKey.id, '/api/v1/groups', 'POST', 403, Date.now() - startTime)
          return new Response(
            JSON.stringify({ error: 'API key lacks links:write permission', code: 'FORBIDDEN' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }

        try {
          const body = await request.json() as Record<string, unknown>

          if (!body.name || typeof body.name !== 'string') {
            await logApiRequest(validation.apiKey.id, '/api/v1/groups', 'POST', 400, Date.now() - startTime)
            return new Response(
              JSON.stringify({ error: 'name is required', code: 'BAD_REQUEST' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          }

          // Get max order
          const [maxOrder] = await db
            .select({ max: sql<number>`COALESCE(MAX(${linkGroups.order}), -1)` })
            .from(linkGroups)
            .where(eq(linkGroups.userId, validation.apiKey.userId))

          const [newGroup] = await db
            .insert(linkGroups)
            .values({
              userId: validation.apiKey.userId,
              name: (body.name as string).slice(0, 50),
              icon: typeof body.icon === 'string' ? body.icon.slice(0, 50) : undefined,
              color: typeof body.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.color) ? body.color : undefined,
              isCollapsible: typeof body.isCollapsible === 'boolean' ? body.isCollapsible : false,
              isCollapsed: typeof body.isCollapsed === 'boolean' ? body.isCollapsed : false,
              order: (maxOrder?.max ?? -1) + 1,
            })
            .returning()

          await logApiRequest(validation.apiKey.id, '/api/v1/groups', 'POST', 201, Date.now() - startTime)

          return new Response(
            JSON.stringify({
              success: true,
              group: {
                id: newGroup?.id,
                name: newGroup?.name,
                icon: newGroup?.icon,
                color: newGroup?.color,
                isCollapsible: newGroup?.isCollapsible,
                isCollapsed: newGroup?.isCollapsed,
                order: newGroup?.order,
                createdAt: newGroup?.createdAt,
              },
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('API Error [POST /api/v1/groups]:', error)
          await logApiRequest(validation.apiKey.id, '/api/v1/groups', 'POST', 500, Date.now() - startTime, undefined, undefined, String(error))
          return new Response(
            JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },
    },
  },
})
