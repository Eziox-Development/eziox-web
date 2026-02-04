/**
 * Public API: PATCH/DELETE /api/v1/links/:id
 * Update or delete a specific link
 * Requires API key with links:write or links:delete permission
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { userLinks } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { validateApiKey, logApiRequest } from '@/server/functions/api-keys'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

export const Route = createFileRoute('/api/v1/links/$id')({
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
            `/api/v1/links/${params.id}`,
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
          const [link] = await db
            .select()
            .from(userLinks)
            .where(
              and(
                eq(userLinks.id, params.id as string),
                eq(userLinks.userId, validation.apiKey.userId),
              ),
            )
            .limit(1)

          if (!link) {
            await logApiRequest(
              validation.apiKey.id,
              `/api/v1/links/${params.id}`,
              'GET',
              404,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({ error: 'Link not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/links/${params.id}`,
            'GET',
            200,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              id: link.id,
              title: link.title,
              url: link.url,
              icon: link.icon,
              description: link.description,
              backgroundColor: link.backgroundColor,
              textColor: link.textColor,
              isActive: link.isActive,
              clicks: link.clicks || 0,
              order: link.order,
              groupId: link.groupId,
              createdAt: link.createdAt,
              updatedAt: link.updatedAt,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/links/:id]:', error)
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/links/${params.id}`,
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
            `/api/v1/links/${params.id}`,
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
          // Verify ownership
          const [existingLink] = await db
            .select({ id: userLinks.id })
            .from(userLinks)
            .where(
              and(
                eq(userLinks.id, params.id as string),
                eq(userLinks.userId, validation.apiKey.userId),
              ),
            )
            .limit(1)

          if (!existingLink) {
            await logApiRequest(
              validation.apiKey.id,
              `/api/v1/links/${params.id}`,
              'PATCH',
              404,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({ error: 'Link not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const body = (await request.json()) as Record<string, unknown>
          const updates: Record<string, unknown> = { updatedAt: new Date() }

          if (typeof body.title === 'string')
            updates.title = body.title.slice(0, 100)
          if (typeof body.url === 'string') {
            try {
              new URL(body.url)
              updates.url = body.url.slice(0, 2048)
            } catch {
              await logApiRequest(
                validation.apiKey.id,
                `/api/v1/links/${params.id}`,
                'PATCH',
                400,
                Date.now() - startTime,
              )
              return new Response(
                JSON.stringify({
                  error: 'Invalid URL format',
                  code: 'BAD_REQUEST',
                }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }
          }
          if (typeof body.icon === 'string')
            updates.icon = body.icon.slice(0, 50)
          if (typeof body.description === 'string')
            updates.description = body.description.slice(0, 255)
          if (
            typeof body.backgroundColor === 'string' &&
            /^#[0-9A-Fa-f]{6}$/.test(body.backgroundColor)
          ) {
            updates.backgroundColor = body.backgroundColor
          }
          if (
            typeof body.textColor === 'string' &&
            /^#[0-9A-Fa-f]{6}$/.test(body.textColor)
          ) {
            updates.textColor = body.textColor
          }
          if (typeof body.isActive === 'boolean')
            updates.isActive = body.isActive

          const [updatedLink] = await db
            .update(userLinks)
            .set(updates)
            .where(eq(userLinks.id, params.id as string))
            .returning()

          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/links/${params.id}`,
            'PATCH',
            200,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              success: true,
              link: {
                id: updatedLink?.id,
                title: updatedLink?.title,
                url: updatedLink?.url,
                icon: updatedLink?.icon,
                description: updatedLink?.description,
                backgroundColor: updatedLink?.backgroundColor,
                textColor: updatedLink?.textColor,
                isActive: updatedLink?.isActive,
                clicks: updatedLink?.clicks || 0,
                order: updatedLink?.order,
                updatedAt: updatedLink?.updatedAt,
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [PATCH /api/v1/links/:id]:', error)
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/links/${params.id}`,
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
            `/api/v1/links/${params.id}`,
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
            .delete(userLinks)
            .where(
              and(
                eq(userLinks.id, params.id as string),
                eq(userLinks.userId, validation.apiKey.userId),
              ),
            )
            .returning({ id: userLinks.id })

          if (result.length === 0) {
            await logApiRequest(
              validation.apiKey.id,
              `/api/v1/links/${params.id}`,
              'DELETE',
              404,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({ error: 'Link not found', code: 'NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/links/${params.id}`,
            'DELETE',
            200,
            Date.now() - startTime,
          )

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('API Error [DELETE /api/v1/links/:id]:', error)
          await logApiRequest(
            validation.apiKey.id,
            `/api/v1/links/${params.id}`,
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
