/**
 * Image Upload Component
 * Handles avatar and banner uploads with preview
 */

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  uploadAvatarFn,
  uploadBannerFn,
  removeAvatarFn,
  removeBannerFn,
} from '@/server/functions/upload'
import { Camera, X, Loader2, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface ImageUploadProps {
  type: 'avatar' | 'banner'
  currentImage?: string | null
  onUploadSuccess?: (url: string) => void
}

export function ImageUpload({
  type,
  currentImage,
  onUploadSuccess,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const uploadAvatar = useServerFn(uploadAvatarFn)
  const uploadBanner = useServerFn(uploadBannerFn)
  const removeAvatar = useServerFn(removeAvatarFn)
  const removeBanner = useServerFn(removeBannerFn)

  const uploadMutation = useMutation({
    mutationFn: async (imageData: string) => {
      if (type === 'avatar') {
        return await uploadAvatar({ data: { image: imageData } })
      } else {
        return await uploadBanner({ data: { image: imageData } })
      }
    },
    onSuccess: (data) => {
      const url = 'avatarUrl' in data ? data.avatarUrl : data.bannerUrl
      setPreview(null)
      onUploadSuccess?.(url)
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (type === 'avatar') {
        return await removeAvatar({})
      } else {
        return await removeBanner({})
      }
    },
    onSuccess: () => {
      setPreview(null)
      onUploadSuccess?.('' as string)
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Read file and create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!preview) return
    uploadMutation.mutate(preview)
  }

  const handleRemove = () => {
    if (confirm(`Remove ${type}?`)) {
      removeMutation.mutate()
    }
  }

  const handleCancel = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isLoading = uploadMutation.isPending || removeMutation.isPending
  const displayImage = preview || currentImage

  if (type === 'avatar') {
    return (
      <div className="relative">
        <div
          className="relative w-32 h-32 rounded-full overflow-hidden group cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: displayImage
              ? `url(${displayImage}) center/cover`
              : 'linear-gradient(135deg, var(--primary), var(--accent))',
            border: '4px solid var(--card)',
          }}
        >
          {!displayImage && (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
              ?
            </div>
          )}

          {/* Overlay */}
          <AnimatePresence>
            {(isHovering || isLoading) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {preview && !isLoading && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleUpload()
              }}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              Save
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCancel()
              }}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {currentImage && !preview && !isLoading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
            className="absolute top-0 right-0 p-1 rounded-full transition-colors"
            style={{ background: 'var(--destructive)', color: 'white' }}
          >
            <X size={16} />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  // Banner upload
  return (
    <div className="relative">
      <div
        className="relative w-full h-48 rounded-2xl overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: displayImage
            ? `url(${displayImage}) center/cover`
            : 'linear-gradient(135deg, var(--primary), var(--accent))',
          border: '1px solid var(--border)',
        }}
      >
        {!displayImage && (
          <div className="w-full h-full flex items-center justify-center">
            <Upload
              className="w-12 h-12"
              style={{ color: 'white', opacity: 0.5 }}
            />
          </div>
        )}

        {/* Overlay */}
        <AnimatePresence>
          {(isHovering || isLoading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <div className="text-center text-white">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Change Banner</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {preview && !isLoading && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleUpload()
            }}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            Save Banner
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCancel()
            }}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {currentImage && !preview && !isLoading && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
          style={{ background: 'var(--destructive)', color: 'white' }}
        >
          <X size={20} />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
