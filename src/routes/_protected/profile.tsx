'use client'

import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import {
  User, Mail, MapPin, Globe, Calendar, Hash, Shield, Eye, EyeOff,
  Copy, Check, Edit3, Save, X, Sparkles, Crown, Link2, Users,
  Settings, Lock, ExternalLink, Plus, Trash2, GripVertical,
  Gift, Share2, TrendingUp, Award
} from 'lucide-react'
import {
  FaTwitter, FaInstagram, FaYoutube, FaTwitch, FaGithub, FaTiktok, FaDiscord
} from 'react-icons/fa'
import { useAuth } from '@/hooks/use-auth'
import { updateProfileFn } from '@/server/functions/auth'
import { getMyLinksFn, createLinkFn, updateLinkFn, deleteLinkFn } from '@/server/functions/links'
import { getReferralCodeFn, getReferralStatsFn } from '@/server/functions/referrals'
import { siteConfig } from '@/lib/site-config'

export const Route = createFileRoute('/_protected/profile')({
  component: ProfilePage,
})

type TabType = 'profile' | 'links' | 'referrals' | 'settings' | 'privacy'

interface LinkItem {
  id: string
  title: string
  url: string
  isActive: boolean
  order: number
  clicks: number
}

interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  pendingReferrals: number
  earnings: number
}

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'referrals', label: 'Referrals', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'privacy', label: 'Privacy', icon: Lock },
]

function ProfilePage() {
  const { currentUser } = useAuth()
  const updateProfile = useServerFn(updateProfileFn)
  const getMyLinks = useServerFn(getMyLinksFn)
  const createLink = useServerFn(createLinkFn)
  const updateLink = useServerFn(updateLinkFn)
  const deleteLink = useServerFn(deleteLinkFn)
  const getReferralCode = useServerFn(getReferralCodeFn)
  const getReferralStats = useServerFn(getReferralStatsFn)

  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isInfoBlurred, setIsInfoBlurred] = useState(true)

  // Links state
  const [links, setLinks] = useState<LinkItem[]>([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [isAddingLink, setIsAddingLink] = useState(false)

  // Referrals state
  const [referralCode, setReferralCode] = useState<string>('')
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    location: '',
    pronouns: '',
    birthday: '',
    accentColor: '#8B5CF6',
    creatorType: '',
    socials: {} as Record<string, string>,
    isPublic: true,
    showActivity: true,
  })

  const isOwner = currentUser?.email === (siteConfig.owner?.email || process.env.OWNER_EMAIL)

  useEffect(() => {
    if (currentUser) {
      const birthdayStr = currentUser.profile?.birthday
        ? (new Date(currentUser.profile.birthday).toISOString().split('T')[0] ?? '')
        : ''
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        bio: currentUser.profile?.bio || '',
        website: currentUser.profile?.website || '',
        location: currentUser.profile?.location || '',
        pronouns: currentUser.profile?.pronouns || '',
        birthday: birthdayStr,
        accentColor: currentUser.profile?.accentColor || '#8B5CF6',
        creatorType: currentUser.profile?.creatorType || '',
        socials: (currentUser.profile?.socials as Record<string, string>) || {},
        isPublic: currentUser.profile?.isPublic ?? true,
        showActivity: currentUser.profile?.showActivity ?? true,
      })
    }
  }, [currentUser])

  // Load links when tab changes
  useEffect(() => {
    if (activeTab === 'links') {
      void loadLinks()
    }
  }, [activeTab])

  // Load referrals when tab changes
  useEffect(() => {
    if (activeTab === 'referrals') {
      void loadReferrals()
    }
  }, [activeTab])

  const loadLinks = async () => {
    setIsLoadingLinks(true)
    try {
      const result = await getMyLinks({ data: undefined })
      if (Array.isArray(result)) {
        setLinks(result.map(l => ({
          id: l.id,
          title: l.title,
          url: l.url,
          isActive: l.isActive ?? true,
          order: l.order ?? 0,
          clicks: l.clicks ?? 0,
        })))
      }
    } catch (error) {
      console.error('Failed to load links:', error)
    } finally {
      setIsLoadingLinks(false)
    }
  }

  const loadReferrals = async () => {
    setIsLoadingReferrals(true)
    try {
      const [codeResult, statsResult] = await Promise.all([
        getReferralCode({ data: undefined }),
        getReferralStats({ data: undefined })
      ])
      if (codeResult?.code) {
        setReferralCode(codeResult.code)
      }
      if (statsResult) {
        setReferralStats({
          totalReferrals: statsResult.referralCount,
          activeReferrals: statsResult.referredUsers.length,
          pendingReferrals: 0,
          earnings: 0,
        })
      }
    } catch (error) {
      console.error('Failed to load referrals:', error)
    } finally {
      setIsLoadingReferrals(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateProfile({
        data: {
          name: formData.name,
          username: formData.username,
          bio: formData.bio || undefined,
          website: formData.website || undefined,
          location: formData.location || undefined,
          pronouns: formData.pronouns || undefined,
          birthday: formData.birthday || undefined,
          accentColor: formData.accentColor || undefined,
          creatorType: formData.creatorType || undefined,
          socials: formData.socials,
          isPublic: formData.isPublic,
          showActivity: formData.showActivity,
        },
      })
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (currentUser) {
      const birthdayStr = currentUser.profile?.birthday
        ? (new Date(currentUser.profile.birthday).toISOString().split('T')[0] ?? '')
        : ''
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        bio: currentUser.profile?.bio || '',
        website: currentUser.profile?.website || '',
        location: currentUser.profile?.location || '',
        pronouns: currentUser.profile?.pronouns || '',
        birthday: birthdayStr,
        accentColor: currentUser.profile?.accentColor || '#8B5CF6',
        creatorType: currentUser.profile?.creatorType || '',
        socials: (currentUser.profile?.socials as Record<string, string>) || {},
        isPublic: currentUser.profile?.isPublic ?? true,
        showActivity: currentUser.profile?.showActivity ?? true,
      })
    }
    setIsEditing(false)
  }

  const copyToClipboard = (text: string, field: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) return
    try {
      await createLink({
        data: { title: newLink.title, url: newLink.url }
      })
      await loadLinks()
      setNewLink({ title: '', url: '' })
      setIsAddingLink(false)
    } catch (error) {
      console.error('Failed to create link:', error)
    }
  }

  const handleUpdateLink = async (link: LinkItem) => {
    try {
      await updateLink({
        data: { id: link.id, title: link.title, url: link.url, isActive: link.isActive }
      })
      await loadLinks()
      setEditingLink(null)
    } catch (error) {
      console.error('Failed to update link:', error)
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteLink({ data: { id } })
      await loadLinks()
    } catch (error) {
      console.error('Failed to delete link:', error)
    }
  }

  const handleToggleLinkActive = async (link: LinkItem) => {
    try {
      await updateLink({
        data: { id: link.id, isActive: !link.isActive }
      })
      await loadLinks()
    } catch (error) {
      console.error('Failed to toggle link:', error)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  const referralLink = referralCode ? `${window.location.origin}/join?ref=${referralCode}` : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: formData.accentColor }}
            >
              {currentUser.name?.charAt(0) || currentUser.username?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {currentUser.name || currentUser.username}
                {isOwner && <Crown className="w-6 h-6 text-yellow-400" />}
              </h1>
              <p className="text-gray-400">@{currentUser.username}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toast notifications */}
        <AnimatePresence mode="wait">
          {saveSuccess && (
            <motion.div
              key="success-toast"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-50"
            >
              <Check className="w-4 h-4" /> Saved successfully
            </motion.div>
          )}
          {saveError && (
            <motion.div
              key="error-toast"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-50"
            >
              <X className="w-4 h-4" /> {saveError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && (
              <ProfileTab
                formData={formData}
                setFormData={setFormData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                isSaving={isSaving}
                handleSave={handleSave}
                handleCancel={handleCancel}
                currentUser={currentUser}
                isOwner={isOwner}
                copiedField={copiedField}
                copyToClipboard={copyToClipboard}
                isInfoBlurred={isInfoBlurred}
                setIsInfoBlurred={setIsInfoBlurred}
              />
            )}

            {activeTab === 'links' && (
              <LinksTab
                links={links}
                isLoading={isLoadingLinks}
                isAddingLink={isAddingLink}
                setIsAddingLink={setIsAddingLink}
                newLink={newLink}
                setNewLink={setNewLink}
                handleAddLink={handleAddLink}
                editingLink={editingLink}
                setEditingLink={setEditingLink}
                handleUpdateLink={handleUpdateLink}
                handleDeleteLink={handleDeleteLink}
                handleToggleLinkActive={handleToggleLinkActive}
                username={currentUser.username}
              />
            )}

            {activeTab === 'referrals' && (
              <ReferralsTab
                referralCode={referralCode}
                referralLink={referralLink}
                referralStats={referralStats}
                isLoading={isLoadingReferrals}
                copiedField={copiedField}
                copyToClipboard={copyToClipboard}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                formData={formData}
                setFormData={setFormData}
                handleSave={handleSave}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyTab
                formData={formData}
                setFormData={setFormData}
                handleSave={handleSave}
                isSaving={isSaving}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Profile Tab Component
interface ProfileTabProps {
  formData: {
    name: string
    username: string
    bio: string
    website: string
    location: string
    pronouns: string
    birthday: string
    accentColor: string
    creatorType: string
    socials: Record<string, string>
    isPublic: boolean
    showActivity: boolean
  }
  setFormData: React.Dispatch<React.SetStateAction<ProfileTabProps['formData']>>
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  isSaving: boolean
  handleSave: () => Promise<void>
  handleCancel: () => void
  currentUser: NonNullable<ReturnType<typeof useAuth>['currentUser']>
  isOwner: boolean
  copiedField: string | null
  copyToClipboard: (text: string, field: string) => void
  isInfoBlurred: boolean
  setIsInfoBlurred: (v: boolean) => void
}

function ProfileTab({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  isSaving,
  handleSave,
  handleCancel,
  currentUser,
  isOwner,
  copiedField,
  copyToClipboard,
  isInfoBlurred,
  setIsInfoBlurred,
}: ProfileTabProps) {
  const SOCIAL_PLATFORMS = [
    { key: 'twitter', label: 'Twitter', icon: FaTwitter, color: '#1DA1F2' },
    { key: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E4405F' },
    { key: 'youtube', label: 'YouTube', icon: FaYoutube, color: '#FF0000' },
    { key: 'twitch', label: 'Twitch', icon: FaTwitch, color: '#9146FF' },
    { key: 'github', label: 'GitHub', icon: FaGithub, color: '#333' },
    { key: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#000' },
    { key: 'discord', label: 'Discord', icon: FaDiscord, color: '#5865F2' },
  ]

  return (
    <div className="space-y-6">
      {/* Edit Controls */}
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* Basic Info Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" /> Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            ) : (
              <p className="text-white">{formData.name || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            ) : (
              <p className="text-white">@{formData.username || '-'}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            ) : (
              <p className="text-white">{formData.bio || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            ) : (
              <p className="text-white">{formData.location || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
              <Globe className="w-4 h-4" /> Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            ) : (
              <p className="text-white">{formData.website || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Pronouns</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.pronouns}
                onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            ) : (
              <p className="text-white">{formData.pronouns || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Birthday
            </label>
            {isEditing ? (
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            ) : (
              <p className="text-white">{formData.birthday || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Creator Type
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.creatorType}
                onChange={(e) => setFormData({ ...formData, creatorType: e.target.value })}
                placeholder="e.g. Developer, Artist, Streamer"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            ) : (
              <p className="text-white">{formData.creatorType || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Accent Color</label>
            {isEditing ? (
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-full h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border border-white/20"
                  style={{ backgroundColor: formData.accentColor }}
                />
                <span className="text-white">{formData.accentColor}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Links Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-purple-400" /> Social Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key}>
              <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                <platform.icon style={{ color: platform.color }} /> {platform.label}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.socials[platform.key] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socials: { ...formData.socials, [platform.key]: e.target.value },
                    })
                  }
                  placeholder={`Your ${platform.label} username or URL`}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                />
              ) : (
                <p className="text-white">{formData.socials[platform.key] || '-'}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" /> Account Information
          </h2>
          <button
            onClick={() => setIsInfoBlurred(!isInfoBlurred)}
            className="text-gray-400 hover:text-white"
          >
            {isInfoBlurred ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-white ${isInfoBlurred ? 'blur-sm select-none' : ''}`}>
                {currentUser.email}
              </span>
              <button
                onClick={() => copyToClipboard(currentUser.email, 'email')}
                className="text-gray-400 hover:text-white"
              >
                {copiedField === 'email' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-2">
              <Hash className="w-4 h-4" /> User ID
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-white font-mono text-sm ${isInfoBlurred ? 'blur-sm select-none' : ''}`}>
                {currentUser.id}
              </span>
              <button
                onClick={() => copyToClipboard(currentUser.id, 'id')}
                className="text-gray-400 hover:text-white"
              >
                {copiedField === 'id' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Card */}
      {isOwner && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" /> Owner Privileges
          </h2>
          <p className="text-gray-300">You have full administrative access to this platform.</p>
        </div>
      )}
    </div>
  )
}

// Links Tab Component
interface LinksTabProps {
  links: LinkItem[]
  isLoading: boolean
  isAddingLink: boolean
  setIsAddingLink: (v: boolean) => void
  newLink: { title: string; url: string }
  setNewLink: (v: { title: string; url: string }) => void
  handleAddLink: () => Promise<void>
  editingLink: LinkItem | null
  setEditingLink: (v: LinkItem | null) => void
  handleUpdateLink: (link: LinkItem) => Promise<void>
  handleDeleteLink: (id: string) => Promise<void>
  handleToggleLinkActive: (link: LinkItem) => Promise<void>
  username: string | null
}

function LinksTab({
  links,
  isLoading,
  isAddingLink,
  setIsAddingLink,
  newLink,
  setNewLink,
  handleAddLink,
  editingLink,
  setEditingLink,
  handleUpdateLink,
  handleDeleteLink,
  handleToggleLinkActive,
  username,
}: LinksTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Preview Link */}
      {username && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Your public link page:</span>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              eziox.de/{username} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Add Link Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddingLink(true)}
          className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      {/* Add Link Form */}
      {isAddingLink && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Add New Link</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="My Website"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">URL</label>
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsAddingLink(false)
                  setNewLink({ title: '', url: '' })
                }}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                disabled={!newLink.title || !newLink.url}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
            <Link2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No links yet. Add your first link!</p>
          </div>
        ) : (
          links.map((link) => (
            <motion.div
              key={link.id}
              layout
              className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 flex items-center gap-4"
            >
              <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
              
              {editingLink?.id === link.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editingLink.title}
                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                    className="w-full px-3 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"
                  />
                  <input
                    type="url"
                    value={editingLink.url}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                    className="w-full px-3 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingLink(null)}
                      className="px-3 py-1 text-sm rounded bg-white/5 text-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateLink(editingLink)}
                      className="px-3 py-1 text-sm rounded bg-purple-500 text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-white font-medium">{link.title}</p>
                    <p className="text-gray-400 text-sm truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    {link.clicks} clicks
                  </div>
                  <button
                    onClick={() => handleToggleLinkActive(link)}
                    className={`p-2 rounded-lg ${link.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                  >
                    {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setEditingLink(link)}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// Referrals Tab Component
interface ReferralsTabProps {
  referralCode: string
  referralLink: string
  referralStats: ReferralStats | null
  isLoading: boolean
  copiedField: string | null
  copyToClipboard: (text: string, field: string) => void
}

function ReferralsTab({
  referralCode,
  referralLink,
  referralStats,
  isLoading,
  copiedField,
  copyToClipboard,
}: ReferralsTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-400" /> Your Referral Code
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/10 rounded-lg px-4 py-3 font-mono text-xl text-white">
            {referralCode || 'Loading...'}
          </div>
          <button
            onClick={() => copyToClipboard(referralCode, 'referralCode')}
            className="px-4 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
          >
            {copiedField === 'referralCode' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-purple-400" /> Share Your Link
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/5 rounded-lg px-4 py-3 text-gray-300 truncate">
            {referralLink || 'Loading...'}
          </div>
          <button
            onClick={() => copyToClipboard(referralLink, 'referralLink')}
            className="px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            {copiedField === 'referralLink' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {referralStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Users className="w-4 h-4" /> Total
            </div>
            <p className="text-2xl font-bold text-white">{referralStats.totalReferrals}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4" /> Active
            </div>
            <p className="text-2xl font-bold text-green-400">{referralStats.activeReferrals}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Award className="w-4 h-4" /> Pending
            </div>
            <p className="text-2xl font-bold text-yellow-400">{referralStats.pendingReferrals}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Gift className="w-4 h-4" /> Earnings
            </div>
            <p className="text-2xl font-bold text-purple-400">${referralStats.earnings}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Settings Tab Component
interface SettingsTabProps {
  formData: ProfileTabProps['formData']
  setFormData: React.Dispatch<React.SetStateAction<ProfileTabProps['formData']>>
  handleSave: () => Promise<void>
  isSaving: boolean
}

function SettingsTab({ formData, setFormData, handleSave, isSaving }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" /> Display Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Show Activity Status</p>
              <p className="text-gray-400 text-sm">Let others see when you're online</p>
            </div>
            <button
              onClick={() => {
                setFormData({ ...formData, showActivity: !formData.showActivity })
                void handleSave()
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.showActivity ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  formData.showActivity ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Accent Color</h2>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={formData.accentColor}
            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
            className="w-12 h-12 rounded-lg cursor-pointer border-0"
          />
          <span className="text-white">{formData.accentColor}</span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ml-auto px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Privacy Tab Component
interface PrivacyTabProps {
  formData: ProfileTabProps['formData']
  setFormData: React.Dispatch<React.SetStateAction<ProfileTabProps['formData']>>
  handleSave: () => Promise<void>
  isSaving: boolean
}

function PrivacyTab({ formData, setFormData, handleSave }: PrivacyTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-400" /> Profile Visibility
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Public Profile</p>
              <p className="text-gray-400 text-sm">Allow anyone to view your profile</p>
            </div>
            <button
              onClick={() => {
                setFormData({ ...formData, isPublic: !formData.isPublic })
                void handleSave()
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.isPublic ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  formData.isPublic ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" /> Data & Privacy
        </h2>
        <div className="space-y-4">
          <p className="text-gray-400">
            Your data is stored securely and is never shared with third parties without your consent.
          </p>
          <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
            Request Data Export
          </button>
        </div>
      </div>
    </div>
  )
}
