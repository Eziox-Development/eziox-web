export const SOCIAL_PLATFORMS = {
  // Primary platforms
  twitter: {
    name: 'X (Twitter)',
    baseUrl: 'https://x.com/',
    format: (username: string) => username.replace('@', ''),
  },
  instagram: {
    name: 'Instagram',
    baseUrl: 'https://instagram.com/',
    format: (username: string) => username.replace('@', ''),
  },
  youtube: {
    name: 'YouTube',
    baseUrl: 'https://youtube.com/',
    format: (username: string) => username.startsWith('@') ? username : `@${username}`,
  },
  twitch: {
    name: 'Twitch',
    baseUrl: 'https://twitch.tv/',
    format: (username: string) => username.replace('@', ''),
  },
  tiktok: {
    name: 'TikTok',
    baseUrl: 'https://tiktok.com/',
    format: (username: string) => username.startsWith('@') ? username : `@${username}`,
  },
  discord: {
    name: 'Discord',
    baseUrl: 'https://discord.com/users/',
    format: (username: string) => username.replace('@', ''),
  },
  github: {
    name: 'GitHub',
    baseUrl: 'https://github.com/',
    format: (username: string) => username.replace('@', ''),
  },
  
  // Additional platforms
  bluesky: {
    name: 'Bluesky',
    baseUrl: 'https://bsky.app/profile/',
    format: (username: string) => username.replace('@', ''),
  },
  threads: {
    name: 'Threads',
    baseUrl: 'https://threads.net/',
    format: (username: string) => username.startsWith('@') ? username : `@${username}`,
  },
  kick: {
    name: 'Kick',
    baseUrl: 'https://kick.com/',
    format: (username: string) => username.replace('@', ''),
  },
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://linkedin.com/in/',
    format: (username: string) => username.replace('@', ''),
  },
  facebook: {
    name: 'Facebook',
    baseUrl: 'https://facebook.com/',
    format: (username: string) => username.replace('@', ''),
  },
  reddit: {
    name: 'Reddit',
    baseUrl: 'https://reddit.com/user/',
    format: (username: string) => username.replace(/^u\//, '').replace('@', ''),
  },
  pinterest: {
    name: 'Pinterest',
    baseUrl: 'https://pinterest.com/',
    format: (username: string) => username.replace('@', ''),
  },
  snapchat: {
    name: 'Snapchat',
    baseUrl: 'https://snapchat.com/add/',
    format: (username: string) => username.replace('@', ''),
  },
  telegram: {
    name: 'Telegram',
    baseUrl: 'https://t.me/',
    format: (username: string) => username.replace('@', ''),
  },
  whatsapp: {
    name: 'WhatsApp',
    baseUrl: 'https://wa.me/',
    format: (username: string) => username.replace(/[^0-9]/g, ''),
  },
  spotify: {
    name: 'Spotify',
    baseUrl: 'https://open.spotify.com/user/',
    format: (username: string) => username.replace('@', ''),
  },
  soundcloud: {
    name: 'SoundCloud',
    baseUrl: 'https://soundcloud.com/',
    format: (username: string) => username.replace('@', ''),
  },
  steam: {
    name: 'Steam',
    baseUrl: 'https://steamcommunity.com/id/',
    format: (username: string) => username.replace('@', ''),
  },
  patreon: {
    name: 'Patreon',
    baseUrl: 'https://patreon.com/',
    format: (username: string) => username.replace('@', ''),
  },
  kofi: {
    name: 'Ko-fi',
    baseUrl: 'https://ko-fi.com/',
    format: (username: string) => username.replace('@', ''),
  },
  
  // Gaming platforms
  epicgames: {
    name: 'Epic Games',
    baseUrl: 'https://store.epicgames.com/u/',
    format: (username: string) => username.replace('@', ''),
  },
  playstation: {
    name: 'PlayStation',
    baseUrl: 'https://psnprofiles.com/',
    format: (username: string) => username.replace('@', ''),
  },
  xbox: {
    name: 'Xbox',
    baseUrl: 'https://account.xbox.com/profile?gamertag=',
    format: (username: string) => encodeURIComponent(username.replace('@', '')),
  },
  battlenet: {
    name: 'Battle.net',
    baseUrl: 'https://overwatch.blizzard.com/career/',
    format: (username: string) => username.replace('@', '').replace('#', '-'),
  },
  riot: {
    name: 'Riot Games',
    baseUrl: 'https://tracker.gg/valorant/profile/riot/',
    format: (username: string) => encodeURIComponent(username.replace('@', '')),
  },
  
  // Music platforms
  bandcamp: {
    name: 'Bandcamp',
    baseUrl: 'https://',
    format: (username: string) => username.includes('.bandcamp.com') ? username : `${username}.bandcamp.com`,
  },
  applemusic: {
    name: 'Apple Music',
    baseUrl: 'https://music.apple.com/profile/',
    format: (username: string) => username.replace('@', ''),
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
