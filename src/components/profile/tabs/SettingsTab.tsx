import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Palette, Shield, Eye, EyeOff, Mail, AtSign, User, Calendar, Sparkles, Check, Copy, Music, Bell, UserPlus, Trophy, Megaphone, Smartphone, Loader2, KeyRound, X, Trash2, AlertTriangle, Download } from 'lucide-react'
import { ACCENT_COLORS, type ProfileFormData } from '@/routes/_protected/profile'
import { SpotifyConnect } from '@/components/spotify'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getNotificationSettingsFn, updateNotificationSettingsFn } from '@/server/functions/notifications'
import { setupTwoFactorFn, enableTwoFactorFn, disableTwoFactorFn, getTwoFactorStatusFn, deleteAccountFn, exportUserDataFn, regenerateRecoveryCodesFn } from '@/server/functions/auth'

interface SettingsTabProps {
  formData: ProfileFormData
  updateField: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void
  currentUser: { id: string; email: string | null; username: string; role: string | null; createdAt: string }
  copyToClipboard: (text: string, field: string) => void
  copiedField: string | null
}

export function SettingsTab({ formData, updateField, currentUser, copyToClipboard, copiedField }: SettingsTabProps) {
  const [isInfoBlurred, setIsInfoBlurred] = useState(true)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [regenerateCode, setRegenerateCode] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const getSettings = useServerFn(getNotificationSettingsFn)
  const updateSettings = useServerFn(updateNotificationSettingsFn)
  const setup2FA = useServerFn(setupTwoFactorFn)
  const enable2FA = useServerFn(enableTwoFactorFn)
  const disable2FA = useServerFn(disableTwoFactorFn)
  const get2FAStatus = useServerFn(getTwoFactorStatusFn)
  const deleteAccount = useServerFn(deleteAccountFn)
  const exportData = useServerFn(exportUserDataFn)
  const regenerateCodes = useServerFn(regenerateRecoveryCodesFn)

  const { data: notificationSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: () => getSettings(),
  })

  const { data: twoFactorStatus, isLoading: twoFactorLoading } = useQuery({
    queryKey: ['twoFactorStatus'],
    queryFn: () => get2FAStatus(),
  })

  const { data: twoFactorSetup, isLoading: setupLoading } = useQuery({
    queryKey: ['twoFactorSetup'],
    queryFn: () => setup2FA(),
    enabled: show2FASetup && !twoFactorStatus?.enabled,
  })

  const enable2FAMutation = useMutation({
    mutationFn: (token: string) => enable2FA({ data: { token } }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] })
      setShow2FASetup(false)
      setTwoFactorCode('')
      setTwoFactorError('')
      // Show recovery codes after enabling 2FA
      if (data.recoveryCodes) {
        setRecoveryCodes(data.recoveryCodes)
        setShowRecoveryCodes(true)
      }
    },
    onError: (error: { message?: string }) => {
      setTwoFactorError(error.message || 'Invalid code')
    },
  })

  const regenerateCodesMutation = useMutation({
    mutationFn: (token: string) => regenerateCodes({ data: { token } }),
    onSuccess: (data) => {
      if (data.recoveryCodes) {
        setRecoveryCodes(data.recoveryCodes)
        setShowRecoveryCodes(true)
      }
      setRegenerateCode('')
      void queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] })
    },
    onError: (error: { message?: string }) => {
      setTwoFactorError(error.message || 'Invalid code')
    },
  })

  const disable2FAMutation = useMutation({
    mutationFn: (token: string) => disable2FA({ data: { token } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] })
      setTwoFactorCode('')
      setTwoFactorError('')
    },
    onError: (error: { message?: string }) => {
      setTwoFactorError(error.message || 'Invalid code')
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => deleteAccount({ data: { password } }),
    onSuccess: async () => {
      await navigate({ to: '/' })
    },
    onError: (error: { message?: string }) => {
      setDeleteError(error.message || 'Failed to delete account')
    },
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
      {/* Recovery Codes Modal */}
      <AnimatePresence>
        {showRecoveryCodes && recoveryCodes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowRecoveryCodes(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6 space-y-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound size={20} style={{ color: formData.accentColor }} />
                  <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Recovery Codes</h3>
                </div>
                <button onClick={() => setShowRecoveryCodes(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X size={18} style={{ color: 'var(--foreground-muted)' }} />
                </button>
              </div>
              
              <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p className="text-xs" style={{ color: '#ef4444' }}>
                  <strong>Important:</strong> Save these codes in a secure place. Each code can only be used once. You won't be able to see them again!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(code, `Recovery Code ${i + 1}`)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg font-mono text-sm"
                    style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    {code}
                    {copiedField === `Recovery Code ${i + 1}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} style={{ color: 'var(--foreground-muted)' }} />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'All Recovery Codes')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium"
                style={{ background: formData.accentColor, color: 'white' }}
              >
                {copiedField === 'All Recovery Codes' ? <Check size={16} /> : <Copy size={16} />}
                {copiedField === 'All Recovery Codes' ? 'Copied!' : 'Copy All Codes'}
              </button>

              <p className="text-xs text-center" style={{ color: 'var(--foreground-muted)' }}>
                Store these codes securely. They are your backup if you lose access to your authenticator app.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Smartphone size={20} style={{ color: formData.accentColor }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Two-Factor Authentication</h2>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Add an extra layer of security to your account</p>
        </div>
        <div className="p-5">
          {twoFactorLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: formData.accentColor }} />
            </div>
          ) : twoFactorStatus?.enabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <Check className="w-5 h-5" style={{ color: '#22c55e' }} />
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>2FA is enabled</p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Your account is protected with authenticator app</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>Recovery codes</p>
                  <p className="text-sm font-bold" style={{ color: twoFactorStatus.recoveryCodesCount > 3 ? '#22c55e' : twoFactorStatus.recoveryCodesCount > 0 ? '#f59e0b' : '#ef4444' }}>
                    {twoFactorStatus.recoveryCodesCount} remaining
                  </p>
                </div>
              </div>

              {/* Recovery Codes Section */}
              <div className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Recovery Codes</p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Use these if you lose access to your authenticator</p>
                  </div>
                  <KeyRound size={18} style={{ color: formData.accentColor }} />
                </div>
                {twoFactorStatus.recoveryCodesCount < 3 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                    <p className="text-xs" style={{ color: '#ef4444' }}>Low recovery codes! Consider regenerating new ones.</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Enter 2FA code to regenerate recovery codes:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={regenerateCode}
                      onChange={(e) => { setRegenerateCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setTwoFactorError('') }}
                      placeholder="000000"
                      className="flex-1 px-4 py-2 rounded-xl text-center font-mono tracking-widest"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      maxLength={6}
                    />
                    <button
                      onClick={() => regenerateCode.length === 6 && regenerateCodesMutation.mutate(regenerateCode)}
                      disabled={regenerateCode.length !== 6 || regenerateCodesMutation.isPending}
                      className="px-4 py-2 rounded-xl font-medium text-white disabled:opacity-50"
                      style={{ background: formData.accentColor }}
                    >
                      {regenerateCodesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Regenerate'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Disable 2FA</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => { setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setTwoFactorError('') }}
                    placeholder="Enter 6-digit code"
                    className="flex-1 px-4 py-3 rounded-xl text-center font-mono text-lg tracking-widest"
                    style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    maxLength={6}
                  />
                  <button
                    onClick={() => twoFactorCode.length === 6 && disable2FAMutation.mutate(twoFactorCode)}
                    disabled={twoFactorCode.length !== 6 || disable2FAMutation.isPending}
                    className="px-4 py-3 rounded-xl font-medium text-white disabled:opacity-50"
                    style={{ background: '#ef4444' }}
                  >
                    {disable2FAMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Disable'}
                  </button>
                </div>
                {twoFactorError && <p className="text-xs text-red-400">{twoFactorError}</p>}
              </div>
            </div>
          ) : show2FASetup ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium" style={{ color: 'var(--foreground)' }}>Setup Authenticator</p>
                <button onClick={() => { setShow2FASetup(false); setTwoFactorCode(''); setTwoFactorError('') }} className="p-2 rounded-lg hover:bg-white/10">
                  <X size={18} style={{ color: 'var(--foreground-muted)' }} />
                </button>
              </div>
              {setupLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: formData.accentColor }} />
                </div>
              ) : twoFactorSetup ? (
                <>
                  <div className="text-center space-y-3">
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Scan this QR code with your authenticator app</p>
                    <div className="inline-block p-4 rounded-xl bg-white">
                      <img src={twoFactorSetup.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Or enter this code manually:</p>
                      <button
                        onClick={() => copyToClipboard(twoFactorSetup.secret, '2FA Secret')}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm"
                        style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
                      >
                        {twoFactorSetup.secret}
                        {copiedField === '2FA Secret' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Enter verification code</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => { setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setTwoFactorError('') }}
                        placeholder="000000"
                        className="flex-1 px-4 py-3 rounded-xl text-center font-mono text-lg tracking-widest"
                        style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        maxLength={6}
                      />
                      <button
                        onClick={() => twoFactorCode.length === 6 && enable2FAMutation.mutate(twoFactorCode)}
                        disabled={twoFactorCode.length !== 6 || enable2FAMutation.isPending}
                        className="px-4 py-3 rounded-xl font-medium text-white disabled:opacity-50"
                        style={{ background: formData.accentColor }}
                      >
                        {enable2FAMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                    {twoFactorError && <p className="text-xs text-red-400">{twoFactorError}</p>}
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${formData.accentColor}20` }}>
                  <KeyRound size={20} style={{ color: formData.accentColor }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>Authenticator App</p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Use Google Authenticator or similar</p>
                </div>
              </div>
              <button
                onClick={() => setShow2FASetup(true)}
                className="px-4 py-2 rounded-xl font-medium text-white text-sm"
                style={{ background: formData.accentColor }}
              >
                Setup
              </button>
            </div>
          )}
        </div>
      </div>

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

      {/* Privacy & Data */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <Download size={20} style={{ color: formData.accentColor }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Privacy & Data</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>Export Your Data</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Download all your personal data (GDPR)</p>
            </div>
            <button
              onClick={async () => {
                try {
                  const data = await exportData()
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `eziox-data-export-${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                } catch (error) {
                  console.error('Export failed:', error)
                }
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: formData.accentColor, color: 'white' }}
            >
              <Download size={16} className="inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <AlertTriangle size={20} className="text-red-500" />
          <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>Delete Account</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} className="inline mr-2" />
              Delete
            </button>
          </div>

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl space-y-4"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-red-500">This action cannot be undone</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                      All your data including profile, links, analytics, and connected services will be permanently deleted.
                    </p>
                  </div>
                </div>

                {deleteError && (
                  <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded">{deleteError}</p>
                )}

                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value)
                      setDeleteError('')
                    }}
                    placeholder="Your password"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeletePassword('')
                      setDeleteError('')
                    }}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteAccountMutation.mutate(deletePassword)}
                    disabled={!deletePassword || deleteAccountMutation.isPending}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleteAccountMutation.isPending ? (
                      <Loader2 size={16} className="inline animate-spin" />
                    ) : (
                      'Delete Forever'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
