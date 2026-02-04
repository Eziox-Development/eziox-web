/**
 * Public API: GET/POST /api/v1/links
 * Manage authenticated user's links
 * Requires API key with links:read or links:write permission
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { userLinks } from '@/server/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { validateApiKey, logApiRequest } from '@/server/functions/api-keys'
import type { ApiKeyPermissions } from '@/server/functions/api-keys'

export const Route = createFileRoute('/api/v1/links')({
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
        if (!permissions.links?.read) {
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/links',
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
          const links = await db
            .select({
              id: userLinks.id,
              title: userLinks.title,
              url: userLinks.url,
              icon: userLinks.icon,
              description: userLinks.description,
              backgroundColor: userLinks.backgroundColor,
              textColor: userLinks.textColor,
              isActive: userLinks.isActive,
              clicks: userLinks.clicks,
              order: userLinks.order,
              groupId: userLinks.groupId,
              createdAt: userLinks.createdAt,
              updatedAt: userLinks.updatedAt,
            })
            .from(userLinks)
            .where(eq(userLinks.userId, validation.apiKey.userId))
            .orderBy(asc(userLinks.order))

          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/links',
            'GET',
            200,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              links: links.map((link) => ({
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
              })),
              total: links.length,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/links]:', error)
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/links',
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
        if (!permissions.links?.write) {
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/links',
            'POST',
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
          const body = (await request.json()) as Record<string, unknown>

          // Validate required fields
          if (!body.title || typeof body.title !== 'string') {
            await logApiRequest(
              validation.apiKey.id,
              '/api/v1/links',
              'POST',
              400,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({
                error: 'title is required',
                code: 'BAD_REQUEST',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          if (!body.url || typeof body.url !== 'string') {
            await logApiRequest(
              validation.apiKey.id,
              '/api/v1/links',
              'POST',
              400,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({ error: 'url is required', code: 'BAD_REQUEST' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Validate URL format
          try {
            new URL(body.url as string)
          } catch {
            await logApiRequest(
              validation.apiKey.id,
              '/api/v1/links',
              'POST',
              400,
              Date.now() - startTime,
            )
            return new Response(
              JSON.stringify({
                error: 'Invalid URL format',
                code: 'BAD_REQUEST',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Get max order
          const [maxOrder] = await db
            .select({ max: sql<number>`COALESCE(MAX(${userLinks.order}), -1)` })
            .from(userLinks)
            .where(eq(userLinks.userId, validation.apiKey.userId))

          const [newLink] = await db
            .insert(userLinks)
            .values({
              userId: validation.apiKey.userId,
              title: (body.title as string).slice(0, 100),
              url: (body.url as string).slice(0, 2048),
              icon:
                typeof body.icon === 'string'
                  ? body.icon.slice(0, 50)
                  : undefined,
              description:
                typeof body.description === 'string'
                  ? body.description.slice(0, 255)
                  : undefined,
              backgroundColor:
                typeof body.backgroundColor === 'string' &&
                /^#[0-9A-Fa-f]{6}$/.test(body.backgroundColor)
                  ? body.backgroundColor
                  : undefined,
              textColor:
                typeof body.textColor === 'string' &&
                /^#[0-9A-Fa-f]{6}$/.test(body.textColor)
                  ? body.textColor
                  : undefined,
              order: (maxOrder?.max ?? -1) + 1,
            })
            .returning()

          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/links',
            'POST',
            201,
            Date.now() - startTime,
          )

          return new Response(
            JSON.stringify({
              success: true,
              link: {
                id: newLink?.id,
                title: newLink?.title,
                url: newLink?.url,
                icon: newLink?.icon,
                description: newLink?.description,
                backgroundColor: newLink?.backgroundColor,
                textColor: newLink?.textColor,
                isActive: newLink?.isActive,
                clicks: newLink?.clicks || 0,
                order: newLink?.order,
                createdAt: newLink?.createdAt,
              },
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('API Error [POST /api/v1/links]:', error)
          await logApiRequest(
            validation.apiKey.id,
            '/api/v1/links',
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
