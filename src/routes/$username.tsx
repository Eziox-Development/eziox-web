import {
  createFileRoute,
  Link,
  notFound,
  useRouterState,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import { z } from 'zod'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
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
  ArrowUpRight,
  Verified,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  FolderOpen,
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
  SiSpotify,
  SiSoundcloud,
} from 'react-icons/si'
import type { ComponentType } from 'react'
import { FollowModal } from '@/components/bio/FollowModal'
import { ProfileComments } from '@/components/bio/ProfileComments'
import { getSocialUrl, getSocialColor } from '@/lib/social-links'
import { SpotifyWidget } from '@/components/spotify'
import { WidgetRenderer } from '@/components/widgets'
import { getPublicWidgetsFn } from '@/server/functions/widgets'
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
  twitter: SiX, x: SiX, github: SiGithub, linkedin: SiLinkedin,
  instagram: SiInstagram, youtube: SiYoutube, discord: SiDiscord,
  tiktok: SiTiktok, twitch: SiTwitch, spotify: SiSpotify, soundcloud: SiSoundcloud,
}

interface SpotifyConnectionStatus { connected: boolean; showOnProfile: boolean }

const RESERVED_PATHS = [
  'sign-in', 'sign-up', 'sign-out', 'profile', 'links', 'leaderboard', 'about',
  'blog', 'category', 'tag', 'rss', 'sitemap', 'api', 'u', 's', 'privacy',
  'terms', 'cookies', 'imprint', 'contact', 'pricing', 'templates', 'creators',
  'partners', 'status', 'docs', 'admin', 'settings', 'analytics', 'shortener',
  'widerruf', 'playground', 'theme-builder',
]

const searchSchema = z.object({
  tab: z.enum(['profile', 'links', 'comments']).optional().catch(undefined),
})

export const Route = createFileRoute('/$username')({
  validateSearch: searchSchema,
  beforeLoad: ({ params }) => {
    if (RESERVED_PATHS.includes(params.username.toLowerCase())) throw notFound()
  },
  loader: async ({ params }) => {
    try {
      const profile = await getPublicProfileFn({ data: { username: params.username } })
      return { profile }
    } catch { throw notFound() }
  },
  head: ({ loaderData }) => {
    const profile = loaderData?.profile
    if (!profile?.profile || ('isPublic' in profile.profile && !profile.profile.isPublic)) return {}
    const displayName = profile.user.name || profile.user.username
    const title = `${displayName} (@${profile.user.username}) | Eziox`
    const bio = 'bio' in profile.profile ? profile.profile.bio : null
    const description = bio || `Check out ${displayName}'s bio page on Eziox`
    const avatarUrl = 'avatar' in profile.profile ? profile.profile.avatar : null
    return {
      meta: [
        { title }, { name: 'description', content: description },
        { property: 'og:title', content: title }, { property: 'og:description', content: description },
        { property: 'og:type', content: 'profile' },
        { property: 'og:url', content: `${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'https://localhost:5173' : window.location.origin) : 'https://eziox.link'}/${profile.user.username}` },
        ...(avatarUrl ? [{ property: 'og:image', content: avatarUrl }] : []),
        { name: 'twitter:card', content: avatarUrl ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: title }, { name: 'twitter:description', content: description },
        ...(avatarUrl ? [{ name: 'twitter:image', content: avatarUrl }] : []),
      ],
    }
  },
  component: BioPage,
})

function BioPage() {
  const { t } = useTranslation()
  const params = Route.useParams()
  const username = params.username as string
  const queryClient = useQueryClient()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const search = useSearch({ from: '/$username' })

  const routerState = useRouterState()
  const rootMatch = routerState.matches.find((m: { routeId: string }) => m.routeId === '__root__')
  const currentUser = (rootMatch?.loaderData as { currentUser?: { id: string; username: string } } | undefined)?.currentUser

  const heroRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const commentsRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [activeSection, setActiveSection] = useState<'profile' | 'links' | 'comments'>(search.tab || 'profile')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'followers' | 'following'>('followers')
  const [clickedLink, setClickedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [followerCount, setFollowerCount] = useState<number | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [isCardHovering, setIsCardHovering] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const getProfile = useServerFn(getPublicProfileFn)
  const trackClick = useServerFn(trackLinkClickFn)
  const trackView = useServerFn(trackProfileViewFn)
  const checkFollowingFn = useServerFn(isFollowingFn)
  const followUserFnCall = useServerFn(followUserFn)
  const unfollowUserFnCall = useServerFn(unfollowUserFn)
  const checkSpotifyConnection = useServerFn(checkSpotifyConnectionFn)
  const getPublicWidgets = useServerFn(getPublicWidgetsFn)

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => getProfile({ data: { username } }),
  })

  const { data: spotifyStatus } = useQuery<SpotifyConnectionStatus>({
    queryKey: ['spotifyConnection', profile?.user?.id],
    queryFn: () => checkSpotifyConnection({ data: { userId: profile!.user.id } }),
    enabled: !!profile?.user?.id,
  })

  const { data: widgets = [] } = useQuery({
    queryKey: ['publicWidgets', profile?.user?.id],
    queryFn: () => getPublicWidgets({ data: { userId: profile!.user.id } }),
    enabled: !!profile?.user?.id,
  })

  const isSelf = currentUser?.id === profile?.user?.id
  const isAuthenticated = !!currentUser

  const { data: followStatus } = useQuery({
    queryKey: ['followStatus', profile?.user?.id, currentUser?.id],
    queryFn: () => checkFollowingFn({ data: { targetUserId: profile!.user.id } }),
    enabled: !!profile?.user?.id && isAuthenticated && !isSelf,
  })

  useEffect(() => {
    if (followStatus) setIsFollowing(followStatus.isFollowing)
  }, [followStatus])

  useEffect(() => {
    if (profile?.stats?.followers !== undefined) setFollowerCount(profile.stats.followers)
  }, [profile?.stats?.followers])

  useEffect(() => {
    if (!profile?.user?.id) return
    const sessionKey = `viewed_${profile.user.id}`
    if (!sessionStorage.getItem(sessionKey)) {
      let sessionId = sessionStorage.getItem('eziox_session_id')
      if (!sessionId) {
        sessionId = `${Date.now()}_${Math.random().toString(36).substring(2)}`
        sessionStorage.setItem('eziox_session_id', sessionId)
      }
      trackView({ data: { userId: profile.user.id, sessionId } }).then(() => sessionStorage.setItem(sessionKey, 'true')).catch(() => {})
    }
  }, [profile?.user?.id, trackView])

  useEffect(() => {
    const tab = search.tab || 'profile'
    if (tab !== activeSection) {
      setActiveSection(tab)
    }
  }, [search.tab])

  // Scroll tracking - only updates activeSection when NOT manually scrolling
  useEffect(() => {
    const handleScroll = () => {
      // Don't update activeSection if user is manually navigating
      if (isScrollingRef.current) return

      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const linksTop = linksRef.current?.offsetTop ?? Infinity
      const commentsTop = commentsRef.current?.offsetTop ?? Infinity
      const scrollCenter = scrollY + windowHeight / 2

      let newSection: 'profile' | 'links' | 'comments'
      if (scrollCenter < linksTop) {
        newSection = 'profile'
      } else if (scrollCenter < commentsTop) {
        newSection = 'links'
      } else {
        newSection = 'comments'
      }

      if (newSection !== activeSection) {
        setActiveSection(newSection)
        
        // Update URL to match scroll position
        const newTab = newSection === 'profile' ? undefined : newSection
        void navigate({
          to: '/$username',
          params: { username },
          search: newTab ? { tab: newTab } : {},
          replace: true,
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection, navigate, username])

  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTiltX((y - 0.5) * 25)
    setTiltY((x - 0.5) * -25)
  }

  const handleCardMouseLeave = () => {
    setIsCardHovering(false)
    setTiltX(0)
    setTiltY(0)
  }

  const scrollToSection = (section: 'profile' | 'links' | 'comments') => {
    // Set flag to prevent scroll listener from interfering
    isScrollingRef.current = true
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // Update activeSection and URL immediately
    setActiveSection(section)
    const newTab = section === 'profile' ? undefined : section
    void navigate({
      to: '/$username',
      params: { username },
      search: newTab ? { tab: newTab } : {},
      replace: true,
    })
    
    // Scroll to the section
    if (section === 'profile') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (section === 'links' && linksRef.current) {
      linksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (section === 'comments' && commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    
    // Re-enable scroll tracking after animation completes
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false
    }, 1000)
  }

  const handleFollowToggle = async () => {
    if (!profile?.user?.id || !isAuthenticated || isSelf) return
    setIsFollowLoading(true)
    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing)
    setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? -1 : 1))
    try {
      const result = wasFollowing
        ? await unfollowUserFnCall({ data: { targetUserId: profile.user.id } })
        : await followUserFnCall({ data: { targetUserId: profile.user.id } })
      if (result.success) {
        setFollowerCount(result.newFollowerCount)
        setIsFollowing(result.isFollowing)
        void queryClient.invalidateQueries({ queryKey: ['followStatus', profile.user.id] })
        void queryClient.invalidateQueries({ queryKey: ['publicProfile', username] })
      } else {
        setIsFollowing(wasFollowing)
        setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? 1 : -1))
      }
    } catch {
      setIsFollowing(wasFollowing)
      setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? 1 : -1))
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleLinkClick = (linkId: string, url: string) => {
    setClickedLink(linkId)
    trackClick({ data: { linkId, userAgent: navigator.userAgent, referrer: document.referrer || undefined } }).catch(() => {})
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => setClickedLink(null), 500)
  }

  const handleShare = async () => {
    const url = `${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'https://localhost:5173' : window.location.origin) : 'https://eziox.link'}/${username}`
    if (navigator.share) await navigator.share({ title: `${profile?.user.name || username}'s Bio`, url })
    else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const profileData = useMemo(() => profile?.profile && 'bio' in profile.profile ? profile.profile : null, [profile])
  const customBackground = profileData?.customBackground as CustomBackground | null
  const layoutSettings = profileData?.layoutSettings as LayoutSettings | null
  const customCSS = profileData?.customCSS as string | null
  const animatedProfile = profileData?.animatedProfile as AnimatedProfileSettings | null
  const customFonts = profileData?.customFonts as CustomFont[] | null
  const borderRadius = layoutSettings?.cardBorderRadius ?? 16

  useEffect(() => {
    if (!customFonts?.length) return
    const head = document.head
    const addedElements: HTMLElement[] = []
    customFonts.forEach((font) => {
      const safeUrl = sanitizeFontURL(font.url)
      if (safeUrl) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = safeUrl
        head.appendChild(link)
        addedElements.push(link)
      }
      const safeName = escapeHTML(font.name).replace(/['"\\]/g, '')
      const style = document.createElement('style')
      style.textContent = font.type === 'display'
        ? `h1,h2,h3,.display-font{font-family:'${safeName}',sans-serif!important}`
        : `body,p,span,.body-font{font-family:'${safeName}',sans-serif!important}`
      head.appendChild(style)
      addedElements.push(style)
    })
    return () => { addedElements.forEach((el) => el.remove()) }
  }, [customFonts])

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!customBackground) return { background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)' }
    if (customBackground.type === 'solid' || customBackground.type === 'gradient') {
      return { background: customBackground.value || 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)' }
    }
    if (customBackground.type === 'image') {
      return {
        background: `url(${customBackground.imageUrl}) center/cover fixed`,
        ...(customBackground.imageBlur ? { filter: `blur(${customBackground.imageBlur}px)` } : {}),
      }
    }
    return { background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)' }
  }

  const renderAnimatedBackground = () => {
    if (!customBackground) return null
    if (customBackground.type === 'video' && customBackground.videoUrl) {
      return <VideoBackground url={customBackground.videoUrl} loop={customBackground.videoLoop ?? true} muted={customBackground.videoMuted ?? true} />
    }
    if (customBackground.type === 'animated' && customBackground.animatedPreset) {
      return <AnimatedBackground preset={customBackground.animatedPreset} speed={customBackground.animatedSpeed} intensity={customBackground.animatedIntensity} colors={customBackground.animatedColors} />
    }
    return null
  }

  const getPlatformFromUrl = (url: string) => {
    const u = url.toLowerCase()
    if (u.includes('discord')) return { name: 'Discord', color: '#5865F2', icon: SiDiscord }
    if (u.includes('github')) return { name: 'GitHub', color: '#fff', icon: SiGithub }
    if (u.includes('twitter') || u.includes('x.com')) return { name: 'X', color: '#fff', icon: SiX }
    if (u.includes('youtube') || u.includes('youtu.be')) return { name: 'YouTube', color: '#FF0000', icon: SiYoutube }
    if (u.includes('twitch')) return { name: 'Twitch', color: '#9146FF', icon: SiTwitch }
    if (u.includes('instagram')) return { name: 'Instagram', color: '#E4405F', icon: SiInstagram }
    if (u.includes('tiktok')) return { name: 'TikTok', color: '#fff', icon: SiTiktok }
    if (u.includes('spotify')) return { name: 'Spotify', color: '#1DB954', icon: SiSpotify }
    if (u.includes('soundcloud')) return { name: 'SoundCloud', color: '#FF5500', icon: SiSoundcloud }
    if (u.includes('linkedin')) return { name: 'LinkedIn', color: '#0A66C2', icon: SiLinkedin }
    return null
  }

  const isVerified = profileData?.badges?.includes('verified')
  const userTier = (profile?.user?.tier || 'free') as TierType
  const showBranding = !['pro', 'creator', 'lifetime'].includes(userTier)

  const getAvatarAnimation = () => {
    if (!animatedProfile?.enabled) return {}
    const anims: Record<string, object> = {
      pulse: { animate: { scale: [1, 1.05, 1] }, transition: { duration: 2, repeat: Infinity } },
      glow: { animate: { boxShadow: ['0 0 20px rgba(139,92,246,0.3)', '0 0 40px rgba(139,92,246,0.5)', '0 0 20px rgba(139,92,246,0.3)'] }, transition: { duration: 2, repeat: Infinity } },
      bounce: { animate: { y: [0, -8, 0] }, transition: { duration: 1.5, repeat: Infinity } },
      rotate: { animate: { rotate: [0, 5, -5, 0] }, transition: { duration: 3, repeat: Infinity } },
      shake: { animate: { x: [0, -3, 3, -3, 0] }, transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 } },
      float: { animate: { y: [0, -5, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
    }
    return anims[animatedProfile.avatarAnimation || ''] || {}
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-white/50 animate-spin mx-auto" />
          <p className="text-white/50 text-sm mt-6">{t('bioPage.loading')}</p>
        </motion.div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center bg-white/5 border border-white/10">
            <User className="w-16 h-16 text-white/30" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{t('bioPage.notFound.title', { username })}</h1>
          <p className="text-lg text-white/50 mb-10">{t('bioPage.notFound.description')}</p>
          <Link to="/sign-up" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600">
            <Sparkles size={20} />
            {t('bioPage.notFound.claim')}
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={getBackgroundStyle()}>
      <div className="fixed inset-0 z-[1]">{renderAnimatedBackground()}</div>
      {customCSS && <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(customCSS) }} />}

      {(customBackground?.type === 'image' || customBackground?.type === 'video') && (
        <div className="fixed inset-0 pointer-events-none z-[1]" style={{ background: `rgba(0,0,0,${1 - (customBackground.imageOpacity ?? 0.5)})` }} />
      )}

      {/* Fixed Position Weather Widgets */}
      {widgets
        .filter((w) => w.type === 'weather' && (w.config as { position?: string })?.position)
        .map((widget) => {
          const pos = (widget.config as { position?: string })?.position
          const positionClasses: Record<string, string> = {
            'top-left': 'top-4 left-4',
            'top-right': 'top-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'bottom-right': 'bottom-4 right-4',
          }
          return (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`fixed z-40 ${positionClasses[pos || 'top-right']}`}
            >
              <WidgetRenderer widget={widget} />
            </motion.div>
          )
        })}

      {/* Floating Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-2 rounded-full backdrop-blur-xl"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {(['profile', 'links', 'comments'] as const).map((section) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ color: activeSection === section ? '#fff' : 'rgba(255,255,255,0.5)' }}
          >
            {activeSection === section && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {section === 'profile' && <User size={14} />}
              {section === 'links' && <LinkIcon size={14} />}
              {section === 'comments' && <MessageCircle size={14} />}
              {section === 'profile' ? t('bioPage.nav.profile') : section === 'links' ? t('bioPage.nav.links') : t('bioPage.nav.comments')}
            </span>
          </button>
        ))}
      </motion.nav>

      {/* Hero Section - Full Screen Card with Tilt */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-xl" style={{ perspective: '1000px' }}>
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateX: isCardHovering ? tiltX : 0, 
              rotateY: isCardHovering ? tiltY : 0 
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove={handleCardMouseMove}
            onMouseEnter={() => setIsCardHovering(true)}
            onMouseLeave={handleCardMouseLeave}
            className="relative overflow-hidden cursor-pointer"
            style={{
              borderRadius: borderRadius + 8,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: isCardHovering
                ? '0 50px 100px -20px rgba(0,0,0,0.5), 0 0 60px rgba(139, 92, 246, 0.2)'
                : '0 30px 60px -15px rgba(0,0,0,0.4)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${50 + tiltY * 2}% ${50 + tiltX * 2}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
                opacity: isCardHovering ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            />

            {/* Banner */}
            {profileData?.banner ? (
              <div className="relative h-44 overflow-hidden">
                <img src={profileData.banner} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            ) : (
              <div className="h-36" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.3))' }} />
            )}

            {/* Profile Content */}
            <div className="relative px-6 pb-8" style={{ transform: 'translateZ(30px)' }}>
              {/* Avatar */}
              <div className="flex justify-center" style={{ marginTop: '-64px' }}>
                <div className="relative">
                  <motion.div
                    className="w-32 h-32 overflow-hidden ring-4 ring-black/50"
                    style={{ borderRadius, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                    whileHover={{ scale: 1.05 }}
                    {...getAvatarAnimation()}
                  >
                    {profileData?.avatar ? (
                      <img src={profileData.avatar} alt={profile.user.name || username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                        {(profile.user.name?.[0] || username?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-black">
                      <Verified size={18} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Username */}
              <div className="text-center mt-5">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-4xl font-bold text-white">{profile.user.name || profile.user.username}</h1>
                  {profileData?.badges?.length && <BadgeDisplay badges={profileData.badges as string[]} size="md" maxDisplay={3} />}
                </div>
                <p className="text-white/50 mt-1">@{profile.user.username}</p>
              </div>

              {/* Bio */}
              {profileData?.bio && <p className="text-center text-white/70 mt-4 text-sm leading-relaxed">{profileData.bio}</p>}

              {/* Location & Pronouns */}
              {(profileData?.location || profileData?.pronouns) && (
                <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                  {profileData?.location && (
                    <div className="flex items-center gap-1.5 text-white/50 text-sm">
                      <MapPin size={14} />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  {profileData?.pronouns && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">{profileData.pronouns}</span>
                  )}
                </div>
              )}

              {/* Social Links */}
              {profileData?.socials && Object.keys(profileData.socials).length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
                  {Object.entries(profileData.socials).map(([platform, handle]) => {
                    const Icon = socialIconMap[platform.toLowerCase()] || Globe
                    const bgColor = getSocialColor(platform)
                    return (
                      <motion.a
                        key={platform}
                        href={getSocialUrl(platform, handle as string)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all"
                        style={{ background: bgColor }}
                        whileHover={{ scale: 1.1, y: -2 }}
                      >
                        <Icon size={18} />
                      </motion.a>
                    )
                  })}
                  <motion.button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white/60 hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    {copied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
                  </motion.button>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center gap-10 mt-8 pt-6 border-t border-white/10">
                <button onClick={() => { setModalTab('followers'); setIsModalOpen(true) }} className="text-center hover:opacity-80 transition-opacity">
                  <div className="text-2xl font-bold text-white">{(followerCount ?? profile.stats?.followers ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-white/50">{t('bioPage.stats.followers')}</div>
                </button>
                <button onClick={() => { setModalTab('following'); setIsModalOpen(true) }} className="text-center hover:opacity-80 transition-opacity">
                  <div className="text-2xl font-bold text-white">{(profile.stats?.following || 0).toLocaleString()}</div>
                  <div className="text-xs text-white/50">{t('bioPage.stats.following')}</div>
                </button>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{(profile.stats?.profileViews || 0).toLocaleString()}</div>
                  <div className="text-xs text-white/50">{t('bioPage.stats.views')}</div>
                </div>
              </div>

              {/* Follow Button */}
              {isAuthenticated && !isSelf && (
                <motion.button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 font-semibold text-white rounded-xl transition-all"
                  style={{
                    background: isFollowing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    border: isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isFollowLoading ? <Loader2 size={18} className="animate-spin" /> : isFollowing ? <><UserMinus size={18} />{t('bioPage.actions.following')}</> : <><UserPlus size={18} />{t('bioPage.actions.follow')}</>}
                </motion.button>
              )}

              {!isAuthenticated && !isSelf && (
                <Link
                  to="/sign-in"
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                >
                  <UserPlus size={18} />
                  {t('bioPage.actions.signInToFollow')}
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator - Clickable */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={() => scrollToSection('links')}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="text-white/40 text-sm">{t('bioPage.scrollToSeeLinks')}</p>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown size={24} className="text-white/40" />
          </motion.div>
        </motion.button>
      </section>

      {/* Links Section */}
      <section ref={linksRef} className="min-h-screen py-24 px-4 relative z-10">
        <div className="max-w-lg mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            {t('bioPage.linksTitle')}
          </motion.h2>

          {/* Spotify Widget */}
          {spotifyStatus?.connected && spotifyStatus.showOnProfile && profile?.user?.id && (
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
              <SpotifyWidget userId={profile.user.id} theme={theme} />
            </motion.div>
          )}

          {/* Profile Widgets (exclude fixed-position weather widgets) */}
          {widgets.filter((w) => !(w.type === 'weather' && (w.config as { position?: string })?.position)).length > 0 && (
            <div className="space-y-4 mb-8">
              {widgets
                .filter((w) => !(w.type === 'weather' && (w.config as { position?: string })?.position))
                .map((widget, index) => (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <WidgetRenderer widget={widget} />
                  </motion.div>
                ))}
            </div>
          )}

          {/* Links with Groups */}
          {profile.links?.length || profile.linkGroups?.length ? (
            <div className="space-y-4">
              {/* Render grouped links */}
              {profile.linkGroups?.map((group, groupIndex) => {
                const groupLinks = profile.links?.filter((l) => l.groupId === group.id) || []
                if (groupLinks.length === 0) return null
                
                const isCollapsed = group.isCollapsible && collapsedGroups.has(group.id)
                const toggleCollapse = () => {
                  if (!group.isCollapsible) return
                  setCollapsedGroups((prev) => {
                    const next = new Set(prev)
                    if (next.has(group.id)) {
                      next.delete(group.id)
                    } else {
                      next.add(group.id)
                    }
                    return next
                  })
                }

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="space-y-3"
                  >
                    {/* Group Header */}
                    <button
                      onClick={toggleCollapse}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl transition-all ${group.isCollapsible ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderLeftWidth: 4,
                        borderLeftColor: group.color || 'rgba(139, 92, 246, 0.5)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${group.color || '#8b5cf6'}20` }}
                      >
                        <FolderOpen size={16} style={{ color: group.color || '#8b5cf6' }} />
                      </div>
                      <span className="flex-1 text-left font-medium text-white/90">{group.name}</span>
                      {group.isCollapsible && (
                        <motion.div animate={{ rotate: isCollapsed ? 0 : 90 }} transition={{ duration: 0.2 }}>
                          <ChevronRight size={18} className="text-white/40" />
                        </motion.div>
                      )}
                    </button>

                    {/* Group Links */}
                    <motion.div
                      initial={false}
                      animate={{ height: isCollapsed ? 0 : 'auto', opacity: isCollapsed ? 0 : 1 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden space-y-3 pl-4"
                    >
                      {groupLinks.map((link, index) => {
                        const platform = getPlatformFromUrl(link.url)
                        const isHovered = hoveredLink === link.id
                        const isClicked = clickedLink === link.id
                        return (
                          <motion.button
                            key={link.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleLinkClick(link.id, link.url)}
                            onMouseEnter={() => setHoveredLink(link.id)}
                            onMouseLeave={() => setHoveredLink(null)}
                            disabled={isClicked}
                            className="w-full group"
                          >
                            <motion.div
                              className="relative overflow-hidden"
                              style={{ borderRadius }}
                              animate={{ scale: isHovered ? 1.02 : 1, y: isHovered ? -4 : 0 }}
                            >
                              <div
                                className="flex items-center gap-4 p-5 backdrop-blur-xl transition-all"
                                style={{
                                  background: link.backgroundColor ? `linear-gradient(135deg, ${link.backgroundColor}20, ${link.backgroundColor}10)` : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius,
                                }}
                              >
                                <div
                                  className="w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden"
                                  style={{ borderRadius: borderRadius - 4, background: link.backgroundColor ? `${link.backgroundColor}30` : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))' }}
                                >
                                  {link.thumbnail ? (
                                    <img src={link.thumbnail} alt={link.title} className="w-full h-full object-cover" />
                                  ) : link.icon ? (
                                    <span className="text-2xl">{link.icon}</span>
                                  ) : platform?.icon ? (
                                    <platform.icon size={24} style={{ color: platform.color }} />
                                  ) : (
                                    <ExternalLink size={22} className="text-white/60" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="font-semibold text-lg text-white truncate" style={{ color: link.textColor || '#ffffff' }}>{link.title}</p>
                                  {link.description && <p className="text-sm truncate mt-1 opacity-60" style={{ color: link.textColor || '#ffffff' }}>{link.description}</p>}
                                </div>
                                <motion.div className="shrink-0" animate={{ x: isHovered ? 4 : 0, opacity: isHovered ? 1 : 0.4 }}>
                                  {isClicked ? <Loader2 size={20} className="animate-spin text-white/60" /> : <ArrowUpRight size={20} className="text-white/60" />}
                                </motion.div>
                              </div>
                            </motion.div>
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  </motion.div>
                )
              })}

              {/* Render ungrouped links */}
              {profile.links?.filter((l) => !l.groupId).map((link, index) => {
                const platform = getPlatformFromUrl(link.url)
                const isHovered = hoveredLink === link.id
                const isClicked = clickedLink === link.id
                return (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleLinkClick(link.id, link.url)}
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    disabled={isClicked}
                    className="w-full group"
                  >
                    <motion.div
                      className="relative overflow-hidden"
                      style={{ borderRadius }}
                      animate={{ scale: isHovered ? 1.02 : 1, y: isHovered ? -4 : 0 }}
                    >
                      <div
                        className="flex items-center gap-4 p-5 backdrop-blur-xl transition-all"
                        style={{
                          background: link.backgroundColor ? `linear-gradient(135deg, ${link.backgroundColor}20, ${link.backgroundColor}10)` : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius,
                        }}
                      >
                        <div
                          className="w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden"
                          style={{ borderRadius: borderRadius - 4, background: link.backgroundColor ? `${link.backgroundColor}30` : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))' }}
                        >
                          {link.thumbnail ? (
                            <img src={link.thumbnail} alt={link.title} className="w-full h-full object-cover" />
                          ) : link.icon ? (
                            <span className="text-2xl">{link.icon}</span>
                          ) : platform?.icon ? (
                            <platform.icon size={24} style={{ color: platform.color }} />
                          ) : (
                            <ExternalLink size={22} className="text-white/60" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-lg text-white truncate" style={{ color: link.textColor || '#ffffff' }}>{link.title}</p>
                          {link.description && <p className="text-sm truncate mt-1 opacity-60" style={{ color: link.textColor || '#ffffff' }}>{link.description}</p>}
                        </div>
                        <motion.div className="shrink-0" animate={{ x: isHovered ? 4 : 0, opacity: isHovered ? 1 : 0.4 }}>
                          {isClicked ? <Loader2 size={20} className="animate-spin text-white/60" /> : <ArrowUpRight size={20} className="text-white/60" />}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.button>
                )
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-16 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <LinkIcon className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="font-medium text-white/60">{t('bioPage.links.noLinks')}</p>
              <p className="text-sm text-white/40 mt-1">{t('bioPage.links.noLinksDescription')}</p>
            </motion.div>
          )}

          {/* Branding */}
          {showBranding && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70 transition-all hover:scale-105"
              >
                <Sparkles size={14} className="text-purple-400" />
                {t('bioPage.branding.createOwn')}
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Comments Section */}
      <section ref={commentsRef} className="min-h-screen py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ProfileComments
            profileUserId={profile.user.id}
            currentUserId={currentUser?.id}
            isProfileOwner={isSelf}
            borderRadius={borderRadius}
          />
        </div>
      </section>

      {/* Follow Modal */}
      {profile?.user?.id && (
        <FollowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          username={username}
          userId={profile.user.id}
          initialTab={modalTab}
          currentUserId={currentUser?.id}
          accentColor="var(--primary)"
        />
      )}
    </div>
  )
}
