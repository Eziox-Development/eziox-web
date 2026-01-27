import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/server/db'
import { users, profiles } from '@/server/db/schema'
import { eq, ilike, or } from 'drizzle-orm'
import { getCurrentUser } from './auth'

// Search users by email or username (for admin features like allowed emails)
export const searchUsersFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      query: z.string().min(1).max(100),
      limit: z.number().int().min(1).max(20).default(10),
    }),
  )
  .handler(async ({ data }) => {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Unauthorized: Owner access required')
    }

    const searchQuery = `%${data.query.toLowerCase()}%`

    const results = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
        role: users.role,
        avatar: profiles.avatar,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(
        or(
          ilike(users.email, searchQuery),
          ilike(users.username, searchQuery),
          ilike(users.name, searchQuery),
        ),
      )
      .limit(data.limit)

    return {
      users: results.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
      })),
    }
  })

// Get all users (limited, for dropdown selection)
export const getAllUsersBasicFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        limit: z.number().int().min(1).max(100).default(50),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Unauthorized: Owner access required')
    }

    const results = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
        role: users.role,
        avatar: profiles.avatar,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .orderBy(users.createdAt)
      .limit(data?.limit || 50)

    return {
      users: results.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
      })),
    }
  })
