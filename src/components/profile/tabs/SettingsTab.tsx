import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import {
  requestEmailChangeFn,
  deleteAccountFn,
  exportUserDataFn,
  resendVerificationEmailFn,
  setupTwoFactorFn,
  enableTwoFactorFn,
  disableTwoFactorFn,
  getTwoFactorStatusFn,
  regenerateRecoveryCodesFn,
  getUserSessionsFn,
  deleteSessionFn,
  deleteAllOtherSessionsFn,
  getNotificationSettingsFn,
  updateNotificationSettingsFn,
} from '@/server/functions/auth'
import {
  Mail,
  Lock,
  Shield,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  Monitor,
  Smartphone,
  Bell,
  Download,
  LogOut,
  CheckCircle,
  XCircle,
  Key,
  Copy,
} from 'lucide-react'
import type { ProfileUser } from '../types'

interface SettingsTabProps {
  currentUser: ProfileUser
}

type SettingsSection = 'account' | 'security' | 'notifications' | 'danger'

export function SettingsTab({ currentUser }: SettingsTabProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [show2FADisable, setShow2FADisable] = useState(false)
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Server functions
  const requestEmailChange = useServerFn(requestEmailChangeFn)
  const deleteAccount = useServerFn(deleteAccountFn)
  const exportUserData = useServerFn(exportUserDataFn)
  const resendVerification = useServerFn(resendVerificationEmailFn)
  const setup2FA = useServerFn(setupTwoFactorFn)
  const enable2FA = useServerFn(enableTwoFactorFn)
  const disable2FA = useServerFn(disableTwoFactorFn)
  const get2FAStatus = useServerFn(getTwoFactorStatusFn)
  const regenerateCodes = useServerFn(regenerateRecoveryCodesFn)
  const getUserSessions = useServerFn(getUserSessionsFn)
  const deleteSession = useServerFn(deleteSessionFn)
  const deleteAllOtherSessions = useServerFn(deleteAllOtherSessionsFn)
  const getNotificationSettings = useServerFn(getNotificationSettingsFn)
  const updateNotificationSettings = useServerFn(updateNotificationSettingsFn)

  // Queries
  const { data: twoFactorStatus } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: () => get2FAStatus(),
  })

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => getUserSessions(),
  })

  const { data: notificationData } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => getNotificationSettings(),
  })

  // Mutations
  const emailMutation = useMutation({
    mutationFn: () =>
      requestEmailChange({ data: { newEmail, password: currentPassword } }),
    onSuccess: () => {
      setShowEmailChange(false)
      setNewEmail('')
      setCurrentPassword('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount({ data: { password: currentPassword } }),
    onSuccess: () => {
      window.location.href = '/'
    },
  })

  const resendVerificationMutation = useMutation({
    mutationFn: () => resendVerification(),
  })

  const exportDataMutation = useMutation({
    mutationFn: () => exportUserData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `eziox-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
  })

  const setup2FAMutation = useMutation({
    mutationFn: () => setup2FA(),
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl)
      setShow2FASetup(true)
    },
  })

  const enable2FAMutation = useMutation({
    mutationFn: () => enable2FA({ data: { token: twoFactorCode } }),
    onSuccess: (data) => {
      if (data.recoveryCodes) {
        setRecoveryCodes(data.recoveryCodes)
        setShowRecoveryCodes(true)
      }
      setShow2FASetup(false)
      setTwoFactorCode('')
      setQrCodeUrl(null)
      void queryClient.invalidateQueries({ queryKey: ['2fa-status'] })
    },
  })

  const disable2FAMutation = useMutation({
    mutationFn: () => disable2FA({ data: { token: twoFactorCode } }),
    onSuccess: () => {
      setShow2FADisable(false)
      setTwoFactorCode('')
      void queryClient.invalidateQueries({ queryKey: ['2fa-status'] })
    },
  })

  // regenerateCodesMutation available for future use if needed
  void regenerateCodes

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteSession({ data: { sessionId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
  })

  const deleteAllSessionsMutation = useMutation({
    mutationFn: () => deleteAllOtherSessions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
  })

  const notificationMutation = useMutation({
    mutationFn: (settings: Record<string, boolean>) =>
      updateNotificationSettings({ data: settings }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['notification-settings'],
      })
    },
  })

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const downloadRecoveryCodes = () => {
    const content = `Eziox Recovery Codes\n${'='.repeat(30)}\n\nSave these codes in a safe place.\nEach code can only be used once.\n\n${recoveryCodes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'eziox-recovery-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor size={20} />
    const ua = userAgent.toLowerCase()
    if (
      ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone')
    ) {
      return <Smartphone size={20} />
    }
    return <Monitor size={20} />
  }

  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown device'
    const ua = userAgent.toLowerCase()
    let browser = 'Unknown'
    let os = 'Unknown'

    if (ua.includes('chrome')) browser = 'Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari')) browser = 'Safari'
    else if (ua.includes('edge')) browser = 'Edge'

    if (ua.includes('windows')) os = 'Windows'
    else if (ua.includes('mac')) os = 'macOS'
    else if (ua.includes('linux')) os = 'Linux'
    else if (ua.includes('android')) os = 'Android'
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

    return `${browser} on ${os}`
  }

  const sections: {
    id: SettingsSection
    icon: React.ReactNode
    label: string
  }[] = [
    {
      id: 'account',
      icon: <Mail size={18} />,
      label: t('dashboard.settings.account'),
    },
    {
      id: 'security',
      icon: <Shield size={18} />,
      label: t('dashboard.settings.security'),
    },
    {
      id: 'notifications',
      icon: <Bell size={18} />,
      label: t('dashboard.settings.notifications'),
    },
    {
      id: 'danger',
      icon: <AlertTriangle size={18} />,
      label: t('dashboard.settings.dangerZone'),
    },
  ]

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {t('dashboard.settings.title')}
        </h2>
        <p className="text-sm text-foreground-muted">
          {t('dashboard.settings.subtitle')}
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-(--animation-speed) ${
              activeSection === section.id
                ? section.id === 'danger'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-primary/20 text-primary'
                : 'bg-background-secondary/50 text-foreground-muted hover:bg-background-secondary'
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Account Section */}
      {activeSection === 'account' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Email */}
          <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/20">
                  <Mail size={24} className="text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {t('dashboard.settings.email')}
                    </p>
                    {currentUser.emailVerified ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle size={12} />
                        {t('dashboard.settings.emailVerified')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                        <XCircle size={12} />
                        {t('dashboard.settings.emailNotVerified')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground-muted">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!currentUser.emailVerified && (
                  <button
                    onClick={() => resendVerificationMutation.mutate()}
                    disabled={resendVerificationMutation.isPending}
                    className="px-3 py-2 rounded-xl text-sm bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors duration-(--animation-speed)"
                  >
                    {resendVerificationMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      t('dashboard.settings.resendVerification')
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowEmailChange(!showEmailChange)}
                  className="px-4 py-2 rounded-xl bg-background-secondary text-foreground-muted hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
                >
                  {t('dashboard.settings.changeEmail')}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showEmailChange && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border space-y-3"
                >
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={t('dashboard.settings.newEmail')}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                  />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('dashboard.settings.currentPassword')}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                  />
                  {emailMutation.isSuccess && (
                    <p className="text-sm text-green-400">
                      {t('dashboard.settings.emailChangeSuccess')}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEmailChange(false)}
                      className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-background-secondary hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
                    >
                      {t('dashboard.cancel')}
                    </button>
                    <button
                      onClick={() => emailMutation.mutate()}
                      disabled={
                        !newEmail || !currentPassword || emailMutation.isPending
                      }
                      className="flex-1 py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {emailMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}
                      {t('dashboard.save')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20">
                  <Lock size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {t('dashboard.settings.password')}
                  </p>
                  <p className="text-sm text-foreground-muted">••••••••••••</p>
                </div>
              </div>
              <a
                href="/forgot-password"
                className="px-4 py-2 rounded-xl bg-background-secondary text-foreground-muted hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
              >
                {t('dashboard.settings.resetPassword')}
              </a>
            </div>
          </div>

          {/* Data Export */}
          <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/20">
                  <Download size={24} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {t('dashboard.settings.dataExport')}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.settings.dataExportDesc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => exportDataMutation.mutate()}
                disabled={exportDataMutation.isPending}
                className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors duration-(--animation-speed) flex items-center gap-2"
              >
                {exportDataMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {exportDataMutation.isPending
                  ? t('dashboard.settings.exportingData')
                  : t('dashboard.settings.exportData')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* 2FA */}
          <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${twoFactorStatus?.enabled ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}
                >
                  <Shield
                    size={24}
                    className={
                      twoFactorStatus?.enabled
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {t('dashboard.settings.twoFactor')}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.settings.twoFactorDesc')}
                  </p>
                  <p
                    className={`text-xs mt-1 ${twoFactorStatus?.enabled ? 'text-green-400' : 'text-yellow-400'}`}
                  >
                    {twoFactorStatus?.enabled
                      ? t('dashboard.settings.twoFactorEnabled')
                      : t('dashboard.settings.twoFactorDisabled')}
                  </p>
                </div>
              </div>
              {twoFactorStatus?.enabled ? (
                <button
                  onClick={() => setShow2FADisable(true)}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-(--animation-speed)"
                >
                  {t('dashboard.settings.disable2FA')}
                </button>
              ) : (
                <button
                  onClick={() => setup2FAMutation.mutate()}
                  disabled={setup2FAMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors duration-(--animation-speed) flex items-center gap-2"
                >
                  {setup2FAMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Key size={16} />
                  )}
                  {t('dashboard.settings.setup2FA')}
                </button>
              )}
            </div>

            {/* 2FA Setup Modal */}
            <AnimatePresence>
              {show2FASetup && qrCodeUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border space-y-4"
                >
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.settings.scan2FACode')}
                  </p>
                  <div className="flex justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="2FA QR Code"
                      className="w-48 h-48 rounded-lg bg-white p-2"
                    />
                  </div>
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.settings.enter2FACode')}
                  </p>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) =>
                      setTwoFactorCode(
                        e.target.value.replace(/\D/g, '').slice(0, 6),
                      )
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground text-center text-2xl tracking-widest font-mono placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShow2FASetup(false)
                        setQrCodeUrl(null)
                        setTwoFactorCode('')
                      }}
                      className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-background-secondary hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
                    >
                      {t('dashboard.cancel')}
                    </button>
                    <button
                      onClick={() => enable2FAMutation.mutate()}
                      disabled={
                        twoFactorCode.length !== 6 ||
                        enable2FAMutation.isPending
                      }
                      className="flex-1 py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {enable2FAMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}
                      {t('dashboard.settings.enable2FA')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2FA Disable Modal */}
            <AnimatePresence>
              {show2FADisable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border space-y-4"
                >
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.settings.enter2FACode')}
                  </p>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) =>
                      setTwoFactorCode(
                        e.target.value.replace(/\D/g, '').slice(0, 6),
                      )
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground text-center text-2xl tracking-widest font-mono placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShow2FADisable(false)
                        setTwoFactorCode('')
                      }}
                      className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-background-secondary hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
                    >
                      {t('dashboard.cancel')}
                    </button>
                    <button
                      onClick={() => disable2FAMutation.mutate()}
                      disabled={
                        twoFactorCode.length !== 6 ||
                        disable2FAMutation.isPending
                      }
                      className="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {disable2FAMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Shield size={18} />
                      )}
                      {t('dashboard.settings.disable2FA')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recovery Codes Display */}
            <AnimatePresence>
              {showRecoveryCodes && recoveryCodes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">
                      {t('dashboard.settings.recoveryCodes')}
                    </p>
                    <button
                      onClick={downloadRecoveryCodes}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-background-secondary text-foreground-muted hover:bg-background-secondary/80 transition-colors"
                    >
                      <Download size={14} />
                      {t('dashboard.settings.downloadCodes')}
                    </button>
                  </div>
                  <p className="text-sm text-yellow-400">
                    {t('dashboard.settings.recoveryCodesDesc')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, index) => (
                      <button
                        key={index}
                        onClick={() => copyCode(code)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-background-secondary/50 font-mono text-sm text-foreground hover:bg-background-secondary transition-colors"
                      >
                        {code}
                        {copiedCode === code ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} className="text-foreground-muted" />
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowRecoveryCodes(false)}
                    className="w-full py-2 rounded-xl font-medium text-foreground-muted bg-background-secondary hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
                  >
                    {t('dashboard.close')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Sessions */}
          <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/20">
                  <Monitor size={24} className="text-cyan-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {t('dashboard.settings.sessions')}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.settings.sessionsDesc')}
                  </p>
                </div>
              </div>
              {sessionsData &&
                sessionsData.sessions.filter((s) => !s.isCurrent).length >
                  0 && (
                  <button
                    onClick={() => deleteAllSessionsMutation.mutate()}
                    disabled={deleteAllSessionsMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-(--animation-speed) flex items-center gap-2"
                  >
                    {deleteAllSessionsMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <LogOut size={16} />
                    )}
                    {t('dashboard.settings.logoutAll')}
                  </button>
                )}
            </div>

            {sessionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : sessionsData?.sessions.length === 0 ? (
              <p className="text-sm text-foreground-muted text-center py-4">
                {t('dashboard.settings.noOtherSessions')}
              </p>
            ) : (
              <div className="space-y-2">
                {sessionsData?.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${session.isCurrent ? 'bg-primary/10 border border-primary/30' : 'bg-background-secondary/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-foreground-muted">
                        {getDeviceIcon(session.userAgent)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatUserAgent(session.userAgent)}
                          {session.isCurrent && (
                            <span className="ml-2 text-xs text-primary">
                              ({t('dashboard.settings.currentSession')})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {session.ipAddress} •{' '}
                          {t('dashboard.settings.lastActive')}:{' '}
                          {session.lastActivityAt
                            ? new Date(
                                session.lastActivityAt,
                              ).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => deleteSessionMutation.mutate(session.id)}
                        disabled={deleteSessionMutation.isPending}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <LogOut size={16} className="text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/20">
                <Bell size={24} className="text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {t('dashboard.settings.notifications')}
                </p>
                <p className="text-sm text-foreground-muted">
                  {t('dashboard.settings.notificationsDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'notifyNewFollower',
                  label: t('dashboard.settings.notifyNewFollower'),
                },
                {
                  key: 'notifyMilestones',
                  label: t('dashboard.settings.notifyMilestones'),
                },
                {
                  key: 'notifySystemUpdates',
                  label: t('dashboard.settings.notifySystemUpdates'),
                },
              ].map((item) => {
                const isEnabled =
                  notificationData?.settings?.[
                    item.key as keyof typeof notificationData.settings
                  ] ?? true
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-background-secondary/50 hover:bg-background-secondary/70 transition-all duration-(--animation-speed) group"
                  >
                    <span className="text-sm text-foreground">
                      {item.label}
                    </span>
                    <button
                      onClick={() =>
                        notificationMutation.mutate({ [item.key]: !isEnabled })
                      }
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-out ${
                        isEnabled
                          ? 'bg-linear-to-r from-primary to-accent shadow-lg shadow-primary/25'
                          : 'bg-background-secondary border border-border/50'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ease-out ${
                          isEnabled
                            ? 'translate-x-7 scale-95'
                            : 'translate-x-0.5 scale-100'
                        }`}
                      >
                        <div
                          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                            isEnabled
                              ? 'bg-linear-to-br from-white to-gray-100'
                              : 'bg-linear-to-br from-gray-100 to-gray-200'
                          }`}
                        />
                      </div>
                      {/* Glow effect when enabled */}
                      {isEnabled && (
                        <div className="absolute inset-0 rounded-full bg-linear-to-r from-primary/20 to-accent/20 animate-pulse" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="font-medium text-foreground mb-3">
                {t('dashboard.settings.emailNotifications')}
              </p>
              <div className="space-y-3">
                {[
                  {
                    key: 'emailLoginAlerts',
                    label: t('dashboard.settings.emailLoginAlerts'),
                  },
                  {
                    key: 'emailSecurityAlerts',
                    label: t('dashboard.settings.emailSecurityAlerts'),
                  },
                  {
                    key: 'emailWeeklyDigest',
                    label: t('dashboard.settings.emailWeeklyDigest'),
                  },
                  {
                    key: 'emailProductUpdates',
                    label: t('dashboard.settings.emailProductUpdates'),
                  },
                ].map((item) => {
                  const isEnabled =
                    notificationData?.settings?.[
                      item.key as keyof typeof notificationData.settings
                    ] ?? true
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-background-secondary/50 hover:bg-background-secondary/70 transition-all duration-(--animation-speed) group"
                    >
                      <span className="text-sm text-foreground">
                        {item.label}
                      </span>
                      <button
                        onClick={() =>
                          notificationMutation.mutate({
                            [item.key]: !isEnabled,
                          })
                        }
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-out ${
                          isEnabled
                            ? 'bg-linear-to-r from-primary to-accent shadow-lg shadow-primary/25'
                            : 'bg-background-secondary border border-border/50'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ease-out ${
                            isEnabled
                              ? 'translate-x-7 scale-95'
                              : 'translate-x-0.5 scale-100'
                          }`}
                        >
                          <div
                            className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                              isEnabled
                                ? 'bg-linear-to-br from-white to-gray-100'
                                : 'bg-linear-to-br from-gray-100 to-gray-200'
                            }`}
                          />
                        </div>
                        {/* Glow effect when enabled */}
                        {isEnabled && (
                          <div className="absolute inset-0 rounded-full bg-linear-to-r from-primary/20 to-accent/20 animate-pulse" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Danger Zone Section */}
      {activeSection === 'danger' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-lg overflow-hidden bg-red-500/5 border border-red-500/20 p-5">
            <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} />
              {t('dashboard.settings.dangerZone')}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {t('dashboard.settings.deleteAccount')}
                </p>
                <p className="text-sm text-foreground-muted">
                  {t('dashboard.settings.deleteWarning')}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-(--animation-speed) flex items-center gap-2"
              >
                <Trash2 size={16} />
                {t('dashboard.settings.deleteAccount')}
              </button>
            </div>

            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-red-500/20 space-y-3"
                >
                  <p className="text-sm text-red-400">
                    {t('dashboard.settings.deleteConfirmText')}
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-foreground placeholder-red-400/50 focus:outline-none focus:border-red-500/50 transition-colors duration-(--animation-speed)"
                  />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('dashboard.settings.yourPassword')}
                    className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-foreground placeholder-red-400/50 focus:outline-none focus:border-red-500/50 transition-colors duration-(--animation-speed)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                      className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-background-secondary hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
                    >
                      {t('dashboard.cancel')}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate()}
                      disabled={
                        deleteConfirmText !== 'DELETE' ||
                        !currentPassword ||
                        deleteMutation.isPending
                      }
                      className="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      {t('dashboard.settings.deleteAccount')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
