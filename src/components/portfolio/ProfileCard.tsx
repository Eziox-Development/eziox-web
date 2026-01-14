import type { ComponentType } from 'react'
import {
  LuTwitter,
  LuGithub,
  LuLinkedin,
  LuInstagram,
  LuDribbble,
  LuYoutube,
  LuMail,
  LuGlobe,
} from 'react-icons/lu'
import { FaDiscord, FaTiktok, FaTwitch } from 'react-icons/fa'
import { motion } from 'motion/react'
import {
  User,
  MapPin,
  Link as LinkIcon,
  Eye,
  MousePointerClick,
  Users,
  Crown,
  BadgeCheck,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { useState } from 'react'

const iconMap: Record<string, ComponentType<{ size?: number }>> = {
  twitter: LuTwitter,
  github: LuGithub,
  linkedin: LuLinkedin,
  instagram: LuInstagram,
  dribbble: LuDribbble,
  youtube: LuYoutube,
  mail: LuMail,
  globe: LuGlobe,
  discord: FaDiscord,
  tiktok: FaTiktok,
  twitch: FaTwitch,
}

interface ProfileCardProps {
  user: {
    id: string
    name: string | null
    username: string
    email?: string
    role?: string
    createdAt?: string
    profile?: {
      bio?: string | null
      avatar?: string | null
      banner?: string | null
      location?: string | null
      website?: string | null
      pronouns?: string | null
      accentColor?: string | null
      badges?: string[] | null
      socials?: Record<string, string> | null
      isPublic?: boolean
    } | null
    stats?: {
      profileViews?: number
      totalLinkClicks?: number
      followers?: number
      following?: number
      score?: number
    } | null
  }
  isOwner?: boolean
  compact?: boolean
}

export function ProfileCard({ user, isOwner = false, compact = false }: ProfileCardProps) {
  const [copied, setCopied] = useState(false)
  
  const bioUrl = `eziox.link/${user.username}`
  const isPremium = user.role === 'premium' || user.role === 'owner'
  const isVerified = user.role === 'owner' || user.role === 'admin'

  const copyBioLink = async () => {
    await navigator.clipboard.writeText(`https://${bioUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl overflow-hidden ${compact ? '' : 'max-w-sm'}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Banner */}
      <div className="relative h-24">
        {user.profile?.banner ? (
          <img
            src={user.profile.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: user.profile?.accentColor 
                ? `linear-gradient(135deg, ${user.profile.accentColor}, var(--accent))`
                : 'linear-gradient(135deg, var(--primary), var(--accent))',
            }}
          />
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-12"
          style={{ background: 'linear-gradient(to top, var(--card), transparent)' }}
        />
        
        {/* Premium Badge */}
        {isPremium && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#1f2937',
            }}
          >
            <Crown size={12} />
            Premium
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="px-4 -mt-10 relative z-10">
        <motion.div
          className="w-20 h-20 rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 0 0 4px var(--card), 0 0 20px rgba(99, 102, 241, 0.3)',
            background: 'var(--background-secondary)',
          }}
          whileHover={{ scale: 1.02 }}
        >
          {user.profile?.avatar ? (
            <img src={user.profile.avatar} alt={user.name || user.username} className="w-full h-full object-cover" />
          ) : user.name ? (
            <div
              className="w-full h-full flex items-center justify-center text-3xl font-bold"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--foreground-muted)' }}>
              <User size={32} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3 space-y-4">
        {/* Name & Username */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              {user.name || user.username}
            </h3>
            {isVerified && (
              <BadgeCheck size={18} fill="var(--primary)" style={{ color: 'white' }} />
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            @{user.username}
          </p>
          {user.profile?.pronouns && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
              {user.profile.pronouns}
            </p>
          )}
        </div>

        {/* Bio */}
        {user.profile?.bio && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            {user.profile.bio}
          </p>
        )}

        {/* Location & Website */}
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--foreground-muted)' }}>
          {user.profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {user.profile.location}
            </span>
          )}
          {user.profile?.website && (
            <a
              href={user.profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
            >
              <LinkIcon size={12} />
              {user.profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
        </div>

        {/* Stats */}
        {user.stats && (
          <div className="grid grid-cols-3 gap-2">
            <div
              className="p-2 rounded-xl text-center"
              style={{ background: 'var(--background-secondary)' }}
            >
              <Eye size={14} className="mx-auto mb-1" style={{ color: 'var(--primary)' }} />
              <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                {formatNumber(user.stats.profileViews)}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>Views</div>
            </div>
            <div
              className="p-2 rounded-xl text-center"
              style={{ background: 'var(--background-secondary)' }}
            >
              <MousePointerClick size={14} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
              <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                {formatNumber(user.stats.totalLinkClicks)}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>Clicks</div>
            </div>
            <div
              className="p-2 rounded-xl text-center"
              style={{ background: 'var(--background-secondary)' }}
            >
              <Users size={14} className="mx-auto mb-1" style={{ color: 'var(--primary)' }} />
              <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                {formatNumber(user.stats.followers)}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>Followers</div>
            </div>
          </div>
        )}

        {/* Badges */}
        {user.profile?.badges && user.profile.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.profile.badges.map((badge) => (
              <span
                key={badge}
                className="px-2 py-1 rounded-md text-[10px] font-medium"
                style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Social Links */}
        {user.profile?.socials && Object.keys(user.profile.socials).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(user.profile.socials).map(([platform, url]) => {
              const Icon = iconMap[platform.toLowerCase()] || LuGlobe
              return (
                <motion.a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'var(--background-secondary)',
                    color: 'var(--foreground-muted)',
                  }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  title={platform}
                >
                  <Icon size={16} />
                </motion.a>
              )
            })}
          </div>
        )}

        {/* Bio Link */}
        <div
          className="flex items-center justify-between p-3 rounded-xl"
          style={{ background: 'var(--background-secondary)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>
            {bioUrl}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyBioLink}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--background)]"
              style={{ color: 'var(--foreground-muted)' }}
              title="Copy link"
            >
              {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
            </button>
            <a
              href={`https://${bioUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--background)]"
              style={{ color: 'var(--foreground-muted)' }}
              title="Open bio page"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <a
            href="/profile"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white',
            }}
          >
            Edit Profile
          </a>
        )}
      </div>
    </motion.div>
  )
}
