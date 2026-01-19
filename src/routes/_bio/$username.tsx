import { createFileRoute, Link, notFound, useRouterState } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPublicProfileFn, trackProfileViewFn } from '@/server/functions/users'
import { trackLinkClickFn } from '@/server/functions/links'
import { isFollowingFn, followUserFn, unfollowUserFn } from '@/server/functions/follows'
import {
  User,
  Eye,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  MapPin,
  Globe,
  Sparkles,
  MousePointerClick,
  Share2,
  Check,
  UserPlus,
  UserMinus,
  Heart,
} from 'lucide-react'
import { BadgeDisplay } from '@/components/ui/BadgeDisplay'
import {
  SiX,
  SiGithub,
  SiLinkedin,
  SiInstagram,
  SiYoutube,
  SiDiscord,
  SiTiktok,
  SiTwitch,
} from 'react-icons/si'
import type { ComponentType } from 'react'
import { FollowModal } from '@/components/bio/FollowModal'
import { getSocialUrl } from '@/lib/social-links'
import { SpotifyWidget } from '@/components/spotify'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import { checkSpotifyConnectionFn } from '@/server/functions/spotify'
import type { TierType } from '@/server/lib/stripe'
import type { CustomBackground, LayoutSettings, AnimatedProfileSettings, CustomFont } from '@/server/db/schema'

const socialIconMap: Record<string, ComponentType<{ size?: number }>> = {
  twitter: SiX,
  github: SiGithub,
  linkedin: SiLinkedin,
  instagram: SiInstagram,
  youtube: SiYoutube,
  discord: SiDiscord,
  tiktok: SiTiktok,
  twitch: SiTwitch,
}

interface SpotifyConnectionStatus {
  connected: boolean
  showOnProfile: boolean
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
    // Prevent reserved paths from being treated as usernames
    if (RESERVED_PATHS.includes(params.username.toLowerCase())) {
      throw notFound()
    }
  },
  loader: async ({ params }) => {
    const getProfile = getPublicProfileFn
    try {
      const profile = await getProfile({ data: { username: params.username } })
      return { profile }
    } catch {
      throw notFound()
    }
  },
  head: ({ loaderData }) => {
    const profile = loaderData?.profile
    if (!profile || !profile.profile || 'isPublic' in profile.profile && !profile.profile.isPublic) return {}

    const displayName = profile.user.name || profile.user.username
    const title = `${displayName} (@${profile.user.username}) | Eziox`
    const bio = 'bio' in profile.profile ? profile.profile.bio : null
    const description = bio || `Check out ${displayName}'s bio page on Eziox`
    const avatarUrl = 'avatar' in profile.profile ? profile.profile.avatar : null

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'profile' },
        { property: 'og:url', content: `https://eziox.link/${profile.user.username}` },
        ...(avatarUrl ? [{ property: 'og:image', content: avatarUrl }] : []),
        { name: 'twitter:card', content: avatarUrl ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        ...(avatarUrl ? [{ name: 'twitter:image', content: avatarUrl }] : []),
      ],
    }
  },
  component: BioPage,
})

function BioPage() {
  const params = Route.useParams()
  const username = params.username as string
  const queryClient = useQueryClient()
  const { theme } = useTheme()
  
  // Get currentUser from parent layout loader via router state
  const routerState = useRouterState()
  const bioMatch = routerState.matches.find((m: { routeId: string }) => m.routeId === '/_bio')
  const currentUser = (bioMatch?.loaderData as { currentUser?: { id: string; username: string } } | undefined)?.currentUser

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'followers' | 'following'>('followers')

  const getProfile = useServerFn(getPublicProfileFn)
  const trackClick = useServerFn(trackLinkClickFn)
  const trackView = useServerFn(trackProfileViewFn)
  const checkFollowing = useServerFn(isFollowingFn)
  const followUser = useServerFn(followUserFn)
  const unfollowUser = useServerFn(unfollowUserFn)
  const checkSpotifyConnection = useServerFn(checkSpotifyConnectionFn)

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => getProfile({ data: { username } }),
  })

  const { data: spotifyStatus } = useQuery<SpotifyConnectionStatus>({
    queryKey: ['spotifyConnection', profile?.user?.id],
    queryFn: () => checkSpotifyConnection({ data: { userId: profile!.user.id } }),
    enabled: !!profile?.user?.id,
  })

  // Determine follow status based on currentUser from SSR
  const isSelf = currentUser?.id === profile?.user?.id
  const isAuthenticated = !!currentUser

  // Check if current user is following this profile
  const { data: followStatus } = useQuery({
    queryKey: ['followStatus', profile?.user?.id, currentUser?.id],
    queryFn: () => checkFollowing({ data: { targetUserId: profile!.user.id } }),
    enabled: !!profile?.user?.id && isAuthenticated && !isSelf,
  })

  const [clickedLink, setClickedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [followerCount, setFollowerCount] = useState<number | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  // Sync follow status from query
  useEffect(() => {
    if (followStatus) {
      setIsFollowing(followStatus.isFollowing)
    }
  }, [followStatus])

  // Sync follower count from profile
  useEffect(() => {
    if (profile?.stats?.followers !== undefined) {
      setFollowerCount(profile.stats.followers)
    }
  }, [profile?.stats?.followers])

  // Track profile view once per session
  useEffect(() => {
    if (!profile?.user?.id) return

    const sessionKey = `viewed_${profile.user.id}`
    const hasViewed = sessionStorage.getItem(sessionKey)

    if (!hasViewed) {
      let sessionId = sessionStorage.getItem('eziox_session_id')
      if (!sessionId) {
        sessionId = `${Date.now()}_${Math.random().toString(36).substring(2)}`
        sessionStorage.setItem('eziox_session_id', sessionId)
      }

      trackView({ data: { userId: profile.user.id, sessionId } })
        .then(() => {
          sessionStorage.setItem(sessionKey, 'true')
        })
        .catch(console.error)
    }
  }, [profile?.user?.id, trackView])

  // Handle follow/unfollow with optimistic updates
  const handleFollowToggle = async () => {
    if (!profile?.user?.id || !isAuthenticated || isSelf) return
    
    setIsFollowLoading(true)
    const wasFollowing = isFollowing

    // Optimistic update
    setIsFollowing(!wasFollowing)
    setFollowerCount(prev => (prev ?? 0) + (wasFollowing ? -1 : 1))

    try {
      const result = wasFollowing
        ? await unfollowUser({ data: { targetUserId: profile.user.id } })
        : await followUser({ data: { targetUserId: profile.user.id } })

      if (result.success) {
        // Update with real count from server
        setFollowerCount(result.newFollowerCount)
        setIsFollowing(result.isFollowing)
        // Invalidate queries to refresh data
        void queryClient.invalidateQueries({ queryKey: ['followStatus', profile.user.id] })
        void queryClient.invalidateQueries({ queryKey: ['publicProfile', username] })
      } else {
        // Revert on error
        setIsFollowing(wasFollowing)
        setFollowerCount(prev => (prev ?? 0) + (wasFollowing ? 1 : -1))
      }
    } catch {
      // Revert on error
      setIsFollowing(wasFollowing)
      setFollowerCount(prev => (prev ?? 0) + (wasFollowing ? 1 : -1))
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleLinkClick = (linkId: string, url: string) => {
    setClickedLink(linkId)
    trackClick({ data: { linkId } }).catch(console.error)
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
  
  // Customization settings
  const customBackground = profileData?.customBackground as CustomBackground | null
  const layoutSettings = profileData?.layoutSettings as LayoutSettings | null
  const customCSS = profileData?.customCSS as string | null
  const animatedProfile = profileData?.animatedProfile as AnimatedProfileSettings | null
  const customFonts = profileData?.customFonts as CustomFont[] | null
  
  // Get layout values with defaults
  const cardSpacing = layoutSettings?.cardSpacing ?? 12
  const cardBorderRadius = layoutSettings?.cardBorderRadius ?? 16
  const cardPadding = layoutSettings?.cardPadding ?? 16
  const cardShadow = layoutSettings?.cardShadow ?? 'md'
  const linkStyle = layoutSettings?.linkStyle ?? 'default'
  
  // Shadow map
  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.15)',
    xl: '0 20px 25px rgba(0,0,0,0.2)',
  }
  
  // Animation classes based on settings
  const getAvatarAnimation = () => {
    if (!animatedProfile?.enabled) return {}
    switch (animatedProfile.avatarAnimation) {
      case 'pulse': return { animate: { scale: [1, 1.05, 1] }, transition: { duration: 2, repeat: Infinity } }
      case 'glow': return { animate: { boxShadow: [`0 0 20px ${accentColor}40`, `0 0 40px ${accentColor}60`, `0 0 20px ${accentColor}40`] }, transition: { duration: 2, repeat: Infinity } }
      case 'bounce': return { animate: { y: [0, -5, 0] }, transition: { duration: 1.5, repeat: Infinity } }
      case 'rotate': return { animate: { rotate: [0, 5, -5, 0] }, transition: { duration: 3, repeat: Infinity } }
      case 'shake': return { animate: { x: [0, -2, 2, -2, 0] }, transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 } }
      default: return {}
    }
  }
  
  const getLinkHoverEffect = () => {
    if (!animatedProfile?.enabled) return { scale: 1.02, y: -2 }
    switch (animatedProfile.linkHoverEffect) {
      case 'scale': return { scale: 1.05 }
      case 'glow': return { scale: 1.02, boxShadow: `0 0 30px ${accentColor}40` }
      case 'slide': return { x: 5 }
      case 'shake': return { x: [0, -2, 2, -2, 0] }
      case 'flip': return { rotateY: 5 }
      default: return { scale: 1.02, y: -2 }
    }
  }
  
  // Link style variants
  const getLinkStyle = () => {
    switch (linkStyle) {
      case 'minimal': return { background: 'transparent', border: `1px solid ${accentColor}30` }
      case 'bold': return { background: `${accentColor}20`, border: 'none' }
      case 'glass': return { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }
      default: return { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }
    }
  }
  
  // Background style
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!customBackground) return { background: 'var(--background)' }
    switch (customBackground.type) {
      case 'solid': return { background: customBackground.value || 'var(--background)' }
      case 'gradient': return { background: customBackground.value || 'var(--background)' }
      case 'image': return {
        background: `url(${customBackground.imageUrl}) center/cover fixed`,
        ...(customBackground.imageBlur ? { filter: `blur(${customBackground.imageBlur}px)` } : {}),
      }
      default: return { background: 'var(--background)' }
    }
  }

  return (
    <div className="min-h-screen relative" style={getBackgroundStyle()}>
      {/* Custom CSS injection */}
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}
      
      {/* Custom Fonts */}
      {customFonts && customFonts.length > 0 && (
        <>
          {customFonts.map(font => (
            <link key={font.id} rel="stylesheet" href={font.url} />
          ))}
          <style dangerouslySetInnerHTML={{ __html: customFonts.map(font => 
            font.type === 'display' 
              ? `h1, h2, h3, .display-font { font-family: '${font.name}', sans-serif !important; }`
              : `body, p, span, .body-font { font-family: '${font.name}', sans-serif !important; }`
          ).join('\n') }} />
        </>
      )}
      
      {/* Image background overlay for opacity */}
      {customBackground?.type === 'image' && customBackground.imageOpacity !== undefined && customBackground.imageOpacity < 1 && (
        <div 
          className="fixed inset-0 pointer-events-none" 
          style={{ background: `rgba(0,0,0,${1 - customBackground.imageOpacity})` }} 
        />
      )}
      
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
            <motion.div
              className="w-28 h-28 overflow-hidden"
              style={{
                borderRadius: cardBorderRadius,
                boxShadow: `0 0 0 4px var(--background), 0 0 30px ${accentColor}40`,
                background: 'var(--background-secondary)',
              }}
              {...getAvatarAnimation()}
            >
              {profileData?.avatar ? (
                <img src={profileData.avatar} alt={profile.user.name || username} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl font-bold display-font"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, var(--accent))`, color: 'white' }}
                >
                  {(profile.user.name?.[0] || username?.[0] || 'U').toUpperCase()}
                </div>
              )}
            </motion.div>
            
          </motion.div>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              {profile.user.name || profile.user.username}
            </h1>
            {profileData?.badges && profileData.badges.length > 0 && (
              <BadgeDisplay badges={profileData.badges as string[]} size="md" maxDisplay={3} />
            )}
          </div>
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
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
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
            <button
              onClick={() => {
                setModalTab('followers')
                setIsModalOpen(true)
              }}
              className="text-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Heart size={14} style={{ color: accentColor }} />
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  {(followerCount ?? profile.stats?.followers ?? 0).toLocaleString()}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>followers</span>
            </button>
            <button
              onClick={() => {
                setModalTab('following')
                setIsModalOpen(true)
              }}
              className="text-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <UserPlus size={14} style={{ color: accentColor }} />
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  {(profile.stats?.following || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>following</span>
            </button>
          </div>

          {/* Follow Button - for authenticated users viewing other profiles */}
          {isAuthenticated && !isSelf && (
            <motion.button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all mx-auto"
              style={{
                background: isFollowing 
                  ? 'var(--background-secondary)' 
                  : `linear-gradient(135deg, ${accentColor}, var(--accent))`,
                color: isFollowing ? 'var(--foreground)' : 'white',
                border: isFollowing ? '1px solid var(--border)' : 'none',
                boxShadow: isFollowing ? 'none' : `0 4px 20px ${accentColor}40`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isFollowLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus size={18} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Follow
                </>
              )}
            </motion.button>
          )}

          {/* Sign in prompt for non-authenticated users */}
          {!isAuthenticated && !isSelf && (
            <Link
              to="/sign-in"
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all mx-auto hover:scale-102"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
                color: 'white',
                boxShadow: `0 4px 20px ${accentColor}40`,
              }}
            >
              <UserPlus size={18} />
              Sign in to Follow
            </Link>
          )}
        </motion.div>

        {/* Social Links */}
        {profileData?.socials && Object.keys(profileData.socials).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-3 mb-8"
          >
            {Object.entries(profileData.socials).map(([platform, username]) => {
              const Icon = socialIconMap[platform.toLowerCase()] || Globe
              const socialUrl = getSocialUrl(platform, username as string)
              return (
                <motion.a
                  key={platform}
                  href={socialUrl}
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

        {/* Spotify Now Playing */}
        {spotifyStatus?.connected && spotifyStatus.showOnProfile && profile?.user?.id && (
          <div className="mb-8">
            <SpotifyWidget userId={profile.user.id} theme={theme} />
          </div>
        )}

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${cardSpacing}px` }} className="mb-12">
          <AnimatePresence>
            {profile.links && profile.links.length > 0 ? (
              profile.links.map((link, index) => {
                const isFeatured = link.isFeatured
                const featuredStyle = link.featuredStyle || 'default'
                
                // Featured link styles
                const getFeaturedBorder = () => {
                  if (!isFeatured) return {}
                  switch (featuredStyle) {
                    case 'glow': return { boxShadow: `0 0 20px ${accentColor}60` }
                    case 'gradient': return { background: `linear-gradient(135deg, ${accentColor}40, var(--accent)40)` }
                    case 'outline': return { border: `2px dashed ${accentColor}` }
                    case 'neon': return { boxShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}60, 0 0 30px ${accentColor}40` }
                    default: return { border: `2px solid ${accentColor}` }
                  }
                }
                
                return (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ 
                    delay: 0.3 + index * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                  onClick={() => handleLinkClick(link.id, link.url)}
                  disabled={clickedLink === link.id}
                  className="w-full text-left transition-all disabled:opacity-50 group relative overflow-hidden"
                  style={{
                    padding: cardPadding,
                    borderRadius: cardBorderRadius,
                    boxShadow: shadowMap[cardShadow],
                    ...getLinkStyle(),
                    ...(link.backgroundColor ? { background: link.backgroundColor, border: 'none' } : {}),
                    ...getFeaturedBorder(),
                  }}
                  whileHover={getLinkHoverEffect()}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}10, transparent)`,
                    }}
                  />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {link.icon && (
                        <motion.span 
                          className="text-2xl shrink-0"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                        >
                          {link.icon}
                        </motion.span>
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
                      animate={{ 
                        x: clickedLink === link.id ? 0 : [0, 4, 0],
                        rotate: clickedLink === link.id ? 0 : [0, 5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {clickedLink === link.id ? (
                        <Loader2 size={18} className="animate-spin" style={{ color: link.textColor || accentColor }} />
                      ) : (
                        <ExternalLink size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: link.textColor || accentColor }} />
                      )}
                    </motion.div>
                  </div>
                </motion.button>
              )})
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-16 rounded-2xl"
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--foreground-muted)' }} />
                <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>No links yet</p>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  This creator hasn't added any links
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(() => {
          const userTier = (profile.user.tier || 'free') as TierType
          const showBranding = !['pro', 'creator', 'lifetime'].includes(userTier)
          
          if (!showBranding) return null
          
          return (
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
          )
        })()}
      </div>

      {/* Follow Modal */}
      {profile?.user?.id && (
        <FollowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          username={username}
          userId={profile.user.id}
          initialTab={modalTab}
          currentUserId={currentUser?.id}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}
