import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useNavigate } from '@tanstack/react-router'
import { useTheme } from '@/components/layout/ThemeProvider'
import { updateProfileFn } from '@/server/functions/auth'
import { getMyLinksFn } from '@/server/functions/links'
import { getReferralStatsFn } from '@/server/functions/referrals'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { ProfileSidebar } from './ProfileSidebar'
import { ProfileHeader } from './ProfileHeader'
import { ProfileStats } from './ProfileStats'
import { ProfileTab } from './tabs/ProfileTab'
import { LinksTab } from './tabs/LinksTab'
import { ReferralsTab } from './tabs/ReferralsTab'
import { SettingsTab } from './tabs/SettingsTab'
import { PrivacyTab } from './tabs/PrivacyTab'
import { BadgesTab } from './tabs/BadgesTab'
import { SubscriptionTab } from './tabs/SubscriptionTab'
import { CustomizationTab } from './tabs/CustomizationTab'
import { CreatorTab } from './tabs/CreatorTab'
import { ApiAccessTab } from './tabs/ApiAccessTab'
import { siteConfig } from '@/lib/site-config'
import type { TabType, ProfileFormData, ProfileUser } from './types'

interface ProfileDashboardProps {
  currentUser: ProfileUser
  initialTab?: TabType
}

export function ProfileDashboard({
  currentUser,
  initialTab,
}: ProfileDashboardProps) {
  useTheme()
  const navigate = useNavigate()
  const updateProfile = useServerFn(updateProfileFn)
  const getMyLinks = useServerFn(getMyLinksFn)
  const getReferralStats = useServerFn(getReferralStatsFn)

  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedBioUrl, setCopiedBioUrl] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [customPronouns, setCustomPronouns] = useState('')

  const [avatar, setAvatar] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    username: '',
    bio: '',
    website: '',
    location: '',
    pronouns: '',
    birthday: '',
    creatorTypes: [],
    isPublic: true,
    showActivity: true,
    socials: {},
  })

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const handleTabChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab)
      void navigate({ to: '/profile', search: { tab } })
    },
    [navigate],
  )

  const isOwner =
    currentUser.email === siteConfig.owner.email ||
    currentUser.email === import.meta.env.OWNER_EMAIL

  const { data: links = [] } = useQuery({
    queryKey: ['my-links'],
    queryFn: () => getMyLinks(),
  })

  const { data: referralStats } = useQuery({
    queryKey: ['referralStats'],
    queryFn: () => getReferralStats(),
  })

  useEffect(() => {
    if (currentUser) {
      const p = currentUser.profile
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        bio: p?.bio || '',
        website: p?.website || '',
        location: p?.location || '',
        pronouns: p?.pronouns || '',
        birthday: p?.birthday ? (String(p.birthday).split('T')[0] ?? '') : '',
        creatorTypes: (p?.creatorTypes as string[]) || [],
        isPublic: p?.isPublic ?? true,
        showActivity: p?.showActivity ?? true,
        socials: (p?.socials as Record<string, string>) || {},
      })
      setAvatar(p?.avatar || null)
      setBanner(p?.banner || null)
    }
  }, [currentUser])

  const copyBioUrl = useCallback(async () => {
    const url = `https://eziox.link/${currentUser.username}`
    await navigator.clipboard.writeText(url)
    setCopiedBioUrl(true)
    setTimeout(() => setCopiedBioUrl(false), 2000)
  }, [currentUser.username])

  const updateField = useCallback(
    <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
      setHasChanges(true)
    },
    [],
  )

  const updateSocial = useCallback((key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [key]: value },
    }))
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const pronounsToSave =
        formData.pronouns === 'custom' ? customPronouns : formData.pronouns
      await updateProfile({
        data: {
          name: formData.name || undefined,
          username: formData.username || undefined,
          bio: formData.bio || undefined,
          website: formData.website || undefined,
          location: formData.location || undefined,
          pronouns: pronounsToSave || undefined,
          birthday: formData.birthday || undefined,
          creatorTypes:
            formData.creatorTypes.length > 0
              ? formData.creatorTypes
              : undefined,
          isPublic: formData.isPublic,
          showActivity: formData.showActivity,
          socials:
            Object.keys(formData.socials).length > 0
              ? formData.socials
              : undefined,
        },
      })
      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError(
        (error as { message?: string }).message || 'Failed to update',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setHasChanges(false)
    window.location.reload()
  }

  const stats = currentUser.stats || {
    profileViews: 0,
    totalLinkClicks: 0,
    followers: 0,
    following: 0,
  }
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
  const referralCount = referralStats?.referralCount || 0
  const userBadges = (currentUser.profile?.badges || []) as string[]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'var(--primary-15, rgba(99, 102, 241, 0.15))' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <AnimatePresence mode="wait">
        {saveSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 bg-green-500"
          >
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Saved!</span>
          </motion.div>
        )}
        {saveError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 bg-red-500"
          >
            <AlertCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProfileSidebar
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            badges={{
              links: links.length,
              referrals: referralCount,
              badges: userBadges.length,
            }}
            onCopyBioUrl={copyBioUrl}
            copied={copiedBioUrl}
          />

          <div className="flex-1 min-w-0">
            <ProfileHeader
              currentUser={currentUser}
              avatar={avatar}
              banner={banner}
              onAvatarChange={setAvatar}
              onBannerChange={setBanner}
              hasChanges={hasChanges}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={handleCancel}
            />

            <ProfileStats
              profileViews={stats.profileViews}
              linkClicks={totalClicks}
              followers={stats.followers}
              referrals={referralCount}
            />

            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <ProfileTab
                  key="profile"
                  formData={formData}
                  updateField={updateField}
                  updateSocial={updateSocial}
                  customPronouns={customPronouns}
                  setCustomPronouns={setCustomPronouns}
                />
              )}
              {activeTab === 'links' && <LinksTab key="links" />}
              {activeTab === 'referrals' && <ReferralsTab key="referrals" />}
              {activeTab === 'badges' && (
                <BadgesTab
                  key="badges"
                  badges={userBadges}
                  referralCount={referralCount}
                  isEarlyAdopter={userBadges.includes('early_adopter')}
                />
              )}
              {activeTab === 'subscription' && (
                <SubscriptionTab key="subscription" />
              )}
              {activeTab === 'customization' && (
                <CustomizationTab key="customization" />
              )}
              {activeTab === 'creator' && <CreatorTab key="creator" />}
              {activeTab === 'api' && <ApiAccessTab key="api" />}
              {activeTab === 'settings' && (
                <SettingsTab
                  key="settings"
                  currentUser={currentUser}
                  copyToClipboard={async (text: string) => {
                    await navigator.clipboard.writeText(text)
                  }}
                  copiedField={null}
                />
              )}
              {activeTab === 'privacy' && (
                <PrivacyTab
                  key="privacy"
                  formData={formData}
                  updateField={updateField}
                  isOwner={isOwner}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileDashboardLoader() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2
        className="w-10 h-10 animate-spin"
        style={{ color: theme.colors.primary }}
      />
    </div>
  )
}
