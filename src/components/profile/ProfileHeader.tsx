import { motion } from 'motion/react'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { ImageUpload } from '@/components/profile/image-upload'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { AtSign, Sparkles, Save, X, Loader2 } from 'lucide-react'
import { CREATOR_TYPES } from './constants'
import type { ProfileUser } from './types'

interface ProfileHeaderProps {
  currentUser: ProfileUser
  avatar: string | null
  banner: string | null
  onAvatarChange: (url: string) => void
  onBannerChange: (url: string) => void
  hasChanges: boolean
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

export function ProfileHeader({
  currentUser,
  avatar,
  banner,
  onAvatarChange,
  onBannerChange,
  hasChanges,
  isSaving,
  onSave,
  onCancel,
}: ProfileHeaderProps) {
  const { theme } = useTheme()
  const accentColor = theme.colors.primary
  const userBadges = (currentUser.profile?.badges || []) as string[]
  const creatorTypesRaw = currentUser.profile?.creatorTypes
  const creatorTypes = Array.isArray(creatorTypesRaw) ? creatorTypesRaw : []
  const pronouns = currentUser.profile?.pronouns

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8"
    >
      <motion.div
        className="absolute inset-0 rounded-3xl blur-3xl -z-10"
        style={{ background: `linear-gradient(135deg, ${accentColor}30, ${theme.colors.accent}20)` }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.border}, transparent)` }}
        />
        
        <div className="relative h-44 md:h-52">
          <ImageUpload
            type="banner"
            currentImage={banner}
            onUploadSuccess={onBannerChange}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)' }}
          />
        </div>

        <div className="px-6 pb-6 -mt-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="relative">
                <ImageUpload
                  type="avatar"
                  currentImage={avatar}
                  onUploadSuccess={onAvatarChange}
                />
                <motion.div
                  className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-4"
                  style={{ borderColor: theme.colors.card }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1
                    className="text-xl md:text-2xl font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {currentUser.name || 'Anonymous'}
                  </h1>
                  {userBadges.length > 0 && (
                    <BadgeDisplay badges={userBadges} size="sm" maxDisplay={4} />
                  )}
                  {creatorTypes.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {creatorTypes.slice(0, 3).map((type) => (
                        <span
                          key={type}
                          className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                          style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
                        >
                          <Sparkles size={10} />
                          {CREATOR_TYPES.find(t => t.value === type)?.label || type}
                        </span>
                      ))}
                      {creatorTypes.length > 3 && (
                        <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>+{creatorTypes.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <p
                  className="text-sm flex items-center gap-1.5"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  <AtSign size={14} />
                  {currentUser.username}
                  {pronouns && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      {pronouns}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {hasChanges && (
              <div className="flex gap-2">
                <motion.button
                  onClick={onCancel}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X size={14} />
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm bg-green-500 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
