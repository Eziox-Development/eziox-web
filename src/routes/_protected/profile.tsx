/**
 * Profile Dashboard Page
 * Modern, clean design with real-time data and glassmorphism effects
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { siteConfig } from '@/lib/site-config'
import { updateProfileFn } from '@/server/functions/auth'
import { useServerFn } from '@tanstack/react-start'
import { ImageUpload } from '@/components/profile/image-upload'
import {
  User, Mail, Save, X, Calendar, Loader2, CheckCircle, AlertCircle,
  Copy, Check, Crown, Globe, Sparkles, Link as LinkIcon, AtSign,
  ExternalLink, Eye, EyeOff, MousePointerClick, Users, Heart,
  Settings, Gift, TrendingUp, Shield, Clock, MapPin, Palette, Lock,
  Activity, Cake, Twitter, Instagram, Youtube, Twitch, Github,
  Music2, MessageCircle, UserCircle, ChevronRight, Info, Pencil,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/profile')({
  head: () => ({
    meta: [
      { title: 'My Profile | Eziox' },
      { name: 'description', content: 'Manage your Eziox profile' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ProfilePage,
})

type TabType = 'profile' | 'settings' | 'privacy'

const SOCIAL_PLATFORMS = [
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: '@username', color: '#1DA1F2' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username', color: '#E4405F' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'channel', color: '#FF0000' },
  { key: 'twitch', label: 'Twitch', icon: Twitch, placeholder: 'username', color: '#9146FF' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'username', color: '#333' },
  { key: 'tiktok', label: 'TikTok', icon: Music2, placeholder: '@username', color: '#000' },
  { key: 'discord', label: 'Discord', icon: MessageCircle, placeholder: 'user', color: '#5865F2' },
]

const CREATOR_TYPES = [
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

const PRONOUNS_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'any', label: 'Any' },
  { value: 'custom', label: 'Custom' },
]

const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#22c55e', '#0ea5e9',
]

function ProfilePage() {
  const { currentUser } = useAuth()
  const updateProfile = useServerFn(updateProfileFn)
  
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [currentBanner, setCurrentBanner] = useState<string | null>(null)
  const [isInfoBlurred, setIsInfoBlurred] = useState(true)
  const [customPronouns, setCustomPronouns] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const [formData, setFormData] = useState({
    name: '', username: '', bio: '', website: '', location: '',
    pronouns: '', birthday: '', accentColor: '#6366f1', creatorType: '',
    isPublic: true, showActivity: true, socials: {} as Record<string, string>,
  })

  const isOwner = currentUser?.email === siteConfig.owner.email || currentUser?.email === import.meta.env.OWNER_EMAIL

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

  const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
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
  const memberSince = currentUser?.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown'

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: UserCircle },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'privacy' as TabType, label: 'Privacy', icon: Lock },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `${formData.accentColor}15` }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 bg-green-500"
          >
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Profile updated!</span>
          </motion.div>
        )}
        {saveError && (
          <motion.div
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
          {/* Sidebar */}
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-28 rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {/* User Card */}
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

              {/* Tabs */}
              <nav className="p-3">
                <p className="px-3 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--foreground-muted)' }}>Settings</p>
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: activeTab === tab.id ? formData.accentColor : 'var(--background-secondary)' }}>
                      <tab.icon size={18} style={{ color: activeTab === tab.id ? 'white' : 'var(--foreground-muted)' }} />
                    </div>
                    <span style={{ color: activeTab === tab.id ? 'var(--foreground)' : 'var(--foreground-muted)' }}>{tab.label}</span>
                    <ChevronRight size={16} className="ml-auto" style={{ color: activeTab === tab.id ? formData.accentColor : 'transparent' }} />
                  </button>
                ))}

                <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
                <p className="px-3 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--foreground-muted)' }}>Quick Links</p>
                {[
                  { label: 'My Bio Page', href: `/${currentUser.username}`, icon: Globe, external: true },
                  { label: 'Manage Links', href: '/links', icon: LinkIcon },
                  { label: 'Referrals', href: '/referrals', icon: Gift },
                  { label: 'Leaderboard', href: '/leaderboard', icon: TrendingUp },
                ].map((item) => (
                  <Link key={item.label} to={item.href} target={item.external ? '_blank' : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--background-secondary)' }}>
                      <item.icon size={18} style={{ color: 'var(--foreground-muted)' }} />
                    </div>
                    <span style={{ color: 'var(--foreground)' }}>{item.label}</span>
                    {item.external && <ExternalLink size={14} style={{ color: 'var(--foreground-muted)' }} />}
                  </Link>
                ))}
              </nav>

              {/* Bio Link */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>Your Bio Link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg text-sm font-mono truncate" style={{ background: 'var(--background-secondary)', color: formData.accentColor }}>
                    eziox.link/{currentUser.username}
                  </div>
                  <button onClick={() => copyToClipboard(bioUrl, 'bio')} className="p-2 rounded-lg" style={{ background: 'var(--background-secondary)' }}>
                    {copiedField === 'bio' ? <Check size={18} className="text-green-500" /> : <Copy size={18} style={{ color: 'var(--foreground-muted)' }} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header Card */}
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
                        <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--foreground-muted)' }}>
                          <AtSign size={14} />{currentUser.username}
                          {formData.pronouns && <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--background-secondary)' }}>{formData.pronouns}</span>}
                        </p>
                      </div>
                    </div>
                    {hasChanges && (
                      <div className="flex gap-2">
                        <motion.button onClick={() => { setHasChanges(false); window.location.reload() }} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <X size={14} />Cancel
                        </motion.button>
                        <motion.button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm bg-green-500 disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Profile Views', value: stats.profileViews, icon: Eye, gradient: 'from-indigo-500 to-purple-500' },
                { label: 'Link Clicks', value: stats.totalLinkClicks, icon: MousePointerClick, gradient: 'from-amber-500 to-orange-500' },
                { label: 'Followers', value: stats.followers, icon: Heart, gradient: 'from-pink-500 to-rose-500' },
                { label: 'Following', value: stats.following, icon: Users, gradient: 'from-green-500 to-emerald-500' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(var(--card-rgb, 30, 30, 30), 0.8)', border: '1px solid var(--border)' }}>
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}>
                    <stat.icon size={20} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{(stat.value || 0).toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  {/* Basic Info */}
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2">
                        <User size={20} style={{ color: formData.accentColor }} />
                        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Basic Information</h2>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <InputField label="Display Name" icon={User} value={formData.name} onChange={(v) => updateField('name', v)} placeholder="Your name" />
                      <InputField label="Username" icon={AtSign} value={formData.username} onChange={(v) => updateField('username', v.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} placeholder="username" hint={`eziox.link/${formData.username || 'username'}`} />
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Bio</label>
                        <div className="relative">
                          <Pencil size={18} className="absolute left-3 top-3" style={{ color: 'var(--foreground-muted)' }} />
                          <textarea value={formData.bio} onChange={(e) => updateField('bio', e.target.value)} rows={3} maxLength={500}
                            className="w-full pl-10 pr-4 py-3 rounded-xl outline-none resize-none" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} placeholder="Tell the world about yourself..." />
                        </div>
                        <p className="text-xs mt-1 text-right" style={{ color: 'var(--foreground-muted)' }}>{formData.bio.length}/500</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Location" icon={MapPin} value={formData.location} onChange={(v) => updateField('location', v)} placeholder="City, Country" />
                        <InputField label="Website" icon={Globe} value={formData.website} onChange={(v) => updateField('website', v)} placeholder="https://..." type="url" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Pronouns" value={formData.pronouns} onChange={(v) => updateField('pronouns', v)} options={PRONOUNS_OPTIONS} />
                        <InputField label="Birthday" icon={Cake} value={formData.birthday} onChange={(v) => updateField('birthday', v)} type="date" />
                      </div>
                      {formData.pronouns === 'custom' && <InputField label="Custom Pronouns" value={customPronouns} onChange={setCustomPronouns} placeholder="Enter pronouns" />}
                      <SelectField label="Creator Type" value={formData.creatorType} onChange={(v) => updateField('creatorType', v)} options={CREATOR_TYPES} hint="Helps show your profile to the right audience" />
                    </div>
                  </div>

                  {/* Socials */}
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2">
                        <LinkIcon size={20} style={{ color: formData.accentColor }} />
                        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Social Links</h2>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      {SOCIAL_PLATFORMS.map((p) => (
                        <div key={p.key} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: p.color + '20' }}>
                            <p.icon size={20} style={{ color: p.color }} />
                          </div>
                          <input type="text" value={formData.socials[p.key] || ''} onChange={(e) => updateSocial(p.key, e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl outline-none" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} placeholder={p.placeholder} />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
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
                          <button key={color} onClick={() => updateField('accentColor', color)} className="w-10 h-10 rounded-xl" style={{ background: color, boxShadow: formData.accentColor === color ? `0 0 0 3px var(--background), 0 0 0 5px ${color}` : 'none' }}>
                            {formData.accentColor === color && <Check size={20} className="text-white mx-auto" />}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <input type="color" value={formData.accentColor} onChange={(e) => updateField('accentColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
                        <input type="text" value={formData.accentColor} onChange={(e) => /^#[0-9A-Fa-f]{6}$/.test(e.target.value) && updateField('accentColor', e.target.value)}
                          className="px-3 py-2 rounded-lg font-mono text-sm" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} />
                      </div>
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
                        { label: 'Email', value: currentUser.email, icon: Mail, sensitive: true },
                        { label: 'Username', value: `@${currentUser.username}`, icon: AtSign },
                        { label: 'User ID', value: currentUser.id, icon: User, sensitive: true },
                        { label: 'Member Since', value: memberSince, icon: Calendar },
                        { label: 'Account Type', value: currentUser.role === 'admin' ? 'Admin' : 'Standard', icon: Sparkles },
                      ].map((item) => (
                        <button key={item.label} onClick={() => copyToClipboard(item.value || '', item.label)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group" style={{ background: 'var(--background-secondary)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--card)' }}>
                              <item.icon size={16} style={{ color: formData.accentColor }} />
                            </div>
                            <div className="text-left">
                              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{item.label}</p>
                              <p className="font-medium text-sm" style={{ color: 'var(--foreground)', filter: item.sensitive && isInfoBlurred ? 'blur(5px)' : 'none' }}>{item.value}</p>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100">
                            {copiedField === item.label ? <Check size={16} className="text-green-500" /> : <Copy size={16} style={{ color: 'var(--foreground-muted)' }} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div key="privacy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2">
                        <Lock size={20} style={{ color: formData.accentColor }} />
                        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Privacy Settings</h2>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <ToggleField label="Public Profile" description="Allow others to view your profile" checked={formData.isPublic} onChange={(v) => updateField('isPublic', v)} icon={Globe} accentColor={formData.accentColor} />
                      <ToggleField label="Show Activity" description="Display your activity status" checked={formData.showActivity} onChange={(v) => updateField('showActivity', v)} icon={Activity} accentColor={formData.accentColor} />
                    </div>
                  </div>

                  {isOwner && (
                    <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Crown size={20} style={{ color: '#f59e0b' }} />
                        <h3 className="font-bold" style={{ color: '#f59e0b' }}>Owner Privileges</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[{ label: 'Full Access', icon: Shield }, { label: 'User Management', icon: Users }, { label: 'Site Settings', icon: Settings }].map((p) => (
                          <div key={p.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--card)' }}>
                            <p.icon size={18} style={{ color: '#f59e0b' }} />
                            <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{p.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Activity */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'var(--background-secondary)' }}>
                <motion.div className="w-2 h-2 rounded-full bg-green-500" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}><Clock size={14} className="inline mr-1" />Last active: Just now</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function InputField({ label, icon: Icon, value, onChange, placeholder, type = 'text', hint }: { label: string; icon?: React.ElementType; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl outline-none`} style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} placeholder={placeholder} />
      </div>
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>{hint}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options, hint }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none appearance-none cursor-pointer" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}><Info size={12} className="inline mr-1" />{hint}</p>}
    </div>
  )
}

function ToggleField({ label, description, checked, onChange, icon: Icon, accentColor }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; icon: React.ElementType; accentColor: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: checked ? accentColor + '20' : 'var(--card)' }}>
          <Icon size={20} style={{ color: checked ? accentColor : 'var(--foreground-muted)' }} />
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--foreground)' }}>{label}</p>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{description}</p>
        </div>
      </div>
      <button onClick={() => onChange(!checked)} className="w-12 h-7 rounded-full p-1 transition-colors" style={{ background: checked ? accentColor : 'var(--border)' }}>
        <motion.div className="w-5 h-5 rounded-full bg-white" animate={{ x: checked ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </button>
    </div>
  )
}
