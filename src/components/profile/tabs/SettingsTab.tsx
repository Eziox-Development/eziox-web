import { useState } from 'react'
import { motion } from 'motion/react'
import { Palette, Shield, Eye, EyeOff, Mail, AtSign, User, Calendar, Sparkles, Check, Copy, Music, Bell, UserPlus, Trophy, Megaphone } from 'lucide-react'
import { ACCENT_COLORS, type ProfileFormData } from '@/routes/_protected/profile'
import { SpotifyConnect } from '@/components/spotify'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotificationSettingsFn, updateNotificationSettingsFn } from '@/server/functions/notifications'

interface SettingsTabProps {
  formData: ProfileFormData
  updateField: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void
  currentUser: { id: string; email: string | null; username: string; role: string | null; createdAt: string }
  copyToClipboard: (text: string, field: string) => void
  copiedField: string | null
}

export function SettingsTab({ formData, updateField, currentUser, copyToClipboard, copiedField }: SettingsTabProps) {
  const [isInfoBlurred, setIsInfoBlurred] = useState(true)
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const getSettings = useServerFn(getNotificationSettingsFn)
  const updateSettings = useServerFn(updateNotificationSettingsFn)

  const { data: notificationSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: () => getSettings(),
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { notifyNewFollower?: boolean; notifyMilestones?: boolean; notifySystemUpdates?: boolean }) =>
      updateSettings({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })
    },
  })

  const handleToggleSetting = (key: 'notifyNewFollower' | 'notifyMilestones' | 'notifySystemUpdates') => {
    if (!notificationSettings) return
    updateSettingsMutation.mutate({ [key]: !notificationSettings[key] })
  }

  const memberSince = currentUser.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown'

  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Music size={20} style={{ color: '#1DB954' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Integrations</h2>
          </div>
        </div>
        <div className="p-5">
          <SpotifyConnect theme={theme} />
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Palette size={20} style={{ color: formData.accentColor }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Appearance</h2>
          </div>
        </div>
        <div className="p-5">
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <button key={color} onClick={() => updateField('accentColor', color)} className="w-10 h-10 rounded-xl transition-all" style={{ background: color, boxShadow: formData.accentColor === color ? `0 0 0 3px var(--background), 0 0 0 5px ${color}` : 'none' }}>
                {formData.accentColor === color && <Check size={20} className="text-white mx-auto" />}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input type="color" value={formData.accentColor} onChange={(e) => updateField('accentColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
            <input type="text" value={formData.accentColor} onChange={(e) => /^#[0-9A-Fa-f]{6}$/.test(e.target.value) && updateField('accentColor', e.target.value)} className="px-3 py-2 rounded-lg font-mono text-sm w-28" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Bell size={20} style={{ color: formData.accentColor }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Notifications</h2>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Choose what you want to be notified about</p>
        </div>
        <div className="p-5 space-y-4">
          {settingsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: formData.accentColor, borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              <NotificationToggle
                icon={UserPlus}
                title="New Followers"
                description="Get notified when someone follows you"
                enabled={notificationSettings?.notifyNewFollower ?? true}
                onToggle={() => handleToggleSetting('notifyNewFollower')}
                accentColor={formData.accentColor}
                isPending={updateSettingsMutation.isPending}
              />
              <NotificationToggle
                icon={Trophy}
                title="Milestones"
                description="Profile views and link click milestones"
                enabled={notificationSettings?.notifyMilestones ?? true}
                onToggle={() => handleToggleSetting('notifyMilestones')}
                accentColor={formData.accentColor}
                isPending={updateSettingsMutation.isPending}
              />
              <NotificationToggle
                icon={Megaphone}
                title="System Updates"
                description="Platform updates and announcements"
                enabled={notificationSettings?.notifySystemUpdates ?? true}
                onToggle={() => handleToggleSetting('notifySystemUpdates')}
                accentColor={formData.accentColor}
                isPending={updateSettingsMutation.isPending}
              />
            </>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Shield size={20} style={{ color: formData.accentColor }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Account Details</h2>
          </div>
          <button onClick={() => setIsInfoBlurred(!isInfoBlurred)} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--background-secondary)' }}>
            {isInfoBlurred ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="text-sm">{isInfoBlurred ? 'Show' : 'Hide'}</span>
          </button>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Email', value: currentUser.email || '', icon: Mail, sensitive: true },
            { label: 'Username', value: `@${currentUser.username}`, icon: AtSign, sensitive: false },
            { label: 'User ID', value: currentUser.id, icon: User, sensitive: true },
            { label: 'Member Since', value: memberSince, icon: Calendar, sensitive: false },
            { label: 'Account Type', value: currentUser.role === 'admin' ? 'Admin' : 'Standard', icon: Sparkles, sensitive: false },
          ].map((item) => (
            <button key={item.label} onClick={() => copyToClipboard(item.value, item.label)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group" style={{ background: 'var(--background-secondary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--card)' }}>
                  <item.icon size={16} style={{ color: formData.accentColor }} />
                </div>
                <div className="text-left">
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{item.label}</p>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)', filter: item.sensitive && isInfoBlurred ? 'blur(5px)' : 'none' }}>{item.value}</p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {copiedField === item.label ? <Check size={16} className="text-green-500" /> : <Copy size={16} style={{ color: 'var(--foreground-muted)' }} />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

interface NotificationToggleProps {
  icon: React.ElementType
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
  accentColor: string
  isPending: boolean
}

function NotificationToggle({ icon: Icon, title, description, enabled, onToggle, accentColor, isPending }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}20` }}>
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        <div>
          <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{title}</p>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={isPending}
        className="relative w-12 h-7 rounded-full transition-all duration-300"
        style={{ background: enabled ? accentColor : 'var(--border)' }}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ left: enabled ? '1.5rem' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}
