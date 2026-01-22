import {
  SiX,
  SiInstagram,
  SiYoutube,
  SiTwitch,
  SiGithub,
  SiTiktok,
  SiDiscord,
  SiLinkedin,
  SiSpotify,
  SiSoundcloud,
  SiApplemusic,
  SiBandcamp,
  SiPatreon,
  SiKofi,
  SiBluesky,
  SiThreads,
  SiMastodon,
  SiReddit,
  SiPinterest,
  SiSnapchat,
  SiFacebook,
  SiSteam,
  SiEpicgames,
  SiPlaystation,
  SiNintendoswitch,
} from 'react-icons/si'
import type { IconType } from 'react-icons'

export const SOCIAL_ICONS: Record<string, IconType> = {
  twitter: SiX,
  x: SiX,
  instagram: SiInstagram,
  youtube: SiYoutube,
  twitch: SiTwitch,
  github: SiGithub,
  tiktok: SiTiktok,
  discord: SiDiscord,
  linkedin: SiLinkedin,
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  bandcamp: SiBandcamp,
  patreon: SiPatreon,
  kofi: SiKofi,
  bluesky: SiBluesky,
  threads: SiThreads,
  mastodon: SiMastodon,
  reddit: SiReddit,
  pinterest: SiPinterest,
  snapchat: SiSnapchat,
  facebook: SiFacebook,
  steam: SiSteam,
  epicgames: SiEpicgames,
  playstation: SiPlaystation,
  nintendo: SiNintendoswitch,
}

export const SOCIAL_COLORS: Record<string, string> = {
  twitter: '#000000',
  x: '#000000',
  instagram: '#E4405F',
  youtube: '#FF0000',
  twitch: '#9146FF',
  github: '#181717',
  tiktok: '#000000',
  discord: '#5865F2',
  linkedin: '#0A66C2',
  spotify: '#1DB954',
  soundcloud: '#FF5500',
  applemusic: '#FA243C',
  bandcamp: '#629AA9',
  patreon: '#FF424D',
  kofi: '#FF5E5B',
  bluesky: '#0085FF',
  threads: '#000000',
  mastodon: '#6364FF',
  reddit: '#FF4500',
  pinterest: '#BD081C',
  snapchat: '#FFFC00',
  facebook: '#1877F2',
  steam: '#000000',
  epicgames: '#313131',
  playstation: '#003791',
  xbox: '#107C10',
  nintendo: '#E60012',
}

export function getSocialIcon(platform: string): IconType | null {
  const key = platform.toLowerCase().replace(/[^a-z]/g, '')
  return SOCIAL_ICONS[key] || null
}

export function getSocialColor(platform: string): string {
  const key = platform.toLowerCase().replace(/[^a-z]/g, '')
  return SOCIAL_COLORS[key] || '#6b7280'
}

export {
  SiX,
  SiInstagram,
  SiYoutube,
  SiTwitch,
  SiGithub,
  SiTiktok,
  SiDiscord,
  SiLinkedin,
  SiSpotify,
  SiSoundcloud,
  SiApplemusic,
  SiFacebook,
  SiSteam,
}
