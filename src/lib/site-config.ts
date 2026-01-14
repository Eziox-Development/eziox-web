// Centralized Site Configuration
// All content, metadata, themes, and settings are managed here

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

export interface NavItem {
  label: string
  href: string
}

export interface ThemeColors {
  background: string
  backgroundSecondary: string
  foreground: string
  foregroundMuted: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  border: string
  card: string
  cardForeground: string
}

export interface ThemeTypography {
  displayFont: string
  bodyFont: string
  displayFontUrl: string
  bodyFontUrl: string
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
  typography: ThemeTypography
}

export interface OwnerInfo {
  name: string
  email: string
  role: string
  bio: string
  extendedBio: string
  avatar: string
  badges: string[]
  socialLinks: SocialLink[]
}

export interface SiteMetadata {
  title: string
  description: string
  url: string
  language: string
  copyright: string
  icon?: string
}

export interface HeaderConfig {
  image: string
  imageAlt: string
  title: string
  subtitle: string
}

export interface SiteConfig {
  metadata: SiteMetadata
  owner: OwnerInfo
  header: HeaderConfig
  navigation: NavItem[]
  footerLinks: NavItem[]
  themes: Theme[]
  defaultTheme: string
}

export const siteConfig: SiteConfig = {
  metadata: {
    title: 'Personal Portfolio',
    description:
      'A modern portfolio for content creators and professionals showcasing work, thoughts, and expertise.',
    url: 'https://portfolio.novaplex.xyz',
    language: 'en',
    copyright: `© ${new Date().getFullYear()} All rights reserved.`,
    icon: '/saito.png',
  },

  owner: {
    name: 'Saito',
    email: 'saito@novaplex.xyz',
    role: 'Software Developer · Fachinformatiker AE',
    bio: `
I’m a software developer in training (Fachinformatiker für Anwendungsentwicklung) 
with a strong focus on modern web technologies, backend systems, and clean architecture.
I enjoy building things that are not only functional, but also understandable and maintainable.
  `,
    extendedBio: `
I started programming at a young age and quickly developed a deep interest in how systems work under the hood.
Over time, I worked with a wide range of technologies — from Python and Node.js to Java, Docker, and modern frontend frameworks.

During my apprenticeship, I focus heavily on real-world development: APIs, databases, authentication systems,
infrastructure, and deployment. I value clean code, clear responsibilities, and solutions that scale beyond "it works on my machine".

Besides development, I enjoy experimenting with hosting setups, automation, and developer tooling.
I believe good software is built with intention, structure, and a solid understanding of fundamentals.
  `,
    avatar: 'https://avatars.githubusercontent.com/u/64774999?v=4',
    badges: [
      'Software Developer',
      'Apprentice (AE)',
      'Backend & Web',
      'API & Infrastructure',
      'Clean Code',
    ],
    socialLinks: [
      {
        platform: 'GitHub',
        url: 'https://github.com/XSaitoKungX',
        icon: 'github',
      },
      {
        platform: 'Website',
        url: 'https://novaplex.xyz',
        icon: 'globe',
      },
      {
        platform: 'Astra · Discord Bot',
        url: 'https://astra-bot.app',
        icon: 'discord',
      },
    ],
  },

  header: {
    image:
      'https://i.pinimg.com/originals/da/80/73/da80737cd181cd3731689141296de3e1.gif',
    imageAlt: 'Anime GIF',
    title: 'Welcome to My Creative Space',
    subtitle:
      'Exploring ideas, sharing insights, and building beautiful things',
  },

  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Archive', href: '/archive' },
    { label: 'About', href: '/about' },
  ],

  footerLinks: [
    { label: 'Home', href: '/' },
    { label: 'Archive', href: '/archive' },
    { label: 'About', href: '/about' },
    { label: 'RSS Feed', href: '/rss' },
  ],

  themes: [
    {
      id: 'royal-purple',
      name: 'Royal Purple',
      colors: {
        background: '#0f0a1a',
        backgroundSecondary: '#1a1128',
        foreground: '#f5f0ff',
        foregroundMuted: '#a89bc2',
        primary: '#9333ea',
        primaryForeground: '#ffffff',
        accent: '#c084fc',
        accentForeground: '#0f0a1a',
        border: '#2d2145',
        card: '#1a1128',
        cardForeground: '#f5f0ff',
      },
      typography: {
        displayFont: "'Playfair Display', serif",
        bodyFont: "'Source Sans 3', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap',
      },
    },
    {
      id: 'midnight',
      name: 'Midnight',
      colors: {
        background: '#0a0e1a',
        backgroundSecondary: '#111827',
        foreground: '#e5e7eb',
        foregroundMuted: '#9ca3af',
        primary: '#3b82f6',
        primaryForeground: '#ffffff',
        accent: '#60a5fa',
        accentForeground: '#0a0e1a',
        border: '#1f2937',
        card: '#111827',
        cardForeground: '#e5e7eb',
      },
      typography: {
        displayFont: "'Space Grotesk', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
    },
    {
      id: 'sunset',
      name: 'Sunset',
      colors: {
        background: '#1a0f0a',
        backgroundSecondary: '#2d1810',
        foreground: '#fff5f0',
        foregroundMuted: '#c2a89b',
        primary: '#ea580c',
        primaryForeground: '#ffffff',
        accent: '#fb923c',
        accentForeground: '#1a0f0a',
        border: '#45281a',
        card: '#2d1810',
        cardForeground: '#fff5f0',
      },
      typography: {
        displayFont: "'Libre Baskerville', serif",
        bodyFont: "'Lato', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
      },
    },
    {
      id: 'neon',
      name: 'Neon',
      colors: {
        background: '#0a0a0a',
        backgroundSecondary: '#141414',
        foreground: '#e0ffe0',
        foregroundMuted: '#7dba7d',
        primary: '#22c55e',
        primaryForeground: '#000000',
        accent: '#4ade80',
        accentForeground: '#0a0a0a',
        border: '#1f3d1f',
        card: '#141414',
        cardForeground: '#e0ffe0',
      },
      typography: {
        displayFont: "'Orbitron', sans-serif",
        bodyFont: "'Roboto Mono', monospace",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;600;700&display=swap',
      },
    },
    {
      id: 'aurora',
      name: 'Aurora',
      colors: {
        background: '#0f1419',
        backgroundSecondary: '#151c24',
        foreground: '#e8f4f8',
        foregroundMuted: '#8ba5b5',
        primary: '#06b6d4',
        primaryForeground: '#000000',
        accent: '#67e8f9',
        accentForeground: '#0f1419',
        border: '#1e3a4a',
        card: '#151c24',
        cardForeground: '#e8f4f8',
      },
      typography: {
        displayFont: "'Sora', sans-serif",
        bodyFont: "'Nunito', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
      },
    },
  ],

  defaultTheme: 'royal-purple',
}

// Helper functions
export function getThemeById(id: string): Theme | undefined {
  return siteConfig.themes.find((theme) => theme.id === id)
}

export function getDefaultTheme(): Theme {
  const theme = getThemeById(siteConfig.defaultTheme)
  if (!theme) {
    throw new Error(
      `Default theme '${siteConfig.defaultTheme}' not found. Available themes: ${siteConfig.themes.map((t) => t.id).join(', ')}`,
    )
  }
  return theme
}
