export type TabType =
  | 'profile'
  | 'links'
  | 'widgets'
  | 'integrations'
  | 'media'
  | 'referrals'
  | 'badges'
  | 'subscription'
  | 'api'
  | 'settings'
  | 'privacy'

export interface ProfileFormData {
  name: string
  username: string
  bio: string
  website: string
  location: string
  pronouns: string
  birthday: string
  creatorTypes: string[]
  isPublic: boolean
  showActivity: boolean
  socials: Record<string, string>
}

export interface UserStats {
  profileViews: number
  totalLinkClicks: number
  followers: number
  following: number
}

export interface ProfileUser {
  id: string
  name: string | null
  username: string
  email: string
  emailVerified?: boolean
  role: 'user' | 'admin' | 'owner'
  tier: string
  createdAt: string
  profile?: {
    bio?: string | null
    website?: string | null
    location?: string | null
    pronouns?: string | null
    birthday?: string | null
    creatorTypes?: string[] | null
    isPublic?: boolean | null
    showActivity?: boolean | null
    socials?: Record<string, string> | null
    avatar?: string | null
    banner?: string | null
    badges?: string[] | null
    isFeatured?: boolean | null
    referralCode?: string | null
  } | null
  stats?: UserStats | null
}

export interface UserLink {
  id: string
  title: string
  url: string
  description?: string | null
  icon?: string | null
  thumbnail?: string | null
  clicks: number
  isActive: boolean
  position: number
  backgroundColor?: string | null
  textColor?: string | null
  createdAt: string
  updatedAt: string
}
