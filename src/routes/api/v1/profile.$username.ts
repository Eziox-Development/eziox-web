/**
 * Public API: GET /api/v1/profile/:username
 * Returns public profile data for a user
 */

import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { users, profiles, userStats, userLinks } from '@/server/db/schema'
import { eq, asc } from 'drizzle-orm'

export const Route = createFileRoute('/api/v1/profile/$username')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const username = (params.username as string).toLowerCase()

          // Get user with profile and stats
          const [result] = await db
            .select({
              user: {
                id: users.id,
                username: users.username,
                name: users.name,
                createdAt: users.createdAt,
              },
              profile: profiles,
              stats: {
                profileViews: userStats.profileViews,
                followers: userStats.followers,
                following: userStats.following,
              },
            })
            .from(users)
            .leftJoin(profiles, eq(profiles.userId, users.id))
            .leftJoin(userStats, eq(userStats.userId, users.id))
            .where(eq(users.username, username))
            .limit(1)

          if (!result) {
            return new Response(
              JSON.stringify({ error: 'User not found', code: 'USER_NOT_FOUND' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
          }

          // Check if profile is public
          if (result.profile && !result.profile.isPublic) {
            return new Response(
              JSON.stringify({ error: 'Profile is private', code: 'PROFILE_PRIVATE' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
          }

          // Get user's active links
          const links = await db
            .select({
              id: userLinks.id,
              title: userLinks.title,
              url: userLinks.url,
              icon: userLinks.icon,
              description: userLinks.description,
              clicks: userLinks.clicks,
              groupId: userLinks.groupId,
            })
            .from(userLinks)
            .where(eq(userLinks.userId, result.user.id))
            .orderBy(asc(userLinks.order))

          return new Response(
            JSON.stringify({
              username: result.user.username,
              name: result.user.name,
              bio: result.profile?.bio || null,
              avatar: result.profile?.avatar || null,
              banner: result.profile?.banner || null,
              location: result.profile?.location || null,
              pronouns: result.profile?.pronouns || null,
              website: result.profile?.website || null,
              socials: result.profile?.socials || {},
              badges: result.profile?.badges || [],
              stats: {
                profileViews: result.stats?.profileViews || 0,
                followers: result.stats?.followers || 0,
                following: result.stats?.following || 0,
              },
              links: links.map((link) => ({
                id: link.id,
                title: link.title,
                url: link.url,
                icon: link.icon,
                description: link.description,
                clicks: link.clicks || 0,
                groupId: link.groupId,
              })),
              createdAt: result.user.createdAt,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60',
              },
            }
          )
        } catch (error) {
          console.error('API Error [GET /api/v1/profile/:username]:', error)
          return new Response(
            JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },
    },
  },
})
