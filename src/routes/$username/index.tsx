import {
  createFileRoute,
  Link,
  notFound,
  useRouterState,
  useNavigate,
} from '@tanstack/react-router'
import { z } from 'zod'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { getAppUrl } from '@/lib/utils'
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
  IntroGateSettings,
  ProfileMusicSettings,
  NameEffect,
  StatusText,
  CustomCursor,
  ProfileEffects,
} from '@/server/db/schema'
import {
  AnimatedBackground,
  VideoBackground,
} from '@/components/backgrounds/AnimatedBackgrounds'
import { sanitizeCSS, sanitizeFontURL, escapeHTML } from '@/lib/security'

import { RESERVED_PATHS, socialIconMap, getPlatformFromUrl } from './-constants'
import {
  getBackgroundStyle,
  getCursorStyle,
  getCardShadowStyle,
  getAvatarAnimation,
  getBannerAnimation,
  getLinkStyleProps,
  getLinkHoverAnimation,
  getLinkGlowShadow,
  getLinkShadowCSS,
  getLinkLayoutTransform,
  getMinimalLinkStyle,
  CSS_KEYFRAMES,
} from './-styles'
import {
  NameDisplay,
  StatusDisplay,
  IntroGate,
  ProfileEffectsOverlay,
  CustomCursorOverlay,
  BackgroundMusic,
} from './-components'

interface SpotifyConnectionStatus {
  connected: boolean
  showOnProfile: boolean
}

const searchSchema = z.object({
  tab: z.enum(['profile', 'links', 'comments']).optional().catch(undefined),
})

export const Route = createFileRoute('/$username/')({
  validateSearch: searchSchema,
  beforeLoad: ({ params }) => {
    if (RESERVED_PATHS.includes(params.username.toLowerCase())) throw notFound()
  },
  loader: async ({ params }) => {
    const profile = await getPublicProfileFn({
      data: { username: params.username },
    })
    if (!profile) throw notFound()
    return { profile }
  },
  head: ({ loaderData }) => {
    const profile = loaderData?.profile
    if (
      !profile?.profile ||
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
          content: `${getAppUrl()}/${profile.user.username}`,
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
  const { t } = useTranslation()
  const params = Route.useParams()
  const username = params.username as string
  const queryClient = useQueryClient()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const search = Route.useSearch()

  const routerState = useRouterState()
  const rootMatch = routerState.matches.find(
    (m: { routeId: string }) => m.routeId === '__root__',
  )
  const currentUser = (
    rootMatch?.loaderData as
      | { currentUser?: { id: string; username: string } }
      | undefined
  )?.currentUser

  // ── Refs ──
  const heroRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const commentsRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ── State ──
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
  const [gateOpen, setGateOpen] = useState(false)

  // ── Server Functions ──
  const getProfile = useServerFn(getPublicProfileFn)
  const trackClick = useServerFn(trackLinkClickFn)
  const trackView = useServerFn(trackProfileViewFn)
  const checkFollowingFn_ = useServerFn(isFollowingFn)
  const followUserFnCall = useServerFn(followUserFn)
  const unfollowUserFnCall = useServerFn(unfollowUserFn)
  const checkSpotifyConnection = useServerFn(checkSpotifyConnectionFn)
  const getPublicWidgets = useServerFn(getPublicWidgetsFn)

  // ── Queries ──
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
    queryFn: () => checkFollowingFn_({ data: { targetUserId: profile!.user.id } }),
    enabled: !!profile?.user?.id && isAuthenticated && !isSelf,
  })

  // ── Effects ──
  useEffect(() => {
    if (followStatus) setIsFollowing(followStatus.isFollowing)
  }, [followStatus])

  useEffect(() => {
    if (profile?.stats?.followers !== undefined)
      setFollowerCount(profile.stats.followers)
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
      trackView({ data: { userId: profile.user.id, sessionId } })
        .then(() => sessionStorage.setItem(sessionKey, 'true'))
        .catch(() => {})
    }
  }, [profile?.user?.id, trackView])

  useEffect(() => {
    const tab = search.tab || 'profile'
    if (tab !== activeSection) setActiveSection(tab)
  }, [search.tab])

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const linksTop = linksRef.current?.offsetTop ?? Infinity
      const commentsTop = commentsRef.current?.offsetTop ?? Infinity
      const scrollCenter = scrollY + windowHeight / 2
      let newSection: 'profile' | 'links' | 'comments'
      if (scrollCenter < linksTop) newSection = 'profile'
      else if (scrollCenter < commentsTop) newSection = 'links'
      else newSection = 'comments'
      if (newSection !== activeSection) {
        setActiveSection(newSection)
        const newTab = newSection === 'profile' ? undefined : newSection
        void navigate({ to: '/$username', params: { username }, search: newTab ? { tab: newTab } : {}, replace: true })
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection, navigate, username])

  // ── Derived Data ──
  const profileData = useMemo(
    () => profile?.profile && 'bio' in profile.profile ? profile.profile : null,
    [profile],
  )
  const customBackground = profileData?.customBackground as CustomBackground | null
  const layoutSettings = profileData?.layoutSettings as LayoutSettings | null
  const customCSS = profileData?.customCSS as string | null
  const animatedProfile = profileData?.animatedProfile as AnimatedProfileSettings | null
  const customFonts = profileData?.customFonts as CustomFont[] | null
  const borderRadius = layoutSettings?.cardBorderRadius ?? 16
  const cardLayout = layoutSettings?.cardLayout ?? 'default'
  const cardSpacing = layoutSettings?.cardSpacing ?? 12
  const cardPadding = layoutSettings?.cardPadding ?? 16
  const cardShadow = layoutSettings?.cardShadow ?? 'md'
  const cardTiltDegree = layoutSettings?.cardTiltDegree ?? 5
  const profileLayout = layoutSettings?.profileLayout ?? 'default'
  const cardMaxWidth = layoutSettings?.maxWidth ?? 640
  const isTiltEnabled = cardLayout === 'tilt'
  const isGridLayout = cardLayout === 'grid'
  const introGate = profileData?.introGate as IntroGateSettings | null
  const profileMusic = profileData?.profileMusic as ProfileMusicSettings | null
  const linkStyle = layoutSettings?.linkStyle ?? 'default'
  const nameEffect = profileData?.nameEffect as NameEffect | null
  const statusText = profileData?.statusText as StatusText | null
  const customCursor = profileData?.customCursor as CustomCursor | null
  const profileEffects = profileData?.profileEffects as ProfileEffects | null
  const isVerified = profileData?.badges?.includes('verified')
  const userTier = (profile?.user?.tier || 'free') as TierType
  const showBranding = !['pro', 'creator', 'lifetime'].includes(userTier)

  // Skip gate if not enabled
  useEffect(() => {
    if (profile && !introGate?.enabled) setGateOpen(true)
  }, [profile, introGate?.enabled])

  // Custom fonts
  useEffect(() => {
    if (!customFonts?.length) return
    const head = document.head
    const addedElements: HTMLElement[] = []
    customFonts.forEach((font) => {
      const safeUrl = sanitizeFontURL(font.url)
      const safeName = escapeHTML(font.name).replace(/['"\\]/g, '')
      if (safeUrl) {
        const style = document.createElement('style')
        if (safeUrl.startsWith('/assets/fonts/')) {
          const ext = safeUrl.split('.').pop() ?? 'ttf'
          const fmt = ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : ext === 'otf' ? 'opentype' : 'truetype'
          style.textContent = `@font-face{font-family:'${safeName}';src:url('${safeUrl}') format('${fmt}');font-weight:100 900;font-display:swap;}`
        } else {
          style.textContent = `@import url('${safeUrl}');`
        }
        head.appendChild(style)
        addedElements.push(style)
      }
      const applyStyle = document.createElement('style')
      applyStyle.textContent =
        font.type === 'display'
          ? `#bio-page h1,#bio-page h2,#bio-page h3,#bio-page .display-font{font-family:'${safeName}',sans-serif!important}`
          : `#bio-page,#bio-page p,#bio-page span,#bio-page button,#bio-page a,#bio-page .body-font{font-family:'${safeName}',sans-serif!important}`
      head.appendChild(applyStyle)
      addedElements.push(applyStyle)
    })
    return () => { addedElements.forEach((el) => el.remove()) }
  }, [customFonts])

  // ── Handlers ──
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
    isScrollingRef.current = true
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    setActiveSection(section)
    const newTab = section === 'profile' ? undefined : section
    void navigate({ to: '/$username', params: { username }, search: newTab ? { tab: newTab } : {}, replace: true })
    if (section === 'profile') window.scrollTo({ top: 0, behavior: 'smooth' })
    else if (section === 'links' && linksRef.current) linksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else if (section === 'comments' && commentsRef.current) commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = false }, 1000)
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
    const url = `${getAppUrl()}/${username}`
    if (navigator.share) await navigator.share({ title: `${profile?.user.name || username}'s Bio`, url })
    else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ── Render Helpers ──
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

  // Colored bio text
  const renderColoredBio = (bio: string) => {
    if (!statusText?.coloredWords?.length) return bio
    const parts: React.ReactNode[] = []
    let remaining = bio
    let key = 0
    while (remaining.length > 0) {
      let earliest = -1
      let earliestWord: { word: string; color: string } | null = null
      for (const cw of statusText.coloredWords) {
        const idx = remaining.toLowerCase().indexOf(cw.word.toLowerCase())
        if (idx !== -1 && (earliest === -1 || idx < earliest)) {
          earliest = idx
          earliestWord = cw
        }
      }
      if (earliest === -1 || !earliestWord) { parts.push(remaining); break }
      if (earliest > 0) parts.push(remaining.slice(0, earliest))
      parts.push(<span key={key++} style={{ color: earliestWord.color, fontWeight: 700 }}>{remaining.slice(earliest, earliest + earliestWord.word.length)}</span>)
      remaining = remaining.slice(earliest + earliestWord.word.length)
    }
    return parts
  }

  const renderLinkItem = (link: { id: string; url: string; title: string; description?: string | null; icon?: string | null; thumbnail?: string | null; backgroundColor?: string | null; textColor?: string | null; groupId?: string | null }, index: number, style: string, totalLinks?: number) => {
    const platform = getPlatformFromUrl(link.url)
    const isHovered = hoveredLink === link.id
    const isClicked = clickedLink === link.id
    const isMinimal = cardLayout === 'minimal'
    const styleProps = isMinimal
      ? getMinimalLinkStyle(index, totalLinks ?? 1, cardPadding)
      : getLinkStyleProps(style, link, borderRadius)
    const layoutTransform = getLinkLayoutTransform(cardLayout, index, cardTiltDegree)
    const linkShadow = isMinimal ? undefined : getLinkShadowCSS(cardShadow)

    return (
      <motion.button
        key={link.id}
        initial={{ opacity: 0, y: isMinimal ? 0 : 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.04 }}
        onClick={() => handleLinkClick(link.id, link.url)}
        onMouseEnter={() => setHoveredLink(link.id)}
        onMouseLeave={() => setHoveredLink(null)}
        disabled={isClicked}
        className="link-card w-full group"
        style={layoutTransform}
      >
        <motion.div
          className="relative overflow-hidden"
          style={{
            borderRadius: isMinimal ? 0 : borderRadius,
            boxShadow: getLinkGlowShadow(isHovered, link, animatedProfile) || linkShadow,
          }}
          animate={isMinimal ? { x: isHovered ? 4 : 0 } : getLinkHoverAnimation(isHovered, animatedProfile)}
          transition={{ duration: 0.2 }}
        >
          <div
            className="flex items-center gap-3 sm:gap-4 transition-all"
            style={isMinimal ? styleProps : {
              ...styleProps,
              padding: `${Math.max(cardPadding * 0.5, 6)}px ${Math.max(cardPadding * 0.7, 8)}px`,
            }}
          >
            <div
              className={`${isMinimal ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-11 h-11 sm:w-12 sm:h-12'} flex items-center justify-center shrink-0 overflow-hidden`}
              style={{
                borderRadius: isMinimal ? borderRadius * 0.5 : borderRadius - 4,
                background: isMinimal ? 'transparent' : (link.backgroundColor
                  ? `${link.backgroundColor}30`
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))'),
              }}
            >
              {link.thumbnail ? (
                <img src={link.thumbnail} alt={link.title} className="w-full h-full object-cover" />
              ) : link.icon ? (
                <span className={isMinimal ? 'text-lg' : 'text-xl sm:text-2xl'}>{link.icon}</span>
              ) : platform?.icon ? (
                <platform.icon size={isMinimal ? 16 : 20} style={{ color: platform.color }} />
              ) : (
                <ExternalLink size={isMinimal ? 14 : 18} className="text-white/60" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className={`font-semibold ${isMinimal ? 'text-sm' : 'text-sm sm:text-base'} text-white truncate`} style={{ color: link.textColor || '#ffffff' }}>
                {link.title}
              </p>
              {link.description && !isMinimal && (
                <p className="text-xs sm:text-sm truncate mt-0.5 opacity-60" style={{ color: link.textColor || '#ffffff' }}>
                  {link.description}
                </p>
              )}
            </div>
            <motion.div className="shrink-0" animate={{ x: isHovered ? 3 : 0, opacity: isHovered ? 1 : 0.3 }}>
              {isClicked ? <Loader2 size={16} className="animate-spin text-white/60" /> : <ArrowUpRight size={isMinimal ? 14 : 16} className="text-white/60" />}
            </motion.div>
          </div>
        </motion.div>
      </motion.button>
    )
  }

  // ── Page Transition Config (must be before early returns — Rules of Hooks) ──
  const pageTransitionType = animatedProfile?.enabled ? (animatedProfile.pageTransition ?? 'none') : 'none'
  const pageTransInitial = useMemo(() => {
    switch (pageTransitionType) {
      case 'fade': return { opacity: 0 }
      case 'slide': return { opacity: 0, y: 30 }
      case 'zoom': return { opacity: 0, scale: 0.95 }
      case 'blur': return { opacity: 0, filter: 'blur(10px)' }
      default: return {}
    }
  }, [pageTransitionType])
  const pageTransAnimate = useMemo(() => {
    switch (pageTransitionType) {
      case 'fade': return { opacity: 1 }
      case 'slide': return { opacity: 1, y: 0 }
      case 'zoom': return { opacity: 1, scale: 1 }
      case 'blur': return { opacity: 1, filter: 'blur(0px)' }
      default: return {}
    }
  }, [pageTransitionType])

  // ── Loading / Error States ──
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
          <Link to="/sign-up" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white bg-linear-to-r from-purple-600 to-cyan-600">
            <Sparkles size={20} />
            {t('bioPage.notFound.claim')}
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Main Render ──
  return (
    <motion.div
      id="bio-page"
      className="profile-page min-h-screen relative"
      style={{ ...getBackgroundStyle(customBackground), ...getCursorStyle(customCursor) }}
      initial={pageTransInitial}
      animate={pageTransAnimate}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="fixed inset-0 z-1">{renderAnimatedBackground()}</div>
      <style dangerouslySetInnerHTML={{ __html: CSS_KEYFRAMES }} />
      {customCSS && <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(customCSS) }} />}

      {/* Profile Effects */}
      {profileEffects && <ProfileEffectsOverlay effects={profileEffects} />}

      {/* Custom Cursor Overlay (for animated/image cursors that can't use CSS cursor:url) */}
      <CustomCursorOverlay cursor={customCursor} />

      {/* Image/Video Overlay */}
      {(customBackground?.type === 'image' || customBackground?.type === 'video') && (
        <div className="fixed inset-0 pointer-events-none z-1" style={{ background: `rgba(0,0,0,${1 - (customBackground.imageOpacity ?? 0.5)})` }} />
      )}

      {/* Intro Gate */}
      {introGate?.enabled && !gateOpen && (
        <IntroGate introGate={introGate} avatar={profileData?.avatar} onEnter={() => setGateOpen(true)} />
      )}

      {/* Background Music */}
      {profileMusic && <BackgroundMusic music={profileMusic} gateOpen={gateOpen} />}

      {/* Fixed Position Weather Widgets */}
      {widgets.filter((w) => w.type === 'weather' && (w.config as { position?: string })?.position).map((widget) => {
        const pos = (widget.config as { position?: string })?.position
        const positionClasses: Record<string, string> = { 'top-left': 'top-4 left-4', 'top-right': 'top-4 right-4', 'bottom-left': 'bottom-4 left-4', 'bottom-right': 'bottom-4 right-4' }
        return (
          <motion.div key={widget.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`fixed z-40 ${positionClasses[pos || 'top-right']}`}>
            <WidgetRenderer widget={widget} />
          </motion.div>
        )
      })}

      {/* Floating Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-full backdrop-blur-xl"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {(['profile', 'links', 'comments'] as const).map((section) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            className="relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors"
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
            <span className="relative flex items-center gap-1.5 sm:gap-2">
              {section === 'profile' && <User size={14} />}
              {section === 'links' && <LinkIcon size={14} />}
              {section === 'comments' && <MessageCircle size={14} />}
              <span className="hidden sm:inline">
                {section === 'profile' ? t('bioPage.nav.profile') : section === 'links' ? t('bioPage.nav.links') : t('bioPage.nav.comments')}
              </span>
            </span>
          </button>
        ))}
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — Modern Profile Card                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 relative z-10 pt-20 pb-16">
        <div className="w-full" style={{ maxWidth: cardMaxWidth, perspective: isTiltEnabled ? '1200px' : undefined }}>
          {/* Animated gradient border wrapper */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 40, rotateX: 0, rotateY: 0 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: isTiltEnabled && isCardHovering ? tiltX * (cardTiltDegree / 25) : 0,
              rotateY: isTiltEnabled && isCardHovering ? tiltY * (cardTiltDegree / 25) : 0,
            }}
            transition={isCardHovering
              ? { rotateX: { duration: 0 }, rotateY: { duration: 0 }, opacity: { duration: 0.8 }, y: { duration: 0.8 } }
              : { rotateX: { duration: 0.5, ease: 'easeOut' }, rotateY: { duration: 0.5, ease: 'easeOut' }, opacity: { duration: 0.8 }, y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }
            onMouseMove={handleCardMouseMove}
            onMouseEnter={() => setIsCardHovering(true)}
            onMouseLeave={handleCardMouseLeave}
            className="relative p-px overflow-hidden"
            style={{
              borderRadius: borderRadius + 12,
              transformStyle: isTiltEnabled ? 'preserve-3d' : undefined,
              perspective: isTiltEnabled ? '1200px' : undefined,
            }}
          >
            {/* Animated gradient border */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: 'conic-gradient(from 180deg, #8b5cf6, #06b6d4, #8b5cf6)',
                animation: 'spin 6s linear infinite',
                filter: 'blur(2px)',
              }}
            />

            {/* Card inner */}
            <div
              className="profile-section relative overflow-hidden"
              style={{
                borderRadius: borderRadius + 11,
                background: 'linear-gradient(160deg, rgba(15,15,25,0.95), rgba(8,8,16,0.98))',
                backdropFilter: 'blur(40px)',
                boxShadow: isCardHovering
                  ? '0 50px 100px -20px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.15)'
                  : getCardShadowStyle(layoutSettings, animatedProfile?.glowColor),
              }}
            >
              {/* Shine overlay on hover (only when tilt enabled) */}
              {isTiltEnabled && (
                <div
                  className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(ellipse at ${50 + tiltY * 2}% ${50 + tiltX * 2}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
                    opacity: isCardHovering ? 1 : 0,
                  }}
                />
              )}

              {/* Banner — shown for hero, expanded, default, centered; hidden for compact, minimal */}
              {(() => {
                const showBanner = profileLayout === 'hero' || profileLayout === 'expanded' || profileLayout === 'default' || profileLayout === 'centered'
                const isCompact = profileLayout === 'compact'
                const isMinimalPL = profileLayout === 'minimal'
                const isHero = profileLayout === 'hero'
                const isExpanded = profileLayout === 'expanded'
                const isCentered = profileLayout === 'centered' || profileLayout === 'default'

                const avatarSize = isExpanded || isHero
                  ? 'w-32 h-32 sm:w-40 sm:h-40'
                  : isCompact || isMinimalPL
                    ? 'w-20 h-20 sm:w-24 sm:h-24'
                    : 'w-28 h-28 sm:w-36 sm:h-36'
                const avatarMt = showBanner
                  ? isExpanded || isHero ? '-mt-20 sm:-mt-24' : '-mt-16 sm:-mt-20'
                  : 'mt-0'
                const flexDir = isCompact
                  ? 'flex-row items-center'
                  : isHero
                    ? 'flex-row items-end'
                    : 'flex-col items-center text-center'
                const textAlign = isCentered ? 'text-center' : isCompact || isHero ? 'text-left' : 'text-center'

                return (
                  <>
                    {/* Banner */}
                    {showBanner && (
                      profileData?.banner ? (
                        <motion.div className={`relative ${isExpanded || isHero ? 'h-44 sm:h-56' : 'h-36 sm:h-48'} overflow-hidden`} {...getBannerAnimation(animatedProfile)}>
                          <img src={profileData.banner} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-linear-to-t from-[#0f0f19] via-[#0f0f19]/40 to-transparent" />
                          {isHero && <div className="absolute inset-0 bg-linear-to-r from-[#0f0f19]/30 to-transparent" />}
                          {animatedProfile?.enabled && animatedProfile.bannerAnimation === 'particles' && (
                            <div className="absolute inset-0 pointer-events-none">
                              {[...Array(12)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1.5 h-1.5 rounded-full"
                                  style={{ background: animatedProfile.particleColor ?? '#34d399', left: `${8 + i * 7.5}%`, top: `${15 + (i % 4) * 20}%` }}
                                  animate={{ y: [-8, 8, -8], opacity: [0.2, 0.8, 0.2] }}
                                  transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.15 }}
                                />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <div className={`${isExpanded || isHero ? 'h-44 sm:h-56' : 'h-36 sm:h-48'} relative overflow-hidden`}>
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(6,182,212,0.2) 50%, rgba(139,92,246,0.15) 100%)' }} />
                          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.3), transparent 70%)' }} />
                          <div className="absolute inset-0 bg-linear-to-t from-[#0f0f19] via-transparent to-transparent" />
                          {animatedProfile?.enabled && animatedProfile.bannerAnimation === 'particles' && (
                            <div className="absolute inset-0 pointer-events-none">
                              {[...Array(12)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1.5 h-1.5 rounded-full"
                                  style={{ background: animatedProfile.particleColor ?? '#34d399', left: `${8 + i * 7.5}%`, top: `${15 + (i % 4) * 20}%` }}
                                  animate={{ y: [-8, 8, -8], opacity: [0.2, 0.8, 0.2] }}
                                  transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.15 }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    )}

                    {/* Avatar + Name row */}
                    <div className={`relative ${avatarMt}`} style={{ paddingLeft: cardPadding, paddingRight: cardPadding, paddingTop: !showBanner ? cardPadding : 0 }}>
                      <div className={`flex ${flexDir} gap-4 sm:gap-6`}>
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <motion.div
                            className={`profile-avatar ${avatarSize} overflow-hidden ${showBanner ? 'ring-4 ring-[#0f0f19]' : ''}`}
                            style={{ borderRadius: borderRadius + 4, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                            whileHover={{ scale: 1.03 }}
                            {...getAvatarAnimation(animatedProfile)}
                          >
                            {profileData?.avatar ? (
                              <img src={profileData.avatar} alt={profile.user.name || username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">
                                {(profile.user.name?.[0] || username?.[0] || 'U').toUpperCase()}
                              </div>
                            )}
                          </motion.div>
                          {isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center ring-[3px] ring-[#0f0f19]">
                              <Verified size={16} className="text-white" />
                            </div>
                          )}
                        </div>

                        {/* Name + username */}
                        <div className={`min-w-0 ${isCompact || isHero ? '' : 'mt-1'}`}>
                          <div className={`profile-name flex items-center gap-2 flex-wrap ${isCentered ? 'justify-center' : ''}`}>
                            <NameDisplay name={profile.user.name || profile.user.username} nameEffect={nameEffect} />
                            {profileData?.badges?.length && (
                              <BadgeDisplay badges={profileData.badges as string[]} size="lg" maxDisplay={10} />
                            )}
                          </div>
                          <p className="text-white/40 text-sm mt-0.5">@{profile.user.username}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content area */}
                    <div className={`${isMinimalPL ? 'pt-3 pb-4 space-y-3' : 'pt-5 pb-6 sm:pb-8 space-y-5'} ${textAlign}`} style={{ paddingLeft: cardPadding, paddingRight: cardPadding }}>
                      {/* Status Text */}
                      <StatusDisplay statusText={statusText} />

                      {/* Bio */}
                      {profileData?.bio && (
                        <p className={`profile-bio text-white/65 text-sm leading-relaxed ${isCentered ? 'max-w-md mx-auto' : 'max-w-lg'}`}>
                          {renderColoredBio(profileData.bio)}
                        </p>
                      )}

                      {/* Location & Pronouns — pill badges */}
                      {(profileData?.location || profileData?.pronouns) && (
                        <div className={`flex items-center gap-2 flex-wrap ${isCentered ? 'justify-center' : ''}`}>
                          {profileData?.location && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/60 bg-white/6 border border-white/8">
                              <MapPin size={12} />
                              <span>{profileData.location}</span>
                            </div>
                          )}
                          {profileData?.pronouns && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-medium text-white/60 bg-white/6 border border-white/8">
                              {profileData.pronouns}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Social Links — compact row */}
                      {profileData?.socials && Object.keys(profileData.socials).length > 0 && (
                        <div className={`social-links flex items-center gap-2 flex-wrap ${isCentered ? 'justify-center' : ''}`}>
                          {Object.entries(profileData.socials).map(([platform, handle]) => {
                            const Icon = socialIconMap[platform.toLowerCase()] || Globe
                            const bgColor = getSocialColor(platform)
                            return (
                              <motion.a
                                key={platform}
                                href={getSocialUrl(platform, handle as string)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 transition-all hover:text-white"
                                style={{ background: `${bgColor}20`, border: `1px solid ${bgColor}30` }}
                                whileHover={{ scale: 1.1, y: -2 }}
                              >
                                <Icon size={16} />
                              </motion.a>
                            )
                          })}
                          <motion.button
                            onClick={handleShare}
                            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/6 border border-white/8 text-white/50 hover:text-white/80 transition-all"
                            whileHover={{ scale: 1.1, y: -2 }}
                          >
                            {copied ? <Check size={15} className="text-green-400" /> : <Share2 size={15} />}
                          </motion.button>
                        </div>
                      )}

                      {/* Divider */}
                      {!isMinimalPL && <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />}

                      {/* Stats — glass pill row */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button
                          onClick={() => { setModalTab('followers'); setIsModalOpen(true) }}
                          className="flex-1 py-3 rounded-xl text-center transition-all hover:bg-white/6"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className={`${isMinimalPL ? 'text-base' : 'text-lg sm:text-xl'} font-bold text-white`}>{(followerCount ?? profile.stats?.followers ?? 0).toLocaleString()}</div>
                          <div className="text-[10px] sm:text-xs text-white/40 mt-0.5">{t('bioPage.stats.followers')}</div>
                        </button>
                        <button
                          onClick={() => { setModalTab('following'); setIsModalOpen(true) }}
                          className="flex-1 py-3 rounded-xl text-center transition-all hover:bg-white/6"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className={`${isMinimalPL ? 'text-base' : 'text-lg sm:text-xl'} font-bold text-white`}>{(profile.stats?.following || 0).toLocaleString()}</div>
                          <div className="text-[10px] sm:text-xs text-white/40 mt-0.5">{t('bioPage.stats.following')}</div>
                        </button>
                        <div
                          className="flex-1 py-3 rounded-xl text-center"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className={`${isMinimalPL ? 'text-base' : 'text-lg sm:text-xl'} font-bold text-white`}>{(profile.stats?.profileViews || 0).toLocaleString()}</div>
                          <div className="text-[10px] sm:text-xs text-white/40 mt-0.5">{t('bioPage.stats.views')}</div>
                        </div>
                      </div>

                      {/* Follow Button */}
                      {isAuthenticated && !isSelf && (
                        <motion.button
                          onClick={handleFollowToggle}
                          disabled={isFollowLoading}
                          className="w-full flex items-center justify-center gap-2.5 py-3.5 font-semibold text-white transition-all"
                          style={{
                            borderRadius: borderRadius,
                            background: isFollowing
                              ? 'rgba(255,255,255,0.06)'
                              : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            border: isFollowing ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isFollowLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : isFollowing ? (
                            <><UserMinus size={18} />{t('bioPage.actions.following')}</>
                          ) : (
                            <><UserPlus size={18} />{t('bioPage.actions.follow')}</>
                          )}
                        </motion.button>
                      )}

                      {!isAuthenticated && !isSelf && (
                        <Link
                          to="/sign-in"
                          className="w-full flex items-center justify-center gap-2.5 py-3.5 font-semibold text-white"
                          style={{
                            borderRadius: borderRadius,
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                          }}
                        >
                          <UserPlus size={18} />
                          {t('bioPage.actions.signInToFollow')}
                        </Link>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={() => scrollToSection('links')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="text-white/30 text-xs font-medium tracking-wider uppercase">{t('bioPage.scrollToSeeLinks')}</p>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown size={20} className="text-white/30" />
          </motion.div>
        </motion.button>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LINKS SECTION                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section ref={linksRef} className="min-h-screen py-16 sm:py-24 px-3 sm:px-4 relative z-10">
        <div className="mx-auto" style={{ maxWidth: cardMaxWidth }}>
          {/* Links container with animated border */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-px overflow-hidden"
            style={{ borderRadius: borderRadius + 12 }}
          >
            {/* Animated gradient border */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: 'conic-gradient(from 90deg, #8b5cf6, #06b6d4, #8b5cf6)',
                animation: 'spin 8s linear infinite',
                filter: 'blur(2px)',
              }}
            />

            {/* Inner card */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: borderRadius + 11,
                background: 'linear-gradient(160deg, rgba(15,15,25,0.95), rgba(8,8,16,0.98))',
                backdropFilter: 'blur(40px)',
                boxShadow: getCardShadowStyle(layoutSettings, animatedProfile?.glowColor),
              }}
            >
              {/* Container Header */}
              <div className="border-b border-white/8" style={{ padding: `${cardPadding * 0.75}px ${cardPadding}px` }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="ml-1 text-sm font-medium text-white/40">{t('bioPage.linksTitle')}</span>
                  <span className="ml-auto text-xs text-white/25 tabular-nums">{(profile.links?.length || 0)} {profile.links?.length === 1 ? 'link' : 'links'}</span>
                </div>
              </div>

              {/* Container Body */}
              <div style={{ padding: cardPadding }}>
                {/* Spotify Widget */}
                {spotifyStatus?.connected && spotifyStatus.showOnProfile && profile?.user?.id && (
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: cardSpacing }}>
                    <SpotifyWidget userId={profile.user.id} theme={theme} />
                  </motion.div>
                )}

                {/* Profile Widgets */}
                {widgets.filter((w) => !(w.type === 'weather' && (w.config as { position?: string })?.position)).map((widget, index) => (
                  <motion.div key={widget.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} style={{ marginBottom: cardSpacing }}>
                    <WidgetRenderer widget={widget} />
                  </motion.div>
                ))}

                {/* Links container — layout depends on cardLayout */}
                <div
                  className={isGridLayout ? 'grid grid-cols-2' : 'flex flex-col'}
                  style={{
                    gap: cardLayout === 'minimal' || cardLayout === 'stack' ? 0 : cardSpacing,
                    perspective: isTiltEnabled ? '800px' : undefined,
                  }}
                >
                  {/* Links with Groups */}
                  {profile.links?.length || profile.linkGroups?.length ? (
                    <>
                      {profile.linkGroups?.map((group, groupIndex) => {
                        const groupLinks = profile.links?.filter((l) => l.groupId === group.id) || []
                        if (groupLinks.length === 0) return null
                        const isCollapsed = group.isCollapsible && collapsedGroups.has(group.id)
                        const toggleCollapse = () => {
                          if (!group.isCollapsible) return
                          setCollapsedGroups((prev) => {
                            const next = new Set(prev)
                            if (next.has(group.id)) next.delete(group.id)
                            else next.add(group.id)
                            return next
                          })
                        }
                        return (
                          <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: groupIndex * 0.06 }}
                            className="overflow-hidden"
                            style={{ borderRadius, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <button
                              onClick={toggleCollapse}
                              className={`w-full flex items-center gap-3 transition-all ${group.isCollapsible ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
                              style={{ padding: `${cardPadding * 0.6}px ${cardPadding * 0.7}px` }}
                            >
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${group.color || '#8b5cf6'}25, ${group.color || '#8b5cf6'}10)`,
                                  border: `1px solid ${group.color || '#8b5cf6'}20`,
                                }}
                              >
                                <FolderOpen size={16} style={{ color: group.color || '#8b5cf6' }} />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-semibold text-sm text-white/90">{group.name}</span>
                                <span className="text-xs text-white/35 ml-2">{groupLinks.length}</span>
                              </div>
                              {group.isCollapsible && (
                                <motion.div animate={{ rotate: isCollapsed ? 0 : 90 }} transition={{ duration: 0.2 }}>
                                  <ChevronRight size={16} className="text-white/25" />
                                </motion.div>
                              )}
                            </button>
                            <motion.div
                              initial={false}
                              animate={{ height: isCollapsed ? 0 : 'auto', opacity: isCollapsed ? 0 : 1 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div
                                className={isGridLayout ? 'grid grid-cols-2' : 'flex flex-col'}
                                style={{
                                  padding: `0 ${cardPadding * 0.5}px ${cardPadding * 0.5}px`,
                                  gap: cardLayout === 'minimal' || cardLayout === 'stack' ? 0 : cardSpacing * 0.5,
                                  perspective: isTiltEnabled ? '800px' : undefined,
                                }}
                              >
                                {groupLinks.map((link, index) => renderLinkItem(link, index, linkStyle, groupLinks.length))}
                              </div>
                            </motion.div>
                          </motion.div>
                        )
                      })}
                      {(() => {
                        const ungrouped = profile.links?.filter((l) => !l.groupId) || []
                        return ungrouped.map((link, index) => renderLinkItem(link, index, linkStyle, ungrouped.length))
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-16" style={{ borderRadius }}>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-white/5 border border-white/8">
                        <LinkIcon className="w-6 h-6 text-white/20" />
                      </div>
                      <p className="font-medium text-white/50 text-sm">{t('bioPage.links.noLinks')}</p>
                      <p className="text-xs text-white/25 mt-1.5">{t('bioPage.links.noLinksDescription')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Branding */}
          {showBranding && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="eziox-branding text-center mt-10">
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white/40 transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Sparkles size={14} className="text-purple-400/70" />
                {t('bioPage.branding.createOwn')}
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COMMENTS SECTION                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section ref={commentsRef} className="min-h-screen py-16 sm:py-24 px-3 sm:px-4 relative z-10">
        <div className="mx-auto" style={{ maxWidth: cardMaxWidth }}>
          {/* Comments container with animated border */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-px overflow-hidden"
            style={{ borderRadius: borderRadius + 12 }}
          >
            {/* Animated gradient border */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'conic-gradient(from 270deg, #8b5cf6, #06b6d4, #8b5cf6)',
                animation: 'spin 10s linear infinite',
                filter: 'blur(2px)',
              }}
            />

            {/* Inner card */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: borderRadius + 11,
                background: 'linear-gradient(160deg, rgba(15,15,25,0.95), rgba(8,8,16,0.98))',
                backdropFilter: 'blur(40px)',
                boxShadow: getCardShadowStyle(layoutSettings, animatedProfile?.glowColor),
              }}
            >
              <div style={{ padding: cardPadding }}>
                <ProfileComments
                  profileUserId={profile.user.id}
                  currentUserId={currentUser?.id}
                  isProfileOwner={isSelf}
                  borderRadius={borderRadius}
                />
              </div>
            </div>
          </motion.div>
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
    </motion.div>
  )
}
