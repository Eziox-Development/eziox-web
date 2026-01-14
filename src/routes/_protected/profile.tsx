import { createFileRoute, useSearch, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { siteConfig } from '@/lib/site-config'
import { updateProfileFn } from '@/server/functions/auth'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ImageUpload } from '@/components/profile/image-upload'
import {
  User,
  Mail,
  Save,
  X,
  Edit3,
  Shield,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Crown,
  Globe,
  Clock,
  Sparkles,
  Settings,
  Link as LinkIcon,
  AtSign,
  Fingerprint,
  BadgeCheck,
  Palette,
  Activity,
  Eye,
  Users,
  FileText,
  ExternalLink,
} from 'lucide-react'

const profileSearchSchema = z.object({
  user: z.string().optional(),
})

export const Route = createFileRoute('/_protected/profile')({
  component: ProfilePage,
  validateSearch: profileSearchSchema,
})

function ProfilePage() {
  const { currentUser } = useAuth()
  const search = useSearch({ from: '/_protected/profile' })
  const viewingUserId = search.user
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview')
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [currentBanner, setCurrentBanner] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: '',
    website: '',
    location: '',
  })

  const isOwner = currentUser?.email === siteConfig.owner.email || 
                  currentUser?.email === import.meta.env.VITE_OWNER_EMAIL
  
  const isViewingOwnProfile = !viewingUserId || viewingUserId === currentUser?.id

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.profile?.bio || '',
        website: currentUser.profile?.website || '',
        location: currentUser.profile?.location || '',
      })
      // Initialize avatar and banner from profile
      setCurrentAvatar(currentUser.profile?.avatar || null)
      setCurrentBanner(currentUser.profile?.banner || null)
    }
  }, [currentUser])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }


  const updateProfile = useServerFn(updateProfileFn)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    
    try {
      // Update profile in Appwrite
      await updateProfile({ data: { name: formData.name || undefined } })
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
      // Reload page to get updated user data
      window.location.reload()
    } catch (error) {
      const err = error as { message?: string }
      setSaveError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      bio: '',
      website: '',
      location: '',
    })
    setIsEditing(false)
    setSaveError(null)
  }

  const memberSince = currentUser?.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('de-DE')

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  const CopyableField = ({ 
    label, 
    value, 
    icon: Icon, 
    fieldKey 
  }: { 
    label: string
    value: string
    icon: React.ElementType
    fieldKey: string 
  }) => (
    <motion.button
      onClick={() => copyToClipboard(value, fieldKey)}
      className="w-full flex items-center justify-between p-3 rounded-xl transition-all group"
      style={{
        background: 'var(--background)',
        border: '1px solid var(--border)',
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ background: 'var(--background-secondary)' }}
        >
          <Icon size={16} style={{ color: 'var(--primary)' }} />
        </div>
        <div className="text-left">
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            {label}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {value}
          </p>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        {copiedField === fieldKey ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <Copy size={16} style={{ color: 'var(--foreground-muted)' }} />
        )}
      </div>
    </motion.button>
  )

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Toast Notifications */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-20 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 shadow-2xl"
              style={{
                background: 'rgba(34, 197, 94, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Profile updated successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-20 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 shadow-2xl"
              style={{
                background: 'rgba(239, 68, 68, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <AlertCircle className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{saveError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Profile Card - Discord Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Banner Section */}
          {isViewingOwnProfile ? (
            <div className="p-6 pb-0">
              <ImageUpload 
                type="banner" 
                currentImage={currentBanner}
                onUploadSuccess={(url) => setCurrentBanner(url)}
              />
            </div>
          ) : (
            <div className="relative h-48">
              <div
                className="absolute inset-0"
                style={{
                  background: currentBanner
                    ? `url(${currentBanner}) center/cover`
                    : 'linear-gradient(135deg, var(--primary), var(--accent), var(--primary))',
                  backgroundSize: currentBanner ? 'cover' : '200% 200%',
                  animation: currentBanner ? 'none' : 'gradientShift 8s ease infinite',
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-24"
                style={{
                  background: 'linear-gradient(to top, var(--card), transparent)',
                }}
              />
            </div>
          )}

          {/* Profile Header */}
          <div className="px-6 -mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              {/* Avatar */}
              {isViewingOwnProfile ? (
                <div className="relative">
                  <ImageUpload 
                    type="avatar" 
                    currentImage={currentAvatar}
                    onUploadSuccess={(url) => setCurrentAvatar(url)}
                  />
                  {/* Online Status Indicator */}
                  <motion.div
                    className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-4"
                    style={{
                      backgroundColor: '#22c55e',
                      borderColor: 'var(--card)',
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <motion.div
                    className="w-32 h-32 rounded-3xl overflow-hidden"
                    style={{
                      boxShadow: '0 0 0 6px var(--card), 0 0 30px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                      background: 'var(--background-secondary)',
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {currentAvatar ? (
                      <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : currentUser.name ? (
                      <div
                        className="w-full h-full flex items-center justify-center text-5xl font-bold"
                        style={{
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          color: 'white',
                        }}
                      >
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        <User size={60} />
                      </div>
                    )}
                  </motion.div>
                  {/* Online Status Indicator */}
                  <motion.div
                    className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-4"
                    style={{
                      backgroundColor: '#22c55e',
                      borderColor: 'var(--card)',
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pb-2">
                {isViewingOwnProfile && (
                  <>
                    {!isEditing ? (
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: 'var(--primary)',
                          color: 'white',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </motion.button>
                    ) : (
                      <>
                        <motion.button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                          style={{
                            background: 'var(--background-secondary)',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground-muted)',
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <X size={16} />
                          Cancel
                        </motion.button>
                        <motion.button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isSaving ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          Save
                        </motion.button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-2xl font-bold bg-transparent border-b-2 outline-none px-1"
                    style={{
                      color: 'var(--foreground)',
                      borderColor: 'var(--primary)',
                    }}
                    placeholder="Your name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {currentUser.name || 'Anonymous User'}
                  </h1>
                )}
                
                {/* Badges */}
                {isOwner && (
                  <motion.div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Crown size={12} />
                    Owner
                  </motion.div>
                )}
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <BadgeCheck size={12} />
                  Verified
                </motion.div>
              </div>
              
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                @{currentUser.name?.toLowerCase().replace(/\s+/g, '') || currentUser.email?.split('@')[0]}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 mt-6">
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{ background: 'var(--background-secondary)' }}
            >
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'activity', label: 'Activity', icon: Activity },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === tab.id ? 'var(--card)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--foreground)' : 'var(--foreground-muted)',
                    boxShadow: activeTab === tab.id ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* About Me Section */}
                  <div
                    className="p-5 rounded-2xl space-y-4"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                      About Me
                    </h3>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full h-24 p-3 rounded-xl outline-none resize-none text-sm"
                        style={{
                          background: 'var(--background)',
                          border: '1px solid var(--primary)',
                          color: 'var(--foreground)',
                        }}
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                        {formData.bio || 'No bio yet. Click Edit Profile to add one!'}
                      </p>
                    )}
                  </div>

                  {/* Member Since Section */}
                  <div
                    className="p-5 rounded-2xl space-y-4"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      <Calendar size={14} style={{ color: 'var(--primary)' }} />
                      Member Since
                    </h3>
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-xl"
                        style={{ background: 'var(--background)' }}
                      >
                        <Clock size={24} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                          {memberSince}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          Account created
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details - Full Width */}
                  <div
                    className="lg:col-span-2 p-5 rounded-2xl space-y-4"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      <Shield size={14} style={{ color: 'var(--primary)' }} />
                      Account Details
                      <span className="text-xs font-normal ml-auto" style={{ color: 'var(--foreground-muted)' }}>
                        Click to copy
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CopyableField
                        label="User ID"
                        value={currentUser?.id || 'N/A'}
                        icon={Fingerprint}
                        fieldKey="userId"
                      />
                      <CopyableField
                        label="Email"
                        value={currentUser.email || 'N/A'}
                        icon={Mail}
                        fieldKey="email"
                      />
                      <CopyableField
                        label="Username"
                        value={`@${currentUser.username || currentUser.name?.toLowerCase().replace(/\s+/g, '') || currentUser.email?.split('@')[0]}`}
                        icon={AtSign}
                        fieldKey="username"
                      />
                      <CopyableField
                        label="Profile URL"
                        value={`${window.location.origin}/profile?user=${currentUser?.id}`}
                        icon={LinkIcon}
                        fieldKey="profileUrl"
                      />
                    </div>
                  </div>

                  {/* Owner Section - Only visible to owner */}
                  {isOwner && (
                    <div
                      className="lg:col-span-2 p-5 rounded-2xl space-y-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                        style={{ color: '#f59e0b' }}
                      >
                        <Crown size={14} />
                        Owner Privileges
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                          <FileText size={20} style={{ color: '#f59e0b' }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Full Access</p>
                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>All documents</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                          <Users size={20} style={{ color: '#f59e0b' }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>User Management</p>
                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Manage all users</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                          <Settings size={20} style={{ color: '#f59e0b' }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Site Settings</p>
                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Full control</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div
                    className="p-8 rounded-2xl text-center"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Activity size={48} className="mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      No Activity Yet
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      Your recent activity will appear here
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Appearance */}
                  <div
                    className="p-5 rounded-2xl space-y-4"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      <Palette size={14} style={{ color: 'var(--primary)' }} />
                      Appearance
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      Theme settings are available in the navigation bar
                    </p>
                  </div>

                  {/* Privacy */}
                  <div
                    className="p-5 rounded-2xl space-y-4"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      <Eye size={14} style={{ color: 'var(--primary)' }} />
                      Privacy
                    </h3>
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                      <div className="flex items-center gap-3">
                        <Globe size={18} style={{ color: 'var(--foreground-muted)' }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Public Profile</p>
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Anyone can view your profile</p>
                        </div>
                      </div>
                      <div
                        className="w-12 h-6 rounded-full relative cursor-pointer"
                        style={{ background: 'var(--primary)' }}
                      >
                        <div
                          className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Connected Accounts */}
                  <div
                    className="p-5 rounded-2xl space-y-4"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      <LinkIcon size={14} style={{ color: 'var(--primary)' }} />
                      Connected Accounts
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      No connected accounts yet. OAuth integrations coming soon!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: 'Home', href: '/', icon: Globe },
            { label: 'Archive', href: '/archive', icon: FileText },
            { label: 'About', href: '/about', icon: User },
            { label: 'Sign Out', href: '/sign-out', icon: ExternalLink },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl text-sm font-medium transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
