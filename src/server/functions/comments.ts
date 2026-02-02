import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie } from '@tanstack/react-start/server'
import { db } from '../db'
import { profileComments, commentLikes, commentReports, users, profiles } from '../db/schema'
import { eq, and, desc, sql, isNull, inArray } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import { isContentClean, getAutoHideThreshold } from '../../lib/content-filter'

// Get comments for a profile
export const getProfileCommentsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    profileUserId: z.string().uuid(),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0),
  }))
  .handler(async ({ data }) => {
    const comments = await db
      .select({
        id: profileComments.id,
        content: profileComments.content,
        likes: profileComments.likes,
        isPinned: profileComments.isPinned,
        parentId: profileComments.parentId,
        createdAt: profileComments.createdAt,
        authorId: profileComments.authorId,
        authorUsername: users.username,
        authorName: users.name,
        authorAvatar: profiles.avatar,
        authorTier: users.tier,
      })
      .from(profileComments)
      .innerJoin(users, eq(profileComments.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(profileComments.profileUserId, data.profileUserId),
          eq(profileComments.isDeleted, false),
          eq(profileComments.isHidden, false),
          eq(profileComments.moderationStatus, 'approved'),
          isNull(profileComments.parentId)
        )
      )
      .orderBy(desc(profileComments.isPinned), desc(profileComments.createdAt))
      .limit(data.limit)
      .offset(data.offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profileComments)
      .where(
        and(
          eq(profileComments.profileUserId, data.profileUserId),
          eq(profileComments.isDeleted, false),
          eq(profileComments.isHidden, false),
          eq(profileComments.moderationStatus, 'approved'),
          isNull(profileComments.parentId)
        )
      )

    const formattedComments = comments.map(c => ({
      id: c.id,
      content: c.content,
      likes: c.likes ?? 0,
      isPinned: c.isPinned ?? false,
      parentId: c.parentId,
      createdAt: c.createdAt,
      author: {
        id: c.authorId,
        username: c.authorUsername,
        name: c.authorName,
        avatar: c.authorAvatar,
        tier: c.authorTier,
      },
    }))

    return {
      comments: formattedComments,
      total: Number(countResult?.count || 0),
      hasMore: data.offset + comments.length < Number(countResult?.count || 0),
    }
  })

// Create a comment
export const createCommentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    profileUserId: z.string().uuid(),
    content: z.string().min(1).max(500),
    parentId: z.string().uuid().optional(),
  }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) throw new Error('You must be logged in to comment')

    const user = await validateSession(token)
    if (!user) throw new Error('You must be logged in to comment')

    if (!isContentClean(data.content)) {
      throw new Error('Your comment contains inappropriate content')
    }

    const insertedComments = await db
      .insert(profileComments)
      .values({
        profileUserId: data.profileUserId,
        authorId: user.id,
        content: data.content.trim(),
        parentId: data.parentId || null,
        moderationStatus: 'approved',
      })
      .returning()

    const newComment = insertedComments[0]
    if (!newComment) throw new Error('Failed to create comment')

    const authorResults = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: profiles.avatar,
        tier: users.tier,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, user.id))

    const authorInfo = authorResults[0]

    return {
      success: true,
      comment: {
        id: newComment.id,
        content: newComment.content,
        likes: 0,
        isPinned: false,
        parentId: newComment.parentId,
        createdAt: newComment.createdAt,
        author: authorInfo,
      },
    }
  })

// Delete a comment
export const deleteCommentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ commentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) throw new Error('You must be logged in')

    const user = await validateSession(token)
    if (!user) throw new Error('You must be logged in')

    const comments = await db
      .select()
      .from(profileComments)
      .where(eq(profileComments.id, data.commentId))

    const comment = comments[0]
    if (!comment) throw new Error('Comment not found')

    const isAuthor = comment.authorId === user.id
    const isProfileOwner = comment.profileUserId === user.id
    const isAdmin = user.role === 'admin'

    if (!isAuthor && !isProfileOwner && !isAdmin) {
      throw new Error('You do not have permission to delete this comment')
    }

    await db
      .update(profileComments)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(profileComments.id, data.commentId))

    return { success: true }
  })

// Like/Unlike a comment
export const toggleCommentLikeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ commentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) throw new Error('You must be logged in')

    const user = await validateSession(token)
    if (!user) throw new Error('You must be logged in')

    const [existingLike] = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.commentId, data.commentId), eq(commentLikes.userId, user.id)))

    if (existingLike) {
      await db.delete(commentLikes).where(eq(commentLikes.id, existingLike.id))
      await db.update(profileComments).set({ likes: sql`${profileComments.likes} - 1` }).where(eq(profileComments.id, data.commentId))
      return { liked: false }
    } else {
      await db.insert(commentLikes).values({ commentId: data.commentId, userId: user.id })
      await db.update(profileComments).set({ likes: sql`${profileComments.likes} + 1` }).where(eq(profileComments.id, data.commentId))
      return { liked: true }
    }
  })

// Report a comment
export const reportCommentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    commentId: z.string().uuid(),
    reason: z.enum(['spam', 'harassment', 'hate_speech', 'inappropriate', 'other']),
    description: z.string().max(500).optional(),
  }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) throw new Error('You must be logged in')

    const user = await validateSession(token)
    if (!user) throw new Error('You must be logged in')

    const [existingReport] = await db
      .select()
      .from(commentReports)
      .where(and(eq(commentReports.commentId, data.commentId), eq(commentReports.reporterId, user.id)))

    if (existingReport) throw new Error('You have already reported this comment')

    await db.insert(commentReports).values({
      commentId: data.commentId,
      reporterId: user.id,
      reason: data.reason,
      description: data.description,
    })

    await db.update(profileComments).set({ reportCount: sql`${profileComments.reportCount} + 1` }).where(eq(profileComments.id, data.commentId))

    const [comment] = await db.select({ reportCount: profileComments.reportCount }).from(profileComments).where(eq(profileComments.id, data.commentId))

    if (comment && (comment.reportCount ?? 0) >= getAutoHideThreshold()) {
      await db.update(profileComments).set({ isHidden: true, moderationStatus: 'pending_review', updatedAt: new Date() }).where(eq(profileComments.id, data.commentId))
    }

    return { success: true }
  })

// Check liked comments
export const checkCommentLikesFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ commentIds: z.array(z.string().uuid()) }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) return { likedCommentIds: [] }

    const user = await validateSession(token)
    if (!user) return { likedCommentIds: [] }

    if (data.commentIds.length === 0) return { likedCommentIds: [] }

    const likes = await db
      .select({ commentId: commentLikes.commentId })
      .from(commentLikes)
      .where(and(eq(commentLikes.userId, user.id), inArray(commentLikes.commentId, data.commentIds)))

    return { likedCommentIds: likes.map(l => l.commentId) }
  })

// Pin/Unpin a comment
export const togglePinCommentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ commentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) throw new Error('You must be logged in')

    const user = await validateSession(token)
    if (!user) throw new Error('You must be logged in')

    const comments = await db.select().from(profileComments).where(eq(profileComments.id, data.commentId))
    const comment = comments[0]

    if (!comment) throw new Error('Comment not found')

    if (comment.profileUserId !== user.id && user.role !== 'admin') {
      throw new Error('Only the profile owner can pin comments')
    }

    const newPinned = !comment.isPinned
    await db.update(profileComments).set({ isPinned: newPinned, updatedAt: new Date() }).where(eq(profileComments.id, data.commentId))

    return { pinned: newPinned }
  })
