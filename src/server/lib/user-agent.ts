/**
 * User Agent Parser
 * Detects browser, OS, and device type from User-Agent strings
 * Supports modern browsers: Chrome, Firefox, Safari, Edge, Opera, Brave, Vivaldi, Arc, Tor, OperaGX, etc.
 */

export interface ParsedUserAgent {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  device: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'
  isBot: boolean
  raw: string
}

interface BrowserPattern {
  name: string
  pattern: RegExp
  versionPattern?: RegExp
}

// Order matters - more specific patterns first
const BROWSER_PATTERNS: BrowserPattern[] = [
  // Privacy/Alternative browsers (check before Chrome since they include Chrome in UA)
  { name: 'Tor Browser', pattern: /\bTor\b/i },
  { name: 'Brave', pattern: /\bBrave\b/i },
  { name: 'Arc', pattern: /\bArc\b/i },
  { name: 'Vivaldi', pattern: /\bVivaldi\b/i, versionPattern: /Vivaldi\/([\d.]+)/i },
  { name: 'Opera GX', pattern: /\bOPRGX\b/i },
  { name: 'Opera', pattern: /\b(OPR|Opera)\b/i, versionPattern: /(?:OPR|Opera)[\/\s]([\d.]+)/i },
  { name: 'Samsung Internet', pattern: /\bSamsungBrowser\b/i, versionPattern: /SamsungBrowser\/([\d.]+)/i },
  { name: 'UC Browser', pattern: /\bUCBrowser\b/i, versionPattern: /UCBrowser\/([\d.]+)/i },
  { name: 'Yandex', pattern: /\bYaBrowser\b/i, versionPattern: /YaBrowser\/([\d.]+)/i },
  { name: 'DuckDuckGo', pattern: /\bDuckDuckGo\b/i },
  { name: 'Whale', pattern: /\bWhale\b/i, versionPattern: /Whale\/([\d.]+)/i },
  
  // Major browsers
  { name: 'Edge', pattern: /\bEdg(?:e|A|iOS)?\b/i, versionPattern: /Edg(?:e|A|iOS)?\/([\d.]+)/i },
  { name: 'Firefox', pattern: /\bFirefox\b/i, versionPattern: /Firefox\/([\d.]+)/i },
  { name: 'Safari', pattern: /\bSafari\b/i, versionPattern: /Version\/([\d.]+)/i },
  { name: 'Chrome', pattern: /\bChrome\b/i, versionPattern: /Chrome\/([\d.]+)/i },
  
  // Mobile browsers
  { name: 'Mobile Safari', pattern: /\bMobile.*Safari\b/i, versionPattern: /Version\/([\d.]+)/i },
  { name: 'Chrome Mobile', pattern: /\bCriOS\b/i, versionPattern: /CriOS\/([\d.]+)/i },
  { name: 'Firefox Mobile', pattern: /\bFxiOS\b/i, versionPattern: /FxiOS\/([\d.]+)/i },
  
  // WebView
  { name: 'WebView', pattern: /\bwv\b/i },
  
  // Bots and crawlers
  { name: 'Googlebot', pattern: /\bGooglebot\b/i },
  { name: 'Bingbot', pattern: /\bBingbot\b/i },
  { name: 'Slurp', pattern: /\bSlurp\b/i },
  { name: 'DuckDuckBot', pattern: /\bDuckDuckBot\b/i },
  { name: 'Baiduspider', pattern: /\bBaiduspider\b/i },
  { name: 'YandexBot', pattern: /\bYandexBot\b/i },
  { name: 'facebookexternalhit', pattern: /\bfacebookexternalhit\b/i },
  { name: 'Twitterbot', pattern: /\bTwitterbot\b/i },
  { name: 'LinkedInBot', pattern: /\bLinkedInBot\b/i },
  { name: 'Discordbot', pattern: /\bDiscordbot\b/i },
  { name: 'TelegramBot', pattern: /\bTelegramBot\b/i },
  { name: 'WhatsApp', pattern: /\bWhatsApp\b/i },
  { name: 'Slackbot', pattern: /\bSlackbot\b/i },
  { name: 'curl', pattern: /\bcurl\b/i },
  { name: 'wget', pattern: /\bwget\b/i },
  { name: 'Python', pattern: /\bpython-requests\b/i },
  { name: 'Node.js', pattern: /\bnode-fetch\b/i },
  { name: 'Bot', pattern: /\b(bot|crawler|spider|scraper)\b/i },
]

interface OSPattern {
  name: string
  pattern: RegExp
  versionPattern?: RegExp
}

const OS_PATTERNS: OSPattern[] = [
  // Mobile OS (check first)
  { name: 'iOS', pattern: /\b(iPhone|iPad|iPod)\b/i, versionPattern: /OS ([\d_]+)/i },
  { name: 'Android', pattern: /\bAndroid\b/i, versionPattern: /Android ([\d.]+)/i },
  { name: 'Windows Phone', pattern: /\bWindows Phone\b/i, versionPattern: /Windows Phone ([\d.]+)/i },
  
  // Desktop OS
  { name: 'Windows 11', pattern: /\bWindows NT 10\.0.*Win64\b/i },
  { name: 'Windows 10', pattern: /\bWindows NT 10\.0\b/i },
  { name: 'Windows 8.1', pattern: /\bWindows NT 6\.3\b/i },
  { name: 'Windows 8', pattern: /\bWindows NT 6\.2\b/i },
  { name: 'Windows 7', pattern: /\bWindows NT 6\.1\b/i },
  { name: 'Windows', pattern: /\bWindows\b/i },
  { name: 'macOS', pattern: /\bMac OS X\b/i, versionPattern: /Mac OS X ([\d_]+)/i },
  { name: 'Linux', pattern: /\bLinux\b/i },
  { name: 'Ubuntu', pattern: /\bUbuntu\b/i },
  { name: 'Fedora', pattern: /\bFedora\b/i },
  { name: 'Chrome OS', pattern: /\bCrOS\b/i },
  { name: 'FreeBSD', pattern: /\bFreeBSD\b/i },
]

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /node-fetch/i,
  /http/i,
  /Googlebot/i,
  /Bingbot/i,
  /Slurp/i,
  /DuckDuckBot/i,
  /facebookexternalhit/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /Discordbot/i,
]

const MOBILE_PATTERNS = [
  /Mobile/i,
  /Android/i,
  /iPhone/i,
  /iPad/i,
  /iPod/i,
  /webOS/i,
  /BlackBerry/i,
  /Opera Mini/i,
  /IEMobile/i,
]

const TABLET_PATTERNS = [
  /iPad/i,
  /Android.*Tablet/i,
  /Tablet/i,
  /Kindle/i,
  /Silk/i,
  /PlayBook/i,
]

export function parseUserAgent(userAgent: string | null | undefined): ParsedUserAgent {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      device: 'unknown',
      isBot: false,
      raw: '',
    }
  }

  // Detect browser
  let browser = 'Unknown'
  let browserVersion = ''
  
  for (const { name, pattern, versionPattern } of BROWSER_PATTERNS) {
    if (pattern.test(userAgent)) {
      browser = name
      if (versionPattern) {
        const match = userAgent.match(versionPattern)
        if (match) {
          browserVersion = match[1] || ''
        }
      }
      break
    }
  }

  // Special case: Brave doesn't always identify itself, but we can detect it
  // by checking for specific headers or behaviors (this is a UA-only check)
  if (browser === 'Chrome' && userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
    // Brave often has a specific Chrome version pattern
    // This is a heuristic - Brave users who want privacy may not be detected
  }

  // Detect OS
  let os = 'Unknown'
  let osVersion = ''
  
  for (const { name, pattern, versionPattern } of OS_PATTERNS) {
    if (pattern.test(userAgent)) {
      os = name
      if (versionPattern) {
        const match = userAgent.match(versionPattern)
        if (match) {
          osVersion = match[1]?.replace(/_/g, '.') || ''
        }
      }
      break
    }
  }

  // Detect if bot
  const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent))

  // Detect device type
  let device: ParsedUserAgent['device'] = 'desktop'
  
  if (isBot) {
    device = 'bot'
  } else if (TABLET_PATTERNS.some(pattern => pattern.test(userAgent))) {
    device = 'tablet'
  } else if (MOBILE_PATTERNS.some(pattern => pattern.test(userAgent))) {
    device = 'mobile'
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    isBot,
    raw: userAgent,
  }
}

/**
 * Format parsed user agent into a readable string
 * e.g., "Chrome 120 on Windows 10" or "Safari on iOS 17"
 */
export function formatUserAgent(parsed: ParsedUserAgent): string {
  if (parsed.browser === 'Unknown' && parsed.os === 'Unknown') {
    return 'Unknown'
  }

  const browserStr = parsed.browserVersion 
    ? `${parsed.browser} ${parsed.browserVersion.split('.')[0]}`
    : parsed.browser

  const osStr = parsed.osVersion
    ? `${parsed.os} ${parsed.osVersion.split('.')[0]}`
    : parsed.os

  if (parsed.os === 'Unknown') {
    return browserStr
  }

  if (parsed.browser === 'Unknown') {
    return osStr
  }

  return `${browserStr} on ${osStr}`
}

/**
 * Get a short device description
 * e.g., "Desktop", "Mobile", "Tablet", "Bot"
 */
export function getDeviceType(parsed: ParsedUserAgent): string {
  switch (parsed.device) {
    case 'mobile': return 'Mobile'
    case 'tablet': return 'Tablet'
    case 'bot': return 'Bot'
    case 'desktop': return 'Desktop'
    default: return 'Unknown'
  }
}
