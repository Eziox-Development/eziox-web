import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/server/db'
import { blogPosts, users } from '@/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export const getBlogPostsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    limit: z.number().min(1).max(50).default(20),
    published: z.boolean().default(true),
  }))
  .handler(async ({ data }) => {
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        coverImage: blogPosts.coverImage,
        category: blogPosts.category,
        tags: blogPosts.tags,
        featured: blogPosts.isFeatured,
        published: blogPosts.isPublished,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
        },
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(data.published ? eq(blogPosts.isPublished, true) : undefined)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
      .limit(data.limit)

    return posts
  })

export const getBlogPostBySlugFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const [post] = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        coverImage: blogPosts.coverImage,
        category: blogPosts.category,
        tags: blogPosts.tags,
        featured: blogPosts.isFeatured,
        published: blogPosts.isPublished,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
        },
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(and(eq(blogPosts.slug, data.slug), eq(blogPosts.isPublished, true)))
      .limit(1)

    return post || null
  })
