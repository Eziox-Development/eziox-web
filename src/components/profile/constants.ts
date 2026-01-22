import {
  SiX, SiInstagram, SiYoutube, SiTwitch, SiGithub, SiTiktok, SiDiscord,
  SiLinkedin, SiSpotify, SiPatreon, SiKofi, SiReddit, SiPinterest,
  SiSnapchat, SiTelegram, SiBluesky, SiThreads, SiSteam, SiSoundcloud,
  SiFacebook, SiWhatsapp, SiKick,
} from 'react-icons/si'
import {
  UserCircle, Link as LinkIcon, Gift, Shield, Crown, Palette, Wand2, Settings, Lock, Globe,
} from 'lucide-react'
import type { TabType } from './types'

// Primary social platforms shown by default
export const SOCIAL_PLATFORMS = [
  { key: 'twitter', label: 'X (Twitter)', icon: SiX, placeholder: 'username', color: '#FFFFFF', bgColor: '#000000' },
  { key: 'instagram', label: 'Instagram', icon: SiInstagram, placeholder: 'username', color: '#E4405F', bgColor: '#E4405F' },
  { key: 'youtube', label: 'YouTube', icon: SiYoutube, placeholder: '@channel', color: '#FF0000', bgColor: '#FF0000' },
  { key: 'twitch', label: 'Twitch', icon: SiTwitch, placeholder: 'username', color: '#9146FF', bgColor: '#9146FF' },
  { key: 'tiktok', label: 'TikTok', icon: SiTiktok, placeholder: '@username', color: '#FFFFFF', bgColor: '#000000' },
  { key: 'discord', label: 'Discord', icon: SiDiscord, placeholder: 'User ID', color: '#5865F2', bgColor: '#5865F2' },
  { key: 'github', label: 'GitHub', icon: SiGithub, placeholder: 'username', color: '#FFFFFF', bgColor: '#181717' },
] as const

// Additional platforms for "More" section
export const ADDITIONAL_PLATFORMS = [
  { key: 'bluesky', label: 'Bluesky', icon: SiBluesky, placeholder: 'handle.bsky.social', color: '#0085FF', bgColor: '#0085FF' },
  { key: 'threads', label: 'Threads', icon: SiThreads, placeholder: 'username', color: '#FFFFFF', bgColor: '#000000' },
  { key: 'kick', label: 'Kick', icon: SiKick, placeholder: 'username', color: '#53FC18', bgColor: '#0D0E0F' },
  { key: 'linkedin', label: 'LinkedIn', icon: SiLinkedin, placeholder: 'username', color: '#0A66C2', bgColor: '#0A66C2' },
  { key: 'facebook', label: 'Facebook', icon: SiFacebook, placeholder: 'username', color: '#1877F2', bgColor: '#1877F2' },
  { key: 'reddit', label: 'Reddit', icon: SiReddit, placeholder: 'u/username', color: '#FF4500', bgColor: '#FF4500' },
  { key: 'pinterest', label: 'Pinterest', icon: SiPinterest, placeholder: 'username', color: '#BD081C', bgColor: '#BD081C' },
  { key: 'snapchat', label: 'Snapchat', icon: SiSnapchat, placeholder: 'username', color: '#000000', bgColor: '#FFFC00' },
  { key: 'telegram', label: 'Telegram', icon: SiTelegram, placeholder: 'username', color: '#26A5E4', bgColor: '#26A5E4' },
  { key: 'whatsapp', label: 'WhatsApp', icon: SiWhatsapp, placeholder: 'phone number', color: '#25D366', bgColor: '#25D366' },
  { key: 'spotify', label: 'Spotify', icon: SiSpotify, placeholder: 'username', color: '#1DB954', bgColor: '#1DB954' },
  { key: 'soundcloud', label: 'SoundCloud', icon: SiSoundcloud, placeholder: 'username', color: '#FF5500', bgColor: '#FF5500' },
  { key: 'steam', label: 'Steam', icon: SiSteam, placeholder: 'profile ID', color: '#FFFFFF', bgColor: '#171A21' },
  { key: 'patreon', label: 'Patreon', icon: SiPatreon, placeholder: 'username', color: '#FF424D', bgColor: '#FF424D' },
  { key: 'kofi', label: 'Ko-fi', icon: SiKofi, placeholder: 'username', color: '#FF5E5B', bgColor: '#FF5E5B' },
] as const

// All platforms combined for lookup
export const ALL_SOCIAL_PLATFORMS = [...SOCIAL_PLATFORMS, ...ADDITIONAL_PLATFORMS] as const

// Helper to get platform by key
export function getPlatformByKey(key: string) {
  return ALL_SOCIAL_PLATFORMS.find(p => p.key === key) || { 
    key, 
    label: key, 
    icon: Globe, 
    placeholder: 'username', 
    color: '#6366f1', 
    bgColor: '#6366f1' 
  }
}

export const CREATOR_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'vtuber', label: 'VTuber' },
  { value: 'screentuber', label: 'ScreenTuber' },
  { value: 'streamer', label: 'Streamer' },
  { value: 'artist', label: 'Artist' },
  { value: 'musician', label: 'Musician' },
  { value: 'developer', label: 'Developer' },
  { value: 'content_creator', label: 'Content Creator' },
  { value: 'gamer', label: 'Gamer' },
  { value: 'other', label: 'Other' },
] as const

export const PRONOUNS_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'any', label: 'Any' },
  { value: 'custom', label: 'Custom' },
] as const

export const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#22c55e', '#0ea5e9',
] as const

export const DASHBOARD_TABS: Array<{
  id: TabType
  label: string
  icon: typeof UserCircle
  description: string
  category: 'main' | 'premium' | 'account'
}> = [
  { id: 'profile', label: 'Profile', icon: UserCircle, description: 'Edit your profile info', category: 'main' },
  { id: 'links', label: 'Links', icon: LinkIcon, description: 'Manage your links', category: 'main' },
  { id: 'referrals', label: 'Referrals', icon: Gift, description: 'Invite friends', category: 'main' },
  { id: 'badges', label: 'Badges', icon: Shield, description: 'Your achievements', category: 'main' },
  { id: 'subscription', label: 'Premium', icon: Crown, description: 'Upgrade your plan', category: 'premium' },
  { id: 'customization', label: 'Customize', icon: Palette, description: 'Theme & appearance', category: 'premium' },
  { id: 'creator', label: 'Creator', icon: Wand2, description: 'Creator tools', category: 'premium' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Account settings', category: 'account' },
  { id: 'privacy', label: 'Privacy', icon: Lock, description: 'Privacy controls', category: 'account' },
]
