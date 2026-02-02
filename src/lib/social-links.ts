export const SOCIAL_PLATFORMS = {
  // Primary platforms
  twitter: {
    name: 'X (Twitter)',
    baseUrl: 'https://x.com/',
    color: '#000000',
    format: (username: string) => username.replace('@', ''),
  },
  x: {
    name: 'X',
    baseUrl: 'https://x.com/',
    color: '#000000',
    format: (username: string) => username.replace('@', ''),
  },
  instagram: {
    name: 'Instagram',
    baseUrl: 'https://instagram.com/',
    color: '#E4405F',
    format: (username: string) => username.replace('@', ''),
  },
  youtube: {
    name: 'YouTube',
    baseUrl: 'https://youtube.com/',
    color: '#FF0000',
    format: (username: string) =>
      username.startsWith('@') ? username : `@${username}`,
  },
  twitch: {
    name: 'Twitch',
    baseUrl: 'https://twitch.tv/',
    color: '#9146FF',
    format: (username: string) => username.replace('@', ''),
  },
  tiktok: {
    name: 'TikTok',
    baseUrl: 'https://tiktok.com/',
    color: '#000000',
    format: (username: string) =>
      username.startsWith('@') ? username : `@${username}`,
  },
  discord: {
    name: 'Discord',
    baseUrl: 'https://discord.com/users/',
    color: '#5865F2',
    format: (username: string) => username.replace('@', ''),
  },
  github: {
    name: 'GitHub',
    baseUrl: 'https://github.com/',
    color: '#24292e',
    format: (username: string) => username.replace('@', ''),
  },

  // Additional platforms
  bluesky: {
    name: 'Bluesky',
    baseUrl: 'https://bsky.app/profile/',
    color: '#0085FF',
    format: (username: string) => username.replace('@', ''),
  },
  threads: {
    name: 'Threads',
    baseUrl: 'https://threads.net/',
    color: '#000000',
    format: (username: string) =>
      username.startsWith('@') ? username : `@${username}`,
  },
  kick: {
    name: 'Kick',
    baseUrl: 'https://kick.com/',
    color: '#53FC18',
    format: (username: string) => username.replace('@', ''),
  },
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://linkedin.com/in/',
    color: '#0A66C2',
    format: (username: string) => username.replace('@', ''),
  },
  facebook: {
    name: 'Facebook',
    baseUrl: 'https://facebook.com/',
    color: '#1877F2',
    format: (username: string) => username.replace('@', ''),
  },
  reddit: {
    name: 'Reddit',
    baseUrl: 'https://reddit.com/user/',
    color: '#FF4500',
    format: (username: string) => username.replace(/^u\//, '').replace('@', ''),
  },
  pinterest: {
    name: 'Pinterest',
    baseUrl: 'https://pinterest.com/',
    color: '#E60023',
    format: (username: string) => username.replace('@', ''),
  },
  snapchat: {
    name: 'Snapchat',
    baseUrl: 'https://snapchat.com/add/',
    color: '#FFFC00',
    format: (username: string) => username.replace('@', ''),
  },
  telegram: {
    name: 'Telegram',
    baseUrl: 'https://t.me/',
    color: '#26A5E4',
    format: (username: string) => username.replace('@', ''),
  },
  whatsapp: {
    name: 'WhatsApp',
    baseUrl: 'https://wa.me/',
    color: '#25D366',
    format: (username: string) => username.replace(/[^0-9]/g, ''),
  },
  spotify: {
    name: 'Spotify',
    baseUrl: 'https://open.spotify.com/user/',
    color: '#1DB954',
    format: (username: string) => username.replace('@', ''),
  },
  soundcloud: {
    name: 'SoundCloud',
    baseUrl: 'https://soundcloud.com/',
    color: '#FF5500',
    format: (username: string) => username.replace('@', ''),
  },
  steam: {
    name: 'Steam',
    baseUrl: 'https://steamcommunity.com/profiles/',
    color: '#171A21',
    format: (username: string) => username.replace('@', ''),
  },
  patreon: {
    name: 'Patreon',
    baseUrl: 'https://patreon.com/',
    color: '#FF424D',
    format: (username: string) => username.replace('@', ''),
  },
  kofi: {
    name: 'Ko-fi',
    baseUrl: 'https://ko-fi.com/',
    color: '#FF5E5B',
    format: (username: string) => username.replace('@', ''),
  },

  // Gaming platforms
  epicgames: {
    name: 'Epic Games',
    baseUrl: 'https://store.epicgames.com/u/',
    color: '#2F2D2E',
    format: (username: string) => username.replace('@', ''),
  },
  playstation: {
    name: 'PlayStation',
    baseUrl: 'https://psnprofiles.com/',
    color: '#003791',
    format: (username: string) => username.replace('@', ''),
  },
  xbox: {
    name: 'Xbox',
    baseUrl: 'https://account.xbox.com/profile?gamertag=',
    color: '#107C10',
    format: (username: string) => encodeURIComponent(username.replace('@', '')),
  },
  battlenet: {
    name: 'Battle.net',
    baseUrl: 'https://overwatch.blizzard.com/career/',
    color: '#00AEFF',
    format: (username: string) => username.replace('@', '').replace('#', '-'),
  },
  riot: {
    name: 'Riot Games',
    baseUrl: 'https://tracker.gg/valorant/profile/riot/',
    color: '#D32936',
    format: (username: string) => encodeURIComponent(username.replace('@', '')),
  },

  // Music platforms
  bandcamp: {
    name: 'Bandcamp',
    baseUrl: 'https://',
    color: '#629AA9',
    format: (username: string) =>
      username.includes('.bandcamp.com')
        ? username
        : `${username}.bandcamp.com`,
  },
  applemusic: {
    name: 'Apple Music',
    baseUrl: 'https://music.apple.com/profile/',
    color: '#FA243C',
    format: (username: string) => username.replace('@', ''),
  },
  
  // Default/Website
  website: {
    name: 'Website',
    baseUrl: '',
    color: '#6366f1',
    format: (username: string) => username,
  },
} as const

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS

/**
 * Converts a social platform and username to a full URL
 * @param platform - The social platform (e.g., 'twitter', 'instagram')
 * @param username - The username or handle
 * @returns Full URL to the social profile
 */
export function getSocialUrl(platform: string, username: string): string {
  const platformKey = platform.toLowerCase() as SocialPlatform
  const config = SOCIAL_PLATFORMS[platformKey]

  if (!config) {
    // If platform not recognized, return as-is (might be a full URL already)
    return username.startsWith('http') ? username : `https://${username}`
  }

  const formattedUsername = config.format(username)
  return `${config.baseUrl}${formattedUsername}`
}

/**
 * Validates if a string is a valid social username
 * @param username - The username to validate
 * @returns true if valid
 */
export function isValidSocialUsername(username: string): boolean {
  if (!username || username.trim().length === 0) return false

  // Allow @username, username, or full URLs
  const usernamePattern = /^@?[\w.-]+$/
  const urlPattern = /^https?:\/\/.+/

  return usernamePattern.test(username) || urlPattern.test(username)
}

/**
 * Gets the brand color for a social platform
 * @param platform - The social platform (e.g., 'twitter', 'instagram')
 * @returns Hex color code for the platform
 */
export function getSocialColor(platform: string): string {
  const platformKey = platform.toLowerCase() as SocialPlatform
  const config = SOCIAL_PLATFORMS[platformKey]
  return config?.color || '#6366f1'
}
