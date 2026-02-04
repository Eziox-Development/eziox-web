import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/check-username')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const username = url.searchParams.get('username')

          if (!username) {
            return new Response(
              JSON.stringify({
                available: false,
                error: 'Username is required',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Validate username format
          const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
          if (!usernameRegex.test(username)) {
            return new Response(
              JSON.stringify({
                available: false,
                error: 'Invalid username format',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Check reserved usernames
          const reservedUsernames = [
            'admin',
            'administrator',
            'root',
            'system',
            'support',
            'help',
            'api',
            'www',
            'mail',
            'email',
            'ftp',
            'ssh',
            'login',
            'signup',
            'sign-up',
            'signin',
            'sign-in',
            'register',
            'auth',
            'oauth',
            'profile',
            'settings',
            'dashboard',
            'account',
            'user',
            'users',
            'eziox',
            'official',
            'staff',
            'team',
            'mod',
            'moderator',
            'about',
            'contact',
            'privacy',
            'terms',
            'tos',
            'legal',
            'docs',
            'documentation',
            'blog',
            'news',
            'pricing',
            'plans',
            'creators',
            'leaderboard',
            'explore',
            'discover',
            'search',
            'home',
            'index',
            'null',
            'undefined',
            'test',
            'demo',
          ]

          if (reservedUsernames.includes(username.toLowerCase())) {
            return new Response(
              JSON.stringify({
                available: false,
                error: 'Username is reserved',
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Check if username exists in database
          const existingUser = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, username.toLowerCase()))
            .limit(1)

          const available = existingUser.length === 0

          return new Response(
            JSON.stringify({ available, username: username.toLowerCase() }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('Error checking username:', error)
          return new Response(
            JSON.stringify({
              available: false,
              error: 'Internal server error',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
