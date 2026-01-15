/**
 * Social Links Helper
 * Converts platform names and usernames to full URLs
 */

export const SOCIAL_PLATFORMS = {
  twitter: {
    name: 'Twitter / X',
    baseUrl: 'https://twitter.com/',
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
  github: {
    name: 'GitHub',
    baseUrl: 'https://github.com/',
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
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://linkedin.com/in/',
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
