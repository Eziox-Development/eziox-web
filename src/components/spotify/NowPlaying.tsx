import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  getNowPlayingFn,
  getUserNowPlayingFn,
  type NowPlayingData,
} from '@/server/functions/spotify'
import { SiSpotify } from 'react-icons/si'
import { Play, ExternalLink, Music2, Disc3 } from 'lucide-react'

interface NowPlayingProps {
  userId?: string
  theme: {
    colors: {
      primary: string
      accent: string
      foreground: string
      foregroundMuted: string
      background: string
      backgroundSecondary: string
      card: string
      border: string
    }
  }
  compact?: boolean
  showRecentIfNotPlaying?: boolean
}

const SPOTIFY_GREEN = '#1DB954'

function SoundBars() {
  return (
    <div className="flex items-end gap-0.5 h-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-white rounded-full"
          animate={{ height: ['30%', '100%', '50%', '80%', '30%'] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function NowPlaying({ userId, theme, compact = false, showRecentIfNotPlaying = true }: NowPlayingProps) {
  const { t } = useTranslation()
  const [localProgress, setLocalProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const getNowPlaying = useServerFn(getNowPlayingFn)
  const getUserNowPlaying = useServerFn(getUserNowPlayingFn)

  const { data, isLoading } = useQuery<NowPlayingData>({
    queryKey: ['nowPlaying', userId],
    queryFn: () => userId ? getUserNowPlaying({ data: { userId } }) : getNowPlaying(),
    refetchInterval: 10000,
    staleTime: 5000,
  })

  useEffect(() => {
    if (data?.isPlaying && data.track) {
      setLocalProgress(data.track.progress)
      if (progressInterval.current) clearInterval(progressInterval.current)
      progressInterval.current = setInterval(() => {
        setLocalProgress((prev) => {
          const next = prev + 1000
          return next >= (data.track?.duration || 0) ? data.track?.progress || 0 : next
        })
      }, 1000)
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current) }
  }, [data?.isPlaying, data?.track?.id, data?.track?.progress, data?.track?.duration])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const cardStyle = {
    background: `linear-gradient(135deg, ${theme.colors.card}ee, ${theme.colors.backgroundSecondary}cc)`,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  }

  if (isLoading) {
    return (
      <motion.div className="rounded-3xl overflow-hidden backdrop-blur-xl" style={cardStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={compact ? 'p-4' : 'p-5'}>
          <div className="flex items-center gap-4">
            <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl animate-pulse`} style={{ background: theme.colors.backgroundSecondary }} />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-3/4 rounded-lg animate-pulse" style={{ background: theme.colors.backgroundSecondary }} />
              <div className="h-3 w-1/2 rounded-lg animate-pulse" style={{ background: theme.colors.backgroundSecondary }} />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!data?.track) {
    if (!showRecentIfNotPlaying) return null
    return (
      <motion.div className="rounded-3xl overflow-hidden relative backdrop-blur-xl" style={cardStyle} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute -top-20 -right-20 w-40 h-40 opacity-10 pointer-events-none blur-3xl" style={{ background: SPOTIFY_GREEN }} />
        <div className={compact ? 'p-4' : 'p-6'}>
          <div className="flex items-center gap-4">
            <motion.div className={`${compact ? 'w-14 h-14' : 'w-16 h-16'} rounded-2xl flex items-center justify-center`} style={{ background: `${SPOTIFY_GREEN}15`, border: `1px solid ${SPOTIFY_GREEN}20` }}>
              <Music2 size={compact ? 24 : 28} style={{ color: SPOTIFY_GREEN }} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className={`${compact ? 'text-sm' : 'text-base'} font-semibold mb-1`} style={{ color: theme.colors.foreground }}>{t('spotify.nowPlaying.notPlaying')}</p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${theme.colors.foregroundMuted}15`, color: theme.colors.foregroundMuted }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.colors.foregroundMuted }} />
                {t('spotify.nowPlaying.offline')}
              </span>
            </div>
            <SiSpotify size={20} style={{ color: `${SPOTIFY_GREEN}60` }} />
          </div>
        </div>
      </motion.div>
    )
  }

  const progressPercent = (localProgress / data.track.duration) * 100

  if (compact) {
    return (
      <motion.a href={data.track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="block rounded-3xl overflow-hidden relative backdrop-blur-xl group" style={cardStyle} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <div className="absolute inset-0 opacity-30 blur-2xl scale-150 pointer-events-none" style={{ backgroundImage: `url(${data.track.albumArt})`, backgroundSize: 'cover' }} />
        <div className="relative p-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg">
              <img src={data.track.albumArt} alt={data.track.album} className="w-full h-full object-cover" />
              <AnimatePresence>{data.isPlaying && <motion.div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SoundBars /></motion.div>}</AnimatePresence>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: theme.colors.foreground }}>{data.track.name}</p>
              <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>{data.track.artist}</p>
            </div>
            <div className="flex items-center gap-2">
              {data.isPlaying && <motion.div className="w-2 h-2 rounded-full" style={{ background: SPOTIFY_GREEN }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
              <SiSpotify size={18} style={{ color: SPOTIFY_GREEN }} />
            </div>
          </div>
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: `${theme.colors.backgroundSecondary}80` }}>
            <motion.div className="h-full rounded-full" style={{ background: SPOTIFY_GREEN, width: `${progressPercent}%` }} />
          </div>
        </div>
      </motion.a>
    )
  }

  return (
    <motion.div className="rounded-3xl overflow-hidden relative backdrop-blur-xl" style={{ ...cardStyle, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}>
      <div className="absolute inset-0 opacity-25 blur-3xl scale-150 pointer-events-none" style={{ backgroundImage: `url(${data.track.albumArt})`, backgroundSize: 'cover' }} />
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${SPOTIFY_GREEN}20` }}>
              <SiSpotify size={16} style={{ color: SPOTIFY_GREEN }} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: SPOTIFY_GREEN }}>
              {data.isPlaying ? t('spotify.nowPlaying.nowPlaying') : t('spotify.nowPlaying.paused')}
            </span>
            {data.isPlaying && <motion.div className="w-2 h-2 rounded-full" style={{ background: SPOTIFY_GREEN }} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
          </div>
          <motion.a href={data.track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: isHovered ? `${SPOTIFY_GREEN}20` : 'transparent', color: theme.colors.foregroundMuted }} whileHover={{ scale: 1.05 }}>
            <ExternalLink size={12} />
          </motion.a>
        </div>
        <div className="flex gap-5">
          <motion.div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
            <img src={data.track.albumArt} alt={data.track.album} className="w-full h-full object-cover" />
            <motion.div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }} initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0 }}>
              {data.isPlaying ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}><Disc3 size={32} className="text-white" /></motion.div> : <Play size={28} className="text-white ml-1" />}
            </motion.div>
            {data.isPlaying && !isHovered && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 rounded-lg px-2 py-1"><SoundBars /></div>}
          </motion.div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="font-bold text-lg truncate mb-1" style={{ color: theme.colors.foreground }}>{data.track.name}</h4>
            <p className="text-sm truncate mb-1" style={{ color: theme.colors.foregroundMuted }}>{data.track.artist}</p>
            <p className="text-xs truncate opacity-70" style={{ color: theme.colors.foregroundMuted }}>{data.track.album}</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: `${theme.colors.backgroundSecondary}80` }}>
            <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: SPOTIFY_GREEN, width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] font-mono" style={{ color: theme.colors.foregroundMuted }}>{formatTime(localProgress)}</span>
            <span className="text-[10px] font-mono" style={{ color: theme.colors.foregroundMuted }}>{formatTime(data.track.duration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function SpotifyWidget({ userId, theme }: { userId: string; theme: NowPlayingProps['theme'] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <NowPlaying userId={userId} theme={theme} showRecentIfNotPlaying={true} />
    </motion.div>
  )
}
