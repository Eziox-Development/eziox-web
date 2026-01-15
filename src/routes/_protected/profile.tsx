/**
 * Profile Dashboard - Unified Management Center
 * All profile, links, referrals, settings in one place
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { siteConfig } from '@/lib/site-config'
import { updateProfileFn } from '@/server/functions/auth'
import { getMyLinksFn } from '@/server/functions/links'
import { getReferralStatsFn } from '@/server/functions/referrals'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from '@tanstack/react-query'
// Note: queryClient removed - each tab handles its own mutations
import { ImageUpload } from '@/components/profile/image-upload'
import {
  Save, X, Loader2, CheckCircle, AlertCircle,
  Copy, Check, Crown, Globe, Sparkles, Link as LinkIcon, AtSign,
  ExternalLink, Eye, MousePointerClick, Users, Heart,
  Settings, Gift, TrendingUp, Shield, Lock,
  Twitter, Instagram, Youtube, Twitch, Github,
  Music2, MessageCircle, UserCircle, ChevronRight,
} from 'lucide-react'
import { ProfileTab } from '@/components/profile/tabs/ProfileTab'
import { LinksTab } from '@/components/profile/tabs/LinksTab'
import { ReferralsTab } from '@/components/profile/tabs/ReferralsTab'
import { SettingsTab } from '@/components/profile/tabs/SettingsTab'
import { PrivacyTab } from '@/components/profile/tabs/PrivacyTab'

export const Route = createFileRoute('/_protected/profile')({
  head: () => ({
    meta: [
      { title: 'Dashboard | Eziox' },
      { name: 'description', content: 'Manage your Eziox profile, links, and settings' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ProfilePage,
})

export type TabType = 'profile' | 'links' | 'referrals' | 'settings' | 'privacy'

export const SOCIAL_PLATFORMS = [
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: '@username', color: '#1DA1F2' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username', color: '#E4405F' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'channel', color: '#FF0000' },
  { key: 'twitch', label: 'Twitch', icon: Twitch, placeholder: 'username', color: '#9146FF' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'username', color: '#333' },
  { key: 'tiktok', label: 'TikTok', icon: Music2, placeholder: '@username', color: '#000' },
  { key: 'discord', label: 'Discord', icon: MessageCircle, placeholder: 'user', color: '#5865F2' },
]

export const CREATOR_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'vtuber', label: 'VTuber' },
  { value: 'streamer', label: 'Streamer' },
  { value: 'artist', label: 'Artist' },
  { value: 'musician', label: 'Musician' },
  { value: 'developer', label: 'Developer' },
  { value: 'content_creator', label: 'Content Creator' },
  { value: 'gamer', label: 'Gamer' },
  { value: 'other', label: 'Other' },
]

export const PRONOUNS_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'any', label: 'Any' },
  { value: 'custom', label: 'Custom' },
]

export const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#22c55e', '#0ea5e9',
]

export interface ProfileFormData {
  name: string
  username: string
  bio: string
  website: string
  location: string
  pronouns: string
  birthday: string
  accentColor: string
  creatorType: string
  isPublic: boolean
  showActivity: boolean
  socials: Record<string, string>
}

function ProfilePage() {
  const { currentUser } = useAuth()
  const updateProfile = useServerFn(updateProfileFn)
  const getMyLinks = useServerFn(getMyLinksFn)
  const getReferralStats = useServerFn(getReferralStatsFn)
  
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [currentBanner, setCurrentBanner] = useState<string | null>(null)
  const [customPronouns, setCustomPronouns] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '', username: '', bio: '', website: '', location: '',
    pronouns: '', birthday: '', accentColor: '#6366f1', creatorType: '',
    isPublic: true, showActivity: true, socials: {},
  })

  const isOwner = currentUser?.email === siteConfig.owner.email || currentUser?.email === import.meta.env.OWNER_EMAIL

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
        accentColor: p?.accentColor || '#6366f1',
        creatorType: p?.creatorType || '',
        isPublic: p?.isPublic ?? true,
        showActivity: p?.showActivity ?? true,
        socials: (p?.socials as Record<string, string>) || {},
      })
      setCurrentAvatar(p?.avatar || null)
      setCurrentBanner(p?.banner || null)
    }
  }, [currentUser])

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const updateField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateSocial = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, socials: { ...prev.socials, [key]: value } }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const pronounsToSave = formData.pronouns === 'custom' ? customPronouns : formData.pronouns
      await updateProfile({ 
        data: { 
          name: formData.name || undefined,
          username: formData.username || undefined,
          bio: formData.bio || undefined,
          website: formData.website || undefined,
          location: formData.location || undefined,
          pronouns: pronounsToSave || undefined,
          birthday: formData.birthday || undefined,
          accentColor: formData.accentColor || undefined,
          creatorType: formData.creatorType || undefined,
          isPublic: formData.isPublic,
          showActivity: formData.showActivity,
          socials: Object.keys(formData.socials).length > 0 ? formData.socials : undefined,
        } 
      })
      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError((error as { message?: string }).message || 'Failed to update')
    } finally {
      setIsSaving(false)
    }
  }

  const stats = currentUser?.stats || { profileViews: 0, totalLinkClicks: 0, followers: 0, following: 0 }
  const bioUrl = `https://eziox.link/${currentUser?.username}`
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
  const referralCount = referralStats?.referralCount || 0

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: UserCircle },
    { id: 'links' as TabType, label: 'Links', icon: LinkIcon, badge: links.length },
    { id: 'referrals' as TabType, label: 'Referrals', icon: Gift, badge: referralCount },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'privacy' as TabType, label: 'Privacy', icon: Lock },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: `${formData.accentColor}15` }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity }} />
      </div>

      <AnimatePresence mode="wait">
        {saveSuccess && (
          <motion.div key="success" initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 bg-green-500">
            <CheckCircle className="w-5 h-5 text-white" /><span className="text-white font-medium">Saved!</span>
          </motion.div>
        )}
        {saveError && (
          <motion.div key="error" initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 bg-red-500">
            <AlertCircle className="w-5 h-5 text-white" /><span className="text-white font-medium">{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-28 rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full" style={{ background: currentAvatar ? `url(${currentAvatar}) center/cover` : `linear-gradient(135deg, ${formData.accentColor}, var(--accent))` }}>
                      {!currentAvatar && <div className="w-full h-full flex items-center justify-center text-white font-bold">{(currentUser.name || 'U').charAt(0)}</div>}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2" style={{ borderColor: 'var(--card)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>{currentUser.name || 'Anonymous'}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>@{currentUser.username}</p>
                  </div>
                </div>
              </div>

              <nav className="p-3">
                <p className="px-3 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--foreground-muted)' }}>Dashboard</p>
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: activeTab === tab.id ? formData.accentColor : 'var(--background-secondary)' }}>
                      <tab.icon size={18} style={{ color: activeTab === tab.id ? 'white' : 'var(--foreground-muted)' }} />
                    </div>
                    <span className="flex-1 text-left" style={{ color: activeTab === tab.id ? 'var(--foreground)' : 'var(--foreground-muted)' }}>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}>{tab.badge}</span>}
                    <ChevronRight size={16} style={{ color: activeTab === tab.id ? formData.accentColor : 'transparent' }} />
                  </button>
                ))}
                <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
                <p className="px-3 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--foreground-muted)' }}>Quick Links</p>
                <Link to="/$username" params={{ username: currentUser.username }} target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--background-secondary)' }}><Globe size={18} style={{ color: 'var(--foreground-muted)' }} /></div>
                  <span style={{ color: 'var(--foreground)' }}>My Bio Page</span>
                  <ExternalLink size={14} style={{ color: 'var(--foreground-muted)' }} />
                </Link>
                <Link to="/leaderboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--background-secondary)' }}><TrendingUp size={18} style={{ color: 'var(--foreground-muted)' }} /></div>
                  <span style={{ color: 'var(--foreground)' }}>Leaderboard</span>
                </Link>
              </nav>

              <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>Your Bio Link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg text-sm font-mono truncate" style={{ background: 'var(--background-secondary)', color: formData.accentColor }}>eziox.link/{currentUser.username}</div>
                  <button onClick={() => copyToClipboard(bioUrl, 'bio')} className="p-2 rounded-lg" style={{ background: 'var(--background-secondary)' }}>
                    {copiedField === 'bio' ? <Check size={18} className="text-green-500" /> : <Copy size={18} style={{ color: 'var(--foreground-muted)' }} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>

          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mb-8">
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40" style={{ background: `linear-gradient(135deg, ${formData.accentColor}, var(--accent))` }} />
              <div className="relative rounded-3xl overflow-hidden" style={{ background: 'rgba(var(--card-rgb, 30, 30, 30), 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="relative h-40 md:h-48">
                  <ImageUpload type="banner" currentImage={currentBanner} onUploadSuccess={(url) => setCurrentBanner(url)} />
                  <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to top, rgba(var(--card-rgb, 30, 30, 30), 1), transparent)' }} />
                </div>
                <div className="px-6 pb-6 -mt-14 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                      <div className="relative">
                        <ImageUpload type="avatar" currentImage={currentAvatar} onUploadSuccess={(url) => setCurrentAvatar(url)} />
                        <motion.div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-4" style={{ borderColor: 'var(--card)' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{currentUser.name || 'Anonymous'}</h1>
                          {isOwner && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white"><Crown size={10} />Owner</span>}
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: formData.accentColor }}><Shield size={10} />Verified</span>
                          {formData.creatorType && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}><Sparkles size={10} className="inline mr-1" />{CREATOR_TYPES.find(t => t.value === formData.creatorType)?.label}</span>}
                        </div>
                        <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--foreground-muted)' }}><AtSign size={14} />{currentUser.username}{formData.pronouns && <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--background-secondary)' }}>{formData.pronouns}</span>}</p>
                      </div>
                    </div>
                    {hasChanges && (
                      <div className="flex gap-2">
                        <motion.button onClick={() => { setHasChanges(false); window.location.reload() }} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><X size={14} />Cancel</motion.button>
                        <motion.button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm bg-green-500 disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save</motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Profile Views', value: stats.profileViews, icon: Eye, gradient: 'from-indigo-500 to-purple-500' },
                { label: 'Link Clicks', value: totalClicks, icon: MousePointerClick, gradient: 'from-amber-500 to-orange-500' },
                { label: 'Followers', value: stats.followers, icon: Heart, gradient: 'from-pink-500 to-rose-500' },
                { label: 'Referrals', value: referralCount, icon: Users, gradient: 'from-green-500 to-emerald-500' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(var(--card-rgb, 30, 30, 30), 0.8)', border: '1px solid var(--border)' }}>
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}><stat.icon size={20} className="text-white" /></div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{(stat.value || 0).toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab === 'profile' && <ProfileTab key="profile" formData={formData} updateField={updateField} updateSocial={updateSocial} customPronouns={customPronouns} setCustomPronouns={setCustomPronouns} />}
              {activeTab === 'links' && <LinksTab key="links" accentColor={formData.accentColor} />}
              {activeTab === 'referrals' && <ReferralsTab key="referrals" accentColor={formData.accentColor} />}
              {activeTab === 'settings' && <SettingsTab key="settings" formData={formData} updateField={updateField} currentUser={currentUser} copyToClipboard={copyToClipboard} copiedField={copiedField} />}
              {activeTab === 'privacy' && <PrivacyTab key="privacy" formData={formData} updateField={updateField} isOwner={isOwner} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
