import { useState } from 'react'
import { motion } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { updateProfileFn, exportUserDataFn } from '@/server/functions/auth'
import {
  Eye, EyeOff, Shield, Download, Loader2, Globe, Users,
} from 'lucide-react'
import type { ProfileUser } from '../types'

interface PrivacyTabProps { currentUser: ProfileUser }

export function PrivacyTab({ currentUser }: PrivacyTabProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const updateProfile = useServerFn(updateProfileFn)
  const exportUserData = useServerFn(exportUserDataFn)

  const [settings, setSettings] = useState({
    isPublic: currentUser.profile?.isPublic ?? true,
    showActivity: currentUser.profile?.showActivity ?? true,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, boolean>) => updateProfile({ data }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['current-user'] }) },
  })

  const exportMutation = useMutation({
    mutationFn: () => exportUserData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob); const a = document.createElement('a')
      a.href = url; a.download = `eziox-data-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url)
    },
  })

  const toggleSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    updateMutation.mutate({ [key]: value })
  }

  const privacyToggles = [
    { key: 'isPublic', icon: Globe, label: t('dashboard.privacy.publicProfile'), desc: t('dashboard.privacy.publicProfileDesc'), color: 'primary' },
    { key: 'showActivity', icon: Users, label: t('dashboard.privacy.showActivity'), desc: t('dashboard.privacy.showActivityDesc'), color: 'cyan' },
  ]

  return (
    <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-6">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-linear-to-br from-primary/20 to-accent/10">
            <Shield size={28} className="text-primary" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('dashboard.privacy.title')}</h2>
            <p className="text-sm text-foreground-muted">{t('dashboard.privacy.subtitle')}</p>
          </div>
        </div>
      </motion.div>

      {/* Privacy Toggles */}
      <div className="space-y-3">
        {privacyToggles.map((toggle, i) => {
          const Icon = toggle.icon
          const isEnabled = (settings as Record<string, boolean>)[toggle.key]
          return (
            <motion.div
              key={toggle.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.005 }}
              className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5 theme-animation"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    toggle.color === 'primary' ? 'bg-primary/15' : toggle.color === 'cyan' ? 'bg-cyan-500/15' : toggle.color === 'emerald' ? 'bg-emerald-500/15' : toggle.color === 'amber' ? 'bg-amber-500/15' : 'bg-purple-500/15'
                  }`}>
                    <Icon size={22} className={
                      toggle.color === 'primary' ? 'text-primary' : toggle.color === 'cyan' ? 'text-cyan-400' : toggle.color === 'emerald' ? 'text-emerald-400' : toggle.color === 'amber' ? 'text-amber-400' : 'text-purple-400'
                    } />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{toggle.label}</p>
                    <p className="text-sm text-foreground-muted">{toggle.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-foreground-muted">{isEnabled ? <Eye size={14} className="inline" /> : <EyeOff size={14} className="inline" />}</span>
                  <button
                    onClick={() => toggleSetting(toggle.key, !isEnabled)}
                    disabled={updateMutation.isPending}
                    className={`w-12 h-7 rounded-full theme-animation relative shrink-0 ${isEnabled ? 'bg-primary' : 'bg-foreground-muted/20'}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow theme-animation ${isEnabled ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Data Export */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/15">
              <Download size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t('dashboard.privacy.exportData')}</p>
              <p className="text-sm text-foreground-muted">{t('dashboard.privacy.exportDataDesc')}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}
            className="px-4 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 theme-animation flex items-center gap-2 font-medium">
            {exportMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exportMutation.isPending ? t('dashboard.privacy.exporting') : t('dashboard.privacy.export')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
