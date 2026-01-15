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
  MousePointerClick,
  Users,
  Heart,
  Zap,
  Settings,
  Gift,
  TrendingUp,
  Shield,
  MapPin,
  Clock,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/profile')({
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

      <div className="max-w-5xl mx-auto">
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
            <div className="relative h-48 md:h-56">
              <ImageUpload 
                type="banner" 
                currentImage={currentBanner}
                onUploadSuccess={(url) => setCurrentBanner(url)}
              />
              
              {/* Gradient Overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 h-32"
                style={{ background: 'linear-gradient(to top, rgba(var(--card-rgb, 30, 30, 30), 1), transparent)' }}
              />
            </div>

            {/* Profile Info */}
            <div className="px-6 md:px-8 pb-8 -mt-16 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                {/* Avatar & Name */}
                <div className="flex flex-col md:flex-row md:items-end gap-5">
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="text-2xl md:text-3xl font-bold bg-transparent border-b-2 outline-none px-1"
                          style={{ color: 'var(--foreground)', borderColor: 'var(--primary)' }}
                          placeholder="Your name"
                        />
                      ) : (
                        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                          {currentUser.name || 'Anonymous'}
                        </h1>
                      )}
                      
                      {/* Badges */}
                      {isOwner && (
                        <motion.span
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Crown size={12} />
                          Owner
                        </motion.span>
                      )}
                      <motion.span
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'var(--primary)', color: 'white' }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Shield size={12} />
                        Verified
                      </motion.span>
                    </div>
                    
                    <p className="text-sm flex items-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                      <AtSign size={14} />
                      {currentUser.username || currentUser.email?.split('@')[0]}
                    </p>
                    
                    {formData.location && (
                      <p className="text-sm flex items-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                        <MapPin size={14} />
                        {formData.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!isEditing ? (
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
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
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium"
                        style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <X size={16} />
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
                className="relative p-5 rounded-2xl text-center backdrop-blur-sm"
                style={{ 
                  background: 'rgba(var(--card-rgb, 30, 30, 30), 0.8)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bio Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-30"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          />
          <div
            className="relative p-6 rounded-2xl"
            style={{ 
              background: 'rgba(var(--card-rgb, 30, 30, 30), 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                >
                  <Globe size={28} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                    Your Bio Page
                  </p>
                  <p className="text-sm font-mono" style={{ color: 'var(--primary)' }}>
                    eziox.link/{currentUser.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => copyToClipboard(bioUrl, 'bio')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
                  style={{ 
                    background: 'var(--background-secondary)', 
                    color: copiedField === 'bio' ? '#22c55e' : 'var(--foreground)',
                    border: '1px solid var(--border)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copiedField === 'bio' ? <Check size={18} /> : <Copy size={18} />}
                  {copiedField === 'bio' ? 'Copied!' : 'Copy'}
                </motion.button>
                <motion.a
                  href={`/${currentUser.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink size={18} />
                  View
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Manage Links', href: '/links', icon: LinkIcon, description: 'Edit your bio links' },
            { label: 'Referrals', href: '/referrals', icon: Gift, description: 'Invite friends' },
            { label: 'Analytics', href: '/links', icon: TrendingUp, description: 'View statistics' },
            { label: 'Settings', href: '/profile', icon: Settings, description: 'Account settings' },
          ].map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Link
                to={action.href}
                className="block p-5 rounded-2xl transition-all hover:scale-[1.02] group"
                style={{ 
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div 
                  className="w-12 h-12 mb-4 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: 'var(--background-secondary)' }}
                >
                  <action.icon size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                  {action.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  {action.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              Account Details
            </h2>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Your account information
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {[
              { label: 'Email', value: currentUser.email, icon: Mail, key: 'email' },
              { label: 'Username', value: `@${currentUser.username}`, icon: AtSign, key: 'username' },
              { label: 'User ID', value: currentUser.id, icon: User, key: 'id' },
              { label: 'Member Since', value: memberSince, icon: Calendar, key: 'member' },
              { label: 'Account Type', value: currentUser.role === 'admin' ? 'Admin' : 'Standard', icon: Sparkles, key: 'tier' },
            ].map((item) => (
              <motion.button
                key={item.key}
                onClick={() => copyToClipboard(item.value || '', item.key)}
                className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/5 group"
                style={{ background: 'var(--background-secondary)' }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--card)' }}
                  >
                    <item.icon size={18} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      {item.label}
                    </p>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {item.value}
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedField === item.key ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <Copy size={18} style={{ color: 'var(--foreground-muted)' }} />
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
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 rounded-2xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Crown size={24} style={{ color: '#f59e0b' }} />
              <h3 className="text-lg font-bold" style={{ color: '#f59e0b' }}>
                Owner Privileges
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Full Access', description: 'All platform features', icon: Zap },
                { label: 'User Management', description: 'Manage all users', icon: Users },
                { label: 'Site Settings', description: 'Full control', icon: Settings },
              ].map((priv) => (
                <div
                  key={priv.label}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'var(--card)' }}
                >
                  <priv.icon size={20} style={{ color: '#f59e0b' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>
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
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
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
  )
}
