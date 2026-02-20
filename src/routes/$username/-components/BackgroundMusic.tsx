import { useEffect, useRef } from 'react'
import type { ProfileMusicSettings } from '@/server/db/schema'

interface BackgroundMusicProps {
  music: ProfileMusicSettings
  gateOpen: boolean
}

function parseMusicUrl(url: string) {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { type: 'youtube' as const, id: ytMatch[1] }
  return { type: 'direct' as const, id: url }
}

export function BackgroundMusic({ music, gateOpen }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const source = music.url ? parseMusicUrl(music.url) : null

  // Direct audio playback
  useEffect(() => {
    if (!music.enabled || !music.url || !gateOpen) return
    if (!music.autoplay) return
    if (source?.type !== 'direct') return
    const audio = new Audio(music.url)
    audio.volume = music.volume
    audio.loop = music.loop
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [gateOpen, music.enabled, music.url, music.autoplay, music.volume, music.loop, source?.type])

  if (!music.enabled || !music.url || !gateOpen || !source) return null

  // YouTube iframe
  if (source.type === 'youtube') {
    return (
      <iframe
        id="yt-bg-music"
        src={`https://www.youtube.com/embed/${source.id}?autoplay=${music.autoplay ? 1 : 0}&loop=${music.loop ? 1 : 0}&playlist=${source.id}&controls=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
        allow="autoplay"
        style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '1px', height: '1px', border: 'none' }}
        title="Background Music"
        onLoad={(e) => {
          const iframe = e.currentTarget
          const vol = Math.round((music.volume ?? 0.5) * 100)
          setTimeout(() => {
            iframe.contentWindow?.postMessage(JSON.stringify({
              event: 'command',
              func: 'setVolume',
              args: [vol],
            }), 'https://www.youtube.com')
          }, 1000)
        }}
      />
    )
  }

  return null
}
