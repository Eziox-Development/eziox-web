import {
  createFileRoute,
  Link,
  notFound,
  useRouterState,
} from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  getPublicProfileFn,
  trackProfileViewFn,
} from '@/server/functions/users'
import { trackLinkClickFn } from '@/server/functions/links'
import {
  isFollowingFn,
  followUserFn,
  unfollowUserFn,
} from '@/server/functions/follows'
import {
  User,
  Eye,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  MapPin,
  Globe,
  Sparkles,
  Share2,
  Check,
  UserPlus,
  UserMinus,
  Heart,
  Calendar,
  MousePointerClick,
} from 'lucide-react'
import { BadgeDisplay } from '@/components/ui/badge-display'
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
import { useTheme } from '@/components/layout/ThemeProvider'
import { checkSpotifyConnectionFn } from '@/server/functions/spotify'
import type { TierType } from '@/server/lib/stripe'
import type {
  CustomBackground,
  LayoutSettings,
  AnimatedProfileSettings,
  CustomFont,
} from '@/server/db/schema'
import {
  AnimatedBackground,
  VideoBackground,
} from '@/components/backgrounds/AnimatedBackgrounds'
import { sanitizeCSS, sanitizeFontURL, escapeHTML } from '@/lib/security'

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
    if (
      !profile ||
      !profile.profile ||
      ('isPublic' in profile.profile && !profile.profile.isPublic)
    )
      return {}

    const displayName = profile.user.name || profile.user.username
    const title = `${displayName} (@${profile.user.username}) | Eziox`
    const bio = 'bio' in profile.profile ? profile.profile.bio : null
    const description = bio || `Check out ${displayName}'s bio page on Eziox`
    const avatarUrl =
      'avatar' in profile.profile ? profile.profile.avatar : null

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'profile' },
        {
          property: 'og:url',
          content: `https://eziox.link/${profile.user.username}`,
        },
        ...(avatarUrl ? [{ property: 'og:image', content: avatarUrl }] : []),
        {
          name: 'twitter:card',
          content: avatarUrl ? 'summary_large_image' : 'summary',
        },
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
  const bioMatch = routerState.matches.find(
    (m: { routeId: string }) => m.routeId === '/_bio',
  )
  const currentUser = (
    bioMatch?.loaderData as
      | { currentUser?: { id: string; username: string } }
      | undefined
  )?.currentUser

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'followers' | 'following'>(
    'followers',
  )

  const getProfile = useServerFn(getPublicProfileFn)
  const trackClick = useServerFn(trackLinkClickFn)
  const trackView = useServerFn(trackProfileViewFn)
  const checkFollowing = useServerFn(isFollowingFn)
  const followUser = useServerFn(followUserFn)
  const unfollowUser = useServerFn(unfollowUserFn)
  const checkSpotifyConnection = useServerFn(checkSpotifyConnectionFn)

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => getProfile({ data: { username } }),
  })

  const { data: spotifyStatus } = useQuery<SpotifyConnectionStatus>({
    queryKey: ['spotifyConnection', profile?.user?.id],
    queryFn: () =>
      checkSpotifyConnection({ data: { userId: profile!.user.id } }),
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
    setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? -1 : 1))

    try {
      const result = wasFollowing
        ? await unfollowUser({ data: { targetUserId: profile.user.id } })
        : await followUser({ data: { targetUserId: profile.user.id } })

      if (result.success) {
        // Update with real count from server
        setFollowerCount(result.newFollowerCount)
        setIsFollowing(result.isFollowing)
        // Invalidate queries to refresh data
        void queryClient.invalidateQueries({
          queryKey: ['followStatus', profile.user.id],
        })
        void queryClient.invalidateQueries({
          queryKey: ['publicProfile', username],
        })
      } else {
        // Revert on error
        setIsFollowing(wasFollowing)
        setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? 1 : -1))
      }
    } catch {
      // Revert on error
      setIsFollowing(wasFollowing)
      setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? 1 : -1))
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleLinkClick = (linkId: string, url: string) => {
    setClickedLink(linkId)
    trackClick({
      data: {
        linkId,
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
      },
    }).catch(console.error)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => setClickedLink(null), 500)
  }

  const handleShare = async () => {
    const url = `https://eziox.link/${username}`
    if (navigator.share) {
      await navigator.share({
        title: `${profile?.user.name || username}'s Bio`,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2
            className="w-10 h-10 animate-spin mx-auto mb-4"
            style={{ color: 'var(--primary)' }}
          />
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Loading bio...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--background)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'var(--background-secondary)' }}
          >
            <User
              className="w-12 h-12"
              style={{ color: 'var(--foreground-muted)' }}
            />
          </div>
          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            @{username}
          </h1>
          <p
            className="text-lg mb-8"
            style={{ color: 'var(--foreground-muted)' }}
          >
            This bio page doesn't exist yet.
          </p>
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white',
            }}
          >
            <Sparkles size={18} />
            Claim this username
          </Link>
        </motion.div>
      </div>
    )
  }

  const profileData =
    profile.profile && 'bio' in profile.profile ? profile.profile : null
  const accentColor = 'var(--primary)'

  // Customization settings
  const customBackground =
    profileData?.customBackground as CustomBackground | null
  const layoutSettings = profileData?.layoutSettings as LayoutSettings | null
  const customCSS = profileData?.customCSS as string | null
  const animatedProfile =
    profileData?.animatedProfile as AnimatedProfileSettings | null
  const customFonts = profileData?.customFonts as CustomFont[] | null

  // Animation classes based on settings
  const getAvatarAnimation = () => {
    if (!animatedProfile?.enabled) return {}
    switch (animatedProfile.avatarAnimation) {
      case 'pulse':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity },
        }
      case 'glow':
        return {
          animate: {
            boxShadow: [
              `0 0 20px ${accentColor}40`,
              `0 0 40px ${accentColor}60`,
              `0 0 20px ${accentColor}40`,
            ],
          },
          transition: { duration: 2, repeat: Infinity },
        }
      case 'bounce':
        return {
          animate: { y: [0, -5, 0] },
          transition: { duration: 1.5, repeat: Infinity },
        }
      case 'rotate':
        return {
          animate: { rotate: [0, 5, -5, 0] },
          transition: { duration: 3, repeat: Infinity },
        }
      case 'shake':
        return {
          animate: { x: [0, -2, 2, -2, 0] },
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 },
        }
      default:
        return {}
    }
  }

  // Background style
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!customBackground) return { background: 'var(--background)' }
    switch (customBackground.type) {
      case 'solid':
        return { background: customBackground.value || 'var(--background)' }
      case 'gradient':
        return { background: customBackground.value || 'var(--background)' }
      case 'image':
        return {
          background: `url(${customBackground.imageUrl}) center/cover fixed`,
          ...(customBackground.imageBlur
            ? { filter: `blur(${customBackground.imageBlur}px)` }
            : {}),
        }
      case 'video':
        return { background: 'var(--background)' }
      case 'animated':
        return { background: 'var(--background)' }
      default:
        return { background: 'var(--background)' }
    }
  }

  const renderAnimatedBackground = () => {
    if (!customBackground) return null

    if (customBackground.type === 'video' && customBackground.videoUrl) {
      return (
        <VideoBackground
          url={customBackground.videoUrl}
          loop={customBackground.videoLoop ?? true}
          muted={customBackground.videoMuted ?? true}
        />
      )
    }

    if (
      customBackground.type === 'animated' &&
      customBackground.animatedPreset
    ) {
      return (
        <AnimatedBackground
          preset={customBackground.animatedPreset}
          speed={customBackground.animatedSpeed}
          intensity={customBackground.animatedIntensity}
          colors={customBackground.animatedColors}
        />
      )
    }

    return null
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={getBackgroundStyle()}
    >
      {/* Animated Background Layer - z-index 1 */}
      <div className="fixed inset-0 z-1">{renderAnimatedBackground()}</div>

      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(customCSS) }} />
      )}

      {customFonts && customFonts.length > 0 && (
        <>
          {customFonts.map((font) => {
            const safeUrl = sanitizeFontURL(font.url)
            return safeUrl ? (
              <link key={font.id} rel="stylesheet" href={safeUrl} />
            ) : null
          })}
          <style
            dangerouslySetInnerHTML={{
              __html: customFonts
                .map((font) => {
                  const safeName = escapeHTML(font.name).replace(/['"\\]/g, '')
                  return font.type === 'display'
                    ? `h1, h2, h3, .display-font { font-family: '${safeName}', sans-serif !important; }`
                    : `body, p, span, .body-font { font-family: '${safeName}', sans-serif !important; }`
                })
                .join('\n'),
            }}
          />
        </>
      )}

      {/* Dark overlay for readability on light/image backgrounds */}
      {(customBackground?.type === 'image' ||
        customBackground?.type === 'video') && (
        <div
          className="fixed inset-0 pointer-events-none z-1"
          style={{
            background:
              customBackground.imageOpacity !== undefined
                ? `rgba(0,0,0,${1 - customBackground.imageOpacity})`
                : 'rgba(0,0,0,0.4)',
          }}
        />
      )}

      {/* Decorative blobs - only show when no animated/video background */}
      {(!customBackground ||
        (customBackground.type !== 'animated' &&
          customBackground.type !== 'video')) && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Card with Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden mb-4"
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Banner */}
          {profileData?.banner ? (
            <div
              className="w-full h-28 sm:h-36 relative"
              style={{
                borderTopLeftRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
                borderTopRightRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
              }}
            >
              <img
                src={profileData.banner}
                alt="Banner"
                className="w-full h-full object-cover"
                style={{
                  borderTopLeftRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
                  borderTopRightRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
                }}
              />
              <div
                className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
                style={{
                  borderTopLeftRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
                  borderTopRightRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
                }}
              />
            </div>
          ) : (
            <div
              className="w-full h-20 sm:h-24"
              style={{
                background: `linear-gradient(135deg, ${accentColor}30, var(--accent)20)`,
                borderTopLeftRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
                borderTopRightRadius: `${layoutSettings?.cardBorderRadius ?? 20}px`,
              }}
            />
          )}

          {/* Profile Content */}
          <div
            className="relative"
            style={{
              padding: `${layoutSettings?.cardPadding ?? 20}px`,
              paddingTop: profileData?.banner
                ? '16px'
                : `${layoutSettings?.cardPadding ?? 20}px`,
            }}
          >
            {/* Avatar Row */}
            <div
              className="flex items-start gap-4"
              style={{ marginTop: profileData?.banner ? '-56px' : '0' }}
            >
              {/* Avatar - positioned to overlap banner */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="relative shrink-0"
              >
                <motion.div
                  className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden"
                  style={{
                    borderRadius: `${(layoutSettings?.cardBorderRadius ?? 20) - 4}px`,
                    boxShadow:
                      '0 0 0 3px rgba(0,0,0,0.5), 0 0 0 5px rgba(255,255,255,0.15), 0 8px 20px rgba(0,0,0,0.3)',
                    background: 'var(--background-secondary)',
                  }}
                  {...getAvatarAnimation()}
                >
                  {profileData?.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt={profile.user.name || username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold display-font"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
                        color: 'white',
                      }}
                    >
                      {(
                        profile.user.name?.[0] ||
                        username?.[0] ||
                        'U'
                      ).toUpperCase()}
                    </div>
                  )}
                </motion.div>
              </motion.div>

              {/* Name & Badges - Next to Avatar */}
              <div className="flex-1 min-w-0 pt-8 sm:pt-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <motion.h1
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xl sm:text-2xl font-bold tracking-tight"
                    style={{
                      color: '#ffffff',
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {profile.user.name || profile.user.username}
                  </motion.h1>
                  {profileData?.badges && profileData.badges.length > 0 && (
                    <BadgeDisplay
                      badges={profileData.badges as string[]}
                      size="md"
                      maxDisplay={3}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Bio - Below Avatar Row */}
            {profileData?.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="text-sm italic mt-4 line-clamp-2"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                "{profileData.bio}"
              </motion.p>
            )}

            {/* Social Icons Row - Below Bio */}
            {profileData?.socials &&
              Object.keys(profileData.socials).length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 flex-wrap mt-3"
                >
                  {Object.entries(profileData.socials).map(
                    ([platform, socialUsername]) => {
                      const Icon =
                        socialIconMap[platform.toLowerCase()] || Globe
                      const socialUrl = getSocialUrl(
                        platform,
                        socialUsername as string,
                      )
                      return (
                        <motion.a
                          key={platform}
                          href={socialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255, 255, 255, 0.9)',
                          }}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 17,
                          }}
                        >
                          <Icon size={18} />
                        </motion.a>
                      )
                    },
                  )}
                  {/* Share Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleShare}
                    className="p-2 rounded-lg ml-2 hover:bg-white/15 transition-colors duration-100"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    {copied ? (
                      <Check size={18} style={{ color: '#22c55e' }} />
                    ) : (
                      <Share2 size={18} />
                    )}
                  </motion.button>
                </motion.div>
              )}

            {/* Stats Row - All stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 sm:gap-4 mt-4 pt-4 flex-wrap"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              {/* Views */}
              <div className="flex items-center gap-1.5">
                <Eye size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: '#ffffff' }}
                >
                  {(profile.stats?.profileViews || 0).toLocaleString()}
                </span>
              </div>

              {/* Location */}
              {profileData?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin
                    size={14}
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {profileData.location}
                  </span>
                </div>
              )}

              {/* Followers */}
              <button
                onClick={() => {
                  setModalTab('followers')
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity duration-100 cursor-pointer"
              >
                <Heart
                  size={14}
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: '#ffffff' }}
                >
                  {(
                    followerCount ??
                    profile.stats?.followers ??
                    0
                  ).toLocaleString()}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  followers
                </span>
              </button>

              {/* Following */}
              <button
                onClick={() => {
                  setModalTab('following')
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity duration-100 cursor-pointer"
              >
                <UserPlus
                  size={14}
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: '#ffffff' }}
                >
                  {(profile.stats?.following || 0).toLocaleString()}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  following
                </span>
              </button>

              {/* Clicks */}
              <div className="flex items-center gap-1.5">
                <MousePointerClick
                  size={14}
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: '#ffffff' }}
                >
                  {(profile.stats?.totalLinkClicks || 0).toLocaleString()}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  clicks
                </span>
              </div>
            </motion.div>

            {/* Website & Pronouns Row */}
            {(profileData?.website || profileData?.pronouns) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 mt-3 flex-wrap"
              >
                {profileData?.pronouns && (
                  <span
                    className="text-xs px-2 py-1 rounded-md"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {profileData.pronouns}
                  </span>
                )}
                {profileData?.website && (
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm hover:underline transition-all duration-100"
                    style={{ color: accentColor }}
                  >
                    <Globe size={12} />
                    {profileData.website
                      .replace(/^https?:\/\//, '')
                      .replace(/\/$/, '')}
                  </a>
                )}
                {profile.user.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar
                      size={12}
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      Joined{' '}
                      {new Date(profile.user.createdAt).toLocaleDateString(
                        'en-US',
                        { month: 'short', year: 'numeric' },
                      )}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Follow Button Card */}
        {isAuthenticated && !isSelf && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <motion.button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold"
              style={{
                borderRadius: `${layoutSettings?.cardBorderRadius ?? 16}px`,
                background: isFollowing
                  ? 'rgba(0, 0, 0, 0.4)'
                  : `linear-gradient(135deg, ${accentColor}, var(--accent))`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: isFollowing ? 'rgba(255, 255, 255, 0.9)' : 'white',
                border: isFollowing
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : 'none',
                boxShadow: isFollowing ? 'none' : `0 8px 24px ${accentColor}30`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {isFollowLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus size={20} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Follow
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Sign in prompt */}
        {!isAuthenticated && !isSelf && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Link
              to="/sign-in"
              className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold transition-all duration-100 hover:scale-[1.02]"
              style={{
                borderRadius: `${layoutSettings?.cardBorderRadius ?? 16}px`,
                background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
                color: 'white',
                boxShadow: `0 8px 24px ${accentColor}30`,
              }}
            >
              <UserPlus size={20} />
              Sign in to Follow
            </Link>
          </motion.div>
        )}

        {/* Spotify Now Playing */}
        {spotifyStatus?.connected &&
          spotifyStatus.showOnProfile &&
          profile?.user?.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <SpotifyWidget userId={profile.user.id} theme={theme} />
            </motion.div>
          )}

        {/* Links - Modern Card Style */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${layoutSettings?.cardSpacing ?? 12}px`,
          }}
          className="mb-6"
        >
          <AnimatePresence>
            {profile.links && profile.links.length > 0 ? (
              profile.links.map((link) => {
                const isFeatured = link.isFeatured
                const featuredStyle = link.featuredStyle || 'default'
                const linkBorderRadius = layoutSettings?.cardBorderRadius ?? 16

                // Featured link styles
                const getFeaturedBorder = () => {
                  if (!isFeatured) return {}
                  switch (featuredStyle) {
                    case 'glow':
                      return { boxShadow: `0 0 20px ${accentColor}40` }
                    case 'gradient':
                      return {
                        background: `linear-gradient(135deg, ${accentColor}20, var(--accent)20)`,
                      }
                    case 'outline':
                      return { border: `2px dashed ${accentColor}60` }
                    case 'neon':
                      return {
                        boxShadow: `0 0 10px ${accentColor}80, 0 0 20px ${accentColor}40`,
                      }
                    default:
                      return { border: `1px solid ${accentColor}40` }
                  }
                }

                // Detect link type for badge
                const getLinkBadge = () => {
                  const url = link.url.toLowerCase()
                  if (url.includes('discord.gg') || url.includes('discord.com'))
                    return { label: 'Discord', color: '#5865F2' }
                  if (url.includes('github.com'))
                    return { label: 'GitHub', color: '#333' }
                  if (url.includes('twitter.com') || url.includes('x.com'))
                    return { label: 'X', color: '#000' }
                  if (url.includes('youtube.com') || url.includes('youtu.be'))
                    return { label: 'YouTube', color: '#FF0000' }
                  if (url.includes('twitch.tv'))
                    return { label: 'Twitch', color: '#9146FF' }
                  if (url.includes('instagram.com'))
                    return { label: 'Instagram', color: '#E4405F' }
                  if (url.includes('tiktok.com'))
                    return { label: 'TikTok', color: '#000' }
                  if (url.includes('spotify.com'))
                    return { label: 'Audio', color: '#1DB954' }
                  if (url.includes('soundcloud.com'))
                    return { label: 'Audio', color: '#FF5500' }
                  return null
                }

                const badge = getLinkBadge()

                // Get link style based on layoutSettings from Playground
                const getLinkStyle = () => {
                  switch (layoutSettings?.linkStyle) {
                    case 'minimal':
                      return {
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }
                    case 'bold':
                      return {
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: 'none',
                      }
                    case 'glass':
                      return {
                        background: 'rgba(255, 255, 255, 0.06)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }
                    default:
                      return {
                        background: 'rgba(30, 30, 35, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }
                  }
                }

                // Get shadow based on layoutSettings
                const getLinkShadow = () => {
                  switch (layoutSettings?.cardShadow) {
                    case 'none':
                      return 'none'
                    case 'sm':
                      return '0 2px 8px rgba(0,0,0,0.15)'
                    case 'md':
                      return '0 4px 16px rgba(0,0,0,0.2)'
                    case 'lg':
                      return '0 8px 24px rgba(0,0,0,0.25)'
                    case 'xl':
                      return '0 12px 32px rgba(0,0,0,0.3)'
                    default:
                      return '0 4px 16px rgba(0,0,0,0.2)'
                  }
                }

                return (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onClick={() => handleLinkClick(link.id, link.url)}
                    disabled={clickedLink === link.id}
                    className="w-full text-left disabled:opacity-50 group relative overflow-hidden"
                    style={{
                      padding: `${layoutSettings?.cardPadding ?? 16}px`,
                      borderRadius: `${linkBorderRadius}px`,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: getLinkShadow(),
                      ...getLinkStyle(),
                      ...(link.backgroundColor
                        ? { background: link.backgroundColor, border: 'none' }
                        : {}),
                      ...getFeaturedBorder(),
                    }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {/* Badge in top right */}
                    {badge && (
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: badge.color }}
                        />
                        {badge.label}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Large Thumbnail/Icon */}
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 overflow-hidden"
                        style={{
                          borderRadius: `${Math.max((layoutSettings?.cardBorderRadius ?? 16) - 4, 8)}px`,
                          background: link.backgroundColor
                            ? `${link.backgroundColor}40`
                            : `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
                        }}
                      >
                        {link.thumbnail ? (
                          <img
                            src={link.thumbnail}
                            alt={link.title}
                            className="w-full h-full object-cover"
                          />
                        ) : link.icon ? (
                          <span className="text-2xl">{link.icon}</span>
                        ) : (
                          <ExternalLink
                            size={24}
                            style={{ color: accentColor, opacity: 0.8 }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-16">
                        <p
                          className="font-bold text-base truncate"
                          style={{
                            color: link.textColor || '#ffffff',
                          }}
                        >
                          {link.title}
                        </p>
                        {link.description && (
                          <p
                            className="text-sm truncate mt-1 opacity-60"
                            style={{
                              color: link.textColor || '#ffffff',
                            }}
                          >
                            {link.description}
                          </p>
                        )}
                      </div>

                      {/* Loading indicator */}
                      {clickedLink === link.id && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Loader2
                            size={20}
                            className="animate-spin"
                            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="text-center py-12 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <LinkIcon
                  className="w-10 h-10 mx-auto mb-3 opacity-30"
                  style={{ color: 'var(--foreground-muted)' }}
                />
                <p
                  className="font-medium text-sm"
                  style={{ color: 'var(--foreground)' }}
                >
                  No links yet
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  This creator hasn't added any links
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Eziox Branding */}
        {(() => {
          const userTier = (profile.user.tier || 'free') as TierType
          const showBranding = !['pro', 'creator', 'lifetime'].includes(
            userTier,
          )

          if (!showBranding) return null

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center pb-6"
            >
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--foreground-muted)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Sparkles size={14} style={{ color: accentColor }} />
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
