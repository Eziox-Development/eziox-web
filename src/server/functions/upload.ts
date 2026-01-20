/**
 * Image Upload API
 * Handles avatar and banner uploads via Cloudinary
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus, getRequestIP } from '@tanstack/react-start/server'
import { db } from '../db'
import { profiles } from '../db/schema'
import { eq } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import { uploadAvatar, uploadBanner } from '../lib/cloudinary'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'

// Validation Schemas
const uploadAvatarSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
})

const uploadBannerSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
})

// Upload Avatar
export const uploadAvatarFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadAvatarSchema)
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(token)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(`upload:${user.id}:${ip}`, RATE_LIMITS.API_UPLOAD.maxRequests, RATE_LIMITS.API_UPLOAD.windowMs)
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw { message: 'Too many uploads. Please try again later.', status: 429 }
    }

    try {
      // Upload to Cloudinary
      const avatarUrl = await uploadAvatar(data.image, user.id)

      // Update profile in database
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          avatar: avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning()

      return {
        success: true,
        avatarUrl,
        profile: updatedProfile,
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar'
      setResponseStatus(500)
      throw { message: errorMessage, status: 500 }
    }
  })

// Upload Banner
export const uploadBannerFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadBannerSchema)
  .handler(async ({ data }) => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(token)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(`upload:${user.id}:${ip}`, RATE_LIMITS.API_UPLOAD.maxRequests, RATE_LIMITS.API_UPLOAD.windowMs)
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw { message: 'Too many uploads. Please try again later.', status: 429 }
    }

    try {
      // Upload to Cloudinary
      const bannerUrl = await uploadBanner(data.image, user.id)

      // Update profile in database
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          banner: bannerUrl,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning()

      return {
        success: true,
        bannerUrl,
        profile: updatedProfile,
      }
    } catch (error) {
      console.error('Banner upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload banner'
      setResponseStatus(500)
      throw { message: errorMessage, status: 500 }
    }
  })

// Remove Avatar
export const removeAvatarFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(token)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    try {
      // Update profile in database
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          avatar: null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning()

      return {
        success: true,
        profile: updatedProfile,
      }
    } catch (error) {
      console.error('Remove avatar error:', error)
      setResponseStatus(500)
      throw { message: 'Failed to remove avatar', status: 500 }
    }
  }
)

// Remove Banner
export const removeBannerFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const token = getCookie('session-token')
    if (!token) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    const user = await validateSession(token)
    if (!user) {
      setResponseStatus(401)
      throw { message: 'Not authenticated', status: 401 }
    }

    try {
      // Update profile in database
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          banner: null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning()

      return {
        success: true,
        profile: updatedProfile,
      }
    } catch (error) {
      console.error('Remove banner error:', error)
      setResponseStatus(500)
      throw { message: 'Failed to remove banner', status: 500 }
    }
  }
)

// Type Exports
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>
export type UploadBannerInput = z.infer<typeof uploadBannerSchema>
