/**
 * Bio Page - Modern Design
 * User's personal bio link page at eziox.link/{username}
 * No Nav/Footer - this is the user's space
 */

import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPublicProfileFn } from '@/server/functions/users'
import { trackLinkClickFn } from '@/server/functions/links'
import {
  User,
  Eye,
  Link as LinkIcon,
  Users,
  ExternalLink,
  Crown,
  BadgeCheck,
  Loader2,
  MapPin,
  Globe,
  Sparkles,
  MousePointerClick,
  Share2,
  Check,
} from 'lucide-react'
import {
  LuTwitter,
  LuGithub,
  LuLinkedin,
  LuInstagram,
  LuYoutube,
} from 'react-icons/lu'
import { FaDiscord, FaTiktok, FaTwitch } from 'react-icons/fa'
import type { ComponentType } from 'react'

const socialIconMap: Record<string, ComponentType<{ size?: number }>> = {
  twitter: LuTwitter,
  github: LuGithub,
  linkedin: LuLinkedin,
  instagram: LuInstagram,
  youtube: LuYoutube,
  discord: FaDiscord,
  tiktok: FaTiktok,
  twitch: FaTwitch,
}

// Reserved paths that should not be treated as usernames
const RESERVED_PATHS = [
  'sign-in',
  'sign-up',
  'sign-out',
  'profile',
  'links',
  'leaderboard',
  'changelog',
  'about',
  'blog',
  'category',
  'tag',
  'rss',
  'sitemap',
  'api',
  'u',
  's',
]

export const Route = createFileRoute('/_bio/$username')({
  beforeLoad: ({ params }) => {
    if (RESERVED_PATHS.includes(params.username.toLowerCase())) {
      throw notFound()
    }
  },
  component: BioPage,
})

function BioPage() {
  const params = Route.useParams()
  const username = params.username as string
  const getProfile = useServerFn(getPublicProfileFn)
  const trackClick = useServerFn(trackLinkClickFn)

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => getProfile({ data: { username } }),
  })

  const [clickedLink, setClickedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleLinkClick = (linkId: string, url: string) => {
    setClickedLink(linkId)
    console.log('[Bio] Tracking click for link:', linkId)
    // Fire and forget - don't block navigation
    trackClick({ data: { linkId } })
      .then(result => console.log('[Bio] Click tracked:', result))
      .catch(error => console.error('[Bio] Failed to track click:', error))
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => setClickedLink(null), 500)
  }

  const handleShare = async () => {
    const url = `https://eziox.link/${username}`
    if (navigator.share) {
      await navigator.share({ title: `${profile?.user.name || username}'s Bio`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading bio...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'var(--background-secondary)' }}
          >
            <User className="w-12 h-12" style={{ color: 'var(--foreground-muted)' }} />
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            @{username}
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--foreground-muted)' }}>
            This bio page doesn't exist yet.
          </p>
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white' }}
          >
            <Sparkles size={18} />
            Claim this username
          </Link>
        </motion.div>
      </div>
    )
  }

  const profileData = profile.profile && 'bio' in profile.profile ? profile.profile : null
  const accentColor = profileData?.accentColor || 'var(--primary)'
  const isPremium = profile.user.role === 'premium' || profile.user.role === 'owner'
  const isVerified = profile.user.role === 'owner' || profile.user.role === 'admin'

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: accentColor }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--accent)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* Share Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-4"
        >
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all hover:scale-105"
            style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
          >
            {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Share2 size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </motion.div>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-16"
        >
          <div
            className="w-full h-40 sm:h-48 rounded-3xl overflow-hidden"
            style={{
              background: profileData?.banner
                ? `url(${profileData.banner}) center/cover`
                : `linear-gradient(135deg, ${accentColor}, var(--accent))`,
            }}
          >
            {!profileData?.banner && (
              <motion.div
                className="absolute inset-0"
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 2px, transparent 2px),
                                   radial-gradient(circle at 80% 30%, rgba(255,255,255,0.15) 2px, transparent 2px)`,
                  backgroundSize: '60px 60px',
                }}
              />
            )}
          </div>

          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2"
          >
            <div
              className="w-28 h-28 rounded-3xl overflow-hidden"
              style={{
                boxShadow: `0 0 0 4px var(--background), 0 0 30px ${accentColor}40`,
                background: 'var(--background-secondary)',
              }}
            >
              {profileData?.avatar ? (
                <img src={profileData.avatar} alt={profile.user.name || username} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, var(--accent))`, color: 'white' }}
                >
                  {(profile.user.name?.[0] || username?.[0] || 'U').toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Premium/Verified Badge */}
            {(isPremium || isVerified) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full"
                style={{ background: 'var(--background)' }}
              >
                {isPremium ? (
                  <Crown size={18} style={{ color: '#fbbf24' }} />
                ) : (
                  <BadgeCheck size={18} fill={accentColor} style={{ color: 'white' }} />
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            {profile.user.name || profile.user.username}
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
            @{profile.user.username}
            {profileData?.pronouns && ` · ${profileData.pronouns}`}
          </p>

          {/* Bio */}
          {profileData?.bio && (
            <p className="text-sm leading-relaxed max-w-sm mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }}>
              {profileData.bio}
            </p>
          )}

          {/* Location & Website */}
          <div className="flex items-center justify-center gap-4 text-sm flex-wrap mb-6">
            {profileData?.location && (
              <span className="flex items-center gap-1" style={{ color: 'var(--foreground-muted)' }}>
                <MapPin size={14} />
                {profileData.location}
              </span>
            )}
            {profileData?.website && (
              <a
                href={profileData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:underline"
                style={{ color: accentColor }}
              >
                <Globe size={14} />
                {profileData.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Eye size={14} style={{ color: accentColor }} />
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  {(profile.stats?.profileViews || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>views</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <MousePointerClick size={14} style={{ color: accentColor }} />
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  {(profile.stats?.totalLinkClicks || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>clicks</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Users size={14} style={{ color: accentColor }} />
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  {(profile.stats?.followers || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>followers</span>
            </div>
          </div>
        </motion.div>

        {/* Social Links */}
        {profileData?.socials && Object.keys(profileData.socials).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-3 mb-8"
          >
            {Object.entries(profileData.socials).map(([platform, url]) => {
              const Icon = socialIconMap[platform.toLowerCase()] || Globe
              return (
                <motion.a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl transition-all"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                </motion.a>
              )
            })}
          </motion.div>
        )}

        {/* Links */}
        <div className="space-y-3 mb-12">
          <AnimatePresence>
            {profile.links && profile.links.length > 0 ? (
              profile.links.map((link, index) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => handleLinkClick(link.id, link.url)}
                  disabled={clickedLink === link.id}
                  className="w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group"
                  style={{
                    background: link.backgroundColor || 'var(--card)',
                    border: `1px solid ${link.backgroundColor ? 'transparent' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {link.icon && (
                        <span className="text-xl shrink-0">{link.icon}</span>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: link.textColor || 'var(--foreground)' }}>
                          {link.title}
                        </p>
                        {link.description && (
                          <p className="text-sm truncate" style={{ color: link.textColor ? `${link.textColor}99` : 'var(--foreground-muted)' }}>
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <motion.div
                      className="shrink-0 ml-3"
                      animate={{ x: clickedLink === link.id ? 0 : [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {clickedLink === link.id ? (
                        <Loader2 size={18} className="animate-spin" style={{ color: link.textColor || 'var(--foreground-muted)' }} />
                      ) : (
                        <ExternalLink size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: link.textColor || 'var(--foreground-muted)' }} />
                      )}
                    </motion.div>
                  </div>
                </motion.button>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-12 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
                <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>No links yet</p>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  This creator hasn't added any links
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Eziox Branding Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pb-8"
        >
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
            style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
          >
            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            Create your own Eziox page
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
