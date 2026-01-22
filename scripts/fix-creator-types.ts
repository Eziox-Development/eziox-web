import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function fixCreatorTypes() {
  console.log('Fixing creator_types column...')

  try {
    // Drop and recreate the column with correct type
    await sql`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "creator_types"`
    console.log('Dropped old creator_types column')

    await sql`ALTER TABLE "profiles" ADD COLUMN "creator_types" jsonb DEFAULT '[]'::jsonb`
    console.log('Created new creator_types column as jsonb')

    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
  }
}

void fixCreatorTypes()
