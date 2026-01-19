/**
 * Cloudinary Configuration and Upload Utilities
 */

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Magic bytes for image validation
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/jpg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header, followed by WEBP at offset 8
}

function validateMagicBytes(base64Data: string, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) return true // No signature defined, skip check

  try {
    const binaryString = atob(base64Data.slice(0, 100)) // Only need first few bytes
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return signatures.some(signature => 
      signature.every((byte, index) => bytes[index] === byte)
    )
  } catch {
    return false
  }
}

function validateImageDataUrl(dataUrl: string): { valid: boolean; error?: string } {
  if (!dataUrl.startsWith('data:')) {
    return { valid: false, error: 'Invalid data URL format' }
  }

  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches || !matches[1] || !matches[2]) {
    return { valid: false, error: 'Invalid data URL structure' }
  }

  const mimeType = matches[1]
  const base64Data = matches[2]

  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` }
  }

  // Validate magic bytes to prevent MIME type spoofing
  if (!validateMagicBytes(base64Data, mimeType)) {
    return { valid: false, error: 'File content does not match declared type' }
  }

  const sizeInBytes = (base64Data.length * 3) / 4
  if (sizeInBytes > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  }

  return { valid: true }
}

/**
 * Upload image to Cloudinary
 * @param file - Base64 data URL or file path
 * @param folder - Cloudinary folder (e.g., 'avatars', 'banners')
 * @param publicId - Optional custom public ID
 */
export async function uploadImage(
  file: string,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `eziox/${folder}`,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image')
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image')
  }
}

/**
 * Upload avatar with optimizations
 */
export async function uploadAvatar(
  file: string,
  userId: string
): Promise<string> {
  const validation = validateImageDataUrl(file)
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image')
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: 'eziox/avatars',
    public_id: `avatar_${userId}`,
    overwrite: true,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  })

  return result.secure_url
}

/**
 * Upload banner with optimizations
 */
export async function uploadBanner(
  file: string,
  userId: string
): Promise<string> {
  const validation = validateImageDataUrl(file)
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image')
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: 'eziox/banners',
    public_id: `banner_${userId}`,
    overwrite: true,
    transformation: [
      { width: 1200, height: 400, crop: 'fill' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  })

  return result.secure_url
}
