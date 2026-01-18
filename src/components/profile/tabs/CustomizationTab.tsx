import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Link } from '@tanstack/react-router'
import { useTheme } from '@/components/portfolio/ThemeProvider'
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
  Image,
  Layout,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  Crown,
  Loader2,
  Sliders,
  History,
  ChevronRight,
} from 'lucide-react'
import type { CustomBackground, LayoutSettings } from '@/server/db/schema'

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
] as const

const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'expanded', label: 'Expanded' },
] as const

const LINK_STYLE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'glass', label: 'Glass' },
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
  const [activeSection, setActiveSection] = useState<'background' | 'layout' | 'backups'>('background')
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

  const [localBackground, setLocalBackground] = useState<CustomBackground | null>(null)
  const [localLayout, setLocalLayout] = useState<LayoutSettings>(DEFAULT_LAYOUT)

  const backgroundMutation = useMutation({
    mutationFn: (bg: CustomBackground | null) => updateBackground({ data: bg }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  const layoutMutation = useMutation({
    mutationFn: (layout: Partial<LayoutSettings>) => updateLayout({ data: layout }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  const backupMutation = useMutation({
    mutationFn: (name: string) => createBackup({ data: { name } }),
    onSuccess: () => {
      setBackupName('')
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (backupId: string) => restoreBackup({ data: { backupId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (backupId: string) => deleteBackup({ data: { backupId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.colors.primary }} />
      </motion.div>
    )
  }

  const canCustomize = settings?.canCustomize ?? false
  const canLayoutCustomize = settings?.canLayoutCustomize ?? false
  const canBackup = settings?.canBackup ?? false

  if (!canCustomize && !canLayoutCustomize && !canBackup) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}20)` }}
        >
          <Crown size={40} style={{ color: theme.colors.primary }} />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: theme.colors.foreground }}>
          Unlock Customization
        </h2>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: theme.colors.foregroundMuted }}>
          Custom backgrounds, layout fine-tuning, and profile backups are available with Pro tier and above.
        </p>
        <Link
          to="/profile"
          search={{ tab: 'subscription' }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
        >
          <Crown size={18} />
          Upgrade to Pro
          <ChevronRight size={16} />
        </Link>
      </motion.div>
    )
  }

  const currentBackground = localBackground ?? settings?.customBackground ?? null
  const currentLayout = localLayout ?? settings?.layoutSettings ?? DEFAULT_LAYOUT

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
        style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}` }}
      >
        {[
          { id: 'background', label: 'Background', icon: Image },
          { id: 'layout', label: 'Layout', icon: Layout },
          { id: 'backups', label: 'Backups', icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveSection(id as typeof activeSection)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeSection === id ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : 'transparent',
              color: activeSection === id ? '#fff' : theme.colors.foregroundMuted,
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
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="p-5 border-b" style={{ borderColor: theme.colors.border }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
                  <Palette size={20} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Custom Background</h3>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Solid color, gradient, or image</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {(['solid', 'gradient', 'image'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setLocalBackground({ 
                      type, 
                      value: type === 'solid' ? '#1a1a2e' : type === 'gradient' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '',
                      gradientColors: type === 'gradient' ? ['#667eea', '#764ba2'] : undefined,
                      gradientAngle: type === 'gradient' ? 135 : undefined,
                    })}
                    className="p-4 rounded-xl text-center transition-all"
                    style={{
                      background: currentBackground?.type === type ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary,
                      border: `2px solid ${currentBackground?.type === type ? theme.colors.primary : 'transparent'}`,
                    }}
                  >
                    <div className="text-sm font-medium capitalize" style={{ color: theme.colors.foreground }}>{type}</div>
                  </button>
                ))}
              </div>

              {currentBackground?.type === 'solid' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentBackground.value || '#1a1a2e'}
                      onChange={(e) => setLocalBackground({ ...currentBackground, value: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={currentBackground.value || '#1a1a2e'}
                      onChange={(e) => setLocalBackground({ ...currentBackground, value: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                      style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                    />
                  </div>
                </div>
              )}

              {currentBackground?.type === 'gradient' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Gradient Colors</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentBackground.gradientColors?.[0] || '#667eea'}
                      onChange={(e) => setLocalBackground({ 
                        ...currentBackground, 
                        gradientColors: [e.target.value, currentBackground.gradientColors?.[1] || '#764ba2'],
                        value: `linear-gradient(${currentBackground.gradientAngle || 135}deg, ${e.target.value}, ${currentBackground.gradientColors?.[1] || '#764ba2'})`
                      })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <input
                      type="color"
                      value={currentBackground.gradientColors?.[1] || '#764ba2'}
                      onChange={(e) => setLocalBackground({ 
                        ...currentBackground, 
                        gradientColors: [currentBackground.gradientColors?.[0] || '#667eea', e.target.value],
                        value: `linear-gradient(${currentBackground.gradientAngle || 135}deg, ${currentBackground.gradientColors?.[0] || '#667eea'}, ${e.target.value})`
                      })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <div className="flex-1">
                      <label className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Angle: {currentBackground.gradientAngle || 135}°</label>
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
                            value: `linear-gradient(${angle}deg, ${currentBackground.gradientColors?.[0] || '#667eea'}, ${currentBackground.gradientColors?.[1] || '#764ba2'})`
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
                  <label className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={currentBackground.imageUrl || ''}
                    onChange={(e) => setLocalBackground({ ...currentBackground, imageUrl: e.target.value, value: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Opacity: {Math.round((currentBackground.imageOpacity ?? 1) * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={(currentBackground.imageOpacity ?? 1) * 100}
                        onChange={(e) => setLocalBackground({ ...currentBackground, imageOpacity: parseInt(e.target.value) / 100 })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Blur: {currentBackground.imageBlur ?? 0}px</label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={currentBackground.imageBlur ?? 0}
                        onChange={(e) => setLocalBackground({ ...currentBackground, imageBlur: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <motion.button
                  onClick={() => backgroundMutation.mutate(currentBackground)}
                  disabled={backgroundMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {backgroundMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Background
                </motion.button>
                <motion.button
                  onClick={() => backgroundMutation.mutate(null)}
                  disabled={backgroundMutation.isPending}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
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
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="p-5 border-b" style={{ borderColor: theme.colors.border }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                  <Sliders size={20} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Layout Settings</h3>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Fine-tune spacing, borders, and shadows</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Card Spacing</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={currentLayout.cardSpacing}
                      onChange={(e) => setLocalLayout({ ...currentLayout, cardSpacing: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right" style={{ color: theme.colors.foregroundMuted }}>{currentLayout.cardSpacing}px</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Border Radius</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={currentLayout.cardBorderRadius}
                      onChange={(e) => setLocalLayout({ ...currentLayout, cardBorderRadius: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right" style={{ color: theme.colors.foregroundMuted }}>{currentLayout.cardBorderRadius}px</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Card Padding</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={currentLayout.cardPadding}
                      onChange={(e) => setLocalLayout({ ...currentLayout, cardPadding: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right" style={{ color: theme.colors.foregroundMuted }}>{currentLayout.cardPadding}px</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Shadow</label>
                  <select
                    value={currentLayout.cardShadow}
                    onChange={(e) => setLocalLayout({ ...currentLayout, cardShadow: e.target.value as LayoutSettings['cardShadow'] })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                  >
                    {SHADOW_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Profile Layout</label>
                  <select
                    value={currentLayout.profileLayout}
                    onChange={(e) => setLocalLayout({ ...currentLayout, profileLayout: e.target.value as LayoutSettings['profileLayout'] })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                  >
                    {LAYOUT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: theme.colors.foreground }}>Link Style</label>
                  <select
                    value={currentLayout.linkStyle}
                    onChange={(e) => setLocalLayout({ ...currentLayout, linkStyle: e.target.value as LayoutSettings['linkStyle'] })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                  >
                    {LINK_STYLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  onClick={() => layoutMutation.mutate(currentLayout)}
                  disabled={layoutMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {layoutMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Layout
                </motion.button>
                <motion.button
                  onClick={() => setLocalLayout(DEFAULT_LAYOUT)}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
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
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="p-5 border-b" style={{ borderColor: theme.colors.border }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <History size={20} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Profile Backups</h3>
                    <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Save and restore profile versions</p>
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
                    style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                  />
                  <motion.button
                    onClick={() => backupName && backupMutation.mutate(backupName)}
                    disabled={!backupName || backupMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}
                    whileHover={{ scale: backupName ? 1.02 : 1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {backupMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Create Backup
                  </motion.button>
                </div>

                {settings?.profileBackups && settings.profileBackups.length > 0 ? (
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
                          <p className="font-medium text-sm" style={{ color: theme.colors.foreground }}>{backup.name}</p>
                          <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                            {new Date(backup.createdAt).toLocaleDateString('de-DE', { 
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
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
                    <History size={32} className="mx-auto mb-3 opacity-30" style={{ color: theme.colors.foregroundMuted }} />
                    <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>No backups yet</p>
                    <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>Create a backup before making changes</p>
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
