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
  SiBluesky,
  SiThreads,
  SiKick,
  SiFacebook,
  SiReddit,
  SiPinterest,
  SiSnapchat,
  SiTelegram,
  SiWhatsapp,
  SiSteam,
  SiPatreon,
  SiKofi,
  SiEpicgames,
  SiPlaystation,
  SiBattledotnet,
  SiRiotgames,
  SiBandcamp,
  SiApplemusic,
} from 'react-icons/si'
import { Gamepad2 } from 'lucide-react'
import type { ComponentType } from 'react'

export const socialIconMap: Record<string, ComponentType<{ size?: number }>> = {
  twitter: SiX,
  x: SiX,
  github: SiGithub,
  linkedin: SiLinkedin,
  instagram: SiInstagram,
  youtube: SiYoutube,
  discord: SiDiscord,
  tiktok: SiTiktok,
  twitch: SiTwitch,
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  bluesky: SiBluesky,
  threads: SiThreads,
  kick: SiKick,
  facebook: SiFacebook,
  reddit: SiReddit,
  pinterest: SiPinterest,
  snapchat: SiSnapchat,
  telegram: SiTelegram,
  whatsapp: SiWhatsapp,
  steam: SiSteam,
  patreon: SiPatreon,
  kofi: SiKofi,
  epicgames: SiEpicgames,
  playstation: SiPlaystation,
  xbox: Gamepad2,
  battlenet: SiBattledotnet,
  riot: SiRiotgames,
  bandcamp: SiBandcamp,
  applemusic: SiApplemusic,
}

export function getPlatformFromUrl(url: string) {
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
  if (u.includes('bsky') || u.includes('bluesky')) return { name: 'Bluesky', color: '#0085FF', icon: SiBluesky }
  if (u.includes('threads.net')) return { name: 'Threads', color: '#fff', icon: SiThreads }
  if (u.includes('kick.com')) return { name: 'Kick', color: '#53FC18', icon: SiKick }
  if (u.includes('facebook')) return { name: 'Facebook', color: '#1877F2', icon: SiFacebook }
  if (u.includes('reddit')) return { name: 'Reddit', color: '#FF4500', icon: SiReddit }
  if (u.includes('pinterest')) return { name: 'Pinterest', color: '#E60023', icon: SiPinterest }
  if (u.includes('snapchat')) return { name: 'Snapchat', color: '#FFFC00', icon: SiSnapchat }
  if (u.includes('t.me') || u.includes('telegram')) return { name: 'Telegram', color: '#26A5E4', icon: SiTelegram }
  if (u.includes('wa.me') || u.includes('whatsapp')) return { name: 'WhatsApp', color: '#25D366', icon: SiWhatsapp }
  if (u.includes('steam')) return { name: 'Steam', color: '#fff', icon: SiSteam }
  if (u.includes('patreon')) return { name: 'Patreon', color: '#FF424D', icon: SiPatreon }
  if (u.includes('ko-fi') || u.includes('kofi')) return { name: 'Ko-fi', color: '#FF5E5B', icon: SiKofi }
  if (u.includes('epicgames') || u.includes('store.epicgames')) return { name: 'Epic Games', color: '#fff', icon: SiEpicgames }
  if (u.includes('playstation') || u.includes('psnprofiles')) return { name: 'PlayStation', color: '#003791', icon: SiPlaystation }
  if (u.includes('xbox')) return { name: 'Xbox', color: '#107C10', icon: Gamepad2 }
  if (u.includes('blizzard') || u.includes('battle.net')) return { name: 'Battle.net', color: '#00AEFF', icon: SiBattledotnet }
  if (u.includes('riot') || u.includes('valorant')) return { name: 'Riot Games', color: '#D32936', icon: SiRiotgames }
  if (u.includes('bandcamp')) return { name: 'Bandcamp', color: '#629AA9', icon: SiBandcamp }
  if (u.includes('music.apple')) return { name: 'Apple Music', color: '#FA243C', icon: SiApplemusic }
  return null
}

export const RESERVED_PATHS = [
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
  'privacy',
  'terms',
  'cookies',
  'imprint',
  'contact',
  'pricing',
  'templates',
  'creators',
  'partners',
  'status',
  'docs',
  'admin',
  'settings',
  'analytics',
  'shortener',
  'widerruf',
  'playground',
  'theme-builder',
]
