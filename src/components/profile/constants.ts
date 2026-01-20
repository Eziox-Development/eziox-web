import {
  SiX, SiInstagram, SiYoutube, SiTwitch, SiGithub, SiTiktok, SiDiscord,
} from 'react-icons/si'
import {
  UserCircle, Link as LinkIcon, Gift, Shield, Crown, Palette, Wand2, Settings, Lock,
} from 'lucide-react'
import type { TabType } from './types'

export const SOCIAL_PLATFORMS = [
  { key: 'twitter', label: 'Twitter / X', icon: SiX, placeholder: '@username', color: '#000000' },
  { key: 'instagram', label: 'Instagram', icon: SiInstagram, placeholder: '@username', color: '#E4405F' },
  { key: 'youtube', label: 'YouTube', icon: SiYoutube, placeholder: 'channel', color: '#FF0000' },
  { key: 'twitch', label: 'Twitch', icon: SiTwitch, placeholder: 'username', color: '#9146FF' },
  { key: 'github', label: 'GitHub', icon: SiGithub, placeholder: 'username', color: '#181717' },
  { key: 'tiktok', label: 'TikTok', icon: SiTiktok, placeholder: '@username', color: '#000000' },
  { key: 'discord', label: 'Discord', icon: SiDiscord, placeholder: 'userid', color: '#5865F2' },
] as const

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
