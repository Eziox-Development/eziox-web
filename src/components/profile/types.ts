export type TabType =
  | 'profile'
  | 'links'
  | 'referrals'
  | 'badges'
  | 'subscription'
  | 'customization'
  | 'creator'
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
  } | null
  stats?: UserStats | null
}
