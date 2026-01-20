import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { toast } from 'sonner'
import {
  getProfileSettingsFn,
  updateCustomBackgroundFn,
  updateLayoutSettingsFn,
  createProfileBackupFn,
  restoreProfileBackupFn,
  deleteProfileBackupFn,
} from '@/server/functions/profile-settings'
import {
  Palette,
  ImageIcon,
  LayoutGrid,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  Loader2,
  Upload,
  History,
  Sliders,
} from 'lucide-react'
import type { CustomBackground, LayoutSettings } from '@/server/db/schema'
import { ANIMATED_PRESETS } from '@/components/backgrounds/AnimatedBackgrounds'

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None', preview: 'shadow-none' },
  { value: 'sm', label: 'Subtle', preview: 'shadow-sm' },
  { value: 'md', label: 'Medium', preview: 'shadow-md' },
  { value: 'lg', label: 'Large', preview: 'shadow-lg' },
  { value: 'xl', label: 'Dramatic', preview: 'shadow-xl' },
] as const

const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'expanded', label: 'Expanded' },
] as const

const LINK_STYLE_OPTIONS = [
  { value: 'default', label: 'Default', desc: 'Classic look' },
  { value: 'minimal', label: 'Minimal', desc: 'Clean borders' },
  { value: 'bold', label: 'Bold', desc: 'Accent background' },
  { value: 'glass', label: 'Glass', desc: 'Frosted effect' },
] as const

const DEFAULT_LAYOUT: LayoutSettings = {
  cardSpacing: 12,
  cardBorderRadius: 16,
  cardShadow: 'md',
  cardPadding: 16,
  profileLayout: 'default',
  linkStyle: 'default',
}

export function CustomizationTab() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<
    'background' | 'layout' | 'backups'
  >('background')
  const [backupName, setBackupName] = useState('')

  const getSettings = useServerFn(getProfileSettingsFn)
  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const updateLayout = useServerFn(updateLayoutSettingsFn)
  const createBackup = useServerFn(createProfileBackupFn)
  const restoreBackup = useServerFn(restoreProfileBackupFn)
  const deleteBackup = useServerFn(deleteProfileBackupFn)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: () => getSettings(),
  })

  const [localBackground, setLocalBackground] =
    useState<CustomBackground | null>(null)
  const [localLayout, setLocalLayout] = useState<LayoutSettings>(DEFAULT_LAYOUT)

  useEffect(() => {
    if (settings?.customBackground) {
      setLocalBackground(settings.customBackground)
    }
    if (settings?.layoutSettings) {
      setLocalLayout(settings.layoutSettings)
    }
  }, [settings])

  const backgroundMutation = useMutation({
    mutationFn: (bg: CustomBackground | null) => updateBackground({ data: bg }),
    onSuccess: () => {
      toast.success('Background saved!', {
        description: 'Your changes are now live on your bio page.',
      })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to save', { description: 'Please try again.' })
    },
  })

  const layoutMutation = useMutation({
    mutationFn: (layout: Partial<LayoutSettings>) =>
      updateLayout({ data: layout }),
    onSuccess: () => {
      toast.success('Layout saved!', {
        description: 'Your bio page has been updated.',
      })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to save', { description: 'Please try again.' })
    },
  })

  const backupMutation = useMutation({
    mutationFn: (name: string) => createBackup({ data: { name } }),
    onSuccess: () => {
      toast.success('Backup created!', {
        description: `"${backupName}" has been saved.`,
      })
      setBackupName('')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
    onError: () => {
      toast.error('Failed to create backup', {
        description: 'Please try again.',
      })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (backupId: string) => restoreBackup({ data: { backupId } }),
    onSuccess: () => {
      toast.success('Backup restored!', {
        description: 'Your profile has been restored.',
      })
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({ queryKey: ['publicProfile'] })
    },
    onError: () => {
      toast.error('Failed to restore', { description: 'Please try again.' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (backupId: string) => deleteBackup({ data: { backupId } }),
    onSuccess: () => {
      toast.success('Backup deleted')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
    onError: () => {
      toast.error('Failed to delete', { description: 'Please try again.' })
    },
  })

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: theme.colors.primary }}
        />
      </motion.div>
    )
  }


  const currentBackground =
    localBackground ?? settings?.customBackground ?? null
  const currentLayout =
    localLayout ?? settings?.layoutSettings ?? DEFAULT_LAYOUT

  return (
    <motion.div
      key="customization"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div
        className="flex items-center rounded-xl p-1"
        style={{
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {[
          { id: 'background', label: 'Background', icon: ImageIcon },
          { id: 'layout', label: 'Layout', icon: LayoutGrid },
          { id: 'backups', label: 'Backups', icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveSection(id as typeof activeSection)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                activeSection === id
                  ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                  : 'transparent',
              color:
                activeSection === id ? '#fff' : theme.colors.foregroundMuted,
            }}
            whileHover={{ scale: activeSection === id ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon size={16} />
            {label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'background' && (
          <motion.div
            key="background"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-5 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme.colors.primary}20` }}
                >
                  <Palette size={20} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    Custom Background
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Solid, gradient, image, video, or animated
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {(
                  ['solid', 'gradient', 'image', 'video', 'animated'] as const
                ).map((type) => {
                  // All background types are now available to ALL users
                  return (
                    <button
                      key={type}
                      onClick={() =>
                        setLocalBackground({
                          type,
                          value:
                            type === 'solid'
                              ? '#1a1a2e'
                              : type === 'gradient'
                                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                : '',
                          gradientColors:
                            type === 'gradient'
                              ? ['#667eea', '#764ba2']
                              : undefined,
                          gradientAngle: type === 'gradient' ? 135 : undefined,
                          animatedPreset:
                            type === 'animated' ? 'particles' : undefined,
                          animatedSpeed:
                            type === 'animated' ? 'normal' : undefined,
                          animatedIntensity:
                            type === 'animated' ? 'normal' : undefined,
                          videoLoop: type === 'video' ? true : undefined,
                          videoMuted: type === 'video' ? true : undefined,
                        })
                      }
                      className="p-3 rounded-xl text-center transition-all relative"
                      style={{
                        background:
                          currentBackground?.type === type
                            ? `${theme.colors.primary}20`
                            : theme.colors.backgroundSecondary,
                        border: `2px solid ${currentBackground?.type === type ? theme.colors.primary : 'transparent'}`,
                      }}
                    >
                      <div
                        className="text-xs font-medium capitalize"
                        style={{ color: theme.colors.foreground }}
                      >
                        {type}
                      </div>
                    </button>
                  )
                })}
              </div>

              {currentBackground?.type === 'solid' && (
                <div className="space-y-3">
                  <label
                    className="text-sm font-medium"
                    style={{ color: theme.colors.foreground }}
                  >
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentBackground.value || '#1a1a2e'}
                      onChange={(e) =>
                        setLocalBackground({
                          ...currentBackground,
                          value: e.target.value,
                        })
                      }
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={currentBackground.value || '#1a1a2e'}
                      onChange={(e) =>
                        setLocalBackground({
                          ...currentBackground,
                          value: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        color: theme.colors.foreground,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    />
                  </div>
                </div>
              )}

              {currentBackground?.type === 'gradient' && (
                <div className="space-y-3">
                  <label
                    className="text-sm font-medium"
                    style={{ color: theme.colors.foreground }}
                  >
                    Gradient Colors
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentBackground.gradientColors?.[0] || '#667eea'}
                      onChange={(e) =>
                        setLocalBackground({
                          ...currentBackground,
                          gradientColors: [
                            e.target.value,
                            currentBackground.gradientColors?.[1] || '#764ba2',
                          ],
                          value: `linear-gradient(${currentBackground.gradientAngle || 135}deg, ${e.target.value}, ${currentBackground.gradientColors?.[1] || '#764ba2'})`,
                        })
                      }
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <input
                      type="color"
                      value={currentBackground.gradientColors?.[1] || '#764ba2'}
                      onChange={(e) =>
                        setLocalBackground({
                          ...currentBackground,
                          gradientColors: [
                            currentBackground.gradientColors?.[0] || '#667eea',
                            e.target.value,
                          ],
                          value: `linear-gradient(${currentBackground.gradientAngle || 135}deg, ${currentBackground.gradientColors?.[0] || '#667eea'}, ${e.target.value})`,
                        })
                      }
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <div className="flex-1">
                      <label
                        className="text-xs"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        Angle: {currentBackground.gradientAngle || 135}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={currentBackground.gradientAngle || 135}
                        onChange={(e) => {
                          const angle = parseInt(e.target.value)
                          setLocalBackground({
                            ...currentBackground,
                            gradientAngle: angle,
                            value: `linear-gradient(${angle}deg, ${currentBackground.gradientColors?.[0] || '#667eea'}, ${currentBackground.gradientColors?.[1] || '#764ba2'})`,
                          })
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div
                    className="h-20 rounded-xl"
                    style={{ background: currentBackground.value }}
                  />
                </div>
              )}

              {currentBackground?.type === 'image' && (
                <div className="space-y-3">
                  <label
                    className="text-sm font-medium"
                    style={{ color: theme.colors.foreground }}
                  >
                    Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg or paste data URL"
                      value={currentBackground.imageUrl || ''}
                      onChange={(e) =>
                        setLocalBackground({
                          ...currentBackground,
                          imageUrl: e.target.value,
                          value: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        color: theme.colors.foreground,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    />
                    <label
                      className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2 transition-all hover:opacity-80"
                      style={{
                        background: theme.colors.primary,
                        color: '#fff',
                      }}
                    >
                      <Upload size={16} />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string
                              setLocalBackground({
                                ...currentBackground,
                                imageUrl: dataUrl,
                                value: dataUrl,
                              })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Upload from your device or paste an image URL. Supports JPG,
                    PNG, GIF, WebP.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="text-xs"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        Opacity:{' '}
                        {Math.round(
                          (currentBackground.imageOpacity ?? 1) * 100,
                        )}
                        %
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={(currentBackground.imageOpacity ?? 1) * 100}
                        onChange={(e) =>
                          setLocalBackground({
                            ...currentBackground,
                            imageOpacity: parseInt(e.target.value) / 100,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        Blur: {currentBackground.imageBlur ?? 0}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={currentBackground.imageBlur ?? 0}
                        onChange={(e) =>
                          setLocalBackground({
                            ...currentBackground,
                            imageBlur: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentBackground?.type === 'video' && (
                <div className="space-y-3">
                  <label
                    className="text-sm font-medium"
                    style={{ color: theme.colors.foreground }}
                  >
                    Video
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/video.mp4"
                      value={currentBackground.videoUrl || ''}
                      onChange={(e) =>
                        setLocalBackground({
                          ...currentBackground,
                          videoUrl: e.target.value,
                          value: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        color: theme.colors.foreground,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    />
                    <label
                      className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2 transition-all hover:opacity-80"
                      style={{
                        background: theme.colors.primary,
                        color: '#fff',
                      }}
                    >
                      <Upload size={16} />
                      Upload
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const url = URL.createObjectURL(file)
                            setLocalBackground({
                              ...currentBackground,
                              videoUrl: url,
                              value: url,
                            })
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentBackground.videoLoop ?? true}
                        onChange={(e) =>
                          setLocalBackground({
                            ...currentBackground,
                            videoLoop: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <span
                        className="text-sm"
                        style={{ color: theme.colors.foreground }}
                      >
                        Loop
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentBackground.videoMuted ?? true}
                        onChange={(e) =>
                          setLocalBackground({
                            ...currentBackground,
                            videoMuted: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <span
                        className="text-sm"
                        style={{ color: theme.colors.foreground }}
                      >
                        Muted
                      </span>
                    </label>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Supported: MP4, WebM, MOV, OGG, AVI, MKV, M4V. WebM
                    recommended for best performance.
                  </p>
                </div>
              )}

              {currentBackground?.type === 'animated' && (
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-sm font-medium mb-3 block"
                      style={{ color: theme.colors.foreground }}
                    >
                      Choose Animation
                    </label>
                    <div className="space-y-3">
                      {[
                        'vtuber',
                        'gamer',
                        'developer',
                        'nature',
                        'abstract',
                      ].map((category) => (
                        <div key={category}>
                          <p
                            className="text-xs font-medium uppercase tracking-wider mb-2"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {category === 'vtuber'
                              ? 'VTuber / Anime'
                              : category.charAt(0).toUpperCase() +
                                category.slice(1)}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {ANIMATED_PRESETS.filter(
                              (p) => p.category === category,
                            ).map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() =>
                                  setLocalBackground({
                                    type: 'animated',
                                    value: preset.id,
                                    animatedPreset: preset.id,
                                    animatedSpeed: currentBackground?.animatedSpeed || 'normal',
                                    animatedIntensity: currentBackground?.animatedIntensity || 'normal',
                                    animatedColors: currentBackground?.animatedColors,
                                  })
                                }
                                className="p-2 rounded-lg text-left transition-all"
                                style={{
                                  background:
                                    currentBackground?.animatedPreset ===
                                    preset.id
                                      ? `${theme.colors.primary}20`
                                      : theme.colors.backgroundSecondary,
                                  border: `1px solid ${currentBackground?.animatedPreset === preset.id ? theme.colors.primary : theme.colors.border}`,
                                }}
                              >
                                <div
                                  className="text-xs font-medium"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  {preset.name}
                                </div>
                                <div
                                  className="text-[10px] truncate"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {preset.description}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"
                        style={{ color: theme.colors.foreground }}
                      >
                        Speed
                      </label>
                      <div className="flex gap-2">
                        {(['slow', 'normal', 'fast'] as const).map((speed) => (
                          <button
                            key={speed}
                            onClick={() =>
                              setLocalBackground({
                                ...currentBackground,
                                animatedSpeed: speed,
                              })
                            }
                            className="flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                            style={{
                              background:
                                currentBackground.animatedSpeed === speed
                                  ? theme.colors.primary
                                  : theme.colors.backgroundSecondary,
                              color:
                                currentBackground.animatedSpeed === speed
                                  ? '#fff'
                                  : theme.colors.foreground,
                            }}
                          >
                            {speed}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"
                        style={{ color: theme.colors.foreground }}
                      >
                        Intensity
                      </label>
                      <div className="flex gap-2">
                        {(['subtle', 'normal', 'intense'] as const).map(
                          (intensity) => (
                            <button
                              key={intensity}
                              onClick={() =>
                                setLocalBackground({
                                  ...currentBackground,
                                  animatedIntensity: intensity,
                                })
                              }
                              className="flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                              style={{
                                background:
                                  currentBackground.animatedIntensity ===
                                  intensity
                                    ? theme.colors.primary
                                    : theme.colors.backgroundSecondary,
                                color:
                                  currentBackground.animatedIntensity ===
                                  intensity
                                    ? '#fff'
                                    : theme.colors.foreground,
                              }}
                            >
                              {intensity}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className="text-sm font-medium mb-2 block"
                      style={{ color: theme.colors.foreground }}
                    >
                      Custom Colors
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={
                          currentBackground.animatedColors?.[0] || '#8b5cf6'
                        }
                        onChange={(e) =>
                          setLocalBackground({
                            ...currentBackground,
                            animatedColors: [
                              e.target.value,
                              currentBackground.animatedColors?.[1] ||
                                '#ec4899',
                            ],
                          })
                        }
                        className="w-12 h-10 rounded-lg cursor-pointer border-0"
                      />
                      <input
                        type="color"
                        value={
                          currentBackground.animatedColors?.[1] || '#ec4899'
                        }
                        onChange={(e) =>
                          setLocalBackground({
                            ...currentBackground,
                            animatedColors: [
                              currentBackground.animatedColors?.[0] ||
                                '#8b5cf6',
                              e.target.value,
                            ],
                          })
                        }
                        className="w-12 h-10 rounded-lg cursor-pointer border-0"
                      />
                      <span
                        className="text-xs self-center"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        Primary & Secondary
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <motion.button
                  onClick={() => backgroundMutation.mutate(currentBackground)}
                  disabled={backgroundMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    color: '#fff',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {backgroundMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Background
                </motion.button>
                <motion.button
                  onClick={() => backgroundMutation.mutate(null)}
                  disabled={backgroundMutation.isPending}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foregroundMuted,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'layout' && (
          <motion.div
            key="layout"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="p-5 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                >
                  <Sliders size={20} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    Layout Settings
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Fine-tune spacing, borders, and shadows
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Card Spacing
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={currentLayout.cardSpacing}
                      onChange={(e) =>
                        setLocalLayout({
                          ...currentLayout,
                          cardSpacing: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span
                      className="text-sm w-12 text-right"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {currentLayout.cardSpacing}px
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Border Radius
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={currentLayout.cardBorderRadius}
                      onChange={(e) =>
                        setLocalLayout({
                          ...currentLayout,
                          cardBorderRadius: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span
                      className="text-sm w-12 text-right"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {currentLayout.cardBorderRadius}px
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Card Padding
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={currentLayout.cardPadding}
                      onChange={(e) =>
                        setLocalLayout({
                          ...currentLayout,
                          cardPadding: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span
                      className="text-sm w-12 text-right"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {currentLayout.cardPadding}px
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Shadow
                  </label>
                  <select
                    value={currentLayout.cardShadow}
                    onChange={(e) =>
                      setLocalLayout({
                        ...currentLayout,
                        cardShadow: e.target
                          .value as LayoutSettings['cardShadow'],
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {SHADOW_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Profile Layout
                  </label>
                  <select
                    value={currentLayout.profileLayout}
                    onChange={(e) =>
                      setLocalLayout({
                        ...currentLayout,
                        profileLayout: e.target
                          .value as LayoutSettings['profileLayout'],
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {LAYOUT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: theme.colors.foreground }}
                  >
                    Link Style
                  </label>
                  <select
                    value={currentLayout.linkStyle}
                    onChange={(e) =>
                      setLocalLayout({
                        ...currentLayout,
                        linkStyle: e.target
                          .value as LayoutSettings['linkStyle'],
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {LINK_STYLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  onClick={() => layoutMutation.mutate(currentLayout)}
                  disabled={layoutMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {layoutMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Layout
                </motion.button>
                <motion.button
                  onClick={() => setLocalLayout(DEFAULT_LAYOUT)}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foregroundMuted,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'backups' && (
          <motion.div
            key="backups"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                className="p-5 border-b"
                style={{ borderColor: theme.colors.border }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                  >
                    <History size={20} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <h3
                      className="font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      Profile Backups
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Save and restore profile versions
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Backup name (e.g., 'Before redesign')"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foreground,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  />
                  <motion.button
                    onClick={() =>
                      backupName && backupMutation.mutate(backupName)
                    }
                    disabled={!backupName || backupMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: '#fff',
                    }}
                    whileHover={{ scale: backupName ? 1.02 : 1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {backupMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Create Backup
                  </motion.button>
                </div>

                {settings?.profileBackups &&
                settings.profileBackups.length > 0 ? (
                  <div className="space-y-3">
                    {settings.profileBackups.map((backup) => (
                      <motion.div
                        key={backup.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: theme.colors.backgroundSecondary }}
                      >
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: theme.colors.foreground }}
                          >
                            {backup.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {new Date(backup.createdAt).toLocaleDateString(
                              'de-DE',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => restoreMutation.mutate(backup.id)}
                            disabled={restoreMutation.isPending}
                            className="p-2 rounded-lg transition-all hover:bg-white/10"
                            title="Restore"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <RotateCcw size={16} style={{ color: '#22c55e' }} />
                          </motion.button>
                          <motion.button
                            onClick={() => deleteMutation.mutate(backup.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 rounded-lg transition-all hover:bg-white/10"
                            title="Delete"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={16} style={{ color: '#ef4444' }} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <History
                      size={32}
                      className="mx-auto mb-3 opacity-30"
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      No backups yet
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Create a backup before making changes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
