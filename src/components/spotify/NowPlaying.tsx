import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getNowPlayingFn, getUserNowPlayingFn, type NowPlayingData } from '@/server/functions/spotify'
import { SiSpotify } from 'react-icons/si'
import { Pause, ExternalLink, Volume2 } from 'lucide-react'

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

export function NowPlaying({ userId, theme, compact = false, showRecentIfNotPlaying = true }: NowPlayingProps) {
  const [localProgress, setLocalProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const getNowPlaying = useServerFn(getNowPlayingFn)
  const getUserNowPlaying = useServerFn(getUserNowPlayingFn)

  const { data, isLoading } = useQuery<NowPlayingData>({
    queryKey: ['nowPlaying', userId],
    queryFn: () => (userId ? getUserNowPlaying({ data: { userId } }) : getNowPlaying()),
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

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [data?.isPlaying, data?.track?.id, data?.track?.progress, data?.track?.duration])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <motion.div
        className={`rounded-2xl overflow-hidden ${compact ? 'p-3' : 'p-4'}`}
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: theme.colors.backgroundSecondary }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded animate-pulse" style={{ background: theme.colors.backgroundSecondary }} />
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: theme.colors.backgroundSecondary }} />
          </div>
        </div>
      </motion.div>
    )
  }

  if (!data?.track) {
    if (!showRecentIfNotPlaying) return null

    return (
      <motion.div
        className={`rounded-2xl overflow-hidden relative ${compact ? 'p-4' : 'p-5'}`}
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle, #1DB954 0%, transparent 70%)` }} />
        
        <div className="relative flex items-center gap-4">
          <motion.div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" 
            style={{ background: 'linear-gradient(135deg, #1DB95420, #1DB95410)' }}
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SiSpotify size={28} style={{ color: '#1DB954' }} />
          </motion.div>
          <div className="flex-1">
            <p className="text-base font-bold mb-1" style={{ color: theme.colors.foreground }}>Currently not playing</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: theme.colors.foregroundMuted, opacity: 0.5 }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foregroundMuted }}>Offline</span>
            </div>
            <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
              Not listening on Spotify right now
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  const progressPercent = (localProgress / data.track.duration) * 100

  if (compact) {
    return (
      <motion.a
        href={data.track.spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl overflow-hidden p-3 transition-all"
        style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
            <img src={data.track.albumArt} alt={data.track.album} className="w-full h-full object-cover" />
            <AnimatePresence>
              {data.isPlaying && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SoundBars />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: theme.colors.foreground }}>{data.track.name}</p>
            <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>{data.track.artist}</p>
          </div>
          <SiSpotify size={16} style={{ color: '#1DB954' }} />
        </div>
      </motion.a>
    )
  }

  return (
    <motion.div
      className="rounded-2xl overflow-hidden relative"
      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundImage: `url(${data.track.albumArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SiSpotify size={16} style={{ color: '#1DB954' }} />
            <span className="text-xs font-medium" style={{ color: '#1DB954' }}>
              {data.isPlaying ? 'Now Playing' : 'Paused'}
            </span>
          </div>
          <motion.a
            href={data.track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg transition-all"
            style={{ background: isHovered ? theme.colors.backgroundSecondary : 'transparent' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ExternalLink size={14} style={{ color: theme.colors.foregroundMuted }} />
          </motion.a>
        </div>

        <div className="flex gap-4">
          <motion.div
            className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg"
            animate={{ rotate: data.isPlaying ? [0, 1, -1, 0] : 0 }}
            transition={{ duration: 4, repeat: data.isPlaying ? Infinity : 0, ease: 'easeInOut' }}
          >
            <img src={data.track.albumArt} alt={data.track.album} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
              {data.isPlaying ? (
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Volume2 size={24} className="text-white" />
                </motion.div>
              ) : (
                <Pause size={24} className="text-white" />
              )}
            </div>
          </motion.div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="font-bold text-base truncate mb-0.5" style={{ color: theme.colors.foreground }}>
              {data.track.name}
            </h4>
            <p className="text-sm truncate mb-1" style={{ color: theme.colors.foregroundMuted }}>
              {data.track.artist}
            </p>
            <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>
              {data.track.album}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative h-1 rounded-full overflow-hidden" style={{ background: theme.colors.backgroundSecondary }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: '#1DB954', width: `${progressPercent}%` }}
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
            {data.isPlaying && (
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', width: '30%' }}
                animate={{ x: ['0%', '400%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] font-mono" style={{ color: theme.colors.foregroundMuted }}>
              {formatTime(localProgress)}
            </span>
            <span className="text-[10px] font-mono" style={{ color: theme.colors.foregroundMuted }}>
              {formatTime(data.track.duration)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

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

export function SpotifyWidget({ userId, theme }: { userId: string; theme: NowPlayingProps['theme'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <NowPlaying userId={userId} theme={theme} showRecentIfNotPlaying={false} />
    </motion.div>
  )
}
