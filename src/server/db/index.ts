import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let _db: NeonHttpDatabase<typeof schema> | null = null

function getDb(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db

  // Only initialize on server-side
  if (typeof window !== 'undefined') {
    throw new Error('Database cannot be accessed on the client side')
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Create connection with pooling support
  const sql = neon(databaseUrl, {
    fetchOptions: {
      cache: 'no-store',
    },
  })

  _db = drizzle(sql, { schema })
  return _db
}

// Proxy to lazily initialize db on first access
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return getDb()[prop as keyof NeonHttpDatabase<typeof schema>]
  },
})

export type Database = NeonHttpDatabase<typeof schema>
