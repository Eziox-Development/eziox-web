/**
 * Image Upload API
 * Handles avatar and banner uploads via Cloudinary
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  setResponseStatus,
  getRequestIP,
} from '@tanstack/react-start/server'
import { db } from '../db'
import { profiles } from '../db/schema'
import { eq } from 'drizzle-orm'
import { getAuthenticatedUser } from './auth-helpers'
import { uploadAvatar, uploadBanner, generateUploadSignature } from '../lib/cloudinary'
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
    const user = await getAuthenticatedUser()

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(
      `upload:${user.id}:${ip}`,
      RATE_LIMITS.API_UPLOAD.maxRequests,
      RATE_LIMITS.API_UPLOAD.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many uploads. Please try again later.',
        status: 429,
      }
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
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload avatar'
      setResponseStatus(500)
      throw { message: errorMessage, status: 500 }
    }
  })

// Upload Banner
export const uploadBannerFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadBannerSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(
      `upload:${user.id}:${ip}`,
      RATE_LIMITS.API_UPLOAD.maxRequests,
      RATE_LIMITS.API_UPLOAD.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many uploads. Please try again later.',
        status: 429,
      }
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
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload banner'
      setResponseStatus(500)
      throw { message: errorMessage, status: 500 }
    }
  })

// Remove Avatar
export const removeAvatarFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const user = await getAuthenticatedUser()

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
  },
)

// Remove Banner
export const removeBannerFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const user = await getAuthenticatedUser()

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
  },
)

// Upload Media (generic upload for media library)
const uploadMediaSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  folder: z.string().optional(),
})

export const uploadMediaFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadMediaSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(
      `upload:${user.id}:${ip}`,
      RATE_LIMITS.API_UPLOAD.maxRequests,
      RATE_LIMITS.API_UPLOAD.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many uploads. Please try again later.',
        status: 429,
      }
    }

    try {
      const { uploadImage } = await import('../lib/cloudinary')
      const folder = data.folder || 'media'
      const publicId = `media_${user.id}_${Date.now()}`

      const result = await uploadImage(data.image, folder, publicId)

      return {
        success: true,
        url: result.url,
        publicId: result.publicId,
      }
    } catch (error) {
      console.error('Media upload error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload media'
      setResponseStatus(500)
      throw { message: errorMessage, status: 500 }
    }
  })

// Upload Background Video
const uploadVideoSchema = z.object({
  video: z.string().min(1, 'Video data is required'),
})

export const uploadVideoFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadVideoSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(
      `upload:${user.id}:${ip}`,
      RATE_LIMITS.API_UPLOAD.maxRequests,
      RATE_LIMITS.API_UPLOAD.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw {
        message: 'Too many uploads. Please try again later.',
        status: 429,
      }
    }

    try {
      const { uploadVideo } = await import('../lib/cloudinary')
      const videoUrl = await uploadVideo(data.video, user.id)

      return {
        success: true,
        videoUrl,
      }
    } catch (error) {
      console.error('Video upload error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload video'
      setResponseStatus(500)
      throw { message: errorMessage, status: 500 }
    }
  })

// Get Cloudinary Upload Signature (for direct browser→Cloudinary uploads)
const getUploadSignatureSchema = z.object({
  resourceType: z.enum(['image', 'video', 'raw']).default('video'),
  folder: z.string().max(100).default('backgrounds'),
})

export const getUploadSignatureFn = createServerFn({ method: 'POST' })
  .inputValidator(getUploadSignatureSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(
      `upload:${user.id}:${ip}`,
      RATE_LIMITS.API_UPLOAD.maxRequests,
      RATE_LIMITS.API_UPLOAD.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw { message: 'Too many uploads. Please try again later.', status: 429 }
    }

    const folderMap: Record<string, string> = {
      backgrounds: 'eziox/backgrounds',
      avatars: 'eziox/avatars',
      banners: 'eziox/banners',
      cursors: 'eziox/cursors',
    }
    const folder = folderMap[data.folder] ?? 'eziox/backgrounds'
    const publicId = `${data.folder.replace(/s$/, '')}_${user.id}_${Date.now()}`

    const signatureData = generateUploadSignature({ folder, publicId, resourceType: data.resourceType })

    return { ...signatureData, resourceType: data.resourceType }
  })

// Upload Custom Cursor
const uploadCursorSchema = z.object({
  file: z.string().min(1, 'File data is required'),
  filename: z.string().max(255),
  mimeType: z.string().max(100),
})

export const uploadCursorFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadCursorSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(
      `upload:${user.id}:${ip}`,
      RATE_LIMITS.API_UPLOAD.maxRequests,
      RATE_LIMITS.API_UPLOAD.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw { message: 'Too many uploads. Please try again later.', status: 429 }
    }

    const allowedMimes = [
      'image/png', 'image/gif', 'image/webp', 'image/jpeg',
      'application/octet-stream', 'image/vnd.microsoft.icon',
    ]
    const allowedExts = ['.cur', '.ani', '.gif', '.png', '.jpg', '.jpeg', '.webp']
    const ext = data.filename.toLowerCase().slice(data.filename.lastIndexOf('.'))
    if (!allowedExts.includes(ext)) {
      setResponseStatus(400)
      throw { message: `Unsupported cursor file type: ${ext}`, status: 400 }
    }
    if (!allowedMimes.includes(data.mimeType) && data.mimeType !== '') {
      setResponseStatus(400)
      throw { message: 'Unsupported MIME type', status: 400 }
    }

    const MAX_SIZE = 512 * 1024 // 512 KB
    const base64Data = (data.file.includes(',') ? data.file.split(',')[1] : data.file) ?? ''
    const byteLength = Math.ceil(base64Data.length * 0.75)
    if (byteLength > MAX_SIZE) {
      setResponseStatus(400)
      throw { message: 'Cursor file too large (max 512 KB)', status: 400 }
    }

    try {
      const { v2: cloudinary } = await import('cloudinary')
      const publicId = `cursors/${user.id}_${Date.now()}_${data.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const dataUri = data.file.startsWith('data:') ? data.file : `data:application/octet-stream;base64,${base64Data}`

      const result = await cloudinary.uploader.upload(dataUri, {
        public_id: publicId,
        resource_type: 'raw',
        overwrite: true,
        folder: 'eziox/cursors',
      })

      return { success: true, url: result.secure_url }
    } catch (error) {
      console.error('Cursor upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload cursor'
      setResponseStatus(500)
      throw { message: errorMessage, status: 500 }
    }
  })

// ============================================================================
// FONT UPLOAD (saves to public/assets/fonts/)
// ============================================================================

const uploadFontSchema = z.object({
  fontName: z.string().min(1).max(100),
  fileName: z.string().min(1).max(200),
  fontData: z.string().min(1), // base64 data
})

export const uploadFontFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadFontSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const ip = getRequestIP() || 'unknown'
    const rateLimit = checkRateLimit(
      `upload:${user.id}:${ip}`,
      RATE_LIMITS.API_UPLOAD.maxRequests,
      RATE_LIMITS.API_UPLOAD.windowMs,
    )
    if (!rateLimit.allowed) {
      setResponseStatus(429)
      throw { message: 'Rate limited. Please wait.', status: 429, code: 'RATE_LIMITED' }
    }

    try {
      const { writeFile, mkdir } = await import('node:fs/promises')
      const { join } = await import('node:path')

      // Sanitize font name for folder
      const safeName = data.fontName.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_')
      const safeFileName = data.fileName.replace(/[^a-zA-Z0-9_.\- ]/g, '')

      const fontsDir = join(process.cwd(), 'public', 'assets', 'fonts', safeName)
      await mkdir(fontsDir, { recursive: true })

      // Strip base64 prefix if present
      const base64Data = data.fontData.includes(',') ? data.fontData.split(',')[1] ?? '' : data.fontData
      const buffer = Buffer.from(base64Data, 'base64')

      const filePath = join(fontsDir, safeFileName)
      await writeFile(filePath, buffer)

      const url = `/assets/fonts/${safeName}/${safeFileName}`
      return { success: true, url }
    } catch (error) {
      console.error('Font upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload font'
      setResponseStatus(500)
      throw { message: errorMessage, status: 500 }
    }
  })

// Type Exports
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>
export type UploadBannerInput = z.infer<typeof uploadBannerSchema>
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>
export type UploadVideoInput = z.infer<typeof uploadVideoSchema>
export type UploadCursorInput = z.infer<typeof uploadCursorSchema>
export type UploadFontInput = z.infer<typeof uploadFontSchema>
