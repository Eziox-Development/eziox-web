import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import {
  requestEmailChangeFn, deleteAccountFn, exportUserDataFn, resendVerificationEmailFn,
  setupTwoFactorFn, enableTwoFactorFn, disableTwoFactorFn, getTwoFactorStatusFn,
  regenerateRecoveryCodesFn, getUserSessionsFn, deleteSessionFn, deleteAllOtherSessionsFn,
  getNotificationSettingsFn, updateNotificationSettingsFn,
} from '@/server/functions/auth'
import {
  Mail, Lock, Shield, Trash2, AlertTriangle, Loader2, Check, Monitor, Smartphone,
  Bell, Download, LogOut, CheckCircle, XCircle, Key, Copy,
} from 'lucide-react'
import type { ProfileUser } from '../types'

interface SettingsTabProps { currentUser: ProfileUser }
type SettingsSection = 'account' | 'security' | 'notifications' | 'danger'

const inputCls = 'w-full px-4 py-3 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 theme-animation'

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

  const { data: twoFactorStatus } = useQuery({ queryKey: ['2fa-status'], queryFn: () => get2FAStatus() })
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({ queryKey: ['user-sessions'], queryFn: () => getUserSessions() })
  const { data: notificationData } = useQuery({ queryKey: ['notification-settings'], queryFn: () => getNotificationSettings() })

  const emailMutation = useMutation({
    mutationFn: () => requestEmailChange({ data: { newEmail, password: currentPassword } }),
    onSuccess: () => { setShowEmailChange(false); setNewEmail(''); setCurrentPassword('') },
  })
  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount({ data: { password: currentPassword } }),
    onSuccess: () => { window.location.href = '/' },
  })
  const resendVerificationMutation = useMutation({ mutationFn: () => resendVerification() })
  const exportDataMutation = useMutation({
    mutationFn: () => exportUserData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob); const a = document.createElement('a')
      a.href = url; a.download = `eziox-data-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url)
    },
  })
  const setup2FAMutation = useMutation({
    mutationFn: () => setup2FA(),
    onSuccess: (data) => { setQrCodeUrl(data.qrCodeUrl); setShow2FASetup(true) },
  })
  const enable2FAMutation = useMutation({
    mutationFn: () => enable2FA({ data: { token: twoFactorCode } }),
    onSuccess: (data) => {
      if (data.recoveryCodes) { setRecoveryCodes(data.recoveryCodes); setShowRecoveryCodes(true) }
      setShow2FASetup(false); setTwoFactorCode(''); setQrCodeUrl(null)
      void queryClient.invalidateQueries({ queryKey: ['2fa-status'] })
    },
  })
  const disable2FAMutation = useMutation({
    mutationFn: () => disable2FA({ data: { token: twoFactorCode } }),
    onSuccess: () => { setShow2FADisable(false); setTwoFactorCode(''); void queryClient.invalidateQueries({ queryKey: ['2fa-status'] }) },
  })
  void regenerateCodes
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteSession({ data: { sessionId } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['user-sessions'] }) },
  })
  const deleteAllSessionsMutation = useMutation({
    mutationFn: () => deleteAllOtherSessions(),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['user-sessions'] }) },
  })
  const notificationMutation = useMutation({
    mutationFn: (settings: Record<string, boolean>) => updateNotificationSettings({ data: settings }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['notification-settings'] }) },
  })

  const copyCode = async (code: string) => { await navigator.clipboard.writeText(code); setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000) }
  const downloadRecoveryCodes = () => {
    const content = `Eziox Recovery Codes\n${'='.repeat(30)}\n\nSave these codes in a safe place.\nEach code can only be used once.\n\n${recoveryCodes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`
    const blob = new Blob([content], { type: 'text/plain' }); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'eziox-recovery-codes.txt'; a.click(); URL.revokeObjectURL(url)
  }
  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return <Monitor size={20} />
    const l = ua.toLowerCase()
    return (l.includes('mobile') || l.includes('android') || l.includes('iphone')) ? <Smartphone size={20} /> : <Monitor size={20} />
  }
  const formatUserAgent = (ua: string | null) => {
    if (!ua) return 'Unknown device'; const l = ua.toLowerCase()
    let browser = 'Unknown'; let os = 'Unknown'
    if (l.includes('chrome')) browser = 'Chrome'; else if (l.includes('firefox')) browser = 'Firefox'; else if (l.includes('safari')) browser = 'Safari'; else if (l.includes('edge')) browser = 'Edge'
    if (l.includes('windows')) os = 'Windows'; else if (l.includes('mac')) os = 'macOS'; else if (l.includes('linux')) os = 'Linux'; else if (l.includes('android')) os = 'Android'; else if (l.includes('iphone') || l.includes('ipad')) os = 'iOS'
    return `${browser} on ${os}`
  }

  const sections: { id: SettingsSection; icon: React.ReactNode; label: string }[] = [
    { id: 'account', icon: <Mail size={18} />, label: t('dashboard.settings.account') },
    { id: 'security', icon: <Shield size={18} />, label: t('dashboard.settings.security') },
    { id: 'notifications', icon: <Bell size={18} />, label: t('dashboard.settings.notifications') },
    { id: 'danger', icon: <AlertTriangle size={18} />, label: t('dashboard.settings.dangerZone') },
  ]

  return (
    <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div><h2 className="text-xl font-bold text-foreground">{t('dashboard.settings.title')}</h2><p className="text-sm text-foreground-muted">{t('dashboard.settings.subtitle')}</p></div>

      {/* Section Nav */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <motion.button key={s.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium theme-animation ${
              activeSection === s.id ? (s.id === 'danger' ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary') : 'bg-card/30 backdrop-blur-sm border border-border/15 text-foreground-muted hover:bg-card/50'
            }`}>
            {s.icon}{s.label}
          </motion.button>
        ))}
      </div>

      {/* Account */}
      {activeSection === 'account' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Email */}
          <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/15"><Mail size={24} className="text-blue-400" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{t('dashboard.settings.email')}</p>
                    {currentUser.emailVerified ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full"><CheckCircle size={12} />{t('dashboard.settings.emailVerified')}</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full"><XCircle size={12} />{t('dashboard.settings.emailNotVerified')}</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground-muted">{currentUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!currentUser.emailVerified && (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => resendVerificationMutation.mutate()} disabled={resendVerificationMutation.isPending}
                    className="px-3 py-2 rounded-xl text-sm bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 theme-animation">
                    {resendVerificationMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : t('dashboard.settings.resendVerification')}
                  </motion.button>
                )}
                <button onClick={() => setShowEmailChange(!showEmailChange)} className="px-4 py-2 rounded-xl bg-card/40 backdrop-blur-sm border border-border/15 text-foreground-muted hover:bg-card/60 theme-animation">{t('dashboard.settings.changeEmail')}</button>
              </div>
            </div>
            <AnimatePresence>
              {showEmailChange && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border/15 space-y-3">
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t('dashboard.settings.newEmail')} className={inputCls} />
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t('dashboard.settings.currentPassword')} className={inputCls} />
                  {emailMutation.isSuccess && <p className="text-sm text-emerald-400">{t('dashboard.settings.emailChangeSuccess')}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setShowEmailChange(false)} className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-card/40 border border-border/15 hover:bg-card/60 theme-animation">{t('dashboard.cancel')}</button>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => emailMutation.mutate()} disabled={!newEmail || !currentPassword || emailMutation.isPending}
                      className="flex-1 py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2 glow-primary">
                      {emailMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}{t('dashboard.save')}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Password */}
          <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/15"><Lock size={24} className="text-primary" /></div>
                <div><p className="font-medium text-foreground">{t('dashboard.settings.password')}</p><p className="text-sm text-foreground-muted">••••••••••••</p></div>
              </div>
              <a href="/forgot-password" className="px-4 py-2 rounded-xl bg-card/40 backdrop-blur-sm border border-border/15 text-foreground-muted hover:bg-card/60 theme-animation">{t('dashboard.settings.resetPassword')}</a>
            </div>
          </div>
          {/* Data Export */}
          <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/15"><Download size={24} className="text-purple-400" /></div>
                <div><p className="font-medium text-foreground">{t('dashboard.settings.dataExport')}</p><p className="text-sm text-foreground-muted">{t('dashboard.settings.dataExportDesc')}</p></div>
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => exportDataMutation.mutate()} disabled={exportDataMutation.isPending}
                className="px-4 py-2 rounded-xl bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 theme-animation flex items-center gap-2">
                {exportDataMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {exportDataMutation.isPending ? t('dashboard.settings.exportingData') : t('dashboard.settings.exportData')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security */}
      {activeSection === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* 2FA */}
          <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${twoFactorStatus?.enabled ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                  <Shield size={24} className={twoFactorStatus?.enabled ? 'text-emerald-400' : 'text-amber-400'} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('dashboard.settings.twoFactor')}</p>
                  <p className="text-sm text-foreground-muted">{t('dashboard.settings.twoFactorDesc')}</p>
                  <p className={`text-xs mt-1 ${twoFactorStatus?.enabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {twoFactorStatus?.enabled ? t('dashboard.settings.twoFactorEnabled') : t('dashboard.settings.twoFactorDisabled')}
                  </p>
                </div>
              </div>
              {twoFactorStatus?.enabled ? (
                <button onClick={() => setShow2FADisable(true)} className="px-4 py-2 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 theme-animation">{t('dashboard.settings.disable2FA')}</button>
              ) : (
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setup2FAMutation.mutate()} disabled={setup2FAMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 theme-animation flex items-center gap-2">
                  {setup2FAMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}{t('dashboard.settings.setup2FA')}
                </motion.button>
              )}
            </div>
            {/* 2FA Setup */}
            <AnimatePresence>
              {show2FASetup && qrCodeUrl && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border/15 space-y-4">
                  <p className="text-sm text-foreground-muted">{t('dashboard.settings.scan2FACode')}</p>
                  <div className="flex justify-center"><img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 rounded-lg bg-white p-2" /></div>
                  <p className="text-sm text-foreground-muted">{t('dashboard.settings.enter2FACode')}</p>
                  <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground text-center text-2xl tracking-widest font-mono placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 theme-animation" />
                  <div className="flex gap-2">
                    <button onClick={() => { setShow2FASetup(false); setQrCodeUrl(null); setTwoFactorCode('') }} className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-card/40 border border-border/15 hover:bg-card/60 theme-animation">{t('dashboard.cancel')}</button>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => enable2FAMutation.mutate()} disabled={twoFactorCode.length !== 6 || enable2FAMutation.isPending}
                      className="flex-1 py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2 glow-primary">
                      {enable2FAMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}{t('dashboard.settings.enable2FA')}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* 2FA Disable */}
            <AnimatePresence>
              {show2FADisable && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border/15 space-y-4">
                  <p className="text-sm text-foreground-muted">{t('dashboard.settings.enter2FACode')}</p>
                  <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground text-center text-2xl tracking-widest font-mono placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 theme-animation" />
                  <div className="flex gap-2">
                    <button onClick={() => { setShow2FADisable(false); setTwoFactorCode('') }} className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-card/40 border border-border/15 hover:bg-card/60 theme-animation">{t('dashboard.cancel')}</button>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => disable2FAMutation.mutate()} disabled={twoFactorCode.length !== 6 || disable2FAMutation.isPending}
                      className="flex-1 py-3 rounded-xl font-medium text-white bg-destructive disabled:opacity-50 flex items-center justify-center gap-2">
                      {disable2FAMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}{t('dashboard.settings.disable2FA')}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Recovery Codes */}
            <AnimatePresence>
              {showRecoveryCodes && recoveryCodes.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{t('dashboard.settings.recoveryCodes')}</p>
                    <button onClick={downloadRecoveryCodes} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-card/40 border border-border/15 text-foreground-muted hover:bg-card/60 theme-animation"><Download size={14} />{t('dashboard.settings.downloadCodes')}</button>
                  </div>
                  <p className="text-sm text-amber-400">{t('dashboard.settings.recoveryCodesDesc')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, i) => (
                      <button key={i} onClick={() => copyCode(code)} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background-secondary/20 backdrop-blur-sm border border-border/10 font-mono text-sm text-foreground hover:bg-background-secondary/40 theme-animation">
                        {code}{copiedCode === code ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-foreground-muted" />}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowRecoveryCodes(false)} className="w-full py-2 rounded-xl font-medium text-foreground-muted bg-card/40 border border-border/15 hover:bg-card/60 theme-animation">{t('dashboard.close')}</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Sessions */}
          <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/15"><Monitor size={24} className="text-cyan-400" /></div>
                <div><p className="font-medium text-foreground">{t('dashboard.settings.sessions')}</p><p className="text-sm text-foreground-muted">{t('dashboard.settings.sessionsDesc')}</p></div>
              </div>
              {sessionsData && sessionsData.sessions.filter((s) => !s.isCurrent).length > 0 && (
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => deleteAllSessionsMutation.mutate()} disabled={deleteAllSessionsMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 theme-animation flex items-center gap-2">
                  {deleteAllSessionsMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}{t('dashboard.settings.logoutAll')}
                </motion.button>
              )}
            </div>
            {sessionsLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : sessionsData?.sessions.length === 0 ? (
              <p className="text-sm text-foreground-muted text-center py-4">{t('dashboard.settings.noOtherSessions')}</p>
            ) : (
              <div className="space-y-2">
                {sessionsData?.sessions.map((session) => (
                  <motion.div key={session.id} whileHover={{ scale: 1.005 }}
                    className={`flex items-center justify-between p-3 rounded-xl theme-animation ${session.isCurrent ? 'bg-primary/8 border border-primary/20' : 'bg-background-secondary/15 backdrop-blur-sm border border-border/10'}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-foreground-muted">{getDeviceIcon(session.userAgent)}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatUserAgent(session.userAgent)}
                          {session.isCurrent && <span className="ml-2 text-xs text-primary">({t('dashboard.settings.currentSession')})</span>}
                        </p>
                        <p className="text-xs text-foreground-muted">{session.ipAddress} • {t('dashboard.settings.lastActive')}: {session.lastActivityAt ? new Date(session.lastActivityAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button onClick={() => deleteSessionMutation.mutate(session.id)} disabled={deleteSessionMutation.isPending} className="p-2 rounded-lg hover:bg-destructive/15 theme-animation">
                        <LogOut size={16} className="text-destructive" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Notifications */}
      {activeSection === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Bell size={18} className="text-primary" />{t('dashboard.settings.notifications')}</h3>
            <div className="space-y-3">
              {['emailNotifications', 'marketingEmails', 'securityAlerts', 'weeklyDigest'].map((key) => {
                const settings = (notificationData as { settings?: Record<string, boolean | null> } | undefined)?.settings
                const isOn = !!(settings as Record<string, boolean | null> | undefined)?.[key]
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-background-secondary/15 backdrop-blur-sm border border-border/10">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t(`dashboard.settings.${key}`)}</p>
                      <p className="text-xs text-foreground-muted">{t(`dashboard.settings.${key}Desc`)}</p>
                    </div>
                    <button
                      onClick={() => notificationMutation.mutate({ [key]: !isOn })}
                      className={`w-12 h-7 rounded-full theme-animation relative ${isOn ? 'bg-primary' : 'bg-foreground-muted/20'}`}>
                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow theme-animation ${isOn ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Danger Zone */}
      {activeSection === 'danger' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl backdrop-blur-xl bg-destructive/5 border border-destructive/20 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-destructive/15"><AlertTriangle size={24} className="text-destructive" /></div>
              <div>
                <h3 className="font-bold text-destructive">{t('dashboard.settings.dangerZone')}</h3>
                <p className="text-sm text-foreground-muted">{t('dashboard.settings.dangerZoneDesc')}</p>
              </div>
            </div>
            {!showDeleteConfirm ? (
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 rounded-xl font-medium text-destructive bg-destructive/10 border border-destructive/25 hover:bg-destructive/20 theme-animation flex items-center justify-center gap-2">
                <Trash2 size={18} />{t('dashboard.settings.deleteAccount')}
              </motion.button>
            ) : (
              <div className="space-y-3 pt-4 border-t border-destructive/15">
                <p className="text-sm text-destructive">{t('dashboard.settings.deleteAccountWarning')}</p>
                <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder={t('dashboard.settings.typeDeleteConfirm')}
                  className="w-full px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/25 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-destructive/50 theme-animation" />
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t('dashboard.settings.currentPassword')} className={inputCls} />
                <div className="flex gap-2">
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setCurrentPassword('') }}
                    className="flex-1 py-3 rounded-xl font-medium text-foreground-muted bg-card/40 border border-border/15 hover:bg-card/60 theme-animation">{t('dashboard.cancel')}</button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => deleteMutation.mutate()}
                    disabled={deleteConfirmText !== 'DELETE' || !currentPassword || deleteMutation.isPending}
                    className="flex-1 py-3 rounded-xl font-medium text-white bg-destructive disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}{t('dashboard.settings.deleteAccount')}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
