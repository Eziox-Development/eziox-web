import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import {
  Eye,
  EyeOff,
  Activity,
  BarChart3,
  Download,
  Loader2,
  Shield,
  Globe,
  Clock,
  FileText,
  Trash2,
  ExternalLink,
  Check,
  Search,
} from 'lucide-react'
import {
  getPrivacySettingsFn,
  updatePrivacySettingsFn,
  exportUserDataFn,
} from '@/server/functions/auth'
import type { ProfileUser } from '../types'

interface PrivacyTabProps {
  currentUser: ProfileUser
}

type PrivacySection = 'visibility' | 'data' | 'gdpr'

export function PrivacyTab({ currentUser }: PrivacyTabProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] =
    useState<PrivacySection>('visibility')
  const [isExporting, setIsExporting] = useState(false)

  // Server functions
  const getPrivacySettings = useServerFn(getPrivacySettingsFn)
  const updatePrivacySettings = useServerFn(updatePrivacySettingsFn)
  const exportUserData = useServerFn(exportUserDataFn)

  // Queries
  const { data: privacyData } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: () => getPrivacySettings(),
  })

  // Mutations
  const privacyMutation = useMutation({
    mutationFn: (settings: Record<string, boolean>) =>
      updatePrivacySettings({ data: settings }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['privacy-settings'] })
    },
  })

  // Export data handler
  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const data = await exportUserData()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `eziox-data-export-${currentUser.username}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Toggle component
  const Toggle = ({
    enabled,
    onChange,
    color = 'primary',
  }: {
    enabled: boolean
    onChange: () => void
    color?: 'primary' | 'green' | 'orange'
  }) => {
    const colorClasses = {
      primary: 'bg-linear-to-r from-primary to-accent shadow-primary/25',
      green: 'bg-linear-to-r from-green-500 to-emerald-500 shadow-green-500/25',
      orange:
        'bg-linear-to-r from-orange-500 to-amber-500 shadow-orange-500/25',
    }

    return (
      <button
        onClick={onChange}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-out ${
          enabled
            ? `${colorClasses[color]} shadow-lg`
            : 'bg-background-secondary border border-border/50'
        }`}
      >
        <div
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ease-out ${
            enabled ? 'translate-x-7 scale-95' : 'translate-x-0.5 scale-100'
          }`}
        >
          <div
            className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
              enabled
                ? 'bg-linear-to-br from-white to-gray-100'
                : 'bg-linear-to-br from-gray-100 to-gray-200'
            }`}
          />
        </div>
        {enabled && (
          <div
            className={`absolute inset-0 rounded-full ${colorClasses[color].replace('shadow-lg', '')} opacity-20 animate-pulse`}
          />
        )}
      </button>
    )
  }

  const sections: {
    id: PrivacySection
    icon: React.ReactNode
    label: string
  }[] = [
    {
      id: 'visibility',
      icon: <Eye size={18} />,
      label: t('dashboard.privacy.profileVisibility'),
    },
    {
      id: 'data',
      icon: <BarChart3 size={18} />,
      label: t('dashboard.privacy.dataCollection'),
    },
    {
      id: 'gdpr',
      icon: <Shield size={18} />,
      label: t('dashboard.privacy.gdprTitle'),
    },
  ]

  return (
    <motion.div
      key="privacy"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {t('dashboard.privacy.title')}
        </h2>
        <p className="text-sm text-foreground-muted">
          {t('dashboard.privacy.subtitle')}
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 p-1 rounded-xl bg-background-secondary/50 border border-border/50">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
            }`}
          >
            {section.icon}
            <span className="hidden sm:inline">{section.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Visibility Section */}
        {activeSection === 'visibility' && (
          <motion.div
            key="visibility"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Profile Visibility */}
            <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    privacyData?.settings?.isPublic !== false
                      ? 'bg-green-500/20'
                      : 'bg-orange-500/20'
                  }`}
                >
                  {privacyData?.settings?.isPublic !== false ? (
                    <Eye size={24} className="text-green-400" />
                  ) : (
                    <EyeOff size={24} className="text-orange-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {t('dashboard.privacy.profileVisibility')}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.privacy.profileVisibilityDesc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => privacyMutation.mutate({ isPublic: true })}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    privacyData?.settings?.isPublic !== false
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-border/50 bg-background-secondary/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Globe
                      size={20}
                      className={
                        privacyData?.settings?.isPublic !== false
                          ? 'text-green-400'
                          : 'text-foreground-muted'
                      }
                    />
                    <span
                      className={`font-medium ${privacyData?.settings?.isPublic !== false ? 'text-green-400' : 'text-foreground'}`}
                    >
                      {t('dashboard.privacy.public')}
                    </span>
                    {privacyData?.settings?.isPublic !== false && (
                      <Check size={16} className="text-green-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted text-left">
                    {t('dashboard.privacy.publicDesc')}
                  </p>
                </button>

                <button
                  onClick={() => privacyMutation.mutate({ isPublic: false })}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    privacyData?.settings?.isPublic === false
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-border/50 bg-background-secondary/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <EyeOff
                      size={20}
                      className={
                        privacyData?.settings?.isPublic === false
                          ? 'text-orange-400'
                          : 'text-foreground-muted'
                      }
                    />
                    <span
                      className={`font-medium ${privacyData?.settings?.isPublic === false ? 'text-orange-400' : 'text-foreground'}`}
                    >
                      {t('dashboard.privacy.private')}
                    </span>
                    {privacyData?.settings?.isPublic === false && (
                      <Check size={16} className="text-orange-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted text-left">
                    {t('dashboard.privacy.privateDesc')}
                  </p>
                </button>
              </div>
            </div>

            {/* Activity Settings */}
            <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5 space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                {t('dashboard.privacy.showActivity')}
              </h3>

              {/* Show Activity Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50 hover:bg-background-secondary/70 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      privacyData?.settings?.showActivity !== false
                        ? 'bg-primary/20'
                        : 'bg-background-secondary'
                    }`}
                  >
                    <Activity
                      size={20}
                      className={
                        privacyData?.settings?.showActivity !== false
                          ? 'text-primary'
                          : 'text-foreground-muted'
                      }
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {t('dashboard.privacy.showActivity')}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {t('dashboard.privacy.showActivityDesc')}
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={privacyData?.settings?.showActivity !== false}
                  onChange={() =>
                    privacyMutation.mutate({
                      showActivity: !(
                        privacyData?.settings?.showActivity !== false
                      ),
                    })
                  }
                />
              </div>

              {/* Search Engine Indexing */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50 hover:bg-background-secondary/70 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      privacyData?.settings?.isPublic !== false
                        ? 'bg-blue-500/20'
                        : 'bg-background-secondary'
                    }`}
                  >
                    <Search
                      size={20}
                      className={
                        privacyData?.settings?.isPublic !== false
                          ? 'text-blue-400'
                          : 'text-foreground-muted'
                      }
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {t('dashboard.privacy.searchEngines')}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {privacyData?.settings?.isPublic !== false
                        ? t('dashboard.privacy.searchEnginesEnabled')
                        : t('dashboard.privacy.searchEnginesDisabled')}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    privacyData?.settings?.isPublic !== false
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-background-secondary text-foreground-muted'
                  }`}
                >
                  {privacyData?.settings?.isPublic !== false
                    ? t('dashboard.privacy.analyticsEnabled')
                    : t('dashboard.privacy.analyticsDisabled')}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data & Analytics Section */}
        {activeSection === 'data' && (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Analytics Tracking */}
            <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/20">
                  <BarChart3 size={24} className="text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {t('dashboard.privacy.analyticsTracking')}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.privacy.analyticsDesc')}
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium">
                  {t('dashboard.privacy.analyticsEnabled')}
                </div>
              </div>
              <p className="text-xs text-foreground-muted bg-background-secondary/50 p-3 rounded-lg">
                {t('dashboard.privacy.analyticsNote')}
              </p>
            </div>

            {/* Data Export */}
            <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/20">
                  <Download size={24} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {t('dashboard.privacy.dataExport')}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.privacy.dataExportDesc')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('dashboard.privacy.dataExporting')}
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    {t('dashboard.privacy.dataExportButton')}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* GDPR Section */}
        {activeSection === 'gdpr' && (
          <motion.div
            key="gdpr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* GDPR Info */}
            <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/20">
                  <Shield size={24} className="text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {t('dashboard.privacy.gdprTitle')}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {t('dashboard.privacy.gdprDesc')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Right to Access */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-green-400" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {t('dashboard.privacy.rightToAccess')}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {t('dashboard.privacy.rightToAccessDesc')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {isExporting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    {t('dashboard.privacy.export')}
                  </button>
                </div>

                {/* Right to Erasure */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50">
                  <div className="flex items-center gap-3">
                    <Trash2 size={20} className="text-red-400" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {t('dashboard.privacy.rightToErasure')}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {t('dashboard.privacy.rightToErasureDesc')}
                      </p>
                    </div>
                  </div>
                  <a
                    href="/profile?tab=settings"
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    {t('dashboard.privacy.settings')}
                  </a>
                </div>

                {/* Right to Portability */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50">
                  <div className="flex items-center gap-3">
                    <Download size={20} className="text-blue-400" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {t('dashboard.privacy.rightToPortability')}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {t('dashboard.privacy.rightToPortabilityDesc')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {isExporting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    {t('dashboard.privacy.export')}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="rounded-lg overflow-hidden bg-card/50 border border-border p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock size={18} className="text-foreground-muted" />
                {t('dashboard.privacy.accountInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background-secondary/50">
                  <p className="text-xs text-foreground-muted mb-1">
                    {t('dashboard.privacy.accountUsername')}
                  </p>
                  <p className="font-medium text-foreground">
                    @{currentUser.username}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background-secondary/50">
                  <p className="text-xs text-foreground-muted mb-1">
                    {t('dashboard.privacy.accountCreated')}
                  </p>
                  <p className="font-medium text-foreground">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background-secondary/50">
                  <p className="text-xs text-foreground-muted mb-1">
                    {t('dashboard.privacy.accountEmail')}
                  </p>
                  <p className="font-medium text-foreground truncate">
                    {currentUser.email}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background-secondary/50">
                  <p className="text-xs text-foreground-muted mb-1">
                    {t('dashboard.privacy.accountTier')}
                  </p>
                  <p className="font-medium text-foreground capitalize">
                    {currentUser.tier}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
