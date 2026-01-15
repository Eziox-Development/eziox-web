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
  User,
  Mail,
  Save,
  X,
  Edit3,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Crown,
  Globe,
  Sparkles,
  Link as LinkIcon,
  AtSign,
  ExternalLink,
  Eye,
  EyeOff,
  MousePointerClick,
  Users,
  Heart,
  Zap,
  Settings,
  Gift,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/profile')({
  head: () => ({
    meta: [
      { title: 'My Profile | Eziox' },
      { name: 'description', content: 'Manage your Eziox profile, links, and account settings' },
      { property: 'og:title', content: 'My Profile | Eziox' },
      { property: 'og:description', content: 'Manage your Eziox profile, links, and account settings' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ProfilePage,
})

function ProfilePage() {
  const { currentUser } = useAuth()
  const updateProfile = useServerFn(updateProfileFn)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [currentBanner, setCurrentBanner] = useState<string | null>(null)
  const [isInfoBlurred, setIsInfoBlurred] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    location: '',
  })

  const isOwner = currentUser?.email === siteConfig.owner.email || 
                  currentUser?.email === import.meta.env.VITE_OWNER_EMAIL

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.profile?.bio || '',
        website: currentUser.profile?.website || '',
        location: currentUser.profile?.location || '',
      })
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

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    
    try {
      await updateProfile({ data: { name: formData.name || undefined } })
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
      window.location.reload()
    } catch (error) {
      const err = error as { message?: string }
      setSaveError(err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.profile?.bio || '',
        website: currentUser.profile?.website || '',
        location: currentUser.profile?.location || '',
      })
    }
    setIsEditing(false)
    setSaveError(null)
  }

  const memberSince = currentUser?.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown'

  const stats = currentUser?.stats || { profileViews: 0, totalLinkClicks: 0, followers: 0, following: 0 }
  const bioUrl = `https://eziox.link/${currentUser?.username}`

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--foreground-muted)' }}>Loading profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(99, 102, 241, 0.08))' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(34, 197, 94, 0.95)', backdropFilter: 'blur(10px)' }}
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
            className="fixed top-24 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(239, 68, 68, 0.95)', backdropFilter: 'blur(10px)' }}
          >
            <AlertCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-72 flex-shrink-0"
          >
            <div
              className="lg:sticky lg:top-28 rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {/* User Mini Card */}
              <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full bg-cover bg-center"
                      style={{ 
                        background: currentAvatar 
                          ? `url(${currentAvatar}) center/cover` 
                          : 'linear-gradient(135deg, var(--primary), var(--accent))',
                      }}
                    >
                      {!currentAvatar && (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2"
                      style={{ backgroundColor: '#22c55e', borderColor: 'var(--card)' }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                      {currentUser.name || 'Anonymous'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>
                      @{currentUser.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="p-3">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Quick Links
                </p>
                {[
                  { label: 'My Bio Page', href: `/${currentUser.username}`, icon: Globe, external: true },
                  { label: 'Manage Links', href: '/links', icon: LinkIcon },
                  { label: 'Referrals', href: '/referrals', icon: Gift },
                  { label: 'Leaderboard', href: '/leaderboard', icon: TrendingUp },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    target={item.external ? '_blank' : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors group-hover:bg-white/10"
                      style={{ background: 'var(--background-secondary)' }}
                    >
                      <item.icon size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {item.label}
                    </span>
                    {item.external && <ExternalLink size={14} style={{ color: 'var(--foreground-muted)' }} />}
                  </Link>
                ))}

                <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />

                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Account
                </p>
                {[
                  { label: 'Settings', href: '/profile', icon: Settings },
                  { label: 'Help Center', href: '/about', icon: AlertCircle },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors group-hover:bg-white/10"
                      style={{ background: 'var(--background-secondary)' }}
                    >
                      <item.icon size={18} style={{ color: 'var(--foreground-muted)' }} />
                    </div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Bio Link Quick Copy */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Your Bio Link
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-mono truncate"
                    style={{ background: 'var(--background-secondary)', color: 'var(--primary)' }}
                  >
                    eziox.link/{currentUser.username}
                  </div>
                  <motion.button
                    onClick={() => copyToClipboard(bioUrl, 'sidebar-bio')}
                    className="p-2 rounded-lg"
                    style={{ background: 'var(--background-secondary)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copiedField === 'sidebar-bio' ? (
                      <Check size={18} className="text-green-500" />
                    ) : (
                      <Copy size={18} style={{ color: 'var(--foreground-muted)' }} />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Right Content - User Card & Info */}
          <div className="flex-1 min-w-0">
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-8"
            >
              {/* Glow Effect */}
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
              />
              
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{ 
                  background: 'rgba(var(--card-rgb, 30, 30, 30), 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Banner */}
                <div className="relative h-40 md:h-48">
                  <ImageUpload 
                    type="banner" 
                    currentImage={currentBanner}
                    onUploadSuccess={(url) => setCurrentBanner(url)}
                  />
                  
                  {/* Gradient Overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-24"
                    style={{ background: 'linear-gradient(to top, rgba(var(--card-rgb, 30, 30, 30), 1), transparent)' }}
                  />
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6 -mt-14 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    {/* Avatar & Name */}
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <ImageUpload 
                          type="avatar" 
                          currentImage={currentAvatar}
                          onUploadSuccess={(url) => setCurrentAvatar(url)}
                        />
                        {/* Online Indicator */}
                        <motion.div
                          className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-4"
                          style={{ backgroundColor: '#22c55e', borderColor: 'var(--card)' }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>

                      {/* Name & Username */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="text-xl md:text-2xl font-bold bg-transparent border-b-2 outline-none px-1"
                              style={{ color: 'var(--foreground)', borderColor: 'var(--primary)' }}
                              placeholder="Your name"
                            />
                          ) : (
                            <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                              {currentUser.name || 'Anonymous'}
                            </h1>
                          )}
                          
                          {/* Badges */}
                          {isOwner && (
                            <motion.span
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Crown size={10} />
                              Owner
                            </motion.span>
                          )}
                          <motion.span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: 'var(--primary)', color: 'white' }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Shield size={10} />
                            Verified
                          </motion.span>
                        </div>
                        
                        <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--foreground-muted)' }}>
                          <AtSign size={14} />
                          {currentUser.username || currentUser.email?.split('@')[0]}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <motion.button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm"
                          style={{ 
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Edit3 size={14} />
                          Edit Profile
                        </motion.button>
                      ) : (
                        <>
                          <motion.button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm"
                            style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <X size={14} />
                            Cancel
                          </motion.button>
                          <motion.button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
            >
              {[
                { label: 'Profile Views', value: stats.profileViews || 0, icon: Eye, gradient: 'from-indigo-500 to-purple-500' },
                { label: 'Link Clicks', value: stats.totalLinkClicks || 0, icon: MousePointerClick, gradient: 'from-amber-500 to-orange-500' },
                { label: 'Followers', value: stats.followers || 0, icon: Heart, gradient: 'from-pink-500 to-rose-500' },
                { label: 'Following', value: stats.following || 0, icon: Users, gradient: 'from-green-500 to-emerald-500' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="relative group"
                >
                  <div
                    className="relative p-4 rounded-xl text-center backdrop-blur-sm"
                    style={{ 
                      background: 'rgba(var(--card-rgb, 30, 30, 30), 0.8)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--foreground)' }}>
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Account Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl overflow-hidden mb-8"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                      Account Details
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      Your account information
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setIsInfoBlurred(!isInfoBlurred)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                    style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isInfoBlurred ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span className="text-sm">
                      {isInfoBlurred ? 'Show' : 'Hide'}
                    </span>
                  </motion.button>
                </div>
              </div>
              
              <div className="p-5 space-y-3">
                {[
                  { label: 'Email', value: currentUser.email, icon: Mail, key: 'email', sensitive: true },
                  { label: 'Username', value: `@${currentUser.username}`, icon: AtSign, key: 'username', sensitive: false },
                  { label: 'User ID', value: currentUser.id, icon: User, key: 'id', sensitive: true },
                  { label: 'Member Since', value: memberSince, icon: Calendar, key: 'member', sensitive: false },
                  { label: 'Account Type', value: currentUser.role === 'admin' ? 'Admin' : 'Standard', icon: Sparkles, key: 'tier', sensitive: false },
                ].map((item) => (
                  <motion.button
                    key={item.key}
                    onClick={() => copyToClipboard(item.value || '', item.key)}
                    className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5 group"
                    style={{ background: 'var(--background-secondary)' }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--card)' }}
                      >
                        <item.icon size={16} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {item.label}
                        </p>
                        <p 
                          className="font-medium text-sm transition-all duration-200"
                          style={{ 
                            color: 'var(--foreground)',
                            filter: item.sensitive && isInfoBlurred ? 'blur(5px)' : 'none'
                          }}
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedField === item.key ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} style={{ color: 'var(--foreground-muted)' }} />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Owner Section */}
            {isOwner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-2xl mb-8"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={20} style={{ color: '#f59e0b' }} />
                  <h3 className="font-bold" style={{ color: '#f59e0b' }}>
                    Owner Privileges
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Full Access', description: 'All platform features', icon: Zap },
                    { label: 'User Management', description: 'Manage all users', icon: Users },
                    { label: 'Site Settings', description: 'Full control', icon: Settings },
                  ].map((priv) => (
                    <div
                      key={priv.label}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--card)' }}
                    >
                      <priv.icon size={18} style={{ color: '#f59e0b' }} />
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                          {priv.label}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {priv.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Activity Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'var(--background-secondary)' }}>
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#22c55e' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  <Clock size={14} className="inline mr-1" />
                  Last active: Just now
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
